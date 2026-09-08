/* ------------------------------------------------------------------ */
/* WUGAMS CLEAN — catalogue canonique (source PDF officielle)          */
/* Plan de Service & Abonnements — ne pas inventer d'autres tarifs.    */
/* ------------------------------------------------------------------ */

export const WUGAMS_CLEAN_CONTACT = {
  site: "www.wugamsclean.com",
  siteUrl: "https://www.wugamsclean.com",
  email: "contact@wugamsclean.com",
  tagline: "WUGAMS CLEAN — Votre partenaire hygiène & propreté",
} as const;

export const WUGAMS_CLEAN_HERO = {
  badge: "WUGAMS CLEAN",
  title: "Plan de Service & Abonnements",
  subtitle: "Catalogue des offres de nettoyage de sanitaires & solution digitale intégrée",
} as const;

export const WUGAMS_CLEAN_OFFRES_INTRO = {
  title: "Offres & Formules",
  subtitle: "Des solutions clés en main adaptées aux résidences, entreprises et espaces publics",
} as const;

/* ---------------- Plan A — Résidences & Maisons ---------------- */

export type PlanARow = { toilettes: string; prixMensuel: number | null };

export const PLAN_A = {
  id: "plan-a",
  nom: "Plan A – Résidences & Maisons",
  frequence: "2 passages / semaine (8 / mois)",
  cibles: "Maisons individuelles, Villas, Appartements & Résidences privées.",
  colonnes: ["Toilettes", "Prix mensuel (FCFA)"] as const,
  lignes: [
    { toilettes: "1 toilette", prixMensuel: 4000 },
    { toilettes: "2 toilettes", prixMensuel: 7500 },
    { toilettes: "3 toilettes", prixMensuel: 10500 },
    { toilettes: "4 toilettes", prixMensuel: 13000 },
    { toilettes: "5 toilettes", prixMensuel: 15000 },
    { toilettes: "Plus de 5", prixMensuel: null },
  ] as PlanARow[],
} as const;

/* ---------------- Plan B — Entreprises & Pro ---------------- */

export type PlanBRow = {
  tranche: string;
  essentiel: number; // 2/sem — prix mensuel / toilette
  confort: number; // 3/sem
  premium: number; // 6/sem
};

export const PLAN_B = {
  id: "plan-b",
  nom: "Plan B – Entreprises & Pro",
  destineA: "Bureaux, Banques, Restaurants, Hôtels, Écoles, Cliniques, Églises, Administrations…",
  formules: ["Essentiel (2/sem)", "Confort (3/sem)", "Premium (6/sem)"] as const,
  unite: "FCFA / tol. / mois",
  lignes: [
    { tranche: "1 à 5", essentiel: 5000, confort: 6500, premium: 10000 },
    { tranche: "6 à 10", essentiel: 4500, confort: 6000, premium: 9500 },
    { tranche: "11 à 20", essentiel: 4000, confort: 5500, premium: 9000 },
    { tranche: "21 à 30", essentiel: 3700, confort: 5000, premium: 8500 },
    { tranche: "31 à 50", essentiel: 3500, confort: 4800, premium: 8000 },
  ] as PlanBRow[],
} as const;

/* ---------------- Plan C — Sites à Forte Fréquentation ---------------- */

export type PlanCRow = {
  tranche: string;
  standard: number; // 2/jour
  intensive: number; // 4/jour
};

export const PLAN_C = {
  id: "plan-c",
  nom: "Plan C – Sites à Forte Fréquentation",
  secteurs: "Marchés, Gares, Stations-service, Stades, Événements, Chantiers.",
  formules: ["Standard (2/jour)", "Intensive (4/jour)"] as const,
  unite: "FCFA / jour",
  lignes: [
    { tranche: "1 à 5", standard: 12000, intensive: 18000 },
    { tranche: "6 à 10", standard: 11000, intensive: 17000 },
    { tranche: "11 à 20", standard: 10000, intensive: 16000 },
    { tranche: "21 à 30", standard: 9500, intensive: 15000 },
    { tranche: "31 à 50", standard: 9000, intensive: 14000 },
  ] as PlanCRow[],
  permanence: "Formule Permanence : Agent présent en continu pendant les heures d'ouverture (Tarif sur devis).",
} as const;

