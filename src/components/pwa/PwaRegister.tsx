"use client";

import { useEffect } from "react";

// Service worker DISABLED. Earlier caching/kill-switch workers wedged installed
// clients on Chrome's "This page couldn't load" screen — the last one even
// reloaded on activate, which (combined with re-registration) caused a reload
// loop. This component NEVER registers a worker. It only tears down anything
// left over: it unregisters existing registrations, clears caches, and — if a
// stale worker is still controlling THIS page — reloads exactly once (guarded
// by sessionStorage) so the page recovers immediately without looping.
export function PwaRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => {
        const hadWorker = regs.length > 0;
        regs.forEach((r) => r.unregister().catch(() => {}));

        if (typeof caches !== "undefined") {
          caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
        }

        // If an old worker is actively controlling this page, one clean reload
        // gets us a pure network load. Guarded so it can never loop.
        const controlled = !!navigator.serviceWorker.controller;
        let alreadyReset = false;
        try {
          alreadyReset = sessionStorage.getItem("ss.swReset") === "1";
        } catch {
          /* noop */
        }
        if ((hadWorker || controlled) && controlled && !alreadyReset) {
          try {
            sessionStorage.setItem("ss.swReset", "1");
          } catch {
            /* noop */
          }
          window.location.reload();
        }
      })
      .catch(() => {});
  }, []);
  return null;
}
