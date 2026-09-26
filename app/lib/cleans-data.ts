/* ------------------------------------------------------------------ */
/* Wugams Cleans — abonnements & services rendus (données API)       */
/* Complément du Doc Technique ERP v2.0 — WUGAMS HOLDING INC.          */
/* PRODUCTION — aucune donnée fictive : le catalogue des plans est un  */
/* contenu commercial statique, les abonnements/services viennent de   */
/* l'API (`loadCleansOverview`) ou d'un état vide explicite.           */
/* ------------------------------------------------------------------ */

export type CleansServiceStatut = "PLANIFIE" | "REALISE" | "VALIDE";

export type CleansPlan = {
  id: string;
  nom: string;
  tagline: string;
  nbToilettes: number;
  prixMensuel: number;
  avantages: string[];
  premium: boolean;
  /* Champs canoniques WUGAMS CLEAN (PDF officiel) */
  frequence?: string;
  cibles?: string;
  prixLabel?: string;
};

export type CleansService = {
  id: string;
  date: string;
  heure: string;
  adresse: string;
  cleaner: string;
  statut: CleansServiceStatut;
  photoAvant: string | null;
  photoApres: string | null;
  note: string | null;
  toiletteNumero: number;
  notesTravailleur: string | null;
};

export type CleansAbonnement = {
  statut: "ACTIF" | "SUSPENDU" | "AUCUN";
  planId: string | null;
  planNom: string | null;
  nbToilettes: number;
  prixMensuel: number;
  dateDebut: string | null;
  prochainPaiement: string | null;
  prochainPassage: string | null;
  localisation: string;
};

export type CleansOverview = {
  source: "api" | "empty";
  abonnement: CleansAbonnement;
  services: CleansService[];
};

/* ------------------------------------------------------------------ */
/* Offres                                                              */
/* ------------------------------------------------------------------ */

export const cleansPlans: CleansPlan[] = [
  {
    id: "plan-a",
    nom: "Plan A – Résidences & Maisons",
    tagline: "L'essentiel pour domicile · 2 passages / semaine (8 / mois)",
    nbToilettes: 1,
    prixMensuel: 4_000,
    avantages: [
      "2 passages / semaine (8 / mois)",
      "1 toilette : 4 000 FCFA / mois",
      "2 toilettes : 7 500 FCFA / mois",
      "3 toilettes : 10 500 FCFA / mois",
      "Nettoyage miroirs & murs inclus",
      "Preuve photo Avant / Après",
    ],
    premium: false,
    frequence: "2 passages / semaine (8 / mois)",
    cibles: "Maisons individuelles, Villas, Appartements & Résidences privées.",
    prixLabel: "dès 4 000 FCFA / mois",
  },
  {
    id: "plan-b",
    nom: "Plan B – Entreprises & Pro",
    tagline: "Bureaux, Banques, Hôtels, Écoles, Cliniques…",
    nbToilettes: 1,
    prixMensuel: 5_000,
    avantages: [
      "Essentiel (2/sem) dès 3 500 FCFA / tol.",
      "Confort (3/sem) dès 4 800 FCFA / tol.",
      "Premium (6/sem) dès 8 000 FCFA / tol.",
      "Checklist digitale + photos Avant / Après",
      "Signalement anomalies en temps réel",
    ],
    premium: true,
    frequence: "Essentiel 2/sem · Confort 3/sem · Premium 6/sem",
    cibles: "Bureaux, Banques, Restaurants, Hôtels, Écoles, Cliniques, Églises, Administrations…",
    prixLabel: "dès 3 500 FCFA / tol. / mois",
  },
  {
    id: "plan-c",
    nom: "Plan C – Forte Fréquentation",
    tagline: "Marchés, Gares, Stations-service, Stades, Événements…",
    nbToilettes: 1,
    prixMensuel: 9_000,
    avantages: [
      "Standard (2/jour) dès 9 000 FCFA / jour",
      "Intensive (4/jour) dès 14 000 FCFA / jour",
      "Formule Permanence sur devis",
      "Horodatage + géolocalisation agent",
      "Score d'hygiène /100 à chaque passage",
    ],
    premium: false,
    frequence: "Standard 2/jour · Intensive 4/jour · Permanence sur devis",
    cibles: "Marchés, Gares, Stations-service, Stades, Événements, Chantiers.",
    prixLabel: "dès 9 000 FCFA / jour",
  },
];

export const cleansServiceStatutMeta: Record<CleansServiceStatut, { label: string; tone: string }> = {
  PLANIFIE: { label: "Planifié", tone: "border-sky-200 bg-sky-50 text-sky-700" },
  REALISE: { label: "Réalisé", tone: "border-amber-200 bg-amber-50 text-amber-700" },
  VALIDE: { label: "Validé", tone: "border-emerald-200 bg-emerald-50 text-emerald-700" },
};

export function formatFcfa(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

export function formatActivationDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return dateStr;
}

export type CleansDayGroup = {
  jour: string;
  dateComplete: string;
  services: CleansService[];
};

export function groupServicesByDay(services: CleansService[]): CleansDayGroup[] {
  const groups = new Map<string, CleansService[]>();
  for (const service of services) {
    const key = service.date;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(service);
  }
  const result: CleansDayGroup[] = [];
  for (const [date, dayServices] of groups) {
    const first = dayServices[0];
    const dateObj = new Date(first.date);
    const jour = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString("fr-FR", { weekday: "long" })
      : "";
    result.push({
      jour,
      dateComplete: date,
      services: dayServices.sort((a, b) => a.heure.localeCompare(b.heure)),
    });
  }
  return result;
}

/* ------------------------------------------------------------------ */
/* État vide — aucun abonnement fictif affiché                         */
/* ------------------------------------------------------------------ */

export const emptyCleansOverview: CleansOverview = {
  source: "empty",
  abonnement: {
    statut: "AUCUN",
    planId: null,
    planNom: null,
    nbToilettes: 0,
    prixMensuel: 0,
    dateDebut: null,
    prochainPaiement: null,
    prochainPassage: null,
    localisation: "",
  },
  services: [],
};

/* ------------------------------------------------------------------ */
/* Chargement — tente l'API, sinon vide (plus de mock affiché)         */
/* ------------------------------------------------------------------ */

export async function loadCleansOverview(): Promise<CleansOverview> {
  try {
    const { apiFetch } = await import("@/app/lib/api-client");
    const data = await apiFetch<CleansOverview>("/cleans/overview", { cacheTtlMs: 0 });
    if (data && Array.isArray((data as unknown as { services?: unknown }).services)) {
      return { ...data, source: "api" };
    }
  } catch {
    /* API non dispo — nouveau client reste SANS abonnement, pas de mock */
  }
  return emptyCleansOverview;
}