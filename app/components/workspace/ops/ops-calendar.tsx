"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { OpsPanel } from "@/app/components/workspace/ops/ops-panel";
import type { CalendarMission } from "@/app/lib/ops-data";

type OpsCalendarProps = {
  missions: CalendarMission[];
};

type ViewMode = "jour" | "semaine" | "mois";

const toneChip: Record<CalendarMission["tone"], string> = {
  ok: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  warning: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  critical: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

const weekdayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function monthGrid(now: Date): (number | null)[] {
  const firstWeekday = (new Date(now.getFullYear(), now.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function OpsCalendar({ missions }: OpsCalendarProps) {
  const [view, setView] = useState<ViewMode>("mois");
  const [items, setItems] = useState<CalendarMission[]>(() => missions);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [dragId, setDragId] = useState<string | null>(null);
  const [overDay, setOverDay] = useState<number | null>(null);

  const now = new Date();
  const today = now.getDate();
  const monthLabel = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(now).replace(/^\w/, (c) => c.toUpperCase());
  const grid = monthGrid(now);

  function handleDrop(day: number) {
    if (!dragId) return;
    setItems((prev) => prev.map((mission) => (mission.id === dragId ? { ...mission, day } : mission)));
    setDragId(null);
    setOverDay(null);
  }

  const dayMissions = items.filter((mission) => mission.day === selectedDay);

  return (
    <OpsPanel
      action={
        <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.04] p-1">
          {(Object.keys({ jour: "Jour", semaine: "Semaine", mois: "Mois" }) as ViewMode[]).map((key) => (
            <button
              aria-pressed={view === key}
              className={
                "relative rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors " +
                (view === key ? "text-white" : "text-slate-400 hover:text-slate-200")
              }
              key={key}
              onClick={() => setView(key)}
              type="button"
            >
              {view === key ? (
                <motion.span
                  className="absolute inset-0 rounded-lg bg-[#e3a641]"
                  layoutId="ops-calendar-segment"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              ) : null}
              <span className="relative z-10">{key === "jour" ? "Jour" : key === "semaine" ? "Semaine" : "Mois"}</span>
            </button>
          ))}
        </div>
      }
      icon="calendar"
      subtitle="Glissez-déposer les missions pour les replanifier"
      title="Planning des missions"
    >
      <div className="flex items-center justify-between px-1">
        <p className="text-[12px] font-extrabold text-white">{monthLabel}</p>
        <span className="rounded-lg border border-[#e3a641]/30 bg-[#e3a641]/10 px-2 py-0.5 text-[9px] font-bold text-[#f2c56d]">
          Aujourd&apos;hui : le {today}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {view === "mois" ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 8 }}
            key="mois"
            transition={{ duration: 0.25 }}
          >
            <div className="mt-3 grid grid-cols-7 gap-1.5 text-center">
              {weekdayLabels.map((label) => (
                <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500" key={label}>
                  {label}
                </span>
              ))}
              {grid.map((day, index) => {
                const dayItems = day !== null ? items.filter((mission) => mission.day === day) : [];
                const isToday = day === today;
                const isOver = day === overDay;
                return (
                  <div
                    aria-label={day !== null ? `Jour ${day} — ${dayItems.length} mission(s)` : undefined}
                    className={
                      "min-h-[74px] rounded-xl border p-1.5 text-left transition-colors " +
                      (day === null
                        ? "border-transparent"
                        : isToday
                          ? "border-[#e3a641]/40 bg-[#e3a641]/[0.08]"
                          : isOver
                            ? "border-sky-400/60 bg-sky-400/10"
                            : "border-white/[0.06] bg-white/[0.02]")
                    }
                    key={`${day}-${index}`}
                    onDragOver={(event) => {
                      if (day === null) return;
                      event.preventDefault();
                      setOverDay(day);
                    }}
                    onDragLeave={() => setOverDay(null)}
                    onDrop={(event) => {
                      if (day === null) return;
                      event.preventDefault();
                      handleDrop(day);
                    }}
                  >
                    <span className={"text-[10px] font-bold tabular-nums " + (isToday ? "text-[#f2c56d]" : "text-slate-400")}>
                      {day ?? "·"}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayItems.slice(0, 2).map((mission) => (
                        <span
                          className={
                            "block truncate rounded-md border px-1 py-0.5 text-[8px] font-bold cursor-grab active:cursor-grabbing " +
                            toneChip[mission.tone]
                          }
                          draggable
                          key={mission.id}
                          onDragEnd={() => {
                            setDragId(null);
                            setOverDay(null);
                          }}
                          onDragStart={() => setDragId(mission.id)}
                          title={mission.titre}
                        >
                          {mission.titre}
                        </span>
                      ))}
                      {dayItems.length > 2 ? (
                        <span className="block text-[8px] font-bold text-slate-500">+{dayItems.length - 2}</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : null}

        {view === "jour" ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 8 }}
            key="jour"
            transition={{ duration: 0.25 }}
          >
            <div className="mt-3 flex flex-wrap gap-1.5">
              {grid.filter((day) => day !== null).map((day) => (
                <button
                  className={
                    "grid size-9 place-items-center rounded-xl text-[11px] font-bold transition " +
                    (day === selectedDay
                      ? "bg-[#e3a641] text-[#14223b]"
                      : day === today
                        ? "border border-[#e3a641]/40 text-[#f2c56d]"
                        : "border border-white/[0.08] text-slate-300 hover:border-white/20")
                  }
                  key={day}
                  onClick={() => setSelectedDay(day as number)}
                  type="button"
                >
                  {day}
                </button>
              ))}
            </div>
            <ul className="mt-3 space-y-1.5">
              {dayMissions.length > 0 ? (
                dayMissions.map((mission) => (
                  <li className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2" key={mission.id}>
                    <span className={"size-2 shrink-0 rounded-full " + (mission.tone === "ok" ? "bg-emerald-400" : mission.tone === "warning" ? "bg-amber-400" : "bg-rose-500")} />
                    <span className="flex-1 truncate text-[11px] font-bold text-white">{mission.titre}</span>
                    <span className={"rounded-full border px-2 py-0.5 text-[8px] font-bold " + toneChip[mission.tone]}>{mission.statut}</span>
                  </li>
                ))
              ) : (
                <li className="grid place-items-center rounded-xl border border-dashed border-white/10 py-6 text-[10px] font-semibold text-slate-500">
                  Aucune mission planifiée ce jour.
                </li>
              )}
            </ul>
          </motion.div>
        ) : null}

        {view === "semaine" ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 8 }}
            key="semaine"
            transition={{ duration: 0.25 }}
          >
            <div className="mt-3 grid grid-cols-7 gap-1.5">
              {weekdayLabels.map((label, columnIndex) => {
                const columnDay = today + columnIndex - Math.min(today - 1, 3);
                const dayItems = items.filter((mission) => mission.day === columnDay);
                return (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-1.5" key={label}>
                    <p className="text-center text-[9px] font-bold uppercase text-slate-500">{label}</p>
                    <p className="text-center text-[9px] tabular-nums text-slate-400">{columnDay}</p>
                    <div className="mt-1.5 space-y-1">
                      {dayItems.map((mission) => (
                        <span className={"block truncate rounded-md border px-1 py-0.5 text-[8px] font-bold " + toneChip[mission.tone]} key={mission.id} title={mission.titre}>
                          {mission.titre}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <p className="mt-3 flex items-center gap-1.5 text-[9px] font-semibold text-slate-500">
        <Icon name="message" size={10} />
        Astuce : faites glisser une mission dans le mois pour la replanifier.
      </p>
    </OpsPanel>
  );
}
