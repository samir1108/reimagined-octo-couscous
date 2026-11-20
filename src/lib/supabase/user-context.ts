/**
 * CLIENT-SIDE USER CONTEXT — Calls getUserContext Edge Function
 * ============================================================
 * Thin wrapper around supabase/functions/get-user-context
 * Adds memory block injection for 100% engine coverage.
 */

import { supabase } from '@/lib/supabase';
import { buildLongTermMemoryBlock } from './long-term-memory';

export type Gate = "morning" | "midday" | "evening" | "night";
export type Energy = "low" | "medium" | "high";

export interface UserContextRuntime {
  timeBudgetMin?: number;
  energy?: Energy;
  gate?: Gate;
  hour?: number;
  mood?: string;
  /** What the user asked for, when known — used as memory-recall query text. */
  intent?: string;
  extra?: Record<string, unknown>;
}

export interface UserContext {
  userId: string;
  identity: {
    displayName: string | null;
    onboardingPath: string | null;
    lifestyle: Record<string, unknown>;
    occupation: string | null;
    country: string | null;
    aiMode: "fast" | "premium";
    preferredTheme: string;
    wakeTime: string | null;
    sleepTime: string | null;
  };
  spiritual: {
    overallBand: number;
    vLevelCurrent: number;
    vLevelBaseline: number;
    vLevelPeak: number;
    dimensionBands: Record<string, number>;
    chittaVritti: string | null;
    journeyDay: number;
    journeyPhase: string;
    yogaPathAffinity: Record<string, number>;
    witnessStability: number;
    witnessDepth: number;
    witnessGap: number;
    integrationScore: number;
  };
  practiceLevels: Record<string, {
    level: number;
    sessionsAtLevel: number;
    totalSessions: number;
    emotionalHealing: number;
    loopDissolution: number;
  }>;
  activeLoops: Array<{ loopId: string; severity: number; detectedAt: string }>;
  recentLoopIds: string[];
  dimensionsToday: {
    thought: number;
    emotion: number;
    body: number;
    awareness: number;
  } | null;
  behavior: {
    gapDays: number;
    lastSessionAt: string | null;
    lastSessionIntent: string | null;
    sessionsLast7d: number;
    avgQualityLast7d: number;
    avgSessionMinutesLast7d: number;
    consistencyScore: number;
    recentIngredientIds: string[];
    /** Learned per-ingredient performance, used only by the composer. */
    ingredientPerformance?: Record<string, {
      attempts: number;
      completions: number;
      completionRate: number;
      avgQuality: number;
      avgSeconds: number;
    }>;
    morningCompletedToday: boolean;
    middayCompletedToday: boolean;
    eveningCompletedToday: boolean;
    lastJournalSnippet: string | null;
  };
  now: {
    hour: number;
    gate: Gate;
    energy: Energy;
    timeBudgetMin: number;
    mood: string | null;
    moodScoreToday: number | null;
    energyScoreToday: number | null;
  };
  theme: {
    id: string | null;
    title: string | null;
    description: string | null;
    openingPrompt: string | null;
  };
  engineSignals: Array<{
    id: string | null;
    type: string;
    practiceId: string | null;
    loopId: string | null;
    urgency: number;
    levelHint: number | null;
    masterId: string | null;
    source: string | null;
  }>;
  foundation: {
    currentSession: number;
    totalSessions: number;
    completed: boolean;
  };
  activeProgram: {
    id: string;
    title: string | null;
    masterId: string | null;
    templateSlug: string | null;
    days: number;
    currentDay: number;
    sessions: unknown[];
  } | null;
  spiritualDna: {
    currentBand: number;
    brainDominance: string | null;
    archetype: string | null;
    raw: Record<string, unknown>;
  };
  dimensionScores: Record<string, number>;
  weakDimensions: string[];
  recentGuideTopics: string[];
  loopAttributions: Array<{ loopId: string; confidence: number }>;
  recentSignalsRaw: Array<{
    sourceType: string | null;
    loopId: string | null;
    chittaVritti: string | null;
    bodyState: string | null;
    mindState: string | null;
    createdAt: string | null;
  }>;
  // NEW: Injected memory block for felt continuity
  memoryBlock?: string;
}

/**
 * Get complete user context with optional memory injection.
 * Calls the get-user-context edge function (server-side aggregation).
 */
export async function getUserContext(
  userId: string,
  runtime: UserContextRuntime = {},
  options: { includeMemory?: boolean } = {}
): Promise<UserContext> {
  const { data, error } = await supabase.functions.invoke('get-user-context', {
    body: {
      userId,
      ...runtime,
      includeMemory: options.includeMemory ?? true,
    },
  });

  if (error) {
    console.error('[getUserContext] Edge function error:', error);
    throw new Error(error.message || 'Failed to get user context');
  }

  if (!data?.ok) {
    throw new Error(data?.error || 'User context request failed');
  }

  const ctx = data.context as UserContext;

  // Inject memory block if requested
  if (options.includeMemory !== false) {
    try {
      ctx.memoryBlock = await buildLongTermMemoryBlock({
        userId,
        queryText: runtime.intent || `gate=${runtime.gate ?? '?'} budget=${runtime.timeBudgetMin ?? 8}m`,
        activeLoops: ctx.recentLoopIds,
      });
    } catch (e) {
      console.warn('[getUserContext] Memory block injection failed:', e);
      ctx.memoryBlock = '';
    }
  }

  return ctx;
}

/**
 * Flatten practiceLevels into {practice: level} for composer.
 */
export function practiceLevelsMap(ctx: UserContext): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(ctx.practiceLevels)) out[k] = v.level;
  return out;
}

/**
 * Compute V-Level via server RPC (authoritative).
 * Falls back to local calculation if RPC fails.
 */
export async function computeVLevelRpc(
  dimensionScores: Record<string, number>,
  profile: {
    dimension_bands?: Record<string, number>;
    witness_gap?: number;
    witness_stability?: number;
    witness_depth?: number;
    loop_severity?: Record<string, 'none' | 'active' | 'acute'>;
    integration_score?: number;
    v_level_baseline?: number;
    v_level_peak?: number;
    journey_day?: number;
    total_sessions?: number;
    regression?: { dark_night_count?: number; baseline_highest?: number };
    last_session_at?: string;
  }
): Promise<{
  value: number;
  band: number;
  microLevel: 'entering' | 'deepening' | 'mastery';
  dimensionScores: Record<string, number>;
  calculatedAt: string;
  witnessQuality: number;
  loopPenalty: number;
  integrationScore: number;
} | null> {
  try {
    const { data, error } = await supabase.rpc('compute_vlevel', {
      p_dimension_scores: dimensionScores,
      p_profile: profile,
    });

    if (error) {
      console.warn('[computeVLevelRpc] RPC error, falling back to local:', error);
      return null;
    }

    return data as any;
  } catch (e) {
    console.warn('[computeVLevelRpc] RPC threw, falling back to local:', e);
    return null;
  }
}

/**
 * Compute V-Level locally (fallback when RPC unavailable).
 * Mirrors supabase/functions/_shared/vLevel.ts exactly.
 */
import { calculateVLevel, type VLevel } from '@/lib/shared/vLevel';

export function computeVLevelLocal(
  dimensionScores: Record<string, number>,
  profile: Parameters<typeof calculateVLevel>[1]
): VLevel {
  return calculateVLevel(dimensionScores, profile);
}