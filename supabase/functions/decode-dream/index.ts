const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
import { createClient } from "npm:@supabase/supabase-js@2";

import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";
/*
  DECODE-DREAM — AI Dream Weaver
  
  Takes morning dream capture text and:
  1. Extracts symbols, emotions, themes
  2. Maps to samskara patterns
  3. Generates today's theme seed from dream
  4. Tracks lucid dreaming progression
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

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) throw new Error("Unauthorized");

    const { dreamText, vividness, lucidityLevel } = await req.json();
    if (!dreamText || dreamText.trim().length < 10) {
      throw new Error("Dream text too short");
    }

    // Get user's active loops + consciousness profile for context
    const [{ data: loops }, { data: profile }] = await Promise.all([
      supabase.from("active_loops").select("loop_id, severity").eq("user_id", user.id).eq("is_active", true),
      supabase.from("user_consciousness_profile").select("overall_band, active_loops, archetype").eq("user_id", user.id).maybeSingle(),
    ]);

    const activeLoopIds = (loops || []).map((l: any) => l.loop_id).join(", ");
    const band = profile?.overall_band || 1;

    const systemPrompt = `You are a dream analyst within a consciousness development platform.
The user is at consciousness band ${band}. Active loops: ${activeLoopIds || "none detected yet"}.

Analyze the dream and return a JSON object with:
- symbols: string[] — key symbols/archetypes (max 8)
- emotions: string[] — emotions present (max 6)
- decoded_theme: string — 1-2 sentence interpretation connecting dream to inner growth
- samskara_links: string[] — any recurring psychological patterns this dream reveals (use plain English, max 4)
- today_seed: string — a brief suggestion for today's practice based on the dream (1 sentence)
- depth_indicator: "surface" | "processing" | "deep" | "lucid" — dream depth level

Be grounded, psychological, not mystical-fluffy. Connect to real patterns.
Return ONLY valid JSON, no markdown.`;

    if (!aiKey) throw new Error("AI key not configured");

    const __billing = await getBillingFromReq(req, "decode-dream");

    const aiResp = await aiGatewayFetchWithLang(req, {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `My dream: ${dreamText}` },
        ],
        temperature: 0.7,
        max_tokens: 600,
      }, {}, __billing ?? undefined);

    if (!aiResp.ok) throw new Error("AI analysis failed");

    const aiData = await aiResp.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "{}";
    
    // Parse AI response
    let analysis;
    try {
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch {
      analysis = {
        symbols: [], emotions: [], decoded_theme: "Dream recorded for pattern tracking.",
        samskara_links: [], today_seed: "Stay present with any images that linger from sleep.",
        depth_indicator: "surface",
      };
    }

    // Save dream entry
    const { data: entry, error: insertErr } = await supabase.from("dream_entries").insert({
      user_id: user.id,
      content: dreamText,
      emotions: analysis.emotions || [],
      symbols: analysis.symbols || [],
      ai_decoded_theme: analysis.decoded_theme || "",
      ai_analysis: analysis,
      samskara_links: analysis.samskara_links || [],
      lucidity_level: lucidityLevel || 0,
      vividness: vividness || 5,
    }).select().single();

    if (insertErr) throw insertErr;

    return new Response(JSON.stringify({
      id: entry.id,
      ...analysis,
      saved: true,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
