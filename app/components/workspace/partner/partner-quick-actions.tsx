"use client";

import { useState } from "react";
import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";

const actions = [
  { icon: "user-plus", label: "Nouveau partenaire", description: "Ajouter un fournisseur ou partenaire" },
  { icon: "package", label: "Nouveau produit", description: "Créer un produit au catalogue" },
  { icon: "plus", label: "Entrée de stock", description: "Enregistrer une réception" },
  { icon: "arrow-up-right", label: "Commande fournisseur", description: "Lancer un réapprovisionnement" },
  { icon: "refresh", label: "Ajustement", description: "Corriger un écart de stock" },
  { icon: "print", label: "État des stocks", description: "Exporter l'inventaire" },
] as const;

type ActionName = (typeof actions)[number]["label"];

export function PartnerQuickActions() {
  const [clicked, setClicked] = useState<ActionName | null>(null);

  function run(label: ActionName) {
    setClicked(label);
    window.setTimeout(() => setClicked(null), 2400);
  }

  return (
    <ExecutivePanel icon="plus" subtitle="Raccourcis du gestionnaire logistique" title="Actions rapides">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {actions.map((action, index) => {
          const isClicked = clicked === action.label;
          return (
            <motion.button
              animate={{ opacity: 1, y: 0 }}
              className={
                "group flex flex-col items-start gap-2.5 rounded-2xl border p-4 text-left transition duration-200 active:scale-[0.98] " +
                (isClicked
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-100 bg-slate-50/60 hover:-translate-y-0.5 hover:border-amber-200 hover:bg-white hover:shadow-lg hover:shadow-slate-950/[0.05]")
              }
              initial={{ opacity: 0, y: 14 }}
              key={action.label}
              onClick={() => run(action.label)}
              style={{ transitionDelay: undefined }}
              transition={{ delay: index * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              type="button"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#17294b] to-[#243656] text-[#f2c56d] shadow-md shadow-[#17294b]/20 transition group-hover:from-[#1d3157] group-hover:to-[#2b3f63]">
                <Icon name={isClicked ? "check" : action.icon} size={16} />
              </span>
              <span>
                <span className="block text-[11px] font-bold text-[#16233a]">{action.label}</span>
                <span className="mt-0.5 block text-[9px] leading-4 text-slate-400">{action.description}</span>
              </span>
              {isClicked ? (
                <motion.span
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] font-bold text-emerald-700"
                  initial={{ opacity: 0, y: 4 }}
                >
                  L&#39;action a été enregistrée
                </motion.span>
              ) : null}
            </motion.button>
          );
        })}
      </div>
    </ExecutivePanel>
  );
}
