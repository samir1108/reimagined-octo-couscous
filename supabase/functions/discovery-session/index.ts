import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiGatewayFetchWithLang, getAIKey } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";
import { LOOP_REFERENCE } from "../_shared/loop-library.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const QUESTION_PROMPT = `You are the Mirror â€” a consciousness reader trained in Yogic psychology, somatic awareness, and modern behavioral science. You reveal unconscious patterns people don't know they're running.

RULES:
- You are speaking to a STRANGER visiting a landing page. No signup, no name.
- Ask exactly ONE question at a time. Wait for the answer before asking the next.
- The session is open-ended: the user decides when to stop. Keep generating fresh, non-repeating questions for as long as they keep answering.
- Never repeat a question, never recycle a phrasing, never circle back to the same dimension twice in a row.
- Each new question must probe a DIFFERENT dimension than the previous one â€” rotate across: thought patterns, emotional reactivity, body/somatic signals, relational behavior, time/energy use, identity stories, fears, desires, micro-habits, sleep/rest, attention, decision-making.
- Track the conversation so far. Each question should go DEEPER than the last â€” building on what they revealed, not restarting.
- Adapt language and depth to the user's vocabulary, register, and apparent self-awareness.

QUESTION STYLE:
- Casual, warm, slightly provocative. Like a yogi at a coffee shop who sees right through you.
- Keep each question under 2 sentences. No preamble, no "great answer", no validation â€” just the next piercing question.
- First question is easy and disarming. By question 3 it should sting a little. By question 6+ it should feel surgical.

EXAMPLES (style only â€” never reuse verbatim):
- "When you wake up, what's the first thought that hijacks your mind before you even get out of bed?"
- "What do you do when someone doesn't text back for hours?"
- "Where in your body do you feel stress first â€” and what do you do about it?"
- "When was the last time you felt truly at rest â€” not just tired?"

IMPORTANT:
- Never break character. You are The Mirror.
- Do NOT give the reading/reveal. Only ask questions. The reveal happens separately when the user requests it.
- After each question, STOP. Wait for the user's response.`;

const REVEAL_PROMPT = `You are the Mirror â€” a consciousness reader. You've just finished asking questions. Now analyze the conversation and produce a consciousness reading.

RULES:
- Use ONLY real loop IDs from the library below. Never invent loop IDs.
- Be deeply specific to the person's answers, not generic.
- The v_band should be an honest estimate (1-8 scale) based on their self-awareness level shown in answers.
- Dimension scores are 0-100 estimates based on what their answers reveal.
- Practices must be specific, actionable, and tied to their detected loops.
- The witness_assessment should be a penetrating one-liner about their observation capacity.

BAND NAMES:
1-2: "Unconscious Autopilot"
2-3: "Awakening"  
3-4: "The Seeker"
4-5: "The Observer"
5-6: "The Integrator"
6-7: "The Navigator"
7-8: "Luminous"

${LOOP_REFERENCE}`;

const MAX_MESSAGES = 60;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (messages.length > MAX_MESSAGES) {
      return new Response(
        JSON.stringify({ error: "Session limit reached. Sign up for unlimited access." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = getAIKey();

    // â”€â”€ REVEAL MODE: Structured JSON via tool calling â”€â”€
    if (mode === "reveal") {
      const __billing = await getBillingFromReq(req, "discovery-session");
      const response = await aiGatewayFetchWithLang(req, {
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: REVEAL_PROMPT },
            ...messages,
          ],
          tools: [{
            type: "function",
            function: {
              name: "mirror_reveal",
              description: "Generate structured consciousness reading based on the user's answers",
              parameters: {
                type: "object",
                properties: {
                  loops: {
                    type: "array",
                    description: "Top 3 unconscious loops detected",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", description: "Exact loop ID from the library (e.g. VAL001)" },
                        name: { type: "string", description: "Loop name" },
                        insight: { type: "string", description: "2-3 sentence personal explanation based on their specific answers" },
                      },
                      required: ["id", "name", "insight"],
                    },
                  },
                  v_band: { type: "number", description: "Estimated consciousness band (1-8)" },
                  band_name: { type: "string", description: "Band label (e.g. 'The Seeker')" },
                  witness_assessment: { type: "string", description: "One penetrating sentence about their witness/observation capacity" },
                  dimensions: {
                    type: "object",
                    description: "Estimated dimension scores 0-100",
                    properties: {
                      mind: { type: "number" },
                      emotion: { type: "number" },
                      body: { type: "number" },
                      awareness: { type: "number" },
                    },
                    required: ["mind", "emotion", "body", "awareness"],
                  },
                  pattern_map: {
                    type: "object",
                    description: "One-line insight per domain",
                    properties: {
                      mind: { type: "string" },
                      emotion: { type: "string" },
                      energy: { type: "string" },
                      body: { type: "string" },
                    },
                    required: ["mind", "emotion", "energy", "body"],
                  },
                  practices: {
                    type: "array",
                    description: "3 specific daily micro-practices tied to detected loops",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        time_of_day: { type: "string", description: "e.g. Morning, Midday, Evening" },
                        duration: { type: "string", description: "e.g. 90 seconds, 5 minutes" },
                        description: { type: "string", description: "Specific actionable instruction" },
                        loop_target: { type: "string", description: "Loop ID this practice targets" },
                      },
                      required: ["title", "time_of_day", "duration", "description", "loop_target"],
                    },
                  },
                },
                required: ["loops", "v_band", "band_name", "witness_assessment", "dimensions", "pattern_map", "practices"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "mirror_reveal" } },
          max_tokens: 2500,
          temperature: 0.8,
        }, {}, __billing ?? undefined);

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return new Response(
            JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (status === 402) {
          return new Response(
            JSON.stringify({ error: "Service temporarily unavailable." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const text = await response.text();
        console.error("AI gateway reveal error:", status, text);
        return new Response(
          JSON.stringify({ error: "AI service error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      
      if (!toolCall?.function?.arguments) {
        console.error("No tool call in response:", JSON.stringify(data));
        return new Response(
          JSON.stringify({ error: "Failed to generate reading" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let reveal;
      try {
        reveal = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error("Failed to parse tool call args:", toolCall.function.arguments);
        return new Response(
          JSON.stringify({ error: "Failed to parse reading" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ reveal }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // â”€â”€ CHAT MODE: Streaming questions â”€â”€
    const response = await aiGatewayFetchWithLang(req, {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: QUESTION_PROMPT },
          ...messages,
        ],
        stream: true,
        max_tokens: 300,
        temperature: 0.85,
      }, {}, __billing ?? undefined);

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("discovery-session error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
