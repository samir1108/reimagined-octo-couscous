// Extract sacred moments from recent journal entries / sessions / signals.
// Auto-fills the Memory Vault with breakthroughs, tears, laughs, realizations.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { buildLanguageInstruction, resolveUserLanguage } from "../_shared/language.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader ?? "" } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (false) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const body = await req.json().catch(() => ({}));
    const days: number = Math.min(30, Math.max(1, body.days ?? 7));
    const userLang = await resolveUserLanguage(req, body.language);

    // 1. Pull recent raw material
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const [journalsRes, signalsRes] = await Promise.all([
      admin
        .from("journal_entries")
        .select("id, title, content, mood, created_at")
        .eq("user_id", user.id)
        .gt("created_at", since)
        .order("created_at", { ascending: false })
        .limit(20),
      admin
        .from("consciousness_signals")
        .select("id, source_type, chitta_vritti, created_at")
        .eq("user_id", user.id)
        .gt("created_at", since)
        .order("created_at", { ascending: false })
        .limit(40),
    ]);

    const journals = journalsRes.data ?? [];
    if (journals.length === 0) {
      return new Response(
        JSON.stringify({ extracted: 0, reason: "no_journals" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Find moments NOT already auto-extracted recently (avoid duplicates by source_id)
    const existingIds = new Set(
      (
        await admin
          .from("sacred_moments")
          .select("source_id")
          .eq("user_id", user.id)
          .eq("source_type", "journal")
          .gt("created_at", since)
      ).data?.map((r: any) => r.source_id) ?? [],
    );
    const candidates = journals.filter((j) => !existingIds.has(j.id));
    if (candidates.length === 0) {
      return new Response(
        JSON.stringify({ extracted: 0, reason: "all_already_processed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3. Ask AI to identify sacred moments using tool calling
    const sys = `You are a wise witness reading someone's journal. Identify the *sacred moments* — not summaries.
A sacred moment is: a clear breakthrough, tear (deep grief/release), laugh (real joy), realization, vow, gratitude, first vulnerability, milestone, or life event.
Skip generic entries. Quality over quantity. Return at most 5 moments.${buildLanguageInstruction(userLang)}`;

    const userMsg = `Recent journal entries:
${candidates
  .slice(0, 10)
  .map((j, i) => `[#${i} id=${j.id}] mood=${j.mood ?? "-"} | ${j.title ?? ""}\n${(j.content ?? "").slice(0, 600)}`)
  .join("\n\n")}`;

    const __billing = await getBillingFromReq(req, "extract-sacred-moments");

    const r = await aiGatewayFetchWithLang(req, {
        model: "tier:nano",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userMsg },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_moments",
              description: "Return identified sacred moments",
              parameters: {
                type: "object",
                properties: {
                  moments: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        source_index: { type: "integer", description: "The # index of the journal entry" },
                        moment_type: {
                          type: "string",
                          enum: [
                            "breakthrough",
                            "tear",
                            "laugh",
                            "realization",
                            "vow",
                            "gratitude",
                            "grief",
                            "first_vulnerability",
                            "milestone",
                            "life_event",
                          ],
                        },
                        title: { type: "string", description: "Short title (under 8 words)" },
                        user_words: { type: "string", description: "Direct quote from the user, 1-3 sentences" },
                        emotional_tone: { type: "string" },
                        importance: { type: "integer", minimum: 5, maximum: 10 },
                        confidence: { type: "number", minimum: 0, maximum: 1 },
                      },
                      required: ["source_index", "moment_type", "title", "user_words", "importance", "confidence"],
                    },
                  },
                },
                required: ["moments"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_moments" } },
        temperature: 0.3,
        max_tokens: 1500,
      }, {}, __billing ?? undefined);

    const j = await r.json();
    const args = j?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) {
      return new Response(JSON.stringify({ extracted: 0, reason: "no_ai_output" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = JSON.parse(args);
    const moments = (parsed.moments ?? []).filter((m: any) => m.confidence >= 0.6);

    if (moments.length === 0) {
      return new Response(JSON.stringify({ extracted: 0, reason: "no_qualifying_moments" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Insert
    const rows = moments
      .map((m: any) => {
        const src = candidates[m.source_index];
        if (!src) return null;
        return {
          user_id: user.id,
          moment_type: m.moment_type,
          title: m.title,
          user_words: m.user_words,
          context: src.title ?? null,
          source_type: "journal",
          source_id: src.id,
          emotional_tone: m.emotional_tone ?? null,
          importance: Math.min(10, Math.max(5, m.importance)),
          occurred_at: src.created_at,
          metadata: { ai_confidence: m.confidence, auto_extracted: true },
        };
      })
      .filter(Boolean);

    const ins = await admin.from("sacred_moments").insert(rows).select("id");

    return new Response(
      JSON.stringify({
        extracted: ins.data?.length ?? 0,
        moments: ins.data ?? [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("extract-sacred-moments error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
