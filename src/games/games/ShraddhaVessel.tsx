// ŚRADDHA VESSEL — Flagship Grade
// Śraddhā is not belief. It is the vessel with which you receive.
// A shallow cup catches little rain. Name what you are trying to
// receive right now — a teaching, a person, a chapter of life —
// and honestly measure the size of your vessel.
// Multi-sensor: mic (breath/STT), TTS (guru), STT (spoken entries), haptics, sound design
// Canvas: animated vessel with leak/expand visualization
// XState: intro → receiving → vessel → leak → widen → integrate

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
import ShraddhaVesselCanvas from "./ShraddhaVesselCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };

type Phase = "intro" | "receiving" | "vessel" | "leak" | "widen" | "integrate";

type Ctx = { receiving: string; vessel: number; leak: string; widen: string };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "SET_RECEIVING"; value: string }
      | { type: "SET_VESSEL"; value: number }
      | { type: "SET_LEAK"; value: string }
      | { type: "SET_WIDEN"; value: string }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    setReceiving: assign(({ context, event }) => ({ ...context, receiving: event.value })),
    setVessel: assign(({ context, event }) => ({ ...context, vessel: event.value })),
    setLeak: assign(({ context, event }) => ({ ...context, leak: event.value })),
    setWiden: assign(({ context, event }) => ({ ...context, widen: event.value })),
  },
}).createMachine({
  id: "shraddhaVessel",
  initial: "intro",
  context: { receiving: "", vessel: 4, leak: "", widen: "" },
  states: {
    intro: { on: { ADVANCE: "receiving" } },
    receiving: { on: { SET_RECEIVING: { actions: "setReceiving" }, ADVANCE: { target: "vessel", guard: ({ context }) => context.receiving.trim().length >= 5 } } },
    vessel: { on: { SET_VESSEL: { actions: "setVessel" }, ADVANCE: "leak" } },
    leak: { on: { SET_LEAK: { actions: "setLeak" }, ADVANCE: { target: "widen", guard: ({ context }) => context.leak.trim().length >= 4 } } },
    widen: { on: { SET_WIDEN: { actions: "setWiden" }, ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { receiving, vessel, leak, widen } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [listeningReceiving, setListeningReceiving] = useState(false);
  const [listeningLeak, setListeningLeak] = useState(false);
  const [listeningWiden, setListeningWiden] = useState(false);

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
        await say("śraddhā is not belief. it is the vessel with which you receive. name what you are trying to receive — a teaching, a person, a chapter of life.", "guru");
      } else if (phase === "vessel" && !cancelled) {
        sd.chime("drop", 0.08);
        await say("how wide is your cup — honestly? zero is a thimble. ten is the ocean.", "guru");
      } else if (phase === "leak" && !cancelled) {
        sd.chime("drop", 0.08);
        await say("where does the vessel leak? cynicism, hurry, comparison, past wounds. name the crack.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningLeak(true); } catch {}
        }
      } else if (phase === "widen" && !cancelled) {
        sd.chime("rise", 0.1);
        await say("one act — this week — that widens the vessel. small. specific. yours.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningWiden(true); } catch {}
        }
      } else if (phase === "integrate") {
        if (listeningWiden) {
          setListeningWiden(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) send({ type: "SET_WIDEN", value: r.transcript.trim() });
        }
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the rain does not ask how wide the cup is. it only falls. make your vessel ready.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  // STT for receiving
  useEffect(() => {
    if (phase !== "receiving") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setReceiving(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  // STT for leak
  useEffect(() => {
    if (phase !== "leak") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setLeak(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  // STT for widen
  useEffect(() => {
    if (phase !== "widen") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setWiden(t);
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
      outcome: receiving.trim().length >= 5 && leak.trim().length >= 4 && widen.trim().length >= 6 ? "completed" : "abandoned",
      signals: {
        receiving: receiving.trim(),
        vessel_size: vessel,
        leak: leak.trim(),
        widen_act: widen.trim(),
        total_ms: Date.now() - startedAt.current,
      },
    });
  }, [onEnd, receiving, vessel, leak, widen, stopVoice, sd]);

  const handleSpokenReceiving = async () => {
    try { await transcribe.start(); setListeningReceiving(true); } catch {}
  };
  const stopSpokenReceiving = async () => {
    setListeningReceiving(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_RECEIVING", value: r.transcript.trim() });
  };

  const handleSpokenLeak = async () => {
    try { await transcribe.start(); setListeningLeak(true); } catch {}
  };
  const stopSpokenLeak = async () => {
    setListeningLeak(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_LEAK", value: r.transcript.trim() });
  };

  const handleSpokenWiden = async () => {
    try { await transcribe.start(); setListeningWiden(true); } catch {}
  };
  const stopSpokenWiden = async () => {
    setListeningWiden(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_WIDEN", value: r.transcript.trim() });
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.10, 0.20, 0.10] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-amber-900/25 via-black to-black pointer-events-none"
      />
      {/* Aurora — amber */}
      <motion.div
        animate={{ opacity: [0.03, 0.1, 0.03], scale: [1, 1.05, 1] }}
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
          <span className="text-[10px] uppercase tracking-[0.42em] text-amber-200/70 font-light" style={SERIF}>śraddhā · vessel{phase === "vessel" ? " · measure" : phase === "leak" ? " · leak" : phase === "widen" ? " · widen" : ""}</span>
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
        <ShraddhaVesselCanvas
          phase={phase}
          receiving={receiving}
          vessel={vessel}
          leak={leak}
          widen={widen}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-md space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>śraddhā · vessel</h2>
              <p className="text-base italic text-white/80 leading-relaxed mb-10 max-w-md mx-auto" style={SERIF}>
                śraddhā is not belief. it is the vessel with which you receive.
                <br /><br />
                a shallow cup catches little rain. name what you are trying to receive — a teaching, a person, a chapter of life.
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

          {phase === "receiving" && (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-2xl italic text-white/90 mb-3" style={SERIF}>what are you trying to receive?</p>
              <p className="text-sm text-white/50 italic mb-6" style={SERIF}>a teaching, a person, a chapter of life.</p>
              <textarea
                value={receiving}
                onChange={(e) => send({ type: "SET_RECEIVING", value: e.target.value })}
                placeholder="the rain you're standing under…"
                rows={3}
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-amber-300/40 mb-4 resize-none"
                style={SERIF}
                autoFocus
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenReceiving}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningReceiving ? "border-amber-400/60 bg-amber-500/15 text-amber-100 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.2)]" : "border-white/15 text-white/40 hover:border-amber-300/50"
                  }`}
                >
                  {listeningReceiving ? "● listening — tap to finish" : "speak receiving"}
                </button>
              </div>
              <motion.button
                disabled={receiving.trim().length < 5}
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-8 py-3 rounded-full border text-sm tracking-wide ${
                  receiving.trim().length >= 5 ? "border-amber-400/60 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                measure the vessel
              </motion.button>
            </motion.div>
          )}

          {phase === "vessel" && (
            <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-2xl italic text-white/90 mb-3" style={SERIF}>how wide is your cup — honestly?</p>
              <p className="text-xs uppercase tracking-[0.35em] text-white/40 mt-8 mb-3">vessel size, 0–10</p>
              <div className="w-full flex items-center gap-3 mb-8">
                <span className="text-white/40 text-sm w-10">thimble</span>
                <input type="range" min={0} max={10} value={vessel}
                  onChange={(e) => send({ type: "SET_VESSEL", value: Number(e.target.value) })}
                  className="flex-1 accent-amber-300" />
                <span className="text-white/40 text-sm w-8 text-right">ocean</span>
              </div>
              <button onClick={() => send({ type: "ADVANCE" })}
                className="px-8 py-3 border border-white/25 rounded-full text-sm tracking-wide hover:bg-white/5 transition">
                where it leaks
              </button>
            </motion.div>
          )}

          {phase === "leak" && (
            <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-2xl italic text-white/90 mb-3" style={SERIF}>where does the vessel leak?</p>
              <p className="text-sm text-white/50 italic mb-6" style={SERIF}>cynicism, hurry, comparison, past wounds.</p>
              <textarea
                value={leak}
                onChange={(e) => send({ type: "SET_LEAK", value: e.target.value })}
                placeholder="the crack that empties the cup…"
                rows={3}
                className="w-full mb-8 bg-white/[0.03] border border-white/15 rounded-xl p-4 text-white/95 placeholder:text-white/25 italic resize-none focus:outline-none focus:border-white/40" style={SERIF} />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenLeak}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningLeak ? "border-amber-400/60 bg-amber-500/15 text-amber-100 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.2)]" : "border-white/15 text-white/40 hover:border-amber-300/50"
                  }`}
                >
                  {listeningLeak ? "● listening — tap to finish" : "speak leak"}
                </button>
              </div>
              <button disabled={leak.trim().length < 4} onClick={() => send({ type: "ADVANCE" })}
                className="px-8 py-3 border border-white/25 rounded-full text-sm tracking-wide hover:bg-white/5 transition disabled:opacity-30">
                widen it
              </button>
            </motion.div>
          )}

          {phase === "widen" && (
            <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-2xl italic text-white/90 mb-3" style={SERIF}>one act — this week — that widens the vessel.</p>
              <p className="text-sm text-white/50 italic mb-6" style={SERIF}>small. specific. yours.</p>
              <textarea
                value={widen}
                onChange={(e) => send({ type: "SET_WIDEN", value: e.target.value })}
                placeholder="i will…"
                rows={3}
                className="w-full mb-8 bg-white/[0.03] border border-white/15 rounded-xl p-4 text-white/95 placeholder:text-white/25 italic resize-none focus:outline-none focus:border-white/40" style={SERIF} />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenWiden}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningWiden ? "border-amber-400/60 bg-amber-500/15 text-amber-100 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.2)]" : "border-white/15 text-white/40 hover:border-amber-300/50"
                  }`}
                >
                  {listeningWiden ? "● listening — tap to finish" : "speak widen"}
                </button>
              </div>
              <button disabled={widen.trim().length < 6} onClick={finish}
                className="px-8 py-3 border border-white/25 rounded-full text-sm tracking-wide hover:bg-white/5 transition disabled:opacity-30">
                close
              </button>
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
                the rain does not ask how wide the cup is. it only falls. make your vessel ready.
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

export default function ShraddhaVessel() {
  const g = getLabGame("shraddha-vessel")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}