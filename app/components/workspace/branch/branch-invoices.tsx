"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { BranchInvoiceKpi, BranchInvoiceRow } from "@/app/lib/branch-data";

type BranchInvoicesProps = {
  kpis: BranchInvoiceKpi[];
  list: BranchInvoiceRow[];
  trend: { label: string; valeur: number }[];
};

const toneChip: Record<string, string> = {
  good: "bg-emerald-50 text-emerald-700",
  warn: "bg-amber-50 text-amber-700",
  bad: "bg-rose-50 text-rose-700",
  neutral: "bg-slate-100 text-slate-600",
};

const statutTone: Record<BranchInvoiceRow["statutTone"], string> = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warn: "border-amber-200 bg-amber-50 text-amber-700",
  bad: "border-rose-200 bg-rose-50 text-rose-700",
  neutral: "border-slate-200 bg-slate-100 text-slate-600",
};

export function BranchInvoices({ kpis, list, trend }: BranchInvoicesProps) {
  return (
    <ExecutivePanel
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700">
          <Icon name="lock" size={11} />
          Consultation uniquement
        </span>
      }
      icon="file-text"
      subtitle="Vous ne pouvez ni créer, ni modifier le statut d'une facture"
      title="Factures de la filiale"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 transition hover:bg-white" key={kpi.key}>
            <div className="flex items-center justify-between">
              <span className="grid size-8 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
                <Icon name={kpi.icon} size={14} />
              </span>
              <span className={"rounded-full px-2 py-0.5 text-[9px] font-extrabold " + toneChip[kpi.tone]}>{kpi.change}</span>
            </div>
            <p className="mt-2.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">{kpi.label}</p>
            <p className="mt-0.5 text-[15px] font-extrabold tabular-nums tracking-tight text-[#0f2a52]">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 h-[190px] w-full">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={trend} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="branchInvoiceFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
            <XAxis axisLine={false} dataKey="label" fontSize={10} fontWeight={600} tick={{ fill: "#94a3b8" }} tickLine={false} />
            <YAxis axisLine={false} fontSize={10} fontWeight={600} tick={{ fill: "#94a3b8" }} tickLine={false} width={36} tickFormatter={(value: number) => `${value} M`} />
            <Tooltip
              content={({ active, payload, label }) =>
                active && payload && payload.length > 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2.5 shadow-xl shadow-slate-950/10 backdrop-blur">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="mt-0.5 text-[13px] font-bold text-[#0f2a52]">
                      {typeof payload[0].value === "number" ? `${payload[0].value.toLocaleString("fr-FR")} M FCFA` : payload[0].value}
                    </p>
                  </div>
                ) : null
              }
              cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}
            />
            <Area
              activeDot={{ r: 4, fill: "#10304f", stroke: "#38bdf8", strokeWidth: 2 }}
              animationDuration={900}
              dataKey="valeur"
              fill="url(#branchInvoiceFill)"
              name="Montant TTC"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
              <th className="pb-2.5 pr-3">N°</th>
              <th className="pb-2.5 pr-3">Client</th>
              <th className="pb-2.5 pr-3">Montant HT</th>
              <th className="pb-2.5 pr-3">Montant TTC</th>
              <th className="pb-2.5 pr-3">Échéance</th>
              <th className="pb-2.5 pr-3">Statut</th>
              <th className="pb-2.5 pr-3">Mission</th>
              <th className="pb-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((invoice) => (
              <tr className="group border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50/70" key={invoice.id}>
                <td className="py-3.5 pr-3">
                  <span className="font-mono text-[11px] font-bold text-[#0e9f9b]">{invoice.numero}</span>
                  {invoice.retard ? (
                    <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-rose-50 px-1.5 py-0.5 text-[8px] font-bold text-rose-600">
                      <Icon name="warning" size={8} />
                      Retard
                    </span>
                  ) : null}
                </td>
                <td className="py-3.5 pr-3 text-[11px] font-semibold text-[#16233a]">{invoice.client}</td>
                <td className="py-3.5 pr-3 text-[11px] tabular-nums text-slate-500">{invoice.montantHt}</td>
                <td className="py-3.5 pr-3 text-[12px] font-extrabold tabular-nums text-[#0f2a52]">{invoice.montantTtc}</td>
                <td className="py-3.5 pr-3 text-[11px] tabular-nums text-slate-500">{invoice.echeance}</td>
                <td className="py-3.5 pr-3">
                  <span className={"inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold " + statutTone[invoice.statutTone]}>
                    {invoice.statut}
                  </span>
                </td>
                <td className="max-w-[140px] truncate py-3.5 pr-3 text-[10px] text-slate-400">{invoice.mission}</td>
                <td className="py-3.5 text-right">
                  <div className="flex justify-end gap-1.5">
                    <a
                      aria-label={`Voir le détail de ${invoice.numero}`}
                      className="grid size-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#0e9f9b]/50 hover:text-[#0e9f9b]"
                      href={`/espace/factures?id=${invoice.id}`}
                      title="Voir le détail"
                    >
                      <Icon name="file-text" size={13} />
                    </a>
                    <a
                      aria-label={`Voir le client de ${invoice.numero}`}
                      className="grid size-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#0e9f9b]/50 hover:text-[#0e9f9b]"
                      href={`/espace/clients?facture=${invoice.id}`}
                      title="Voir le client"
                    >
                      <Icon name="users" size={13} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ExecutivePanel>
  );
}
