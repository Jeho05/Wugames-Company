"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { IconName } from "@/app/components/ui/app-icon";
import { KBD } from "@/app/components/workspace/resp-ouvriers/ui/primitives";
import type { AttentionItem, FieldMission, FieldWorker } from "@/app/lib/resp-ouvriers-data";

export type PaletteAction = {
  id: string;
  label: string;
  sub: string;
  icon: IconName;
  hex: string;
  run: () => void;
};

export function CommandPalette({
  open,
  onClose,
  onOpenMission,
  onNavigate,
  missions,
  workers,
  attention,
}: {
  open: boolean;
  onClose: () => void;
  onOpenMission: (mission: FieldMission) => void;
  onNavigate: (section: string) => void;
  missions: FieldMission[];
  workers: FieldWorker[];
  attention: AttentionItem[];
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const actions = useMemo<PaletteAction[]>(() => {
    const list: PaletteAction[] = [
      ...missions.map((mission) => ({
        id: `mission-${mission.id}`,
        label: mission.titre,
        sub: `${mission.numero} · ${mission.workerNom}`,
        icon: "hardhat" as const,
        hex: "#5cc8ff",
        run: () => onOpenMission(mission),
      })),
      ...workers.map((worker) => ({
        id: `worker-${worker.id}`,
        label: worker.nom,
        sub: `${worker.specialite} · ${worker.matricule}`,
        icon: "user" as const,
        hex: "#a78bfa",
        run: () => onNavigate("equipe"),
      })),
      ...attention.map((item) => ({
        id: `attention-${item.id}`,
        label: item.missionTitle,
        sub: `${item.kindLabel} · ${item.detail}`,
        icon: "warning" as const,
        hex: item.level === "critical" ? "#ff8ba0" : "#f5b84d",
        run: () => (item.missionId ? onOpenMission(missions.find((mission) => mission.id === item.missionId) as FieldMission) : onNavigate("attention")),
      })),
    ];
    return list;
  }, [missions, workers, attention, onOpenMission, onNavigate]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions.slice(0, 7);
    return actions
      .filter((action) => (action.label + " " + action.sub).toLowerCase().includes(q))
      .slice(0, 7);
  }, [actions, query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
      }
      if (event.key === "Enter" && filtered[activeIndex]) {
        filtered[activeIndex].run();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, activeIndex, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[90] bg-[#04080f]/70 p-4 backdrop-blur-sm sm:pt-[14vh]"
          initial={{ opacity: 0 }}
          onClick={onClose}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0c1530] shadow-2xl shadow-black/60"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            onClick={(event) => event.stopPropagation()}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-center gap-3 border-b border-white/[0.08] px-4">
              <Icon className="text-[#5c6889]" name="search" size={16} />
              <input
                aria-label="Rechercher"
                className="w-full bg-transparent py-4 text-[14px] font-semibold text-[#e8eefb] placeholder-[#5c6889] focus:outline-none"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Mission, ouvrier, alerte…"
                ref={inputRef}
                value={query}
              />
              <KBD>Esc</KBD>
            </div>

            <ul className="scrollbar-thin max-h-[320px] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <li className="px-3 py-6 text-center text-[12px] text-[#5c6889]">Aucun résultat pour « {query} »</li>
              ) : (
                filtered.map((action, index) => (
                  <motion.li animate={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: -6 }} key={action.id} transition={{ delay: index * 0.02 }}>
                    <button
                      className={
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition " +
                        (index === activeIndex ? "bg-white/[0.08]" : "hover:bg-white/[0.04]")
                      }
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => {
                        action.run();
                        onClose();
                      }}
                      type="button"
                    >
                      <span
                        className="grid size-8 shrink-0 place-items-center rounded-lg border"
                        style={{ borderColor: `${action.hex}35`, backgroundColor: `${action.hex}14`, color: action.hex }}
                      >
                        <Icon name={action.icon} size={14} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-bold text-[#e8eefb]">{action.label}</span>
                        <span className="block truncate text-[10px] text-[#8b96b3]">{action.sub}</span>
                      </span>
                      {index === activeIndex ? <Icon className="shrink-0 text-[#e3a641]" name="arrow-right" size={13} /> : null}
                    </button>
                  </motion.li>
                ))
              )}
            </ul>

            <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-2.5 text-[10px] font-bold text-[#5c6889]">
              <span className="flex items-center gap-3">
                <span><KBD>↑</KBD> <KBD>↓</KBD> naviguer</span>
                <span><KBD>↵</KBD> ouvrir</span>
              </span>
              <span>{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}