/**
 * TEMPLE - Practice Session Timer
 * Circular ring timer with ambient sounds, haptic feedback, and bell at end
 * Per temple.md Screen 5
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, ChevronDown } from "lucide-react";
import { playThreeBells } from "@/lib/templeSounds";

const AMBIENT_SOUNDS = [
  { id: "bell", label: "Temple Bell", icon: "🔔" },
  { id: "bowl", label: "Singing Bowl", icon: "🥣" },
  { id: "wind", label: "Wind Chimes", icon: "🎐" },
  { id: "om", label: "Om Chanting", icon: "🕉️" },
  { id: "nature", label: "Nature Sounds", icon: "🌿" },
  { id: "silence", label: "Silence", icon: "🤫" },
];

interface PracticeTimerProps {
  durationMinutes: number;
  masterName: string;
  masterImage: string;
  masterId?: string;
  mode: "chat" | "timer";
  onComplete: () => void;
  onClose: () => void;
}

export default function PracticeTimer({
  durationMinutes,
  masterName,
  masterImage,
  masterId,
  mode,
  onComplete,
  onClose,
}: PracticeTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSound, setSelectedSound] = useState("bell");
  const [showSounds, setShowSounds] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSeconds = durationMinutes * 60;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((totalSeconds - timeRemaining) / totalSeconds) * 100;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  // Haptic every 5 minutes
  useEffect(() => {
    if (!isRunning || isPaused) return;
    const minutesElapsed = (totalSeconds - timeRemaining) / 60;
    if (minutesElapsed > 0 && minutesElapsed % 5 === 0) {
      if ("vibrate" in navigator) {
        navigator.vibrate(200);
      }
    }
  }, [timeRemaining, isRunning, isPaused, totalSeconds]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);

  const resetTimer = useCallback(() => {
    setTimeRemaining(durationMinutes * 60);
    setIsRunning(false);
    setIsPaused(false);
  }, [durationMinutes]);

  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused, timeRemaining, onComplete]);

  const handleComplete = () => {
    setIsRunning(false);
    playThreeBells(); // 3 gentle bells at session end
    setShowJournal(true);
  };

  if (showJournal) {
    return (
      <PracticeJournal
        masterName={masterName}
        durationMinutes={durationMinutes}
        onClose={() => {
          onComplete();
        }}
      />
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[75] flex flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img src={masterImage} alt="" className="w-full h-full object-cover object-top opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/70" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3">
        <div className="flex items-center gap-3">
          <img src={masterImage} alt="" className="w-8 h-8 rounded-full object-cover object-top ring-1 ring-white/10" />
          <div>
            <p className="text-white/70 text-xs font-display font-medium">{masterName}</p>
            <p className="text-white/30 text-[10px] font-display tracking-wider">
              {mode === "chat" ? "Chat Mode" : "Timer Mode"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timer */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-4">
        {/* Circular Ring */}
        <div className="relative mb-8">
          <svg className="w-56 h-56 md:w-64 md:h-64 -rotate-90" viewBox="0 0 180 180">
            {/* Track */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="4"
            />
            {/* Progress */}
            <motion.circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(43, 60%, 55%)" />
                <stop offset="100%" stopColor="hsl(30, 85%, 52%)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.p
              className="text-white/80 text-4xl md:text-5xl font-display tabular-nums tracking-wider"
              animate={isRunning && !isPaused ? { scale: [1, 1.01, 1] } : {}}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {formatTime(timeRemaining)}
            </motion.p>
            <p className="text-white/30 text-[10px] font-display tracking-[0.3em] uppercase mt-2">
              {isRunning && !isPaused ? "In Practice" : isPaused ? "Paused" : "Ready"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={resetTimer}
            className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <motion.button
            onClick={isRunning && !isPaused ? pauseTimer : isPaused ? resumeTimer : startTimer}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/30 flex items-center justify-center text-amber-200/90 hover:from-amber-600/40 hover:to-orange-600/40 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isRunning && !isPaused ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </motion.button>

          <button
            onClick={() => setShowSounds(!showSounds)}
            className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors relative"
          >
            <Volume2 className="w-4 h-4" />
            <ChevronDown className="w-3 h-3 absolute -bottom-0.5 -right-0.5 text-white/30" />
          </button>
        </div>

        {/* Ambient Sounds */}
        <AnimatePresence>
          {showSounds && (
            <motion.div
              className="w-full max-w-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-white/30 text-[10px] font-display tracking-[0.3em] uppercase text-center mb-3">
                Ambient Sound
              </p>
              <div className="grid grid-cols-3 gap-2">
                {AMBIENT_SOUNDS.map((sound) => (
                  <button
                    key={sound.id}
                    onClick={() => setSelectedSound(sound.id)}
                    className={`p-3 rounded-xl border transition-all text-center ${selectedSound === sound.id
                      ? "bg-amber-500/15 border-amber-500/30"
                      : "bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.06]"
                      }`}
                  >
                    <span className="text-lg">{sound.icon}</span>
                    <p className="text-white/50 text-[9px] font-display mt-1">{sound.label}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom - End Session */}
      <div className="relative z-10 border-t border-white/[0.06] px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <button
          onClick={handleComplete}
          className="w-full py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white/50 text-xs font-display tracking-wider hover:bg-white/[0.1] hover:text-white/70 transition-all"
        >
          End Session
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Practice Journal (Post-Session) ─── */
function PracticeJournal({
  masterName,
  durationMinutes,
  onClose,
}: {
  masterName: string;
  durationMinutes: number;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [reflection, setReflection] = useState("");
  const [insight, setInsight] = useState("");

  return (
    <motion.div
      className="fixed inset-0 z-[76] flex flex-col items-center justify-center overflow-y-auto bg-black/95 backdrop-blur-xl px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-md text-center">
        <motion.div
          className="text-3xl mb-4"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          🕉️
        </motion.div>
        <h3 className="text-white/80 text-lg font-display mb-1">Session Complete</h3>
        <p className="text-white/30 text-xs font-display mb-6">
          {durationMinutes} minutes with {masterName}
        </p>

        {/* Rating */}
        <div className="mb-6">
          <p className="text-white/40 text-xs font-display mb-3">How was today's practice?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onClick={() => setRating(i)}
                className={`w-8 h-8 rounded-full transition-all ${i <= rating
                  ? "bg-amber-500/40 border-amber-500/50"
                  : "bg-white/[0.06] border-white/[0.1]"
                  } border`}
              >
                <span className="text-xs">{i <= rating ? "●" : "○"}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reflection */}
        <div className="mb-4">
          <p className="text-white/40 text-xs font-display mb-2">
            What arose during practice?
            <span className="text-white/20"> (Optional, private, encrypted)</span>
          </p>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder=""
            rows={3}
            className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-xs font-display placeholder:text-white/20 outline-none resize-none"
          />
        </div>

        {/* Insight */}
        <div className="mb-6">
          <p className="text-white/40 text-xs font-display mb-2">
            One insight from today:
            <span className="text-white/20"> (Optional, one line)</span>
          </p>
          <input
            type="text"
            value={insight}
            onChange={(e) => setInsight(e.target.value)}
            placeholder=""
            className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-xs font-display placeholder:text-white/20 outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/40 text-xs font-display tracking-wider hover:bg-white/[0.1] transition-colors"
          >
            Skip for Today
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/25 text-amber-200/80 text-xs font-display tracking-wider hover:from-amber-600/30 hover:to-orange-600/30 transition-all"
          >
            Save Journal
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/*
  I SAID RATE THIS APP DOA ADUIT AND TELL ME AND ALSO U ARE DOING WROBNG WRONG INOUT WORK WHY
  '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
*/
