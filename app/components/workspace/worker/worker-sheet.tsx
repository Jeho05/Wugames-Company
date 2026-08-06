"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

import { Icon } from "@/app/components/ui/app-icon";

export type WorkerSheetTone = "primary" | "danger";

export type WorkerSheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function WorkerSheet({ open, title, onClose, children }: WorkerSheetProps) {
  return (
    <AnimatePresence>
      {open ? (
        <div aria-modal className="fixed inset-0 z-50 mx-auto max-w-md" role="dialog">
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="Fermer"
            className="absolute inset-0 h-full w-full bg-slate-950/45"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
            type="button"
          />
          <motion.div
            animate={{ y: 0 }}
            className="absolute inset-x-0 bottom-0 rounded-t-[2rem] border-t border-slate-200 bg-white p-5 pb-8"
            exit={{ y: "100%" }}
            initial={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-[17px] font-extrabold text-[#16233a]">{title}</h2>
              <button
                aria-label="Fermer"
                className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-500 transition active:scale-95"
                onClick={onClose}
                style={{ minHeight: 44, minWidth: 44 }}
                type="button"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  tone?: WorkerSheetTone;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({ open, title, message, confirmLabel, tone = "primary", busy, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open ? (
        <div aria-modal className="fixed inset-0 z-50 mx-auto max-w-md" role="dialog">
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="Fermer"
            className="absolute inset-0 h-full w-full bg-slate-950/45"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onCancel}
            type="button"
          />
          <motion.div
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
            exit={{ scale: 0.94, opacity: 0 }}
            initial={{ scale: 0.94, opacity: 0 }}
          >
            <div className="mb-3 grid size-11 place-items-center rounded-2xl bg-[#0f7a5f]/10 text-[#0f7a5f]">
              <Icon name="check" size={20} />
            </div>
            <h2 className="text-[16px] font-extrabold text-[#16233a]">{title}</h2>
            <p className="mt-1.5 text-[13px] leading-6 text-slate-500">{message}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                className="min-h-[48px] rounded-2xl border border-slate-200 bg-white text-[13px] font-bold text-slate-600 transition active:scale-[0.98]"
                onClick={onCancel}
                type="button"
              >
                Annuler
              </button>
              <button
                className={
                  "min-h-[48px] rounded-2xl text-[13px] font-extrabold text-white transition active:scale-[0.98] disabled:opacity-60 " +
                  (tone === "danger" ? "bg-rose-600" : "bg-[#0f7a5f]")
                }
                disabled={busy}
                onClick={onConfirm}
                type="button"
              >
                {busy ? "Envoi…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
