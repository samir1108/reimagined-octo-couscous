# 0. Shared substrate: `getUserContext()` (read this first)

**File:** `supabase/functions/_shared/user-context.ts` (553 lines)

This is the single source of truth almost every edge function in this report calls into.
It is a big read-aggregator: given `(supabase client, userId, runtime overrides)` it produces one
`UserContext` object combining identity, consciousness profile, practice levels, active loops,
today's dimension rollup, 7-30 day behavior stats, "right now" signals (gate/energy/time budget),
today's theme, open engine_signals, active program/foundation state, spiritual DNA, and recent
loop attributions. It is deliberately **tolerant of missing tables/rows** — every sub-query is
best-effort so it never throws, which is why every consumer (composer, guide, adaptive engine)
can call it blindly.

Key exported types (`user-context.ts:16-164`):

```ts
export type Gate = "morning" | "midday" | "evening" | "night";
export type Energy = "low" | "medium" | "high";

export interface UserContextRuntime {
  timeBudgetMin?: number;
  energy?: Energy;
  gate?: Gate;
  hour?: number;
  mood?: string;
  extra?: Record<string, unknown>;
}

export interface UserContext {
  userId: string;
  identity: { displayName, onboardingPath, lifestyle, occupation, country,
              aiMode: "fast" | "premium", preferredTheme, wakeTime, sleepTime };
  spiritual: { overallBand, vLevelCurrent, vLevelBaseline, vLevelPeak,
               dimensionBands: Record<string, number>, chittaVritti, journeyDay,
               journeyPhase, yogaPathAffinity, witnessStability, witnessDepth,
               witnessGap, integrationScore };
  practiceLevels: Record<string, { level, sessionsAtLevel, totalSessions,
               emotionalHealing, loopDissolution }>;
  activeLoops: Array<{ loopId, severity, detectedAt }>;
  recentLoopIds: string[];              // last 8 distinct, most-recent-first
  dimensionsToday: { thought, emotion, body, awareness } | null;
  behavior: { gapDays, lastSessionAt, lastSessionIntent, sessionsLast7d,
               avgQualityLast7d, avgSessionMinutesLast7d, consistencyScore,
               recentIngredientIds, morningCompletedToday, middayCompletedToday,
               eveningCompletedToday, lastJournalSnippet };
  now: { hour, gate, energy, timeBudgetMin, mood, moodScoreToday, energyScoreToday };
  theme: { id, title, description, openingPrompt };
  engineSignals: Array<{ id, type, practiceId, loopId, urgency, levelHint, masterId, source }>;
  foundation: { currentSession, totalSessions, completed };
  activeProgram: { id, title, masterId, templateSlug, days, currentDay, sessions } | null;
  spiritualDna: { currentBand, brainDominance, archetype, raw };
  dimensionScores: Record<string, number>;
  weakDimensions: string[];
  recentGuideTopics: string[];
  loopAttributions: Array<{ loopId, confidence }>;
  recentSignalsRaw: Array<{ sourceType, loopId, chittaVritti, bodyState, mindState, createdAt }>;
}
```

`getUserContext(supabase, userId, runtimeOverrides)` (`user-context.ts:178+`) computes `gate` from
hour-of-day via `gateForHour()` (night <5, morning <12, midday <17, evening <21, else night) when
not explicitly passed, then fans out parallel queries. A companion helper
`practiceLevelsMap(ctx)` (`user-context.ts:549`) flattens `practiceLevels` to `{practiceId: level}`
for the composer's scoring.

Both `compose-session` and `compose-session-v3` call `getUserContext()` as their first step, so
everything downstream (archetype choice, council voices, chakra/loop signals) is derived from
this one snapshot.

---
