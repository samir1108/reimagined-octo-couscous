const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
import { createClient } from "npm:@supabase/supabase-js@2";

/*
  ASSESS-STARTING-LEVELS — Parse onboarding assessment → detect actual starting levels
  
  NOT L0 for everyone — experienced practitioners start higher.
  
  Detection functions per practice:
  - detectObservationLevel()
  - detectSelfInquiryLevel()
  - detectBreathLevel()
  - detectBhaktiLevel()
  - detectKarmaLevel()
  - detectWitnessingLevel()
  - detectBodyLevel()
  
  Also detects:
  - Brain dominance (head/heart/gut)
  - Anchor path (strongest) + Growth path (weakest)
  - Life stage
  - Speed profile initial guess
  - 30-day calibration cap (band capped at 1.0)
*/

interface AssessmentData {
  answers: Record<string, any>;
  band?: number;
  dimensionBands?: Record<string, number>;
  spiritualDna?: Record<string, any>;
  [key: string]: any;
}

function detectObservationLevel(answers: Record<string, any>): number {
  const thoughtWatch = answers.thought_watching || answers.reaction_test || "";
  const tw = typeof thoughtWatch === "string" ? thoughtWatch.toLowerCase() : "";
  
  if (tw.includes("natural") || tw.includes("always") || tw.includes("effortless")) return 4;
  if (tw.includes("often") || tw.includes("sometimes notice")) return 3;
  if (tw.includes("tried") || tw.includes("occasionally")) return 2;
  if (tw.includes("curious") || tw.includes("want to learn")) return 1;
  return 0;
}

function detectSelfInquiryLevel(answers: Record<string, any>): number {
  const inquiry = answers.self_inquiry || answers.nature_of_thought || "";
  const si = typeof inquiry === "string" ? inquiry.toLowerCase() : "";
  
  if (si.includes("who am i") || si.includes("witness") || si.includes("no thinker")) return 4;
  if (si.includes("question") || si.includes("investigate")) return 3;
  if (si.includes("wonder") || si.includes("reflect")) return 2;
  if (si.includes("think about") || si.includes("curious")) return 1;
  return 0;
}

function detectBreathLevel(answers: Record<string, any>): number {
  const breath = answers.breath_practice || answers.pranayama || "";
  const b = typeof breath === "string" ? breath.toLowerCase() : "";
  
  if (b.includes("pranayama") || b.includes("advanced") || b.includes("retention")) return 4;
  if (b.includes("regular") || b.includes("daily")) return 3;
  if (b.includes("sometimes") || b.includes("tried")) return 2;
  if (b.includes("aware") || b.includes("notice")) return 1;
  return 0;
}

function detectBhaktiLevel(answers: Record<string, any>): number {
  const devotion = answers.devotion || answers.source_of_happiness || answers.bhakti || "";
  const d = typeof devotion === "string" ? devotion.toLowerCase() : "";
  
  if (d.includes("surrender") || d.includes("divine") || d.includes("devotion daily")) return 4;
  if (d.includes("chant") || d.includes("pray") || d.includes("grateful")) return 3;
  if (d.includes("faith") || d.includes("spiritual")) return 2;
  if (d.includes("open") || d.includes("curious about")) return 1;
  return 0;
}

function detectKarmaLevel(answers: Record<string, any>): number {
  const service = answers.service || answers.karma || answers.relationship || "";
  const k = typeof service === "string" ? service.toLowerCase() : "";
  
  if (k.includes("selfless") || k.includes("no attachment") || k.includes("service")) return 4;
  if (k.includes("volunteer") || k.includes("help others")) return 3;
  if (k.includes("try to be kind") || k.includes("mindful")) return 2;
  if (k.includes("want to help") || k.includes("care")) return 1;
  return 0;
}

function detectWitnessingLevel(answers: Record<string, any>): number {
  const witness = answers.witnessing || answers.thought_band || "";
  const w = typeof witness === "string" ? witness.toLowerCase() : "";
  
  if (w.includes("witness") || w.includes("observer") || w.includes("detached")) return 4;
  if (w.includes("step back") || w.includes("notice space")) return 3;
  if (w.includes("sometimes see") || w.includes("gap")) return 2;
  if (w.includes("aware of thoughts")) return 1;
  return 0;
}

function detectBodyLevel(answers: Record<string, any>): number {
  const body = answers.body_awareness || answers.somatic || "";
  const b = typeof body === "string" ? body.toLowerCase() : "";
  
  if (b.includes("subtle energy") || b.includes("chakra") || b.includes("nadis")) return 4;
  if (b.includes("scan") || b.includes("sensation") || b.includes("yoga")) return 3;
  if (b.includes("exercise") || b.includes("stretching")) return 2;
  if (b.includes("notice body") || b.includes("tension")) return 1;
  return 0;
}

