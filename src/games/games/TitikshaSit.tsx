// TITIKṢĀ SIT — Flagship Grade
// Titikṣā: the capacity to bear the pairs of opposites — heat and
// cold, praise and blame, gain and loss — without being moved.
// Name a current pair pressing on you. Sit sixty seconds with
// both sides present. Then report what shifted.
// Multi-sensor: mic (breath), TTS (guru), STT (spoken reflection), haptics, sound design
// Canvas: animated duality visualization with shift tracking
// XState: intro → pair → sit (60s) → report → integrate

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
import TitikshaSitCanvas from "./TitikshaSitCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };
const SIT_SECONDS = 60;

type Phase = "intro" | "pair" | "sit" | "report" | "integrate";

type Ctx = { heat: string; cold: string; movedBefore: number; movedAfter: number; shift: string };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "SET_HEAT"; value: string }
      | { type: "SET_COLD"; value: string }
      | { type: "SET_MOVED_BEFORE"; value: number }
      | { type: "SET_MOVED_AFTER"; value: number }
      | { type: "SET_SHIFT"; value: string }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    setHeat: assign(({ context, event }) => ({ ...context, heat: event.value })),
    setCold: assign(({ context, event }) => ({ ...context, cold: event.value })),
    setMovedBefore: assign(({ context, event }) => ({ ...context, movedBefore: event.value })),
    setMovedAfter: assign(({ context, event }) => ({ ...context, movedAfter: event.value })),
    setShift: assign(({ context, event }) => ({ ...context, shift: event.value })),
  },
}).createMachine({
  id: "titikshaSit",
  initial: "intro",
  context: { heat: "", cold: "", movedBefore: 7, movedAfter: 5, shift: "" },
  states: {
    intro: { on: { ADVANCE: "pair" } },
    pair: { on: { SET_HEAT: { actions: "setHeat" }, SET_COLD: { actions: "setCold" }, ADVANCE: { target: "sit", guard: ({ context }) => context.heat.trim().length >= 3 && context.cold.trim().length >= 3 } } },
    sit: { on: { ADVANCE: "report" } },
    report: { on: { SET_MOVED_AFTER: { actions: "setMovedAfter" }, SET_SHIFT: { actions: "setShift" }, ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { heat, cold, movedBefore, movedAfter, shift } = state.context;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [seconds, setSeconds] = useState(SIT_SECONDS);
  const [shiftListening, setShiftListening] = useState(false);

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
      if (phase === "pair") {
        sd.chime("rise", 0.06);
        await say("titikṣā is bearing both — heat and cold, praise and blame, gain and loss — without being moved. name your pair. then sit with both.", "guru");
      } else if (phase === "sit") {
        sd.chime("rise", 0.08);
        await say("sixty seconds. both sides present. don't fix. don't choose. just sit with the pair.", "guru");
      } else if (phase === "report") {
        sd.chime("drop", 0.1);
        await say("how much do they move you now? zero is still. ten is swept away. what shifted?", "guru");
        if (!cancelled) {
          try { await transcribe.start(); setShiftListening(true); } catch {}
        }
      } else if (phase === "integrate") {
        if (shiftListening) {
          setShiftListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) send({ type: "SET_SHIFT", value: r.transcript.trim().slice(0, 200) });
        }
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the pairs will keep coming. the practice is not choosing sides — it's sitting with both.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  // STT for spoken shift
  useEffect(() => {
    if (phase !== "report") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") setShift(t);
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

    const delta = movedBefore - movedAfter;

    onEnd({
      outcome: shift.trim().length >= 6 ? "completed" : "abandoned",
      signals: {
        heatPole: heat.trim(),
        coldPole: cold.trim(),
        movedBefore,
        movedAfter,
        movedDelta: delta,
        whatShifted: shift.trim(),
        total_ms: Date.now() - startRef.current,
      },
    });
  }, [onEnd, heat, cold, movedBefore, movedAfter, shift, stopVoice, sd]);

  const handleShiftSpoken = async () => {
    try { await transcribe.start(); setShiftListening(true); } catch {}
  };
  const stopShiftSpoken = async () => {
    setShiftListening(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) send({ type: "SET_SHIFT", value: r.transcript.trim().slice(0, 200) });
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.10, 0.20, 0.10] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-sky-900/20 pointer-events-none"
      />
      {/* Aurora — red/sky */}
      <motion.div
        animate={{ opacity: [0.03, 0.12, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-red-400/15 via-transparent to-sky-400/10 pointer-events-none mix-blend-screen"
      />
      {/* Aurora — rose offset */}
      <motion.div
        animate={{ opacity: [0.02, 0.08, 0.02], scale: [1, 1.05, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
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
            className="w-1.5 h-1.5 rounded-full bg-red-300/80 shadow-[0_0_10px_rgba(251,113,133,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.42em] text-red-200/70 font-light" style={SERIF}>titikṣā{phase === "sit" ? ` · ${seconds}s` : ""}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-red-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <TitikshaSitCanvas
          phase={phase}
          heat={heat}
          cold={cold}
          movedBefore={movedBefore}
          movedAfter={movedAfter}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-md space-y-8 pointer-events-auto">
              <h2 className="text-3xl italic mb-6" style={SERIF}>titikṣā</h2>
              <p className="text-base italic text-white/80 leading-relaxed mb-10 max-w-md mx-auto" style={SERIF}>
                titikṣā is bearing both — heat and cold, praise and blame, gain and loss — without being moved.
              </p>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border-2 border-red-400/60 bg-red-500/10 text-red-100 text-sm uppercase tracking-wide hover:bg-red-500/20 transition shadow-[0_0_24px_rgba(251,113,133,0.2)]"
              >
                begin
              </motion.button>
            </motion.div>
          )}

          {phase === "pair" && (
            <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <div className="text-[10px] uppercase tracking-[0.4em] text-red-200/60 mb-3 text-center" style={SERIF}>name your pair</div>
              <p className="text-lg italic text-center leading-relaxed mb-6" style={SERIF}>praise / blame — gain / loss — heat / cold.</p>
              <input value={heat} onChange={(e) => send({ type: "SET_HEAT", value: e.target.value })}
                placeholder="the hot pole…"
                className="w-full mb-3 bg-white/[0.03] border border-white/15 rounded-xl p-4 text-white/95 placeholder:text-white/25 italic focus:outline-none focus:border-red-300/40" style={SERIF} />
              <input value={cold} onChange={(e) => send({ type: "SET_COLD", value: e.target.value })}
                placeholder="the cold pole…"
                className="w-full mb-6 bg-white/[0.03] border border-white/15 rounded-xl p-4 text-white/95 placeholder:text-white/25 italic focus:outline-none focus:border-sky-300/40" style={SERIF} />
              <p className="text-xs uppercase tracking-[0.35em] text-white/40 mb-3">how much it moves you now</p>
              <div className="w-full flex items-center gap-3 mb-8">
                <span className="text-white/40 text-sm w-4">0</span>
                <input type="range" min={0} max={10} value={movedBefore}
                  onChange={(e) => send({ type: "SET_MOVED_BEFORE", value: Number(e.target.value) })}
                  className="flex-1 accent-red-300" />
                <span className="text-white/80 text-sm w-6 text-right tabular-nums">{movedBefore}</span>
              </div>
              <motion.button
                disabled={heat.trim().length < 3 || cold.trim().length < 3}
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-8 py-3 rounded-full border text-sm tracking-wide ${
                  heat.trim().length >= 3 && cold.trim().length >= 3 ? "border-red-400/60 bg-red-500/10 text-red-100 hover:bg-red-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                sit with both — 60s
              </motion.button>
            </motion.div>
          )}

          {phase === "sit" && (
            <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="rounded-xl border border-red-300/20 bg-red-500/[0.04] p-4 text-red-100/80 italic min-h-[70px] flex items-center justify-center" style={SERIF}>
                  {heat}
                </div>
                <div className="rounded-xl border border-sky-300/20 bg-sky-500/[0.04] p-4 text-sky-100/80 italic min-h-[70px] flex items-center justify-center" style={SERIF}>
                  {cold}
                </div>
              </div>
              <div className="text-5xl text-white/80 tabular-nums" style={SERIF}>{seconds}</div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/40 mt-6">breathe. don't fix.</p>
            </motion.div>
          )}

          {phase === "report" && (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center pointer-events-auto">
              <p className="text-2xl italic text-white/90 mb-3" style={SERIF}>how much do they move you now?</p>
              <div className="w-full flex items-center gap-3 mb-6">
                <span className="text-white/40 text-sm w-4">0</span>
                <input type="range" min={0} max={10} value={movedAfter}
                  onChange={(e) => send({ type: "SET_MOVED_AFTER", value: Number(e.target.value) })}
                  className="flex-1 accent-emerald-300" />
                <span className="text-white/80 text-sm w-6 text-right tabular-nums">{movedAfter}</span>
              </div>
              <p className="text-sm text-white/50 italic mb-4" style={SERIF}>one line — what shifted?</p>
              <textarea value={shift} onChange={(e) => send({ type: "SET_SHIFT", value: e.target.value })}
                placeholder="what became quieter, wider, more bearable…"
                rows={3}
                className="w-full mb-8 bg-white/[0.03] border border-white/15 rounded-xl p-4 text-white/95 placeholder:text-white/25 italic resize-none focus:outline-none focus:border-emerald-300/40" style={SERIF} />
              <div className="space-y-3">
                <button
                  onClick={handleShiftSpoken}
                  className={`px-4 py-3 rounded-full border text-xs uppercase tracking-wide ${
                    shiftListening ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-100 animate-pulse shadow-[0_0_20px_rgba(110,231,183,0.2)]" : "border-white/15 text-white/40 hover:border-emerald-300/50"
                  }`}
                >
                  {shiftListening ? "● listening — tap to finish" : "speak shift"}
                </button>
              </div>
              <motion.button
                disabled={shift.trim().length < 6}
                onClick={finish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-8 py-3 rounded-full border text-xs uppercase tracking-[0.4em] ${
                  shift.trim().length >= 6 ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20 transition" : "border-white/10 text-white/25 cursor-not-allowed"
                }`}
                style={SERIF}
              >
                close
              </motion.button>
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="int" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-red-400/20 to-sky-400/15 blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the pairs will keep coming. the practice is not choosing sides — it's sitting with both.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-red-200/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function TitikshaSit() {
  const g = getLabGame("titiksha-sit")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}