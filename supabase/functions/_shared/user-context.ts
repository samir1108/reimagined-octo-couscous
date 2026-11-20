// ============================================================
// USER CONTEXT — "The Brain"
// ------------------------------------------------------------
// One function. Returns the complete snapshot of who the user
// is right now: identity, levels, active loops, dimensions,
// recent behavior, plus the right-now signals (time, gate, energy).
//
// Every engine (composer, guide, suggestions, temple) should
// call this instead of re-querying tables ad-hoc.
//
// Tolerant of missing tables/rows — never throws.
// ============================================================

import type { SupabaseClient } from "./supabase-client.ts";

export type Gate = "morning" | "midday" | "evening" | "night";
export type Energy = "low" | "medium" | "high";

export interface UserContextRuntime {
  /** minutes user is willing to spend right now */
  timeBudgetMin?: number;
  energy?: Energy;
  gate?: Gate;
  hour?: number;
  mood?: string;
  /** anything else from the calling client */
  extra?: Record<string, unknown>;
}

export interface UserContext {
  userId: string;

  // ─── Identity (slow-changing) ───
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

  // ─── Spiritual state (consciousness profile) ───
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

  // ─── Practice levels (per-skill) ───
  practiceLevels: Record<string, {
    level: number;
    sessionsAtLevel: number;
    totalSessions: number;
    emotionalHealing: number;
    loopDissolution: number;
  }>;

  // ─── Active state ───
  activeLoops: Array<{ loopId: string; severity: number; detectedAt: string }>;
  recentLoopIds: string[]; // last 8 distinct, ordered by recency

  // ─── Dimensions (today's rollup) ───
  dimensionsToday: {
    thought: number;
    emotion: number;
    body: number;
    awareness: number;
  } | null;

