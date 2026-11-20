// FEAR LADDER — Flagship Grade
// Name seven fears, smallest to largest. Rate grip (1-10). Mark if it ever actually happened.
// The ladder reveals which fears are rehearsal vs. memory.
// Multi-sensor: mic (breath/STT), TTS (guru), STT (spoken fears), haptics, sound design
// Canvas: animated ladder with rungs lighting up
// XState: intro → climb (7 rungs) → reveal → integrate

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
import FearLadderCanvas from "./FearLadderCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };
const RUNGS = 7;

interface Rung { fear: string; grip: number; lived: boolean; }
type Phase = "intro" | "climb" | "reveal" | "integrate";

type Ctx = { rungs: Array<{ fear: string; grip: number; lived: boolean }>; step: number; }

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "SUBMIT" }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    submit: assign(({ context, event }) => {
      // We'll handle the actual rung data via state updates outside the machine
      return { ...context, step: context.step + 1 };
    }),
  },
}).createMachine({
  id: "fearLadder",
  initial: "intro",
  context: { rungs: [], step: 0 },
  states: {
    intro: { on: { ADVANCE: "climb" } },
    climb: { on: { SUBMIT: { actions: "submit", target: "climb", guard: ({ context }) => context.step < 7 } } },
    reveal: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { step } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [rungs, setRungs] = useState<Array<{ fear: string; grip: number; lived: boolean }>>([]);
  const [fear, setFear] = useState("");
  const [grip, setGrip] = useState(5);
  const [lived, setLived] = useState(false);
  const [listening, setListening] = useState(false);

  const startedAt = useRef(Date.now());
  const endedRef = useRef(false);

  useEffect(() => {
    sd.bed("void", 0.04);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // STT for spoken fear
  useEffect(() => {
    if (phase !== "climb") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setFear(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "intro") {
        sd.chime("rise", 0.06);
        await say("seven rungs. smallest to largest. name it. rate it. mark if it lived. most fears are films you've already seen.", "guru");
      } else if (phase === "reveal" && !cancelled) {
        sd.chime("drop", 0.1);
        const livedCount = rungs.filter(r => r.lived).length;
        await say(`${rungs.length} fears named. ${livedCount} have actually happened. the rest are films your mind has been paying rent to screen, night after night.`, "guru");
      } else if (phase === "integrate") {
        sd.chime("drop", 0.12);
        stopVoice();
        await say("most fears are films you've already seen. the ladder shows you which ones are just rent.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  // STT for spoken fear
  useEffect(() => {
    if (phase !== "climb") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setFear(t);
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  const handleSubmit = useCallback(() => {
    if (fear.trim().length < 3) return;
    setRungs(prev => [...prev, { fear: fear.trim(), grip, lived }]);
    setFear(""); setGrip(5); setLived(false);
    send({ type: "SUBMIT" });
    buzz("tap");
  }, [fear, grip, lived]);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    const avg = rungs.length ? Math.round((rungs.reduce((a, r) => a + r.grip, 0) / rungs.length) * 10) / 10 : 0;
    const lived = rungs.filter(r => r.lived).length;

    onEnd({
      outcome: rungs.length >= 7 ? "completed" : "abandoned",
      signals: {
        fears_named: rungs.length,
        avg_grip: avg,
        already_lived: lived,
        rehearsal_only: rungs.length - lived,
        total_ms: Date.now() - startedAt.current,
      },
    });
  }, [onEnd, rungs, stopVoice, sd]);

  const handleSpoken = async () => {
    try { await transcribe.start(); } catch {}
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.05, 0.15, 0.05], y: [0, -12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-t from-rose-950/20 via-black to-black pointer-events-none"
      />
      {/* Aurora — rose */}
      <motion.div
        animate={{ opacity: [0.03, 0.12, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-t from-rose-400/15 via-transparent to-transparent pointer-events-none mix-blend-screen"
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
          <span className="text-[10px] uppercase tracking-[0.5em] text-rose-200/70 font-light" style={SERIF}>fear ladder · rung {step + 1} / 7</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-rose-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <FearLadderCanvas
          phase={phase}
          rungs={rungs}
          step={step}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-md space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>the ladder of fear</h2>
              <p className="text-base italic text-white/80 leading-relaxed max-w-md mx-auto mb-10" style={SERIF}>
                seven rungs, smallest to largest. name each fear. rate its grip. mark whether it has ever actually happened — or lives only in rehearsal.
                <br /><br />
                most fears are films you have already seen.
              </p>
              <motion.button
                onClick={() => { startedAt.current = Date.now(); send({ type: "ADVANCE" }); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-rose-400/60 bg-rose-500/10 text-rose-100 text-sm uppercase tracking-wide hover:bg-rose-500/20 transition shadow-[0_0_24px_rgba(251,113,133,0.2)]"
              >
                begin the climb
              </motion.button>
            </motion.div>
          )}

          {phase === "climb" && (
            <motion.div key={`c-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-lg space-y-8 pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.4em] text-rose-200/60 mb-4" style={SERIF}>
                rung {step + 1} of 7 · {step < 3 ? "small" : step < 5 ? "medium" : "large"}
              </div>
              <h3 className="text-xl italic text-center leading-relaxed mb-6" style={SERIF}>name the fear</h3>
              <textarea
                value={fear}
                onChange={(e) => setFear(e.target.value)}
                placeholder="name it in one line…"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-slate-100 placeholder:text-white/25 text-base italic focus:outline-none focus:border-rose-300/40 mb-5"
                style={SERIF}
              />
              
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] uppercase tracking-[0.3em] text-white/50 mb-2" style={SERIF}>
                  <span>grip</span><span className="tabular-nums">{grip} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={grip}
                  onChange={(e) => setGrip(parseInt(e.target.value))}
                  className="w-full accent-rose-400/70"
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setLived(!lived)}
                  className={`w-full px-4 py-2.5 rounded-full border text-[11px] uppercase tracking-[0.3em] ${
                    lived ? "border-amber-400/50 bg-amber-400/10 text-amber-100" : "border-white/20 text-white/60 hover:border-white/40"
                  }`}
                  style={SERIF}
                >
                  {lived ? "✓ this has actually happened before" : "has this ever actually happened?"}
                </button>
                
                <button
                  onClick={handleSpoken}
                  className={`w-full px-4 py-2.5 rounded-full border text-xs uppercase tracking-wide ${
                    listening ? "border-rose-400/60 bg-rose-500/15 text-rose-100 animate-pulse shadow-[0_0_20px_rgba(251,113,133,0.2)]" : "border-white/15 text-white/40 hover:border-rose-300/50"
                  }`}
                >
                  {listening ? "● listening — tap to finish" : "speak fear"}
                </button>
              </div>

              <motion.button
                disabled={fear.trim().length < 3}
                onClick={() => {
                  if (fear.trim().length < 3) return;
                  setRungs(prev => [...prev, { fear: fear.trim(), grip, lived }]);
                  setFear(""); setGrip(5); setLived(false);
                  send({ type: "SUBMIT" });
                  buzz("tap");
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-6 py-3 rounded-full border text-xs uppercase tracking-[0.4em] ${
                  fear.trim().length >= 3 ? "border-rose-400/60 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                {step >= 6 ? "see the ladder" : "next rung"}
              </motion.button>
            </motion.div>
          )}

          {phase === "reveal" && (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg text-center space-y-8 pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.5em] text-rose-200/60 mb-6" style={SERIF}>the ladder</div>
              <ol className="space-y-2 mb-8 text-left">
                {rungs.map((r, i) => (
                  <li key={i} className={`px-4 py-3 rounded-lg border italic ${
                    r.lived ? "border-amber-400/40 bg-amber-400/5 text-amber-100" : "border-white/15 bg-white/5"
                  }`} style={SERIF}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm"><span className="text-white/40 text-xs mr-2">{i + 1}.</span>{r.fear}</span>
                      <span className="text-xs text-white/50 whitespace-nowrap">grip {r.grip} · {r.lived ? "lived" : "rehearsal"}</span>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="text-base italic text-white/80 leading-relaxed mb-8" style={SERIF}>
                {rungs.filter(r => r.lived).length} of {rungs.length} have actually happened. The rest are films your mind has been paying rent to screen, night after night.
              </p>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
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
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-t from-rose-400/20 to-transparent blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                most fears are films you've already seen. the ladder shows you which ones are just rent.
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

export default function FearLadder() {
  const g = getLabGame("fear-ladder")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}