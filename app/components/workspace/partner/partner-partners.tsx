"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { PartnerCard } from "@/app/lib/partner-data";

type PartnerPartnersProps = {
  partners: PartnerCard[];
};

const statutMeta: Record<PartnerCard["statut"], { label: string; badge: string; dot: string }> = {
  actif: { label: "Actif", badge: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  en_retard: { label: "Retards détectés", badge: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  nouveau: { label: "Nouveau", badge: "border-sky-200 bg-sky-50 text-sky-700", dot: "bg-sky-500" },
};

function initialsOf(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
}

function scoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 75) return "text-amber-600";
  return "text-rose-600";
}

export function PartnerPartners({ partners }: PartnerPartnersProps) {
  return (
    <ExecutivePanel
      action={
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
          {partners.length} partenaires
        </span>
      }
      icon="building"
      subtitle="Performance et fiabilité de chaque partenaire"
      title="Partenaires"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {partners.map((partner, index) => {
          const meta = statutMeta[partner.statut];
          return (
            <motion.article
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-amber-100 hover:bg-white hover:shadow-lg hover:shadow-slate-950/[0.05]"
              initial={{ opacity: 0, y: 14 }}
              key={partner.id}
              transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#17294b] to-[#243656] text-[12px] font-extrabold text-[#f2c56d] shadow-md shadow-[#17294b]/20">
                  {initialsOf(partner.nom)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-[#16233a]">{partner.nom}</p>
                  <p className="text-[10px] text-slate-400">
                    {partner.produits} produits · {partner.livraisons} livraisons
                  </p>
                </div>
                <span className={"inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[8px] font-bold " + meta.badge}>
                  <span className={"size-1.5 rounded-full " + meta.dot} />
                  {meta.label}
                </span>
              </div>
              <div className="mt-3.5 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Performance</p>
                  <p className={"mt-0.5 text-[15px] font-extrabold tabular-nums " + scoreColor(partner.performance)}>
                    {partner.performance} %
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Fiabilité</p>
                  <p className={"mt-0.5 flex items-center gap-1 text-[15px] font-extrabold tabular-nums " + scoreColor(partner.fiabilite)}>
                    {partner.fiabilite} %
                    <Icon
                      className={partner.fiabilite >= 90 ? "text-emerald-500" : partner.fiabilite >= 75 ? "text-amber-500" : "text-rose-500"}
                      name={partner.fiabilite >= 75 ? "check" : "warning"}
                      size={13}
                    />
                  </p>
                </div>
              </div>
              <div className="mt-2.5">
                <div className="mb-1 flex items-center justify-between text-[9px] font-semibold text-slate-400">
                  <span>Fiabilité des livraisons</span>
                  <span className="tabular-nums text-slate-500">{partner.fiabilite} %</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/70">
                  <motion.div
                    animate={{ width: `${partner.fiabilite}%` }}
                    className={
                      "h-full rounded-full " +
                      (partner.fiabilite >= 90 ? "bg-emerald-500" : partner.fiabilite >= 75 ? "bg-amber-500" : "bg-rose-500")
                    }
                    initial={{ width: 0 }}
                    transition={{ delay: 0.15 + index * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </ExecutivePanel>
  );
}
