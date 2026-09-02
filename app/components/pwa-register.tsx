"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    // Désactive le SW en développement pour éviter les caches qui masquent les images pendant le dev
    if (process.env.NODE_ENV === "development") {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister().catch(() => undefined))).catch(() => undefined);
      return;
    }
    const url = "/sw.js";
    // Mémorise si un contrôleur existait déjà : évite le reload au premier install (perf + évite boucle)
    const hadController = !!navigator.serviceWorker.controller;
    let refreshing = false;

    const onControllerChange = () => {
      if (refreshing) return;
      // Premier install : pas de reload (l'utilisateur a déjà la bonne page)
      if (!hadController) return;
      // Évite les reloads en boucle si plusieurs onglets
      if (sessionStorage.getItem("wugams:reloaded")) return;
      refreshing = true;
      sessionStorage.setItem("wugams:reloaded", "1");
      window.setTimeout(() => sessionStorage.removeItem("wugams:reloaded"), 3000);
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register(url)
        .then((reg) => {
          // Force update seulement si un ancien SW est présent (corrige le v1 buggy une fois, pas à chaque navigation)
          if (hadController) reg.update().catch(() => undefined);
          if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
          reg.addEventListener("updatefound", () => {
            const sw = reg.installing;
            if (sw) {
              sw.addEventListener("statechange", () => {
                if (sw.state === "installed" && navigator.serviceWorker.controller) {
                  sw.postMessage({ type: "SKIP_WAITING" });
                }
              });
            }
          });
        })
        .catch(() => undefined);
    });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);
  return null;
}
