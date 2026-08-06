"use client";

import { Icon } from "@/app/components/ui/app-icon";
import type { SupplierView } from "@/app/lib/supplier-data";

type SupplierDashboardHeaderProps = {
  view: SupplierView;
  firstName: string;
  unread: number;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
};

const viewTitles: Record<SupplierView, { title: string; subtitle: string }> = {
  overview: { title: "Vue d'ensemble", subtitle: "L'état de vos produits en un coup d'œil" },
  produits: { title: "Mes produits", subtitle: "Le catalogue des produits qui vous sont rattachés" },
  mouvements: { title: "Mouvements", subtitle: "Les entrées et sorties de stock sur vos produits" },
  notifications: { title: "Notifications", subtitle: "Les messages adressés à votre compte" },
  profil: { title: "Profil", subtitle: "Vos informations et la sécurité de votre compte" },
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function SupplierDashboardHeader({
  view,
  firstName,
  unread,
  onOpenSearch,
  onOpenNotifications,
  onOpenProfile,
}: SupplierDashboardHeaderProps) {
  const meta = viewTitles[view];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-[#f7f9fc]/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 lg:px-8">
        <div className="hidden min-w-0 lg:block">
          <h1 className="truncate text-[16px] font-extrabold tracking-tight text-[#17294b] dark:text-slate-100">{meta.title}</h1>
          <p className="truncate text-[11px] font-medium text-slate-400">{meta.subtitle}</p>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2.5">
          <button
            className="hidden min-h-10 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 text-[12px] font-semibold text-slate-400 shadow-sm transition hover:border-slate-300 hover:text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 sm:flex"
            onClick={onOpenSearch}
            type="button"
          >
            <Icon name="search" size={15} />
            <span className="w-40 text-left">Rechercher…</span>
            <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
              Ctrl K
            </kbd>
          </button>
          <button
            aria-label="Ouvrir la recherche"
            className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 sm:hidden"
            onClick={onOpenSearch}
            type="button"
          >
            <Icon name="search" size={17} />
          </button>

          <button
            aria-label={`Notifications${unread > 0 ? ` (${unread} non lues)` : ""}`}
            className="relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-[#1e40af] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
            onClick={onOpenNotifications}
            type="button"
          >
            <Icon name="bell" size={17} />
            {unread > 0 ? (
              <span className="absolute -right-1 -top-1 grid min-w-4.5 place-items-center rounded-full bg-rose-500 px-1 py-0.5 text-[8px] font-extrabold text-white ring-2 ring-white dark:ring-slate-950">
                {unread}
              </span>
            ) : null}
          </button>

          <button
            aria-label="Ouvrir mon profil"
            className="flex min-h-10 items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            onClick={onOpenProfile}
            type="button"
          >
            <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-[#2563eb] to-[#1e3a8a] text-[10px] font-extrabold text-white">
              {initialsOf(firstName || "F")}
            </span>
            <span className="hidden max-w-28 truncate text-[12px] font-bold text-[#17294b] dark:text-slate-200 sm:block">
              {firstName || "Fournisseur"}
            </span>
            <Icon className="text-slate-400" name="chevron-down" size={12} />
          </button>
        </div>
      </div>
    </header>
  );
}
