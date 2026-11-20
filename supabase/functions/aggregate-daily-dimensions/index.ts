import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * aggregate-daily-dimensions
 * 
 * Called at end of day (or after evening session) to roll up all consciousness_signals
 * into a single daily_dimension_summary row. This captures:
 * - Average thought/emotion/body/awareness scores from all signals that day
 * - Signal count and confidence
 * - Whether this was a calibration day
 * 
 * If no signals exist for the day, the summary uses the current profile dimensions
 * (no change = freeze previous state).
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, supabaseKey);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];

    // Fetch all consciousness signals from today
    const { data: signals } = await admin
      .from("consciousness_signals")
      .select("dimension_updates, confidence")
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`);

    // Fetch current profile dimensions as fallback
    const { data: profile } = await admin
      .from("user_consciousness_profile")
      .select("dimension_bands")
      .eq("user_id", user.id)
      .maybeSingle();

    const profileDims = profile?.dimension_bands || {};
    const signalCount = signals?.length || 0;

    let thought = Number(profileDims.thought ?? 0);
    let emotion = Number(profileDims.emotion ?? 0);
    let body = Number(profileDims.body ?? 0);
    let awareness = Number(profileDims.awareness ?? 0);
    let confidenceSum = 0;

    if (signalCount > 0) {
      // Aggregate dimension updates from signals
      let tSum = 0, eSum = 0, bSum = 0, aSum = 0;
      let dimCount = 0;

      for (const sig of signals!) {
        const dims = sig.dimension_updates || {};
        if (dims.thought !== undefined || dims.emotion !== undefined || dims.body !== undefined || dims.awareness !== undefined) {
          tSum += Number(dims.thought ?? profileDims.thought ?? 0);
          eSum += Number(dims.emotion ?? profileDims.emotion ?? 0);
          bSum += Number(dims.body ?? profileDims.body ?? 0);
          aSum += Number(dims.awareness ?? profileDims.awareness ?? 0);
          dimCount++;
        }
        confidenceSum += Number(sig.confidence || 0);
      }

      if (dimCount > 0) {
        thought = Math.round((tSum / dimCount) * 100) / 100;
        emotion = Math.round((eSum / dimCount) * 100) / 100;
        body = Math.round((bSum / dimCount) * 100) / 100;
        awareness = Math.round((aSum / dimCount) * 100) / 100;
      }
    }

    const confidenceAvg = signalCount > 0 ? Math.round((confidenceSum / signalCount) * 100) / 100 : 0;

    // Check if this is calibration day
    const { data: existing } = await admin
      .from("daily_dimension_summary")
      .select("is_calibration_day, calibration_data")
      .eq("user_id", user.id)
      .eq("summary_date", today)
      .maybeSingle();

    const isCalibration = existing?.is_calibration_day || false;

    // Upsert the daily summary
    const { data: summary, error: upsertErr } = await admin
      .from("daily_dimension_summary")
      .upsert({
        user_id: user.id,
        summary_date: today,
        thought_score: thought,
        emotion_score: emotion,
        body_score: body,
        awareness_score: awareness,
        signal_count: signalCount,
        confidence_avg: confidenceAvg,
        is_calibration_day: isCalibration,
        calibration_data: isCalibration
          ? { ...((existing?.calibration_data as any) || {}), signals_collected: signalCount, aggregated_at: new Date().toISOString() }
          : (existing?.calibration_data || {}),
      }, { onConflict: "user_id,summary_date" })
      .select()
      .single();

    if (upsertErr) {
      console.error("aggregate-daily-dimensions: upsert error:", upsertErr.message);
      return new Response(JSON.stringify({ error: upsertErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`aggregate-daily-dimensions: ${today} — signals=${signalCount}, T=${thought}, E=${emotion}, B=${body}, A=${awareness}`);

    return new Response(JSON.stringify({
      summary,
      signalCount,
      dimensions: { thought, emotion, body, awareness },
      isCalibrationDay: isCalibration,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("aggregate-daily-dimensions error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
