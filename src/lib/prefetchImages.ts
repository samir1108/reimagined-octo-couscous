/**
 * Image prefetching utility.
 * Warms the browser cache for cinematic / guide imagery so transitions feel instant.
 *
 * Usage:
 *   import { prefetchCinematicImages, prefetchGuideImages } from "@/lib/prefetchImages";
 *   useEffect(() => { prefetchCinematicImages(); }, []);
 */
import cosmicNebula from "@/assets/cosmic-nebula.jpg";
import cosmicEye from "@/assets/cosmic-eye.jpg";
import cosmicTree from "@/assets/cosmic-tree.jpg";
import cosmicMirror from "@/assets/cosmic-mirror.jpg";
import cosmicSunrise from "@/assets/cosmic-sunrise.jpg";

const loaded = new Set<string>();

function prefetch(urls: string[]) {
  if (typeof window === "undefined") return;
  for (const url of urls) {
    if (!url || loaded.has(url)) continue;
    loaded.add(url);
    // Use Image() so the browser caches the decoded asset
    const img = new Image();
    img.decoding = "async";
    (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = "low";
    img.src = url;
  }
}

/** Cinematic prologue + auth/landing cosmic backdrops. */
export function prefetchCinematicImages() {
  prefetch([cosmicNebula, cosmicEye, cosmicTree, cosmicMirror, cosmicSunrise]);
}

/** Guide overlay imagery — call when Guide is about to open. */
export function prefetchGuideImages() {
  // Reuse the cosmic palette for now; extend with guide-specific assets as added.
  prefetch([cosmicNebula, cosmicMirror, cosmicSunrise]);
}

/** Generic helper for ad-hoc lists of urls. */
export function prefetchImages(urls: string[]) {
  prefetch(urls);
}
