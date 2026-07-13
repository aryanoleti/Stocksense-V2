"use client";

import { useEffect } from "react";

// Service worker DISABLED. An earlier caching worker could wedge installed
// clients on Chrome's "This page couldn't load" screen. Instead of registering
// a worker, we now ensure any previously-installed one is torn down: we still
// fetch /sw.js (now a self-unregistering kill-switch) so stuck browsers pick it
// up, and we proactively unregister any live registration and clear caches for
// clients that manage to load. The app runs fine as a plain network-loaded
// site; a hardened worker can be reintroduced later.
export function PwaRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

    // Register the kill-switch once so a wedged worker gets replaced, then let
    // it unregister itself.
    if (process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register(`${base}/sw.js`).catch(() => {});
    }

    // Belt-and-suspenders: drop any existing registrations and caches directly.
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => regs.forEach((r) => r.update().catch(() => {})))
      .catch(() => {});

    if (typeof caches !== "undefined") {
      caches
        .keys()
        .then((keys) => keys.forEach((k) => caches.delete(k)))
        .catch(() => {});
    }
  }, []);
  return null;
}
