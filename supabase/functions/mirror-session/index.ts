// Mirror Session — free AI loop diagnostic.
// Takes 5-8 Q&A pairs from a stranger and returns 3 detected mental loops
// plus a one-paragraph mirror insight + archetype.
import { corsHeaders } from "../_shared/cors.ts";
import { aiGatewayFetch, pickModel } from "../_shared/ai-config.ts";

interface QA { q: string; a: string }

const SYSTEM = `You are the Mirror — a sharp, compassionate consciousness diagnostic.
A stranger has answered 5-8 short questions about their mind, body, and patterns.
Your job: detect 3 mental loops they are stuck in, and reflect one piercing insight.

Tone: warm but truthful. No therapy-speak. No "amazing journey" fluff.
Speak like a wise friend who can see what they cannot.

Return STRICT JSON only, no prose, no markdown:
{
  "archetype": "<2-4 word identity, e.g. 'The Burned-Out Achiever'>",
  "loops": [
    { "name": "<short loop name, max 4 words>", "why": "<1 sentence why you see this in their answers>" },
    { "name": "...", "why": "..." },
    { "name": "...", "why": "..." }
  ],
  "insight": "<2-3 sentences. Mirror what they cannot see. Be specific to their answers.>",
  "next_step": "<1 line — one concrete practice to start today>"
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const answers: QA[] = Array.isArray(body?.answers) ? body.answers : [];
    if (answers.length < 3) {
      return new Response(JSON.stringify({ error: "Need at least 3 answers." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const transcript = answers
      .map((qa, i) => `Q${i + 1}: ${qa.q}\nA${i + 1}: ${qa.a}`)
      .join("\n\n");

    const resp = await aiGatewayFetch({
      model: pickModel("main"),
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `Here are their answers:\n\n${transcript}\n\nReturn the JSON now.` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      console.error("mirror-session AI error", resp.status, errText);
      return new Response(JSON.stringify({ error: "AI unavailable", detail: errText.slice(0, 200) }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(raw); } catch { parsed = { error: "parse_failed", raw }; }

    return new Response(JSON.stringify(parsed), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("mirror-session crash", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
