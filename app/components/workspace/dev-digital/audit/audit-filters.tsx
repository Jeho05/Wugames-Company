"use client";

import { Icon } from "@/app/components/ui/app-icon";
import { actionMeta } from "@/app/components/workspace/dev-digital/theme";
import { KBD } from "@/app/components/workspace/dev-digital/ui/primitives";
import { type AuditActor, type AuditFilters } from "@/app/lib/dev-digital-data";

type FilterChipProps = {
  active: boolean;
  color: string;
  label: string;
  meta?: string;
  onClick: () => void;
};

function FilterChip({ active, color, label, meta, onClick }: FilterChipProps) {
  return (
    <button
      aria-pressed={active}
      className={
        "group inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] font-black tracking-wide transition " +
        (active ? "text-[#0a0f1e]" : "border-white/[0.1] bg-white/[0.03] text-[#8b96b3] hover:border-white/[0.22] hover:text-[#c3cbdf]")
      }
      onClick={onClick}
      style={active ? { backgroundColor: color, borderColor: color } : undefined}
      type="button"
    >
      {active ? <Icon name="check" size={11} /> : null}
      {label}
      {meta ? <span className={active ? "opacity-60" : "text-[#4a5675]"}>{meta}</span> : null}
    </button>
  );
}

export function AuditFilters({
  filters,
  tables,
  actions,
  actors,
  onChange,
  onReset,
  hasActiveFilters,
}: {
  filters: AuditFilters;
  tables: { table: string; count: number; hex: string }[];
  actions: { action: string; count: number }[];
  actors: AuditActor[];
  onChange: (patch: Partial<AuditFilters>) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <p className="shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#5c6889]">Surfaces</p>
        <FilterChip active={!filters.table} color="#e9eefb" label="ALL" onClick={() => onChange({ table: null })} />
        {tables.map((table) => (
          <FilterChip
            active={filters.table === table.table}
            color={table.hex}
            key={table.table}
            label={table.table}
            meta={String(table.count)}
            onClick={() => onChange({ table: filters.table === table.table ? null : table.table })}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <p className="shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#5c6889]">Actions</p>
        {actions.map((entry) => {
          const meta = actionMeta(entry.action);
          return (
            <FilterChip
              active={filters.action === entry.action}
              color={meta.color}
              key={entry.action}
              label={entry.action}
              meta={String(entry.count)}
              onClick={() => onChange({ action: filters.action === entry.action ? null : entry.action })}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <p className="shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#5c6889]">Acteurs</p>
        {actors.slice(0, 6).map((actor) => (
          <FilterChip
            active={filters.user === actor.id}
            color="#a78bfa"
            key={actor.id}
            label={actor.name}
            meta={String(actor.count)}
            onClick={() => onChange({ user: filters.user === actor.id ? null : actor.id })}
          />
        ))}
        {hasActiveFilters ? (
          <button
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#f58ea8]/40 bg-[#f58ea8]/10 px-3 py-1.5 font-mono text-[10px] font-bold text-[#f58ea8] transition hover:bg-[#f58ea8]/20"
            onClick={onReset}
            type="button"
          >
            <Icon name="close" size={11} />
            Effacer
          </button>
        ) : null}
      </div>
      <p className="flex items-center gap-1.5 text-[10px] text-[#4a5675]">
        <Icon name="lock" size={10} />
        Filtres appliqués aux événements chargés uniquement · <KBD>/</KBD> pour recherche
      </p>
    </div>
  );
}