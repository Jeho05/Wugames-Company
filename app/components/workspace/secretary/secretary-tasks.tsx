"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import { taskPriorityMeta } from "@/app/lib/secretary-data";
import type { SecretaryTask, TaskPriority } from "@/app/lib/secretary-data";

type SecretaryTasksProps = {
  tasks: SecretaryTask[];
};

const categoryMeta: Record<SecretaryTask["category"], { icon: "folder" | "check" | "calendar" | "bell"; tile: string }> = {
  dossier: { icon: "folder", tile: "bg-slate-100 text-slate-600" },
  validation: { icon: "check", tile: "bg-emerald-50 text-emerald-600" },
  rdv: { icon: "calendar", tile: "bg-sky-50 text-sky-600" },
  rappel: { icon: "bell", tile: "bg-amber-50 text-amber-600" },
};

const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

export function SecretaryTasks({ tasks }: SecretaryTasksProps) {
  const [done, setDone] = useState<Set<string>>(() => new Set());
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());

  const sorted = [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  const visible = sorted.filter((task) => !hidden.has(task.id));
  const remaining = sorted.length - done.size;

  function toggle(task: SecretaryTask) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(task.id)) {
        next.delete(task.id);
      } else {
        next.add(task.id);
        window.setTimeout(() => {
          setHidden((h) => {
            const hiddenNext = new Set(h);
            hiddenNext.add(task.id);
            return hiddenNext;
          });
        }, 800);
      }
      return next;
    });
  }

  return (
    <ExecutivePanel
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
          <Icon name="check" size={11} />
          {remaining} restante(s)
        </span>
      }
      icon="clipboard"
      subtitle="Dossiers, validations, rendez-vous et rappels"
      title="Tâches du jour"
    >
      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {visible.map((task) => {
            const meta = categoryMeta[task.category];
            const priority = taskPriorityMeta[task.priority];
            const completed = done.has(task.id);
            return (
              <motion.li
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, x: 40 }}
                initial={{ opacity: 0, y: 12 }}
                key={task.id}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  aria-pressed={completed}
                  className={
                    "group flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors duration-200 " +
                    (completed
                      ? "border-slate-100 bg-slate-50/70"
                      : "border-slate-100 bg-slate-50/60 hover:border-slate-200 hover:bg-white")
                  }
                  onClick={() => toggle(task)}
                  type="button"
                >
                  <span
                    className={
                      "mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border-2 transition-all duration-200 " +
                      (completed
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 bg-white text-transparent group-hover:border-[#e3a641]")
                    }
                  >
                    <motion.svg
                      animate={completed ? { scale: [0.6, 1.15, 1] } : { scale: 1 }}
                      className="size-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      transition={{ duration: 0.3 }}
                    >
                      <motion.path
                        animate={{ pathLength: completed ? 1 : 0 }}
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        transition={{ duration: 0.25 }}
                      />
                    </motion.svg>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={
                        "block text-[13px] font-bold transition-colors " +
                        (completed ? "text-slate-400 line-through" : "text-[#16233a]")
                      }
                    >
                      {task.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-slate-500">{task.detail}</span>
                    <span className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold " + priority.badge}>
                        <span className={"size-1.5 rounded-full " + priority.dot} />
                        {priority.label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                        <Icon name="clock" size={11} />
                        {task.time}
                      </span>
                      <span className={"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold " + meta.tile}>
                        <Icon name={meta.icon} size={10} />
                        {task.category === "dossier" ? "Dossier" : task.category === "validation" ? "Validation" : task.category === "rdv" ? "Rendez-vous" : "Rappel"}
                      </span>
                    </span>
                  </span>
                  <Icon
                    className={"mt-1 shrink-0 text-slate-300 transition group-hover:text-[#e3a641] " + (completed ? "rotate-45" : "")}
                    name="check"
                    size={15}
                  />
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      {visible.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 text-center">
          <span className="grid size-10 place-items-center rounded-xl bg-white text-emerald-600 shadow-sm">
            <Icon name="check" size={18} />
          </span>
          <p className="mt-3 text-sm font-bold text-emerald-800">Toutes les tâches sont terminées</p>
          <p className="mt-1 text-xs text-emerald-600">Belle journée, rien en attente.</p>
        </div>
      ) : null}
    </ExecutivePanel>
  );
}
