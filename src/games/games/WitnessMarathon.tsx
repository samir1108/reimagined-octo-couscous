// WITNESS MARATHON — Flagship Grade
// Ten minutes. Single-word sensory prompts every 60-90s. Witness without following.
// Rate how many prompts pulled you into thinking.
// Multi-sensor: mic (breath), TTS (guru), STT (spoken pull report), haptics, sound design
// Canvas: animated witness orb with prompt particles
// XState: intro → sit (10 min, random prompts) → rate → verdict → integrate

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
import WitnessMarathonCanvas from "./WitnessMarathonCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };

const PROMPTS = ["sound", "breath", "weight", "silence", "temperature", "space behind you", "the seer", "this moment", "resistance", "stillness"];
const DURATION_MS = 10 * 60 * 1000;
const PROMPT_MIN_MS = 60_000;
const PROMPT_MAX_MS = 90_000;

type Phase = "intro" | "sit" | "rate" | "verdict" | "integrate";

type Ctx = { prompts: string[]; pulledOut: number; promptCount: number };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "START" }
      | { type: "PROMPT"; word: string }
      | { type: "PULL" }
      | { type: "SET_PULLS"; value: number }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    start: assign(() => ({ prompts: [], pulledOut: 0, promptCount: 0 })),
    prompt: assign(({ context, event }) => ({ prompts: [...context.prompts, event.word], promptCount: context.promptCount + 1 })),
    pull: assign(({ context }) => ({ pulledOut: context.pulledOut + 1 })),
    setPulls: assign(({ context, event }) => ({ ...context, pulledOut: event.value })),
  },
}).createMachine({
  id: "witnessMarathon",
  initial: "intro",
  context: { prompts: [], pulledOut: 0, promptCount: 0 },
  states: {
    intro: { on: { START: { target: "sit", actions: "start" } } },
    sit: { on: { PROMPT: { actions: "prompt" }, PULL: { actions: "pull" }, SET_PULLS: { actions: "setPulls" }, ADVANCE: "rate" } },
    rate: { on: { SET_PULLS: { actions: "setPulls" }, ADVANCE: "verdict" } },
    verdict: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { prompts, pulledOut, promptCount } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [elapsed, setElapsed] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);

  const startRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const lastPromptRef = useRef<number>(0);
  const endedRef = useRef(false);

  useEffect(() => {
    sd.bed("void", 0.04);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Timer effect
  useEffect(() => {
    if (phase !== "sit") return;
    timerRef.current = window.setInterval(() => {
      const el = Date.now() - startRef.current;
      setElapsed(el);
      if (el - lastPromptRef.current > PROMPT_MIN_MS + Math.random() * (PROMPT_MAX_MS - PROMPT_MIN_MS)) {
        lastPromptRef.current = el;
        const word = PROMPTS[promptIndex % PROMPTS.length];
        setCurrentPrompt(word);
        send({ type: "PROMPT", word });
        setPromptIndex((p) => p + 1);
        setTimeout(() => setCurrentPrompt(""), 5000);
      }
      if (el >= DURATION_MS) {
        clearInterval(timerRef.current!);
        send({ type: "ADVANCE" });
      }
    }, 500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, promptIndex]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "intro") {
        sd.chime("rise", 0.06);
        await say("ten minutes. sit. do not move. a word will appear. you do not follow it. you only witness that it arose — and let it pass.", "guru");
      } else if (phase === "rate" && !cancelled) {
        sd.chime("drop", 0.1);
        await say("of the words that appeared, how many pulled you into thinking about them? speak the number.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); } catch {}
        }
      } else if (phase === "verdict" && !cancelled) {
        sd.chime("drop", 0.1);
        const witness = state.context.promptCount - state.context.pulledOut;
        await say(`${witness} of ${state.context.promptCount} arose and passed without pulling you. that gap — where the word appeared and you did not follow — is the witness.`, "guru");
      } else if (phase === "integrate") {
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the witness was never the words. the witness was the space between the word and your reaction. rest there.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  // STT for spoken pull count
  useEffect(() => {
    if (phase !== "rate") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") {
        const num = parseInt(t.trim());
        if (!isNaN(num)) send({ type: "SET_PULLS", value: num });
      }
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    const witness = state.context.promptCount - state.context.pulledOut;
    const witnessRatio = state.context.promptCount ? +(witness / state.context.promptCount).toFixed(3) : 1;

    onEnd({
      outcome: elapsed >= DURATION_MS ? "completed" : "abandoned",
      signals: {
        duration_ms: elapsed,
        prompts_issued: state.context.promptCount,
        pulled_out: state.context.pulledOut,
        witness_ratio: witnessRatio,
        total_ms: elapsed,
      },
    });
  }, [onEnd, stopVoice, sd]);

  const handlePull = useCallback(() => {
    send({ type: "PULL" });
    buzz("tap");
  }, []);

  const mm = Math.floor(elapsed / 60000);
  const ss = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, "0");

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.12, 0.04], y: [0, -12, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-black to-black pointer-events-none"
      />
      {/* Aurora — indigo */}
      <motion.div
        animate={{ opacity: [0.03, 0.1, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-indigo-400/15 via-transparent to-transparent pointer-events-none mix-blend-screen"
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
          <span className="text-[10px] uppercase tracking-[0.42em] text-indigo-200/60" style={SERIF}>
            witness marathon{phase === "sit" ? ` · ${mm}:${ss}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-indigo-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <WitnessMarathonCanvas
          phase={phase}
          currentPrompt={currentPrompt}
          prompts={state.context.prompts}
          promptIndex={promptIndex}
          elapsed={elapsed}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-md space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>ten minutes</h2>
              <p className="text-base italic text-white/80 leading-relaxed mb-10 max-w-md mx-auto" style={SERIF}>
                sit. do not move. a single word will appear every so often. you do not follow it. you do not think about it. you only witness that it arose — and let it pass.
              </p>
              <motion.button
                onClick={() => { startRef.current = Date.now(); lastPromptRef.current = 0; send({ type: "START" }); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-indigo-400/60 bg-indigo-500/10 text-indigo-100 text-sm uppercase tracking-wide hover:bg-indigo-500/20 transition shadow-[0_0_24px_rgba(165,180,252,0.2)]"
              >
                sit
              </motion.button>
            </motion.div>
          )}

          {phase === "sit" && (
            <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-8 pointer-events-auto">
              <AnimatePresence mode="wait">
                {currentPrompt ? (
                  <motion.div
                    key={currentPrompt + promptIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 1.2 }}
                    className="text-4xl md:text-6xl italic tracking-wide text-indigo-100"
                    style={SERIF}
                  >
                    {currentPrompt}
                  </motion.div>
                ) : (
                  <motion.div
                    key="dot"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 6, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-white/60 mx-auto"
                  />
                )}
              </AnimatePresence>
              <div className="text-[10px] uppercase tracking-[0.4em] text-white/30" style={SERIF}>
                {mm}:{ss} / 10:00 · {promptIndex} prompt{promptIndex === 1 ? "" : "s"}
              </div>
              <motion.button
                onClick={() => { send({ type: "PULL" }); buzz("tap"); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-[10px] uppercase tracking-[0.4em] text-white/25 hover:text-white/60"
                style={SERIF}
              >
                it pulled me
              </motion.button>
              <button onClick={() => { send({ type: "ADVANCE" }); buzz("tap"); }} className="mt-6 text-[10px] uppercase tracking-[0.4em] text-white/25 hover:text-white/60" style={SERIF}>
                end early
              </button>
            </motion.div>
          )}

          {phase === "rate" && (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md text-center pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.4em] text-indigo-200/60 mb-4" style={SERIF}>be honest</div>
              <p className="text-xl italic mb-8 leading-relaxed" style={SERIF}>
                Of {promptCount} prompt{promptCount === 1 ? "" : "s"}, how many pulled you into thinking about them?
              </p>
              <input
                type="range"
                min={0}
                max={Math.max(promptCount, 1)}
                value={pulledOut}
                onChange={(e) => send({ type: "SET_PULLS", value: Number(e.target.value) })}
                className="w-full accent-indigo-400 mb-4"
              />
              <div className="text-3xl italic mb-8" style={SERIF}>{pulledOut}</div>
              <motion.button
                onClick={() => { send({ type: "ADVANCE" }); buzz("tap"); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-indigo-400/60 bg-indigo-500/10 text-indigo-100 text-sm uppercase tracking-wide hover:bg-indigo-500/20 transition shadow-[0_0_24px_rgba(165,180,252,0.2)]"
              >
                seal
              </motion.button>
            </motion.div>
          )}

          {phase === "verdict" && (
            <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md text-center">
              <p className="text-xl italic leading-relaxed mb-8" style={SERIF}>
                {promptCount - pulledOut} of {promptCount} arose and passed without pulling you. that gap — where the word appeared and you did not follow — is the witness.
              </p>
              <div className="text-[10px] uppercase tracking-[0.4em] text-white/40" style={SERIF}>complete</div>
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="int" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-b from-indigo-400/20 to-transparent blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the witness was never the words. the witness was the space between the word and your reaction. rest there.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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

export default function WitnessMarathon() {
  const g = getLabGame("witness-marathon")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}