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

  // Logo officiel exact fourni à la racine — blanc #FFFFFF pour fonds clairs, noir #090A0C pour fonds sombres
  // On affiche le fichier EXACT sans retouche, mais en grand et esthétique (pas minuscule)
  const logoSrc = inverse
    ? "/logos/wugams-logo-light.svg"
    : "/logos/wugams-logo-dark.svg";

  const content = (
    <>
      <span
        className={
          inverse
            ? "relative grid size-14 place-items-center overflow-hidden rounded-2xl bg-[#090A0C] shadow-xl shadow-black/25 ring-1 ring-white/10 lg:size-16"
            : "relative grid size-14 place-items-center overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5 lg:size-16"
        }
      >
        {/* lueur dorée subtile derrière l'emblème */}
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#D79A35]/14 via-transparent to-[#8A5A18]/14" />
        {/* Fichier EXACT 1600 carré, bien contenu, bien grand et net — plus de débordement */}
        <Image
          src={logoSrc}
          alt="WUGAMS Holding Inc."
          width={400}
          height={400}
          className="relative size-14 rounded-2xl object-contain p-1.5 lg:size-16 lg:p-2"
          priority
        />
      </span>
      <span className="hidden leading-none sm:block">
        <span
          className={
            inverse
              ? "block font-[var(--font-cormorant)] text-[18px] font-semibold tracking-[0.14em] text-[#FFF0C2] lg:text-[19px]"
              : "block font-[var(--font-cormorant)] text-[18px] font-semibold tracking-[0.14em] text-[#15191E] lg:text-[19px]"
          }
        >
          WUGAMS
        </span>
        <span
          className={
            inverse
              ? "mt-0.5 block font-[var(--font-montserrat)] text-[10px] font-semibold uppercase tracking-[0.22em] text-[#F0D99C]/90"
              : "mt-0.5 block font-[var(--font-montserrat)] text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500"
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
