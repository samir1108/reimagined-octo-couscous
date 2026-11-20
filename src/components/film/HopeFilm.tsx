import { useEffect, useRef, useState, useCallback } from "react";
import { X, Volume2, VolumeX, Play } from "lucide-react";
import { supabase } from "@/lib/supabase";

import scene1 from "@/assets/film/scene1-eye-opening.mp4.asset.json";
import scene2 from "@/assets/film/scene2-scrolling.mp4.asset.json";
import scene2b from "@/assets/film/scene2b-crowd.mp4.asset.json";
import scene4 from "@/assets/film/scene4-sage.mp4.asset.json";
import scene5 from "@/assets/film/scene5-instrument.mp4.asset.json";
import scene7 from "@/assets/film/scene7-meditation.mp4.asset.json";

/**
 * THE ConsciousOS FILM
 * A 2-minute cinematic explainer. Story arc: "The Problem You Don't Know You Have."
 * Eight scenes, each with its own video, kinetic typography, and timing.
 * Silent-first (Apple-style) with optional browser voiceover.
 */

type Scene = {
  id: number;
  videoUrl: string;
  videoStart?: number; // seconds into the clip
  durationMs: number;
  caption: { primary: string; secondary?: string; tertiary?: string };
  layout: "centered" | "topLeft" | "bottomRight" | "split" | "fullCenter";
  voTextEN: string;
  // visual treatment
  vignette?: number; // 0..1 darken
  blur?: number; // px on video
  scaleStart?: number;
  scaleEnd?: number;
};

const SCENES: Scene[] = [
  {
    id: 1,
    videoUrl: scene1.url,
    durationMs: 11000,
    caption: {
      primary: "You woke up today",
      secondary: "with a thought.",
    },
    layout: "bottomRight",
    voTextEN: "You woke up today with a thought.",
    vignette: 0.55,
    scaleStart: 1.05,
    scaleEnd: 1.0,
  },
  {
    id: 2,
    videoUrl: scene2.url,
    durationMs: 9000,
    caption: {
      primary: "The same thought",
      secondary: "you had yesterday.",
      tertiary: "And the day before.",
    },
    layout: "topLeft",
    voTextEN: "The same thought you had yesterday. And the day before.",
    vignette: 0.6,
    scaleStart: 1.0,
    scaleEnd: 1.08,
  },
  {
    id: 3,
    videoUrl: scene2b.url,
    durationMs: 9000,
    caption: {
      primary: "And the year before.",
      secondary: "You called it…",
      tertiary: "you.",
    },
    layout: "centered",
    voTextEN: "And the year before. You called it you.",
    vignette: 0.5,
    scaleStart: 1.08,
    scaleEnd: 1.0,
  },
  {
    id: 4,
    videoUrl: scene2b.url,
    videoStart: 2,
    durationMs: 11000,
    caption: {
      primary: "60,000",
      secondary: "thoughts a day.",
      tertiary: "95% repeated.   80% against you.",
    },
    layout: "fullCenter",
    voTextEN:
      "Sixty thousand thoughts a day. Ninety-five percent repeated. Eighty percent — against you.",
    vignette: 0.7,
    blur: 6,
  },
  {
    id: 5,
    videoUrl: scene4.url,
    durationMs: 14000,
    caption: {
      primary: "For 5,000 years,",
      secondary: "mystics had a name for this.",
      tertiary: "संस्कार · saṁskāra",
    },
    layout: "split",
    voTextEN:
      "For five thousand years, mystics had a name for this. Saṁskāra. The grooves of the mind.",
    vignette: 0.45,
    scaleStart: 1.0,
    scaleEnd: 1.06,
  },
  {
    id: 6,
    videoUrl: scene5.url,
    durationMs: 12000,
    caption: {
      primary: "They couldn't measure it.",
      secondary: "Now — we can.",
    },
    layout: "centered",
    voTextEN: "They couldn't measure it. Now — we can.",
    vignette: 0.35,
    scaleStart: 0.98,
    scaleEnd: 1.05,
  },
  {
    id: 7,
    videoUrl: scene5.url,
    videoStart: 1,
    durationMs: 14000,
    caption: {
      primary: "ConsciousOS",
      secondary: "The Yogic Companion",
      tertiary: "60 masters · 400 loops · one mirror",
    },
    layout: "fullCenter",
    voTextEN:
      "ConsciousOS. The Yogic Companion. Sixty masters. Four hundred loops. One mirror — for the mind you've never seen.",
    vignette: 0.5,
  },
  {
    id: 8,
    videoUrl: scene7.url,
    durationMs: 14000,
      caption: {
        primary: "The instrument is ready.",
        secondary: "Are you?",
        tertiary: "— enter ConsciousOS",
      },
    layout: "bottomRight",
    voTextEN: "The instrument is ready. The question is — are you?",
    vignette: 0.4,
    scaleStart: 1.04,
    scaleEnd: 1.0,
  },
];

