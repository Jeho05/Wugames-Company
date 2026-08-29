"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { BranchNotification } from "@/app/lib/branch-data";
import { resolveNotificationHref } from "@/app/lib/notification-target";
import { useAuth } from "@/app/lib/auth-context";

type BranchNotificationsProps = {
  notifications: BranchNotification[];
  unread: number;
  onMarkRead: (id: string) => void;
};

const typeMeta: Record<string, { label: string; badge: string }> = {
  stock_critique: { label: "Stock critique", badge: "border-rose-200 bg-rose-50 text-rose-700" },
  mission_retard: { label: "Mission retardée", badge: "border-orange-200 bg-orange-50 text-orange-700" },
  reception: { label: "Réception", badge: "border-sky-200 bg-sky-50 text-sky-700" },
  anomalie: { label: "Anomalie", badge: "border-amber-200 bg-amber-50 text-amber-700" },
  facture: { label: "Facture", badge: "border-violet-200 bg-violet-50 text-violet-700" },
  evaluation: { label: "Évaluation", badge: "border-teal-200 bg-teal-50 text-teal-700" },
  information: { label: "Information", badge: "border-slate-200 bg-slate-100 text-slate-600" },
};

export function BranchNotifications({ notifications, unread, onMarkRead }: BranchNotificationsProps) {
  const [filter, setFilter] = useState<"toutes" | "non_lues">("toutes");
  const filtered = filter === "toutes" ? notifications : notifications.filter((notification) => !notification.lu);
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ExecutivePanel
      action={
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
          {unread} non lue{unread > 1 ? "s" : ""}
        </span>
      }
      icon="bell"
      subtitle="Triées par date décroissante"
      title="Notifications"
    >
      <div className="mb-4 flex gap-1 rounded-xl border border-slate-100 bg-slate-50 p-1" role="group" aria-label="Filtrer les notifications">
        {(["toutes", "non_lues"] as const).map((value) => (
          <button
            aria-pressed={filter === value}
            className={
              "rounded-lg px-3 py-1 text-[10px] font-bold transition " +
              (filter === value ? "bg-[#10304f] text-white shadow-sm" : "text-slate-500 hover:bg-white hover:text-slate-700")
            }
            key={value}
            onClick={() => setFilter(value)}
            type="button"
          >
            {value === "toutes" ? "Toutes" : "Non lues"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
          <span className="grid size-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Icon name="check" size={18} />
          </span>
          <p className="mt-3 text-[12px] font-bold text-[#16233a]">Aucune notification non lue</p>
          <p className="mt-1 text-[11px] text-slate-500">Vous êtes à jour sur votre filiale.</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((notification, index) => {
            const meta = typeMeta[notification.type] ?? typeMeta.information;
            return (
              <motion.li
                animate={{ opacity: 1, x: 0 }}
                className={"group rounded-2xl border p-3.5 transition " + (notification.lu ? "border-slate-100 bg-slate-50/40" : "cursor-pointer border-[#0e9f9b]/25 bg-teal-50/50 hover:bg-teal-50/80")}
                initial={{ opacity: 0, x: -14 }}
                key={notification.id}
                transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => {
                  const href = resolveNotificationHref({ id: notification.id, type: notification.type, message: notification.message } as unknown as import("@/app/lib/contracts").Notification, user?.role ?? null);
                  if (href) router.push(href);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const href = resolveNotificationHref({ id: notification.id, type: notification.type, message: notification.message } as unknown as import("@/app/lib/contracts").Notification, user?.role ?? null);
                    if (href) router.push(href);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  {!notification.lu ? <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#0e9f9b]" aria-label="Non lue" /> : <span className="mt-1.5 size-2 shrink-0 rounded-full bg-slate-200" aria-hidden="true" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold leading-5 text-[#16233a] group-hover:underline">{notification.message}</p>
                    <p className="mt-1 text-[10px] font-semibold text-slate-400">{notification.createdAt}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className={"inline-flex rounded-full border px-2 py-0.5 text-[8px] font-bold " + meta.badge}>
                      {meta.label}
                    </span>
                    {!notification.lu ? (
                      <button
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[9px] font-bold text-slate-600 transition hover:border-[#0e9f9b]/50 hover:text-[#0e9f9b]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkRead(notification.id);
                        }}
                        type="button"
                      >
                        <Icon name="check" size={10} />
                        Marquer comme lue
                      </button>
                    ) : null}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </ExecutivePanel>
  );
}
