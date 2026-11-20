// Council of Yogis — fan-out to N relevant masters, then synthesize consensus + dissents.
import { createClient } from "npm:@supabase/supabase-js@2";
import { aiGatewayFetch, pickModel } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_MASTERS = [
  { id: "buddha",      name: "Buddha",      voice: "calm equanimity, observe arising and passing" },
  { id: "krishna",     name: "Krishna",     voice: "playful clarity, dharma in action" },
  { id: "ramana",      name: "Ramana",      voice: "self-inquiry, who is the one who feels this?" },
  { id: "lao-tzu",     name: "Lao Tzu",     voice: "wu-wei, soft yields, water finds its way" },
  { id: "rumi",        name: "Rumi",        voice: "love as the path, the wound is where light enters" },
  { id: "marcus",      name: "Marcus Aurelius", voice: "stoic discipline, what is up to me right now" },
];

async function callMaster(master: typeof DEFAULT_MASTERS[number], question: string, billing: any) {
  const resp = await aiGatewayFetch(
    {
      model: pickModel("fast"),
      messages: [
        { role: "system", content: `You are ${master.name}. Voice: ${master.voice}. Reply in 2-3 sentences ONLY, in your distinctive tone.` },
        { role: "user", content: question },
      ],
      temperature: 0.6,
    },
    {},
    billing ?? undefined,
  );
  if (!resp.ok) return { id: master.id, name: master.name, response: "(silent)" };
  const data = await resp.json();
  return { id: master.id, name: master.name, response: data?.choices?.[0]?.message?.content?.trim() || "(silent)" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "unauth" }), { status: 401, headers: corsHeaders });
    }
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauth" }), { status: 401, headers: corsHeaders });

    const { question, masterIds } = await req.json() as { question: string; masterIds?: string[] };
    if (!question || question.length < 4) {
      return new Response(JSON.stringify({ error: "missing_question" }), { status: 400, headers: corsHeaders });
    }

    const masters = masterIds?.length
      ? DEFAULT_MASTERS.filter((m) => masterIds.includes(m.id))
      : DEFAULT_MASTERS.slice(0, 4);
    if (masters.length === 0) {
      return new Response(JSON.stringify({ error: "no_masters" }), { status: 400, headers: corsHeaders });
    }

    const billing = await getBillingFromReq(req, "council-consensus");

    // Fan-out in parallel
    const responses = await Promise.all(masters.map((m) => callMaster(m, question, billing)));

    // Synthesis
    const synthPrompt = `These wise teachers each answered: "${question}"

${responses.map((r) => `## ${r.name}\n${r.response}`).join("\n\n")}

Now write a council synthesis with:
- "consensus": 2-3 sentences capturing the shared wisdom
- "dissents": 1-2 sentences naming where they meaningfully diverge (or "" if all aligned)
- "your_question_back": one short question to return to the asker

Return ONLY JSON: {"consensus":"...","dissents":"...","your_question_back":"..."}`;

    const synthResp = await aiGatewayFetch(
      {
        model: pickModel("main"),
        messages: [{ role: "user", content: synthPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.5,
      },
      {},
      billing ?? undefined,
    );
    const synthData = synthResp.ok ? await synthResp.json() : null;
    const synthesis = synthData ? JSON.parse(synthData?.choices?.[0]?.message?.content || "{}") : {};

    return new Response(
      JSON.stringify({ question, responses, synthesis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: corsHeaders });
  }
});
