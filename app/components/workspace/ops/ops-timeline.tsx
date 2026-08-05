"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { OpsPanel } from "@/app/components/workspace/ops/ops-panel";
import type { OpsTimelineEvent } from "@/app/lib/ops-data";

type OpsTimelineProps = {
  events: OpsTimelineEvent[];
};

const kindMeta: Record<OpsTimelineEvent["kind"], { icon: "plus" | "hardhat" | "check" | "users" | "sparkles" | "warning"; tile: string }> = {
  creee: { icon: "plus", tile: "bg-sky-400/10 text-sky-300" },
  demarree: { icon: "hardhat", tile: "bg-emerald-400/10 text-emerald-300" },
  terminee: { icon: "check", tile: "bg-emerald-400/10 text-emerald-300" },
  equipe: { icon: "users", tile: "bg-violet-400/10 text-violet-300" },
  validation: { icon: "sparkles", tile: "bg-amber-400/10 text-amber-300" },
  incident: { icon: "warning", tile: "bg-rose-500/10 text-rose-300" },
};

export function OpsTimeline({ events }: OpsTimelineProps) {
  return (
    <OpsPanel
      action={
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
          Direct
        </span>
      }
      icon="clock"
      subtitle="Chronologie des opérations terrain"
      title="Chronologie"
    >
      <ol className="relative space-y-1">
        {events.map((event, index) => {
          const meta = kindMeta[event.kind];
          const isLast = index === events.length - 1;
          return (
            <motion.li
              animate={{ opacity: 1, x: 0 }}
              className="relative flex gap-3.5 pb-4"
              initial={{ opacity: 0, x: -16 }}
              key={event.id}
              transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[17px] top-9 h-full w-px bg-gradient-to-b from-white/10 to-transparent"
                />
              ) : null}
              <span className={"relative z-10 grid size-9 shrink-0 place-items-center rounded-xl " + meta.tile}>
                <Icon name={meta.icon} size={16} />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="truncate text-[13px] font-bold text-white">{event.title}</p>
                <p className="mt-0.5 truncate text-[11px] leading-5 text-slate-400">{event.detail}</p>
                <p className="mt-1 text-[10px] font-semibold text-slate-500">{event.time}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </OpsPanel>
  );
}
