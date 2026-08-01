import { apiFetch } from "@/app/lib/api-client";
import type { ClientProfile, CreateClientPayload, MessageResponse } from "@/app/lib/contracts";

export async function listClients(): Promise<ClientProfile[]> {
  return apiFetch<ClientProfile[]>("/clients");
}

export async function getClient(id: string): Promise<ClientProfile> {
  return apiFetch<ClientProfile>(`/clients/${id}`);
}

export async function createClient(
  payload: CreateClientPayload,
): Promise<{ user: unknown; client_profile: ClientProfile }> {
  return apiFetch("/clients", { method: "POST", body: payload });
}

export type UpdateClientPayload = Partial<
  Omit<CreateClientPayload, "password">
>;

export async function updateClient(id: string, payload: UpdateClientPayload): Promise<ClientProfile> {
  return apiFetch<ClientProfile>(`/clients/${id}`, { method: "PATCH", body: payload });
}

export async function removeClient(id: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/clients/${id}`, { method: "DELETE" });
}
