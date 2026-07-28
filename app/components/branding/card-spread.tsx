"use client";

import { useScrollReveal } from "./use-scroll-reveal";

type CardSpreadProps = {
  children: React.ReactNode;
  className?: string;
  index: number;
  total: number;
};

export function CardSpread({ children, className = "", index, total }: CardSpreadProps) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
  const mid = (total - 1) / 2;
  const offset = index - mid;

  return (
    <div
      className={
        "card-spread " +
        (isVisible ? "card-spread--visible " : "") +
        className
      }
      ref={ref}
      style={{
        transitionDelay: `${Math.abs(offset) * 80}ms`,
        "--spread-offset": `${offset * 12}px`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
