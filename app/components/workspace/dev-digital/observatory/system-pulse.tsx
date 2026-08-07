"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { actionMeta } from "@/app/components/workspace/dev-digital/theme";
import { clockTime, type AuditLog } from "@/app/lib/dev-digital-data";

const CORE = { x: 215, y: 150 };

/* Positions dérivées des données : angle par table, distance par fraîcheur. */
function layout(logs: AuditLog[]) {
  const tables = [...new Set(logs.map((log) => log.table_cible))];
  const now = Date.now();
  const oldest = Math.max(...logs.map((log) => new Date(log.created_at).getTime()), now);

  return logs.map((log, index) => {
    const tableIndex = tables.indexOf(log.table_cible);
    const baseAngle = (tableIndex / Math.max(tables.length, 1)) * Math.PI * 2 - Math.PI / 2;
    const jitterAngle = ((index % 9) - 4) * 0.07;
    const age = now - new Date(log.created_at).getTime();
    const freshness = Math.min(Math.max((age < oldest ? age : 0) / Math.max(oldest - now + 1, 1), 0), 1);
    const radius = 40 + (1 - freshness) * 66 + (index % 5) * 7;
    const x = CORE.x + Math.cos(baseAngle + jitterAngle) * radius;
    const y = CORE.y + Math.sin(baseAngle + jitterAngle) * radius;
    return { log, x, y, freshness };
  });
}

export function SystemPulse({ logs, onSelect }: { logs: AuditLog[]; onSelect?: (log: AuditLog) => void }) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  const nodes = useMemo(() => layout(logs).slice(0, 64), [logs]);

  return (
    <div className="relative">
      <svg aria-label="Système d'audit — répartition des événements chargés" className="h-[300px] w-full" role="img" viewBox="0 0 430 300">
        <defs>
          <radialGradient id="pulse-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(92,200,255,0.35)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="pulse-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(167,139,250,0.12)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        <circle cx={CORE.x} cy={CORE.y} fill="url(#pulse-halo)" r="190" />

        {/* Traces core → events */}
        {nodes.map(({ log, x, y }) =>
          hovered === null || hovered === log.id ? (
            <line
              key={`${log.id}-link`}
              opacity={0.1}
              stroke="rgba(148,163,207,0.6)"
              strokeWidth="1"
              x1={CORE.x}
              x2={x}
              y1={CORE.y}
              y2={y}
            />
          ) : null,
        )}

        {/* Nodes */}
        {nodes.map(({ log, x, y }) => {
          const meta = actionMeta(log.action);
          const active = hovered === null || hovered === log.id;
          const isFocused = focused === log.id;
          const nodeOpacity = active ? 1 : 0.25;
          return (
            <g
              className="cursor-pointer focusable"
              key={log.id}
              onClick={() => onSelect?.(log)}
              onFocus={() => setFocused(log.id)}
              onMouseEnter={() => setHovered(log.id)}
              onMouseLeave={() => setHovered(null)}
              opacity={nodeOpacity}
              role="button"
              style={{ transition: "opacity 180ms", outline: "none" }}
              tabIndex={0}
              aria-label={`${log.action} · ${log.table_cible} · ${clockTime(log.created_at)}`}
            >
              <circle
                cx={x}
                cy={y}
                fill={meta.color}
                opacity={0.18}
                r={isFocused || hovered === log.id ? 11 : 7}
                style={{ transition: "r 180ms" }}
              />
              <circle
                cx={x}
                cy={y}
                fill={meta.color}
                r={isFocused ? 3 : 2.2}
                style={{ transition: "r 180ms" }}
              />
              <title>{`${log.action} · ${log.table_cible} · ${clockTime(log.created_at)}`}</title>
            </g>
          );
        })}

        {/* Trace central ring marker */}
        <g opacity="0.5">
          <circle cx={CORE.x} cy={CORE.y} fill="none" r="26" stroke="rgba(92,200,255,0.35)" strokeWidth="1" />
        </g>
      </svg>

      {/* Noyau central */}
      <motion.div
        animate={reduce ? undefined : { scale: [1, 1.03, 1], opacity: [0.9, 1, 0.9] }}
        className="pointer-events-none absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
        style={{ background: "radial-gradient(circle, rgba(92,200,255,0.16) 0%, transparent 70%)" }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="grid size-16 place-items-center rounded-full border border-white/[0.12] bg-[#0a0f1e]/90 text-center backdrop-blur">
          <div>
            <p className="font-mono text-[9px] font-black tracking-[0.3em] text-[#7dd3fc]">AUDIT</p>
            <p className="mt-0.5 font-mono text-[10px] font-bold text-[#e9eefb]">{nodes.length}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}