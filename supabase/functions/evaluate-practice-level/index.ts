const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
import { createClient } from "npm:@supabase/supabase-js@2";

/*
  EVALUATE-PRACTICE-LEVEL — Quality-based level-up engine
  
  Fast track:   5 sessions @ 0.8+ quality → level up
  Normal track:  8 sessions @ 0.6+ quality → level up
  Slow track:   15 sessions @ 0.4+ quality → level up
  Mastered:      0.8+ avg with 5+ sessions → skip to +2
  
  Also handles:
  - Regression (level drops OK, session credits kept)
  - Adaptive difficulty micro-adjustments
  - Speed profile auto-detection
  - Anti-guilt system
*/

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const body = await req.json();
    const { practice, qualityScore, sessionDuration } = body;

    if (!practice) throw new Error("practice is required");
    const quality = typeof qualityScore === "number" ? qualityScore : 0.5;

    // Fetch current state. NOTE: practice_sessions_v2 was unified into `sessions`
    // (Phase 3 Wave 2). v2-specific fields now live in sessions.type_payload (JSONB).
    const [levelRowRes, speedRes, sessionsRowsRes, profileRes] = await Promise.all([
      supabase.from("user_practice_levels").select("*").eq("user_id", user.id).eq("practice_type", practice).maybeSingle(),
      supabase.from("user_speed_profile").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("sessions").select("type_payload,created_at").eq("user_id", user.id).eq("type", "practice").eq("type_payload->>practice_type", practice).order("created_at", { ascending: false }).limit(15),
      supabase.from("user_consciousness_profile").select("overall_band,streak_current").eq("user_id", user.id).maybeSingle(),
    ]);

    const currentLevel = levelRowRes.data?.current_level || 0;
    const sessionsAtLevelStored = levelRowRes.data?.sessions_at_level || 0;
    // Flatten type_payload back to legacy shape for downstream logic
    const recentSessions = (sessionsRowsRes.data || []).map((r: any) => ({
      ...(r.type_payload || {}),
      created_at: r.created_at,
    }));
    const streak = profileRes.data?.streak_current || 0;

    // Record this session (write to unified sessions table)
    await supabase.from("sessions").insert({
      user_id: user.id,
      type: "practice",
      status: "completed",
      session_date: new Date().toISOString().slice(0, 10),
      type_payload: {
        practice_type: practice,
        level: currentLevel,
        quality_score: quality,
        duration_seconds: sessionDuration || 0,
      },
    });

    // Calculate recent quality average (last 5)
    const last5 = [quality, ...recentSessions.slice(0, 4).map((s: any) => s.quality_score || 0.5)];
    const avgQuality = last5.reduce((a: number, b: number) => a + b, 0) / last5.length;

    // Count sessions at current level
    const sessionsAtLevel = recentSessions.filter((s: any) => s.level === currentLevel).length + 1;

    // Calculate consistency
    const consistency = Math.min(streak, 7);

    // Level-up logic
    let newLevel = currentLevel;
    let levelUpReason = "";
    let difficultyAdjustment: "harder" | "gentler" | "stabilize" | "none" = "none";

    // Check for mastery skip (+2)
    if (avgQuality >= 0.8 && sessionsAtLevel >= 5 && consistency >= 5) {
      newLevel = currentLevel + 2;
      levelUpReason = "Mastered! Skipping to advanced level.";
    }
    // Fast track
    else if (avgQuality >= 0.8 && consistency >= 5 && sessionsAtLevel >= 5) {
      newLevel = currentLevel + 1;
      levelUpReason = "Ready for the next level. Keep going.";
    }
    // Normal track
    else if (avgQuality >= 0.6 && consistency >= 3 && sessionsAtLevel >= 8) {
      newLevel = currentLevel + 1;
      levelUpReason = "Good progress. Take your time.";
    }
    // Slow track
    else if (avgQuality >= 0.4 && consistency >= 1 && sessionsAtLevel >= 15) {
      newLevel = currentLevel + 1;
      levelUpReason = "You've been so consistent. Ready for the next step.";
    }
    // Struggling — suggest alternative
    else if (avgQuality < 0.3 && sessionsAtLevel >= 3) {
      levelUpReason = "";
      difficultyAdjustment = "gentler";
    }

    // Adaptive difficulty micro-adjustments
    const last3Qualities = last5.slice(0, 3);
    if (last3Qualities.every((q: number) => q >= 0.8)) {
      difficultyAdjustment = "harder";
    } else if (last3Qualities.every((q: number) => q <= 0.3)) {
      difficultyAdjustment = "gentler";
    } else {
      const maxQ = Math.max(...last3Qualities);
      const minQ = Math.min(...last3Qualities);
      if (maxQ - minQ > 0.5) {
        difficultyAdjustment = "stabilize";
      }
    }

    // Update level row (row-per-practice pattern)
    await supabase.from("user_practice_levels").upsert({
      user_id: user.id,
      practice_type: practice,
      current_level: newLevel,
      sessions_at_level: newLevel !== currentLevel ? 0 : sessionsAtLevel,
      total_sessions: (levelRowRes.data?.total_sessions || 0) + 1,
      last_level_up_at: newLevel !== currentLevel ? new Date().toISOString() : (levelRowRes.data?.last_level_up_at || null),
    }, { onConflict: "user_id,practice_type" });

    // Auto-detect speed profile
    const speedType = detectSpeedType(sessionsAtLevel, avgQuality, consistency, newLevel > currentLevel);
    
    await supabase.from("user_speed_profile").upsert({
      user_id: user.id,
      speed_type: speedType,
      auto_detected: true,
      avg_quality: avgQuality,
      avg_consistency: consistency / 7,
      quality_trend: avgQuality > 0.6 ? "improving" : avgQuality < 0.4 ? "declining" : "stable",
      detection_reason: `Based on ${sessionsAtLevel} sessions, avg quality ${avgQuality.toFixed(2)}`,
      last_detected_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    // Anti-guilt response
    const antiGuiltyMessage = getAntiGuiltMessage(avgQuality, sessionsAtLevel, speedType);

    return new Response(JSON.stringify({
      practice,
      previousLevel: currentLevel,
      newLevel,
      leveledUp: newLevel > currentLevel,
      levelUpReason,
      avgQuality: Number(avgQuality.toFixed(2)),
      sessionsAtLevel,
      difficultyAdjustment,
      speedType,
      antiGuiltMessage: antiGuiltyMessage,
      encouragement: getEncouragement(speedType, avgQuality, newLevel),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function detectSpeedType(sessions: number, quality: number, consistency: number, leveledUp: boolean): string {
  if (quality >= 0.8 && consistency >= 5 && leveledUp && sessions <= 7) return "fast";
  if (quality < 0.4 || consistency < 2) return "deep";
  return "steady";
}

function getAntiGuiltMessage(quality: number, sessions: number, speed: string): string {
  if (speed === "deep") {
    return "Your pace is perfect for YOU. Depth matters more than speed.";
  }
  if (quality < 0.3) {
    return "Some days are harder. That's part of the journey. You showed up — that matters.";
  }
  return "You're exactly where you need to be.";
}

function getEncouragement(speed: string, quality: number, level: number): string {
  if (speed === "fast" && level > 3) return "You're progressing beautifully. Remember: feel it, don't just understand it.";
  if (speed === "deep") return "No rush. This is your pace. It's perfect.";
  if (quality >= 0.7) return "Beautiful practice. The depth is showing.";
  return "Good progress. Take your time.";
}
