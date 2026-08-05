"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";

type SparklineProps = {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  fill?: boolean;
};

export function Sparkline({ data, color = "#e3a641", width = 96, height = 32, fill = true }: SparklineProps) {
  const gradientId = useId().replace(/:/g, "");
  const reduce = useReducedMotion();

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data.map((value, index) => {
    const x = index * step;
    const y = height - 3 - ((value - min) / range) * (height - 8);
    return [x, y] as const;
  });

  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg
      aria-hidden="true"
      className="overflow-visible"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      {fill ? (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            animate={reduce ? undefined : { opacity: 1 }}
            d={area}
            fill={`url(#${gradientId})`}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </>
      ) : null}
      <motion.path
        d={line}
        fill="none"
        initial={reduce ? undefined : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
      <circle
        cx={points[points.length - 1][0]}
        cy={points[points.length - 1][1]}
        fill="#fff"
        r="2.5"
        stroke={color}
        strokeWidth="1.6"
      />
    </svg>
  );
}
