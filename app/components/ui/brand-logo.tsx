"use client";

import Link from "next/link";
import Image from "next/image";

type BrandLogoProps = {
  href?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-8",
  md: "h-10",
  lg: "h-14",
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
    <div className="relative flex items-center gap-0 transition-opacity hover:opacity-90">
      <Image
        src={logoSrc}
        alt="WUGAMS Holding Inc."
        width={160}
        height={160}
        className={sizeClasses[size] + " w-auto object-contain rounded-xl"}
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
