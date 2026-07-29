"use client";

import { useMemo, useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { StatusBadge } from "@/app/components/ui/status-badge";
import type {
  ModuleDefinition,
  ModuleStatus,
  ModuleRow,
} from "@/app/lib/demo-data";

type CreateFormProps = {
  onClose: () => void;
  onSubmit: (row: ModuleRow) => void;
};

type ModuleScreenProps = {
  definition: ModuleDefinition;
  renderCreateForm?: (props: CreateFormProps) => React.ReactNode;
};

function isModuleStatus(value: string | ModuleStatus): value is ModuleStatus {
  return typeof value === "object";
}

export function ModuleScreen({ definition, renderCreateForm }: ModuleScreenProps) {
  const [activeTab, setActiveTab] = useState(definition.tabs[0]);
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");

  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");

    if (!normalizedQuery) {
      return definition.rows;
    }

    return definition.rows.filter((row) =>
      Object.values(row).some((value) =>
        (isModuleStatus(value) ? value.label : value)
          .toLocaleLowerCase("fr")
          .includes(normalizedQuery)
      )
    );
  }, [definition.rows, query]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div className="flex items-start gap-3.5">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e5edf7] text-[#385d86]">
            <Icon name={definition.icon} size={22} />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">
              {definition.eyebrow}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-[-0.045em] text-[#17294b] sm:text-[30px]">
              {definition.title}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
              {definition.description}
            </p>
          </div>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-4 py-2.5 text-sm font-bold text-[#14223b] shadow-lg shadow-amber-600/15 transition hover:bg-[#efb653]"
          onClick={() => setCreateOpen(true)}
          type="button"
        >
          <Icon name="plus" size={17} />
          {definition.actionLabel}
        </button>
      </section>

      {toast ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span className="flex items-center gap-2">
            <Icon name="check" size={17} />
            {toast}
          </span>
          <button
            aria-label="Fermer le message"
            className="rounded-md p-1 text-emerald-700 hover:bg-emerald-100"
            onClick={() => setToast("")}
            type="button"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        {definition.stats.map((stat, index) => (
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={stat.label}>
            <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-[27px] font-bold tracking-[-0.045em] text-[#182842]">{stat.value}</p>
              <span className={"size-2.5 rounded-full " + (index === 1 ? "bg-[#e3a641]" : "bg-[#7ba3cc]")} />
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_310px]">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 pt-5 sm:px-6 sm:pt-6">
            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
              <div className="flex gap-1 overflow-x-auto pb-1">
                {definition.tabs.map((tab) => (
                  <button
                    aria-pressed={activeTab === tab}
                    className={
                      "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition " +
                      (activeTab === tab
                        ? "bg-[#17294b] text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700")
                    }
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    type="button"
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <label className="relative block min-w-0 xl:w-[250px]">
                <span className="sr-only">Rechercher</span>
                <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" name="search" size={16} />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={"Rechercher dans " + definition.title.toLocaleLowerCase("fr")}
                  type="search"
                  value={query}
                />
              </label>
            </div>
            <div className="mt-5 flex items-center justify-between pb-4 text-[11px]">
              <p className="font-medium text-slate-400">
                {visibleRows.length} élément{visibleRows.length > 1 ? "s" : ""} affiché{visibleRows.length > 1 ? "s" : ""}
              </p>
              <button className="inline-flex items-center gap-1.5 font-bold text-[#426b95] hover:text-[#17294b]" type="button">
                <Icon name="dots" size={16} />
                Filtres
              </button>
            </div>
          </div>

          {/* Mobile Card List View */}
          <div className="divide-y divide-slate-100 md:hidden">
            {visibleRows.map((row: ModuleRow, rowIndex) => {
              const primaryCol = definition.columns[0];
              const primaryVal = row[primaryCol?.id] ?? "";

              return (
                <div
                  className="cursor-pointer p-4 space-y-2 transition hover:bg-slate-50/70"
                  key={definition.title + rowIndex}
                  onClick={() => setToast("Détail du dossier prêt à être relié à l'API.")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-slate-800">
                      {isModuleStatus(primaryVal) ? primaryVal.label : primaryVal}
                    </p>
                    {definition.columns.map((col) => {
                      const val = row[col.id];
                      return isModuleStatus(val) ? (
                        <StatusBadge key={col.id} tone={val.tone}>
                          {val.label}
                        </StatusBadge>
                      ) : null;
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-slate-600">
                    {definition.columns.slice(1).map((col) => {
                      const val = row[col.id];
                      if (isModuleStatus(val)) return null;
                      return (
                        <div key={col.id}>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            {col.label}
                          </span>
                          <span className="font-semibold text-slate-700">{val}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  {definition.columns.map((column) => (
                    <th className="px-5 py-3.5 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6" key={column.id}>
                      {column.label}
                    </th>
                  ))}
                  <th className="w-10 px-3 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row: ModuleRow, rowIndex) => (
                  <tr
                    className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-sky-50/50"
                    key={definition.title + rowIndex}
                    onClick={() => setToast("Détail du dossier prêt à être relié à l'API.")}
                  >
                    {definition.columns.map((column, columnIndex) => {
                      const cell = row[column.id];

                      return (
                        <td
                          className={
                            "px-5 py-4 text-xs text-slate-600 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6 " +
                            (columnIndex === 0 ? "font-bold text-slate-700" : "font-medium")
                          }
                          key={column.id}
                        >
                          {isModuleStatus(cell) ? (
                            <StatusBadge tone={cell.tone}>{cell.label}</StatusBadge>
                          ) : (
                            cell
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-4 text-slate-400">
                      <Icon name="dots" size={17} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {visibleRows.length === 0 ? (
            <div className="grid min-h-40 place-items-center p-8 text-center">
              <div>
                <span className="mx-auto grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-400">
                  <Icon name="search" size={18} />
                </span>
                <p className="mt-3 text-sm font-bold text-slate-700">Aucun résultat</p>
                <p className="mt-1 text-xs text-slate-500">Essayez une recherche plus large.</p>
              </div>
            </div>
          ) : null}
        </article>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-bold tracking-[-0.025em] text-[#1a2943]">Repères</p>
              <p className="mt-1 text-xs text-slate-500">Lecture rapide du module</p>
            </div>
            <span className="grid size-9 place-items-center rounded-xl bg-[#edf3f9] text-[#426b95]">
              <Icon name="sparkles" size={17} />
            </span>
          </div>
          <div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50 px-4">
            {definition.insights.map((insight) => (
              <div className="flex items-center justify-between gap-3 py-3.5" key={insight.label}>
                <p className="text-xs font-medium text-slate-500">{insight.label}</p>
                <p className="text-sm font-bold text-[#233856]">{insight.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-3.5">
            <div className="flex gap-2.5">
              <Icon className="mt-0.5 shrink-0 text-[#d19331]" name="shield" size={17} />
              <p className="text-[11px] leading-5 text-slate-500">
                La visibilité et les actions finales devront être appliquées selon le rôle et la filiale renvoyés par le back-end.
              </p>
            </div>
          </div>
        </aside>
      </section>

      {createOpen ? (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/40 p-4">
          {renderCreateForm ? (
            renderCreateForm({
              onClose: () => setCreateOpen(false),
              onSubmit: (row: ModuleRow) => {
                setCreateOpen(false);
                setToast(definition.actionLabel.replace("Créer ", "") + " créé(e) avec succès.");
                definition.rows.unshift(row);
              },
            })
          ) : (
          <div
            aria-labelledby="create-title"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#d19331]">Front prêt à connecter</p>
                <h2 className="mt-1 text-xl font-bold tracking-[-0.035em] text-[#17294b]" id="create-title">
                  {definition.actionLabel}
                </h2>
              </div>
              <button
                aria-label="Fermer"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setCreateOpen(false)}
                type="button"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              Le formulaire métier sera branché sur l&apos;endpoint de création correspondant. Les composants de liste, recherche, statut et retour utilisateur sont déjà en place.
            </p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300"
                onClick={() => setCreateOpen(false)}
                type="button"
              >
                Annuler
              </button>
              <button
                className="rounded-xl bg-[#17294b] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#243a61]"
                onClick={() => {
                  setCreateOpen(false);
                  setToast("Action préparée. L'enregistrement sera disponible après branchement API.");
                }}
                type="button"
              >
                Préparer l&apos;action
              </button>
            </div>
          </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
