import { apiFetch } from "@/app/lib/api-client";
import type { AuditLog } from "@/app/lib/contracts";

export async function listAuditLogs(filters: { table_cible?: string; entite_id?: string } = {}): Promise<
  AuditLog[]
> {
  return apiFetch<AuditLog[]>("/audit-logs", { query: filters });
}
