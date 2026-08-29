"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { SecretaryNotificationItem } from "@/app/lib/secretary-data";
import { resolveNotificationHref } from "@/app/lib/notification-target";
import { useAuth } from "@/app/lib/auth-context";

type SecretaryNotificationsProps = {
  items: SecretaryNotificationItem[];
};

const kindMeta: Record<SecretaryNotificationItem["kind"], { icon: "user-plus" | "truck" | "clipboard" | "check"; tile: string }> = {
  client: { icon: "user-plus", tile: "bg-sky-50 text-sky-600" },
  fournisseur: { icon: "truck", tile: "bg-violet-50 text-violet-600" },
  demande: { icon: "clipboard", tile: "bg-amber-50 text-amber-600" },
  validation: { icon: "check", tile: "bg-emerald-50 text-emerald-600" },
};

export function SecretaryNotifications({ items }: SecretaryNotificationsProps) {
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const router = useRouter();
  const { user } = useAuth();

  function markRead(id: string, kind?: string, title?: string) {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    // Navigation vers la page d'origine
    try {
      const href = resolveNotificationHref({ id, type: kind ?? "", message: title ?? "" } as unknown as import("@/app/lib/contracts").Notification, user?.role ?? null);
      if (href && href !== "/espace/notifications") router.push(href);
    } catch {
      /* ignore */
    }
  }

  const unreadCount = items.filter((item) => item.unread && !readIds.has(item.id)).length;

  return (
    <ExecutivePanel
      action={
        <span className={"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold " + (unreadCount > 0 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500")}>
          {unreadCount > 0 ? (
            <>
              <span className="size-1.5 animate-pulse rounded-full bg-amber-500" />
              {unreadCount} non lue(s)
            </>
          ) : (
            "Tout est lu"
          )}
        </span>
      }
      icon="bell"
      subtitle="Alertes et demandes à traiter"
      title="Notifications"
    >
      <ul className="space-y-1">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const meta = kindMeta[item.kind];
            const read = !item.unread || readIds.has(item.id);
            return (
              <motion.li
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                initial={{ opacity: 0 }}
                key={item.id}
              >
                <button
                  className={
                    "flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition " +
                    (read ? "border-slate-100 bg-slate-50/40" : "border-amber-100/80 bg-amber-50/50 hover:bg-amber-50/80")
                  }
                  onClick={() => markRead(item.id, item.kind, item.title)}
                  type="button"
                >
                  <span className={"grid size-8 shrink-0 place-items-center rounded-xl " + meta.tile}>
                    <Icon name={meta.icon} size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className={"truncate text-[12px] font-bold " + (read ? "text-slate-500" : "text-[#16233a]")}>
                        {item.title}
                      </span>
                      {!read ? <span className="size-1.5 shrink-0 rounded-full bg-[#e3a641]" /> : null}
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] leading-4 text-slate-500">{item.detail}</span>
                    <span className="mt-1 block text-[9px] font-semibold text-slate-400">{item.time}</span>
                  </span>
                  {read ? (
                    <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-400">
                      Lu
                    </span>
                  ) : null}
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </ExecutivePanel>
  );
}
