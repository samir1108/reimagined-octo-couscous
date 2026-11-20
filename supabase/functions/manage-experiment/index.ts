import { createClient } from "npm:@supabase/supabase-js@2";
import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { getUserContext } from "../_shared/user-context.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const action = body.action as string;

    if (action === "propose") {
      const threadId = body.thread_id;
      if (!threadId) return new Response(JSON.stringify({ error: "thread_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      // Get thread and user context
      const { data: thread } = await admin.from("open_threads").select("*").eq("id", threadId).eq("user_id", user.id).single();
      if (!thread) return new Response(JSON.stringify({ error: "thread not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const userCtx = await getUserContext(userClient, user.id, {});
      const confirmedObs = (userCtx.personalization?.confirmedObservations ?? []).filter(o => o.threadId === threadId).slice(0, 3);
      const goals = userCtx.personalization?.goals ?? [];

      // Generate experiment using AI
      const sys = `You are designing a tiny real-world experiment for a user's ConsciousOS journey.
The user is exploring: "${thread.question}"
Depth mode: ${thread.depth_mode}
Recent observations: ${confirmedObs.map(o => o.observation).join("; ") || "(none yet)"}
Goals: ${goals.map(g => g.goal).join("; ") || "(none)"}

Create ONE small, optional experiment they can try in daily life.
Return ONLY JSON: {"action":"string","observationPrompt":"string"}
- action: a concrete, tiny behavior to try (e.g., "Next time someone questions your decision, pause for one breath before responding")
- observationPrompt: what to notice (e.g., "What happened in your body? Did you respond differently?")`;

      let actionText = "Notice your first reaction before responding to a disagreement.";
      let observationPrompt = "What happened in your body? What was your first urge?";
      
      try {
        const r = await aiGatewayFetchWithLang(req, {
          model: "tier:fast",
          messages: [{ role: "system", content: sys }],
          response_format: { type: "json_object" },
        }, {}, { admin, userId: user.id, functionName: "manage-experiment:propose", aiMode: userCtx.identity.aiMode === "premium" ? "premium" : "fast" });
        if (r.ok) {
          const j = await r.json();
          const parsed = JSON.parse(j?.choices?.[0]?.message?.content || "{}");
          if (parsed.action) actionText = parsed.action;
          if (parsed.observationPrompt) observationPrompt = parsed.observationPrompt;
        }
      } catch (e) {
        console.warn("AI experiment generation failed, using fallback:", e);
      }

      const id = body.id || crypto.randomUUID();
      const { data, error } = await supabase.from("living_experiments").insert({
        id,
        user_id: user.id,
        thread_id: threadId,
        session_id: body.session_id ?? null,
        action: actionText,
        observation_prompt: observationPrompt,
        outcome: "proposed",
      }).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, experiment: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update_outcome") {
      const updates: any = { outcome: body.outcome, updated_at: new Date().toISOString() };
      if (body.outcome_note) updates.outcome_note = body.outcome_note;
      const { data, error } = await supabase.from("living_experiments")
        .update(updates)
        .eq("id", body.id)
        .eq("user_id", user.id)
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, experiment: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "accept") {
      const { data, error } = await supabase.from("living_experiments")
        .update({ outcome: "accepted", updated_at: new Date().toISOString() })
        .eq("id", body.id)
        .eq("user_id", user.id)
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, experiment: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("manage-experiment error", e);
    return new Response(JSON.stringify({ error: e?.message ?? "unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});