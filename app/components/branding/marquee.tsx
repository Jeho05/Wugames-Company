"use client";

export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <div className={"overflow-hidden " + className}>
      <div className="flex w-max animate-[marquee_30s_linear_infinite]">
        {[...items, ...items].map((item, i) => (
          <span className="mx-8 shrink-0 text-xs font-bold tracking-wide text-slate-400" key={i}>
            ✦ {item}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
