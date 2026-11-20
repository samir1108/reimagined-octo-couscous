// translate-ui: Batch-translate an array of English UI strings into a target language using Groq.
// Returns translations in the same order/length so the client can swap them in place.
// Items the model could not translate are reported in `missing` so the client
// retries only real failures and never spins on intentional echoes (brand
// names, IDs, numbers).

import { aiGatewayFetch } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";
import { languageName } from "../_shared/language.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = (langName: string) => `You are a professional UI translator for a meditation/consciousness app.
Translate each input string from English to ${langName}.
Rules:
- Preserve meaning, tone, and brevity. UI labels must stay short.
- Long paragraphs/sentences: translate fully and faithfully — never truncate or summarize.
- Keep emojis, numbers, punctuation, brand names ("HOPE", "Temple", "Witness"), and placeholders ({like_this}) as-is.
- Short uppercase labels (e.g. ACTION, GRIP BEFORE, FRUIT, YOU) are UI labels, not brand names — translate them.
- If a string is purely a name/brand/number/symbol, return it unchanged.
- Do NOT add quotes or commentary.
Return strict JSON: { "translations": ["...", "...", ...] } in the SAME order and SAME length as input.`;

interface BatchResult {
  translations: string[];
  missing: number[];
}

/** Translate a batch. Returns null when the request failed or the model
 *  returned the wrong number of items (caller falls back to smaller slices). */
async function translateItems(
  items: string[],
  langName: string,
  billing: Awaited<ReturnType<typeof getBillingFromReq>>,
): Promise<string[] | null> {
  const userMsg = JSON.stringify({ count: items.length, strings: items });
  try {
    // Plain gateway — NOT WithLang. The user's own language instruction must
    // never fight the explicit targetLang (a Hindi user viewing Spanish UI
    // would otherwise get "Respond ONLY in pure Hindi" vs translate-to-Spanish).
    const r = await aiGatewayFetch({
      model: "tier:nano",
      messages: [
        { role: "system", content: SYSTEM_PROMPT(langName) },
        { role: "user", content: userMsg },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 8000,
    }, {}, billing ?? undefined);
    const j = await r.json();
    const txt = j?.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(txt);
    const arr = Array.isArray(parsed?.translations) ? parsed.translations : null;
    if (arr && arr.length === items.length) {
      return arr.map((s: unknown, i: number) => (typeof s === "string" && s.trim() ? s : items[i]));
    }
    return null;
  } catch (e) {
    console.error("translate-ui generation failed", e);
    return null;
  }
}

/** Recursively shrink the batch when a response is truncated or malformed, so
 *  one oversized request cannot leave a whole page untranslated. */
async function translateWithFallback(
  items: string[],
  langName: string,
  billing: Awaited<ReturnType<typeof getBillingFromReq>>,
  depth = 0,
): Promise<BatchResult> {
  const direct = await translateItems(items, langName, billing);
  if (direct) return { translations: direct, missing: [] };
  if (items.length <= 1 || depth >= 6) {
    return { translations: items, missing: items.map((_, i) => i) };
  }

  const mid = Math.ceil(items.length / 2);
  const [left, right] = await Promise.all([
    translateWithFallback(items.slice(0, mid), langName, billing, depth + 1),
    translateWithFallback(items.slice(mid), langName, billing, depth + 1),
  ]);
  return {
    translations: [...left.translations, ...right.translations],
    missing: [
      ...left.missing,
      ...right.missing.map((i) => i + mid),
    ],
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const targetLang: string = String(body.targetLang || "en").trim();
    const strings: unknown = body.strings;

    if (!Array.isArray(strings) || strings.length === 0) {
      return new Response(JSON.stringify({ translations: [], missing: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!targetLang || targetLang === "en") {
      return new Response(JSON.stringify({ translations: strings, missing: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const langName = languageName(targetLang);
    const items = (strings as unknown[]).map((s) => String(s ?? ""));

    let result: BatchResult = { translations: items, missing: [] };
    try {
      const billing = await getBillingFromReq(req, "translate-ui");
      result = await translateWithFallback(items, langName, billing);
    } catch (e) {
      console.error("translate-ui generation failed", e);
      result = { translations: items, missing: items.map((_, i) => i) };
    }

    return new Response(
      JSON.stringify({ translations: result.translations, missing: result.missing, lang: targetLang }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("translate-ui error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
