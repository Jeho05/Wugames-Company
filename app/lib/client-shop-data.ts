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

  const produitsFulfilled = produitsRes.status === "fulfilled";
  const commandesFulfilled = commandesRes.status === "fulfilled";

  /* API joignable : les listes réelles s'affichent, même vides.
     La démonstration ne sert que lorsque l'API est totalement injoignable. */
  const produits =
    produitsFulfilled
      ? produitsRes.value.map(boutiqueProduitFromApi)
      : [];

  const commandes =
    commandesFulfilled
      ? commandesRes.value.map(boutiqueCommandeFromApi)
      : [];

  return {
    produits,
    commandes,
    live: produitsFulfilled || commandesFulfilled,
  };
}

type PaymentUi = "mtn" | "moov" | "wave" | "carte";

function mapPaymentMode(ui: PaymentUi): "MTN_MOMO" | "MOOV_MONEY" | "CARTE" {
  if (ui === "moov" || ui === "wave") return "MOOV_MONEY";
  if (ui === "carte") return "CARTE";
  return "MTN_MOMO";
}

export async function passerCommandeApi(
  filialeId: string,
  lignes: { produit: BoutiqueProduit; quantite: number }[],
  telephone: string,
  paymentUi: PaymentUi = "mtn",
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
  const mode = mapPaymentMode(paymentUi);
  // CARTE ne nécessite pas de téléphone, les autres oui (optionnel côté back désormais)
  const paiement = await commandesApi.payerCommande(commande.id, { mode, telephone: telephone || undefined } as unknown as { mode: "MTN_MOMO" | "MOOV_MONEY" | "CARTE"; telephone?: string });
  // En mode demo, confirmerPaiement simule le callback
  if (mode !== "CARTE") {
    try {
      await commandesApi.confirmerPaiement(commande.id, paiement.reference);
    } catch {
      /* best-effort */
    }
  }
  return commande;
}