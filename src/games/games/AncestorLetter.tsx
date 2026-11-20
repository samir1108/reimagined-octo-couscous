// ANCESTOR LETTER — Flagship Grade
// Two letters: one to an ancestor you never met, one to a descendant not yet born.
// Read aloud before submitting. The chain awareness changes the next hour.
// Multi-sensor: mic (breath/STT), TTS (guru), STT (spoken letters), haptics, sound design
// Canvas: animated chain visualization with particle flow
// XState: intro → ancestor → descendant → verdict → integrate

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
import AncestorLetterCanvas from "./AncestorLetterCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };

type Phase = "intro" | "ancestor" | "descendant" | "verdict" | "integrate";

type Ctx = { ancestor: string; descendant: string; aDwell: number; dDwell: number };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "TO_ANCESTOR" }
      | { type: "TO_DESCENDANT" }
      | { type: "TO_VERDICT" }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    toAncestor: assign(() => ({})),
    toDescendant: assign(() => ({})),
    toVerdict: assign(() => ({})),
  },
}).createMachine({
  id: "ancestorLetter",
  initial: "intro",
  context: { ancestor: "", descendant: "", aDwell: 0, dDwell: 0 },
  states: {
    intro: { on: { TO_ANCESTOR: { target: "ancestor" } } },
    ancestor: { on: { TO_DESCENDANT: { target: "descendant" } } },
    descendant: { on: { TO_VERDICT: { target: "verdict" } } },
    verdict: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [ancestor, setAncestor] = useState("");
  const [descendant, setDescendant] = useState("");
  const [listeningAncestor, setListeningAncestor] = useState(false);
  const [listeningDescendant, setListeningDescendant] = useState(false);

  const startRef = useRef(Date.now());
  const ancestorStartRef = useRef(0);
  const descendantStartRef = useRef(0);
  const endedRef = useRef(false);

  const [aDwell, setADwell] = useState(0);
  const [dDwell, setDDwell] = useState(0);

  useEffect(() => {
    sd.bed("temple", 0.05);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // STT for spoken ancestor letter
  useEffect(() => {
    if (phase !== "ancestor") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setAncestor(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  // STT for spoken descendant letter
  useEffect(() => {
    if (phase !== "descendant") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setDescendant(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "intro") {
        sd.chime("rise", 0.06);
        await say("you are a link in a chain. behind you: someone you never met. ahead: someone not yet born. write to both.", "guru");
      } else if (phase === "ancestor") {
        ancestorStartRef.current = Date.now();
        sd.chime("rise", 0.08);
        await say("write to the one before you. four, five, ten generations back. speak it before you submit.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningAncestor(true); } catch {}
        }
      } else if (phase === "descendant") {
        setADwell(Date.now() - ancestorStartRef.current);
        descendantStartRef.current = Date.now();
        sd.chime("drop", 0.08);
        await say("now write to the one after you. they will inherit what you carry. speak it.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setListeningDescendant(true); } catch {}
        }
      } else if (phase === "verdict") {
        sd.chime("drop", 0.1);
        setDDwell(Date.now() - descendantStartRef.current);
        await say(`two letters written. ${ancestor.trim().length + descendant.trim().length} characters across two centuries. the awareness that you are a middle link, not a destination, is what changes the next hour.`, "guru");
      } else if (phase === "integrate") {
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the letters stay with you. but the awareness that you are a middle link, not a destination, is what changes the next hour.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase, ancestor, descendant]);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    onEnd({
      outcome: ancestor.trim().length >= 20 && descendant.trim().length >= 20 ? "completed" : "abandoned",
      signals: {
        duration_ms: Date.now() - startRef.current,
        ancestor_chars: ancestor.trim().length,
        descendant_chars: descendant.trim().length,
        ancestor_dwell_ms: aDwell,
        descendant_dwell_ms: dDwell,
        total_ms: Date.now() - startRef.current,
      },
    });
  }, [onEnd, ancestor, descendant, aDwell, dDwell, stopVoice, sd]);

  const handleSpokenAncestor = async () => {
    try { await transcribe.start(); setListeningAncestor(true); } catch {}
  };
  const stopSpokenAncestor = async () => {
    setListeningAncestor(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setAncestor(r.transcript.trim());
  };

  const handleSpokenDescendant = async () => {
    try { await transcribe.start(); setListeningDescendant(true); } catch {}
  };
  const stopSpokenDescendant = async () => {
    setListeningDescendant(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setDescendant(r.transcript.trim());
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.12, 0.04], y: [0, -12, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-amber-900/20 via-black to-black pointer-events-none"
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
          <span className="text-[10px] uppercase tracking-[0.42em] text-amber-200/70 font-light" style={SERIF}>ancestor letter{phase === "ancestor" ? " · backward" : phase === "descendant" ? " · forward" : ""}</span>
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
        <AncestorLetterCanvas
          phase={phase}
          ancestor={ancestor}
          descendant={descendant}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-md space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>you are a link in a chain</h2>
              <p className="text-base italic text-white/80 leading-relaxed mb-10 max-w-md mx-auto" style={SERIF}>
                behind you: someone you never met, whose choices made you possible.<br />ahead of you: someone not yet born, whose life your choices will shape.
              </p>
              <motion.button
                onClick={() => send({ type: "TO_ANCESTOR" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-amber-400/60 bg-amber-500/10 text-amber-100 text-sm uppercase tracking-wide hover:bg-amber-500/20 transition shadow-[0_0_24px_rgba(251,191,36,0.2)]"
              >
                begin
              </motion.button>
            </motion.div>
          )}

          {phase === "ancestor" && (
            <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-lg space-y-8 pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.4em] text-amber-200/60 mb-3 text-center" style={SERIF}>to the one before you</div>
              <p className="text-lg italic text-center leading-relaxed mb-6" style={SERIF}>
                someone in your line — four, five, ten generations back — carried something you inherited without asking. write to them.
              </p>
              <textarea
                value={ancestor}
                onChange={(e) => setAncestor(e.target.value)}
                rows={7}
                placeholder="dear one before me…"
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-amber-300/40 mb-4 resize-none"
                style={SERIF}
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenAncestor}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningAncestor ? "border-amber-400/60 bg-amber-500/15 text-amber-100 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.2)]" : "border-white/15 text-white/40 hover:border-amber-300/50"
                  }`}
                >
                  {listeningAncestor ? "● listening — tap to finish" : "speak letter"}
                </button>
              </div>
              <motion.button
                disabled={ancestor.trim().length < 20}
                onClick={() => { send({ type: "TO_DESCENDANT" }); ancestorStartRef.current = Date.now(); buzz("tap"); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-6 py-3 rounded-full border text-xs uppercase tracking-[0.4em] ${
                  ancestor.trim().length >= 20 ? "border-amber-400/60 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                turn forward
              </motion.button>
            </motion.div>
          )}

          {phase === "descendant" && (
            <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-lg space-y-8 pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.4em] text-amber-200/60 mb-3 text-center" style={SERIF}>to the one after you</div>
              <p className="text-lg italic text-center leading-relaxed mb-6" style={SERIF}>
                someone will inherit what you carry — the loops you did not close, the courage you found, the silence you kept. write to them.
              </p>
              <textarea
                value={descendant}
                onChange={(e) => setDescendant(e.target.value)}
                rows={7}
                placeholder="dear one who comes after…"
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-amber-300/40 mb-4 resize-none"
                style={SERIF}
              />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenDescendant}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    listeningDescendant ? "border-amber-400/60 bg-amber-500/15 text-amber-100 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.2)]" : "border-white/15 text-white/40 hover:border-amber-300/50"
                  }`}
                >
                  {listeningDescendant ? "● listening — tap to finish" : "speak letter"}
                </button>
              </div>
              <motion.button
                disabled={descendant.trim().length < 20}
                onClick={() => { send({ type: "TO_VERDICT" }); descendantStartRef.current = Date.now(); buzz("tap"); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-6 py-3 rounded-full border text-xs uppercase tracking-[0.4em] ${
                  descendant.trim().length >= 20 ? "border-amber-400/60 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                seal both letters
              </motion.button>
            </motion.div>
          )}

          {phase === "verdict" && (
            <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg text-center">
              <div className="text-[10px] uppercase tracking-[0.5em] text-amber-200/60 mb-4" style={SERIF}>the chain</div>
              <p className="text-xl italic leading-relaxed mb-8 max-w-md mx-auto" style={SERIF}>
                you wrote {ancestor.trim().length + descendant.trim().length} characters across two centuries. the letters stay with you — but the awareness that you are a middle link, not a destination, is what changes the next hour.
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
                the letters stay with you. but the awareness that you are a middle link, not a destination, is what changes the next hour.
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

export default function AncestorLetter() {
  const g = getLabGame("ancestor-letter")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}