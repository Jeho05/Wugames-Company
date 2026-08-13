"use client";

import { useMemo, useState } from "react";

import { AnimatePresence, motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import { Reveal } from "@/app/components/workspace/executive/reveal";
import {
  boutiqueStatutMeta,
  boutiqueTypeMeta,
  demoSecBoutiques,
  formatMontantFcfa,
  type BoutiqueType,
  type SecretaryBoutique,
} from "@/app/lib/secretary-data";

type SecretaryBoutiquesProps = {
  onToast: (message: string, tone?: "success" | "error" | "info") => void;
};

const typeOptions: { value: BoutiqueType; label: string }[] = [
  { value: "entretien", label: "Entretien" },
  { value: "materiaux", label: "Matériaux" },
  { value: "mobilier", label: "Mobilier" },
  { value: "outillage", label: "Outillage" },
];

export function SecretaryBoutiques({ onToast }: SecretaryBoutiquesProps) {
  const [boutiques, setBoutiques] = useState<SecretaryBoutique[]>(demoSecBoutiques);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ nom: "", type: "entretien" as BoutiqueType, gerant: "", adresse: "" });

  const totalCa = useMemo(() => boutiques.reduce((sum, b) => sum + b.chiffreAffaires, 0), [boutiques]);
  const actives = useMemo(() => boutiques.filter((b) => b.statut === "ACTIVE").length, [boutiques]);

  function creerBoutique() {
    if (!form.nom.trim() || !form.gerant.trim()) {
      onToast("Renseignez au moins le nom et le gérant", "error");
      return;
    }
    const nouvelle: SecretaryBoutique = {
      id: `b-${Date.now()}`,
      nom: form.nom.trim(),
      type: form.type,
      gerant: form.gerant.trim(),
      adresse: form.adresse.trim() || "Adresse à confirmer",
      membres: 0,
      commandes: 0,
      chiffreAffaires: 0,
      statut: "EN_PREPARATION",
      created_at: new Date().toISOString(),
    };
    setBoutiques((prev) => [nouvelle, ...prev]);
    setCreateOpen(false);
    setForm({ nom: "", type: "entretien", gerant: "", adresse: "" });
    onToast(`Boutique « ${nouvelle.nom} » créée en préparation`, "success");
  }

  function basculerStatut(id: string) {
    setBoutiques((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, statut: b.statut === "SUSPENDUE" ? "ACTIVE" : "SUSPENDUE" }
          : b,
      ),
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold text-slate-400">
          <span className="font-extrabold tabular-nums text-[#16233a]">{boutiques.length}</span> boutique(s) ·{" "}
          <span className="font-extrabold tabular-nums text-emerald-600">{actives}</span> actives ·{" "}
          <span className="font-extrabold tabular-nums text-[#17294b]">{formatMontantFcfa(totalCa)}</span> de chiffre
          d&apos;affaires cumulé
        </p>
        <button
          className="inline-flex items-center gap-1.5 rounded-full bg-[#0f7a5f] px-4 py-2 text-[11px] font-extrabold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[#0e6e57] active:scale-95"
          onClick={() => setCreateOpen(true)}
          type="button"
        >
          <Icon name="plus" size={13} />
          Nouvelle boutique
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {boutiques.map((boutique, index) => {
          const typeMeta = boutiqueTypeMeta[boutique.type];
          const statutMeta = boutiqueStatutMeta[boutique.statut];
          return (
            <Reveal delay={index * 0.04} key={boutique.id}>
              <article className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={"grid size-10 place-items-center rounded-xl " + typeMeta.tile}>
                      <Icon name={typeMeta.icon} size={17} />
                    </span>
                    <div>
                      <h3 className="text-[13px] font-extrabold leading-5 text-[#16233a]">{boutique.nom}</h3>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {boutique.adresse} · gérée par {boutique.gerant}
                      </p>
                    </div>
                  </div>
                  <span
                    className={
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-extrabold " +
                      statutMeta.badge
                    }
                  >
                    <span className={"size-1.5 rounded-full " + statutMeta.dot} />
                    {statutMeta.label}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/60">
                  <div className="px-3 py-3 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Membres</p>
                    <p className="mt-0.5 text-[15px] font-extrabold tabular-nums text-[#16233a]">{boutique.membres}</p>
                  </div>
                  <div className="px-3 py-3 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Commandes</p>
                    <p className="mt-0.5 text-[15px] font-extrabold tabular-nums text-[#16233a]">{boutique.commandes}</p>
                  </div>
                  <div className="px-3 py-3 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Chiffre d&apos;affaires</p>
                    <p className="mt-0.5 text-[13px] font-extrabold tabular-nums text-[#0f7a5f]">
                      {formatMontantFcfa(boutique.chiffreAffaires)}
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-500">
                    {typeMeta.label} · ouverte depuis {new Date(boutique.created_at).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                  </span>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    onClick={() => {
                      basculerStatut(boutique.id);
                      onToast(
                        boutique.statut === "SUSPENDUE"
                          ? `Boutique « ${boutique.nom} » réactivée`
                          : `Boutique « ${boutique.nom} » suspendue`,
                        "info",
                      );
                    }}
                    type="button"
                  >
                    <Icon name={boutique.statut === "SUSPENDUE" ? "refresh" : "warning"} size={11} />
                    {boutique.statut === "SUSPENDUE" ? "Réactiver" : "Suspendre"}
                  </button>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      <AnimatePresence>
        {createOpen ? (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              aria-hidden="true"
              className="pointer-events-auto absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateOpen(false)}
            />
            <motion.div
              aria-label="Créer une boutique"
              aria-modal="true"
              className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              role="dialog"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0f7a5f]">Nouvelle boutique</p>
                  <h3 className="mt-1 text-lg font-extrabold text-[#16233a]">Ouvrir un point de vente</h3>
                </div>
                <button
                  aria-label="Fermer"
                  className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
                  onClick={() => setCreateOpen(false)}
                  type="button"
                >
                  <Icon name="close" size={15} />
                </button>
              </div>

              <div className="mt-5 space-y-3.5">
                <label className="block">
                  <span className="text-[11px] font-bold text-slate-500">Nom de la boutique</span>
                  <input
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-[13px] font-semibold text-[#16233a] outline-none transition placeholder:text-slate-300 focus:border-[#0f7a5f] focus:bg-white"
                    onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                    placeholder="ex. Espace Wu · Lokossa"
                    value={form.nom}
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-bold text-slate-500">Type de boutique</span>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {typeOptions.map((option) => (
                      <button
                        className={
                          "rounded-2xl border px-3 py-2.5 text-[11px] font-bold transition " +
                          (form.type === option.value
                            ? "border-[#0f7a5f] bg-[#0f7a5f]/[0.06] text-[#0f7a5f]"
                            : "border-slate-200 text-slate-500 hover:border-slate-300")
                        }
                        key={option.value}
                        onClick={() => setForm((f) => ({ ...f, type: option.value }))}
                        type="button"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </label>
                <label className="block">
                  <span className="text-[11px] font-bold text-slate-500">Gérant(e)</span>
                  <input
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-[13px] font-semibold text-[#16233a] outline-none transition placeholder:text-slate-300 focus:border-[#0f7a5f] focus:bg-white"
                    onChange={(e) => setForm((f) => ({ ...f, gerant: e.target.value }))}
                    placeholder="Nom et prénom"
                    value={form.gerant}
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-bold text-slate-500">Adresse</span>
                  <input
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-[13px] font-semibold text-[#16233a] outline-none transition placeholder:text-slate-300 focus:border-[#0f7a5f] focus:bg-white"
                    onChange={(e) => setForm((f) => ({ ...f, adresse: e.target.value }))}
                    placeholder="Quartier, ville"
                    value={form.adresse}
                  />
                </label>
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f7a5f] px-4 py-3.5 text-[13px] font-extrabold text-white shadow-xl shadow-emerald-900/20 transition hover:bg-[#0e6e57] active:scale-[0.99]"
                  onClick={creerBoutique}
                  type="button"
                >
                  <Icon name="plus" size={15} />
                  Créer la boutique
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
