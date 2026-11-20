import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MessageCircle, X, Play, Pause, SkipForward, Sparkles, Check, Volume2, VolumeX } from "lucide-react";
import type { Guru, GuruPractice } from "@/lib/guru-data";
import { MASTER_IMAGES } from "@/assets/masters";
import InteractivePracticeSession from "./InteractivePracticeSession";

/* ───────── Helpers ───────── */
function parseDurationToSeconds(d?: string): number {
  if (!d) return 5 * 60;
  const lower = d.toLowerCase();
  if (lower.includes("all day")) return 8 * 60;
  // matches "5-15 min" or "10-15 min" or "20 min" — take the first number
  const m = lower.match(/(\d+)/);
  if (!m) return 5 * 60;
  return Math.max(60, parseInt(m[1], 10) * 60);
}

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ───────── Breathing ring ───────── */
function BreathRing({ paused }: { paused: boolean }) {
  return (
    <motion.div
      className="absolute inset-0 rounded-full border border-amber-200/15"
      animate={paused ? { scale: 1, opacity: 0.4 } : { scale: [1, 1.18, 1], opacity: [0.35, 0.7, 0.35] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* ───────── Ambient particles ───────── */
function AmbientParticles() {
  const dots = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 12 + Math.random() * 10,
    size: 1 + Math.random() * 2,
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map(d => (
        <motion.div
          key={d.id}
          className="absolute rounded-full bg-amber-200/40"
          style={{ left: `${d.left}%`, width: d.size, height: d.size, bottom: -10 }}
          animate={{ y: [-10, -800], opacity: [0, 0.6, 0] }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

/* ───────── Cinematic intro (3 beats) ───────── */
function CinematicIntro({ guru, practice, onDone }: { guru: Guru; practice: GuruPractice; onDone: () => void }) {
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setBeat(1), 1600);
    const t2 = setTimeout(() => setBeat(2), 3200);
    const t3 = setTimeout(() => onDone(), 4800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  const beats = [
    { line: guru.name, sub: guru.title?.split("·")[0]?.trim() },
    { line: practice.name, sub: practice.duration },
    { line: "Begin", sub: "When you are ready" },
  ];

  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-center justify-center bg-black"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={beat}
          initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(12px)" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center px-8"
        >
          <p className="text-amber-100/95 text-3xl md:text-5xl font-display tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {beats[beat].line}
          </p>
          {beats[beat].sub && (
            <p className="text-amber-100/40 text-xs md:text-sm font-display tracking-[0.4em] uppercase mt-4">
              {beats[beat].sub}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/* ───────── Main runner ───────── */
interface Props {
  guru: Guru;
  practice: GuruPractice;
  onBack: () => void;
}

export default function CinematicPracticeRunner({ guru, practice, onBack }: Props) {
  const totalSeconds = parseDurationToSeconds(practice.duration);
  const steps = practice.steps?.length ? practice.steps : ["Settle in", "Be present", "Receive"];
  const [introDone, setIntroDone] = useState(false);
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [remaining, setRemaining] = useState(totalSeconds);
  const [muted, setMuted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [completed, setCompleted] = useState(false);

  const image = MASTER_IMAGES[guru.id] || guru.image;

  // Per-step duration
  const perStep = Math.max(20, Math.floor(totalSeconds / steps.length));

  // Timer
  useEffect(() => {
    if (!introDone || paused || completed) return;
    if (remaining <= 0) { setCompleted(true); return; }
    const t = setInterval(() => setRemaining(r => r - 1), 1000);
    return () => clearInterval(t);
  }, [introDone, paused, remaining, completed]);

  // Step auto-advance
  useEffect(() => {
    if (!introDone || paused || completed) return;
    const elapsed = totalSeconds - remaining;
    const idx = Math.min(steps.length - 1, Math.floor(elapsed / perStep));
    if (idx !== step) setStep(idx);
  }, [remaining, introDone, paused, completed, totalSeconds, perStep, steps.length, step]);

  const progressPct = ((totalSeconds - remaining) / totalSeconds) * 100;

  /* ───────── Completion screen ───────── */
  if (completed) {
    return (
      <motion.div
        className="fixed inset-0 z-[80] flex flex-col items-center justify-center overflow-y-auto bg-black px-4 pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(6rem+env(safe-area-inset-bottom))]"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        <div className="absolute inset-0">
          <img src={image} alt="" className="w-full h-full object-cover object-top opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/60" />
        </div>
        <AmbientParticles />
        <motion.div
          className="relative z-10 text-center px-8 max-w-md"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="w-16 h-16 rounded-full bg-amber-200/15 border border-amber-200/25 flex items-center justify-center mx-auto mb-8"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
          >
            <Check className="w-7 h-7 text-amber-100/80" strokeWidth={1.5} />
          </motion.div>
          <p className="text-amber-100/90 text-2xl md:text-3xl font-display mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            The practice is complete.
          </p>
          <p className="text-white/40 text-sm font-display leading-relaxed mb-10">
            Carry this stillness into your next breath.
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => { setShowGuide(true); setCompleted(false); setRemaining(60); setPaused(true); }}
              className="w-full py-3 rounded-xl bg-amber-200/10 border border-amber-200/20 text-amber-100/85 text-sm font-display tracking-wider hover:bg-amber-200/20 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Reflect with {guru.name}
            </button>
            <button
              onClick={onBack}
              className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/55 text-sm font-display tracking-wider hover:bg-white/[0.08] transition-all"
            >
              Return
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  /* ───────── Active runner ───────── */
  return (
    <motion.div
      className="fixed inset-0 z-[70] flex min-h-dvh flex-col overflow-hidden bg-black"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Ken-Burns portrait backdrop */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.05 }}
        animate={{ scale: paused ? 1.05 : 1.15 }}
        transition={{ duration: 30, ease: "linear" }}
      >
        <img src={image} alt="" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
      </motion.div>

      <AmbientParticles />

      {/* Cinematic intro overlay */}
      <AnimatePresence>
        {!introDone && <CinematicIntro guru={guru} practice={practice} onDone={() => setIntroDone(true)} />}
      </AnimatePresence>

      {/* Top bar */}
      <div className="relative z-20 flex items-center gap-3 px-5 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0 text-center">
          <p className="text-amber-100/55 text-[10px] font-display tracking-[0.35em] uppercase truncate">
            {guru.name}
          </p>
        </div>
        <button
          onClick={() => setMuted(m => !m)}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/55 hover:text-white transition"
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Center stage: breathing ring + current step */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-4 sm:px-8">
        {/* Ring */}
        <div className="relative w-56 h-56 md:w-72 md:h-72 mb-10 flex items-center justify-center">
          <BreathRing paused={paused} />
          <motion.div
            className="absolute inset-4 rounded-full border border-amber-200/10"
            animate={paused ? { scale: 1 } : { scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />
          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.4" />
            <circle
              cx="50" cy="50" r="48" fill="none"
              stroke="rgba(252, 211, 77, 0.35)" strokeWidth="0.5" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 48}`}
              strokeDashoffset={`${2 * Math.PI * 48 * (1 - progressPct / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          {/* Center timer */}
          <div className="text-center">
            <p className="text-amber-100/85 text-4xl md:text-5xl font-display tabular-nums tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {fmt(remaining)}
            </p>
            <p className="text-amber-100/30 text-[10px] font-display tracking-[0.4em] uppercase mt-1">
              Step {step + 1} of {steps.length}
            </p>
          </div>
        </div>

        {/* Phase card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-lg"
          >
            <p className="text-white/85 text-lg md:text-xl font-display leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {steps[step]}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="relative z-20 flex items-center justify-center gap-3 px-6 pt-2 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <button
          onClick={() => setShowGuide(true)}
          className="w-11 h-11 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/15 flex items-center justify-center text-white/65 hover:text-white hover:bg-white/[0.12] transition"
          title="Talk with master"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
        <button
          onClick={() => setPaused(p => !p)}
          className="w-14 h-14 rounded-full bg-amber-200/15 backdrop-blur-md border border-amber-200/30 flex items-center justify-center text-amber-100/90 hover:bg-amber-200/25 transition"
        >
          {paused ? <Play className="w-5 h-5 ml-0.5" /> : <Pause className="w-5 h-5" />}
        </button>
        <button
          onClick={() => {
            if (step < steps.length - 1) {
              const nextStep = step + 1;
              setStep(nextStep);
              setRemaining(Math.max(0, totalSeconds - nextStep * perStep));
            } else {
              setCompleted(true);
            }
          }}
          className="w-11 h-11 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/15 flex items-center justify-center text-white/65 hover:text-white hover:bg-white/[0.12] transition"
          title="Next step"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Guide chat overlay — uses existing InteractivePracticeSession */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            className="absolute inset-0 z-[75] bg-black/80 backdrop-blur-md flex items-end md:items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowGuide(false)}
          >
            <motion.div
              className="relative w-full h-[88vh] md:h-[80vh] md:max-w-2xl md:rounded-2xl overflow-hidden bg-black border-t md:border border-white/10"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowGuide(false)}
                className="absolute top-4 right-4 z-[78] w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              {/* Pause practice timer while chat is open */}
              <PauseWhileMounted onMount={() => setPaused(true)} />
              <InteractivePracticeSession
                practice={practice}
                guru={guru}
                onBack={() => setShowGuide(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* Tiny helper to pause timer when chat opens */
function PauseWhileMounted({ onMount }: { onMount: () => void }) {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    onMount();
  }, [onMount]);
  return null;
}
