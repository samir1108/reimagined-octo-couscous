// THE WITNESS ROOM — Flagship Grade
// Sakshi Bhāv under disturbance / reactivity vs. presence
// 75s of sitting. Random sound disturbances. Measure reactive taps, envelope variance, spoken reflection.
// Multi-sensor: mic (breath/somatic), TTS (guru), STT (spoken reflection), haptics, sound design
// Canvas: animated room with disturbance ripples
// XState: settle → sit (75s, random disturbances) → reveal → words → integrate

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
import WitnessRoomCanvas from "./WitnessRoomCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };
const SIT_MS = 75_000;

type Phase = "settle" | "sit" | "reveal" | "words" | "integrate";

type Ctx = { reactiveTaps: number; totalTaps: number };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: { type: "TAP"; reactive: boolean } | { type: "ADVANCE" } | { type: "FINALIZE" };
  },
  actions: {
    recordTap: assign({
      reactiveTaps: ({ context }, e: { reactive: boolean }) => context.reactiveTaps + (e.reactive ? 1 : 0),
      totalTaps: ({ context }) => context.totalTaps + 1,
    }),
  },
}).createMachine({
  id: "witnessRoom",
  initial: "settle",
  context: { reactiveTaps: 0, totalTaps: 0 },
  states: {
    settle: { on: { ADVANCE: "sit" } },
    sit: { on: { TAP: { actions: "recordTap" }, ADVANCE: "reveal" } },
    reveal: { on: { ADVANCE: "words" } },
    words: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { reactiveTaps, totalTaps } = state.context;

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [revealLine, setRevealLine] = useState("");
  const [whispered, setWhispered] = useState("");
  const [listeningFinal, setListeningFinal] = useState(false);
  const [reactiveKey, setReactiveKey] = useState(0);
  const [disturbKey, setDisturbKey] = useState(0);

  const sessionStartRef = useRef(Date.now());
  const sitStartRef = useRef(0);
  const lastDisturbRef = useRef(0);
  const endedRef = useRef(false);
  const envSamplesRef = useRef<number[]>([]);
  const phaseRef = useRef(phase);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Ambient bed
  useEffect(() => {
    sd.bed("temple", 0.04);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Sample breath envelope during sit
  useEffect(() => {
    if (phase !== "sit") return;
    envSamplesRef.current.push(breath.envelope);
  }, [breath.envelope, phase]);

  // Disturbance scheduler
  useEffect(() => {
    if (phase !== "sit") return;
    const sounds: ("rise" | "drop")[] = ["rise", "drop"];
    let cancelled = false;
    const schedule = () => {
      const delay = 7000 + Math.random() * 9000;
      setTimeout(() => {
        if (cancelled || phaseRef.current !== "sit") return;
        sd.chime(sounds[Math.floor(Math.random() * 2)], 0.16);
        lastDisturbRef.current = performance.now();
        setDisturbKey(k => k + 1);
        schedule();
      }, delay);
    };
    schedule();
    return () => { cancelled = true; };
  }, [phase]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.06);
        await say("sit. sounds will come. you are not the one who reacts. you are the room they pass through.", "guru");
        if (cancelled) return;
        setTimeout(() => { if (!cancelled) send({ type: "ADVANCE" }); }, 700);
      } else if (phase === "sit") {
        sitStartRef.current = performance.now();
        setTimeout(() => { if (!cancelled) send({ type: "ADVANCE" }); }, SIT_MS);
      } else if (phase === "reveal") {
        sd.chime("drop", 0.1);
        const line = buildReveal();
        setRevealLine(line);
        await say(line, "guru");
      } else if (phase === "words") {
        sd.chime("drop", 0.08);
        await say("speak — what stayed steady, what moved?", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setListeningFinal(true); } catch {}
      } else if (phase === "integrate") {
        if (listeningFinal) {
          setListeningFinal(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setWhispered(r.transcript.trim().slice(0, 280));
        }
        sd.chime("drop", 0.1);
        await say("the room remains. the sounds did not move it.", "guru");
      } else if (phase === "done") {
        finish();
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  const handleTap = useCallback(() => {
    if (phaseRef.current !== "sit") return;
    const reactive = lastDisturbRef.current > 0 && performance.now() - lastDisturbRef.current < 1200;
    send({ type: "TAP", reactive });
    setReactiveKey(k => k + 1);
    buzz("tap");
  }, []);

  const variance = (arr: number[]) => {
    if (!arr.length) return 0;
    const m = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length;
  };

  const buildReveal = (): string => {
    const r = state.context.reactiveTaps;
    const t = state.context.totalTaps;
    const v = variance(envSamplesRef.current);
    if (t === 0 && v < 0.008) return "the room held. no flinch. nothing in you reached for the sound.";
    if (r === 0) return "you moved, but not because of the sound. the witness was clean.";
    if (r >= 3) return `${r} reactions. the sound entered, and something inside you answered each time. notice that one.`;
    return `${r} of your ${t} movements were reactive. the witness is forming.`;
  };

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    const envMean = envSamplesRef.current.length ? envSamplesRef.current.reduce((a, b) => a + b, 0) / envSamplesRef.current.length : 0;
    const envVar = variance(envSamplesRef.current);

    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        sit_ms: SIT_MS,
        reactive_taps: state.context.reactiveTaps,
        total_taps: state.context.totalTaps,
        env_mean: +envMean.toFixed(5),
        env_var: +envVar.toFixed(5),
        reveal_line: revealLine,
        reflection: whispered || null,
        mic_ready: breath.ready,
        mic_cycles: breath.cycles,
      },
    });
  }, [onEnd, stopVoice, sd, breath]);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.12, 0.04], y: [0, -8, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-black to-violet-950/30 pointer-events-none"
      />
      {/* Aurora — indigo/violet */}
      <motion.div
        animate={{ opacity: [0.03, 0.12, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-indigo-400/12 via-transparent to-violet-400/10 pointer-events-none mix-blend-screen"
      />
      {/* Aurora — cyan offset */}
      <motion.div
        animate={{ opacity: [0.02, 0.08, 0.02], scale: [1, 1.05, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 via-transparent to-transparent pointer-events-none mix-blend-screen"
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
            className="w-1.5 h-1.5 rounded-full bg-indigo-300/80 shadow-[0_0_10px_rgba(165,180,252,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.5em] text-indigo-200/70 font-light" style={SERIF}>the witness room</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-indigo-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      const progress = phase === "sit" ? Math.min(1, (Date.now() - sitStartRef.current) / SIT_MS) : phase === "reveal" ? 1 : phase === "words" ? 1 : 0;
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-20">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400"
          style={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <WitnessRoomCanvas
          phase={phase}
          envelope={breath.envelope}
          active={phase === "sit"}
          reactiveKey={reactiveKey}
          disturbKey={disturbKey}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "settle" && (
            <motion.div key="settle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center space-y-8">
              <p className="text-4xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>the witness room</p>
              <motion.div
                animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-40 h-40 rounded-full bg-gradient-to-br from-indigo-400/30 to-violet-400/15 blur-xl"
              />
              <p className="text-sm text-white/40 max-w-md mx-auto tracking-[0.1em] font-light">sounds will come · you are the room</p>
            </motion.div>
          )}

          {phase === "sit" && (
            <motion.div key="sit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <div className="flex justify-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.4em] text-indigo-200/70 tabular-nums">
                  {Math.max(0, Math.ceil((SIT_MS - (Date.now() - sitStartRef.current)) / 1000))}s
                </span>
              </div>

              <p className="text-xl font-extralight text-white/80 tracking-wide" style={SERIF}>
                sitting
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">tap if you must</p>
            </motion.div>
          )}

          {phase === "reveal" && (
            <motion.div key="reveal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-4">reflection</p>
              <p className="text-2xl font-extralight text-white/90 italic leading-relaxed max-w-md mx-auto" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 20px rgba(165,180,252,0.2)" }}>"{revealLine || "…"}"</p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto text-left"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">reactivity</p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-light text-rose-200 tabular-nums">{state.context.reactiveTaps}</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">reactive taps</p>
                  </div>
                  <div>
                    <p className="text-3xl font-light text-white/60 tabular-nums">{state.context.totalTaps - state.context.reactiveTaps}</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">spontaneous</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {phase === "words" && (
            <motion.div key="words" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <p className="text-xl font-extralight text-white/85" style={SERIF}>what stayed steady? what moved?</p>

              {whispered ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto"
                >
                  <p className="text-base italic text-indigo-100/95" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 16px rgba(165,180,252,0.3)" }}>"{whispered}"</p>
                </motion.div>
              ) : listeningFinal ? (
                <motion.button
                  onClick={handleListeningFinal}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 rounded-full border-2 border-indigo-400/60 bg-indigo-500/15 text-indigo-100 text-sm uppercase tracking-wide animate-pulse shadow-[0_0_24px_rgba(165,180,252,0.25)]"
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
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-indigo-400/20 to-violet-400/15 blur-xl"
              />
              {whispered && (
                <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>"{whispered}"</p>
              )}
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the room remains. the sounds did not move it.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tap area for sit phase */}
      {phase === "sit" && (
        <button
          onClick={handleTap}
          onTouchStart={(e) => { e.preventDefault(); handleTap(); }}
          className="absolute inset-0 z-20 cursor-default"
          aria-label="Sit. Tap if you must."
        />
      )}

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-indigo-200/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function WitnessRoom() {
  const g = getLabGame("witness-room")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}