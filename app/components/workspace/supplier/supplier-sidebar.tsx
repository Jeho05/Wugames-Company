"use client";

import { Icon, type IconName } from "@/app/components/ui/app-icon";
import type { SupplierView } from "@/app/lib/supplier-data";

type SupplierSidebarProps = {
  view: SupplierView;
  unread: number;
  onNavigate: (view: SupplierView) => void;
};

const navItems: { key: SupplierView; label: string; icon: IconName }[] = [
  { key: "overview", label: "Vue d'ensemble", icon: "dashboard" },
  { key: "produits", label: "Mes produits", icon: "package" },
  { key: "mouvements", label: "Mouvements", icon: "history" },
  { key: "notifications", label: "Notifications", icon: "bell" },
  { key: "profil", label: "Profil", icon: "user" },
];

export function SupplierSidebar({ view, unread, onNavigate }: SupplierSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#0f1c33] text-slate-300 lg:flex">
      <div className="flex items-center gap-3 px-6 pb-6 pt-7">
        <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#2563eb] to-[#1e3a8a] text-white shadow-lg shadow-blue-950/40">
          <Icon name="boxes" size={20} />
        </span>
        <div>
          <p className="text-[15px] font-extrabold tracking-tight text-white">WUGAMS</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Portail fournisseur</p>
        </div>
      </div>

      <nav aria-label="Navigation fournisseur" className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active = view === item.key;
          return (
            <button
              aria-current={active ? "page" : undefined}
              className={
                "flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 text-[13px] font-bold transition " +
                (active
                  ? "bg-white/10 text-white shadow-inner shadow-white/5 ring-1 ring-white/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200")
              }
              key={item.key}
              onClick={() => onNavigate(item.key)}
              type="button"
            >
              <Icon className={active ? "text-[#60a5fa]" : ""} name={item.icon} size={18} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.key === "notifications" && unread > 0 ? (
                <span className="grid min-w-5 place-items-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                  {unread}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          <Icon name="shield" size={12} />
          BR-05
        </p>
        <p className="mt-1.5 text-[11px] leading-5 text-slate-400">
          Accès limité à vos produits. Les données sont filtrées côté serveur.
        </p>
      </div>

      <p className="px-6 pb-5 text-[10px] text-slate-500">WUGAMS · Espace fournisseur · v1.0</p>
    </aside>
  );
}
