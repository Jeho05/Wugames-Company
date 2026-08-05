"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { AccountantPanel } from "@/app/components/workspace/accountant/accountant-panel";
import type { PaymentEvent } from "@/app/lib/accountant-data";

type AccountantPaymentsProps = {
  payments: PaymentEvent[];
};

const kindMeta: Record<PaymentEvent["kind"], { icon: "arrow-up" | "clock" | "warning" | "refresh"; tile: string; ring: string }> = {
  recu: { icon: "arrow-up", tile: "bg-emerald-400/10 text-emerald-300", ring: "from-emerald-400/40" },
  attente: { icon: "clock", tile: "bg-amber-400/10 text-amber-300", ring: "from-amber-400/40" },
  refuse: { icon: "warning", tile: "bg-rose-500/10 text-rose-300", ring: "from-rose-500/40" },
  remboursement: { icon: "refresh", tile: "bg-sky-400/10 text-sky-300", ring: "from-sky-400/40" },
};

export function AccountantPayments({ payments }: AccountantPaymentsProps) {
  return (
    <AccountantPanel
      action={
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-300">
          {payments.length} événements
        </span>
      }
      icon="check"
      subtitle="Paiements reçus, en attente, refusés"
      title="Paiements"
    >
      <ol className="relative space-y-1">
        {payments.map((payment, index) => {
          const meta = kindMeta[payment.kind];
          const isLast = index === payments.length - 1;
          return (
            <li className="relative flex gap-3.5 pb-4" key={payment.id}>
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[17px] top-9 h-full w-px bg-gradient-to-b from-white/10 to-transparent"
                />
              ) : null}
              <motion.span
                animate={{ opacity: 1, scale: 1 }}
                className={"relative z-10 grid size-9 shrink-0 place-items-center rounded-xl border border-white/[0.08] " + meta.tile}
                initial={{ opacity: 0, scale: 0.6 }}
                transition={{ delay: index * 0.05, type: "spring", bounce: 0.4 }}
              >
                <Icon name={meta.icon} size={16} />
              </motion.span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="truncate text-[13px] font-bold text-white">{payment.title}</p>
                <p className="mt-0.5 truncate text-[11px] leading-5 text-slate-400">{payment.detail}</p>
                <p className="mt-1 text-[10px] font-semibold tabular-nums text-slate-500">{payment.time}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </AccountantPanel>
  );
}
