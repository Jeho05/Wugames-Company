"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { DeliveryRow } from "@/app/lib/partner-data";

type PartnerDeliveriesProps = {
  deliveries: DeliveryRow[];
};

const statutMeta: Record<DeliveryRow["statut"], { label: string; badge: string; dot: string; bar: string }> = {
  livree: { label: "Livrée", badge: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  en_attente: { label: "En attente", badge: "border-sky-200 bg-sky-50 text-sky-700", dot: "bg-sky-500", bar: "bg-sky-500" },
  retard: { label: "En retard", badge: "border-rose-200 bg-rose-50 text-rose-700", dot: "bg-rose-500", bar: "bg-rose-500" },
};

export function PartnerDeliveries({ deliveries }: PartnerDeliveriesProps) {
  return (
    <ExecutivePanel
      action={
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
          {deliveries.length} commandes
        </span>
      }
      icon="truck"
      subtitle="Commandes en cours et livraisons récentes"
      title="Livraisons"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
              <th className="pb-2.5 pr-3">Commande</th>
              <th className="pb-2.5 pr-3">Fournisseur</th>
              <th className="pb-2.5 pr-3">Date prévue</th>
              <th className="pb-2.5 pr-3">Statut</th>
              <th className="pb-2.5 pr-3">Progression</th>
              <th className="pb-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((delivery, index) => {
              const meta = statutMeta[delivery.statut];
              return (
                <tr className="group border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50/70" key={delivery.id}>
                  <td className="py-3.5 pr-3">
                    <span className="font-mono text-[12px] font-bold text-[#d19331]">{delivery.commande}</span>
                  </td>
                  <td className="py-3.5 pr-3 text-[12px] font-semibold text-[#16233a]">{delivery.fournisseur}</td>
                  <td className="py-3.5 pr-3 text-[11px] tabular-nums text-slate-500">{delivery.prevue}</td>
                  <td className="py-3.5 pr-3">
                    <span className={"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold " + meta.badge}>
                      <span className={"size-1.5 rounded-full " + meta.dot} />
                      {meta.label}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200/70">
                        <motion.div
                          animate={{ width: `${delivery.progression}%` }}
                          className={"h-full rounded-full " + meta.bar}
                          initial={{ width: 0 }}
                          transition={{ delay: 0.15 + index * 0.05, duration: 0.6 }}
                        />
                      </div>
                      <span className="text-[10px] font-bold tabular-nums text-slate-500">{delivery.progression} %</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      aria-label={`Suivre la commande ${delivery.commande}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600 transition hover:border-[#e3a641]/60 hover:text-[#d19331]"
                      type="button"
                    >
                      <Icon name="arrow-up-right" size={12} />
                      Suivre
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ExecutivePanel>
  );
}
