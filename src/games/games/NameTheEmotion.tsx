// NAME THE EMOTION — Flagship Grade
// Affect labeling (Lieberman 2007) → PFC regulation of amygdala
// Multi-sensor: mic (breath/voice), TTS (guru), STT (spoken naming), haptics, sound design
// Canvas: animated emotion storm visualization
// XState: pick → rate → breathe → reflect → integrate

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
import NameEmotionCanvas from "./NameEmotionCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };

const EMOTIONS = [
  "anxious", "angry", "sad", "lonely", "afraid", "ashamed",
  "restless", "numb", "tired", "envious", "hurt", "overwhelmed",
  "tender", "open", "calm", "grateful",
];

type Phase = "pick" | "rate" | "breathe" | "reflect" | "integrate";

type Ctx = { picked: string[]; intensity: number | null };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: { type: "TOGGLE"; emotion: string } | { type: "SET_INTENSITY"; value: number } | { type: "ADVANCE" } | { type: "FINALIZE" };
  },
  actions: {
    toggleEmotion: assign(({ context, event }) => ({
      picked: context.picked.includes(event.emotion)
        ? context.picked.filter(e => e !== event.emotion)
        : [...context.picked, event.emotion],
    })),
    setIntensity: assign(({ context, event }) => ({ ...context, intensity: event.value })),
  },
}).createMachine({
  id: "nameEmotion",
  initial: "pick",
  context: { picked: [], intensity: null },
  states: {
    pick: { on: { TOGGLE: { actions: "toggleEmotion" }, ADVANCE: { target: "rate", guard: ({ context }) => context.picked.length > 0 } } },
    rate: { on: { SET_INTENSITY: { actions: "setIntensity", target: "breathe" } } },
    breathe: { on: { ADVANCE: "reflect" } },
    reflect: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const picked = state.context.picked;
  const intensity = state.context.intensity;

  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);

  const [spokenWords, setSpokenWords] = useState<string[]>([]);
  const [spokenReflection, setSpokenReflection] = useState("");
  const [listeningSpoken, setListeningSpoken] = useState(false);
  const [listeningReflection, setListeningReflection] = useState(false);
  const [breatheStart, setBreatheStart] = useState<number | null>(null);

  const sessionStartRef = useRef(Date.now());
  const endedRef = useRef(false);
  const breatheTimerRef = useRef<number | undefined>(undefined);
  const phaseRef = useRef(phase);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Ambient bed
  useEffect(() => {
    sd.bed("temple", 0.04);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "pick") {
        sd.chime("rise", 0.06);
        await say("what is moving inside you? speak each word, or tap to choose. naming is the practice.", "guru");
        if (cancelled) return;
      } else if (phase === "rate") {
        sd.chime("drop", 0.08);
        await say("how loud is the storm? one is a whisper. ten is thunder.", "guru");
      } else if (phase === "breathe") {
        sd.chime("rise", 0.1);
        await say("breathe with what you named. let each exhale carry it.", "guru");
        setBreatheStart(Date.now());
        breatheTimerRef.current = window.setTimeout(() => {
          if (!endedRef.current && phaseRef.current === "breathe") send({ type: "ADVANCE" });
        }, 45000); // 45s breathing
      } else if (phase === "reflect") {
        sd.chime("drop", 0.1);
        await say("what shifted? speak it.", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setListeningReflection(true); } catch {}
      } else if (phase === "integrate") {
        if (listeningReflection) {
          setListeningReflection(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setSpokenReflection(r.transcript.trim().slice(0, 300));
        }
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the name was the handle. the feeling was the door. you opened it.", "guru");
      } else if (phase === "done") {
        finish();
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  // Sample breath during breathe phase
  const breathSamplesRef = useRef<number[]>([]);
  useEffect(() => {
    if (phase !== "breathe") return;
    breathSamplesRef.current.push(breath.envelope);
  }, [breath.envelope, phase]);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (breatheTimerRef.current) clearTimeout(breatheTimerRef.current);
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    const durationMs = Date.now() - sessionStartRef.current;
    const breatheDuration = breatheStart ? Date.now() - breatheStart : 0;
    const avgBreathEnvelope = breathSamplesRef.current.length > 0
      ? breathSamplesRef.current.reduce((a, b) => a + b, 0) / breathSamplesRef.current.length
      : 0;

    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: durationMs,
        emotions_named: picked,
        count: picked.length,
        spoken_words: spokenWords,
        initial_intensity: intensity,
        breathe_duration_ms: breatheDuration,
        avg_breath_envelope: +avgBreathEnvelope.toFixed(3),
        reflection: spokenReflection || null,
        mic_ready: breath.ready,
        cycles_detected: breath.cycles,
        sighs_detected: breath.sighs,
      },
    });
  }, [onEnd, picked, spokenWords, intensity, spokenReflection, breatheStart, stopVoice, sd]);

  const handleToggle = (emotion: string) => {
    send({ type: "TOGGLE", emotion });
    buzz("tap");
  };

  const handleIntensity = (value: number) => {
    send({ type: "SET_INTENSITY", value });
    buzz("tap");
  };

  const startSpoken = async () => {
    try { await transcribe.start(); setListeningSpoken(true); } catch {}
  };

  const stopSpoken = async () => {
    setListeningSpoken(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) {
      const words = r.transcript.toLowerCase().split(/\s+/).filter(w => EMOTIONS.includes(w));
      setSpokenWords(words);
      if (words.length > 0 && picked.length === 0) {
        words.forEach(w => send({ type: "TOGGLE", emotion: w }));
      }
    }
  };

  const stopReflection = async () => {
    setListeningReflection(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setSpokenReflection(r.transcript.trim().slice(0, 300));
  };

  const PHASE_PROGRESS = { pick: 0.2, rate: 0.4, breathe: 0.6, reflect: 0.8, integrate: 1 };
  const phaseProgress = PHASE_PROGRESS[phase] || 0;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.06, 0.18, 0.06], y: [0, -12, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-slate-950 to-rose-950/30 pointer-events-none"
      />
      {/* Aurora — indigo/amber */}
      <motion.div
        animate={{ opacity: [0.04, 0.14, 0.04], scale: [1, 1.08, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-indigo-400/15 via-transparent to-amber-400/10 pointer-events-none mix-blend-screen"
      />
      {/* Aurora — rose offset */}
      <motion.div
        animate={{ opacity: [0.03, 0.1, 0.03], scale: [1, 1.05, 1] }}
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
            className="w-1.5 h-1.5 rounded-full bg-indigo-300/80 shadow-[0_0_10px_rgba(165,180,252,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.5em] text-indigo-200/70 font-light" style={SERIF}>name the emotion</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-indigo-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-20">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-400 via-amber-400 to-rose-400"
          style={{ width: `${phaseProgress * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <NameEmotionCanvas
          phase={phase}
          picked={picked}
          intensity={intensity}
          breathEnvelope={breath.envelope}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "pick" && (
            <motion.div key="pick" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-3xl text-center space-y-8 pointer-events-auto">
              <p className="text-3xl font-extralight text-white/95 tracking-[0.02em]" style={SERIF}>what is moving inside you?</p>

              {/* Emotion grid */}
              <div className="flex flex-wrap gap-2.5 justify-center">
                {EMOTIONS.map((e) => {
                  const on = picked.includes(e);
                  return (
                    <motion.button
                      key={e}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleToggle(e)}
                      style={SERIF}
                      className={`px-5 py-2.5 rounded-full text-base italic transition border ${
                        on
                          ? "bg-indigo-500/20 border-indigo-300/60 text-indigo-50 shadow-[0_0_22px_rgba(165,180,252,0.25)]"
                          : "bg-white/5 border-white/15 text-white/70 hover:border-indigo-200/40 hover:text-indigo-100"
                      }`}
                    >
                      {e}
                    </motion.button>
                  );
                })}
              </div>

              {/* Spoken input */}
              <div className="space-y-3">
                {spokenWords.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-400/30 text-indigo-100"
                  >
                    <p className="text-[10px] uppercase tracking-[0.3em] mb-2">heard</p>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {spokenWords.map((w, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full text-sm bg-indigo-400/30 text-indigo-50">{w}</span>
                      ))}
                    </div>
                  </motion.div>
                )}
                <button
                  onClick={listeningSpoken ? stopSpoken : startSpoken}
                  disabled={listeningSpoken && phase !== "pick"}
                  className={`px-6 py-2.5 rounded-full border text-sm uppercase tracking-wide transition ${
                    listeningSpoken
                      ? "border-indigo-400/60 bg-indigo-500/15 text-indigo-100 animate-pulse shadow-[0_0_24px_rgba(165,180,252,0.25)]"
                      : "border-white/20 bg-white/5 text-white/70 hover:border-indigo-300/50 hover:text-indigo-100 hover:bg-indigo-500/10"
                  }`}
                >
                  {listeningSpoken ? "● listening — tap to finish" : "speak emotions"}
                </button>
              </div>

              <motion.button
                disabled={picked.length === 0}
                onClick={() => send({ type: "ADVANCE" })}
                className={`px-8 py-3 rounded-full border text-[11px] uppercase tracking-[0.4em] transition ${
                  picked.length > 0
                    ? "border-indigo-300/60 bg-indigo-500/10 text-indigo-50 hover:bg-indigo-500/20"
                    : "border-white/15 bg-white/5 text-white/40 cursor-not-allowed"
                }`}
              >
                continue
              </motion.button>
            </motion.div>
          )}

          {phase === "rate" && (
            <motion.div key="rate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <p className="text-3xl font-extralight text-white/95 tracking-[0.02em]" style={SERIF}>how loud is the storm?</p>
              <p className="text-[11px] uppercase tracking-[0.4em] text-white/45">1 · whisper &nbsp;·&nbsp; 10 · thunder</p>

              <div className="flex flex-wrap gap-2.5 justify-center">
                {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                  <motion.button
                    key={n}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleIntensity(n)}
                    style={SERIF}
                    className={
                      "w-14 h-14 rounded-full border-2 text-lg italic transition " +
                      (intensity === n
                        ? "border-amber-300/70 bg-amber-500/20 text-amber-50 shadow-[0_0_24px_rgba(251,191,36,0.3)]"
                        : "border-white/20 bg-white/5 text-white/80 hover:border-amber-200/50 hover:bg-amber-500/10 hover:text-amber-50")
                    }
                  >
                    {n}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === "breathe" && (
            <motion.div key="breathe" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.02em]" style={SERIF}>breathe with what you named</p>

              {picked.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-2 justify-center"
                >
                  {picked.map((e, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      className="px-3 py-1.5 rounded-full text-sm bg-indigo-500/20 text-indigo-100 border border-indigo-400/30"
                    >
                      {e}
                    </motion.span>
                  ))}
                </motion.div>
              )}

              {intensity !== null && (
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">storm · {intensity} / 10</p>
              )}

              <p className="text-sm text-white/50 italic max-w-md mx-auto" style={SERIF}>
                each exhale carries it. stay with the breath.
              </p>
            </motion.div>
          )}

          {phase === "reflect" && (
            <motion.div key="reflect" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <p className="text-2xl font-extralight text-white/95 tracking-[0.02em]" style={SERIF}>what shifted?</p>

              {spokenReflection ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto"
                >
                  <p className="text-lg italic text-indigo-100/95" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 16px rgba(165,180,252,0.3)" }}>"{spokenReflection}"</p>
                </motion.div>
              ) : listeningReflection ? (
                <motion.button
                  onClick={stopReflection}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 rounded-full border-2 border-indigo-400/60 bg-indigo-500/15 text-indigo-100 text-sm uppercase tracking-wide animate-pulse shadow-[0_0_24px_rgba(165,180,252,0.25)]"
                >
                  ● listening — tap when done
                </motion.button>
              ) : (
                <p className="text-white/40">preparing…</p>
              )}
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-indigo-400/20 to-amber-400/15 blur-xl"
              />
              {spokenReflection && (
                <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>"{spokenReflection}"</p>
              )}
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the name was the handle. the feeling was the door. you opened it.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-indigo-200/70 transition-all duration-500"
      >
        complete →
      </button>
    </div>
  );
}

export default function NameTheEmotion() {
  const g = getLabGame("name-the-emotion")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}