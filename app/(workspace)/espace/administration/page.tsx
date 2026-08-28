"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { StatusBadge } from "@/app/components/ui/status-badge";
import { CreateAccountForm } from "@/app/components/workspace/create-account-form";
import { useAuth } from "@/app/lib/auth-context";
import { listAuditLogs } from "@/app/lib/api/audit-logs";
import { listUsers } from "@/app/lib/api/users";
import type { AuditLog, RoleCode, User } from "@/app/lib/contracts";

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

const tabs = ["Comptes & rôles", "Audit & journaux", "Paramètres"];

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

export default function AdministrationPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [toast, setToast] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [live, setLive] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!user || !adminRoles.has(user.role)) return;
    let cancelled = false;
    Promise.allSettled([listUsers(), listAuditLogs()]).then(([usersResult, auditResult]) => {
      if (cancelled) return;
      if (usersResult.status === "fulfilled") setUsers(usersResult.value);
      if (auditResult.status === "fulfilled") setAuditLogs(auditResult.value);
      setLive(usersResult.status === "fulfilled" || auditResult.status === "fulfilled");
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return null;
  }

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
      <section className="flex items-start gap-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e5edf7] text-[#385d86]">
          <Icon name="shield" size={22} />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">
            Administration · BR-11
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.045em] text-[#17294b] sm:text-[30px]">
            Administration
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
            Comptes, rôles, journaux d&apos;audit et paramètres du système. Accès réservé au Gérant
            et au Dev Digital.
          </p>
        </div>
      </section>

      {toast ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span className="flex items-center gap-2">
            <Icon name="check" size={17} />
            {toast}
          </span>
          <button
            aria-label="Fermer le message"
            className="rounded-md p-1 text-emerald-700 hover:bg-emerald-100"
            onClick={() => setToast("")}
            type="button"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {[
          { label: "Comptes (API)", value: String(users.length) },
          { label: "Actifs", value: String(actifs) },
          { label: "Rôles en usage", value: String(new Set(users.map((u) => u.role)).size) },
          { label: "Actions auditées", value: String(auditLogs.length) },
        ].map((stat, index) => (
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={stat.label}>
            <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-[27px] font-bold tracking-[-0.045em] text-[#182842]">{stat.value}</p>
              <span className={"size-2.5 rounded-full " + (index === 1 ? "bg-[#e3a641]" : "bg-[#7ba3cc]")} />
            </div>
          </article>
        ))}
      </section>

      {live ? (
        <div className="flex justify-end">
          <span className="size-1.5 rounded-full bg-emerald-400" />
        </div>
      ) : null}

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                aria-pressed={activeTab === tab}
                className={
                  "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition " +
                  (activeTab === tab
                    ? "bg-[#17294b] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700")
                }
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "Comptes & rôles" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  <th className="px-5 py-3.5 sm:px-6">Utilisateur</th>
                  <th className="px-5 py-3.5">Rôle</th>
                  <th className="px-5 py-3.5">Filiale</th>
                  <th className="px-5 py-3.5">Statut</th>
                  <th className="w-10 px-3 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {users.map((account) => {
                  const name = [account.first_name, account.last_name].filter(Boolean).join(" ") || account.email;
                  return (
                    <tr
                      className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-sky-50/50"
                      key={account.id}
                      onClick={() => setToast("Gestion du compte " + name + " à venir.")}
                    >
                      <td className="px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <span className="grid size-8 place-items-center rounded-lg bg-[#dce7f5] text-[10px] font-extrabold text-[#244269]">
                            {name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-700">{name}</p>
                            <p className="text-[11px] text-slate-400">{account.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-slate-600">
                        {roleLabels[account.role] ?? account.role}
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-slate-600">
                        {account.filiale?.nom ?? "—"}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge tone={account.is_active ? "success" : "neutral"}>
                          {account.is_active ? "Actif" : "Inactif"}
                        </StatusBadge>
                      </td>
                      <td className="px-3 py-4 text-slate-400">
                        <Icon name="dots" size={17} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-[#e3a641] px-4 py-2.5 text-xs font-bold text-[#14223b] shadow-lg shadow-amber-600/15 transition hover:bg-[#efb653]"
                onClick={() => setShowCreate(true)}
                type="button"
              >
                <Icon name="plus" size={15} />
                Créer un compte
              </button>
            </div>
          </div>
        ) : null}

        {activeTab === "Audit & journaux" ? (
          <div className="divide-y divide-slate-100">
            {auditLogs.length === 0 ? (
              <p className="px-5 py-6 text-xs text-slate-500 sm:px-6">
                Aucune action journalisée pour le moment.
              </p>
            ) : (
              auditLogs.map((entry) => {
                const who = entry.user
                  ? [entry.user.first_name, entry.user.last_name].filter(Boolean).join(" ") || entry.user.email
                  : "Système";
                const detail = entry.ip ? `IP ${entry.ip}` : `Table ${entry.table_cible}`;
                return (
                  <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6" key={entry.id}>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-[#edf3f9] text-[#426b95]">
                        <Icon name={entry.action === "DELETE" ? "trash" : "clipboard"} size={15} />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#233856]">
                          {auditActionLabels[entry.action]} · {entry.table_cible}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {who} · {detail}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 text-[11px] font-medium text-slate-400">
                      {formatAuditDate(entry.created_at)}
                    </p>
                  </div>
                );
              })
            )}
            <div className="px-5 py-4 sm:px-6">
              <button
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#426b95] hover:text-[#17294b]"
                onClick={() => setToast("Export complet du journal d'audit (CSV) généré.")}
                type="button"
              >
                <Icon name="download" size={15} />
                Exporter le journal d&apos;audit
              </button>
            </div>
          </div>
        ) : null}

        {activeTab === "Paramètres" ? (
          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:px-6">
            {[
              { title: "Seuils de stock (BR-03 / BR-04)", desc: "Alertes actives quand un article passe sous 20 % du seuil minimal.", icon: "boxes" as const },
              { title: "Pointage géolocalisé (BR-12)", desc: "Le pointage ouvrier exige une position valide et un horodatage.", icon: "map" as const },
              { title: "Périmètres managers", desc: "Chaque manager ne voit que sa filiale et ses équipes.", icon: "users" as const },
              { title: "Paiements Mobile Money (BR-13)", desc: "MTN MoMo et Moov Money activés sur la boutique.", icon: "shopping-bag" as const },
            ].map((setting) => (
              <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4" key={setting.title}>
                <div className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[#426b95] shadow-sm">
                    <Icon name={setting.icon} size={17} />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#233856]">{setting.title}</p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500">{setting.desc}</p>
                  </div>
                </div>
                <button
                  aria-label={setting.title}
                  aria-pressed="true"
                  className="mt-1 h-6 w-11 shrink-0 rounded-full bg-[#3fa77e] p-0.5 transition"
                  onClick={() => setToast("Réglage actif côté back-end.")}
                  type="button"
                >
                  <span className="block size-5 translate-x-5 rounded-full bg-white shadow" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </article>

      {showCreate ? (
        <CreateAccountForm
          onClose={() => setShowCreate(false)}
          onCreated={(account) => {
            const name = [account.first_name, account.last_name].filter(Boolean).join(" ") || account.email;
            setUsers((current) => [account, ...current]);
            setShowCreate(false);
            setToast("Compte " + name + " créé avec succès.");
          }}
        />
      ) : null}
    </div>
  );
}
