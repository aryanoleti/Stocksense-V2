// KILL-SWITCH service worker (v3 — no reload).
//
// The app no longer registers a service worker. This file exists only to
// clean up any worker left over from earlier versions: when a browser that
// still has an old registration re-fetches sw.js in the background, it picks
// this up, clears all caches, and unregisters itself.
//
// It registers NO fetch handler (so it never intercepts a navigation) and it
// does NOT reload clients — an earlier version reloaded on activate, which,
// combined with re-registration, caused a reload loop that surfaced as
// Chrome's "This page couldn't load". Cleanup is silent; the next natural
// navigation loads cleanly from the network.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
        /* noop */
      }
      try {
        await self.registration.unregister();
      } catch {
        /* noop */
      }
    })(),
  );
});

// Intentionally no "fetch" handler and no client reload.
