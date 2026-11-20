// Recall-memory: semantic search over user_memory_vectors.
// Returns top matches with `days_ago` and, if a loop_id is provided,
// an occurrence count over the past N days (so the AI can say
// "this is the 7th time you've touched abandonment in 60 days").
import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { embedText } from "../_shared/embedding.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const query = String(body.query ?? "").trim();
    const limit = Math.min(20, Math.max(1, Number(body.limit ?? 5)));
    const min_days_ago = Math.max(0, Number(body.min_days_ago ?? 0));
    const loop_id: string | null = body.loop_id ?? null;
    const loop_window_days = Math.max(1, Number(body.loop_window_days ?? 60));

    let matches: any[] = [];
    if (query.length >= 4) {
      const emb = await embedText(query);
      if (emb) {
        const { data, error } = await supabase.rpc("match_user_memories", {
          p_user_id: user.id,
          p_query_embedding: emb as any,
          p_match_count: limit,
          p_min_days_ago: min_days_ago,
        });
        if (error) console.error("match rpc error", error);
        matches = data ?? [];
      }
    }

    let loop_occurrence: any = null;
    if (loop_id) {
      const { data: loopData, error: loopErr } = await supabase.rpc("count_loop_occurrences", {
        p_user_id: user.id,
        p_loop_id: loop_id,
        p_days: loop_window_days,
      });
      if (loopErr) console.error("loop rpc error", loopErr);
      loop_occurrence = (loopData && loopData[0]) || null;
    }

    // Also fetch most recent daily synthesis for "yesterday-aware" prompts
    const { data: lastSynthesis } = await supabase
      .from("daily_memory_synthesis")
      .select("synthesis_date, summary, key_themes, loops_touched")
      .eq("user_id", user.id)
      .order("synthesis_date", { ascending: false })
      .limit(3);

    return new Response(JSON.stringify({
      ok: true,
      matches,
      loop_occurrence,
      recent_syntheses: lastSynthesis ?? [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("recall-memory error", e);
    return new Response(JSON.stringify({ error: e?.message ?? "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
