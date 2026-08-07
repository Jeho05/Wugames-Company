"use client";

import { useState } from "react";

import { useSmartPolling } from "@/app/hooks/use-smart-polling";
import { BreathingDot, Panel, SectionHeader } from "@/app/components/workspace/dev-digital/ui/primitives";
import { C } from "@/app/components/workspace/dev-digital/theme";
import type { HealthStatus } from "@/app/lib/dev-digital-data";

function formatChecked(ts: number | undefined) {
  if (!ts) return "—";
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(ts));
}

export function ApiHealth({
  health,
  onRefresh,
  intervalMs = 30000,
}: {
  health: HealthStatus | null;
  onRefresh: () => void;
  intervalMs?: number;
}) {
  const [spinning, setSpinning] = useState(false);

  useSmartPolling(
    () => {
      setSpinning(true);
      window.setTimeout(() => setSpinning(false), 600);
      onRefresh();
    },
    intervalMs,
    { skip: intervalMs <= 0, backoffFactor: 2, maxBackoff: 4 },
  );

  const reachable = health?.statut === "ok";
  const databaseOk = health?.database === "connected";
  const offline = !health;

  return (
    <Panel>
      <SectionHeader
        eyebrow="SIGNAL"
        title="Pulse de l'API"
        action={
          <button
            aria-label="Rafraîchir le heartbeat"
            className="grid size-7 place-items-center rounded-lg border border-white/[0.08] text-[#5c6889] transition hover:border-[#5cc8ff]/40 hover:text-[#7dd3fc]"
            onClick={onRefresh}
            type="button"
          >
            <svg className={spinning ? "animate-spin" : ""} fill="none" height="13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </svg>
          </button>
        }
      />
      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
          <span className="flex items-center gap-2 text-[11px] font-bold text-[#8b96b3]">
            <BreathingDot color={reachable ? C.green : C.rose} size={6} />
            Endpoint /health
          </span>
          <span className={"font-mono text-[10px] font-black tracking-wider " + (reachable ? "text-[#3ddc97]" : "text-[#f58ea8]")}>
            {offline ? "UNREACHABLE" : (health?.statut ?? "?").toUpperCase()}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
          <span className="flex items-center gap-2 text-[10px] font-bold text-[#a3aec7]">
            Base de données
          </span>
          <span className={"flex items-center gap-1.5 font-mono text-[10px] font-black tracking-wider " + (databaseOk ? "text-[#3ddc97]" : "text-[#f58ea8]")}>
            {offline ? "indisponible" : (health?.database ?? "inconnu")}
            <BreathingDot color={databaseOk ? C.green : C.rose} size={5} />
          </span>
        </div>
        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.16em] text-[#4a5675]">
          <span>Vérifié à</span>
          <span className="font-mono normal-case tracking-normal text-[#5c6889]">{formatChecked(health?.checkedAt)}</span>
        </div>
      </div>
      <p className="mt-3 rounded-lg border border-white/[0.05] bg-white/[0.01] px-2.5 py-2 text-[9px] leading-4 text-[#5c6889]">
        Heartbeat pollé avec retenue. En cas de limite (429), l&apos;intervalle est suspendu — aucune donnée inventée.
      </p>
    </Panel>
  );
}