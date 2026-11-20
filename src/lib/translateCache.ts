// translateCache: per-language localStorage cache + in-flight dedup for UI translations.
const VERSION = "v1";

function hash32(s: string): string {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

const memCache = new Map<string, Map<string, string>>(); // lang -> (hash -> translation)
const inflight = new Map<string, Promise<string>>(); // lang|hash -> promise

function loadLang(lang: string): Map<string, string> {
  if (memCache.has(lang)) return memCache.get(lang)!;
  const map = new Map<string, string>();
  try {
    const raw = localStorage.getItem(`tx_${VERSION}_${lang}`);
    if (raw) {
      const obj = JSON.parse(raw) as Record<string, string>;
      for (const k in obj) map.set(k, obj[k]);
    }
  } catch { /* ignore */ }
  memCache.set(lang, map);
  return map;
}

function persistLang(lang: string) {
  const map = memCache.get(lang);
  if (!map) return;
  try {
    const obj: Record<string, string> = {};
    // Cap to ~5000 entries (LRU-ish: insertion order)
    let entries = Array.from(map.entries());
    if (entries.length > 5000) entries = entries.slice(-5000);
    for (const [k, v] of entries) obj[k] = v;
    localStorage.setItem(`tx_${VERSION}_${lang}`, JSON.stringify(obj));
  } catch { /* quota etc. */ }
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;
function schedulePersist(lang: string) {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => persistLang(lang), 800);
}

export function getCached(lang: string, source: string): string | undefined {
  const map = loadLang(lang);
  return map.get(hash32(source));
}

export function setCached(lang: string, source: string, translation: string) {
  const map = loadLang(lang);
  map.set(hash32(source), translation);
  schedulePersist(lang);
}

export function keyFor(lang: string, source: string): string {
  return `${lang}|${hash32(source)}`;
}

export function getInflight(lang: string, source: string): Promise<string> | undefined {
  return inflight.get(keyFor(lang, source));
}

export function setInflight(lang: string, source: string, p: Promise<string>) {
  const k = keyFor(lang, source);
  inflight.set(k, p);
  p.finally(() => inflight.delete(k));
}

export function clearLangCache(lang: string) {
  memCache.delete(lang);
  try { localStorage.removeItem(`tx_${VERSION}_${lang}`); } catch { /* */ }
}
