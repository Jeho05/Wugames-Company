"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandMark } from "@/app/components/ui/brand-mark";
import { Icon } from "@/app/components/ui/app-icon";
import { navigationGroups } from "@/app/lib/demo-data";

type BackOfficeShellProps = {
  children: ReactNode;
};

export function BackOfficeShell({ children }: BackOfficeShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#16233a]">
      {mobileOpen ? (
        <button
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden"
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      ) : null}

      <aside
        className={
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-white/10 bg-[#101a2d] px-4 pb-5 pt-6 shadow-2xl shadow-slate-950/15 transition-transform duration-200 lg:translate-x-0 " +
          (mobileOpen ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="flex items-center justify-between px-2">
          <BrandMark href="/espace" inverse />
          <button
            aria-label="Fermer le menu"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setMobileOpen(false)}
            type="button"
          >
            <Icon name="close" size={19} />
          </button>
        </div>

        <div className="mt-8 flex-1 overflow-y-auto pr-1">
          {navigationGroups.map((group) => (
            <div className="mb-6" key={group.label}>
              <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                {group.label}
              </p>
              <nav className="mt-2 space-y-1" aria-label={group.label}>
                {group.items.map((item) => {
                  const active =
                    item.href === "/espace"
                      ? pathname === "/espace"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition " +
                        (active
                          ? "bg-[#243656] text-white shadow-lg shadow-slate-950/20"
                          : "text-slate-400 hover:bg-white/[0.06] hover:text-white")
                      }
                      href={item.href}
                      key={item.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      <span
                        className={
                          "grid size-7 place-items-center rounded-lg transition " +
                          (active
                            ? "bg-[#e6ac49] text-[#10203a]"
                            : "bg-white/[0.04] text-slate-400 group-hover:bg-white/[0.08] group-hover:text-slate-200")
                        }
                      >
                        <Icon name={item.icon} size={16} />
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3.5">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-[#e6ac49]/15 text-[#f5c66f]">
              <Icon name="shield" size={16} />
            </span>
            <div>
              <p className="text-xs font-semibold text-white">Périmètre sécurisé</p>
              <p className="mt-1 text-[11px] leading-4 text-slate-400">
                Filiale et rôle seront appliqués par l&apos;API.
              </p>
            </div>
          </div>
        </div>

        <Link
          className="mt-4 flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
          href="/"
        >
          <span className="flex items-center gap-3">
            <Icon name="arrow-right" className="rotate-180" size={17} />
            Voir la vitrine
          </span>
        </Link>
      </aside>

      <div className="min-h-screen lg:pl-[272px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-[#f5f7fb]/90 px-4 backdrop-blur xl:px-8">
          <div className="flex items-center gap-3">
            <button
              aria-label="Ouvrir le menu"
              className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
              onClick={() => setMobileOpen(true)}
              type="button"
            >
              <Icon name="menu" size={19} />
            </button>
            <div className="hidden sm:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Espace de pilotage
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[#22314b]">
                WUGAMS Holding Inc.
              </p>
            </div>
            <span className="hidden rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-700 md:inline-flex">
              Démonstration front
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 sm:flex"
              type="button"
            >
              WUGAMS Construction
              <Icon name="chevron-down" size={15} />
            </button>
            <Link
              aria-label="Ouvrir les notifications"
              className="relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-[#17294b]"
              href="/espace/notifications"
            >
              <Icon name="bell" size={18} />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#db6d5b] ring-2 ring-white" />
            </Link>
            <button
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5 shadow-sm transition hover:border-slate-300"
              type="button"
            >
              <span className="grid size-7 place-items-center rounded-lg bg-[#dce7f5] text-[10px] font-extrabold text-[#244269]">
                JV
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-[11px] font-bold text-slate-700">Jéhovani V.</span>
                <span className="block text-[9px] font-medium text-slate-400">Gérant</span>
              </span>
              <Icon className="hidden text-slate-400 sm:block" name="chevron-down" size={14} />
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1680px] px-4 py-5 pb-10 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
