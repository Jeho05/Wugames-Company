"use client";

import { motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { AlertSeverity, ExecutiveAlert } from "@/app/lib/executive-data";

type ExecutiveAlertsProps = {
  alerts: ExecutiveAlert[];
};

const severityMeta: Record<AlertSeverity, { bar: string; icon: string; badge: string; label: string }> = {
  critical: {
    bar: "bg-red-500",
    icon: "bg-red-50 text-red-600",
    badge: "border-red-200 bg-red-50 text-red-700",
    label: "Critique",
  },
  warning: {
    bar: "bg-amber-500",
    icon: "bg-amber-50 text-amber-600",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    label: "Attention",
  },
  info: {
    bar: "bg-sky-500",
    icon: "bg-sky-50 text-sky-600",
    badge: "border-sky-200 bg-sky-50 text-sky-700",
    label: "Info",
  },
};

const order = { critical: 0, warning: 1, info: 2 } as const;

export function ExecutiveAlerts({ alerts }: ExecutiveAlertsProps) {
  const reduce = useReducedMotion();
  const sorted = [...alerts].sort((a, b) => order[a.severity] - order[b.severity]);

  return (
    <ExecutivePanel
      icon="warning"
      subtitle="Ce qui requiert votre attention"
      title="Centre des alertes"
    >
      <ul className="space-y-2.5">
        {sorted.map((alert, index) => {
          const meta = severityMeta[alert.severity];
          return (
            <motion.li
              className="group relative flex items-start gap-3 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition-colors duration-200 hover:border-slate-200 hover:bg-white"
              initial={reduce ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              key={alert.id}
              transition={{ duration: 0.45, delay: 0.06 * index, ease: [0.22, 1, 0.36, 1] }}
            >
              <span aria-hidden="true" className={"absolute inset-y-0 left-0 w-1 " + meta.bar} />
              <span className={"grid size-8 shrink-0 place-items-center rounded-xl " + meta.icon}>
                <Icon name={alert.severity === "critical" ? "warning" : alert.severity === "warning" ? "bell" : "clock"} size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[13px] font-bold text-[#16233a]">{alert.title}</p>
                  <span className={"shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide " + meta.badge}>
                    {meta.label}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{alert.detail}</p>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </ExecutivePanel>
  );
}
