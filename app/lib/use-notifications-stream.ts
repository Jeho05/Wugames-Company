"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { API_BASE_URL, getSession, refreshTokens } from "@/app/lib/api-client";
import type { Notification } from "@/app/lib/contracts";

const STREAM_PATH = "/notifications/stream";
const RETRY_BASE_MS = 3_000;
const RETRY_MAX_MS = 30_000;

export type StreamState = "idle" | "connecting" | "live" | "offline";

/**
 * Écoute les notifications en temps réel (SSE) sur `/notifications/stream`.
 * - Tente d'abord un fetch `text/event-stream` avec le Bearer (en-tête autorisé).
 * - Repli EventSource avec `?access_token=` (compat navigateur).
 * - Aucune garantie : si le back ne sert pas le flux (404/501), retourne "offline"
 *   sans erreur — les listes classiques et le polling existant restent la source de vérité.
 */
export function useNotificationsStream(
  enabled: boolean,
  onNotification?: (notification: Notification) => void,
): StreamState {
  const [state, setState] = useState<StreamState>("idle");
  const onNotificationRef = useRef(onNotification);
  onNotificationRef.current = onNotification;
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryDelayRef = useRef(RETRY_BASE_MS);

  const handleEvent = useCallback((raw: string) => {
    if (!raw) return;
    try {
      const notification = JSON.parse(raw) as Notification;
      if (notification?.id) onNotificationRef.current?.(notification);
    } catch {
      /* événement non-JSON : ignoré */
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;
    let controller: AbortController | null = null;
    let source: EventSource | null = null;

    function scheduleReconnect() {
      if (disposed) return;
      retryDelayRef.current = Math.min(retryDelayRef.current * 2, RETRY_MAX_MS);
      reconnectRef.current = setTimeout(() => {
        void connect();
      }, retryDelayRef.current);
    }

    async function connect() {
      if (disposed) return;
      setState("connecting");
      const session = getSession();
      if (!session?.accessToken) {
        setState("offline");
        return;
      }
      controller?.abort();
      controller = new AbortController();

      try {
        const response = await fetch(`${API_BASE_URL}${STREAM_PATH}`, {
          headers: { Accept: "text/event-stream", Authorization: `Bearer ${session.accessToken}` },
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok || !response.body) {
          if (response.status === 401) {
            const refreshed = await refreshTokens();
            if (refreshed) {
              retryDelayRef.current = RETRY_BASE_MS;
              void connect();
            } else {
              setState("offline");
            }
            return;
          }
          fallbackToEventSource();
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        retryDelayRef.current = RETRY_BASE_MS;
        setState("live");

        const pump = async () => {
          try {
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              let sepIndex = buffer.indexOf("\n\n");
              while (sepIndex !== -1) {
                const block = buffer.slice(0, sepIndex);
                buffer = buffer.slice(sepIndex + 2);
                for (const line of block.split("\n")) {
                  if (line.startsWith("data:")) handleEvent(line.slice(5).trim());
                }
                sepIndex = buffer.indexOf("\n\n");
              }
            }
          } catch {
            /* flux fermé ou interrompu */
          }
          if (!disposed) {
            setState("offline");
            scheduleReconnect();
          }
        };
        void pump();
      } catch {
        if (disposed) return;
        fallbackToEventSource();
      }
    }

    function fallbackToEventSource() {
      if (disposed) return;
      const session = getSession();
      if (!session?.accessToken) {
        setState("offline");
        return;
      }
      source = new EventSource(`${API_BASE_URL}${STREAM_PATH}?access_token=${encodeURIComponent(session.accessToken)}`);
      source.onopen = () => {
        retryDelayRef.current = RETRY_BASE_MS;
        setState("live");
      };
      source.onmessage = (event) => handleEvent(event.data);
      source.onerror = () => {
        if (!disposed) {
          setState("offline");
          scheduleReconnect();
        }
      };
    }

    void connect();

    return () => {
      disposed = true;
      controller?.abort();
      source?.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [enabled, handleEvent]);

  return state;
}
