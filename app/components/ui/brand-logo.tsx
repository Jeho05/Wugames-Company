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

// Logo horizontal officiel — lisible à petite taille (emblème + texte côte à côte)
// vertical 1600x1600 réservé aux grands affichages / OG image
export function BrandLogo({ href = "/", variant = "dark", size = "md" }: BrandLogoProps) {
  // variant="dark"  -> texte sombre #15191E sur fond clair
  // variant="light" -> texte clair #FFF0C2 sur fond sombre
  const logoSrc =
    variant === "dark"
      ? "/logos/wugams-logo-horizontal-dark.svg"
      : "/logos/wugams-logo-horizontal-light.svg";

  const content = (
    <div className="relative flex items-center gap-0 transition-opacity hover:opacity-90">
      <Image
        src={logoSrc}
        alt="WUGAMS Holding Inc."
        width={360}
        height={96}
        className={sizeClasses[size] + " w-auto object-contain"}
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
