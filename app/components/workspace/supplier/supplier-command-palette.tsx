"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Icon, type IconName } from "@/app/components/ui/app-icon";
import type { SupplierMovementView, SupplierView } from "@/app/lib/supplier-data";

type CommandResult =
  | { kind: "produit"; id: string; title: string; subtitle: string; icon: IconName }
  | { kind: "mouvement"; id: string; title: string; subtitle: string; icon: IconName }
  | { kind: "filiale"; id: string; title: string; subtitle: string; icon: IconName }
  | { kind: "navigation"; id: SupplierView; title: string; subtitle: string; icon: IconName };

type SupplierCommandPaletteProps = {
  open: boolean;
  products: { id: string; nom: string; reference: string; filiale?: { nom?: string } | null }[];
  movements: SupplierMovementView[];
  filiales: { id: string; nom: string }[];
  onClose: () => void;
  onOpenProduct: (productId: string) => void;
  onNavigate: (view: SupplierView) => void;
  onFilterMovements: (productId: string) => void;
};

const RECENTS_KEY = "wugams-supplier-recents";

function highlight(text: string, query: string) {
  if (!query) return text;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-[#2563eb]/15 px-0.5 text-[#1e40af] dark:bg-[#2563eb]/30 dark:text-sky-300">{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}

export function SupplierCommandPalette({
  open,
  products,
  movements,
  filiales,
  onClose,
  onOpenProduct,
  onNavigate,
  onFilterMovements,
}: SupplierCommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      setQuery("");
      setActiveIndex(0);
      inputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  const recents = useMemo<string[]>(() => {
    try {
      const raw = window.localStorage.getItem(RECENTS_KEY);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      return Array.isArray(parsed) ? parsed.slice(0, 6) : [];
    } catch {
      return [];
    }
  }, []);

  const saveRecent = useCallback((label: string) => {
    try {
      const raw = window.localStorage.getItem(RECENTS_KEY);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      const next = [label, ...parsed.filter((item) => item !== label)].slice(0, 6);
      window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const results = useMemo<CommandResult[]>(() => {
    const q = query.trim().toLowerCase();
    const navigation: CommandResult[] = [
      { kind: "navigation", id: "overview", title: "Vue d'ensemble", subtitle: "Aller à la page", icon: "dashboard" },
      { kind: "navigation", id: "produits", title: "Mes produits", subtitle: "Aller à la page", icon: "package" },
      { kind: "navigation", id: "mouvements", title: "Mouvements", subtitle: "Aller à la page", icon: "history" },
      { kind: "navigation", id: "notifications", title: "Notifications", subtitle: "Aller à la page", icon: "bell" },
      { kind: "navigation", id: "profil", title: "Profil", subtitle: "Aller à la page", icon: "user" },
    ];
    if (!q) return navigation;

    const productResults: CommandResult[] = products
      .filter((p) => `${p.nom} ${p.reference}`.toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => ({ kind: "produit", id: p.id, title: p.nom, subtitle: `${p.reference} · ${p.filiale?.nom ?? "—"}`, icon: "package" as IconName }));

    const filialeResults: CommandResult[] = filiales
      .filter((f) => f.nom.toLowerCase().includes(q))
      .slice(0, 3)
      .map((f) => ({ kind: "filiale", id: f.id, title: f.nom, subtitle: "Filiale associée à vos produits", icon: "building" as IconName }));

    const movementResults: CommandResult[] = movements
      .filter((m) => `${m.produitNom} ${m.produitReference} ${m.type}`.toLowerCase().includes(q))
      .slice(0, 4)
      .map((m) => ({ kind: "mouvement", id: m.id, title: m.produitNom, subtitle: `Mouvement · ${m.type.replace("_", " ").toLowerCase()}`, icon: "history" as IconName }));

    return [...navigation.filter((n) => n.title.toLowerCase().includes(q)), ...productResults, ...filialeResults, ...movementResults];
  }, [filiales, movements, products, query]);

  const run = useCallback(
    (result: CommandResult) => {
      saveRecent(result.title);
      onClose();
      switch (result.kind) {
        case "produit":
          onOpenProduct(result.id);
          break;
        case "mouvement": {
          const movement = movements.find((item) => item.id === result.id);
          onFilterMovements(movement?.produitId ?? result.id);
          break;
        }
        case "filiale":
          onNavigate("produits");
          break;
        case "navigation":
          onNavigate(result.id);
          break;
      }
    },
    [movements, onClose, onFilterMovements, onNavigate, onOpenProduct, saveRecent],
  );

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, results.length - 1));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
      }
      if (event.key === "Enter" && results[activeIndex]) {
        event.preventDefault();
        run(results[activeIndex]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, onClose, results, run, open]);

  const groupLabel = (result: CommandResult) =>
    result.kind === "navigation" ? "Navigation" : result.kind === "produit" ? "Produits" : result.kind === "filiale" ? "Filiales" : "Mouvements";

  return (
    <AnimatePresence>
      {open ? (
        <div aria-modal className="fixed inset-0 z-50" role="dialog">
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="Fermer la recherche"
            className="absolute inset-0 h-full w-full bg-slate-950/50 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
            type="button"
          />
          <motion.div
            animate={{ y: 0, opacity: 1, scale: 1 }}
            className="absolute inset-x-4 top-[12vh] mx-auto max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            exit={{ y: -12, opacity: 0, scale: 0.98 }}
            initial={{ y: -12, opacity: 0, scale: 0.98 }}
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
              <Icon className="text-slate-400" name="search" size={17} />
              <input
                aria-label="Rechercher dans vos produits et mouvements"
                className="w-full bg-transparent text-[14px] text-[#17294b] outline-none placeholder:text-slate-400 dark:text-slate-100"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Produits, références, filiales, mouvements…"
                ref={inputRef}
                type="search"
                value={query}
              />
              <kbd className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
                Échap
              </kbd>
            </div>

            <div className="max-h-[46vh] overflow-y-auto p-2">
              {!query && recents.length > 0 ? (
                <div className="px-3 pb-1 pt-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Recherches récentes</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {recents.map((recent) => (
                      <button
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        key={recent}
                        onClick={() => {
                          const match = results.find((r) => r.title === recent);
                          if (match) run(match);
                          else onClose();
                        }}
                        type="button"
                      >
                        {recent}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {results.length === 0 ? (
                <div className="grid place-items-center gap-2 px-4 py-10 text-center">
                  <Icon className="text-slate-300" name="search" size={22} />
                  <p className="text-[13px] font-bold text-slate-500">Aucun de vos produits ne correspond à cette recherche.</p>
                  <p className="text-[11px] text-slate-400">La recherche est limitée à votre catalogue fournisseur.</p>
                </div>
              ) : null}

              {results.length > 0 ? (
                <ul role="listbox">
                  {results.map((result, index) => (
                    <li key={`${result.kind}-${result.id}`}>
                      <button
                        aria-selected={activeIndex === index}
                        className={
                          "flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left transition " +
                          (activeIndex === index ? "bg-[#2563eb]/10 dark:bg-[#2563eb]/15" : "")
                        }
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => run(result)}
                        role="option"
                        type="button"
                      >
                        <span
                          className={
                            "grid size-9 shrink-0 place-items-center rounded-xl " +
                            (activeIndex === index ? "bg-[#2563eb] text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300")
                          }
                        >
                          <Icon name={result.icon} size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-bold text-[#17294b] dark:text-slate-100">
                            {highlight(result.title, query)}
                          </span>
                          <span className="block truncate text-[11px] text-slate-400">
                            {groupLabel(result)} · {highlight(result.subtitle, query)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
