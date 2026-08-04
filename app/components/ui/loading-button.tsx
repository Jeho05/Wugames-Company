"use client";

import { useId } from "react";
import type { ButtonHTMLAttributes } from "react";

type SpinnerProps = {
  size?: number;
};

export function Spinner({ size = 15 }: SpinnerProps) {
  const gradientId = useId().replace(/:/g, "");
  const radius = 8.5;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg
      aria-hidden="true"
      className="animate-spin [animation-duration:0.9s]"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
          <stop offset="55%" stopColor="currentColor" stopOpacity="0.65" />
          <stop offset="100%" stopColor="currentColor" />
        </linearGradient>
      </defs>
      <circle
        cx="12"
        cy="12"
        fill="none"
        r={radius}
        stroke="currentColor"
        strokeOpacity="0.16"
        strokeWidth="2.5"
      />
      <circle
        className="animate-pulse"
        cx="12"
        cy="12"
        fill="none"
        r={radius}
        stroke={`url(#${gradientId})`}
        strokeDasharray={`${circumference * 0.72} ${circumference}`}
        strokeLinecap="round"
        strokeWidth="2.5"
        transform="rotate(-90 12 12)"
      />
    </svg>
  );
}

type LoadingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
  spinnerSize?: number;
};

export function LoadingButton({
  children,
  disabled,
  loading = false,
  loadingLabel,
  spinnerSize = 15,
  className = "",
  ...props
}: LoadingButtonProps) {
  return (
    <button
      className={
        "inline-flex items-center justify-center gap-2 transition " +
        (loading ? "pointer-events-none opacity-70" : "") +
        " " +
        className
      }
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size={spinnerSize} /> : null}
      {loading && loadingLabel ? <span>{loadingLabel}</span> : children}
    </button>
  );
}