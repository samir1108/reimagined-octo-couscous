import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Timer, Play, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { Guru, GuruPractice } from "@/lib/guru-data";
import InteractivePracticeSession from "./InteractivePracticeSession";

interface PracticeModeSelectorProps {
  practice: GuruPractice;
  guru: Guru;
  onBack: () => void;
}

type Mode = "chat" | "timer" | "session";

const DURATIONS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "60 min", value: 60 },
];

export default function PracticeModeSelector({ practice, guru, onBack }: PracticeModeSelectorProps) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [duration, setDuration] = useState(30);

  if (mode === "session" && practice.steps) {
    return (
      <InteractivePracticeSession
        practice={practice}
        guru={guru}
        onBack={() => setMode(null)}
      />
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img src={guru.bgImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/60" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h2 className="text-white/80 text-sm font-display font-medium">{practice.name}</h2>
          <p className="text-white/30 text-[10px] font-display tracking-wider">with {guru.name}</p>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-4 md:px-8">
        {/* Guru portrait */}
        <motion.img
          src={guru.image}
          alt={guru.name}
          className="w-20 h-20 rounded-full object-cover object-top ring-2 ring-white/10 mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        />

        <motion.h3
          className="text-white/70 text-lg font-display text-center mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Choose Your Mode
        </motion.h3>
        <motion.p
          className="text-white/30 text-xs font-display text-center mb-8 max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {practice.description}
        </motion.p>

        {/* Mode Cards */}
        <div className="w-full max-w-md space-y-3 mb-8">
          {/* Chat Mode */}
          <motion.button
            onClick={() => setMode("chat")}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              mode === "chat"
                ? "bg-amber-500/15 border-amber-500/30"
                : "bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.06]"
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-amber-400/60" />
              </div>
              <div className="flex-1">
                <p className="text-white/80 text-sm font-display font-medium">Chat Mode</p>
                <p className="text-white/30 text-xs font-display">Guided, interactive. Ask questions, receive guidance.</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20" />
            </div>
          </motion.button>

          {/* Timer Mode */}
          <motion.button
            onClick={() => setMode("timer")}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              mode === "timer"
                ? "bg-amber-500/15 border-amber-500/30"
                : "bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.06]"
            }`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <Timer className="w-5 h-5 text-amber-400/60" />
              </div>
              <div className="flex-1">
                <p className="text-white/80 text-sm font-display font-medium">Timer Mode</p>
                <p className="text-white/30 text-xs font-display">Silent, ambient. Just the timer and sacred sounds.</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20" />
            </div>
          </motion.button>
        </div>

        {/* Duration selector */}
        {mode && (
          <motion.div
            className="w-full max-w-md mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-white/40 text-[10px] font-display tracking-[0.3em] uppercase mb-3 text-center">
              Duration
            </p>
            <div className="flex gap-2 justify-center">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  className={`px-4 py-2 rounded-full text-xs font-display tracking-wider transition-all ${
                    duration === d.value
                      ? "bg-white/[0.12] text-white/80 border border-white/[0.15]"
                      : "bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.08]"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Begin Practice button */}
        {mode && (
          <motion.button
            onClick={() => {
              if (mode === "chat" && practice.steps) {
                setMode("session");
              }
            }}
            className="w-full max-w-md py-3 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/25 text-amber-200/80 text-sm font-display tracking-wider hover:from-amber-600/40 hover:to-orange-600/40 transition-all flex items-center justify-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play className="w-4 h-4" />
            Begin Practice ({duration} min)
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
