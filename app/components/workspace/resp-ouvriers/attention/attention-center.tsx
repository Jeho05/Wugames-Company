"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { BreathingDot, Panel } from "@/app/components/workspace/resp-ouvriers/ui/primitives";
import { LEVEL } from "@/app/components/workspace/resp-ouvriers/theme";
import type { AttentionItem } from "@/app/lib/resp-ouvriers-data";

const kindIcon = { gps: "map", rapport: "clipboard", retard: "clock", pointage: "warning" } as const;

export function AttentionCenter({
  items,
  onOpen,
}: {
  items: AttentionItem[];
  onOpen: (item: AttentionItem) => void;
}) {
  const priorities = items.filter((item) => item.level !== "normal").length;

  return (
    <Panel className="flex h-full flex-col">
      <div className="flex items-end justify-between gap-4 border-b border-[rgba(148,163,207,0.1)] px-6 pb-4 pt-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e3a641]/90">02 · Attention</p>
          <h2 className="mt-1 text-[17px] font-bold tracking-[-0.03em] text-[#e8eefb]">Ce qui mérite votre regard</h2>
        </div>
        <span className="rounded-full border border-[#f5b84d]/30 bg-[#f5b84d]/10 px-2.5 py-1 text-[10px] font-bold text-[#f5b84d]">
          {priorities} prioritaire{priorities > 1 ? "s" : ""}
        </span>
      </div>

      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
        {items.map((item, index) => {
          const meta = LEVEL[item.level];
          return (
            <motion.article
              animate={{ opacity: 1, x: 0 }}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] transition duration-200 hover:border-white/[0.16] hover:bg-white/[0.05]"
              initial={{ opacity: 0, x: 8 }}
              key={item.id}
              onClick={() => onOpen(item)}
              transition={{ duration: 0.28, delay: index * 0.05 }}
            >
              <span aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-[3px]" style={{ backgroundColor: meta.hex }} />
              <span aria-hidden="true" className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${meta.soft}, transparent 55%)` }} />

              <div className="relative flex items-start gap-3 px-4 py-3.5">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl border border-white/[0.06]" style={{ color: meta.hex, background: meta.soft }}>
                  <Icon name={kindIcon[item.kind]} size={16} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#5c6889]">{String(index + 1).padStart(2, "0")}</span>
                      <span className={"rounded-full border px-2 py-0.5 text-[9px] font-black tracking-wide " + meta.chip}>{item.kindLabel}</span>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold tabular-nums text-[#5c6889]">{item.horodatage}</span>
                  </div>

                  <p className="mt-1.5 text-[13px] font-bold leading-5 text-[#e8eefb]">{item.missionTitle}</p>
                  <p className="mt-0.5 text-[11px] leading-4 text-[#8b96b3]">
                    {item.accentNom ? <span className="font-semibold text-[#c3cbdf]">{item.accentNom}</span> : null}
                    <span className="mx-1.5 text-[#5c6889]">·</span>
                    {item.detail}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: meta.hex }}>
                      <BreathingDot color={meta.hex} size={5} />
                      {meta.label.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#e3a641] transition duration-200 group-hover:translate-x-0.5 group-hover:text-[#f6cb76]">
                      {item.kind === "gps" ? "Localiser" : "Examiner"}
                      <Icon name="arrow-right" size={12} />
                    </span>
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}

        {items.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center">
            <span className="grid size-10 place-items-center rounded-full bg-emerald-400/10 text-emerald-300">
              <Icon name="check" size={18} />
            </span>
            <p className="mt-3 text-xs font-bold text-[#dbe4f5]">Tout est sous contrôle</p>
            <p className="mt-1 text-[11px] text-[#5c6889]">Aucune situation ne nécessite votre intervention.</p>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}