"use client";

export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <div className={"overflow-hidden " + className}>
      <div
        className="flex w-max animate-marquee"
        style={{ animationDuration: `${Math.max(15, items.length * 2)}s` }}
      >
        {[...items, ...items].map((item, i) => (
          <span className="mx-8 shrink-0 text-xs font-bold tracking-wide text-slate-400" key={i}>
            ✦ {item}
          </span>
        ))}
      </div>
    </div>
  );
}
