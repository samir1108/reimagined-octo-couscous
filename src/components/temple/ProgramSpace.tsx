/**
 * Program Space (Inside Temple Only)
 * Per temple.md Screen 11: Day counter, today's session, practice button, chat with master, log signals, read texts
 * "This program exists only within these sacred walls."
 */
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Sparkles, BookOpen, BarChart3, Play, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { Guru } from "@/lib/guru-data";

interface ProgramSpaceProps {
  programTitle: string;
  programDescription: string;
  masterName: string;
  masterImage: string;
  currentDay: number;
  totalDays: number;
  onBack: () => void;
  onTalk: (guru: Guru) => void;
  onPractice: () => void;
}

export default function ProgramSpace({
  programTitle,
  programDescription,
  masterName,
  masterImage,
  currentDay,
  totalDays,
  onBack,
  onTalk,
  onPractice,
}: ProgramSpaceProps) {
  const [activeSection, setActiveSection] = useState<"overview" | "session" | "chat" | "log" | "texts">("overview");

  if (activeSection === "chat") {
    return (
      <motion.div
        className="fixed inset-0 z-[70] flex flex-col bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <button onClick={() => setActiveSection("overview")} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
            ←
          </button>
          <p className="text-white/70 text-xs font-display">Chat with {masterName}</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/30 text-sm font-display text-center px-4">
            Chat with {masterName} about your program experience.
            <br />
            <span className="text-white/20 text-xs">What's arising during "{programTitle}"?</span>
          </p>
        </div>
      </motion.div>
    );
  }

  if (activeSection === "log") {
    return (
      <motion.div
        className="fixed inset-0 z-[70] flex flex-col bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <button onClick={() => setActiveSection("overview")} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
            ←
          </button>
          <p className="text-white/70 text-xs font-display">Log Signals</p>
        </div>
        <div className="flex-1 p-4 space-y-3">
          {["Sleep Quality", "Stress Level", "Clarity", "Energy", "Mood"].map((signal, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/50 text-xs font-display">{signal}</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button key={v} className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/[0.1] text-white/30 text-[10px] hover:bg-amber-500/15 hover:border-amber-500/30 hover:text-amber-300/60 transition-all">
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  const progress = (currentDay / totalDays) * 100;

  return (
    <motion.div
      className="fixed inset-0 z-[65] flex flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img src={masterImage} alt="" className="w-full h-full object-cover object-top opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/70" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <p className="text-white/70 text-xs font-display font-medium">{programTitle}</p>
          <p className="text-white/30 text-[10px] font-display tracking-wider">Day {currentDay}/{totalDays} · {masterName}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 h-0.5 bg-white/[0.04]">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500/40 to-orange-500/40"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1 }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-none px-4 md:px-8 py-6">
        {/* Sacred boundary message */}
        <motion.div
          className="mb-6 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-white/25 text-[10px] font-display italic">
            "This program exists only within these sacred walls."
          </p>
        </motion.div>

        {/* Today's Session */}
        <motion.div
          className="mb-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-amber-200/60 text-[10px] font-display tracking-[0.3em] uppercase mb-2">Today's Session</h3>
          <p className="text-white/60 text-sm font-display mb-3">Day {currentDay}: {programDescription}</p>
          <button
            onClick={onPractice}
            className="w-full py-2.5 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-200/80 text-xs font-display tracking-wider hover:bg-amber-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5" />
            Begin Today's Practice
          </button>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.button
            onClick={() => setActiveSection("chat")}
            className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] transition-all text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <MessageCircle className="w-5 h-5 text-white/30 mx-auto mb-1" />
            <p className="text-white/50 text-xs font-display">Chat with {masterName.split(" ")[0]}</p>
          </motion.button>
          <motion.button
            onClick={() => setActiveSection("log")}
            className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] transition-all text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <BarChart3 className="w-5 h-5 text-white/30 mx-auto mb-1" />
            <p className="text-white/50 text-xs font-display">Log Signals</p>
          </motion.button>
          <motion.button
            onClick={() => setActiveSection("texts")}
            className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] transition-all text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <BookOpen className="w-5 h-5 text-white/30 mx-auto mb-1" />
            <p className="text-white/50 text-xs font-display">Read Texts</p>
          </motion.button>
          <motion.button
            className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] transition-all text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Sparkles className="w-5 h-5 text-white/30 mx-auto mb-1" />
            <p className="text-white/50 text-xs font-display">Practice</p>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
