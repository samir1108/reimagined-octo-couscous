// recalibrate-constellation
// Cron-callable edge function. Recomputes a user's constellation by re-running
// the same logic as compute-constellation, but BLENDS new signal with the
// existing weights so the user's history is preserved (Law 2 — continuous calibration).
//
// Modes:
//   • minor (weekly): blend = 0.85 * current + 0.15 * fresh
//   • major (monthly): blend = 0.60 * current + 0.40 * fresh
//
// Can be invoked:
//   • For one user (POST { user_id, mode }) — used by triggers (loop resolved, arc complete)
//   • For all users (POST { mode: "minor" | "major" }) — used by pg_cron schedule

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

const MIN_WEIGHT = 0.005;

function statusFromWeight(w: number): "primary" | "secondary" | "dormant" {
  if (w >= 0.15) return "primary";
  if (w >= 0.06) return "secondary";
  return "dormant";
}

function normalize(w: Record<Practice, number>): Record<Practice, number> {
  const floored = { ...w };
  for (const p of PRACTICES) floored[p] = Math.max(MIN_WEIGHT, floored[p] || MIN_WEIGHT);
  const sum = PRACTICES.reduce((s, p) => s + floored[p], 0);
  const out = {} as Record<Practice, number>;
  for (const p of PRACTICES) out[p] = Math.round((floored[p] / sum) * 1000) / 1000;
  return out;
}

async function recalibrateUser(
  supabase: any,
  userId: string,
  mode: "minor" | "major",
) {
  const blendCurrent = mode === "major" ? 0.6 : 0.85;
  const blendFresh = 1 - blendCurrent;

  // Read current row
  const { data: current } = await supabase
    .from("user_practice_constellation")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const currentWeights = {} as Record<Practice, number>;
  for (const p of PRACTICES) {
    currentWeights[p] = Number((current as any)?.[`${p}_weight`]) || 1 / 12;
  }

  // Build fresh signal from practice_effectiveness (last 30 / 90 days)
  const sinceDays = mode === "major" ? 90 : 30;
  const since = new Date(Date.now() - sinceDays * 86400_000).toISOString();

  const { data: effectiveness } = await supabase
    .from("practice_effectiveness")
    .select("practice, effectiveness_score, sessions_count, last_used_at")
    .eq("user_id", userId)
    .gte("last_used_at", since);

  const freshSignal = {} as Record<Practice, number>;
  for (const p of PRACTICES) freshSignal[p] = MIN_WEIGHT;

  if (effectiveness && effectiveness.length > 0) {
    for (const row of effectiveness) {
      const key = (row.practice || "").toLowerCase();
      const match = PRACTICES.find((p) => key.includes(p));
      if (!match) continue;
      const score = (row.effectiveness_score || 0) * Math.min(1, (row.sessions_count || 0) / 5);
      freshSignal[match] = (freshSignal[match] || 0) + score;
    }
  }

  // Loop signal — active loops boost observe + witness
  const { data: loops } = await supabase
    .from("active_loops")
    .select("loop_id")
    .eq("user_id", userId)
    .eq("is_active", true);
  if (loops && loops.length > 0) {
    freshSignal.observe += 0.05;
    freshSignal.witness += 0.03;
  }

  const freshNorm = normalize(freshSignal);
  const blended = {} as Record<Practice, number>;
  for (const p of PRACTICES) {
    blended[p] = currentWeights[p] * blendCurrent + freshNorm[p] * blendFresh;
  }
  const finalWeights = normalize(blended);

  const statuses = {} as Record<Practice, string>;
  for (const p of PRACTICES) statuses[p] = statusFromWeight(finalWeights[p]);
  if (statuses.observe === "dormant") statuses.observe = "secondary";

  const primaryCount = PRACTICES.filter((p) => statuses[p] === "primary").length;
  const phase = primaryCount <= 3 ? "t-shape"
    : primaryCount <= 5 ? "breathe"
    : "integrate";

  const row: Record<string, unknown> = {
    user_id: userId,
    phase,
    computation_source: `recalibrate:${mode}`,
    computed_at: new Date().toISOString(),
  };
  for (const p of PRACTICES) {
    row[`${p}_weight`] = finalWeights[p];
    row[`${p}_status`] = statuses[p];
  }

  await supabase
    .from("user_practice_constellation")
    .upsert(row, { onConflict: "user_id" });

  await supabase.from("user_practice_constellation_history").insert({
    user_id: userId,
    snapshot: { weights: finalWeights, statuses, phase, mode },
    computation_source: `recalibrate:${mode}`,
  });

  return { user_id: userId, weights: finalWeights, phase };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? req.headers.get("apikey");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Verify the caller's JWT. Without a valid user session we are an
    // open door onto every user's constellation — never allow it.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const mode = (body.mode === "major" ? "major" : "minor") as "minor" | "major";

    const supabase = createClient(supabaseUrl, serviceRole);

    // One-user path: the client may only ever target itself.
    if (body.user_id) {
      if (String(body.user_id) !== user.id) {
        return new Response(JSON.stringify({ error: "Forbidden — cannot recalibrate another user" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const result = await recalibrateUser(supabase, user.id, mode);
      return new Response(JSON.stringify({ ok: true, result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Bulk path: internal only. pg_cron does not carry a user JWT, so it is
    // admitted via an explicit shared secret rather than by being unauthenticated.
    if (body.all === true) {
      const cronSecret = Deno.env.get("CRON_SECRET");
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return new Response(JSON.stringify({ error: "Forbidden — bulk recalibration requires CRON_SECRET" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "user_id or all:true required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Bulk: all users with a constellation row
    const { data: users } = await supabase
      .from("user_practice_constellation")
      .select("user_id");

    let count = 0;
    const errors: string[] = [];
    for (const u of users || []) {
      try {
        await recalibrateUser(supabase, (u as any).user_id, mode);
        count++;
      } catch (e) {
        errors.push(`${(u as any).user_id}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    return new Response(JSON.stringify({ ok: true, recalibrated: count, errors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("recalibrate-constellation error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
