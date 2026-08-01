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

export function getSession(): SessionTokens | null {
  if (cachedSession !== undefined) return cachedSession;
  if (typeof window === "undefined") {
    cachedSession = null;
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cachedSession = raw ? (JSON.parse(raw) as SessionTokens) : null;
    if (cachedSession && isExpired(cachedSession)) {
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
  }
  notifyAuthChange();
}

export function clearSession(): void {
  setSession(null);
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
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh_token: session.refreshToken }),
      cache: "no-store",
    });
    if (!response.ok) {
      clearSession();
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
    clearSession();
    return false;
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
};

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
  const { method = "GET", body, query, auth = true, retry = true, signal } = options;

  const session = auth ? getSession() : null;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
    cache: "no-store",
  });

  if (response.status === 401 && auth && retry && session?.refreshToken) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return apiFetch<T>(path, { ...options, retry: false });
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
