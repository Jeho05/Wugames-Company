"use client";

import { useEffect, useMemo, useState } from "react";

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
  onRowClick?: (row: ModuleRow) => void;
  initialCreateOpen?: boolean;
  showCreateButton?: boolean;
  categoryFilter?: {
    selected: string;
    onSelect: (cat: string) => void;
    categories: readonly string[];
  };
};

function isModuleStatus(value: unknown): value is ModuleStatus {
  return typeof value === "object" && value !== null && "label" in value && "tone" in value;
}

function exportCsv(rows: ModuleRow[], definition: ModuleDefinition) {
  const header = definition.columns.map((column) => column.label).join(";");
  const lines = rows.map((row) =>
    definition.columns
      .map((column) => {
        const value = row[column.id];
        return `"${String(isModuleStatus(value) ? value.label : value).replace(/"/g, '""')}"`;
      })
      .join(";")
  );
  const csv = "\uFEFF" + [header, ...lines].join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = definition.title.toLowerCase().replace(/\s+/g, "-") + "-export.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function ModuleScreen({
  definition,
  renderCreateForm,
  onRowClick,
  initialCreateOpen = false,
  showCreateButton = true,
  categoryFilter,
}: ModuleScreenProps) {
  const [activeTab, setActiveTab] = useState(definition.tabs[0]);
  const [createOpen, setCreateOpen] = useState(initialCreateOpen);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (initialCreateOpen && renderCreateForm) {
      setCreateOpen(true);
    }
  }, [initialCreateOpen, renderCreateForm]);

  // Reset page when search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query, activeTab, categoryFilter?.selected]);

  const visibleRows = useMemo(() => {
    let rows = definition.rows;

    if (categoryFilter?.selected) {
      rows = rows.filter((r) => String(r.catégorie ?? "") === categoryFilter.selected);
    }

    const normalizedQuery = query.trim().toLocaleLowerCase("fr");

    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((row) =>
      Object.entries(row).some(([key, value]) => {
        if (key === "_raw" || key === "image") return false;
        return (isModuleStatus(value) ? value.label : String(value ?? ""))
          .toLocaleLowerCase("fr")
          .includes(normalizedQuery);
      })
    );
  }, [definition.rows, query, categoryFilter?.selected]);

  const totalPages = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return visibleRows.slice(start, start + pageSize);
  }, [visibleRows, currentPage, pageSize]);

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
        {showCreateButton ? (
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-4 py-2.5 text-sm font-bold text-[#14223b] shadow-lg shadow-amber-600/15 transition hover:bg-[#efb653]"
          onClick={() => setCreateOpen(true)}
          type="button"
        >
          <Icon name="plus" size={17} />
          {definition.actionLabel}
        </button>
        ) : null}
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

              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                {categoryFilter ? (
                  <select
                    aria-label="Filtrer par catégorie"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6] sm:w-[220px]"
                    onChange={(e) => categoryFilter.onSelect(e.target.value)}
                    value={categoryFilter.selected}
                  >
                    <option value="">Toutes les catégories</option>
                    {categoryFilter.categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                ) : null}

                <label className="relative block min-w-0 sm:w-[240px]">
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
            </div>
            <div className="mt-5 flex items-center justify-between pb-4 text-[11px]">
              <p className="font-medium text-slate-400">
                {visibleRows.length} élément{visibleRows.length > 1 ? "s" : ""} affiché{visibleRows.length > 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-3">
                <button
                  className="inline-flex items-center gap-1.5 font-bold text-[#426b95] hover:text-[#17294b]"
                  onClick={() => exportCsv(visibleRows, definition)}
                  type="button"
                >
                  <Icon name="download" size={16} />
                  Exporter en CSV
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Card List View */}
          <div className="divide-y divide-slate-100 md:hidden">
            {paginatedRows.map((row: ModuleRow, rowIndex) => {
              const primaryCol = definition.columns.find((c) => c.id !== "image") ?? definition.columns[0];
              const primaryVal = row[primaryCol?.id] ?? "";
              const imageUrl = (row.image as string) || (row.image_url as string);

              return (
                <div
                  className="cursor-pointer p-4 space-y-2 transition hover:bg-slate-50/70"
                  key={definition.title + rowIndex}
                  onClick={() => (onRowClick ? onRowClick(row) : undefined)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {definition.columns.some((c) => c.id === "image") ? (
                        imageUrl ? (
                          <div className="size-11 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              alt=""
                              className="size-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://placehold.co/80x80/f1f5f9/64748b?text=Produit";
                              }}
                              src={imageUrl}
                            />
                          </div>
                        ) : (
                          <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-100 text-slate-400">
                            <Icon name="boxes" size={20} />
                          </div>
                        )
                      ) : null}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800">
                          {isModuleStatus(primaryVal) ? primaryVal.label : String(primaryVal ?? "")}
                        </p>
                        {row.catégorie ? (
                          <span className="mt-0.5 inline-flex items-center rounded-md border border-sky-100 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-800">
                            {String(row.catégorie)}
                          </span>
                        ) : null}
                      </div>
                    </div>

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
                    {definition.columns
                      .filter((col) => col.id !== primaryCol?.id && col.id !== "image" && col.id !== "catégorie")
                      .map((col) => {
                        const val = row[col.id];
                        if (isModuleStatus(val)) return null;
                        const isDepot = col.id === "dépôt";
                        const isGlobalHolding = isDepot && String(val) === "Holding WUGAMS (Global)";

                        return (
                          <div key={col.id}>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              {col.label}
                            </span>
                            <span className={`font-semibold ${isGlobalHolding ? "italic text-slate-400 font-normal" : "text-slate-700"}`}>
                              {String(val ?? "—")}
                            </span>
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
                    <th
                      className={`px-5 py-3.5 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6 ${
                        column.id === "image" ? "w-16" : ""
                      }`}
                      key={column.id}
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="w-10 px-3 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row: ModuleRow, rowIndex) => (
                  <tr
                    className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-sky-50/50"
                    key={definition.title + rowIndex}
                    onClick={() => (onRowClick ? onRowClick(row) : undefined)}
                  >
                    {definition.columns.map((column, columnIndex) => {
                      const cell = row[column.id];

                      if (column.id === "image") {
                        const imgUrl = typeof cell === "string" && cell ? cell : ((row.image_url as string) || "");
                        return (
                          <td className="px-5 py-3 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6" key={column.id}>
                            {imgUrl ? (
                              <div className="size-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-2xs">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  alt=""
                                  className="size-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://placehold.co/80x80/f1f5f9/64748b?text=Produit";
                                  }}
                                  src={imgUrl}
                                />
                              </div>
                            ) : (
                              <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-100 text-slate-400">
                                <Icon name="boxes" size={18} />
                              </div>
                            )}
                          </td>
                        );
                      }

                      if (column.id === "catégorie") {
                        return (
                          <td className="px-5 py-4 text-xs font-medium text-slate-600 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6" key={column.id}>
                            <span className="inline-flex max-w-[220px] truncate items-center rounded-lg border border-sky-100 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-800">
                              {String(cell || "Non catégorisé")}
                            </span>
                          </td>
                        );
                      }

                      if (column.id === "dépôt") {
                        const isGlobal = String(cell) === "Holding WUGAMS (Global)";
                        return (
                          <td className="px-5 py-4 text-xs text-slate-600 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6" key={column.id}>
                            {isGlobal ? (
                              <span className="italic text-slate-400 font-normal">Holding WUGAMS (Global)</span>
                            ) : (
                              <span className="font-medium text-slate-700">{String(cell ?? "—")}</span>
                            )}
                          </td>
                        );
                      }

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
                            String(cell ?? "—")
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

          {/* Flowdash-style Pagination Bar */}
          {visibleRows.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3.5 sm:px-6">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>
                  Affichage de <strong>{(currentPage - 1) * pageSize + 1}</strong> à{" "}
                  <strong>{Math.min(currentPage * pageSize, visibleRows.length)}</strong> sur{" "}
                  <strong>{visibleRows.length}</strong>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Lignes :</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-xs focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 shadow-xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Icon name="arrow-left" size={13} />
                    Précédent
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          type="button"
                          className={`size-7 rounded-lg text-xs font-bold transition ${
                            currentPage === pageNum
                              ? "bg-[#0c1424] text-white shadow-xs"
                              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 shadow-xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Suivant
                    <Icon name="arrow-right" size={13} />
                  </button>
                </div>
              )}
            </div>
          )}

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
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
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
                  setToast("Action enregistrée avec succès.");
                }}
                type="button"
              >
                Confirmer l&apos;action
              </button>
            </div>
          </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
