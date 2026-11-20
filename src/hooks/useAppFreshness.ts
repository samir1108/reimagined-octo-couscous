/**
 * useAppFreshness — detects when a newer build is deployed and force-refreshes.
 *
 * Why: on mobile (Chrome/Safari/in-app browsers), the cached app shell often
 * persists across opens, so users keep seeing an old version. We poll
  * /version.json (always served no-cache) and compare its buildId
 * to the one baked into this bundle at build time.
 *
 * Triggers a check on:
 *   • initial mount
 *   • visibilitychange → visible (app re-foregrounded)
 *   • window focus
 *   • pageshow (bfcache restore)
 *   • every 10 minutes while open
 *
 * On mismatch: clears caches, then reloads with a cache-busting query param.
 */
import { useEffect, useRef } from "react";

declare const __BUILD_ID__: string;

const VERSION_URL = "/version.json";
const POLL_MS = 10 * 60 * 1000; // 10 min

async function fetchRemoteBuildId(): Promise<string | null> {
  try {
    const res = await fetch(`${VERSION_URL}?_=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.buildId === "string" ? data.buildId : null;
  } catch {
    return null;
  }
}

async function hardRefresh() {
  try {
    // Drop any HTTP caches we control, but leave the service worker's own
    // caches alone: the worker precaches the app shell and caching Supabase
    // media, and wiping its caches mid-session leaves it serving a shell
    // that references files it no longer holds.
    //
    // The worker is asked to re-validate instead, so it picks up the new
    // build on its own. See the note below about unregistering.
    if ("caches" in window && "serviceWorker" in navigator) {
      const swCaches = new Set<string>();
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        for (const name of (await caches.keys())) {
          // Workbox names its precache "workbox-precache-<origin>".
          if (name.startsWith("workbox-precache") || name === "supabase-media" || name === "google-fonts") {
            swCaches.add(name);
          }
        }
      }
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !swCaches.has(k)).map((k) => caches.delete(k)));

      // Ask the active worker to check for a newer build.
      await Promise.all(registrations.map((r) => r.update().catch(() => undefined)));
    } else if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }

    // NOTE: service workers are deliberately NOT unregistered here.
    //
    // The app ships a service worker (vite-plugin-pwa) that precaches the
    // shell and caches Supabase media. It manages its own lifecycle via
    // skipWaiting + clientsClaim, so a new deploy is picked up without
    // help. Unregistering it here would tear down the offline support and
    // the media cache on every version bump.
  } catch { /* swallow */ }

  const url = new URL(window.location.href);
  url.searchParams.set("v", Date.now().toString());
  window.location.replace(url.toString());
}

export function useAppFreshness() {
  const checking = useRef(false);
  const localId = typeof __BUILD_ID__ === "string" ? __BUILD_ID__ : "";

  useEffect(() => {
    // Skip in dev / preview iframes — only matters for deployed builds.
    if (import.meta.env.DEV) return;

    const check = async () => {
      if (checking.current) return;
      checking.current = true;
      try {
        const remote = await fetchRemoteBuildId();
        if (remote && localId && remote !== localId) {
          await hardRefresh();
        }
      } finally {
        checking.current = false;
      }
    };

    // Run on mount
    check();

    const onVisible = () => { if (document.visibilityState === "visible") check(); };
    const onFocus = () => check();
    const onPageShow = (e: PageTransitionEvent) => { if (e.persisted) check(); };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onPageShow);
    const id = window.setInterval(check, POLL_MS);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onPageShow);
      window.clearInterval(id);
    };
  }, [localId]);
}
