"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { Avatar, Panel } from "@/app/components/workspace/resp-ouvriers/ui/primitives";
import { LEVEL } from "@/app/components/workspace/resp-ouvriers/theme";
import type { FieldMission } from "@/app/lib/resp-ouvriers-data";

type JourneyNode = {
  label: string;
  time: string;
  detail: string;
  status: "done" | "current" | "pending" | "alert";
  icon: "avatar" | "location" | "warning" | "clipboard" | "check" | "camera" | "flag";
  color: string;
};

function clockTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function buildJourney(mission: FieldMission): JourneyNode[] {
  const nodes: JourneyNode[] = [];
  const first = mission.pointages[0];
  const horsRayon = mission.pointages.some((pointage) => pointage.horsRayon);

  if (first) {
    nodes.push({
      label: horsRayon ? "Pointage hors rayon" : "Pointage d'arrivée",
      time: clockTime(first.horodatage),
      detail: horsRayon
        ? `${first.distanceMetres} m du centre autorisé · rayon ${first.rayonMetres} m`
        : `${first.distanceMetres} m du centre · rayon ${first.rayonMetres} m`,
      status: horsRayon ? "alert" : "done",
      icon: horsRayon ? "warning" : "location",
      color: horsRayon ? LEVEL.critical.hex : LEVEL.normal.hex,
    });
  } else {
    nodes.push({
      label: "Pointage d'arrivée attendu",
      time: "—",
      detail: "L'ouvrier est en route ou en attente",
      status: "pending",
      icon: "location",
      color: LEVEL.normal.hex,
    });
  }

  nodes.push({
    label: mission.statut === "EN_COURS" ? "Travaux en cours" : "Démarrage du plan",
    time: mission.heurePlanifiee,
    detail: `${mission.filiere} · ${mission.workerNom}`,
    status: mission.statut === "EN_COURS" ? "current" : "pending",
    icon: "avatar",
    color: LEVEL.normal.hex,
  });

  if (mission.statut === "RAPPORT_SOUMIS" || mission.rapportTexte) {
    nodes.push({
      label: "Rapport transmis",
      time: clockTime(mission.rapportDate),
      detail: `${mission.rapportAuteur ?? "Ouvrier"} · preuves photo jointes (${mission.photos})`,
      status: "done",
      icon: "clipboard",
      color: LEVEL.attention.hex,
    });
  }

  if (mission.statut === "TERMINE" || mission.statut === "VALIDE") {
    nodes.push({
      label: "Fin de chantier",
      time: "—",
      detail: "Sortie enregistrée · zone remise en état",
      status: "done",
      icon: "flag",
      color: LEVEL.normal.hex,
    });
  }

  if (!nodes.some((node) => node.status === "done")) {
    nodes.push({
      label: "Sécurisation & sortie",
      time: "—",
      detail: "Attente de la fin de la fenêtre planifiée",
      status: "pending",
      icon: "flag",
      color: LEVEL.normal.hex,
    });
  }

  return nodes;
}

function NodeIcon({ node }: { node: JourneyNode }) {
  if (node.icon === "avatar") return <Avatar initials="XX" size={18} />;
  const name: Record<Exclude<JourneyNode["icon"], "avatar">, "warning" | "map" | "clipboard" | "check" | "camera" | "arrow-up-right"> = {
    location: "map",
    warning: "warning",
    clipboard: "clipboard",
    check: "check",
    camera: "camera",
    flag: "arrow-up-right",
  };
  return <Icon color={node.color} name={name[node.icon]} size={12} />;
}

export function Journey({ mission }: { mission: FieldMission }) {
  const nodes = buildJourney(mission);

  return (
    <Panel className="h-full">
      <div className="border-b border-[rgba(148,163,207,0.1)] px-6 pb-4 pt-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e3a641]/90">06 · Parcours</p>
        <h2 className="mt-1 text-[17px] font-bold tracking-[-0.03em] text-[#e8eefb]">{mission.titre}</h2>
        <p className="mt-1 flex items-center gap-2 text-[11px] text-[#8b96b3]">
          <span className="font-mono font-bold text-[#5c6889]">{mission.numero}</span>
          <span>·</span>
          <span>{mission.workerNom}</span>
          <span>·</span>
          <span>{mission.heurePlanifiee}</span>
        </p>
      </div>

      <ol className="relative p-6 pt-7">
        <span aria-hidden="true" className="absolute bottom-8 left-[19px] top-9 w-px bg-white/[0.12]" />
        {nodes.map((node, index) => (
          <motion.li
            animate={{ opacity: 1, x: 0 }}
            className="relative flex gap-4 pb-6 last:pb-0"
            initial={{ opacity: 0, x: 10 }}
            key={node.label}
            transition={{ delay: index * 0.12, duration: 0.4 }}
          >
            <span
              className="relative z-10 grid size-[38px] shrink-0 place-items-center rounded-full border"
              style={{
                borderColor: node.status === "pending" ? "rgba(148,163,207,0.15)" : `${node.color}55`,
                backgroundColor: node.status === "pending" ? "#0f172f" : `${node.color}14`,
              }}
            >
              <NodeIcon node={node} />
              {node.status === "current" ? (
                <motion.span
                  animate={{ opacity: [1, 0.2, 1] }}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full border"
                  style={{ borderColor: node.color }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
              ) : null}
            </span>

            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-bold text-[#e8eefb]">{node.label}</p>
                <span className="font-mono text-[10px] font-bold tabular-nums text-[#5c6889]">{node.time}</span>
              </div>
              <p className="mt-0.5 text-[11px] leading-4 text-[#8b96b3]">{node.detail}</p>
              {node.status === "alert" ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold" style={{ color: LEVEL.critical.hex }}>
                  <Icon name="warning" size={11} />
                  ACTION REQUISE · Vérifier le pointage
                </p>
              ) : null}
            </div>
          </motion.li>
        ))}
      </ol>
    </Panel>
  );
}