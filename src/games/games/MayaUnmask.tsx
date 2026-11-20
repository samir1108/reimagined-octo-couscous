// MĀYĀ UNMASK — Flagship Grade
// Māyā is not illusion in the flat sense — it is the taking of
// appearance for essence. Name one recent appearance you treated
// as real: the mood, the story, the certainty. Then name what
// was actually there behind it. Notice the gap.
// Multi-sensor: mic (breath/STT), TTS (guru), STT (spoken entries), haptics, sound design
// Canvas: animated veil visualization with gap measurement
// XState: intro → appearance → believed → actual → gap → verdict → integrate

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
import MayaUnmaskCanvas from "./MayaUnmaskCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };

type Phase = "intro" | "appearance" | "believed" | "actual" | "gap" | "verdict" | "integrate";

type Ctx = { appearance: string; believed: string; actual: string; gap: number };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "SET_APPEARANCE"; value: string }
      | { type: "SET_BELIEVED"; value: string }
      | { type: "SET_ACTUAL"; value: string }
      | { type: "SET_GAP"; value: number }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    setAppearance: assign(({ context, event }) => ({ ...context, appearance: event.value })),
    setBelieved: assign(({ context, event }) => ({ ...context, believed: event.value })),
    setActual: assign(({ context, event }) => ({ ...context, actual: event.value })),
    setGap: assign(({ context, event }) => ({ ...context, gap: event.value })),
  },
}).createMachine({
  id: "mayaUnmask",
  initial: "intro",
  context: { appearance: "", believed: "", actual: "", gap: 6 },
  states: {
    intro: { on: { ADVANCE: "appearance" } },
    appearance: { on: { SET_APPEARANCE: { actions: "setAppearance", target: "believed" } } },
    believed: { on: { SET_BELIEVED: { actions: "setBelieved", target: "actual" } } },
    actual: { on: { SET_ACTUAL: { actions: "setActual", target: "gap" } } },
    gap: { on: { SET_GAP: { actions: "setGap", target: "verdict" } } },
    verdict: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { appearance, believed, actual, gap } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [listeningAppearance, setListeningAppearance] = useState(false);
  const [listeningBelieved, setListeningBelieved] = useState(false);
  const [listeningActual, setListeningActual] = useState(false);

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
        await say("māyā is not illusion — it is taking appearance for essence. name one recent appearance you took as real.", "guru");
      } else if (phase === "appearance") {
        sd.chime("rise", 0.08);
        await say("a mood, a story, a certainty about someone. what was the surface that convinced you?", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningAppearance(true); } catch {}
        }
      } else if (phase === "believed") {
        sd.chime("drop", 0.08);
        await say("what did you take to be true? the conclusion the appearance produced. speak it.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningBelieved(true); } catch {}
        }
      } else if (phase === "actual") {
        sd.chime("rise", 0.1);
        await say("what was actually there — behind it? the plainer truth, without the projection.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningActual(true); } catch {}
        }
      } else if (phase === "gap") {
        sd.chime("drop", 0.12);
        await say(`the gap between appearance and fact is ${gap} out of 10. the width of māyā is the width of your work.`, "guru");
      } else if (phase === "verdict") {
        sd.chime("drop", 0.1);
        await say("the appearance was never the truth. what was there was simpler. the gap is where the work lives.", "guru");
      } else if (phase === "integrate") {
        sd.chime("drop", 0.12);
        stopVoice();
        await say("māyā was never the world. it was your taking of it. the gap is where you wake up.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase, gap]);

  // STT listeners
  useEffect(() => {
    if (phase !== "appearance") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setAppearance(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  useEffect(() => {
    if (phase !== "believed") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setBelieved(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  useEffect(() => {
    if (phase !== "actual") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setActual(t);
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
      outcome: appearance.trim().length >= 6 && believed.trim().length >= 5 && actual.trim().length >= 5 ? "completed" : "abandoned",
      signals: {
        appearance: appearance.trim(),
        whatIBelieved: believed.trim(),
        whatWasActuallyThere: actual.trim(),
        felGap: gap,
        total_ms: Date.now() - startedAt.current,
      },
    });
  }, [onEnd, appearance, believed, actual, gap, stopVoice, sd]);

  const handleSpokenAppearance = async () => {
    try { await transcribe.start(); setListeningAppearance(true); } catch {}
  };
  const stopSpokenAppearance = async () => {
    setListeningAppearance(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_APPEARANCE", value: r.transcript.trim() });
  };

  const handleSpokenBelieved = async () => {
    try { await transcribe.start(); setListeningBelieved(true); } catch {}
  };
  const stopSpokenBelieved = async () => {
    setListeningBelieved(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_BELIEVED", value: r.transcript.trim() });
  };

  const handleSpokenActual = async () => {
    try { await transcribe.start(); setListeningActual(true); } catch {}
  };
  const stopSpokenActual = async () => {
    setListeningActual(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_ACTUAL", value: r.transcript.trim() });
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.10, 0.20, 0.10] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-violet-900/25 via-black to-black pointer-events-none"
      />
      {/* Aurora — violet */}
      <motion.div
        animate={{ opacity: [0.03, 0.12, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-violet-400/15 via-transparent to-transparent pointer-events-none mix-blend-screen"
      />
      {/* Aurora — rose offset */}
      <motion.div
        animate={{ opacity: [0.02, 0.08, 0.02], scale: [1, 1.05, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute inset-0 bg-gradient-to-t from-rose-500/12 via-transparent to-transparent pointer-events-none mix-blend-screen"
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
          <span className="text-[10px] uppercase tracking-[0.42em] text-violet-200/70 font-light" style={SERIF}>māyā · unmask{phase === "appearance" ? " · surface" : phase === "believed" ? " · believed" : phase === "actual" ? " · actual" : phase === "gap" ? " · gap" : ""}</span>
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
        <MayaUnmaskCanvas
          phase={phase}
          appearance={appearance}
          believed={believed}
          actual={actual}
          gap={gap}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-md space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>māyā · unmask</h2>
              <p className="text-base italic text-white/80 leading-relaxed mb-10 max-w-md mx-auto" style={SERIF}>
                māyā is not illusion — it is taking appearance for essence. name one recent appearance you took as real.
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

          {phase === "appearance" && (
            <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.4em] text-violet-200/60 mb-3 text-center" style={SERIF}>the surface</div>
              <p className="text-lg italic text-center leading-relaxed mb-6" style={SERIF}>a mood, a story, a certainty about someone. the surface that convinced you.</p>
              <textarea
                value={appearance}
                onChange={(e) => send({ type: "SET_APPEARANCE", value: e.target.value })}
                placeholder="the surface that convinced you…"
                rows={4}
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-violet-300/40 mb-4 resize-none"
                style={SERIF}
                autoFocus
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenAppearance}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningAppearance ? "border-violet-400/60 bg-violet-500/15 text-violet-100 animate-pulse shadow-[0_0_20px_rgba(196,181,253,0.2)]" : "border-white/15 text-white/40 hover:border-violet-300/50"
                  }`}
                >
                  {listeningAppearance ? "● listening — tap to finish" : "speak appearance"}
                </button>
              </div>
              <motion.button
                disabled={appearance.trim().length < 6}
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-8 py-3 rounded-full border text-xs uppercase tracking-[0.4em] ${
                  appearance.trim().length >= 6 ? "border-violet-400/60 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                what you believed
              </motion.button>
            </motion.div>
          )}

          {phase === "believed" && (
            <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.4em] text-violet-200/60 mb-3 text-center" style={SERIF}>what did you take to be true?</div>
              <p className="text-lg italic text-center leading-relaxed mb-6" style={SERIF}>the conclusion the appearance produced.</p>
              <textarea
                value={believed}
                onChange={(e) => send({ type: "SET_BELIEVED", value: e.target.value })}
                placeholder="the story you moved as if it were fact…"
                rows={3}
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-violet-300/40 mb-4 resize-none"
                style={SERIF}
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenBelieved}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningBelieved ? "border-violet-400/60 bg-violet-500/15 text-violet-100 animate-pulse shadow-[0_0_20px_rgba(196,181,253,0.2)]" : "border-white/15 text-white/40 hover:border-violet-300/50"
                  }`}
                >
                  {listeningBelieved ? "● listening — tap to finish" : "speak believed"}
                </button>
              </div>
              <motion.button
                disabled={believed.trim().length < 5}
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-8 py-3 rounded-full border text-xs uppercase tracking-[0.4em] ${
                  believed.trim().length >= 5 ? "border-violet-400/60 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                what was actually there
              </motion.button>
            </motion.div>
          )}

          {phase === "actual" && (
            <motion.div key="x" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.4em] text-violet-200/60 mb-3 text-center" style={SERIF}>what was actually there</div>
              <p className="text-lg italic text-center leading-relaxed mb-6" style={SERIF}>the plainer truth, without the projection.</p>
              <textarea
                value={actual}
                onChange={(e) => send({ type: "SET_ACTUAL", value: e.target.value })}
                placeholder="the smaller, quieter fact…"
                rows={3}
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-violet-300/40 mb-4 resize-none"
                style={SERIF}
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenActual}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningActual ? "border-violet-400/60 bg-violet-500/15 text-violet-100 animate-pulse shadow-[0_0_20px_rgba(196,181,253,0.2)]" : "border-white/15 text-white/40 hover:border-violet-300/50"
                  }`}
                >
                  {listeningActual ? "● listening — tap to finish" : "speak actual"}
                </button>
              </div>
              <motion.button
                disabled={actual.trim().length < 5}
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-8 py-3 rounded-full border text-xs uppercase tracking-[0.4em] ${
                  actual.trim().length >= 5 ? "border-violet-400/60 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                measure the gap
              </motion.button>
            </motion.div>
          )}

          {phase === "gap" && (
            <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-2xl italic text-white/90 mb-3" style={SERIF}>how wide was the gap?</p>
              <p className="text-sm text-white/50 italic mb-8" style={SERIF}>between the appearance and the fact.</p>
              <div className="w-full flex items-center gap-3 mb-10">
                <span className="text-white/40 text-sm w-8">tiny</span>
                <input type="range" min={0} max={10} value={gap}
                  onChange={(e) => send({ type: "SET_GAP", value: Number(e.target.value) })}
                  className="flex-1 accent-violet-300" />
                <span className="text-white/40 text-sm w-10 text-right">chasm</span>
              </div>
              <p className="text-xs text-white/50 italic mb-8" style={SERIF}>the width of māyā is the width of your work.</p>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-violet-400/60 bg-violet-500/10 text-violet-100 text-sm uppercase tracking-wide hover:bg-violet-500/20 transition shadow-[0_0_24px_rgba(196,181,253,0.2)]"
              >
                seal the unmasking
              </motion.button>
            </motion.div>
          )}

          {phase === "verdict" && (
            <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg text-center">
              <p className="text-xl italic leading-relaxed mb-8 max-w-md mx-auto" style={SERIF}>
                the gap between appearance and fact was {gap} out of 10. the appearance was never the truth. what was there was simpler. the gap is where the work lives.
              </p>
              <motion.button
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-violet-400/60 bg-violet-500/10 text-violet-100 text-sm uppercase tracking-wide hover:bg-violet-500/20 transition shadow-[0_0_24px_rgba(196,181,253,0.2)]"
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
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-b from-violet-400/20 to-transparent blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                māyā was never the world. it was your taking of it. the gap is where you wake up.
              </p>
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

export default function MayaUnmask() {
  const g = getLabGame("maya-unmask")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}