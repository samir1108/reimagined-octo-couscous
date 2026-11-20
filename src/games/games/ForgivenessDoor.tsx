// FORGIVENESS DOOR — Flagship Grade
// Kṣamā: not for them. For the part of you still stuck at the moment.
// One name. One weight. One cost. One keep. One release.
// Multi-sensor: mic (breath/STT), TTS (guru), STT (spoken entries), haptics, sound design
// Canvas: animated door visualization with weight tracking
// XState: intro → who → cost → keep → release → integrate

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
import ForgivenessDoorCanvas from "./ForgivenessDoorCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };

type Phase = "intro" | "who" | "cost" | "keep" | "release" | "integrate";

type Ctx = { who: string; cost: string; keep: string; release: string; weightBefore: number; weightAfter: number };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "SET_WHO"; value: string }
      | { type: "SET_COST"; value: string }
      | { type: "SET_KEEP"; value: string }
      | { type: "SET_RELEASE"; value: string }
      | { type: "SET_WEIGHT_BEFORE"; value: number }
      | { type: "SET_WEIGHT_AFTER"; value: number }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    setWho: assign(({ context, event }) => ({ ...context, who: event.value })),
    setCost: assign(({ context, event }) => ({ ...context, cost: event.value })),
    setKeep: assign(({ context, event }) => ({ ...context, keep: event.value })),
    setRelease: assign(({ context, event }) => ({ ...context, release: event.value })),
    setWeightBefore: assign(({ context, event }) => ({ ...context, weightBefore: event.value })),
    setWeightAfter: assign(({ context, event }) => ({ ...context, weightAfter: event.value })),
  },
}).createMachine({
  id: "forgivenessDoor",
  initial: "intro",
  context: { who: "", cost: "", keep: "", release: "", weightBefore: 7, weightAfter: 7 },
  states: {
    intro: { on: { ADVANCE: "who" } },
    who: { on: { SET_WHO: { actions: "setWho" }, SET_WEIGHT_BEFORE: { actions: "setWeightBefore" }, ADVANCE: { target: "cost", guard: ({ context }) => context.who.trim().length >= 3 && context.weightBefore > 0 } } },
    cost: { on: { SET_COST: { actions: "setCost" }, ADVANCE: "keep" } },
    keep: { on: { SET_KEEP: { actions: "setKeep" }, ADVANCE: "release" } },
    release: { on: { SET_RELEASE: { actions: "setRelease" }, SET_WEIGHT_AFTER: { actions: "setWeightAfter" }, ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { who, cost, keep, release, weightBefore, weightAfter } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [listeningWho, setListeningWho] = useState(false);
  const [listeningCost, setListeningCost] = useState(false);
  const [listeningKeep, setListeningKeep] = useState(false);
  const [listeningRelease, setListeningRelease] = useState(false);

  const startRef = useRef<number>(Date.now());
  const endedRef = useRef(false);

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
        await say("forgiveness is not for them. it is for the part of you still stuck at the moment. one name. one weight. one cost. one keep. one release.", "guru");
      } else if (phase === "cost" && !cancelled) {
        sd.chime("drop", 0.08);
        await say("what does holding this cost you? a closeness. a sleep. a self-image. say it.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningCost(true); } catch {}
        }
      } else if (phase === "keep" && !cancelled) {
        sd.chime("rise", 0.08);
        await say("forgiveness is not forgetting. what wisdom or boundary do you keep?", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningKeep(true); } catch {}
        }
      } else if (phase === "release" && !cancelled) {
        sd.chime("drop", 0.08);
        await say("now — what you release. one sentence. speak it.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningRelease(true); } catch {}
        }
      } else if (phase === "integrate" && !cancelled) {
        sd.chime("drop", 0.12);
        stopVoice();
        await say("keep · release · walk on.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  // STT listeners
  useEffect(() => {
    if (phase !== "who") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setWho(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  useEffect(() => {
    if (phase !== "cost") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setCost(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  useEffect(() => {
    if (phase !== "keep") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setKeep(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  useEffect(() => {
    if (phase !== "release") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setRelease(t);
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
      outcome: who.trim().length >= 3 && cost.trim().length >= 4 && keep.trim().length >= 3 && release.trim().length >= 6 ? "completed" : "abandoned",
      signals: {
        who: who.trim(),
        weight_before: weightBefore,
        weight_after: weightAfter,
        weight_delta: weightBefore - weightAfter,
        cost: cost.trim(),
        keep: keep.trim(),
        release: release.trim(),
        total_ms: Date.now() - startRef.current,
      },
    });
  }, [onEnd, who, cost, keep, release, weightBefore, weightAfter, stopVoice, sd]);

  const handleSpokenWho = async () => {
    try { await transcribe.start(); setListeningWho(true); } catch {}
  };
  const stopSpokenWho = async () => {
    setListeningWho(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_WHO", value: r.transcript.trim() });
  };

  const handleSpokenCost = async () => {
    try { await transcribe.start(); setListeningCost(true); } catch {}
  };
  const stopSpokenCost = async () => {
    setListeningCost(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_COST", value: r.transcript.trim() });
  };

  const handleSpokenKeep = async () => {
    try { await transcribe.start(); setListeningKeep(true); } catch {}
  };
  const stopSpokenKeep = async () => {
    setListeningKeep(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_KEEP", value: r.transcript.trim() });
  };

  const handleSpokenRelease = async () => {
    try { await transcribe.start(); setListeningRelease(true); } catch {}
  };
  const stopSpokenRelease = async () => {
    setListeningRelease(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_RELEASE", value: r.transcript.trim() });
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.12, 0.04] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-violet-950/25 via-black to-slate-950/20 pointer-events-none"
      />
      {/* Aurora — violet/slate */}
      <motion.div
        animate={{ opacity: [0.03, 0.1, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-violet-400/15 via-transparent to-slate-400/10 pointer-events-none mix-blend-screen"
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
            className="w-1.5 h-1.5 rounded-full bg-violet-300/80 shadow-[0_0_10px_rgba(196,181,253,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.42em] text-violet-200/70 font-light" style={SERIF}>kṣamā · not for them</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-violet-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <ForgivenessDoorCanvas
          phase={phase}
          who={who}
          cost={cost}
          keep={keep}
          release={release}
          weightBefore={weightBefore}
          weightAfter={weightAfter}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-lg space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>kṣamā · not for them</h2>
              <p className="text-base italic text-white/80 leading-relaxed mb-10 max-w-md mx-auto" style={SERIF}>
                forgiveness is not for them. it is for the part of you still stuck at the moment.
                <br /><br />
                one name. one weight. one cost. one keep. one release.
              </p>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-violet-400/60 bg-violet-500/10 text-violet-100 text-sm uppercase tracking-wide hover:bg-violet-500/20 transition shadow-[0_0_24px_rgba(196,181,253,0.2)]"
              >
                begin
              </motion.button>
            </motion.div>
          )}

          {phase === "who" && (
            <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md pointer-events-auto">
              <p className="text-xl italic text-center mb-3" style={SERIF}>one name your body still stiffens around.</p>
              <p className="text-sm text-white/45 italic text-center mb-4" style={SERIF}>could be yourself.</p>
              <input value={who} onChange={(e) => send({ type: "SET_WHO", value: e.target.value })}
                placeholder="a name"
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-white/95 placeholder:text-white/25 text-base italic focus:outline-none focus:border-violet-300/40 mb-3 text-center" style={SERIF} />
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-1">weight · in body</p>
              <input type="range" min={0} max={10} value={weightBefore}
                onChange={(e) => send({ type: "SET_WEIGHT_BEFORE", value: Number(e.target.value) })}
                className="w-full accent-violet-300/70 mb-6" />
              <motion.button
                disabled={who.trim().length < 3 || weightBefore === 0}
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-8 py-3 rounded-full border text-sm uppercase tracking-[0.4em] ${
                  who.trim().length >= 3 && weightBefore > 0 ? "border-violet-300/60 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                what does holding it cost you
              </motion.button>
            </motion.div>
          )}

          {phase === "cost" && (
            <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md pointer-events-auto">
              <p className="text-xl italic text-center mb-6" style={SERIF}>what part of your life pays rent to this hurt?</p>
              <textarea value={cost}
                onChange={(e) => send({ type: "SET_COST", value: e.target.value })}
                rows={4}
                placeholder="a closeness · a sleep · a self-image"
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-white/85 italic focus:outline-none focus:border-violet-300/40 mb-6 resize-none"
                style={SERIF}
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenCost}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningCost ? "border-violet-400/60 bg-violet-500/15 text-violet-100 animate-pulse shadow-[0_0_20px_rgba(196,181,253,0.2)]" : "border-white/15 text-white/40 hover:border-violet-300/50"
                  }`}
                >
                  {listeningCost ? "● listening — tap to finish" : "speak cost"}
                </button>
              </div>
              <motion.button
                disabled={cost.trim().length < 4}
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-2.5 rounded-full border border-white/30 text-xs uppercase tracking-[0.4em] hover:bg-white/5"
                style={SERIF}
              >
                what you'll keep
              </motion.button>
            </motion.div>
          )}

          {phase === "keep" && (
            <motion.div key="k" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md pointer-events-auto">
              <p className="text-xl italic text-center mb-6" style={SERIF}>forgiveness is not forgetting. what wisdom or boundary do you keep?</p>
              <textarea value={keep}
                onChange={(e) => send({ type: "SET_KEEP", value: e.target.value })}
                placeholder="i keep the lesson · not the leash"
                rows={3}
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-white/95 placeholder:text-white/25 text-base italic focus:outline-none focus:border-violet-300/40 mb-6 resize-none"
                style={SERIF}
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenKeep}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningKeep ? "border-violet-400/60 bg-violet-500/15 text-violet-100 animate-pulse shadow-[0_0_20px_rgba(196,181,253,0.2)]" : "border-white/15 text-white/40 hover:border-violet-300/50"
                  }`}
                >
                  {listeningKeep ? "● listening — tap to finish" : "speak keep"}
                </button>
              </div>
              <motion.button
                disabled={keep.trim().length < 3}
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-2.5 rounded-full border border-white/30 text-xs uppercase tracking-[0.4em] hover:bg-white/5"
                style={SERIF}
              >
                what you release
              </motion.button>
            </motion.div>
          )}

          {phase === "release" && (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md pointer-events-auto">
              <p className="text-lg italic text-white/85 mb-3 text-center" style={SERIF}>one sentence · what you're setting down tonight.</p>
              <textarea value={release}
                onChange={(e) => send({ type: "SET_RELEASE", value: e.target.value })}
                placeholder="i put down …"
                rows={3}
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-white/95 placeholder:text-white/25 text-base italic focus:outline-none focus:border-violet-300/40 mb-4 resize-none"
                style={SERIF}
              />
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-1">weight · now</p>
              <input type="range" min={0} max={10} value={weightAfter}
                onChange={(e) => send({ type: "SET_WEIGHT_AFTER", value: Number(e.target.value) })}
                className="w-full accent-violet-300/70 mb-6" />
              <motion.button
                disabled={release.trim().length < 6}
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-6 py-3 rounded-full border text-sm uppercase tracking-[0.4em] ${
                  release.trim().length >= 6 ? "border-violet-300/60 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                pass the door
              </motion.button>
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="int" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-t from-violet-400/20 to-slate-400/15 blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>keep · release · walk on.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-violet-200/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function ForgivenessDoor() {
  const g = getLabGame("forgiveness-door")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}