/**
 * USER JOURNEY — Single source of truth for "where is this user?"
 *
 * Replaces:
 *   - usePreJourney.ts progress calculations
 *   - loadTodaysSessions() from orb
 *   - adaptiveJourneyEngine.ts UserProfile
 *   - sessionEngine.ts UserProfile
 */

import { supabase } from '@/lib/supabase';
import type { UserJourney, SessionPlan, GateId } from './types';
import { getCurrentGate } from '@/lib/consciousness/dailyGates';

export async function getUserJourney(userId: string): Promise<UserJourney> {
  if (!userId) {
    return getDefaultJourney();
  }

  try {
    // Parallel reads for performance
    const [
      profileResult,
      sessionsResult,
      todaySessionsResult,
      streakResult,
      loopsResult,
      constellationResult,
    ] = await Promise.all([
      // Consciousness profile
      supabase
        .from('user_consciousness_profile')
        .select('journey_day, streak_current, streak_longest, last_session_at, v_level_current, dimension_bands')
        .eq('user_id', userId)
        .maybeSingle(),

      // All sessions (for lifetime count)
      supabase
        .from('sessions')
        .select('id, status, started_at, completed_at, type')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('started_at', { ascending: false }),

      // Today's sessions
      supabase
        .from('sessions')
        .select('id, status, started_at, completed_at, type, summary')
        .eq('user_id', userId)
        .gte('started_at', getTodayStart())
        .order('started_at', { ascending: true }),

      // Streak data
      supabase
        .from('user_session_streaks')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(),

      // Active loops
      supabase
        .from('user_loops')
        .select('loop_id')
        .eq('user_id', userId)
        .in('status', ['active', 'aware'])
        .limit(50),

      // Practice constellation (weakest dimension)
      supabase
        .from('user_practice_constellation')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(),
    ]);

    const profile = profileResult.data;
    const sessions = sessionsResult.data || [];
    const todaySessions = todaySessionsResult.data || [];
    const streak = streakResult.data;
    const signals = loopsResult.data || [];
    const constellation = constellationResult.data;

    // Calculate lifetime sessions
    const totalLifetimeSessions = sessions.length;

    // Calculate streak
    const currentStreak = streak?.current_streak ?? profile?.streak_current ?? 0;
    const longestStreak = streak?.longest_streak ?? profile?.streak_longest ?? 0;

    // Journey day
    const journeyDay = profile?.journey_day ?? 1;

    // Active loops (deduplicated)
    const activeLoops = Array.from(new Set(
      signals.map(s => s.loop_id).filter(Boolean)
    ));

    // Weakest dimension
    const weakestDimension = findWeakestDimension(constellation);

    // Current gate
    const currentGate = getCurrentGate(new Date().getHours());

    // Last session date
    const lastSessionDate = profile?.last_session_at || streak?.last_session_date || null;

    // Calculate gap
    const gapDays = lastSessionDate ? calculateDaysSince(lastSessionDate) : 999;
    const isReturningAfterGap = gapDays >= 3;

    // Sessions until next milestone
    const sessionsUntilNextMilestone = calculateNextMilestone(totalLifetimeSessions);

    // Grace days remaining
    const graceDaysRemaining = streak?.grace_days_remaining ?? 3;

    // Is paused
    const isPaused = streak?.paused ?? false;

    // Energy detection (simplified — would integrate with actual energy tracking)
    const energy = detectEnergy(todaySessions, sessions);

    return {
      totalLifetimeSessions,
      currentStreak,
      longestStreak,
      journeyDay,
      todaySessions: todaySessions.map(s => ({
        ...s,
        system: detectSystem(s.type),
        userId,
        status: s.status as any,
        title: extractTitle(s.summary),
        gate: detectGate(s.started_at),
        steps: [],
        totalEstMinutes: 0,
        context: {
          energy: 'medium',
          daysSinceLastSession: 0,
          journeyDay,
          activeLoops: [],
        },
        metadata: {},
        createdAt: s.started_at,
      })) as SessionPlan[],
      currentGate,
      sessionsUntilNextMilestone,
      activeLoops,
      weakestDimension,
      energy,
      lastSessionDate,
      isReturningAfterGap,
      gapDays,
      graceDaysRemaining,
      isPaused,
    };
  } catch (error) {
    console.error('[journey] Failed to load user journey:', error);
    return getDefaultJourney();
  }
}

// ─── Helpers ───

function getDefaultJourney(): UserJourney {
  return {
    totalLifetimeSessions: 0,
    currentStreak: 0,
    longestStreak: 0,
    journeyDay: 1,
    todaySessions: [],
    currentGate: getCurrentGate(new Date().getHours()),
    sessionsUntilNextMilestone: 1,
    activeLoops: [],
    weakestDimension: 'awareness',
    energy: 'medium',
    isReturningAfterGap: false,
    gapDays: 999,
    graceDaysRemaining: 3,
    isPaused: false,
  };
}

function getTodayStart(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function getDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function calculateDaysSince(dateStr: string): number {
  const then = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - then.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function calculateNextMilestone(current: number): number {
  const milestones = [1, 7, 30, 100, 365, 500, 1000];
  for (const m of milestones) {
    if (current < m) return m - current;
  }
  return 1000 - current;
}

function findWeakestDimension(constellation: Record<string, unknown> | null): string {
  if (!constellation) return 'awareness';

  const dimensions = [
    { key: 'observe_level', name: 'thought' },
    { key: 'witness_level', name: 'awareness' },
    { key: 'breath_level', name: 'breath' },
    { key: 'body_level', name: 'body' },
    { key: 'emotion_level', name: 'emotion' },
    { key: 'inquiry_level', name: 'thought' },
    { key: 'lovingkindness_level', name: 'emotion' },
    { key: 'openawareness_level', name: 'awareness' },
  ];

  let weakest = 'awareness';
  let lowestLevel = Infinity;

  for (const dim of dimensions) {
    const level = Number(constellation[dim.key] ?? 0);
    if (level < lowestLevel) {
      lowestLevel = level;
      weakest = dim.name;
    }
  }

  return weakest;
}

function detectEnergy(todaySessions: unknown[], recentSessions: unknown[]): 'low' | 'medium' | 'high' {
  // Simple heuristic: if user completed 3+ sessions today, energy is high
  if (todaySessions.length >= 3) return 'high';
  if (todaySessions.length === 0) {
    // Check recent pattern
    const recent = recentSessions.slice(0, 7);
    if (recent.length >= 5) return 'medium';
    if (recent.length === 0) return 'low';
  }
  return 'medium';
}

function detectSystem(type: string | null): 'pre-journey' | 'orb' | 'sankalpa' | 'practice' | 'witness' | 'temple' | 'guide-chat' {
  switch (type) {
    case 'guide': return 'guide-chat';
    case 'generative': return 'sankalpa';
    case 'practice': return 'practice';
    case 'witness': return 'witness';
    case 'temple': return 'temple';
    default: return 'orb';
  }
}

function extractTitle(summary: string | null): string {
  if (!summary) return 'Session';
  // Extract first sentence or first 50 chars
  const firstSentence = summary.split('.')[0];
  return firstSentence.slice(0, 50) || 'Session';
}

function detectGate(startedAt: string | null): GateId {
  if (!startedAt) return getCurrentGate(new Date().getHours());
  const hour = new Date(startedAt).getHours();
  return getCurrentGate(hour);
}
