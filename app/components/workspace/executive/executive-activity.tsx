"use client";

import { motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { ExecutiveActivityItem } from "@/app/lib/executive-data";

type ExecutiveActivityProps = {
  items: ExecutiveActivityItem[];
};

const typeMeta: Record<ExecutiveActivityItem["type"], { icon: "clipboard" | "file-text" | "users" | "boxes" | "hardhat" | "truck"; tile: string; ring: string }> = {
  mission: { icon: "clipboard", tile: "bg-indigo-50 text-indigo-600", ring: "ring-indigo-200" },
  facture: { icon: "file-text", tile: "bg-emerald-50 text-emerald-600", ring: "ring-emerald-200" },
  client: { icon: "users", tile: "bg-sky-50 text-sky-600", ring: "ring-sky-200" },
  stock: { icon: "boxes", tile: "bg-amber-50 text-amber-600", ring: "ring-amber-200" },
  utilisateur: { icon: "hardhat", tile: "bg-rose-50 text-rose-600", ring: "ring-rose-200" },
  fournisseur: { icon: "truck", tile: "bg-violet-50 text-violet-600", ring: "ring-violet-200" },
};

export function ExecutiveActivity({ items }: ExecutiveActivityProps) {
  const reduce = useReducedMotion();

  return (
    <ExecutivePanel
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          Temps réel
        </span>
      }
      icon="clock"
      subtitle="Derniers événements sur le groupe"
      title="Activité en direct"
    >
      <ol className="relative space-y-0">
        {items.map((item, index) => {
          const meta = typeMeta[item.type];
          return (
            <motion.li
              className="relative flex gap-3.5 pb-5 last:pb-0"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              key={item.id}
              transition={{ duration: 0.45, delay: 0.08 * index, ease: [0.22, 1, 0.36, 1] }}
            >
              {index !== items.length - 1 ? (
                <span aria-hidden="true" className="absolute left-[19px] top-11 h-[calc(100%-2.5rem)] w-px bg-slate-200" />
              ) : null}
              <span className={"relative z-10 grid size-10 shrink-0 place-items-center rounded-xl ring-4 " + meta.tile + " " + meta.ring}>
                <Icon name={meta.icon} size={17} />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-[13px] font-bold text-[#16233a]">{item.title}</p>
                <p className="mt-0.5 truncate text-[11px] text-slate-500">{item.detail}</p>
                <p className="mt-1 text-[10px] font-semibold text-slate-400">{item.time}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </ExecutivePanel>
  );
}
