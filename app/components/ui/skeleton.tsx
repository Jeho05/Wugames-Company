"use client";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={"animate-pulse rounded-xl bg-slate-200/70 " + className}
    />
  );
}

export function SkeletonText({ lines = 3, className = "" }: SkeletonProps & { lines?: number }) {
  return (
    <div className={"space-y-2 " + className} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded-lg bg-slate-200/70"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={"rounded-2xl border border-slate-100 bg-white p-5 " + className}
    >
      <div className="flex items-center gap-3">
        <div className="size-10 animate-pulse rounded-xl bg-slate-200/70" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 animate-pulse rounded-lg bg-slate-200/70" />
          <div className="h-3 w-1/2 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full animate-pulse rounded-lg bg-slate-100" />
        <div className="h-3 w-4/5 animate-pulse rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

export function SkeletonKpi({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={"rounded-2xl border border-slate-100 bg-white p-4 " + className}
    >
      <div className="size-8 animate-pulse rounded-lg bg-slate-200/70" />
      <div className="mt-3 h-7 w-16 animate-pulse rounded-lg bg-slate-200/70" />
      <div className="mt-1 h-3 w-24 animate-pulse rounded-lg bg-slate-100" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = "" }: SkeletonProps & { rows?: number; cols?: number }) {
  return (
    <div className={"overflow-hidden rounded-2xl border border-slate-100 bg-white " + className} aria-hidden="true">
      <div className="flex border-b border-slate-100 bg-slate-50/60 px-4 py-3">
        {Array.from({ length: cols }, (_, i) => (
          <div key={i} className="mr-4 h-3 flex-1 animate-pulse rounded bg-slate-200/70" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex border-b border-slate-50 px-4 py-3 last:border-0">
          {Array.from({ length: cols }, (_, c) => (
            <div key={c} className="mr-4 h-3 flex-1 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      ))}
    </div>
  );
}
