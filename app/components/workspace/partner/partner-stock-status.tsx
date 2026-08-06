"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { StockBucket } from "@/app/lib/partner-data";

type PartnerStockStatusProps = {
  buckets: StockBucket[];
};

export function PartnerStockStatus({ buckets }: PartnerStockStatusProps) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  const sain = buckets.find((bucket) => bucket.key === "eleve")?.count ?? 0;
  const sainPct = total > 0 ? (sain / total) * 100 : 0;

  return (
    <ExecutivePanel
      action={
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
          {total} références analysées
        </span>
      }
      icon="boxes"
      subtitle="Répartition de l'ensemble du catalogue par niveau de risque"
      title="État du stock"
    >
      <div className="mb-4 flex h-5 w-full overflow-hidden rounded-full border border-slate-100 bg-slate-50 shadow-inner">
        {buckets.map((bucket, index) => (
          <motion.div
            animate={{ width: `${total > 0 ? (bucket.count / total) * 100 : 0}%` }}
            aria-label={`${bucket.label} : ${bucket.count} produit(s)`}
            className={"h-full " + bucket.bg + " " + (index > 0 ? "border-l-2 border-white" : "")}
            initial={{ width: 0 }}
            key={bucket.key}
            style={{ minWidth: bucket.count > 0 ? 6 : 0 }}
            title={`${bucket.label} : ${bucket.count}`}
            transition={{ delay: 0.15 + index * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {buckets.map((bucket, index) => {
          const percent = total > 0 ? Math.round((bucket.count / total) * 100) : 0;
          return (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition duration-200 hover:bg-white hover:shadow-md hover:shadow-slate-950/[0.05]"
              initial={{ opacity: 0, y: 12 }}
              key={bucket.key}
              transition={{ delay: 0.2 + index * 0.07, duration: 0.4 }}
            >
              <div className="flex items-center justify-between">
                <span className="grid size-9 place-items-center rounded-xl" style={{ background: `${bucket.color}1a` }}>
                  <span className={"size-2.5 rounded-full " + bucket.bg} />
                </span>
                <span className="text-xl font-extrabold tabular-nums" style={{ color: bucket.color }}>
                  {bucket.count}
                </span>
              </div>
              <p className="mt-3 text-[12px] font-bold text-[#16233a]">{bucket.label}</p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-400">{percent} % du catalogue</p>
              <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-slate-200/70">
                <motion.div
                  animate={{ width: `${percent}%` }}
                  className={"h-full rounded-full " + bucket.bg}
                  initial={{ width: 0 }}
                  transition={{ delay: 0.35 + index * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
        <Icon className="text-emerald-600" name="check" size={16} />
        <p className="text-[11px] font-semibold text-emerald-800">
          {sainPct >= 60
            ? `Excellent : ${sainPct.toFixed(0).replace(".", ",")} % du catalogue est au-dessus des seuils de sécurité.`
            : sainPct >= 35
              ? `Attention : seulement ${sainPct.toFixed(0).replace(".", ",")} % du catalogue est au-dessus des seuils.`
              : `Critique : ${sainPct.toFixed(0).replace(".", ",")} % du catalogue est sain — lancez les réapprovisionnements.`}
        </p>
      </div>
    </ExecutivePanel>
  );
}
