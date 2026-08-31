/**
 * API Vitrine — couche dynamique pour tout le contenu public.
 *
 * Chaque fonction tente d'abord l'API (apiFetch). En cas d'échec (404/500/offline), elle
 * retombe sur le store localStorage (vitrine-store). Ainsi le Gérant peut
 * déjà créer du contenu sans attendre le back, et la vitrine reste
 * parfaitement dynamique : si aucune donnée n'existe, la section est masquée.
 */

import { apiFetch } from "@/app/lib/api-client";
import type { IconName } from "@/app/components/ui/app-icon";
import {
  readLocal,
  writeLocal,
  generateId,
  VITRINE_KEYS,
} from "@/app/lib/vitrine-store";

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

// ------------------------------------------------------------------
// Helpers — try API then fallback to local
// ------------------------------------------------------------------

async function tryApi<T>(path: string, fallback: () => T, query?: Record<string, string>): Promise<T> {
  try {
    const data = await apiFetch<T>(path, { auth: false, cacheTtlMs: 0, query: query as unknown as import("@/app/lib/api-client").ApiQuery });
    return data;
  } catch (err) {
    if (typeof console !== "undefined") console.warn(`[vitrine] API ${path} indisponible, fallback local`, err);
    return fallback();
  }
}

async function tryApiMutation<T>(path: string, method: "POST" | "PATCH" | "DELETE", body: unknown, localMutate: () => T): Promise<T> {
  try {
    const data = await apiFetch<T>(path, { method, body, cacheTtlMs: 0 });
    return data;
  } catch {
    return localMutate();
  }
}

// ------------------------------------------------------------------
// Témoignages
// ------------------------------------------------------------------

export async function listTemoignages(): Promise<VitrineTemoignage[]> {
  return tryApi<VitrineTemoignage[]>("/vitrine/temoignages", () => readLocal<VitrineTemoignage[]>(VITRINE_KEYS.temoignages, []), { published: "true" });
}

