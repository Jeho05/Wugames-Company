"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const url = "/sw.js";
    window.addEventListener("load", () => {
      navigator.serviceWorker.register(url).catch(() => undefined);
    });
  }, []);
  return null;
}
