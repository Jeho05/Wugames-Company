"use client";

import { useMemo } from "react";

import { actionMeta } from "@/app/components/workspace/dev-digital/theme";
import { Icon } from "@/app/components/ui/app-icon";
import { Panel, SectionHeader } from "@/app/components/workspace/dev-digital/ui/primitives";
import { aggregateActions, aggregateByDay, type AuditLog } from "@/app/lib/dev-digital-data";

export function ActivityHeatmap({ logs }: { logs: AuditLog[] }) {
  const days = useMemo(() => aggregateByDay(logs), [logs]);
  const actions = useMemo(() => aggregateActions(logs), [logs]);

  const cell = (dayCount: number, action: string) =>
    logs.filter((log) => {
      const date = new Date(log.created_at);
      if (date.getDay() !== dayCount) return false;
      return log.action === action;
    }).length;

  const maxCell = Math.max(
    ...actions.map((a) => Math.max(...days.map((d) => cell(d.day, a.action)), 0)),
    1,
  );

  return (
    <Panel>
      <SectionHeader
        eyebrow="ACTIVITY HEATMAP"
        title="Temps forts par action"
        action={<span className="font-mono text-[9px] text-[#6b7994]">based on loaded events</span>}
      />
      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[480px]">
          <div className="grid grid-cols-[76px_repeat(7,1fr)] gap-1.5">
            <span />
            {days.map((day) => (
              <span className="text-center font-mono text-[9px] font-bold text-[#5c6889]" key={day.label}>
                {day.label}
              </span>
            ))}
            {actions.map((entry) => {
              const meta = actionMeta(entry.action);
              return (
                <div className="contents" key={entry.action}>
                  <span className="flex items-center gap-1.5 font-mono text-[9px] font-black tracking-wider" style={{ color: meta.color }}>
                    {entry.action}
                  </span>
                  {days.map((day) => {
                    const count = cell(day.day, entry.action);
                    const intensity = count === 0 ? 0 : Math.max(0.18, count / maxCell);
                    return (
                      <span
                        className="grid h-7 place-items-center rounded-md font-mono text-[9px] font-bold tabular-nums text-[#0a0f1e]/80"
                        key={`${entry.action}-${day.label}`}
                        style={{ backgroundColor: `${meta.color}${Math.round(intensity * 255).toString(16).padStart(2, "0")}` }}
                        title={`${entry.action} · ${day.label} : ${count}`}
                      >
                        {count}
                      </span>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#6b7994]">
        <Icon name="shield" size={10} /> Données calculées depuis la trace chargée uniquement
      </p>
    </Panel>
  );
}