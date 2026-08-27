"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import * as authApi from "@/app/lib/api/auth";
import * as clientSpaceApi from "@/app/lib/api/client-space";
import * as filialesApi from "@/app/lib/api/filiales";
import * as usersApi from "@/app/lib/api/users";
import { ApiError, clearSession, computeExpiry, getSession, setSession, subscribeAuth } from "@/app/lib/api-client";
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

async function resolveFilialeName(filialeId: string | null): Promise<string> {
  if (!filialeId) return "Siège";
  try {
    filialesCache ??= await filialesApi.listFiliales();
    const found = filialesCache.find((filiale) => filiale.id === filialeId);
    return found?.nom ?? "Filiale";
  } catch {
    return "Filiale";
  }
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
      const profil = await clientSpaceApi.getProfil();
      const name = [profil.user?.first_name, profil.user?.last_name].filter(Boolean).join(" ") || fallbackName;
      return fallback(name, "Espace client", dto.role, null);
    }

    const [full, filiale] = await Promise.all([usersApi.getUser(dto.id), resolveFilialeName(dto.filiale_id)]);
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

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const persistTokens = useCallback((tokens: authApi.AuthTokensLike) => {
    setSession({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: computeExpiry(tokens.expires_in),
    });
  }, []);

  const hydrate = useCallback(
    async (tokens: authApi.AuthTokensLike) => {
      persistTokens(tokens);
      const authUser = await buildAuthUser(tokens.user);
      cacheAuthUser(authUser);
      setUser(authUser);
      setSessionExpired(false);
    },
    [persistTokens],
  );

  const clearSessionExpired = useCallback(() => setSessionExpired(false), []);

  /* Restauration silencieuse de la session persistée. */
  useEffect(() => {
    if (restoreStarted.current) return;
    restoreStarted.current = true;

    let cancelled = false;
    const initialSession = getSession();

    async function restore() {
      if (!initialSession) return;
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
        const refreshed = await buildAuthUser(dto);
        cacheAuthUser(refreshed);
        setUser(refreshed);
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 401) {
          clearCachedUser();
          setSessionExpired(true);
        }
        clearSession();
      }
    }

    void restore().finally(() => {
      if (!cancelled) setReady(true);
    });

    const unsubscribe = subscribeAuth(() => {
      const session = getSession();
      if (session === null) {
        if (userRef.current) setSessionExpired(true);
        clearCachedUser();
        setUser(null);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

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

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* révocation best-effort : la session locale est purgée quoi qu'il arrive */
    }
    pending2faRef.current = null;
    clearSession();
    setUser(null);
    setPending2fa(null);
    setSessionExpired(false);
  }, []);

  const value = useMemo(
    () => ({ user, ready, pending2fa, sessionExpired, login, verify2fa, logout, clearSessionExpired }),
    [user, ready, pending2fa, sessionExpired, login, verify2fa, logout, clearSessionExpired],
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
