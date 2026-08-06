"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { Notification } from "@/app/lib/contracts";
import type { WorkerRanking } from "@/app/lib/worker-data";
import { relativeTime } from "@/app/lib/worker-data";
import { WorkerRankingCard } from "@/app/components/workspace/worker/worker-ranking";

type WorkerActivityScreenProps = {
  notifications: Notification[];
  unread: number;
  ranking: WorkerRanking | null;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
};

const typeIcon: Record<string, "bell" | "check" | "clock" | "hardhat" | "message"> = {
  nouvelle_mission: "hardhat",
  rappel_mission: "clock",
  rapport_valide: "check",
  pointage_verification: "bell",
  message: "message",
};

function typeLabel(type: string | null | undefined): string {
  switch (type) {
    case "nouvelle_mission":
      return "Nouvelle mission";
    case "rappel_mission":
      return "Rappel";
    case "rapport_valide":
      return "Rapport validé";
    case "pointage_verification":
      return "Pointage à vérifier";
    case "message":
      return "Message";
    default:
      return "Notification";
  }
}

export function WorkerActivityScreen({ notifications, unread, ranking, onMarkRead, onMarkAllRead }: WorkerActivityScreenProps) {
  return (
    <div className="space-y-5">
      {ranking ? <WorkerRankingCard ranking={ranking} /> : null}

      <section aria-label="Notifications">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Notifications</h2>
          {unread > 0 ? (
            <button className="text-[11px] font-bold text-[#0f7a5f]" onClick={onMarkAllRead} type="button">
              Tout marquer comme lu
            </button>
          ) : null}
        </div>

        {notifications.length === 0 ? (
          <div className="grid place-items-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center">
            <Icon className="text-slate-300" name="bell" size={24} />
            <p className="text-[13px] font-bold text-slate-500">Aucune notification</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {notifications.map((notification) => {
              const unreadItem = !notification.lu;
              return (
                <li key={notification.id}>
                  <button
                    className={
                      "flex w-full items-start gap-3 rounded-3xl border p-4 text-left transition active:scale-[0.99] " +
                      (unreadItem ? "border-[#0f7a5f]/20 bg-[#0f7a5f]/[0.04]" : "border-slate-200/70 bg-white")
                    }
                    onClick={() => {
                      if (unreadItem) onMarkRead(notification.id);
                    }}
                    type="button"
                  >
                    <span
                      className={
                        "grid size-10 shrink-0 place-items-center rounded-2xl " +
                        (unreadItem ? "bg-[#0f7a5f] text-white" : "bg-slate-100 text-slate-400")
                      }
                    >
                      <Icon name={typeIcon[notification.type ?? ""] ?? "bell"} size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
                          {typeLabel(notification.type)}
                        </span>
                        {unreadItem ? <span className="size-1.5 rounded-full bg-[#0f7a5f]" /> : null}
                        <span className="ml-auto shrink-0 text-[9px] font-semibold text-slate-400">
                          {notification.created_at ? relativeTime(notification.created_at) : "—"}
                        </span>
                      </span>
                      <span className="mt-1 block text-[12px] leading-5 text-slate-600">{notification.message}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <motion.div
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-3 rounded-3xl border border-slate-200/70 bg-white p-4"
        initial={{ y: 12, opacity: 0 }}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-600">
          <Icon name="sparkles" size={18} />
        </span>
        <p className="text-[11px] leading-5 text-slate-500">
          <b className="text-[#16233a]">Conseil :</b> pointez votre arrivée dès que vous êtes sur le chantier, puis ajoutez
          vos photos pendant le travail pour ne rien oublier dans le rapport.
        </p>
      </motion.div>
    </div>
  );
}
