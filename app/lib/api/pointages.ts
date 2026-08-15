import { apiFetch } from "@/app/lib/api-client";
import type { PointageHistorique } from "@/app/lib/contracts";

export type PointageFilters = {
  periode?: string;
  filiale_id?: string;
};

export async function listPointages(filters: PointageFilters = {}): Promise<PointageHistorique[]> {
  return apiFetch<PointageHistorique[]>("/pointages", { query: filters });
}