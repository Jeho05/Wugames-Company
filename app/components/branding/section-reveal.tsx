"use client";

import { useScrollReveal } from "./use-scroll-reveal";

type SectionRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function SectionReveal({ children, className = "", delay = 0 }: SectionRevealProps) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.08, rootMargin: "0px 0px -60px 0px" });

  return (
    <div
      className={"section-reveal " + (isVisible ? "section-reveal--visible " : "") + className}
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
