// TWO-PERSON MIRROR — Flagship Grade
// A partner practice. Person A speaks for 90s. Person B reflects back.
// 4 rounds (A→B→A→B). Interrupt urge tracking. Multi-sensor.
// Multi-sensor: mic (both), TTS (guru), STT (spoken reflections), haptics, sound design
// Canvas: animated mirror with speaker/listener roles
// XState: intro → prep → speak → reflect × 4 → verdict → integrate

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
import TwoPersonMirrorCanvas from "./TwoPersonMirrorCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };
const SPEAK_SECONDS = 90;
const TOTAL_ROUNDS = 4;

type Phase = "intro" | "prep" | "speak" | "reflect" | "verdict" | "integrate";

type Ctx = {
  round: number;
  reflections: string[];
  interruptedUrges: number;
  seconds: number;
};

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "START_ROUND" }
      | { type: "TICK" }
      | { type: "SUBMIT_REFLECTION"; value: string }
      | { type: "INTERRUPT_URGE" }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    startRound: assign(({ context }) => ({
      ...context,
      seconds: 90,
    })),
    tick: assign(({ context }) => ({
      ...context,
      seconds: Math.max(0, context.seconds - 1),
    })),
    submitReflection: assign(({ context, event }) => ({
      ...context,
      reflections: [...context.reflections, event.value],
      round: context.round + 1,
    })),
    recordUrge: assign(({ context }) => ({
      ...context,
      interruptedUrges: context.interruptedUrges + 1,
    })),
  },
  guards: {
    hasMoreRounds: ({ context }) => context.round < 4,
    lastRound: ({ context }) => context.round >= 3,
  },
}).createMachine({
  id: "twoPersonMirror",
  initial: "intro",
  context: { round: 0, reflections: [], interruptedUrges: 0, seconds: 90 },
  states: {
    intro: { on: { ADVANCE: { target: "prep" } } },
    prep: { on: { ADVANCE: { target: "speak", actions: "startRound" } } },
    speak: {
      on: {
        TICK: { actions: "tick" },
        ADVANCE: { target: "reflect", guard: ({ context }) => context.seconds <= 0 },
      },
    },
    reflect: {
      on: {
        SUBMIT_REFLECTION: [
          { actions: "submitReflection", target: "prep", guard: "hasMoreRounds" },
          { actions: "submitReflection", target: "verdict", guard: "lastRound" },
        ],
      },
    },
    verdict: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { round, reflections, interruptedUrges, seconds } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [reflection, setReflection] = useState("");

  const startedAt = useRef(Date.now());
  const endedRef = useRef(false);

  useEffect(() => {
    sd.bed("temple", 0.05);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Timer effect
  useEffect(() => {
    if (phase !== "speak") return;
    const timer = setInterval(() => {
      send({ type: "TICK" });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "intro") {
        sd.chime("rise", 0.06);
        await say("sit facing another human. one speaks. one mirrors. no fixing. no advising. only reflecting.", "guru");
      } else if (phase === "prep" && !cancelled) {
        const speaker = state.context.round % 2 === 0 ? "A" : "B";
        const listener = speaker === "A" ? "B" : "A";
        sd.chime("rise", 0.08);
        await say(`${speaker} speaks. ${listener} listens. ninety seconds. no fixing. only reflecting.`, "guru");
      } else if (phase === "speak" && !cancelled) {
        // Timer runs automatically
      } else if (phase === "reflect" && !cancelled) {
        const speaker = state.context.round % 2 === 0 ? "A" : "B";
        const listener = speaker === "A" ? "B" : "A";
        sd.chime("drop", 0.08);
        await say(`${listener}, mirror back what you actually heard. not what you would say. what they said.`, "guru");
      } else if (phase === "verdict" && !cancelled) {
        sd.chime("drop", 0.1);
        await say(`the mirror closes. the urge to fix was there ${state.context.interruptedUrges} times. you did not fix. you reflected.`, "guru");
      } else if (phase === "integrate") {
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the mirror was never about the other. it was about the one who could listen without becoming the fixer.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  const handleSubmitReflection = useCallback(() => {
    const t = reflection.trim();
    if (t.length < 3) return;
    send({ type: "SUBMIT_REFLECTION", value: t });
    setReflection("");
    buzz("tap");
  }, [reflection]);

  const handleInterruptUrge = useCallback(() => {
    send({ type: "INTERRUPT_URGE" });
    buzz("tap");
  }, []);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    sd.stopBed();
    stopVoice();

    const totalMs = Date.now() - startedAt.current;
    const avgLen = reflections.length
      ? Math.round(reflections.reduce((a, r) => a + r.length, 0) / reflections.length)
      : 0;

    onEnd({
      outcome: reflections.length >= 4 ? "completed" : "abandoned",
      signals: {
        duration_ms: totalMs,
        rounds_completed: reflections.length,
        total_rounds: 4,
        avg_reflection_chars: avgLen,
        interrupt_urges: interruptedUrges,
        total_ms: totalMs,
      },
    });
  }, [onEnd, reflections.length, interruptedUrges, reflections]);

  const speaker = round % 2 === 0 ? "A" : "B";
  const listener = speaker === "A" ? "B" : "A";

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.14, 0.04], y: [0, -12, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-rose-950/25 via-black to-amber-950/25 pointer-events-none"
      />
      {/* Aurora — rose/amber */}
      <motion.div
        animate={{ opacity: [0.03, 0.12, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-rose-400/15 via-transparent to-amber-400/10 pointer-events-none mix-blend-screen"
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
            className="w-1.5 h-1.5 rounded-full bg-rose-300/80 shadow-[0_0_10px_rgba(251,113,133,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.5em] text-rose-200/70 font-light" style={SERIF}>
            two-person mirror · round {Math.min(round + 1, 4)} / 4
          </span>
        </div>
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <TwoPersonMirrorCanvas
          phase={phase}
          round={round}
          speaker={round % 2 === 0 ? "A" : "B"}
          listener={round % 2 === 0 ? "B" : "A"}
          seconds={seconds}
          interruptedUrges={interruptedUrges}
          breathEnvelope={0}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center max-w-md space-y-8 pointer-events-auto">
              <p className="text-4xl font-extralight text-white/95 tracking-[0.02em]" style={SERIF}>sit facing another human</p>
              <p className="text-base italic text-white/80 leading-relaxed mb-4 max-w-md mx-auto" style={SERIF}>
                one of you is <span className="text-rose-200">A</span>. the other is <span className="text-rose-200">B</span>.
              </p>
              <p className="text-base italic text-white/80 leading-relaxed mb-10 max-w-md mx-auto" style={SERIF}>
                the speaker speaks for 90 seconds. the listener does not interrupt, does not fix, does not advise. only mirrors back afterward — what they actually heard.
              </p>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-rose-400/60 bg-rose-500/10 text-rose-100 text-sm uppercase tracking-wide hover:bg-rose-500/20 transition shadow-[0_0_24px_rgba(251,113,133,0.2)]"
              >
                begin
              </motion.button>
            </motion.div>
          )}

          {phase === "prep" && (
            <motion.div key={`p-${round}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center max-w-md space-y-8 pointer-events-auto">
              <p className="text-[10px] uppercase tracking-[0.5em] text-rose-200/60" style={SERIF}>next round</p>
              <h3 className="text-4xl italic" style={SERIF}>
                <span className="text-rose-200">{speaker}</span> speaks.
                <span className="text-amber-200">{listener}</span> listens.
              </h3>
              <p className="text-base italic text-white/80 leading-relaxed max-w-md mx-auto" style={SERIF}>
                speaker: talk about what is actually alive in you right now. listener: only listen. no fixing.
              </p>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-rose-400/60 bg-rose-500/10 text-rose-100 text-sm uppercase tracking-wide hover:bg-rose-500/20 transition shadow-[0_0_24px_rgba(251,113,133,0.2)]"
              >
                start 90 seconds
              </motion.button>
            </motion.div>
          )}

          {phase === "speak" && (
            <motion.div key={`s-${round}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-8 pointer-events-auto">
              <div className="flex justify-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.5em] text-rose-200/60" style={SERIF}>
                  {speaker} speaks · {listener} listens
                </span>
              </div>
              <motion.p
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                className="text-8xl italic tabular-nums text-rose-100/90"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 30px rgba(251,113,133,0.3)" }}
              >
                {seconds}
              </motion.p>
              <motion.button
                onClick={() => { send({ type: "INTERRUPT_URGE" }); buzz("tap"); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-[11px] italic text-white/40 hover:text-white/70 underline underline-offset-4"
                style={SERIF}
              >
                {listener}: tap if you feel the urge to interrupt
              </motion.button>
              <div className="mt-2 text-[10px] italic text-white/30" style={SERIF}>
                urges felt: {interruptedUrges}
              </div>
            </motion.div>
          )}

          {phase === "reflect" && (
            <motion.div key={`r-${round}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-2xl space-y-8 pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.5em] text-rose-200/60 mb-3 text-center" style={SERIF}>
                {listener} — reflect back what you actually heard
              </div>
              <h3 className="text-2xl italic text-center mb-6" style={SERIF}>not what you would say. what they said.</h3>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={6}
                placeholder="what I heard was…"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-rose-300/40 mb-4 resize-none"
                style={SERIF}
              />
              <motion.button
                disabled={reflection.trim().length < 3}
                onClick={() => { handleSubmitReflection(); buzz("tap"); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-6 py-3 rounded-full border text-xs uppercase tracking-[0.4em] ${
                  reflection.trim().length >= 3 ? "border-rose-400/60 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                {round >= 3 ? "close the mirror" : "swap"}
              </motion.button>
            </motion.div>
          )}

          {phase === "verdict" && (
            <motion.div key="v" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg text-center space-y-8 pointer-events-auto">
              <p className="text-[10px] uppercase tracking-[0.5em] text-rose-200/60 mb-4" style={SERIF}>the mirror closes</p>
              <p className="text-xl italic leading-relaxed max-w-md mx-auto" style={SERIF}>
                notice: the urge to fix was there {interruptedUrges} time{interruptedUrges === 1 ? "" : "s"}. you did not fix. you reflected.
              </p>
              <motion.button
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-rose-400/60 bg-rose-500/10 text-rose-100 text-sm uppercase tracking-wide hover:bg-rose-500/20 transition shadow-[0_0_24px_rgba(251,113,133,0.2)]"
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
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-rose-400/20 to-amber-400/15 blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the mirror was never about the other. it was about the one who could listen without becoming the fixer.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-rose-200/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function TwoPersonMirror() {
  const g = getLabGame("two-person-mirror")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}