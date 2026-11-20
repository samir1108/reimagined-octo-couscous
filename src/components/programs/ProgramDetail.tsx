import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, Play, Lock, Check } from "lucide-react";
import { Button } from "@/design-system";
import type { Program } from "@/data/programs/types";
import { useActiveEnrollment, useEnrollProgram, useAllDayProgress } from "@/hooks/usePrograms";
import ReactMarkdown from "react-markdown";

interface ProgramDetailProps {
  program: Program;
  onBack: () => void;
  onEnrolled: () => void;
}

export default function ProgramDetail({ program, onBack, onEnrolled }: ProgramDetailProps) {
  const { data: activeEnrollment } = useActiveEnrollment();
  const enrollMutation = useEnrollProgram();
  const { data: dayProgress } = useAllDayProgress(
    activeEnrollment?.program_id === program.id ? activeEnrollment?.id : undefined
  );
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const isEnrolled = activeEnrollment?.program_id === program.id;
  const hasAnotherProgram = activeEnrollment && activeEnrollment.program_id !== program.id;

  const handleEnroll = async () => {
    await enrollMutation.mutateAsync(program.id);
    onEnrolled();
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-display"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Programs
      </button>

      {/* Header */}
      <div className={`rounded-2xl p-6 bg-gradient-to-r ${program.coverGradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-display">
              {program.duration} Days
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-display capitalize">
              {program.difficulty}
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-1">{program.title}</h1>
          <p className="text-white/80 text-sm font-body">{program.subtitle}</p>
        </div>
      </div>

      {/* Description */}
      <div className="glass-card rounded-2xl p-5">
        <p className="text-sm text-muted-foreground font-body leading-relaxed">{program.description}</p>
      </div>

      {/* Enroll CTA */}
      {!isEnrolled && (
        <div className="glass-card rounded-2xl p-5">
          <Button
            onClick={handleEnroll}
            disabled={enrollMutation.isPending || !!hasAnotherProgram}
            className="w-full rounded-xl font-display h-12 bg-gradient-to-r from-primary to-primary/80"
          >
            <Play className="w-4 h-4 mr-2" />
            {hasAnotherProgram ? "Leave current program first" : enrollMutation.isPending ? "Starting..." : "Start This Program"}
          </Button>
          {hasAnotherProgram && (
            <p className="text-xs text-muted-foreground font-body text-center mt-2">
              You have an active program. Leave it from Settings first.
            </p>
          )}
        </div>
      )}

      {isEnrolled && (
        <div className="glass-card rounded-2xl p-4 border border-primary/20">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-sm font-display text-primary font-semibold">
              Enrolled — Day {activeEnrollment?.current_day || 1}
            </span>
          </div>
        </div>
      )}

      {/* Curriculum */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-foreground text-sm px-1">Curriculum</h3>
        {program.curriculum.map((day) => {
          const progress = dayProgress?.find(p => p.day_number === day.day);
          const isCompleted = !!progress?.completed_at;
          const isCurrent = isEnrolled && activeEnrollment?.current_day === day.day;
          const isLocked = isEnrolled && day.day > (activeEnrollment?.current_day || 1);

          return (
            <motion.div
              key={day.day}
              className={`glass-card rounded-xl p-4 cursor-pointer transition-all ${
                isCurrent ? "border border-primary/30 bg-primary/5" : ""
              } ${isCompleted ? "opacity-70" : ""} ${isLocked ? "opacity-40" : ""}`}
              onClick={() => !isLocked && setExpandedDay(expandedDay === day.day ? null : day.day)}
              whileTap={isLocked ? {} : { scale: 0.99 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-bold ${
                    isCompleted ? "bg-primary/20 text-primary" :
                    isCurrent ? "bg-primary text-primary-foreground" :
                    "glass-subtle text-muted-foreground"
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : day.day}
                  </div>
                  <div>
                    <p className="text-sm font-display font-semibold text-foreground">{day.title}</p>
                    <p className="text-xs text-muted-foreground font-body">{day.theme}</p>
                  </div>
                </div>
                {isLocked && <Lock className="w-4 h-4 text-muted-foreground/40" />}
                {isCurrent && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-display">Today</span>}
              </div>

              <AnimatePresence>
                {expandedDay === day.day && !isLocked && (
                  <motion.div
                    className="mt-3 pt-3 border-t border-border/30 space-y-2"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                      <BookOpen className="w-3 h-3" />
                      <span>Learn: {day.knowledge.title} ({day.knowledge.readingTime} min read)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                      <Play className="w-3 h-3" />
                      <span>Practice: {day.practice.title} ({day.practice.durationMinutes} min)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                      <Clock className="w-3 h-3" />
                      <span>Reflect: Journal prompt</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
