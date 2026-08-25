"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { IconName } from "@/app/components/ui/app-icon";
import { ClientCleans } from "@/app/components/workspace/client/client-cleans";
import { ClientBoutique } from "@/app/components/workspace/client/client-boutique";
import { ClientSection } from "@/app/components/workspace/client/client-section";
import type { CleansOverview } from "@/app/lib/cleans-data";

type TabId = "clean" | "boutique";

type ClientEspaceWugamsProps = {
  cleans: CleansOverview;
  sectionId?: string;
};

const subTabs: { id: TabId; label: string; icon: IconName }[] = [
  { id: "clean", label: "Wugams Clean", icon: "sparkles" },
  { id: "boutique", label: "Espace Wu", icon: "shopping-bag" },
];

export function ClientEspaceWugams({ cleans, sectionId = "portail-espace-wugams" }: ClientEspaceWugamsProps) {
  const [tab, setTab] = useState<TabId>("clean");
  const reduce = useReducedMotion();

  return (
    <ClientSection
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#17294b]/20 bg-[#17294b]/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#17294b]">
          <Icon name="building" size={12} />
          Espace WUGAMS
        </span>
      }
      icon="building"
      id={sectionId}
      subtitle="Wugams Clean et Espace Wu — tous vos services au même endroit"
      title="Mon Espace Wugams"
    >
      {/* Sous-onglets */}
      <div className="scrollbar-none -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1">
        {subTabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              aria-current={active ? "true" : undefined}
              className={
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 " +
                (active
                  ? "border-[#17294b] bg-[#17294b] text-white shadow-lg shadow-[#17294b]/20"
                  : "border-slate-200/90 bg-white text-slate-500 hover:border-slate-300 hover:text-[#17294b] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white")
              }
              key={t.id}
              onClick={() => setTab(t.id)}
              type="button"
            >
              <Icon name={t.icon} size={13} className={active ? "text-[#f2c56d]" : undefined} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Contenu Wugams Clean */}
      {tab === "clean" && <ClientCleans cleans={cleans} sectionId="portail-cleans" embedded />}

      {/* Contenu Espace Wu */}
      {tab === "boutique" && <ClientBoutique sectionId="portail-boutique" embedded />}
    </ClientSection>
  );
}
