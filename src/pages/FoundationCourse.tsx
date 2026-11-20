import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, Brain, Heart, Activity, Repeat, Search, Zap, Compass, Lock, Check, Sun, Moon, Sparkles, ChevronRight, BookOpen, Target, Feather } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFoundationCourse, useCourseDayHistory } from '@/hooks/useFoundationCourse';
import { COURSE_PHASES, getCourseDay } from '@/data/foundation-course';
import type { CoursePhaseInfo, CourseDayCurriculum } from '@/data/foundation-course/types';
import { Progress } from "@/design-system";
import { supabase } from '@/lib/supabase';
import PracticeAlarmScheduler from '@/components/foundation-course/PracticeAlarmScheduler';


const PHASE_ICONS: Record<string, any> = {
  Eye, Brain, Heart, Activity, Repeat, Search, Zap, Compass,
};

// ─── Enrollment Screen ─────────────────────────────────────
function EnrollmentScreen({ onEnroll, loading }: { onEnroll: () => void; loading: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
      >
        <Sparkles className="w-10 h-10 text-primary" />
      </motion.div>
      <h1 className="text-3xl font-display font-bold text-foreground mb-3">
        The 118-Day Foundation
      </h1>
      <p className="text-muted-foreground max-w-md mb-2 text-sm leading-relaxed">
        A complete transformation journey — from unconscious living to conscious mastery. 
        8 phases. 118 days. Every major wisdom tradition distilled into daily practice.
      </p>
      <div className="grid grid-cols-2 gap-2 my-6 max-w-sm w-full">
        {COURSE_PHASES.slice(0, 4).map((p) => {
          const Icon = PHASE_ICONS[p.icon] || Eye;
          return (
            <div key={p.id} className="glass-card p-3 rounded-xl text-left">
              <Icon className="w-4 h-4 text-primary mb-1" />
              <div className="text-xs font-semibold text-foreground">{p.name}</div>
              <div className="text-[10px] text-muted-foreground">Days {p.days[0]}–{p.days[1]}</div>
            </div>
          );
        })}
      </div>
      <button
        onClick={onEnroll}
        disabled={loading}
        className="w-full max-w-sm py-3.5 rounded-2xl bg-primary text-primary-foreground font-display font-semibold text-sm tracking-wide hover:brightness-110 transition-all disabled:opacity-50"
      >
        {loading ? 'Beginning...' : 'Begin Your Journey'}
      </button>
    </motion.div>
  );
}

// ─── Phase Card ─────────────────────────────────────────────
function PhaseCard({ phase, currentDay, onClick }: { phase: CoursePhaseInfo; currentDay: number; onClick: () => void }) {
  const Icon = PHASE_ICONS[phase.icon] || Eye;
  const isActive = currentDay >= phase.days[0] && currentDay <= phase.days[1];
  const isCompleted = currentDay > phase.days[1];
  const isLocked = currentDay < phase.days[0];

  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      whileTap={isLocked ? {} : { scale: 0.97 }}
      className={`w-full glass-card rounded-2xl p-4 text-left transition-all ${
        isActive ? 'ring-1 ring-primary/40' : ''
      } ${isLocked ? 'opacity-40' : 'hover:ring-1 hover:ring-primary/20'}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isCompleted ? 'bg-green-500/20' : isActive ? 'bg-primary/15' : 'bg-muted/30'
        }`}>
          {isCompleted ? <Check className="w-5 h-5 text-green-400" /> : 
           isLocked ? <Lock className="w-4 h-4 text-muted-foreground" /> : 
           <Icon className="w-5 h-5 text-primary" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-display font-semibold text-foreground truncate">{phase.name}</div>
          <div className="text-[11px] text-muted-foreground">{phase.subtitle}</div>
        </div>
        <div className="text-[10px] text-muted-foreground font-mono">
          D{phase.days[0]}–{phase.days[1]}
        </div>
      </div>
      {isActive && (
        <div className="mt-3">
          <Progress value={((currentDay - phase.days[0]) / (phase.days[1] - phase.days[0] + 1)) * 100} className="h-1.5" />
          <div className="text-[10px] text-muted-foreground mt-1">
            Day {currentDay - phase.days[0] + 1} of {phase.days[1] - phase.days[0] + 1}
          </div>
        </div>
      )}
    </motion.button>
  );
}

