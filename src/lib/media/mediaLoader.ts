import { useState, useEffect } from 'react';
import { publicAssetUrl } from './publicAssets';

// Media is served from our own Supabase Storage bucket. The pointers in
// src/assets/**/*.asset.json carry absolute public URLs, so this fallback
// base is only used for key-based lookups that miss the manifest.
const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL
  || 'https://vvnihmweqmbmytpggqcw.supabase.co/storage/v1/object/public/media';

let manifest: MediaManifest | null = null;

export interface MediaAsset {
  local: string;
  source: 'src/assets' | 'content';
  remote: string;
  url: string;
  size: number;
  type: string;
}

export interface MediaManifest {
  uploaded_at: string;
  project_id: string;
  bucket: string;
  base_url: string;
  total_files: number;
  total_size_mb: string;
  files: MediaAsset[];
  failed: { file: string; error: string }[];
}

async function loadManifest(): Promise<MediaManifest> {
  if (manifest) return manifest;

  try {
    // The manifest is served from the CDN (scripts/push-public-to-cdn.mjs).
    const response = await fetch(publicAssetUrl('/asset-manifest.json'), { cache: 'force-cache' });
    if (response.ok) {
      manifest = await response.json();
      return manifest;
    }
  } catch {}

  return { uploaded_at: '', project_id: '', bucket: '', base_url: '', total_files: 0, total_size_mb: '0', files: [], failed: [] };
}

function findAsset(key: string): MediaAsset | undefined {
  if (!manifest) return undefined;

  const normalizedKey = key.replace(/^\/+/, '').replace(/^src\/assets\//, '').replace(/^content\//, '');

  return manifest.files.find(f =>
    f.local === normalizedKey ||
    f.remote === `src/assets/${normalizedKey}` ||
    f.remote === `content/${normalizedKey}` ||
    f.remote === normalizedKey ||
    f.url.endsWith(`/${normalizedKey}`)
  );
}

export function getMediaUrl(key: string): string {
  const asset = findAsset(key);
  if (asset) return asset.url;

  const cleanKey = key.replace(/^\/+/, '');
  return `${MEDIA_BASE_URL}/${cleanKey}`;
}

/**
 * Resize/format an image through Supabase's Image Transformation service.
 *
 * IMPORTANT: transforms only apply on the /render/image/ route. Appending
 * ?width= to the /object/public/ route returns the ORIGINAL bytes and
 * silently drops the parameters — a 61 kB JPEG stays 61 kB instead of
 * becoming a 10 kB WebP.
 *
 * The render route mirrors the object route's path, so we swap the
 * /object/public/ segment for /render/image/public/ and keep the bucket +
 * object path intact.
 */
export function getImageUrl(key: string, options: { width?: number; height?: number; quality?: number; format?: 'webp' | 'avif' | 'auto' } = {}): string {
  const baseUrl = getMediaUrl(key);
  const params = new URLSearchParams();
  if (options.width) params.set('width', String(options.width));
  if (options.height) params.set('height', String(options.height));
  if (options.quality) params.set('quality', String(options.quality));
  if (options.format && options.format !== 'auto') params.set('format', options.format);
  const query = params.toString();
  if (!query) return baseUrl;
  return `${toRenderUrl(baseUrl)}?${query}`;
}

/** Swap an /object/public/ URL onto the /render/image/ transform route. */
function toRenderUrl(url: string): string {
  return url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
}

export function getVideoUrl(key: string): string {
  return getMediaUrl(key);
}

export function getAudioUrl(key: string): string {
  return getMediaUrl(key);
}

export async function preloadImage(key: string, options: { width?: number; height?: number } = {}): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${key}`));
    img.src = getImageUrl(key, options);
  });
}

export async function preloadVideo(key: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => resolve(video);
    video.onerror = () => reject(new Error(`Failed to load video: ${key}`));
    video.src = getVideoUrl(key);
  });
}

export function createLazyImageProps(key: string, options: { width?: number; height?: number; quality?: number; placeholder?: string } = {}) {
  return {
    src: getImageUrl(key, { width: options.width, height: options.height, quality: options.quality, format: 'webp' }),
    loading: 'lazy' as const,
    decoding: 'async' as const,
    placeholder: options.placeholder,
  };
}

export function createLazyVideoProps(key: string, options: { poster?: string; preload?: 'none' | 'metadata' | 'auto' } = {}) {
  return {
    src: getVideoUrl(key),
    preload: options.preload || 'none',
    poster: options.poster ? getImageUrl(options.poster) : undefined,
  };
}

export function useMediaPreloader(keys: string[], type: 'image' | 'video' = 'image') {
  const [loaded, setLoaded] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, Error>>({});

  useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      for (const key of keys) {
        if (cancelled) break;
        try {
          if (type === 'image') await preloadImage(key);
          else await preloadVideo(key);
          if (!cancelled) setLoaded(prev => new Set([...prev, key]));
        } catch (err) {
          if (!cancelled) setErrors(prev => ({ ...prev, [key]: err as Error }));
        }
      }
    };
    loadAll();
    return () => { cancelled = true; };
  }, [keys.join(','), type]);

  return { loaded, errors, isReady: keys.every(k => loaded.has(k)) };
}

