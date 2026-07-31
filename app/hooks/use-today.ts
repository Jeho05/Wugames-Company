/**
 * useToday Hook
 * Hydration-safe access to the current greeting, date label and day of week.
 */

"use client";

import { useEffect, useState } from "react";

export interface TodayInfo {
  greeting: string;
  dateLabel: string;
  dayOfWeek: number;
  dayName: string;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function computeToday(): TodayInfo {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return {
    greeting,
    dateLabel: now.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    dayOfWeek: now.getDay(),
    dayName: capitalize(now.toLocaleDateString("fr-FR", { weekday: "long" })),
  };
}

export function useToday(): TodayInfo | null {
  const [today, setToday] = useState<TodayInfo | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setToday(computeToday()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return today;
}
