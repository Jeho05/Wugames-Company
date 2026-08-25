"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { IconName } from "@/app/components/ui/app-icon";
import type { ClientStdNotificationKind, ClientStdNotificationView } from "@/app/lib/client-std-data";
import { markAsRead } from "@/app/lib/api/notifications";
import { ClientSection } from "@/app/components/workspace/client/client-section";

const kindMeta: Record<ClientStdNotificationKind, { icon: IconName; tone: string }> = {
  mission: { icon: "hardhat", tone: "bg-sky-500/[0.12] text-sky-600" },
  commande: { icon: "shopping-bag", tone: "bg-violet-500/[0.12] text-violet-600" },
  devis: { icon: "sparkles", tone: "bg-[#e3a641]/[0.14] text-[#b47e1e]" },
  info: { icon: "info", tone: "bg-sky-500/[0.12] text-sky-600" },
};

type ClientStdNotificationsProps = {
  notifications: ClientStdNotificationView[];
  live?: boolean;
};

export function ClientStdNotifications({ notifications, live = false }: ClientStdNotificationsProps) {
  const [items, setItems] = useState(notifications);
  const reduce = useReducedMotion();
  const nonLues = items.filter((n) => !n.lu).length;

  function markRead(id: string) {
    setItems((current) => current.map((n) => (n.id === id ? { ...n, lu: true } : n)));
    if (!live) return;
    markAsRead(id).catch(() => {
      /* API injoignable : l'état local reste cohérent. */
    });
  }

  function markAllRead() {
    setItems((current) => current.map((n) => ({ ...n, lu: true })));
    if (!live) return;
    for (const notification of items) {
      if (!notification.lu) {
        markAsRead(notification.id).catch(() => {
          /* API injoignable : l'état local reste cohérent. */
        });
      }
    }
  }

  return (
    <ClientSection
      action={
        nonLues > 0 ? (
          <button
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-[#17294b] transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
            onClick={markAllRead}
            type="button"
          >
            <Icon name="check" size={13} />
            Tout marquer comme lu
          </button>
        ) : (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
            Tout est lu
          </span>
        )
      }
      icon="bell"
      id="std-notifications"
      subtitle="Les événements récents liés à vos prestations"
      title="Notifications"
    >
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-950/[0.03] sm:p-6 dark:border-white/10 dark:bg-[#101c36]">
        <ol className="relative space-y-1">
          {items.map((notification, index) => {
            const meta = kindMeta[notification.kind];
            const isLast = index === items.length - 1;
            return (
              <li key={notification.id}>
                <button
                  className={
                    "group flex w-full items-start gap-4 rounded-2xl p-3.5 text-left transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:bg-white/[0.03] " +
                    (notification.lu ? "" : "bg-[#f7f9fc] dark:bg-white/[0.04]")
                  }
                  onClick={() => markRead(notification.id)}
                  type="button"
                >
                  <div className="relative flex flex-col items-center self-stretch">
                    <span className={"grid size-10 shrink-0 place-items-center rounded-2xl " + meta.tone}>
                      <Icon name={meta.icon} size={17} />
                    </span>
                    {!isLast ? <span className="mt-2 w-px flex-1 bg-slate-100 dark:bg-white/[0.06]" /> : null}
                  </div>
                  <div className="min-w-0 flex-1 pb-1">
                    <div className="flex items-center justify-between gap-3">
                      <p
                        className={
                          "truncate text-[13px] font-bold " +
                          (notification.lu
                            ? "text-slate-600 dark:text-slate-300"
                            : "text-[#16233a] dark:text-white")
                        }
                      >
                        {notification.titre}
                      </p>
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        {notification.time}
                      </span>
                    </div>
                    <p className="mt-1.5 truncate text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {notification.detail}
                    </p>
                  </div>
                  {!notification.lu ? (
                    <motion.span
                      aria-label="Non lu"
                      className="mt-2 size-2 shrink-0 rounded-full bg-[#e3a641]"
                      initial={reduce ? undefined : { scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 border-t border-slate-100 pt-4 text-[11px] font-medium text-slate-400 dark:border-white/5">
          Cliquez sur une notification pour la marquer comme lue.
        </p>
      </div>
    </ClientSection>
  );
}
