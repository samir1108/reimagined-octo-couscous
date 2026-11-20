/**
 * ObservationLiveSession
 * ──────────────────────
 * Public, fullscreen, world-class guided session for the Observation ladder.
 *
 * Seed-driven: renders one of the 100 authored sessions in
 * `src/data/observationSessions.ts`. Each seed plays through its own form
 * (sweep / ladder / spiral / threshold / vigil / inquiry / gaze / return),
 * so sittings do not share one skeleton.
 *
 * No auth required. Cinematic backdrop + breathing orb + narrated steps.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Pause, Play, Volume2, VolumeX, ChevronRight, X } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { useStepNarration } from "@/hooks/useStepNarration";
import { SessionFilmBackdrop } from "@/components/experience/SessionFilmBackdrop";
import { observationFilmFor } from "@/data/observationVideos";
import {
  OBS_LEVEL_META,
  OBS_TOTAL,
  obsFormDef,
  type ObsSeed,
} from "@/data/observationSessions";
import { pickObservationSession, resolveObservationSeed } from "@/lib/practice/observationPicker";
import { buildObservationFlow, layoutObservationBeats } from "@/lib/practice/observationFlow";
import {
  currentObservationSessionNumber,
  getObserveLevel,
  logObservationRun,
  obsSeedPosition,
  recentObservationSeedIds,
  setLatestRunFeltShift,
  type FeltShift,
} from "@/lib/practice/observationProgress";

type Step = { title: string; line: string; seconds: number };

function buildSeedSteps(seed: ObsSeed, minutes: number): Step[] {
  const target = Math.max(120, Math.round(minutes * 60));
  return layoutObservationBeats(buildObservationFlow(seed), target).map((beat) => ({
    title: beat.title,
    line: beat.body,
    seconds: beat.seconds,
  }));
}

const ObservationLiveSession = () => {
  useForceDarkMode();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const paramSeed = searchParams.get("seed");
  const paramLevel = Number(searchParams.get("level") || 0);
  const paramMin = Number(searchParams.get("min") || 0);

  const [sessionNumber, setSessionNumber] = useState(() => currentObservationSessionNumber());
  const [seed, setSeed] = useState<ObsSeed>(() =>
    resolveObservationSeed({
      seedId: paramSeed,
      sessionNumber: currentObservationSessionNumber(),
      level: paramLevel || getObserveLevel(),
      minutes: paramMin || undefined,
      recentSeedIds: recentObservationSeedIds(),
    }),
  );
  const [recentIds, setRecentIds] = useState<string[]>(() => recentObservationSeedIds());

  const level = paramLevel || getObserveLevel();
  const minutes = paramMin || seed.minutes[Math.min(1, seed.minutes.length - 1)];
  const levelMeta = OBS_LEVEL_META.find((m) => m.level === seed.level);
  const form = obsFormDef(seed);
  const position = obsSeedPosition(seed);
  // Each seed wears the film that belongs to its level and lens.
  const film = useMemo(
    () => observationFilmFor({ level: seed.level, seedId: seed.id, lens: seed.lens }),
    [seed.id, seed.level, seed.lens],
  );

  const steps = useMemo(() => buildSeedSteps(seed, minutes), [seed, minutes]);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [feltShift, setFeltShift] = useState<FeltShift | null>(null);
  const tickRef = useRef<number | null>(null);
  const loggedRef = useRef(false);

  const step = steps[stepIdx];
  const totalSeconds = useMemo(() => steps.reduce((s, x) => s + x.seconds, 0), [steps]);

  // A new seed is a new sitting — reset everything.
  useEffect(() => {
    setStepIdx(0);
    setElapsed(0);
    setStarted(false);
    setFinished(false);
    setPaused(false);
    setFeltShift(null);
    loggedRef.current = false;
  }, [seed.id]);

  // Narrate current step (cached IDB → Deepgram → fallback)
  useStepNarration({
    text: started && !paused ? step.line : null,
    guruId: seed.voice,
    enabled: started && !muted,
  });

  // Per-step countdown
  useEffect(() => {
    if (!started || paused || finished) return;
    setElapsed(0);
    const start = performance.now();
    const tick = () => {
      const s = Math.floor((performance.now() - start) / 1000);
      setElapsed(s);
      if (s >= step.seconds) {
        if (stepIdx < steps.length - 1) setStepIdx((i) => i + 1);
        else setFinished(true);
        return;
      }
      tickRef.current = window.setTimeout(tick, 250);
    };
    tickRef.current = window.setTimeout(tick, 250);
    return () => {
      if (tickRef.current) window.clearTimeout(tickRef.current);
    };
  }, [started, paused, finished, stepIdx, step.seconds, steps.length]);

  // Log once per sitting, when it finishes.
  useEffect(() => {
    if (!finished || loggedRef.current) return;
    loggedRef.current = true;
    logObservationRun({
      seedId: seed.id,
      level: seed.level,
      lens: seed.lens,
      method: seed.method,
      sessionNumber,
      durationSec: totalSeconds,
      completed: true,
      arrivalState: null,
    });
  }, [finished, seed, sessionNumber, totalSeconds]);

  const chooseShift = (shift: FeltShift) => {
    setFeltShift(shift);
    setLatestRunFeltShift(shift, seed.id);
  };

  const advance = () => {
    if (stepIdx < steps.length - 1) setStepIdx((i) => i + 1);
    else setFinished(true);
  };

  const sitAgain = () => {
    setStepIdx(0);
    setElapsed(0);
    setFinished(false);
    setFeltShift(null);
    loggedRef.current = false;
    setStarted(true);
  };

  const nextSession = () => {
    const nextNumber = sessionNumber + 1;
    const nextRecent = [seed.id, ...recentIds].slice(0, 14);
    setRecentIds(nextRecent);
    setSessionNumber(nextNumber);
    setSeed(
      pickObservationSession({
        sessionNumber: nextNumber,
        level,
        minutes: paramMin || undefined,
        recentSeedIds: nextRecent,
      }),
    );
    // Reset even when the picker returns the same seed (tiny pools).
    setStepIdx(0);
    setElapsed(0);
    setFinished(false);
    setFeltShift(null);
    loggedRef.current = false;
    setStarted(false);
  };

  const exit = () => navigate("/experience/observation");

  return (
    <>
      <Seo
        title={`${form.label} — observation session ${position} of ${OBS_TOTAL}`}
        description={`A free, voice-guided ${form.label.toLowerCase()} session from the ${levelMeta?.title ?? "observation"} level of the ladder. Session ${position} of ${OBS_TOTAL}.`}
        canonicalPath="/experience/observation/session"
      />
      <main className="fixed inset-0 overflow-hidden bg-black text-white">
        {/* Film body — one of the fifteen observation films */}
        <SessionFilmBackdrop
          url={film.url}
          poster={film.poster}
          active={started}
          paused={paused}
        />

        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 py-4">
          <button
            onClick={exit}
            className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {started && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMuted((m) => !m)}
                className="p-2 rounded-full bg-white/5 border border-white/15 hover:bg-white/10 transition"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setPaused((p) => !p)}
                className="p-2 rounded-full bg-white/5 border border-white/15 hover:bg-white/10 transition"
                aria-label={paused ? "Resume" : "Pause"}
              >
                {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                onClick={exit}
                className="p-2 rounded-full bg-white/5 border border-white/15 hover:bg-white/10 transition"
                aria-label="End"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Stage */}
        <div className="relative z-10 h-full w-full flex flex-col items-center justify-center px-6">
          {!started && !finished ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="max-w-xl text-center"
            >
              <div className="text-[11px] uppercase tracking-[0.35em] text-amber-200/80 mb-4">
                {form.label} · {levelMeta?.title ?? "Observation"} · Session {position}/{OBS_TOTAL}
              </div>
              <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.05]">
                {seed.exploration[0]?.title}
              </h1>
              <p className="mt-6 text-base md:text-lg text-white/75 leading-relaxed">
                {form.oneLine} {steps.length} guided steps, about {minutes} minutes.
                A real voice will walk you through it. Use headphones if you can.
              </p>
              <p className="mt-3 text-[10px] uppercase tracking-[0.32em] text-white/45">
                Film · {film.title}
              </p>
              <div className="mt-10 flex flex-col items-center gap-3">
                <button
                  onClick={() => setStarted(true)}
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-amber-400/90 text-black font-medium hover:bg-amber-300 transition shadow-[0_0_60px_-10px_rgba(251,191,36,0.6)]"
                >
                  Begin the session
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </button>
                <button
                  onClick={() => {
                    setMuted(true);
                    setStarted(true);
                  }}
                  className="text-xs text-white/55 hover:text-white/80 transition"
                >
                  or begin in silence (no voice)
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="w-full max-w-xl flex flex-col items-center text-center">
              {/* Breathing orb */}
              <motion.div
                className="relative w-44 h-44 md:w-56 md:h-56 mb-10"
                animate={paused ? { scale: 1 } : { scale: [1, 1.12, 1] }}
                transition={paused ? {} : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 rounded-full bg-amber-300/20 blur-2xl" />
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-200/40 to-amber-500/10 border border-amber-200/30" />
                <div className="absolute inset-12 rounded-full bg-amber-100/40 blur-md" />
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={stepIdx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.8 }}
                  className="min-h-[140px]"
                >
                  <div className="text-[10px] uppercase tracking-[0.35em] text-amber-200/70 mb-3">
                    Step {stepIdx + 1} of {steps.length} · {step.title}
                  </div>
                  <p className="text-xl md:text-2xl font-light leading-relaxed text-white/95">
                    {step.line}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Per-step progress */}
              <div className="mt-10 w-full max-w-xs h-[2px] bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  key={stepIdx}
                  className="h-full bg-amber-300/70"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (elapsed / step.seconds) * 100)}%` }}
                  transition={{ duration: 0.25, ease: "linear" }}
                />
              </div>

              <button
                onClick={advance}
                className="mt-6 text-xs text-white/55 hover:text-white/85 transition inline-flex items-center gap-1"
              >
                Next step <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Finished overlay */}
          {finished && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex items-center justify-center px-6"
            >
              <div className="max-w-md text-center">
                <div className="text-[11px] uppercase tracking-[0.3em] text-amber-200/80 mb-3">
                  Session {position} of {OBS_TOTAL} complete · {form.label}
                </div>
                <h2 className="text-2xl md:text-3xl font-light tracking-tight leading-snug">
                  {seed.integration}
                </h2>

                <div className="mt-7">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-3">
                    How are you leaving?
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {(["lighter", "same", "heavier"] as FeltShift[]).map((shift) => (
                      <button
                        key={shift}
                        onClick={() => chooseShift(shift)}
                        className={`px-4 py-2 rounded-full border text-sm transition ${
                          feltShift === shift
                            ? "bg-amber-300 text-black border-amber-300"
                            : "bg-white/5 border-white/20 hover:bg-white/10"
                        }`}
                      >
                        {shift[0].toUpperCase() + shift.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="mt-6 text-sm text-white/60 leading-relaxed">{seed.carryTask}</p>

                <div className="mt-7 flex items-center justify-center gap-3">
                  <button
                    onClick={sitAgain}
                    className="px-5 py-2.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm"
                  >
                    Sit again
                  </button>
                  <button
                    onClick={nextSession}
                    className="px-5 py-2.5 rounded-full bg-amber-400 text-black font-medium hover:bg-amber-300 transition text-sm"
                  >
                    Next session →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom progress through whole session */}
        {started && !finished && (
          <div className="absolute bottom-0 inset-x-0 z-10 px-5 pb-5">
            <div className="max-w-xl mx-auto h-[1px] bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-amber-200/60"
                animate={{ width: `${((stepIdx + elapsed / step.seconds) / steps.length) * 100}%` }}
                transition={{ duration: 0.25, ease: "linear" }}
              />
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/40 text-center">
              {form.label} · {levelMeta?.title ?? "Observation"} · film {film.title}
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default ObservationLiveSession;
