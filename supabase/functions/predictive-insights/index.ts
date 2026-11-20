import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { computeChargedPaise } from "../_shared/ai-pricing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ═══════════════════════════════════════════
// PREDICTIVE INSIGHTS — Trend + Prediction Engine
// ═══════════════════════════════════════════

interface DimensionTrend {
  dimension: string;
  slope: number; // positive = improving, negative = declining
  current: number;
  previous: number;
  direction: "rising" | "falling" | "stable";
}

interface Prediction {
  type: "burnout_risk" | "breakthrough_proximity" | "dimension_imbalance" | "plateau_warning" | "streak_risk" | "positive_momentum";
  severity: "info" | "warning" | "critical" | "positive";
  title: string;
  description: string;
  confidence: number; // 0-1
}

function calculateSlope(values: number[]): number {
  if (values.length < 2) return 0;
  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((acc, y, x) => acc + x * y, 0);
  const sumX2 = values.reduce((acc, _, x) => acc + x * x, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

function generatePredictions(
  dimTrends: DimensionTrend[],
  sessionTrend: { slope: number; recentCount: number; totalDays: number },
  moodTrend: { slope: number; avgMood: number },
  streakData: { current: number; longest: number },
  profileState: string,
  journeyDay: number
): Prediction[] {
  const predictions: Prediction[] = [];

  // 1. Burnout Risk: declining engagement + declining dimensions
  const decliningDims = dimTrends.filter(d => d.slope < -0.05);
  if (sessionTrend.slope < -0.1 && decliningDims.length >= 2) {
    predictions.push({
      type: "burnout_risk",
      severity: "critical",
      title: "Burnout Risk Detected",
      description: `Your engagement and ${decliningDims.map(d => d.dimension).join(", ")} dimensions have been declining. Consider taking a conscious pause.`,
      confidence: Math.min(0.9, 0.5 + Math.abs(sessionTrend.slope) * 2),
    });
  }

  // 2. Breakthrough Proximity: rising witness + rising awareness
  const awarenessTrend = dimTrends.find(d => d.dimension === "awareness");
  const witnessRising = awarenessTrend && awarenessTrend.slope > 0.08;
  const risingDims = dimTrends.filter(d => d.slope > 0.05);
  if (witnessRising && risingDims.length >= 3) {
    predictions.push({
      type: "breakthrough_proximity",
      severity: "positive",
      title: "Breakthrough Approaching",
      description: "Multiple dimensions rising with strong awareness growth — you're approaching a significant shift.",
      confidence: Math.min(0.85, 0.4 + risingDims.length * 0.1 + (awarenessTrend?.slope || 0)),
    });
  }

  // 3. Dimension Imbalance
  if (dimTrends.length >= 3) {
    const slopes = dimTrends.map(d => d.slope);
    const maxSlope = Math.max(...slopes);
    const minSlope = Math.min(...slopes);
    if (maxSlope - minSlope > 0.2) {
      const fastest = dimTrends.find(d => d.slope === maxSlope);
      const slowest = dimTrends.find(d => d.slope === minSlope);
      predictions.push({
        type: "dimension_imbalance",
        severity: "warning",
        title: "Dimension Imbalance",
        description: `${fastest?.dimension || "One dimension"} is growing much faster than ${slowest?.dimension || "others"}. Balance your practice across all dimensions.`,
        confidence: 0.7,
      });
    }
  }

  // 4. Plateau Warning
  const allStable = dimTrends.every(d => Math.abs(d.slope) < 0.02);
  if (allStable && journeyDay > 14) {
    predictions.push({
      type: "plateau_warning",
      severity: "warning",
      title: "Plateau Detected",
      description: "No significant movement across dimensions. Try deepening your practice or exploring a new dimension.",
      confidence: 0.65,
    });
  }

  // 5. Streak Risk
  if (streakData.current > 3 && sessionTrend.slope < -0.05) {
    predictions.push({
      type: "streak_risk",
      severity: "warning",
      title: "Streak at Risk",
      description: `Your ${streakData.current}-day streak may be at risk — engagement is declining. A short session today can keep momentum.`,
      confidence: 0.6,
    });
  }

  // 6. Positive Momentum
  if (risingDims.length >= 2 && sessionTrend.slope >= 0 && moodTrend.slope > 0) {
    predictions.push({
      type: "positive_momentum",
      severity: "positive",
      title: "Strong Momentum",
      description: "Your practice is bearing fruit — dimensions rising, mood improving. Keep this rhythm.",
      confidence: 0.75,
    });
  }

  return predictions.sort((a, b) => b.confidence - a.confidence);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: claimsError } = await supabase.auth.getUser();
    if (claimsError || !user) {
      console.error("predictive-insights: auth error", claimsError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

    // ─── Atomic Credit Pre-Check ───
    const serviceAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: creditCheck } = await serviceAdmin.rpc("check_credit_balance", { p_user_id: userId, p_min_balance: 50 });
    if (!creditCheck?.sufficient) {
      return new Response(JSON.stringify({ error: "insufficient_credits", message: "Not enough credits." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { days = 14 } = await req.json().catch(() => ({}));
    const daysNum = Math.min(Math.max(Number(days) || 14, 7), 90);
    const since = new Date(Date.now() - daysNum * 86400000).toISOString();

    // Fetch all data in parallel
    const [
      { data: signals },
      { data: sessions },
      { data: reflections },
      { data: profile },
      { data: journeyLogs },
    ] = await Promise.all([
      supabase.from("consciousness_signals").select("dimension_updates, created_at, confidence")
        .eq("user_id", userId).gte("created_at", since).order("created_at"),
      supabase.from("sessions").select("session_date, status, type")
        .eq("user_id", userId).gte("session_date", since.slice(0, 10)).order("session_date"),
      supabase.from("evening_reflections").select("mood, energy, reflection_date")
        .eq("user_id", userId).gte("reflection_date", since.slice(0, 10)).order("reflection_date"),
      supabase.from("user_consciousness_profile").select("*")
        .eq("user_id", userId).maybeSingle(),
      supabase.from("user_journey_log").select("day_number, engine_notes, log_date")
        .eq("user_id", userId).gte("log_date", since.slice(0, 10)).order("log_date"),
    ]);

    // === Dimension Trends ===
    const dimensionNames = ["thought", "emotion", "body", "awareness"];
    const dimTimeSeries: Record<string, number[]> = {};
    dimensionNames.forEach(d => dimTimeSeries[d] = []);

    (signals || []).forEach((s: any) => {
      const updates = s.dimension_updates || {};
      dimensionNames.forEach(dim => {
        if (typeof updates[dim] === "number") {
          dimTimeSeries[dim].push(updates[dim]);
        }
      });
    });

    // Also use profile current bands as latest data point
    const currentBands = (profile as any)?.dimension_bands || {};
    const dimTrends: DimensionTrend[] = dimensionNames.map(dim => {
      const series = dimTimeSeries[dim];
      const current = typeof currentBands[dim] === "number" ? currentBands[dim] : (series.length > 0 ? series[series.length - 1] : 0);
      const previous = series.length > 1 ? series[0] : current;
      const slope = calculateSlope(series.length > 0 ? series : [current]);
      return {
        dimension: dim,
        slope,
        current,
        previous,
        direction: slope > 0.03 ? "rising" : slope < -0.03 ? "falling" : "stable",
      };
    });

    // === Session Frequency Trend ===
    const sessionDates = (sessions || []).map((s: any) => s.session_date);
    const uniqueDays = new Set(sessionDates).size;
    // Simple: sessions per day over time windows
    const halfPoint = Math.floor((sessions || []).length / 2);
    const firstHalf = (sessions || []).slice(0, halfPoint).length;
    const secondHalf = (sessions || []).slice(halfPoint).length;
    const sessionSlope = halfPoint > 0 ? (secondHalf - firstHalf) / halfPoint : 0;
    const sessionTrend = { slope: sessionSlope, recentCount: uniqueDays, totalDays: daysNum };

    // === Mood/Energy Trend ===
    const moods = (reflections || []).filter((r: any) => r.mood != null).map((r: any) => r.mood);
    const moodSlope = calculateSlope(moods);
    const avgMood = moods.length > 0 ? moods.reduce((a: number, b: number) => a + b, 0) / moods.length : 0;
    const moodTrend = { slope: moodSlope, avgMood };

    const energies = (reflections || []).filter((r: any) => r.energy != null).map((r: any) => r.energy);
    const energySlope = calculateSlope(energies);
    const avgEnergy = energies.length > 0 ? energies.reduce((a: number, b: number) => a + b, 0) / energies.length : 0;

    // === Streak ===
    const streakData = {
      current: (profile as any)?.streak_current || 0,
      longest: (profile as any)?.streak_longest || 0,
    };

    const profileState = (profile as any)?.state || "normal";
    const journeyDay = (profile as any)?.journey_day || 1;

    // === Generate Predictions ===
    const predictions = generatePredictions(dimTrends, sessionTrend, moodTrend, streakData, profileState, journeyDay);

    // === AI Summary via ConsciousOS AI ===
    let aiSummary = "";

    if (true) {
      try {
        const summaryPrompt = `You are a consciousness journey advisor. Based on the following data for the last ${daysNum} days, write a 2-3 sentence natural language insight summary in second person ("you"). Be warm but honest.

Dimension trends: ${JSON.stringify(dimTrends)}
Session engagement: ${sessionTrend.recentCount} active days out of ${daysNum}
Mood trend: avg ${avgMood.toFixed(1)}/10, slope ${moodSlope > 0 ? "improving" : moodSlope < 0 ? "declining" : "stable"}
Energy trend: avg ${avgEnergy.toFixed(1)}/10, slope ${energySlope > 0 ? "improving" : energySlope < 0 ? "declining" : "stable"}
Streak: ${streakData.current} days current, ${streakData.longest} longest
Journey day: ${journeyDay}, state: ${profileState}
Predictions detected: ${predictions.map(p => p.type).join(", ") || "none"}

Write concisely, max 3 sentences. No bullet points. No greeting.`;

        const aiResp = await aiGatewayFetchWithLang(req, {
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: "You are a wise, compassionate consciousness journey advisor." },
              { role: "user", content: summaryPrompt },
            ],
          });

        if (aiResp.ok) {
          const aiData = await aiResp.json();
          aiSummary = aiData.choices?.[0]?.message?.content || "";

          // ─── Credit Deduction & Usage Logging ───
          const usage = aiData?.usage || {};
          const inputTokens = usage.prompt_tokens || 300;
          const outputTokens = usage.completion_tokens || 100;
          const totalTokens = inputTokens + outputTokens;
          const __billingModel = "tier:fast";
          const __charge = computeChargedPaise(__billingModel, inputTokens, outputTokens);

          const chargedPaise = __charge.chargedPaise;

          const inputCost = __charge.estimatedCostPaise; // legacy alias

          const outputCost = 0; // folded into estimatedCostPaise

          await serviceAdmin.rpc("check_and_deduct_credits", { p_user_id: userId, p_amount: chargedPaise, p_description: `Predictive insights (${totalTokens} tokens)` });
          await serviceAdmin.from("ai_usage_log").insert({
            user_id: userId, function_name: "predictive-insights", model: "llama-3.1-8b-instant",
            input_tokens: inputTokens, output_tokens: outputTokens, total_tokens: totalTokens,
            estimated_cost_paise: inputCost + outputCost, charged_paise: chargedPaise, status: "success",
          });
        } else if (aiResp.status === 429) {
          aiSummary = "Insight generation is temporarily unavailable. Please try again shortly.";
        } else if (aiResp.status === 402) {
          aiSummary = "AI credits exhausted. Add credits in workspace settings.";
        }
      } catch (e) {
        console.error("AI summary error:", e);
        aiSummary = "";
      }
    }

    // === Insert Prediction Notifications (deduplicated) ===
    if (predictions.length > 0) {
      try {
        const serviceSupabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // Fetch existing prediction notifications in last 24h
        const { data: existingNotifs } = await serviceSupabase
          .from("notifications")
          .select("metadata")
          .eq("user_id", userId)
          .eq("type", "prediction")
          .gte("created_at", last24h);

        const existingTypes = new Set(
          (existingNotifs || []).map((n: any) => (n.metadata as any)?.prediction_type)
        );

        const toInsert = predictions
          .filter((p) => !existingTypes.has(p.type))
          .map((p) => ({
            user_id: userId,
            type: "prediction",
            title: p.title,
            body: p.description,
            metadata: {
              prediction_type: p.type,
              severity: p.severity,
              confidence: p.confidence,
            },
          }));

        if (toInsert.length > 0) {
          await serviceSupabase.from("notifications").insert(toInsert);
        }
      } catch (notifErr) {
        console.error("Failed to insert prediction notifications:", notifErr);
      }
    }

    const result = {
      trends: {
        dimensions: dimTrends,
        sessions: sessionTrend,
        mood: moodTrend,
        energy: { slope: energySlope, avgEnergy },
      },
      predictions,
      aiSummary,
      meta: {
        daysAnalyzed: daysNum,
        signalsCount: (signals || []).length,
        sessionsCount: (sessions || []).length,
        reflectionsCount: (reflections || []).length,
        journeyDay,
        profileState,
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("predictive-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
