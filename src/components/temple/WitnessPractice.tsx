/**
 * THE WITNESS — Core Open-Eye Practice
 * Per user spec: Sakshi Bhav with open eyes, observing 3 brains
 * The flagship practice of the entire Temple.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Brain, Heart, Wind, Bell, X, Play, RotateCcw, BookOpen, MessageCircle, Flame, ArrowRight } from "lucide-react";
import { playTempleBell, playGentleChime } from "@/lib/templeSounds";
import WitnessPostChat, { type PostSessionResult } from "./WitnessPostChat";
import { GURUS } from "@/lib/guru-data";
import { useNavigate } from "react-router-dom";

type WitnessPhase = "intro" | "practicing" | "reflection" | "complete";

const DURATIONS = [5, 10, 20, 30];

const REMINDERS = [
  "Are you watching... or caught?",
  "You are the screen. They are the movie.",
  "Watch the thoughts. Don't fight them.",
  "Feel the heart. Don't judge it.",
  "Notice the gut. Don't control it.",
  "The witness is always here. Return to it.",
  "Thoughts come. Thoughts go. You remain.",
  "You are not the mind. You watch the mind.",
  "Open eyes. Soft gaze. Just witness.",
];

const BRAIN_LABELS = [
  { id: "head", label: "Head", icon: Brain, desc: "Thoughts arising and passing", color: "text-blue-300/60" },
  { id: "heart", label: "Heart", icon: Heart, desc: "Emotions expanding and contracting", color: "text-rose-300/60" },
  { id: "gut", label: "Gut", icon: Wind, desc: "Instincts tightening and loosening", color: "text-emerald-300/60" },
];

interface WitnessPracticeProps {
  onClose: () => void;
}

export default function WitnessPractice({ onClose }: WitnessPracticeProps) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<WitnessPhase>("intro");
  const [duration, setDuration] = useState(10);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentReminder, setCurrentReminder] = useState(0);
  const [showReminder, setShowReminder] = useState(false);
  const [sessionResult, setSessionResult] = useState<PostSessionResult | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reminderIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = duration * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - timeRemaining) / totalSeconds) * 100 : 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Reminder bell every 5 minutes
  useEffect(() => {
    if (phase !== "practicing") return;

    reminderIntervalRef.current = setInterval(() => {
      playGentleChime();
      setCurrentReminder((prev) => (prev + 1) % REMINDERS.length);
      setShowReminder(true);
      setTimeout(() => setShowReminder(false), 4000);
    }, 5 * 60 * 1000);

    return () => {
      if (reminderIntervalRef.current) clearInterval(reminderIntervalRef.current);
    };
  }, [phase]);

  // Timer
  useEffect(() => {
    if (phase !== "practicing" || timeRemaining <= 0) return;

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setPhase("reflection");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, timeRemaining]);

  const startPractice = useCallback(() => {
    playTempleBell();
    setPhase("practicing");
    setTimeRemaining(totalSeconds);
    setCurrentReminder(0);
  }, [totalSeconds]);

  const resetPractice = useCallback(() => {
    setPhase("intro");
    setTimeRemaining(0);
    setShowReminder(false);
  }, []);

  // ─── INTRO PHASE ───
  if (phase === "intro") {
    return (
      <motion.div
        className="fixed inset-0 z-[80] flex flex-col bg-black/95 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Close button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
            aria-label="Close Witness practice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          {/* Icon */}
          <motion.div
            className="mb-6"
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Eye className="w-16 h-16 text-amber-300/60" />
          </motion.div>

          {/* Title */}
          <motion.h2
            className="text-white/80 text-2xl font-display tracking-wide mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            The Witness
          </motion.h2>
          <motion.p
            className="text-white/30 text-xs font-display mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Open-Eye Meditation — Sakshi Bhav
          </motion.p>

          {/* Instructions */}
          <motion.div
            className="max-w-sm mb-8 space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-white/50 text-sm font-display leading-relaxed">
              Open your eyes. Soft gaze.
            </p>
            <p className="text-white/40 text-sm font-display leading-relaxed">
              You are not the mind. You are not the body. You are not the energy.
            </p>
            <p className="text-amber-200/50 text-sm font-display italic font-medium">
              You are the one who watches all three.
            </p>
          </motion.div>

          {/* 3 Brains to Watch */}
          <motion.div
            className="space-y-2 mb-8 max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <p className="text-white/25 text-[10px] font-display tracking-[0.3em] uppercase mb-2">Watch These Three</p>
            {BRAIN_LABELS.map((brain, i) => (
              <motion.div
                key={brain.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.15 }}
              >
                <brain.icon className={`w-5 h-5 ${brain.color}`} />
                <div className="text-left">
                  <p className="text-white/60 text-xs font-display font-medium">{brain.label}</p>
                  <p className="text-white/25 text-[10px] font-display">{brain.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Duration selector */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <p className="text-white/25 text-[10px] font-display tracking-[0.3em] uppercase mb-3">Duration</p>
            <div className="flex gap-2 justify-center">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-4 py-2 rounded-full text-xs font-display tracking-wider transition-all ${duration === d
                    ? "bg-white/[0.12] text-white/80 border border-white/[0.15]"
                    : "bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.08]"
                    }`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </motion.div>

          {/* Start button */}
          <motion.button
            onClick={startPractice}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/25 text-amber-200/80 text-sm font-display tracking-wider hover:from-amber-600/40 hover:to-orange-600/40 transition-all"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Play className="w-4 h-4" />
            Begin Witnessing
          </motion.button>

          {/* Bottom note */}
          <motion.p
            className="text-white/15 text-[10px] font-display mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            A gentle bell every 5 minutes: "Are you watching... or caught?"
          </motion.p>
        </div>
      </motion.div>
    );
  }

  // ─── PRACTICING PHASE ───
  if (phase === "practicing") {
    return (
      <motion.div
        className="fixed inset-0 z-[80] flex flex-col bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Soft glow background */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 40%, rgba(212,165,116,0.06) 0%, transparent 50%)",
          }}
        />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-4 py-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-300/40" />
            <span className="text-white/30 text-xs font-display">The Witness</span>
          </div>
          <button
            onClick={resetPractice}
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
          {/* Timer */}
          <div className="relative w-48 h-48 mb-8">
            {/* Progress ring */}
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
              <motion.circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="url(#witnessGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="witnessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(43, 60%, 55%)" />
                  <stop offset="100%" stopColor="hsl(30, 85%, 52%)" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.p
                className="text-white/80 text-3xl font-display tabular-nums tracking-wider"
                animate={timeRemaining > 0 ? { scale: [1, 1.01, 1] } : {}}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {formatTime(timeRemaining)}
              </motion.p>
              <p className="text-white/20 text-[10px] font-display tracking-[0.3em] uppercase mt-2">
                OPEN EYES · SOFT GAZE
              </p>
            </div>
          </div>

          {/* 3 Brains reminder */}
          <div className="flex gap-6 mb-8">
            {BRAIN_LABELS.map((brain) => (
              <div key={brain.id} className="flex flex-col items-center gap-1">
                <brain.icon className={`w-6 h-6 ${brain.color}`} />
                <span className="text-white/30 text-[10px] font-display">{brain.label}</span>
              </div>
            ))}
          </div>

          {/* Core instruction */}
          <p className="text-white/25 text-xs font-display text-center max-w-xs leading-relaxed">
            You are the screen.<br />They are the movie.<br />Just watch.
          </p>
        </div>

        {/* Reminder overlay */}
        <AnimatePresence>
          {showReminder && (
            <motion.div
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-center px-8"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <Bell className="w-8 h-8 text-amber-300/40 mx-auto mb-4" />
                <p className="text-white/70 text-sm font-display italic">
                  {REMINDERS[currentReminder]}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    );
  }

  // ─── REFLECTION PHASE (Chat-based) ───
  if (phase === "reflection") {
    return (
      <WitnessPostChat
        sessionDuration={duration}
        onComplete={(result) => {
          setSessionResult(result);
          playTempleBell();
          setPhase("complete");
        }}
        onSkip={() => {
          setPhase("complete");
        }}
      />
    );
  }

  const suggestedGuru = sessionResult?.suggestedMasterId
    ? GURUS.find(g => g.id === sessionResult.suggestedMasterId)
    : null;

  // ─── COMPLETE PHASE ───
  return (
    <motion.div
      className="fixed inset-0 z-[80] flex flex-col bg-black/95 backdrop-blur-xl overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex-1 flex flex-col items-center justify-start px-6 py-8 max-w-sm mx-auto w-full">
        {/* Bell animation */}
        <motion.div
          className="text-5xl mb-4"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3 }}
        >
          🔔
        </motion.div>

        <h2 className="text-white/80 text-xl font-display tracking-wide mb-2">
          Witnessing Complete
        </h2>
        <p className="text-white/40 text-sm font-display mb-4">
          {duration} minutes of open-eye awareness.
        </p>

        {/* AI Analysis Insights */}
        {sessionResult?.insights && (
          <motion.div
            className="w-full mt-2 mb-4 p-4 rounded-xl bg-white/[0.04] border border-amber-500/15 text-left"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-amber-300/50 text-[10px] font-display tracking-[0.2em] uppercase mb-2">Practice Insight</p>
            <p className="text-white/50 text-xs font-display leading-relaxed whitespace-pre-wrap">
              {sessionResult.insights}
            </p>
          </motion.div>
        )}

        {!sessionResult && (
          <p className="text-amber-200/40 text-xs font-display italic mb-6">
            "The witness was never born. The witness will never die. You are That."
          </p>
        )}

        {/* ─── WHAT'S NEXT ─── */}
        {sessionResult && (
          <motion.div
            className="w-full space-y-2 mt-2 mb-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-white/25 text-[10px] font-display tracking-[0.3em] uppercase mb-3 text-center">What's Next</p>

            {/* Talk to a Master */}
            {suggestedGuru && (
              <button
                onClick={() => {
                  onClose();
                  // Small delay to let close animation finish
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('open-temple-chat', { detail: { guruId: suggestedGuru.id, guruName: suggestedGuru.name } }));
                  }, 300);
                }}
                className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all text-left flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageCircle className="w-4 h-4 text-amber-300/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-xs font-display font-medium">Talk to {suggestedGuru.name}</p>
                  <p className="text-white/30 text-[10px] font-display mt-0.5 line-clamp-2">{sessionResult.suggestedMasterReason}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/20 mt-1 group-hover:text-white/40 transition-colors flex-shrink-0" />
              </button>
            )}

            {/* Journal Prompt */}
            {sessionResult.journalPrompt && (
              <button
                onClick={() => {
                  onClose();
                  setTimeout(() => navigate('/app/journal'), 300);
                }}
                className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all text-left flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4 text-blue-300/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-xs font-display font-medium">Journal about it</p>
                  <p className="text-white/30 text-[10px] font-display mt-0.5 line-clamp-2">{sessionResult.journalPrompt}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/20 mt-1 group-hover:text-white/40 transition-colors flex-shrink-0" />
              </button>
            )}

            {/* Next Practice */}
            {sessionResult.nextPracticeSuggestion && (
              <button
                onClick={() => {
                  setSessionResult(null);
                  resetPractice();
                }}
                className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all text-left flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Flame className="w-4 h-4 text-emerald-300/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-xs font-display font-medium">Next Practice</p>
                  <p className="text-white/30 text-[10px] font-display mt-0.5 line-clamp-2">{sessionResult.nextPracticeSuggestion}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/20 mt-1 group-hover:text-white/40 transition-colors flex-shrink-0" />
              </button>
            )}
          </motion.div>
        )}

        {/* Bottom actions */}
        <div className="flex gap-3 justify-center w-full">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/50 text-xs font-display tracking-wider hover:bg-white/[0.1] transition-colors"
          >
            Close
          </button>
          {!sessionResult && (
            <button
              onClick={resetPractice}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/20 text-amber-200/70 text-xs font-display tracking-wider hover:from-amber-600/30 hover:to-orange-600/30 transition-all"
            >
              Practice Again
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
