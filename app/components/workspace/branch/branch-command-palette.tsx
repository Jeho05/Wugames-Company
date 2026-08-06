"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

import { Icon, type IconName } from "@/app/components/ui/app-icon";
import type { BranchOverview } from "@/app/lib/branch-data";

type BranchCommandPaletteProps = {
  data: BranchOverview;
};

type Result = {
  id: string;
  category: string;
  label: string;
  detail: string;
  href: string;
  icon: IconName;
};

function buildResults(data: BranchOverview): Result[] {
  const results: Result[] = [];
  for (const mission of data.missions) {
    results.push({ id: `m-${mission.id}`, category: "Missions", label: mission.titre, detail: mission.client, href: `/espace/missions?id=${mission.id}`, icon: "hardhat" });
  }
  for (const client of data.clients) {
    results.push({ id: `c-${client.id}`, category: "Clients", label: client.nom, detail: client.email, href: `/espace/clients?id=${client.id}`, icon: "users" });
  }
  for (const supplier of data.suppliers) {
    results.push({ id: `s-${supplier.id}`, category: "Fournisseurs", label: supplier.raisonSociale, detail: supplier.contact, href: `/espace/fournisseurs?id=${supplier.id}`, icon: "truck" });
  }
  for (const product of data.stock.critical) {
    results.push({ id: `p-${product.id}`, category: "Produits", label: product.nom, detail: `${product.reference} · ${product.quantite} unité(s)`, href: `/espace/stocks?id=${product.id}`, icon: "package" });
  }
  for (const member of data.team) {
    results.push({ id: `t-${member.id}`, category: "Équipe", label: member.nom, detail: member.role, href: `/espace/utilisateurs?id=${member.id}`, icon: "users" });
  }
  for (const invoice of data.invoices.list) {
    results.push({ id: `f-${invoice.id}`, category: "Factures", label: invoice.numero, detail: `${invoice.client} · ${invoice.montantTtc} FCFA`, href: `/espace/factures?id=${invoice.id}`, icon: "file-text" });
  }
  for (const row of data.evaluations.ranking) {
    results.push({ id: `e-${row.id}`, category: "Évaluations", label: row.personne, detail: `${row.total}/360 · rang ${row.rang}`, href: `/espace/evaluations?id=${row.id}`, icon: "chart" });
  }
  return results;
}

export function BranchCommandPalette({ data }: BranchCommandPaletteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const openRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const next = !openRef.current;
        if (next) {
          setQuery("");
          setSelected(0);
        }
        setOpen(next);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!open) return;
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const allResults = useMemo(() => buildResults(data), [data]);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === "") return allResults;
    return allResults.filter((result) => `${result.label} ${result.detail} ${result.category}`.toLowerCase().includes(q));
  }, [allResults, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Result[]>();
    for (const result of results) {
      const bucket = map.get(result.category) ?? [];
      bucket.push(result);
      map.set(result.category, bucket);
    }
    return [...map.entries()];
  }, [results]);

  const recent = history
    .map((id) => allResults.find((result) => result.id === id))
    .filter((result): result is Result => Boolean(result))
    .slice(0, 4);

  function goTo(result: Result) {
    setHistory((prev) => [result.id, ...prev.filter((id) => id !== result.id)].slice(0, 6));
    setOpen(false);
    router.push(result.href);
  }

  if (!open) {
    return (
      <button
        aria-label="Ouvrir la recherche (Ctrl + K)"
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-500 shadow-sm transition hover:border-[#0e9f9b]/50 hover:text-[#0e9f9b]"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Icon name="search" size={13} />
        Rechercher
        <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[9px] text-slate-400">Ctrl K</kbd>
      </button>
    );
  }

  const flat = [...grouped.flatMap(([, items]) => items), ...recent.map((result) => ({ ...result, category: "Récent" }))];

  return (
    <div
      aria-label="Recherche globale de la filiale"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-start bg-slate-950/40 p-4 pt-[12vh] backdrop-blur-sm sm:p-6 sm:pt-[14vh]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
      role="dialog"
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/30"
        initial={{ opacity: 0, scale: 0.97, y: -8 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
          <Icon className="text-slate-400" name="search" size={17} />
          <input
            aria-label="Rechercher dans la filiale"
            className="w-full bg-transparent text-[14px] font-semibold text-[#16233a] outline-none placeholder:text-slate-400"
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(0);
            }}
            placeholder="Utilisateurs, clients, fournisseurs, produits, missions, factures…"
            ref={(element) => {
              inputRef.current = element;
              if (open && element) element.focus();
            }}
            role="searchbox"
            value={query}
          />
          <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[9px] text-slate-400">ESC</kbd>
        </div>

        <div className="max-h-[46vh] overflow-y-auto p-2">
          {recent.length > 0 && query.trim() === "" ? (
            <section aria-label="Historique récent" className="mb-1">
              <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Récent</p>
              {recent.map((result) => (
                <button
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
                  key={result.id}
                  onClick={() => goTo(result)}
                  type="button"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                    <Icon name={result.icon} size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-bold text-[#16233a]">{result.label}</span>
                    <span className="block truncate text-[10px] text-slate-400">{result.detail}</span>
                  </span>
                </button>
              ))}
            </section>
          ) : null}

          {grouped.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-[13px] font-bold text-[#16233a]">Aucun résultat pour « {query} »</p>
              <p className="mt-1 text-[11px] text-slate-400">La recherche couvre uniquement votre filiale.</p>
            </div>
          ) : (
            grouped.map(([category, items]) => (
              <section aria-label={category} className="mb-1" key={category}>
                <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">{category}</p>
                {items.map((result) => {
                  const index = flat.indexOf(result);
                  return (
                    <button
                      className={
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition " +
                        (selected === index ? "bg-[#10304f] text-white" : "hover:bg-slate-50")
                      }
                      key={result.id}
                      onClick={() => goTo(result)}
                      onMouseEnter={() => setSelected(index)}
                      type="button"
                    >
                      <span className={"grid size-8 shrink-0 place-items-center rounded-lg " + (selected === index ? "bg-white/10 text-[#7dd3fc]" : "bg-slate-100 text-slate-500")}>
                        <Icon name={result.icon} size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-bold">{result.label}</span>
                        <span className={"block truncate text-[10px] " + (selected === index ? "text-white/60" : "text-slate-400")}>{result.detail}</span>
                      </span>
                      <Icon className={selected === index ? "text-white/60" : "text-slate-300"} name="arrow-up-right" size={13} />
                    </button>
                  );
                })}
              </section>
            ))
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-[9px] font-bold text-slate-400">
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 font-mono">↑↓</kbd> naviguer
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 font-mono">⏎</kbd> ouvrir
          </span>
          <span className="ml-auto text-slate-400">Recherche limitée à {data.filiale.nom}</span>
        </div>
      </motion.div>
    </div>
  );
}
