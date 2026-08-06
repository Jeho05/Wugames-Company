"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { PartnerAlert } from "@/app/lib/partner-data";

type PartnerAlertsProps = {
  alerts: PartnerAlert[];
};

const severityMeta: Record<PartnerAlert["severity"], { label: string; badge: string; dot: string }> = {
  critical: { label: "Critique", badge: "border-rose-200 bg-rose-50 text-rose-700", dot: "bg-rose-500" },
  warning: { label: "Attention", badge: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  info: { label: "Info", badge: "border-sky-200 bg-sky-50 text-sky-700", dot: "bg-sky-500" },
};

export function PartnerAlerts({ alerts }: PartnerAlertsProps) {
  return (
    <ExecutivePanel
      action={
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
          {alerts.length} alertes
        </span>
      }
      icon="warning"
      subtitle="Ruptures, seuils bas et retards de livraison"
      title="Alertes stock"
    >
      <ul className="space-y-2.5">
        {alerts.map((alert, index) => {
          const meta = severityMeta[alert.severity];
          return (
            <motion.li
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 transition hover:bg-white"
              initial={{ opacity: 0, x: -14 }}
              key={alert.id}
              transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className={"mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl " + meta.badge}>
                <Icon name={alert.severity === "info" ? "check" : "warning"} size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-[#16233a]">{alert.title}</p>
                <p className="mt-0.5 text-[11px] leading-5 text-slate-500">{alert.detail}</p>
              </div>
              <span className={"inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold " + meta.badge}>
                <span className={"size-1.5 rounded-full " + meta.dot} />
                {meta.label}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </ExecutivePanel>
  );
}
