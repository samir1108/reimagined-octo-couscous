// AutoTranslateRoot: walks the DOM (including React portals under <body> —
// dialogs, sheets, dropdowns, sonner toasts) plus <head> (document title and
// social meta), batch-translates English text nodes and translatable
// attributes (placeholder, title, aria-label, alt, submit values, option
// labels, tooltips) to the active language, and re-runs on mutations (route
// changes, lazy lists, streamed content).
//
// Long-form content (essays, session copy, journal entries rendered as prose)
// is segmented at sentence/paragraph boundaries so a single text node of any
// length is translated completely instead of being skipped.
//
// Language coverage: static pre-built dictionaries are consulted first, then
// the per-language cache, then the translate-ui edge function. Failures are
// retried and never cached, so a transient network error cannot leave a string
// permanently English. When the user switches back to English, every rewritten
// node/attribute/title is restored.
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getCached, setCached, getInflight, setInflight } from "@/lib/translateCache";
import { getStatic } from "@/lib/i18n";
import { segmentText } from "@/lib/textSegments";
import {
  CANVAS_LABELS,
  CANVAS_LABEL_LIST,
  installCanvasTranslation,
  setCanvasLanguage,
} from "@/lib/canvasLabels";

interface Props { language: string }

/** Elements whose subtree must never be touched (code, styles, media, editors). */
const REJECT_TAGS = new Set([
  "SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "CANVAS", "TEMPLATE",
]);

/** Elements that render no translatable text children but can carry useful
 *  attributes (placeholder/title/aria-label), so only their text is skipped. */
const NO_TEXT_TAGS = new Set(["INPUT", "TEXTAREA", "VIDEO", "AUDIO", "KBD", "SAMP"]);

/** Attributes whose English values should be translated too. */
const TRANSLATABLE_ATTRS = [
  "placeholder",
  "title",
  "aria-label",
  "aria-description",
  "aria-placeholder",
  "aria-roledescription",
  "aria-valuetext",
  "alt",
  "data-tooltip",
  "data-tip",
] as const;

const MAX_LEN = 20000;

