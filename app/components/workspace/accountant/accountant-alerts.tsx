"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { AccountantPanel } from "@/app/components/workspace/accountant/accountant-panel";
import type { AlertItem } from "@/app/lib/accountant-data";

type AccountantAlertsProps = {
  alerts: AlertItem[];
};

const severityMeta: Record<AlertItem["severity"], { icon: "warning" | "clock" | "check"; tile: string; ring: string }> = {
  critical: { icon: "warning", tile: "bg-rose-500/10 text-rose-300", ring: "border-rose-500/30 bg-rose-500/[0.04]" },
  warning: { icon: "clock", tile: "bg-amber-400/10 text-amber-300", ring: "border-amber-400/25 bg-amber-400/[0.04]" },
  info: { icon: "check", tile: "bg-emerald-400/10 text-emerald-300", ring: "border-emerald-400/25 bg-emerald-400/[0.04]" },
};

export function AccountantAlerts({ alerts }: AccountantAlertsProps) {
  const criticalCount = alerts.filter((alert) => alert.severity === "critical").length;

  return (
    <AccountantPanel
      action={
        <span className={"rounded-full border px-2.5 py-1 text-[10px] font-bold " + (criticalCount > 0 ? "border-rose-500/30 bg-rose-500/10 text-rose-300" : "border-emerald-400/25 bg-emerald-400/10 text-emerald-300")}>
          {criticalCount > 0 ? `${criticalCount} critique(s)` : "Situation saine"}
        </span>
      }
      icon="warning"
      subtitle="Risques et points d'attention"
      title="Alertes financières"
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
    </AccountantPanel>
  );
}
