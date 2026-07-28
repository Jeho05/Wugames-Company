"use client";

import { useRef, useState } from "react";

type CircleHoverCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function CircleHoverCard({ children, className = "" }: CircleHoverCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [circlePos, setCirclePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCirclePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  return (
    <div
      className={"circle-hover-card " + className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      ref={cardRef}
    >
      <div
        className="circle-hover-card__glow"
        style={{
          left: circlePos.x,
          top: circlePos.y,
          opacity: isHovered ? 1 : 0,
        }}
      />
      {children}
    </div>
  );
}