  // ─── Behavioral (last 7-30 days) ───
  behavior: {
    gapDays: number;
    lastSessionAt: string | null;
    lastSessionIntent: string | null;
    sessionsLast7d: number;
    avgQualityLast7d: number;
    avgSessionMinutesLast7d: number;
    consistencyScore: number; // 0-1
    recentIngredientIds: string[];
    /**
     * Learned per-ingredient performance from the user's own completions.
     * Read from the `session_ingredient_performance` view and passed straight
     * into the composer, which is the only place that scores it.
     */
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

  // ─── Right-now (this request) ───
  now: {
    hour: number;
    gate: Gate;
    energy: Energy;
    timeBudgetMin: number;
    mood: string | null;
    moodScoreToday: number | null;
    energyScoreToday: number | null;
  };

  // ─── Today's theme (if active) ───
  theme: {
    id: string | null;
    title: string | null;
    description: string | null;
    openingPrompt: string | null;
  };

  // ─── Open recommendations from engines ───
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

  // ─── Extended (additive — for Master-of-Masters router & program engines) ───
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
}

function gateForHour(h: number): Gate {
  if (h < 5) return "night";
  if (h < 12) return "morning";
  if (h < 17) return "midday";
  if (h < 21) return "evening";
  return "night";
}

/**
 * Build the complete user context. Service-role client recommended.
 * All sub-queries are best-effort — missing tables/rows produce neutral defaults.
 */
export async function getUserContext(
  client: SupabaseClient,
  userId: string,
  runtime: UserContextRuntime = {},
): Promise<UserContext> {
  const hour = runtime.hour ?? new Date().getHours();
  const gate: Gate = runtime.gate ?? gateForHour(hour);
  const timeBudgetMin = Number(runtime.timeBudgetMin ?? 8);

  const ctx: UserContext = {
    userId,
    identity: {
      displayName: null, onboardingPath: null, lifestyle: {},
      occupation: null, country: null, aiMode: "fast",
      preferredTheme: "sunrise", wakeTime: null, sleepTime: null,
    },
    spiritual: {
      overallBand: 0, vLevelCurrent: 0, vLevelBaseline: 0, vLevelPeak: 0,
      dimensionBands: { thought: 0, emotion: 0, body: 0, awareness: 0 },
      chittaVritti: null, journeyDay: 1, journeyPhase: "assessment",
      yogaPathAffinity: { raja: 0, jnana: 0, karma: 0, bhakti: 0 },
      witnessStability: 0, witnessDepth: 0, witnessGap: 0, integrationScore: 0,
    },
    practiceLevels: {},
    activeLoops: [],
    recentLoopIds: [],
    dimensionsToday: null,
    behavior: {
      gapDays: 0, lastSessionAt: null, lastSessionIntent: null,
      sessionsLast7d: 0, avgQualityLast7d: 0, avgSessionMinutesLast7d: 0,
      consistencyScore: 0, recentIngredientIds: [],
      morningCompletedToday: false, middayCompletedToday: false, eveningCompletedToday: false,
      lastJournalSnippet: null,
    },
    now: {
      hour, gate,
      energy: runtime.energy ?? "medium",
      timeBudgetMin,
      mood: runtime.mood ?? null,
      moodScoreToday: null, energyScoreToday: null,
    },
    theme: { id: null, title: null, description: null, openingPrompt: null },
    engineSignals: [],
    foundation: { currentSession: 0, totalSessions: 76, completed: false },
    activeProgram: null,
    spiritualDna: { currentBand: 0, brainDominance: null, archetype: null, raw: {} },
    dimensionScores: {},
    weakDimensions: [],
    recentGuideTopics: [],
    loopAttributions: [],
    recentSignalsRaw: [],
  };

  // Timeout wrapper for Promise.allSettled
  async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    );
    return Promise.race([promise, timeout]);
  }

  // Fire all reads in parallel with timeout
  const queryPromises = [
    client.from("profiles")
      .select("display_name, onboarding_path, lifestyle, occupation, country, ai_mode, preferred_theme, wake_time, sleep_time")
      .eq("user_id", userId).maybeSingle(),
    client.from("user_consciousness_profile")
      .select("overall_band, v_level_current, v_level_baseline, v_level_peak, dimension_bands, chitta_vritti, journey_day, journey_phase, yoga_path_affinity, witness_stability, witness_depth, witness_gap, integration_score")
      .eq("user_id", userId).maybeSingle(),
    client.from("user_practice_levels")
      .select("practice_type, current_level, sessions_at_level, total_sessions, emotional_healing, loop_dissolution")
      .eq("user_id", userId),
    client.from("active_loops")
      .select("loop_id, severity, detected_at")
      .eq("user_id", userId).eq("is_active", true)
      .order("severity", { ascending: false }).limit(10),
    client.from("consciousness_signals")
      .select("loop_id, source_type, chitta_vritti, body_state, mind_state, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(20),
    client.from("daily_dimension_summary")
      .select("thought_score, emotion_score, body_score, awareness_score")
      .eq("user_id", userId).order("summary_date", { ascending: false }).limit(1).maybeSingle(),
    client.from("daily_user_context")
      .select("morning_completed, midday_completed, evening_completed, mood_score, energy_score")
      .eq("user_id", userId).eq("session_date", new Date().toISOString().slice(0, 10)).maybeSingle(),
    client.from("sessions")
      .select("ended_at, user_chosen_topic")
      .eq("user_id", userId).eq("status", "completed")
      .order("ended_at", { ascending: false }).limit(1).maybeSingle(),
    client.from("daily_sessions")
      .select("quality_score, metadata, created_at")
      .eq("user_id", userId)
      .gte("created_at", new Date(Date.now() - 7 * 86400_000).toISOString()),
    client.from("session_ingredients")
      .select("ingredient_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(30),
    client.from("daily_themes")
      .select("id, title, description, opening_prompt")
      .eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    client.from("engine_signals")
      .select("id, signal_type, practice_id, loop_id, urgency, level_hint, master_id, source")
      .eq("user_id", userId).is("consumed_at", null)
      .order("urgency", { ascending: false }).limit(15),
    client.from("journal_entries")
      .select("content")
      .eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    // ─── Extended reads (additive — for program/router engines) ───
    client.from("foundation_progress")
      .select("current_session, total_sessions, completed")
      .eq("user_id", userId).maybeSingle(),
    client.from("personalized_programs")
      .select("id, title, master_id, template_slug, days, current_day, sessions")
      .eq("user_id", userId).eq("status", "active")
      .order("created_at", { ascending: false }).limit(1).maybeSingle(),
    client.from("spiritual_dna")
      .select("*")
      .eq("user_id", userId).maybeSingle(),
    client.from("dimension_scores")
      .select("dimension_id, dimension, score, updated_at")
      .eq("user_id", userId).order("updated_at", { ascending: false }).limit(12),
    client.from("guide_messages")
      .select("content")
      .eq("user_id", userId).order("created_at", { ascending: false }).limit(8),
    client.from("loop_attributions")
      .select("loop_id, confidence")
      .eq("user_id", userId)
      .gt("expires_at", new Date().toISOString())
      .order("confidence", { ascending: false }).limit(10),
    client.from("session_ingredient_performance")
      .select("ingredient_id, attempts, completions, avg_quality, avg_seconds")
      .eq("user_id", userId)
      .gte("attempts", 2),
  ];

  const TIMEOUT_MS = 2000;
  // Heterogeneous Postgrest builders lose their row types through a plain
  // array literal, so the settled results are typed loosely here; each consumer
  // below narrows with `as any` on the specific row shape it needs.
  const settled = (await Promise.allSettled(
    (queryPromises as PromiseLike<any>[]).map((p, i) =>
      withTimeout(Promise.resolve(p), TIMEOUT_MS, `query_${i}`)
    )
  )) as PromiseSettledResult<any>[];
  const [
    profileRes, consciousnessRes, practiceLevelsRes, activeLoopsRes,
    recentSignalsRes, dimSummaryRes, dailyCtxRes, lastSessionRes,
    recentSessionsRes, recentIngredientsRes, themeRes,
    engineSignalsRes, journalRes,
    foundationRes, activeProgramRes, spiritualDnaRes,
    dimensionScoresRes, guideMessagesRes, loopAttributionsRes,
    ingredientPerfRes,
  ] = settled;

  // Profile
  if (profileRes.status === "fulfilled" && profileRes.value.data) {
    const p = profileRes.value.data as any;
    ctx.identity = {
      displayName: p.display_name ?? null,
      onboardingPath: p.onboarding_path ?? null,
      lifestyle: p.lifestyle ?? {},
      occupation: p.occupation ?? null,
      country: p.country ?? null,
      aiMode: (p.ai_mode === "premium" ? "premium" : "fast"),
      preferredTheme: p.preferred_theme ?? "sunrise",
      wakeTime: p.wake_time ?? null,
      sleepTime: p.sleep_time ?? null,
    };
  }

  // Consciousness
  if (consciousnessRes.status === "fulfilled" && consciousnessRes.value.data) {
    const c = consciousnessRes.value.data as any;
    ctx.spiritual = {
      overallBand: Number(c.overall_band ?? 0),
      vLevelCurrent: Number(c.v_level_current ?? 0),
      vLevelBaseline: Number(c.v_level_baseline ?? 0),
      vLevelPeak: Number(c.v_level_peak ?? 0),
      dimensionBands: c.dimension_bands ?? { thought: 0, emotion: 0, body: 0, awareness: 0 },
      chittaVritti: c.chitta_vritti ?? null,
      journeyDay: Number(c.journey_day ?? 1),
      journeyPhase: c.journey_phase ?? "assessment",
      yogaPathAffinity: c.yoga_path_affinity ?? { raja: 0, jnana: 0, karma: 0, bhakti: 0 },
      witnessStability: Number(c.witness_stability ?? 0),
      witnessDepth: Number(c.witness_depth ?? 0),
      witnessGap: Number(c.witness_gap ?? 0),
      integrationScore: Number(c.integration_score ?? 0),
    };
  }

  // Practice levels
  if (practiceLevelsRes.status === "fulfilled" && Array.isArray(practiceLevelsRes.value.data)) {
    for (const row of practiceLevelsRes.value.data as any[]) {
      ctx.practiceLevels[row.practice_type] = {
        level: Number(row.current_level ?? 1),
        sessionsAtLevel: Number(row.sessions_at_level ?? 0),
        totalSessions: Number(row.total_sessions ?? 0),
        emotionalHealing: Number(row.emotional_healing ?? 0),
        loopDissolution: Number(row.loop_dissolution ?? 0),
      };
    }
  }

  // Active loops
  if (activeLoopsRes.status === "fulfilled" && Array.isArray(activeLoopsRes.value.data)) {
    ctx.activeLoops = (activeLoopsRes.value.data as any[]).map((r) => ({
      loopId: r.loop_id,
      severity: Number(r.severity ?? 0),
      detectedAt: r.detected_at,
    }));
  }

  // Recent loop ids + raw signals
  if (recentSignalsRes.status === "fulfilled" && Array.isArray(recentSignalsRes.value.data)) {
    const seen = new Set<string>();
    const ids: string[] = [];
    const rows = recentSignalsRes.value.data as any[];
    for (const r of rows) {
      if (r.loop_id && !seen.has(r.loop_id)) { seen.add(r.loop_id); ids.push(r.loop_id); }
      if (ids.length >= 8) break;
    }
    ctx.recentLoopIds = ids;
    ctx.recentSignalsRaw = rows.slice(0, 10).map((r) => ({
      sourceType: r.source_type ?? null,
      loopId: r.loop_id ?? null,
      chittaVritti: r.chitta_vritti ?? null,
      bodyState: r.body_state ?? null,
      mindState: r.mind_state ?? null,
      createdAt: r.created_at ?? null,
    }));
  }

  // Today's dimensions
  if (dimSummaryRes.status === "fulfilled" && dimSummaryRes.value.data) {
    const d = dimSummaryRes.value.data as any;
    ctx.dimensionsToday = {
      thought: Number(d.thought_score ?? 0),
      emotion: Number(d.emotion_score ?? 0),
      body: Number(d.body_score ?? 0),
      awareness: Number(d.awareness_score ?? 0),
    };
  }

  // Daily context (gates completed + mood/energy today)
  if (dailyCtxRes.status === "fulfilled" && dailyCtxRes.value.data) {
    const d = dailyCtxRes.value.data as any;
    ctx.behavior.morningCompletedToday = !!d.morning_completed;
    ctx.behavior.middayCompletedToday = !!d.midday_completed;
    ctx.behavior.eveningCompletedToday = !!d.evening_completed;
    ctx.now.moodScoreToday = d.mood_score ?? null;
    ctx.now.energyScoreToday = d.energy_score ?? null;
    // Auto-derive energy from mood/energy_score if runtime didn't supply
    if (!runtime.energy && d.energy_score != null) {
      const e = Number(d.energy_score);
      ctx.now.energy = e <= 3 ? "low" : e >= 7 ? "high" : "medium";
    }
  }

  // Last session + gap
  if (lastSessionRes.status === "fulfilled" && lastSessionRes.value.data) {
    const ls = lastSessionRes.value.data as any;
    ctx.behavior.lastSessionAt = ls.ended_at ?? null;
    ctx.behavior.lastSessionIntent = ls.user_chosen_topic ?? null;
    if (ls.ended_at) {
      ctx.behavior.gapDays = Math.max(0, Math.floor((Date.now() - new Date(ls.ended_at).getTime()) / 86400_000));
    }
  }

  // 7-day behavioral rollup
  if (recentSessionsRes.status === "fulfilled" && Array.isArray(recentSessionsRes.value.data)) {
    const rows = recentSessionsRes.value.data as any[];
    ctx.behavior.sessionsLast7d = rows.length;
    if (rows.length > 0) {
      const q = rows.reduce((a, r) => a + Number(r.quality_score ?? 0), 0) / rows.length;
      ctx.behavior.avgQualityLast7d = Math.round(q * 100) / 100;
      const mins = rows
        .map((r) => Number(r?.metadata?.minutes ?? r?.metadata?.duration_min ?? 0))
        .filter((m) => m > 0);
      if (mins.length) {
        ctx.behavior.avgSessionMinutesLast7d =
          Math.round(mins.reduce((a, b) => a + b, 0) / mins.length);
      }
    }
    // Consistency = sessions / 7, capped at 1
    ctx.behavior.consistencyScore = Math.min(1, rows.length / 7);
  }

  // Recent ingredients (freshness)
  if (recentIngredientsRes.status === "fulfilled" && Array.isArray(recentIngredientsRes.value.data)) {
    ctx.behavior.recentIngredientIds = (recentIngredientsRes.value.data as any[])
      .map((r) => r.ingredient_id).filter(Boolean);
  }

  // Learned ingredient performance — the composer's feedback term.
  if (ingredientPerfRes.status === "fulfilled" && Array.isArray(ingredientPerfRes.value.data)) {
    const perf: NonNullable<typeof ctx.behavior.ingredientPerformance> = {};
    for (const row of ingredientPerfRes.value.data as any[]) {
      const id = String(row?.ingredient_id ?? "");
      const attempts = Number(row?.attempts ?? 0);
      if (!id || attempts <= 0) continue;
      const completions = Number(row?.completions ?? 0);
      const rawQuality = Number(row?.avg_quality ?? 0);
      perf[id] = {
        attempts,
        completions,
        completionRate: Math.max(0, Math.min(1, completions / attempts)),
        // Quality is stored 0..100 by the completion path; the composer wants 0..1.
        avgQuality: Math.max(0, Math.min(1, rawQuality > 1 ? rawQuality / 100 : rawQuality)),
        avgSeconds: Number(row?.avg_seconds ?? 0),
      };
    }
    if (Object.keys(perf).length > 0) ctx.behavior.ingredientPerformance = perf;
  }

  // Theme
  if (themeRes.status === "fulfilled" && themeRes.value.data) {
    const t = themeRes.value.data as any;
    ctx.theme = {
      id: t.id ?? null,
      title: t.title ?? null,
      description: t.description ?? null,
      openingPrompt: t.opening_prompt ?? null,
    };
  }

  // Engine signals
  if (engineSignalsRes.status === "fulfilled" && Array.isArray(engineSignalsRes.value.data)) {
    ctx.engineSignals = (engineSignalsRes.value.data as any[]).map((r) => ({
      id: r.id ?? null,
      type: r.signal_type,
      practiceId: r.practice_id ?? null,
      loopId: r.loop_id ?? null,
      urgency: Number(r.urgency ?? 0),
      levelHint: r.level_hint ?? null,
      masterId: r.master_id ?? null,
      source: r.source ?? null,
    }));
  }

  // Journal snippet
  if (journalRes.status === "fulfilled" && journalRes.value.data) {
    const j = journalRes.value.data as any;
    if (j.content) ctx.behavior.lastJournalSnippet = String(j.content).slice(0, 280);
  }

  // ─── Extended parsing ───

  // Foundation progress
  if (foundationRes.status === "fulfilled" && foundationRes.value.data) {
    const f = foundationRes.value.data as any;
    ctx.foundation = {
      currentSession: Number(f.current_session ?? 0),
      totalSessions: Number(f.total_sessions ?? 76),
      completed: !!f.completed,
    };
  }

  // Active personalized program
  if (activeProgramRes.status === "fulfilled" && activeProgramRes.value.data) {
    const p = activeProgramRes.value.data as any;
    ctx.activeProgram = {
      id: p.id,
      title: p.title ?? null,
      masterId: p.master_id ?? null,
      templateSlug: p.template_slug ?? null,
      days: Number(p.days ?? 0),
      currentDay: Number(p.current_day ?? 1),
      sessions: Array.isArray(p.sessions) ? p.sessions : [],
    };
  }

  // Spiritual DNA
  if (spiritualDnaRes.status === "fulfilled" && spiritualDnaRes.value.data) {
    const d = spiritualDnaRes.value.data as any;
    ctx.spiritualDna = {
      currentBand: Number(d.current_band ?? 0),
      brainDominance: d.brain_dominance ?? null,
      archetype: d.archetype ?? null,
      raw: d,
    };
  }

  // Dimension scores
  if (dimensionScoresRes.status === "fulfilled" && Array.isArray(dimensionScoresRes.value.data)) {
    const weak: string[] = [];
    for (const row of dimensionScoresRes.value.data as any[]) {
      const id = row.dimension_id ?? row.dimension;
      if (!id) continue;
      const score = Number(row.score ?? 5);
      ctx.dimensionScores[id] = score;
      if (score < 4) weak.push(id);
    }
    ctx.weakDimensions = weak.slice(0, 3);
  }

  // Recent guide topics
  if (guideMessagesRes.status === "fulfilled" && Array.isArray(guideMessagesRes.value.data)) {
    ctx.recentGuideTopics = (guideMessagesRes.value.data as any[])
      .map((m) => String(m.content ?? "").slice(0, 200))
      .filter(Boolean)
      .slice(0, 6);
  }

  // Loop attributions
  if (loopAttributionsRes.status === "fulfilled" && Array.isArray(loopAttributionsRes.value.data)) {
    ctx.loopAttributions = (loopAttributionsRes.value.data as any[]).map((a) => ({
      loopId: a.loop_id,
      confidence: Number(a.confidence ?? 0),
    }));
  }

  return ctx;
}

/** Convenience: flatten practiceLevels into the {practice: level} shape the composer expects. */
export function practiceLevelsMap(ctx: UserContext): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(ctx.practiceLevels)) out[k] = v.level;
  return out;
}
