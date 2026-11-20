// ============================================================
// CORRELATE SESSION OUTCOME — Session→Outcome Correlation RPC
// ============================================================
// Called after session completion to:
// 1. Store outcome in session_outcomes
// 2. Update consciousness_fingerprint
// 3. Trigger recalibration if needed
// 4. Update loop resonance (if applicable)

import { createClient } from "npm:@supabase/supabase-js@2";
import { withMiddleware, successResponse } from "../_shared/middleware.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface CorrelateOutcomeRequest {
  sessionId: string;
  userId: string;
  spineId?: string;
  qualityScore: number;           // 0-1
  loopsTouched: string[];
  dimensionNudges: Record<string, number>;
  vlevelDelta: number;
  moodBefore?: string;
  moodAfter?: string;
  energyBefore?: string;
  energyAfter?: string;
  breakthroughDetected?: boolean;
  regressionDetected?: boolean;
}

Deno.serve(withMiddleware(async (req, context) => {
  const { admin } = context;
  const body = await req.json().catch(() => ({} as CorrelateOutcomeRequest));
  
  const {
    sessionId, userId, spineId, qualityScore, loopsTouched, dimensionNudges,
    vlevelDelta, moodBefore, moodAfter, energyBefore, energyAfter,
    breakthroughDetected = false, regressionDetected = false,
  } = body;

  if (!sessionId || !userId || qualityScore === undefined) {
    return successResponse({ ok: false, error: "Missing required fields" }, 400);
  }

  try {
    // 1. Store session outcome
    const { data: outcome, error: outcomeError } = await admin
      .from("session_outcomes")
      .insert({
        session_id: sessionId,
        user_id: userId,
        spine_id: spineId ?? null,
        quality_score: qualityScore,
        loops_touched: loopsTouched,
        dimension_nudges: dimensionNudges,
        vlevel_delta: vlevelDelta,
        mood_before: moodBefore ?? null,
        mood_after: moodAfter ?? null,
        energy_before: energyBefore ?? null,
        energy_after: energyAfter ?? null,
        breakthrough_detected: breakthroughDetected,
        regression_detected: regressionDetected,
      })
      .select("id")
      .single();

    if (outcomeError) throw outcomeError;

    // 2. Update consciousness fingerprint
    await updateConsciousnessFingerprint(admin, userId, {
      qualityScore,
      loopsTouched,
      dimensionNudges,
      vlevelDelta,
      breakthroughDetected,
      regressionDetected,
    });

    // 3. Check if recalibration needed
    const needsRecalibration = qualityScore < 0.4 || regressionDetected || 
      (vlevelDelta < -0.3 && Math.abs(vlevelDelta) > 0.1);

    if (needsRecalibration) {
      // Fire-and-forget recalibration
      void fetch(`${SUPABASE_URL}/functions/v1/recalibration-intelligence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": req.headers.get("Authorization")!,
          "apikey": Deno.env.get("SUPABASE_ANON_KEY")!,
        },
        body: JSON.stringify({ 
          userId, 
          force: true,
          trigger: qualityScore < 0.4 ? "low_quality" : 
                   regressionDetected ? "regression" : "vlevel_drop",
        }),
      }).catch(() => {});
    }

    // 4. Update loop resonance (if user has partner/family linked)
    await updateLoopResonance(admin, userId, loopsTouched);

    return successResponse({ 
      ok: true, 
      outcomeId: outcome.id,
      recalibrationTriggered: needsRecalibration,
    });

  } catch (error) {
    console.error("[correlate-session-outcome] Error:", error);
    return successResponse({ ok: false, error: (error as Error).message }, 500);
  }
}));

async function updateConsciousnessFingerprint(
  admin: any,
  userId: string,
  data: {
    qualityScore: number;
    loopsTouched: string[];
    dimensionNudges: Record<string, number>;
    vlevelDelta: number;
    breakthroughDetected: boolean;
    regressionDetected: boolean;
  }
) {
  // Get existing fingerprint
  const { data: existing } = await admin
    .from("consciousness_fingerprint")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  // Build loop constellation update
  const loopConstellation = existing?.loop_constellation || {};
  for (const loopId of data.loopsTouched) {
    if (!loopConstellation[loopId]) {
      loopConstellation[loopId] = { count: 0, severity: 0, firstSeen: today, lastSeen: today };
    }
    loopConstellation[loopId].count += 1;
    loopConstellation[loopId].lastSeen = today;
  }

  // Build chakra blocks from dimension nudges
  const chakraMap: Record<string, string> = {
    thought: 'crown', emotion: 'heart', body: 'root', awareness: 'third_eye',
  };
  const chakraBlocks = existing?.chakra_blocks || {};
  for (const [dim, delta] of Object.entries(data.dimensionNudges)) {
    const chakra = chakraMap[dim];
    if (chakra) {
      chakraBlocks[chakra] = chakraBlocks[chakra] || { blocked: false, severity: 0 };
      chakraBlocks[chakra].severity = Math.max(0, Math.min(1, (chakraBlocks[chakra].severity || 0) - delta * 0.1));
    }
  }

  // Build samskara depth from loop recurrences
  const samskaraDepth = existing?.samskara_depth || {};
  for (const loopId of data.loopsTouched) {
    const entry = loopConstellation[loopId];
    if (entry.count >= 5) {
      const rootWound = getRootWound(loopId);
      if (!samskaraDepth[rootWound]) {
        samskaraDepth[rootWound] = { depth: 0, loops: [] };
      }
      samskaraDepth[rootWound].depth = Math.min(1, samskaraDepth[rootWound].depth + 0.05);
      if (!samskaraDepth[rootWound].loops.includes(loopId)) {
        samskaraDepth[rootWound].loops.push(loopId);
      }
    }
  }

  // Witness stability curve
  const witnessCurve = existing?.witness_stability_curve || [];
  witnessCurve.push({ date: today, stability: 0.5 + data.qualityScore * 0.5 }); // proxy
  if (witnessCurve.length > 90) witnessCurve.shift(); // keep 90 days

  // Upsert fingerprint
  await admin.from("consciousness_fingerprint").upsert({
    user_id: userId,
    loop_constellation: loopConstellation,
    dominant_lens: determineDominantLens(data.dimensionNudges),
    chitta_vritti: determineChittaVritti(data.qualityScore, data.loopsTouched.length),
    chakra_blocks: chakraBlocks,
    samskara_depth: samskaraDepth,
    witness_stability_curve: witnessCurve,
    updated_at: now,
  });
}

async function updateLoopResonance(
  admin: any,
  userId: string,
  loopsTouched: string[]
) {
  // Get user's relationships (partner, family)
  const { data: relationships } = await admin
    .from("user_relationships")
    .select("related_user_id, relationship_type")
    .eq("user_id", userId)
    .in("relationship_type", ["partner", "family", "close_friend"]);

  if (!relationships?.length) return;

  for (const rel of relationships) {
    // Get other user's active loops
    const { data: otherLoops } = await admin
      .from("active_loops")
      .select("loop_id, severity")
      .eq("user_id", rel.related_user_id)
      .eq("is_active", true);

    if (!otherLoops?.length) continue;

    // Calculate resonance
    const resonanceLoops: Record<string, any> = {};
    let totalResonance = 0;
    let count = 0;

    for (const myLoop of loopsTouched) {
      for (const theirLoop of otherLoops) {
        if (myLoop === theirLoop.loop_id) {
          resonanceLoops[myLoop] = {
            userA_severity: 1, // would get from my active_loops
            userB_severity: theirLoop.severity,
            resonance_score: theirLoop.severity / 5, // normalize
          };
          totalResonance += theirLoop.severity / 5;
          count++;
        }
      }
    }

    if (count > 0) {
      await admin.from("loop_resonance").upsert({
        user_a: userId,
        user_b: rel.related_user_id,
        resonance_loops: resonanceLoops,
        resonance_score: totalResonance / count,
        relationship_type: rel.relationship_type,
        status: 'active',
        updated_at: new Date().toISOString(),
      });
    }
  }
}

function getRootWound(loopId: string): string {
  const map: Record<string, string> = {
    'VAL': 'unworthiness', 'CTL': 'unsafety', 'AVD': 'inner_void',
    'SRV': 'unsafety', 'ATT': 'abandonment', 'SHD': 'repression',
    'EGO': 'identity_fixation', 'BOD': 'disconnection', 'ENR': 'inner_void',
    'EMO': 'abandonment', 'MEN': 'identity_fixation',
  };
  const prefix = loopId.slice(0, 3);
  return map[prefix] || 'unknown';
}

function determineDominantLens(nudges: Record<string, number>): string {
  const scores = { head: 0, heart: 0, gut: 0, witness: 0 };
  for (const [dim, delta] of Object.entries(nudges)) {
    if (['thought', 'awareness'].includes(dim)) scores.head += Math.abs(delta);
    if (['emotion'].includes(dim)) scores.heart += Math.abs(delta);
    if (['body'].includes(dim)) scores.gut += Math.abs(delta);
    if (['awareness'].includes(dim)) scores.witness += Math.abs(delta);
  }
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function determineChittaVritti(quality: number, loopCount: number): string {
  if (quality < 0.3) return 'mudha';
  if (loopCount > 3) return 'kshipta';
  if (quality > 0.7) return 'ekagra';
  return 'vikshipta';
}