"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import * as authApi from "@/app/lib/api/auth";
import * as clientSpaceApi from "@/app/lib/api/client-space";
import * as filialesApi from "@/app/lib/api/filiales";
import * as usersApi from "@/app/lib/api/users";
import { ApiError, authTrace, clearSession, computeExpiry, ensureFreshSession, getSession, persistAuthenticatedSession, retrySessionCookieSync, sessionExpiryMs, subscribeAuth } from "@/app/lib/api-client";
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
  /** Détails déjà chargés au login (getUser / getProfil) — réutilisés sans nouvel appel. */
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  adresse: string | null;
  /** Id du profil client (pour PATCH /clients/:id), null sinon. */
  clientProfileId: string | null;
  twoFactorEnabled: boolean | null;
};

export type LoginOutcome = "authenticated" | "2fa-required";

/** Flux d'authentification explicite : jamais de navigation avant `ready`. */
export type AuthPhase = "idle" | "authenticating" | "authenticated" | "syncing-session" | "ready";

export type RestoreStatus = "idle" | "restoring" | "ready" | "expired" | "error";

type Pending2fa = { userId: string } | null;

type AuthContextValue = {
  /**
   * Utilisateur AUTORISÉ (session valide uniquement).
   * Le cache local n'est JAMAIS une preuve d'authentification : sans session
   * valide, `user` vaut `null` même si un profil en cache existe.
   */
  user: AuthUser | null;
  /** Accélérateur d'affichage uniquement (skeleton/avatar) — jamais d'autorisation. */
  profilePreview: AuthUser | null;
  /** true une fois la restauration de session terminée (au chargement). */
  ready: boolean;
  /** État détaillé de la restauration (Cas A→E de la spec). */
  restoreStatus: RestoreStatus;
  /** Erreur non-fatale de restauration (réseau/serveur) avec retry possible. */
  restoreError: string | null;
  /** Phase du flux login en cours (idle → ... → ready, ou erreur retryable). */
  phase: AuthPhase;
  pending2fa: Pending2fa;
  /** Message d'erreur si la session a expiré. */
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<LoginOutcome>;
  verify2fa: (token: string) => Promise<void>;
  /** Re-tente la sync cookie sans ressaisir le mot de passe (tokens conservés). */
  retrySessionSync: () => Promise<void>;
  /** Re-tente la restauration de session après une erreur réseau/serveur. */
  retryRestore: () => void;
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
    emitUserCacheChange();
  } catch {
    /* stockage indisponible : on reservera via l'API au prochain chargement */
  }
}

/**
 * Profil en cache vu comme store externe :
 * - snapshot serveur = null (identique au SSR → pas de hydration mismatch #418) ;
 * - snapshot client = contenu du localStorage, référence mémoïsée (stable tant que
 *   la valeur brute ne change pas → pas de boucle de re-renders).
 */
