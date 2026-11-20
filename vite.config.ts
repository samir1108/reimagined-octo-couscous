import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import fs from "fs";

const BUILD_ID = Date.now().toString();

// Emit /version.json into the build output so the running app can poll it
// and force a hard refresh when a newer build is deployed (mobile sees stale shell).
function emitVersionJsonPlugin(): Plugin {
  return {
    name: "emit-version-json",
    closeBundle() {
      const out = path.resolve(__dirname, "dist", "version.json");
      try {
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, JSON.stringify({ buildId: BUILD_ID }));
      } catch (_e) { /* non-fatal */ }
    },
  };
}

/**
 * Serve bundled images from the Supabase CDN as WebP.
 *
 * Images under src/assets are uploaded to the `media` bucket by
 * scripts/push-images-to-cdn.mjs, which records the mapping in
 * src/lib/media/cdn-images.json. This plugin resolves any import of a
 * mapped image to its CDN URL instead of emitting a copy into dist/assets.
 *
 * Why it matters:
 *   - Removes ~22 MB of imagery from the deploy and from the app origin.
 *   - The bucket is served with `public, max-age=31536000, immutable`
 *     (scripts/set-bucket-cache.mjs), so repeat views are edge hits.
 *   - The CDN's /render/image/ endpoint converts PNG/JPG to WebP on the
 *     fly. Across the 299 uploaded images that is 61 MB -> 23 MB (62%
 *     smaller) with no loss of displayed size, because the transform is
 *     format-only and does not resize.
 *
 * If the manifest is missing (fresh clone, upload not run yet) the plugin
 * is a no-op and images bundle locally exactly as before.
 */
function cdnImagePlugin(): Plugin {
  const manifestPath = path.resolve(__dirname, "src/lib/media/cdn-images.json");
  if (!fs.existsSync(manifestPath)) return { name: "cdn-images" };

  let manifest: { images?: Record<string, { url?: string; render_url?: string; size?: number }> } = {};
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    return { name: "cdn-images" };
  }
  const images = manifest.images || {};
  if (Object.keys(images).length === 0) return { name: "cdn-images" };

  // Format-only WebP conversion. No width/height, so the intrinsic size is
  // unchanged and every existing layout keeps working.
  const WEBP = "?format=webp&quality=85";

  // local absolute path -> CDN url
  const byAbsPath = new Map<string, string>();
  for (const [rel, entry] of Object.entries(images)) {
    const url = entry?.render_url ? `${entry.render_url}${WEBP}` : entry?.url;
    if (!url) continue;
    byAbsPath.set(normalize(path.resolve(__dirname, "src", rel)), url);
  }

  return {
    name: "cdn-images",
    enforce: "pre",
    resolveId(source, importer) {
      if (!/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(source)) return null;

      // Strip the query so `?url` style imports resolve the same way.
      const bare = source.split("?")[0];

      // By the time this plugin runs, Vite has already applied the "@/"
      // alias, so `source` is usually an absolute path. Relative specifiers
      // are still possible for imports that come from inside src/assets.
      let abs: string;
      if (path.isAbsolute(bare)) {
        abs = bare;
      } else if (source.startsWith(".")) {
        if (!importer) return null;
        abs = path.resolve(path.dirname(importer.split("?")[0]), bare);
      } else {
        return null;
      }

      const cdn = byAbsPath.get(normalize(abs));
      if (!cdn) return null;

      // A virtual module exporting the CDN URL as the default export, which
      // is exactly what Vite's own asset pipeline produces for
      // `import img from "./x.png"`.
      return `\0cdn-image:${normalize(abs)}`;
    },
    load(id) {
      if (!id.startsWith("\0cdn-image:")) return null;
      const cdn = byAbsPath.get(id.slice("\0cdn-image:".length));
      if (!cdn) return null;
      return `export default ${JSON.stringify(cdn)};`;
    },
  };
}

/** Windows-safe path key: forward slashes, lowercase drive letter. */
function normalize(p: string): string {
  return path.resolve(p).replace(/\\/g, "/").replace(/^([A-Z]):/, (m) => m.toLowerCase());
}

