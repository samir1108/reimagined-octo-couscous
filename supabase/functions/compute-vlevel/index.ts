// ============================================================
// COMPUTE V-LEVEL — Server-Authoritative V-Level Calculation RPC
// ============================================================
// Single source of truth for V-Level. Called by:
// - consciousness-engine
// - compose-session-v3
// - evaluate-practice-level
// - recalibration-intelligence
// - client via supabase.rpc('compute_vlevel', {...})
//
// Keeps client/server formulas perfectly in sync.

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface DimensionScores {
  thought: number;
  emotion: number;
  body: number;
  awareness: number;
  action?: number;
  connection?: number;
  spirit?: number;
}

interface ProfileForVLevel {
  dimension_bands: Partial<DimensionScores>;
  witness_gap?: number;
  witness_stability?: number;
  witness_depth?: number;
  loop_severity?: Record<string, 'none' | 'active' | 'acute'>;
  integration_score?: number;
  v_level_baseline?: number;
  v_level_peak?: number;
  journey_day?: number;
  total_sessions?: number;
  regression?: {
    dark_night_count?: number;
    baseline_highest?: number;
  };
  last_session_at?: string;
}

interface VLevelResult {
  value: number;
  band: number;
  microLevel: 'entering' | 'deepening' | 'mastery';
  dimensionScores: DimensionScores;
  calculatedAt: string;
  witnessQuality: number;
  loopPenalty: number;
  integrationScore: number;
}

// Constants (must match client exactly)
const PRIMARY_DIMENSIONS: (keyof DimensionScores)[] = ['thought', 'emotion', 'body', 'spirit'];
const CALIBRATION_DURATION_DAYS = 30;
const CALIBRATION_MAX_BAND = 1.0;

const DIMENSION_MAX_BY_DAY: Array<{ minDays: number; maxBand: number }> = [
  { minDays: 0, maxBand: 1.5 },
  { minDays: 7, maxBand: 2.5 },
  { minDays: 14, maxBand: 3.5 },
  { minDays: 30, maxBand: 4.5 },
  { minDays: 60, maxBand: 5.5 },
  { minDays: 90, maxBand: 6.5 },
  { minDays: 180, maxBand: 7.0 },
];

function getDimensionCap(journeyDay: number, isCalibrationPeriod: boolean): number {
  if (isCalibrationPeriod) return 3.5;
  let cap = 1.5;
  for (const tier of DIMENSION_MAX_BY_DAY) {
    if (journeyDay >= tier.minDays) cap = tier.maxBand;
  }
  return cap;
}

function computeWitnessQuality(profile: ProfileForVLevel): number {
  const gap = profile.witness_gap || 0;
  const stability = profile.witness_stability || 0;
  const depth = profile.witness_depth || 0;
  return 0.4 * gap + 0.35 * stability + 0.25 * depth;
}

function computeLoopPenalty(loopSeverity: ProfileForVLevel['loop_severity']): number {
  if (!loopSeverity) return 1.0;
  const acuteCount = Object.values(loopSeverity).filter(s => s === 'acute').length;
  const activeCount = Object.values(loopSeverity).filter(s => s === 'active').length;
  return Math.max(0.50, 1.0 - (0.05 * acuteCount) - (0.02 * activeCount));
}

function computeIntegrationScoreV2(profile: ProfileForVLevel): number {
  const baseline = profile.v_level_baseline || 0;
  const peak = profile.v_level_peak || 0;
  const journeyDay = profile.journey_day || 1;
  const regression = profile.regression || {};
  const darkNightCount = regression.dark_night_count || 0;
  const totalSessions = profile.total_sessions || 0;

  const peakProximity = peak > 0
    ? Math.max(0, 1 - ((peak - baseline) / Math.max(peak, 0.01)))
    : 0;

  const testingDepth = Math.min(1, darkNightCount > 0
    ? (regression.baseline_highest || 0) > baseline * 0.8
      ? 0.8 + (darkNightCount * 0.05)
      : 0.4
    : Math.min(0.3, journeyDay / 100)
  );

  const expectedSessions = Math.max(1, journeyDay * 0.5);
  const consistencyRatio = Math.min(1, totalSessions / expectedSessions);

  const dims = profile.dimension_bands || {};
  const dimVals = [dims.thought || 0, dims.emotion || 0, dims.body || 0, dims.awareness || 0];
  const dimMax = Math.max(...dimVals);
  const dimMin = Math.min(...dimVals);
  const balanceScore = dimMax > 0 ? dimMin / dimMax : 0;

  const integration = 0.30 * peakProximity
    + 0.25 * testingDepth
    + 0.25 * consistencyRatio
    + 0.20 * balanceScore;

  return parseFloat(Math.max(0, Math.min(1, integration)).toFixed(3));
}

