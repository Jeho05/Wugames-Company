"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { Panel } from "@/app/components/workspace/resp-ouvriers/ui/primitives";
import type { Notification } from "@/app/lib/contracts";

const KIND_META = {
  gps: { icon: "map" as const, hex: "#5cc8ff" },
  rapport: { icon: "clipboard" as const, hex: "#f5b84d" },
  ouvrier: { icon: "users" as const, hex: "#a78bfa" },
  systeme: { icon: "sparkles" as const, hex: "#3ddc97" },
  alerte: { icon: "warning" as const, hex: "#ff8ba0" },
};
type BadgeKey = keyof typeof KIND_META;

function kindOf(notification: Notification): BadgeKey {
  const text = `${String(notification.titre ?? "")} ${String(notification.message ?? "")}`.toLowerCase();
  if (text.includes("hors")) return "gps";
  if (text.includes("rapport") || text.includes("valid")) return "rapport";
  if (notification.type === "generale") return "systeme";
  return "ouvrier";
}

export function NotificationsPanel({
  notifications,
  unread,
  onMarkAll,
}: {
  notifications: Notification[];
  unread: number;
  onMarkAll?: () => void;
}) {
  return (
    <Panel className="h-full">
      <div className="flex items-end justify-between gap-4 border-b border-[rgba(148,163,207,0.1)] px-6 pb-4 pt-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e3a641]/90">09 · Notifications</p>
          <h2 className="mt-1 text-[17px] font-bold tracking-[-0.03em] text-[#e8eefb]">Flux d&apos;alertes</h2>
        </div>
        <button className="text-[11px] font-bold text-[#e3a641] transition hover:text-amber-300" onClick={onMarkAll} type="button">
          Tout marquer lu ({unread})
        </button>
      </div>

      <div className="scrollbar-thin max-h-[420px] overflow-y-auto p-4">
        {notifications.length === 0 ? (
          <p className="py-10 text-center text-[12px] text-[#5c6889]">Aucune notification.</p>
        ) : (
          <ul className="space-y-1">
            {notifications.map((notification, index) => {
              const meta = KIND_META[kindOf(notification)];
              const isUnread = !notification.lu;
              return (
                <motion.li
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 8 }}
                  key={notification.id}
                  transition={{ delay: index * 0.04, duration: 0.3 }}
                >
                  <button
                    className={
                      "flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-white/[0.04] " +
                      (isUnread ? "bg-white/[0.03]" : "")
                    }
                    type="button"
                  >
                    <span
                      className="grid size-8 shrink-0 place-items-center rounded-lg border"
                      style={{ borderColor: `${meta.hex}30`, backgroundColor: `${meta.hex}14`, color: meta.hex }}
                    >
                      <Icon name={meta.icon} size={13} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[12px] font-bold text-[#e8eefb]">{String(notification.titre ?? "Notification")}</span>
                        {isUnread ? <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-[#e3a641]" /> : null}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-4 text-[#8b96b3]">{String(notification.message ?? "")}</span>
                      <span className="mt-1.5 block font-mono text-[9px] font-bold text-[#5c6889]">
                        {notification.created_at ? new Date(notification.created_at).toLocaleString("fr-FR") : "—"}
                      </span>
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </Panel>
  );
}