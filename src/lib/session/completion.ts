/**
 * SESSION COMPLETION — Unified completion handler.
 *
 * Replaces:
 *   - completeGenerativeSession() in session-shell/api.ts
 *   - completeSession() in usePreJourney.ts
 *   - Various scattered completion logic
 *
 * Handles:
 *   - Writing to sessions table
 *   - Updating session state
 *   - Calculating karma
 *   - Updating streaks
 *   - Firing events
 *   - Triggering moments
 *   - Updating session thread
 */

import { supabase } from '@/lib/supabase';
import type { SessionPlan, SessionCompletion, UserJourney } from './types';
import type { TriggeredMoment } from './moments';
import { fireEvent } from './events';
import { evaluateMoments, MomentContext } from './moments';
import { updateSessionThread } from './thread';
import { getUserJourney } from './journey';

export interface CompleteSessionInput {
  plan: SessionPlan;
  completedSteps: Array<{ kind: string; durationSeconds?: number }>;
  skippedSteps: string[];
  totalDurationMs: number;
  userId: string;
}

export interface CompleteSessionResult {
  ok: boolean;
  completion: SessionCompletion;
  moments: TriggeredMoment[];
  session: SessionPlan;
}

/**
 * Complete a session and handle all downstream effects.
 */
export async function completeSession(input: CompleteSessionInput): Promise<CompleteSessionResult> {
  const { plan, completedSteps, skippedSteps, totalDurationMs, userId } = input;

  try {
    // 1. Update session status in sessions table
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        summary: buildSummary(plan, completedSteps),
      })
      .eq('id', plan.id)
      .select()
      .single();

    if (sessionError || !session) {
      // If session doesn't exist, create it
      const { data: newSession, error: createError } = await supabase
        .from('sessions')
        .insert({
          id: plan.id,
          user_id: userId,
          type: plan.system,
          status: 'completed',
          started_at: plan.startedAt || plan.createdAt,
          completed_at: new Date().toISOString(),
          summary: buildSummary(plan, completedSteps),
        })
        .select()
        .single();

      if (createError || !newSession) {
        throw new Error(`Failed to create session: ${createError?.message}`);
      }
    }

    // 2. Calculate completion metrics
    const completedStepCount = completedSteps.length;
    const skippedStepCount = skippedSteps.length;
    const karmaEarned = calculateKarma(completedStepCount, completedSteps);

    // 3. Update session state
    await supabase
      .from('session_states')
      .update({
        cursor_step_index: plan.steps.length,
        last_activity_at: new Date().toISOString(),
      })
      .eq('session_id', plan.id);

    // 4. Update daily session log
    const today = new Date().toISOString().split('T')[0];
    const { data: dayLog } = await supabase
      .from('daily_session_logs')
      .select('sessions')
      .eq('user_id', userId)
      .eq('log_date', today)
      .maybeSingle();
    const daySessions = ((dayLog?.sessions as Record<string, unknown>) ?? {});
    daySessions[String(Date.now())] = {
      id: plan.id,
      title: (plan as any).intent ?? plan.title,
      completedAt: new Date().toISOString(),
    };
    await supabase
      .from('daily_session_logs')
      .upsert({
        user_id: userId,
        log_date: today,
        sessions: daySessions,
      } as any);


    // 5. Update streaks
    await updateStreak(userId);

    // 6. Fire event
    await fireEvent(userId, 'session_completed', {
      sessionId: plan.id,
      system: plan.system,
      completedSteps: completedSteps.map(s => s.kind),
      skippedSteps,
      totalDurationMs,
      karmaEarned,
    });

    // 7. Load user journey
    const journey = await getUserJourney(userId);

    // 8. Update session thread
    await updateSessionThread(
      {
        userId,
        sessionTitle: plan.title,
        sessionArchetype: plan.archetype || undefined,
        sessionLoops: plan.context.activeLoops,
        sessionDimension: plan.context.weakestDimension,
        sessionMood: plan.metadata.toneWords?.[0],
      },
      {
        sessionId: plan.id,
        completedStepCount,
        skippedStepCount,
        totalDurationMs,
        loopsTouched: plan.context.activeLoops,
        karmaEarned,
      }
    );

    // 9. Evaluate moments
    const moments = evaluateMoments({
      journey,
      completion: {
        sessionId: plan.id,
        completedStepCount,
        skippedStepCount,
        totalDurationMs,
        loopsTouched: plan.context.activeLoops,
        karmaEarned,
        qualityScore: calculateQualityScore(completedSteps, skippedSteps, totalDurationMs, plan.totalEstMinutes),
      },
      sessionTitle: plan.title,
    });

    // 10. Fire moment events
    for (const moment of moments) {
      await fireEvent(userId, moment.type as any, {
        message: moment.message,
        visual: moment.visual,
        shareable: moment.shareable,
      });
    }

    // 11. Build completion result
    const completion: SessionCompletion = {
      sessionId: plan.id,
      completedStepCount,
      skippedStepCount,
      totalDurationMs,
      loopsTouched: plan.context.activeLoops,
      karmaEarned,
      qualityScore: calculateQualityScore(completedSteps, skippedSteps, totalDurationMs, plan.totalEstMinutes),
    };

    return {
      ok: true,
      completion,
      moments,
      session: plan,
    };
  } catch (error) {
    console.error('[completion] Failed to complete session:', error);
    return {
      ok: false,
      completion: {
        sessionId: plan.id,
        completedStepCount: 0,
        skippedStepCount: 0,
        totalDurationMs: 0,
        loopsTouched: [],
        karmaEarned: 0,
      },
      moments: [],
      session: plan,
    };
  }
}

