import { apiFetch } from "@/app/lib/api-client";
import type {
  CreateDevisPayload,
  Devis,
  DevisConversion,
  DevisStatut,
  MessageResponse,
  UpdateDevisPayload,
} from "@/app/lib/contracts";

export type DevisFilters = {
  filiale_id?: string;
  statut?: string;
  client_id?: string;
};

export async function listDevis(filters: DevisFilters = {}): Promise<Devis[]> {
  return apiFetch<Devis[]>("/devis", { query: filters });
}

export async function getDevis(id: string): Promise<Devis> {
  return apiFetch<Devis>(`/devis/${id}`);
}

export async function createDevis(payload: CreateDevisPayload): Promise<Devis> {
  return apiFetch<Devis>("/devis", { method: "POST", body: payload });
}

export async function updateDevis(id: string, payload: UpdateDevisPayload): Promise<Devis> {
  return apiFetch<Devis>(`/devis/${id}`, { method: "PATCH", body: payload });
}

export async function removeDevis(id: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/devis/${id}`, { method: "DELETE" });
}

export async function updateDevisStatut(id: string, statut: DevisStatut): Promise<Devis> {
  return apiFetch<Devis>(`/devis/${id}/statut`, { method: "PATCH", body: { statut } });
}

export async function convertirDevis(id: string): Promise<DevisConversion> {
  return apiFetch<DevisConversion>(`/devis/${id}/convertir`, { method: "POST" });
}