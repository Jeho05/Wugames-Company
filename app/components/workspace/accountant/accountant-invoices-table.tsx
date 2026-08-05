"use client";

import Link from "next/link";

import { Icon } from "@/app/components/ui/app-icon";
import { AccountantPanel } from "@/app/components/workspace/accountant/accountant-panel";
import { formatFcfa } from "@/app/lib/accountant-data";
import type { InvoiceRow } from "@/app/lib/accountant-data";
import type { FactureStatut } from "@/app/lib/contracts";

type AccountantInvoicesTableProps = {
  invoices: InvoiceRow[];
};

const statutMeta: Record<FactureStatut, { label: string; badge: string; dot: string }> = {
  BROUILLON: { label: "Brouillon", badge: "border-white/10 bg-white/5 text-slate-300", dot: "bg-slate-400" },
  EMISE: { label: "Émise", badge: "border-sky-400/25 bg-sky-400/10 text-sky-300", dot: "bg-sky-400" },
  PAYEE: { label: "Payée", badge: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400" },
  EN_RETARD: { label: "En retard", badge: "border-rose-500/30 bg-rose-500/10 text-rose-300", dot: "bg-rose-500" },
  ANNULEE: { label: "Annulée", badge: "border-white/10 bg-white/5 text-slate-500 line-through", dot: "bg-slate-600" },
};

function formatDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(parsed);
}

export function AccountantInvoicesTable({ invoices }: AccountantInvoicesTableProps) {
  return (
    <AccountantPanel
      action={
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-300">
          {invoices.length} dernières
        </span>
      }
      icon="file-text"
      subtitle="Factures les plus récentes"
      title="Factures"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left">
          <thead>
            <tr className="border-b border-white/[0.07] text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
              <th className="pb-2.5 pr-3">Numéro</th>
              <th className="pb-2.5 pr-3">Client</th>
              <th className="pb-2.5 pr-3 text-right">Montant</th>
              <th className="pb-2.5 pr-3">Émission</th>
              <th className="pb-2.5 pr-3">Échéance</th>
              <th className="pb-2.5 pr-3">Statut</th>
              <th className="pb-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => {
              const meta = statutMeta[invoice.statut];
              return (
                <tr
                  className="group border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.03]"
                  key={invoice.id}
                >
                  <td className="py-3.5 pr-3">
                    <span className="font-mono text-[12px] font-bold text-[#f2c56d]">{invoice.numero}</span>
                  </td>
                  <td className="py-3.5 pr-3">
                    <span className="block max-w-[150px] truncate text-[12px] font-semibold text-white">{invoice.client}</span>
                    {invoice.filiale ? (
                      <span className="block text-[9px] font-semibold uppercase tracking-wide text-slate-500">{invoice.filiale}</span>
                    ) : null}
                  </td>
                  <td className="py-3.5 pr-3 text-right">
                    <span className="text-[12px] font-extrabold tabular-nums text-white">{formatFcfa(invoice.montant)}</span>
                  </td>
                  <td className="py-3.5 pr-3 text-[11px] tabular-nums text-slate-400">{formatDate(invoice.dateEmission)}</td>
                  <td className="py-3.5 pr-3 text-[11px] tabular-nums text-slate-400">{invoice.echeance ? formatDate(invoice.echeance) : "—"}</td>
                  <td className="py-3.5 pr-3">
                    <span className={"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold " + meta.badge}>
                      <span className={"size-1.5 rounded-full " + meta.dot} />
                      {meta.label}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        aria-label={`Voir la facture ${invoice.numero}`}
                        className="grid size-7 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                        href="/espace/factures"
                      >
                        <Icon name="arrow-up-right" size={14} />
                      </Link>
                      <button
                        aria-label={`Exporter la facture ${invoice.numero}`}
                        className="grid size-7 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                        type="button"
                      >
                        <Icon name="download" size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AccountantPanel>
  );
}
