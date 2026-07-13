// KILL-SWITCH service worker.
//
// Earlier versions of this worker could serve a failed navigation
// (Response.error()), which wedged some installed clients on Chrome's
// "This page couldn't load" screen — and because the worker intercepted
// every request, it could not recover on its own.
//
// This version registers NO fetch handler, so it never intercepts a
// navigation: pages always load straight from the network. On activation it
// deletes all caches, unregisters itself, and reloads open clients. When a
// stuck browser re-fetches sw.js in the background (cache-control is only
// 10 min), it picks this up and heals automatically — no manual steps.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Drop every cache this origin created.
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
        /* noop */
      }
      // Remove this service worker entirely.
      try {
        await self.registration.unregister();
      } catch {
        /* noop */
      }
      // Reload any windows this worker was controlling so they load cleanly
      // from the network right away.
      try {
        const clients = await self.clients.matchAll({ type: "window" });
        for (const client of clients) {
          if ("navigate" in client) client.navigate(client.url);
        }
      } catch {
        /* noop */
      }
    })(),
  );
});

// Intentionally no "fetch" handler — navigations and assets bypass the worker.
