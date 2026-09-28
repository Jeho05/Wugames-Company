import type { AuthUser } from "@/app/lib/auth-context";
import { canViewModule } from "@/app/lib/rbac-matrix";

export type SearchEntry = {
  href: string;
  label: string;
  section: string;
};

/**
 * Source de vérité RBAC côté front (miroir du back — affichage/navigation uniquement).
 * Matrice métier détaillée : voir `app/lib/rbac-matrix.ts`
 * (ADMIN_DASHBOARD_API_GUIDE §4-§5 + SPEC-BACKEND §3).
 * Chaque href correspond à une page ou un module.
 * On autorise par rôle ; le back reste le garde-fou final (403).
 * Aucune permission n'est lue depuis le navigateur : permission inconnue = refusée.
 */

const ROLE_GERANT = "ROLE_GERANT";
const ROLE_DEV_DIGITAL = "ROLE_DEV_DIGITAL";

// Hrefs publics (toujours visibles)
const PUBLIC_HREFS = new Set(["/", "/blog", "/realisations", "/boutique", "/vitrine", "/horizon", "/cinematic-hero"]);

// La matrice des modules vit dans `rbac-matrix.ts` (MODULE_VIEW_ROLES,
// source unique). Ce module ne fait que la normalisation d'href + le cas
// particulier de la délégation Vitrine, puis délègue à `canViewModule`.

export function canAccessHref(href: string, user: AuthUser | null, delegatedVitrineIds: readonly string[] = []): boolean {
  if (!user) return false;

  // Public toujours OK (mais on ne les montre dans la recherche que si pertinent)
  if (PUBLIC_HREFS.has(href)) return true;

  // Vitrine : Gérant / Dev Digital + délégués CONNUS VIA L'API uniquement.
  // `delegatedVitrineIds` doit provenir de GET /vitrine/permissions ; à défaut
  // (liste inconnue) la délégation est refusée. Le backend tranche via 403.
  if (href === "/espace/vitrine") {
    if (user.role === ROLE_GERANT || user.role === ROLE_DEV_DIGITAL) return true;
    return delegatedVitrineIds.includes(user.id);
  }

  // Normalise les hrefs avec query/hashtag
  const base = href.split("?")[0].split("#")[0];

  // Matrice centrale unique (rbac-matrix). Permission inconnue = refusée.
  if (base === "/espace" || base.startsWith("/espace/")) {
    return canViewModule(base, user.role);
  }

  return true;
}

export function filterEntriesByRole(entries: { href: string }[], user: AuthUser | null) {
  if (!user) return [];
  return entries.filter((entry) => canAccessHref(entry.href, user));
}
