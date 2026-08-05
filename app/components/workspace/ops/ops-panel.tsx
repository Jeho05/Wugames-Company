import type { ReactNode } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import type { IconName } from "@/app/components/ui/app-icon";

type OpsPanelProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: IconName;
  action?: ReactNode;
  className?: string;
};

export function OpsPanel({ children, title, subtitle, icon, action, className = "" }: OpsPanelProps) {
  return (
    <section
      className={
        "relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03] shadow-xl shadow-black/20 backdrop-blur transition-colors duration-300 hover:border-white/[0.1] " +
        className
      }
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />
      {title ? (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            {icon ? (
              <span className="grid size-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-[#f2c56d]">
                <Icon name={icon} size={17} />
              </span>
            ) : null}
            <div>
              <h2 className="text-[15px] font-bold tracking-[-0.02em] text-white">{title}</h2>
              {subtitle ? <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p> : null}
            </div>
          </div>
          {action}
        </header>
      ) : null}
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}
