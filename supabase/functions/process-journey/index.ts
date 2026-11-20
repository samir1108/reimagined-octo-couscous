/**
 * process-journey — Supabase Edge Function
 *
 * Receives a completed cinematic journey payload (75 answers) and
 * produces the final computed metrics. Mirrors the client-side
 * computeMetricsClient logic but runs server-side for integrity.
 *
 * Input:  { userId, answers: JourneyAnswer[], questionCount }
 * Output: { metrics: ComputedMetrics }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface JourneyAnswer {
  questionId: string;
  questionIndex: number;
  kind: string;
  value: string | number | string[];
  scoreTags: any[];
}

interface ScoreAccumulator {
  bandTotal: number;
  bandCount: number;
  dimensionTotals: Record<string, number>;
  dimensionCounts: Record<string, number>;
  vLevelDeltaTotal: number;
  witnessDeltaTotal: number;
  integrationDeltaTotal: number;
  emotionDeltaTotal: number;
  somaticDeltaTotal: number;
  purposeClarityTotal: number;
  criticVolumeTotal: number;
  shadowProjectionTotal: number;
  chittaVrittiTotal: number;
  hCapacityTotals: Record<string, number>;
  pathScores: Record<string, number>;
  archetypeScores: Record<string, number>;
  brainScores: Record<string, number>;
  attachmentScores: Record<string, number>;
  beliefScores: Record<string, number>;
  circadianScores: Record<string, number>;
  loopFamilies: string[];
  appRelationship: string | null;
  criticVolumeRaw: number;
  shadowOwned: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const answers: JourneyAnswer[] = body.answers || [];

    // Score accumulation
    const acc: ScoreAccumulator = {
      bandTotal: 0, bandCount: 0,
      dimensionTotals: {}, dimensionCounts: {},
      vLevelDeltaTotal: 0, witnessDeltaTotal: 0, integrationDeltaTotal: 0,
      emotionDeltaTotal: 0, somaticDeltaTotal: 0, purposeClarityTotal: 0,
      criticVolumeTotal: 0, shadowProjectionTotal: 0, chittaVrittiTotal: 0,
      hCapacityTotals: {}, pathScores: {}, archetypeScores: {},
      brainScores: {}, attachmentScores: {}, beliefScores: {}, circadianScores: {},
      loopFamilies: [], appRelationship: null, criticVolumeRaw: 0, shadowOwned: 0,
    };

    for (const answer of answers) {
      for (const tag of (answer.scoreTags || [])) {
        accumulateTag(acc, tag);
      }
    }

    // Compute metrics
    const overallBand = acc.bandCount > 0 ? Math.round((acc.bandTotal / acc.bandCount) * 10) / 10 : 3;
    const dimensionBands: Record<string, number> = {};
    for (const [dim, total] of Object.entries(acc.dimensionTotals)) {
      dimensionBands[dim] = Math.round((total / (acc.dimensionCounts[dim] || 1)) * 10) / 10;
    }
    const vLevelBaseline = Math.max(0, Math.min(10, overallBand + acc.vLevelDeltaTotal));
    const vLevelCurrent = Math.max(0, Math.min(10, vLevelBaseline + 0.5));
    const integrationScore = Math.max(0, Math.min(10, 5 + acc.integrationDeltaTotal));
    const witnessGap = Math.max(0, 10 - acc.witnessDeltaTotal);
    const witnessStability = Math.max(0, Math.min(10, 3 + acc.witnessDeltaTotal));
    const witnessDepth = Math.max(0, Math.min(10, 2 + acc.witnessDeltaTotal));

    const sortedPaths = Object.entries(acc.pathScores).sort(([, a], [, b]) => b - a).slice(0, 2).map(([k]) => k);
    const primaryPath = sortedPaths[0] || "dhyana";
    const secondaryPath = sortedPaths[1] || "bhakti";

    const sortedArchetypes = Object.entries(acc.archetypeScores).sort(([, a], [, b]) => b - a).slice(0, 2).map(([k]) => k);
    const archetypePrimary = sortedArchetypes[0] || "seeker";
    const archetypeShadow = sortedArchetypes[1] || "warrior";

    const sortedBrains = Object.entries(acc.brainScores).sort(([, a], [, b]) => b - a);
    const dominantBrain = sortedBrains[0]?.[0] || "head";

    const sortedAttachment = Object.entries(acc.attachmentScores).sort(([, a], [, b]) => b - a);
    const attachmentStyle = sortedAttachment[0]?.[0] || "mixed";

    const sortedBeliefs = Object.entries(acc.beliefScores).sort(([, a], [, b]) => b - a);
    const beliefLevel = sortedBeliefs[0]?.[0] || "mixed";

    const sortedCircadian = Object.entries(acc.circadianScores).sort(([, a], [, b]) => b - a);
    const circadianPeak = sortedCircadian[0]?.[0] || "evening";

    const hCapacities: Record<string, number> = {};
    for (const [k, total] of Object.entries(acc.hCapacityTotals)) {
      hCapacities[k] = Math.round(Math.max(0, Math.min(10, total)));
    }

    const metrics = {
      overallBand: Math.round(overallBand * 10) / 10,
      dimensionBands,
      vLevelBaseline: Math.round(vLevelBaseline * 10) / 10,
      vLevelCurrent: Math.round(vLevelCurrent * 10) / 10,
      vLevelDelta: Math.round((vLevelCurrent - vLevelBaseline) * 10) / 10,
      integrationScore: Math.round(integrationScore * 10) / 10,
      witnessGap: Math.round(witnessGap * 10) / 10,
      witnessStability: Math.round(witnessStability * 10) / 10,
      witnessDepth: Math.round(witnessDepth * 10) / 10,
      dominantBrain,
      pathScores: acc.pathScores,
      primaryPath,
      secondaryPath,
      archetypePrimary,
      archetypeShadow,
      topLoops: [...new Set(acc.loopFamilies)].slice(0, 5),
      loopFamilies: [...new Set(acc.loopFamilies)],
      beliefLevel,
      attachmentStyle,
      circadianPeak,
      emotionMaturity: Math.round(Math.max(0, Math.min(10, 5 + acc.emotionDeltaTotal)) * 10) / 10,
      somaticAwareness: Math.round(Math.max(0, Math.min(10, 5 + acc.somaticDeltaTotal)) * 10) / 10,
      purposeClarity: Math.round(Math.max(0, Math.min(10, 5 + acc.purposeClarityTotal)) * 10) / 10,
      criticVolume: Math.round(Math.max(0, Math.min(10, acc.criticVolumeRaw || acc.criticVolumeTotal)) * 10) / 10,
      shadowOwned: Math.round(Math.max(0, Math.min(10, acc.shadowOwned)) * 10) / 10,
      chittaVritti: Math.round(Math.max(0, Math.min(10, acc.chittaVrittiTotal)) * 10) / 10,
      appRelationship: acc.appRelationship || "new",
      hCapacities,
    };

    return new Response(
      JSON.stringify({ metrics }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function accumulateTag(acc: ScoreAccumulator, tag: any): void {
  if (tag.band !== undefined) { acc.bandTotal += tag.band; acc.bandCount++; }
  if (tag.vLevelDelta !== undefined) acc.vLevelDeltaTotal += tag.vLevelDelta;
  if (tag.dimension) {
    for (const [k, v] of Object.entries(tag.dimension)) {
      acc.dimensionTotals[k] = (acc.dimensionTotals[k] || 0) + v;
      acc.dimensionCounts[k] = (acc.dimensionCounts[k] || 0) + 1;
    }
  }
  if (tag.brain) acc.brainScores[tag.brain] = (acc.brainScores[tag.brain] || 0) + 1;
  if (tag.paths) {
    for (const [k, v] of Object.entries(tag.paths)) acc.pathScores[k] = (acc.pathScores[k] || 0) + v;
  }
  if (tag.archetype) acc.archetypeScores[tag.archetype] = (acc.archetypeScores[tag.archetype] || 0) + 1;
  if (tag.loops) { acc.loopFamilies.push(...tag.loops); }
  if (tag.integrationDelta !== undefined) acc.integrationDeltaTotal += tag.integrationDelta;
  if (tag.witnessDelta !== undefined) acc.witnessDeltaTotal += tag.witnessDelta;
  if (tag.emotionDelta !== undefined) acc.emotionDeltaTotal += tag.emotionDelta;
  if (tag.somaticDelta !== undefined) acc.somaticDeltaTotal += tag.somaticDelta;
  if (tag.purposeClarity !== undefined) acc.purposeClarityTotal += tag.purposeClarity;
  if (tag.criticVolume !== undefined) { acc.criticVolumeTotal += tag.criticVolume; acc.criticVolumeRaw += tag.criticVolume; }
  if (tag.shadowProjection !== undefined) acc.shadowProjectionTotal += tag.shadowProjection;
  if (tag.chittaVritti !== undefined) acc.chittaVrittiTotal += tag.chittaVritti;
  if (tag.circadian) acc.circadianScores[tag.circadian] = (acc.circadianScores[tag.circadian] || 0) + 1;
  if (tag.belief) acc.beliefScores[tag.belief] = (acc.beliefScores[tag.belief] || 0) + 1;
  if (tag.attachment) acc.attachmentScores[tag.attachment] = (acc.attachmentScores[tag.attachment] || 0) + 1;
  if (tag.appRelationship) acc.appRelationship = tag.appRelationship;
  if (tag.hCapacity) {
    for (const [k, v] of Object.entries(tag.hCapacity)) acc.hCapacityTotals[k] = (acc.hCapacityTotals[k] || 0) + v;
  }
}
