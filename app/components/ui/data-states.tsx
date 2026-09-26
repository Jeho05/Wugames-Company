"use client";

import { Icon } from "@/app/components/ui/app-icon";
import type { IconName } from "@/app/components/ui/app-icon";

type StateProps = {
  title: string;
  message: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
};

function StateShell({ title, message, icon = "info", actionLabel, onAction, tone }: StateProps & { tone: string }) {
  return (
    <div className="grid place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className={`mx-auto grid size-14 place-items-center rounded-2xl ${tone}`}>
          <Icon name={icon} size={24} />
        </span>
        <h2 className="mt-5 text-lg font-bold tracking-[-0.03em] text-[#17294b]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
        {actionLabel && onAction ? (
          <button
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#17294b] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#243a61]"
            onClick={onAction}
            type="button"
          >
            <Icon name="refresh" size={15} />
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function LoadingState({ message = "Chargement des données…" }: { message?: string }) {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <div className="flex flex-col items-center gap-4">
        <span className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#e3a641]" />
        <p className="text-sm font-semibold text-slate-400">{message}</p>
      </div>
    </div>
  );
}

export function EmptyState(props: StateProps) {
  return <StateShell {...props} icon={props.icon ?? "folder"} tone="bg-slate-100 text-slate-400" />;
}

export function ErrorState(props: StateProps) {
  return <StateShell {...props} icon={props.icon ?? "warning"} tone="bg-red-50 text-red-500" />;
}

export function ForbiddenState(props: StateProps) {
  return <StateShell {...props} icon={props.icon ?? "lock"} tone="bg-amber-50 text-[#d19331]" />;
}

export function OfflineState(props: StateProps) {
  return <StateShell {...props} icon={props.icon ?? "refresh"} tone="bg-sky-50 text-sky-600" />;
}
