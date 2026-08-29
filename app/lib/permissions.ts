import type { RoleCode } from "@/app/lib/contracts";
import type { AuthUser } from "@/app/lib/auth-context";
import { canManageVitrine } from "@/app/lib/vitrine-store";

export type SearchEntry = {
  href: string;
  label: string;
  section: string;
};

/**
 * Source de vérité RBAC côté front (miroir du back).
 * Chaque href correspond à une page ou un module.
 * On autorise par rôle ; le back reste le garde-fou final (403).
 */

const ROLE_GERANT: RoleCode = "ROLE_GERANT";
const ROLE_DEV_DIGITAL: RoleCode = "ROLE_DEV_DIGITAL";

const clientRoles = new Set<RoleCode>(["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"]);
const fournisseurRole: RoleCode = "ROLE_FOURNISSEUR";

// Hrefs publics (toujours visibles)
const PUBLIC_HREFS = new Set(["/", "/blog", "/realisations", "/boutique", "/vitrine", "/horizon", "/cinematic-hero"]);

// Mapping module -> rôles autorisés (intersection avec navigationGroups)
// Si un rôle n'est pas listé, il ne voit pas l'entrée dans la recherche.
const MODULE_ROLES: Record<string, RoleCode[]> = {
  // Pilotage
  "/espace": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_SECRETAIRE", "ROLE_COMPTABLE", "ROLE_MGR_OPS", "ROLE_MGR_PARTENAIRE", "ROLE_MGR_FILIALE", "ROLE_RESP_OUVRIERS", "ROLE_OUVRIER", "ROLE_FOURNISSEUR", "ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"],
  "/espace/rapports": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_COMPTABLE", "ROLE_SECRETAIRE"],
  "/espace/filiales": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_SECRETAIRE", "ROLE_COMPTABLE", "ROLE_MGR_FILIALE"],
  "/espace/managers": ["ROLE_GERANT", "ROLE_DEV_DIGITAL"],
  // Opérations
  "/espace/clients": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_SECRETAIRE", "ROLE_MGR_OPS", "ROLE_MGR_FILIALE"],
  "/espace/chantiers": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_MGR_OPS", "ROLE_MGR_FILIALE", "ROLE_RESP_OUVRIERS", "ROLE_OUVRIER", "ROLE_SECRETAIRE"],
  "/espace/missions": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_MGR_OPS", "ROLE_MGR_FILIALE", "ROLE_RESP_OUVRIERS", "ROLE_OUVRIER", "ROLE_SECRETAIRE"],
  "/espace/ouvriers": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_MGR_OPS", "ROLE_MGR_FILIALE", "ROLE_RESP_OUVRIERS", "ROLE_SECRETAIRE"],
  "/espace/carte": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_MGR_OPS", "ROLE_MGR_FILIALE", "ROLE_RESP_OUVRIERS", "ROLE_OUVRIER"],
  "/espace/devis": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_SECRETAIRE", "ROLE_COMPTABLE", "ROLE_MGR_OPS"],
  "/espace/factures": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_SECRETAIRE", "ROLE_COMPTABLE", "ROLE_MGR_OPS"],
  // Ressources
  "/espace/stocks": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_MGR_PARTENAIRE", "ROLE_MGR_FILIALE", "ROLE_SECRETAIRE", "ROLE_COMPTABLE", "ROLE_FOURNISSEUR"],
  "/espace/fournisseurs": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_MGR_PARTENAIRE", "ROLE_MGR_FILIALE", "ROLE_SECRETAIRE"],
  "/espace/messagerie": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_SECRETAIRE", "ROLE_MGR_OPS", "ROLE_MGR_PARTENAIRE", "ROLE_MGR_FILIALE", "ROLE_RESP_OUVRIERS"],
  "/espace/notifications": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_SECRETAIRE", "ROLE_COMPTABLE", "ROLE_MGR_OPS", "ROLE_MGR_PARTENAIRE", "ROLE_MGR_FILIALE", "ROLE_RESP_OUVRIERS", "ROLE_OUVRIER", "ROLE_FOURNISSEUR", "ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"],
  // Boutique
  "/espace/boutique": ["ROLE_GERANT", "ROLE_DEV_DIGITAL", "ROLE_SECRETAIRE", "ROLE_COMPTABLE", "ROLE_MGR_OPS", "ROLE_MGR_PARTENAIRE", "ROLE_MGR_FILIALE", "ROLE_RESP_OUVRIERS", "ROLE_OUVRIER", "ROLE_FOURNISSEUR", "ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"],
  // Client
  "/espace/projets": ["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"],
  "/espace/demandes": ["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"],
  "/espace/documents": ["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"],
  "/espace/commandes": ["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE", "ROLE_FOURNISSEUR"],
  "/espace/messages": ["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE", "ROLE_FOURNISSEUR"],
  // Vitrine & Admin
  "/espace/administration": ["ROLE_GERANT", "ROLE_DEV_DIGITAL"],
  "/espace/vitrine": ["ROLE_GERANT", "ROLE_DEV_DIGITAL"], // + délégués via canManageVitrine
};

export function canAccessHref(href: string, user: AuthUser | null): boolean {
  if (!user) return false;

  // Public toujours OK (mais on ne les montre dans la recherche que si pertinent)
  if (PUBLIC_HREFS.has(href)) return true;

  // Vitrine : Gérant + délégués
  if (href === "/espace/vitrine") {
    return canManageVitrine(user) || user.role === ROLE_DEV_DIGITAL;
  }

  // Normalise les hrefs avec query/hashtag
  const base = href.split("?")[0].split("#")[0];

  // Mapping direct
  if (MODULE_ROLES[base]) {
    return MODULE_ROLES[base].includes(user.role);
  }

  // Sous-routes : /espace/clients/123 -> check /espace/clients
  for (const [key, roles] of Object.entries(MODULE_ROLES)) {
    if (base.startsWith(key + "/")) {
      return roles.includes(user.role);
    }
  }

  // Par défaut : si le href est sous /espace mais non listé, on autorise seulement Gérant/Dev
  if (base.startsWith("/espace/")) {
    return user.role === ROLE_GERANT || user.role === ROLE_DEV_DIGITAL;
  }

  // Autres routes workspace : autorisé si rôle interne
  if (base.startsWith("/espace")) {
    return !clientRoles.has(user.role);
  }

  return true;
}

export function filterEntriesByRole(entries: { href: string }[], user: AuthUser | null) {
  if (!user) return [];
  return entries.filter((entry) => canAccessHref(entry.href, user));
}
