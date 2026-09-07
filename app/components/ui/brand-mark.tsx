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
            ? "relative grid size-12 place-items-center overflow-hidden rounded-2xl bg-[#090A0C] shadow-lg shadow-black/20 ring-1 ring-white/10"
            : "relative grid size-12 place-items-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5"
        }
      >
        {/* lueur dorée subtile derrière l'emblème */}
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#D79A35]/12 via-transparent to-[#8A5A18]/12" />
        {/* On zoome sur l'emblème (haut du fichier exact) pour que le W doré soit grand et lisible — le texte reste lisible via le HTML à côté */}
        <Image
          src={logoSrc}
          alt=""
          width={400}
          height={400}
          className="relative size-[72px] max-w-none object-cover object-top"
          style={{ objectPosition: "50% 32%" }}
          priority
        />
      </span>
      <span className="leading-none">
        <span
          className={
            inverse
              ? "block font-[var(--font-cormorant)] text-[17px] font-semibold tracking-[0.14em] text-[#FFF0C2]"
              : "block font-[var(--font-cormorant)] text-[17px] font-semibold tracking-[0.14em] text-[#15191E]"
          }
        >
          WUGAMS
        </span>
        <span
          className={
            inverse
              ? "mt-0.5 block font-[var(--font-montserrat)] text-[9px] font-semibold uppercase tracking-[0.22em] text-[#F0D99C]/90"
              : "mt-0.5 block font-[var(--font-montserrat)] text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500"
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
