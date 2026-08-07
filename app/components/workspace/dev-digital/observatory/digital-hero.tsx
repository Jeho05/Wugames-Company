"use client";

import { useMemo } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { AnimatedNumber, BreathingDot, GridBackdrop, Panel } from "@/app/components/workspace/dev-digital/ui/primitives";
import { C } from "@/app/components/workspace/dev-digital/theme";
import { SystemPulse } from "@/app/components/workspace/dev-digital/observatory/system-pulse";
import {
  aggregateActors,
  aggregateTables,
  type AuditLog,
  type DevDigitalOverview,
} from "@/app/lib/dev-digital-data";

function statusMeta(data: DevDigitalOverview) {
  const status = data.auditError?.status;
  if (status === 401) return { label: "SESSION EXPIRED", hint: "Votre session doit être renouvelée.", hex: C.rose };
  if (status === 403) return { label: "ACCESS RESTRICTED", hint: "Votre rôle ne permet pas d'accéder aux journaux d'audit.", hex: C.rose };
  if (status === 429) return { label: "RATE LIMIT REACHED", hint: "Veuillez patienter avant de réessayer.", hex: C.amber };
  if (data.logs.length === 0) return { label: "NO AUDIT SIGNAL", hint: "Aucune opération n'est enregistrée pour le filtre courant.", hex: C.amber };
  return { label: "AUDIT DATA AVAILABLE", hint: data.source === "api" ? "Chargé depuis /audit-logs" : "Jeu de démonstration — API indisponible", hex: C.green };
}

export function DigitalHero({
  data,
  onOpenLog,
}: {
  data: DevDigitalOverview;
  onOpenLog: (log: AuditLog) => void;
}) {
  const { label, hint, hex } = statusMeta(data);
  const tableLeaders = useMemo(() => aggregateTables(data.logs), [data.logs]);
  const actionKinds = useMemo(() => new Set(data.logs.map((log) => log.action)).size, [data.logs]);
  const actorCount = useMemo(() => aggregateActors(data.logs).length, [data.logs]);

  const summary = useMemo(() => {
    const total = data.logs.length;
    if (total === 0) return "Aucun événement d'audit n'est chargé. Les agrégations apparaîtront dès que des opérations seront enregistrées.";
    const leader = tableLeaders[0];
    const sentences = [
      `${total} opérations sensibles sont enregistrées dans les données chargées.`,
      leader ? `L'activité d'audit est principalement concentrée sur "${leader.table}" (${leader.count}).` : "",
      `${actorCount} acteur${actorCount > 1 ? "s" : ""} ${actorCount > 1 ? "apparaissent" : "apparaît"} dans la trace chargée.`,
    ];
    return sentences.filter(Boolean).join(" ");
  }, [data.logs.length, tableLeaders, actorCount]);

  return (
    <Panel glow="rgba(92,200,255,0.09)" className="relative">
      <GridBackdrop opacity={0.3} />
      <div className="relative z-10 grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-3 py-1.5">
              <BreathingDot color={hex} size={6} />
              <span className="font-mono text-[10px] font-black tracking-[0.24em]" style={{ color: hex }}>
                {label}
              </span>
            </span>
            <span className="hidden items-center gap-1.5 font-mono text-[10px] font-bold text-[#5c6889] sm:flex">
              <Icon name="clock" size={12} />
              {new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(data.loadedAt))}
            </span>
          </div>

          <h1 className="mt-5 text-[30px] font-black leading-[1.05] tracking-[-0.045em] text-[#eef2fb] sm:text-[38px]">
            Digital
            <br />
            Observatory<span className="text-[#5cc8ff]">.</span>
          </h1>
          <p className="mt-2 text-[15px] font-semibold text-[#c3cbdf]">System intelligence, without the noise.</p>
          <p className="mt-1 text-[13px] text-[#8b96b3]">{hint}</p>

          <p className="mt-5 max-w-md text-[12px] leading-6 text-[#8b96b3]">{summary}</p>

          <div className="mt-6 grid grid-cols-4 gap-2.5">
            {[
              { label: "Events", value: data.logs.length, hex: C.cyan },
              { label: "Tables", value: tableLeaders.length, hex: C.violet },
              { label: "Actions", value: actionKinds, hex: C.amber },
              { label: "Actors", value: actorCount, hex: C.green },
            ].map((stat) => (
              <div className="rounded-2xl border border-[rgba(148,163,207,0.14)] bg-white/[0.03] px-3.5 py-3" key={stat.label}>
                <AnimatedNumber className={"block font-mono text-[18px] font-black tabular-nums "} value={stat.value} />
                <span className="block text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: stat.hex }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <SystemPulse logs={data.logs} onSelect={onOpenLog} />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
            <div className="flex flex-col items-center gap-0.5 rounded-full border border-white/[0.1] bg-[#0a0f1e]/80 px-4 py-1.5 backdrop-blur">
              <span className="font-mono text-[8px] font-black tracking-[0.26em] text-[#6b7994]">AUDIT CONSTELLATION</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#c3cbdf]">
                <BreathingDot color={hex} size={5} />
                {data.logs.length} événement{data.logs.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}