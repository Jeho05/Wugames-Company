"use client";

import type { ReactNode } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import type { IconName } from "@/app/components/ui/app-icon";
import { Reveal } from "@/app/components/workspace/executive/reveal";

type ClientSectionProps = {
  id: string;
  title: string;
  subtitle?: string;
  icon: IconName;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function ClientSection({ id, title, subtitle, icon, action, children, className = "" }: ClientSectionProps) {
  return (
    <section aria-labelledby={`${id}-title`} className={"scroll-mt-28 " + className} id={id}>
      <Reveal>
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#17294b] text-[#f2c56d] shadow-lg shadow-[#17294b]/15">
              <Icon name={icon} size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-[-0.03em] text-[#16233a] dark:text-slate-100" id={`${id}-title`}>
                {title}
              </h2>
              {subtitle ? <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
            </div>
          </div>
          {action}
        </header>
      </Reveal>
      <Reveal delay={0.08}>{children}</Reveal>
    </section>
  );
}