/* ---------------- Options & Remises ---------------- */

export const WUGAMS_CLEAN_OPTIONS = {
  inclusions: [
    { label: "Nettoyage miroirs & murs", valeur: "Inclus" },
    { label: "Fourniture Savon & Papier", valeur: "Sur devis" },
    { label: "Débouchage simple", valeur: "Dès 5 000 FCFA" },
    { label: "Intervention d'urgence", valeur: "Dès 5 000 FCFA" },
  ],
  avantages: [
    { label: "Contrat de 6 mois", valeur: "5 % de réduction" },
    { label: "Contrat de 12 mois", valeur: "10 % de réduction" },
    { label: "Paiement annuel", valeur: "1 mois offert" },
    { label: "+100 toilettes", valeur: "Étude personnalisée" },
  ],
} as const;

/* ---------------- Innovation digitalisée ---------------- */

export const WUGAMS_CLEAN_DIGITAL = {
  titre: "L'Innovation Digitalisée",
  sousTitre: "Une application mobile dédiée pour un suivi en temps réel et une transparence maximale",
  appTitre: "Application Mobile WUGAMS",
  fonctionnalites: [
    {
      titre: "Horaires & Géolocalisation",
      texte: "Horodatage précis de l'arrivée et du départ de l'agent.",
    },
    {
      titre: "Checklist Digitale",
      texte: "Validation en temps réel des tâches effectuées (cuvettes, désinfection, sols…).",
    },
    {
      titre: "Preuves Visuelles",
      texte: "Prise de photos Avant / Après pour chaque intervention.",
    },
    {
      titre: "Signalement d'Anomalies",
      texte: "Remontée immédiate des fuites, chasses d'eau ou ampoules défectueuses.",
    },
  ],
  pilotage: [
    {
      titre: "Tableau de Bord Responsable",
      texte:
        "Suivi en direct des agents sur le terrain, détection des retards, validation des photos et gestion globale des abonnements, revenus et dépenses.",
    },
    {
      titre: "Espace Client Sécurisé",
      texte:
        "Accès dédié pour consulter le calendrier des visites, télécharger les factures, noter les prestations (1 à 5 étoiles) et échanger directement avec le service client.",
    },
  ],
} as const;

/* ---------------- Score d'hygiène ---------------- */

export const WUGAMS_CLEAN_SCORE = {
  titre: "Le Score d'Hygiène WUGAMS",
  sousTitre: "Un baromètre d'hygiène pour vos locaux",
  texte: "Chaque intervention génère une note objective basée sur notre grille de contrôle rigoureuse :",
  echelle: [
    { tranche: "0 – 49", label: "Hygiène insuffisante" },
    { tranche: "50 – 69", label: "À améliorer" },
    { tranche: "70 – 84", label: "Bonne hygiène" },
    { tranche: "85 – 100", label: "Excellente hygiène" },
  ],
} as const;

/* ---------------- Engagements ---------------- */

export const WUGAMS_CLEAN_ENGAGEMENTS = [
  {
    titre: "Transparence",
    texte: "Traçabilité totale des interventions grâce au suivi numérique et aux photos instantanées.",
  },
  {
    titre: "Flexibilité",
    texte: "Formules modulables s'adaptant parfaitement aux contraintes de chaque établissement.",
  },
  {
    titre: "Professionnalisme",
    texte: "Agents formés, contrôlés et responsabilisés pour un standard d'hygiène irréprochable.",
  },
] as const;

export function formatFcfaClean(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}
