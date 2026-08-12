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
    nom: "Plan A",
    tagline: "L'essentiel pour votre domicile",
    nbToilettes: 1,
    prixMensuel: 4_000,
    avantages: ["1 toilettes nettoyée", "2 passages par mois", "Preuve photo avant / après", "Produits professionnels"],
    premium: false,
  },
  {
    id: "plan-b",
    nom: "Plan B Premium",
    tagline: "Le confort d'une maison sans tracas",
    nbToilettes: 5,
    prixMensuel: 50_000,
    avantages: ["Jusqu'à 5 toilettes", "4 passages par mois", "Cleaner dédié", "Preuve photo avant / après", "Priorité d'intervention", "Suivi en temps réel"],
    premium: true,
  },
];

/* ------------------------------------------------------------------ */
/* Données de démonstration                                            */
/* ------------------------------------------------------------------ */

const demoAbonnement: CleansAbonnement = {
  statut: "ACTIF",
  planId: "plan-b",
  planNom: "Plan B Premium",
  nbToilettes: 5,
  prixMensuel: 50_000,
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
    photoAvant: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&q=80",
    photoApres: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3d2?w=1200&q=80",
    note: "Nettoyage complet des 5 équipements. Produit détergent désinfectant appliqué.",
  },
  {
    id: "cs2",
    date: "5 août 2026",
    heure: "09:30",
    adresse: "Dowa Saint-Paul C/31 · Résidence",
    cleaner: "Marina H. · Wugams Cleaner",
    statut: "VALIDE",
    photoAvant: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80",
    photoApres: "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?w=1200&q=80",
    note: "Entretien hebdomadaire. Recommandation : renouveler les pastilles WC la semaine prochaine.",
  },
  {
    id: "cs3",
    date: "29 juillet 2026",
    heure: "08:15",
    adresse: "Dowa Saint-Paul C/31 · Résidence",
    cleaner: "Marina H. · Wugams Cleaner",
    statut: "VALIDE",
    photoAvant: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=80",
    photoApres: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
    note: "Désinfection complète. Aucune anomalie constatée.",
  },
  {
    id: "cs4",
    date: "13 août 2026",
    heure: "08:00",
    adresse: "Dowa Saint-Paul C/31 · Résidence",
    cleaner: "Marina H. · Wugams Cleaner",
    statut: "PLANIFIE",
    photoAvant: null,
    photoApres: null,
    note: null,
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

/* ------------------------------------------------------------------ */
/* Chargement — front uniquement, données de démonstration             */
/* ------------------------------------------------------------------ */

export async function loadCleansOverview(): Promise<CleansOverview> {
  return demoCleansOverview;
}