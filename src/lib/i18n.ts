// Lightweight pre-built translation loader.
// Looks up source English strings against pre-translated JSON for the active language.
// Falls back gracefully (caller's chain handles dynamic + source).

type Dict = Record<string, string>; // English source -> translated value

const memCache = new Map<string, Dict>();          // lang -> dict
const loading = new Map<string, Promise<Dict>>();  // lang -> in-flight load

// Built English source map (key -> English value). Used to invert each lang JSON.
let sourceMap: Dict | null = null;

async function loadSource(): Promise<Dict> {
  if (sourceMap) return sourceMap;
  const mod = await import("@/locales/_source.en.json");
  sourceMap = (mod.default ?? mod) as Dict;
  return sourceMap;
}

async function loadLangFile(lang: string): Promise<Dict> {
  // Vite dynamic import. Files are code-split per language.
  // The import path is restricted to src/locales/{code}.json.
  const mod = await import(/* @vite-ignore */ `../locales/${lang}.json`);
  return (mod.default ?? mod) as Dict;
}

/** Eagerly start loading a language's static dict. Safe to call repeatedly. */
export function preloadLanguage(lang: string): Promise<Dict> {
  if (!lang || lang === "en") return Promise.resolve({});
  if (memCache.has(lang)) return Promise.resolve(memCache.get(lang)!);
  if (loading.has(lang)) return loading.get(lang)!;

  const p = (async () => {
    try {
      const [src, langDict] = await Promise.all([loadSource(), loadLangFile(lang)]);
      // Build inverted dict: English source value -> translated value.
      const inverted: Dict = {};
      for (const key in src) {
        const en = src[key];
        const tx = langDict[key];
        if (en && tx) inverted[en] = tx;
      }
      memCache.set(lang, inverted);
      return inverted;
    } catch {
      // Missing file or parse error → empty dict (chain falls through to dynamic).
      memCache.set(lang, {});
      return {};
    } finally {
      loading.delete(lang);
    }
  })();

  loading.set(lang, p);
  return p;
}

/** Synchronous lookup. Returns translation if cached, else undefined. */
export function getStatic(lang: string, source: string): string | undefined {
  if (!lang || lang === "en" || !source) return undefined;
  const dict = memCache.get(lang);
  if (!dict) return undefined;
  return dict[source];
}
