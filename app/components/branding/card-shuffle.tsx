"use client";

import { useScrollReveal } from "./use-scroll-reveal";

type CardShuffleProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function CardShuffle({ children, className = "", delay = 0 }: CardShuffleProps) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <div
      className={
        "card-shuffle " +
        (isVisible ? "card-shuffle--visible " : "") +
        className
      }
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
