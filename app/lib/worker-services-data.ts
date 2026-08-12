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
  source: "demo";
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
/* Données de démonstration                                            */
/* ------------------------------------------------------------------ */

const demoImages: Record<string, string> = {
  "maison-kone": "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80",
  "bureaux-socimex": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80",
  "residence-aya": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
  "chantier-koffi": "https://images.unsplash.com/photo-1541888946425-d81bbad27a4f?w=1200&q=80",
  "palmiers": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
  "residence-traore": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
};

export const demoWorkerServices: WorkerService[] = [
  {
    id: "sv1",
    type: "CLEAN",
    client: "Sœur Marie T.",
    adresse: "Dowa Saint-Paul C/31 · Résidence",
    heure: "08:00 – 09:30",
    image: demoImages["residence-traore"],
    statut: "EN_COURS",
  },
  {
    id: "sv2",
    type: "CLEAN",
    client: "Frère David K.",
    adresse: "Saint-Jean, 2ᵉ arrondissement",
    heure: "10:00 – 11:30",
    image: demoImages["maison-kone"],
    statut: "A_SERVIR",
  },
  {
    id: "sv3",
    type: "ARTISAN",
    client: "Habitation Koffi",
    adresse: "Porto-Novo, Akron-Missé",
    heure: "14:00 – 17:00",
    image: demoImages["chantier-koffi"],
    statut: "A_SERVIR",
  },
  {
    id: "sv4",
    type: "CLEAN",
    client: "Résidence Aya",
    adresse: "Dowa Saint-Paul C/31 · Bâtiment B",
    heure: "17:30 – 18:30",
    image: demoImages["residence-aya"],
    statut: "A_SERVIR",
  },
  {
    id: "sv5",
    type: "CLEAN",
    client: "Copropriété Les Palmiers",
    adresse: "Houawé · Parties communes",
    heure: "Aujourd'hui · 08:00",
    image: demoImages["palmiers"],
    statut: "VALIDE",
  },
];

export const demoPrime: WorkerPrime = {
  id: "pr1",
  type: "PRIME",
  libelle: "Prime de performance — Cycle 9S",
  montant: 35_000,
  statut: "DISPONIBLE",
  date: "8 août 2026",
};

export const demoWorkerServicesOverview: WorkerServiceOverview = {
  source: "demo",
  services: demoWorkerServices,
  primeDisponible: demoPrime,
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
/* Chargement — front uniquement                                       */
/* ------------------------------------------------------------------ */

export async function loadWorkerServicesOverview(): Promise<WorkerServiceOverview> {
  return demoWorkerServicesOverview;
}

export function formatMontantFcfa(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}