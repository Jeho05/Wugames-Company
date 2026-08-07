"use client";

import { useState } from "react";
import { motion } from "motion/react";

import { Avatar, Panel, Spark } from "@/app/components/workspace/resp-ouvriers/ui/primitives";
import { useCountUp } from "@/app/components/workspace/resp-ouvriers/ui/primitives";
import type { FieldPerformance } from "@/app/lib/resp-ouvriers-data";

export function PerformancePanel({ rows }: { rows: FieldPerformance[] }) {
  const [selected, setSelected] = useState<string>(rows[0]?.id ?? "");
  const active = rows.find((row) => row.id === selected) ?? rows[0];

  return (
    <Panel className="h-full">
      <div className="flex items-end justify-between gap-4 border-b border-[rgba(148,163,207,0.1)] px-6 pb-4 pt-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e3a641]/90">08 · Performance</p>
          <h2 className="mt-1 text-[17px] font-bold tracking-[-0.03em] text-[#e8eefb]">Classement 9S</h2>
        </div>
        {active ? (
          <span className="rounded-full border border-white/[0.1] bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] font-bold text-[#e3a641]">
            {active.cycle}
          </span>
        ) : null}
      </div>

      <div className="p-4">
        {active ? <Gauge active={active} /> : null}

        <ul className="mt-3 space-y-1">
          {rows.map((row, index) => {
            const isActive = row.id === selected;
            return (
              <motion.li
                animate={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: 10 }}
                key={row.id}
                transition={{ delay: index * 0.04, duration: 0.3 }}
              >
                <button
                  className={
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition " +
                    (isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.03]")
                  }
                  onClick={() => setSelected(row.id)}
                  type="button"
                >
                  <span className="w-5 text-center font-mono text-[13px] font-bold text-[#5c6889]">
                    {row.rang || index + 1}
                  </span>
                  <Avatar initials={row.initiales} size={34} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-bold text-[#e8eefb]">{row.nom}</span>
                    <span className="block text-[10px] text-[#8b96b3]">Global {row.rendementGlobal.toFixed(1)}%</span>
                  </span>
                  <Spark color="#5cc8ff" values={row.s9} className="h-6" />
                  <span className="w-12 text-right font-mono text-[13px] font-bold tabular-nums text-[#e8eefb]">
                    {row.rendement9S.toFixed(1)}%
                  </span>
                  <span
                    className="grid size-5 place-items-center rounded-full border border-white/[0.08]"
                    style={{ color: trendColor(row.evolution) }}
                  >
                    {row.evolution === "up" ? "▲" : row.evolution === "down" ? "▼" : "▬"}
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </Panel>
  );
}

function trendColor(evolution: FieldPerformance["evolution"]): string {
  return evolution === "up" ? "#3ddc97" : evolution === "down" ? "#ff8ba0" : "#8b96b3";
}

function Gauge({ active }: { active: FieldPerformance }) {
  const top = active.rendement9S / 100;
  const count = useCountUp(top * 100, 700);
  return (
    <div className="flex items-center gap-5 rounded-2xl border border-white/[0.08] bg-[#0f172f]/60 p-4">
      <div className="relative grid size-20 shrink-0 place-items-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" fill="none" r="44" stroke="rgba(148,163,207,0.15)" strokeWidth="7" />
          <circle
            cx="50"
            cy="50"
            fill="none"
            r="44"
            stroke="#5cc8ff"
            strokeDasharray={2 * Math.PI * 44}
            strokeDashoffset={2 * Math.PI * 44 * (1 - top)}
            strokeLinecap="round"
            strokeWidth="7"
          />
        </svg>
        <span className="font-mono text-[15px] font-black tabular-nums text-white">{count.toFixed(1)}%</span>
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-[#e8eefb]">{active.nom}</p>
        <p className="text-[11px] text-[#8b96b3]">Rendement 9S · rang {active.rang}</p>
        <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-[#5c6889]">
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-[#5cc8ff]" /> Début de cycle
          </span>
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-[#e3a641]" /> Fin de cycle
          </span>
        </div>
      </div>
    </div>
  );
}