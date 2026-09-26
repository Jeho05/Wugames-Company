/**
 * API Vitrine — couche d'accès au contenu public.
 *
 * PRODUCTION — source de vérité : le backend NestJS (`/api/v1/vitrine/*`).
 * - Lecture : l'API est appelée directement. Un 404 (endpoint ou ressource
 *   inexistante) retourne `[]`/`null` → état vide côté UI. Toute autre erreur
 *   est propagée → état d'erreur côté UI. JAMAIS de repli local.
 * - Écriture : appel API direct, erreur propagée. Si le backend n'expose pas
 *   encore ces endpoints, l'atelier vitrine affiche un état « indisponible »
 *   explicite au lieu de simuler une persistance dans le navigateur.
 *
 * `localStorage` n'est volontairement plus utilisé ici : le contenu vitrine
 * est une donnée métier publique, pas une préférence UX.
 */

import { ApiError, apiFetch } from "@/app/lib/api-client";
import type { IconName } from "@/app/components/ui/app-icon";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export type VitrineTemoignage = {
  id: string;
  name: string;
  role: string;
  text: string;
  image: string; // URL
  rating: number; // 1..5
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type VitrineService = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  order: number;
  is_published: boolean;
  created_at: string;
};

export type VitrineGarantie = {
  id: string;
  title: string;
  text: string;
  icon: IconName;
  order: number;
  is_published: boolean;
  created_at: string;
};

export type VitrineRealisation = {
  id: string;
  title: string;
  filiale: string;
  client: string;
  location: string;
  value: string;
  year: string;
  image: string;
  tags: string[];
  description: string;
  is_published: boolean;
  created_at: string;
};

export type VitrineBlogPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  date: string; // ISO or display string
  read_time: string;
  excerpt: string;
  image: string;
  content: string[];
  is_published: boolean;
  created_at: string;
};

export type VitrineMarqueeItem = {
  id: string;
  label: string;
  order: number;
  is_published: boolean;
};

export type VitrineProduitPublic = {
  id: string;
  nom: string;
  reference: string;
  description?: string | null;
  prix_unitaire: number | string;
  quantite_actuelle: number;
  stock_minimum: number;
  statut: string;
  filiale?: { id: string; nom: string; code: string } | null;
  image?: string | null;
  created_at?: string;
};

/** Indique si l'endpoint vitrine existe côté backend (404 = non exposé). */
export let vitrineBackendAvailable: boolean | null = null;

function markAvailable(value: boolean): void {
  vitrineBackendAvailable = value;
}

// ------------------------------------------------------------------
// Helpers — API directe, erreurs typées
// ------------------------------------------------------------------

const LIST_OPTIONS = {
  auth: false,
  // Contenu public quasi-statique : cache mémoire 5 min + déduplication.
  cacheTtlMs: 5 * 60_000,
  timeoutMs: 12_000,
} as const;

/** Lecture d'une collection : 404 → `[]` (endpoint non exposé ou vide), le reste est propagé. */
async function listVitrine<T>(path: string, query?: Record<string, string>): Promise<T[]> {
  try {
    const data = await apiFetch<T[] | { data?: T[] }>(path, {
      ...LIST_OPTIONS,
      query: query as unknown as import("@/app/lib/api-client").ApiQuery,
    });
    markAvailable(true);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray((data as { data?: T[] }).data)) return (data as { data: T[] }).data;
    return [];
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 404) {
      markAvailable(false);
      return [];
    }
    throw err;
  }
}

/** Mutation : appel API direct, erreur propagée (aucune persistance locale simulée). */
async function mutateVitrine<T>(path: string, method: "POST" | "PATCH" | "DELETE", body?: unknown): Promise<T> {
  try {
    const data = await apiFetch<T>(path, { method, body, cacheTtlMs: 0, timeoutMs: 15_000 });
    markAvailable(true);
    if (typeof window !== "undefined") window.dispatchEvent(new Event("wugams:vitrine:change"));
    return data;
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 404) markAvailable(false);
    throw err;
  }
}

// ------------------------------------------------------------------
// Témoignages
// ------------------------------------------------------------------

export async function listTemoignages(): Promise<VitrineTemoignage[]> {
  return listVitrine<VitrineTemoignage>("/vitrine/temoignages", { published: "true" });
}

export async function createTemoignage(
  input: Omit<VitrineTemoignage, "id" | "created_at" | "updated_at">,
): Promise<VitrineTemoignage> {
  return mutateVitrine<VitrineTemoignage>("/vitrine/temoignages", "POST", input);
}

export async function updateTemoignage(id: string, patch: Partial<VitrineTemoignage>): Promise<VitrineTemoignage> {
  return mutateVitrine<VitrineTemoignage>(`/vitrine/temoignages/${id}`, "PATCH", patch);
}

export async function deleteTemoignage(id: string): Promise<void> {
  await mutateVitrine<void>(`/vitrine/temoignages/${id}`, "DELETE");
}

// ------------------------------------------------------------------
// Services (filiales homepage)
// ------------------------------------------------------------------

export async function listServices(): Promise<VitrineService[]> {
  return listVitrine<VitrineService>("/vitrine/services", { published: "true" });
}

export async function createService(input: Omit<VitrineService, "id" | "created_at">): Promise<VitrineService> {
  return mutateVitrine<VitrineService>("/vitrine/services", "POST", input);
}

export async function updateService(id: string, patch: Partial<VitrineService>): Promise<VitrineService> {
  return mutateVitrine<VitrineService>(`/vitrine/services/${id}`, "PATCH", patch);
}

