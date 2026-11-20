// COMPOSE-SESSION: Returns the full user-context snapshot + composer input.
// Thin wrapper around getUserContext() — the single source of truth.
import { createClient } from "npm:@supabase/supabase-js@2";
import { getUserContext, practiceLevelsMap, type Energy, type Gate } from "../_shared/user-context.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const timeBudgetMin = Number(body.timeBudgetMin ?? 8);
    const energy = body.energy as Energy | undefined;
    const hour = body.hour != null ? Number(body.hour) : undefined;
    const gate = body.gate as Gate | undefined;
    const preferred = body.preferred as string | undefined;

    const userCtx = await getUserContext(supabase, user.id, {
      timeBudgetMin, energy, hour, gate,
    });

    // Composer-shaped payload (back-compat for any client still reading `ctx`)
    const ctx = {
      gate: userCtx.now.gate,
      energy: userCtx.now.energy,
      gapDays: userCtx.behavior.gapDays,
      timeBudgetMin: userCtx.now.timeBudgetMin,
      band: Math.max(0, Math.round(userCtx.spiritual.vLevelCurrent || userCtx.spiritual.overallBand || 1)),
      activeLoops: userCtx.recentLoopIds,
      practiceLevels: practiceLevelsMap(userCtx),
      recentIngredientIds: userCtx.behavior.recentIngredientIds,
      recentArchetypeIds: userCtx.behavior.recentArchetypeIds,
      preferred,
    };

    return new Response(JSON.stringify({ ok: true, ctx, userContext: userCtx }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
