"use client";

import Link from "next/link";

import { Icon } from "@/app/components/ui/app-icon";
import type { IconName } from "@/app/components/ui/app-icon";
import { AccountantPanel } from "@/app/components/workspace/accountant/accountant-panel";

type QuickAction = {
  href: string;
  label: string;
  hint: string;
  icon: IconName;
  tile: string;
};

const actions: QuickAction[] = [
  { href: "/espace/factures?creer=1", label: "Nouvelle facture", hint: "Créer et émettre", icon: "plus", tile: "bg-[#e3a641]/15 text-[#f2c56d]" },
  { href: "/espace/factures", label: "Nouveau paiement", hint: "Encaisser un client", icon: "check", tile: "bg-emerald-400/10 text-emerald-300" },
  { href: "/espace/statistiques", label: "Voir l'historique", hint: "Toutes les factures", icon: "clock", tile: "bg-sky-400/10 text-sky-300" },
  { href: "/espace/factures", label: "Rechercher une facture", hint: "Par numéro ou client", icon: "search", tile: "bg-violet-400/10 text-violet-300" },
  { href: "/espace/statistiques", label: "Créer un rapport", hint: "Bilan ou clôture", icon: "newspaper", tile: "bg-amber-400/10 text-amber-300" },
  { href: "/espace/factures", label: "Exporter", hint: "CSV, Excel ou PDF", icon: "download", tile: "bg-rose-400/10 text-rose-300" },
];

export function AccountantQuickActions() {
  return (
    <AccountantPanel
      icon="sparkles"
      subtitle="Gagner du temps au quotidien"
      title="Actions rapides"
    >
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
    </AccountantPanel>
  );
}
