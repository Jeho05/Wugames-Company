"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { actionMeta } from "@/app/components/workspace/dev-digital/theme";
import { Avatar, KBD } from "@/app/components/workspace/dev-digital/ui/primitives";
import { clockTime, humanTableLabel, initialsOfName, shortId, type AuditLog } from "@/app/lib/dev-digital-data";

function ActionMark({ action }: { action: string }) {
  const meta = actionMeta(action);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-black tracking-wider"
      style={{ borderColor: `${meta.color}40`, backgroundColor: meta.soft, color: meta.color }}
    >
      <span className="size-1 rounded-full" style={{ backgroundColor: meta.color }} />
      {action.toUpperCase()}
    </span>
  );
}

export function AuditEvent({
  event,
  density,
  onSelect,
}: {
  event: AuditLog;
  density: "comfort" | "compact";
  onSelect: () => void;
}) {
  const meta = actionMeta(event.action);
  const actor = event.user ? `${event.user.first_name} ${event.user.last_name}` : "Acteur inconnu";
  const compact = density === "compact";

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={
        "group relative cursor-pointer rounded-2xl border border-[rgba(148,163,207,0.1)] bg-white/[0.02] transition-colors duration-200 hover:border-white/[0.18] hover:bg-white/[0.04] " +
        (compact ? "px-3 py-2" : "px-4 py-3.5")
      }
      initial={{ opacity: 0, y: 8 }}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={compact ? "flex items-center gap-3" : "flex items-start gap-3"}>
        <span
          aria-hidden="true"
          className="hidden shrink-0 self-stretch rounded-full sm:block"
          style={{ backgroundColor: meta.soft, width: 3 }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <ActionMark action={event.action} />
              <span className="truncate font-mono text-[11px] font-bold text-[#c3cbdf]">{event.table_cible}</span>
              <span className="hidden truncate text-[10px] text-[#5c6889] md:inline">· {humanTableLabel(event.table_cible)}</span>
            </div>
            <span className="font-mono text-[10px] font-bold tabular-nums text-[#5c6889]">{clockTime(event.created_at)}</span>
          </div>

          <div className={"flex flex-wrap items-center justify-between gap-2 " + (compact ? "mt-1" : "mt-2.5")}>
            <div className="flex min-w-0 items-center gap-2 text-[12px] font-semibold text-[#8b96b3]">
              <Avatar initials={initialsOfName(actor)} size={20} />
              <span className="truncate">{actor}</span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="flex cursor-pointer items-center gap-1.5 font-mono text-[10px] font-bold text-[#5c6889] transition hover:text-[#c3cbdf]"
                onClick={(click) => {
                  click.stopPropagation();
                  navigator.clipboard?.writeText(event.entite_id);
                }}
                role="button"
                tabIndex={-1}
                title="Copier l'identifiant d'entité"
              >
                <Icon name="copy" size={11} />
                {shortId(event.entite_id)}
              </span>
              <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#6b7994]">
                <Icon name="lock" size={10} />
                immuable
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Time Machine : curseur temporel filtrant la trace chargée           */
/* ------------------------------------------------------------------ */

export function TimeMachine({
  max,
  value,
  valueLabel,
  onChange,
}: {
  max: number;
  value: number;
  valueLabel?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[rgba(148,163,207,0.12)] bg-[#0f172f]/60 px-3 py-2">
      <Icon className="shrink-0 text-[#5cc8ff]" name="history" size={14} />
      <input
        aria-label="Time Machine — remonter le temps sur les événements chargés"
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#5cc8ff]"
        max={max}
        min={0}
        onChange={(event) => onChange(Number(event.target.value))}
        type="range"
        value={value}
      />
      <span className="shrink-0 font-mono text-[10px] font-bold tabular-nums text-[#8b96b3]">
        {valueLabel ?? value} / {max}
      </span>
    </div>
  );
}

export function AuditEmpty({ query }: { query: string }) {
  return (
    <div className="grid place-items-center py-14 text-center">
      <div className="relative grid size-14 place-items-center rounded-2xl border border-white/[0.1] bg-white/[0.03]">
        <Icon className="text-[#5c6889]" name="activity" size={22} />
        <span className="absolute -right-1 -top-1 size-2 rounded-full bg-[#e3a641]/70" />
      </div>
      <p className="mt-4 text-[13px] font-black tracking-[0.14em] text-[#c3cbdf]">NO MATCH</p>
      <p className="mt-1.5 max-w-sm text-[11px] leading-5 text-[#5c6889]">
        Aucun événement ne correspond {query ? `à « ${query} »` : "aux filtres actifs"}. Modifiez les critères ou effacez les filtres.
      </p>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-[#5c6889]">
        <KBD>Esc</KBD> fermer le détail · <KBD>⌘K</KBD> recherche
      </p>
    </div>
  );
}

export function AuditList({
  events,
  density,
  timeIndex,
  onSelect,
}: {
  events: AuditLog[];
  density: "comfort" | "compact";
  timeIndex: number;
  onSelect: (log: AuditLog) => void;
}) {
  const visible = timeIndex >= events.length ? events : events.slice(0, Math.max(timeIndex, 1));
  const capped = events.length > 64;

  return (
    <div>
      <div className="space-y-2">
        {visible.map((event) => (
          <AuditEvent density={density} event={event} key={event.id} onSelect={() => onSelect(event)} />
        ))}
      </div>
      <p className="mt-4 text-center font-mono text-[10px] font-bold text-[#5c6889]">
        {capped ? `Affichage des ${visible.length} événements visibles — ${events.length} chargés` : "Based on loaded audit events"}
      </p>
    </div>
  );
}