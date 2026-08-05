"use client";

import Link from "next/link";

import { Icon } from "@/app/components/ui/app-icon";
import type { IconName } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";

type Shortcut = {
  href: string;
  label: string;
  hint: string;
  icon: IconName;
  tile: string;
};

const shortcuts: Shortcut[] = [
  { href: "/espace/clients", label: "Clients", hint: "Fiches et dossiers", icon: "users", tile: "bg-sky-50 text-sky-600" },
  { href: "/espace/fournisseurs", label: "Fournisseurs", hint: "Rôles, contrats, matériel", icon: "truck", tile: "bg-violet-50 text-violet-600" },
  { href: "/espace/administration", label: "Utilisateurs", hint: "Comptes et permissions", icon: "user-plus", tile: "bg-amber-50 text-amber-600" },
  { href: "/espace/statistiques", label: "Statistiques", hint: "Chiffres clés et tendances", icon: "chart", tile: "bg-emerald-50 text-emerald-600" },
];

export function SecretaryShortcuts() {
  return (
    <ExecutivePanel
      icon="sparkles"
      subtitle="Accès direct aux modules fréquents"
      title="Raccourcis"
    >
      <div className="grid grid-cols-2 gap-2.5">
        {shortcuts.map((shortcut) => (
          <Link
            className="group flex flex-col gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-amber-100 hover:bg-white hover:shadow-md hover:shadow-slate-950/[0.05]"
            href={shortcut.href}
            key={shortcut.href}
          >
            <span className={"grid size-9 place-items-center rounded-xl transition group-hover:scale-105 " + shortcut.tile}>
              <Icon name={shortcut.icon} size={17} />
            </span>
            <span>
              <span className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#16233a]">{shortcut.label}</span>
                <Icon className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#e3a641]" name="arrow-right" size={12} />
              </span>
              <span className="mt-0.5 block text-[10px] leading-4 text-slate-400">{shortcut.hint}</span>
            </span>
          </Link>
        ))}
      </div>
    </ExecutivePanel>
  );
}
