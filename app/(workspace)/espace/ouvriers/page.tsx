"use client";

import { useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { ModuleScreen } from "@/app/components/workspace/module-screen";
import { getModuleDefinition, ouvriersPerformance } from "@/app/lib/demo-data";

const criteria: { code: string; label: string }[] = [
  { code: "S1", label: "Sécurité sur site" },
  { code: "S2", label: "Compétence technique" },
  { code: "S3", label: "Ponctualité" },
  { code: "S4", label: "Collaboration d'équipe" },
  { code: "S5", label: "Initiative" },
  { code: "S6", label: "Communication" },
  { code: "S7", label: "Respect du matériel" },
  { code: "S8", label: "Qualité de finition" },
  { code: "S9", label: "Rigueur administrative" },
];

export default function OuvriersPage() {
  const definition = getModuleDefinition("ouvriers");
  const [selected, setSelected] = useState(ouvriersPerformance[0].nom);
  const [scores, setScores] = useState<Record<string, number[]>>(
    Object.fromEntries(
      ouvriersPerformance.map((worker) => [
        worker.nom,
        criteria.map((_, index) => (worker.semaines[index] ?? 34) % 10 + 6),
      ])
    )
  );

  if (!definition) {
    return null;
  }

  const worker = ouvriersPerformance.find((w) => w.nom === selected) ?? ouvriersPerformance[0];
  const average =
    Math.round(
      (scores[selected] ?? []).reduce((sum, score) => sum + score, 0) / criteria.length
    ) / 10;

  return (
    <div className="space-y-6">
      <ModuleScreen definition={definition} />

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 pt-5 sm:px-6 sm:pt-6 xl:flex-row xl:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">
              Moteur d&apos;évaluation · BR-08
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.035em] text-[#17294b]">
              Performance S1 à S9
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Grille d&apos;évaluation continue : chaque critère est noté de 1 à 10 par l&apos;équipe
              encadrante.
            </p>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {ouvriersPerformance.map((w) => (
              <button
                aria-pressed={selected === w.nom}
                className={
                  "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition " +
                  (selected === w.nom
                    ? "bg-[#17294b] text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300")
                }
                key={w.nom}
                onClick={() => setSelected(w.nom)}
                type="button"
              >
                {w.nom.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-[#1a2943]">{worker.nom}</p>
              <span className="rounded-full bg-[#edf3f9] px-2.5 py-1 text-[11px] font-bold text-[#426b95]">
                Note générale : <span className="text-[#17294b]">{average.toFixed(1)} / 10</span>
              </span>
            </div>
            <div className="mt-4 space-y-3.5">
              {criteria.map((criterion, index) => {
                const score = (scores[selected] ?? [])[index] ?? 7;
                const pct = score * 10;
                const color = score >= 8 ? "bg-[#3fa77e]" : score >= 6 ? "bg-[#e3a641]" : "bg-[#db6d5b]";
                return (
                  <div key={criterion.code}>
                    <div className="flex items-center justify-between text-xs">
                      <p className="font-bold text-slate-600">
                        <span className="mr-1.5 inline-flex w-7 justify-center rounded-md bg-slate-100 py-0.5 text-[10px] font-extrabold text-slate-500">
                          {criterion.code}
                        </span>
                        {criterion.label}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          aria-label={"Baisser " + criterion.label}
                          className="grid size-6 place-items-center rounded-md border border-slate-200 text-slate-500 transition hover:border-slate-300"
                          onClick={() =>
                            setScores((prev) => ({
                              ...prev,
                              [selected]: (prev[selected] ?? []).map((s, i) => (i === index ? Math.max(1, s - 1) : s)),
                            }))
                          }
                          type="button"
                        >
                          <Icon name="minus" size={13} />
                        </button>
                        <span className="w-8 text-center font-bold text-[#233856]">{score}</span>
                        <button
                          aria-label={"Augmenter " + criterion.label}
                          className="grid size-6 place-items-center rounded-md border border-slate-200 text-slate-500 transition hover:border-slate-300"
                          onClick={() =>
                            setScores((prev) => ({
                              ...prev,
                              [selected]: (prev[selected] ?? []).map((s, i) => (i === index ? Math.min(10, s + 1) : s)),
                            }))
                          }
                          type="button"
                        >
                          <Icon name="plus" size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={"h-full rounded-full transition-all duration-300 " + color}
                        style={{ width: pct + "%" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              Tendance 9 semaines
            </p>
            <div className="mt-4 flex h-36 items-end gap-1.5">
              {worker.semaines.map((value, index) => (
                <div className="flex flex-1 flex-col items-center gap-1.5" key={index}>
                  <div
                    className="w-full rounded-t-md bg-[#7ba3cc] transition-all duration-300"
                    style={{ height: (value / 40) * 100 + "%", minHeight: 8 }}
                  />
                  <span className="text-[9px] font-bold text-slate-400">S{index + 1}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-lg bg-white p-3 text-[11px] leading-5 text-slate-500 shadow-sm">
              La note générale est recalculée à chaque évaluation et alimente la paie variable
              (BR-08) ainsi que le plan de formation.
            </p>
            <button
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#426b95] transition hover:border-slate-300"
              onClick={() => setScores((prev) => prev)}
              type="button"
            >
              <Icon name="download" size={14} />
              Exporter la grille
            </button>
          </aside>
        </div>
      </article>
    </div>
  );
}
