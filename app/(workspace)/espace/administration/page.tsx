"use client";

import { useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { StatusBadge } from "@/app/components/ui/status-badge";
import { useAuth } from "@/app/lib/auth-context";

const adminRoles = new Set(["ROLE_GERANT", "ROLE_DEV_DIGITAL"]);

const accounts = [
  { name: "Jéhovani Olouwatossi", email: "gerant@wugams.ci", role: "Gérant", filiale: "Siège", status: { label: "Actif", tone: "success" as const } },
  { name: "Aimé Bamba", email: "manager@wugams.ci", role: "Manager Opérations", filiale: "WUGAMS Construction", status: { label: "Actif", tone: "success" as const } },
  { name: "Céline N'Dri", email: "comptable@wugams.ci", role: "Comptable", filiale: "Siège", status: { label: "Actif", tone: "success" as const } },
  { name: "Dev Digital", email: "dev@wugams.ci", role: "Dev Digital", filiale: "Siège", status: { label: "Actif", tone: "success" as const } },
  { name: "Sarah Gnahoua", email: "secretary@wugams.ci", role: "Secrétaire", filiale: "WUGAMS Construction", status: { label: "Actif", tone: "success" as const } },
  { name: "Manager Partenariats", email: "mgr-partenaires@wugams.ci", role: "Manager Partenariats", filiale: "WUGAMS Matériaux", status: { label: "Actif", tone: "success" as const } },
  { name: "Manager Filiale", email: "mgr-filiale@wugams.ci", role: "Manager Filiale", filiale: "WUGAMS Entretien", status: { label: "Actif", tone: "success" as const } },
  { name: "Compte à attribuer", email: "—", role: "Manager Filiale", filiale: "—", status: { label: "En création", tone: "warning" as const } },
];

const auditLog = [
  { action: "Connexion au back-office", who: "gerant@wugams.ci", when: "Aujourd'hui · 08:12", detail: "IP 197.210.xx.xx" },
  { action: "Création de compte manager", who: "gerant@wugams.ci", when: "Aujourd'hui · 09:40", detail: "Rôle proposé : Manager Filiale" },
  { action: "Export CSV du module Stocks", who: "manager@wugams.ci", when: "Hier · 16:03", detail: "23 lignes exportées" },
  { action: "Modification des seuils BR-03/BR-04", who: "dev@wugams.ci", when: "Hier · 11:27", detail: "Valeur modifiée : stock faible" },
  { action: "Connexion au back-office", who: "comptable@wugams.ci", when: "Hier · 09:15", detail: "IP 197.210.xx.xx" },
];

const tabs = ["Comptes & rôles", "Audit & journaux", "Paramètres"];

export default function AdministrationPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [toast, setToast] = useState("");

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
            Démo : connectez-vous avec <strong>gerant@wugams.ci</strong> pour découvrir le module.
          </p>
        </div>
      </div>
    );
  }

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
          { label: "Comptes actifs", value: "11" },
          { label: "Rôles définis", value: "11" },
          { label: "Connexions aujourd'hui", value: "04" },
          { label: "Actions auditées", value: "127" },
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
                {accounts.map((account) => (
                  <tr
                    className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-sky-50/50"
                    key={account.email}
                    onClick={() => setToast("Gestion du compte " + account.name + " prête à être reliée à l'API.")}
                  >
                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span className="grid size-8 place-items-center rounded-lg bg-[#dce7f5] text-[10px] font-extrabold text-[#244269]">
                          {account.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-700">{account.name}</p>
                          <p className="text-[11px] text-slate-400">{account.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-600">{account.role}</td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-600">{account.filiale}</td>
                    <td className="px-5 py-4">
                      <StatusBadge tone={account.status.tone}>{account.status.label}</StatusBadge>
                    </td>
                    <td className="px-3 py-4 text-slate-400">
                      <Icon name="dots" size={17} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-[#e3a641] px-4 py-2.5 text-xs font-bold text-[#14223b] shadow-lg shadow-amber-600/15 transition hover:bg-[#efb653]"
                onClick={() => setToast("Formulaire de création de compte prêt à être relié à l'API.")}
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
            {auditLog.map((entry, index) => (
              <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6" key={index}>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-[#edf3f9] text-[#426b95]">
                    <Icon name={entry.action.startsWith("Connexion") ? "lock" : "clipboard"} size={15} />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#233856]">{entry.action}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {entry.who} · {entry.detail}
                    </p>
                  </div>
                </div>
                <p className="shrink-0 text-[11px] font-medium text-slate-400">{entry.when}</p>
              </div>
            ))}
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
                  onClick={() => setToast("Réglage modifié dans la démo (persistance après branchement API).")}
                  type="button"
                >
                  <span className="block size-5 translate-x-5 rounded-full bg-white shadow" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </article>
    </div>
  );
}
