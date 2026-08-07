"use client";

import { useMemo } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { Avatar, BreathingDot, Panel, SectionHeader } from "@/app/components/workspace/dev-digital/ui/primitives";
import { aggregateActors, type AuditLog } from "@/app/lib/dev-digital-data";

export function ActorList({
  logs,
  activeUserId,
  onSelect,
}: {
  logs: AuditLog[];
  activeUserId: string | null;
  onSelect: (userId: string | null) => void;
}) {
  const actors = useMemo(() => aggregateActors(logs), [logs]);
  const max = actors[0]?.count ?? 1;

  return (
    <Panel>
      <SectionHeader eyebrow="ACTORS" title="Qui opère ?" action={<span className="font-mono text-[10px] text-[#5c6889]">{actors.length}</span>} />
      {actors.length === 0 ? (
        <p className="mt-6 text-center font-mono text-[11px] font-bold text-[#5c6889]">En attente de signaux d&apos;audit</p>
      ) : (
        <ul className="mt-4 space-y-1.5">
          {actors.map((actor, index) => {
            const active = activeUserId === actor.id;
            return (
              <li key={actor.id}>
                <button
                  aria-pressed={active}
                  className={
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition " +
                    (active
                      ? "border-[#a78bfa]/40 bg-[#a78bfa]/10"
                      : "border-transparent hover:border-white/[0.1] hover:bg-white/[0.03]")
                  }
                  onClick={() => onSelect(active ? null : actor.id)}
                  type="button"
                >
                  <span className="w-4 text-center font-mono text-[10px] font-black text-[#4a5675]">{index + 1}</span>
                  <Avatar initials={actor.initials} size={30} ring={active ? "rgba(167,139,250,0.5)" : "rgba(148,163,207,0.2)"} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-bold text-[#c3cbdf]">{actor.name}</p>
                    <p className="truncate text-[9px] text-[#5c6889]">{actor.email ?? "Adresse inconnue"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-16 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-[#a78bfa]" style={{ width: `${(actor.count / max) * 100}%` }} />
                    </div>
                    <BreathingDot color="#a78bfa" size={5} />
                    <span className="w-6 text-right font-mono text-[11px] font-black tabular-nums text-[#e9eefb]">{actor.count}</span>
                  </div>
                  <Icon className={"text-[#4a5675] " + (active ? "text-[#a78bfa]" : "")} name="chevron-down" size={12} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}