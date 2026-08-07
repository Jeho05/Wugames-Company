"use client";

import { useMemo } from "react";

import { actionMeta } from "@/app/components/workspace/dev-digital/theme";
import { AnimatedNumber, Panel, SectionHeader } from "@/app/components/workspace/dev-digital/ui/primitives";
import { aggregateActions, type AuditLog } from "@/app/lib/dev-digital-data";

export function ActionMix({
  logs,
  onSelectAction,
}: {
  logs: AuditLog[];
  onSelectAction: (action: string) => void;
}) {
  const actions = useMemo(() => aggregateActions(logs), [logs]);
  const total = logs.length;

  return (
    <Panel>
      <SectionHeader eyebrow="ACTION MIX" title="Répartition des opérations" />
      {total === 0 ? (
        <p className="mt-6 text-center font-mono text-[11px] font-bold text-[#5c6889]">En attente de signaux d&apos;audit</p>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
            {actions.map((entry) => {
              const meta = actionMeta(entry.action);
              return (
                <button
                  aria-label={`${entry.action} : ${entry.count}`}
                  className="h-full transition hover:brightness-125"
                  key={entry.action}
                  onClick={() => onSelectAction(entry.action)}
                  style={{ backgroundColor: meta.color, width: `${(entry.count / total) * 100}%` }}
                  title={`${entry.action} — ${entry.count}`}
                  type="button"
                />
              );
            })}
          </div>
          {actions.map((entry) => {
            const meta = actionMeta(entry.action);
            const pct = Math.round((entry.count / total) * 100);
            return (
              <button
                className="flex w-full items-center gap-3 rounded-lg px-1 py-0.5 text-left transition hover:bg-white/[0.03]"
                key={entry.action}
                onClick={() => onSelectAction(entry.action)}
                type="button"
              >
                <span
                  className="grid h-6 w-14 place-items-center rounded-md border font-mono text-[9px] font-black tracking-wider"
                  style={{ borderColor: `${meta.color}40`, backgroundColor: meta.soft, color: meta.color }}
                >
                  {entry.action}
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <span className="block h-full rounded-full" style={{ backgroundColor: meta.color, width: `${pct}%` }} />
                </span>
                <AnimatedNumber className="w-8 text-right font-mono text-[11px] font-black tabular-nums text-[#c3cbdf]" value={pct} />
                <span className="w-9 text-right font-mono text-[10px] tabular-nums text-[#5c6889]">{entry.count}</span>
              </button>
            );
          })}
        </div>
      )}
    </Panel>
  );
}