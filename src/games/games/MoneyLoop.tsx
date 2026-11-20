// MONEY LOOP — Flagship Grade
// The one belief about money that runs the show. Name it. Trace its source.
// Name the act it produced. Write a truer sentence. Act from it this week.
// Multi-sensor: mic (breath/STT), TTS (guru), STT (spoken entries), haptics, sound design
// Canvas: animated money loop visualization with belief transformation
// XState: intro → belief → from → act → swap → integrate

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
import MoneyLoopCanvas from "./MoneyLoopCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };

const BELIEFS = [
  "there's never enough",
  "if i have it, i'll lose it",
  "money is dirty · money is safety",
  "i shouldn't want it",
  "i must earn every rupee twice",
  "someone else decides my worth",
];

type Phase = "intro" | "belief" | "from" | "act" | "swap" | "integrate";

type Ctx = { belief: string; from: string; act: string; swap: string };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "SET_BELIEF"; value: string }
      | { type: "SET_FROM"; value: string }
      | { type: "SET_ACT"; value: string }
      | { type: "SET_SWAP"; value: string }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    setBelief: assign(({ context, event }) => ({ ...context, belief: event.value })),
    setFrom: assign(({ context, event }) => ({ ...context, from: event.value })),
    setAct: assign(({ context, event }) => ({ ...context, act: event.value })),
    setSwap: assign(({ context, event }) => ({ ...context, swap: event.value })),
  },
}).createMachine({
  id: "moneyLoop",
  initial: "intro",
  context: { belief: "", from: "", act: "", swap: "" },
  states: {
    intro: { on: { ADVANCE: "belief" } },
    belief: { on: { SET_BELIEF: { actions: "setBelief" }, ADVANCE: { target: "from", guard: ({ context }) => context.belief.trim().length >= 4 } } },
    from: { on: { SET_FROM: { actions: "setFrom" }, ADVANCE: { target: "act", guard: ({ context }) => context.from.trim().length >= 3 } } },
    act: { on: { SET_ACT: { actions: "setAct" }, ADVANCE: { target: "swap", guard: ({ context }) => context.act.trim().length >= 4 } } },
    swap: { on: { SET_SWAP: { actions: "setSwap" }, ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { belief, from, act, swap } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [listeningBelief, setListeningBelief] = useState(false);
  const [listeningFrom, setListeningFrom] = useState(false);
  const [listeningAct, setListeningAct] = useState(false);
  const [listeningSwap, setListeningSwap] = useState(false);

  const startedAt = useRef(Date.now());
  const endedRef = useRef(false);

  useEffect(() => {
    sd.bed("void", 0.04);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "intro") {
        sd.chime("rise", 0.06);
        await say("money is a mirror. one belief runs the show. name it. trace it. rewrite it. act from the new one.", "guru");
      } else if (phase === "belief" && !cancelled) {
        sd.chime("rise", 0.08);
        await say("which belief runs your money? pick one, or write your own.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningBelief(true); } catch {}
        }
      } else if (phase === "from" && !cancelled) {
        sd.chime("drop", 0.08);
        await say("whose voice — or which season of life — did that belief come from?", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningFrom(true); } catch {}
        }
      } else if (phase === "act" && !cancelled) {
        sd.chime("drop", 0.1);
        await say("one thing that belief made you do this month. name it.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningAct(true); } catch {}
        }
      } else if (phase === "swap" && !cancelled) {
        sd.chime("drop", 0.12);
        await say("now write a truer sentence. one you can act from this week. speak it.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningSwap(true); } catch {}
        }
      } else if (phase === "integrate") {
        if (listeningSwap) {
          setListeningSwap(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) send({ type: "SET_SWAP", value: r.transcript.trim() });
        }
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the numbers won't change until the sentence does. the new sentence is the practice.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  // STT listeners
  useEffect(() => {
    if (phase !== "belief") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setBelief(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  useEffect(() => {
    if (phase !== "from") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setFrom(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  useEffect(() => {
    if (phase !== "act") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setAct(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  useEffect(() => {
    if (phase !== "swap") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setSwap(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    onEnd({
      outcome: belief.trim().length >= 4 && from.trim().length >= 3 && act.trim().length >= 4 && swap.trim().length >= 6 ? "completed" : "abandoned",
      signals: {
        belief: belief.trim(),
        origin: from.trim(),
        act: act.trim(),
        swap: swap.trim(),
        total_ms: Date.now() - startedAt.current,
      },
    });
  }, [onEnd, belief, from, act, swap, stopVoice, sd]);

  const handleSpokenBelief = async () => {
    try { await transcribe.start(); setListeningBelief(true); } catch {}
  };
  const stopSpokenBelief = async () => {
    setListeningBelief(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_BELIEF", value: r.transcript.trim() });
  };

  const handleSpokenFrom = async () => {
    try { await transcribe.start(); setListeningFrom(true); } catch {}
  };
  const stopSpokenFrom = async () => {
    setListeningFrom(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_FROM", value: r.transcript.trim() });
  };

  const handleSpokenAct = async () => {
    try { await transcribe.start(); setListeningAct(true); } catch {}
  };
  const stopSpokenAct = async () => {
    setListeningAct(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_ACT", value: r.transcript.trim() });
  };

  const handleSpokenSwap = async () => {
    try { await transcribe.start(); setListeningSwap(true); } catch {}
  };
  const stopSpokenSwap = async () => {
    setListeningSwap(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_SWAP", value: r.transcript.trim() });
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.12, 0.28, 0.12] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-emerald-950/25 via-black to-stone-950/25 pointer-events-none"
      />
      {/* Aurora — emerald/stone */}
      <motion.div
        animate={{ opacity: [0.03, 0.1, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-emerald-400/15 via-transparent to-stone-400/10 pointer-events-none mix-blend-screen"
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
            className="w-1.5 h-1.5 rounded-full bg-emerald-300/80 shadow-[0_0_10px_rgba(110,231,183,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.42em] text-emerald-200/70 font-light" style={SERIF}>artha · money loop{phase === "belief" ? " · belief" : phase === "from" ? " · source" : phase === "act" ? " · act" : phase === "swap" ? " · swap" : ""}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-emerald-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <MoneyLoopCanvas
          phase={phase}
          belief={belief}
          from={from}
          act={act}
          swap={swap}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-md space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>money is a mirror</h2>
              <p className="text-base italic text-white/80 leading-relaxed mb-10 max-w-md mx-auto" style={SERIF}>
                one belief runs the show. name it. trace it. rewrite it. act from the new one.
              </p>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-emerald-400/60 bg-emerald-500/10 text-emerald-100 text-sm uppercase tracking-wide hover:bg-emerald-500/20 transition shadow-[0_0_24px_rgba(110,231,183,0.2)]"
              >
                begin
              </motion.button>
            </motion.div>
          )}

          {phase === "belief" && (
            <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.4em] text-emerald-200/60 mb-3 text-center" style={SERIF}>which belief runs your money?</div>
              <div className="space-y-2 mb-4">
                {BELIEFS.map((b) => (
                  <button
                    key={b}
                    onClick={() => send({ type: "SET_BELIEF", value: b })}
                    className={`w-full text-left px-4 py-2 rounded-full border text-sm italic ${belief === b ? "border-emerald-300/60 bg-emerald-500/10 text-emerald-100" : "border-white/15 text-white/70 hover:border-emerald-300/50 hover:bg-emerald-500/10"}`}
                    style={SERIF}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <input
                value={belief}
                onChange={(e) => send({ type: "SET_BELIEF", value: e.target.value })}
                placeholder="or write your own…"
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-white/85 italic text-center focus:outline-none focus:border-emerald-300/60 mb-6"
                style={SERIF}
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenBelief}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningBelief ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-100 animate-pulse shadow-[0_0_20px_rgba(110,231,183,0.2)]" : "border-white/15 text-white/40 hover:border-emerald-300/50"
                  }`}
                >
                  {listeningBelief ? "● listening — tap to finish" : "speak belief"}
                </button>
              </div>
              <motion.button
                disabled={belief.trim().length < 4}
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-8 py-3 rounded-full border text-sm tracking-wide ${
                  belief.trim().length >= 4 ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                whose voice
              </motion.button>
            </motion.div>
          )}

          {phase === "from" && (
            <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md pointer-events-auto">
              <p className="text-xl italic text-white/85 mb-3 text-center" style={SERIF}>whose voice — or which season of life — did that belief come from?</p>
              <textarea
                value={from}
                onChange={(e) => send({ type: "SET_FROM", value: e.target.value })}
                placeholder="parent · college · a year of scarcity"
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl p-4 text-white/95 placeholder:text-white/25 italic mb-6 resize-none focus:outline-none focus:border-emerald-300/40"
                style={SERIF}
                autoFocus
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenFrom}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningFrom ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-100 animate-pulse shadow-[0_0_20px_rgba(110,231,183,0.2)]" : "border-white/15 text-white/40 hover:border-emerald-300/50"
                  }`}
                >
                  {listeningFrom ? "● listening — tap to finish" : "speak origin"}
                </button>
              </div>
              <motion.button
                disabled={from.trim().length < 3}
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-6 py-3 rounded-full border text-sm tracking-wide ${
                  from.trim().length >= 3 ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                one thing it made you do
              </motion.button>
            </motion.div>
          )}

          {phase === "act" && (
            <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md pointer-events-auto">
              <p className="text-lg italic text-white/85 mb-3 text-center" style={SERIF}>one thing that belief made you do this month — that you now see.</p>
              <textarea
                value={act}
                onChange={(e) => send({ type: "SET_ACT", value: e.target.value })}
                placeholder="under-charged · over-spent · avoided a number"
                rows={3}
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl p-4 text-white/95 placeholder:text-white/25 italic mb-6 resize-none focus:outline-none focus:border-emerald-300/40"
                style={SERIF}
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenAct}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningAct ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-100 animate-pulse shadow-[0_0_20px_rgba(110,231,183,0.2)]" : "border-white/15 text-white/40 hover:border-emerald-300/50"
                  }`}
                >
                  {listeningAct ? "● listening — tap to finish" : "speak act"}
                </button>
              </div>
              <motion.button
                disabled={act.trim().length < 4}
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-8 py-3 rounded-full border text-sm tracking-wide ${
                  act.trim().length >= 4 ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                a truer sentence
              </motion.button>
            </motion.div>
          )}

          {phase === "swap" && (
            <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md pointer-events-auto">
              <p className="text-lg italic text-white/85 mb-3 text-center" style={SERIF}>write a truer sentence — one you can act from this week.</p>
              <textarea
                value={swap}
                onChange={(e) => send({ type: "SET_SWAP", value: e.target.value })}
                placeholder="i can hold enough · and still be careful."
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl p-4 text-white/95 placeholder:text-white/25 italic mb-6 resize-none focus:outline-none focus:border-emerald-300/40"
                style={SERIF}
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenSwap}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningSwap ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-100 animate-pulse shadow-[0_0_20px_rgba(110,231,183,0.2)]" : "border-white/15 text-white/40 hover:border-emerald-300/50"
                  }`}
                >
                  {listeningSwap ? "● listening — tap to finish" : "speak swap"}
                </button>
              </div>
              <motion.button
                disabled={swap.trim().length < 6}
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-8 py-3 rounded-full border text-sm tracking-wide ${
                  swap.trim().length >= 6 ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                seal
              </motion.button>
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="int" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-b from-emerald-400/20 to-stone-400/15 blur-xl"
              />
              {swap && (
                <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>"{swap}"</p>
              )}
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the numbers won't change until the sentence does. the new sentence is the practice.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-emerald-200/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function MoneyLoop() {
  const g = getLabGame("money-loop")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}