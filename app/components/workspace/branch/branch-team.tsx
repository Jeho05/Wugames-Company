"use client";

import { useState } from "react";
import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { BranchTeamMember } from "@/app/lib/branch-data";

type BranchTeamProps = {
  team: BranchTeamMember[];
};

type RoleFilter = "tous" | "Ouvrier" | "Resp. ouvriers" | "Secrétaire" | "Comptable" | "Mgr Opérations" | "Autre";
type StatutFilter = "tous" | "actif" | "inactif";

export function BranchTeam({ team }: BranchTeamProps) {
  const [role, setRole] = useState<RoleFilter>("tous");
  const [statut, setStatut] = useState<StatutFilter>("tous");

  const roleFiltered = role === "tous" ? team : team.filter((member) => (role === "Autre" ? !["Ouvrier", "Resp. ouvriers", "Secrétaire", "Comptable", "Mgr Opérations"].includes(member.role) : member.role === role));
  const filtered = statut === "tous" ? roleFiltered : roleFiltered.filter((member) => (statut === "actif" ? member.actif : !member.actif));

  return (
    <ExecutivePanel
      action={
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
          {filtered.length} / {team.length} membre(s)
        </span>
      }
      icon="users"
      subtitle="Consultation — profils, missions et rendement"
      title="Équipe de la filiale"
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="flex flex-wrap gap-1 rounded-xl border border-slate-100 bg-slate-50 p-1" role="group" aria-label="Filtrer par rôle">
          {(["tous", "Ouvrier", "Resp. ouvriers", "Secrétaire", "Comptable", "Mgr Opérations", "Autre"] as RoleFilter[]).map((value) => (
            <button
              aria-pressed={role === value}
              className={
                "rounded-lg px-2.5 py-1 text-[10px] font-bold transition " +
                (role === value ? "bg-[#10304f] text-white shadow-sm" : "text-slate-500 hover:bg-white hover:text-slate-700")
              }
              key={value}
              onClick={() => setRole(value)}
              type="button"
            >
              {value === "tous" ? "Tous" : value}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-xl border border-slate-100 bg-slate-50 p-1" role="group" aria-label="Filtrer par statut">
          {(["tous", "actif", "inactif"] as StatutFilter[]).map((value) => (
            <button
              aria-pressed={statut === value}
              className={
                "rounded-lg px-2.5 py-1 text-[10px] font-bold transition " +
                (statut === value ? "bg-[#0e9f9b] text-white shadow-sm" : "text-slate-500 hover:bg-white hover:text-slate-700")
              }
              key={value}
              onClick={() => setStatut(value)}
              type="button"
            >
              {value === "tous" ? "Tous statuts" : value === "actif" ? "Actifs" : "Inactifs"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((member, index) => (
          <motion.article
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-slate-950/[0.05]"
            initial={{ opacity: 0, y: 14 }}
            key={member.id}
            transition={{ delay: index * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#10304f] to-[#1b446b] text-[12px] font-extrabold text-[#7dd3fc] shadow-md shadow-[#10304f]/20">
                {member.initiales}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-[#16233a]">{member.nom}</p>
                <p className="text-[10px] text-slate-400">{member.role}</p>
              </div>
              <span
                className={
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[8px] font-bold " +
                  (member.actif ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500")
                }
              >
                <span className={"size-1.5 rounded-full " + (member.actif ? "bg-emerald-500" : "bg-slate-400")} />
                {member.actif ? "Actif" : "Inactif"}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-slate-100 bg-white px-2 py-2">
                <p className="text-[14px] font-extrabold tabular-nums text-[#0f2a52]">{member.missions}</p>
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">Missions</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white px-2 py-2">
                <p className={"text-[14px] font-extrabold tabular-nums " + (member.rendement === null ? "text-slate-300" : member.rendement >= 70 ? "text-emerald-600" : "text-amber-600")}>
                  {member.rendement === null ? "—" : `${member.rendement} %`}
                </p>
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">Rendement</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white px-2 py-2">
                <p className="truncate text-[9px] font-bold text-[#0f2a52]">{member.telephone}</p>
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">Téléphone</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-[10px] text-slate-400">Dernière activité · {member.derniereActivite}</p>
              <div className="flex shrink-0 gap-1.5">
                <a
                  aria-label={`Voir le profil de ${member.nom}`}
                  className="grid size-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#0e9f9b]/50 hover:text-[#0e9f9b]"
                  href={`/espace/utilisateurs?id=${member.id}`}
                  title="Voir le profil"
                >
                  <Icon name="users" size={13} />
                </a>
                <a
                  aria-label={`Voir les missions de ${member.nom}`}
                  className="grid size-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#0e9f9b]/50 hover:text-[#0e9f9b]"
                  href={`/espace/missions?ouvrier=${member.id}`}
                  title="Voir les missions"
                >
                  <Icon name="hardhat" size={13} />
                </a>
                <a
                  aria-label={`Voir les évaluations de ${member.nom}`}
                  className="grid size-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#0e9f9b]/50 hover:text-[#0e9f9b]"
                  href={`/espace/evaluations?personne=${member.id}`}
                  title="Voir les évaluations"
                >
                  <Icon name="chart" size={13} />
                </a>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </ExecutivePanel>
  );
}
