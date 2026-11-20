import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { computeChargedPaise } from "../_shared/ai-pricing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const gate = String(body.gate ?? "morning").toLowerCase();
    const date = String(body.date ?? new Date().toISOString().slice(0, 10));

    const systemPrompt = `You are a gentle consciousness guide. Write a short ${gate} ritual (2-4 sentences, second person). No greeting. Warm, simple, specific.`;
    const userPrompt = `Create a ${gate} ritual for today.`;

    const aiResp = await aiGatewayFetchWithLang(req, {
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    let content = "";
    if (aiResp.ok) {
      const aiData = await aiResp.json();
      content = String(aiData.choices?.[0]?.message?.content ?? "").trim();
    }

    if (!content) {
      content = gate === "morning"
        ? "Before you begin, take three slow breaths. Set one small intention for today: not more, not less."
        : "Pause. Name one thing you are grateful for from today, and one thing you are ready to release.";
    }

    const ritualType = gate === "auto" ? "sunday_stillness" : "morning_whisper";

    const { data: existing } = await supabase
      .from("daily_rituals")
      .select("id")
      .eq("user_id", user.id)
      .eq("ritual_date", date)
      .eq("ritual_type", ritualType)
      .maybeSingle();

    let ritual: any;
    if (existing?.id) {
      const { data } = await supabase
        .from("daily_rituals")
        .update({ content, context_used: { gate, date }, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select("*")
        .single();
      ritual = data;
    } else {
      const { data } = await supabase
        .from("daily_rituals")
        .insert({
          user_id: user.id,
          ritual_date: date,
          ritual_type: ritualType,
          content,
          context_used: { gate, date },
        })
        .select("*")
        .single();
      ritual = data;
    }

    return new Response(JSON.stringify({ ok: true, ritual }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-daily-ritual error", e);
    return new Response(JSON.stringify({ error: e?.message ?? "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
