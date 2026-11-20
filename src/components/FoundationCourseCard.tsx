import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Target, Moon, Check, Sparkles, ArrowRight, Sun, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFoundationCourse } from '@/hooks/useFoundationCourse';
import type { CourseDayCurriculum } from '@/data/foundation-course/types';
import { Progress } from "@/design-system";

type CourseGate = 'morning' | 'midday' | 'evening';

interface FoundationCourseCardProps {
  gate: CourseGate;
}

/**
 * Foundation Course card integrated with the AI guide flow.
 * - Morning: launches AI guide session with today's teaching as context
 * - Midday: shows practice task with checkpoints, mark-done button
 * - Evening: launches AI guide session with evening integration as context
 * - Day Complete: shows celebration card
 */
export default function FoundationCourseCard({ gate }: FoundationCourseCardProps) {
  const navigate = useNavigate();
  const { state, completeMorning, completePractice, completeEvening } = useFoundationCourse();

  if (!state?.enrolled || !state.todayCurriculum) return null;

  const curriculum = state.todayCurriculum;
  const dayNum = state.currentDay;

  // If day is fully complete, show completion card (any gate)
  if (state.dayFullyComplete) {
    return <DayCompleteCard dayNum={dayNum} curriculum={curriculum} phaseName={state.phase.name} overallProgress={state.overallProgress} />;
  }

  if (gate === 'morning') return (
    <MorningTeachingCard
      curriculum={curriculum}
      dayNum={dayNum}
      done={state.morningDone}
      phaseName={state.phase.name}
      overallProgress={state.overallProgress}
      onStartSession={() => {
        // Build structured JOURNEY_SESSION header for guide-chat opener.
        const t = curriculum.morningTeaching;
        const greeting = (() => { const h = new Date().getHours(); if (h < 5) return "late night"; if (h < 12) return "morning"; if (h < 17) return "afternoon"; if (h < 21) return "evening"; return "night"; })();
        const ctx = [
          `JOURNEY_SESSION`,
          `GREETING: ${greeting}`,
          `SOURCE: foundation`,
          `SESSION: ${dayNum} of 118`,
          `DAY_LABEL: Day ${dayNum} — ${curriculum.title}`,
          `THEME: ${curriculum.title}`,
          curriculum.subtitle ? `MICRO: ${curriculum.subtitle}` : '',
          `PHASE: ${state.phase.name}`,
          `BLOCK: Morning teaching (${t.type})`,
          `TEACHING: ${t.concept}`,
          `KEY_POINTS:\n${t.keyPoints.map((p, i) => `  ${i + 1}. ${p}`).join('\n')}`,
          t.metaphor ? `METAPHOR: ${t.metaphor}` : '',
          t.scienceNote ? `SCIENCE: ${t.scienceNote}` : '',
          dayNum > 1 ? `PREVIOUS: Day ${dayNum - 1} complete — build on it briefly.` : `PREVIOUS: (none — this is Day 1)`,
        ].filter(Boolean).join('\n');

        const aiContext = encodeURIComponent(ctx);
        navigate(`/app/guide?mode=foundation_morning&slot=morning&aiContext=${aiContext}`);
      }}
      onMarkDone={() => completeMorning.mutate()}
    />
  );

  if (gate === 'midday') return (
    <PracticeCard
      curriculum={curriculum}
      dayNum={dayNum}
      morningDone={state.morningDone}
      practiceDone={state.practiceDone}
      onMarkDone={() => completePractice.mutate()}
    />
  );

  if (gate === 'evening') return (
    <EveningIntegrationCard
      curriculum={curriculum}
      dayNum={dayNum}
      morningDone={state.morningDone}
      practiceDone={state.practiceDone}
      eveningDone={state.eveningDone}
      phaseName={state.phase.name}
      onStartSession={() => {
        const e = curriculum.eveningIntegration;
        const greeting = (() => { const h = new Date().getHours(); if (h < 17) return "afternoon"; if (h < 21) return "evening"; return "night"; })();
        const ctx = [
          `JOURNEY_SESSION`,
          `GREETING: ${greeting}`,
          `SOURCE: foundation_evening`,
          `SESSION: ${dayNum} of 118`,
          `DAY_LABEL: Day ${dayNum} Evening — ${curriculum.title}`,
          `THEME: ${curriculum.title}`,
          `PHASE: ${state.phase.name}`,
          `BLOCK: Evening integration (${e.type})`,
          `TEACHING: ${e.closingWisdom}`,
          `REFLECTION: ${e.prompt}`,
          `DEEPER: ${e.deeperPrompt}`,
          `TODAY_PRACTICE: ${curriculum.dayPractice.instruction}`,
        ].filter(Boolean).join('\n');

        const aiContext = encodeURIComponent(ctx);
        navigate(`/app/guide?mode=foundation_evening&slot=evening&aiContext=${aiContext}`);
      }}
      onMarkDone={(reflectionText: string) => completeEvening.mutate(reflectionText)}
    />
  );

  return null;
}

