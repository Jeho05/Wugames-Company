import type { ReactNode } from "react";

import type { StatusTone } from "@/app/lib/demo-data";

const toneStyles: Record<StatusTone, string> = {
  danger: "border-red-200 bg-red-50 text-red-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
  neutral: "border-slate-200 bg-slate-100 text-slate-600",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
};

const dotStyles: Record<StatusTone, string> = {
  danger: "bg-red-500",
  info: "bg-sky-500",
  neutral: "bg-slate-400",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
};

type StatusBadgeProps = {
  children: ReactNode;
  tone?: StatusTone;
};

export function StatusBadge({ children, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold " +
        toneStyles[tone]
      }
    >
      <span className={"size-1.5 rounded-full " + dotStyles[tone]} />
      {children}
    </span>
  );
}
