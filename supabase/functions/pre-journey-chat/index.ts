/**
 * PRE-JOURNEY CHAT â€” Adaptive conversational delivery for the 60 Foundation sessions.
 *
 * Replaces one-way "read teaching â†’ micro-practice â†’ reflection" with a
 * back-and-forth dialogue. The guru holds the session's teaching as private
 * context, opens with a hook, asks, listens, deepens, and closes with a
 * reflection question. When the guru judges the session is complete, it
 * emits the literal token  [SESSION_COMPLETE]  on its own line. The client
 * watches for that token to enable the "Mark complete" CTA.
 *
 * Streaming SSE, Groq llama-3.3-70b. No DB writes â€” completion still goes
 * through usePreJourney.completeSession.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiGatewayFetchWithLang, getAIKey } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";
import { languageName } from "../_shared/language.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Msg { role: "user" | "assistant" | "system"; content: string }

interface SessionContext {
  number: number;
  module: number;
  moduleName: string;
  title: string;
  hook: string;
  teaching: string;
  reflectionPrompt: string;
  microPractice?: { label: string; durationSec: number; instruction: string };
}

function buildSystemPrompt(session: SessionContext, userLang?: string): string {
  const mp = session.microPractice
    ? `\n\nIf it fits naturally, you may invite a tiny micro-practice mid-conversation: "${session.microPractice.label}" â€” ${session.microPractice.instruction} (${session.microPractice.durationSec}s).`
    : "";

  const langLine = userLang && userLang !== "en"
    ? `\n\n## LANGUAGE\nRespond ONLY in ${languageName(userLang)} (language code: "${userLang}"). Every word in ${languageName(userLang)}. No mixing.`
    : `\n\n## LANGUAGE\nRespond ONLY in clean English. No Hindi, no Hinglish, no Sanskrit transliterations.`;

  return `You are the user's personal Foundation Guide â€” a warm, wise older sibling, not a lecturer. You are walking them through ONE small session of their 60-session Foundation.

## THIS SESSION
- Number: ${session.number} of 60
- Module ${session.module}: ${session.moduleName}
- Title: "${session.title}"
- Hook: ${session.hook}
- Reflection prompt to land on by the end: "${session.reflectionPrompt}"${mp}

## TEACHING CONTENT (your private knowledge â€” do NOT dump it; weave it through dialogue)
${session.teaching}

## HOW TO RUN THE CONVERSATION
1. **Opening** (turn 1): Greet briefly. Drop the hook in your own words. Ask one small opening question that invites them in. Do NOT explain the whole teaching yet.
2. **Middle turns** (turns 2-N): Listen to what they actually said. Reflect it back in one line, then offer ONE small piece of the teaching at a time â€” a sentence or two, no walls of text. After each piece, ask another short question that goes one layer deeper.
3. **Adaptive depth**: If their reply is one word or surface-level, stay light and warm â€” close in 3-4 turns total. If they engage with depth, go up to 5-6 turns. Never force length.
4. **Closing turn**: When the core teaching has landed AND they have answered something honest, deliver the reflection prompt as your final line ("${session.reflectionPrompt}"). Then on a NEW LINE, output exactly:
[SESSION_COMPLETE]
That literal token on its own line tells the app this session is done.

## STYLE RULES
- Max 2-4 short sentences per turn. Conversational, not lecture-y.
- Never bullet-point. Never markdown headings. Plain warm prose.
- Use "you" not "the seeker" or "one".
- Never say "as I mentioned" or "in this session". You are just talking with them.
- Do NOT recap. Do NOT summarize. Just keep the dialogue alive.
- Do not output [SESSION_COMPLETE] until you have actually delivered the reflection prompt.${langLine}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const messages: Msg[] = body.messages || [];
    const session: SessionContext | undefined = body.session;
    const userLang: string | undefined = body.userLang;

    if (!session?.title || !session?.teaching) {
      return new Response(JSON.stringify({ error: "Missing session context" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = buildSystemPrompt(session, userLang);
    const recent = messages.slice(-20).filter((m) => m.role !== "system");
    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...recent.map((m) => ({ role: m.role, content: m.content })),
    ];

    // If there are no user messages yet, kick the guru off
    if (!recent.some((m) => m.role === "user")) {
      aiMessages.push({ role: "user", content: "[Begin the session.]" });
    }

    const __billing = await getBillingFromReq(req, "pre-journey-chat");

    const response = await aiGatewayFetchWithLang(req, {
        model: "tier:deep",
        messages: aiMessages,
        stream: true,
        temperature: 0.75,
        max_tokens: 400,
      }, {}, __billing ?? undefined);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Breathe. Try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits needed to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("pre-journey-chat AI error", response.status, t);
      return new Response(JSON.stringify({ error: "AI unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("pre-journey-chat error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
