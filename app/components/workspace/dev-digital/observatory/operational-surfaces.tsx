"use client";

import { useMemo } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { AnimatedNumber, Panel, SectionHeader } from "@/app/components/workspace/dev-digital/ui/primitives";
import { aggregateTables, type AuditLog } from "@/app/lib/dev-digital-data";

export function OperationalSurfaces({
  logs,
  onSelectTable,
}: {
  logs: AuditLog[];
  onSelectTable: (table: string) => void;
}) {
  const tables = useMemo(() => aggregateTables(logs), [logs]);
  const max = tables[0]?.count ?? 1;

  return (
    <Panel>
      <SectionHeader eyebrow="OPERATIONAL SURFACES" title="Volume par surface" />
      {tables.length === 0 ? (
        <p className="mt-6 text-center font-mono text-[11px] font-bold text-[#5c6889]">En attente de signaux d&apos;audit</p>
      ) : (
        <div className="mt-5 flex h-40 items-end gap-3">
          {tables.map((table) => (
            <button
              className="group flex h-full flex-1 flex-col justify-end gap-1.5 focus:outline-none"
              key={table.table}
              onClick={() => onSelectTable(table.table)}
              type="button"
            >
              <span className="text-center font-mono text-[11px] font-black tabular-nums opacity-80 transition group-hover:opacity-100" style={{ color: table.hex }}>
                <AnimatedNumber value={table.count} />
              </span>
              <div className="relative h-28 overflow-hidden rounded-lg">
                <div
                  className="absolute inset-x-0 bottom-0 origin-bottom transition-all duration-700 ease-out group-hover:brightness-125"
                  style={{
                    height: `${Math.max((table.count / max) * 100, 6)}%`,
                    background: `linear-gradient(to top, ${table.hex}55, ${table.hex})`,
                  }}
                />
              </div>
              <span className="truncate text-center font-mono text-[9px] font-bold text-[#8b96b3]">{table.table}</span>
            </button>
          ))}
        </div>
      )}
      <p className="mt-3 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#6b7994]">
        <Icon name="lock" size={10} /> Immutable records · click to filter
      </p>
    </Panel>
  );
}