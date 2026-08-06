"use client";

import { Icon, type IconName } from "@/app/components/ui/app-icon";
import type { SupplierView } from "@/app/lib/supplier-data";

type SupplierBottomNavigationProps = {
  view: SupplierView;
  unread: number;
  onNavigate: (view: SupplierView) => void;
};

const tabs: { key: SupplierView; label: string; icon: IconName }[] = [
  { key: "overview", label: "Accueil", icon: "dashboard" },
  { key: "produits", label: "Produits", icon: "package" },
  { key: "mouvements", label: "Mouvements", icon: "history" },
  { key: "notifications", label: "Notifications", icon: "bell" },
  { key: "profil", label: "Profil", icon: "user" },
];

export function SupplierBottomNavigation({ view, unread, onNavigate }: SupplierBottomNavigationProps) {
  return (
    <nav
      aria-label="Navigation fournisseur"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/90 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/90 lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5">
        {tabs.map((item) => {
          const active = view === item.key;
          return (
            <button
              aria-current={active ? "page" : undefined}
              className="relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl transition"
              key={item.key}
              onClick={() => onNavigate(item.key)}
              type="button"
            >
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 top-0.5 h-0.5 rounded-full bg-[#2563eb]"
                />
              ) : null}
              <span className="relative">
                <Icon className={active ? "text-[#2563eb]" : "text-slate-400"} name={item.icon} size={19} />
                {item.key === "notifications" && unread > 0 ? (
                  <span className="absolute -right-2 -top-1.5 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[8px] font-extrabold text-white">
                    {unread}
                  </span>
                ) : null}
              </span>
              <span className={"text-[9px] font-bold " + (active ? "text-[#2563eb]" : "text-slate-400")}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
