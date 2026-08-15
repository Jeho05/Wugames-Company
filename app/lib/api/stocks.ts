import { apiFetch } from "@/app/lib/api-client";
import type {
  CreateMouvementPayload,
  CreateProduitPayload,
  MessageResponse,
  MouvementStock,
  Produit,
  StockAlerte,
  StockAlerteNiveau,
} from "@/app/lib/contracts";

export type ProduitFilters = {
  filiale_id?: string;
  statut?: string;
  fournisseur_id?: string;
};

export type AlerteFilters = {
  filiale_id?: string;
  niveau?: StockAlerteNiveau;
};

export async function listProduits(filters: ProduitFilters = {}): Promise<Produit[]> {
  return apiFetch<Produit[]>("/stocks/produits", { query: filters });
}

export async function getProduit(id: string): Promise<Produit> {
  return apiFetch<Produit>(`/stocks/produits/${id}`);
}

export async function createProduit(payload: CreateProduitPayload): Promise<Produit> {
  return apiFetch<Produit>("/stocks/produits", { method: "POST", body: payload });
}

export type UpdateProduitPayload = Partial<{
  nom: string;
  reference: string;
  description: string;
  prix_unitaire: number;
  stock_minimum: number;
  fournisseur_id: string | null;
}>;

export async function updateProduit(id: string, payload: UpdateProduitPayload): Promise<Produit> {
  return apiFetch<Produit>(`/stocks/produits/${id}`, { method: "PATCH", body: payload });
}

export async function removeProduit(id: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/stocks/produits/${id}`, { method: "DELETE" });
}

export async function createMouvement(payload: CreateMouvementPayload): Promise<MouvementStock> {
  return apiFetch<MouvementStock>("/stocks/mouvements", { method: "POST", body: payload });
}

export async function commanderProduit(id: string): Promise<Produit> {
  return apiFetch<Produit>(`/stocks/produits/${id}/commander`, { method: "POST" });
}

export async function receptionnerProduit(id: string): Promise<Produit> {
  return apiFetch<Produit>(`/stocks/produits/${id}/reception`, { method: "POST" });
}

export async function getAlertes(filters: AlerteFilters = {}): Promise<StockAlerte[]> {
  return apiFetch<StockAlerte[]>("/stocks/alertes", { query: filters });
}
