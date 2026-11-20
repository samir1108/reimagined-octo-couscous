import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePreJourney } from '@/hooks/usePreJourney';
import { PreJourneySessionPlayer } from '@/components/pre-journey/PreJourneySessionPlayer';
import { PreJourneyConversation } from '@/components/pre-journey/PreJourneyConversation';
import { MirrorCheckpointPlayer } from '@/components/pre-journey/MirrorCheckpointPlayer';
import { CinematicReveal } from '@/components/pre-journey/CinematicReveal';
import { FoundationWelcomeCards } from '@/components/pre-journey/FoundationWelcomeCards';
import SessionAgendaCard from '@/components/pre-journey/SessionAgendaCard';
import LifetimeSessionsStrip from '@/components/pre-journey/LifetimeSessionsStrip';
import { useNavigate } from 'react-router-dom';
import OversoulOrbEmbed from '@/components/orb/OversoulOrbEmbed';
import { getCurrentGate } from '@/lib/consciousness/dailyGates';

type Mode = 'talk' | 'read';

export default function PreJourney() {
  const navigate = useNavigate();
  const { state, isLoading, enroll } = usePreJourney();
  const [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState<Mode>('talk');
  const [showAgenda, setShowAgenda] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [showMirror, setShowMirror] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [autoEnrolled, setAutoEnrolled] = useState(false);

  // Auto-enroll on Balanced for any authenticated user who hasn't enrolled
  useEffect(() => {
    if (isLoading || !state || state.enrolled || autoEnrolled || enroll.isPending) return;
    setAutoEnrolled(true);
    enroll.mutate({ pace: 'balanced', dailyMinutes: 30, notifyTime: '08:00' });
  }, [isLoading, state, autoEnrolled, enroll]);

  // First-time welcome cards
  useEffect(() => {
    if (!state?.enrolled) return;
    try {
      const seen = localStorage.getItem('pj_welcome_seen');
      if (!seen) setShowWelcome(true);
    } catch { /* ignore */ }
  }, [state?.enrolled]);

  const dismissWelcome = () => {
    try { localStorage.setItem('pj_welcome_seen', '1'); } catch { /* ignore */ }
    setShowWelcome(false);
  };

  if (isLoading || !state || (!state.enrolled && (enroll.isPending || autoEnrolled))) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Reveal — all 60 sessions + 100 mirrors done
  if (state.revealReady && !state.revealSeen) {
    return <CinematicReveal onClose={() => navigate('/app')} />;
  }

  // Graduated
  if (state.graduated && state.revealSeen) {
    return (
      <div className="max-w-xl mx-auto px-5 py-16 text-center">
        <div className="text-6xl mb-6">🪔</div>
        <h1 className="text-3xl font-semibold mb-3">Foundation complete</h1>
        <p className="text-muted-foreground mb-8">Your lifetime companion is awake.</p>
      </div>
    );
  }

  const session = state.currentSession;
  const gate = getCurrentGate(new Date().getHours());
  const handleOrbTap = () => {
    if (state.pendingMirror) {
      setShowMirror(true);
      return;
    }
    setShowAgenda(true);
  };

  const startSession = (m: Mode) => {
    setMode(m);
    setShowAgenda(false);
    setPlaying(true);
  };

  const handleSessionComplete = () => {
    setPlaying(false);
    setTimeout(() => {
      if (state.pendingMirror || (session && session.number % 2 === 0)) {
        setShowMirror(true);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen relative">
      {showWelcome && <FoundationWelcomeCards onDone={dismissWelcome} />}

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-5 pb-24 space-y-5">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/app')}
            className="w-8 h-8 rounded-xl bg-muted/30 flex items-center justify-center hover:bg-muted/50 transition"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="text-center">
            <div className="text-[10px] text-primary font-mono tracking-wider">FOUNDATION</div>
            <div className="text-[11px] text-muted-foreground">
              Session {session?.number ?? 1} of {state.totalSessions} · {state.mirrorsCompleted}/{state.totalMirrors} mirrors
            </div>
          </div>
          <div className="w-8" />
        </div>

        {/* Lifetime sessions strip — pinned, always visible */}
        <LifetimeSessionsStrip
          completedIds={state.completedIds}
          currentSessionId={state.currentSessionId}
          pendingMirrorAfter={state.pendingMirror?.afterSessionNumber ?? null}
        />

        {/* Theme of today */}
        {session && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center pt-2"
          >
            <div className="text-[10px] font-display tracking-[0.3em] uppercase text-muted-foreground/60 mb-1.5">
              Today's theme
            </div>
            <h1 className="text-2xl font-display font-semibold text-foreground leading-tight">
              {session.title}
            </h1>
            <p className="text-xs text-muted-foreground italic mt-1.5 px-4 leading-snug">
              "{session.hook}"
            </p>
          </motion.div>
        )}

        {/* Mirror nudge */}
        {state.pendingMirror && (
          <motion.button
            onClick={() => setShowMirror(true)}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full glass-card rounded-2xl p-3 flex items-center gap-3 text-left ring-1 ring-amber-400/30"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-400/15 flex items-center justify-center text-lg">
              ◆
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-amber-400/80">Mirror waiting</div>
              <div className="text-sm font-display font-semibold text-foreground truncate">
                {state.pendingMirror.title}
              </div>
            </div>
          </motion.button>
        )}

        <div className="mx-auto w-full max-w-[220px] py-2">
          <OversoulOrbEmbed
            currentGate={gate}
            onActivate={handleOrbTap}
            onHold={handleOrbTap}
            onDouble={handleOrbTap}
            onTriple={handleOrbTap}
          />
        </div>
      </div>

      {/* Agenda overlay */}
      {session && (
        <SessionAgendaCard
          open={showAgenda}
          session={session}
          sessionIndex={session.number}
          totalSessions={state.totalSessions}
          onClose={() => setShowAgenda(false)}
          onStartTalk={() => startSession('talk')}
          onStartRead={() => startSession('read')}
        />
      )}

      {/* Players (existing) */}
      {playing && session && mode === 'talk' && (
        <PreJourneyConversation
          session={session}
          onClose={() => setPlaying(false)}
          onSwitchToRead={() => setMode('read')}
          onComplete={handleSessionComplete}
        />
      )}
      {playing && session && mode === 'read' && (
        <PreJourneySessionPlayer
          session={session}
          onClose={() => setPlaying(false)}
          onSwitchToTalk={() => setMode('talk')}
          onComplete={handleSessionComplete}
        />
      )}

      {/* Mirror */}
      {showMirror && state.pendingMirror && (
        <MirrorCheckpointPlayer
          checkpoint={state.pendingMirror}
          afterSessionId={state.currentSessionId}
          onClose={() => setShowMirror(false)}
          onComplete={() => {
            setShowMirror(false);
            if (state.revealReady) setShowReveal(true);
          }}
        />
      )}

      {showReveal && <CinematicReveal onClose={() => setShowReveal(false)} />}
    </div>
  );
}
