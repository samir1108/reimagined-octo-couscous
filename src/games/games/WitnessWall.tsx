// WITNESS WALL — Flagship Grade
// Shikantaza / default-mode suppression → DMN downregulation
// 90s of sitting against the wall. Watch what wants to move. Don't move.
// Multi-sensor: mic (breath/somatic), DeviceMotion (postural micro-adjustments), pointer (touches), TTS (guru), STT (spoken reflection), haptics, sound design
// Canvas: animated wall with urge particles
// XState: settle → sit (90s) → reveal → words → integrate

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
import WitnessWallCanvas from "./WitnessWallCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };
const SIT_MS = 90_000;

type Phase = "settle" | "sit" | "reveal" | "words" | "integrate";

type Ctx = { touches: number; tiltSum: number; tiltSamples: number };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: { type: "TOUCH" } | { type: "TILT"; value: number } | { type: "ADVANCE" } | { type: "FINALIZE" };
  },
  actions: {
    recordTouch: assign({ touches: ({ context }) => context.touches + 1 }),
    recordTilt: assign(({ context, event }) => ({
      tiltSum: context.tiltSum + event.value,
      tiltSamples: context.tiltSamples + 1,
    })),
  },
}).createMachine({
  id: "witnessWall",
  initial: "settle",
  context: { touches: 0, tiltSum: 0, tiltSamples: 0 },
  states: {
    settle: { on: { ADVANCE: "sit" } },
    sit: { on: { TOUCH: { actions: "recordTouch" }, TILT: { actions: "recordTilt" }, ADVANCE: "reveal" } },
    reveal: { on: { ADVANCE: "words" } },
    words: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { touches, tiltSum, tiltSamples } = state.context;

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [progress, setProgress] = useState(0);
  const [revealLine, setRevealLine] = useState("");
  const [whispered, setWhispered] = useState("");
  const [listening, setListening] = useState(false);
  const [envSamples, setEnvSamples] = useState<number[]>([]);

  const sessionStartRef = useRef(Date.now());
  const sitStartRef = useRef(0);
  const endedRef = useRef(false);
  const tickRef = useRef<number | undefined>(undefined);
  const phaseRef = useRef(phase);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Ambient bed
  useEffect(() => {
    sd.bed("void", 0.04);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Sample breath envelope during sit
  useEffect(() => {
    if (phase !== "sit") return;
    setEnvSamples(prev => [...prev.slice(-99), breath.envelope]);
  }, [breath.envelope, phase]);

  // Pointer + DeviceMotion listeners during sit
  useEffect(() => {
    if (phase !== "sit") return;

    const onTouch = () => {
      send({ type: "TOUCH" });
      buzz("tap");
    };

    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const m = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2);
      const jitter = Math.abs(m - 9.8);
      send({ type: "TILT", value: jitter });
    };

    window.addEventListener("pointerdown", onTouch);
    window.addEventListener("devicemotion", onMotion);
    return () => {
      window.removeEventListener("pointerdown", onTouch);
      window.removeEventListener("devicemotion", onMotion);
    };
  }, [phase]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.06);
        await say("sit against the wall. ninety seconds. watch what wants to move. don't move.", "guru");
        if (!cancelled) {
          setTimeout(() => {
            if (!cancelled) {
              sitStartRef.current = Date.now();
              send({ type: "ADVANCE" });
            }
          }, 700);
        }
      } else if (phase === "reveal") {
        sd.chime("drop", 0.1);
        const t = touches;
        const jitter = tiltSamples > 0 ? tiltSum / tiltSamples : 0;
        let line: string;
        if (t === 0 && jitter < 0.4) line = "the wall held. nothing in you moved to escape.";
        else if (t === 0) line = "no touch. but the body kept adjusting. the outside stayed still.";
        else if (t <= 3) line = `${t} small movements. the urge came, and you noticed it come.`;
        else line = `${t} times the hand reached. each one a small story about why sitting is hard.`;
        setRevealLine(line);
        await say(line, "guru");
      } else if (phase === "words") {
        sd.chime("drop", 0.08);
        await say("speak — what wanted to move?", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListening(true); } catch {}
        }
      } else if (phase === "integrate") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setWhispered(r.transcript.trim().slice(0, 280));
        }
        sd.chime("drop", 0.1);
        await say("the wall is always there. you only remembered to lean on it.", "guru");
      } else if (phase === "done") {
        finish();
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  // Sit timer (90s)
  useEffect(() => {
    if (phase !== "sit") return;
    sitStartRef.current = Date.now();
    tickRef.current = window.setInterval(() => {
      const elapsed = Date.now() - sitStartRef.current;
      setProgress(Math.min(1, elapsed / SIT_MS));
      if (elapsed >= SIT_MS) {
        clearInterval(tickRef.current!);
        if (phaseRef.current === "sit") send({ type: "ADVANCE" });
      }
    }, 200);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [phase]);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (tickRef.current) clearInterval(tickRef.current);
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    const durationMs = Date.now() - sessionStartRef.current;
    const envMean = envSamples.length > 0
      ? envSamples.reduce((a, b) => a + b, 0) / envSamples.length
      : 0;
    const avgTilt = tiltSamples > 0 ? tiltSum / tiltSamples : 0;

    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: durationMs,
        sit_ms: SIT_MS,
        micro_touches: touches,
        avg_motion_jitter: +avgTilt.toFixed(3),
        tilt_samples: tiltSamples,
        env_mean: +envMean.toFixed(5),
        env_samples: envSamples.length,
        reveal_line: revealLine,
        reflection: whispered || null,
        mic_ready: breath.ready,
        mic_cycles: breath.cycles,
      },
    });
  }, [onEnd, envSamples, touches, tiltSum, tiltSamples, whispered, stopVoice, sd, breath]);

  // Auto-advance from reveal to words
  useEffect(() => {
    if (phase !== "reveal") return;
    const timer = setTimeout(() => { if (phaseRef.current === "reveal") send({ type: "ADVANCE" }); }, 10000);
    return () => clearTimeout(timer);
  }, [phase]);

  // Auto-advance from words to integrate
  useEffect(() => {
    if (phase !== "words") return;
    const timer = setTimeout(() => { if (phaseRef.current === "words") send({ type: "ADVANCE" }); }, 20000);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleListening = () => {
    setListening(false);
    transcribe.stop().catch(() => null).then(r => {
      if (r?.transcript) setWhispered(r.transcript.trim().slice(0, 280));
    });
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.12, 0.04], y: [0, -10, 0] }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-slate-950/40 via-black to-zinc-950/40 pointer-events-none"
      />
      {/* Aurora — slate/sky */}
      <motion.div
        animate={{ opacity: [0.03, 0.12, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-sky-400/10 via-transparent to-slate-400/10 pointer-events-none mix-blend-screen"
      />
      {/* Aurora — indigo offset */}
      <motion.div
        animate={{ opacity: [0.02, 0.08, 0.02], scale: [1, 1.05, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute inset-0 bg-gradient-to-t from-indigo-500/12 via-transparent to-transparent pointer-events-none mix-blend-screen"
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
            className="w-1.5 h-1.5 rounded-full bg-sky-300/80 shadow-[0_0_10px_rgba(125,211,252,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.5em] text-sky-200/70 font-light" style={SERIF}>witness wall</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-sky-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
          {(phase === "sit" || phase === "reveal") && touches > 0 && (
            <span className="text-[10px] uppercase tracking-[0.3em] text-rose-200/70">
              {touches} touch{touches !== 1 ? "es" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-20">
        <motion.div
          className="h-full bg-gradient-to-r from-sky-400 via-slate-400 to-indigo-400"
          style={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <WitnessWallCanvas
          phase={phase}
          touches={touches}
          tiltAvg={tiltSamples > 0 ? tiltSum / tiltSamples : 0}
          breathEnvelope={breath.envelope}
          progress={progress}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "settle" && (
            <motion.div key="settle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center space-y-8">
              <p className="text-4xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>witness wall</p>
              <motion.div
                animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-32 h-32 bg-gradient-to-t from-sky-400/30 to-transparent rounded-full blur-xl"
              />
              <p className="text-sm text-white/40 max-w-md mx-auto tracking-[0.1em] font-light">sit against it · ninety seconds · don't move</p>
            </motion.div>
          )}

          {phase === "sit" && (
            <motion.div key="sit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl text-center space-y-8">
              <div className="flex justify-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">sitting</span>
                <span className="text-[10px] uppercase tracking-[0.4em] text-sky-200/70 tabular-nums">
                  {Math.max(0, Math.ceil((SIT_MS - (Date.now() - sitStartRef.current)) / 1000))}s
                </span>
              </div>

              <p className="text-xl font-extralight text-white/80 tracking-wide" style={SERIF}>
                watch what wants to move
              </p>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">don't move</p>

              {touches > 0 && (
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center justify-center gap-2"
                >
                  <span className="text-rose-200/80 text-2xl">●</span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-rose-200/80">
                    {touches} touch{touches !== 1 ? "es" : ""}
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}

          {phase === "reveal" && (
            <motion.div key="reveal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-4">reflection</p>
              <p className="text-2xl font-extralight text-white/90 italic leading-relaxed max-w-md mx-auto" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 20px rgba(125,211,252,0.2)" }}>"{revealLine || "…"}"</p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto text-left"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">urge profile</p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-light text-rose-200 tabular-nums">{touches}</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">touches</p>
                  </div>
                  <div>
                    <p className="text-3xl font-light text-sky-200 tabular-nums">{tiltSamples > 0 ? (tiltSum / tiltSamples).toFixed(3) : "0.000"}</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">avg jitter</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {phase === "words" && (
            <motion.div key="words" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <p className="text-xl font-extralight text-white/90 leading-relaxed max-w-sm" style={SERIF}>what wanted to move?</p>

              {whispered ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto"
                >
                  <p className="text-lg italic text-sky-100/95" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 16px rgba(125,211,252,0.3)" }}>"{whispered}"</p>
                </motion.div>
              ) : listening ? (
                <motion.button
                  onClick={handleListening}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 rounded-full border-2 border-sky-400/60 bg-sky-500/15 text-sky-100 text-sm uppercase tracking-wide animate-pulse shadow-[0_0_24px_rgba(125,211,252,0.25)]"
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
                className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-sky-400/20 to-slate-400/15 blur-xl"
              />
              {whispered && (
                <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>"{whispered}"</p>
              )}
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the wall is always there. you only remembered to lean on it.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-sky-200/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function WitnessWall() {
  const g = getLabGame("witness-wall")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}