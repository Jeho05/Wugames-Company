import type { RoleCode } from "@/app/lib/contracts";

export type WorkspaceAudience = "client" | "internal";

export type WorkspaceUser = {
  audience: WorkspaceAudience;
  email: string;
  initials: string;
  name: string;
  role: RoleCode;
};

export const demoWorkspaceUser: WorkspaceUser = {
  audience: "client",
  email: "aminata.traore@example.com",
  initials: "AT",
  name: "Aminata Traoré",
  role: "ROLE_CLIENT_MEMBRE",
};

export function getWorkspaceAudience(role: RoleCode): WorkspaceAudience {
  return role === "ROLE_CLIENT_STD" || role === "ROLE_CLIENT_MEMBRE"
    ? "client"
    : "internal";
}

/*
 * À remplacer lors du branchement API par la session renvoyée après connexion.
 * Le rôle est l'unique source de décision : aucun sélecteur de rôle n'est affiché
 * sur les écrans de connexion ou d'inscription.
 */
export function getDemoWorkspaceUser(): WorkspaceUser {
  return demoWorkspaceUser;
}
