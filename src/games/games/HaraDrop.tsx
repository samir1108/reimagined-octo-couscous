// HARA DROP — Flagship Grade
// Aikido tanden / diaphragmatic grounding → interoceptive prediction (insula)
// Hand on hara (lower belly). Mic listens for deep belly breath. 90 seconds.
// Multi-sensor: mic (breath depth/cadence), TTS (guru), STT (spoken reflection), haptics, sound design
// Canvas: animated hara orb with pressure visualization
// XState: settle → hold (press & hold) → breathe → reflect → integrate

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { setup, assign } from "xstate";
import { useMachine } from "@xstate/react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useBreathMic } from "../shell/useBreathMic";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import HaraDropCanvas from "./HaraDropCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };
const HOLD_MS = 90_000;

type Phase = "settle" | "hold" | "breathe" | "reflect" | "integrate";

type Ctx = { pressing: boolean; pressDuration: number };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: { type: "PRESS_START" } | { type: "PRESS_END" } | { type: "ADVANCE" } | { type: "FINALIZE" };
  },
  actions: {
    pressStart: assign({ pressing: true }),
    pressEnd: assign({ pressing: false }),
  },
}).createMachine({
  id: "haraDrop",
  initial: "settle",
  context: { pressing: false, pressDuration: 0 },
  states: {
    settle: { on: { PRESS_START: { target: "hold", actions: "pressStart" } } },
    hold: { on: { PRESS_END: { target: "breathe", actions: "pressEnd" } } },
    breathe: { on: { ADVANCE: "reflect" } },
    reflect: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const pressing = state.context.pressing;

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [elapsed, setElapsed] = useState(0);
  const [pressStartTime, setPressStartTime] = useState<number | null>(null);
  const [totalPressMs, setTotalPressMs] = useState(0);
  const [reflection, setReflection] = useState("");
  const [listeningReflection, setListeningReflection] = useState(false);
  const [inhaleDepths, setInhaleDepths] = useState<number[]>([]);

  const sessionStartRef = useRef(Date.now());
  const endedRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);
  const pressTimerRef = useRef<number | undefined>(undefined);
  const phaseRef = useRef(phase);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Ambient bed
  useEffect(() => {
    sd.bed("temple", 0.06);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.08);
        await say("place your hand below the navel. press and hold. breathe down into the earth of the belly.", "guru");
      } else if (phase === "breathe") {
        sd.chime("rise", 0.1);
        await say("keep your hand there. let the breath deepen. ninety seconds total.", "guru");
      } else if (phase === "reflect") {
        sd.chime("drop", 0.1);
        await say("what settled? speak it.", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setListeningReflection(true); } catch {}
      } else if (phase === "integrate") {
        if (listeningReflection) {
          setListeningReflection(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 300));
        }
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the hara is your center of gravity. return here.", "guru");
      } else if (phase === "done") {
        finish();
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  // Track inhale depths during breathe phase
  useEffect(() => {
    if (phase !== "breathe" || !breath.lastInhaleMs) return;
    setInhaleDepths(prev => [...prev.slice(-9), breath.lastInhaleMs!]);
  }, [breath.lastInhaleMs, phase]);

  // Main timer (90s total)
  useEffect(() => {
    if (phase !== "hold" && phase !== "breathe") return;

    const startTime = phase === "hold" ? Date.now() : sessionStartRef.current + totalPressMs;
    timerRef.current = window.setInterval(() => {
      const e = Date.now() - startTime + totalPressMs;
      setElapsed(e);
      if (e >= HOLD_MS && !endedRef.current) {
        clearInterval(timerRef.current!);
        if (phaseRef.current === "breathe") send({ type: "ADVANCE" });
      }
    }, 200);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // Press duration tracking
  useEffect(() => {
    if (pressing) {
      setPressStartTime(Date.now());
      pressTimerRef.current = window.setInterval(() => {
        if (pressStartTime) {
          setTotalPressMs(prev => prev + (Date.now() - pressStartTime));
          setPressStartTime(Date.now());
        }
      }, 1000);
    } else if (pressTimerRef.current) {
      clearInterval(pressTimerRef.current);
    }
    return () => { if (pressTimerRef.current) clearInterval(pressTimerRef.current); };
  }, [pressing]);

  const handlePressStart = useCallback(() => {
    send({ type: "PRESS_START" });
    buzz("tap");
  }, []);

  const handlePressEnd = useCallback(() => {
    send({ type: "PRESS_END" });
    buzz("tap");
  }, []);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    if (pressTimerRef.current) clearInterval(pressTimerRef.current);
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    const durationMs = Date.now() - sessionStartRef.current;
    const avgInhaleDepth = inhaleDepths.length > 0
      ? inhaleDepths.reduce((a, b) => a + b, 0) / inhaleDepths.length
      : 0;
    const totalPressDuration = totalPressMs + (pressing && pressStartTime ? Date.now() - pressStartTime : 0);

    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: durationMs,
        target_ms: HOLD_MS,
        elapsed_ms: Math.min(durationMs, HOLD_MS),
        hand_present_ms: Math.round(totalPressDuration),
        hand_present_ratio: +Math.min(1, totalPressDuration / HOLD_MS).toFixed(3),
        avg_inhale_depth_ms: Math.round(avgInhaleDepth),
        inhale_depth_samples: inhaleDepths.length,
        mic_ready: breath.ready,
        mic_cycles: breath.cycles,
        reflection: reflection || null,
      },
    });
  }, [onEnd, inhaleDepths, totalPressMs, pressing, pressStartTime, stopVoice, sd, breath]);

  const startReflection = async () => {
    try { await transcribe.start(); setListeningReflection(true); } catch {}
  };

  const stopReflection = async () => {
    setListeningReflection(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setReflection(r.transcript.trim().slice(0, 300));
  };

  const progress = Math.min(1, elapsed / HOLD_MS);
  const remaining = Math.max(0, Math.ceil((HOLD_MS - elapsed) / 1000));

  return (
    <div className="absolute inset-0 bg-black overflow-hidden select-none">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.05, 0.15, 0.05], y: [0, -8, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-amber-950/30 via-black to-orange-950/30 pointer-events-none"
      />
      {/* Aurora — amber/orange */}
      <motion.div
        animate={{ opacity: [0.04, 0.14, 0.04], scale: [1, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-amber-400/15 via-transparent to-orange-400/10 pointer-events-none mix-blend-screen"
      />
      {/* Aurora — rose offset */}
      <motion.div
        animate={{ opacity: [0.03, 0.1, 0.03], scale: [1, 1.05, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute inset-0 bg-gradient-to-t from-rose-500/12 via-transparent to-transparent pointer-events-none mix-blend-screen"
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
            className="w-1.5 h-1.5 rounded-full bg-amber-300/80 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.5em] text-amber-200/70 font-light" style={SERIF}>hara drop</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-amber-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-20">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400"
          style={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <HaraDropCanvas
          phase={phase}
          pressing={pressing}
          breathEnvelope={breath.envelope}
          inhaleDepth={breath.lastInhaleMs}
          elapsed={elapsed}
          totalPressMs={totalPressMs}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "settle" && (
            <motion.div key="settle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center space-y-8 pointer-events-auto">
              <p className="text-4xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>hara drop</p>
              <motion.div
                animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-40 h-40 rounded-full bg-gradient-to-br from-amber-400/30 to-orange-400/15 blur-xl"
              />
              <p className="text-sm text-white/40 max-w-md mx-auto tracking-[0.1em] font-light">press & hold · hand on hara · breathe down</p>
              <motion.button
                onClick={handlePressStart}
                whileTap={{ scale: 0.98 }}
                className="mt-8 px-10 py-4 rounded-full border-2 border-amber-400/60 bg-amber-500/10 text-amber-100 text-lg uppercase tracking-wide hover:bg-amber-500/20 transition shadow-[0_0_24px_rgba(251,191,36,0.2)]"
              >
                BEGIN
              </motion.button>
            </motion.div>
          )}

          {(phase === "hold" || phase === "breathe") && (
            <motion.div key="hold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <div className="flex items-center justify-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">
                  {phase === "hold" ? "press & hold" : "breathe deeper"}
                </span>
                <span className="text-[10px] uppercase tracking-[0.4em] text-amber-200/70 tabular-nums">
                  {remaining}s
                </span>
              </div>

              <motion.div
                animate={pressing ? { scale: 1.08, y: 8 } : {}}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="relative"
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
              >
                {pressing && (
                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300/30 to-orange-300/10 blur-2xl pointer-events-none"
                  />
                )}
              </motion.div>

              <p className="text-2xl font-extralight text-white/85 tracking-wide" style={SERIF}>
                {pressing ? "drop the breath" : "press & hold · hand on hara"}
              </p>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">
                {pressing ? "hold · release · deeper" : "press & hold to begin"}
              </p>

              <div className="w-48 h-[2px] rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ ease: "linear", duration: 0.2 }}
                  className="h-full bg-gradient-to-r from-amber-300/70 to-orange-300/60"
                />
              </div>
            </motion.div>
          )}

          {phase === "reflect" && (
            <motion.div key="reflect" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <p className="text-2xl font-extralight text-white/95 tracking-[0.02em]" style={SERIF}>what settled?</p>

              {reflection ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto"
                >
                  <p className="text-lg italic text-amber-100/95" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 16px rgba(251,191,36,0.3)" }}>"{reflection}"</p>
                </motion.div>
              ) : listeningReflection ? (
                <motion.button
                  onClick={stopReflection}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 rounded-full border-2 border-amber-400/60 bg-amber-500/15 text-amber-100 text-sm uppercase tracking-wide animate-pulse shadow-[0_0_24px_rgba(251,191,36,0.25)]"
                >
                  ● listening — tap when done
                </motion.button>
              ) : (
                <motion.button
                  onClick={startReflection}
                  className="px-8 py-3 rounded-full border-2 border-white/20 bg-white/5 text-white/70 text-sm uppercase tracking-wide hover:border-amber-300/50 hover:text-amber-100 hover:bg-amber-500/10 transition"
                >
                  speak
                </motion.button>
              )}
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/15 blur-xl"
              />
              {reflection && (
                <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>"{reflection}"</p>
              )}
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the hara is your center of gravity. return here.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-amber-200/70 transition-all duration-500"
      >
        complete →
      </button>
    </div>
  );
}

export default function HaraDrop() {
  const g = getLabGame("hara-drop")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}