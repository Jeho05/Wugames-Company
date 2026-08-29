"use client";

import { useMemo, useState } from "react";

import { Icon, type IconName } from "@/app/components/ui/app-icon";
import type { Notification } from "@/app/lib/contracts";
import { relativeTime } from "@/app/lib/supplier-data";
import { resolveNotificationHref } from "@/app/lib/notification-target";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth-context";

type SupplierNotificationsProps = {
  notifications: Notification[];
  onMarkRead: (notificationId: string) => void;
  onMarkAllRead: () => void;
  onOpenProduct: (productId: string) => void;
};

type CategoryKey = "toutes" | "produit" | "stock" | "securite" | "info";

const categories: { key: CategoryKey; label: string; icon: IconName }[] = [
  { key: "toutes", label: "Toutes", icon: "bell" },
  { key: "produit", label: "Produits", icon: "package" },
  { key: "stock", label: "Stocks", icon: "box" },
  { key: "securite", label: "Sécurité", icon: "shield" },
  { key: "info", label: "Infos", icon: "info" },
];

const levelMeta = {
  haut: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300",
  moyen: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300",
  info: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300",
} as const;

const categoryIcon: Record<string, IconName> = {
  produit: "package",
  stock: "box",
  securite: "shield",
  info: "info",
};

export function SupplierNotifications({ notifications, onMarkRead, onMarkAllRead, onOpenProduct }: SupplierNotificationsProps) {
  const [category, setCategory] = useState<CategoryKey>("toutes");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of notifications) {
      const type = item.type ?? "info";
      map.set(type, (map.get(type) ?? 0) + 1);
    }
    return map;
  }, [notifications]);

  const visible = useMemo(() => {
    return [...notifications]
      .filter((item) => {
        const type = item.type ?? "info";
        if (category !== "toutes" && type !== category) return false;
        if (unreadOnly && item.lu) return false;
        return true;
      })
      .sort((a, b) => new Date(a.created_at ?? "").getTime() - new Date(b.created_at ?? "").getTime());
  }, [category, notifications, unreadOnly]);

  const unreadCount = notifications.filter((item) => !item.lu).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((item) => {
            const count = item.key === "toutes" ? notifications.length : counts.get(item.key) ?? 0;
            return (
              <button
                aria-pressed={category === item.key}
                className={
                  "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-[11px] font-bold transition " +
                  (category === item.key
                    ? "bg-[#1e40af] text-white"
                    : "border border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300")
                }
                key={item.key}
                onClick={() => setCategory(item.key)}
                type="button"
              >
                <Icon name={item.icon} size={12} />
                {item.label}
                <span className={"rounded-full px-1.5 text-[9px] " + (category === item.key ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            aria-pressed={unreadOnly}
            className={
              "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-[11px] font-bold transition " +
              (unreadOnly
                ? "bg-[#1e40af] text-white"
                : "border border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300")
            }
            onClick={() => setUnreadOnly((value) => !value)}
            type="button"
          >
            <Icon name="mail" size={12} />
            Non lues ({unreadCount})
          </button>
          <button
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 text-[11px] font-bold text-slate-500 transition hover:text-[#1e40af] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-sky-400"
            disabled={unreadCount === 0}
            onClick={onMarkAllRead}
            type="button"
          >
            <Icon name="check" size={12} />
            Tout marquer comme lu
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <span className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <Icon name="bell" size={22} />
          </span>
          <p className="text-[13px] font-bold text-slate-600 dark:text-slate-300">
            {unreadOnly ? "Aucune notification non lue." : "Aucune notification dans cette catégorie."}
          </p>
        </div>
      ) : (
        <ol className="space-y-2">
          {visible.map((item) => {
            const type = item.type ?? "info";
            const niveau = item.niveau as keyof typeof levelMeta | undefined;
            const produitId = typeof item.produit_id === "string" ? item.produit_id : null;
            const message = item.message ?? "";
            const created_at = item.created_at ?? "";
            const icon = categoryIcon[type] ?? "info";
            return (
              <li
                className={
                  "group flex cursor-pointer items-start gap-3 rounded-2xl border bg-white px-4 py-3.5 shadow-sm transition " +
                  (item.lu
                    ? "border-slate-200/70 dark:border-slate-800 dark:bg-slate-900"
                    : "border-[#1e40af]/25 bg-[#1e40af]/[0.04] hover:bg-[#1e40af]/[0.08] dark:border-sky-500/25 dark:bg-sky-500/[0.06]")
                }
                key={item.id}
                onClick={() => {
                  const href = resolveNotificationHref(item, user?.role ?? null);
                  if (href) router.push(href);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const href = resolveNotificationHref(item, user?.role ?? null);
                    if (href) router.push(href);
                  }
                }}
              >
                <span className={"mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ring-1 " + levelMeta[niveau ?? "info"]}>
                  <Icon name={icon} size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!item.lu ? <span className="size-2 shrink-0 rounded-full bg-[#1e40af] dark:bg-sky-400" /> : null}
                    <p className="text-[11px] font-bold text-slate-400">{relativeTime(created_at)}</p>
                    {niveau === "haut" ? (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                        Urgent
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[12px] font-bold leading-5 text-[#17294b] dark:text-slate-100">{message}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {produitId ? (
                      <button
                        className="inline-flex min-h-7 items-center gap-1 text-[10px] font-extrabold text-[#1e40af] transition hover:underline dark:text-sky-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProduct(produitId);
                        }}
                        type="button"
                      >
                        <Icon name="eye" size={11} />
                        Voir le produit
                      </button>
                    ) : null}
                    {!item.lu ? (
                      <button
                        className="inline-flex min-h-7 items-center gap-1 text-[10px] font-extrabold text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkRead(item.id);
                        }}
                        type="button"
                      >
                        <Icon name="check" size={11} />
                        Marquer comme lu
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
