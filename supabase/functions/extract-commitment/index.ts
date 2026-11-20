// Extract a "commitment" from a Guide chat exchange and persist it so we can
// gently follow up later. Deterministic keyword pass first; falls back to
// ConsciousOS AI Gateway for a tight structured summary + suggested check-back window.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

import { createClient } from "npm:@supabase/supabase-js@2";
import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";

const SUGGESTION_HINTS = [
  "would you be willing", "try this", "try that", "try to", "for the next",
  "tonight", "tomorrow", "each morning", "in the morning", "before bed",
  "one small", "notice when", "keep a", "jot ", "write down", "for one day",
  "for a week", "for the next few", "commit to",
];

const AFFIRMATIVES = /^\s*(ok|okay|yes|yeah|sure|will do|i will|i'll|alright|deal|let'?s do it|done|cool|👍|🙏)\b/i;

function checkBackFromHint(rel: string | null | undefined): string {
  const now = new Date();
  const set = (h: number) => {
    const d = new Date(now);
    d.setHours(h, 0, 0, 0);
    if (d <= now) d.setDate(d.getDate() + 1);
    return d.toISOString();
  };
  switch ((rel || "").toLowerCase()) {
    case "in_hours": return new Date(now.getTime() + 3 * 3600 * 1000).toISOString();
    case "tonight": return set(21);
    case "tomorrow_morning": return set(8);
    case "tomorrow_evening": {
      const d = new Date(now); d.setDate(d.getDate() + 1); d.setHours(20, 0, 0, 0);
      return d.toISOString();
    }
    case "in_2_days": {
      const d = new Date(now); d.setDate(d.getDate() + 2); d.setHours(9, 0, 0, 0);
      return d.toISOString();
    }
    case "in_a_week": {
      const d = new Date(now); d.setDate(d.getDate() + 7); d.setHours(9, 0, 0, 0);
      return d.toISOString();
    }
    default: {
      // default: ~20h from now
      return new Date(now.getTime() + 20 * 3600 * 1000).toISOString();
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) throw new Error("Unauthorized");

    const body = await req.json();
    const {
      assistantMessage,
      userReply,
      mode,
      masterId,
      sessionId,
      chainParentId,
      force,
    }: {
      assistantMessage: string;
      userReply?: string;
      mode?: string;
      masterId?: string;
      sessionId?: string;
      chainParentId?: string;
      force?: boolean;
    } = body || {};

    if (!assistantMessage || assistantMessage.trim().length < 8) {
      return new Response(
        JSON.stringify({ ok: false, reason: "assistant_message_missing" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Deterministic gating: only proceed if the assistant offered something
    // actionable AND (a) the user agreed or (b) force=true (button tap).
    const lower = assistantMessage.toLowerCase();
    const hasSuggestion = SUGGESTION_HINTS.some((h) => lower.includes(h));
    const agreed = force || (userReply && AFFIRMATIVES.test(userReply));

    if (!hasSuggestion && !force) {
      return new Response(
        JSON.stringify({ ok: false, reason: "no_actionable_suggestion" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!agreed) {
      return new Response(
        JSON.stringify({ ok: false, reason: "no_user_commitment" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // AI structuring pass — keep it small.
    const sys = `You extract a single COMMITMENT the user just agreed to try, from a Guide chat.
Return strict JSON: {"summary": string (<= 100 chars, present tense, action + object), "check_back_at_relative": "in_hours" | "tonight" | "tomorrow_morning" | "tomorrow_evening" | "in_2_days" | "in_a_week"}.
Pick check_back based on the suggestion's natural window (e.g. "keep a notebook by the bed" -> tomorrow_morning; "for a week" -> in_a_week).`;

    const usr = `Assistant said:\n"""${assistantMessage.slice(0, 1200)}"""\n\nUser reply:\n"""${(userReply || "(tapped I'll try this)").slice(0, 300)}"""`;

    let summary = "";
    let rel = "tomorrow_morning";
    try {
      const billing = await getBillingFromReq(req, "extract-commitment");
      const aiResp = await aiGatewayFetchWithLang(req, {
        model: "tier:nano",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: usr },
        ],
        temperature: 0.2,
        max_tokens: 200,
        response_format: { type: "json_object" },
      }, {}, billing ?? undefined);
      if (aiResp.ok) {
        const j = await aiResp.json();
        const raw = j.choices?.[0]?.message?.content || "{}";
        const parsed = JSON.parse(raw.replace(/^```json|```$/g, "").trim());
        if (typeof parsed.summary === "string") summary = parsed.summary.trim().slice(0, 140);
        if (typeof parsed.check_back_at_relative === "string") rel = parsed.check_back_at_relative;
      }
    } catch (_e) {
      // Ignore — fall through to heuristic summary
    }

    if (!summary) {
      // Heuristic fallback: first sentence of the suggestion, trimmed.
      const firstSentence = assistantMessage.split(/(?<=[.?!])\s+/)[0] || assistantMessage;
      summary = firstSentence.slice(0, 140);
    }

    const checkBackAt = checkBackFromHint(rel);

    const { data: inserted, error: insErr } = await supabase
      .from("guide_commitments")
      .insert({
        user_id: user.id,
        session_id: sessionId || null,
        mode: mode || null,
        master_id: masterId || null,
        summary,
        source_message: assistantMessage.slice(0, 2000),
        check_back_at: checkBackAt,
        chain_parent_id: chainParentId || null,
      })
      .select()
      .single();

    if (insErr) throw insErr;

    return new Response(
      JSON.stringify({ ok: true, commitment: inserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("extract-commitment error", err);
    return new Response(
      JSON.stringify({ ok: false, error: err?.message || "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
