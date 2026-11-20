/**
 * SessionAgendaCard — preview sheet shown when the user taps the orb.
 * Mirrors the "agenda" UX from the Guide: shows what they'll learn, what
 * micro-practice (if any) is included, est. time, and a single Begin button
 * that hands off to the existing Conversation / Read player.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, BookOpen, Wind, Feather, MessageCircle, ScrollText, Clock } from 'lucide-react';
import type { PreJourneySession } from '@/data/pre-journey/sessions';

interface Props {
  open: boolean;
  session: PreJourneySession;
  sessionIndex: number;
  totalSessions: number;
  onClose: () => void;
  onStartTalk: () => void;
  onStartRead: () => void;
}

export default function SessionAgendaCard({
  open, session, sessionIndex, totalSessions, onClose, onStartTalk, onStartRead,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[150] bg-background/85 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-6"
        >
          <motion.div
            initial={{ y: 24, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card border border-primary/25 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-5 pb-4 border-b border-border/40">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center hover:bg-muted/50 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/80">
                  Session {sessionIndex} of {totalSessions} · {session.moduleName}
                </span>
              </div>
              <h2 className="text-xl font-display font-semibold text-foreground leading-tight pr-8">
                {session.title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5 italic leading-snug">
                "{session.hook}"
              </p>
              <div className="flex items-center gap-1.5 mt-3 text-[11px] text-muted-foreground/70">
                <Clock className="w-3 h-3" />
                <span>~{session.estMinutes} min</span>
              </div>
            </div>

            {/* Agenda */}
            <div className="p-5 space-y-3">
              <div className="text-[10px] font-display tracking-[0.18em] uppercase text-muted-foreground/70">
                Today's agenda
              </div>

              <AgendaRow
                icon={<BookOpen className="w-3.5 h-3.5 text-primary/80" />}
                label="Teaching"
                detail="A short, direct concept — no fluff."
              />

              {session.microPractice && (
                <AgendaRow
                  icon={<Wind className="w-3.5 h-3.5 text-primary/80" />}
                  label={`Practice · ${session.microPractice.label}`}
                  detail={`${session.microPractice.durationSec}s — ${session.microPractice.instruction}`}
                />
              )}

              <AgendaRow
                icon={<Feather className="w-3.5 h-3.5 text-primary/80" />}
                label="Reflection"
                detail={session.reflectionPrompt}
              />
            </div>

            {/* Actions */}
            <div className="p-5 pt-0 space-y-2">
              <button
                onClick={onStartTalk}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground font-display font-semibold text-sm hover:brightness-110 transition active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4" />
                Begin · Talk it through
              </button>
              <button
                onClick={onStartRead}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-muted/30 text-foreground/80 font-display font-medium text-xs hover:bg-muted/50 transition active:scale-[0.98]"
              >
                <ScrollText className="w-3.5 h-3.5" />
                Read instead
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AgendaRow({ icon, label, detail }: { icon: React.ReactNode; label: string; detail: string }) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/15 border border-border/30">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-display font-semibold text-foreground">{label}</div>
        <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{detail}</div>
      </div>
    </div>
  );
}
