"use client";

/** Suivi global (single-instance) de la dernière activité utilisateur (pointeur, clavier, défilement, tactile). */
let lastActivityAt = typeof window !== "undefined" ? Date.now() : 0;
let installed = false;

export function ensureActivityTracking(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;
  lastActivityAt = Date.now();
  const update = () => {
    lastActivityAt = Date.now();
  };
  window.addEventListener("pointermove", update, { passive: true });
  window.addEventListener("pointerdown", update, { passive: true });
  window.addEventListener("keydown", update, { passive: true });
  window.addEventListener("touchstart", update, { passive: true });
  window.addEventListener("scroll", update, { passive: true, capture: true });
  document.addEventListener(
    "visibilitychange",
    () => {
      if (!document.hidden) lastActivityAt = Date.now();
    },
    { passive: true },
  );
}

export function secondsSinceLastActivity(): number {
  return (Date.now() - lastActivityAt) / 1000;
}