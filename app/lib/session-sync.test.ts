import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ApiError,
  persistAuthenticatedSession,
  setSession,
  syncSessionCookie,
} from "@/app/lib/api-client";

/**
 * Auth critique : la sync cookie `/api/session` ne doit JAMAIS être avalée.
 * On stubbe `window` + `fetch` (env node) pour exercer les chemins OK / 500 /
 * réseau / payload inattendu, et on vérifie que `setSession()` seul ne
 * synchronise rien (une seule sync par transition, via
 * `persistAuthenticatedSession`).
 */

function stubWindow() {
  const store = new Map<string, string>();
  (globalThis as Record<string, unknown>).window = {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, String(value)),
      removeItem: (key: string) => void store.delete(key),
    },
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => true,
  };
  return store;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const SESSION = {
  accessToken: "a".repeat(40),
  refreshToken: "r".repeat(20),
  expiresAt: Date.now() + 3_600_000,
};

describe("syncSessionCookie — jamais de succès silencieux", () => {
  beforeEach(() => {
    stubWindow();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete (globalThis as Record<string, unknown>).window;
  });

  it("résout quand /api/session répond { ok: true }", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ ok: true })));
    await expect(syncSessionCookie(SESSION)).resolves.toBeUndefined();
  });

  it("rejette quand /api/session répond 500 (pas de faux succès)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error: "boom" }, 500)));
    await expect(syncSessionCookie(SESSION)).rejects.toBeInstanceOf(ApiError);
  });

  it("rejette sur erreur réseau (jamais avalée en succès)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("network down");
      }),
    );
    await expect(syncSessionCookie(SESSION)).rejects.toBeInstanceOf(ApiError);
  });

  it("rejette sur payload inattendu { ok: false }", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ ok: false })));
    await expect(syncSessionCookie(SESSION)).rejects.toBeInstanceOf(ApiError);
  });

  it("setSession() seul ne synchronise PAS le cookie (flux unique explicite)", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    setSession({ ...SESSION });
    // Laisse les micro-tâches s'exécuter : aucun appel réseau ne doit partir.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("persistAuthenticatedSession() stocke puis synchronise UNE fois", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    await persistAuthenticatedSession({ ...SESSION });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/session");
    expect(init.method).toBe("POST");
  });

  it("persistAuthenticatedSession() propage l'échec cookie (retry sans mdp)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error: "boom" }, 500)));
    await expect(persistAuthenticatedSession({ ...SESSION })).rejects.toBeInstanceOf(ApiError);
  });
});