const TOTAL_MS = SCENES.reduce((acc, s) => acc + s.durationMs, 0);

interface HopeFilmProps {
  onClose: () => void;
  onComplete?: () => void;
}

export const HopeFilm = ({ onClose, onComplete }: HopeFilmProps) => {
  const [started, setStarted] = useState(false);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [elapsedInScene, setElapsedInScene] = useState(0);
  const [voiceOn, setVoiceOn] = useState(false);
  const [musicOn, setMusicOn] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicNodesRef = useRef<{ gain: GainNode; oscs: OscillatorNode[] } | null>(null);
  const startTimestampRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const spokenRef = useRef<Set<number>>(new Set());
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  /* --------------------------------- ambient music (web audio) --------------------------------- */
  const startMusic = useCallback(() => {
    if (musicNodesRef.current) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);

    // gentle fade in
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 4);

    // Layered drone — root, fifth, octave + a slow shimmer
    const freqs = [82.41, 123.47, 164.81, 246.94]; // E2, B2, E3, B3
    const oscs: OscillatorNode[] = [];

    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i % 2 === 0 ? "sine" : "triangle";
      o.frequency.value = f;
      const oGain = ctx.createGain();
      oGain.gain.value = i === 0 ? 0.6 : 0.18;

      // very slow detune LFO for living texture
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.02;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 1.5;
      lfo.connect(lfoGain).connect(o.detune);
      lfo.start();

      o.connect(oGain).connect(gain);
      o.start();
      oscs.push(o);
    });

    // soft high shimmer
    const shimmer = ctx.createOscillator();
    shimmer.type = "sine";
    shimmer.frequency.value = 987.77; // B5
    const sGain = ctx.createGain();
    sGain.gain.value = 0.0;
    const sLfo = ctx.createOscillator();
    sLfo.frequency.value = 0.08;
    const sLfoGain = ctx.createGain();
    sLfoGain.gain.value = 0.04;
    sLfo.connect(sLfoGain).connect(sGain.gain);
    sLfo.start();
    shimmer.connect(sGain).connect(gain);
    shimmer.start();
    oscs.push(shimmer);

    musicNodesRef.current = { gain, oscs };
  }, []);

  const stopMusic = useCallback(() => {
    const nodes = musicNodesRef.current;
    const ctx = audioCtxRef.current;
    if (!nodes || !ctx) return;
    try {
      nodes.gain.gain.cancelScheduledValues(ctx.currentTime);
      nodes.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      setTimeout(() => {
        nodes.oscs.forEach((o) => {
          try { o.stop(); } catch {/* */}
        });
        ctx.close().catch(() => {});
        musicNodesRef.current = null;
        audioCtxRef.current = null;
      }, 700);
    } catch {/* */}
  }, []);

  /* ----------------------------------- voiceover (browser TTS) ---------------------------------- */
  const speakBrowser = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => /female|samantha|victoria|karen|tessa|google uk english female|google us english/i.test(v.name)) ||
      voices.find((v) => /en[-_]?(US|GB|IN)/i.test(v.lang) && /female/i.test(v.name)) ||
      voices.find((v) => /en[-_]?(IN|GB)/i.test(v.lang)) ||
      voices.find((v) => /en/i.test(v.lang));
    if (preferred) utter.voice = preferred;
    utter.rate = 0.92;
    utter.pitch = 1.02;
    utter.volume = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }, []);

  const stopVoice = useCallback(() => {
    if (ttsAudioRef.current) {
      try {
        ttsAudioRef.current.pause();
        ttsAudioRef.current.src = "";
      } catch {/* */}
      ttsAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speakScene = useCallback(
    async (idx: number) => {
      if (!voiceOn) return;
      if (spokenRef.current.has(idx)) return;
      spokenRef.current.add(idx);
      const text = SCENES[idx].voTextEN;

      // Stop any in-flight voice
      stopVoice();

      try {
        // Primary: Deepgram via tts-speak edge function (returns audio/mpeg or {fallback:'browser'})
        const { data, error } = await supabase.functions.invoke("tts-speak", {
          body: { text, voice: "guru" },
        });
        if (error) throw error;

        // data is a Blob when binary, or an object when fallback signaled
        if (data instanceof Blob && data.type.startsWith("audio/")) {
          const url = URL.createObjectURL(data);
          const audio = new Audio(url);
          audio.volume = 0.95;
          ttsAudioRef.current = audio;
          audio.onended = () => URL.revokeObjectURL(url);
          await audio.play();
          return;
        }
        // Fallback signaled by edge function
        speakBrowser(text);
      } catch (e) {
        console.warn("[HopeFilm] Deepgram TTS failed, falling back to browser:", e);
        speakBrowser(text);
      }
    },
    [voiceOn, speakBrowser, stopVoice],
  );

  /* --------------------------------------- main playback loop ---------------------------------- */
  useEffect(() => {
    if (!started) return;

    startTimestampRef.current = performance.now();
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const total = performance.now() - startTimestampRef.current;
      // find scene
      let acc = 0;
      let idx = 0;
      for (let i = 0; i < SCENES.length; i++) {
        if (total < acc + SCENES[i].durationMs) {
          idx = i;
          break;
        }
        acc += SCENES[i].durationMs;
        idx = i + 1;
      }
      if (idx >= SCENES.length) {
        // film complete
        setSceneIdx(SCENES.length - 1);
        setElapsedInScene(SCENES[SCENES.length - 1].durationMs);
        stopMusic();
        stopVoice();
        onComplete?.();
        return;
      }
      const within = total - acc;
      setSceneIdx(idx);
      setElapsedInScene(within);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [started, onComplete, stopMusic, stopVoice]);

  /* ---------------- per-scene side effects: load video, speak, etc. -------------- */
  useEffect(() => {
    if (!started) return;
    const scene = SCENES[sceneIdx];
    if (!scene) return;

    // (re)load video for this scene
    const v = videoRef.current;
    if (v) {
      v.src = scene.videoUrl;
      v.currentTime = scene.videoStart ?? 0;
      v.play().catch(() => {/* autoplay restriction handled by start gate */});
    }

    // speak this scene
    if (voiceOn) speakScene(sceneIdx);
  }, [sceneIdx, started, voiceOn, speakScene]);

  /* -------------------------------------- start the show --------------------------------------- */
  const begin = () => {
    setStarted(true);
    if (musicOn) startMusic();
    // ensure voices are loaded for TTS (some browsers lazy-load)
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  };

  /* ----------------------------------------- close --------------------------------------------- */
  const handleClose = () => {
    stopMusic();
    stopVoice();
    onClose();
  };

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // unmount cleanup
  useEffect(() => {
    return () => {
      stopMusic();
      stopVoice();
    };
  }, [stopMusic, stopVoice]);

  /* --------------------------------------- render -------------------------------------- */
  const scene = SCENES[sceneIdx];
  // progress 0..1 within this scene for animation choreography
  const sp = Math.min(1, elapsedInScene / scene.durationMs);
  // overall timeline progress
  const totalElapsed = SCENES.slice(0, sceneIdx).reduce((a, s) => a + s.durationMs, 0) + elapsedInScene;
  const overallPct = Math.min(100, (totalElapsed / TOTAL_MS) * 100);

  // entrance/exit fade for the scene caption block
  const captionOpacity =
    sp < 0.08 ? sp / 0.08 : sp > 0.92 ? (1 - sp) / 0.08 : 1;

  // subtle ken-burns on the video
  const scaleStart = scene.scaleStart ?? 1.0;
  const scaleEnd = scene.scaleEnd ?? 1.04;
  const videoScale = scaleStart + (scaleEnd - scaleStart) * sp;

  return (
    <div
      role="dialog"
      aria-label="The ConsciousOS Film"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
    >
      {/* Start overlay */}
      {!started && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-black px-6 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-[hsl(38_55%_70%)]">
            A two-minute film
          </div>
          <h2 className="max-w-3xl font-serif text-4xl font-extralight leading-tight text-[hsl(38_88%_92%)] md:text-6xl">
            The mind you've never seen.
          </h2>
          <p className="max-w-md text-sm font-light text-[hsl(38_30%_75%)] md:text-base">
            Headphones recommended. Press play when you're ready.
          </p>
          <button
            onClick={begin}
            className="group mt-4 inline-flex items-center gap-3 rounded-full border border-[hsl(38_85%_60%/0.55)] bg-[hsl(38_85%_55%/0.10)] px-10 py-5 text-[12px] uppercase tracking-[0.32em] text-[hsl(38_90%_90%)] backdrop-blur-sm transition-all duration-500 hover:border-[hsl(38_90%_75%)] hover:bg-[hsl(38_85%_55%/0.18)] hover:shadow-[0_0_80px_hsl(38_90%_55%/0.45)]"
          >
            <Play className="h-4 w-4 fill-current" />
            Begin the film
          </button>
          <div className="mt-2 flex items-center gap-6 text-[10px] uppercase tracking-[0.3em] text-[hsl(38_30%_55%)]">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={voiceOn}
                onChange={(e) => setVoiceOn(e.target.checked)}
                className="h-3 w-3 accent-[hsl(38_85%_60%)]"
              />
              voiceover
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={musicOn}
                onChange={(e) => setMusicOn(e.target.checked)}
                className="h-3 w-3 accent-[hsl(38_85%_60%)]"
              />
              music
            </label>
          </div>
          <button
            onClick={handleClose}
            className="absolute right-6 top-6 rounded-full border border-white/10 p-2 text-white/60 transition hover:border-white/30 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Video layer */}
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        loop
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          transform: `scale(${videoScale})`,
          transition: "transform 80ms linear",
          filter: scene.blur ? `blur(${scene.blur}px)` : undefined,
        }}
      />

      {/* Vignette + dark scrim */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${scene.vignette ?? 0.45}) 80%, rgba(0,0,0,0.95) 100%)`,
        }}
      />
      <div aria-hidden className="absolute inset-0 bg-black/25" />

      {/* Caption layer */}
      {started && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{ opacity: captionOpacity }}
        >
          <CaptionLayer scene={scene} sp={sp} />
        </div>
      )}

      {/* Top instrumentation strip */}
      {started && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 font-mono text-[10px] uppercase tracking-[0.32em] text-[hsl(38_45%_70%/0.55)] md:px-10">
          <span>ConsciousOS · the film</span>
          <span>scene {String(sceneIdx + 1).padStart(2, "0")} / {SCENES.length}</span>
          <span>{Math.floor(totalElapsed / 1000)}s / {Math.floor(TOTAL_MS / 1000)}s</span>
        </div>
      )}

      {/* Bottom progress bar */}
      {started && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
          <div className="h-px w-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-[hsl(38_85%_60%)] to-[hsl(20_95%_60%)]"
              style={{ width: `${overallPct}%`, transition: "width 80ms linear" }}
            />
          </div>
        </div>
      )}

      {/* Controls */}
      {started && (
        <div className="absolute right-4 top-4 z-30 flex items-center gap-2 md:right-6 md:top-6">
          <button
            onClick={() => {
              if (musicOn) {
                stopMusic();
                setMusicOn(false);
              } else {
                startMusic();
                setMusicOn(true);
              }
            }}
            className="rounded-full border border-white/10 bg-black/50 p-2 text-white/70 backdrop-blur-md transition hover:border-white/30 hover:text-white"
            aria-label="Toggle music"
          >
            {musicOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            onClick={handleClose}
            className="rounded-full border border-white/10 bg-black/50 p-2 text-white/70 backdrop-blur-md transition hover:border-white/30 hover:text-white"
            aria-label="Close film"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

/* --------------------------------------- caption renderer --------------------------------------- */
function CaptionLayer({ scene, sp }: { scene: Scene; sp: number }) {
  // staggered reveal of primary, secondary, tertiary
  const r1 = Math.max(0, Math.min(1, (sp - 0.05) / 0.15));
  const r2 = Math.max(0, Math.min(1, (sp - 0.25) / 0.18));
  const r3 = Math.max(0, Math.min(1, (sp - 0.45) / 0.18));

  const lift = (r: number) => ({
    opacity: r,
    transform: `translateY(${(1 - r) * 24}px)`,
    filter: `blur(${(1 - r) * 6}px)`,
    transition: "none",
  });

  // layout-based positioning
  let containerCls = "absolute flex flex-col gap-4 px-6 md:px-16";
  let alignCls = "items-start text-left";
  const posStyle: React.CSSProperties = {};

  switch (scene.layout) {
    case "centered":
      containerCls += " left-0 right-0 top-1/2 -translate-y-1/2";
      alignCls = "items-center text-center";
      break;
    case "topLeft":
      containerCls += " left-0 top-[14%] md:top-[18%]";
      alignCls = "items-start text-left max-w-2xl";
      break;
    case "bottomRight":
      containerCls += " right-0 bottom-[12%] md:bottom-[16%]";
      alignCls = "items-end text-right max-w-2xl ml-auto";
      break;
    case "split":
      containerCls += " left-0 right-0 top-1/2 -translate-y-1/2";
      alignCls = "items-center text-center";
      break;
    case "fullCenter":
    default:
      containerCls += " left-0 right-0 top-1/2 -translate-y-1/2";
      alignCls = "items-center text-center";
  }

  const isHeroNumber = scene.id === 4;
  const isWordmark = scene.id === 7;

  return (
    <div className={`${containerCls} ${alignCls}`} style={posStyle}>
      {isHeroNumber ? (
        <>
          <div
            className="font-serif text-[clamp(5rem,18vw,14rem)] font-extralight leading-[0.85] text-[hsl(38_88%_92%)]"
            style={{
              ...lift(r1),
              textShadow: "0 0 80px hsl(38 90% 55% / 0.55), 0 0 160px hsl(20 95% 50% / 0.25)",
            }}
          >
            {scene.caption.primary}
          </div>
          <div
            className="mt-2 font-mono text-sm uppercase tracking-[0.3em] text-[hsl(38_55%_75%)] md:text-base"
            style={lift(r2)}
          >
            {scene.caption.secondary}
          </div>
          {scene.caption.tertiary && (
            <div
              className="mt-6 max-w-xl font-mono text-xs uppercase tracking-[0.25em] text-[hsl(38_30%_70%)] md:text-sm"
              style={lift(r3)}
            >
              {scene.caption.tertiary}
            </div>
          )}
        </>
      ) : isWordmark ? (
        <>
          <div
            className="font-serif text-[clamp(2.8rem,11vw,8rem)] font-extralight leading-[0.9] tracking-[0.04em] text-[hsl(38_88%_92%)]"
            style={{
              ...lift(r1),
              textShadow: "0 0 100px hsl(38 90% 55% / 0.6), 0 0 200px hsl(20 95% 50% / 0.25)",
            }}
          >
            <span className="inline-block">C</span>
            <span className="inline-block">O</span>
            <span className="inline-block">N</span>
            <span className="inline-block">S</span>
            <span className="inline-block">C</span>
            <span className="inline-block">I</span>
            <span className="inline-block">O</span>
            <span className="inline-block">U</span>
            <span className="inline-block">S</span>
            <span className="mx-[0.2em] inline-block translate-y-[-0.18em] text-[0.45em] font-light text-[hsl(38_70%_65%)] align-middle">·</span>
            <span className="inline-block">O</span>
            <span className="inline-block">S</span>
          </div>
          <div
            className="mt-2 font-mono text-xs uppercase tracking-[0.5em] text-[hsl(38_55%_75%)] md:text-sm"
            style={lift(r2)}
          >
            {scene.caption.secondary}
          </div>
          {scene.caption.tertiary && (
            <div
              className="mt-6 font-mono text-[10px] uppercase tracking-[0.4em] text-[hsl(38_30%_70%)] md:text-xs"
              style={lift(r3)}
            >
              {scene.caption.tertiary}
            </div>
          )}
        </>
      ) : (
        <>
          <h2
            className="font-serif text-[clamp(2rem,6vw,5rem)] font-extralight leading-[1.05] text-[hsl(38_92%_95%)]"
            style={{
              ...lift(r1),
              textShadow: "0 4px 30px rgba(0,0,0,0.7)",
            }}
          >
            {scene.caption.primary}
          </h2>
          {scene.caption.secondary && (
            <h3
              className="font-serif text-[clamp(1.5rem,4.5vw,3.75rem)] font-extralight leading-[1.05] text-[hsl(38_70%_85%)]"
              style={{
                ...lift(r2),
                textShadow: "0 4px 30px rgba(0,0,0,0.7)",
              }}
            >
              {scene.caption.secondary}
            </h3>
          )}
          {scene.caption.tertiary && (
            <p
              className="mt-3 max-w-xl font-mono text-xs uppercase tracking-[0.32em] text-[hsl(38_55%_72%)] md:text-sm"
              style={{
                ...lift(r3),
                textShadow: "0 2px 20px rgba(0,0,0,0.8)",
              }}
            >
              {scene.caption.tertiary}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default HopeFilm;
