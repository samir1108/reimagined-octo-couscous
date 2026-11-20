const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
import { createClient } from "npm:@supabase/supabase-js@2";

/*
  ACTIVATE-SPECIALTY — Condition-based practice unlocking
  
  Kriya:        Raja L4+ AND Body L3+
  Tantra:       Band 3+ AND Jnana L3+
  Neuroscience: Head-dominant brain type (unlocked early)
  Emotional Healing: Observation L2+
  Loop Dissolution:  Witnessing L3+ AND Self-Inquiry L2+
*/

const SPECIALTY_CONDITIONS: Record<string, {
  requires: Record<string, number>;
  band_min?: number;
  brain_type?: string;
  description: string;
}> = {
  kriya: {
    requires: { raja: 4, body: 3 },
    description: "Advanced energy practices — requires Raja L4+ and Body L3+",
  },
  tantra: {
    requires: { jnana: 3 },
    band_min: 3,
    description: "Integrated awareness practices — requires Band 3+ and Jnana L3+",
  },
  neuroscience: {
    requires: {},
    brain_type: "head",
    description: "Brain-based awareness techniques — unlocked for analytical minds",
  },
  emotional_healing: {
    requires: { observation: 2 },
    description: "Deep emotional processing — requires Observation L2+",
  },
  loop_dissolution: {
    requires: { witnessing: 3, self_inquiry: 2 },
    description: "Pattern breaking practices — requires Witnessing L3+ and Self-Inquiry L2+",
  },
  relationship: {
    requires: {},
    description: "Conscious relating practices — available on demand",
  },
  work_career: {
    requires: {},
    description: "Dharma-aligned work practices — available on demand",
  },
  finance: {
    requires: {},
    description: "Conscious money practices — available on demand",
  },
  health: {
    requires: {},
    description: "Body-listening health practices — available on demand",
  },
};

/** Convert row-per-practice table data into a flat levels object */
function buildLevelsFromRows(rows: any[]): Record<string, number> {
   const defaults: Record<string, number> = {
     observation: 0, self_inquiry: 0, breath: 0, witnessing: 0, body: 0,
     bhakti: 0, karma: 0, jnana: 0, raja: 0, kriya: 0, tantra: 0, neuroscience: 0,
     emotional_healing: 0, loop_dissolution: 0, relationship: 0, work_career: 0, finance: 0, health: 0,
   };
  for (const row of rows) {
    if (row.practice_type && row.practice_type in defaults) {
      defaults[row.practice_type] = row.current_level || 0;
    }
  }
  return defaults;
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

    // Fetch user data
    const [levelsRes, profileRes, dnaRes, existingRes] = await Promise.all([
      supabase.from("user_practice_levels").select("*").eq("user_id", user.id),
      supabase.from("user_consciousness_profile").select("overall_band").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_spiritual_dna").select("brain_dominance").eq("user_id", user.id).maybeSingle(),
      supabase.from("specialty_activations").select("*").eq("user_id", user.id),
    ]);

    const levels = buildLevelsFromRows(levelsRes.data || []);
    const band = profileRes.data?.overall_band || 0;
    const brainType = dnaRes.data?.brain_dominance || "balanced";
    const existing = existingRes.data || [];

    const results: any[] = [];

    for (const [specialty, conditions] of Object.entries(SPECIALTY_CONDITIONS)) {
      const conditionsMet: string[] = [];
      const conditionsRequired: string[] = [];
      let allMet = true;

      // Check practice level requirements
      for (const [practice, minLevel] of Object.entries(conditions.requires)) {
        const requirement = `${practice} L${minLevel}+`;
        conditionsRequired.push(requirement);
        if ((levels[practice] || 0) >= minLevel) {
          conditionsMet.push(requirement);
        } else {
          allMet = false;
        }
      }

      // Check band requirement
      if (conditions.band_min !== undefined) {
        const requirement = `Band ${conditions.band_min}+`;
        conditionsRequired.push(requirement);
        if (band >= conditions.band_min) {
          conditionsMet.push(requirement);
        } else {
          allMet = false;
        }
      }

      // Check brain type requirement
      if (conditions.brain_type) {
        const requirement = `Brain type: ${conditions.brain_type}`;
        conditionsRequired.push(requirement);
        if (brainType === conditions.brain_type || brainType === "balanced") {
          conditionsMet.push(requirement);
        } else {
          allMet = false;
        }
      }

      const existingActivation = existing.find((e: any) => e.practice_type === specialty);
      const wasActive = existingActivation?.is_active || false;
      const shouldBeActive = allMet;

      // Upsert activation status
      await supabase.from("specialty_activations").upsert({
        user_id: user.id,
        practice_type: specialty,
        conditions_met: conditionsMet,
        conditions_required: conditionsRequired,
        is_active: shouldBeActive,
        activated_at: shouldBeActive && !wasActive ? new Date().toISOString() : (existingActivation?.activated_at || null),
        deactivated_at: !shouldBeActive && wasActive ? new Date().toISOString() : null,
      }, { onConflict: "user_id,practice_type" });

      results.push({
        specialty,
        description: conditions.description,
        isActive: shouldBeActive,
        justActivated: shouldBeActive && !wasActive,
        conditionsMet,
        conditionsRequired,
        progress: conditionsRequired.length > 0
          ? Number((conditionsMet.length / conditionsRequired.length).toFixed(2))
          : 1,
      });
    }

    return new Response(JSON.stringify({
      specialties: results,
      newlyActivated: results.filter(r => r.justActivated).map(r => r.specialty),
      totalActive: results.filter(r => r.isActive).length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
