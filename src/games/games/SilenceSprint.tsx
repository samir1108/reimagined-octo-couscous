// SILENCE SPRINT — Flagship Grade
// 3-min mic-listened silence. Any sound above threshold registers as a break.
// Show live silence percentage. Cohort-ready: break count, longest silent stretch, silence ratio.
// Multi-sensor: mic (breath/RMS), TTS (guru), STT (spoken reflection), haptics, sound design
// Canvas: animated orb with silence visualization
// XState: ready → run (3 min) → reveal → reflect → integrate

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { setup, assign } from "xstate";
import { useMachine } from "@xstate/react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import { useBreathMic } from "../shell/useBreathMic";
import SilenceSprintCanvas from "./SilenceSprintCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };
const TOTAL_MS = 3 * 60 * 1000;
const THRESHOLD = 0.06;
const BREAK_DEBOUNCE_MS = 400;

type Phase = "ready" | "run" | "reveal" | "reflect" | "integrate";

type Ctx = { breaks: number; silentMs: number; longestStreak: number; streak: number; lastBreak: number; level: number; micError: string | null };

const startAssign = assign(({ context }) => ({
      ...context,
      breaks: 0,
      silentMs: 0,
      longestStreak: 0,
      streak: 0,
      lastBreak: 0,
      level: 0,
      micError: null,
    }));

const tickAssign = assign(({ context, event }) => {
    const { level, now } = event;
    const dt = now - (context.lastTick || now);
    let silentMs = context.silentMs;
    let streak = context.streak;
    let longestStreak = context.longestStreak;
    let breaks = context.breaks;
    let lastBreak = context.lastBreak;

    if (level < 0.06) {
      silentMs += dt;
      streak += dt;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 0;
      if (now - lastBreak > 400) {
        breaks += 1;
        lastBreak = now;
      }
    }

    return { ...context, level, silentMs, streak, longestStreak, breaks, lastBreak, lastTick: now };
  });

