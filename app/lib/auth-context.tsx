"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

import type { RoleCode } from "@/app/lib/contracts";

export type AuthUser = {
  email: string;
  filiale: string;
  initials: string;
  name: string;
  role: RoleCode;
};

type AuthContextValue = {
  login: (email: string, password: string) => void;
  logout: () => void;
  user: AuthUser | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const demoAccounts: Record<string, AuthUser> = {
  "gerant@wugams.ci": {
    email: "gerant@wugams.ci",
    filiale: "Siège",
    initials: "JO",
    name: "Jéhovani Olouwatossi",
    role: "ROLE_GERANT",
  },
  "manager@wugams.ci": {
    email: "manager@wugams.ci",
    filiale: "WUGAMS Construction",
    initials: "AB",
    name: "Aimé Bamba",
    role: "ROLE_MGR_OPS",
  },
  "comptable@wugams.ci": {
    email: "comptable@wugams.ci",
    filiale: "Siège",
    initials: "CN",
    name: "Céline N'Dri",
    role: "ROLE_COMPTABLE",
  },
  "client@wugams.ci": {
    email: "client@wugams.ci",
    filiale: "WUGAMS Rénovation",
    initials: "AT",
    name: "Aminata Traoré",
    role: "ROLE_CLIENT_MEMBRE",
  },
  "clientstd@wugams.ci": {
    email: "clientstd@wugams.ci",
    filiale: "WUGAMS Matériaux",
    initials: "DK",
    name: "David Koné",
    role: "ROLE_CLIENT_STD",
  },
  "secretary@wugams.ci": {
    email: "secretary@wugams.ci",
    filiale: "WUGAMS Construction",
    initials: "SG",
    name: "Sarah Gnahoua",
    role: "ROLE_SECRETAIRE",
  },
  "resp-ouvriers@wugams.ci": {
    email: "resp-ouvriers@wugams.ci",
    filiale: "WUGAMS Construction",
    initials: "FK",
    name: "Firmin Kouamé",
    role: "ROLE_RESP_OUVRIERS",
  },
  "fournisseur@wugams.ci": {
    email: "fournisseur@wugams.ci",
    filiale: "WUGAMS Matériaux",
    initials: "BP",
    name: "BatiPro CI",
    role: "ROLE_FOURNISSEUR",
  },
  "mgr-partenaires@wugams.ci": {
    email: "mgr-partenaires@wugams.ci",
    filiale: "WUGAMS Matériaux",
    initials: "MP",
    name: "Manager Partenariats",
    role: "ROLE_MGR_PARTENAIRE",
  },
  "mgr-filiale@wugams.ci": {
    email: "mgr-filiale@wugams.ci",
    filiale: "WUGAMS Entretien",
    initials: "MF",
    name: "Manager Filiale",
    role: "ROLE_MGR_FILIALE",
  },
  "dev@wugams.ci": {
    email: "dev@wugams.ci",
    filiale: "Siège",
    initials: "DV",
    name: "Dev Digital",
    role: "ROLE_DEV_DIGITAL",
  },
};

function matchUser(email: string, password: string): AuthUser | null {
  if (password !== "********" && password.length < 4) {
    return null;
  }

  const normalized = email.trim().toLowerCase();

  if (demoAccounts[normalized]) {
    return demoAccounts[normalized];
  }

  return {
    email: normalized,
    filiale: "WUGAMS Construction",
    initials: normalized.slice(0, 2).toUpperCase(),
    name: normalized.split("@")[0].replace(/[._-]/g, " "),
    role: "ROLE_CLIENT_STD",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback((email: string, password: string) => {
    const matched = matchUser(email, password);
    if (matched) {
      setUser(matched);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(() => ({ login, logout, user }), [login, logout, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider.");
  }
  return context;
}
