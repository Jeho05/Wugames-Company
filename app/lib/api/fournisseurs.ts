import { apiFetch } from "@/app/lib/api-client";
import type { CreateFournisseurPayload, FournisseurProfile, MessageResponse } from "@/app/lib/contracts";

export async function listFournisseurs(): Promise<FournisseurProfile[]> {
  return apiFetch<FournisseurProfile[]>("/fournisseurs");
}

export async function getFournisseur(id: string): Promise<FournisseurProfile> {
  return apiFetch<FournisseurProfile>(`/fournisseurs/${id}`);
}

export async function createFournisseur(
  payload: CreateFournisseurPayload,
): Promise<{ user: unknown; fournisseur_profile: FournisseurProfile }> {
  return apiFetch("/fournisseurs", { method: "POST", body: payload });
}

export type UpdateFournisseurPayload = Partial<
  Omit<CreateFournisseurPayload, "password">
>;

export async function updateFournisseur(
  id: string,
  payload: UpdateFournisseurPayload,
): Promise<FournisseurProfile> {
  return apiFetch<FournisseurProfile>(`/fournisseurs/${id}`, { method: "PATCH", body: payload });
}

export async function removeFournisseur(id: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/fournisseurs/${id}`, { method: "DELETE" });
}
