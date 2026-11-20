const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
import { createClient } from "npm:@supabase/supabase-js@2";

/*
  GET-NEXT-PRACTICE — Priority scoring engine
  
  Scoring formula:
    weakest core (+10), active loops (+8), growth path (+7), 
    domain stress (+6), anchor path (+5), cross-pollination (+4)
  
  Respects: 30/50/20 formula, T-shaped mastery, specialty activation gates
*/

const CORE_PRACTICES = ["observation", "self_inquiry", "breath", "witnessing", "body"];
const PATH_PRACTICES = ["bhakti", "karma", "jnana", "raja"];
const SPECIALTY_PRACTICES = ["kriya", "tantra", "neuroscience", "emotional_healing", "loop_dissolution", "relationship", "work_career", "finance", "health"];

// Dimension Impact Matrix 12×6
const DIMENSION_IMPACT: Record<string, Record<string, number>> = {
  observation:  { thought: 3, emotion: 1, body: 2, awareness: 4, action: 1, connection: 0 },
  self_inquiry: { thought: 4, emotion: 2, body: 0, awareness: 3, action: 0, connection: 1 },
  breath:       { thought: 1, emotion: 2, body: 4, awareness: 3, action: 0, connection: 0 },
  witnessing:   { thought: 2, emotion: 1, body: 1, awareness: 4, action: 0, connection: 0 },
  body:         { thought: 0, emotion: 2, body: 4, awareness: 2, action: 2, connection: 0 },
  bhakti:       { thought: 1, emotion: 4, body: 0, awareness: 2, action: 0, connection: 4 },
  karma:        { thought: 1, emotion: 1, body: 0, awareness: 2, action: 4, connection: 3 },
  jnana:        { thought: 4, emotion: 0, body: 0, awareness: 3, action: 0, connection: 1 },
  raja:         { thought: 2, emotion: 2, body: 3, awareness: 3, action: 1, connection: 0 },
  kriya:        { thought: 1, emotion: 1, body: 4, awareness: 2, action: 2, connection: 0 },
  tantra:       { thought: 2, emotion: 3, body: 3, awareness: 3, action: 1, connection: 2 },
  neuroscience: { thought: 4, emotion: 1, body: 2, awareness: 2, action: 1, connection: 0 },
  emotional_healing: { thought: 1, emotion: 4, body: 3, awareness: 2, action: 0, connection: 2 },
  loop_dissolution: { thought: 3, emotion: 2, body: 1, awareness: 4, action: 1, connection: 1 },
  relationship: { thought: 1, emotion: 3, body: 1, awareness: 2, action: 1, connection: 4 },
  work_career: { thought: 2, emotion: 1, body: 1, awareness: 2, action: 4, connection: 2 },
  finance: { thought: 3, emotion: 2, body: 0, awareness: 2, action: 3, connection: 1 },
  health: { thought: 1, emotion: 2, body: 4, awareness: 2, action: 2, connection: 1 },
};

// Cross-pollination map
const CROSS_POLLINATION_MAP: Record<string, string> = {
  observation: "bhakti",
  self_inquiry: "body",
  bhakti: "jnana",
  karma: "witnessing",
  breath: "self_inquiry",
  witnessing: "karma",
  jnana: "bhakti",
  body: "breath",
  raja: "observation",
};

interface PracticeLevels {
  observation: number; self_inquiry: number; breath: number; witnessing: number; body: number;
  bhakti: number; karma: number; jnana: number; raja: number;
  kriya: number; tantra: number; neuroscience: number;
  emotional_healing: number; loop_dissolution: number;
  relationship: number; work_career: number; finance: number; health: number;
}

/** Convert row-per-practice table data into a flat levels object */
function buildLevelsFromRows(rows: any[]): PracticeLevels {
   const defaults: PracticeLevels = {
     observation: 0, self_inquiry: 0, breath: 0, witnessing: 0, body: 0,
     bhakti: 0, karma: 0, jnana: 0, raja: 0, kriya: 0, tantra: 0, neuroscience: 0,
     emotional_healing: 0, loop_dissolution: 0, relationship: 0, work_career: 0, finance: 0, health: 0,
   };
  for (const row of rows) {
    if (row.practice_type && row.practice_type in defaults) {
      (defaults as any)[row.practice_type] = row.current_level || 0;
    }
  }
  return defaults;
}

