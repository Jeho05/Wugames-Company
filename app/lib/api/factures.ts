import { apiFetch } from "@/app/lib/api-client";
import type {
  CreateFacturePayload,
  Facture,
  FactureConsolidation,
  FactureStatut,
  MessageResponse,
} from "@/app/lib/contracts";

export async function listFactures(): Promise<Facture[]> {
  return apiFetch<Facture[]>("/factures");
}

export async function getFacture(id: string): Promise<Facture> {
  return apiFetch<Facture>(`/factures/${id}`);
}

export async function createFacture(payload: CreateFacturePayload): Promise<Facture> {
  return apiFetch<Facture>("/factures", { method: "POST", body: payload });
}

export async function updateFactureStatut(id: string, statut: FactureStatut): Promise<Facture> {
  return apiFetch<Facture>(`/factures/${id}/statut`, { method: "PATCH", body: { statut } });
}

export async function annulerFacture(id: string, motif?: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/factures/${id}/annuler`, {
    method: "POST",
    body: { motif: motif ?? "Annulation" },
  });
}

export async function removeFacture(id: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/factures/${id}`, { method: "DELETE" });
}

export async function getFacturesConsolidation(): Promise<FactureConsolidation> {
  return apiFetch<FactureConsolidation>("/factures/consolidation");
}

export async function exportFacture(id: string): Promise<unknown> {
  return apiFetch(`/factures/${id}/export`);
}

export type RapportClotureFilters = {
  date_debut?: string;
  date_fin?: string;
  filiale_id?: string;
};

export async function rapportCloture(filters: RapportClotureFilters = {}): Promise<unknown> {
  return apiFetch("/factures/export/cloture", { query: filters });
}
