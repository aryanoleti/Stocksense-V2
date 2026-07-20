// KILL-SWITCH service worker (v4 - with fetch passthrough + clients.claim).
//
// The app no longer registers a service worker. This file exists only to
// clean up any worker left over from earlier versions: when a browser that
// still has an old registration re-fetches sw.js in the background, it picks
// this up, clears all caches, claims all clients, and unregisters itself.
//
// A fetch passthrough handler is included so that if this SW ever intercepts
// a navigation (before unregistering), it forwards it to the network rather
// than causing a reload loop. This breaks the "This page couldn't load" issue.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Claim all open clients immediately so the fetch passthrough takes effect
      // before any navigation can be intercepted by the old cached handler.
      try {
        await self.clients.claim();
      } catch {
        /* noop */
      }

      // Clear every cache.
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
        /* noop */
      }

      // Unregister this SW so future navigations go straight to the network.
      try {
        await self.registration.unregister();
      } catch {
        /* noop */
      }
    })()
  );
});

// Pass every fetch straight to the network - never serve from cache.
// This ensures navigations to /dashboard and other routes always reach
// GitHub Pages rather than a stale cached response.
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
