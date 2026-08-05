"use client";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { SecretaryActivityItem } from "@/app/lib/secretary-data";

type SecretaryActivityProps = {
  items: SecretaryActivityItem[];
};

const typeMeta: Record<SecretaryActivityItem["type"], { icon: "truck" | "users" | "file-text" | "user-plus"; tile: string }> = {
  client: { icon: "user-plus", tile: "bg-sky-50 text-sky-600" },
  fournisseur: { icon: "truck", tile: "bg-violet-50 text-violet-600" },
  utilisateur: { icon: "users", tile: "bg-amber-50 text-amber-600" },
  audit: { icon: "file-text", tile: "bg-slate-100 text-slate-500" },
};

export function SecretaryActivity({ items }: SecretaryActivityProps) {
  return (
    <ExecutivePanel
      action={
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          Direct
        </span>
      }
      icon="clock"
      subtitle="Derniers mouvements sur vos dossiers"
      title="Activité récente"
    >
      <ol className="relative space-y-1">
        {items.map((item, index) => {
          const meta = typeMeta[item.type];
          const isLast = index === items.length - 1;
          return (
            <li className="relative flex gap-3.5 pb-4" key={item.id}>
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[17px] top-9 h-full w-px bg-gradient-to-b from-slate-200 to-transparent"
                />
              ) : null}
              <span className={"relative z-10 grid size-9 shrink-0 place-items-center rounded-xl " + meta.tile}>
                <Icon name={meta.icon} size={16} />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="truncate text-[13px] font-bold text-[#16233a]">{item.title}</p>
                <p className="mt-0.5 truncate text-[11px] leading-5 text-slate-500">{item.detail}</p>
                <p className="mt-1 text-[10px] font-semibold text-slate-400">{item.time}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </ExecutivePanel>
  );
}
