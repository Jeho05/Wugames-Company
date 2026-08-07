"use client";

import { useMemo, useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { BreathingDot, Panel, SectionHeader } from "@/app/components/workspace/dev-digital/ui/primitives";
import {
  aggregateTables,
  humanTableLabel,
  type AuditLog,
} from "@/app/lib/dev-digital-data";

function clusterPath(cx: number, cy: number, count: number, index: number, total: number) {
  const angle = (index / total) * Math.PI * 2;
  const radius = 10 + Math.min(count * 1.8, 26);
  const x = cx + Math.cos(angle) * radius * 0.6;
  const y = cy + Math.sin(angle) * radius * 0.6;
  return { x, y, radius: 2 + Math.min(count / 5, 5) };
}

export function AuditConstellation({
  logs,
  onSelectTable,
}: {
  logs: AuditLog[];
  onSelectTable: (table: string) => void;
}) {
  const clusters = useMemo(() => aggregateTables(logs), [logs]);
  const [active, setActive] = useState<string | null>(null);
  const maxCount = clusters[0]?.count ?? 0;

  if (clusters.length === 0) {
    return (
      <Panel className="grid min-h-44 place-items-center">
        <p className="flex items-center gap-2 font-mono text-[11px] font-bold text-[#5c6889]">
          <Icon name="activity" size={14} /> En attente de signaux d&apos;audit
        </p>
      </Panel>
    );
  }

  const perCluster = 5;
  return (
    <Panel className="relative overflow-hidden">
      <SectionHeader
        eyebrow="AUDIT CONSTELLATION"
        title="Signaux par surface"
        action={<span className="font-mono text-[10px] text-[#5c6889]">{clusters.length} surfaces</span>}
      />
      <div className="relative mt-2 h-[290px]">
        <svg className="h-full w-full" role="img" viewBox="0 0 430 290" aria-label="Constellation des surfaces d'audit">
          {clusters.map((cluster, index) => {
            const angle = (index / Math.max(clusters.length, 1)) * Math.PI * 2 - Math.PI / 2;
            const cx = 215 + Math.cos(angle) * 118;
            const cy = 145 + Math.sin(angle) * 92;
            const isActive = active === cluster.table;
            const dimmed = active !== null && !isActive;
            return (
              <g
                className="cursor-pointer"
                key={cluster.table}
                onClick={() => onSelectTable(cluster.table)}
                onMouseEnter={() => setActive(cluster.table)}
                onMouseLeave={() => setActive(null)}
                opacity={dimmed ? 0.35 : 1}
                role="button"
                tabIndex={0}
                transform={`translate(${cx} ${cy})`}
              >
                <circle
                  className="transition-all duration-300"
                  fill={`${cluster.hex}12`}
                  r={isActive ? 52 : 44 + (cluster.count / Math.max(maxCount, 1)) * 14}
                  stroke={`${cluster.hex}33`}
                  strokeWidth={1}
                />
                <circle className="transition-all duration-300" fill="none" r={40} stroke={`${cluster.hex}18`} strokeDasharray="2 6" strokeWidth={1} />
                {Array.from({ length: perCluster }).map((_, nodeIndex) => {
                  const pos = clusterPath(cx - cx, cy - cy, cluster.count, nodeIndex, perCluster);
                  return (
                    <circle
                      className="transition-all duration-300"
                      fill={cluster.hex}
                      key={nodeIndex}
                      opacity={0.75}
                      r={pos.radius}
                      cx={pos.x}
                      cy={pos.y}
                    />
                  );
                })}
                <text className="fill-[#e9eefb] font-mono font-bold" textAnchor="middle" y={-56}>
                  {cluster.count}
                </text>
                <text className="fill-[#5c6889] font-mono" fontSize={8} textAnchor="middle" y={58}>
                  {cluster.table}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {clusters.map((cluster) => (
          <button
            className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-left transition hover:border-white/[0.16] hover:bg-white/[0.05]"
            key={cluster.table}
            onClick={() => onSelectTable(cluster.table)}
            type="button"
          >
            <BreathingDot color={cluster.hex} size={6} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-mono text-[10px] font-bold text-[#c3cbdf]">{cluster.table}</span>
              <span className="block truncate text-[9px] text-[#5c6889]">{humanTableLabel(cluster.table)}</span>
            </span>
            <span className="font-mono text-[11px] font-black tabular-nums" style={{ color: cluster.hex }}>
              {cluster.count}
            </span>
          </button>
        ))}
      </div>
    </Panel>
  );
}