const NUMERIC_ONLY = /^[\s\d.,:%/+\-—–•·×~()$₹€£¥@#*|]+$/;
/** Loop/pattern codes such as VAL001, EGO007, CMP004 — never translated. */
const IDENTIFIER_ONLY = /^[A-Z][A-Z0-9_-]*\d[A-Z0-9_-]*$/;

/** Non-Latin scripts: text already written in the target script is skipped so
 *  localized AI output (guide replies, generated sessions) is never re-translated. */
const SCRIPT_TESTS: Record<string, RegExp> = {
  hi: /[\u0900-\u097F]/, mr: /[\u0900-\u097F]/, sa: /[\u0900-\u097F]/, ne: /[\u0900-\u097F]/,
  bn: /[\u0980-\u09FF]/, as: /[\u0980-\u09FF]/,
  pa: /[\u0A00-\u0A7F]/, gu: /[\u0A80-\u0AFF]/, or: /[\u0B00-\u0B7F]/,
  ta: /[\u0B80-\u0BFF]/, te: /[\u0C00-\u0C7F]/, kn: /[\u0C80-\u0CFF]/, ml: /[\u0D00-\u0D7F]/,
  si: /[\u0D80-\u0DFF]/, th: /[\u0E00-\u0E7F]/, lo: /[\u0E80-\u0EFF]/,
  my: /[\u1000-\u109F]/, km: /[\u1780-\u17FF]/, ka: /[\u10A0-\u10FF]/, hy: /[\u0530-\u058F]/,
  ar: /[\u0600-\u06FF]/, fa: /[\u0600-\u06FF]/, ur: /[\u0600-\u06FF]/,
  ps: /[\u0600-\u06FF]/, sd: /[\u0600-\u06FF]/, ug: /[\u0600-\u06FF]/,
  he: /[\u0590-\u05FF]/, yi: /[\u0590-\u05FF]/,
  el: /[\u0370-\u03FF]/, ru: /[\u0400-\u04FF]/, uk: /[\u0400-\u04FF]/,
  bg: /[\u0400-\u04FF]/, sr: /[\u0400-\u04FF]/, mk: /[\u0400-\u04FF]/,
  be: /[\u0400-\u04FF]/, kk: /[\u0400-\u04FF]/, ky: /[\u0400-\u04FF]/,
  tg: /[\u0400-\u04FF]/, tt: /[\u0400-\u04FF]/, mn: /[\u0400-\u04FF]/,
  zh: /[\u4E00-\u9FFF]/, "zh-TW": /[\u4E00-\u9FFF]/, ja: /[\u4E00-\u9FFF\u3040-\u30FF]/,
  ko: /[\uAC00-\uD7AF]/,
};

function tagOf(el: Element): string {
  return el.tagName.toUpperCase();
}

function isEditable(el: Element | null): boolean {
  if (!el) return false;
  return Boolean(el.closest('[contenteditable=""],[contenteditable="true"]'));
}

function inSkippedSubtree(el: Element | null): boolean {
  if (!el) return false;
  return Boolean(el.closest("[data-no-translate],[translate='no'],.notranslate"));
}

/** Every document we translate: the app shell plus same-origin embeds such as
 *  the orb (`/oversoul-orb.html`), which have their own DOM and head. */
function collectRoots(): Element[] {
  const roots: Element[] = [];
  if (document.body) roots.push(document.body);
  document.querySelectorAll("iframe").forEach((frame) => {
    try {
      const body = frame.contentDocument?.body;
      if (body && body !== document.body) roots.push(body);
    } catch {
      // Cross-origin embed — nothing we can (or should) do.
    }
  });
  return roots;
}

/** Hidden panels (inactive tabs, closed sheets) are translated when they open,
 *  which keeps the first pass focused on what the user can actually read. */
function isRendered(el: Element): boolean {
  const check = (el as Element & { checkVisibility?: (o?: Record<string, boolean>) => boolean })
    .checkVisibility;
  if (typeof check !== "function") return true;
  try {
    // Only display/visibility, never opacity: enter animations start at
    // opacity 0 and would otherwise leave the panel permanently untranslated.
    return check.call(el, { checkVisibilityCSS: true });
  } catch {
    return true;
  }
}

function shouldTranslate(text: string, language: string): boolean {
  const t = text.trim();
  if (!t || t.length > MAX_LEN) return false;
  if (NUMERIC_ONLY.test(t)) return false;
  if (IDENTIFIER_ONLY.test(t)) return false;
  // No latin letter at all → already a non-English script or punctuation.
  if (!/[A-Za-z]/.test(t)) return false;
  // Text already in the target script (localized AI content) is left alone.
  const script = SCRIPT_TESTS[language];
  if (script && script.test(t)) return false;
  return true;
}

/** Original English source for every node/attr we have rewritten (survives re-scans). */
const originalText = new WeakMap<Text, string>();
const translatedText = new WeakMap<Text, string>();
const originalAttr = new WeakMap<Element, Map<string, string>>();
const translatedAttr = new WeakMap<Element, Map<string, string>>();

let originalDocTitle: string | null = null;
let translatedDocTitle: { lang: string; value: string } | null = null;
let originalMetaDescription: string | null = null;
let translatedMetaDescription: { lang: string; value: string } | null = null;
const originalMetaTags = new WeakMap<Element, string>();
const translatedMetaTags = new WeakMap<Element, { lang: string; value: string }>();

/** Static dictionary first (instant), then the dynamic cache. */
function lookup(lang: string, source: string): string | undefined {
  return getStatic(lang, source) ?? getCached(lang, source);
}

function swapText(node: Text, translated: string, lang: string) {
  const original = node.nodeValue ?? "";
  const prefix = original.match(/^\s*/)?.[0] ?? "";
  const suffix = original.match(/\s*$/)?.[0] ?? "";
  node.nodeValue = prefix + translated.trim() + suffix;
  translatedText.set(node, node.nodeValue);
  node.parentElement?.setAttribute("data-tx-lang", lang);
}

/** Restores the English original if this node was rewritten for another language. */
function ensureEnglish(node: Text, lang: string): string {
  let value = node.nodeValue ?? "";
  const parent = node.parentElement;
  const marked = parent?.getAttribute("data-tx-lang");
  if (marked && marked !== lang) {
    const orig = originalText.get(node);
    if (orig !== undefined) {
      node.nodeValue = orig;
      value = orig;
    }
    parent?.removeAttribute("data-tx-lang");
  }
  // Remember the English source the first time we see it, even when the parent
  // is already marked for this language (React may have swapped the text node).
  if (originalText.get(node) === undefined && /[A-Za-z]/.test(value)) {
    originalText.set(node, value);
  }
  return value;
}

/** Attribute names to translate on a given element. */
function attrsFor(el: Element): string[] {
  const attrs: string[] = [...TRANSLATABLE_ATTRS];
  const tag = tagOf(el);
  if (tag === "INPUT") {
    const type = (el.getAttribute("type") || "").toLowerCase();
    if (type === "submit" || type === "button" || type === "reset") attrs.push("value");
  }
  if (tag === "OPTGROUP" || tag === "OPTION" || tag === "TRACK") attrs.push("label");
  if (tag === "META") attrs.push("content");
  return attrs;
}

interface TextTargets {
  nodes: Text[];
  needSet: Set<string>;
}

function collectTextTargets(root: Element, lang: string): TextTargets {
  const out: TextTargets = { nodes: [], needSet: new Set() };
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      const parent = (n as Text).parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = tagOf(parent);
      if (REJECT_TAGS.has(tag)) return NodeFilter.FILTER_REJECT;
      if (NO_TEXT_TAGS.has(tag)) return NodeFilter.FILTER_SKIP;
      if (inSkippedSubtree(parent) || isEditable(parent)) return NodeFilter.FILTER_REJECT;
      if (!isRendered(parent)) return NodeFilter.FILTER_REJECT;
      // Already rewritten for this language → skip unless React has reset it
      // back to English (common on re-render), in which case re-apply.
      if (parent.getAttribute("data-tx-lang") === lang) {
        const applied = translatedText.get(n as Text);
        if (applied !== undefined && (n.nodeValue ?? "") === applied) {
          return NodeFilter.FILTER_REJECT;
        }
      }
      if (!shouldTranslate(ensureEnglish(n as Text, lang), lang)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const node = n as Text;
    out.nodes.push(node);
    const trimmed = (node.nodeValue ?? "").trim();
    if (trimmed) out.needSet.add(trimmed);
  }
  return out;
}

interface AttrTargets {
  entries: Array<{ el: Element; attr: string; value: string }>;
  needSet: Set<string>;
}

function collectAttrTargets(root: Element, lang: string): AttrTargets {
  const out: AttrTargets = { entries: [], needSet: new Set() };
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (n) => {
      const el = n as Element;
      if (REJECT_TAGS.has(tagOf(el))) return NodeFilter.FILTER_REJECT;
      if (inSkippedSubtree(el) || isEditable(el)) return NodeFilter.FILTER_REJECT;
      if (!isRendered(el)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const el = n as Element;
    const marked = el.getAttribute("data-tx-lang");
    // Restore English originals if previously rewritten in another language.
    if (marked && marked !== lang) {
      const store = originalAttr.get(el);
      if (store) for (const [attr, orig] of store) el.setAttribute(attr, orig);
      el.removeAttribute("data-tx-lang");
    }
    const appliedStore = translatedAttr.get(el);
    for (const attr of attrsFor(el)) {
      const value = el.getAttribute(attr);
      if (!value) continue;
      // Already translated for this language and untouched → skip.
      if (marked === lang && appliedStore?.get(attr) === value) continue;
      if (!shouldTranslate(value, lang)) continue;
      const store = originalAttr.get(el) ?? new Map<string, string>();
      if (!store.has(attr)) store.set(attr, value);
      originalAttr.set(el, store);
      out.entries.push({ el, attr, value });
      out.needSet.add(value.trim());
    }
  }
  return out;
}

interface ExtraTarget {
  text: string;
  apply: (value: string) => void;
}

/** Document title + meta description/social tags, so landing pages translate fully. */
function collectExtraTargets(lang: string): ExtraTarget[] {
  const extras: ExtraTarget[] = [];

  try {
    const title = document.title;
    const alreadyCurrent = translatedDocTitle?.lang === lang && translatedDocTitle.value === title;
    if (!alreadyCurrent && shouldTranslate(title, lang)) {
      originalDocTitle = title;
      extras.push({
        text: title,
        apply: (value) => {
          document.title = value;
          translatedDocTitle = { lang, value };
        },
      });
    }
  } catch { /* ignore */ }

  try {
    const meta = document.querySelector('meta[name="description"]');
    const content = meta?.getAttribute("content") ?? "";
    const alreadyCurrent =
      translatedMetaDescription?.lang === lang && translatedMetaDescription.value === content;
    if (meta && !alreadyCurrent && shouldTranslate(content, lang)) {
      originalMetaDescription = content;
      extras.push({
        text: content,
        apply: (value) => {
          meta.setAttribute("content", value);
          translatedMetaDescription = { lang, value };
        },
      });
    }
  } catch { /* ignore */ }

  try {
    const tags = document.querySelectorAll(
      'meta[property="og:title"],meta[property="og:description"],meta[name="twitter:title"],meta[name="twitter:description"]',
    );
    tags.forEach((el) => {
      const value = el.getAttribute("content") ?? "";
      const current = translatedMetaTags.get(el);
      if (current?.lang === lang && current.value === value) return;
      if (!shouldTranslate(value, lang)) return;
      const source = originalMetaTags.get(el) ?? value;
      originalMetaTags.set(el, source);
      extras.push({
        text: value,
        apply: (tx) => {
          el.setAttribute("content", tx);
          translatedMetaTags.set(el, { lang, value: tx });
        },
      });
    });
  } catch { /* ignore */ }

  return extras;
}

function applyTextTranslations(nodes: Text[], lang: string, map: Map<string, string>) {
  for (const node of nodes) {
    const trimmed = (node.nodeValue ?? "").trim();
    if (!trimmed) continue;
    const cached = lookup(lang, trimmed) ?? map.get(trimmed);
    if (!cached || cached === trimmed) continue;
    swapText(node, cached, lang);
  }
}

function applyAttrTranslations(
  entries: AttrTargets["entries"],
  lang: string,
  map: Map<string, string>,
) {
  for (const { el, attr, value } of entries) {
    const trimmed = value.trim();
    const cached = lookup(lang, trimmed) ?? map.get(trimmed);
    if (!cached || cached === trimmed) continue;
    el.setAttribute(attr, cached);
    const store = translatedAttr.get(el) ?? new Map<string, string>();
    store.set(attr, cached);
    translatedAttr.set(el, store);
    el.setAttribute("data-tx-lang", lang);
  }
}

function applyExtraTranslations(extras: ExtraTarget[], lang: string, map: Map<string, string>) {
  for (const extra of extras) {
    const trimmed = extra.text.trim();
    const cached = lookup(lang, trimmed) ?? map.get(trimmed);
    if (!cached || cached === trimmed) continue;
    extra.apply(cached);
  }
}

/** Reverts every rewritten text node, attribute, title and meta tag to English. */
function restoreAll(roots: Element[]) {
  for (const root of roots) {
    try {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n: Node | null;
      while ((n = walker.nextNode())) {
        const node = n as Text;
        if (!node.parentElement?.getAttribute("data-tx-lang")) continue;
        const orig = originalText.get(node);
        if (orig !== undefined) node.nodeValue = orig;
      }
      root.querySelectorAll("[data-tx-lang]").forEach((el) => {
        const store = originalAttr.get(el);
        if (store) for (const [attr, orig] of store) el.setAttribute(attr, orig);
        el.removeAttribute("data-tx-lang");
      });
    } catch { /* ignore */ }
  }

  try {
    if (
      translatedDocTitle &&
      originalDocTitle !== null &&
      document.title === translatedDocTitle.value
    ) {
      document.title = originalDocTitle;
    }
    if (translatedMetaDescription && originalMetaDescription !== null) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta?.getAttribute("content") === translatedMetaDescription.value) {
        meta.setAttribute("content", originalMetaDescription);
      }
    }
    document
      .querySelectorAll(
        'meta[property="og:title"],meta[property="og:description"],meta[name="twitter:title"],meta[name="twitter:description"]',
      )
      .forEach((el) => {
        const orig = originalMetaTags.get(el);
        if (orig !== undefined) el.setAttribute("content", orig);
      });
  } catch { /* ignore */ }

  translatedDocTitle = null;
  translatedMetaDescription = null;
  originalDocTitle = null;
  originalMetaDescription = null;
}

