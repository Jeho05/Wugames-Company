"use client";

import { useEffect, useRef } from "react";

import { ensureActivityTracking, secondsSinceLastActivity } from "./activity-tracker";

export interface SmartPollingOptions {
  /** Ne pas déclencher de poll tant que true (par ex. pendant un premier chargement). */
  skip?: boolean;
  /** Facteur de raréfaction par tick sans activité (défaut : 2 → ×2, ×4…). */
  backoffFactor?: number;
  /** Multiplicateur maximal de l'intervalle (défaut : 4). */
  maxBackoff?: number;
}

/**
 * Polling intelligent :
 * - pause complète quand l'onglet est masqué ;
 * - rafraîchissement immédiat + retour au premier intervalle quand l'onglet redevient visible ;
 * - raréfaction progressive quand l'utilisateur est inactif (×2, ×4 …) et retour au rythme de base dès la moindre activité.
 */
export function useSmartPolling(
  callback: () => void,
  intervalMs: number,
  options: SmartPollingOptions = {},
): void {
  const callbackRef = useRef(callback);
  const optionsRef = useRef({ backoffFactor: options.backoffFactor ?? 3, maxBackoff: options.maxBackoff ?? 5 });
  const intervalMsRef = useRef(intervalMs);

  /* Synchronisation des valeurs « fraîches » après chaque rendu (jamais pendant le rendu). */
  useEffect(() => {
    callbackRef.current = callback;
    optionsRef.current = {
      backoffFactor: options.backoffFactor ?? 3,
      maxBackoff: options.maxBackoff ?? 5,
    };
    intervalMsRef.current = intervalMs;
  });

  useEffect(() => {
    ensureActivityTracking();
    const { backoffFactor, maxBackoff } = optionsRef.current;
    const base = Math.max(intervalMsRef.current, 5000);
    let factor = 1;
    let timer = 0;

    const arm = () => {
      window.clearTimeout(timer);
      if (options.skip || document.hidden) return;
      timer = window.setTimeout(step, base * factor);
    };

    const step = () => {
      if (options.skip || document.hidden) {
        arm();
        return;
      }
      // L'utilisateur a été actif récemment : on revient au rythme de base, sinon on raréfie.
      const activeSince = secondsSinceLastActivity();
      factor = activeSince < (base / 1000) * 1.2 ? 1 : Math.min(factor * backoffFactor, maxBackoff);
      callbackRef.current();
      arm();
    };

    const onVisibility = () => {
      if (!document.hidden) {
        factor = 1;
        if (!options.skip) callbackRef.current();
      }
      arm();
    };

    document.addEventListener("visibilitychange", onVisibility);
    arm();

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [options.skip]);
}