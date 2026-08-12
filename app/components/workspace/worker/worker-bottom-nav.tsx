"use client";

import { motion } from "motion/react";

import { Icon, type IconName } from "@/app/components/ui/app-icon";

export type WorkerTab = "aujourdhui" | "services" | "missions" | "activite" | "profil";

type WorkerBottomNavigationProps = {
  tab: WorkerTab;
  unread: number;
  onTab: (tab: WorkerTab) => void;
  fabLabel: string;
  fabIcon: IconName;
  onFab: () => void;
};

const tabs: { key: WorkerTab; label: string; icon: IconName }[] = [
  { key: "aujourdhui", label: "Aujourd'hui", icon: "dashboard" },
  { key: "services", label: "Services", icon: "camera" },
  { key: "missions", label: "Missions", icon: "hardhat" },
  { key: "activite", label: "Activité", icon: "bell" },
  { key: "profil", label: "Profil", icon: "users" },
];

export function WorkerBottomNavigation({ tab, unread, onTab, fabLabel, fabIcon, onFab }: WorkerBottomNavigationProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="pointer-events-auto relative rounded-3xl border border-slate-200/80 bg-white/90 p-2 shadow-2xl shadow-slate-950/15 backdrop-blur-lg">
        {fabLabel ? (
          <motion.button
            animate={{ scale: 1 }}
            className="absolute -top-7 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-[#0f7a5f] px-5 py-3.5 text-[13px] font-extrabold text-white shadow-xl shadow-emerald-900/30 transition active:scale-[0.97]"
            initial={{ scale: 0.9 }}
            onClick={onFab}
            style={{ minHeight: 52 }}
            type="button"
          >
            <Icon name={fabIcon} size={17} />
            {fabLabel}
          </motion.button>
        ) : null}
        <nav aria-label="Navigation principale" className="grid grid-cols-5">
          {tabs.map((item) => {
            const active = tab === item.key;
            return (
              <button
                aria-current={active ? "page" : undefined}
                className="relative flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-2xl px-2 transition"
                key={item.key}
                onClick={() => onTab(item.key)}
                type="button"
              >
                {active ? (
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-2xl bg-[#0f7a5f]/10"
                    layoutId="worker-tab"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                ) : null}
                <span className="relative">
                  <Icon className={active ? "text-[#0f7a5f]" : "text-slate-400"} name={item.icon} size={20} />
                  {item.key === "activite" && unread > 0 ? (
                    <span className="absolute -right-2 -top-1.5 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[8px] font-extrabold text-white">
                      {unread}
                    </span>
                  ) : null}
                </span>
                <span className={"relative text-[9px] font-bold " + (active ? "text-[#0f7a5f]" : "text-slate-400")}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