/** Split strings into request batches bounded by count AND total chars, so
 *  long paragraphs can't overflow the model's response window. */
function chunkStrings(strings: string[], maxCount = 30, maxChars = 6000): string[][] {
  const chunks: string[][] = [];
  let cur: string[] = [];
  let chars = 0;
  for (const s of strings) {
    const len = s.length;
    if (cur.length && (cur.length >= maxCount || chars + len > maxChars)) {
      chunks.push(cur);
      cur = [];
      chars = 0;
    }
    cur.push(s);
    chars += len;
  }
  if (cur.length) chunks.push(cur);
  return chunks;
}

async function translateBatch(
  lang: string,
  uniqueStrings: string[],
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (!uniqueStrings.length) return out;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

    const resp = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-ui`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ targetLang: lang, strings: uniqueStrings }),
        signal: controller.signal,
      },
    );
    if (!resp.ok) throw new Error(`translate-ui ${resp.status}`);
    const j = await resp.json();
    const arr: string[] = Array.isArray(j?.translations) ? j.translations : [];
    const missing = Array.isArray(j?.missing) ? new Set(j.missing.map(Number)) : null;
    uniqueStrings.forEach((src, i) => {
      const tx = (arr[i] && String(arr[i]).trim()) || "";
      if (tx && tx !== src) {
        out.set(src, tx);
        setCached(lang, src, tx);
      } else if (missing && !missing.has(i)) {
        // Deliberate echo (brand name, ID, number): remember it as final so it
        // is not retried on every pass.
        out.set(src, src);
        setCached(lang, src, src);
      }
      // Otherwise it is a real failure: leave it uncached so a later pass retries.
    });
  } catch (e) {
    console.warn("translate-ui batch failed", e);
  } finally {
    clearTimeout(timer);
  }
  return out;
}

/** Retries missing items so transient failures never leave English behind. */
async function translateChunk(lang: string, strings: string[]): Promise<Map<string, string>> {
  const done = new Map<string, string>();
  let todo = strings;
  for (let attempt = 0; attempt < 4 && todo.length; attempt++) {
    if (attempt) {
      const backoff = 1000 * attempt + Math.floor(Math.random() * 400);
      await new Promise((r) => setTimeout(r, backoff));
    }
    const res = await translateBatch(lang, todo);
    res.forEach((v, k) => done.set(k, v));
    todo = todo.filter((s) => !done.has(s));
  }
  return done;
}

/** Resolve every needed source string, segmenting long-form text.
 *  `onProgress` is called with everything resolved so far so large pages can be
 *  translated progressively instead of waiting for the slowest batch. */
async function resolveStrings(
  lang: string,
  need: Set<string>,
  onProgress?: (resolved: Map<string, string>) => void,
): Promise<Map<string, string>> {
  const resolved = new Map<string, string>();
  const plans = new Map<string, string[]>();
  const requests = new Set<string>();

  /** Fold translated segments back into their full-length source strings. */
  const reassemble = () => {
    for (const [source, segments] of plans) {
      if (resolved.has(source)) continue;
      let complete = true;
      const joined = segments
        .map((seg) => {
          const key = seg.trim();
          if (!key) return seg;
          const tx = resolved.get(key) ?? lookup(lang, key);
          if (!tx) {
            complete = false;
            return seg;
          }
          const lead = seg.match(/^\s*/)?.[0] ?? "";
          const trail = seg.match(/\s*$/)?.[0] ?? "";
          return lead + tx + trail;
        })
        .join("");
      if (complete && joined !== source) {
        resolved.set(source, joined);
        setCached(lang, source, joined);
      }
    }
  };

  for (const source of need) {
    const cached = lookup(lang, source);
    if (cached) {
      resolved.set(source, cached);
      continue;
    }
    const segments = segmentText(source);
    plans.set(source, segments);
    for (const seg of segments) {
      const key = seg.trim();
      if (key && shouldTranslate(seg, lang)) requests.add(key);
    }
  }

  const waitOn: Promise<unknown>[] = [];
  const fresh: string[] = [];
  for (const s of requests) {
    if (lookup(lang, s)) continue;
    const inflightP = getInflight(lang, s);
    if (inflightP) {
      waitOn.push(inflightP);
    } else {
      fresh.push(s);
    }
  }

  if (fresh.length) {
    const chunks = chunkStrings(fresh);
    let cursor = 0;
    const worker = async () => {
      while (cursor < chunks.length) {
        const chunk = chunks[cursor++];
        const p = translateChunk(lang, chunk);
        chunk.forEach((src) => {
          setInflight(lang, src, p.then((m) => m.get(src) ?? src));
        });
        const result = await p;
        result.forEach((v, k) => resolved.set(k, v));
        reassemble();
        onProgress?.(resolved);
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(4, chunks.length) }, () => worker()),
    );
  }
  if (waitOn.length) await Promise.all(waitOn).catch(() => {});

  reassemble();
  return resolved;
}

export default function AutoTranslateRoot({ language }: Props) {
  useEffect(() => {
    const root = typeof document !== "undefined" ? document.body : null;
    if (!root) return;

    installCanvasTranslation();
    setCanvasLanguage(language || "en");

    // English: restore anything previously rewritten, then stop.
    if (!language || language === "en") {
      restoreAll(collectRoots());
      return;
    }

    let cancelled = false;
    let running = false;
    let pending = false;
    let scanScheduled = false;
    let idleRounds = 0;
    let lastUnresolved = Number.POSITIVE_INFINITY;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let observer: MutationObserver | null = null;
    let headObserver: MutationObserver | null = null;

    const scheduleScan = (fn: () => void) => {
      if (scanScheduled || cancelled) return;
      scanScheduled = true;
      const idle = (cb: () => void) =>
        (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
          .requestIdleCallback?.(cb, { timeout: 600 }) ?? setTimeout(cb, 200);
      idle(() => {
        scanScheduled = false;
        if (!cancelled) fn();
      });
    };

    const pause = () => {
      observer?.disconnect();
      headObserver?.disconnect();
    };
    const resume = () => {
      for (const r of collectRoots()) {
        observer?.observe(r, { childList: true, subtree: true, characterData: true });
      }
      if (document.head) {
        headObserver?.observe(document.head, { childList: true, subtree: true, characterData: true });
      }
    };

    const runScan = async () => {
      if (cancelled) return;
      if (running) {
        pending = true;
        return;
      }
      running = true;
      try {
        pause();
        const roots = collectRoots();
        const textTargets = roots.map((r) => collectTextTargets(r, language));
        const attrTargets = roots.map((r) => collectAttrTargets(r, language));
        const nodes = textTargets.flatMap((t) => t.nodes);
        const entries = attrTargets.flatMap((t) => t.entries);
        const extras = collectExtraTargets(language);
        resume();

        const need = new Set<string>([
          ...textTargets.flatMap((t) => [...t.needSet]),
          ...attrTargets.flatMap((t) => [...t.needSet]),
          ...extras.map((e) => e.text.trim()),
        ]);
        if (!need.size && !document.querySelector("canvas")) return;

        // First pass: apply already-cached translations immediately (no network).
        pause();
        applyTextTranslations(nodes, language, new Map());
        applyAttrTranslations(entries, language, new Map());
        applyExtraTranslations(extras, language, new Map());
        resume();

        // Then apply each batch as it arrives so a large page fills in
        // progressively rather than waiting for the slowest request.
        let lastApply = 0;
        const onProgress = (partial: Map<string, string>) => {
          if (cancelled || !partial.size) return;
          const now = Date.now();
          if (now - lastApply < 350) return;
          lastApply = now;
          pause();
          applyTextTranslations(nodes, language, partial);
          applyAttrTranslations(entries, language, partial);
          applyExtraTranslations(extras, language, partial);
          resume();
        };

        // Canvases paint fixed UI labels that never appear in the DOM. Warm
        // them in their own small request, in parallel with the DOM batch, so a
        // long batch can never starve or truncate them; the canvas' render loop
        // picks them up from cache.
        if (
          document.querySelector("canvas") &&
          CANVAS_LABEL_LIST.some((label) => !lookup(language, label))
        ) {
          void resolveStrings(language, new Set(CANVAS_LABEL_LIST)).catch(() => {});
        }

        const map = await resolveStrings(language, need, onProgress);
        if (cancelled) return;

        if (map.size) {
          pause();
          applyTextTranslations(nodes, language, map);
          applyAttrTranslations(entries, language, map);
          applyExtraTranslations(extras, language, map);
          resume();
        }

        // Anything still English was dropped by a failed/truncated batch.
        // Keep sweeping while progress is being made, and give up only after a
        // few rounds that resolve nothing new (brand names, numbers, failures).
        const unresolved = [...need].filter(
          (s) => !CANVAS_LABELS.has(s) && !lookup(language, s) && !map.has(s),
        );
        if (unresolved.length) {
          if (unresolved.length < lastUnresolved) idleRounds = 0;
          else idleRounds += 1;
          lastUnresolved = unresolved.length;
          if (idleRounds < 4) {
            if (retryTimer) clearTimeout(retryTimer);
            retryTimer = setTimeout(() => {
              if (!cancelled) scheduleScan(runScan);
            }, 2500);
          }
        } else {
          idleRounds = 0;
          lastUnresolved = Number.POSITIVE_INFINITY;
        }
      } finally {
        running = false;
        if (pending && !cancelled) {
          pending = false;
          scheduleScan(runScan);
        }
      }
    };

    const onMutation = () => scheduleScan(runScan);

    // Initial scan
    scheduleScan(runScan);

    // Watch the app shell (and any same-origin embed) for DOM changes
    // (childList for new subtrees, characterData for React re-renders/streamed
    // text) and the head for route-level title/meta updates.
    observer = new MutationObserver(onMutation);
    headObserver = new MutationObserver(onMutation);
    resume();
    if (document.head) {
      headObserver.observe(document.head, { childList: true, subtree: true, characterData: true });
    }

    // An embed that finishes loading after mount needs its own scan + observer.
    const onFrameLoad = (event: Event) => {
      const target = event.target as Element | null;
      if (target?.tagName?.toUpperCase() === "IFRAME") scheduleScan(runScan);
    };
    document.addEventListener("load", onFrameLoad, true);

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      document.removeEventListener("load", onFrameLoad, true);
      observer?.disconnect();
      headObserver?.disconnect();
      restoreAll(collectRoots());
    };
  }, [language]);

  return null;
}
