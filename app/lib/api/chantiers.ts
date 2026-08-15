import { apiFetch } from "@/app/lib/api-client";
import type {
  Chantier,
  CreateChantierPayload,
  MessageResponse,
  UpdateChantierPayload,
} from "@/app/lib/contracts";

export type ChantierFilters = {
  filiale_id?: string;
  statut?: string;
};

export async function listChantiers(filters: ChantierFilters = {}): Promise<Chantier[]> {
  return apiFetch<Chantier[]>("/chantiers", { query: filters });
}

export async function getChantier(id: string): Promise<Chantier> {
  return apiFetch<Chantier>(`/chantiers/${id}`);
}

export async function createChantier(payload: CreateChantierPayload): Promise<Chantier> {
  return apiFetch<Chantier>("/chantiers", { method: "POST", body: payload });
}

export async function updateChantier(id: string, payload: UpdateChantierPayload): Promise<Chantier> {
  return apiFetch<Chantier>(`/chantiers/${id}`, { method: "PATCH", body: payload });
}

export async function removeChantier(id: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/chantiers/${id}`, { method: "DELETE" });
}