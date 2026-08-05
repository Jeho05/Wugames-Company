"use client";

import { useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import type { IconName } from "@/app/components/ui/app-icon";
import { AccountantPanel } from "@/app/components/workspace/accountant/accountant-panel";
import type { ReportItem } from "@/app/lib/accountant-data";

type AccountantReportsProps = {
  reports: ReportItem[];
};

const formatMeta: Record<ReportItem["format"], { icon: "file-text" | "download"; tile: string }> = {
  PDF: { icon: "file-text", tile: "bg-rose-500/10 text-rose-300" },
  XLSX: { icon: "download", tile: "bg-emerald-400/10 text-emerald-300" },
  CSV: { icon: "download", tile: "bg-sky-400/10 text-sky-300" },
};

const actions: { icon: IconName; label: string; hint: string; exportKind: "pdf" | "xlsx" | "csv" | "print" }[] = [
  { icon: "file-text", label: "Rapport PDF", hint: "Bilan et clôture", exportKind: "pdf" },
  { icon: "download", label: "Exporter Excel", hint: "Tableur .xlsx", exportKind: "xlsx" },
  { icon: "download", label: "Exporter CSV", hint: "Données brutes", exportKind: "csv" },
  { icon: "print", label: "Imprimer", hint: "Version papier", exportKind: "print" },
];

export function AccountantReports({ reports }: AccountantReportsProps) {
  const [notice, setNotice] = useState<string | null>(null);

  function trigger(action: (typeof actions)[number]) {
    if (action.exportKind === "csv") {
      const rows = reports.map((report) => [report.name, report.format, report.date, report.size].join(";"));
      const blob = new Blob([`Nom;Format;Date;Taille\n${rows.join("\n")}`], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "rapports-financiers.csv";
      anchor.click();
      URL.revokeObjectURL(url);
      setNotice("Export CSV téléchargé.");
      return;
    }
    if (action.exportKind === "print") {
      window.print();
      setNotice("Impression lancée.");
      return;
    }
    setNotice(`Génération du rapport ${action.label.toLowerCase()}… (à venir dans le module Factures)`);
  }

  return (
    <AccountantPanel
      action={
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-300">
          {reports.length} exports
        </span>
      }
      icon="newspaper"
      subtitle="Bilans, clôtures et exports"
      title="Rapports financiers"
    >
      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((action) => (
          <button
            className="group flex flex-col gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3 text-left transition duration-200 hover:border-[#e3a641]/40 hover:bg-white/[0.06]"
            key={action.exportKind}
            onClick={() => trigger(action)}
            type="button"
          >
            <span className="grid size-8 place-items-center rounded-xl bg-white/[0.06] text-slate-300 transition group-hover:bg-[#e3a641]/15 group-hover:text-[#f2c56d]">
              <Icon name={action.icon} size={15} />
            </span>
            <span>
              <span className="block text-[11px] font-bold text-white">{action.label}</span>
              <span className="mt-0.5 block text-[9px] text-slate-500">{action.hint}</span>
            </span>
          </button>
        ))}
      </div>

      {notice ? (
        <p aria-live="polite" className="mt-3 rounded-xl border border-[#e3a641]/25 bg-[#e3a641]/10 px-3 py-2 text-[10px] font-semibold text-[#f2c56d]">
          {notice}
        </p>
      ) : null}

      <p className="mt-4 mb-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Historique des exports</p>
      <ul className="space-y-1.5">
        {reports.map((report) => {
          const meta = formatMeta[report.format];
          return (
            <li className="flex items-center gap-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2" key={report.id}>
              <span className={"grid size-7 shrink-0 place-items-center rounded-lg " + meta.tile}>
                <Icon name={meta.icon} size={13} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10px] font-bold text-slate-200">{report.name}</span>
                <span className="block text-[9px] text-slate-500">
                  {report.date} · {report.size}
                </span>
              </span>
              <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[8px] font-extrabold text-slate-400">
                {report.format}
              </span>
            </li>
          );
        })}
      </ul>
    </AccountantPanel>
  );
}
