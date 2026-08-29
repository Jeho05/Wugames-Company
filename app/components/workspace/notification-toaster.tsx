"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { resolveNotificationTarget } from "@/app/lib/notification-target";
import type { Notification } from "@/app/lib/contracts";

type ToastItem = { id: string; notification: Notification; href: string | null; label: string | null };

export function NotificationToaster() {
  const router = useRouter();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Demande la permission navigateur une fois
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      void Notification.requestPermission().catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ notification: Notification; href: string | null; label: string | null }>;
      const { notification, href, label } = custom.detail;
      const toast: ToastItem = { id: notification.id, notification, href, label };
      setToasts((prev) => [toast, ...prev].slice(0, 3));

      // Notification navigateur native
      try {
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          const n = new Notification(String(notification.message ?? "Nouvelle notification WUGAMS"), {
            body: label ? `${label} · Cliquez pour ouvrir` : String(notification.message ?? ""),
            icon: "/favicon.ico",
          });
          n.onclick = () => {
            window.focus();
            if (href) router.push(href);
            n.close();
          };
        }
      } catch {
        /* ignore */
      }

      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 8000);
    };
    window.addEventListener("wugams:notify", handler as EventListener);
    return () => window.removeEventListener("wugams:notify", handler as EventListener);
  }, [router]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15"
          >
            <div className="flex items-start gap-3 p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#17294b] text-white">
                <Icon name="bell" size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold leading-5 text-[#17294b]">{String(toast.notification.message ?? "Nouvelle notification")}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {String(toast.notification.type ?? "Système")} · à l&apos;instant
                </p>
              </div>
              <button
                aria-label="Fermer"
                className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                type="button"
              >
                <Icon name="close" size={14} />
              </button>
            </div>
            {toast.href ? (
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2.5">
                <span className="text-[11px] font-semibold text-slate-500">{toast.label}</span>
                <button
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#17294b] px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-[#243a61]"
                  onClick={() => {
                    router.push(toast.href!);
                    setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                  }}
                  type="button"
                >
                  Ouvrir <Icon name="arrow-right" size={13} />
                </button>
              </div>
            ) : null}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
