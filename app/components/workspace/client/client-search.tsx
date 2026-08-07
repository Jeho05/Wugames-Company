"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { IconName } from "@/app/components/ui/app-icon";
import { formatFcfa } from "@/app/lib/store-data";
import type { ClientPortalData } from "@/app/lib/client-data";

type SearchResult = {
  id: string;
  section: "Missions" | "Factures" | "Devis" | "Commandes";
  sectionId: string;
  icon: IconName;
  title: string;
  subtitle: string;
};

const sectionIcon: Record<SearchResult["section"], IconName> = {
  Missions: "hardhat",
  Factures: "file-text",
  Devis: "sparkles",
  Commandes: "shopping-bag",
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

type ClientSearchProps = {
  data: ClientPortalData;
  open: boolean;
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
};

export function ClientSearch({ data, open, onClose, onNavigate }: ClientSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    if (open) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [open, onClose]);

  const results = useMemo<SearchResult[]>(() => {
    const q = normalize(query.trim());
    if (!q) return [];
    const build = (item: { id: string; titre?: string; numero?: string; objet?: string; montant?: number | string; date?: string; statut?: string }, section: SearchResult["section"]): SearchResult => {
      const title = item.titre ?? item.objet ?? item.numero ?? "";
      const montant = item.montant !== undefined ? ` · ${formatFcfa(Number(item.montant))}` : "";
      const date = item.date ? ` · ${item.date}` : "";
      return {
        id: item.id,
        section,
        sectionId: sectionIdOf(section),
        icon: sectionIcon[section],
        title,
        subtitle: `${(item.statut ?? "").toLowerCase()}${montant}${date}`,
      };
    };
    const matches = (item: { titre?: string; numero?: string; objet?: string }) =>
      normalize([item.titre, item.numero, item.objet].filter(Boolean).join(" ")).includes(q);
    return [
      ...data.missions.filter(matches).map((m) => build(m, "Missions")),
      ...data.factures.filter(matches).map((f) => build(f, "Factures")),
      ...data.devis.filter(matches).map((d) => build(d, "Devis")),
      ...data.commandes.filter(matches).map((c) => build(c, "Commandes")),
    ].slice(0, 12);
  }, [query, data]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]">
          <motion.button
            aria-label="Fermer la recherche"
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            type="button"
          />
          <motion.div
            aria-label="Recherche globale"
            aria-modal="true"
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl shadow-slate-950/25 dark:border-white/10 dark:bg-[#0f1a2e]"
            initial={reduce ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 8, scale: 0.99 }}
            role="dialog"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/5">
              <Icon className="text-slate-400" name="search" size={18} />
              <input
                aria-label="Rechercher dans vos missions, factures, devis et commandes"
                autoComplete="off"
                className="w-full bg-transparent text-[15px] font-semibold text-[#16233a] placeholder:text-slate-400 focus:outline-none dark:text-white"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher une mission, facture, devis, commande…"
                ref={inputRef}
                type="search"
                value={query}
              />
              <kbd className="hidden shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-400 sm:block">
                ESC
              </kbd>
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-2">
              {query.trim() === "" ? (
                <div className="px-4 py-8 text-center">
                  <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#17294b]/[0.06] text-[#17294b] dark:bg-white/[0.06] dark:text-slate-300">
                    <Icon name="sparkles" size={20} />
                  </span>
                  <p className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                    Cherchez dans votre espace client
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Missions, factures, devis et commandes — uniquement les vôtres.
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                    <Icon name="search" size={20} />
                  </span>
                  <p className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-300">Aucun résultat</p>
                  <p className="mt-1 text-xs text-slate-400">Essayez avec un autre mot-clé.</p>
                </div>
              ) : (
                <ul className="space-y-0.5">
                  {results.map((result, index) => (
                    <motion.li
                      animate={{ opacity: 1, y: 0 }}
                      initial={reduce ? undefined : { opacity: 0, y: 6 }}
                      key={`${result.section}-${result.id}`}
                      transition={{ duration: 0.25, delay: index * 0.03 }}
                    >
                      <button
                        className="flex w-full items-center gap-3.5 rounded-2xl px-3.5 py-3 text-left transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:bg-white/[0.04]"
                        onClick={() => {
                          onClose();
                          onNavigate(result.sectionId);
                        }}
                        type="button"
                      >
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#17294b]/[0.06] text-[#17294b] dark:bg-white/[0.06] dark:text-slate-300">
                          <Icon name={result.icon} size={17} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-bold text-[#16233a] dark:text-slate-100">
                            {result.title}
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] font-medium text-slate-400">
                            {result.subtitle}
                          </span>
                        </span>
                        <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                          {result.section}
                        </span>
                      </button>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:border-white/5">
              <span>{results.length} résultat{results.length > 1 ? "s" : ""}</span>
              <span>Recherche limitée à vos données</span>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function sectionIdOf(section: SearchResult["section"]): string {
  switch (section) {
    case "Missions":
      return "portail-missions";
    case "Factures":
      return "portail-factures";
    case "Devis":
      return "portail-devis";
    case "Commandes":
      return "portail-commandes";
  }
}
