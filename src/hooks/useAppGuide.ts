/**
 * useAppGuide â€” the voice session behind the App Guide screen.
 *
 * Owns nothing visual. Given the orb, it produces: what to say, what is being
 * said, whether the mic is open, and a transcript of the exchange.
 *
 * Speech goes through the shared `tts-speak` path (Deepgram Aura â†’ ElevenLabs
 * â†’ browser) and listening goes through `stt-listen` (Deepgram Nova-3 â†’
 * browser). Both already degrade silently, so this hook only sequences them.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useGuruVoice } from "@/games/shell/useGuruVoice";
import {
  isDeepgramSttSupported,
  isSttSupported,
  listenOnce,
  type ListenEngine,
  type ListenHandle,
} from "@/lib/practice-bank/stt";
import {
  GUIDE_FALLBACK_SPOKEN,
  GUIDE_INTRO,
  GUIDE_INTRO_WELCOME,
  GUIDE_TOUR,
  GUIDE_TOUR_END_SPOKEN,
  GUIDE_WELCOME,
  getGuideTopic,
  matchTopic,
  parseCommand,
  rankTopics,
  type GuideTopic,
} from "@/lib/app-guide";

export type GuidePhase = "idle" | "speaking" | "listening" | "waiting";

export interface GuideTurn {
  id: number;
  role: "guide" | "you";
  text: string;
  topicId?: string;
  /** Set when the guide could not match the question. */
  unmatched?: boolean;
}

export interface UseAppGuideOptions {
  engine?: ListenEngine;
  /** Start the session with the greeting when the screen mounts. */
  autoGreet?: boolean;
}

const MUTE_BEAT_MS = 1100;

