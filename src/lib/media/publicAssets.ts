/**
 * publicAssetUrl — resolve a public/ path to its CDN URL.
 *
 * Files under public/ are referenced by literal path in source (e.g.
 * "/orb.mp4", "/stitch_consciousos_cinematic_experience/1.png/screen.png").
 * Those paths are resolved by the web server, so they cannot go through the
 * bundler like an import can.
 *
 * scripts/push-public-to-cdn.mjs uploads the large public/ files to the
 * Supabase `media` bucket and records the mapping in cdn-public.json. This
 * module turns a public path into the matching CDN URL so the asset is
 * served from the edge with immutable caching instead of the app origin.
 *
 * Images additionally go through the /render/image/ transform, which
 * converts them to WebP (the landing panels drop from ~1.3 MB to ~350 kB
 * with no change to their displayed size).
 *
 * Unknown paths are returned unchanged, so anything not uploaded keeps
 * working from the app origin.
 */
import cdnPublic from "./cdn-public.json";

interface PublicAssetEntry {
  storage_path: string;
  url: string;
  render_url: string;
  size: number;
}

const PUBLIC_ASSETS = (cdnPublic as { assets?: Record<string, PublicAssetEntry> }).assets ?? {};

/** Format-only WebP conversion. No resize, so displayed size is unchanged. */
const WEBP = "?format=webp&quality=85";

/** Only raster images can go through the transform endpoint. */
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg)$/i;

/**
 * Resolve a public/ path to a CDN URL.
 *
 * @param path public path, with or without a leading slash
 * @param opts.image request a WebP-transformed variant (ignored for non-images)
 */
export function publicAssetUrl(
  path: string,
  opts: { image?: boolean } = {}
): string {
  if (!path) return path;
  // Absolute URLs and data/blob URIs are already final.
  if (/^(https?:|data:|blob:)/i.test(path)) return path;

  const key = path.replace(/^\/+/, "").split("?")[0];
  const entry = PUBLIC_ASSETS[key];
  if (!entry) return path;

  // The transform endpoint only handles raster images. Everything else
  // (video, JSON, XML) uses the object URL as-is.
  const wantsImage = opts.image && IMAGE_EXT.test(key) && entry.render_url;
  return wantsImage ? `${entry.render_url}${WEBP}` : entry.url;
}

/** Resolve a public/ image path to a right-sized WebP on the CDN. */
export function publicImageUrl(path: string): string {
  return publicAssetUrl(path, { image: true });
}
