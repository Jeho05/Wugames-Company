"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Icon } from "@/app/components/ui/app-icon";
import { StatusBadge } from "@/app/components/ui/status-badge";
import { CreateAccountForm } from "@/app/components/workspace/create-account-form";
import { EditAccountForm } from "@/app/components/workspace/edit-account-form";
import { useAuth } from "@/app/lib/auth-context";
import { listAuditLogs } from "@/app/lib/api/audit-logs";
import { listFiliales } from "@/app/lib/api/filiales";
import { listUsers } from "@/app/lib/api/users";
import type { AuditLog, Filiale, RoleCode, User } from "@/app/lib/contracts";

const adminRoles = new Set(["ROLE_GERANT", "ROLE_DEV_DIGITAL"]);

const roleLabels: Record<RoleCode, string> = {
  ROLE_CLIENT_STD: "Client standard",
  ROLE_CLIENT_MEMBRE: "Client membre",
  ROLE_OUVRIER: "Ouvrier",
  ROLE_RESP_OUVRIERS: "Resp. ouvriers",
  ROLE_FOURNISSEUR: "Fournisseur",
  ROLE_SECRETAIRE: "Secrétaire",
  ROLE_COMPTABLE: "Comptable",
  ROLE_MGR_OPS: "Manager Opérations",
  ROLE_MGR_PARTENAIRE: "Manager Partenariats",
  ROLE_MGR_FILIALE: "Manager Filiale",
  ROLE_DEV_DIGITAL: "Dev Digital",
  ROLE_GERANT: "Gérant",
};

const auditActionLabels: Record<AuditLog["action"], string> = {
  CREATE: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
};

const tabs = ["Comptes & rôles", "Audit & journaux", "Paramètres"] as const;
type TabType = (typeof tabs)[number];

interface AdminSettings {
  stockAlerts: boolean;
  gpsClocking: boolean;
  managerPerimeters: boolean;
  mobileMoneyPayments: boolean;
  realtimeSSE: boolean;
  autoBackups: boolean;
}

const DEFAULT_SETTINGS: AdminSettings = {
  stockAlerts: true,
  gpsClocking: true,
  managerPerimeters: true,
  mobileMoneyPayments: true,
  realtimeSSE: true,
  autoBackups: true,
};

function formatAuditDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function AdministrationContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const tabParam = searchParams.get("onglet");
    if (tabParam === "audit") return "Audit & journaux";
    if (tabParam === "parametres") return "Paramètres";
    return "Comptes & rôles";
  });

  const [toast, setToast] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [filiales, setFiliales] = useState<Filiale[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<User | null>(null);

  // Search and filters for accounts
  const [accountQuery, setAccountQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [filterFiliale, setFilterFiliale] = useState<string>("ALL");

  // Filter for audit logs
  const [auditActionFilter, setAuditActionFilter] = useState<string>("ALL");
  const [auditSearchQuery, setAuditSearchQuery] = useState("");

  // System settings
  const [settings, setSettings] = useState<AdminSettings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const saved = localStorage.getItem("wugams:admin:settings");
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Handle URL query params (e.g. ?creer=1 or ?onglet=audit)
  useEffect(() => {
    if (searchParams.get("creer") === "1") {
      setShowCreate(true);
    }
    const tab = searchParams.get("onglet");
    if (tab === "audit") setActiveTab("Audit & journaux");
    if (tab === "parametres") setActiveTab("Paramètres");
  }, [searchParams]);

  // Load users, filiales, and audit logs
  const refreshData = () => {
    if (!user || !adminRoles.has(user.role)) return;
    setLoading(true);
    Promise.allSettled([listUsers(), listFiliales(), listAuditLogs()]).then(
      ([usersRes, filialesRes, auditRes]) => {
        if (usersRes.status === "fulfilled") setUsers(usersRes.value);
        if (filialesRes.status === "fulfilled") setFiliales(filialesRes.value);
        if (auditRes.status === "fulfilled") setAuditLogs(auditRes.value);
        setLoading(false);
      },
    );
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  function handleToggleSetting(key: keyof AdminSettings) {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("wugams:admin:settings", JSON.stringify(updated));
      } catch {
        // ignore
      }
      setToast(`Paramètre "${key}" mis à jour.`);
      return updated;
    });
  }

  function handleExportAuditCSV() {
    if (!auditLogs.length) {
      setToast("Aucun journal d'audit à exporter.");
      return;
    }

    const headers = ["ID", "Date", "Action", "Table Cible", "Utilisateur", "Email", "IP", "Payload"];
    const rows = auditLogs.map((log) => {
      const userName = log.user
        ? [log.user.first_name, log.user.last_name].filter(Boolean).join(" ")
        : "Système";
      const userEmail = log.user?.email || "—";
      const payloadStr = log.details ? JSON.stringify(log.details).replace(/"/g, '""') : "";
      return [
        `"${log.id}"`,
        `"${log.created_at}"`,
        `"${log.action}"`,
        `"${log.table_cible}"`,
        `"${userName}"`,
        `"${userEmail}"`,
        `"${log.ip || ""}"`,
        `"${payloadStr}"`,
      ].join(";");
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `wugams_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToast("Journal d'audit exporté au format CSV avec succès.");
  }

  // Filtered accounts
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (filterRole !== "ALL" && u.role !== filterRole) return false;
      if (filterFiliale !== "ALL" && (u.filiale?.id !== filterFiliale && u.filiale_id !== filterFiliale)) return false;
      if (accountQuery.trim()) {
        const q = accountQuery.toLowerCase();
        const fullName = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
        const email = (u.email || "").toLowerCase();
        return fullName.includes(q) || email.includes(q);
      }
      return true;
    });
  }, [users, filterRole, filterFiliale, accountQuery]);

  // Filtered audit logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (auditActionFilter !== "ALL" && log.action !== auditActionFilter) return false;
      if (auditSearchQuery.trim()) {
        const q = auditSearchQuery.toLowerCase();
        const table = (log.table_cible || "").toLowerCase();
        const user = log.user ? `${log.user.first_name} ${log.user.last_name} ${log.user.email}`.toLowerCase() : "";
        return table.includes(q) || user.includes(q);
      }
      return true;
    });
  }, [auditLogs, auditActionFilter, auditSearchQuery]);

  if (!user) return null;

  if (!adminRoles.has(user.role)) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-[#d19331]">
            <Icon name="lock" size={24} />
          </span>
          <h1 className="mt-5 text-xl font-bold tracking-[-0.035em] text-[#17294b]">
            Accès restreint
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Le module Administration est réservé au Gérant et au Dev Digital.
            Votre rôle actuel ({user.role}) ne permet pas d&apos;y accéder.
          </p>
          <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
            Connectez-vous avec un compte Gérant ou Dev Digital pour accéder au module.
          </p>
        </div>
      </div>
    );
  }

  const actifs = users.filter((u) => u.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header with Flowdash style */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#0c1424] text-[#e3a641] shadow-md shadow-slate-900/10">
            <Icon name="shield" size={24} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">
                Administration Système
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                BR-11 En vigueur
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#0c1424] sm:text-3xl">
              Administration & Sécurité
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Gestion centralisée des comptes, attribution des rôles RBAC, traçabilité des opérations et paramètres de l&apos;ERP.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={refreshData}
            title="Rafraîchir les données"
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-[#0c1424]"
          >
            <Icon name="refresh" size={14} className={loading ? "animate-spin" : ""} />
            Actualiser
          </button>
          <button
            onClick={() => setShowCreate(true)}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#e3a641] to-[#d19331] px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition hover:opacity-95"
          >
            <Icon name="plus" size={15} />
            Créer un compte
          </button>
        </div>
      </section>

      {/* Toast Feedback */}
      {toast ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800 shadow-sm transition animate-in fade-in slide-in-from-top-2">
          <span className="flex items-center gap-2">
            <Icon name="check" size={16} />
            {toast}
          </span>
          <button
            aria-label="Fermer le message"
            className="rounded-md p-1 text-emerald-700 hover:bg-emerald-100"
            onClick={() => setToast("")}
            type="button"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      ) : null}

      {/* Quick KPI stats in Flowdash cards */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Comptes enregistrés",
            value: String(users.length),
            icon: "users" as const,
            trend: `${actifs} actifs`,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Utilisateurs Actifs",
            value: String(actifs),
            icon: "user-check" as const,
            trend: `${users.length ? Math.round((actifs / users.length) * 100) : 100}% du parc`,
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            label: "Rôles Actifs",
            value: String(new Set(users.map((u) => u.role)).size),
            icon: "shield" as const,
            trend: "Sur 12 profils RBAC",
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "Journaux d'Audit",
            value: String(auditLogs.length),
            icon: "clipboard" as const,
            trend: "BR-11 Traçabilité",
            color: "text-indigo-600 bg-indigo-50",
          },
        ].map((stat) => (
          <article
            key={stat.label}
            className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm"
          >
            <div>
              <p className="text-[11px] font-semibold text-slate-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-black tracking-tight text-[#0c1424]">
                {stat.value}
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-slate-400">{stat.trend}</p>
            </div>
            <span className={`grid size-11 place-items-center rounded-xl ${stat.color}`}>
              <Icon name={stat.icon} size={20} />
            </span>
          </article>
        ))}
      </section>

      {/* Flowdash Tabbed Card */}
      <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 bg-slate-50/50 px-5 py-3">
          <div className="flex items-center gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab}
                aria-pressed={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                type="button"
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  activeTab === tab
                    ? "bg-[#0c1424] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                }`}
              >
                {tab === "Comptes & rôles" && <Icon name="users" size={14} />}
                {tab === "Audit & journaux" && <Icon name="clipboard" size={14} />}
                {tab === "Paramètres" && <Icon name="settings" size={14} />}
                {tab}
                {tab === "Comptes & rôles" && (
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${activeTab === tab ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                    {users.length}
                  </span>
                )}
                {tab === "Audit & journaux" && (
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${activeTab === tab ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                    {auditLogs.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Synchronisation API directe
          </div>
        </div>

        {/* TAB 1: COMPTES & RÔLES */}
        {activeTab === "Comptes & rôles" ? (
          <div>
            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white p-4">
              <div className="flex flex-1 items-center gap-2 min-w-[240px] max-w-md rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5">
                <Icon name="search" size={14} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, prénom ou email..."
                  value={accountQuery}
                  onChange={(e) => setAccountQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                {accountQuery ? (
                  <button onClick={() => setAccountQuery("")} className="text-slate-400 hover:text-slate-600">
                    <Icon name="close" size={12} />
                  </button>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm focus:outline-none"
                >
                  <option value="ALL">Tous les rôles ({users.length})</option>
                  {Object.entries(roleLabels).map(([code, label]) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>

                <select
                  value={filterFiliale}
                  onChange={(e) => setFilterFiliale(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm focus:outline-none"
                >
                  <option value="ALL">Toutes les filiales</option>
                  {filiales.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nom} ({f.code})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setShowCreate(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0c1424] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#1a2b4a]"
                >
                  <Icon name="plus" size={13} />
                  Nouveau
                </button>
              </div>
            </div>

            {/* Accounts Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3 sm:px-6">Utilisateur</th>
                    <th className="px-5 py-3">Rôle & Permissions</th>
                    <th className="px-5 py-3">Filiale de rattachement</th>
                    <th className="px-5 py-3">Téléphone</th>
                    <th className="px-5 py-3">Statut</th>
                    <th className="w-16 px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-xs text-slate-400">
                        Aucun compte trouvé correspondant aux critères.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((account) => {
                      const name =
                        [account.first_name, account.last_name].filter(Boolean).join(" ") ||
                        account.email;
                      const initials =
                        name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase() || "U";

                      return (
                        <tr
                          key={account.id}
                          onClick={() => setSelectedAccount(account)}
                          className="group cursor-pointer transition hover:bg-amber-50/40"
                        >
                          <td className="px-5 py-3.5 sm:px-6">
                            <div className="flex items-center gap-3">
                              <span className="grid size-9 place-items-center rounded-xl bg-[#0c1424] text-[11px] font-black text-[#e3a641] shadow-sm">
                                {initials}
                              </span>
                              <div>
                                <p className="text-xs font-bold text-slate-900 group-hover:text-[#0c1424]">
                                  {name}
                                </p>
                                <p className="text-[11px] text-slate-400">{account.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                              {roleLabels[account.role] ?? account.role}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs font-medium text-slate-600">
                            {account.filiale ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700">
                                <span className="size-1.5 rounded-full bg-blue-500" />
                                {account.filiale.nom}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-500">
                            {account.phone || "—"}
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge tone={account.is_active ? "success" : "neutral"}>
                              {account.is_active ? "Actif" : "Désactivé"}
                            </StatusBadge>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAccount(account);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-amber-400 hover:text-amber-700"
                              title="Modifier ce compte"
                            >
                              <Icon name="pencil" size={12} />
                              Modifier
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer info */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 sm:px-6">
              <span>
                Affichage de <strong>{filteredUsers.length}</strong> sur <strong>{users.length}</strong> utilisateurs
              </span>
              <button
                onClick={() => setShowCreate(true)}
                className="font-bold text-[#d19331] hover:underline"
              >
                + Ajouter un nouvel utilisateur
              </button>
            </div>
          </div>
        ) : null}

        {/* TAB 2: AUDIT & JOURNAUX */}
        {activeTab === "Audit & journaux" ? (
          <div>
            {/* Audit Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white p-4">
              <div className="flex flex-1 items-center gap-2 min-w-[220px] max-w-md rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5">
                <Icon name="search" size={14} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par table, utilisateur..."
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm focus:outline-none"
                >
                  <option value="ALL">Toutes les actions</option>
                  <option value="CREATE">Créations (CREATE)</option>
                  <option value="UPDATE">Modifications (UPDATE)</option>
                  <option value="DELETE">Suppressions (DELETE)</option>
                </select>

                <button
                  onClick={handleExportAuditCSV}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <Icon name="download" size={13} />
                  Exporter CSV
                </button>
              </div>
            </div>

            {/* Audit Logs List */}
            <div className="divide-y divide-slate-100">
              {filteredAuditLogs.length === 0 ? (
                <p className="px-6 py-12 text-center text-xs text-slate-400">
                  Aucune entrée de journal trouvée.
                </p>
              ) : (
                filteredAuditLogs.map((entry) => {
                  const who = entry.user
                    ? [entry.user.first_name, entry.user.last_name].filter(Boolean).join(" ") || entry.user.email
                    : "Système automatique";
                  const detail = entry.ip ? `IP: ${entry.ip}` : "Opération interne";

                  const actionTone =
                    entry.action === "DELETE"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : entry.action === "CREATE"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-blue-50 text-blue-700 border-blue-200";

                  return (
                    <div
                      key={entry.id}
                      className="flex items-start justify-between gap-4 px-5 py-3.5 transition hover:bg-slate-50 sm:px-6"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border text-xs font-bold ${actionTone}`}
                        >
                          <Icon
                            name={
                              entry.action === "DELETE"
                                ? "trash"
                                : entry.action === "CREATE"
                                ? "plus"
                                : "clipboard"
                            }
                            size={14}
                          />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {auditActionLabels[entry.action]} sur la table{" "}
                              <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-slate-800">
                                {entry.table_cible}
                              </code>
                            </span>
                            <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-500">
                              ID: {entry.id.slice(0, 8)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            Par <strong className="text-slate-700">{who}</strong> · {detail}
                          </p>
                          {entry.details && Object.keys(entry.details).length > 0 && (
                            <pre className="mt-1.5 max-h-20 max-w-xl overflow-x-auto rounded-lg bg-slate-50 p-2 font-mono text-[10px] text-slate-600">
                              {JSON.stringify(entry.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                      <p className="shrink-0 text-[11px] font-semibold text-slate-400">
                        {formatAuditDate(entry.created_at)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : null}

        {/* TAB 3: PARAMÈTRES */}
        {activeTab === "Paramètres" ? (
          <div className="p-5 sm:p-6 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Règles de Gestion Opérationnelles & Sécurité
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Configurez les contraintes métier du système WUGAMS Holding. Les réglages sont persistés.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  id: "stockAlerts" as const,
                  title: "Seuils de stock critiques (BR-03 / BR-04)",
                  desc: "Déclenche automatiquement les alertes urgentes dès qu'un article passe sous 20 % du stock d'alerte configuré.",
                  icon: "boxes" as const,
                  badge: "BR-03",
                },
                {
                  id: "gpsClocking" as const,
                  title: "Pointage géolocalisé strict (BR-12)",
                  desc: "Exige les coordonnées GPS et rejette les pointages ouvriers à plus de 50 mètres de la filiale.",
                  icon: "map" as const,
                  badge: "BR-12",
                },
                {
                  id: "managerPerimeters" as const,
                  title: "Périmètre de filiale strict (RBAC)",
                  desc: "Restreint automatiquement la vue des managers aux données (missions, stock, factures) de leur filiale attitrée.",
                  icon: "users" as const,
                  badge: "RBAC",
                },
                {
                  id: "mobileMoneyPayments" as const,
                  title: "Passerelle Mobile Money (BR-13)",
                  desc: "Active le paiement instantané MTN Mobile Money et Moov Money pour les acomptes devis et factures boutique.",
                  icon: "shopping-bag" as const,
                  badge: "BR-13",
                },
                {
                  id: "realtimeSSE" as const,
                  title: "Flux temps réel SSE (Server-Sent Events)",
                  desc: "Diffuse les notifications de pointage, missions et alertes de stock en continu sans rechargement de page.",
                  icon: "refresh" as const,
                  badge: "STREAM",
                },
                {
                  id: "autoBackups" as const,
                  title: "Sauvegardes automatiques et intégrité",
                  desc: "Active l'archivage quotidien de l'audit log et des transactions de consolidation financière.",
                  icon: "shield" as const,
                  badge: "BACKUP",
                },
              ].map((setting) => {
                const isEnabled = settings[setting.id];
                return (
                  <div
                    key={setting.id}
                    className={`flex items-start justify-between gap-4 rounded-xl border p-4 transition ${
                      isEnabled ? "border-amber-200/80 bg-amber-50/20" : "border-slate-200 bg-slate-50/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-xl shadow-sm ${
                          isEnabled ? "bg-[#0c1424] text-[#e3a641]" : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        <Icon name={setting.icon} size={18} />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">{setting.title}</p>
                          <span className="rounded bg-slate-100 px-1 py-0.2 text-[9px] font-bold text-slate-600">
                            {setting.badge}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{setting.desc}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={isEnabled}
                      onClick={() => handleToggleSetting(setting.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEnabled ? "bg-[#e3a641]" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </article>

      {/* MODAL: CREATE ACCOUNT */}
      {showCreate ? (
        <CreateAccountForm
          onClose={() => setShowCreate(false)}
          onCreated={(account) => {
            const name = [account.first_name, account.last_name].filter(Boolean).join(" ") || account.email;
            setUsers((current) => [account, ...current]);
            setShowCreate(false);
            setToast(`Compte ${name} créé avec succès.`);
          }}
        />
      ) : null}

      {/* MODAL: EDIT ACCOUNT */}
      {selectedAccount ? (
        <EditAccountForm
          account={selectedAccount}
          filiales={filiales}
          onClose={() => setSelectedAccount(null)}
          onUpdated={(updated) => {
            setUsers((current) =>
              current.map((u) => (u.id === updated.id ? updated : u)),
            );
            setSelectedAccount(null);
            setToast(`Compte ${updated.first_name} ${updated.last_name} mis à jour.`);
          }}
          onDeleted={(deletedId) => {
            setUsers((current) => current.filter((u) => u.id !== deletedId));
            setSelectedAccount(null);
            setToast("Compte supprimé avec succès.");
          }}
        />
      ) : null}
    </div>
  );
}

export default function AdministrationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Chargement de l&apos;administration...</div>}>
      <AdministrationContent />
    </Suspense>
  );
}
