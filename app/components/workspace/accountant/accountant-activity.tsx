"use client";

import { Icon } from "@/app/components/ui/app-icon";
import { AccountantPanel } from "@/app/components/workspace/accountant/accountant-panel";
import type { AccountantActivityItem } from "@/app/lib/accountant-data";

type AccountantActivityProps = {
  items: AccountantActivityItem[];
};

const kindMeta: Record<AccountantActivityItem["kind"], { icon: "file-text" | "arrow-up" | "warning" | "newspaper" | "refresh"; tile: string }> = {
  facture: { icon: "file-text", tile: "bg-sky-400/10 text-sky-300" },
  paiement: { icon: "arrow-up", tile: "bg-emerald-400/10 text-emerald-300" },
  annulation: { icon: "warning", tile: "bg-rose-500/10 text-rose-300" },
  rapport: { icon: "newspaper", tile: "bg-amber-400/10 text-amber-300" },
  modification: { icon: "refresh", tile: "bg-violet-400/10 text-violet-300" },
};

export function AccountantActivity({ items }: AccountantActivityProps) {
  return (
    <AccountantPanel
      action={
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
          Direct
        </span>
      }
      icon="clock"
      subtitle="Derniers mouvements comptables"
      title="Activité récente"
    >
      <ol className="relative space-y-1">
        {items.map((item, index) => {
          const meta = kindMeta[item.kind];
          const isLast = index === items.length - 1;
          return (
            <li className="relative flex gap-3.5 pb-4" key={item.id}>
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[17px] top-9 h-full w-px bg-gradient-to-b from-white/10 to-transparent"
                />
              ) : null}
              <span className={"relative z-10 grid size-9 shrink-0 place-items-center rounded-xl " + meta.tile}>
                <Icon name={meta.icon} size={16} />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="truncate text-[13px] font-bold text-white">{item.title}</p>
                <p className="mt-0.5 truncate text-[11px] leading-5 text-slate-400">{item.detail}</p>
                <p className="mt-1 text-[10px] font-semibold text-slate-500">{item.time}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </AccountantPanel>
  );
}