const endEarlyAssign = assign({});

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "START" }
      | { type: "TICK"; level: number; now: number }
      | { type: "END_EARLY" }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    start: startAssign,
    tick: tickAssign,
    endEarly: endEarlyAssign,
  },
}).createMachine({
  id: "silenceSprint",
  initial: "ready",
  context: { breaks: 0, silentMs: 0, longestStreak: 0, streak: 0, lastBreak: 0, level: 0, micError: null, lastTick: 0 },
  states: {
    ready: { on: { START: { target: "run", actions: "start" } } },
    run: { on: { TICK: { actions: "tick" }, END_EARLY: { target: "reveal", actions: "endEarly" }, ADVANCE: "reveal" } },
    reveal: { on: { ADVANCE: "reflect" } },
    reflect: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { level, breaks, silentMs, longestStreak } = state.context;

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [reflection, setReflection] = useState("");
  const [reflectionListening, setReflectionListening] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const endedRef = useRef(false);

  useEffect(() => {
    sd.bed("void", 0.04);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Audio loop
  useEffect(() => {
    if (phase !== "run") return;

    let cancelled = false;
    let lastTick = Date.now();

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new AC();
        ctxRef.current = ctx;
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        src.connect(analyser);
        analyserRef.current = analyser;

        startedAtRef.current = Date.now();
        send({ type: "START" });
        loop();
      } catch (e) {
        send({ type: "MIC_ERROR", error: "Mic permission needed" });
      }
    };

    const loop = () => {
      if (cancelled) return;
      const analyser = analyserRef.current;
      if (!analyser) return;

      const buf = new Uint8Array(analyser.fftSize);
      const tick = () => {
        if (cancelled) return;
        analyser.getByteTimeDomainData(buf);
        let sumSq = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sumSq += v * v;
        }
        const rms = Math.sqrt(sumSq / buf.length);

        const now = Date.now();
        const dt = now - lastTick;
        lastTick = now;
        send({ type: "TICK", level: rms, now });

        if (now - startedAtRef.current >= 3 * 60 * 1000) {
          cleanup();
          send({ type: "ADVANCE" });
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    start();
    return () => { cancelled = true; cleanup(); };
  }, [phase]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "reveal") {
        sd.chime("drop", 0.1);
        await say(`the silence held ${Math.round((state.context.silentMs / (3 * 60 * 1000)) * 100)} percent. ${state.context.breaks === 0 ? "no breaks. the room was pure." : `${state.context.breaks} sound${state.context.breaks === 1 ? "" : "s"} entered. each one a small story.`}`, "guru");
      } else if (phase === "reflect" && !cancelled) {
        sd.chime("drop", 0.08);
        await say("what did the silence teach you? speak it.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setReflectionListening(true); } catch {}
        }
      } else if (phase === "integrate") {
        if (state.context.breaks === 0) {
          sd.chime("drop", 0.12);
          await say("the room was never empty. you were the witness.", "guru");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    try { ctxRef.current?.close(); } catch {}
    ctxRef.current = null;
    analyserRef.current = null;
  }, []);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    cleanup();
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    const elapsed = Date.now() - startedAtRef.current;
    onEnd({
      outcome: elapsed >= 3 * 60 * 1000 ? "completed" : "abandoned",
      signals: {
        total_ms: 3 * 60 * 1000,
        elapsed_ms: elapsed,
        silent_ms: state.context.silentMs,
        silence_ratio: elapsed > 0 ? +(state.context.silentMs / elapsed).toFixed(3) : 0,
        breaks: state.context.breaks,
        longest_silent_ms: state.context.longestStreak,
      },
    });
  }, [onEnd, stopVoice, sd]);

  const startRef = useCallback(() => {
    send({ type: "START" });
    startedAtRef.current = Date.now();
    buzz("tap");
  }, []);

  const handleStopEarly = useCallback(() => {
    send({ type: "END_EARLY" });
    buzz("tap");
  }, []);

  const handleReflection = async () => {
    setReflectionListening(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setReflection(r.transcript.trim().slice(0, 280));
    send({ type: "ADVANCE" });
  };

  const pct = Math.min(100, Math.round((Date.now() - startedAtRef.current) / (3 * 60 * 1000) * 100));
  const silencePct = Math.min(100, Math.round((state.context.silentMs / Math.max(1, Date.now() - startedAtRef.current)) * 100));
  const remainingSec = Math.max(0, Math.ceil((3 * 60 * 1000 - (Date.now() - startedAtRef.current)) / 1000));

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.14, 0.04], y: [0, -12, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-slate-950/30 via-black to-slate-950/30 pointer-events-none"
      />
      {/* Aurora — slate */}
      <motion.div
        animate={{ opacity: [0.03, 0.12, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-slate-400/15 via-transparent to-slate-400/10 pointer-events-none mix-blend-screen"
      />
      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.7  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Top status */}
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-slate-300/80 shadow-[0_0_10px_rgba(148,163,184,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.5em] text-slate-200/70 font-light" style={SERIF}>silence sprint · 3 min</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-slate-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <SilenceSprintCanvas
          phase={phase}
          level={state.context.level}
          breaks={state.context.breaks}
          silentPct={Math.min(100, Math.round((state.context.silentMs / Math.max(1, Date.now() - startedAtRef.current)) * 100))}
          remainingSec={Math.max(0, Math.ceil((3 * 60 * 1000 - (Date.now() - startedAtRef.current)) / 1000))}
          breathEnvelope={0}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "ready" && (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-md space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>three minutes of silence</h2>
              <p className="text-base italic text-white/80 leading-relaxed max-w-md mx-auto mb-8" style={SERIF}>
                the mic listens for any sound above a whisper. every break is counted. there is no punishment. only a mirror.
              </p>
              <motion.button
                onClick={() => send({ type: "START" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-slate-400/60 bg-slate-500/10 text-slate-100 text-sm uppercase tracking-wide hover:bg-slate-500/20 transition shadow-[0_0_24px_rgba(148,163,184,0.2)]"
              >
                begin the silence
              </motion.button>
            </motion.div>
          )}

          {phase === "run" && (
            <motion.div key="run" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center space-y-8 pointer-events-auto">
              <div className="mb-10">
                <p className="text-5xl italic text-slate-100/90 mb-2" style={SERIF}>{Math.max(0, Math.ceil((3 * 60 * 1000 - (Date.now() - startedAtRef.current)) / 1000))}s</p>
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-6" style={SERIF}>remaining</p>
              </div>

              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-6">
                <motion.div
                  animate={{ width: `${Math.min(100, (Date.now() - startedAtRef.current) / (3 * 60 * 1000) * 100)}%` }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-gradient-to-r from-slate-400 to-sky-400"
                />
              </div>

              <div className="flex justify-between text-[11px] italic text-white/70 mb-8" style={SERIF}>
                <span>silence: {Math.min(100, Math.round((state.context.silentMs / Math.max(1, Date.now() - startedAtRef.current)) * 100))}%</span>
                <span>breaks: {state.context.breaks}</span>
              </div>

              <motion.button
                onClick={() => send({ type: "END_EARLY" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-[10px] italic text-white/30 hover:text-white/60"
                style={SERIF}
              >
                end early
              </motion.button>
            </motion.div>
          )}

          {phase === "reveal" && (
            <motion.div key="reveal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center space-y-8 pointer-events-auto">
              <p className="text-[10px] uppercase tracking-[0.5em] text-slate-200/60 mb-4" style={SERIF}>the silence ends</p>
              <p className="text-2xl italic leading-relaxed max-w-md mx-auto mb-8" style={SERIF}>
                you held {Math.min(100, Math.round((state.context.silentMs / Math.max(1, Date.now() - startedAtRef.current)) * 100))}% of the room. {state.context.breaks === 0 ? "no breaks." : `${state.context.breaks} sound${state.context.breaks === 1 ? "" : "s"} entered.`}
              </p>
              <p className="text-sm italic text-white/50 mb-10" style={SERIF}>
                longest unbroken stretch: {Math.round(state.context.longestStreak / 1000)}s.
              </p>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-slate-400/60 bg-slate-500/10 text-slate-100 text-sm uppercase tracking-wide hover:bg-slate-500/20 transition shadow-[0_0_24px_rgba(148,163,184,0.2)]"
              >
                reflect
              </motion.button>
            </motion.div>
          )}

          {phase === "reflect" && (
            <motion.div key="reflect" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <p className="text-xl italic text-white/90 max-w-md mx-auto" style={SERIF}>what did the silence teach you?</p>

              {reflection ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto"
                >
                  <p className="text-lg italic text-slate-100/95" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 16px rgba(148,163,184,0.3)" }}>"{reflection}"</p>
                </motion.div>
              ) : reflectionListening ? (
                <motion.button
                  onClick={handleReflection}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 rounded-full border-2 border-slate-400/60 bg-slate-500/15 text-slate-100 text-sm uppercase tracking-wide animate-pulse shadow-[0_0_24px_rgba(148,163,184,0.25)]"
                >
                  ● listening — tap when done
                </motion.button>
              ) : (
                <p className="text-white/40">preparing…</p>
              )}
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="int" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-slate-400/20 to-slate-400/15 blur-xl"
              />
              {reflection && (
                <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>"{reflection}"</p>
              )}
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the room was never empty. you were the witness.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-slate-200/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function SilenceSprint() {
  const g = getLabGame("silence-sprint")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}