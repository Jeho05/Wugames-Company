"use client";

import { useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import { demoSecComptes, type CompteCreation } from "@/app/lib/secretary-data";

type SecretaryAccountCreationProps = {
  onToast: (message: string, tone?: "success" | "error" | "info") => void;
};

const roleOptions: { value: string; label: string }[] = [
  { value: "ROLE_CLIENT_MEMBRE", label: "Client membre" },
  { value: "ROLE_CLIENT_STD", label: "Client standard" },
  { value: "ROLE_OUVRIER", label: "Ouvrier terrain" },
  { value: "ROLE_FOURNISSEUR", label: "Fournisseur" },
  { value: "ROLE_SECRETAIRE", label: "Secrétaire" },
];

const roleLabel: Record<string, string> = {
  ROLE_CLIENT_MEMBRE: "Client membre",
  ROLE_CLIENT_STD: "Client standard",
  ROLE_OUVRIER: "Ouvrier terrain",
  ROLE_FOURNISSEUR: "Fournisseur",
  ROLE_SECRETAIRE: "Secrétaire",
};

const statutMeta: Record<CompteCreation["statut"], { label: string; badge: string; dot: string }> = {
  EN_ATTENTE: { label: "En attente", badge: "border-amber-200 bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  VALIDE: { label: "Validé", badge: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  REFUSE: { label: "Refusé", badge: "border-rose-200 bg-rose-50 text-rose-700", dot: "bg-rose-500" },
};

export function SecretaryAccountCreation({ onToast }: SecretaryAccountCreationProps) {
  const [demandes, setDemandes] = useState<CompteCreation[]>(demoSecComptes);
  const [form, setForm] = useState({ nom: "", email: "", telephone: "", role: "ROLE_CLIENT_MEMBRE" });

  function changerStatut(id: string, statut: CompteCreation["statut"]) {
    setDemandes((prev) => prev.map((d) => (d.id === id ? { ...d, statut } : d)));
    const demande = demandes.find((d) => d.id === id);
    if (!demande) return;
    onToast(
      statut === "VALIDE"
        ? `Compte de ${demande.nom} activé · invitation envoyée`
        : `Demande de ${demande.nom} refusée`,
      statut === "VALIDE" ? "success" : "info",
    );
  }

  function creerCompte() {
    if (!form.nom.trim() || !form.email.trim() || !form.telephone.trim()) {
      onToast("Remplissez le nom, l'email et le téléphone", "error");
      return;
    }
    const nouvelle: CompteCreation = {
      id: `cc-${Date.now()}`,
      nom: form.nom.trim(),
      email: form.email.trim(),
      telephone: form.telephone.trim(),
      role: form.role,
      statut: "EN_ATTENTE",
      demandePar: "Secrétaire",
      date: new Date().toISOString(),
    };
    setDemandes((prev) => [nouvelle, ...prev]);
    setForm({ nom: "", email: "", telephone: "", role: "ROLE_CLIENT_MEMBRE" });
    onToast(`Demande de compte pour ${nouvelle.nom} enregistrée`, "success");
  }

  const enAttente = demandes.filter((d) => d.statut === "EN_ATTENTE").length;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      {/* Formulaire */}
      <ExecutivePanel
        icon="user-plus"
        subtitle="Les comptes sont créés après validation"
        title="Créer un compte"
      >
        <div className="space-y-3.5">
          <label className="block">
            <span className="text-[11px] font-bold text-slate-500">Nom complet / raison sociale</span>
            <input
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-[13px] font-semibold text-[#16233a] outline-none transition placeholder:text-slate-300 focus:border-[#0f7a5f] focus:bg-white"
              onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
              placeholder="ex. Yao Christian"
              value={form.nom}
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-slate-500">Email</span>
            <input
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-[13px] font-semibold text-[#16233a] outline-none transition placeholder:text-slate-300 focus:border-[#0f7a5f] focus:bg-white"
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="prenom.nom@exemple.com"
              type="email"
              value={form.email}
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-slate-500">Téléphone</span>
            <input
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-[13px] font-semibold text-[#16233a] outline-none transition placeholder:text-slate-300 focus:border-[#0f7a5f] focus:bg-white"
              onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
              placeholder="+229 01 23 45 67"
              type="tel"
              value={form.telephone}
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-slate-500">Rôle</span>
            <select
              className="mt-1.5 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-[13px] font-semibold text-[#16233a] outline-none transition focus:border-[#0f7a5f] focus:bg-white"
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              value={form.role}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f7a5f] px-4 py-3.5 text-[13px] font-extrabold text-white shadow-xl shadow-emerald-900/20 transition hover:bg-[#0e6e57] active:scale-[0.99]"
            onClick={creerCompte}
            type="button"
          >
            <Icon name="plus" size={15} />
            Enregistrer la demande
          </button>
          <p className="text-center text-[9px] leading-4 text-slate-300">
            Le demandeur recevra une invitation par email. Le compte est actif après validation.
          </p>
        </div>
      </ExecutivePanel>

      {/* Demandes */}
      <ExecutivePanel
        action={
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-extrabold text-amber-700">
            {enAttente} en attente
          </span>
        }
        icon="clipboard"
        subtitle="Validez ou refusez les créations de comptes"
        title="Demandes de comptes"
      >
        {demandes.length === 0 ? (
          <p className="py-8 text-center text-[12px] font-semibold text-slate-400">Aucune demande pour le moment.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {demandes.map((demande) => {
              const statut = statutMeta[demande.statut];
              return (
                <div className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0" key={demande.id}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={
                        "grid size-10 shrink-0 place-items-center rounded-xl text-[11px] font-extrabold " +
                        (demande.statut === "VALIDE"
                          ? "bg-emerald-50 text-emerald-600"
                          : demande.statut === "REFUSE"
                            ? "bg-rose-50 text-rose-600"
                            : "bg-amber-50 text-amber-600")
                      }
                    >
                      {demande.nom
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-extrabold text-[#16233a]">{demande.nom}</p>
                      <p className="mt-0.5 truncate text-[10px] text-slate-400">
                        {demande.email} · {demande.telephone} · {roleLabel[demande.role] ?? demande.role}
                      </p>
                      <p className="mt-0.5 text-[9px] text-slate-300">
                        Demandé par {demande.demandePar} ·{" "}
                        {new Date(demande.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                  {demande.statut === "EN_ATTENTE" ? (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        aria-label={`Refuser ${demande.nom}`}
                        className="grid size-8 place-items-center rounded-full border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => changerStatut(demande.id, "REFUSE")}
                        type="button"
                      >
                        <Icon name="close" size={13} />
                      </button>
                      <button
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#0f7a5f] px-3 py-1.5 text-[10px] font-extrabold text-white transition hover:bg-[#0e6e57]"
                        onClick={() => changerStatut(demande.id, "VALIDE")}
                        type="button"
                      >
                        <Icon name="check" size={11} />
                        Valider
                      </button>
                    </div>
                  ) : (
                    <span
                      className={"inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-extrabold " + statut.badge}
                    >
                      <span className={"size-1.5 rounded-full " + statut.dot} />
                      {statut.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ExecutivePanel>
    </div>
  );
}
