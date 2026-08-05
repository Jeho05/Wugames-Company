"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { SearchEntry } from "@/app/lib/secretary-data";

type SecretarySearchProps = {
  index: SearchEntry[];
};

const kindMeta: Record<SearchEntry["kind"], { label: string; badge: string; tile: string }> = {
  client: { label: "Client", badge: "border-sky-200 bg-sky-50 text-sky-700", tile: "bg-sky-100 text-sky-700" },
  fournisseur: { label: "Fournisseur", badge: "border-violet-200 bg-violet-50 text-violet-700", tile: "bg-violet-100 text-violet-700" },
  utilisateur: { label: "Utilisateur", badge: "border-amber-200 bg-amber-50 text-amber-800", tile: "bg-amber-100 text-amber-700" },
};

function initialsOf(title: string): string {
  const parts = title.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
}

export function SecretarySearch({ index }: SecretarySearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return index
      .filter((entry) =>
        [entry.title, entry.subtitle].join(" ").toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [index, query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement !== inputRef.current) {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape") {
        inputRef.current?.blur();
        setFocused(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative">
      <div
        className={
          "flex items-center gap-3 rounded-2xl border bg-white/90 px-4 py-3.5 shadow-lg shadow-slate-950/[0.05] backdrop-blur transition-all duration-200 " +
          (focused ? "border-[#e3a641]/70 ring-4 ring-amber-100/80" : "border-slate-200 hover:border-slate-300")
        }
      >
        <Icon className="text-slate-400" name="search" size={20} />
        <input
          aria-label="Recherche globale — clients, fournisseurs, utilisateurs"
          className="w-full bg-transparent text-[15px] font-medium text-[#16233a] outline-none placeholder:text-slate-400"
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && results.length > 0) {
              router.push(results[0].href);
              inputRef.current?.blur();
            }
          }}
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
          placeholder="Rechercher un client, fournisseur, utilisateur, email, téléphone ou ID…"
          ref={inputRef}
          type="search"
          value={query}
        />
        <kbd className="hidden shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-400 sm:block">
          /
        </kbd>
      </div>

      <AnimatePresence>
        {focused && results.length > 0 ? (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/10"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <p className="border-b border-slate-100 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Suggestions instantanées · {results.length} résultat(s)
            </p>
            <ul className="max-h-[320px] overflow-y-auto p-1.5">
              {results.map((entry) => {
                const meta = kindMeta[entry.kind];
                return (
                  <li key={entry.id}>
                    <button
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        router.push(entry.href);
                        setFocused(false);
                      }}
                      type="button"
                    >
                      <span className={"grid size-9 shrink-0 place-items-center rounded-xl text-[11px] font-extrabold " + meta.tile}>
                        {initialsOf(entry.title)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-bold text-[#16233a]">{entry.title}</span>
                        <span className="block truncate text-[11px] text-slate-400">{entry.subtitle}</span>
                      </span>
                      <span className={"shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase " + meta.badge}>
                        {meta.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
