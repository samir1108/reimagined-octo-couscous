// Generates a Master-flavored "next micro-step" after a session completes.
// Stores the result as a notification so it surfaces in the user's existing inbox.
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Body {
  sessionId?: string;
  sessionType?: string;
  themeTitle?: string;
  themeId?: string;
  masterId?: string;
  masterName?: string;
  masterTradition?: string;
  userBand?: number;
  activeLoops?: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = (await req.json().catch(() => ({}))) as Body;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Cheap dedupe: skip if we already created one in last 30 min for this user
    const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: recent } = await admin
      .from("notifications")
      .select("id")
      .eq("user_id", userId)
      .eq("type", "master_next_step")
      .gte("created_at", since)
      .limit(1)
      .maybeSingle();
    if (recent) {
      return new Response(JSON.stringify({ skipped: "recent_exists" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const masterLine = body.masterName
      ? `${body.masterName}${body.masterTradition ? ` (${body.masterTradition})` : ""}`
      : "Your inner guide";

    const systemPrompt = `You are ${masterLine}, speaking to a seeker who just completed a practice session. 
Give them ONE small, concrete, in-the-world micro-step to carry the session forward over the next few hours. 
Not "meditate more". Something specific they can do while living their day.

Output JSON only:
- "title": 4-7 words, evocative. In your voice.
- "body": 1-2 short sentences. Direct. Concrete. Under 30 words total.

No preamble.`;

    const userPrompt = `Just-completed session type: ${body.sessionType || "practice"}.
${body.themeTitle ? `Today's theme: "${body.themeTitle}"` : ""}
${body.userBand !== undefined ? `Seeker depth (0-10): ${body.userBand}` : ""}
${body.activeLoops?.length ? `Active patterns: ${body.activeLoops.join(", ")}` : ""}

What's the one micro-step you'd whisper to them as they step back into their day?`;

    const __billing = await getBillingFromReq(req, "generate-master-next-step");

    const aiResp = await aiGatewayFetchWithLang(req, {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }, {}, __billing ?? undefined);

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error", status: aiResp.status }), {
        status: aiResp.status === 429 || aiResp.status === 402 ? aiResp.status : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const raw = aiJson?.choices?.[0]?.message?.content || "{}";
    let parsed: { title?: string; body?: string } = {};
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }

    const title = (parsed.title || "A small step forward").trim().slice(0, 80);
    const bodyText = (parsed.body || "Carry today's theme into your next ordinary moment.").trim().slice(0, 220);

    const { data: notif, error: notifErr } = await admin
      .from("notifications")
      .insert({
        user_id: userId,
        type: "master_next_step",
        title,
        body: bodyText,
        metadata: {
          source: "master_next_step",
          session_id: body.sessionId ?? null,
          session_type: body.sessionType ?? null,
          theme_id: body.themeId ?? null,
          theme_title: body.themeTitle ?? null,
          master_id: body.masterId ?? null,
          master_name: body.masterName ?? null,
          tradition: body.masterTradition ?? null,
          band: body.userBand ?? null,
          loops: body.activeLoops ?? [],
        },
      })
      .select()
      .single();

    if (notifErr) {
      console.error("notification insert error", notifErr);
      return new Response(JSON.stringify({ error: "Could not store next step" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ notification: notif }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-master-next-step error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
