import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronRight, Clock, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePreJourney } from '@/hooks/usePreJourney';
import { getModuleInfo, type PreJourneySession } from '@/data/pre-journey/sessions';
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";

interface PreJourneySessionPlayerProps {
  session: PreJourneySession;
  onClose: () => void;
  onComplete: () => void;
  onSwitchToTalk?: () => void;
}

type Phase = 'teaching' | 'practice' | 'reflection' | 'done';

export function PreJourneySessionPlayer({ session, onClose, onComplete, onSwitchToTalk }: PreJourneySessionPlayerProps) {
  const { completeSession } = usePreJourney();
  const [phase, setPhase] = useState<Phase>('teaching');
  const [reflection, setReflection] = useState('');
  const [practiceTime, setPracticeTime] = useState(session.microPractice?.durationSec ?? 0);
  const moduleInfo = getModuleInfo(session.module);

  useEffect(() => {
    if (phase !== 'practice' || !session.microPractice) return;
    if (practiceTime <= 0) return;
    const t = setInterval(() => setPracticeTime(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [phase, practiceTime, session.microPractice]);

  const handleNext = () => {
    if (phase === 'teaching') {
      setPhase(session.microPractice ? 'practice' : 'reflection');
    } else if (phase === 'practice') {
      setPhase('reflection');
    } else if (phase === 'reflection') {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    await completeSession.mutateAsync({
      sessionId: session.id,
      reflection: reflection.trim() || undefined,
    });
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[130] bg-background overflow-y-auto"
    >
      {/* Header */}
      <div className={cn('sticky top-0 z-10 bg-gradient-to-r text-white', moduleInfo.gradient)}>
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs opacity-75 uppercase tracking-wider">
              Module {session.module} · Session {session.number}
            </p>
            <p className="text-sm font-medium mt-0.5 line-clamp-1">{moduleInfo.name}</p>
          </div>
          <div className="flex items-center gap-1">
            {onSwitchToTalk && (
              <button
                onClick={onSwitchToTalk}
                className="p-2 rounded-full hover:bg-white/20 text-white/90"
                title="Talk with your guide instead"
                aria-label="Switch to talk mode"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-5 py-8 pb-32">
        {/* Phase: Teaching */}
        {phase === 'teaching' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl font-semibold leading-tight text-foreground">
              {session.title}
            </h1>
            <p className="text-lg text-muted-foreground mt-3 italic">{session.hook}</p>
            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              ~{session.estMinutes} min
            </div>
            <div className="mt-8 prose prose-invert max-w-none text-foreground/90 leading-relaxed whitespace-pre-line">
              {session.teaching}
            </div>
          </motion.div>
        )}

        {/* Phase: Micro-practice */}
        {phase === 'practice' && session.microPractice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              Micro-practice
            </p>
            <h2 className="text-2xl font-semibold mb-2">{session.microPractice.label}</h2>
            <p className="text-foreground/80 mb-10 max-w-md mx-auto">
              {session.microPractice.instruction}
            </p>

            <div className="relative w-48 h-48 mx-auto mb-8">
              <motion.div
                className={cn('absolute inset-0 rounded-full bg-gradient-to-br opacity-30', moduleInfo.gradient)}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="absolute inset-4 rounded-full bg-card border border-border flex items-center justify-center">
                <span className="text-4xl font-light tabular-nums">{practiceTime}</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={practiceTime > 0}
            >
              {practiceTime > 0 ? `Wait ${practiceTime}s` : 'Continue →'}
            </Button>
          </motion.div>
        )}

        {/* Phase: Reflection */}
        {phase === 'reflection' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              Reflection
            </p>
            <h2 className="text-2xl font-semibold mb-6 leading-snug">
              {session.reflectionPrompt}
            </h2>
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Write what comes up… or leave blank and just sit with the question."
              rows={6}
              className="text-base"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Optional. Sometimes the question itself is the practice.
            </p>
          </motion.div>
        )}
      </div>

      {/* Sticky footer CTA */}
      {phase !== 'practice' && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4">
          <div className="max-w-2xl mx-auto">
            <Button
              size="lg"
              className="w-full"
              onClick={handleNext}
              disabled={completeSession.isPending}
            >
              {phase === 'teaching' && (
                <>{session.microPractice ? 'Begin micro-practice' : 'Continue to reflection'} <ChevronRight className="w-4 h-4 ml-1" /></>
              )}
              {phase === 'reflection' && (
                <>Mark complete <ChevronRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
