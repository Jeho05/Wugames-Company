"use client";

import { useMemo, useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { ClientProfile } from "@/app/lib/contracts";

type SecretaryClientsTableProps = {
  clients: ClientProfile[];
};

function initialsOf(first?: string, last?: string): string {
  return `${first?.charAt(0) ?? ""}${last?.charAt(0) ?? ""}`.toUpperCase() || "?";
}

export function SecretaryClientsTable({ clients }: SecretaryClientsTableProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return clients.slice(0, 6);
    return clients
      .filter((client) =>
        [client.user?.first_name, client.user?.last_name, client.user?.email, client.user?.phone, client.adresse]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 6);
  }, [clients, query]);

  return (
    <ExecutivePanel
      action={
        <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700">
          {clients.length} fiches
        </span>
      }
      icon="users"
      subtitle="Les dernières fiches clients"
      title="Clients"
    >
      <div className="mb-3 flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
        <Icon className="text-slate-400" name="search" size={15} />
        <input
          aria-label="Filtrer les clients"
          className="w-full bg-transparent text-[12px] font-medium outline-none placeholder:text-slate-400"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filtrer par nom, email, téléphone ou adresse…"
          type="search"
          value={query}
        />
      </div>
      <div className="space-y-1.5">
        {filtered.map((client) => {
          const first = client.user?.first_name ?? "";
          const last = client.user?.last_name ?? "";
          const displayName = [first, last].filter(Boolean).join(" ") || client.id;
          return (
            <div
              className="group flex items-center gap-3 rounded-xl border border-transparent px-2.5 py-2.5 transition hover:border-slate-100 hover:bg-slate-50/70"
              key={client.id}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sky-100 text-[11px] font-extrabold text-sky-700">
                {initialsOf(first, last)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold text-[#16233a]">{displayName}</p>
                <p className="truncate text-[10px] text-slate-400">
                  {client.user?.email ?? "—"}
                  {client.user?.phone ? ` · ${client.user.phone}` : ""}
                </p>
              </div>
              <span className="hidden shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-bold uppercase text-slate-500 sm:block">
                {client.type_client ?? "STANDARD"}
              </span>
              <Icon className="text-slate-200 transition group-hover:text-[#e3a641]" name="arrow-right" size={13} />
            </div>
          );
        })}
        {filtered.length === 0 ? (
          <p className="px-2 py-4 text-center text-[11px] text-slate-400">Aucun client ne correspond à « {query} ».</p>
        ) : null}
      </div>
    </ExecutivePanel>
  );
}
