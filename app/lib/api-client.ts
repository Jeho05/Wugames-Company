/**
 * Client HTTP générique de l'API WUGAMS ERP.
 *
 * - Sérialisation JSON + injection du jeton Bearer.
 * - Enveloppe d'erreur NestJS normalisée ({ statusCode, message, error, timestamp }).
 * - Refresh automatique (single-flight) du jeton sur 401, puis retry une fois.
 * - Session persistée dans localStorage, observable par l'UI (auth-context).
 */

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "/api/v1").replace(/\/+$/, "");

const STORAGE_KEY = "wugams-session";
const REFRESH_SLACK_MS = 30_000;
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

/** Parse "expires_in" du back ("7d", "900", "1h") → timestamp ms. */
export function computeExpiry(expiresIn: string | number | undefined, now = Date.now()): number {
  if (expiresIn == null) return now + DEFAULT_TTL_MS;
  if (typeof expiresIn === "number") return now + expiresIn * 1000;
  const match = expiresIn.trim().match(/^(\d+)\s*(s|m|h|d)?$/i);
  if (!match) return now + DEFAULT_TTL_MS;
  const value = Number(match[1]);
  const unit = (match[2] ?? "s").toLowerCase();
  const multiplier = unit === "d" ? 86_400 : unit === "h" ? 3_600 : unit === "m" ? 60 : 1;
  return now + value * multiplier * 1000;
}

function isExpired(session: SessionTokens, now = Date.now()): boolean {
  return session.expiresAt - REFRESH_SLACK_MS <= now;
}

export function isSessionExpired(): boolean {
  const session = getSession();
  return session !== null && isExpired(session);
}

/* ------------------------------------------------------------------ */
/* Session (localStorage + abonnement pour l'UI)                       */
/* ------------------------------------------------------------------ */

let cachedSession: SessionTokens | null | undefined;

const authListeners = new Set<() => void>();

function notifyAuthChange() {
  for (const listener of authListeners) listener();
}

export function subscribeAuth(listener: () => void): () => void {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    cachedSession = undefined;
    notifyAuthChange();
  });
}

function isValidSession(obj: unknown): obj is SessionTokens {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.accessToken === "string" &&
    o.accessToken.length > 20 &&
    typeof o.refreshToken === "string" &&
    o.refreshToken.length > 10 &&
    typeof o.expiresAt === "number" &&
    Number.isFinite(o.expiresAt)
  );
}

export function getSession(): SessionTokens | null {
  if (cachedSession !== undefined) return cachedSession;
  if (typeof window === "undefined") {
    cachedSession = null;
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    if (!isValidSession(parsed)) {
      if (raw) window.localStorage.removeItem(STORAGE_KEY);
      cachedSession = null;
      return null;
    }
    cachedSession = parsed;
    if (isExpired(cachedSession)) {
      cachedSession = null;
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    cachedSession = null;
  }
  return cachedSession;
}

export function setSession(session: SessionTokens | null): void {
  cachedSession = session;
  if (typeof window !== "undefined") {
    try {
      if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* stockage indisponible : la session reste en mémoire */
    }
    // Miroir httpOnly pour le middleware (défense en profondeur)
    void syncSessionCookie(session);
  }
  notifyAuthChange();
}

/** Synchronise le cookie httpOnly lu par le middleware. À await avant de naviguer vers /espace. */
export function syncSessionCookie(session: SessionTokens | null): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  try {
    if (session) {
      return fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
        cache: "no-store",
      })
        .then(() => undefined)
        .catch(() => undefined);
    }
    return fetch("/api/session", { method: "DELETE", cache: "no-store" })
      .then(() => undefined)
      .catch(() => undefined);
  } catch {
    return Promise.resolve();
  }
}

export function clearSession(): void {
  setSession(null);
  if (typeof window !== "undefined") {
    try {
      void fetch("/api/session", { method: "DELETE", cache: "no-store" }).catch(() => undefined);
    } catch {
      /* ignore */
    }
  }
}

/* ------------------------------------------------------------------ */
/* Erreurs                                                             */
/* ------------------------------------------------------------------ */

export type ApiErrorBody = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  timestamp?: string;
};

export class ApiError extends Error {
  readonly statusCode: number;
  readonly error?: string;
  readonly timestamp?: string;
  readonly details: ApiErrorBody | null;

  constructor(statusCode: number, message: string, body: ApiErrorBody | null = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.error = body?.error;
    this.timestamp = body?.timestamp;
    this.details = body;
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  let body: ApiErrorBody | null = null;
  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    /* réponse non-JSON : on garde le message par défaut */
  }
  const rawMessage = body?.message ?? `Erreur HTTP ${response.status}`;
  const message = Array.isArray(rawMessage) ? rawMessage.join(" · ") : rawMessage;
  return new ApiError(response.status, message, body);
}

/* ------------------------------------------------------------------ */
/* Refresh single-flight                                               */
/* ------------------------------------------------------------------ */

let refreshInFlight: Promise<boolean> | null = null;

