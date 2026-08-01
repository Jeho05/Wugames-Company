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
  login: (email: string, password: string) => Promise<LoginOutcome>;
  verify2fa: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const clientRoles = new Set<RoleCode>(["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"]);

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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [pending2fa, setPending2fa] = useState<Pending2fa>(null);
  const pending2faRef = useRef<Pending2fa>(null);
  const restoreStarted = useRef(false);

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
      setUser(await buildAuthUser(tokens.user));
    },
    [persistTokens],
  );

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
        setUser(await buildAuthUser(dto));
      } catch {
        clearSession();
      }
    }

    void restore().finally(() => {
      if (!cancelled) setReady(true);
    });

    const unsubscribe = subscribeAuth(() => {
      if (getSession() === null) setUser(null);
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
  }, []);

  const value = useMemo(
    () => ({ user, ready, pending2fa, login, verify2fa, logout }),
    [user, ready, pending2fa, login, verify2fa, logout],
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
