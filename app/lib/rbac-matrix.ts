import type { RoleCode } from "@/app/lib/contracts";
import type { AuthUser } from "@/app/lib/auth-context";

/**
 * Matrice RBAC centralisée du frontend WUGAMS (production).
 *
 * Source de vérité métier : `ADMIN_DASHBOARD_API_GUIDE.md` (§4 matrice RBAC,
 * §5 tables par endpoint) + `SPEC-BACKEND.md` (§3 cloisonnement filiale).
 * Le backend reste l'autorité finale (403 serveur) ; ce module ne fait que
 * refléter ces règles pour l'affichage (sidebar, recherche, quick actions,
 * boutons, guards de routes). Permission inconnue = refusée.
 */

export type FilialeScope = "all" | "own" | "none";

export const ALL_ROLES: RoleCode[] = [
  "ROLE_GERANT",
  "ROLE_DEV_DIGITAL",
  "ROLE_MGR_OPS",
  "ROLE_MGR_FILIALE",
  "ROLE_MGR_PARTENAIRE",
  "ROLE_RESP_OUVRIERS",
  "ROLE_COMPTABLE",
  "ROLE_SECRETAIRE",
  "ROLE_OUVRIER",
  "ROLE_FOURNISSEUR",
  "ROLE_CLIENT_STD",
  "ROLE_CLIENT_MEMBRE",
];

/** Périmètre filiale par rôle (SPEC-BACKEND §3). */
export const FILIALE_SCOPE: Record<RoleCode, FilialeScope> = {
  ROLE_GERANT: "all",
  ROLE_DEV_DIGITAL: "all",
  ROLE_COMPTABLE: "all",
  ROLE_MGR_OPS: "own",
  ROLE_MGR_FILIALE: "own",
  ROLE_MGR_PARTENAIRE: "own",
  ROLE_RESP_OUVRIERS: "own",
  ROLE_SECRETAIRE: "own",
  ROLE_OUVRIER: "own",
  ROLE_FOURNISSEUR: "own",
  ROLE_CLIENT_STD: "none",
  ROLE_CLIENT_MEMBRE: "none",
};

export function filialeScopeOf(role: RoleCode): FilialeScope {
  return FILIALE_SCOPE[role];
}

/** Seuls ces rôles peuvent voir et utiliser "Toutes les filiales (Consolidé)". */
export function canSeeConsolidation(role: RoleCode): boolean {
  return filialeScopeOf(role) === "all";
}

/**
 * Rôles autorisés à créer / modifier / supprimer / valider / affecter,
 * par domaine (ADMIN_DASHBOARD_API_GUIDE §5).
 */
const CREATE_ROLES: Record<string, RoleCode[]> = {
  clients: ["ROLE_GERANT", "ROLE_SECRETAIRE", "ROLE_MGR_OPS", "ROLE_MGR_FILIALE"],
  fournisseurs: ["ROLE_GERANT", "ROLE_MGR_PARTENAIRE"],
  stocks: ["ROLE_GERANT", "ROLE_MGR_OPS", "ROLE_MGR_FILIALE"],
  missions: ["ROLE_GERANT", "ROLE_MGR_OPS", "ROLE_MGR_FILIALE"],
  devis: ["ROLE_GERANT", "ROLE_COMPTABLE", "ROLE_SECRETAIRE"],
  factures: ["ROLE_GERANT", "ROLE_COMPTABLE"],
  chantiers: ["ROLE_GERANT", "ROLE_MGR_OPS", "ROLE_MGR_FILIALE"],
  filiales: ["ROLE_GERANT"],
  commandes: ["ROLE_GERANT", "ROLE_SECRETAIRE", "ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"],
  demandes: ["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"],
  projets: ["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"],
  messages: [
    "ROLE_GERANT",
    "ROLE_DEV_DIGITAL",
    "ROLE_SECRETAIRE",
    "ROLE_MGR_OPS",
    "ROLE_MGR_PARTENAIRE",
    "ROLE_MGR_FILIALE",
    "ROLE_RESP_OUVRIERS",
    "ROLE_CLIENT_STD",
    "ROLE_CLIENT_MEMBRE",
    "ROLE_FOURNISSEUR",
  ],
};

