// MIRROR DUEL — Flagship Grade
// You type an argument. The Mirror answers as your own opposite.
// Five rounds. At the end, we show which "you" spoke louder.
// Multi-sensor: mic (STT), TTS (guru + mirror voice), haptics, sound design
// Canvas: animated mirror with reflective surfaces and dual-voice visualization
// XState: intro → duel (5 rounds) → verdict → integrate

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
import MirrorDuelCanvas from "./MirrorDuelCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };

const PROMPTS = [
  "State one thing you believe about yourself right now.",
  "Say the story you tell about your work.",
  "Say what you want most — out loud, in one line.",
  "Say the thing you defend most fiercely.",
  "Say what you would never admit to anyone.",
];

function mirror(input: string): string {
  const t = input.trim();
  if (!t) return "You said nothing. The Mirror also says nothing.";
  const invertMap: [RegExp, string][] = [
    [/\bi am\b/gi, "you are not"],
    [/\bi'm\b/gi, "you are not"],
    [/\bi want\b/gi, "you are afraid of"],
    [/\bi love\b/gi, "you are attached to"],
    [/\bi hate\b/gi, "you have not understood"],
    [/\bi need\b/gi, "you can survive without"],
    [/\bi will\b/gi, "you may not"],
    [/\balways\b/gi, "rarely"],
    [/\bnever\b/gi, "sometimes"],
    [/\bmust\b/gi, "wish to"],
  ];
  let out = input.trim();
  for (const [re, r] of invertMap) out = out.replace(re, r);
  if (out === input.trim()) out = `Consider the opposite of what you just said. It is also true: ${input.toLowerCase()}`;
  return out;
}

type Turn = { round: number; you: string; mirror: string; latencyMs: number };
type Phase = "intro" | "duel" | "verdict" | "integrate";

type Ctx = { turns: Turn[]; round: number; conceded: number; whoWon: "me" | "mirror" | "neither" | null };

const submitAssign = assign(({ context, event }) => ({
      turns: [...context.turns, { round: context.round, you: event.you, mirror: "", latencyMs: event.latencyMs }],
      round: context.round + 1,
    }));

const concedeAssign = assign(({ context }) => ({ ...context, conceded: context.conceded + 1 }));

const setWinnerAssign = assign(({ context, event }) => ({ whoWon: event.value }));

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "SUBMIT"; you: string; latencyMs: number }
      | { type: "CONCEDE" }
      | { type: "SET_WINNER"; value: "me" | "mirror" | "neither" }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    submit: submitAssign,
    concede: concedeAssign,
    setWinner: setWinnerAssign,
  },
}).createMachine({
  id: "mirrorDuel",
  initial: "intro",
  context: { turns: [], round: 0, conceded: 0, whoWon: null },
  states: {
    intro: { on: { ADVANCE: "duel" } },
    duel: { on: { SUBMIT: { actions: "submit", target: "duel", guard: ({ context }) => context.round < 5 }, CONCEDE: { actions: "concede", target: "duel" }, ADVANCE: "verdict" } },
    verdict: { on: { SET_WINNER: { actions: "setWinner", target: "integrate" } } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { turns, round, conceded, whoWon } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);

  const startRef = useRef(Date.now());
  const turnStartRef = useRef(Date.now());
  const endedRef = useRef(false);
  const lastMirrorRef = useRef("");

  useEffect(() => {
    sd.bed("void", 0.04);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "intro") {
        sd.chime("rise", 0.08);
        await say("five rounds against yourself. you will say something. the mirror answers as your opposite. notice which one feels more true.", "guru");
      } else if (phase === "duel" && !cancelled) {
        // Auto-advance when 5 rounds complete
        const turnsCount = state.context.turns.length;
        if (turnsCount >= 5) {
          send({ type: "ADVANCE" });
        }
      } else if (phase === "verdict" && !cancelled) {
        sd.chime("drop", 0.1);
        await say("look back at the five things the mirror said. some of them stung. some of them were also true.", "guru");
      } else if (phase === "integrate") {
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the mirror was never the opponent. it was the part of you that remembers the other side.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  // STT for voice input
  useEffect(() => {
    if (phase !== "duel") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") {
        // Don't overwrite typed text, just show live transcript
      }
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  const handleSubmit = useCallback(() => {
    const t = text.trim();
    if (t.length < 3) return;
    const latencyMs = Date.now() - turnStartRef.current;
    const m = mirror(t);
    lastMirrorRef.current = m;
    send({ type: "SUBMIT", you: t, latencyMs: Date.now() - turnStartRef.current });
    setText("");
    if (state.context.round < 4) {
      turnStartRef.current = Date.now();
    }
    buzz("tap");
  }, [text]);

  const handleConcede = useCallback(() => {
    send({ type: "CONCEDE" });
    buzz("tap");
  }, []);

  const finish = useCallback((pick: "me" | "mirror" | "neither") => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    const avgLatency = state.context.turns.length
      ? Math.round(state.context.turns.reduce((a, t) => a + t.latencyMs, 0) / state.context.turns.length)
      : 0;
    const avgLen = state.context.turns.length
      ? Math.round(state.context.turns.reduce((a, t) => a + t.you.length, 0) / state.context.turns.length)
      : 0;

    onEnd({
      outcome: "completed",
      signals: {
        rounds_completed: state.context.turns.length,
        avg_reply_latency_ms: avgLatency,
        avg_reply_chars: avgLen,
        concessions: state.context.conceded,
        self_reported_winner: whoWon,
      },
    });
  }, []);

  const handleWinner = useCallback((pick: "me" | "mirror" | "neither") => {
    send({ type: "SET_WINNER", value: pick });
    buzz("tap");
  }, []);

  const handleSpoken = useCallback(async () => {
    try { await transcribe.start(); } catch {}
  }, []);

  const mirror = (input: string): string => {
    const t = input.trim();
    if (!t) return "You said nothing. The Mirror also says nothing.";
    const invertMap: [RegExp, string][] = [
      [/\bi am\b/gi, "you are not"],
      [/\bi'm\b/gi, "you are not"],
      [/\bi want\b/gi, "you are afraid of"],
      [/\bi love\b/gi, "you are attached to"],
      [/\bi hate\b/gi, "you have not understood"],
      [/\bi need\b/gi, "you can survive without"],
      [/\bi will\b/gi, "you may not"],
      [/\balways\b/gi, "rarely"],
      [/\bnever\b/gi, "sometimes"],
      [/\bmust\b/gi, "wish to"],
    ];
    let out = input.trim();
    for (const [re, r] of invertMap) out = out.replace(re, r);
    if (out === input.trim()) out = `Consider the opposite of what you just said. It is also true: ${input.toLowerCase()}`;
    return out;
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.14, 0.04], y: [0, -12, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-black to-violet-950/30 pointer-events-none"
      />
      {/* Aurora — indigo/violet */}
      <motion.div
        animate={{ opacity: [0.03, 0.12, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-indigo-400/15 via-transparent to-violet-400/10 pointer-events-none mix-blend-screen"
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
          <span className="text-[10px] uppercase tracking-[0.5em] text-indigo-200/70 font-light" style={SERIF}>mirror duel · round {state.context.round + 1} / 5</span>
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
        <MirrorDuelCanvas
          phase={phase}
          rounds={state.context.turns}
          currentPrompt={PROMPTS[state.context.round] || ""}
          lastMirror={state.context.turns[state.context.turns.length - 1]?.mirror || ""}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center max-w-md space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>five rounds against yourself</h2>
              <p className="text-base italic text-white/80 leading-relaxed mb-10 max-w-md mx-auto" style={SERIF}>
                you will say something. the mirror answers as your opposite. notice which one feels more true.
              </p>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-indigo-400/60 bg-indigo-500/10 text-indigo-100 text-sm uppercase tracking-wide hover:bg-indigo-500/20 transition shadow-[0_0_24px_rgba(165,180,252,0.2)]"
              >
                enter the mirror
              </motion.button>
            </motion.div>
          )}

          {phase === "duel" && (
            <motion.div key={`d-${state.context.round}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-2xl space-y-8 pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.5em] text-indigo-200/60 mb-3 text-center" style={SERIF}>
                round {state.context.round + 1} of 5
              </div>
              <h3 className="text-2xl italic text-center mb-6" style={SERIF}>{PROMPTS[state.context.round]}</h3>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="type it. do not soften it."
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-indigo-300/40 mb-4 resize-none"
                style={SERIF}
              />
              
              {state.context.turns.length > 0 && state.context.turns[state.context.turns.length - 1].round === state.context.round - 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 rounded-xl border border-indigo-300/30 bg-indigo-500/10"
                >
                  <div className="text-[10px] uppercase tracking-[0.4em] text-indigo-200/60 mb-1" style={SERIF}>the mirror said</div>
                  <p className="text-base italic text-indigo-100/95" style={SERIF}>"{state.context.turns[state.context.turns.length - 1].mirror}"</p>
                </motion.div>
              )}

              <div className="flex justify-between items-center">
                <button onClick={handleConcede} className="text-[11px] italic text-white/40 hover:text-white/70" style={SERIF}>
                  concede this round
                </button>
                <motion.button
                  disabled={text.trim().length < 3}
                  onClick={handleSubmit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-6 py-3 rounded-full border text-xs uppercase tracking-[0.4em] ${text.trim().length >= 3 ? "border-indigo-400/60 bg-indigo-500/10 text-indigo-100 hover:bg-indigo-500/20 transition shadow-[0_0_24px_rgba(165,180,252,0.2)]" : "border-white/10 text-white/25 cursor-not-allowed"}`}
                  style={SERIF}
                >
                  speak
                </motion.button>
              </div>
            </motion.div>
          )}

          {phase === "verdict" && (
            <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.5em] text-indigo-200/60 mb-4" style={SERIF}>the duel is done</div>
              <p className="text-xl italic leading-relaxed max-w-md mx-auto mb-8" style={SERIF}>
                look back at the five things the mirror said. some of them stung. some of them were also true.
              </p>
              <div className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-3" style={SERIF}>which one spoke louder?</div>
              <div className="flex flex-col gap-2.5">
                {(["me", "mirror", "neither"] as const).map((k) => (
                  <motion.button
                    key={k}
                    onClick={() => { send({ type: "SET_WINNER", value: k }); buzz("tap"); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 rounded-xl border border-white/15 hover:border-indigo-300/40 hover:bg-white/5 text-slate-100/90 text-sm italic"
                    style={SERIF}
                  >
                    {k === "me" ? "the me who spoke first" : k === "mirror" ? "the mirror" : "neither — they were both me"}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="int" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-indigo-400/20 to-violet-400/15 blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the mirror was never the opponent. it was the part of you that remembers the other side.
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

export default function MirrorDuel() {
  const g = getLabGame("mirror-duel")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}