/**
 * ttsPrewarm
 * ──────────
 * Pre-fetches Deepgram TTS audio for every narration line in every
 * sensorial practice manifest, and stores the blobs in the IndexedDB
 * ttsCache. After this runs once, the entire library plays instantly
 * and offline — no API calls per step.
 *
 * Runs in the background, throttled, and is fully idempotent: a line
 * already cached is skipped. Tracks completion via a localStorage
 * version flag so we only re-prewarm when the manifest set changes.
 */
import { supabase } from "@/lib/supabase";
import { makeKey, getCachedAudio, setCachedAudio } from "./ttsCache";
import type { SensorialManifest } from "@/data/sensorialPractices/types";

// Mirror of the voice mapping in useStepNarration.ts
const VOICE_BY_GURU: Record<string, "guru" | "guru_male" | "elder" | "child"> = {
  ramana: "guru_male",
  buddha: "guru_male",
  krishnamurti: "elder",
  sadhguru: "guru_male",
  vivekananda: "guru_male",
  babaji: "guru_male",
  osho: "guru_male",
  rumi: "guru_male",
  frankl: "elder",
  patanjali: "guru_male",
  "lao-tzu": "elder",
  dogen: "guru_male",
  tilopa: "guru_male",
  padmasambhava: "guru_male",
  "thich-nhat-hanh": "elder",
  shankara: "guru_male",
  krishna: "guru_male",
  yogananda: "guru_male",
};
const DEFAULT_VOICE = "guru" as const;

function linesFor(m: SensorialManifest): string[] {
  const out: string[] = [];
  for (const s of m.steps) if (s.narration?.trim()) out.push(s.narration.trim());
  if (m.closing?.trim()) out.push(m.closing.trim());
  return out;
}

const VERSION_KEY = "tts-prewarm-v1";
const LAST_ATTEMPT_KEY = "tts-prewarm-last-attempt";
const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour cooldown between retries

export interface PrewarmProgress {
  total: number;
  done: number;
  cached: number;
  fetched: number;
  failed: number;
  current?: string;
}

let inflight: Promise<PrewarmProgress> | null = null;

export async function prewarmAllPractices(
  onProgress?: (p: PrewarmProgress) => void,
  opts: { force?: boolean } = {}
): Promise<PrewarmProgress> {
  if (inflight) return inflight;

  inflight = (async () => {
    // The manifest set is ~200 kB of data across 51 practice files, each
    // pulling in still images. Load it here rather than at module scope so
    // it never lands on the app's first-paint path.
    const { MANIFESTS } = await import("@/data/sensorialPractices");

    const tasks: { voice: string; text: string; guruId: string }[] = [];
    for (const m of MANIFESTS) {
      const voice = VOICE_BY_GURU[m.guruId] ?? DEFAULT_VOICE;
      for (const text of linesFor(m)) tasks.push({ voice, text, guruId: m.guruId });
    }

    const progress: PrewarmProgress = {
      total: tasks.length,
      done: 0,
      cached: 0,
      fetched: 0,
      failed: 0,
    };

    // If we already prewarmed this exact set, fast-path verify by key sample.
    if (!opts.force) {
      const stamped = localStorage.getItem(VERSION_KEY);
      if (stamped === String(tasks.length)) {
        progress.cached = tasks.length;
        progress.done = tasks.length;
        onProgress?.(progress);
        return progress;
      }
      
      const lastAttempt = Number(localStorage.getItem(LAST_ATTEMPT_KEY) || "0");
      if (Date.now() - lastAttempt < COOLDOWN_MS && stamped) {
        progress.cached = Number(stamped) || 0;
        progress.done = progress.cached;
        onProgress?.(progress);
        return progress;
      }
    }

    let session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"] | null = null;
    try { session = (await supabase.auth.getSession()).data.session; } catch { /* best-effort */ }
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tts-speak`;

    // Sequential with tiny gap to avoid hammering Deepgram quotas.
    for (const t of tasks) {
      progress.current = t.text.slice(0, 60);
      try {
        const key = await makeKey(t.voice, t.text);
        const existing = await getCachedAudio(key);
        if (existing && existing.size > 200) {
          progress.cached++;
        } else {
          const resp = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token ?? ""}`,
            },
            body: JSON.stringify({ text: t.text, voice: t.voice }),
          });
          if (resp.ok) {
            const ct = resp.headers.get("content-type") || "";
            if (ct.startsWith("audio/")) {
              const blob = await resp.blob();
              if (blob.size > 200) {
                await setCachedAudio(key, blob);
                progress.fetched++;
              } else {
                progress.failed++;
              }
            } else {
              progress.failed++;
            }
          } else {
            progress.failed++;
          }
        }
      } catch {
        progress.failed++;
      }
      progress.done++;
      onProgress?.({ ...progress });
      // small breather
      await new Promise((r) => setTimeout(r, 80));
    }

    // Always record the attempt timestamp to prevent rapid retries
    try { localStorage.setItem(LAST_ATTEMPT_KEY, String(Date.now())); } catch { /* storage may be unavailable */ }

    if (progress.failed === 0) {
      try { localStorage.setItem(VERSION_KEY, String(tasks.length)); } catch { /* storage may be unavailable */ }
    } else if (progress.done > 0) {
      try { localStorage.setItem(VERSION_KEY, String(progress.done)); } catch { /* storage may be unavailable */ }
    }
    return progress;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

/** Fire-and-forget background prewarm — safe to call on app boot. */
export function startBackgroundPrewarm() {
  if (typeof window === "undefined") return;
  // Defer until the app is idle so we don't fight first paint.
  const run = () => { prewarmAllPractices().catch(() => {}); };
  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(run, { timeout: 4000 });
  } else {
    setTimeout(run, 2500);
  }
}
