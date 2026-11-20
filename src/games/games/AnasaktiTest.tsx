// ANĀSAKTI TEST — Flagship Grade
// Gītā 2.47: karmaṇy-evādhikāras te mā phaleṣu kadācana.
// You have a right to action, never to its fruit. Name one action
// in front of you. Name the fruit you're gripping. Then release
// the fruit — in one sentence — and keep the action.
// Multi-sensor: mic (breath/STT), TTS (guru), STT (spoken entries), haptics, sound design
// Canvas: animated grip/release visualization with particle flow
// XState: intro → action → fruit → grip → release → verdict → integrate

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
import AnasaktiTestCanvas from "./AnasaktiTestCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };

type Phase = "intro" | "action" | "fruit" | "grip" | "release" | "verdict" | "integrate";

type Ctx = { action: string; fruit: string; release: string; gripBefore: number; gripAfter: number };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "SET_ACTION"; value: string }
      | { type: "SET_FRUIT"; value: string }
      | { type: "SET_GRIP_BEFORE"; value: number }
      | { type: "SET_RELEASE"; value: string }
      | { type: "SET_GRIP_AFTER"; value: number }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    setAction: assign(({ context, event }) => ({ ...context, action: event.value })),
    setFruit: assign(({ context, event }) => ({ ...context, fruit: event.value })),
    setGripBefore: assign(({ context, event }) => ({ ...context, gripBefore: event.value })),
    setRelease: assign(({ context, event }) => ({ ...context, release: event.value })),
    setGripAfter: assign(({ context, event }) => ({ ...context, gripAfter: event.value })),
  },
}).createMachine({
  id: "anasaktiTest",
  initial: "intro",
  context: { action: "", fruit: "", release: "", gripBefore: 7, gripAfter: 5 },
  states: {
    intro: { on: { ADVANCE: "action" } },
    action: { on: { SET_ACTION: { actions: "setAction", target: "fruit" } } },
    fruit: { on: { SET_FRUIT: { actions: "setFruit", target: "grip" } } },
    grip: { on: { SET_GRIP_BEFORE: { actions: "setGripBefore", target: "release" } } },
    release: { on: { SET_RELEASE: { actions: "setRelease", target: "gripAfter" } } },
    gripAfter: { on: { SET_GRIP_AFTER: { actions: "setGripAfter", target: "verdict" } } },
    verdict: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { action, fruit, release, gripBefore, gripAfter } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [listeningAction, setListeningAction] = useState(false);
  const [listeningFruit, setListeningFruit] = useState(false);
  const [listeningRelease, setListeningRelease] = useState(false);

  const startedAt = useRef(Date.now());
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
        await say("you have a right to action, never to its fruit. name one action. name the fruit you grip. then release the fruit — and keep the action.", "guru");
      } else if (phase === "action") {
        sd.chime("rise", 0.08);
        await say("the doing, not the outcome. speak it or type it.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningAction(true); } catch {}
        }
      } else if (phase === "fruit") {
        sd.chime("drop", 0.08);
        await say("what fruit are you gripping? outcome, praise, being seen. name it.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningFruit(true); } catch {}
        }
      } else if (phase === "grip") {
        sd.chime("rise", 0.1);
        await say("how tight is the grip on that fruit? zero is loose. ten is fused.", "guru");
      } else if (phase === "release") {
        sd.chime("drop", 0.12);
        await say("keep the action. release the fruit. one sentence — what you offer, and to what.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningRelease(true); } catch {}
        }
      } else if (phase === "verdict") {
        sd.chime("drop", 0.1);
        const delta = gripBefore - gripAfter;
        await say(`grip moved from ${gripBefore} to ${gripAfter}. delta: ${delta}. the action remains. the fruit was released.`, "guru");
      } else if (phase === "integrate") {
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the action remains. the fruit was released. that is anāsakti — action without attachment to fruit.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase, gripBefore, gripAfter]);

  // STT listeners
  useEffect(() => {
    if (phase !== "action") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setAction(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  useEffect(() => {
    if (phase !== "fruit") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setFruit(t);
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
      outcome: action.trim().length >= 5 && fruit.trim().length >= 4 && release.trim().length >= 6 ? "completed" : "abandoned",
      signals: {
        action: action.trim(),
        clungFruit: fruit.trim(),
        gripBefore,
        gripAfter,
        gripDelta: gripBefore - gripAfter,
        releaseLine: release.trim(),
        total_ms: Date.now() - startedAt.current,
      },
    });
  }, [onEnd, action, fruit, release, gripBefore, gripAfter, stopVoice, sd]);

  const handleSpokenAction = async () => {
    try { await transcribe.start(); setListeningAction(true); } catch {}
  };
  const stopSpokenAction = async () => {
    setListeningAction(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_ACTION", value: r.transcript.trim() });
  };

  const handleSpokenFruit = async () => {
    try { await transcribe.start(); setListeningFruit(true); } catch {}
  };
  const stopSpokenFruit = async () => {
    setListeningFruit(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_FRUIT", value: r.transcript.trim() });
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
        animate={{ opacity: [0.05, 0.15, 0.05], y: [0, -12, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-orange-900/25 via-black to-emerald-950/20 pointer-events-none"
      />
      {/* Aurora — orange/emerald */}
      <motion.div
        animate={{ opacity: [0.04, 0.12, 0.04], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-orange-400/15 via-transparent to-emerald-400/10 pointer-events-none mix-blend-screen"
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
            className="w-1.5 h-1.5 rounded-full bg-orange-300/80 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.42em] text-orange-200/70 font-light" style={SERIF}>anāsakti</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-orange-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <AnasaktiTestCanvas
          phase={phase}
          action={action}
          fruit={fruit}
          release={release}
          gripBefore={gripBefore}
          gripAfter={gripAfter}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-md space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>anāsakti test</h2>
              <p className="text-base italic text-white/80 leading-relaxed mb-10 max-w-md mx-auto" style={SERIF}>
                you have a right to action, never to its fruit. name one action. name the fruit you grip. then release the fruit — and keep the action.
              </p>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-orange-400/60 bg-orange-500/10 text-orange-100 text-sm uppercase tracking-wide hover:bg-orange-500/20 transition shadow-[0_0_24px_rgba(251,191,36,0.2)]"
              >
                begin
              </motion.button>
            </motion.div>
          )}

          {phase === "action" && (
            <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.4em] text-orange-200/60 mb-3 text-center" style={SERIF}>one action in front of you</div>
              <p className="text-lg italic text-center leading-relaxed mb-6" style={SERIF}>the doing, not the outcome.</p>
              <textarea
                value={action}
                onChange={(e) => send({ type: "SET_ACTION", value: e.target.value })}
                placeholder="the work itself…"
                rows={3}
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-orange-300/40 mb-4 resize-none"
                style={SERIF}
                autoFocus
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenAction}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningAction ? "border-orange-400/60 bg-orange-500/15 text-orange-100 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.2)]" : "border-white/15 text-white/40 hover:border-orange-300/50"
                  }`}
                >
                  {listeningAction ? "● listening — tap to finish" : "speak action"}
                </button>
              </div>
              <motion.button
                disabled={action.trim().length < 5}
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-8 py-3 rounded-full border text-xs uppercase tracking-[0.4em] ${
                  action.trim().length >= 5 ? "border-orange-400/60 bg-orange-500/10 text-orange-100 hover:bg-orange-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                name the fruit
              </motion.button>
            </motion.div>
          )}

          {phase === "fruit" && (
            <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.4em] text-orange-200/60 mb-3 text-center" style={SERIF}>the fruit you're gripping</div>
              <p className="text-lg italic text-center leading-relaxed mb-6" style={SERIF}>outcome, praise, result, being seen a certain way.</p>
              <textarea
                value={fruit}
                onChange={(e) => send({ type: "SET_FRUIT", value: e.target.value })}
                placeholder="what you want to come of it…"
                rows={3}
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-orange-300/40 mb-4 resize-none"
                style={SERIF}
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenFruit}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningFruit ? "border-orange-400/60 bg-orange-500/15 text-orange-100 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.2)]" : "border-white/15 text-white/40 hover:border-orange-300/50"
                  }`}
                >
                  {listeningFruit ? "● listening — tap to finish" : "speak fruit"}
                </button>
              </div>
              <motion.button
                disabled={fruit.trim().length < 4}
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-8 py-3 rounded-full border text-xs uppercase tracking-[0.4em] ${
                  fruit.trim().length >= 4 ? "border-orange-400/60 bg-orange-500/10 text-orange-100 hover:bg-orange-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                measure the grip
              </motion.button>
            </motion.div>
          )}

          {phase === "grip" && (
            <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-2xl italic text-white/90 mb-3" style={SERIF}>how tight is the grip — now?</p>
              <p className="text-xs uppercase tracking-[0.35em] text-white/40 mb-3 mt-8">grip on the fruit, 0–10</p>
              <div className="w-full flex items-center gap-3 mb-8">
                <span className="text-white/40 text-sm w-4">0</span>
                <input type="range" min={0} max={10} value={gripBefore}
                  onChange={(e) => send({ type: "SET_GRIP_BEFORE", value: Number(e.target.value) })}
                  className="flex-1 accent-orange-300" />
                <span className="text-white/80 text-sm w-6 text-right tabular-nums">{gripBefore}</span>
              </div>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-orange-400/60 bg-orange-500/10 text-orange-100 text-sm uppercase tracking-wide hover:bg-orange-500/20 transition shadow-[0_0_24px_rgba(251,191,36,0.2)]"
              >
                release the fruit
              </motion.button>
            </motion.div>
          )}

          {phase === "release" && (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-2xl italic text-white/90 mb-3" style={SERIF}>keep the action. release the fruit.</p>
              <p className="text-sm text-white/50 italic mb-6" style={SERIF}>one sentence. what you offer, and to what.</p>
              <textarea
                value={release}
                onChange={(e) => send({ type: "SET_RELEASE", value: e.target.value })}
                placeholder="i do this, and let the fruit belong to…"
                rows={3}
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-orange-300/40 mb-4 resize-none"
                style={SERIF}
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenRelease}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningRelease ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-100 animate-pulse shadow-[0_0_20px_rgba(110,231,183,0.2)]" : "border-white/15 text-white/40 hover:border-emerald-300/50"
                  }`}
                >
                  {listeningRelease ? "● listening — tap to finish" : "speak release"}
                </button>
              </div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/40 mb-3">grip now</p>
              <div className="w-full flex items-center gap-3 mb-8">
                <span className="text-white/40 text-sm w-4">0</span>
                <input type="range" min={0} max={10} value={gripAfter}
                  onChange={(e) => send({ type: "SET_GRIP_AFTER", value: Number(e.target.value) })}
                  className="flex-1 accent-emerald-300" />
                <span className="text-white/80 text-sm w-6 text-right tabular-nums">{gripAfter}</span>
              </div>
              <motion.button
                disabled={release.trim().length < 6}
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-8 py-3 rounded-full border text-xs uppercase tracking-[0.4em] ${
                  release.trim().length >= 6 ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                close
              </motion.button>
            </motion.div>
          )}

          {phase === "verdict" && (
            <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg text-center">
              <p className="text-2xl italic leading-relaxed mb-8 max-w-md mx-auto" style={SERIF}>
                grip moved from {gripBefore} to {gripAfter}. delta: {gripBefore - gripAfter}. the action remains. the fruit was released.
              </p>
              <motion.button
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-orange-400/60 bg-orange-500/10 text-orange-100 text-sm uppercase tracking-wide hover:bg-orange-500/20 transition shadow-[0_0_24px_rgba(251,191,36,0.2)]"
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
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-orange-400/20 to-emerald-400/15 blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the action remains. the fruit was released. that is anāsakti — action without attachment to fruit.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-orange-200/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function AnasaktiTest() {
  const g = getLabGame("anasakti-test")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}