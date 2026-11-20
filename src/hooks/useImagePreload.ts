import { useEffect } from "react";

/**
 * Preload a list of image URLs into the browser cache.
 * - On mount: kicks off all `urls` so any future slide is instant.
 * - When `priorityIndex` changes: re-kicks the next 1–2 slides as
 *   `fetchpriority=high` so they're definitely ready before the user advances.
 *
 * Safe to call with empty/undefined arrays. No-op on the server.
 */
export function useImagePreload(
  urls: ReadonlyArray<string | undefined | null>,
  priorityIndex: number = 0,
) {
  // Bulk preload everything once (low priority).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const created: HTMLImageElement[] = [];
    for (const u of urls) {
      if (!u) continue;
      const img = new Image();
      // fetchPriority is supported in modern browsers
      (img as any).fetchPriority = "low";
      img.decoding = "async";
      img.src = u;
      created.push(img);
    }
    return () => {
      // Drop refs so GC can reclaim if needed.
      created.length = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls.join("|")]);

  // High-priority warm-up for the next 1–2 slides.
  useEffect(() => {
    if (typeof window === "undefined") return;
    for (let off = 1; off <= 2; off++) {
      const u = urls[priorityIndex + off];
      if (!u) continue;
      const img = new Image();
      // fetchPriority is supported in modern browsers
      (img as any).fetchPriority = "high";
      img.decoding = "async";
      img.src = u;
    }
  }, [priorityIndex, urls]);
}