async function updateStreak(userId: string): Promise<void> {
  try {
    // Get current streak
    const { data: streak } = await supabase
      .from('user_session_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let currentStreak = streak?.current_streak || 0;
    let longestStreak = streak?.longest_streak || 0;
    let totalSessions = streak?.total_sessions_lifetime || 0;

    // Check if this is a new day
    const lastSessionDate = streak?.last_session_date;
    if (lastSessionDate === today) {
      // Already counted today
      return;
    }

    if (lastSessionDate === yesterday) {
      // Consecutive day
      currentStreak += 1;
    } else if (lastSessionDate !== today) {
      // Streak broken (but grace days would be handled elsewhere)
      currentStreak = 1;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    totalSessions += 1;

    await supabase
      .from('user_session_streaks')
      .upsert({
        user_id: userId,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        total_sessions_lifetime: totalSessions,
        last_session_date: today,
        grace_days_remaining: 3,
        paused: false,
      });
  } catch (error) {
    console.error('[completion] Failed to update streak:', error);
  }
}

function calculateKarma(completedCount: number, steps: Array<{ kind: string }>): number {
  const baseKarma = completedCount * 2;
  const hasReflective = steps.some(s => s.kind === 'journal' || s.kind === 'reflection');
  return baseKarma + (hasReflective ? 1 : 0);
}

function calculateQualityScore(
  completedSteps: Array<{ kind: string; durationSeconds?: number }>,
  skippedSteps: string[],
  totalDurationMs: number,
  estimatedMinutes: number
): number {
  const totalSteps = completedSteps.length + skippedSteps.length;
  if (totalSteps === 0) return 0;

  const engagement = completedSteps.length / totalSteps;
  const reflectiveSteps = completedSteps.filter(s => s.kind === 'journal' || s.kind === 'reflection');
  const reflectionSeconds = reflectiveSteps.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
  const reflectionDepth = reflectiveSteps.length > 0
    ? Math.min(1, reflectionSeconds / (reflectiveSteps.length * 60))
    : engagement * 0.5;

  const estTotalSec = estimatedMinutes * 60;
  const completion = estTotalSec > 0
    ? Math.min(1, totalDurationMs / 1000 / Math.max(60, estTotalSec))
    : engagement;

  return Number((engagement * 0.4 + reflectionDepth * 0.3 + completion * 0.3).toFixed(3));
}

function buildSummary(plan: SessionPlan, completedSteps: Array<{ kind: string }>): string {
  const kinds = completedSteps.map(s => s.kind).join(', ');
  return `${plan.system} session: ${completedSteps.length} steps (${kinds}). ${plan.title}`;
}