// ─── Day Complete Celebration ───────────────────────────────
function DayCompleteCard({ dayNum, curriculum, phaseName, overallProgress }: {
  dayNum: number; curriculum: CourseDayCurriculum; phaseName: string; overallProgress: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative rounded-2xl overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent" />
      <div className="relative p-5 text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          <Sparkles className="w-8 h-8 text-primary mx-auto" />
        </motion.div>

        <div>
          <p className="text-[10px] font-mono text-primary tracking-wider uppercase">Day {dayNum} Complete</p>
          <h3 className="text-lg font-display font-bold text-foreground mt-1">{curriculum.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{phaseName}</p>
        </div>

        <div className="flex items-center gap-2 justify-center">
          <Progress value={overallProgress} className="h-1.5 w-32" />
          <span className="text-[10px] font-mono text-muted-foreground">{overallProgress}% of journey</span>
        </div>

        <p className="text-xs italic text-primary/60">
          "{curriculum.eveningIntegration.closingWisdom}"
        </p>

        <div className="flex gap-2 justify-center">
          {[
            { icon: <Sun className="w-3.5 h-3.5" />, label: 'Teaching' },
            { icon: <Target className="w-3.5 h-3.5" />, label: 'Practice' },
            { icon: <Moon className="w-3.5 h-3.5" />, label: 'Integration' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary"
            >
              {item.icon}
              <Check className="w-3 h-3" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Morning Teaching Card ──────────────────────────────────
function MorningTeachingCard({ curriculum, dayNum, done, phaseName, overallProgress, onStartSession, onMarkDone }: {
  curriculum: CourseDayCurriculum; dayNum: number; done: boolean; phaseName: string;
  overallProgress: number; onStartSession: () => void; onMarkDone: () => void;
}) {
  const t = curriculum.morningTeaching;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl overflow-hidden border border-primary/10"
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${done ? 'bg-primary/20' : 'bg-gradient-to-br from-primary/20 to-primary/5'}`}>
            {done ? <Check className="w-5 h-5 text-primary" /> : <BookOpen className="w-5 h-5 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-primary font-mono font-semibold">DAY {dayNum}</span>
              <span className="text-[10px] text-muted-foreground">• {phaseName}</span>
            </div>
            <div className="text-sm font-display font-semibold text-foreground truncate">{curriculum.title}</div>
          </div>
        </div>

        {/* Concept preview */}
        <div className="bg-primary/5 rounded-xl p-3">
          <p className="text-[10px] uppercase tracking-wider text-primary/60 mb-1">Today's Teaching</p>
          <p className="text-xs text-foreground/80 leading-relaxed">{t.concept}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          <Progress value={overallProgress} className="h-1 flex-1" />
          <span className="text-[9px] text-muted-foreground font-mono">{overallProgress}%</span>
        </div>

        {/* CTA */}
        {!done ? (
          <motion.button
            onClick={onStartSession}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-display font-semibold shadow-lg shadow-primary/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <BookOpen className="w-4 h-4" />
            Begin Morning Teaching
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        ) : (
          <div className="flex items-center justify-center gap-2 py-2 text-primary">
            <Check className="w-4 h-4" />
            <span className="text-xs font-semibold">Morning teaching complete</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Practice Card ──────────────────────────────────────────
function PracticeCard({ curriculum, dayNum, morningDone, practiceDone, onMarkDone }: {
  curriculum: CourseDayCurriculum; dayNum: number; morningDone: boolean; practiceDone: boolean;
  onMarkDone: () => void;
}) {
  const p = curriculum.dayPractice;
  const [showCheckpoints, setShowCheckpoints] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl overflow-hidden border border-primary/10"
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${practiceDone ? 'bg-primary/20' : 'bg-gradient-to-br from-primary/20 to-primary/5'}`}>
            {practiceDone ? <Check className="w-5 h-5 text-primary" /> : <Target className="w-5 h-5 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-primary font-mono font-semibold">DAY {dayNum} • PRACTICE</div>
            <div className="text-sm font-display font-semibold text-foreground">{curriculum.title}</div>
            <div className="text-[11px] text-muted-foreground">{p.duration}</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-muted/10 rounded-xl p-3">
          <p className="text-xs text-foreground/80 leading-relaxed">{p.instruction}</p>
        </div>

        {/* Checkpoints toggle */}
        <button
          onClick={() => setShowCheckpoints(!showCheckpoints)}
          className="text-[11px] text-primary/70 hover:text-primary transition-colors"
        >
          {showCheckpoints ? 'Hide' : 'Show'} checkpoints ({p.checkpoints.length})
        </button>

        <AnimatePresence>
          {showCheckpoints && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-1.5"
            >
              {p.checkpoints.map((cp, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 flex-shrink-0" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{cp}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        {!practiceDone && morningDone && (
          <motion.button
            onClick={onMarkDone}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
          >
            <Check className="w-4 h-4" />
            Practice completed
          </motion.button>
        )}
        {!morningDone && !practiceDone && (
          <div className="py-2 text-center text-[11px] text-muted-foreground">
            Complete morning teaching first
          </div>
        )}
        {practiceDone && (
          <div className="flex items-center justify-center gap-2 py-2 text-primary">
            <Check className="w-4 h-4" />
            <span className="text-xs font-semibold">Practice complete</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Evening Integration Card ───────────────────────────────
function EveningIntegrationCard({ curriculum, dayNum, morningDone, practiceDone, eveningDone, phaseName, onStartSession, onMarkDone }: {
  curriculum: CourseDayCurriculum; dayNum: number; morningDone: boolean; practiceDone: boolean;
  eveningDone: boolean; phaseName: string; onStartSession: () => void; onMarkDone: (text: string) => void;
}) {
  const e = curriculum.eveningIntegration;
  const canStart = morningDone && practiceDone && !eveningDone;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl overflow-hidden border border-primary/10"
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${eveningDone ? 'bg-primary/20' : 'bg-gradient-to-br from-primary/20 to-primary/5'}`}>
            {eveningDone ? <Check className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-primary font-mono font-semibold">DAY {dayNum} • INTEGRATION</div>
            <div className="text-sm font-display font-semibold text-foreground">{curriculum.title}</div>
          </div>
        </div>

        {/* Evening prompt preview */}
        <div className="bg-primary/5 rounded-xl p-3">
          <p className="text-xs text-foreground/80 leading-relaxed italic">"{e.prompt}"</p>
        </div>

        {/* CTA */}
        {canStart && (
          <motion.button
            onClick={onStartSession}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-display font-semibold shadow-lg shadow-primary/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Moon className="w-4 h-4" />
            Begin Evening Integration
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}

        {!canStart && !eveningDone && (
          <div className="py-2 text-center text-[11px] text-muted-foreground">
            {!morningDone ? 'Complete morning teaching first' : 'Complete day practice first'}
          </div>
        )}

        {eveningDone && (
          <div className="text-center py-2 space-y-1">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold">Day {dayNum} integration complete</span>
            </div>
            <p className="text-[11px] italic text-primary/50">"{e.closingWisdom}"</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
