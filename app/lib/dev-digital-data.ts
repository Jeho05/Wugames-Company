import * as auditApi from "@/app/lib/api/audit-logs";
import { getHealth } from "@/app/lib/api/health";
import * as notificationsApi from "@/app/lib/api/notifications";
import { ApiError } from "@/app/lib/api-client";
import type { AuditLog, Notification } from "@/app/lib/contracts";

export type { AuditLog, Notification } from "@/app/lib/contracts";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type AuditFilters = {
  table?: string | null;
  action?: string | null;
  user?: string | null;
  entity?: string | null;
};

export type HealthStatus = {
  statut: string;
  database?: string;
  timestamp?: string;
  checkedAt: number;
};

export type DevDigitalOverview = {
  source: "api";
  loadedAt: number;
  firstName: string | null;
  logs: AuditLog[];
  notifications: Notification[];
  unread: number;
  health: HealthStatus | null;
  auditError: { status: number; message: string } | null;
};

export type AuditActor = {
  id: string;
  name: string;
  initials: string;
  email: string | null;
  count: number;
};

/* ------------------------------------------------------------------ */
/* Utilitaires d'affichage (front uniquement)                          */
/* ------------------------------------------------------------------ */

export function initialsOfName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function shortId(id: string | null | undefined, prefix = 4, suffix = 3): string {
  if (!id) return "—";
  if (id.length <= prefix + suffix + 1) return id;
  return `${id.slice(0, prefix)}…${id.slice(-suffix)}`;
}

export function fullTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "medium" }).format(date);
}

export function clockTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(date);
}

const TABLE_LABELS: Record<string, string> = {
  mouvements_stock: "Stock movement records",
  factures: "Invoice records",
  produits: "Product records",
  missions: "Mission records",
  clients: "Client records",
  users: "User records",
};

export function humanTableLabel(table: string): string {
  return TABLE_LABELS[table] ?? `${table.replace(/_/g, " ")} records`;
}

/* ------------------------------------------------------------------ */
/* Agrégations — calculées uniquement depuis les logs chargés          */
/* ------------------------------------------------------------------ */

export function aggregateTables(logs: AuditLog[]): { table: string; count: number; hex: string }[] {
  const counts = new Map<string, number>();
  for (const log of logs) {
    counts.set(log.table_cible, (counts.get(log.table_cible) ?? 0) + 1);
  }
  const palette = ["#5cc8ff", "#a78bfa", "#e3a641", "#3ddc97", "#f58ea8", "#7dd3fc"];
  return [...counts.entries()]
    .map(([table, count], index) => ({ table, count, hex: palette[index % palette.length] }))
    .sort((a, b) => b.count - a.count);
}

export function aggregateActions(logs: AuditLog[]): { action: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const log of logs) {
    counts.set(log.action, (counts.get(log.action) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count);
}

export function aggregateActors(logs: AuditLog[]): AuditActor[] {
  const byUser = new Map<string, { id: string; name: string; email: string | null; count: number }>();
  for (const log of logs) {
    const id = log.user_id ?? "anonymous";
    const name = log.user ? `${log.user.first_name} ${log.user.last_name}`.trim() : "Acteur inconnu";
    const email = log.user?.email ?? null;
    const entry = byUser.get(id) ?? { id, name, email, count: 0 };
    entry.count += 1;
    byUser.set(id, entry);
  }
  return [...byUser.values()]
    .map((entry) => ({ ...entry, initials: initialsOfName(entry.name) }))
    .sort((a, b) => b.count - a.count);
}

/** Activité par jour glissant (7 derniers jours). Note : basé sur les logs chargés. */
export function aggregateByDay(logs: AuditLog[]): { label: string; count: number; day: number }[] {
  const days: { label: string; count: number; day: number }[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    date.setHours(0, 0, 0, 0);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    const label = new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(date).replace(".", "").toUpperCase();
    const count = logs.filter((log) => {
      const created = new Date(log.created_at).getTime();
      return created >= date.getTime() && created < next.getTime();
    }).length;
    days.push({ label, count, day: date.getDay() });
  }
  return days;
}

/* ------------------------------------------------------------------ */
/* Chargement — API directe, pas de repli démo                         */
/* ------------------------------------------------------------------ */

export async function loadDevDigitalOverview(firstName?: string | null): Promise<DevDigitalOverview> {
  const [logsResult, notificationsResult, unreadResult, healthResult] = await Promise.allSettled([
    auditApi.listAuditLogs(),
    notificationsApi.listNotifications(),
    notificationsApi.unreadCount(),
    getHealth(),
  ]);

  let logs: AuditLog[] = [];
  let auditError: DevDigitalOverview["auditError"] = null;
  const source: "api" = "api";

  if (logsResult.status === "fulfilled") {
    logs = logsResult.value;
  } else {
    const cause = logsResult.reason;
    if (cause instanceof ApiError && [401, 403, 429].includes(cause.statusCode)) {
      auditError = { status: cause.statusCode, message: cause.message };
    }
  }

  const notifications =
    notificationsResult.status === "fulfilled" ? notificationsResult.value : [];
  const unread = unreadResult.status === "fulfilled" ? unreadResult.value : notifications.filter((notification) => !notification.lu).length;

  const health: HealthStatus | null =
    healthResult.status === "fulfilled" ? { ...healthResult.value, checkedAt: Date.now() } : null;

  return {
    source,
    loadedAt: Date.now(),
    firstName: firstName ?? null,
    logs,
    notifications,
    unread,
    health,
    auditError,
  };
}