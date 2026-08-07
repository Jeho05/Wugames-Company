"use client";

import { useMemo, useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { BreathingDot, Panel, SectionHeader } from "@/app/components/workspace/dev-digital/ui/primitives";
import { C } from "@/app/components/workspace/dev-digital/theme";
import type { Notification } from "@/app/lib/dev-digital-data";

export function NotificationsList({
  notifications,
  onMarkAllRead,
}: {
  notifications: Notification[];
  onMarkAllRead: () => void;
}) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const items = useMemo(() => {
    return notifications
      .map((item) => ({
        id: String(item.id),
        message: String(item.message ?? "Notification système"),
        type: String(item.type ?? ""),
        createdAt: String(item.created_at ?? ""),
      }))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [notifications]);

  const visibleUnread = items.filter((item) => !readIds.has(item.id)).length;

  const markRead = (id: string) => {
    setReadIds((previous) => {
      const next = new Set(previous);
      next.add(id);
      return next;
    });
  };

  return (
    <Panel>
      <SectionHeader
        eyebrow="ALERTS"
        title="Notifications"
        action={
          visibleUnread > 0 ? (
            <button
              className="inline-flex items-center gap-1.5 rounded-full border border-[#7dd3fc]/30 bg-[#7dd3fc]/10 px-3 py-1 font-mono text-[10px] font-bold text-[#7dd3fc] transition hover:bg-[#7dd3fc]/20"
              onClick={() => {
                setReadIds(new Set(items.map((item) => item.id)));
                onMarkAllRead();
              }}
              type="button"
            >
              <Icon name="check" size={11} />
              Tout marquer lu
            </button>
          ) : undefined
        }
      />
      {items.length === 0 ? (
        <p className="mt-6 text-center font-mono text-[11px] font-bold text-[#5c6889]">
          Aucune notification chargée.
        </p>
      ) : (
        <ul className="mt-4 space-y-1.5">
          {items.map((item) => {
            const isRead = readIds.has(item.id);
            return (
              <li key={item.id}>
                <button
                  className={"flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition " + (isRead ? "border-transparent opacity-60" : "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04]")}
                  onClick={() => markRead(item.id)}
                  type="button"
                >
                  <span className="mt-1.5 shrink-0">
                    <BreathingDot color={isRead ? C.slate : C.blue} size={6} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold leading-5 text-[#c3cbdf]">{item.message}</p>
                    <p className="mt-1 flex items-center gap-1.5 font-mono text-[9px] font-bold text-[#5c6889]">
                      {item.type ? <span className="uppercase tracking-wider text-[#6b7994]">{item.type}</span> : null}
                      {item.createdAt && !Number.isNaN(new Date(item.createdAt).getTime())
                        ? new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(item.createdAt))
                        : null}
                    </p>
                  </div>
                  {!isRead ? (
                    <span className="mt-1 shrink-0 rounded-md bg-[#5cc8ff]/15 px-1.5 py-0.5 font-mono text-[8px] font-black text-[#7dd3fc]">
                      NEW
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#4a5675]">
        <Icon name="bell" size={10} style={{ color: C.cyan }} />
        {visibleUnread} non lue{visibleUnread > 1 ? "s" : ""} · chargées depuis la session
      </p>
    </Panel>
  );
}