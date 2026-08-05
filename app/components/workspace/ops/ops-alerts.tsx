"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { OpsPanel } from "@/app/components/workspace/ops/ops-panel";
import type { OpsAlert } from "@/app/lib/ops-data";

type OpsAlertsProps = {
  alerts: OpsAlert[];
};

const severityMeta: Record<OpsAlert["severity"], { icon: "warning" | "clock" | "check"; tile: string; ring: string }> = {
  critical: { icon: "warning", tile: "bg-rose-500/10 text-rose-300", ring: "border-rose-500/30 bg-rose-500/[0.04]" },
  warning: { icon: "clock", tile: "bg-amber-400/10 text-amber-300", ring: "border-amber-400/25 bg-amber-400/[0.04]" },
  info: { icon: "check", tile: "bg-emerald-400/10 text-emerald-300", ring: "border-emerald-400/25 bg-emerald-400/[0.04]" },
};

export function OpsAlerts({ alerts }: OpsAlertsProps) {
  const criticalCount = alerts.filter((alert) => alert.severity === "critical").length;

  return (
    <OpsPanel
      action={
        <span className={"rounded-full border px-2.5 py-1 text-[10px] font-bold " + (criticalCount > 0 ? "border-rose-500/30 bg-rose-500/10 text-rose-300" : "border-emerald-400/25 bg-emerald-400/10 text-emerald-300")}>
          {criticalCount > 0 ? `${criticalCount} urgence(s)` : "Salle verte"}
        </span>
      }
      icon="warning"
      subtitle="Incidents, retards et blocages"
      title="Panneau d'urgence"
    >
      <ul className="space-y-2">
        {alerts.map((alert, index) => {
          const meta = severityMeta[alert.severity];
          return (
            <motion.li
              animate={{ opacity: 1, x: 0 }}
              className={"flex items-start gap-3 rounded-2xl border p-3.5 " + meta.ring}
              initial={{ opacity: 0, x: -16 }}
              key={alert.id}
              transition={{ delay: index * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className={"grid size-8 shrink-0 place-items-center rounded-xl " + meta.tile}>
                <Icon name={meta.icon} size={15} />
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] font-bold text-white">{alert.title}</span>
                <span className="mt-0.5 block text-[10px] leading-4 text-slate-400">{alert.detail}</span>
              </span>
            </motion.li>
          );
        })}
      </ul>
    </OpsPanel>
  );
}