function scorePractice(
  practice: string,
  levels: PracticeLevels,
  dna: any,
  loops: any[],
  domains: any[],
  dimBands: Record<string, number>,
  recentSessions: any[],
): number {
  let score = 0;
  const level = (levels as any)[practice] || 0;

  // 1. Weakest core bonus (+10 for lowest core practice)
  if (CORE_PRACTICES.includes(practice)) {
    const coreLevels = CORE_PRACTICES.map(p => (levels as any)[p] || 0);
    const minCore = Math.min(...coreLevels);
    if (level === minCore) score += 10;
  }

  // 2. Active loop relevance (+8)
  const loopPracticeMap: Record<string, string[]> = {
    anxiety: ["breath", "body", "witnessing"],
    anger: ["body", "observation", "karma"],
    grief: ["bhakti", "body", "breath"],
    digital_addiction: ["observation", "witnessing"],
    purpose: ["karma", "self_inquiry", "jnana"],
  };
  for (const loop of loops) {
    const loopId = loop.loop_id?.toLowerCase() || "";
    for (const [key, practices] of Object.entries(loopPracticeMap)) {
      if (loopId.includes(key) && practices.includes(practice)) {
        score += 8;
        break;
      }
    }
  }

  // 3. Growth path bonus (+7)
  if (practice === dna?.growth_path) score += 7;

  // 4. Domain stress bonus (+6)
  const stressedDomains = domains.filter((d: any) => d.trend === "declining" || d.score < 4);
  if (stressedDomains.length > 0) {
    const impact = DIMENSION_IMPACT[practice];
    if (impact && (impact.action > 2 || impact.connection > 2)) score += 6;
  }

  // 5. Anchor path bonus (+5)
  if (practice === dna?.anchor_path) score += 5;

  // 6. Cross-pollination bonus (+4) — if plateau detected
  const recentForPractice = recentSessions.filter((s: any) => s.practice_type === practice);
  const avgQuality = recentForPractice.length > 0
    ? recentForPractice.reduce((sum: number, s: any) => sum + (s.quality_score || 0.5), 0) / recentForPractice.length
    : 0.5;
  if (avgQuality < 0.4 && recentForPractice.length >= 5) {
    const crossTarget = CROSS_POLLINATION_MAP[practice];
    if (crossTarget) score += 4;
  }

  // 7. Weakest dimension targeting (+3)
  const impact = DIMENSION_IMPACT[practice];
  if (impact && dimBands) {
    const dimEntries = Object.entries(dimBands);
    if (dimEntries.length > 0) {
      const weakest = dimEntries.sort((a, b) => a[1] - b[1])[0];
      if (impact[weakest[0]] >= 3) score += 3;
    }
  }

  // 8. Recency penalty (-2 if done in last session)
  if (recentSessions.length > 0 && recentSessions[0]?.practice_type === practice) {
    score -= 2;
  }

  return score;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user } } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    ).auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const body = await req.json().catch(() => ({}));
    const timeSlot = body.timeSlot || "morning";
    const userChoice = body.userChoice || null;

    // Fetch all needed data in parallel.
    // Practice sessions now live in unified `sessions` table (type='practice', v2 fields in type_payload).
    const [levelsRes, dnaRes, loopsRes, domainsRes, sessionsRes, profileRes, specialtyRes] = await Promise.all([
      supabase.from("user_practice_levels").select("*").eq("user_id", user.id),
      supabase.from("user_spiritual_dna").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("active_loops").select("*").eq("user_id", user.id).eq("is_active", true),
      supabase.from("life_domain_scores").select("*").eq("user_id", user.id),
      supabase.from("sessions").select("type_payload,created_at").eq("user_id", user.id).eq("type", "practice").order("created_at", { ascending: false }).limit(20),
      supabase.from("user_consciousness_profile").select("dimension_bands,overall_band").eq("user_id", user.id).maybeSingle(),
      supabase.from("specialty_activations").select("*").eq("user_id", user.id).eq("is_active", true),
    ]);

    const levels = buildLevelsFromRows(levelsRes.data || []);
    const dna = dnaRes.data || {};
    const loops = loopsRes.data || [];
    const domains = domainsRes.data || [];
    // Flatten type_payload back to legacy shape for downstream scoring logic
    const recentSessions = (sessionsRes.data || []).map((r: any) => ({
      ...(r.type_payload || {}),
      created_at: r.created_at,
    }));
    const dimBands = (profileRes.data?.dimension_bands as Record<string, number>) || {};
    const band = profileRes.data?.overall_band || 0;
    const activeSpecialties = (specialtyRes.data || []).map((s: any) => s.practice_type);

    // Score all eligible practices
    const allPractices = [
      ...CORE_PRACTICES,
      ...PATH_PRACTICES.filter(p => p === dna.anchor_path || p === dna.growth_path),
      ...SPECIALTY_PRACTICES.filter(p => activeSpecialties.includes(p)),
    ];

    const scored = allPractices.map(practice => ({
      practice,
      score: scorePractice(practice, levels, dna, loops, domains, dimBands, recentSessions),
      level: (levels as any)[practice] || 0,
      isCore: CORE_PRACTICES.includes(practice),
      isPath: PATH_PRACTICES.includes(practice),
      isSpecialty: SPECIALTY_PRACTICES.includes(practice),
    }));

    scored.sort((a, b) => b.score - a.score);

    // Apply 30/50/20 formula
    const tasks: any[] = [];
    
    const topCore = scored.find(s => s.isCore);
    if (topCore) tasks.push({ ...topCore, allocation: "fixed" });

    const aiPicks = scored.filter(s => s.practice !== topCore?.practice).slice(0, 2);
    for (const pick of aiPicks) tasks.push({ ...pick, allocation: "ai_personalized" });

    if (userChoice) {
      tasks.push({
        practice: userChoice,
        score: 0,
        level: (levels as any)[userChoice] || 0,
        allocation: "user_choice",
      });
    }

    // Check for bypassing
    const bypassingCheck = checkBypassing(levels, band, dimBands);

    // Check for cross-pollination suggestion
    const plateauPractice = scored.find(s => {
      const recent = recentSessions.filter((r: any) => r.practice_type === s.practice);
      const avg = recent.length > 0 ? recent.reduce((sum: number, r: any) => sum + (r.quality_score || 0.5), 0) / recent.length : 0.5;
      return avg < 0.4 && recent.length >= 5;
    });

    let crossPollinationSuggestion = null;
    if (plateauPractice) {
      const target = CROSS_POLLINATION_MAP[plateauPractice.practice];
      if (target) {
        crossPollinationSuggestion = {
          from: plateauPractice.practice,
          to: target,
          reason: `Plateau detected in ${plateauPractice.practice}. Try ${target} to unlock new perspectives.`,
        };
      }
    }

    return new Response(JSON.stringify({
      tasks: tasks.slice(0, 4),
      allScored: scored.slice(0, 8),
      crossPollinationSuggestion,
      bypassingCheck,
      timeSlot,
      formula: "30/50/20",
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

function checkBypassing(levels: PracticeLevels, band: number, dimBands: Record<string, number>) {
  const warnings: string[] = [];

  const coreMin = Math.min(levels.observation, levels.self_inquiry, levels.breath, levels.witnessing, levels.body);
  const pathMax = Math.max(levels.bhakti, levels.karma, levels.jnana, levels.raja);
  if (pathMax > coreMin + 2) {
    warnings.push("Foundation gap: core practices need attention before advancing paths");
  }

  const thought = dimBands.thought || 0;
  const emotion = dimBands.emotion || 0;
  if (thought > emotion + 2) {
    warnings.push("Head-Heart imbalance: intellectualizing without feeling. More bhakti/body recommended.");
  }

  const skillLevel = (levels.observation + levels.self_inquiry + levels.witnessing) / 3;
  if (skillLevel > band + 2) {
    warnings.push("State-Skill gap: practice skill exceeds lived integration. Grounding recommended.");
  }

  return {
    isBypassing: warnings.length > 0,
    warnings,
    recommendation: warnings.length > 0 ? "grounding" : "continue",
  };
}
