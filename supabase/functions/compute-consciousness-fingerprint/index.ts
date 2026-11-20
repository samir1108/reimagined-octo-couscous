// ============================================================
// COMPUTE CONSCIOUSNESS FINGERPRINT — Daily Fingerprint Computation
// ============================================================
// Computes the user's consciousness fingerprint (Invention 5):
// - Loop constellation map
// - Dominant lens (head/heart/gut/witness)
// - Chitta Vritti tendency
// - Chakra blockage pattern
// - Samskara depth map
// - Witness stability curve
//
// Runs daily via cron, or on-demand via user trigger.

import { createClient } from "npm:@supabase/supabase-js@2";
import { withMiddleware, successResponse } from "../_shared/middleware.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(withMiddleware(async (req, context) => {
  const { admin, user } = context;
  const body = await req.json().catch(() => ({} as { userId?: string; all?: boolean }));
  
  const targetUserId = body.userId ?? user.id;
  const isCron = body.all === true;

  if (isCron && !user) {
    return successResponse({ ok: false, error: "Unauthorized" }, 401);
  }

  let userIds: string[] = [targetUserId];
  
  if (isCron) {
    // Get all active users (sessions in last 30 days)
    const { data: activeUsers } = await admin
      .from("sessions")
      .select("user_id")
      .eq("status", "completed")
      .gte("ended_at", new Date(Date.now() - 30 * 86400000).toISOString())
      .limit(1000);
    
    userIds = [...new Set(activeUsers?.map(u => u.user_id) || [])];
  }

  const results = [];
  
  for (const userId of userIds) {
    try {
      const fingerprint = await computeFingerprint(admin, userId);
      results.push({ userId, ok: true, fingerprint });
    } catch (error) {
      results.push({ userId, ok: false, error: (error as Error).message });
    }
  }

  return successResponse({ ok: true, results, processed: userIds.length });
}));