const UPDATE_ROLES: Record<string, RoleCode[]> = {
  ...CREATE_ROLES,
  stocks: ["ROLE_GERANT", "ROLE_MGR_OPS", "ROLE_MGR_FILIALE"],
  missions: ["ROLE_GERANT", "ROLE_MGR_OPS", "ROLE_MGR_FILIALE", "ROLE_RESP_OUVRIERS"],
};

const DELETE_ROLES: Record<string, RoleCode[]> = {
  clients: ["ROLE_GERANT"],
  fournisseurs: ["ROLE_GERANT"],
  stocks: ["ROLE_GERANT"],
  missions: ["ROLE_GERANT"],
  devis: ["ROLE_GERANT"],
  factures: ["ROLE_GERANT"],
  chantiers: ["ROLE_GERANT"],
  filiales: ["ROLE_GERANT"],
  commandes: ["ROLE_GERANT"],
};

/** Affectation d'une mission à un ouvrier (ADMIN §5.7 + SPEC §3). */
const ASSIGN_MISSION_ROLES: RoleCode[] = [
  "ROLE_GERANT",
  "ROLE_MGR_OPS",
  "ROLE_MGR_FILIALE",
  "ROLE_RESP_OUVRIERS",
];

/** Vérification des pointages (SPEC-BACKEND §3). */
const VERIFY_POINTAGE_ROLES: RoleCode[] = [
  "ROLE_GERANT",
  "ROLE_DEV_DIGITAL",
  "ROLE_MGR_OPS",
  "ROLE_MGR_FILIALE",
  "ROLE_RESP_OUVRIERS",
];

/** Conversion devis → facture (SPEC-BACKEND §3). */
const CONVERT_DEVIS_ROLES: RoleCode[] = ["ROLE_GERANT", "ROLE_COMPTABLE", "ROLE_SECRETAIRE"];

function hasRole(domain: Record<string, RoleCode[]>, slug: string, role: RoleCode | null | undefined): boolean {
  if (!role) return false;
  return (domain[slug] ?? []).includes(role);
}

export function canCreate(slug: string, role: RoleCode | null | undefined): boolean {
  return hasRole(CREATE_ROLES, slug, role);
}

export function canUpdate(slug: string, role: RoleCode | null | undefined): boolean {
  return hasRole(UPDATE_ROLES, slug, role);
}

export function canDelete(slug: string, role: RoleCode | null | undefined): boolean {
  return hasRole(DELETE_ROLES, slug, role);
}

export function canAssignMission(role: RoleCode | null | undefined): boolean {
  if (!role) return false;
  return ASSIGN_MISSION_ROLES.includes(role);
}

export function canVerifyPointage(role: RoleCode | null | undefined): boolean {
  if (!role) return false;
  return VERIFY_POINTAGE_ROLES.includes(role);
}

export function canConvertDevis(role: RoleCode | null | undefined): boolean {
  if (!role) return false;
  return CONVERT_DEVIS_ROLES.includes(role);
}

/** Quick actions "Créer" autorisées pour un utilisateur (jamais affichées sinon). */
export type QuickAction = { href: string; label: string };

const QUICK_ACTIONS: { href: string; label: string; slug: string }[] = [
  { href: "/espace/missions?creer=1", label: "Ordre de mission", slug: "missions" },
  { href: "/espace/devis?creer=1", label: "Nouveau devis", slug: "devis" },
  { href: "/espace/factures?creer=1", label: "Nouvelle facture", slug: "factures" },
  { href: "/espace/administration?creer=1", label: "Collaborateur / Compte", slug: "filiales" },
  { href: "/espace/stocks?creer=1", label: "Article de stock", slug: "stocks" },
];

export function quickActionsFor(user: AuthUser | null): QuickAction[] {
  if (!user) return [];
  if (user.role === "ROLE_CLIENT_STD" || user.role === "ROLE_CLIENT_MEMBRE" || user.role === "ROLE_FOURNISSEUR" || user.role === "ROLE_OUVRIER") {
    return [];
  }
  return QUICK_ACTIONS.filter((action) => canCreate(action.slug, user.role)).map(({ href, label }) => ({ href, label }));
}
