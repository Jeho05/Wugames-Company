"use client";

import Link from "next/link";

import { Icon } from "@/app/components/ui/app-icon";
import type { IconName } from "@/app/components/ui/app-icon";
import { OpsPanel } from "@/app/components/workspace/ops/ops-panel";

type QuickAction = {
  href: string;
  label: string;
  hint: string;
  icon: IconName;
  tile: string;
};

const actions: QuickAction[] = [
  { href: "/espace/missions?creer=1", label: "Créer une mission", hint: "Déclencher un chantier", icon: "plus", tile: "bg-[#e3a641]/15 text-[#f2c56d]" },
  { href: "/espace/missions", label: "Planifier", hint: "Fixer date et équipe", icon: "calendar", tile: "bg-sky-400/10 text-sky-300" },
  { href: "/espace/missions", label: "Affecter une équipe", hint: "Envoyer sur le terrain", icon: "users", tile: "bg-violet-400/10 text-violet-300" },
  { href: "/espace/missions", label: "Valider une mission", hint: "Rapports soumis", icon: "check", tile: "bg-emerald-400/10 text-emerald-300" },
  { href: "/espace/missions", label: "Voir le planning", hint: "Vue d'ensemble", icon: "calendar", tile: "bg-amber-400/10 text-amber-300" },
  { href: "/espace/missions", label: "Voir les incidents", hint: "Pointages à vérifier", icon: "warning", tile: "bg-rose-400/10 text-rose-300" },
  { href: "/espace/missions", label: "Historique", hint: "Missions clôturées", icon: "clock", tile: "bg-slate-400/10 text-slate-300" },
];

export function OpsQuickActions() {
  return (
    <OpsPanel icon="sparkles" subtitle="Piloter les opérations en un geste" title="Actions rapides">
      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((action) => (
          <Link
            className="group flex flex-col gap-2.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-[#e3a641]/40 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-black/30"
            href={action.href}
            key={action.label}
          >
            <span className={"grid size-9 place-items-center rounded-xl transition group-hover:scale-105 " + action.tile}>
              <Icon name={action.icon} size={17} />
            </span>
            <span>
              <span className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-bold leading-4 text-white">{action.label}</span>
                <Icon className="shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-[#f2c56d]" name="arrow-right" size={12} />
              </span>
              <span className="mt-0.5 block text-[9px] leading-4 text-slate-500">{action.hint}</span>
            </span>
          </Link>
        ))}
      </div>
    </OpsPanel>
  );
}
