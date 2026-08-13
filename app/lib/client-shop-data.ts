export type BoutiqueProduit = {
  id: string;
  nom: string;
  categorie: "entretien" | "materiaux" | "mobilier" | "outillage";
  prix: number;
  stock: number;
  unite: string;
  description: string;
};

export type BoutiqueCommande = {
  id: string;
  items: { produitId: string; nom: string; quantite: number; prix: number }[];
  total: number;
  statut: "EN_PREPARATION" | "LIVREE" | "EN_COURS";
  date: string;
  moyen: "MOMO" | "CARTE" | "COMPTE";
};

export const boutiqueCategorieMeta: Record<BoutiqueProduit["categorie"], { label: string; hint: string }> = {
  entretien: { label: "Entretien", hint: "Produits d'entretien et soin" },
  materiaux: { label: "Matériaux", hint: "Construction et rénovation" },
  mobilier: { label: "Mobilier", hint: "Meubles et décoration" },
  outillage: { label: "Outillage", hint: "Outils et équipement" },
};

export const demoBoutiqueProduits: BoutiqueProduit[] = [
  { id: "bp1", nom: "Kit entretien premium", categorie: "entretien", prix: 25_000, stock: 34, unite: "unité", description: "L'essentiel WUGAMS Cleans pour un foyer impeccable." },
  { id: "bp2", nom: "Détergent 5 L", categorie: "entretien", prix: 6_500, stock: 120, unite: "bidon", description: "Multi-usages, parfum fraîcheur longue durée." },
  { id: "bp3", nom: "Ciment 50 kg", categorie: "materiaux", prix: 9_500, stock: 0, unite: "sac", description: "Ciment CPA 42.5 pour maçonnerie courante." },
  { id: "bp4", nom: "Peinture acrylique 10 L", categorie: "materiaux", prix: 32_000, stock: 18, unite: "seau", description: "Finition mate lavable, teintes standard." },
  { id: "bp5", nom: "Chaise en rotin", categorie: "mobilier", prix: 18_500, stock: 12, unite: "pièce", description: "Artisanat local, finition huilée." },
  { id: "bp6", nom: "Table basse modulaire", categorie: "mobilier", prix: 45_000, stock: 7, unite: "pièce", description: "Bois massif, montage en 10 minutes." },
  { id: "bp7", nom: "Perceuse sans fil 18 V", categorie: "outillage", prix: 28_000, stock: 9, unite: "pièce", description: "Batterie 2 Ah, chargeur inclus." },
  { id: "bp8", nom: "Échafaudage 2 m", categorie: "outillage", prix: 65_000, stock: 4, unite: "lot", description: "Structure aluminium, 2 plateaux." },
];

export const demoBoutiqueCommandes: BoutiqueCommande[] = [
  { id: "bc1", items: [{ produitId: "bp2", nom: "Détergent 5 L", quantite: 2, prix: 6_500 }], total: 13_000, statut: "EN_COURS", date: "2026-08-10T09:15:00.000Z", moyen: "MOMO" },
  { id: "bc2", items: [{ produitId: "bp5", nom: "Chaise en rotin", quantite: 1, prix: 18_500 }], total: 18_500, statut: "LIVREE", date: "2026-08-03T15:40:00.000Z", moyen: "COMPTE" },
];

export function formatMontantFcfa(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}