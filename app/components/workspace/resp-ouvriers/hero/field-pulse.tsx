"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { BreathingDot, GridBackdrop, Panel } from "@/app/components/workspace/resp-ouvriers/ui/primitives";
import { C, FIELD_STATUS } from "@/app/components/workspace/resp-ouvriers/theme";
import {
  FIELD_STATUS_LABEL,
  type FieldMission,
  type FieldStatus,
  type RespOuvriersOverview,
} from "@/app/lib/resp-ouvriers-data";

/* ------------------------------------------------------------------ */
/* Petit réseau animé : ouvriers → missions (agents → chantiers)       */
/* ------------------------------------------------------------------ */

function FieldNet({ missions }: { missions: FieldMission[] }) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);

  const nodes = useMemo(() => {
    const active = missions.filter((mission) => mission.statut === "EN_COURS" || mission.statut === "POINTAGE_A_VERIFIER" || mission.statut === "RAPPORT_SOUMIS").slice(0, 6);
    return active.map((mission, index) => {
      const angle = (index / Math.max(active.length, 1)) * Math.PI * 2 - Math.PI / 2;
      const radius = 118;
      const x = 210 + Math.cos(angle) * radius;
      const y = 118 + Math.sin(angle) * radius;
      return { mission, x, y };
    });
  }, [missions]);

  const workerDots = useMemo(() => {
    const active = missions.filter((mission) => mission.workerNom && mission.workerNom !== "À affecter");
    const seen = new Set<string>();
    return active
      .map((mission) => mission.workerNom)
      .filter((nom): nom is string => (nom ? (seen.has(nom) ? false : (seen.add(nom), true)) : false))
      .slice(0, 5)
      .map((_, index) => {
        const angle = (index / 5) * Math.PI * 2 + Math.PI / 5;
        const radius = 46;
        return { x: 210 + Math.cos(angle) * radius, y: 118 + Math.sin(angle) * radius };
      });
  }, [missions]);

  const stateOf = (mission: FieldMission) =>
    mission.statut === "POINTAGE_A_VERIFIER" ? C.rose : mission.statut === "RAPPORT_SOUMIS" ? C.amber : C.green;

  return (
    <svg
      aria-hidden="true"
      className="h-[236px] w-full"
      onMouseLeave={() => setHovered(null)}
      viewBox="0 0 420 236"
    >
      <defs>
        <radialGradient id="net-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(80,120,200,0.16)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      <circle cx="210" cy="118" fill="url(#net-glow)" r="140" />

      {nodes.map(({ mission, x, y }) => {
        const color = stateOf(mission);
        const isDimmed = hovered !== null && hovered !== mission.id;
        return (
          <g
            className="cursor-pointer"
            key={mission.id}
            onMouseEnter={() => setHovered(mission.id)}
            opacity={isDimmed ? 0.35 : 1}
            style={{ transition: "opacity 220ms" }}
          >
            <line
              stroke="rgba(148,163,207,0.22)"
              strokeDasharray="3 5"
              strokeWidth="1"
              x1="210"
              x2={x}
              y1="118"
              y2={y}
            />
            {!reduce ? (
              <circle cx={x} cy={y} fill="none" r={18} stroke={color} strokeWidth="1">
                <animate attributeName="r" dur="2.6s" repeatCount="indefinite" values="10;20;10" />
                <animate attributeName="opacity" dur="2.6s" repeatCount="indefinite" values="0.5;0;0.5" />
              </circle>
            ) : null}
            <circle cx={x} cy={y} fill="#0a0f1e" r="6.5" stroke={color} strokeWidth="2" />
            <circle cx={x} cy={y} fill={color} r="3" />
            <text
              fill="#8b96b3"
              fontSize="9"
              fontWeight="700"
              textAnchor="middle"
              x={x}
              y={y + 26}
            >
              {mission.titre.length > 16 ? mission.titre.slice(0, 16) + "…" : mission.titre}
            </text>
          </g>
        );
      })}

      {workerDots.map((dot, index) => (
        <g key={index} opacity={hovered !== null ? 0.4 : 1} style={{ transition: "opacity 220ms" }}>
          <circle cx={dot.x} cy={dot.y} fill="#16224a" r="4" stroke="rgba(148,163,207,0.4)" strokeWidth="1" />
        </g>
      ))}

      {hovered ? (
        <g pointerEvents="none">
          <circle cx="210" cy="118" fill="none" r={26} stroke={stateOf(missions.find((m) => m.id === hovered) ?? missions[0])} strokeOpacity="0.5" strokeWidth="1" />
        </g>
      ) : null}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Data orbit : mini blocs autour du centre                            */
/* ------------------------------------------------------------------ */

const orbitItems = [
  { key: "missions", label: "MISSIONS", icon: "hardhat" as const },
  { key: "ouvriers", label: "OUVRIERS", icon: "users" as const },
  { key: "rapports", label: "RAPPORTS", icon: "clipboard" as const },
  { key: "alertes", label: "ALERTES", icon: "warning" as const },
];

function OrbitNumber({ value, label, icon, color }: { value: number; label: string; icon: "hardhat" | "users" | "clipboard" | "warning"; color: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[rgba(148,163,207,0.12)] bg-white/[0.03] px-3.5 py-3 transition duration-200 hover:border-white/20 hover:bg-white/[0.06]">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[22px] font-bold tracking-[-0.04em]" style={{ color }}>
          {String(value).padStart(2, "0")}
        </p>
        <Icon className="text-[#5c6889] transition group-hover:text-[#aab6d4]" name={icon} size={15} />
      </div>
      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#5c6889]">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero — Field Pulse                                                  */
/* ------------------------------------------------------------------ */

const statusPhrase: Record<FieldStatus, string> = {
  operational: "L'activité terrain est stable. Toutes les missions avancent selon le plan.",
  attention: "Quelques situations nécessitent votre attention aujourd'hui.",
  "action-required": "Des anomalies nécessitent une décision immédiate de votre part.",
};

export function FieldPulse({
  overview,
  onOpenMission,
}: {
  overview: Pick<RespOuvriersOverview, "status" | "orbital" | "updatedAt" | "attention" | "missions" | "firstName">;
  onOpenMission: (id: string) => void;
}) {
  const status = FIELD_STATUS[overview.status];
  const firstName = overview.firstName ?? "Commandant";
  const phrase = statusPhrase[overview.status];
  const activeCount = overview.orbital.enCours;
  const attentionCount = overview.attention.filter((item) => item.level !== "normal").length;
  const contextLine =
    activeCount > 0
      ? `${activeCount} mission${activeCount > 1 ? "s" : ""} suivie${activeCount > 1 ? "s" : ""} par votre équipe.`
      : `${overview.orbital.ouvriers} ouvriers sur le terrain.`;

  return (
    <Panel glow="rgba(61, 150, 255, 0.10)" className="relative">
      <GridBackdrop />
      <div className="relative z-10 grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
        {/* Texte + statut + orbite */}
        <div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-[#e3a641]/30 bg-[#e3a641]/10 px-3 py-1.5">
              <BreathingDot color={status.hex} size={6} />
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#f6cb76]">{FIELD_STATUS_LABEL[overview.status]}</span>
            </span>
            <span className="hidden items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5c6889] sm:flex">
              <Icon name="clock" size={12} />
              {new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(overview.updatedAt))}
            </span>
          </div>

          <h1 className="mt-5 text-[28px] font-black leading-tight tracking-[-0.045em] text-[#eef2fb] sm:text-[34px]">
            Bonjour, {firstName}.
          </h1>
          <p className="mt-2 max-w-md text-[13px] leading-6 text-[#8b96b3]">
            {contextLine} <span className="text-[#c3cbdf]">{phrase}</span>
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className={"inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-bold " + status.ring} style={{ color: status.hex }}>
              <BreathingDot color={status.hex} size={6} />
              {status.label}
            </span>
            <button
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-bold text-[#c3cbdf] transition hover:border-white/25 hover:text-white"
              onClick={() => onOpenMission("m5")}
              type="button"
            >
              <Icon name="arrow-up-right" size={13} />
              Examiner les anomalies
            </button>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {orbitItems.map((item) => (
              <OrbitNumber
                color={
                  item.key === "alertes"
                    ? attentionCount > 0
                      ? C.rose
                      : C.green
                    : item.key === "rapports"
                      ? C.amber
                      : C.cyan
                }
                icon={item.icon}
                key={item.key}
                label={item.label}
                value={overview.orbital[item.key as "missions"] ?? 0}
              />
            ))}
          </div>
        </div>

        {/* Réseau animé */}
        <div className="relative hidden lg:block">
          <FieldNet missions={overview.missions} />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
            <div className="flex flex-col items-center gap-1 rounded-full border border-[rgba(148,163,207,0.14)] bg-[#0a0f1e]/70 px-4 py-2 backdrop-blur">
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#5c6889]">Terrain</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#c3cbdf]">
                <BreathingDot color={C.green} size={5} />
                Live
              </span>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* Petit rappel compact pour mobile : remplace le réseau */
export function MobileFieldMini({ status }: { status: FieldStatus }) {
  const meta = FIELD_STATUS[status];
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[rgba(148,163,207,0.12)] bg-white/[0.03] px-4 py-3 lg:hidden">
      <div className="flex items-center gap-3">
        <BreathingDot color={meta.hex} size={8} />
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: meta.hex }}>
            {FIELD_STATUS_LABEL[status]}
          </p>
          <p className="mt-0.5 text-[11px] text-[#8b96b3]">{statusPhrase[status]}</p>
        </div>
      </div>
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        className="rounded-full px-2.5 py-1 text-[9px] font-bold text-[#5c6889]"
        transition={{ duration: 2.4, repeat: Infinity }}
      >
        LIVE
      </motion.span>
    </div>
  );
}