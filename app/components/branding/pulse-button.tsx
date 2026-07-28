"use client";

import Link from "next/link";
import { Icon } from "@/app/components/ui/app-icon";

type PulseButtonProps = {
  children?: React.ReactNode;
  href: string;
  icon?: boolean;
};

export function PulseButton({ children, href, icon = true }: PulseButtonProps) {
  return (
    <Link
      className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-6 py-3.5 text-sm font-bold text-[#14223b] shadow-xl shadow-amber-600/15 transition hover:bg-[#efb653] after:absolute after:inset-[-3px] after:rounded-xl after:border-2 after:border-[#e3a641]/30 after:animate-[pulse-ring_2.5s_cubic-bezier(0.4,0,0.6,1)_infinite]"
      href={href}
    >
      {children}
      {icon ? <Icon name="arrow-right" size={18} /> : null}
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
      `}</style>
    </Link>
  );
}
