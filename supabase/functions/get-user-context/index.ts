// ============================================================
// GET USER CONTEXT — Edge Function (Server-Side Aggregation)
// ============================================================
// Single source of truth for user context. Called by:
// - Client (via supabase.functions.invoke)
// - compose-session-v3
// - guide-chat
// - session-adapter
// - ConsciousnessOrchestrator
// - All other engines
//
// Includes: memory block, active arc, recent themes, all extended data

import { createClient } from "npm:@supabase/supabase-js@2";
import { buildLongTermMemoryBlock } from "../_shared/long-term-memory.ts";
import { withMiddleware, successResponse } from "../_shared/middleware.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

interface UserContextRuntime {
  timeBudgetMin?: number;
  energy?: "low" | "medium" | "high";
  gate?: "morning" | "midday" | "evening" | "night";
  hour?: number;
  mood?: string;
  includeMemory?: boolean;
  intent?: string;
}

Deno.serve(withMiddleware(async (req, context) => {
  const { user, admin } = context;
  const body = await req.json().catch(() => ({} as UserContextRuntime));
  
  const userId = body.userId ?? user.id;
  const includeMemory = body.includeMemory ?? true;

  const hour = body.hour ?? new Date().getHours();
  const gate: "morning" | "midday" | "evening" | "night" = body.gate ?? 
    (hour < 5 ? "night" : hour < 12 ? "morning" : hour < 17 ? "midday" : hour < 21 ? "evening" : "night");
  const timeBudgetMin = Number(body.timeBudgetMin ?? 8);

  // ─── SNAPSHOT CACHE READ ───
  // A warm start is one row instead of ~13 parallel queries. Memory is not
  // cached because it depends on the request text. Invalidation on session
  // completion keeps "completed today" from going stale.
  const SNAPSHOT_TTL_MS = 10 * 60 * 1000;
  let snapshotHit: Record<string, unknown> | null = null;
  try {
    const { data } = await admin
      .from("user_state_snapshot")
      .select("payload, computed_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (data?.payload) {
      const age = Date.now() - new Date(data.computed_at as string).getTime();
      if (Number.isFinite(age) && age >= 0 && age < SNAPSHOT_TTL_MS) {
        snapshotHit = data.payload as Record<string, unknown>;
      }
    }
  } catch {
    /* cache is optional */
  }

  if (snapshotHit) {
    const cached: Record<string, unknown> = { ...snapshotHit };
    cached.now = {
      ...((cached.now as Record<string, unknown>) ?? {}),
      hour,
      gate,
      isWeekend: [0, 6].includes(new Date().getDay()),
    };
    if (includeMemory) {
      try {
        cached.memoryBlock = await buildLongTermMemoryBlock({
          admin,
          userId,
          queryText: body.intent || `gate=${gate} budget=${timeBudgetMin}m`,
          activeLoops: (cached.recentLoopIds as string[]) ?? [],
        });
      } catch {
        cached.memoryBlock = "";
      }
    }
    return successResponse({ ok: true, context: cached, _cached: true });
  }

  // ─── PARALLEL READ LAYER ───
  const queryPromises = [
    // Core identity
    admin.from("profiles")
      .select("display_name, onboarding_path, lifestyle, occupation, country, ai_mode, preferred_theme, wake_time, sleep_time")
      .eq("user_id", userId).maybeSingle(),
    
    // Consciousness profile
    admin.from("user_consciousness_profile")
      .select("overall_band, v_level_current, v_level_baseline, v_level_peak, dimension_bands, chitta_vritti, journey_day, journey_phase, yoga_path_affinity, witness_stability, witness_depth, witness_gap, integration_score")
      .eq("user_id", userId).maybeSingle(),
    
    // Practice levels
    admin.from("user_practice_levels")
      .select("practice_type, current_level, sessions_at_level, total_sessions, emotional_healing, loop_dissolution")
      .eq("user_id", userId),
    
    // Active loops
    admin.from("active_loops")
      .select("loop_id, severity, detected_at")
      .eq("user_id", userId).eq("is_active", true)
      .order("severity", { ascending: false }).limit(10),
    
    // Recent consciousness signals
    admin.from("consciousness_signals")
      .select("loop_id, source_type, chitta_vritti, body_state, mind_state, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(20),
    
    // Today's dimensions
    admin.from("daily_dimension_summary")
      .select("thought_score, emotion_score, body_score, awareness_score")
      .eq("user_id", userId).order("summary_date", { ascending: false }).limit(1).maybeSingle(),
    
    // Daily context (gates + mood/energy)
    admin.from("daily_user_context")
      .select("morning_completed, midday_completed, evening_completed, mood_score, energy_score")
      .eq("user_id", userId).eq("session_date", new Date().toISOString().slice(0, 10)).maybeSingle(),
    
    // Last session
    admin.from("sessions")
      .select("ended_at, user_chosen_topic")
      .eq("user_id", userId).eq("status", "completed")
      .order("ended_at", { ascending: false }).limit(1).maybeSingle(),
    
    // 7-day sessions
    admin.from("daily_sessions")
      .select("quality_score, metadata, created_at")
      .eq("user_id", userId)
      .gte("created_at", new Date(Date.now() - 7 * 86400_000).toISOString()),
    
    // Recent ingredients (freshness)
    admin.from("session_ingredients")
      .select("ingredient_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(30),
    
    // Current theme
    admin.from("daily_themes")
      .select("id, title, description, opening_prompt, theme_date, quality_score, completed")
      .eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    
    // Engine signals
    admin.from("engine_signals")
      .select("id, signal_type, practice_id, loop_id, urgency, level_hint, master_id, source")
      .eq("user_id", userId).is("consumed_at", null)
      .order("urgency", { ascending: false }).limit(15),
    
    // Journal snippet
    admin.from("journal_entries")
      .select("content")
      .eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    
    // ─── Extended reads ───
    admin.from("foundation_progress")
      .select("current_session, total_sessions, completed")
      .eq("user_id", userId).maybeSingle(),
    admin.from("personalized_programs")
      .select("id, title, master_id, template_slug, days, current_day, sessions")
      .eq("user_id", userId).eq("status", "active")
      .order("created_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("spiritual_dna")
      .select("*")
      .eq("user_id", userId).maybeSingle(),
    admin.from("dimension_scores")
      .select("dimension_id, dimension, score, updated_at")
      .eq("user_id", userId).order("updated_at", { ascending: false }).limit(12),
    admin.from("guide_messages")
      .select("content")
      .eq("user_id", userId).order("created_at", { ascending: false }).limit(8),
    admin.from("loop_attributions")
      .select("loop_id, confidence")
      .eq("user_id", userId)
      .gt("expires_at", new Date().toISOString())
      .order("confidence", { ascending: false }).limit(10),
    
    // NEW: Active arc for multi-day continuity
    admin.from("theme_arcs")
      .select("*")
      .eq("user_id", userId).eq("status", "active")
      .order("created_at", { ascending: false }).limit(1).maybeSingle(),
    
    // NEW: Recent themes for theme orchestrator
    admin.from("daily_themes")
      .select("theme_date, title, description, affirmation, focus_areas, quality_score, completed")
      .eq("user_id", userId).order("theme_date", { ascending: false }).limit(30),
  ];

  const [
    profileRes, consciousnessRes, practiceLevelsRes, activeLoopsRes,
    recentSignalsRes, dimSummaryRes, dailyCtxRes, lastSessionRes,
    recentSessionsRes, recentIngredientsRes, themeRes,
    engineSignalsRes, journalRes,
    foundationRes, activeProgramRes, spiritualDnaRes,
    dimensionScoresRes, guideMessagesRes, loopAttributionsRes,
    activeArcRes, recentThemesRes,
  ] = await Promise.allSettled(queryPromises);

  // ─── BUILD CONTEXT ───
  const ctx: any = {
    userId,
    identity: { displayName: null, onboardingPath: null, lifestyle: {}, occupation: null, country: null, aiMode: "fast", preferredTheme: "sunrise", wakeTime: null, sleepTime: null },
    spiritual: { overallBand: 0, vLevelCurrent: 0, vLevelBaseline: 0, vLevelPeak: 0, dimensionBands: { thought: 0, emotion: 0, body: 0, awareness: 0 }, chittaVritti: null, journeyDay: 1, journeyPhase: "assessment", yogaPathAffinity: { raja: 0, jnana: 0, karma: 0, bhakti: 0 }, witnessStability: 0, witnessDepth: 0, witnessGap: 0, integrationScore: 0 },
    practiceLevels: {},
    activeLoops: [],
    recentLoopIds: [],
    dimensionsToday: null,
    behavior: { gapDays: 0, lastSessionAt: null, lastSessionIntent: null, sessionsLast7d: 0, avgQualityLast7d: 0, avgSessionMinutesLast7d: 0, consistencyScore: 0, recentIngredientIds: [], morningCompletedToday: false, middayCompletedToday: false, eveningCompletedToday: false, lastJournalSnippet: null },
    now: { hour, gate, energy: body.energy ?? "medium", timeBudgetMin, mood: body.mood ?? null, moodScoreToday: null, energyScoreToday: null },
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
    // NEW fields
    activeArc: null,
    recentThemes: [],
  };

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

  // Daily context
  if (dailyCtxRes.status === "fulfilled" && dailyCtxRes.value.data) {
    const d = dailyCtxRes.value.data as any;
    ctx.behavior.morningCompletedToday = !!d.morning_completed;
    ctx.behavior.middayCompletedToday = !!d.midday_completed;
    ctx.behavior.eveningCompletedToday = !!d.evening_completed;
    ctx.now.moodScoreToday = d.mood_score ?? null;
    ctx.now.energyScoreToday = d.energy_score ?? null;
    if (!body.energy && d.energy_score != null) {
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
        ctx.behavior.avgSessionMinutesLast7d = Math.round(mins.reduce((a, b) => a + b, 0) / mins.length);
      }
    }
    ctx.behavior.consistencyScore = Math.min(1, rows.length / 7);
  }

  // Recent ingredients
  if (recentIngredientsRes.status === "fulfilled" && Array.isArray(recentIngredientsRes.value.data)) {
    ctx.behavior.recentIngredientIds = (recentIngredientsRes.value.data as any[])
      .map((r) => r.ingredient_id).filter(Boolean);
  }

  // Learned ingredient performance — the composer's feedback term.
  try {
    const { data: perfRows } = await admin
      .from("session_ingredient_performance")
      .select("ingredient_id, attempts, completions, avg_quality, avg_seconds")
      .eq("user_id", userId)
      .gte("attempts", 2);

    if (Array.isArray(perfRows) && perfRows.length > 0) {
      const perf: Record<string, {
        attempts: number;
        completions: number;
        completionRate: number;
        avgQuality: number;
        avgSeconds: number;
      }> = {};
      for (const row of perfRows as any[]) {
        const id = String(row?.ingredient_id ?? "");
        const attempts = Number(row?.attempts ?? 0);
        if (!id || attempts <= 0) continue;
        const completions = Number(row?.completions ?? 0);
        const rawQuality = Number(row?.avg_quality ?? 0);
        perf[id] = {
          attempts,
          completions,
          completionRate: Math.max(0, Math.min(1, completions / attempts)),
          avgQuality: Math.max(0, Math.min(1, rawQuality > 1 ? rawQuality / 100 : rawQuality)),
          avgSeconds: Number(row?.avg_seconds ?? 0),
        };
      }
      if (Object.keys(perf).length > 0) ctx.behavior.ingredientPerformance = perf;
    }
  } catch {
    /* learning data is optional; the composer falls back to priors */
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

  // Extended parsing
  if (foundationRes.status === "fulfilled" && foundationRes.value.data) {
    const f = foundationRes.value.data as any;
    ctx.foundation = {
      currentSession: Number(f.current_session ?? 0),
      totalSessions: Number(f.total_sessions ?? 76),
      completed: !!f.completed,
    };
  }

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

  if (spiritualDnaRes.status === "fulfilled" && spiritualDnaRes.value.data) {
    const d = spiritualDnaRes.value.data as any;
    ctx.spiritualDna = {
      currentBand: Number(d.current_band ?? 0),
      brainDominance: d.brain_dominance ?? null,
      archetype: d.archetype ?? null,
      raw: d,
    };
  }

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

  if (guideMessagesRes.status === "fulfilled" && Array.isArray(guideMessagesRes.value.data)) {
    ctx.recentGuideTopics = (guideMessagesRes.value.data as any[])
      .map((m) => String(m.content ?? "").slice(0, 200))
      .filter(Boolean)
      .slice(0, 6);
  }

  if (loopAttributionsRes.status === "fulfilled" && Array.isArray(loopAttributionsRes.value.data)) {
    ctx.loopAttributions = (loopAttributionsRes.value.data as any[]).map((a) => ({
      loopId: a.loop_id,
      confidence: Number(a.confidence ?? 0),
    }));
  }

  // NEW: Active arc
  if (activeArcRes.status === "fulfilled" && activeArcRes.value.data) {
    ctx.activeArc = activeArcRes.value.data;
  }

  // NEW: Recent themes
  if (recentThemesRes.status === "fulfilled" && Array.isArray(recentThemesRes.value.data)) {
    ctx.recentThemes = recentThemesRes.value.data;
  }

  // ─── SNAPSHOT CACHE WRITE ───
  try {
    const cacheable: Record<string, unknown> = { ...(ctx as unknown as Record<string, unknown>) };
    delete cacheable.memoryBlock;
    await admin.from("user_state_snapshot").upsert(
      {
        user_id: userId,
        payload: cacheable,
        computed_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  } catch {
    /* caching must never fail the request */
  }

  // ─── INJECT MEMORY BLOCK ───
  if (includeMemory) {
    try {
      ctx.memoryBlock = await buildLongTermMemoryBlock({
        admin,
        userId,
        queryText: body.intent || `gate=${gate} budget=${timeBudgetMin}m`,
        activeLoops: ctx.recentLoopIds,
      });
    } catch (e) {
      console.warn("[get-user-context] Memory injection failed:", e);
      ctx.memoryBlock = "";
    }
  }

  return successResponse({ ok: true, context: ctx });
}));