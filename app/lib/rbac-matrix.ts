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

/**
 * SOURCE UNIQUE DE VÉRITÉ RBAC (frontend).
 * Toute vérification de permission (routes, sidebar, recherche, boutons)
 * doit passer par `can()` / `canViewModule()` / `canAccessHref()` (qui
 * délègue ici). Permission inconnue = refusée. Le backend reste l'autorité
 * finale (403 serveur).
 */
export type RbacAction =
  | "VIEW"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "ASSIGN"
  | "VALIDATE"
  | "CONVERT"
  | "CHANGE_STATUS"
  | "VIEW_CONSOLIDATED"
  | "VIEW_OWN_FILIALE"
  | "VIEW_OWN_PROFILE";

/** Visibilité des modules par rôle (canonique — consommée par permissions.ts). */
export const MODULE_VIEW_ROLES: Record<string, RoleCode[]> = {
  "/espace": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_SECRETAIRE", "ROLE_COMPTABLE", "ROLE_MGR_OPS", "ROLE_MGR_PARTENAIRE", "ROLE_MGR_FILIALE", "ROLE_RESP_OUVRIERS", "ROLE_OUVRIER", "ROLE_FOURNISSEUR", "ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"],
  "/espace/rapports": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_COMPTABLE", "ROLE_SECRETAIRE"],
  "/espace/filiales": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_SECRETAIRE", "ROLE_COMPTABLE", "ROLE_MGR_FILIALE"],
  "/espace/managers": ["ROLE_GERANT", "ROLE_DEV_DIGITAL"],
  "/espace/clients": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_SECRETAIRE", "ROLE_MGR_OPS", "ROLE_MGR_FILIALE"],
  "/espace/chantiers": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_MGR_OPS", "ROLE_MGR_FILIALE", "ROLE_RESP_OUVRIERS", "ROLE_OUVRIER", "ROLE_SECRETAIRE"],
  "/espace/missions": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_MGR_OPS", "ROLE_MGR_FILIALE", "ROLE_RESP_OUVRIERS", "ROLE_OUVRIER", "ROLE_SECRETAIRE"],
  "/espace/ouvriers": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_MGR_OPS", "ROLE_MGR_FILIALE", "ROLE_RESP_OUVRIERS", "ROLE_SECRETAIRE"],
  "/espace/carte": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_MGR_OPS", "ROLE_MGR_FILIALE", "ROLE_RESP_OUVRIERS", "ROLE_OUVRIER"],
  "/espace/devis": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_SECRETAIRE", "ROLE_COMPTABLE", "ROLE_MGR_OPS"],
  "/espace/factures": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_SECRETAIRE", "ROLE_COMPTABLE", "ROLE_MGR_OPS"],
  "/espace/stocks": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_MGR_PARTENAIRE", "ROLE_MGR_FILIALE", "ROLE_SECRETAIRE", "ROLE_COMPTABLE", "ROLE_FOURNISSEUR"],
  "/espace/fournisseurs": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_MGR_PARTENAIRE", "ROLE_MGR_FILIALE", "ROLE_SECRETAIRE"],
  "/espace/messagerie": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_SECRETAIRE", "ROLE_MGR_OPS", "ROLE_MGR_PARTENAIRE", "ROLE_MGR_FILIALE", "ROLE_RESP_OUVRIERS"],
  "/espace/notifications": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_SECRETAIRE", "ROLE_COMPTABLE", "ROLE_MGR_OPS", "ROLE_MGR_PARTENAIRE", "ROLE_MGR_FILIALE", "ROLE_RESP_OUVRIERS", "ROLE_OUVRIER", "ROLE_FOURNISSEUR", "ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"],
  "/espace/boutique": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_SECRETAIRE", "ROLE_COMPTABLE", "ROLE_MGR_OPS", "ROLE_MGR_PARTENAIRE", "ROLE_MGR_FILIALE", "ROLE_RESP_OUVRIERS", "ROLE_OUVRIER", "ROLE_FOURNISSEUR", "ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"],
  "/espace/projets": ["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"],
  "/espace/demandes": ["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"],
  "/espace/documents": ["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"],
  "/espace/commandes": ["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE", "ROLE_FOURNISSEUR", "ROLE_GERANT", "ROLE_COMPTABLE", "ROLE_SECRETAIRE"],
  "/espace/messages": ["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE", "ROLE_FOURNISSEUR"],
  "/espace/mode2vie": ["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"],
  "/espace/administration": ["ROLE_GERANT", "ROLE_DEV_DIGITAL"],
  "/espace/vitrine": ["ROLE_GERANT", "ROLE_DEV_DIGITAL"], // + délégués via canManageVitrine
};

/** VIEW d'un module (navigation + garde de route). */
export function canViewModule(href: string, role: RoleCode | null | undefined): boolean {
  if (!role) return false;
  const base = href.split("?")[0].split("#")[0];
  const direct = MODULE_VIEW_ROLES[base];
  if (direct) return direct.includes(role);
  for (const [key, roles] of Object.entries(MODULE_VIEW_ROLES)) {
    // La racine "/espace" ne doit jamais servir de préfixe générique :
    // sinon tout module inconnu hérite de ses rôles (fail-open).
    if (key === "/espace") continue;
    if (base.startsWith(key + "/")) return roles.includes(role);
  }
  // Route /espace inconnue : seuls Gérant/Dev (le backend tranche via 403).
  if (base.startsWith("/espace/")) {
    return role === "ROLE_GERANT" || role === "ROLE_DEV_DIGITAL";
  }
  return false;
}

/** Point d'entrée unifié : une action sur un domaine pour un rôle. */
export function can(action: RbacAction, slug: string, role: RoleCode | null | undefined): boolean {
  switch (action) {
    case "VIEW":
      return canViewModule(slug.startsWith("/") ? slug : `/espace/${slug}`, role);
    case "CREATE":
      return hasRole(CREATE_ROLES, slug, role);
    case "UPDATE":
      return hasRole(UPDATE_ROLES, slug, role);
    case "DELETE":
      return hasRole(DELETE_ROLES, slug, role);
    case "ASSIGN":
      return canAssignMission(role);
    case "VALIDATE":
      return canVerifyPointage(role);
    case "CONVERT":
      return canConvertDevis(role);
    case "CHANGE_STATUS":
      // Changement de statut métier (missions/chantiers) : mêmes rôles que UPDATE.
      return hasRole(UPDATE_ROLES, slug, role);
    case "VIEW_CONSOLIDATED":
      return role != null && canSeeConsolidation(role);
    case "VIEW_OWN_FILIALE":
      return role != null && filialeScopeOf(role) === "own";
    case "VIEW_OWN_PROFILE":
      return role != null;
    default:
      return false;
  }
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
