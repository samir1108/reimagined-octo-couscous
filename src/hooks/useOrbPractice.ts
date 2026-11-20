import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStepNarration } from "@/hooks/useStepNarration";
import { activeBeatAt, type OrbPractice } from "@/lib/practice-bank/script";
import { listenOnce, type ListenEngine, type ListenHandle } from "@/lib/practice-bank/stt";

export type OrbPracticeStatus = "idle" | "running" | "paused" | "complete";

export interface OrbTranscript {
  beatId: string;
  atSec: number;
  text: string;
}

interface Options {
  ttsEnabled?: boolean;
  sttEnabled?: boolean;
  /** "deepgram" posts the utterance to the edge function; "browser" stays local. */
  sttEngine?: ListenEngine;
  onComplete?: (practice: OrbPractice) => void;
}

/**
 * Runtime for an orb practice.
 *
 * Owns only time, voice and listening. The orb visual reads `progress`,
 * `breathSeconds` and the current `beat`; the screen reads `transcripts`.
 * Pausing is automatic when the tab is hidden so a 6-hour sitting does not
 * silently accumulate time while nobody is sitting.
 */
export function useOrbPractice(practice: OrbPractice | null, options: Options = {}) {
  const { ttsEnabled = true, sttEnabled = true, sttEngine = "auto", onComplete } = options;
  const [status, setStatus] = useState<OrbPracticeStatus>("idle");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [listening, setListening] = useState(false);
  const [transcripts, setTranscripts] = useState<OrbTranscript[]>([]);

  const statusRef = useRef<OrbPracticeStatus>("idle");
  statusRef.current = status;
  const completedRef = useRef(false);
  const baseElapsedRef = useRef(0);
  const segmentStartRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const durationSec = practice?.durationSec ?? 0;

  const reset = useCallback(() => {
    baseElapsedRef.current = 0;
    segmentStartRef.current = 0;
    completedRef.current = false;
    setElapsedSec(0);
    setStatus("idle");
    setTranscripts([]);
    setListening(false);
  }, []);

  // A new practice is a new sitting.
  useEffect(() => {
    reset();
  }, [practice?.id, reset]);

  const finish = useCallback(() => {
    if (!practice || completedRef.current) return;
    completedRef.current = true;
    baseElapsedRef.current = practice.durationSec;
    setElapsedSec(practice.durationSec);
    setStatus("complete");
    onCompleteRef.current?.(practice);
  }, [practice]);

  const start = useCallback(() => {
    if (!practice) return;
    completedRef.current = false;
    if (statusRef.current === "complete" || statusRef.current === "idle") {
      baseElapsedRef.current = 0;
      setElapsedSec(0);
      setTranscripts([]);
    }
    segmentStartRef.current = performance.now();
    setStatus("running");
  }, [practice]);

  const pause = useCallback(() => {
    if (statusRef.current !== "running") return;
    baseElapsedRef.current += (performance.now() - segmentStartRef.current) / 1000;
    setElapsedSec(Math.min(durationSec, baseElapsedRef.current));
    setStatus("paused");
  }, [durationSec]);

  const resume = start;

  const stop = useCallback(() => {
    finish();
  }, [finish]);

  useEffect(() => {
    if (status !== "running" || !practice) return;
    segmentStartRef.current = performance.now();
    const tick = () => {
      const elapsed = baseElapsedRef.current + (performance.now() - segmentStartRef.current) / 1000;
      if (elapsed >= practice.durationSec) {
        finish();
        return;
      }
      setElapsedSec(elapsed);
    };
    tick();
    const timer = window.setInterval(tick, 500);
    return () => window.clearInterval(timer);
  }, [status, practice, finish]);

  // Leaving the tab pauses the sitting (audio latency would otherwise lie).
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && statusRef.current === "running") pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [pause]);

  const beat = useMemo(
    () => (practice ? activeBeatAt(practice, elapsedSec) : null),
    [practice, elapsedSec],
  );

  useStepNarration({
    text: status === "running" && ttsEnabled ? beat?.speak ?? null : null,
    voiceKey: practice?.spec.voiceId,
    enabled: status === "running" && ttsEnabled,
  });

  const handleRef = useRef<ListenHandle | null>(null);
  const capturedBeatRef = useRef<string | null>(null);

  const beginListen = useCallback(() => {
    if (!beat?.listenPrompt) return;
    if (capturedBeatRef.current === beat.id) return;
    handleRef.current?.cancel();
    capturedBeatRef.current = beat.id;
    const atSec = Math.round(elapsedSec);
    const handle = listenOnce({
      engine: sttEngine,
      timeoutMs: Math.min(60000, Math.max(8000, beat.seconds * 1000)),
    });
    handleRef.current = handle;
    setListening(true);
    handle.result
      .then((text) => {
        if (text) {
          setTranscripts((previous) => [...previous, { beatId: beat.id, atSec, text }]);
        }
      })
      .finally(() => {
        if (handleRef.current === handle) {
          handleRef.current = null;
          setListening(false);
        }
      });
  }, [beat?.id, beat?.seconds, beat?.listenPrompt, elapsedSec, sttEngine]);

  // Best-effort auto-listening on a voice beat. Browsers may require a gesture;
  // the screen also exposes `listenNow` for that case.
  useEffect(() => {
    if (status !== "running" || !sttEnabled || !practice?.listens) return;
    if (!beat?.listenPrompt) return;
    if (capturedBeatRef.current === beat.id) return;
    beginListen();
  }, [status, sttEnabled, practice?.listens, beat?.id, beat?.listenPrompt, beginListen]);

  useEffect(() => {
    if (status === "running") return;
    handleRef.current?.cancel();
    handleRef.current = null;
    setListening(false);
  }, [status]);

  useEffect(
    () => () => {
      handleRef.current?.cancel();
      handleRef.current = null;
    },
    [],
  );

  const progress = practice ? Math.min(1, Math.max(0, elapsedSec / practice.durationSec)) : 0;
  const remainingSec = Math.max(0, Math.round((practice?.durationSec ?? 0) - elapsedSec));

  return {
    status,
    elapsedSec,
    remainingSec,
    progress,
    beat,
    beatIndex: beat && practice ? practice.beats.findIndex((entry) => entry.id === beat.id) : -1,
    transcripts,
    listening,
    breathSeconds: practice?.breathSeconds ?? 10,
    start,
    pause,
    resume,
    stop,
    reset,
    listenNow: beginListen,
  };
}

export default useOrbPractice;