/**
 * Vendor splitting.
 *
 * Without this, Rollup folds every shared dependency back into the entry
 * chunk (measured before this change: 945 kB raw / 288 kB gzip in one file).
 * Splitting the stable, rarely-changing vendor libs into their own
 * long-lived chunks means a content change in app code does NOT invalidate
 * the vendor bytes, so returning visitors re-download only the changed chunk.
 *
 * Groups are chosen by "changes independently of app code", not by size:
 *   - react*  : core runtime, changes on a React upgrade only
 *   - router  : react-router-dom
 *   - query   : @tanstack/react-query (+persist)
 *   - supabase: @supabase/supabase-js
 *   - three   : three + @react-three/* (the GPU orb)
 *   - xstate  : xstate + @xstate/react
 *   - date    : date-fns
 *
 * IMPORTANT: recharts and react-markdown are deliberately NOT listed here.
 * Both are reachable only from lazy routes, and Rollup's default splitting
 * already keeps them off the critical path. Claiming them with manualChunks
 * made things WORSE: Rollup hoisted their shared helpers (clsx,
 * commonjsHelpers) into the manual chunk, which then forced the whole
 * 410 kB recharts bundle to become a static dependency of the entry.
 *
 * framer-motion and @radix-ui are also not claimed: both are used by
 * eagerly-loaded modules, so splitting them only moved the bytes around
 * without taking anything off the critical path.
 *
 * `three`, `xstate` and `date-fns` are safe to claim because their
 * dependencies do not overlap with anything on the entry's static path.
 */
