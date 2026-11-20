// VAIRAGYA TEST — Flagship Grade
// Nine things you cling to. Rate the grip. Then imagine each gone. Rate again.
// The delta between "grip now" and "grip if gone" is your vairagya score.
// Multi-sensor: mic (breath/STT), TTS (guru), STT (spoken reflection), haptics, sound design
// Canvas: animated grip/release visualization with particle flow
// XState: intro → grip (9 items) → gone (9 items) → verdict → integrate

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
import VairagyaTestCanvas from "./VairagyaTestCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };

const ITEMS = [
  "Your phone",
  "Your reputation",
  "A specific relationship",
  "Your body's current shape",
  "Your work / role",
  "Money in your account",
  "Being right",
  "A future you've imagined",
  "Being understood",
];

type Phase = "intro" | "grip" | "gone" | "verdict" | "integrate";

type Ctx = { idx: number; mode: "grip" | "gone"; }

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "NEXT" }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    next: assign(({ context }) => {
      const nextIdx = context.idx + 1;
      if (nextIdx >= 9) {
        return { idx: 0, mode: "gone" };
      }
      return { idx: nextIdx };
    }),
  },
}).createMachine({
  id: "vairagyaTest",
  initial: "intro",
  context: { idx: 0, mode: "grip" },
  states: {
    intro: { on: { ADVANCE: "grip" } },
    grip: { on: { NEXT: [
          { actions: "next", target: "grip", guard: ({ context }) => context.idx < 8 },
          { actions: "next", target: "gone" },
        ] } },
    gone: { on: { NEXT: { actions: "next", target: "gone", guard: ({ context }) => context.idx < 8 }, ADVANCE: "verdict" } },
    verdict: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { idx, mode } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [grip, setGrip] = useState<number[]>(Array(ITEMS.length).fill(5));
  const [gone, setGone] = useState<number[]>(Array(ITEMS.length).fill(5));
  const [reflection, setReflection] = useState("");
  const [reflectionListening, setReflectionListening] = useState(false);

  useEffect(() => {
    sd.bed("temple", 0.05);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "intro") {
        sd.chime("rise", 0.06);
        await say("nine things you cling to. rate the grip. then imagine each gone. rate again. the delta is your vairagya — dispassion, not indifference.", "guru");
      } else if (phase === "grip" && !cancelled) {
        sd.chime("rise", 0.08);
        await say(`how tightly you hold this now: ${ITEMS[state.context.idx]}. zero is loose. ten is fused.`, "guru");
      } else if (phase === "gone" && !cancelled) {
        sd.chime("drop", 0.08);
        await say(`now imagine ${ITEMS[state.context.idx]} is already gone. how tight would the grip be?`, "guru");
      } else if (phase === "verdict" && !cancelled) {
        sd.chime("drop", 0.1);
        const deltas = grip.map((g, i) => Math.max(0, g - gone[i]));
        const total = deltas.reduce((a, b) => a + b, 0);
        const maxIdx = deltas.indexOf(Math.max(...deltas));
        const pct = Math.round((total / 90) * 100);
        await say(`your vairagya index is ${pct} percent. the strongest release was ${ITEMS[maxIdx].toLowerCase()}. that is where you already know how to hold without clenching.`, "guru");
      } else if (phase === "integrate") {
        sd.chime("drop", 0.12);
        stopVoice();
        await say("vairagya is not not-caring. it is caring — without clenching. practice from strength.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase, state.context.idx]);

  const handleNext = useCallback(() => {
    send({ type: "NEXT" });
    buzz("tap");
  }, []);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    const deltas = grip.map((g, i) => Math.max(0, g - gone[i]));
    const total = deltas.reduce((a, b) => a + b, 0);
    const maxIdx = deltas.indexOf(Math.max(...deltas));
    const vairagyaPct = Math.round((total / 90) * 100);
    const avgGrip = Math.round((grip.reduce((a, b) => a + b, 0) / 9) * 10) / 10;
    const avgGone = Math.round((gone.reduce((a, b) => a + b, 0) / 9) * 10) / 10;

    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - startedAt.current,
        vairagya_pct: Math.round((total / 90) * 100),
        total_delta: total,
        avg_grip: avgGrip,
        avg_gone: avgGone,
        strongest_release: ITEMS[maxIdx],
        strongest_release_delta: deltas[maxIdx],
      },
    });
  }, [onEnd, grip, gone, stopVoice, sd]);

  const startedAt = useRef(Date.now());
  const endedRef = useRef(false);

  const handleGrip = (i: number, value: number) => {
    const arr = [...grip];
    arr[i] = value;
    setGrip(arr);
  };

  const handleGone = (i: number, value: number) => {
    const arr = [...gone];
    arr[i] = value;
    setGone(arr);
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.14, 0.04], y: [0, -12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-amber-950/25 via-black to-black pointer-events-none"
      />
      {/* Aurora — amber */}
      <motion.div
        animate={{ opacity: [0.03, 0.12, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-amber-400/15 via-transparent to-transparent pointer-events-none mix-blend-screen"
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
          <span className="text-[10px] uppercase tracking-[0.5em] text-amber-200/70 font-light" style={SERIF}>vairagya test · {state.context.idx + 1} / 9</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-amber-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <VairagyaTestCanvas
          phase={phase}
          grip={grip}
          gone={gone}
          idx={state.context.idx}
          breathEnvelope={0}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center max-w-lg space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>vairagya test</h2>
              <p className="text-base italic text-white/80 leading-relaxed max-w-lg mx-auto mb-10" style={SERIF}>
                nine things you cling to. rate the grip. then imagine each gone. rate again. the gap between "grip now" and "grip if gone" is your vairagya — dispassion, not indifference.
              </p>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-amber-400/60 bg-amber-500/10 text-amber-100 text-sm uppercase tracking-wide hover:bg-amber-500/20 transition shadow-[0_0_24px_rgba(251,191,36,0.2)]"
              >
                begin
              </motion.button>
            </motion.div>
          )}

          {(phase === "grip" || phase === "gone") && (
            <motion.div key={`${state.context.mode}-${state.context.idx}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-lg text-center pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.5em] text-amber-200/60 mb-4" style={SERIF}>
                {state.context.mode === "grip" ? "how tightly you hold it now" : "how tightly you'd hold it if it were gone"}
              </div>
              <p className="text-3xl italic mb-10" style={SERIF}>{ITEMS[state.context.idx]}</p>
              <div className="flex justify-center gap-2 flex-wrap mb-8">
                {Array.from({ length: 11 }).map((_, n) => {
                  const value = state.context.mode === "grip" ? grip[state.context.idx] : gone[state.context.idx];
                  const active = (state.context.mode === "grip" ? grip : gone)[state.context.idx] === n;
                  return (
                    <button
                      key={n}
                      onClick={() => {
                        if (state.context.mode === "grip") {
                          setGrip(prev => { const n = [...grip]; n[state.context.idx] = n; return n; });
                        } else {
                          setGone(prev => { const n = [...gone]; n[state.context.idx] = n; return n; });
                        }
                      }}
                      className={`w-9 h-9 rounded-full border text-sm tabular-nums transition ${active ? "border-amber-300/80 bg-amber-400/15 text-amber-50" : "border-white/15 text-white/50 hover:border-white/30"}`}
                      style={SERIF}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-[0.3em] text-white/40 mb-8 px-1" style={SERIF}>
                <span>loose</span><span>gripped</span>
              </div>
              <motion.button
                onClick={() => { send({ type: "NEXT" }); buzz("tap"); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 rounded-full border border-white/30 text-xs uppercase tracking-[0.4em] hover:bg-white/5"
                style={SERIF}
              >
                {state.context.idx < 8 ? "next" : state.context.mode === "grip" ? "now imagine them gone" : "see verdict"}
              </motion.button>
            </motion.div>
          )}

          {phase === "verdict" && (
            <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg text-center">
              <div className="text-[10px] uppercase tracking-[0.5em] text-amber-200/60 mb-4" style={SERIF}>vairagya index</div>
              <p className="text-6xl italic mb-2" style={SERIF}>{vairagyaPct}<span className="text-2xl">%</span></p>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-8" style={SERIF}>freedom from clinging</p>
              <ul className="space-y-1.5 mb-6 text-left">
                {ITEMS.map((it, i) => (
                  <li key={i} className="text-sm italic text-slate-300/85 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 flex justify-between items-center" style={SERIF}>
                    <span>{it}</span>
                    <span className="text-xs tabular-nums text-amber-200/70">{grip[i]} → {gone[i]} <span className="text-white/40">({deltas[i] >= 0 ? "-" : "+"}{Math.abs(deltas[i])})</span></span>
</li>
                ))}
              </ul>
              <p className="text-base italic text-slate-300/85 leading-relaxed mb-8" style={SERIF}>
                Your strongest release was <span className="text-amber-200/90">{ITEMS[maxIdx].toLowerCase()}</span>. That is where you already know how to hold without clenching. Practice from strength.
              </p>
              <motion.button
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-amber-400/60 bg-amber-500/10 text-amber-100 text-sm uppercase tracking-wide hover:bg-amber-500/20 transition shadow-[0_0_24px_rgba(251,191,36,0.2)]"
              >
                complete
              </motion.button>
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="int" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-b from-amber-400/20 to-transparent blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                vairagya is not not-caring. it is caring — without clenching. practice from strength.
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
        end · save
      </button>
    </div>
  );
}

export default function VairagyaTest() {
  const g = getLabGame("vairagya-test")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}

function finish() {
  onEnd({
    outcome: "completed",
    signals: {
      duration_ms: Date.now() - startedAt.current,
      vairagya_pct: Math.round((total / 90) * 100),
      total_delta: total,
      avg_grip: avgGrip,
      avg_gone: avgGone,
      strongest_release: ITEMS[maxIdx],
      strongest_release_delta: deltas[maxIdx],
    },
  });
}