function detectBrainDominance(answers: Record<string, any>): string {
  const decision = answers.decision_making || answers.big_decision || "";
  const d = typeof decision === "string" ? decision.toLowerCase() : "";
  
  if (d.includes("logic") || d.includes("analyze") || d.includes("think")) return "head";
  if (d.includes("feel") || d.includes("heart") || d.includes("emotion")) return "heart";
  if (d.includes("gut") || d.includes("instinct") || d.includes("sense")) return "gut";
  return "balanced";
}

function detectLifeStage(answers: Record<string, any>): string {
  const age = answers.age || 0;
  const context = answers.life_context || answers.goal || "";
  const c = typeof context === "string" ? context.toLowerCase() : "";
  
  if (c.includes("student") || c.includes("study") || c.includes("college") || (age > 0 && age < 23)) return "student";
  if (c.includes("parent") || c.includes("child") || c.includes("baby")) return "parent";
  if (c.includes("retire") || c.includes("grandchild") || (age > 0 && age > 60)) return "retiree";
  if (c.includes("elder") || (age > 0 && age > 75)) return "elder";
  if (c.includes("work") || c.includes("office") || c.includes("career")) return "professional";
  return "professional";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const body: AssessmentData = await req.json();
    const answers = body.answers || {};
    const assessedBand = Math.min(body.band || 0, 1.0); // 30-day calibration cap

    // Detect all practice levels
    const practiceLevels: Record<string, number> = {
      observation: detectObservationLevel(answers),
      self_inquiry: detectSelfInquiryLevel(answers),
      breath: detectBreathLevel(answers),
      witnessing: detectWitnessingLevel(answers),
      body: detectBodyLevel(answers),
      bhakti: detectBhaktiLevel(answers),
      karma: detectKarmaLevel(answers),
      jnana: Math.min(detectSelfInquiryLevel(answers), 3),
      raja: Math.min(detectBreathLevel(answers), 2),
      kriya: 0,
      tantra: 0,
      neuroscience: 0,
    };

    // Detect paths
    const pathPractices = ["bhakti", "karma", "jnana", "raja"];
    const pathEntries = pathPractices.map(p => ({ p, level: practiceLevels[p] || 0 }));
    pathEntries.sort((a, b) => b.level - a.level);
    
    const anchorPath = pathEntries[0]?.p || "observation";
    const growthPath = pathEntries[pathEntries.length - 1]?.p || "self_inquiry";

    const brainDominance = detectBrainDominance(answers);
    const lifeStage = detectLifeStage(answers);

    // Initial speed profile guess
    const avgLevel = Object.values(practiceLevels).reduce((a, b) => a + b, 0) / Object.values(practiceLevels).length;
    const initialSpeed = avgLevel >= 3 ? "fast" : avgLevel >= 1 ? "steady" : "deep";

    // Save all data in parallel — row-per-practice for user_practice_levels
    const practiceUpserts = Object.entries(practiceLevels).map(([practice, level]) =>
      supabase.from("user_practice_levels").upsert({
        user_id: user.id,
        practice_type: practice,
        current_level: level,
        sessions_at_level: 0,
        total_sessions: 0,
      }, { onConflict: "user_id,practice_type" })
    );

    await Promise.all([
      ...practiceUpserts,

      supabase.from("user_spiritual_dna").upsert({
        user_id: user.id,
        anchor_path: anchorPath,
        growth_path: growthPath,
        brain_dominance: brainDominance,
        life_stage: lifeStage,
        identity_band: assessedBand,
        identity_band_name: getBandName(assessedBand),
        lifetime_phase: "awakening",
        lifetime_phase_day: 1,
      }, { onConflict: "user_id" }),

      supabase.from("user_speed_profile").upsert({
        user_id: user.id,
        speed_type: initialSpeed,
        auto_detected: false,
        detection_reason: `Initial assessment: avg level ${avgLevel.toFixed(1)}`,
      }, { onConflict: "user_id" }),

      // Initialize life domains
      ...["relationship", "work", "finance", "health", "creativity", "spirituality"].map(domain =>
        supabase.from("life_domain_scores").upsert({
          user_id: user.id,
          domain,
          score: 5.0,
          trend: "stable",
        }, { onConflict: "user_id,domain" })
      ),

      // Initialize curiosity queue
      supabase.from("curiosity_queue").upsert({
        user_id: user.id,
      }, { onConflict: "user_id" }),
    ]);

    return new Response(JSON.stringify({
      practiceLevels,
      anchorPath,
      growthPath,
      brainDominance,
      lifeStage,
      initialSpeed,
      assessedBand,
      calibrationCap: 1.0,
      message: "Starting levels assessed. 30-day calibration begins.",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getBandName(band: number): string {
  if (band < 0.5) return "Unconscious Conditioning";
  if (band < 1) return "First Stirring";
  if (band < 1.5) return "Observer Awakening";
  if (band < 2) return "Pattern Recognition";
  if (band < 3) return "Witness Emerging";
  if (band < 4) return "Flow State";
  if (band < 5) return "Channel";
  if (band < 6) return "Integration";
  if (band < 7) return "Mastery";
  if (band < 8) return "Transcendence";
  return "Unity";
}
