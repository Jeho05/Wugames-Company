import type { Commande, Produit } from "@/app/lib/contracts";
import * as commandesApi from "@/app/lib/api/commandes";
import * as clientSpaceApi from "@/app/lib/api/client-space";
import * as stocksApi from "@/app/lib/api/stocks";

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
  statut: "EN_ATTENTE" | "EN_PREPARATION" | "EXPEDIEE" | "LIVREE" | "ANNULEE";
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
  { id: "bc1", items: [{ produitId: "bp2", nom: "Détergent 5 L", quantite: 2, prix: 6_500 }], total: 13_000, statut: "EXPEDIEE", date: "2026-08-10T09:15:00.000Z", moyen: "MOMO" },
  { id: "bc2", items: [{ produitId: "bp5", nom: "Chaise en rotin", quantite: 1, prix: 18_500 }], total: 18_500, statut: "LIVREE", date: "2026-08-03T15:40:00.000Z", moyen: "COMPTE" },
];

export function formatMontantFcfa(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

/* ------------------------------------------------------------------ */
/* Branchement API                                                     */
/* ------------------------------------------------------------------ */

const categorieParMotCle: [RegExp, BoutiqueProduit["categorie"]][] = [
  [/entretien|détergent|detergent|nettoy|savon|brosse|gant|aspirateur|serpillière|serpilliere/i, "entretien"],
  [/ciment|peinture|carrelage|sable|plâtre|platre|colle|parpaing|gravier|tube|câble|cable|tôle|tole|toiture|enduit/i, "materiaux"],
  [/chaise|table|fauteuil|lit|armoire|canapé|canape|rotin|mobilier|bureau/i, "mobilier"],
  [/perceuse|échafaudage|echafaudage|marteau|tournevis|scie|pince|niveau|échelle|echelle|coffre|outil|visseuse/i, "outillage"],
];

export function boutiqueProduitFromApi(produit: Produit): BoutiqueProduit {
  const categorie = categorieParMotCle.find(([re]) => re.test(produit.nom))?.[1] ?? "materiaux";
  return {
    id: produit.id,
    nom: produit.nom,
    categorie,
    prix: Number(produit.prix_unitaire),
    stock: produit.quantite_actuelle,
    unite: "unité",
    description: produit.description ?? "",
  };
}

export function boutiqueCommandeFromApi(commande: Commande): BoutiqueCommande {
  const mode = commande.paiement?.mode;
  const moyen: BoutiqueCommande["moyen"] =
    mode === "MTN_MOMO" || mode === "MOOV_MONEY" ? "MOMO" : mode === "CARTE" ? "CARTE" : "COMPTE";
  return {
    id: commande.id,
    items: commande.articles.map((article) => ({
      produitId: article.produit_id,
      nom: article.designation,
      quantite: article.quantite,
      prix: article.prix_unitaire,
    })),
    total: commande.montant_total,
    statut: commande.statut,
    date: commande.created_at,
    moyen,
  };
}

export type BoutiqueData = {
  produits: BoutiqueProduit[];
  commandes: BoutiqueCommande[];
  live: boolean;
};

export async function loadBoutiqueData(filialeId: string | null): Promise<BoutiqueData> {
  const [produitsRes, commandesRes] = await Promise.allSettled([
    stocksApi.listProduits(filialeId ? { filiale_id: filialeId } : {}),
    clientSpaceApi.getCommandes(),
  ]);

  const produits =
    produitsRes.status === "fulfilled" && produitsRes.value.length > 0
      ? produitsRes.value.map(boutiqueProduitFromApi)
      : demoBoutiqueProduits;

  const commandes =
    commandesRes.status === "fulfilled" && commandesRes.value.length > 0
      ? commandesRes.value.map(boutiqueCommandeFromApi)
      : demoBoutiqueCommandes;

  return {
    produits,
    commandes,
    live: produitsRes.status === "fulfilled" || commandesRes.status === "fulfilled",
  };
}

export async function passerCommandeApi(
  filialeId: string,
  lignes: { produit: BoutiqueProduit; quantite: number }[],
  telephone: string,
): Promise<Commande> {
  const commande = await commandesApi.createCommande({
    filiale_id: filialeId,
    adresse_livraison: "Retrait Espace Wu",
    lignes: lignes.map((ligne) => ({
      produit_id: ligne.produit.id,
      quantite: ligne.quantite,
      prix_unitaire: ligne.produit.prix,
    })),
  });
  const paiement = await commandesApi.payerCommande(commande.id, { mode: "MTN_MOMO", telephone });
  await commandesApi.confirmerPaiement(commande.id, paiement.reference);
  return commande;
}