// Generates a Master's personalized voice on the user's daily theme.
// Cached per (user, theme_date, master_id) to bound costs.
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";
import { buildMasterVoice, VOICE_TAIL_REMINDER } from "../_shared/voice-lineage.ts";
import { buildLanguageInstruction, resolveUserLanguage } from "../_shared/language.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Body {
  themeId?: string;
  themeTitle: string;
  themeDescription?: string;
  masterId: string;
  masterName: string;
  masterTradition?: string;
  masterQuote?: string;
  userBand?: number;
  activeLoops?: string[];
  force?: boolean; // bypass cache
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

    const body = (await req.json()) as Body;
    if (!body?.themeTitle || !body?.masterId || !body?.masterName) {
      return new Response(JSON.stringify({ error: "Missing themeTitle, masterId, or masterName" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const today = new Date().toISOString().slice(0, 10);
    const userLang = await resolveUserLanguage(req, (body as any).language);

    // Cache lookup
    // Cache only for English; other languages always regenerate (cache key has no language column)
    if (!body.force && userLang === "en") {
      const { data: cached } = await admin
        .from("master_theme_teachings")
        .select("*")
        .eq("user_id", userId)
        .eq("theme_date", today)
        .eq("master_id", body.masterId)
        .maybeSingle();
      if (cached) {
        return new Response(JSON.stringify({ teaching: cached.teaching, invitation: cached.invitation, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const systemPrompt = `${buildMasterVoice(body.masterId, { includeFewShot: true })}

## TASK — A SEEKER COMES TO YOU WITH TODAY'S THEME
Take today's theme and reveal what it points to from YOUR lineage. Not generic
spiritual advice — YOUR specific way of seeing it. Speak directly to the seeker.

OUTPUT — JSON only, two fields:
- "teaching": 1–4 short sentences in your voice. Line breaks allowed. Pointing toward liberation, not self-improvement.
- "invitation": ONE concrete inner gesture or question the seeker carries today. Under 15 words.

No preamble. No "Dear seeker." Just speak.

${VOICE_TAIL_REMINDER}${buildLanguageInstruction(userLang)}`;

    const userPrompt = `Today's theme: "${body.themeTitle}"
${body.themeDescription ? `Description: ${body.themeDescription}` : ""}
${body.userBand !== undefined ? `Seeker's current depth (0–10): ${body.userBand}` : ""}
${body.activeLoops?.length ? `Patterns active in them: ${body.activeLoops.join(", ")}` : ""}

Speak to them as ${body.masterName}. Stay in your lineage. One image. One doorway.`;

    const __billing = await getBillingFromReq(req, "generate-master-theme-teaching");

    const aiResp = await aiGatewayFetchWithLang(req, {
        model: "tier:deep",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.85,
      }, {}, __billing ?? undefined);

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const raw = aiJson?.choices?.[0]?.message?.content || "{}";
    let parsed: { teaching?: string; invitation?: string } = {};
    try { parsed = JSON.parse(raw); } catch { parsed = { teaching: raw }; }

    const teaching = (parsed.teaching || "").trim();
    const invitation = (parsed.invitation || "").trim() || null;

    if (!teaching) {
      return new Response(JSON.stringify({ error: "Empty teaching generated" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upsert cache
    await admin.from("master_theme_teachings").upsert({
      user_id: userId,
      theme_date: today,
      theme_id: body.themeId ?? null,
      master_id: body.masterId,
      master_name: body.masterName,
      theme_title: body.themeTitle,
      teaching,
      invitation,
      metadata: {
        band: body.userBand ?? null,
        loops: body.activeLoops ?? [],
        tradition: body.masterTradition ?? null,
      },
    }, { onConflict: "user_id,theme_date,master_id" });

    return new Response(JSON.stringify({ teaching, invitation, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-master-theme-teaching error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
