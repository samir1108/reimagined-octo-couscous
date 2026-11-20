// compute-constellation: derives a user's 12-practice spiritual fingerprint
// from existing assessments, practice_effectiveness, life_domain_scores, and loops.
// Always returns 12 weights summing to ~1.0, never zero (min 0.01).

import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PRACTICES = [
  "observe", "inquiry", "bhakti", "witness", "karma", "breath",
  "body", "jnana", "raja", "tantra", "neuro", "kriya",
] as const;
type Practice = typeof PRACTICES[number];

const DEFAULT_STATUS: Record<Practice, "primary" | "secondary" | "dormant"> = {
  observe: "primary", inquiry: "secondary", bhakti: "secondary", witness: "secondary",
  karma: "secondary", breath: "secondary", body: "secondary",
  jnana: "dormant", raja: "dormant", tantra: "dormant", neuro: "dormant", kriya: "dormant",
};

// Map practice_effectiveness.practice strings → constellation practice
function mapEffectivenessToPractice(p: string): Practice | null {
  const s = p.toLowerCase();
  if (s.includes("observ") || s.includes("witness") && s.includes("notice")) return "observe";
  if (s.includes("inquiry") || s.includes("self-inq") || s.includes("who am i")) return "inquiry";
  if (s.includes("bhakti") || s.includes("devot") || s.includes("gratitude") || s.includes("chant")) return "bhakti";
  if (s.includes("witness") || s.includes("sakshi")) return "witness";
  if (s.includes("karma") || s.includes("service") || s.includes("seva")) return "karma";
  if (s.includes("breath") || s.includes("pranayama")) return "breath";
  if (s.includes("body") || s.includes("somatic") || s.includes("asana")) return "body";
  if (s.includes("jnana") || s.includes("knowledge") || s.includes("study")) return "jnana";
  if (s.includes("raja") || s.includes("disciplin") || s.includes("yama")) return "raja";
  if (s.includes("tantra") || s.includes("energy") || s.includes("embodi")) return "tantra";
  if (s.includes("neuro") || s.includes("brain") || s.includes("cogniti")) return "neuro";
  if (s.includes("kriya") || s.includes("purificat")) return "kriya";
  return null;
}

function normalizeWeights(raw: Record<Practice, number>): Record<Practice, number> {
  // Floor at 0.01 (Law: never zero), then normalize to sum 1.0
  const floored: Record<Practice, number> = { ...raw } as any;
  for (const p of PRACTICES) {
    floored[p] = Math.max(0.01, floored[p] || 0.01);
  }
  const sum = PRACTICES.reduce((s, p) => s + floored[p], 0);
  const normalized: Record<Practice, number> = {} as any;
  for (const p of PRACTICES) {
    normalized[p] = Math.round((floored[p] / sum) * 1000) / 1000;
  }
  return normalized;
}

function statusFromWeight(w: number): "primary" | "secondary" | "dormant" {
  if (w >= 0.15) return "primary";
  if (w >= 0.06) return "secondary";
  return "dormant";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    // Seed weights from defaults (Observation always-on spine)
    const weights: Record<Practice, number> = {
      observe: 0.20, inquiry: 0.10, bhakti: 0.10, witness: 0.08,
      karma: 0.08, breath: 0.08, body: 0.08,
      jnana: 0.05, raja: 0.05, tantra: 0.05, neuro: 0.04, kriya: 0.04,
    };
    const levels: Record<Practice, number> = {
      observe: 0, inquiry: 0, bhakti: 0, witness: 0, karma: 0, breath: 0,
      body: 0, jnana: 0, raja: 0, tantra: 0, neuro: 0, kriya: 0,
    };

    // 1. Pull practice_effectiveness — adjust weights + levels by what works
    const { data: effectiveness } = await supabase
      .from("practice_effectiveness")
      .select("practice, effectiveness_score, sessions_count, avg_quality")
      .eq("user_id", userId);

    if (effectiveness) {
      for (const row of effectiveness) {
        const p = mapEffectivenessToPractice(row.practice);
        if (!p) continue;
        const boost = (row.effectiveness_score || 0) * 0.15;
        weights[p] = (weights[p] || 0) + boost;
        // Level approximation: cap at 7
        const lvl = Math.min(7, Math.floor((row.sessions_count || 0) / 10));
        levels[p] = Math.max(levels[p], lvl);
      }
    }

    // 2. Pull life_domain_scores — domains with stress raise relevant practices
    const { data: domains } = await supabase
      .from("life_domain_scores")
      .select("domain, score, stressors")
      .eq("user_id", userId);

    if (domains) {
      for (const d of domains) {
        const stressed = (d.score || 0) < 5;
        if (!stressed) continue;
        const dom = (d.domain || "").toLowerCase();
        if (dom.includes("relation")) weights.bhakti += 0.04;
        if (dom.includes("work")) weights.karma += 0.04;
        if (dom.includes("health") || dom.includes("body")) weights.body += 0.04;
        if (dom.includes("self") || dom.includes("purpose")) weights.inquiry += 0.04;
        if (dom.includes("spirit")) weights.witness += 0.04;
      }
    }

    // 3. Active loops nudge specific practices (surrender, witness)
    const { data: loops } = await supabase
      .from("active_loops")
      .select("loop_id, severity")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (loops && loops.length > 0) {
      // Any active loop strengthens witness + observe (the meta-practices)
      weights.observe += 0.03;
      weights.witness += 0.02;
    }

    const normalized = normalizeWeights(weights);

    // Build status from final weights
    const statuses: Record<Practice, string> = {} as any;
    for (const p of PRACTICES) {
      statuses[p] = statusFromWeight(normalized[p]);
    }
    // Always ensure observe stays at least secondary (Law 1: spine)
    if (statuses.observe === "dormant") statuses.observe = "secondary";

    // Determine phase: count primary practices
    const primaryCount = PRACTICES.filter((p) => statuses[p] === "primary").length;
    const phase =
      (effectiveness?.length || 0) < 5 ? "diverge"
      : primaryCount <= 3 ? "t-shape"
      : primaryCount <= 5 ? "breathe"
      : "integrate";

    // Build row
    const row: Record<string, unknown> = {
      user_id: userId,
      phase,
      computation_source: "auto",
      computed_at: new Date().toISOString(),
    };
    for (const p of PRACTICES) {
      row[`${p}_weight`] = normalized[p];
      row[`${p}_level`] = levels[p];
      row[`${p}_status`] = statuses[p];
    }

    const { error: upsertErr } = await supabase
      .from("user_practice_constellation")
      .upsert(row, { onConflict: "user_id" });

    if (upsertErr) throw upsertErr;

    // Snapshot history
    await supabase.from("user_practice_constellation_history").insert({
      user_id: userId,
      snapshot: { weights: normalized, levels, statuses, phase },
      computation_source: "auto",
    });

    return new Response(
      JSON.stringify({ weights: normalized, levels, statuses, phase }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("compute-constellation error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
