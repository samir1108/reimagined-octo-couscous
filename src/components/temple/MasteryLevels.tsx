/**
 * Mastery Levels Display
 * Per temple.md Section 33: Novice -> Initiate -> Practitioner -> Teacher
 * NOT badges, points, leaderboards - master's quiet acknowledgment only
 */
import { motion } from "framer-motion";
import type { MasteryLevel, MasteryProgress } from "@/temple/types";

interface MasteryLevelsProps {
  progress: MasteryProgress;
  masterName?: string;
}

const LEVEL_MESSAGES: Record<MasteryLevel, string> = {
  novice: "Every master was once a beginner.",
  initiate: "You are no longer a beginner. You are an Initiate.",
  practitioner: "You don't seek. You practice.",
  teacher: "You can guide others now.",
};

const LEVEL_THRESHOLD: Record<MasteryLevel, number> = {
  novice: 0,
  initiate: 100,
  practitioner: 300,
  teacher: 1000,
};

const NEXT_LEVEL_LABEL: Record<MasteryLevel, string> = {
  novice: "Initiate",
  initiate: "Practitioner",
  practitioner: "Teacher",
  teacher: "Master",
};

export default function MasteryLevels({ progress, masterName }: MasteryLevelsProps) {
  const daysToNext = NEXT_LEVEL_LABEL[progress.level] === "Master"
    ? null
    : LEVEL_THRESHOLD[NEXT_LEVEL_LABEL[progress.level] as MasteryLevel] - progress.totalPracticeDays;

  return (
    <div className="p-4">
      <h3 className="text-white/40 text-[10px] font-display tracking-[0.3em] uppercase mb-3">
        Your Path
      </h3>

      {/* Current Level */}
      <motion.div
        className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-3 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-white/60 text-xs font-display tracking-wider mb-1">
          {progress.level.charAt(0).toUpperCase() + progress.level.slice(1)}
        </p>
        <p className="text-white/30 text-xs font-display italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          "{LEVEL_MESSAGES[progress.level]}"
        </p>
        {masterName && (
          <p className="text-white/20 text-[10px] font-display mt-2">— {masterName}</p>
        )}
      </motion.div>

      {/* Progress Bar */}
      {daysToNext !== null && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-white/25 text-[10px] font-display">Next: {NEXT_LEVEL_LABEL[progress.level]}</p>
            <p className="text-white/25 text-[10px] font-display">{daysToNext} days remaining</p>
          </div>
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500/40 to-orange-500/40 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (progress.totalPracticeDays / LEVEL_THRESHOLD[NEXT_LEVEL_LABEL[progress.level] as MasteryLevel]) * 100)}%`,
              }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-lg bg-white/[0.03]">
          <p className="text-white/60 text-sm font-display font-bold">{progress.totalPracticeDays}</p>
          <p className="text-white/20 text-[9px] font-display">Days</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/[0.03]">
          <p className="text-white/60 text-sm font-display font-bold">{progress.completedJourneys}</p>
          <p className="text-white/20 text-[9px] font-display">Journeys</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/[0.03]">
          <p className="text-white/60 text-sm font-display font-bold">{progress.completedPrograms}</p>
          <p className="text-white/20 text-[9px] font-display">Programs</p>
        </div>
      </div>
    </div>
  );
}
