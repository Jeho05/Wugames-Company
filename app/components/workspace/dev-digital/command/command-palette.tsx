"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { motion } from "motion/react";

import { Icon, type IconName } from "@/app/components/ui/app-icon";
import { actionMeta } from "@/app/components/workspace/dev-digital/theme";
import { KBD } from "@/app/components/workspace/dev-digital/ui/primitives";
import {
  aggregateActions,
  aggregateActors,
  aggregateTables,
  clockTime,
  type AuditLog,
} from "@/app/lib/dev-digital-data";

type PaletteItemGroup = "log" | "tables" | "actions" | "actors";

type PaletteItem = {
  id: string;
  group: PaletteItemGroup;
  label: string;
  hint: string;
  icon: IconName;
  color: string;
  run: () => void;
};

function isTypingTarget(element: HTMLElement | null): boolean {
  if (!element) return false;
  const tag = element.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || element.isContentEditable;
}

export function CommandPalette({
  open,
  logs,
  onRequestOpen,
  onClose,
  onSelectLog,
  onSelectTable,
  onSelectAction,
  onSelectActor,
}: {
  open: boolean;
  logs: AuditLog[];
  onRequestOpen: () => void;
  onClose: () => void;
  onSelectLog: (log: AuditLog) => void;
  onSelectTable: (table: string) => void;
  onSelectAction: (action: string) => void;
  onSelectActor: (userId: string | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) onClose();
        else onRequestOpen();
        return;
      }
      if (open) return;
      if (event.key === "/" && !isTypingTarget(event.target as HTMLElement | null)) {
        event.preventDefault();
        onRequestOpen();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => {
        setQuery("");
        setActive(0);
        inputRef.current?.focus();
      }, 30);
    }
  }, [open]);

  const items = useMemo<PaletteItem[]>(() => {
    const q = query.trim().toLowerCase();
    const tables = aggregateTables(logs);
    const actions = aggregateActions(logs);
    const actors = aggregateActors(logs);

    const logMatches = q
      ? logs.filter((log) =>
          [log.table_cible, log.action, log.user_id, log.entite_id, log.user?.first_name, log.user?.last_name]
            .filter(Boolean)
            .some((fragment) => String(fragment).toLowerCase().includes(q)),
        )
      : [];
    const tableMatches = q ? tables.filter((t) => t.table.includes(q)) : tables.slice(0, 4);
    const actionMatches = q ? actions.filter((a) => a.action.includes(q.toUpperCase())) : actions.slice(0, 3);
    const actorMatches = q ? actors.filter((a) => a.name.toLowerCase().includes(q)) : actors.slice(0, 3);

    const result: PaletteItem[] = [];
    const push = (item: PaletteItem) => result.push(item);

    if (q) {
      for (const log of logMatches.slice(0, 6)) {
        const meta = actionMeta(log.action);
        push({
          id: `log:${log.id}`,
          group: "log",
          label: `${log.table_cible} · ${log.action}`,
          hint: `${log.user ? `${log.user.first_name} ${log.user.last_name}` : "inconnu"} — ${clockTime(log.created_at)}`,
          icon: "activity",
          color: meta.color,
          run: () => onSelectLog(log),
        });
      }
    } else {
      for (const table of tableMatches) {
        push({
          id: `table:${table.table}`,
          group: "actions",
          label: table.table,
          hint: `${table.count} événement${table.count > 1 ? "s" : ""} chargés`,
          icon: "package",
          color: table.hex,
          run: () => onSelectTable(table.table),
        });
      }
      for (const action of actionMatches) {
        const meta = actionMeta(action.action);
        push({
          id: `action:${action.action}`,
          group: "actions",
          label: action.action,
          hint: `${action.count} occurrences`,
          icon: "activity",
          color: meta.color,
          run: () => onSelectAction(action.action),
        });
      }
      for (const actor of actorMatches) {
        push({
          id: `actor:${actor.id}`,
          group: "actors",
          label: actor.name,
          hint: `${actor.count} opérations · ${actor.email ?? "adresse inconnue"}`,
          icon: "user",
          color: "#a78bfa",
          run: () => onSelectActor(actor.id),
        });
      }
    }

    if (result.length === 0) {
      push({
        id: "empty",
        group: "log",
        label: "Aucun résultat",
        hint: q ? `Rien ne correspond à « ${q} »` : "Aucune commande disponible",
        icon: "search",
        color: "#5c6889",
        run: () => undefined,
      });
    }
    return result;
  }, [query, logs, onSelectLog, onSelectTable, onSelectAction, onSelectActor]);

  useEffect(() => {
    itemRefs.current.get(items[Math.min(active, items.length - 1)]?.id)?.scrollIntoView({ block: "nearest" });
  }, [active, items]);

  if (!open) return null;

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#05070f]/70 p-4 pt-[12vh] backdrop-blur"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0c1320] shadow-[0_0_80px_rgba(92,200,255,0.12)]"
        initial={{ opacity: 0, scale: 0.98, y: -8 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-4">
          <Icon className="shrink-0 text-[#5c6889]" name="search" size={16} />
          <input
            autoComplete="off"
            className="w-full bg-transparent py-3.5 text-[14px] font-semibold text-[#e9eefb] outline-none placeholder:text-[#5c6889]"
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((previous) => (previous + 1) % Math.max(items.length, 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((previous) => (previous - 1 + items.length) % Math.max(items.length, 1));
              } else if (event.key === "Enter") {
                items[Math.min(active, items.length - 1)]?.run();
              } else if (event.key === "Escape") {
                onClose();
              } else if (event.key === "/" && query === "") {
                event.preventDefault();
              }
            }}
            placeholder="Rechercher un événement, une table, une action…"
            ref={inputRef}
            spellCheck={false}
            type="text"
            value={query}
          />
          <KBD>esc</KBD>
        </div>

        <div className="max-h-[46vh] overflow-y-auto p-2">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center font-mono text-[11px] font-bold text-[#5c6889]">Aucun résultat</p>
          ) : null}
          {items.map((item, index) => {
            const isActive = index === Math.min(active, items.length - 1);
            return (
              <button
                className={
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition " +
                  (isActive ? "bg-[#5cc8ff]/10" : "hover:bg-white/[0.03]")
                }
                key={item.id}
                onClick={() => {
                  item.run();
                  onClose();
                }}
                onMouseEnter={() => setActive(index)}
                ref={(node) => {
                  if (node) itemRefs.current.set(item.id, node);
                }}
                type="button"
              >
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-lg border"
                  style={{ borderColor: `${item.color}40`, backgroundColor: `${item.color}12`, color: item.color }}
                >
                  <Icon name={item.icon} size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-bold text-[#e9eefb]">{item.label}</span>
                  <span className="block truncate text-[10px] text-[#5c6889]">{item.hint}</span>
                </span>
                {isActive ? <span className="font-mono text-[9px] font-black text-[#5cc8ff]">↵</span> : null}
              </button>
            );
          })}
        </div>

        <footer className="flex items-center gap-3 border-t border-white/[0.08] px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#4a5675]">
          <span className="flex items-center gap-1"><KBD>↑</KBD><KBD>↓</KBD> naviguer</span>
          <span className="flex items-center gap-1"><KBD>↵</KBD> ouvrir</span>
          <span className="flex items-center gap-1"><KBD>Esc</KBD> fermer</span>
          {query ? (
            <span className="ml-auto font-mono text-[9px] font-bold normal-case tracking-normal text-[#5cc8ff]">
              {items.length} résultat{items.length > 1 ? "s" : ""}
            </span>
          ) : null}
        </footer>
      </motion.div>
    </motion.div>
  );
}