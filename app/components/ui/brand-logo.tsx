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
  lg: "h-12",
};

export function BrandLogo({ href = "/", variant = "dark", size = "md" }: BrandLogoProps) {
  const logoSrc = variant === "dark" 
    ? "/logos/wugams-logo-dark.svg" 
    : "/logos/wugams-logo-light.svg";

  const content = (
    <div className="relative flex items-center gap-0 transition-opacity hover:opacity-90">
      <Image
        src={logoSrc}
        alt="WUGAMS Holding Inc."
        width={180}
        height={48}
        className={sizeClasses[size] + " w-auto"}
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
