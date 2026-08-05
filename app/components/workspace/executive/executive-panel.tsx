import type { ReactNode } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import type { IconName } from "@/app/components/ui/app-icon";

type ExecutivePanelProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: IconName;
  accent?: boolean;
  className?: string;
  action?: ReactNode;
};

export function ExecutivePanel({ children, title, subtitle, icon, accent, className = "", action }: ExecutivePanelProps) {
  return (
    <section
      className={
        "relative overflow-hidden rounded-3xl border shadow-sm transition-shadow duration-300 hover:shadow-lg " +
        (accent
          ? "border-[#17294b]/60 bg-[#17294b] text-white shadow-[#17294b]/10"
          : "border-slate-200/80 bg-white text-[#16233a] shadow-slate-950/[0.03]") +
        " " +
        className
      }
    >
      {title ? (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            {icon ? (
              <span
                className={
                  "grid size-9 place-items-center rounded-xl " +
                  (accent ? "bg-white/10 text-[#f2c56d]" : "bg-slate-100 text-[#456282]")
                }
              >
                <Icon name={icon} size={17} />
              </span>
            ) : null}
            <div>
              <h2 className="text-[15px] font-bold tracking-[-0.02em]">{title}</h2>
              {subtitle ? (
                <p className={"mt-0.5 text-xs " + (accent ? "text-slate-400" : "text-slate-500")}>{subtitle}</p>
              ) : null}
            </div>
          </div>
          {action}
        </header>
      ) : null}
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}