export async function deleteService(id: string): Promise<void> {
  await mutateVitrine<void>(`/vitrine/services/${id}`, "DELETE");
}

// ------------------------------------------------------------------
// Garanties / Engagements
// ------------------------------------------------------------------

export async function listGaranties(): Promise<VitrineGarantie[]> {
  return listVitrine<VitrineGarantie>("/vitrine/garanties", { published: "true" });
}

export async function createGarantie(input: Omit<VitrineGarantie, "id" | "created_at">): Promise<VitrineGarantie> {
  return mutateVitrine<VitrineGarantie>("/vitrine/garanties", "POST", input);
}

export async function updateGarantie(id: string, patch: Partial<VitrineGarantie>): Promise<VitrineGarantie> {
  return mutateVitrine<VitrineGarantie>(`/vitrine/garanties/${id}`, "PATCH", patch);
}

export async function deleteGarantie(id: string): Promise<void> {
  await mutateVitrine<void>(`/vitrine/garanties/${id}`, "DELETE");
}

// ------------------------------------------------------------------
// Réalisations
// ------------------------------------------------------------------

export async function listRealisations(): Promise<VitrineRealisation[]> {
  return listVitrine<VitrineRealisation>("/vitrine/realisations", { published: "true" });
}

export async function createRealisation(
  input: Omit<VitrineRealisation, "id" | "created_at">,
): Promise<VitrineRealisation> {
  return mutateVitrine<VitrineRealisation>("/vitrine/realisations", "POST", input);
}

export async function updateRealisation(
  id: string,
  patch: Partial<VitrineRealisation>,
): Promise<VitrineRealisation> {
  return mutateVitrine<VitrineRealisation>(`/vitrine/realisations/${id}`, "PATCH", patch);
}

export async function deleteRealisation(id: string): Promise<void> {
  await mutateVitrine<void>(`/vitrine/realisations/${id}`, "DELETE");
}

// ------------------------------------------------------------------
// Blog
// ------------------------------------------------------------------

export async function listBlogPosts(): Promise<VitrineBlogPost[]> {
  return listVitrine<VitrineBlogPost>("/vitrine/blog", { published: "true" });
}

export async function getBlogPost(slug: string): Promise<VitrineBlogPost | null> {
  try {
    const post = await apiFetch<VitrineBlogPost>(`/vitrine/blog/${slug}`, {
      auth: false,
      cacheTtlMs: 5 * 60_000,
      timeoutMs: 12_000,
    });
    markAvailable(true);
    return post;
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 404) {
      markAvailable(false);
      return null;
    }
    throw err;
  }
}

export async function createBlogPost(input: Omit<VitrineBlogPost, "id" | "created_at">): Promise<VitrineBlogPost> {
  return mutateVitrine<VitrineBlogPost>("/vitrine/blog", "POST", input);
}

export async function updateBlogPost(id: string, patch: Partial<VitrineBlogPost>): Promise<VitrineBlogPost> {
  return mutateVitrine<VitrineBlogPost>(`/vitrine/blog/${id}`, "PATCH", patch);
}

export async function deleteBlogPost(id: string): Promise<void> {
  await mutateVitrine<void>(`/vitrine/blog/${id}`, "DELETE");
}

// ------------------------------------------------------------------
// Marquee
// ------------------------------------------------------------------

export async function listMarquee(): Promise<VitrineMarqueeItem[]> {
  return listVitrine<VitrineMarqueeItem>("/vitrine/marquee", { published: "true" });
}

export async function createMarqueeItem(input: Omit<VitrineMarqueeItem, "id">): Promise<VitrineMarqueeItem> {
  return mutateVitrine<VitrineMarqueeItem>("/vitrine/marquee", "POST", input);
}

export async function updateMarqueeItem(
  id: string,
  patch: Partial<VitrineMarqueeItem>,
): Promise<VitrineMarqueeItem> {
  return mutateVitrine<VitrineMarqueeItem>(`/vitrine/marquee/${id}`, "PATCH", patch);
}

export async function deleteMarqueeItem(id: string): Promise<void> {
  await mutateVitrine<void>(`/vitrine/marquee/${id}`, "DELETE");
}

// ------------------------------------------------------------------
// Boutique publique — catalogue vitrine
// ------------------------------------------------------------------

export async function listProduitsPublic(): Promise<VitrineProduitPublic[]> {
  return listVitrine<VitrineProduitPublic>("/vitrine/produits");
}

// ------------------------------------------------------------------
// Permissions vitrine — source de vérité : le backend uniquement.
// Permission inconnue (API en erreur) = permission REFUSÉE.
// ------------------------------------------------------------------

export async function listVitrinePermissions(): Promise<string[]> {
  const data = await apiFetch<{ user_ids: string[] } | string[]>("/vitrine/permissions", { cacheTtlMs: 0 });
  if (Array.isArray(data)) return data as string[];
  if (data && typeof data === "object" && "user_ids" in data) return (data as { user_ids: string[] }).user_ids;
  return [];
}

export async function grantVitrinePermission(userId: string): Promise<void> {
  await apiFetch("/vitrine/permissions", { method: "POST", body: { user_id: userId }, cacheTtlMs: 0 });
}

export async function revokeVitrinePermission(userId: string): Promise<void> {
  await apiFetch(`/vitrine/permissions/${userId}`, { method: "DELETE", cacheTtlMs: 0 });
}
