/* ------------------------------------------------------------------ */
/* Services du jour — task list en galerie (Wugams Cleaner / Artisan)  */
/* Complément du Doc Technique ERP v2.0 — WUGAMS HOLDING INC.          */
/* ------------------------------------------------------------------ */

export type WorkerServiceType = "CLEAN" | "ARTISAN";

export type WorkerServiceStatut = "A_SERVIR" | "EN_COURS" | "VALIDE";

export type WorkerService = {
  id: string;
  type: WorkerServiceType;
  client: string;
  adresse: string;
  heure: string;
  image: string;
  statut: WorkerServiceStatut;
};

export type WorkerServicePreuve = {
  arrivedAt: string | null;
  departedAt: string | null;
  observations: string;
  audioUrl: string | null;
  videoUrl: string | null;
  photoAvant: string | null;
  photoApres: string | null;
};

export type WorkerServiceOverview = {
  source: "api";
  services: WorkerService[];
  primeDisponible: WorkerPrime | null;
};

export type WorkerPrime = {
  id: string;
  type: "PRIME" | "SALAIRE";
  libelle: string;
  montant: number;
  statut: "DISPONIBLE" | "RETIRE";
  date: string;
};

export const workerServiceTypeMeta: Record<WorkerServiceType, { label: string; tone: string }> = {
  CLEAN: { label: "Wugams Cleans", tone: "border-sky-200 bg-sky-50 text-sky-700" },
  ARTISAN: { label: "Wugams Artisan", tone: "border-amber-200 bg-amber-50 text-amber-700" },
};

/* ------------------------------------------------------------------ */
/* Persistance locale des preuves de service (mode dégradé inclus)     */
/* ------------------------------------------------------------------ */

const PROOFS_KEY = "wugams-worker-service-proofs";

export function loadServiceProofs(): Record<string, WorkerServicePreuve> {
  try {
    const raw = window.localStorage.getItem(PROOFS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, WorkerServicePreuve>) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveServiceProof(serviceId: string, preuve: WorkerServicePreuve): void {
  try {
    const proofs = loadServiceProofs();
    proofs[serviceId] = preuve;
    window.localStorage.setItem(PROOFS_KEY, JSON.stringify(proofs));
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/* Chargement API — Services du jour de l'ouvrier / cleaner           */
/* ------------------------------------------------------------------ */

export async function loadWorkerServicesOverview(): Promise<WorkerServiceOverview> {
  try {
    const { apiFetch } = await import("@/app/lib/api-client");
    const data = await apiFetch<WorkerServiceOverview>("/cleans/services/worker", { cacheTtlMs: 0 });
    if (data && Array.isArray(data.services)) {
      return data;
    }
    return { source: "api", services: [], primeDisponible: null };
  } catch {
    return { source: "api", services: [], primeDisponible: null };
  }
}

export async function validerWorkerServiceApi(serviceId: string, preuve: WorkerServicePreuve): Promise<{ ok: boolean }> {
  const { apiFetch } = await import("@/app/lib/api-client");
  return apiFetch<{ ok: boolean }>(`/cleans/services/${serviceId}/valider`, {
    method: "POST",
    body: JSON.stringify({
      arrived_at: preuve.arrivedAt || undefined,
      departed_at: preuve.departedAt || undefined,
      observations: preuve.observations || undefined,
      photo_avant: preuve.photoAvant || undefined,
      photo_apres: preuve.photoApres || undefined,
      audio_url: preuve.audioUrl || undefined,
      video_url: preuve.videoUrl || undefined,
    }),
  });
}

export function formatMontantFcfa(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}