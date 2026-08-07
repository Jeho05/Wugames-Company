"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { Avatar, Panel } from "@/app/components/workspace/resp-ouvriers/ui/primitives";
import { LEVEL } from "@/app/components/workspace/resp-ouvriers/theme";
import type { ActivityEvent } from "@/app/lib/resp-ouvriers-data";

const kindMeta: Record<ActivityEvent["kind"], { icon: "map" | "hardhat" | "camera" | "clipboard" | "warning" | "check"; hex: string }> = {
  arrivee: { icon: "map", hex: "#3ddc97" },
  demarrage: { icon: "hardhat", hex: "#5cc8ff" },
  photo: { icon: "camera", hex: "#a78bfa" },
  rapport: { icon: "clipboard", hex: "#f5b84d" },
  alerte: { icon: "warning", hex: "#ff8ba0" },
  validation: { icon: "check", hex: "#3ddc97" },
};

export function LiveActivity({ events }: { events: ActivityEvent[] }) {
  return (
    <Panel className="flex h-full flex-col">
      <div className="flex items-end justify-between gap-4 border-b border-[rgba(148,163,207,0.1)] px-6 pb-4 pt-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e3a641]/90">03 · Live</p>
          <h2 className="mt-1 text-[17px] font-bold tracking-[-0.03em] text-[#e8eefb]">Activité terrain en direct</h2>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live
        </span>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto p-5">
        <div className="relative space-y-0 pl-6">
          <span aria-hidden="true" className="absolute bottom-2 left-[9px] top-2 w-px bg-gradient-to-b from-[#3ddc97]/40 via-[#3ddc97]/15 to-transparent" />

          {events.map((event, index) => {
            const meta = kindMeta[event.kind];
            const tone = event.tone === "ok" ? "#3ddc97" : LEVEL[event.tone].hex;
            return (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="group relative pb-4"
                initial={{ opacity: 0, y: 8 }}
                key={event.id}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <span
                  className="absolute -left-6 top-1 grid size-[18px] place-items-center rounded-full border border-white/10 bg-[#0f172f]"
                  style={{ color: meta.hex }}
                >
                  <Icon name={meta.icon} size={10} />
                </span>

                <div className="flex items-start gap-3 rounded-2xl border border-transparent p-2 transition duration-200 group-hover:border-white/[0.06] group-hover:bg-white/[0.03]">
                  <Avatar initials={event.workerInitiales} ring="#1" size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-[12px] font-bold text-[#e8eefb]">
                        <span className="truncate">{event.title}</span>
                        <span className="font-mono text-[10px] font-semibold text-[#5c6889]">· {event.time}</span>
                      </p>
                      <span className="shrink-0" style={{ color: tone }}>
                        {event.tone === "ok" ? <Icon name="check" size={13} /> : <Icon name="warning" size={12} />}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-[#8b96b3]">{event.worker} · {event.mission}</p>
                    <p className="mt-0.5 text-[11px] leading-4 text-[#5c6889]">{event.detail}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}