"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ApiDataState<T> =
  | { status: "loading"; data: null; error: null }
  | { status: "success"; data: T; error: null }
  | { status: "error"; data: null; error: Error };

const DEFAULT_TIMEOUT_MS = 20_000;

/**
 * Hook de chargement avec protection contre les réponses obsolètes :
 * - `AbortController` : annule la requête précédente au changement de deps ;
 * - request id monotone : une réponse A arrivée après B ne doit JAMAIS
 *   écraser B (scénario A démarre → B démarre → B répond → A répond) ;
 * - timeout explicite si le fetcher ne l'impose pas déjà ;
 * - refetch isolé (nouvel id, ancien contrôleur annulé).
 */
export function useApiData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options: { timeoutMs?: number } = {},
): ApiDataState<T> & { refetch: () => void } {
  const [state, setState] = useState<ApiDataState<T>>({ status: "loading", data: null, error: null });
  const mountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const run = useCallback(() => {
    // Annule la requête précédente avant d'en lancer une nouvelle.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;
    setState({ status: "loading", data: null, error: null });

    let timer: ReturnType<typeof setTimeout> | null = null;
    const onExternalAbort = () => {
      if (timer) clearTimeout(timer);
    };
    controller.signal.addEventListener("abort", onExternalAbort, { once: true });
    if (timeoutMs > 0) {
      timer = setTimeout(() => controller.abort(new Error("timeout")), timeoutMs);
    }

    fetcherRef.current()
      .then((data) => {
        // Réponse obsolète (un run plus récent existe) → ignorée.
        if (!mountedRef.current || requestId !== requestIdRef.current || controller.signal.aborted) return;
        setState({ status: "success", data, error: null });
      })
      .catch((err) => {
        if (!mountedRef.current || requestId !== requestIdRef.current) return;
        // Annulation volontaire : on ne bascule pas en erreur (le run
        // suivant a déjà remis `loading`).
        if (controller.signal.aborted && requestId !== requestIdRef.current) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({ status: "error", data: null, error: err instanceof Error ? err : new Error(String(err)) });
      })
      .finally(() => {
        controller.signal.removeEventListener("abort", onExternalAbort);
        if (timer) clearTimeout(timer);
      });
  }, [timeoutMs]);

  useEffect(() => {
    mountedRef.current = true;
    fetcherRef.current = fetcher;
    // Chargement initial (fetch dans l'effet, usage canonique).
    /* eslint-disable react-hooks/set-state-in-effect -- fetch initial, état loading */
    run();
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  return { ...state, refetch: run };
}
