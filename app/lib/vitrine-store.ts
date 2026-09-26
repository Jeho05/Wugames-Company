/**
 * Vitrine — bus d'événements + lecture migratoire (DÉPRÉCIÉ).
 *
 * PRODUCTION — le contenu vitrine est une donnée métier servie par le backend
 * (`app/lib/api/vitrine.ts`). `localStorage` n'est NI une source de vérité
 * NI une persistance de repli : les clés `wugams:vitrine:*` ci-dessous ne
 * sont conservées que pour LIRE un éventuel reliquat local historique (afin
 * d'informer l'utilisateur qu'une migration vers le backend est nécessaire)
 * et seront supprimées une fois la migration backend effective.
 *
 * Règle d'autorisation : `canManageVitrine` est STRICTEMENT basé sur le rôle
 * (Gérant / Dev Digital). Une délégation éventuelle ne peut provenir que de
 * l'API (`GET /vitrine/permissions`) — jamais du navigateur.
 * Permission inconnue = permission refusée.
 */

export const VITRINE_KEYS = {
  temoignages: "wugams:vitrine:temoignages",
  services: "wugams:vitrine:services",
  garanties: "wugams:vitrine:garanties",
  realisations: "wugams:vitrine:realisations",
  blog: "wugams:vitrine:blog",
  marquee: "wugams:vitrine:marquee",
  permissions: "wugams:vitrine:permissions", // DÉPRÉCIÉ : ne jamais utiliser comme autorité
} as const;

/** @deprecated Lecture migratoire uniquement — ne pas utiliser pour afficher du contenu. */
export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** @deprecated Aucune écriture métier ne doit transiter par le navigateur. */
export function writeLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("wugams:vitrine:change", { detail: { key } }));
  } catch {
    /* quota exceeded — ignore */
  }
}

/** @deprecated Les identifiants serveur sont attribués par le backend. */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 9) + "-" + Date.now().toString(36);
}

/** Notifie les onglets/composants d'un changement vitrine (rechargement API). */
export function emitVitrineChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("wugams:vitrine:change"));
}

/** @deprecated La délégation locale n'a aucune valeur d'autorisation. */
export function getDelegatedIds(): string[] {
  return [];
}

/** @deprecated La délégation locale n'a aucune valeur d'autorisation. */
export function setDelegatedIds(_ids: readonly string[]): void {
  void _ids;
  // Volontairement sans effet : seule l'API peut accorder une permission.
}

/**
 * Garde UX d'affichage — PAS une vérification de sécurité.
 * Le backend reste l'autorité réelle (403 sur les endpoints protégés).
 * `delegatedIds` ne peut provenir que de l'API (`GET /vitrine/permissions`).
 */
export function canManageVitrine(
  user: { id: string; role: string } | null,
  delegatedIds: readonly string[] = [],
): boolean {
  if (!user) return false;
  if (user.role === "ROLE_GERANT" || user.role === "ROLE_DEV_DIGITAL") return true;
  return delegatedIds.includes(user.id);
}
