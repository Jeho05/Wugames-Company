"use client";

import Link from "next/link";
import Image from "next/image";

type BrandLogoProps = {
  href?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-20",
  md: "h-28",
  lg: "h-40",
};

// Logo officiel exact 1600×1600 fourni à la racine — utilisé tel quel, sans retouche
export function BrandLogo({ href = "/", variant = "dark", size = "md" }: BrandLogoProps) {
  // variant="dark"  -> fond blanc #FFFFFF / texte #15191E (e591...)
  // variant="light" -> fond noir #090A0C / texte #FFF0C2 (e5c65...)
  const logoSrc =
    variant === "dark"
      ? "/logos/wugams-logo-dark.svg"
      : "/logos/wugams-logo-light.svg";

  const content = (
    <div
      className={
        "relative flex items-center justify-center overflow-hidden rounded-3xl transition hover:opacity-95 " +
        (variant === "dark"
          ? "bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5"
          : "bg-[#090A0C] shadow-xl shadow-black/20 ring-1 ring-white/10") +
        " " +
        sizeClasses[size] +
        " aspect-square p-2"
      }
    >
      <span className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#D79A35]/8 via-transparent to-[#8A5A18]/8" />
      <Image
        src={logoSrc}
        alt="WUGAMS Holding Inc."
        width={400}
        height={400}
        className="relative h-full w-full object-contain"
        priority
      />
    </div>
  );

  return (
    <Link href={href} aria-label="WUGAMS - Retour à l'accueil">
      {content}
    </Link>
  );
}
