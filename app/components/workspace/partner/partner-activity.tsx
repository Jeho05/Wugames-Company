"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { PartnerActivityItem } from "@/app/lib/partner-data";

type PartnerActivityProps = {
  activity: PartnerActivityItem[];
};

const kindIcon: Record<PartnerActivityItem["kind"], "package" | "truck" | "plus" | "user-plus" | "arrow-up-right"> = {
  produit: "package",
  livraison: "truck",
  stock: "plus",
  partenaire: "user-plus",
  commande: "arrow-up-right",
};

export function PartnerActivity({ activity }: PartnerActivityProps) {
  return (
    <ExecutivePanel
      action={
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
          {activity.length} événements
        </span>
      }
      icon="user-plus"
      subtitle="Activité récente sur le stock et les partenaires"
      title="Activité récente"
    >
      <ul className="relative space-y-1">
        {activity.map((item, index) => {
          const isLast = index === activity.length - 1;
          return (
            <motion.li
              animate={{ opacity: 1, x: 0 }}
              className="relative flex gap-3.5 pb-3.5"
              initial={{ opacity: 0, x: -14 }}
              key={item.id}
              transition={{ delay: index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[15px] top-8 h-full w-px bg-gradient-to-b from-slate-200 to-transparent"
                />
              ) : null}
              <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#17294b] to-[#243656] text-[#f2c56d]">
                <Icon name={kindIcon[item.kind]} size={14} />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="truncate text-[12px] font-bold text-[#16233a]">
                  {item.title} <span className="font-medium text-slate-500">· {item.detail}</span>
                </p>
                <p className="mt-1 text-[10px] font-semibold text-slate-400">{item.time}</p>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </ExecutivePanel>
  );
}
