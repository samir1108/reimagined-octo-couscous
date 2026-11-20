import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePreJourney } from '@/hooks/usePreJourney';
import SessionIntroCard from '@/components/sutra/SessionIntroCard';
import type { NextSessionPlan, SessionBlock } from '@/lib/sutra/orchestrator';
import OversoulOrbEmbed from '@/components/orb/OversoulOrbEmbed';
import { getCurrentGate } from '@/lib/consciousness/dailyGates';

/**
 * Foundation surface on Home — shows today's foundation theme + cosmic orb.
 * Tapping the orb opens the SAME SessionIntroCard (Step 1 / Step 2 …) used in
 * normal-session mode, but populated with this Foundation session's
 * Teaching → Practice → Reflection content.
 */
export default function FoundationCourseBanner(_props: { onOrbTap?: () => void } = {}) {
  const navigate = useNavigate();
  const { state, isLoading, enroll } = usePreJourney();
  const [showIntro, setShowIntro] = useState(false);

  // Auto-enroll on first view so journey starts by default
  useEffect(() => {
    if (!state) return;
    if (state.graduated || state.skipped || state.paused || state.enrolled) return;
    if (enroll.isPending) return;
    enroll.mutate('balanced');
  }, [state, enroll]);

  const session = state?.currentSession;
  const gate = getCurrentGate(new Date().getHours());

  // Build a foundation-flavored NextSessionPlan to feed SessionIntroCard.
  const foundationPlan = useMemo<NextSessionPlan | null>(() => {
    if (!session) return null;

    const params = new URLSearchParams({
      source: 'foundation',
      sessionId: session.id,
      sessionNumber: String(session.number),
      title: session.title,
      hook: session.hook,
      module: String(session.module),
      autostart: '1',
    });
    if (session.microPractice?.label) params.set('practice', session.microPractice.label);
    if (session.reflectionPrompt) params.set('reflection', session.reflectionPrompt);
    const guideRoute = `/app/guide?${params.toString()}`;

    const teachingDur = Math.max(60, (session.estMinutes - 1) * 60);
    const practiceDur = session.microPractice?.durationSec ?? 60;
    const reflectionDur = 60;

    const blocks: SessionBlock[] = [
      {
        modeId: 'foundation-teaching',
        label: 'Teaching',
        practice: 'jnana' as any,
        surface: 'guide' as any,
        durationSec: teachingDur,
        route: guideRoute,
        intro: 'A short, direct concept — no fluff.',
      },
    ];

    if (session.microPractice) {
      blocks.push({
        modeId: 'foundation-practice',
        label: `Practice · ${session.microPractice.label}`,
        practice: 'observation' as any,
        surface: 'practice' as any,
        durationSec: practiceDur,
        route: guideRoute,
        intro: session.microPractice.instruction,
      });
    }

    blocks.push({
      modeId: 'foundation-reflection',
      label: 'Reflection',
      practice: 'self_inquiry' as any,
      surface: 'journal' as any,
      durationSec: reflectionDur,
      route: guideRoute,
      intro: session.reflectionPrompt,
    });

    const totalDurationSec = blocks.reduce((s, b) => s + b.durationSec, 0);

    return {
      sessionTheme: {
        title: session.title,
        micro: `"${session.hook}"`,
      },
      blocks,
      totalDurationSec,
      observationTail: session.reflectionPrompt,
      why: `Foundation · Session ${session.number} of ${state?.totalSessions ?? 60} — ${session.moduleName}. This is the next step in your 60-session orientation map.`,
      alternatives: [],
      axes: {
        constellation: null,
        arc: { title: session.moduleName, day: session.number },
        state: {
          energy: 'medium',
          mood: 'curious',
          timeAvailableSec: totalDurationSec,
          activeLoops: [],
          stressedDomains: [],
        },
        domains: [],
      },
    };
  }, [session, state?.totalSessions]);

  if (isLoading || !state) return null;
  if (state.graduated || state.skipped || state.paused) return null;

  const handleOrbTap = () => {
    if (state.pendingMirror) {
      navigate('/app/before');
      return;
    }
    setShowIntro(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.6 }}
      className="w-full max-w-md md:max-w-2xl mb-6 space-y-5 md:space-y-7"
    >
      {/* Theme of today */}
      {session && (
        <div className="text-center pt-1">
          <div className="text-[10px] md:text-xs font-display tracking-[0.3em] md:tracking-[0.4em] uppercase text-muted-foreground/60 mb-2 md:mb-3">
            Foundation · Session {session.number} of {state.totalSessions}
          </div>
          <h2 className="text-xl md:text-4xl font-display font-semibold text-foreground leading-tight md:leading-[1.15]">
            {session.title}
          </h2>
          <p className="text-[11px] md:text-base text-muted-foreground italic mt-1.5 md:mt-3 px-4 md:px-0 leading-snug md:leading-relaxed md:max-w-xl md:mx-auto">
            "{session.hook}"
          </p>
        </div>
      )}

      {/* Mirror nudge */}
      {state.pendingMirror && (
        <button
          onClick={() => navigate('/app/before')}
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
        </button>
      )}

      <div className="mx-auto w-full max-w-[220px]">
        <OversoulOrbEmbed
          currentGate={gate}
          onActivate={handleOrbTap}
          onHold={handleOrbTap}
          onDouble={handleOrbTap}
          onTriple={handleOrbTap}
        />
      </div>

      {/* Reuse the normal SessionIntroCard, but with foundation content
          and NO arrival ritual gate (foundation = zero friction). */}
      <SessionIntroCard
        open={showIntro}
        plan={foundationPlan}
        skipArrival
        hideExpect
        onClose={() => setShowIntro(false)}
      />
    </motion.div>
  );
}
