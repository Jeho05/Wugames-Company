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
  const logoSrc = inverse
    ? "/logos/wugams-logo-light.svg"
    : "/logos/wugams-logo-dark.svg";

  const content = (
    <Image
      src={logoSrc}
      alt="WUGAMS Holding Inc."
      width={160}
      height={160}
      className="h-10 w-10 rounded-xl object-contain"
      priority
    />
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
