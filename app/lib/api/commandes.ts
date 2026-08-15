import { apiFetch } from "@/app/lib/api-client";
import type {
  Commande,
  CommandeStatutTransition,
  CreateCommandePayload,
  MessageResponse,
  PaiementMobile,
  PayerCommandePayload,
} from "@/app/lib/contracts";

export type CommandeFilters = {
  statut?: string;
  client_id?: string;
};

export async function listCommandes(filters: CommandeFilters = {}): Promise<Commande[]> {
  return apiFetch<Commande[]>("/commandes", { query: filters });
}

export async function getCommande(id: string): Promise<Commande> {
  return apiFetch<Commande>(`/commandes/${id}`);
}

export async function createCommande(payload: CreateCommandePayload): Promise<Commande> {
  return apiFetch<Commande>("/commandes", { method: "POST", body: payload });
}

export async function updateCommandeStatut(id: string, statut: CommandeStatutTransition): Promise<Commande> {
  return apiFetch<Commande>(`/commandes/${id}/statut`, { method: "PATCH", body: { statut } });
}

export async function payerCommande(id: string, payload: PayerCommandePayload): Promise<PaiementMobile> {
  return apiFetch<PaiementMobile>(`/commandes/${id}/payer`, { method: "POST", body: payload });
}

export async function confirmerPaiement(id: string, reference: string): Promise<Commande> {
  return apiFetch<Commande>(`/commandes/${id}/confirmer-paiement`, {
    method: "POST",
    body: { reference },
  });
}

export async function removeCommande(id: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/commandes/${id}`, { method: "DELETE" });
}