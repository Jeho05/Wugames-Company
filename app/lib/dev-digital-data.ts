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
  source: "api" | "demo";
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
/* Données de repli — journal d'audit réaliste (mode démo)             */
/* ------------------------------------------------------------------ */

type DemoSeed = [number, string, string, string, string, string, string, unknown];

function iso(daysAgo: number, hours: number, minutes: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

const demoSeed: DemoSeed[] = [
  // [jours, action, table, user, entite, detail, ip, valeur_apres]
  [0, "CREATE", "mouvements_stock", "Admin Test", "8c8e2f1a", "SORTIE_VENTE · 5", "41.139.210.12", { produit_id: "8c8e2f1a-b34f-4c21-a80e-3d1c2e9a4f11", type: "SORTIE_VENTE", quantite: 5, motif: "Vente comptoir" }],
  [0, "UPDATE", "factures", "Admin Test", "92aa4cfe", "Statut → EMISE", "41.139.210.12", { numero: "FAC-2026-0142", mission_id: "m-8421", statut: "EMISE", exercice_comptable: 2026 }],
  [0, "CREATE", "mouvements_stock", "Awa Koné", "5f1b9c72", "ENTREE_ACHAT · 40", "197.220.14.58", { produit_id: "5f1b9c72-d0c3-4e6a-9b14-6a2f8e01c77b", type: "ENTREE_ACHAT", quantite: 40, motif: "Réception fournisseur" }],
  [0, "DELETE", "mouvements_stock", "Admin Test", "1aa34d08", "Annulation · ligne 2", "41.139.210.12", { produit_id: "1aa34d08-9c44-4b12-8f03-7b5d2a0c4e66", type: "SORTIE_VENTE", quantite: 1, motif: "Annulé par le client" }],
  [0, "UPDATE", "mouvements_stock", "Awa Koné", "c04e9d1b", "Quantité 5 → 8", "197.220.14.58", { produit_id: "c04e9d1b-77aa-4d1e-bc44-9e81f3a62d90", type: "SORTIE_VENTE", quantite: 8, motif: "Complément commande" }],
  [0, "CREATE", "missions", "Moussa Diaby", "71d3b0e5", "MISSION 025", "154.126.80.11", { titre: "Nettoyage bureau Plateau", statut: "PLANIFIE", rayon_tolerance_metres: 300 }],
  [1, "CREATE", "mouvements_stock", "Admin Test", "2e7c5a91", "ENTREE_ACHAT · 120", "41.139.210.12", { produit_id: "2e7c5a91-b38d-4f0a-9c2e-8d44b6f0a122", type: "ENTREE_ACHAT", quantite: 120, motif: "Réapprovisionnement ciment" }],
  [1, "UPDATE", "factures", "Awa Koné", "0f3d8b26", "Statut → PAYEE", "197.220.14.58", { numero: "FAC-2026-0138", mission_id: "m-8377", statut: "PAYEE", exercice_comptable: 2026 }],
  [1, "CREATE", "mouvements_stock", "Admin Test", "8a12f0c4", "SORTIE_VENTE · 12", "41.139.210.12", { produit_id: "8a12f0c4-4e92-4b6a-a1c7-5f3b0d8e21aa", type: "SORTIE_VENTE", quantite: 12, motif: "Vente boutique" }],
  [1, "UPDATE", "produits", "Admin Test", "b6d8e31c", "Prix unitaire révisé", "41.139.210.12", { nom: "Peinture blanche 10L", prix_unitaire: 24500, stock_minimum: 10 }],
  [1, "DELETE", "mouvements_stock", "Awa Koné", "4d5a91c7", "Ligne corrigée", "197.220.14.58", { produit_id: "4d5a91c7-8f2e-4c0a-b3d1-6e9a70c2f55b", type: "ENTREE_ACHAT", quantite: 3, motif: "Saisie erronée" }],
  [2, "CREATE", "mouvements_stock", "Admin Test", "9c3e6f2d", "SORTIE_CHANTIER · 25", "41.139.210.12", { produit_id: "9c3e6f2d-12ab-4cde-89f0-4a1b2c3d4e5f", type: "SORTIE_CHANTIER", quantite: 25, motif: "Mission 024 — Chantier A" }],
  [2, "UPDATE", "missions", "Moussa Diaby", "a5d7b1e9", "Statut → EN_COURS", "154.126.80.11", { titre: "Rénovation villa Koné", statut: "EN_COURS", rayon_tolerance_metres: 250 }],
  [2, "CREATE", "factures", "Admin Test", "3c8f4d2a", "FAC-2026-0146", "41.139.210.12", { numero: "FAC-2026-0146", mission_id: "m-8455", statut: "BROUILLON", exercice_comptable: 2026 }],
  [2, "UPDATE", "mouvements_stock", "Awa Koné", "e2b9a7c1", "Motif complété", "197.220.14.58", { produit_id: "e2b9a7c1-88d4-4b0e-9f2a-c3d5e6f7a890", type: "SORTIE_VENTE", quantite: 4, motif: "Vente — client régulier" }],
  [2, "CREATE", "mouvements_stock", "Admin Test", "7f1e5c93", "ENTREE_ACHAT · 60", "41.139.210.12", { produit_id: "7f1e5c93-b0a4-4e6d-9c2b-1a8f5d3e70c4", type: "ENTREE_ACHAT", quantite: 60, motif: "Livraison quincaillerie" }],
  [3, "CREATE", "mouvements_stock", "Awa Koné", "2b9d7f4e", "SORTIE_VENTE · 3", "197.220.14.58", { produit_id: "2b9d7f4e-c1a3-4f8b-9e2d-0a4b5c6d7e8f", type: "SORTIE_VENTE", quantite: 3, motif: "Vente comptoir" }],
  [3, "UPDATE", "factures", "Admin Test", "6c2a8e1d", "Statut → EN_RETARD", "41.139.210.12", { numero: "FAC-2026-0119", mission_id: "m-8204", statut: "EN_RETARD", exercice_comptable: 2026 }],
  [3, "CREATE", "mouvements_stock", "Admin Test", "d8e4b2f0", "SORTIE_CHANTIER · 18", "41.139.210.12", { produit_id: "d8e4b2f0-9c6a-4b3e-8f1d-7a2c4e6f8b90", type: "SORTIE_CHANTIER", quantite: 18, motif: "Mission 021 — Villa Koné" }],
  [3, "UPDATE", "produits", "Awa Koné", "1c7f9d4b", "Référence corrigée", "197.220.14.58", { nom: "Carrelage 60x60", reference: "CRL-60-004", stock_minimum: 20 }],
  [4, "CREATE", "mouvements_stock", "Admin Test", "5e1a3c8d", "ENTREE_ACHAT · 200", "41.139.210.12", { produit_id: "5e1a3c8d-2b7f-4d0e-9a3c-6f8b1d2e4a50", type: "ENTREE_ACHAT", quantite: 200, motif: "Réception ciment 42.5" }],
  [4, "CREATE", "factures", "Admin Test", "0a8f6c2e", "FAC-2026-0131", "41.139.210.12", { numero: "FAC-2026-0131", mission_id: "m-8312", statut: "EMISE", exercice_comptable: 2026 }],
  [4, "DELETE", "mouvements_stock", "Awa Koné", "9b4d2f7a", "Annulation ligne", "197.220.14.58", { produit_id: "9b4d2f7a-4e8c-4a1f-b3d5-2c6e8f0a1b2c", type: "SORTIE_VENTE", quantite: 2, motif: "Retour client" }],
  [4, "UPDATE", "mouvements_stock", "Admin Test", "3a7e1b9c", "Quantité 40 → 44", "41.139.210.12", { produit_id: "3a7e1b9c-6d4a-4e2f-9b8c-1f3a5d7e9b02", type: "ENTREE_ACHAT", quantite: 44, motif: "Complément livraison" }],
  [4, "CREATE", "missions", "Moussa Diaby", "8f2c5a1e", "MISSION 018", "154.126.80.11", { titre: "Dépannage bureaux N'Dri", statut: "ACCEPTE", rayon_tolerance_metres: 80 }],
  [5, "CREATE", "mouvements_stock", "Awa Koné", "c6a1e8d3", "SORTIE_VENTE · 7", "197.220.14.58", { produit_id: "c6a1e8d3-f9b2-4c0e-8a1d-3b5e7f9a2c40", type: "SORTIE_VENTE", quantite: 7, motif: "Vente comptoir" }],
  [5, "UPDATE", "factures", "Admin Test", "4e9b7f2c", "Statut → PAYEE", "41.139.210.12", { numero: "FAC-2026-0122", mission_id: "m-8249", statut: "PAYEE", exercice_comptable: 2026 }],
  [5, "CREATE", "mouvements_stock", "Admin Test", "1d6a8c4f", "SORTIE_CHANTIER · 30", "41.139.210.12", { produit_id: "1d6a8c4f-5b2e-4c9a-8f3d-0a1c2e4f6b80", type: "SORTIE_CHANTIER", quantite: 30, motif: "Mission 019 — Résidence Aya" }],
  [5, "UPDATE", "produits", "Awa Koné", "7b3d9e1a", "Seuil stock modifié", "197.220.14.58", { nom: "Fer à béton 12mm", prix_unitaire: 9850, stock_minimum: 15 }],
  [6, "CREATE", "mouvements_stock", "Admin Test", "2f8c4a6d", "ENTREE_ACHAT · 90", "41.139.210.12", { produit_id: "2f8c4a6d-7e1b-4a3f-9c5d-8b2a4e6f0c90", type: "ENTREE_ACHAT", quantite: 90, motif: "Réception fer à béton" }],
  [6, "UPDATE", "mouvements_stock", "Awa Koné", "5a9d3c7f", "Motif corrigé", "197.220.14.58", { produit_id: "5a9d3c7f-c4b8-4e2a-9f1c-6d0e2f4a8b3c", type: "SORTIE_VENTE", quantite: 6, motif: "Vente — détail" }],
  [6, "CREATE", "factures", "Admin Test", "8e4a1c6b", "FAC-2026-0108", "41.139.210.12", { numero: "FAC-2026-0108", mission_id: "m-8170", statut: "EMISE", exercice_comptable: 2026 }],
  [6, "DELETE", "mouvements_stock", "Admin Test", "0d7b2f5e", "Saisie erronée", "41.139.210.12", { produit_id: "0d7b2f5e-3c6a-4e9d-b2f1-8a4c6e8f0b2d", type: "ENTREE_ACHAT", quantite: 1, motif: "Double saisie" }],
];

const demoLogs: AuditLog[] = demoSeed.map(([daysAgo, action, table, userName, entity, , ip, valeur], index) => ({
  id: `demo-audit-${index + 1}`,
  user_id: userName === "Admin Test" ? "u-admin" : userName === "Awa Koné" ? "u-awa" : "u-moussa",
  action: action as AuditLog["action"],
  table_cible: table,
  entite_id: entity,
  valeur_avant: null,
  valeur_apres: valeur,
  ip,
  created_at: iso(daysAgo, 8 + (index % 9), (index * 7) % 60),
  user: {
    id: userName === "Admin Test" ? "u-admin" : userName === "Awa Koné" ? "u-awa" : "u-moussa",
    first_name: userName.split(" ")[0],
    last_name: userName.split(" ")[1] ?? "",
    email: `${userName.toLowerCase().replace(" ", ".")}@wugams.ci`,
  },
}));

const demoNotifications: Notification[] = [
  { id: "n1", lu: false, type: "audit", titre: "Nouvel événement d'audit", message: "CREATE sur mouvements_stock — vérification rapide souhaitée.", created_at: iso(0, 9, 2) },
  { id: "n2", lu: false, type: "audit", titre: "Suppression enregistrée", message: "DELETE sur mouvements_stock par Awa Koné.", created_at: iso(0, 8, 31) },
  { id: "n3", lu: true, type: "systeme", titre: "API santé vérifiée", message: "Le point de contrôle /health répond normalement.", created_at: iso(1, 18, 30) },
  { id: "n4", lu: true, type: "audit", titre: "Facture mise à jour", message: "UPDATE sur factures — statut PAYEE.", created_at: iso(1, 9, 12) },
];

/* ------------------------------------------------------------------ */
/* Chargement — best-effort : API, repli démo si indisponible          */
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
  let source: "api" | "demo" = "api";

  if (logsResult.status === "fulfilled") {
    logs = logsResult.value;
    source = "api";
  } else {
    const cause = logsResult.reason;
    if (cause instanceof ApiError && [401, 403, 429].includes(cause.statusCode)) {
      auditError = { status: cause.statusCode, message: cause.message };
      logs = [];
    } else {
      logs = demoLogs;
      source = "demo";
    }
  }

  const notifications =
    notificationsResult.status === "fulfilled" ? notificationsResult.value : notificationsResult.status === "rejected" ? demoNotifications : [];
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