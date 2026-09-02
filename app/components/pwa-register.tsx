"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const url = "/sw.js";
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register(url)
        .then((reg) => {
          // Force update check on every load (corrige le SW v1 buggy)
          reg.update().catch(() => undefined);
          // Si une nouvelle version est trouvée, active-la immédiatement
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
    // Quand le nouveau SW prend le contrôle, recharge pour avoir le bon JS/CSS
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }, []);
  return null;
}
