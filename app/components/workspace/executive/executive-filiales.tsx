"use client";

import { motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { ExecutiveFiliale, FilialeSante } from "@/app/lib/executive-data";

type ExecutiveFilialesProps = {
  filiales: ExecutiveFiliale[];
};

const santeMeta: Record<FilialeSante, { label: string; classes: string; bar: string }> = {
  excellente: { label: "Excellente", classes: "border-emerald-200 bg-emerald-50 text-emerald-700", bar: "bg-emerald-500" },
  bonne: { label: "Bonne", classes: "border-sky-200 bg-sky-50 text-sky-700", bar: "bg-sky-500" },
  attention: { label: "À surveiller", classes: "border-amber-200 bg-amber-50 text-amber-800", bar: "bg-amber-500" },
};

const filialeTiles = [
  "bg-amber-50 text-amber-600",
  "bg-sky-50 text-sky-600",
  "bg-violet-50 text-violet-600",
  "bg-emerald-50 text-emerald-600",
];

export function ExecutiveFiliales({ filiales }: ExecutiveFilialesProps) {
  const reduce = useReducedMotion();

  return (
    <ExecutivePanel
      icon="building"
      subtitle="Consolidation par entité du groupe"
      title="Filiales"
    >
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {filiales.map((filiale, index) => {
          const sante = santeMeta[filiale.sante];
          const tile = filialeTiles[index % filialeTiles.length];
          const initials = filiale.nom.replace("WUGAMS ", "").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

          return (
            <motion.article
              className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-md"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              key={filiale.id}
              transition={{ duration: 0.45, delay: 0.06 * index, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={"grid size-10 shrink-0 place-items-center rounded-xl text-[11px] font-extrabold " + tile}>
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-[#16233a]">{filiale.nom}</p>
                    <p className="font-mono text-[9px] font-semibold text-slate-400">{filiale.code}</p>
                  </div>
                </div>
                <span className={"shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold " + sante.classes}>
                  {sante.label}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "CA", value: filiale.ca },
                  { label: "Employés", value: String(filiale.employes) },
                  { label: "Missions", value: String(filiale.missions) },
                ].map((stat) => (
                  <div className="rounded-xl border border-slate-100 bg-white px-1 py-2" key={stat.label}>
                    <p className="truncate text-[11px] font-bold text-[#16233a]">{stat.value}</p>
                    <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-slate-400">Performance</span>
                  <span className="font-bold text-[#16233a]">{filiale.performance}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/70">
                  <motion.div
                    animate={{ width: `${filiale.performance}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-[#e3a641] to-[#f2c56d]"
                    initial={reduce ? false : { width: 0 }}
                    transition={{ duration: 0.9, delay: 0.3 + 0.06 * index, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400">Croissance</span>
                <span
                  className={
                    "inline-flex items-center gap-0.5 text-[11px] font-bold " +
                    (filiale.croissance >= 0 ? "text-emerald-600" : "text-red-600")
                  }
                >
                  <Icon
                    className={filiale.croissance < 0 ? "rotate-180" : undefined}
                    name="arrow-up-right"
                    size={11}
                  />
                  {Math.abs(filiale.croissance).toLocaleString("fr-FR")} %
                </span>
              </div>
            </motion.article>
          );
        })}
      </div>
    </ExecutivePanel>
  );
}
