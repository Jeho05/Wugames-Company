import { apiFetchPublic } from "@/app/lib/api-client";

export type HealthResponse = {
  statut: string;
  database?: string;
  timestamp?: string;
  [key: string]: unknown;
};

export async function getHealth(): Promise<HealthResponse> {
  return apiFetchPublic<HealthResponse>("/health");
}
