import { apiFetch } from "@/app/lib/api-client";
import type { Filiale, FilialeConsolidation, MessageResponse } from "@/app/lib/contracts";

export async function listFiliales(): Promise<Filiale[]> {
  return apiFetch<Filiale[]>("/filiales");
}

export async function getFiliale(id: string): Promise<Filiale> {
  return apiFetch<Filiale>(`/filiales/${id}`);
}

export async function createFiliale(payload: {
  nom: string;
  code: string;
  description?: string;
  is_active?: boolean;
}): Promise<Filiale> {
  return apiFetch<Filiale>("/filiales", { method: "POST", body: payload });
}

export async function updateFiliale(
  id: string,
  payload: Partial<{ nom: string; code: string; description?: string; is_active?: boolean }>,
): Promise<Filiale> {
  return apiFetch<Filiale>(`/filiales/${id}`, { method: "PATCH", body: payload });
}

export async function removeFiliale(id: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/filiales/${id}`, { method: "DELETE" });
}

export async function getFilialesConsolidation(): Promise<FilialeConsolidation> {
  return apiFetch<FilialeConsolidation>("/filiales/consolidation");
}