function manualChunks(id: string) {
  if (!id.includes("node_modules")) return undefined;

  // Order matters: most specific first.
  if (/[\\/]node_modules[\\/](three|@react-three)[\\/]/.test(id)) return "vendor-three";
  if (/[\\/]node_modules[\\/]@tanstack[\\/]/.test(id)) return "vendor-query";
  if (/[\\/]node_modules[\\/]@supabase[\\/]/.test(id)) return "vendor-supabase";
  if (/[\\/]node_modules[\\/](xstate|@xstate)[\\/]/.test(id)) return "vendor-xstate";
  if (/[\\/]node_modules[\\/]date-fns[\\/]/.test(id)) return "vendor-date";
  if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-is|use-sync-external-store)[\\/]/.test(id)) return "vendor-react";
  if (/[\\/]node_modules[\\/]react-router(-dom)?[\\/]/.test(id)) return "vendor-router";

  return undefined;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === "production";
  // Escape hatch used by scripts/measure-bundle.mjs to A/B the effect of
  // manualChunks against Rollup's default splitting.
  const skipManualChunks = process.env.SKIP_MANUAL_CHUNKS === "1";

  return {
    server: {
      host: "::",
      port: 8081,
      strictPort: true,
      hmr: {
        overlay: false,
      },
      proxy: {
        "/functions/v1": {
          target: "https://vvnihmweqmbmytpggqcw.supabase.co",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/functions\/v1/, "/functions/v1"),
        },
      },
    },
    plugins: [
      react(),
      cdnImagePlugin(),
      emitVersionJsonPlugin(),
      // VitePWA({
      //   // The app already polls /version.json to detect a newer build, so
      //   // the service worker must not serve a stale shell on its own.
      //   // "autoUpdate" installs a new worker as soon as one is available and
      //   // the old one stops controlling the page immediately.
      //   registerType: "autoUpdate",
      //   injectRegister: "auto",
      //   // The manifest is hand-written at public/manifest.webmanifest (it
      //   // already exists and is referenced by the app shell), so the plugin
      //   // must not generate a competing one.
      //   manifest: false,
      //   workbox: {
      //     // Precache the app SHELL only, not every lazy route.
      //     //
      //     // The app has ~600 lazy route chunks totalling ~11 MB. Precaching
      //     // all of them would make the service worker install download 11 MB
      //     // on the first visit, which is worse than the problem it solves.
      //     // Instead we precache the shell (HTML, CSS, entry JS and the
      //     // vendor chunks it needs) and let route chunks be fetched and
      //     // cached on demand by the runtime rules below.
      //     globPatterns: ["index.html", "manifest.webmanifest", "favicon.ico", "favicon.png"],
      //     globIgnores: ["**/sw.js", "**/workbox-*.js", "**/registerSW.js"],
      //     // Every build output filename is content-hashed, so a changed
      //     // asset is a new file and the old one can be dropped.
      //     cleanupOutdatedCaches: true,
      //     clientsClaim: true,
      //     skipWaiting: true,
      //     navigateFallback: "/index.html",
      //     maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      //     runtimeCaching: [
      //       {
      //         // Hashed JS/CSS: cache-first is safe because a changed file
      //         // gets a new name, so the URL is a cache key that never goes
      //         // stale.
      //         urlPattern: /\/assets\/.*\.(?:js|css)$/i,
      //         handler: "StaleWhileRevalidate",
      //         options: {
      //           cacheName: "app-assets",
      //           expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
      //           cacheableResponse: { statuses: [0, 200] },
      //         },
      //       },
      //       {
      //         // Supabase media is immutable and served with a one-year
      //         // max-age, so the browser already keeps it. Caching it in the
      //         // service worker too makes repeat visits work offline.
      //         urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/(object|render)\/.*/i,
      //         handler: "CacheFirst",
      //         options: {
      //           cacheName: "supabase-media",
      //           expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
      //           cacheableResponse: { statuses: [0, 200] },
      //           rangeRequests: true,
      //         },
      //       },
      //       {
      //         urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      //         handler: "StaleWhileRevalidate",
      //         options: {
      //           cacheName: "google-fonts",
      //           expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
      //           cacheableResponse: { statuses: [0, 200] },
      //         },
      //       },
      //     ],
      //   },
      //   devOptions: {
      //     enabled: false,
      //   },
      // }),
    ].filter(Boolean),
    define: {
      __BUILD_ID__: JSON.stringify(BUILD_ID),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Pre-bundle radix + heavy deps to prevent the cold-load 502 race
    // where Vite re-optimizes deps mid-HMR and serves a broken chunk.
    optimizeDeps: {
      include: [
        "@radix-ui/react-dialog",
        "@radix-ui/react-dropdown-menu",
        "@radix-ui/react-popover",
        "@radix-ui/react-tooltip",
        "@radix-ui/react-tabs",
        "@radix-ui/react-select",
        "@radix-ui/react-toast",
        "@radix-ui/react-accordion",
        "@radix-ui/react-slot",
        "react",
        "react-dom",
        "react-router-dom",
        // @react-three/fiber's reconciler is CommonJS. Served raw, the browser
        // cannot read the named exports out of it, so the GPU orb never
        // mounts in dev. Pre-bundling it fixes the interop.
        "react-reconciler",
        "react-reconciler/constants",
      ],
      // three is huge; pre-bundling it in dev avoids a multi-second stall
      // the first time the orb route is opened. @react-three/fiber has to be
      // pre-bundled too, or its CJS reconciler is served raw.
      exclude: ["@react-three/drei"],
    },
    build: {
      // Real target, not the default "modules" (= esnext-ish). es2020 keeps
      // optional chaining / nullish coalescing native while staying safe for
      // every browser Capacitor's WebView runs on.
      target: "es2020",
      cssCodeSplit: true,
      // Inline assets under 4 kB instead of emitting a file + a request.
      assetsInlineLimit: 4096,
      // Measuring gzip for 600+ chunks dominates build time; sizes are
      // tracked separately by scripts/measure-bundle.mjs.
      reportCompressedSize: false,
      // We split vendors deliberately, so a large chunk is a signal to
      // investigate, not noise to silence.
      chunkSizeWarningLimit: 400,
      minify: "esbuild",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: skipManualChunks ? undefined : manualChunks,
          // Deterministic, cache-friendly names.
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]",
        },
      },
      esbuild: {
        drop: isProd ? ["debugger"] : [],
        legalComments: "none",
        target: "es2020",
      },
    },
  };
});
