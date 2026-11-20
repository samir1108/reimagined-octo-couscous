// ============================================================
// Japa 108 — Mantra repetition with wake-marks (FLAGSHIP GRADE)
// One syllable. 108 taps. Mark each moment the loop woke up again.
// Multi-sensor: mic (chant detection), TTS (guru), STT (reflection)
// Canvas: animated mala beads with haptic sync
// ============================================================
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import { useBreathMic } from "../shell/useBreathMic";
import JapaCanvas from "./JapaCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };
const TARGET_COUNT = 108;
const MAX_DURATION = 15 * 60 * 1000; // 15 minutes max

type Phase = "settle" | "mantra" | "reflect" | "integrate";

interface WakeMark {
  count: number;
  timestamp: number;
  micEnvelope: number;
  breathPhase: "in" | "out" | "pause";
}

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const { say, stop: stopVoice } = useGuruVoice();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);
  const transcribe = useTranscribe();

  const [phase, setPhase] = useState<Phase>("settle");
  const [count, setCount] = useState(0);
  const [wakeMarks, setWakeMarks] = useState<WakeMark[]>([]);
  const [mantra, setMantra] = useState("");
  const [showMantraInput, setShowMantraInput] = useState(false);
  const [reflection, setReflection] = useState("");
  const [listeningReflection, setListeningReflection] = useState(false);
  const [texture, setTexture] = useState("");

  const sessionStartRef = useRef(Date.now());
  const endedRef = useRef(false);
  const tapTimestampsRef = useRef<number[]>([]);
  const intervalHistoryRef = useRef<number[]>([]);

  // Ambient bed
  useEffect(() => {
    sd.bed("temple", 0.03);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.05);
        await say("choose a syllable. one sound. one hundred eight times. each time the mind wanders and returns — mark it. the wake-mark is the practice.", "guru");
        if (cancelled) return;
        setShowMantraInput(true);
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  const handleMantraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mantra.trim()) {
      setShowMantraInput(false);
      setPhase("mantra");
      sessionStartRef.current = Date.now();
    }
  };

  const handleTap = useCallback(() => {
    if (phase !== "mantra" || endedRef.current) return;

    const now = performance.now();
    const nextCount = count + 1;
    setCount(nextCount);
    tapTimestampsRef.current.push(now);

    // Calculate interval
    if (tapTimestampsRef.current.length >= 2) {
      const interval = tapTimestampsRef.current[tapTimestampsRef.current.length - 1] - tapTimestampsRef.current[tapTimestampsRef.current.length - 2];
      intervalHistoryRef.current.push(interval);
      if (intervalHistoryRef.current.length > 10) intervalHistoryRef.current.shift();
    }

    // Haptic + sound
    sd.chime("drop", 0.04);
    buzz("tap");

    if (nextCount >= TARGET_COUNT) {
      finish();
    }
  }, [count, phase]);

  const handleWakeMark = useCallback(() => {
    if (phase !== "mantra" || endedRef.current) return;

    const mark: WakeMark = {
      count,
      timestamp: Date.now() - sessionStartRef.current,
      micEnvelope: breath.envelope,
      breathPhase: breath.lastInhaleMs > breath.lastExhaleMs ? "in" : "out",
    };
    setWakeMarks(prev => [...prev, mark]);
    buzz("double");

    // Subtle chime for wake-mark
    sd.chime("drop", 0.06);
  }, [count, phase, breath.envelope, breath.lastInhaleMs, breath.lastExhaleMs]);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    sd.stopBed();
    stopVoice();

    const durationMs = Date.now() - sessionStartRef.current;
    const completed = count >= TARGET_COUNT;

    // Calculate rhythm consistency
    const avgInterval = intervalHistoryRef.current.length > 0
      ? intervalHistoryRef.current.reduce((a, b) => a + b, 0) / intervalHistoryRef.current.length
      : 0;
    const intervalCV = intervalHistoryRef.current.length > 1
      ? Math.sqrt(intervalHistoryRef.current.reduce((s, i) => s + Math.pow(i - avgInterval, 2), 0) / intervalHistoryRef.current.length) / avgInterval
      : 0;

    onEnd({
      outcome: completed ? "completed" : "abandoned",
      signals: {
        duration_ms: durationMs,
        target_count: TARGET_COUNT,
        reached_count: count,
        completion_rate: +(count / TARGET_COUNT).toFixed(3),
        wake_marks: wakeMarks.length,
        wake_mark_details: wakeMarks,
        mantra: mantra,
        texture: texture,
        tap_timestamps: tapTimestampsRef.current,
        avg_interval_ms: Math.round(avgInterval),
        interval_cv: +(intervalCV).toFixed(3), // coefficient of variation (rhythm consistency)
        mic_ready: breath.ready,
        cycles_detected: breath.cycles,
        sighs_detected: breath.sighs,
      },
    });
  }, [onEnd, count, wakeMarks, mantra, texture, stopVoice, sd]);

  // Auto-end after MAX_DURATION
  useEffect(() => {
    if (phase !== "mantra") return;
    const timer = setTimeout(() => { if (!endedRef.current) finish(); }, MAX_DURATION);
    return () => clearTimeout(timer);
  }, [phase, finish]);

  const progress = Math.min(1, count / TARGET_COUNT);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.03, 0.1, 0.03], y: [0, -15, 0] }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-amber-950/15 via-black to-orange-950/15 pointer-events-none"
      />
      {/* Aurora — amber/gold */}
      <motion.div
        animate={{ opacity: [0.03, 0.12, 0.03], scale: [1, 1.1, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-amber-400/15 via-transparent to-orange-500/10 pointer-events-none mix-blend-screen"
      />
      {/* Aurora — rose offset */}
      <motion.div
        animate={{ opacity: [0.02, 0.08, 0.02], scale: [1, 1.05, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute inset-0 bg-gradient-to-t from-rose-500/10 via-transparent to-transparent pointer-events-none mix-blend-screen"
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
          <span className="text-[10px] uppercase tracking-[0.5em] text-amber-200/70 font-light" style={SERIF}>japa 108</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-amber-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-20">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400"
          style={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {showMantraInput && (
            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-md text-center space-y-8 pointer-events-auto">
              <p className="text-3xl font-extralight text-white/95 tracking-[0.02em]" style={SERIF}>choose your syllable</p>
              <form onSubmit={handleMantraSubmit} className="space-y-6">
                <div className="space-y-3">
                  <input
                    value={mantra}
                    onChange={(e) => setMantra(e.target.value.toUpperCase())}
                    placeholder="OM · RAM · HUM · SO HAM"
                    className="w-full max-w-xs mx-auto bg-transparent border-b border-white/20 py-4 px-2 text-center text-4xl uppercase tracking-[0.5em] text-white/90 placeholder-white/30 focus:outline-none focus:border-amber-300/60"
                    style={SERIF}
                    maxLength={10}
                    autoFocus
                  />
                  <p className="text-[11px] text-white/30 tracking-[0.2em] uppercase">the sound that carries you</p>
                </div>
                <button
                  type="submit"
                  disabled={!mantra.trim()}
                  className="mx-auto px-10 py-3 rounded-full border-2 border-amber-400/60 bg-amber-500/10 text-amber-100 text-sm uppercase tracking-wide hover:bg-amber-500/20 hover:border-amber-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                >
                  begin 108
                </button>
              </form>
            </motion.div>
          )}

          {phase === "mantra" && (
            <motion.div key="mantra" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl space-y-10 pointer-events-auto">
              {/* Mala bead progress (9 markers = 12 beads each) */}
              <div className="flex justify-center gap-1.5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <motion.span
                    key={i}
                    animate={Math.floor(count / 12) === i ? { opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] } : {}}
                    transition={Math.floor(count / 12) === i ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
                    className={`block h-1.5 rounded-full transition-all duration-700 ${
                      Math.floor(count / 12) > i ? "w-6 bg-amber-300/90 shadow-[0_0_8px_rgba(251,191,36,0.5)]" :
                      Math.floor(count / 12) === i ? "w-6 bg-amber-300/60" :
                      "w-2 bg-white/10"
                    }`}
                  />
                ))}
              </div>

              {/* Japa Canvas - animated mala */}
              <JapaCanvas
                count={count}
                target={TARGET_COUNT}
                mantra={mantra}
                isActive={true}
              />

              <div className="space-y-2">
                <motion.p
                  key={count}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-white/90 tabular-nums text-6xl font-extralight tracking-[0.05em]"
                  style={SERIF}
                >
                  {count.toString().padStart(3, "0")}
                </motion.p>
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/30">of 108</p>
              </div>

              <div className="flex justify-center gap-6">
                <motion.button
                  onClick={handleWakeMark}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 rounded-xl border border-white/20 bg-white/5 text-white/70 text-sm uppercase tracking-wide hover:bg-white/10 hover:border-white/30 hover:text-white/90 transition-all"
                >
                  <p className="font-medium">mind wandered</p>
                  <p className="text-[10px] text-white/40 mt-1">{wakeMarks.length} wake-marks</p>
                </motion.button>

                <motion.button
                  onClick={handleTap}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-10 py-4 rounded-full bg-amber-500/20 border-2 border-amber-400/60 text-amber-100 text-xl font-medium uppercase tracking-wide hover:bg-amber-500/30 hover:border-amber-300 transition-all shadow-[0_0_24px_rgba(251,191,36,0.2)]"
                >
                  TAP
                </motion.button>
              </div>

              <p className="text-[11px] text-white/40 italic" style={SERIF}>
                tap = next repetition · mark = mind returned
              </p>
            </motion.div>
          )}

          {phase === "reflect" && (
            <motion.div key="reflect" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8 pointer-events-auto max-w-xl">
              <p className="text-3xl font-extralight text-white/95 tracking-[0.02em]" style={SERIF}>the cycle completes</p>

              <div className="flex justify-center gap-6 text-center">
                <div>
                  <p className="text-4xl font-extralight text-amber-300 tabular-nums">{count}</p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-1">repetitions</p>
                </div>
                <div>
                  <p className="text-4xl font-extralight text-violet-300 tabular-nums">{wakeMarks.length}</p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-1">wake marks</p>
                </div>
                <div>
                  <p className="text-4xl font-extralight text-white/60 tabular-nums">
                    {count > 0 ? Math.round((wakeMarks.length / count) * 100) : 0}%
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-1">wander rate</p>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">rhythm consistency</p>
                <p className="text-4xl font-extralight text-amber-200 tabular-nums" style={SERIF}>
                  {(() => {
                    if (intervalHistoryRef.current.length === 0) return "100%";
                    const avg = intervalHistoryRef.current.reduce((a, b) => a + b, 0) / intervalHistoryRef.current.length;
                    const variance = intervalHistoryRef.current.reduce((s, i) => s + Math.pow(i - avg, 2), 0) / intervalHistoryRef.current.length;
                    const cv = Math.sqrt(variance) / avg;
                    return Math.max(0, Math.round((1 - cv) * 100)) + "%";
                  })()}
                </p>
                <p className="text-sm text-white/50 italic" style={SERIF}>
                  {intervalHistoryRef.current.length > 0
                    ? `avg interval: ${Math.round(intervalHistoryRef.current.reduce((a, b) => a + b, 0) / intervalHistoryRef.current.length)}ms. steadier rhythm = deeper absorption.`
                    : "find your rhythm."}
                </p>
              </motion.div>

              {/* Wake pattern visualization */}
              {wakeMarks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 max-w-md mx-auto text-left"
                >
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">wake pattern</p>
                  <div className="flex flex-wrap gap-1.5">
                    {wakeMarks.map((mark, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + i * 0.05 }}
                        className="px-2.5 py-1 rounded-full text-[10px] bg-amber-500/20 text-amber-200/80 border border-amber-400/30"
                      >
                        #{mark.count}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/10 blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                {count >= TARGET_COUNT
                  ? `one hundred eight. ${wakeMarks.length} times the mind wandered. ${wakeMarks.length} times it returned. each return is a victory.`
                  : `the cycle was interrupted at ${count}. ${wakeMarks.length} wake-marks recorded. the practice continues beyond the count.`}
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
        complete →
      </button>
    </div>
  );
}

export default function Japa108() {
  const g = getLabGame("japa-108")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}