let userCacheSnapshot: { raw: string | null; value: AuthUser | null } | undefined;
function getUserCacheSnapshot(): AuthUser | null {
  if (typeof window === "undefined") return null;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(USER_CACHE_KEY);
  } catch {
    raw = null;
  }
  if (userCacheSnapshot && userCacheSnapshot.raw === raw) return userCacheSnapshot.value;
  let value: AuthUser | null = null;
  try {
    value = raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    value = null;
  }
  userCacheSnapshot = { raw, value };
  return value;
}
function subscribeUserCache(onChange: () => void): () => void {
  window.addEventListener("wugams:user-cache", onChange);
  // Sync multi-onglets : un `localStorage.setItem` dans l'onglet A ne
  // déclenche PAS l'événement custom dans l'onglet B, seulement `storage`.
  const onStorage = (event: StorageEvent) => {
    if (event.key === USER_CACHE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("wugams:user-cache", onChange);
    window.removeEventListener("storage", onStorage);
  };
}
function emitUserCacheChange(): void {
  try {
    window.dispatchEvent(new Event("wugams:user-cache"));
  } catch {
    /* jamais appelé côté serveur */
  }
}

function clearCachedUser(): void {
  try {
    window.localStorage.removeItem(USER_CACHE_KEY);
    emitUserCacheChange();
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
    firstName: null,
    lastName: null,
    phone: null,
    adresse: null,
    clientProfileId: null,
    twoFactorEnabled: dto.two_factor_enabled,
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
    firstName: null,
    lastName: null,
    phone: null,
    adresse: null,
    clientProfileId: null,
    twoFactorEnabled: dto.two_factor_enabled,
  });

  try {
    if (clientRoles.has(dto.role)) {
      const profil = await withTimeout(clientSpaceApi.getProfil(), 8_000, "profil");
      const name = [profil.user?.first_name, profil.user?.last_name].filter(Boolean).join(" ") || fallbackName;
      return {
        ...fallback(name, "Espace client", dto.role, null),
        firstName: profil.user?.first_name ?? null,
        lastName: profil.user?.last_name ?? null,
        phone: profil.user?.phone ?? null,
        adresse: profil.adresse ?? null,
        clientProfileId: profil.id,
      };
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
      firstName: full.first_name ?? null,
      lastName: full.last_name ?? null,
      phone: full.phone ?? null,
      adresse: null,
      clientProfileId: full.client_profile?.id ?? null,
      twoFactorEnabled: full.two_factor_enabled ?? dto.two_factor_enabled,
    };
  } catch {
    return fallback(fallbackName, await resolveFilialeName(dto.filiale_id).catch(() => "Filiale"), dto.role, dto.profile_id);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  /* null au premier render (comme le SSR) : le profil en cache arrive via le
     store externe ci-dessous, après hydratation — jamais pendant le render,
     sinon contenu différent du HTML serveur → React error #418 + re-render
     complet (flash). */
  const [user, setUser] = useState<AuthUser | null>(null);
  const cachedUser = useSyncExternalStore(subscribeUserCache, getUserCacheSnapshot, () => null);
  /**
   * RÈGLE STRICTE : session valide = autorisation ; cache = accélérateur
   * d'affichage uniquement. `user` (session) est la seule source d'autorisation
   * exposée ; `profilePreview` sert aux skeletons sans jamais autoriser.
   */
  // Accélérateur d'affichage : ne sert JAMAIS à autoriser ni à rediriger.
  const profilePreview = user ?? cachedUser;
  const [ready, setReady] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<RestoreStatus>("idle");
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreNonce, setRestoreNonce] = useState(0);
  const [phase, setPhase] = useState<AuthPhase>("idle");
  const [pending2fa, setPending2fa] = useState<Pending2fa>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const pending2faRef = useRef<Pending2fa>(null);
  const restoreStarted = useRef(false);
  const restoreStatusRef = useRef<RestoreStatus>("idle");
  const userRef = useRef<AuthUser | null>(user);
  /** true pendant un logout volontaire (évite le flash "session expirée"). */
  const loggingOutRef = useRef(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    restoreStatusRef.current = restoreStatus;
  }, [restoreStatus]);

  const persistTokens = useCallback(async (tokens: authApi.AuthTokensLike) => {
    const session = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: computeExpiry(tokens.expires_in),
    };
    // Orchestration unique : local → cookie vérifié → navigation prête.
    // Une seule sync par transition ; l'erreur est PROPAGÉE (retry sans mdp).
    await persistAuthenticatedSession(session);
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
      // Flux explicite : idle → authenticating → authenticated →
      // syncing-session → ready. La navigation n'est prête qu'après sync
      // cookie VÉRIFIÉE. En cas d'échec cookie, les tokens locaux sont
      // conservés (retry sans mdp) mais l'erreur est propagée : jamais
      // d'état moitié-connecté présenté comme succès.
      setPhase("authenticating");
      authTrace("login-api-ok");
      const instant = instantAuthUser(tokens.user);
      setPhase("authenticated");
      // UI instantanée (zéro appel réseau) — l'utilisateur N'EST exposé
      // comme connecté qu'après sync cookie (voir plus bas).
      setPhase("syncing-session");
      await persistTokens(tokens);
      cacheAuthUser(instant);
      setUser(instant);
      setSessionExpired(false);
      setRestoreStatus("ready");
      setRestoreError(null);
      setPhase("ready");
      authTrace("restore-done", "hydrate ready");
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

  /* Restauration de session — Cas A→E explicites, jamais de faux user. */
  useEffect(() => {
    if (restoreStarted.current && restoreNonce === 0) return;
    restoreStarted.current = true;

    let cancelled = false;

    async function restore() {
      authTrace("restore-start");
      setRestoreStatus("restoring");
      setRestoreError(null);
      const initialSession = getSession();
      // Cas A — aucune session : prêt, user null, cache purgé (pas de
      // restauration artificielle depuis le cache seul).
      if (!initialSession) {
        if (!cancelled) {
          clearCachedUser();
          setUser(null);
          setReady(true);
          setRestoreStatus("ready");
          authTrace("restore-done", "cas A : aucune session");
        }
        return;
      }
      // Cas C — session bientôt expirée → refresh (token + cookie) d'abord.
      if (isExpiringSoonLocal(initialSession)) {
        const ok = await ensureFreshSession().catch(() => false);
        if (!ok && getSession() === null) {
          // Cas D — session expirée/révoquée confirmée.
          if (!cancelled) {
            clearCachedUser();
            setUser(null);
            setSessionExpired(true);
            setReady(true);
            setRestoreStatus("expired");
            authTrace("session-invalidated", "refresh impossible au restore");
          }
          return;
        }
      }
      if (!getSession()) {
        if (!cancelled) {
          clearCachedUser();
          setUser(null);
          setReady(true);
          setRestoreStatus("expired");
        }
        return;
      }
      // Cas B — session valide + me() réussi.
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
        if (!cancelled) {
          setReady(true);
          setRestoreStatus("ready");
          authTrace("restore-done", "cas B : session valide");
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && error.statusCode === 401) {
          // Cas D — 401 confirmé (refresh déjà tenté par api-client).
          clearCachedUser();
          setUser(null);
          if (getSession() === null) setSessionExpired(true);
          setReady(true);
          setRestoreStatus("expired");
          authTrace("session-invalidated", "401 au restore");
          return;
        }
        // Cas E — erreur réseau/serveur TEMPORAIRE : ne JAMAIS confondre
        // "serveur indisponible" avec "utilisateur déconnecté". On garde la
        // session locale, user reste null (pas d'autorisation sur du doute),
        // mais on expose un état retryable au lieu d'un écran vide/mort.
        const message =
          error instanceof ApiError && error.statusCode
            ? `Serveur momentanément indisponible (HTTP ${error.statusCode}). Réessayez.`
            : "Connexion au serveur impossible. Vérifiez votre réseau puis réessayez.";
        clearCachedUser();
        setUser(null);
        setRestoreError(message);
        setReady(true);
        setRestoreStatus("error");
        authTrace("restore-done", "cas E : erreur réseau, retryable");
      }
    }

    void restore()
      .catch(() => {
        // Garde-fou : restore() gère déjà toutes ses erreurs, mais on ne
        // laisse jamais `ready` à false (écran bloqué sans recours).
        if (!cancelled) {
          setRestoreError("Restauration de session impossible. Réessayez.");
          setRestoreStatus("error");
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true);
          if (restoreStatusRef.current === "idle") setRestoreStatus("ready");
        }
      });

    const unsubscribe = subscribeAuth(() => {
      const session = getSession();
      if (session === null) {
        if (loggingOutRef.current) return;
        // Session invalidée dans un autre onglet (logout / expiration) :
        // on aligne user + cache + drapeau expiré dans CET onglet.
        if (userRef.current) setSessionExpired(true);
        setRestoreStatus("expired");
        clearCachedUser();
        setUser(null);
        authTrace("session-invalidated", "via subscribeAuth multi-onglets");
      }
    });

    // Session arrivée d'un autre onglet (login là-bas) : `storage` ne se
    // déclenche QUE dans les autres onglets → pas de boucle same-tab.
    const onStorageSession = (event: StorageEvent) => {
      if (event.key !== "wugams-session") return;
      if (event.newValue && !userRef.current && !loggingOutRef.current) {
        authTrace("restore-start", "session venue d'un autre onglet");
        setRestoreNonce((n) => n + 1);
      }
    };
    window.addEventListener("storage", onStorageSession);

    // Refresh proactif au retour sur l'onglet (évite le 401 au premier clic).
    const onVisible = () => {
      if (!document.hidden) void ensureFreshSession().then((ok) => ok && scheduleProactiveRefresh());
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener("storage", onStorageSession);
      document.removeEventListener("visibilitychange", onVisible);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [scheduleProactiveRefresh, restoreNonce]);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginOutcome> => {
      authTrace("login-start");
      setPhase("authenticating");
      try {
        const result = await authApi.login(email, password);
        if ("requires_2fa" in result) {
          pending2faRef.current = { userId: result.user_id };
          setPending2fa({ userId: result.user_id });
          setPhase("idle");
          return "2fa-required";
        }
        pending2faRef.current = null;
        setSessionExpired(false);
        // hydrate() propage l'échec cookie : l'appelant affiche un retry
        // SANS redemander le mot de passe (tokens conservés).
        await hydrate(result);
        return "authenticated";
      } catch (error) {
        setPhase("idle");
        throw error;
      }
    },
    [hydrate],
  );

  const verify2fa = useCallback(
    async (token: string): Promise<void> => {
      const pending = pending2faRef.current;
      if (!pending) {
        throw new ApiError(400, "La vérification 2FA a expiré, reconnectez-vous.");
      }
      // Mêmes garanties que le login normal : jamais de navigation avant
      // session locale + cookie + profil confirmés.
      setPhase("authenticating");
      try {
        const tokens = await authApi.verify2fa(pending.userId, token);
        pending2faRef.current = null;
        setSessionExpired(false);
        await hydrate(tokens);
        setPending2fa(null);
      } catch (error) {
        setPhase("idle");
        throw error;
      }
    },
    [hydrate],
  );

  /** Retry cookie sans mot de passe (tokens conservés après échec sync). */
  const retrySessionSync = useCallback(async (): Promise<void> => {
    setPhase("syncing-session");
    try {
      await retrySessionCookieSync();
      setPhase("ready");
      authTrace("navigation-ready", "retry cookie ok");
    } catch (error) {
      setPhase("idle");
      throw error;
    }
  }, []);

  const retryRestore = useCallback(() => {
    setRestoreError(null);
    setRestoreStatus("restoring");
    setRestoreNonce((n) => n + 1);
  }, []);

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

  const logout = useCallback(async () => {
    loggingOutRef.current = true;
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
    setRestoreStatus("idle");
    setRestoreError(null);
    setPhase("idle");
    // Laisse le subscriber ignorer cette purge volontaire, puis réarme.
    setTimeout(() => {
      loggingOutRef.current = false;
    }, 0);
  }, []);

  const value = useMemo(
    () => ({
      user,
      profilePreview,
      ready,
      restoreStatus,
      restoreError,
      phase,
      pending2fa,
      sessionExpired,
      login,
      verify2fa,
      retrySessionSync,
      retryRestore,
      logout,
      clearSessionExpired,
      refreshUser,
    }),
    [user, profilePreview, ready, restoreStatus, restoreError, phase, pending2fa, sessionExpired, login, verify2fa, retrySessionSync, retryRestore, logout, clearSessionExpired, refreshUser],
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