async function doRefreshTokens(): Promise<boolean> {
  const session = getSession();
  if (!session?.refreshToken) return false;
  const controller = new AbortController();
  const timeout =
    typeof setTimeout !== "undefined" ? setTimeout(() => controller.abort(), 15_000) : null;
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh_token: session.refreshToken }),
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) {
      // 401/403 = refresh révoqué/expiré → déconnexion. Autres statuts (429, 5xx)
      // = problème transitoire → on garde la session pour réessayer plus tard.
      if (response.status === 401 || response.status === 403) clearSession();
      return false;
    }
    const data = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: string | number;
    };
    if (!data?.access_token) {
      clearSession();
      return false;
    }
    setSession({
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? session.refreshToken,
      expiresAt: computeExpiry(data.expires_in),
    });
    return true;
  } catch {
    // Erreur réseau/timeout : on ne purge PAS la session (transitoire).
    return false;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export function refreshTokens(): Promise<boolean> {
  refreshInFlight ??= doRefreshTokens().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

/* ------------------------------------------------------------------ */
/* Requête générique                                                   */
/* ------------------------------------------------------------------ */

export type ApiQuery = Record<string, string | number | boolean | null | undefined>;

export type ApiFetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: ApiQuery;
  /** Envoie le jeton Bearer et déclenche le refresh sur 401. Défaut : true. */
  auth?: boolean;
  /** Retente une fois après refresh. Défaut : true. */
  retry?: boolean;
  signal?: AbortSignal;
  /** Durée de vie du cache mémoire pour les GET (ms). Défaut : 30_000. Mettre 0 pour forcer le réseau. */
  cacheTtlMs?: number;
  /** Timeout réseau (ms). Défaut : 20_000. Mettre 0 pour désactiver. */
  timeoutMs?: number;
};

/* ------------------------------------------------------------------ */
/* Cache mémoire GET + déduplication des requêtes en vol               */
/* ------------------------------------------------------------------ */

const DEFAULT_CACHE_TTL_MS = 30_000;

type CacheEntry = {
  at: number;
  value: unknown;
};

const responseCache = new Map<string, CacheEntry>();
const inflightRequests = new Map<string, Promise<unknown>>();

function cacheKey(method: string, url: string, auth: boolean): string {
  const tokenPart = auth ? (getSession()?.accessToken?.slice(-12) ?? "anon") : "public";
  return `${method} ${url} :: ${tokenPart}`;
}

/** Vide le cache GET (appelé lors des mutations pour garantir la fraîcheur appliquée). */
export function resetApiCache(): void {
  responseCache.clear();
}

function buildUrl(path: string, query?: ApiQuery): string {
  const base = path.startsWith("http") ? path : `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  if (!query) return base;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = "GET", body, query, auth = true, retry = true, signal, cacheTtlMs = DEFAULT_CACHE_TTL_MS, timeoutMs = 20_000 } = options;

  const url = buildUrl(path, query);
  const key = cacheKey(method, url, auth);

  if (method === "GET" && cacheTtlMs > 0) {
    const cached = responseCache.get(key);
    if (cached && Date.now() - cached.at < cacheTtlMs) {
      return cached.value as T;
    }
    const pending = inflightRequests.get(key);
    if (pending) {
      return pending as Promise<T>;
    }
  }

  const promise = performFetch<T>(url, { method, body, auth, retry, signal, timeoutMs });

  if (method === "GET") {
    inflightRequests.set(key, promise);
    promise
      .then((value) => {
        if (cacheTtlMs > 0) {
          responseCache.set(key, { at: Date.now(), value });
        }
      })
      .catch(() => undefined)
      .finally(() => inflightRequests.delete(key));
  } else {
    responseCache.clear();
  }

  return promise;
}

async function performFetch<T>(url: string, options: ApiFetchOptions): Promise<T> {
  const { method = "GET", body, auth = true, retry = true, signal, timeoutMs = 20_000 } = options;

  const session = auth ? getSession() : null;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;

  // Timeout : le back serverless peut être lent (cold start), mais on ne veut
  // jamais bloquer l'UI indéfiniment. Le signal externe reste prioritaire.
  const controller = new AbortController();
  const onAbort = () => controller.abort(signal?.reason);
  signal?.addEventListener("abort", onAbort, { once: true });
  const timeout = timeoutMs > 0 ? setTimeout(() => controller.abort(new Error("timeout")), timeoutMs) : null;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    if (controller.signal.aborted && !signal?.aborted) {
      throw new ApiError(0, "Le serveur met trop de temps à répondre. Réessayez.");
    }
    // Erreur réseau : on conserve le cache (transitoire), l'UI garde ses données.
    throw error;
  } finally {
    signal?.removeEventListener("abort", onAbort);
    if (timeout) clearTimeout(timeout);
  }

  if (response.status === 401 && auth && retry && session?.refreshToken) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return performFetch<T>(url, { ...options, retry: false });
    }
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Variante sans token (login, 2FA, refresh, santé). */
export function apiFetchPublic<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  return apiFetch<T>(path, { ...options, auth: false, retry: false });
}

/* ------------------------------------------------------------------ */
/* Refresh proactif — évite le 401 + retry qui double la latence       */
/* ------------------------------------------------------------------ */

function decodeJwtExp(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = typeof atob !== "undefined" ? atob(base64) : Buffer.from(base64, "base64").toString("utf8");
    const payload = JSON.parse(json) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** Timestamp d'expiration réel : le plus tôt entre le JWT et expiresAt. */
export function sessionExpiryMs(session: SessionTokens | null = getSession()): number | null {
  if (!session) return null;
  const jwtExp = decodeJwtExp(session.accessToken);
  return jwtExp ? Math.min(jwtExp, session.expiresAt) : session.expiresAt;
}

/** true si la session expire dans moins de `marginMs` (défaut 60s). */
export function isSessionExpiringSoon(marginMs = 60_000): boolean {
  const exp = sessionExpiryMs();
  return exp !== null && exp - marginMs <= Date.now();
}

/**
 * Rafraîchit le token avant expiration (appelable au focus/avant une action).
 * Retourne true si la session est utilisable après l'appel.
 */
export async function ensureFreshSession(marginMs = 60_000): Promise<boolean> {
  const session = getSession();
  if (!session) return false;
  if (!isSessionExpiringSoon(marginMs)) return true;
  return refreshTokens();
}
