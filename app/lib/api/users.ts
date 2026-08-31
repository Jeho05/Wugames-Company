import { apiFetch } from "@/app/lib/api-client";
import type { MessageResponse, RoleCode, User } from "@/app/lib/contracts";

export async function listUsers(): Promise<User[]> {
  return apiFetch<User[]>("/users");
}

export async function getUser(id: string): Promise<User> {
  return apiFetch<User>(`/users/${id}`);
}

export type CreateUserPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: RoleCode;
  filiale_id?: string | null;
  is_active?: boolean;
  localisation?: string;
  adresse?: string;
  ville?: string;
  latitude?: number;
  longitude?: number;
};

export async function createUser(payload: CreateUserPayload): Promise<User> {
  return apiFetch<User>("/users", { method: "POST", body: payload });
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, "password">> & { password?: string };

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
  return apiFetch<User>(`/users/${id}`, { method: "PATCH", body: payload });
}

export async function removeUser(id: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/users/${id}`, { method: "DELETE" });
}
