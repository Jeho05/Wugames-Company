"use client";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { BranchClient } from "@/app/lib/branch-data";

type BranchClientsProps = {
  clients: BranchClient[];
};

const typeMeta: Record<string, { label: string; badge: string }> = {
  MEMBRE: { label: "Membre", badge: "border-[#0e9f9b]/25 bg-teal-50 text-teal-700" },
  STANDARD: { label: "Standard", badge: "border-slate-200 bg-slate-100 text-slate-600" },
};

export function BranchClients({ clients }: BranchClientsProps) {
  return (
    <ExecutivePanel
      action={
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
          {clients.length} client(s) local(aux)
        </span>
      }
      icon="users"
      subtitle="Consultation — clients ayant une activité dans la filiale"
      title="Clients de la filiale"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
              <th className="pb-2.5 pr-3">Client</th>
              <th className="pb-2.5 pr-3">Type</th>
              <th className="pb-2.5 pr-3">Contact</th>
              <th className="pb-2.5 pr-3">Missions</th>
              <th className="pb-2.5 pr-3">Factures</th>
              <th className="pb-2.5 pr-3">Dernière activité</th>
              <th className="pb-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const meta = typeMeta[client.type] ?? typeMeta.STANDARD;
              return (
                <tr className="group border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50/70" key={client.id}>
                  <td className="py-3.5 pr-3">
                    <p className="text-[12px] font-bold text-[#16233a]">{client.nom}</p>
                    <p className="text-[10px] text-slate-400">{client.email}</p>
                  </td>
                  <td className="py-3.5 pr-3">
                    <span className={"inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold " + meta.badge}>{meta.label}</span>
                  </td>
                  <td className="py-3.5 pr-3 text-[11px] tabular-nums text-slate-500">{client.telephone}</td>
                  <td className="py-3.5 pr-3 text-[12px] font-extrabold tabular-nums text-[#0f2a52]">{client.missions}</td>
                  <td className="py-3.5 pr-3 text-[12px] font-extrabold tabular-nums text-[#0f2a52]">{client.factures}</td>
                  <td className="py-3.5 pr-3 text-[10px] text-slate-400">{client.derniereActivite}</td>
                  <td className="py-3.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <a
                        aria-label={`Voir le profil de ${client.nom}`}
                        className="grid size-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#0e9f9b]/50 hover:text-[#0e9f9b]"
                        href={`/espace/clients?id=${client.id}`}
                        title="Voir le profil"
                      >
                        <Icon name="users" size={13} />
                      </a>
                      <a
                        aria-label={`Voir les missions de ${client.nom}`}
                        className="grid size-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#0e9f9b]/50 hover:text-[#0e9f9b]"
                        href={`/espace/missions?client=${client.id}`}
                        title="Voir les missions"
                      >
                        <Icon name="hardhat" size={13} />
                      </a>
                      <a
                        aria-label={`Voir les factures de ${client.nom}`}
                        className="grid size-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#0e9f9b]/50 hover:text-[#0e9f9b]"
                        href={`/espace/factures?client=${client.id}`}
                        title="Voir les factures"
                      >
                        <Icon name="file-text" size={13} />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ExecutivePanel>
  );
}
