"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

  // Emblème officiel WUGAMS — or champagne (édition sombre avec glow pour fonds sombres)
  const emblemSrc = "/logos/wugams-emblem.svg";

  const content = (
    <>
      <span
        className={
          inverse
            ? "grid size-9 place-items-center overflow-hidden rounded-xl bg-white/[0.08] ring-1 ring-white/10 backdrop-blur-sm"
            : "grid size-9 place-items-center overflow-hidden rounded-xl bg-[#0a1420] shadow-lg shadow-slate-900/20 ring-1 ring-slate-900/5"
        }
      >
        <Image
          src={emblemSrc}
          alt=""
          width={36}
          height={36}
          className="size-[28px] object-contain"
          priority
        />
      </span>
      <span className="leading-none">
        <span
          className={
            inverse
              ? "block font-['Cormorant_Garamond',Georgia,serif] text-[15px] font-semibold tracking-[0.14em] text-[#FFF0C2]"
              : "block font-['Cormorant_Garamond',Georgia,serif] text-[15px] font-semibold tracking-[0.14em] text-[#15191E]"
          }
        >
          WUGAMS
        </span>
        <span
          className={
            inverse
              ? "mt-0.5 block font-['Montserrat',Arial,sans-serif] text-[8px] font-semibold uppercase tracking-[0.22em] text-[#F0D99C]/90"
              : "mt-0.5 block font-['Montserrat',Arial,sans-serif] text-[8px] font-semibold uppercase tracking-[0.22em] text-slate-500"
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
