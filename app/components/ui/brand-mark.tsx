"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type BrandMarkProps = {
  href?: string;
  inverse?: boolean;
};

export function BrandMark({ href = "/", inverse = false }: BrandMarkProps) {
  const router = useRouter();
  const [clicks, setClicks] = useState(0);
  const resetRef = useRef<number | null>(null);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    const next = clicks + 1;
    setClicks(next);
    if (resetRef.current) window.clearTimeout(resetRef.current);
    resetRef.current = window.setTimeout(() => setClicks(0), 900);
    if (next >= 3) {
      setClicks(0);
      event.preventDefault();
      router.push("/vitrine");
    }
  }

  const content = (
    <>
      <span
        className={
          inverse
            ? "grid size-9 place-items-center rounded-xl bg-[#e6ac49] text-[15px] font-black tracking-[-0.12em] text-[#101827]"
            : "grid size-9 place-items-center rounded-xl bg-[#17294b] text-[15px] font-black tracking-[-0.12em] text-white shadow-lg shadow-slate-900/15"
        }
      >
        W
      </span>
      <span className="leading-none">
        <span
          className={
            inverse
              ? "block text-[15px] font-bold tracking-[-0.04em] text-white"
              : "block text-[15px] font-bold tracking-[-0.04em] text-[#17294b]"
          }
        >
          WUGAMS
        </span>
        <span
          className={
            inverse
              ? "mt-1 block text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400"
              : "mt-1 block text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500"
          }
        >
          Holding Inc.
        </span>
      </span>
    </>
  );

  return (
    <Link
      aria-label="Accueil WUGAMS"
      className="inline-flex items-center gap-2.5"
      href={href}
      onClick={handleClick}
    >
      {content}
    </Link>
  );
}
