"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/app/components/ui/app-icon";
import {
  adminNavigationGroup,
  clientNavigationGroups,
  getModuleDefinition,
  navigationGroups,
} from "@/app/lib/demo-data";
import type { IconName } from "@/app/components/ui/app-icon";

type SearchEntry = {
  href: string;
  icon: IconName;
  label: string;
  section: string;
};

export function WorkspaceCommandSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const entries = useMemo<SearchEntry[]>(() => {
    const groups = [...navigationGroups, ...clientNavigationGroups];
    const nav: SearchEntry[] = groups.flatMap((group) =>
      group.items.map((item) => ({ href: item.href, icon: item.icon, label: item.label, section: group.label }))
    );
    nav.push(...adminNavigationGroup.items.map((item) => ({ ...item, section: adminNavigationGroup.label })));

    const moduleSlugs = [
      "clients", "chantiers", "missions", "ouvriers", "devis", "stocks",
      "fournisseurs", "filiales", "messagerie", "notifications", "rapports",
      "demandes", "projets", "documents", "factures", "messages", "managers", "commandes",
    ];
    const modules = moduleSlugs
      .map((slug) => {
        const definition = getModuleDefinition(slug);
        return definition ? { definition, slug } : null;
      })
      .filter((entry): entry is { definition: NonNullable<ReturnType<typeof getModuleDefinition>>; slug: string } => Boolean(entry))
      .map(({ definition, slug }) => ({
        href: "/espace/" + slug,
        icon: definition.icon,
        label: definition.title,
        section: "Modules",
      }));

    const extra: SearchEntry[] = [
      { href: "/espace/carte", icon: "map", label: "Carte terrain", section: "Modules" },
      { href: "/espace/administration", icon: "shield", label: "Administration", section: "Modules" },
      { href: "/boutique", icon: "shopping-bag", label: "Boutique matériaux", section: "Site public" },
      { href: "/realisations", icon: "camera", label: "Nos réalisations", section: "Site public" },
      { href: "/blog", icon: "newspaper", label: "Blog & conseils", section: "Site public" },
      { href: "/", icon: "building", label: "Vitrine WUGAMS", section: "Site public" },
    ];

    return [...nav, ...modules, ...extra];
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr");
    if (!normalized) return entries;
    return entries.filter((entry) =>
      (entry.label + " " + entry.section).toLocaleLowerCase("fr").includes(normalized)
    );
  }, [entries, query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  function openSearch() {
    setQuery("");
    setCursor(0);
    setOpen(true);
  }

  function go(entry: SearchEntry) {
    setOpen(false);
    router.push(entry.href);
  }

  return (
    <>
      <button
        className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-400 shadow-sm transition hover:border-slate-300 hover:text-slate-600 sm:flex"
        onClick={openSearch}
        type="button"
      >
        <Icon name="search" size={15} />
        Recherche rapide…
        <kbd className="ml-3 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
          ⌘K
        </kbd>
      </button>
      <button
        aria-label="Recherche rapide"
        className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 sm:hidden"
        onClick={openSearch}
        type="button"
      >
        <Icon name="search" size={18} />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] grid place-items-start justify-items-center bg-slate-950/45 p-4 pt-[12vh]">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5">
              <Icon className="text-slate-400" name="search" size={18} />
              <input
                aria-label="Rechercher"
                className="h-14 min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCursor(0);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setCursor((prev) => Math.min(results.length - 1, prev + 1));
                  }
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setCursor((prev) => Math.max(0, prev - 1));
                  }
                  if (event.key === "Enter" && results[cursor]) {
                    go(results[cursor]);
                  }
                }}
                placeholder="Modules, pages, sections…"
                ref={inputRef}
                type="search"
                value={query}
              />
              <button
                aria-label="Fermer"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setOpen(false)}
                type="button"
              >
                <Icon name="close" size={17} />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <div className="grid min-h-32 place-items-center p-6 text-center">
                  <div>
                    <span className="mx-auto grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-400">
                      <Icon name="search" size={18} />
                    </span>
                    <p className="mt-3 text-sm font-bold text-slate-700">Aucun résultat</p>
                    <p className="mt-1 text-xs text-slate-500">Essayez « clients », « stocks », « boutique »…</p>
                  </div>
                </div>
              ) : (
                <ul>
                  {results.map((entry, index) => (
                    <li key={entry.href + entry.label}>
                      <button
                        className={
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition " +
                          (index === cursor ? "bg-[#edf3f9]" : "hover:bg-slate-50")
                        }
                        onClick={() => go(entry)}
                        onMouseEnter={() => setCursor(index)}
                        type="button"
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-[#426b95] shadow-sm ring-1 ring-slate-100">
                          <Icon name={entry.icon} size={15} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold text-[#233856]">{entry.label}</span>
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            {entry.section}
                          </span>
                        </span>
                        <Icon className="text-slate-300" name="arrow-up-right" size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-slate-100 px-5 py-2.5 text-[10px] font-semibold text-slate-400">
              <span>↑↓ naviguer</span>
              <span>↵ ouvrir</span>
              <span className="ml-auto">Esc fermer</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
