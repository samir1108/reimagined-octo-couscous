// LOOP MIRROR — Flagship Grade
// Speak a looping thought. AI rewrites it. Hear it back. Notice the gap.
// Multi-sensor: mic (STT + breath), TTS (guru + AI mirror), haptics, sound design
// Canvas: animated mirror with recursive reflections
// XState: settle → speak → process → hear → integrate

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { setup, assign } from "xstate";
import { useMachine } from "@xstate/react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useBreathMic } from "../shell/useBreathMic";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import LoopMirrorCanvas from "./LoopMirrorCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };

type Phase = "settle" | "speak" | "process" | "hear" | "integrate";

type Ctx = { live: string; spoken: string; rewrite: string };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: 
      | { type: "SET_LIVE"; value: string }
      | { type: "SET_REWRITE"; value: string }
      | { type: "ADVANCE" }
      | { type: "FINALIZE" };
  },
  actions: {
    setLive: assign(({ context, event }) => ({ ...context, live: event.value })),
    setRewrite: assign(({ context, event }) => ({ ...context, rewrite: event.value })),
  },
}).createMachine({
  id: "loopMirror",
  initial: "settle",
  context: { live: "", spoken: "", rewrite: "" },
  states: {
    settle: { on: { ADVANCE: "speak" } },
    speak: { on: { SET_LIVE: { actions: "setLive" }, ADVANCE: "process" } },
    process: { on: { SET_REWRITE: { actions: "setRewrite", target: "hear" } } },
    hear: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { live, spoken, rewrite } = state.context;

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [listening, setListening] = useState(false);

  const sessionStartRef = useRef(Date.now());
  const endedRef = useRef(false);

  useEffect(() => {
    sd.bed("void", 0.04);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.08);
        await say("say one looping thought — the one that keeps returning.", "guru");
        if (!cancelled) {
          await new Promise(r => setTimeout(r, 500));
          if (!cancelled) send({ type: "ADVANCE" });
        }
      } else if (phase === "speak") {
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (phase === "process") {
        setListening(false);
        const r = await transcribe.stop().catch(() => null);
        const text = r?.transcript?.trim() || live.trim();
        send({ type: "SET_LIVE", value: text });
        if (!cancelled) {
          sd.chime("rise", 0.12);
          try {
            const { data } = await supabase.functions.invoke("reflect-game", {
              body: { gameId: "loop-mirror", signals: { spoken: text }, durationMs: 0, outcome: "in_progress" },
            });
            const rw = ((data?.reflection || text) + "").trim();
            send({ type: "SET_REWRITE", value: rw });
            if (!cancelled) {
              sd.chime("drop", 0.1);
              await say(rw, "guru");
              buzz("tap");
            }
          } catch {
            send({ type: "SET_REWRITE", value: text });
            if (!cancelled) {
              sd.chime("drop", 0.1);
              await say(text, "guru");
              buzz("tap");
            }
          }
        }
      } else if (phase === "hear") {
        // Wait for user to advance
      } else if (phase === "integrate") {
        sd.chime("drop", 0.1);
        await say("the loop was never the truth. only the echo.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        spoken,
        mirrored: rewrite,
        mic_ready: breath.ready,
        mic_cycles: breath.cycles,
      },
    });
  }, [onEnd, spoken, rewrite, stopVoice, sd, breath]);

  // Live transcript polling during speak phase
  useEffect(() => {
    if (phase !== "speak") return;
    const poll = setInterval(() => {
      const t = (transcribe as any).transcript || (transcribe as any).partial;
      if (typeof t === "string") send({ type: "SET_LIVE", value: t });
    }, 250);
    return () => clearInterval(poll);
  }, [phase]);

  const handleSpeakAdvance = () => {
    if (live.trim().length >= 4) {
      send({ type: "ADVANCE" });
      buzz("tap");
    }
  };

  const handleHearAdvance = () => {
    send({ type: "ADVANCE" });
    buzz("tap");
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.14, 0.04], y: [0, -12, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-violet-950/25 via-black to-indigo-950/25 pointer-events-none"
      />
      {/* Aurora — violet/indigo */}
      <motion.div
        animate={{ opacity: [0.03, 0.12, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-violet-400/15 via-transparent to-indigo-400/10 pointer-events-none mix-blend-screen"
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

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <LoopMirrorCanvas
          phase={phase}
          live={live}
          rewrite={rewrite}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Top status */}
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-violet-300/80 shadow-[0_0_10px_rgba(196,181,253,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.5em] text-violet-200/70 font-light" style={SERIF}>loop mirror</span>
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
        <LoopMirrorCanvas
          phase={phase}
          live={live}
          rewrite={rewrite}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "settle" && (
            <motion.div key="s" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center max-w-lg space-y-8 pointer-events-auto">
              <p className="text-4xl font-extralight text-white/95 tracking-[0.02em]" style={SERIF}>loop mirror</p>
              <p className="text-base italic text-white/80 leading-relaxed max-w-md mx-auto" style={SERIF}>
                the thought that keeps returning — speak it once.
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

          {phase === "speak" && (
            <motion.div key="sp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center max-w-md mx-auto gap-6 pointer-events-auto">
              <p className="text-[10px] uppercase tracking-[0.42em] text-violet-100/60">speak the loop</p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={SERIF}
                className="text-violet-50/90 text-xl italic min-h-[6rem] max-w-sm leading-relaxed"
              >
                {live || "…"}
              </motion.p>
              {listening && (
                <motion.button
                  disabled={live.trim().length < 4}
                  onClick={() => send({ type: "ADVANCE" })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={SERIF}
                  className={`px-6 py-2.5 rounded-full border text-base italic transition ${
                    live.trim().length >= 4
                      ? "border-violet-400/60 text-violet-100 bg-violet-500/10 animate-pulse shadow-[0_0_25px_rgba(196,181,253,0.25)]"
                      : "border-white/10 text-white/25 cursor-not-allowed"
                  }`}
                >
                  mirror it
                </motion.button>
              )}
            </motion.div>
          )}

          {phase === "process" && (
            <motion.div key="pr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center z-20 px-8 text-center pointer-events-none">
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                style={SERIF}
                className="text-violet-100/70 italic text-lg"
              >
                the mirror is listening…
              </motion.p>
            </motion.div>
          )}

          {phase === "hear" && (
            <motion.div key="h" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1.4 }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center gap-6 pointer-events-auto">
              <p className="text-[10px] uppercase tracking-[0.42em] text-violet-100/70">the mirror</p>
              <motion.p
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={SERIF}
                className="text-xl sm:text-2xl italic text-violet-50/90 leading-relaxed max-w-md drop-shadow-[0_0_20px_rgba(196,181,253,0.2)]"
              >
                "{rewrite || "…"}"
              </motion.p>
              <motion.button
                onClick={() => send({ type: "ADVANCE" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={SERIF}
                className="mt-2 px-5 py-2 rounded-full border border-violet-400/60 bg-violet-500/10 text-violet-100 text-sm uppercase tracking-wide hover:bg-violet-500/20 transition shadow-[0_0_24px_rgba(196,181,253,0.2)]"
              >
                received
              </motion.button>
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="i" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-lg text-center space-y-6 pointer-events-auto">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-violet-400/20 to-indigo-400/15 blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the loop was never the truth. only the echo.
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

export default function LoopMirror() {
  const g = getLabGame("loop-mirror")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}