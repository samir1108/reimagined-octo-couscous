/**
 * useStepNarration
 * ────────────────
 * Speaks a given text using ElevenLabs TTS (server-side). Falls back to
 * browser SpeechSynthesis silently. Designed for meditation contexts:
 * never throws, never blocks the UI, can be muted at any time.
 *
 * Resilience fixes (intermittent-audio bug):
 *  • AbortController cancels stale fetches when text/enabled changes fast
 *  • lastText is only marked "spoken" after audio actually starts (so a
 *    failed attempt can be retried by toggling enabled again)
 *  • audio.onerror falls back to browser TTS instead of failing silently
 *  • Browser TTS waits for `voiceschanged` if voices haven't loaded yet
 *  • A monotonic call token prevents an older slow response from playing
 *    on top of a newer one
 */
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { makeKey, getCachedAudio, setCachedAudio } from "@/lib/ttsCache";

// Deepgram-first TTS via the shared `tts-speak` edge function.
// Voice keys are mapped by master persona (male/female/elder/child).
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

function speakBrowser(text: string) {
  try {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const start = () => {
      try {
        synth.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 0.9;
        utter.pitch = 1.0;
        utter.volume = 0.85;
        synth.speak(utter);
      } catch { /* silent */ }
    };
    // Voices may not be loaded yet on first call (Chrome).
    if (synth.getVoices().length === 0) {
      const onVoices = () => {
        synth.removeEventListener("voiceschanged", onVoices);
        start();
      };
      synth.addEventListener("voiceschanged", onVoices);
      // Safety: try anyway after 250ms if event never fires
      setTimeout(start, 250);
    } else {
      start();
    }
  } catch { /* silent */ }
}

export function useStepNarration(opts: {
  text: string | null | undefined;
  guruId?: string;
  /** Explicit tts-speak voice key. Overrides the guru persona mapping. */
  voiceKey?: string;
  enabled: boolean;
}) {
  const { text, guruId, voiceKey, enabled } = opts;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objUrlRef = useRef<string | null>(null);
  const lastSpokenRef = useRef<string | null>(null);
  const callIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Stop everything when muted.
    if (!enabled) {
      if (audioRef.current) { try { audioRef.current.pause(); } catch {} ; audioRef.current = null; }
      if (objUrlRef.current) { try { URL.revokeObjectURL(objUrlRef.current); } catch {} ; objUrlRef.current = null; }
      if (abortRef.current) { try { abortRef.current.abort(); } catch {} ; abortRef.current = null; }
      try { window.speechSynthesis?.cancel(); } catch {}
      return;
    }
    if (!text) return;
    // Avoid re-speaking the exact same line we just successfully spoke.
    if (text === lastSpokenRef.current) return;

    // New request — invalidate any in-flight one.
    const myId = ++callIdRef.current;
    if (abortRef.current) { try { abortRef.current.abort(); } catch {} }
    const ac = new AbortController();
    abortRef.current = ac;

    const voice = voiceKey || (guruId && VOICE_BY_GURU[guruId]) || DEFAULT_VOICE;

    const fallback = () => {
      if (callIdRef.current !== myId) return;
      lastSpokenRef.current = text;
      speakBrowser(text);
    };

    (async () => {
      try {
        // 1) Try IndexedDB cache first — no API call if we already have it.
        const cacheKey = await makeKey(voice, text);
        let blob: Blob | null = await getCachedAudio(cacheKey);

        if (!blob) {
          // 2) Cache miss → fetch via shared `tts-speak` (Deepgram-first, ElevenLabs fallback).
          const { data: { session } } = await supabase.auth.getSession();
          const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tts-speak`;
          const resp = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token ?? ""}`,
            },
            body: JSON.stringify({ text, voice }),
            signal: ac.signal,
          });
          if (callIdRef.current !== myId) return;
          if (!resp.ok) { fallback(); return; }
          const ct = resp.headers.get("content-type") || "";
          if (!ct.startsWith("audio/")) { fallback(); return; }
          blob = await resp.blob();
          if (callIdRef.current !== myId) return;
          if (!blob || blob.size < 200) { fallback(); return; }
          // Persist for next time (fire-and-forget).
          setCachedAudio(cacheKey, blob);
        }

        // Tear down any previous audio
        if (audioRef.current) { try { audioRef.current.pause(); } catch {} }
        if (objUrlRef.current) { try { URL.revokeObjectURL(objUrlRef.current); } catch {} }

        const objUrl = URL.createObjectURL(blob);
        objUrlRef.current = objUrl;
        const audio = new Audio(objUrl);
        audio.volume = 0.9;
        audio.preload = "auto";
        audioRef.current = audio;

        audio.onplaying = () => { lastSpokenRef.current = text; };
        audio.onended = () => {
          if (objUrlRef.current === objUrl) {
            try { URL.revokeObjectURL(objUrl); } catch {}
            objUrlRef.current = null;
          }
        };
        audio.onerror = () => fallback();

        try {
          await audio.play();
        } catch {
          // autoplay blocked or decode error
          fallback();
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        fallback();
      }
    })();
  }, [text, guruId, voiceKey, enabled]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (abortRef.current) { try { abortRef.current.abort(); } catch {} }
    if (audioRef.current) { try { audioRef.current.pause(); } catch {} }
    if (objUrlRef.current) { try { URL.revokeObjectURL(objUrlRef.current); } catch {} }
    try { window.speechSynthesis?.cancel(); } catch {}
  }, []);
}