function applyTimeDecay(dimensionBands: Partial<DimensionScores>, lastSessionAt: string | undefined): Partial<DimensionScores> {
  if (!lastSessionAt) return dimensionBands;

  const daysSince = Math.floor((Date.now() - new Date(lastSessionAt).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSince <= 1) return dimensionBands;

  const decayRate = 0.01 * Math.min(daysSince, 50);
  const decayed: Partial<DimensionScores> = { ...dimensionBands };
  for (const dim of PRIMARY_DIMENSIONS) {
    decayed[dim] = Math.max(0, (decayed[dim] || 0) - decayRate);
  }
  return decayed;
}

function calculateVLevel(
  dimensionScoresInput: Partial<DimensionScores>,
  profile: ProfileForVLevel
): VLevelResult {
  const dims = applyTimeDecay(dimensionScoresInput, profile.last_session_at);

  const isCalibrationPeriod = (profile.journey_day || 1) <= CALIBRATION_DURATION_DAYS;
  const dimCap = getDimensionCap(profile.journey_day || 1, isCalibrationPeriod);

  for (const dim of PRIMARY_DIMENSIONS) {
    if (dims[dim] !== undefined) {
      dims[dim] = Math.min(dims[dim]!, dimCap);
    }
  }

  const vals = [
    dims.thought || 0,
    dims.emotion || 0,
    dims.body || 0,
    dims.awareness || 0,
  ];

  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);

  const epsilon = 0.01;
  const safeVals = vals.map(v => v + epsilon);
  const geometricMean = Math.pow(safeVals.reduce((a, b) => a * b, 1), 0.25) - epsilon;

  const harmonicMean = vals.every(v => v > 0)
    ? 4 / vals.reduce((sum, v) => sum + (1 / Math.max(0.01, v)), 0)
    : 0;

  const blendedScore = 0.40 * Math.max(0, geometricMean)
    + 0.30 * harmonicMean
    + 0.20 * minVal
    + 0.10 * maxVal;

  const witnessQuality = computeWitnessQuality(profile);
  const witnessModifier = 0.70 + (0.30 * witnessQuality);

  const loopPenalty = computeLoopPenalty(profile.loop_severity);

  const integrationScore = computeIntegrationScoreV2(profile);
  const integrationBonus = 1.0 + (0.10 * integrationScore);

  const vLevel = blendedScore * witnessModifier * loopPenalty * integrationBonus;
  const clampedValue = Math.max(0, Math.min(7.0, parseFloat(vLevel.toFixed(2))));

  const finalValue = isCalibrationPeriod
    ? Math.min(clampedValue, CALIBRATION_MAX_BAND)
    : clampedValue;

  const value = Math.round(finalValue * 10) / 10;
  const band = Math.floor(value);
  const fractional = value - band;

  let microLevel: 'entering' | 'deepening' | 'mastery';
  if (fractional < 0.3) microLevel = 'entering';
  else if (fractional < 0.7) microLevel = 'deepening';
  else microLevel = 'mastery';

  return {
    value,
    band,
    microLevel,
    dimensionScores: dims as DimensionScores,
    calculatedAt: new Date().toISOString(),
    witnessQuality,
    loopPenalty,
    integrationScore,
  };
}

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const {
      dimensionScores,
      profile,
    } = body as {
      dimensionScores: Partial<DimensionScores>;
      profile: ProfileForVLevel;
    };

    if (!dimensionScores || !profile) {
      return new Response(JSON.stringify({ error: 'Missing dimensionScores or profile' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = calculateVLevel(dimensionScores, profile);

    return new Response(JSON.stringify({ ok: true, result }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[compute-vlevel] Error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});