export function useAppGuide(options: UseAppGuideOptions = {}) {
  const { engine = "auto", autoGreet = true } = options;

  const { say, stop: stopVoice, speaking } = useGuruVoice();

  const [phase, setPhase] = useState<GuidePhase>("idle");
  const [line, setLine] = useState<string>("");
  const [history, setHistory] = useState<GuideTurn[]>([]);
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null);
  const [tourIndex, setTourIndex] = useState(-1);
  const [micHint, setMicHint] = useState<string | null>(null);
  const [introActive, setIntroActive] = useState(false);

  const micAvailable =
    isSttSupported() || isDeepgramSttSupported() ||
    (typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia));

  const [micEnabled, setMicEnabled] = useState<boolean>(() => micAvailable);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const runRef = useRef(0);
  const introTokenRef = useRef(0);
  const tourRef = useRef(-1);
  const topicRef = useRef<string | null>(null);
  const lastBeatsRef = useRef<string[]>([]);
  const listenRef = useRef<ListenHandle | null>(null);
  const engineRef = useRef<ListenEngine>(engine);
  const micEnabledRef = useRef(micEnabled);
  const ttsEnabledRef = useRef(ttsEnabled);
  const turnIdRef = useRef(0);
  const mountedRef = useRef(true);
  const handleUtteranceRef = useRef<(text: string) => Promise<void>>(async () => undefined);

  engineRef.current = engine;
  micEnabledRef.current = micEnabled;
  ttsEnabledRef.current = ttsEnabled;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      runRef.current += 1;
      listenRef.current?.cancel();
      listenRef.current = null;
      stopVoice();
    };
  }, [stopVoice]);

  const pushTurn = useCallback((turn: Omit<GuideTurn, "id">) => {
    turnIdRef.current += 1;
    const next: GuideTurn = { ...turn, id: turnIdRef.current };
    setHistory((prev) => [...prev.slice(-40), next]);
  }, []);

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, ms);
    });

  const speakBeats = useCallback(
    async (beats: string[], topicId?: string): Promise<boolean> => {
      const run = ++runRef.current;
      lastBeatsRef.current = beats;
      setPhase("speaking");

      for (const beat of beats) {
        if (runRef.current !== run) return false;
        setLine(beat);
        pushTurn({ role: "guide", text: beat, topicId });
        if (ttsEnabledRef.current) {
          await say(beat, "guru");
        } else {
          await wait(MUTE_BEAT_MS);
        }
      }

      if (runRef.current !== run) return false;
      setPhase("waiting");
      return true;
    },
    [pushTurn, say],
  );

  const stopAll = useCallback(() => {
    runRef.current += 1;
    introTokenRef.current += 1;
    setIntroActive(false);
    listenRef.current?.cancel();
    listenRef.current = null;
    stopVoice();
    setPhase("idle");
    setMicHint(null);
  }, [stopVoice]);

  const explain = useCallback(
    async (idOrTopic: string | GuideTopic, syncTour = true) => {
      const topic = typeof idOrTopic === "string" ? getGuideTopic(idOrTopic) : idOrTopic;
      if (!topic) return;

      topicRef.current = topic.id;
      setCurrentTopicId(topic.id);
      if (syncTour) {
        const index = GUIDE_TOUR.indexOf(topic.id);
        tourRef.current = index;
        setTourIndex(index);
      }

      await speakBeats(topic.spoken, topic.id);
    },
    [speakBeats],
  );

  const greet = useCallback(async () => {
    await speakBeats(GUIDE_WELCOME.spoken);
  }, [speakBeats]);

  useEffect(() => {
    if (!autoGreet) return;
    const timer = window.setTimeout(() => {
      void greet();
    }, 350);
    return () => window.clearTimeout(timer);
    // Greeting is intentionally once-per-mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const next = useCallback(async () => {
    introTokenRef.current += 1;
    setIntroActive(false);
    if (tourRef.current >= GUIDE_TOUR.length - 1) {
      await speakBeats([GUIDE_TOUR_END_SPOKEN]);
      return;
    }
    const index = tourRef.current + 1;
    tourRef.current = index;
    setTourIndex(index);
    await explain(GUIDE_TOUR[index], false);
  }, [explain, speakBeats]);

  const previous = useCallback(async () => {
    introTokenRef.current += 1;
    setIntroActive(false);
    const index = Math.max(tourRef.current - 1, 0);
    tourRef.current = index;
    setTourIndex(index);
    await explain(GUIDE_TOUR[index], false);
  }, [explain]);

  const repeat = useCallback(async () => {
    introTokenRef.current += 1;
    setIntroActive(false);
    const current = topicRef.current ? getGuideTopic(topicRef.current) : null;
    if (current) {
      await speakBeats(current.spoken, current.id);
      return;
    }
    if (lastBeatsRef.current.length) {
      await speakBeats(lastBeatsRef.current);
    }
  }, [speakBeats]);

  const listen = useCallback(async () => {
    if (!micEnabledRef.current) {
      setMicHint("Microphone is off. Type your question below instead.");
      return;
    }
    introTokenRef.current += 1;
    setIntroActive(false);
    runRef.current += 1;
    listenRef.current?.cancel();
    stopVoice();
    setPhase("listening");
    setMicHint(null);
    const handle = listenOnce({
      engine: engineRef.current,
      lang: "en-IN",
      timeoutMs: 12000,
    });
    listenRef.current = handle;
    const text = await handle.result;
    listenRef.current = null;
    if (!mountedRef.current) return;
    setPhase("idle");
    if (!text) {
      setMicHint("I did not catch that. Tap the mic and try again, or type it.");
      return;
    }
    await handleUtteranceRef.current(text);
  }, []);

  const handleUtterance = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text) return;

      pushTurn({ role: "you", text });

      const command = parseCommand(text);
      if (command === "stop") {
        stopAll();
        return;
      }
      if (command === "next") {
        await next();
        return;
      }
      if (command === "previous") {
        await previous();
        return;
      }
      if (command === "repeat") {
        await repeat();
        return;
      }
      if (command === "tour") {
        tourRef.current = -1;
        setTourIndex(-1);
        await next();
        return;
      }

      const match = matchTopic(text);
      if (match?.confident) {
        await explain(match.topic, true);
        return;
      }

      const ranked = rankTopics(text, undefined, 3).filter((entry) => entry.score > 0);
      if (ranked.length) {
        const suggestion = ranked[0].topic;
        await speakBeats(
          [
            GUIDE_FALLBACK_SPOKEN,
            `The closest I have is ${suggestion.title}. ${suggestion.summary}`,
            `I can go deeper on ${suggestion.title} if you ask again.`,
          ],
          suggestion.id,
        );
        topicRef.current = suggestion.id;
        setCurrentTopicId(suggestion.id);
        pushTurn({ role: "guide", text: `Closest match: ${suggestion.title}`, unmatched: true });
        return;
      }

      await speakBeats([GUIDE_FALLBACK_SPOKEN]);
    },
    [explain, next, previous, pushTurn, repeat, speakBeats, stopAll],
  );

  handleUtteranceRef.current = handleUtterance;

  const startTour = useCallback(async () => {
    introTokenRef.current += 1;
    setIntroActive(false);
    tourRef.current = -1;
    setTourIndex(-1);
    await next();
  }, [next]);

  const startIntro = useCallback(async () => {
    const token = ++introTokenRef.current;
    setIntroActive(true);
    tourRef.current = -1;
    setTourIndex(-1);
    await speakBeats(GUIDE_INTRO_WELCOME.spoken);
    for (const id of GUIDE_INTRO) {
      if (introTokenRef.current !== token || !mountedRef.current) return;
      await explain(id, false);
    }
    if (introTokenRef.current === token) setIntroActive(false);
  }, [explain, speakBeats]);

  const openTopic = useCallback(
    async (id: string) => {
      introTokenRef.current += 1;
      setIntroActive(false);
      await explain(id, true);
    },
    [explain],
  );

  const toggleMic = useCallback(() => setMicEnabled((value) => !value), []);
  const toggleTts = useCallback(() => setTtsEnabled((value) => !value), []);

  useEffect(() => {
    if (ttsEnabled) return;
    // Turning voice off mid-beat should also stop the audio.
    stopVoice();
    runRef.current += 1;
    setPhase("idle");
  }, [ttsEnabled, stopVoice]);

  return {
    phase,
    line,
    history,
    currentTopicId,
    currentTopic: currentTopicId ? getGuideTopic(currentTopicId) ?? null : null,
    tourIndex,
    tourLength: GUIDE_TOUR.length,
    introActive,
    speaking,
    micAvailable,
    micEnabled,
    ttsEnabled,
    micHint,
    explain: openTopic,
    greet,
    startTour,
    startIntro,
    next,
    previous,
    repeat,
    listen,
    stop: stopAll,
    handleUtterance,
    toggleMic,
    toggleTts,
  };
}

