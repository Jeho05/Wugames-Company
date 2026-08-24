"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { IconName } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";

type QuickAction = {
  href: string;
  label: string;
  icon: IconName;
  tile: string;
};

const quickActions: QuickAction[] = [
  { href: "/espace/administration?creer=1", label: "Nouvel utilisateur", icon: "users", tile: "bg-sky-50 text-sky-600" },
  { href: "/espace/clients?creer=1", label: "Nouveau client", icon: "user-plus", tile: "bg-violet-50 text-violet-600" },
  { href: "/espace/missions?creer=1", label: "Nouvelle mission", icon: "clipboard", tile: "bg-indigo-50 text-indigo-600" },
  { href: "/espace/factures?creer=1", label: "Nouvelle facture", icon: "file-text", tile: "bg-emerald-50 text-emerald-600" },
  { href: "/espace/filiales?creer=1", label: "Nouvelle filiale", icon: "building", tile: "bg-amber-50 text-amber-600" },
  { href: "/espace/stocks?creer=1", label: "Ajouter produit", icon: "package", tile: "bg-teal-50 text-teal-600" },
  { href: "/espace/stocks", label: "Gérer stock", icon: "boxes", tile: "bg-rose-50 text-rose-600" },
  { href: "/espace/administration?onglet=audit", label: "Voir audits", icon: "shield", tile: "bg-slate-100 text-slate-600" },
];

export function ExecutiveQuickActions() {
  const reduce = useReducedMotion();

  return (
    <ExecutivePanel
      icon="sparkles"
      subtitle="Raccourcis vers les actions les plus fréquentes"
      title="Actions rapides"
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {quickActions.map((action, index) => (
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            key={action.label}
            transition={{ duration: 0.4, delay: 0.04 * index, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              className="group flex h-full flex-col items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-lg"
              href={action.href}
            >
              <span className={"grid size-10 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-110 " + action.tile}>
                <Icon name={action.icon} size={18} />
              </span>
              <span className="text-[12px] font-bold text-[#16233a]">{action.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </ExecutivePanel>
  );
}
