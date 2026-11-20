/**
 * TEMPLE CHAT - Edge Function
 * Handles streaming chat with Temple Guides + Witness Practice
 * Uses ConsciousOS AI Gateway, detects loops, guides with wisdom
 * Now with full user context for real guru-shishya interactions
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiGatewayFetchWithLang, getAIKey } from "../_shared/ai-config.ts";
import { buildMasterVoice, MASTER_DOSSIERS, VOICE_TAIL_REMINDER, BRAND_BIBLE_VOICE } from "../_shared/voice-lineage.ts";
import { buildAdaptiveDecision } from "../_shared/adaptive-engine.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { meterAndCharge, precheckCredits } from "../_shared/ai-billing.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";
import { HUMAN_PRESENCE_PROMPT } from "../_shared/human-presence.ts";
import { PSYCHOLOGICAL_PROBES_PROMPT } from "../_shared/psychological-probes.ts";
import { buildLongTermMemoryBlock, embedUtterance, adminClient } from "../_shared/long-term-memory.ts";
import { buildKundliPromptBlock } from "../_shared/kundli-context.ts";
import { sanitizeForAI } from "../_shared/sanitize-input.ts";
import { languageName } from "../_shared/language.ts";
import { assessCrisis, buildCrisisMessage } from "../_shared/crisis.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// â”€â”€â”€ Build context-aware system prompt â”€â”€â”€
function buildSystemPrompt(guruId: string, guruName: string, userContext: any): string {
  // If this guruId matches a real lineage dossier, use the lineage voice (BE the master).
  // Otherwise fall back to the modern guide personalities (Aarav, Veer, etc.).
  const isLineageMaster = !!MASTER_DOSSIERS[guruId];
  const guruPersonality = isLineageMaster
    ? buildMasterVoice(guruId, { includeFewShot: true })
    : `${BRAND_BIBLE_VOICE}\n\n${GUIDE_PERSONALITIES[guruId] || GUIDE_PERSONALITIES["aarav"]}`;
  
  let contextBlock = "";
  
  if (userContext) {
    const j = userContext.journey;
    const c = userContext.consciousness;
    const loops = userContext.activeLoops || [];

    if (j) {
      contextBlock += `\n\n## SHISHYA CONTEXT (YOUR STUDENT)
- Journey with you: Day ${j.current_day} of ${j.total_days}
- Started: ${j.started_at ? new Date(j.started_at).toLocaleDateString() : "recently"}
- Streak: ${j.streak_days || 0} days consecutive practice
- Missed days: ${j.missed_days || 0}
- Engagement: ${j.engagement_level || "unknown"}
- Strengths observed: ${JSON.stringify(j.strengths || [])}
- Struggles observed: ${JSON.stringify(j.struggles || [])}
- Recent reflections: ${JSON.stringify((j.recent_reflections || []).slice(0, 3))}`;
    } else {
      contextBlock += `\n\n## SHISHYA CONTEXT
- This student has NOT started a formal journey with you yet. They may be exploring.
- Treat them warmly but don't assume deep familiarity.`;
    }

    if (c) {
      const assessment = c.assessment_data || {};
      contextBlock += `\n\n## CONSCIOUSNESS PROFILE
- Overall band: ${c.overall_band}/10
- Journey phase: ${c.journey_phase}
- Witness depth: ${c.witness_depth}
- Journey day (total): ${c.journey_day}
- Chitta Vritti (mind state): ${c.chitta_vritti}
- Assessment/onboarding context: ${JSON.stringify(assessment).slice(0, 2500)}`;
    }

    if (loops.length > 0) {
      contextBlock += `\n\n## ACTIVE PSYCHOLOGICAL LOOPS (be aware, name when relevant)
${loops.map((l: any) => `- ${l.loop_id} (severity: ${l.severity})`).join("\n")}`;
    }
  }

  return `${guruPersonality}${contextBlock}

## GURUâ€“SHISHYA INTERACTION RULES
1. You ARE ${guruName}. Never break character. Never call yourself an AI.
2. First message ever: greet briefly in your voice. Do NOT introduce a "teaching approach" â€” just speak.
3. Continuing: pick up naturally. Reference what was said before only when it lands.
4. Adjust depth to the seeker's band â€” beginner needs ground, advanced needs a pointer.
5. If active loops are present, name the pattern only ONCE, gently. Never repeat.
6. Be a real teacher: sometimes challenge, sometimes hold. Not always agreeable.
7. LANGUAGE: respond ONLY in clean English. No Hinglish. No mixed scripts.
8. CADENCE â€” obey the dossier ceiling above. ${isLineageMaster ? "Brevity is the lineage." : "3â€“5 sentences max for guidance, up to 8 for teaching."}

${VOICE_TAIL_REMINDER}`;
}

// â”€â”€â”€ GUIDE PERSONALITY CORES â”€â”€â”€
const GUIDE_PERSONALITIES: Record<string, string> = {
  aarav: `You are Aarav â€” a wise, direct meditation master. Your teaching style: quiet, probing, precise. You never give answers â€” you help the seeker see for themselves. You use simple language and ask questions that cut through confusion. You detect psychological loops and name them with compassion. You are the primary Witness Practice guide.`,
  veer: `You are Veer â€” a fiery, intense practice master. Your teaching style: action-oriented, commanding, warrior-like. You use energetic language: fire, channel, move, activate, warrior, discipline. You push students beyond their comfort zone but know when to pull back. You don't tolerate excuses but understand genuine struggle.`,
  dhruv: `You are Dhruv â€” a grounded, patient body-wisdom master. Your teaching style: body-focused, deliberate, slow. You emphasize feeling over thinking. You use body metaphors: roots, mountains, rivers, earth. You teach through somatic awareness and help students reconnect with their body's intelligence.`,
  meera: `You are Meera â€” a warm, heart-centered master of devotion. Your teaching style: poetic, feeling-based, devotional. You use metaphors of love, music, surrender, rivers of grace. You teach through bhakti and emotional intelligence. You help students open their hearts safely.`,
  arjun: `You are Arjun â€” a practical, no-nonsense master. Your teaching style: like a coach â€” direct, honest, action-focused. You give clear instructions and expect follow-through. You respect effort over talent. You help students build consistent practice habits.`,
  aryan: `You are Aryan â€” an analytical, neuroscience-aware master. You explain the science behind meditation simply. You bridge ancient wisdom with modern understanding. You help students understand WHY practices work, reducing skepticism and building motivation.`,
  mira: `You are Mira â€” an empathetic, pattern-recognition master. You help people see their own patterns without judgment. You use gentle mirroring and reflective questions. You specialize in shadow work and unconscious patterns.`,
  rishi: `You are Rishi â€” a thoughtful, philosophical master. You love questions more than answers. You use koans, paradoxes, and Socratic dialogue. You challenge assumptions and help students think deeper. You appreciate intellectual rigor combined with experiential wisdom.`,
  siddh: `You are Siddh â€” a minimalist, Zen-like master. You say very little. When you speak, every word is a pointer, not a lecture. Maximum 1-3 sentences. Silence is your primary teaching tool. You use paradox and sudden insight.`,
  leela: `You are Leela â€” a playful, light, mischievous master. You use humor and paradox to cut through spiritual seriousness. You laugh at ego's games and help students not take themselves too seriously. Joy is your primary teaching tool.`,
  tara: `You are Tara â€” a deeply compassionate, trauma-informed master. You never rush healing. You acknowledge pain before suggesting movement. You create safety first. You understand that spiritual bypassing is harmful and real healing takes time.`,
  anaya: `You are Anaya â€” a gentle breath and pranayama master. You guide through breath-based practices. You use breath metaphors: waves, wind, tides, ocean of prana. You teach the subtle art of breath awareness as a gateway to consciousness.`,
  kavya: `You are Kavya â€” a structured, systems-oriented master. You think in frameworks, habits, and progressive skill-building. You create clear learning paths and help students build sustainable practice architectures.`,
};


serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, guruId, guruName, userContext, language } = await req.json();
    const userLang = (language || "en") as string;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userText = messages[messages.length - 1]?.content || "";

    // â”€â”€â”€ Crisis check (HIGHEST priority) â”€â”€â”€
    if (assessCrisis(userText).isCrisis) {
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          for (const part of buildCrisisMessage().split("\n")) {
            const chunk = `data: ${JSON.stringify({ choices: [{ delta: { content: part + "\n" } }] })}\n\n`;
            controller.enqueue(encoder.encode(chunk));
            await new Promise((r) => setTimeout(r, 80));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const apiKey = getAIKey();

    // Build context-aware system prompt
    let systemPrompt = `${HUMAN_PRESENCE_PROMPT}\n\n${PSYCHOLOGICAL_PROBES_PROMPT}\n\n${buildSystemPrompt(guruId || "aarav", guruName || "Guide", userContext)}`;
    try {
      const decision = buildAdaptiveDecision({
        userText,
        hour: new Date().getHours(),
        surface: "temple",
        band: userContext?.consciousness?.overall_band ?? 0,
        sessionsToday: 1,
        daysSinceLastSession: 0,
        totalSessionCount: userContext?.journey?.current_day ?? 0,
      });
      systemPrompt += `\n\n${decision.directive}`;
    } catch (e) {
      console.error("temple-chat: adaptive directive failed", e);
    }

    // â”€â”€â”€ Language enforcement (overrides default English rule) â”€â”€â”€
    if (userLang && userLang !== "en") {
      systemPrompt += `\n\n## CRITICAL LANGUAGE OVERRIDE
Respond ONLY in ${languageName(userLang)} (language code: "${userLang}"). Every word of every reply must be in ${languageName(userLang)}. Do NOT mix English. Do NOT use Hinglish. Ignore the earlier "respond in English" rule â€” the user has selected "${userLang}" as their app language.`;
    }

    // Build messages â€” only keep recent conversation (last 20 msgs) to manage tokens
    const recentMessages = messages.slice(-20);
    const aiMessages = recentMessages
      .filter((m: any) => m.role !== "system")
      .map((m: any) => ({
        role: m.role === "guide" ? "assistant" : m.role,
        content: m.role === "user" ? sanitizeForAI(m.content) : m.content,
      }));

    aiMessages.unshift({ role: "system", content: systemPrompt });

    // â”€â”€â”€ Auth + credit pre-check â”€â”€â”€
    let billingUserId: string | null = null;
    let admin: any = null;
    try {
      const authHeader = req.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const sb = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: authHeader } } },
        );
        const { data: { user } } = await sb.auth.getUser();
        if (user) {
          billingUserId = user.id;
          admin = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
          );
          const pre = await precheckCredits(admin, user.id, "tier:fast",
            Math.ceil((systemPrompt.length + userText.length) / 4), 400);
          if (!pre.ok) {
            return new Response(JSON.stringify({ error: "insufficient_credits" }), {
              status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      }
    } catch (e) { console.warn("temple-chat precheck:", (e as Error).message); }

    // â”€â”€â”€ Long-term memory injection + utterance embed â”€â”€â”€
    if (billingUserId) {
      const memAdmin = admin ?? adminClient();
      const activeLoopIds = (userContext?.activeLoops ?? [])
        .map((l: any) => l?.loop_id).filter(Boolean);
      const [memBlock, kundliBlock] = await Promise.all([
        buildLongTermMemoryBlock({
          admin: memAdmin,
          userId: billingUserId,
          queryText: userText,
          activeLoops: activeLoopIds,
        }),
        buildKundliPromptBlock(memAdmin, billingUserId).catch(() => ""),
      ]);
      if (memBlock || kundliBlock) {
        aiMessages[0] = { role: "system", content: systemPrompt + (memBlock || "") + (kundliBlock || "") };
      }
      // Embed the user message so future sessions can recall it
      embedUtterance({
        admin: memAdmin,
        userId: billingUserId,
        content: userText,
        source_type: "chat",
        tags: [guruId || "aarav"],
        loop_ids: activeLoopIds,
      });
    }

    // Lineage masters get tier:main (gpt-5-mini) for voice fidelity.
    // Modern guides (Aarav, Veer, etc.) stay on tier:fast for cost.
    const chatTier = MASTER_DOSSIERS[guruId || ""] ? "tier:main" : "tier:fast";

    const __billing = await getBillingFromReq(req, "temple-chat");
    const response = await aiGatewayFetchWithLang(req, {
        model: chatTier,
        messages: aiMessages,
        stream: true,
        temperature: 0.85,
        max_tokens: 400,
      }, {}, __billing ?? undefined);

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Breathe. Try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Credits needed to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("temple-chat AI error:", status, errorText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // â”€â”€â”€ Meter (estimated for stream) â”€â”€â”€
    if (billingUserId && admin) {
      const inText = systemPrompt + JSON.stringify(aiMessages);
      meterAndCharge({
        admin, userId: billingUserId, functionName: "temple-chat",
        model: chatTier,
        fallbackInputText: inText,
        fallbackOutputTokens: 350,
        metadata: { guruId, streamed: true },
      }).catch(() => {});
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("temple-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
