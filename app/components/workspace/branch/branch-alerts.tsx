"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { BranchAlert, BranchAlertCategory, BranchAlertLevel } from "@/app/lib/branch-data";

type BranchAlertsProps = {
  alerts: BranchAlert[];
};

const levelMeta: Record<BranchAlertLevel, { label: string; badge: string; dot: string }> = {
  info: { label: "Information", badge: "border-sky-200 bg-sky-50 text-sky-700", dot: "bg-sky-500" },
  attention: { label: "Attention", badge: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  urgent: { label: "Urgent", badge: "border-orange-200 bg-orange-50 text-orange-700", dot: "bg-orange-500" },
  critique: { label: "Critique", badge: "border-rose-200 bg-rose-50 text-rose-700", dot: "bg-rose-500" },
};

const categoryLabels: Record<BranchAlertCategory, string> = {
  stock: "Stock",
  reception: "Réception",
  mission: "Mission",
  facture: "Facture",
  rendement: "Rendement",
  utilisateur: "Utilisateur",
};

const levels: (BranchAlertLevel | "tous")[] = ["tous", "critique", "urgent", "attention", "info"];
const categories: (BranchAlertCategory | "toutes")[] = ["toutes", "stock", "reception", "mission", "facture", "rendement", "utilisateur"];

export function BranchAlerts({ alerts }: BranchAlertsProps) {
  const [level, setLevel] = useState<BranchAlertLevel | "tous">("tous");
  const [category, setCategory] = useState<BranchAlertCategory | "toutes">("toutes");

  const filtered = alerts.filter(
    (alert) => (level === "tous" || alert.level === level) && (category === "toutes" || alert.category === category),
  );

  return (
    <ExecutivePanel
      action={
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
          {filtered.length} / {alerts.length} alerte(s)
        </span>
      }
      icon="bell"
      subtitle="Alertes locales de votre filiale"
      title="Centre d'alertes"
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="flex flex-wrap gap-1 rounded-xl border border-slate-100 bg-slate-50 p-1" role="group" aria-label="Filtrer par niveau">
          {levels.map((value) => (
            <button
              aria-pressed={level === value}
              className={
                "rounded-lg px-2.5 py-1 text-[10px] font-bold transition " +
                (level === value ? "bg-[#10304f] text-white shadow-sm" : "text-slate-500 hover:bg-white hover:text-slate-700")
              }
              key={value}
              onClick={() => setLevel(value)}
              type="button"
            >
              {value === "tous" ? "Tous" : levelMeta[value].label}
            </button>
          ))}
        </div>
        <select
          aria-label="Filtrer par catégorie"
          className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm outline-none focus:ring-2 focus:ring-[#0e9f9b]/30"
          onChange={(event) => setCategory(event.target.value as BranchAlertCategory | "toutes")}
          value={category}
        >
          {categories.map((value) => (
            <option key={value} value={value}>
              {value === "toutes" ? "Toutes catégories" : categoryLabels[value]}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
          <span className="grid size-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Icon name="check" size={18} />
          </span>
          <p className="mt-3 text-[12px] font-bold text-[#16233a]">Aucune alerte pour ces filtres</p>
          <p className="mt-1 text-[11px] text-slate-500">Votre filiale est sous contrôle sur cette catégorie.</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((alert, index) => {
            const meta = levelMeta[alert.level];
            return (
              <motion.li
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-wrap items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 transition hover:bg-white"
                initial={{ opacity: 0, x: -14 }}
                key={alert.id}
                transition={{ delay: index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className={"mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl " + meta.badge}>
                  <Icon name={alert.level === "info" ? "check" : "warning"} size={14} />
                </span>
                <div className="min-w-0 flex-1 basis-52">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-bold text-[#16233a]">
                    {alert.title}
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-500">
                      {categoryLabels[alert.category]}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[11px] leading-5 text-slate-500">{alert.detail}</p>
                  <p className="mt-1 text-[10px] font-semibold text-slate-400">
                    {alert.entity} · {alert.time}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className={"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold " + meta.badge}>
                    <span className={"size-1.5 rounded-full " + meta.dot} />
                    {meta.label}
                  </span>
                  {alert.action ? (
                    <Link
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600 transition hover:border-[#0e9f9b]/50 hover:text-[#0e9f9b]"
                      href={alert.action.href}
                    >
                      <Icon name="arrow-up-right" size={11} />
                      {alert.action.label}
                    </Link>
                  ) : null}
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </ExecutivePanel>
  );
}
