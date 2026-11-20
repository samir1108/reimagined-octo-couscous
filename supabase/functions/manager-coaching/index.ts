import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { employeeName, consciousnessData } = await req.json();

    const systemPrompt = `You are an AI coaching assistant for enterprise managers. Generate 3-5 talking points for a 1-on-1 meeting based on the employee's consciousness data.

Each talking point should have:
- topic: A brief topic title
- context: Why this matters based on their data
- suggestedQuestion: An open-ended question the manager can ask

Focus on growth, wellbeing, and actionable insights. Be empathetic and constructive. Never be judgmental.`;

    const userPrompt = `Generate coaching talking points for a 1-on-1 with ${employeeName}.

Their consciousness data:
- Overall Band: ${consciousnessData.band}/10
- Current Streak: ${consciousnessData.streak} days
- Total Sessions: ${consciousnessData.totalSessions}
- Journey Phase: ${consciousnessData.journeyPhase}
- V-Level: ${consciousnessData.vLevel}
- Witness Depth: ${consciousnessData.witnessDepth}
- Bypassing Risk: ${(consciousnessData.bypassingRisk * 100).toFixed(0)}%
- Dimension Bands: ${JSON.stringify(consciousnessData.dimensionBands)}`;

    const __billing = await getBillingFromReq(req, "manager-coaching");

    const response = await aiGatewayFetchWithLang(req, {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "provide_talking_points",
            description: "Return structured coaching talking points",
            parameters: {
              type: "object",
              properties: {
                talkingPoints: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      topic: { type: "string" },
                      context: { type: "string" },
                      suggestedQuestion: { type: "string" },
                    },
                    required: ["topic", "context", "suggestedQuestion"],
                  },
                },
              },
              required: ["talkingPoints"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "provide_talking_points" } },
      }, {}, __billing ?? undefined);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI gateway error");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    let talkingPoints = [];

    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        talkingPoints = parsed.talkingPoints || [];
      } catch {
        talkingPoints = [];
      }
    }

    return new Response(JSON.stringify({ talkingPoints }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("manager-coaching error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