export async function createTemoignage(input: Omit<VitrineTemoignage, "id" | "created_at" | "updated_at">): Promise<VitrineTemoignage> {
  return tryApiMutation("/vitrine/temoignages", "POST", input, () => {
    const item: VitrineTemoignage = {
      id: generateId(),
      ...input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const all = readLocal<VitrineTemoignage[]>(VITRINE_KEYS.temoignages, []);
    writeLocal(VITRINE_KEYS.temoignages, [item, ...all]);
    return item;
  });
}

export async function updateTemoignage(id: string, patch: Partial<VitrineTemoignage>): Promise<VitrineTemoignage> {
  return tryApiMutation(`/vitrine/temoignages/${id}`, "PATCH", patch, () => {
    const all = readLocal<VitrineTemoignage[]>(VITRINE_KEYS.temoignages, []);
    const idx = all.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error("Témoignage introuvable");
    const updated = { ...all[idx], ...patch, updated_at: new Date().toISOString() };
    all[idx] = updated;
    writeLocal(VITRINE_KEYS.temoignages, all);
    return updated;
  });
}

export async function deleteTemoignage(id: string): Promise<void> {
  return tryApiMutation(`/vitrine/temoignages/${id}`, "DELETE", undefined, () => {
    const all = readLocal<VitrineTemoignage[]>(VITRINE_KEYS.temoignages, []);
    writeLocal(VITRINE_KEYS.temoignages, all.filter((x) => x.id !== id));
  });
}

// ------------------------------------------------------------------
// Services (filiales homepage)
// ------------------------------------------------------------------

export async function listServices(): Promise<VitrineService[]> {
  return tryApi<VitrineService[]>("/vitrine/services", () => readLocal<VitrineService[]>(VITRINE_KEYS.services, []), { published: "true" });
}

export async function createService(input: Omit<VitrineService, "id" | "created_at">): Promise<VitrineService> {
  return tryApiMutation("/vitrine/services", "POST", input, () => {
    const item: VitrineService = { id: generateId(), ...input, created_at: new Date().toISOString() };
    const all = readLocal<VitrineService[]>(VITRINE_KEYS.services, []);
    writeLocal(VITRINE_KEYS.services, [...all, item].sort((a, b) => a.order - b.order));
    return item;
  });
}

export async function updateService(id: string, patch: Partial<VitrineService>): Promise<VitrineService> {
  return tryApiMutation(`/vitrine/services/${id}`, "PATCH", patch, () => {
    const all = readLocal<VitrineService[]>(VITRINE_KEYS.services, []);
    const idx = all.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error("Service introuvable");
    all[idx] = { ...all[idx], ...patch };
    writeLocal(VITRINE_KEYS.services, all);
    return all[idx];
  });
}

export async function deleteService(id: string): Promise<void> {
  return tryApiMutation(`/vitrine/services/${id}`, "DELETE", undefined, () => {
    const all = readLocal<VitrineService[]>(VITRINE_KEYS.services, []);
    writeLocal(VITRINE_KEYS.services, all.filter((x) => x.id !== id));
  });
}

// ------------------------------------------------------------------
// Garanties / Engagements
// ------------------------------------------------------------------

export async function listGaranties(): Promise<VitrineGarantie[]> {
  return tryApi<VitrineGarantie[]>("/vitrine/garanties", () => readLocal<VitrineGarantie[]>(VITRINE_KEYS.garanties, []), { published: "true" });
}

export async function createGarantie(input: Omit<VitrineGarantie, "id" | "created_at">): Promise<VitrineGarantie> {
  return tryApiMutation("/vitrine/garanties", "POST", input, () => {
    const item: VitrineGarantie = { id: generateId(), ...input, created_at: new Date().toISOString() };
    const all = readLocal<VitrineGarantie[]>(VITRINE_KEYS.garanties, []);
    writeLocal(VITRINE_KEYS.garanties, [...all, item].sort((a, b) => a.order - b.order));
    return item;
  });
}

export async function updateGarantie(id: string, patch: Partial<VitrineGarantie>): Promise<VitrineGarantie> {
  return tryApiMutation(`/vitrine/garanties/${id}`, "PATCH", patch, () => {
    const all = readLocal<VitrineGarantie[]>(VITRINE_KEYS.garanties, []);
    const idx = all.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error("Garantie introuvable");
    all[idx] = { ...all[idx], ...patch };
    writeLocal(VITRINE_KEYS.garanties, all);
    return all[idx];
  });
}

export async function deleteGarantie(id: string): Promise<void> {
  return tryApiMutation(`/vitrine/garanties/${id}`, "DELETE", undefined, () => {
    const all = readLocal<VitrineGarantie[]>(VITRINE_KEYS.garanties, []);
    writeLocal(VITRINE_KEYS.garanties, all.filter((x) => x.id !== id));
  });
}

// ------------------------------------------------------------------
// Réalisations
// ------------------------------------------------------------------

export async function listRealisations(): Promise<VitrineRealisation[]> {
  return tryApi<VitrineRealisation[]>("/vitrine/realisations", () => readLocal<VitrineRealisation[]>(VITRINE_KEYS.realisations, []), { published: "true" });
}

export async function createRealisation(input: Omit<VitrineRealisation, "id" | "created_at">): Promise<VitrineRealisation> {
  return tryApiMutation("/vitrine/realisations", "POST", input, () => {
    const item: VitrineRealisation = { id: generateId(), ...input, created_at: new Date().toISOString() };
    const all = readLocal<VitrineRealisation[]>(VITRINE_KEYS.realisations, []);
    writeLocal(VITRINE_KEYS.realisations, [item, ...all]);
    return item;
  });
}

export async function updateRealisation(id: string, patch: Partial<VitrineRealisation>): Promise<VitrineRealisation> {
  return tryApiMutation(`/vitrine/realisations/${id}`, "PATCH", patch, () => {
    const all = readLocal<VitrineRealisation[]>(VITRINE_KEYS.realisations, []);
    const idx = all.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error("Réalisation introuvable");
    all[idx] = { ...all[idx], ...patch };
    writeLocal(VITRINE_KEYS.realisations, all);
    return all[idx];
  });
}

export async function deleteRealisation(id: string): Promise<void> {
  return tryApiMutation(`/vitrine/realisations/${id}`, "DELETE", undefined, () => {
    const all = readLocal<VitrineRealisation[]>(VITRINE_KEYS.realisations, []);
    writeLocal(VITRINE_KEYS.realisations, all.filter((x) => x.id !== id));
  });
}

// ------------------------------------------------------------------
// Blog
// ------------------------------------------------------------------

export async function listBlogPosts(): Promise<VitrineBlogPost[]> {
  return tryApi<VitrineBlogPost[]>("/vitrine/blog", () => readLocal<VitrineBlogPost[]>(VITRINE_KEYS.blog, []), { published: "true" });
}

export async function getBlogPost(slug: string): Promise<VitrineBlogPost | null> {
  try {
    const post = await apiFetch<VitrineBlogPost>(`/vitrine/blog/${slug}`, { auth: false, cacheTtlMs: 0 });
    return post;
  } catch {
    const all = readLocal<VitrineBlogPost[]>(VITRINE_KEYS.blog, []);
    return all.find((p) => p.slug === slug) ?? null;
  }
}

export async function createBlogPost(input: Omit<VitrineBlogPost, "id" | "created_at">): Promise<VitrineBlogPost> {
  return tryApiMutation("/vitrine/blog", "POST", input, () => {
    const item: VitrineBlogPost = { id: generateId(), ...input, created_at: new Date().toISOString() };
    const all = readLocal<VitrineBlogPost[]>(VITRINE_KEYS.blog, []);
    writeLocal(VITRINE_KEYS.blog, [item, ...all]);
    return item;
  });
}

export async function updateBlogPost(id: string, patch: Partial<VitrineBlogPost>): Promise<VitrineBlogPost> {
  return tryApiMutation(`/vitrine/blog/${id}`, "PATCH", patch, () => {
    const all = readLocal<VitrineBlogPost[]>(VITRINE_KEYS.blog, []);
    const idx = all.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error("Article introuvable");
    all[idx] = { ...all[idx], ...patch };
    writeLocal(VITRINE_KEYS.blog, all);
    return all[idx];
  });
}

export async function deleteBlogPost(id: string): Promise<void> {
  return tryApiMutation(`/vitrine/blog/${id}`, "DELETE", undefined, () => {
    const all = readLocal<VitrineBlogPost[]>(VITRINE_KEYS.blog, []);
    writeLocal(VITRINE_KEYS.blog, all.filter((x) => x.id !== id));
  });
}

// ------------------------------------------------------------------
// Marquee
// ------------------------------------------------------------------

export async function listMarquee(): Promise<VitrineMarqueeItem[]> {
  return tryApi<VitrineMarqueeItem[]>("/vitrine/marquee", () => readLocal<VitrineMarqueeItem[]>(VITRINE_KEYS.marquee, []), { published: "true" });
}

export async function createMarqueeItem(input: Omit<VitrineMarqueeItem, "id">): Promise<VitrineMarqueeItem> {
  return tryApiMutation("/vitrine/marquee", "POST", input, () => {
    const item: VitrineMarqueeItem = { id: generateId(), ...input };
    const all = readLocal<VitrineMarqueeItem[]>(VITRINE_KEYS.marquee, []);
    writeLocal(VITRINE_KEYS.marquee, [...all, item].sort((a, b) => a.order - b.order));
    return item;
  });
}

export async function updateMarqueeItem(id: string, patch: Partial<VitrineMarqueeItem>): Promise<VitrineMarqueeItem> {
  return tryApiMutation(`/vitrine/marquee/${id}`, "PATCH", patch, () => {
    const all = readLocal<VitrineMarqueeItem[]>(VITRINE_KEYS.marquee, []);
    const idx = all.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error("Marquee introuvable");
    all[idx] = { ...all[idx], ...patch };
    writeLocal(VITRINE_KEYS.marquee, all);
    return all[idx];
  });
}

export async function deleteMarqueeItem(id: string): Promise<void> {
  return tryApiMutation(`/vitrine/marquee/${id}`, "DELETE", undefined, () => {
    const all = readLocal<VitrineMarqueeItem[]>(VITRINE_KEYS.marquee, []);
    writeLocal(VITRINE_KEYS.marquee, all.filter((x) => x.id !== id));
  });
}

// ------------------------------------------------------------------
// Boutique publique — catalogue vitrine
// ------------------------------------------------------------------

export async function listProduitsPublic(): Promise<VitrineProduitPublic[]> {
  return tryApi<VitrineProduitPublic[]>("/vitrine/produits", () => [], undefined);
}

// ------------------------------------------------------------------
// Permissions vitrine (Gérant uniquement)
// ------------------------------------------------------------------

export async function listVitrinePermissions(): Promise<string[]> {
  try {
    const data = await apiFetch<{ user_ids: string[] } | string[]>("/vitrine/permissions", { cacheTtlMs: 0 });
    if (Array.isArray(data)) return data as string[];
    if (data && typeof data === "object" && "user_ids" in data) return (data as { user_ids: string[] }).user_ids;
    return [];
  } catch {
    // Fallback local (interim)
    const ids = readLocal<string[]>("wugams:vitrine:permissions", []);
    return ids;
  }
}

export async function grantVitrinePermission(userId: string): Promise<void> {
  try {
    await apiFetch("/vitrine/permissions", { method: "POST", body: { user_id: userId }, cacheTtlMs: 0 });
  } catch {
    const ids = readLocal<string[]>("wugams:vitrine:permissions", []);
    if (!ids.includes(userId)) writeLocal("wugams:vitrine:permissions", [...ids, userId]);
    throw new Error("API permissions indisponible, fallback local appliqué");
  }
}

export async function revokeVitrinePermission(userId: string): Promise<void> {
  try {
    await apiFetch(`/vitrine/permissions/${userId}`, { method: "DELETE", cacheTtlMs: 0 });
  } catch {
    const ids = readLocal<string[]>("wugams:vitrine:permissions", []);
    writeLocal("wugams:vitrine:permissions", ids.filter((id) => id !== userId));
    throw new Error("API permissions indisponible, fallback local appliqué");
  }
}
