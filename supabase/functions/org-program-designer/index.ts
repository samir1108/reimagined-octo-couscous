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
    const { theme, durationDays = 21, orgName } = await req.json();
    if (!theme || typeof theme !== "string") {
      return new Response(JSON.stringify({ error: "theme is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const billing = await getBillingFromReq(req, "org-program-designer");

    const systemPrompt = `You are HOPE Program Designer for organizations. You design ${durationDays}-day org-wide programs that are practical, anti-bypassing, somatically grounded, and respectful of corporate constraints (90-second to 5-minute daily practices). Avoid spiritual jargon. Include progressive depth: foundation (days 1-7), integration (8-14), embodiment (15-21).`;

    const userPrompt = `Organization: ${orgName ?? "the organization"}
Theme / context: ${theme}
Duration: ${durationDays} days

Generate a structured program.`;

    const response = await aiGatewayFetchWithLang(req, {
      model: "tier:main",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [{
        type: "function",
        function: {
          name: "emit_program",
          description: "Return the structured program",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              theme: { type: "string" },
              daily_practices: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    day: { type: "number" },
                    title: { type: "string" },
                    practice: { type: "string" },
                  },
                  required: ["day", "title", "practice"],
                },
              },
            },
            required: ["title", "description", "theme", "daily_practices"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "emit_program" } },
    }, {}, billing ?? undefined);

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error", response.status, t);
      throw new Error("AI gateway error");
    }

    const aiResult = await response.json();
    const tc = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    let program: any = null;
    if (tc?.function?.arguments) {
      program = typeof tc.function.arguments === "string" ? JSON.parse(tc.function.arguments) : tc.function.arguments;
    }

    return new Response(JSON.stringify({ program }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("org-program-designer error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