// ─── Today's Day View ───────────────────────────────────────
function DayView({
  curriculum,
  dayNum,
  morningDone,
  practiceDone,
  eveningDone,
  onCompleteMorning,
  onCompletePractice,
  onCompleteEvening,  // receives reflection text
  onBack,
}: {
  curriculum: CourseDayCurriculum;
  dayNum: number;
  morningDone: boolean;
  practiceDone: boolean;
  eveningDone: boolean;
  onCompleteMorning: () => void;
  onCompletePractice: () => void;
  onCompleteEvening: (text: string) => void;
  onBack: () => void;
}) {
  const [expandedSection, setExpandedSection] = useState<'morning' | 'practice' | 'evening' | null>(null);
  const [reflectionText, setReflectionText] = useState('');

  const sections = [
    {
      key: 'morning' as const,
      icon: Sun,
      title: 'Morning Teaching',
      subtitle: curriculum.morningTeaching.concept,
      done: morningDone,
      unlocked: true,
    },
    {
      key: 'practice' as const,
      icon: Target,
      title: 'Day Practice',
      subtitle: curriculum.dayPractice.duration,
      done: practiceDone,
      unlocked: morningDone,
    },
    {
      key: 'evening' as const,
      icon: Moon,
      title: 'Evening Integration',
      subtitle: 'Reflect & integrate',
      done: eveningDone,
      unlocked: morningDone && practiceDone,
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="w-8 h-8 rounded-xl bg-muted/30 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div>
          <div className="text-[11px] text-primary font-mono">DAY {dayNum}</div>
          <h2 className="text-lg font-display font-bold text-foreground leading-tight">{curriculum.title}</h2>
          <p className="text-xs text-muted-foreground">{curriculum.subtitle}</p>
        </div>
      </div>

      {/* Three Gates */}
      {sections.map((s) => {
        const Icon = s.icon;
        const isExpanded = expandedSection === s.key;
        return (
          <motion.div key={s.key} layout className="glass-card rounded-2xl overflow-hidden">
            <button
              onClick={() => s.unlocked && setExpandedSection(isExpanded ? null : s.key)}
              disabled={!s.unlocked}
              className={`w-full p-4 flex items-center gap-3 text-left ${!s.unlocked ? 'opacity-40' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                s.done ? 'bg-green-500/20' : 'bg-primary/10'
              }`}>
                {s.done ? <Check className="w-5 h-5 text-green-400" /> : <Icon className="w-5 h-5 text-primary" />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{s.title}</div>
                <div className="text-xs text-muted-foreground">{s.subtitle}</div>
              </div>
              {s.unlocked && !s.done && (
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              )}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3">
                    {s.key === 'morning' && (
                      <MorningContent curriculum={curriculum} onComplete={onCompleteMorning} done={morningDone} />
                    )}
                    {s.key === 'practice' && (
                      <PracticeContent curriculum={curriculum} onComplete={onCompletePractice} done={practiceDone} />
                    )}
                    {s.key === 'evening' && (
                      <EveningContent
                        curriculum={curriculum}
                        reflectionText={reflectionText}
                        setReflectionText={setReflectionText}
                        onComplete={() => onCompleteEvening(reflectionText)}
                        done={eveningDone}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ─── Morning Content ────────────────────────────────────────
function MorningContent({ curriculum, onComplete, done }: { curriculum: CourseDayCurriculum; onComplete: () => void; done: boolean }) {
  const t = curriculum.morningTeaching;
  return (
    <div className="space-y-3 border-t border-border/30 pt-3">
      {t.metaphor && (
        <div className="bg-primary/5 rounded-xl p-3">
          <div className="text-[10px] uppercase tracking-wider text-primary/60 mb-1 flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> Story
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed italic">"{t.metaphor}"</p>
        </div>
      )}
      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Key Teachings</div>
        {t.keyPoints.map((point, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[9px] text-primary font-bold">{i + 1}</span>
            </div>
            <p className="text-xs text-foreground/70 leading-relaxed">{point}</p>
          </div>
        ))}
      </div>
      {t.scienceNote && (
        <div className="bg-muted/20 rounded-xl p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">🧠 Science</div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{t.scienceNote}</p>
        </div>
      )}
      {!done && (
        <button onClick={onComplete} className="w-full py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors">
          I've absorbed this teaching ✓
        </button>
      )}
    </div>
  );
}

// ─── Practice Content ───────────────────────────────────────
function PracticeContent({ curriculum, onComplete, done }: { curriculum: CourseDayCurriculum; onComplete: () => void; done: boolean }) {
  const p = curriculum.dayPractice;
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    supabase.auth.getUser().then(({ data }) => {
      if (alive) setUserId(data.user?.id ?? null);
    });
    return () => { alive = false; };
  }, []);
  const dayKey = `${new Date().toISOString().slice(0, 10)}:day-${curriculum.day}`;
  return (
    <div className="space-y-3 border-t border-border/30 pt-3">
      <div className="bg-primary/5 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">{p.duration}</span>
        </div>
        <p className="text-xs text-foreground/80 leading-relaxed">{p.instruction}</p>
      </div>
      {userId && (
        <PracticeAlarmScheduler
          userId={userId}
          dayKey={dayKey}
          instruction={p.instruction}
          checkpoints={p.checkpoints}
          practiceLabel={curriculum.title}
        />
      )}
      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Checkpoints</div>
        {p.checkpoints.map((cp, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">{cp}</p>
          </div>
        ))}
      </div>
      {!done && (
        <button onClick={onComplete} className="w-full py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors">
          Practice completed ✓
        </button>
      )}
    </div>
  );
}

// ─── Evening Content ────────────────────────────────────────
function EveningContent({
  curriculum, reflectionText, setReflectionText, onComplete, done,
}: {
  curriculum: CourseDayCurriculum;
  reflectionText: string;
  setReflectionText: (v: string) => void;
  onComplete: () => void;
  done: boolean;
}) {
  const e = curriculum.eveningIntegration;
  return (
    <div className="space-y-3 border-t border-border/30 pt-3">
      <div className="bg-primary/5 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <Feather className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Reflection</span>
        </div>
        <p className="text-xs text-foreground/80 leading-relaxed">{e.prompt}</p>
      </div>
      <div className="bg-muted/20 rounded-xl p-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Go Deeper</div>
        <p className="text-[11px] text-muted-foreground italic leading-relaxed">{e.deeperPrompt}</p>
      </div>
      {!done && (
        <>
          <textarea
            value={reflectionText}
            onChange={(ev) => setReflectionText(ev.target.value)}
            placeholder="Write your evening reflection..."
            rows={4}
            className="w-full text-xs bg-muted/20 border border-border/30 rounded-xl p-3 text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <button
            onClick={onComplete}
            disabled={reflectionText.trim().length < 10}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-40"
          >
            Complete Day ✓
          </button>
        </>
      )}
      <div className="text-center py-2">
        <p className="text-xs text-primary/60 italic">"{e.closingWisdom}"</p>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────
export default function FoundationCourse() {
  const navigate = useNavigate();
  const { state, isLoading, enroll, completeMorning, completePractice, completeEvening } = useFoundationCourse();
  const [view, setView] = useState<'overview' | 'today' | 'phase'>('overview');
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
          <Sparkles className="w-8 h-8 text-primary/40" />
        </motion.div>
      </div>
    );
  }

  if (!state?.enrolled) {
    return (
      <>
        <EnrollmentScreen onEnroll={() => enroll.mutate()} loading={enroll.isPending} />
      </>
    );
  }

  const currentDay = state.currentDay;
  const todayCurriculum = state.todayCurriculum;

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 pb-24 space-y-5">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button onClick={() => view === 'overview' ? navigate('/app') : setView('overview')} className="w-8 h-8 rounded-xl bg-muted/30 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="text-center">
            <div className="text-[10px] text-primary font-mono tracking-wider">FOUNDATION COURSE</div>
            <div className="text-xs text-muted-foreground">Day {currentDay} of 118</div>
          </div>
          <div className="w-8" />
        </div>

        {/* Overall progress */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-display text-foreground font-semibold">{state.phase.name}</span>
            <span className="text-[10px] text-primary font-mono">{state.overallProgress}%</span>
          </div>
          <Progress value={state.overallProgress} className="h-1.5 mb-1" />
          <div className="text-[10px] text-muted-foreground">{state.phase.subtitle}</div>
        </div>

        <AnimatePresence mode="wait">
          {view === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Today's card - tap to open */}
              {todayCurriculum && (
                <motion.button
                  onClick={() => setView('today')}
                  whileTap={{ scale: 0.98 }}
                  className="w-full glass-card rounded-2xl p-5 text-left ring-1 ring-primary/30"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                      <Sun className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] text-primary font-mono mb-0.5">TODAY — DAY {currentDay}</div>
                      <div className="text-sm font-display font-bold text-foreground">{todayCurriculum.title}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{todayCurriculum.subtitle}</p>
                  <div className="flex gap-2">
                    {[
                      { label: 'Morning', done: state.morningDone },
                      { label: 'Practice', done: state.practiceDone },
                      { label: 'Evening', done: state.eveningDone },
                    ].map(g => (
                      <div key={g.label} className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-semibold ${
                        g.done ? 'bg-green-500/15 text-green-400' : 'bg-muted/20 text-muted-foreground'
                      }`}>
                        {g.done ? '✓ ' : ''}{g.label}
                      </div>
                    ))}
                  </div>
                </motion.button>
              )}

              {/* Phase list */}
              <div className="space-y-2">
                <div className="text-[11px] text-muted-foreground font-display uppercase tracking-wider px-1">All Phases</div>
                {COURSE_PHASES.map((phase) => (
                  <PhaseCard
                    key={phase.id}
                    phase={phase}
                    currentDay={currentDay}
                    onClick={() => {
                      if (currentDay >= phase.days[0]) {
                        setSelectedPhaseId(phase.id);
                        setView('phase');
                      }
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {view === 'today' && todayCurriculum && (
            <DayView
              key="today"
              curriculum={todayCurriculum}
              dayNum={currentDay}
              morningDone={state.morningDone}
              practiceDone={state.practiceDone}
              eveningDone={state.eveningDone}
              onCompleteMorning={() => completeMorning.mutate()}
              onCompletePractice={() => completePractice.mutate()}
              onCompleteEvening={(text) => completeEvening.mutate(text)}
              onBack={() => setView('overview')}
            />
          )}

          {view === 'phase' && selectedPhaseId && (
            <PhaseDetailView
              phaseId={selectedPhaseId}
              currentDay={currentDay}
              onDaySelect={(day) => {
                // Can only view current day
                if (day === currentDay) setView('today');
              }}
              onBack={() => setView('overview')}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Phase Detail View ──────────────────────────────────────
function PhaseDetailView({ phaseId, currentDay, onDaySelect, onBack }: {
  phaseId: string;
  currentDay: number;
  onDaySelect: (day: number) => void;
  onBack: () => void;
}) {
  const phase = COURSE_PHASES.find(p => p.id === phaseId);
  if (!phase) return null;
  const Icon = PHASE_ICONS[phase.icon] || Eye;

  const days = [];
  for (let d = phase.days[0]; d <= phase.days[1]; d++) {
    days.push(d);
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="w-8 h-8 rounded-xl bg-muted/30 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-display font-bold text-foreground">{phase.name}</h2>
          </div>
          <p className="text-xs text-muted-foreground">{phase.subtitle}</p>
        </div>
      </div>

      <p className="text-xs text-foreground/60 leading-relaxed">{phase.description}</p>

      <div className="space-y-1.5">
        {days.map(d => {
          const cur = getCourseDay(d);
          const isCompleted = d < currentDay;
          const isCurrent = d === currentDay;
          const isLocked = d > currentDay;
          return (
            <button
              key={d}
              onClick={() => !isLocked && onDaySelect(d)}
              disabled={isLocked}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                isCurrent ? 'glass-card ring-1 ring-primary/30' : isCompleted ? 'bg-muted/10' : 'opacity-40'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono ${
                isCompleted ? 'bg-green-500/20 text-green-400' : isCurrent ? 'bg-primary/15 text-primary' : 'bg-muted/20 text-muted-foreground'
              }`}>
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : d}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground truncate">{cur?.title || `Day ${d}`}</div>
                <div className="text-[10px] text-muted-foreground truncate">{cur?.subtitle || ''}</div>
              </div>
              {isCurrent && <ChevronRight className="w-4 h-4 text-primary" />}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
