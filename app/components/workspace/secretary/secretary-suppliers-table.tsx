"use client";

import { useMemo, useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { FournisseurProfile } from "@/app/lib/contracts";

type SecretarySuppliersTableProps = {
  fournisseurs: FournisseurProfile[];
};

export function SecretarySuppliersTable({ fournisseurs }: SecretarySuppliersTableProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return fournisseurs.slice(0, 6);
    return fournisseurs
      .filter((fournisseur) =>
        [fournisseur.raison_sociale, fournisseur.user?.email, fournisseur.user?.phone, fournisseur.siret]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 6);
  }, [fournisseurs, query]);

  return (
    <ExecutivePanel
      action={
        <span className="rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700">
          {fournisseurs.length} référencés
        </span>
      }
      icon="truck"
      subtitle="Les derniers fournisseurs référencés"
      title="Fournisseurs"
    >
      <div className="mb-3 flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
        <Icon className="text-slate-400" name="search" size={15} />
        <input
          aria-label="Filtrer les fournisseurs"
          className="w-full bg-transparent text-[12px] font-medium outline-none placeholder:text-slate-400"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filtrer par raison sociale, email ou SIRET…"
          type="search"
          value={query}
        />
      </div>
      <div className="space-y-1.5">
        {filtered.map((fournisseur) => (
          <div
            className="group flex items-center gap-3 rounded-xl border border-transparent px-2.5 py-2.5 transition hover:border-slate-100 hover:bg-slate-50/70"
            key={fournisseur.id}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700">
              <Icon name="truck" size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-bold text-[#16233a]">
                {fournisseur.raison_sociale ?? "Fournisseur"}
              </p>
              <p className="truncate text-[10px] text-slate-400">
                {fournisseur.user?.email ?? "—"}
                {fournisseur.siret ? ` · SIRET ${fournisseur.siret}` : ""}
              </p>
            </div>
            <span className="hidden shrink-0 truncate text-[10px] text-slate-400 sm:block sm:max-w-[160px]">
              {fournisseur.adresse ?? ""}
            </span>
            <Icon className="text-slate-200 transition group-hover:text-[#e3a641]" name="arrow-right" size={13} />
          </div>
        ))}
        {filtered.length === 0 ? (
          <p className="px-2 py-4 text-center text-[11px] text-slate-400">Aucun fournisseur ne correspond à « {query} ».</p>
        ) : null}
      </div>
    </ExecutivePanel>
  );
}
