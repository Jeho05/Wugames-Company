/* ------------------------------------------------------------------ */
/* Wugams Cleans — abonnements & services rendus (front, données démo) */
/* Complément du Doc Technique ERP v2.0 — WUGAMS HOLDING INC.          */
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
  source: "demo";
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

/* ------------------------------------------------------------------ */
/* Données de démonstration                                            */
/* ------------------------------------------------------------------ */

const demoAbonnement: CleansAbonnement = {
  statut: "ACTIF",
  planId: "plan-a",
  planNom: "Plan A – Résidences & Maisons",
  nbToilettes: 2,
  prixMensuel: 7_500,
  dateDebut: "1er juillet 2026",
  prochainPaiement: "1er septembre 2026",
  prochainPassage: "Mercredi 13 août · 08:00",
  localisation: "Bénin, Porto-Novo / Dowa Saint-Paul C/31",
};

const demoServices: CleansService[] = [
  {
    id: "cs1",
    date: "12 août 2026",
    heure: "08:00",
    adresse: "Dowa Saint-Paul C/31 · Résidence",
    cleaner: "Marina H. · Wugams Cleaner",
    statut: "REALISE",
    photoAvant: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=75&auto=format&fit=crop",
    photoApres: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3d2?w=800&q=75&auto=format&fit=crop",
    note: "Nettoyage complet des 2 équipements. Produit détergent désinfectant appliqué.",
    toiletteNumero: 1,
    notesTravailleur: "Joint de chasse d'eau à remplacer. robinet à serrage à resserrer.",
  },
  {
    id: "cs2",
    date: "12 août 2026",
    heure: "08:30",
    adresse: "Dowa Saint-Paul C/31 · Résidence",
    cleaner: "Marina H. · Wugams Cleaner",
    statut: "REALISE",
    photoAvant: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=75&auto=format&fit=crop",
    photoApres: "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?w=800&q=75&auto=format&fit=crop",
    note: "Entretien hebdomadaire. Recommandation : renouveler les pastilles WC la semaine prochaine.",
    toiletteNumero: 2,
    notesTravailleur: "Peinture écaillée près du sol — à repeindre. Acheter des pastilles WC.",
  },
  {
    id: "cs3",
    date: "5 août 2026",
    heure: "09:30",
    adresse: "Dowa Saint-Paul C/31 · Résidence",
    cleaner: "Marina H. · Wugams Cleaner",
    statut: "VALIDE",
    photoAvant: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=75&auto=format&fit=crop",
    photoApres: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=75&auto=format&fit=crop",
    note: "Désinfection complète. Aucune anomalie constatée.",
    toiletteNumero: 1,
    notesTravailleur: "RAS — tout est en bon état.",
  },
  {
    id: "cs4",
    date: "5 août 2026",
    heure: "10:00",
    adresse: "Dowa Saint-Paul C/31 · Résidence",
    cleaner: "Marina H. · Wugams Cleaner",
    statut: "VALIDE",
    photoAvant: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=75&auto=format&fit=crop",
    photoApres: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3d2?w=800&q=75&auto=format&fit=crop",
    note: "Nettoyage standard effectué.",
    toiletteNumero: 2,
    notesTravailleur: "Carrelage fissuré près de la douche — à réparer. Produit assainissant à racheter.",
  },
  {
    id: "cs5",
    date: "29 juillet 2026",
    heure: "08:15",
    adresse: "Dowa Saint-Paul C/31 · Résidence",
    cleaner: "Marina H. · Wugams Cleaner",
    statut: "VALIDE",
    photoAvant: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=75&auto=format&fit=crop",
    photoApres: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=75&auto=format&fit=crop",
    note: "Désinfection complète. Aucune anomalie constatée.",
    toiletteNumero: 2,
    notesTravailleur: "RAS.",
  },
  {
    id: "cs6",
    date: "13 août 2026",
    heure: "08:00",
    adresse: "Dowa Saint-Paul C/31 · Résidence",
    cleaner: "Marina H. · Wugams Cleaner",
    statut: "PLANIFIE",
    photoAvant: null,
    photoApres: null,
    note: null,
    toiletteNumero: 1,
    notesTravailleur: null,
  },
];

export const demoCleansOverview: CleansOverview = {
  source: "demo",
  abonnement: demoAbonnement,
  services: demoServices,
};

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
/* Chargement — tente l'API, sinon vide (plus de mock affiché)         */
/* ------------------------------------------------------------------ */

export async function loadCleansOverview(): Promise<CleansOverview> {
  try {
    const { apiFetch } = await import("@/app/lib/api-client");
    const data = await apiFetch<CleansOverview>("/cleans/overview", { cacheTtlMs: 0 });
    if (data && Array.isArray((data as unknown as { services?: unknown }).services)) return data;
  } catch {
    /* API non dispo — on retourne un état vide, pas de mock */
  }
  return {
    source: "demo",
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
}