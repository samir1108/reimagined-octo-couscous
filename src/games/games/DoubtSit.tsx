// DOUBT SIT — Flagship Grade
// Saṃśaya · Name the doubt. Sit 90s. Note what remains true.
// Multi-sensor: mic (breath/STT), TTS (guru), STT (spoken reflection), haptics, sound design
// Canvas: animated doubt visualization with truth emergence
// XState: intro → name → sit (90s) → true → integrate

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
import DoubtSitCanvas from "./DoubtSitCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };
const SIT_SECONDS = 90;

type Phase = "intro" | "name" | "sit" | "true" | "integrate";

type Ctx = { doubt: string; grip: number; truth: string };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "SET_DOUBT"; value: string }
      | { type: "SET_GRIP"; value: number }
      | { type: "SET_TRUTH"; value: string }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    setDoubt: assign(({ context, event }) => ({ ...context, doubt: event.value })),
    setGrip: assign(({ context, event }) => ({ ...context, grip: event.value })),
    setTruth: assign(({ context, event }) => ({ ...context, truth: event.value })),
  },
}).createMachine({
  id: "doubtSit",
  initial: "intro",
  context: { doubt: "", grip: 7, truth: "" },
  states: {
    intro: { on: { ADVANCE: "name" } },
    name: { on: { SET_DOUBT: { actions: "setDoubt", target: "sit", guard: ({ context }) => context.doubt.trim().length >= 3 } } },
    sit: { on: { ADVANCE: "true" } },
    true: { on: { SET_TRUTH: { actions: "setTruth" }, ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { doubt, grip, truth } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [seconds, setSeconds] = useState(SIT_SECONDS);
  const [truthListening, setTruthListening] = useState(false);

  const startRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const endedRef = useRef(false);

  useEffect(() => {
    sd.bed("void", 0.04);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Timer effect
  useEffect(() => {
    if (phase !== "sit") return;
    timerRef.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          send({ type: "ADVANCE" });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "name") {
        sd.chime("rise", 0.06);
        await say("name the doubt. then sit with it. don't solve it — just keep it company. after ninety seconds, say what remains true.", "guru");
      } else if (phase === "sit" && !cancelled) {
        sd.chime("rise", 0.08);
        await say("don't solve it. just keep it company. ninety seconds.", "guru");
      } else if (phase === "true" && !cancelled) {
        sd.chime("drop", 0.08);
        await say("what remains true — even inside this doubt? speak it.", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setTruthListening(true); } catch {}
        }
      } else if (phase === "integrate") {
        if (truthListening) {
          setTruthListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) send({ type: "SET_TRUTH", value: r.transcript.trim() });
        }
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the doubt is a room. this is the door.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  // STT for spoken truth
  useEffect(() => {
    if (phase !== "true") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setTruth(t);
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

    onEnd({
      outcome: truth.trim().length >= 6 ? "completed" : "abandoned",
      signals: {
        doubt: doubt.trim(),
        initial_grip: grip,
        truth: truth.trim(),
        total_ms: Date.now() - startRef.current,
      },
    });
  }, [onEnd, doubt, grip, truth, stopVoice, sd]);

  const handleSpokenTruth = async () => {
    try { await transcribe.start(); setTruthListening(true); } catch {}
  };
  const stopSpokenTruth = async () => {
    setTruthListening(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_TRUTH", value: r.transcript.trim() });
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.12, 0.3, 0.12] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-black to-indigo-950/25 pointer-events-none"
      />
      {/* Aurora — indigo */}
      <motion.div
        animate={{ opacity: [0.03, 0.1, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
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
            className="w-1.5 h-1.5 rounded-full bg-indigo-300/80 shadow-[0_0_10px_rgba(125,211,252,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.42em] text-indigo-200/60" style={SERIF}>saṃśaya · {phase === "sit" ? `${Math.floor(left/60)}:${String(left%60).padStart(2,"0")}` : ""}</span>
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
        <DoubtSitCanvas
          phase={phase}
          doubt={doubt}
          grip={grip}
          truth={truth}
          seconds={left}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-md space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>saṃśaya</h2>
              <p className="text-base italic text-white/80 leading-relaxed mb-10 max-w-md mx-auto" style={SERIF}>
                name the doubt. sit with it. don't solve it — just keep it company. after ninety seconds, say what remains true.
              </p>
              <motion.button
                onClick={() => { startRef.current = Date.now(); send({ type: "ADVANCE" }); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-indigo-400/60 bg-indigo-500/10 text-indigo-100 text-sm uppercase tracking-wide hover:bg-indigo-500/20 transition shadow-[0_0_24px_rgba(125,211,252,0.2)]"
              >
                sit with it
              </motion.button>
            </motion.div>
          )}

          {phase === "name" && (
            <motion.div key="n" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.4em] text-indigo-200/60 mb-4 text-center" style={SERIF}>what are you doubting today?</div>
              <p className="text-sm text-white/50 italic text-center mb-4" style={SERIF}>the path · a person · yourself · the whole thing</p>
              <textarea value={doubt} onChange={(e) => send({ type: "SET_DOUBT", value: e.target.value })} rows={3}
                placeholder="say it plain" className="w-full bg-white/[0.03] border border-white/15 rounded-xl p-4 text-white/95 placeholder:text-white/25 italic focus:outline-none focus:border-indigo-300/40 mb-4 resize-none" style={SERIF} />
              <div className="space-y-3 mb-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 text-center mb-1" style={SERIF}>grip · how tight</p>
                <input type="range" min={0} max={10} value={grip} onChange={(e) => send({ type: "SET_GRIP", value: +e.target.value })} className="w-full accent-indigo-300" />
              </div>
              <motion.button
                disabled={!doubt.trim()}
                onClick={() => { startRef.current = Date.now(); send({ type: "ADVANCE" }); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-full text-sm border ${doubt.trim() ? "border-indigo-300/60 text-indigo-100 bg-indigo-500/10 hover:bg-indigo-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"}`}
              >
                sit with it · 90s
              </motion.button>
            </motion.div>
          )}

          {phase === "sit" && (
            <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-xl italic text-white/85 mb-2 max-w-md mx-auto" style={SERIF}>{doubt}</p>
              <p className="text-white/40 italic mt-3" style={SERIF}>don't solve it · just keep it company</p>
              <p className="text-white/50 tabular-nums text-xl mt-6" style={SERIF}>
                {Math.floor(left/60)}:{String(left%60).padStart(2,"0")}
              </p>
            </motion.div>
          )}

          {phase === "true" && (
            <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.4em] text-indigo-200/60 mb-4 text-center" style={SERIF}>what remains true?</div>
              <textarea value={truth} onChange={(e) => send({ type: "SET_TRUTH", value: e.target.value })} rows={3}
                placeholder="one honest sentence"
                className="w-full bg-transparent border-b border-white/20 py-2 mb-6 text-white/85 italic focus:outline-none focus:border-indigo-300/60 resize-none" style={SERIF} />
              <div className="space-y-3">
                <button
                  onClick={handleSpokenTruth}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    truthListening ? "border-indigo-400/60 bg-indigo-500/15 text-indigo-100 animate-pulse shadow-[0_0_20px_rgba(125,211,252,0.2)]" : "border-white/15 text-white/40 hover:border-indigo-300/50"
                  }`}
                >
                  {truthListening ? "● listening — tap to finish" : "speak truth"}
                </button>
              </div>
              <motion.button
                disabled={!truth.trim()}
                onClick={() => { send({ type: "ADVANCE" }); buzz("tap"); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-full text-sm border ${truth.trim() ? "border-indigo-300/60 text-indigo-100 bg-indigo-500/10 hover:bg-indigo-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"}`}
              >
                close
              </motion.button>
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
                the doubt is a room. this is the door.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Timer for sit phase */}
      {phase === "sit" && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
          <div className="h-1.5 bg-white/10 rounded-full w-48">
            <motion.div
              animate={{ width: `${Math.max(0, (1 - left / SIT_SECONDS)) * 100}%` }}
              transition={{ duration: 1000, ease: "linear" }}
              className="h-full bg-indigo-400/70"
            />
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">{Math.floor(left/60)}:{String(left%60).padStart(2,"0")}</p>
        </div>
      )}

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

export default function DoubtSit() {
  const g = getLabGame("doubt-sit")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}