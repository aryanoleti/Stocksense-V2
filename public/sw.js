// StockSense service worker — network-first with cache fallback so the app
// shell keeps working offline. Live-data endpoints are never intercepted.
// Derives the base path from its own location, so it works both at the domain
// root (Cloudflare, local dev) and under /Stocksense-V2 on GitHub Pages.

const CACHE = "stocksense-shell-v2";
const BASE = self.location.pathname.replace(/\/sw\.js$/, "");

// Friendly fallback when there's no network AND nothing cached — without
// this, installed-app launches show the browser's raw "page couldn't load".
const OFFLINE_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>StockSense — offline</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0a100d;color:#e9f1ec;
       font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;text-align:center;padding:24px}
  .mark{width:56px;height:56px;border-radius:14px;background:#0c4a30;display:grid;place-items:center;margin:0 auto 20px}
  h1{font-size:20px;margin:0 0 8px;letter-spacing:-.02em}
  p{margin:0 0 20px;color:#a9b8b0;font-size:14px;line-height:1.6}
  button{background:#2e8659;color:#fff;border:0;border-radius:12px;padding:10px 22px;font-size:14px;font-weight:600;cursor:pointer}
</style></head>
<body><div>
  <div class="mark"><svg viewBox="0 0 24 24" width="26" height="26" fill="none">
    <path d="M4 16l5-5 3.5 3L20 7" stroke="#a6d4b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="20" cy="7" r="2" fill="#a6d4b8"/></svg></div>
  <h1>You're offline</h1>
  <p>StockSense couldn't reach the network.<br>Check your connection and try again.</p>
  <button onclick="location.reload()">Try again</button>
</div></body></html>`;

self.addEventListener("install", (event) => {
  // Precache the app shell so a flaky first launch still has something to show.
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([`${BASE}/`]).catch(() => {}))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Leave cross-origin requests (Yahoo proxies, Google scripts, fonts) alone.
  if (url.origin !== self.location.origin) return;
  // Never cache the Worker's live-quote proxy or auth endpoints.
  if (url.pathname.includes("/__proxy") || url.pathname.includes("/__logout")) return;

  // Hashed build assets are immutable — serve from cache first for speed and
  // resilience, fetching (and caching) only on a miss.
  if (url.pathname.includes("/_next/static/")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ??
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((cache) => cache.put(req, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Everything else: network-first, cache fallback, then the offline page.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && (res.type === "basic" || res.type === "default")) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(async () => {
        const hit = await caches.match(req);
        if (hit) return hit;
        if (req.mode === "navigate") {
          const shell = await caches.match(`${BASE}/`);
          if (shell) return shell;
          return new Response(OFFLINE_HTML, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
        }
        return Response.error();
      }),
  );
});
