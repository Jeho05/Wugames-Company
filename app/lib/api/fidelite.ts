import { apiFetch } from "@/app/lib/api-client";
import type { Fidelite, FideliteMouvement } from "@/app/lib/contracts";

export async function getFidelite(): Promise<Fidelite> {
  return apiFetch<Fidelite>("/fidelite");
}

export async function getHistorique(): Promise<FideliteMouvement[]> {
  return apiFetch<FideliteMouvement[]>("/fidelite/historique");
}