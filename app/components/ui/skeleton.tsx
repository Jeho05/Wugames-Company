export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={"animate-pulse rounded-xl bg-slate-200 " + className} />;
}

export function CardSkeleton() {
  return <div className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />;
}

export function TableSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}
