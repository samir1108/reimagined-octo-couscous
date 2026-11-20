/**
 * ConsciousOS service worker.
 *
 * Goals: keep the app shell available offline and avoid the classic PWA
 * failure mode where a stale cached index.html points at hashed chunks that
 * no longer exist after a deploy.
 *
 * - Navigations: network-first, fall back to the cached shell.
 * - Build assets (hashed): stale-while-revalidate.
 * - Supabase / AI API traffic: never cached.
 */

const VERSION = "v3";
const SHELL_CACHE = `consciousos-shell-${VERSION}`;
const ASSET_CACHE = `consciousos-assets-${VERSION}`;

const SHELL_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/favicon.png",
  "/brand-logo.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  // Never cache API-like traffic or auth callbacks.
  if (
    url.pathname.startsWith("/rest/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/functions/")
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstShell(request));
    return;
  }

  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function networkFirstShell(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put("/", response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match("/");
    return (
      cached ||
      new Response("<h1>Offline</h1><p>Reconnect to continue your practice.</p>", {
        status: 503,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      })
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);

  return cached || network;
}

self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting" || event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
