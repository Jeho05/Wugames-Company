"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import * as authApi from "@/app/lib/api/auth";
import * as clientSpaceApi from "@/app/lib/api/client-space";
import * as filialesApi from "@/app/lib/api/filiales";
import * as usersApi from "@/app/lib/api/users";
import { ApiError, clearSession, computeExpiry, ensureFreshSession, getSession, sessionExpiryMs, setSession, subscribeAuth, syncSessionCookie } from "@/app/lib/api-client";
import type { AuthUserDto, RoleCode } from "@/app/lib/contracts";

export type AuthUser = {
  id: string;
  email: string;
  filiale: string;
  filialeId: string | null;
  initials: string;
  name: string;
  role: RoleCode;
  profileId: string | null;
};

export type LoginOutcome = "authenticated" | "2fa-required";

type Pending2fa = { userId: string } | null;

type AuthContextValue = {
  user: AuthUser | null;
  /** true une fois la restauration de session terminée (au chargement). */
  ready: boolean;
  pending2fa: Pending2fa;
  /** Message d'erreur si la session a expiré. */
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<LoginOutcome>;
  verify2fa: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSessionExpired: () => void;
  /** Recharge le profil depuis l'API (après une édition, ex. AccountSheet). */
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const clientRoles = new Set<RoleCode>(["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"]);

const USER_CACHE_KEY = "wugams-user-profile";

function cacheAuthUser(user: AuthUser): void {
  try {
    window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } catch {
    /* stockage indisponible : on reservera via l'API au prochain chargement */
  }
}

function readCachedUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function clearCachedUser(): void {
  try {
    window.localStorage.removeItem(USER_CACHE_KEY);
  } catch {
    /* rien à faire */
  }
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/** Cache léger des filiales (nom de filiale affiché dans la coquille). */
let filialesCache: { nom: string; code: string; id: string }[] | null = null;
let filialesInFlight: Promise<{ nom: string; code: string; id: string }[]> | null = null;

async function resolveFilialeName(filialeId: string | null): Promise<string> {
  if (!filialeId) return "Siège";
  try {
    filialesInFlight ??= filialesApi.listFiliales().then(
      (list) => {
        filialesCache = list;
        return list;
      },
      (err) => {
        filialesInFlight = null;
        throw err;
      },
    );
    const list = filialesCache ?? (await filialesInFlight);
    filialesInFlight = null;
    const found = list.find((filiale) => filiale.id === filialeId);
    return found?.nom ?? "Filiale";
  } catch {
    filialesInFlight = null;
    return "Filiale";
  }
}

/** Hydratation instantanée depuis le payload (zéro appel réseau) pour une UI immédiate. */
function instantAuthUser(dto: AuthUserDto): AuthUser {
  const fallbackName = dto.email.split("@")[0] || dto.email;
  return {
    id: dto.id,
    email: dto.email,
    filiale: dto.filiale_id ? "Filiale" : "Siège",
    filialeId: dto.filiale_id,
    initials: initialsOf(fallbackName),
    name: fallbackName,
    role: dto.role,
    profileId: dto.profile_id,
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timeout`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

function isExpiringSoonLocal(session: { expiresAt: number }, marginMs = 90_000): boolean {
  return session.expiresAt - marginMs <= Date.now();
}

async function buildAuthUser(dto: AuthUserDto): Promise<AuthUser> {
  const fallbackName = dto.email.split("@")[0] || dto.email;

  const fallback = (name: string, filiale: string, role: RoleCode, profileId: string | null): AuthUser => ({
    id: dto.id,
    email: dto.email,
    filiale,
    filialeId: dto.filiale_id,
    initials: initialsOf(name),
    name,
    role,
    profileId,
  });

  try {
    if (clientRoles.has(dto.role)) {
      const profil = await withTimeout(clientSpaceApi.getProfil(), 8_000, "profil");
      const name = [profil.user?.first_name, profil.user?.last_name].filter(Boolean).join(" ") || fallbackName;
      return fallback(name, "Espace client", dto.role, null);
    }

    const [full, filiale] = await withTimeout(
      Promise.all([usersApi.getUser(dto.id), resolveFilialeName(dto.filiale_id)]),
      8_000,
      "profil",
    );
    const name = [full.first_name, full.last_name].filter(Boolean).join(" ") || fallbackName;
    return {
      id: full.id,
      email: full.email,
      filiale,
      filialeId: full.filiale_id,
      initials: initialsOf(name),
      name,
      role: full.role,
      profileId: full.ouvrier_profile?.id ?? null,
    };
  } catch {
    return fallback(fallbackName, await resolveFilialeName(dto.filiale_id).catch(() => "Filiale"), dto.role, dto.profile_id);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  /* Profil du dernier utilisateur connu : affichage immédiat au retour (récup ). */
  const [user, setUser] = useState<AuthUser | null>(() => readCachedUser());
  const [ready, setReady] = useState(false);
  const [pending2fa, setPending2fa] = useState<Pending2fa>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const pending2faRef = useRef<Pending2fa>(null);
  const restoreStarted = useRef(false);
  const userRef = useRef<AuthUser | null>(user);
  /** true pendant un logout volontaire (évite le flash "session expirée"). */
  const loggingOutRef = useRef(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const persistTokens = useCallback(async (tokens: authApi.AuthTokensLike) => {
    const session = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: computeExpiry(tokens.expires_in),
    };
    setSession(session);
    // Le middleware lit le cookie httpOnly : on l'attend AVANT de naviguer vers
    // /espace, sinon la navigation est rejetée vers /connexion (bouton "qui ne marche pas").
    await syncSessionCookie(session);
  }, []);

  /** Planifie un refresh proactif ~60s avant l'expiration réelle (JWT ou expiresAt). */
  const scheduleRef = useRef<() => void>(() => undefined);
  const scheduleProactiveRefresh = useCallback(() => scheduleRef.current(), []);
  useEffect(() => {
    scheduleRef.current = () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      const exp = sessionExpiryMs();
      if (!exp) return;
      const delay = Math.max(exp - Date.now() - 60_000, 5_000);
      refreshTimerRef.current = setTimeout(() => {
        void ensureFreshSession().then((ok) => {
          if (ok) scheduleRef.current();
        });
      }, delay);
    };
  });

  const hydrate = useCallback(
    async (tokens: authApi.AuthTokensLike) => {
      // 1. UI instantanée (zéro appel réseau) + cookie attendu → navigation immédiate.
      const instant = instantAuthUser(tokens.user);
      cacheAuthUser(instant);
      setUser(instant);
      setSessionExpired(false);
      await persistTokens(tokens);
      scheduleProactiveRefresh();
      // 2. Enrichissement en arrière-plan (nom réel, filiale) sans bloquer.
      try {
        const authUser = await buildAuthUser(tokens.user);
        cacheAuthUser(authUser);
        setUser(authUser);
      } catch {
        /* le profil instantané reste affiché */
      }
    },
    [persistTokens, scheduleProactiveRefresh],
  );

  const clearSessionExpired = useCallback(() => setSessionExpired(false), []);

  /* Restauration silencieuse de la session persistée. */
  useEffect(() => {
    if (restoreStarted.current) return;
    restoreStarted.current = true;

    let cancelled = false;

    async function restore() {
      const initialSession = getSession();
      // Affichage immédiat du dernier profil connu (pas d'écran vide).
      if (!initialSession) return;
      // Session bientôt expirée → on tente le refresh d'abord (évite un 401 lent).
      if (isExpiringSoonLocal(initialSession)) {
        const ok = await ensureFreshSession().catch(() => false);
        if (!ok && getSession() === null) {
          if (!cancelled) {
            clearCachedUser();
            setSessionExpired(true);
          }
          return;
        }
      }
      // Profil instantané immédiat, puis vérification réseau en arrière-plan.
      try {
        const payload = await authApi.me();
        const dto: AuthUserDto = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          filiale_id: payload.filiale_id,
          two_factor_enabled: payload.two_factor_enabled,
          profile_id: payload.profile_id,
        };
        if (cancelled) return;
        const instant = instantAuthUser(dto);
        cacheAuthUser(instant);
        setUser(instant);
        scheduleProactiveRefresh();
        try {
          const refreshed = await buildAuthUser(dto);
          if (cancelled) return;
          cacheAuthUser(refreshed);
          setUser(refreshed);
        } catch {
          /* profil instantané conservé */
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && error.statusCode === 401) {
          clearCachedUser();
          // Refresh déjà tenté par api-client : si toujours 401, session morte.
          if (getSession() === null) setSessionExpired(true);
        }
        // Erreur réseau/serveur : on garde le profil en cache (mode dégradé),
        // on ne purge que le token si le refresh a confirmé l'expiration.
      }
    }

    void restore().finally(() => {
      if (!cancelled) setReady(true);
    });

    const unsubscribe = subscribeAuth(() => {
      const session = getSession();
      if (session === null) {
        if (loggingOutRef.current) return;
        if (userRef.current) setSessionExpired(true);
        clearCachedUser();
        setUser(null);
      }
    });

    // Refresh proactif au retour sur l'onglet (évite le 401 au premier clic).
    const onVisible = () => {
      if (!document.hidden) void ensureFreshSession().then((ok) => ok && scheduleProactiveRefresh());
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [scheduleProactiveRefresh]);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginOutcome> => {
      const result = await authApi.login(email, password);
      if ("requires_2fa" in result) {
        pending2faRef.current = { userId: result.user_id };
        setPending2fa({ userId: result.user_id });
        return "2fa-required";
      }
      pending2faRef.current = null;
      setSessionExpired(false);
      await hydrate(result);
      return "authenticated";
    },
    [hydrate],
  );

  const verify2fa = useCallback(
    async (token: string): Promise<void> => {
      const pending = pending2faRef.current;
      if (!pending) {
        throw new ApiError(400, "La vérification 2FA a expiré, reconnectez-vous.");
      }
      const tokens = await authApi.verify2fa(pending.userId, token);
      pending2faRef.current = null;
      setSessionExpired(false);
      await hydrate(tokens);
      setPending2fa(null);
    },
    [hydrate],
  );

  const refreshUser = useCallback(async (): Promise<void> => {
    if (!getSession()) return;
    try {
      const payload = await authApi.me();
      const dto: AuthUserDto = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        filiale_id: payload.filiale_id,
        two_factor_enabled: payload.two_factor_enabled,
        profile_id: payload.profile_id,
      };
      const instant = instantAuthUser(dto);
      cacheAuthUser(instant);
      setUser(instant);
      scheduleProactiveRefresh();
      try {
        const enriched = await buildAuthUser(dto);
        cacheAuthUser(enriched);
        setUser(enriched);
      } catch {
        /* profil instantané conservé */
      }
    } catch {
      /* la session est gérée par ailleurs (refresh auto / bandeau expiré) */
    }
  }, [scheduleProactiveRefresh]);

  const logout = useCallback(async () => {    loggingOutRef.current = true;
    try {
      await authApi.logout();
    } catch {
      /* révocation best-effort : la session locale est purgée quoi qu'il arrive */
    }
    pending2faRef.current = null;
    clearCachedUser();
    clearSession();
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    setUser(null);
    setPending2fa(null);
    setSessionExpired(false);
    // Laisse le subscriber ignorer cette purge volontaire, puis réarme.
    setTimeout(() => {
      loggingOutRef.current = false;
    }, 0);
  }, []);

  const value = useMemo(
    () => ({ user, ready, pending2fa, sessionExpired, login, verify2fa, logout, clearSessionExpired, refreshUser }),
    [user, ready, pending2fa, sessionExpired, login, verify2fa, logout, clearSessionExpired, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider.");
  }
  return context;
}
