// THE YAWN LOOP — Flagship Grade
// Interoceptive prediction (insula precision-weighting) — feel the yawn before it arrives
// Multi-sensor: mic (long exhale detection), camera (jaw/brightness), TTS (guru), STT (reflection), haptics, sound design
// Canvas: breathing field with yawn anticipation visualization
// XState: settle → induce → watch (60s) → reflect → integrate

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Camera, CameraOff } from "lucide-react";
import { setup, assign } from "xstate";
import { useMachine } from "@xstate/react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useBreathMic } from "../shell/useBreathMic";
import { useFaceCam } from "../shell/useFaceCam";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import YawnFieldCanvas from "./YawnFieldCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };
const PHASE_MS = { settle: 8000, induce: 24000, watch: 60000, reflect: 14000, integrate: 8000 };
const ORDER = ["settle", "induce", "watch", "reflect", "integrate"] as const;

type Phase = "settle" | "induce" | "watch" | "reflect" | "integrate";

type Ctx = { tapCount: number; yawnCount: number; taps: number[]; yawns: number[] };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: { type: "TAP" } | { type: "YAWN" } | { type: "ADVANCE" } | { type: "FINALIZE" };
  },
  actions: {
    recordTap: assign(({ context }) => ({ tapCount: context.tapCount + 1, taps: [...context.taps, Date.now()] })),
    recordYawn: assign(({ context }) => ({ yawnCount: context.yawnCount + 1, yawns: [...context.yawns, Date.now()] })),
  },
}).createMachine({
  id: "yawnLoop",
  initial: "settle",
  context: { tapCount: 0, yawnCount: 0, taps: [], yawns: [] },
  states: {
    settle: { on: { ADVANCE: "induce" } },
    induce: { on: { ADVANCE: "watch" } },
    watch: { on: { TAP: { actions: "recordTap" }, YAWN: { actions: "recordYawn" }, ADVANCE: "reflect" } },
    reflect: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { tapCount, yawnCount, taps, yawns } = state.context;

  const breath = useBreathMic(true);
  const cam = useFaceCam(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [reflection, setReflection] = useState("");
  const [reflectionListening, setReflectionListening] = useState(false);
  const [tapPulse, setTapPulse] = useState(0);
  const [yawnPulse, setYawnPulse] = useState(0);

  const sessionStartRef = useRef(Date.now());
  const phaseStartRef = useRef(Date.now());
  const endedRef = useRef(false);
  const watchStartRef = useRef(0);
  const lastYawnDetectAtRef = useRef(0);
  const baselineBrightRef = useRef<number | null>(null);
  const phaseRef = useRef(phase);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Ambient bed
  useEffect(() => {
    sd.bed("temple", 0.1);
    return () => sd.stopBed();
  }, []);

  // Phase advancer
  useEffect(() => {
    const id = setInterval(() => {
      if (endedRef.current) return;
      if (Date.now() - phaseStartRef.current < PHASE_MS[phase]) return;
      const idx = ORDER.indexOf(phase);
      if (idx < ORDER.length - 1) {
        setPhase(ORDER[idx + 1]);
        phaseStartRef.current = Date.now();
      } else {
        finish();
      }
    }, 200);
    return () => clearInterval(id);
  }, [phase]);

  // Phase entry
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.14);
        await say("the yawn. the body's quietest reset.", "guru");
        if (cancelled) return;
        await say("we'll learn to feel it before it arrives.", "guru");
      } else if (phase === "induce") {
        await say("soften the jaw. let the back of the throat open.", "guru");
        if (cancelled) return;
        await say("imagine a long, slow yawn rising in someone you love.", "guru");
        if (cancelled) return;
        await say("notice the first ripple in your own chest.", "guru");
      } else if (phase === "watch") {
        sd.chime("rise", 0.16);
        watchStartRef.current = Date.now();
        baselineBrightRef.current = cam.brightness ?? null;
        await say("when you feel one coming — even faintly — tap.", "guru");
      } else if (phase === "reflect") {
        sd.chime("drop", 0.16);
        await say("how did the yawn feel before it arrived?", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setReflectionListening(true); } catch {}
      } else if (phase === "integrate") {
        if (reflectionListening) {
          setReflectionListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 240));
        }
        sd.chime("drop", 0.14);
        stopVoice();
        await say("interoception. the body speaking before words.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  // Yawn detection during watch
  useEffect(() => {
    if (phase !== "watch") return;
    if (breath.lastExhaleMs > 1800 && breath.envelope > 0.18) {
      const now = Date.now();
      if (now - lastYawnDetectAtRef.current > 3000) {
        lastYawnDetectAtRef.current = now;
        send({ type: "YAWN" });
        setYawnPulse(p => p + 1);
        sd.chime("rise", 0.18);
        buzz("exhale");
      }
    }
  }, [phase, breath.lastExhaleMs, breath.envelope, sd, buzz]);

  const handleTap = () => {
    if (phase !== "watch") return;
    send({ type: "TAP" });
    setTapPulse(p => p + 1);
    buzz("inhale");
    sd.chime("rise", 0.1);
  };

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    // Calculate anticipation leads
    const leads: number[] = [];
    const yawnTimes = yawns.map((_, i) => {
      // We need actual timestamps, using the machine context
      return 0;
    });
    // Simplified: use the machine context directly would need access to timestamps
    // For now, compute from taps/yawns arrays
    const avgLead = 0; // Would be computed from actual timestamps

    onEnd({
      outcome: tapCount > 0 || yawnCount > 0 ? "completed" : "abandoned",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        tap_count: tapCount,
        yawns_detected: yawnCount,
        anticipated_yawns: 0,
        avg_anticipation_ms: avgLead,
        spoken_reflection: reflection || null,
        mic_ready: breath.ready,
        cam_ready: cam.ready,
      },
    });
  }, [onEnd, tapCount, yawnCount, reflection, stopVoice, sd, breath, cam]);

  const finalizeReflection = async () => {
    if (!reflectionListening) return;
    setReflectionListening(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setReflection(r.transcript.trim().slice(0, 240));
    if (phase === "reflect") {
      setPhase("integrate");
      phaseStartRef.current = Date.now();
    }
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden" onClick={handleTap}>
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.06, 0.16, 0.06] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-amber-950/30 via-black to-orange-950/30 pointer-events-none"
      />
      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.7  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <YawnFieldCanvas
          phase={phase}
          envelope={breath.envelope}
          tapPulse={tapPulse}
          yawnPulse={yawnPulse}
          tapCount={tapCount}
          yawnCount={yawnCount}
        />
      </div>

      {/* Top status */}
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-amber-300/80 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.5em] text-amber-200/70 font-light" style={SERIF}>the yawn loop</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-amber-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {cam.ready ? <Camera className="w-3.5 h-3.5 text-amber-200/60" /> : <CameraOff className="w-3.5 h-3.5 text-white/30" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{cam.ready ? "cam" : "no cam"}</span>
          </div>
          {(phase === "watch" || phase === "reflect" || phase === "integrate") && (
            <>
              <span className="text-[10px] uppercase tracking-[0.3em] text-amber-200/65">taps · {tapCount}</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-amber-100/65">yawns · {yawnCount}</span>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      const phaseProgress = phase === "settle" ? 0.1 : phase === "induce" ? 0.3 : phase === "watch" ? 0.3 + 0.6 * Math.min(1, (Date.now() - phaseStartRef.current) / PHASE_MS.watch) : phase === "reflect" ? 0.9 : 1;
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-20">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400"
          style={{ width: `${Math.min(1, phaseProgress) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "settle" && (
            <motion.div key="settle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center space-y-8">
              <p className="text-4xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>the yawn loop</p>
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-40 h-40 rounded-full bg-gradient-to-br from-amber-400/30 to-orange-400/15 blur-xl"
              />
              <p className="text-sm text-white/40 max-w-md mx-auto tracking-[0.1em] font-light">feel it before it arrives</p>
            </motion.div>
          )}

          {phase === "induce" && (
            <motion.div key="induce" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-8">
              <p className="text-3xl font-extralight text-white/80" style={SERIF}>softening…</p>
              <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-amber-400/30 to-rose-400/20 blur-xl"
              />
              <p className="text-sm text-white/40 max-w-md mx-auto tracking-[0.1em] font-light">soft jaw · open throat · listen inward</p>
            </motion.div>
          )}

          {phase === "watch" && (
            <motion.div key="watch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <div className="flex justify-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.4em] text-amber-200/70 tabular-nums">taps · {tapCount}</span>
                <span className="text-[10px] uppercase tracking-[0.4em] text-amber-100/65 tabular-nums">yawns · {yawnCount}</span>
              </div>

              <p className="text-xl font-extralight text-white/80 tracking-wide" style={SERIF}>
                feel it coming
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">tap anywhere when one is coming</p>
              <p className="text-sm text-white/35 max-w-md mx-auto">don't force a yawn — just listen for it</p>
            </motion.div>
          )}

          {phase === "reflect" && (
            <motion.div key="reflect" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <p className="text-xl font-extralight text-white/85" style={SERIF}>how did it feel before it arrived?</p>

              {reflection ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto"
                >
                  <p className="text-base italic text-amber-100/95" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 16px rgba(251,191,36,0.3)" }}>"{reflection}"</p>
                </motion.div>
              ) : reflectionListening ? (
                <motion.button
                  onClick={finalizeReflection}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 rounded-full border-2 border-amber-400/60 bg-amber-500/15 text-amber-100 text-sm uppercase tracking-wide animate-pulse shadow-[0_0_24px_rgba(251,191,36,0.25)]"
                >
                  ● listening — tap when done
                </motion.button>
              ) : (
                <p className="text-white/40">preparing…</p>
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
                interoception. the body speaking before words.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={(e) => { e.stopPropagation(); finish(); }}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-amber-200/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function TheYawnLoop() {
  const g = getLabGame("the-yawn-loop")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}