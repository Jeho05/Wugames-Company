"use client";

import { useEffect, useRef, useState } from "react";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { actionMeta, C } from "@/app/components/workspace/dev-digital/theme";
import { Avatar, KBD } from "@/app/components/workspace/dev-digital/ui/primitives";
import { JsonViewer } from "@/app/components/workspace/dev-digital/audit/json-viewer";
import {
  fullTimestamp,
  humanTableLabel,
  initialsOfName,
  shortId,
  type AuditLog,
} from "@/app/lib/dev-digital-data";

function MetaCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#5c6889]">{label}</p>
      <p className={"mt-1 truncate text-[11px] font-bold text-[#c3cbdf] " + (mono ? "font-mono" : "")}>{value}</p>
    </div>
  );
}

export function AuditDetail({
  log,
  onClose,
  onNavigate,
}: {
  log: AuditLog;
  onClose: () => void;
  onNavigate?: (direction: -1 | 1) => void;
}) {
  const meta = actionMeta(log.action);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [tab, setTab] = useState<"apres" | "avant">("apres");

  useEffect(() => {
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (onNavigate && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault();
        onNavigate(event.key === "ArrowLeft" ? -1 : 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, onNavigate]);

  const actorName = log.user ? `${log.user.first_name} ${log.user.last_name}`.trim() : "Acteur inconnu";

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#05070f]/70 p-4 backdrop-blur"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      onClick={onClose}
      transition={{ duration: 0.2 }}
    >
      <motion.section
        animate={{ opacity: 1, scale: 1, y: 0 }}
        aria-modal="true"
        className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-white/[0.12] bg-[#0c1320] shadow-[0_0_80px_rgba(92,200,255,0.12)]"
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[rgba(245,142,168,0.1)] text-[#f58ea8]">
              <Icon name="shield" size={16} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-black tracking-[0.24em] text-[#f58ea8]">IMMUTABLE RECORD</p>
              <p className="mt-0.5 truncate text-[12px] font-bold text-[#c3cbdf]">
                {log.table_cible} · {humanTableLabel(log.table_cible)}
              </p>
            </div>
          </div>
          <button
            aria-label="Fermer le détail"
            className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.08] text-[#8b96b3] transition hover:border-white/[0.2] hover:text-[#e9eefb]"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <Icon name="close" size={14} />
          </button>
        </header>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] font-black tracking-wider"
              style={{ borderColor: `${meta.color}40`, backgroundColor: meta.soft, color: meta.color }}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
              {log.action}
            </span>
            <button
              className="inline-flex items-center gap-1.5 rounded-full border border-[#5cc8ff]/30 bg-[#5cc8ff]/10 px-3 py-1 font-mono text-[10px] font-bold text-[#7dd3fc] transition hover:bg-[#5cc8ff]/20"
              onClick={() => navigator.clipboard?.writeText(log.entite_id)}
              title="Copier l'identifiant d'entité"
              type="button"
            >
              <Icon name="copy" size={10} />
              {shortId(log.entite_id)}
            </button>
            <span className="ml-auto flex items-center gap-2 font-mono text-[10px] font-bold tabular-nums text-[#5c6889]">
              <Icon name="clock" size={12} />
              {fullTimestamp(log.created_at)}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <MetaCell label="Entité" mono value={shortId(log.entite_id, 8, 6)} />
            <MetaCell label="Adresse IP" mono value={log.ip ?? "non enregistrée"} />
            <MetaCell label="ID utilisateur" mono value={shortId(log.user_id ?? "—", 8, 6)} />
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
            <Avatar initials={initialsOfName(actorName)} size={30} />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold text-[#e9eefb]">{actorName}</p>
              <p className="truncate text-[10px] text-[#5c6889]">
                {log.user?.email ?? "Adresse inconnue"} · <span className="font-mono">{log.ip ?? "ip non enregistrée"}</span>
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-1.5 rounded-xl border border-white/[0.06] bg-black/20 p-1">
            {(["apres", "avant"] as const).map((id) => (
              <button
                className={
                  "flex-1 rounded-lg px-3 py-1.5 text-center font-mono text-[9px] font-black tracking-[0.14em] transition " +
                  (tab === id ? "bg-[#5cc8ff]/15 text-[#7dd3fc]" : "text-[#5c6889] hover:text-[#c3cbdf]")
                }
                key={id}
                onClick={() => setTab(id)}
                type="button"
              >
                {id === "apres" ? "VALEUR APRÈS" : "VALEUR AVANT"}
              </button>
            ))}
          </div>

          <div className="mt-2 overflow-hidden rounded-xl border border-white/[0.07] bg-[#0a0f1e]">
            <JsonViewer
              key={tab}
              pathLabel={tab === "apres" ? "valeur_apres" : "valeur_avant"}
              title={tab === "apres" ? "VALEUR APRÈS — capture de l'enregistrement" : "VALEUR AVANT — état précédent"}
              value={tab === "apres" ? log.valeur_apres : log.valeur_avant}
            />
          </div>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-white/[0.08] px-5 py-3">
          <p className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#6b7994]">
            <Icon name="lock" size={10} style={{ color: C.rose }} />
            Enregistrement immuable — lecture seule
          </p>
          <p className="flex items-center gap-2 text-[9px] text-[#5c6889]">
            Source : <span className="font-mono text-[#8b96b3]">/audit-logs</span>
            <KBD>Esc</KBD>
            {onNavigate ? (
              <span className="flex items-center gap-1">
                <KBD>←</KBD>
                <KBD>→</KBD>
              </span>
            ) : null}
          </p>
        </footer>
      </motion.section>
    </motion.div>
  );
}