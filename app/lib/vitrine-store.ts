/**
 * Store localStorage interim pour la vitrine.
 * Utilisé automatiquement par app/lib/api/vitrine.ts quand le backend
 * ne répond pas. Permet au Gérant de créer du contenu dès maintenant.
 * Les données seront migrées vers le backend dès qu'il sera prêt.
 */

export const VITRINE_KEYS = {
  temoignages: "wugams:vitrine:temoignages",
  services: "wugams:vitrine:services",
  garanties: "wugams:vitrine:garanties",
  realisations: "wugams:vitrine:realisations",
  blog: "wugams:vitrine:blog",
  marquee: "wugams:vitrine:marquee",
  permissions: "wugams:vitrine:permissions", // userIds autorisés à gérer la vitrine
} as const;

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

export function writeLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // Notifie les autres onglets / composants
    window.dispatchEvent(new CustomEvent("wugams:vitrine:change", { detail: { key } }));
  } catch {
    /* quota exceeded — ignore */
  }
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9) + "-" + Date.now().toString(36);
}

// Permissions : liste d'user ids délégués (en plus du ROLE_GERANT)
export function getDelegatedIds(): string[] {
  return readLocal<string[]>(VITRINE_KEYS.permissions, []);
}

export function setDelegatedIds(ids: string[]): void {
  writeLocal(VITRINE_KEYS.permissions, ids);
}

export function canManageVitrine(user: { id: string; role: string } | null): boolean {
  if (!user) return false;
  if (user.role === "ROLE_GERANT") return true;
  const delegated = getDelegatedIds();
  return delegated.includes(user.id);
}
