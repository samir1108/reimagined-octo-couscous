import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Clock, Zap, Loader2, Play, ChevronRight } from "lucide-react";
import type { Guru } from "@/lib/guru-data";
import { useGuruProgramCatalog, useEnrollGuruProgram, useActiveGuruProgram, type GuruProgram } from "@/hooks/useGuruPrograms";
import { useState } from "react";
import ProgramActivation from "./ProgramActivation";

type Props = {
  guru: Guru | null;
  onClose: () => void;
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  advanced: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

export default function GuruProgramsSheet({ guru, onClose }: Props) {
  const { data: programs, isLoading } = useGuruProgramCatalog(guru?.id ?? null);
  const { data: activeProgram } = useActiveGuruProgram();
  const enrollMutation = useEnrollGuruProgram();
  const [confirmProgram, setConfirmProgram] = useState<GuruProgram | null>(null);
  const [showActivation, setShowActivation] = useState<GuruProgram | null>(null);

  const handleEnroll = (program: GuruProgram) => {
    if (activeProgram) {
      setConfirmProgram(null);
      return;
    }
    setShowActivation(program);
  };

  const handleActivationComplete = () => {
    if (!guru || !showActivation) return;
    enrollMutation.mutate(
      { guruId: guru.id, program: showActivation },
      { onSuccess: () => { setShowActivation(null); onClose(); } }
    );
  };

  return (
    <AnimatePresence>
      {guru && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Sheet */}
          <motion.div
            className="relative z-10 w-full max-w-lg max-h-[85vh] bg-black/95 border-t border-white/10 rounded-t-3xl overflow-hidden flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="relative p-5 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <img
                  src={guru.image}
                  alt={guru.name}
                  className="w-12 h-12 rounded-xl object-cover object-top ring-1 ring-white/10"
                />
                <div className="flex-1">
                  <h2 className="text-white/90 text-base font-display font-medium tracking-wide">
                    {guru.name}'s Programs
                  </h2>
                  <p className="text-white/30 text-xs font-display tracking-wider">
                    AI-crafted transformation journeys
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
                  <p className="text-white/25 text-xs font-display tracking-wider">
                    {guru.name} is crafting programs...
                  </p>
                </div>
              ) : programs && programs.length > 0 ? (
                programs.map((program, i) => (
                  <motion.div
                    key={i}
                    className="rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] p-4 transition-all duration-300"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-white/85 text-sm font-display font-medium tracking-wide flex-1">
                        {program.title}
                      </h3>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-display tracking-wider border ${DIFFICULTY_COLORS[program.difficulty] || DIFFICULTY_COLORS.beginner}`}>
                        {program.difficulty}
                      </span>
                    </div>
                    <p className="text-white/35 text-xs font-body leading-relaxed mb-3">
                      {program.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-white/25 text-[10px] font-display tracking-wider">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {program.duration_days} days
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {program.focus}
                        </span>
                      </div>
                      <button
                        onClick={() => handleEnroll(program)}
                        disabled={!!activeProgram || enrollMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white/60 hover:text-white/90 text-[10px] font-display tracking-wider transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Play className="w-3 h-3" />
                        {activeProgram ? "Active Program Running" : "Begin"}
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <BookOpen className="w-6 h-6 text-white/20" />
                  <p className="text-white/25 text-xs font-display">No programs available</p>
                </div>
              )}
            </div>

            {/* Active Program Warning */}
            {activeProgram && (
              <div className="p-3 border-t border-white/[0.06] bg-amber-500/5">
                <p className="text-amber-400/60 text-[10px] font-display text-center tracking-wider">
                  You have an active program. Leave it first to start a new one.
                </p>
              </div>
            )}
          </motion.div>

          {/* Program Activation with Temple Vows */}
          <AnimatePresence>
            {showActivation && guru && (
              <ProgramActivation
                programTitle={showActivation.title}
                programDescription={showActivation.description}
                masterName={guru.name}
                masterImage={guru.image}
                durationDays={showActivation.duration_days}
                dailyTimeMinutes={30}
                hasLegalDisclaimer={false}
                onActivate={handleActivationComplete}
                onClose={() => setShowActivation(null)}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
