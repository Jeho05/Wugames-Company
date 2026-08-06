"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { MovementEvent } from "@/app/lib/partner-data";

type PartnerMovementsProps = {
  movements: MovementEvent[];
};

const kindMeta: Record<MovementEvent["kind"], { icon: "arrow-down" | "arrow-up" | "refresh" | "minus" | "truck"; tile: string; sign: string }> = {
  entree: { icon: "arrow-down", tile: "bg-emerald-50 text-emerald-600", sign: "+" },
  sortie: { icon: "arrow-up", tile: "bg-rose-50 text-rose-600", sign: "−" },
  transfert: { icon: "refresh", tile: "bg-sky-50 text-sky-600", sign: "⇄" },
  correction: { icon: "minus", tile: "bg-amber-50 text-amber-600", sign: "±" },
  retour: { icon: "truck", tile: "bg-violet-50 text-violet-600", sign: "↩" },
};

export function PartnerMovements({ movements }: PartnerMovementsProps) {
  return (
    <ExecutivePanel
      action={
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
          {movements.length} mouvements
        </span>
      }
      icon="refresh"
      subtitle="Entrées, sorties, transferts et corrections"
      title="Mouvements de stock"
    >
      <ol className="relative space-y-1">
        {movements.map((movement, index) => {
          const meta = kindMeta[movement.kind];
          const isLast = index === movements.length - 1;
          return (
            <motion.li
              animate={{ opacity: 1, x: 0 }}
              className="relative flex gap-3.5 pb-4"
              initial={{ opacity: 0, x: -14 }}
              key={movement.id}
              transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[17px] top-9 h-full w-px bg-gradient-to-b from-slate-200 to-transparent"
                />
              ) : null}
              <span className={"relative z-10 grid size-9 shrink-0 place-items-center rounded-xl " + meta.tile}>
                <Icon name={meta.icon} size={16} />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="flex items-center gap-2 truncate text-[13px] font-bold text-[#16233a]">
                  {movement.title}
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-500">{meta.sign}</span>
                </p>
                <p className="mt-0.5 truncate text-[11px] leading-5 text-slate-500">{movement.detail}</p>
                <p className="mt-1 text-[10px] font-semibold text-slate-400">{movement.time}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </ExecutivePanel>
  );
}