async function computeFingerprint(admin: any, userId: string) {
  // Parallel data fetches
  const [
    { data: activeLoops },
    { data: loopAttributions },
    { data: dimensionScores },
    { data: practiceLevels },
    { data: vLevelHistory },
    { data: sessionHistory },
    { data: bioSignals },
    { data: voicePatterns },
    { data: microExpressions },
  ] = await Promise.all([
    admin.from("active_loops").select("loop_id, severity").eq("user_id", userId).eq("is_active", true),
    admin.from("loop_attributions").select("loop_id, confidence, created_at").eq("user_id", userId).gte("created_at", new Date(Date.now() - 60 * 86400000).toISOString()),
    admin.from("dimension_scores").select("dimension_id, score, updated_at").eq("user_id", userId).order("updated_at", { ascending: false }).limit(20),
    admin.from("user_practice_levels").select("practice_type, current_level, sessions_at_level, total_sessions").eq("user_id", userId),
    admin.from("v_level_history").select("value, band, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(90),
    admin.from("sessions").select("ended_at, quality_score, duration_seconds, type").eq("user_id", userId).eq("status", "completed").order("ended_at", { ascending: false }).limit(100),
    admin.from("bio_signals").select("hrv, eda, skin_temp, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
    admin.from("voice_patterns").select("prosody, word_patterns, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
    admin.from("micro_expressions").select("state_classification, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
  ]);

  // 1. Loop Constellation
  const loopConstellation = buildLoopConstellation(activeLoops, loopAttributions);

  // 2. Dominant Lens
  const dominantLens = computeDominantLens(dimensionScores, practiceLevels);

  // 3. Chitta Vritti
  const chittaVritti = computeChittaVritti(sessionHistory, microExpressions, activeLoops);

  // 4. Chakra Blocks
  const chakraBlocks = computeChakraBlocks(dimensionScores, loopConstellation, activeLoops);

  // 5. Samskara Depth
  const samskaraDepth = computeSamskaraDepth(loopAttributions, loopConstellation);

  // 6. Witness Stability Curve
  const witnessStabilityCurve = computeWitnessStabilityCurve(sessionHistory, vLevelHistory);

  // Upsert fingerprint
  const { error } = await admin.from("consciousness_fingerprint").upsert({
    user_id: userId,
    loop_constellation: loopConstellation,
    dominant_lens: dominantLens,
    chitta_vritti: chittaVritti,
    chakra_blocks: chakraBlocks,
    samskara_depth: samskaraDepth,
    witness_stability_curve: witnessStabilityCurve,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;

  return {
    loopConstellation,
    dominantLens,
    chittaVritti,
    chakraBlocks,
    samskaraDepth,
    witnessStabilityCurve,
  };
}

function buildLoopConstellation(activeLoops: any[], attributions: any[]) {
  const constellation: Record<string, any> = {};
  
  // Active loops with severity
  for (const loop of activeLoops || []) {
    constellation[loop.loop_id] = {
      active: true,
      severity: loop.severity,
      count: 0,
      firstSeen: null,
      lastSeen: null,
    };
  }

  // Attribution history
  for (const attr of attributions || []) {
    if (!constellation[attr.loop_id]) {
      constellation[attr.loop_id] = { active: false, severity: 0, count: 0, firstSeen: null, lastSeen: null };
    }
    constellation[attr.loop_id].count += 1;
    const date = attr.created_at.slice(0, 10);
    if (!constellation[attr.loop_id].firstSeen || date < constellation[attr.loop_id].firstSeen) {
      constellation[attr.loop_id].firstSeen = date;
    }
    if (!constellation[attr.loop_id].lastSeen || date > constellation[attr.loop_id].lastSeen) {
      constellation[attr.loop_id].lastSeen = date;
    }
  }

  return constellation;
}

function computeDominantLens(dimensionScores: any[], practiceLevels: any[]) {
  if (!dimensionScores?.length) return 'witness';

  const dims: Record<string, number> = {};
  for (const ds of dimensionScores) {
    const dim = ds.dimension_id || ds.dimension;
    if (dim) dims[dim] = ds.score;
  }

  const scores = { head: 0, heart: 0, gut: 0, witness: 0 };
  
  // Dimension scores
  scores.head += (dims.thought || 0) + (dims.awareness || 0) * 0.5;
  scores.heart += (dims.emotion || 0);
  scores.gut += (dims.body || 0);
  scores.witness += (dims.awareness || 0) * 0.5;

  // Practice levels as proxy
  for (const pl of practiceLevels || []) {
    const level = pl.current_level || 0;
    if (['self_inquiry', 'jnana', 'witnessing', 'observation'].includes(pl.practice_type)) {
      scores.head += level;
      scores.witness += level;
    }
    if (['bhakti', 'loving_kindness', 'emotional_healing'].includes(pl.practice_type)) {
      scores.heart += level;
    }
    if (['karma', 'body', 'breath', 'raja', 'kriya'].includes(pl.practice_type)) {
      scores.gut += level;
    }
  }

  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function computeChittaVritti(sessions: any[], microExpressions: any[], activeLoops: any[]) {
  const recentSessions = sessions?.slice(0, 10) || [];
  const avgQuality = recentSessions.length > 0
    ? recentSessions.reduce((a, s) => a + (s.quality_score || 0), 0) / recentSessions.length
    : 0.5;

  const loopCount = activeLoops?.length || 0;
  const latestExpression = microExpressions?.[0]?.state_classification;

  if (avgQuality < 0.3) return 'mudha';
  if (loopCount > 3 || latestExpression === 'kshipta') return 'kshipta';
  if (avgQuality > 0.7 && loopCount === 0) return 'ekagra';
  if (latestExpression === 'niruddha') return 'niruddha';
  return 'vikshipta';
}

function computeChakraBlocks(dimensionScores: any[], loopConstellation: any, activeLoops: any[]) {
  const dims: Record<string, number> = {};
  for (const ds of dimensionScores || []) {
    const dim = ds.dimension_id || ds.dimension;
    if (dim) dims[dim] = ds.score;
  }

  const chakraMap: Record<string, string> = {
    thought: 'crown', emotion: 'heart', body: 'root', awareness: 'third_eye',
  };

  const blocks: Record<string, any> = {};
  for (const [dim, score] of Object.entries(dims)) {
    const chakra = chakraMap[dim];
    if (chakra) {
      blocks[chakra] = {
        blocked: score < 3,
        severity: score < 3 ? (3 - score) / 3 : 0,
        dimensionScore: score,
      };
    }
  }

  // Add loop-based blocks
  for (const [loopId, data] of Object.entries(loopConstellation)) {
    const prefix = loopId.slice(0, 3);
    const chakraMapLoops: Record<string, string> = {
      'VAL': 'solar', 'CTL': 'solar', 'AVD': 'root',
      'SRV': 'root', 'ATT': 'heart', 'SHD': 'throat',
      'EGO': 'solar', 'BOD': 'root', 'ENR': 'sacral',
      'EMO': 'heart', 'MEN': 'third_eye',
    };
    const chakra = chakraMapLoops[prefix];
    if (chakra) {
      blocks[chakra] = blocks[chakra] || { blocked: false, severity: 0 };
      blocks[chakra].severity = Math.max(blocks[chakra].severity, (data as any).severity / 5);
      blocks[chakra].blocked = blocks[chakra].severity > 0.4;
    }
  }

  return blocks;
}

function computeSamskaraDepth(attributions: any[], loopConstellation: any) {
  const rootWounds: Record<string, any> = {};
  const woundMap: Record<string, string> = {
    'VAL': 'unworthiness', 'CTL': 'unsafety', 'AVD': 'inner_void',
    'SRV': 'unsafety', 'ATT': 'abandonment', 'SHD': 'repression',
    'EGO': 'identity_fixation', 'BOD': 'disconnection', 'ENR': 'inner_void',
    'EMO': 'abandonment', 'MEN': 'identity_fixation',
  };

  // Count occurrences per root wound
  for (const attr of attributions || []) {
    const prefix = attr.loop_id.slice(0, 3);
    const wound = woundMap[prefix];
    if (!wound) continue;
    
    if (!rootWounds[wound]) {
      rootWounds[wound] = { depth: 0, loops: [], count: 0 };
    }
    rootWounds[wound].count += 1;
    if (!rootWounds[wound].loops.includes(attr.loop_id)) {
      rootWounds[wound].loops.push(attr.loop_id);
    }
  }

  // Calculate depth (0-1) based on recurrence
  for (const [wound, data] of Object.entries(rootWounds)) {
    data.depth = Math.min(1, data.count / 20); // 20+ occurrences = full depth
  }

  return rootWounds;
}

function computeWitnessStabilityCurve(sessions: any[], vLevelHistory: any[]) {
  const curve: any[] = [];
  const recentSessions = sessions?.slice(0, 30) || [];
  
  for (const session of recentSessions) {
    const date = session.ended_at?.slice(0, 10);
    if (!date) continue;
    
    // Proxy for witness stability from session quality and duration
    const quality = session.quality_score || 0.5;
    const duration = session.duration_seconds || 600;
    const stability = quality * 0.7 + Math.min(1, duration / 1800) * 0.3;
    
    curve.push({ date, stability: Math.round(stability * 100) / 100 });
  }

  return curve.slice(-30); // Last 30 days
}