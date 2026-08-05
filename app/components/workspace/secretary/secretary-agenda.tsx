"use client";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import { agendaEventMeta } from "@/app/lib/secretary-data";
import type { AgendaEvent } from "@/app/lib/secretary-data";

type SecretaryAgendaProps = {
  events: AgendaEvent[];
};

function buildMonthGrid(now: Date): (number | null)[] {
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const weekdayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function SecretaryAgenda({ events }: SecretaryAgendaProps) {
  const now = new Date();
  const today = now.getDate();
  const monthLabel = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(now).replace(/^\w/, (c) => c.toUpperCase());
  const grid = buildMonthGrid(now);
  const upcoming = [...events].sort((a, b) => a.day - b.day).slice(0, 5);
  const upcomingCount = events.length;

  return (
    <ExecutivePanel
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700">
          <Icon name="calendar" size={11} />
          {upcomingCount} événement(s)
        </span>
      }
      icon="calendar"
      subtitle="Mini-calendrier du mois en cours"
      title="Agenda"
    >
      <div className="flex items-center justify-between px-1">
        <p className="text-[11px] font-extrabold text-[#17294b]">{monthLabel}</p>
        <span className="rounded-lg border border-[#e3a641]/30 bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-[#b98327]">
          Aujourd&apos;hui : le {today}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {weekdayLabels.map((label) => (
          <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400" key={label}>
            {label}
          </span>
        ))}
        {grid.map((day, index) => {
          const hasEvent = day !== null && events.some((event) => event.day === day);
          const isToday = day === today;
          return (
            <span
              className={
                "grid h-8 place-items-center rounded-lg text-[10px] font-semibold transition " +
                (day === null
                  ? "text-transparent"
                  : isToday
                    ? "bg-[#17294b] text-white shadow-md shadow-[#17294b]/20"
                    : hasEvent
                      ? "border border-[#e3a641]/50 bg-amber-50 text-[#b98327]"
                      : "text-slate-600 hover:bg-slate-100")
              }
              key={`${day}-${index}`}
            >
              {day ?? "·"}
            </span>
          );
        })}
      </div>
      <ul className="mt-4 space-y-1.5">
        {upcoming.map((event) => {
          const meta = agendaEventMeta[event.type];
          return (
            <li
              className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2"
              key={event.id}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-[10px] font-extrabold text-[#17294b] shadow-sm">
                {event.day}
              </span>
              <span className={"h-8 w-1 shrink-0 rounded-full " + meta.dot} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-bold text-[#16233a]">{event.label}</span>
                <span className="block text-[9px] font-semibold text-slate-400">
                  {event.time ?? meta.label} · ce mois-ci
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </ExecutivePanel>
  );
}
