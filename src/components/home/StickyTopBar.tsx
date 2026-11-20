// StickyTopBar — top bar with streak, daily gate, and key metrics
"use client";

import { motion } from "framer-motion";
import { Flame, Zap, Crown, Heart } from "lucide-react";

interface StickyTopBarProps {
  streak: number;
  dailyGate: string;
  totalMinutes: number;
  totalSessions: number;
}

export default function StickyTopBar({
  streak,
  dailyGate,
  totalMinutes,
  totalSessions,
}: StickyTopBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 px-4 py-3"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          {/* Daily Gate */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-white/60"
          >
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span>{dailyGate}</span>
          </motion.div>

          {/* Streak */}
          {streak > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-white/60"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{streak} day streak</span>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-6 text-right">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-white/60"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>{totalSessions} sessions</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-white/60"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>{totalMinutes} min</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}