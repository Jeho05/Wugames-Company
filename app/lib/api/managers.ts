import { apiFetch } from "@/app/lib/api-client";
import type { Manager } from "@/app/lib/contracts";

export async function listManagers(): Promise<Manager[]> {
  return apiFetch<Manager[]>("/managers");
}