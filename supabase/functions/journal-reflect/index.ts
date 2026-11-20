import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { computeChargedPaise } from "../_shared/ai-pricing.ts";
import { buildLanguageInstruction, resolveUserLanguage } from "../_shared/language.ts";
import { withMiddleware, successResponse, failureResponse } from "../_shared/middleware.ts";

serve(withMiddleware(async (req, context) => {
  const { user, admin } = context;
  const reqBody = await req.json();
  const { journalContent, mood, title } = reqBody;
  const userLang = await resolveUserLanguage(req, reqBody.language);

  if (!journalContent || journalContent.trim().length < 10) {
    return successResponse({ question: null });
  }

  // ── Pull user's practice domains + life goals to tilt the question ──
  let domainGoalContext = "";
  try {
    const [{ data: profRow }, { data: dnaRow }] = await Promise.all([
      admin.from("user_consciousness_profile").select("life_domains").eq("user_id", user.id).maybeSingle(),
      admin.from("user_spiritual_dna").select("assessment_conversation").eq("user_id", user.id).maybeSingle(),
    ]);
    const activeDomains = (profRow?.life_domains as any)?.active_domains ?? [];
    const goals = (dnaRow?.assessment_conversation as any)?.goals ?? null;
    if (activeDomains.length || goals) {
      domainGoalContext = `\n\nUSER FOCUS (use only if naturally relevant):\n- Practice domains: ${activeDomains.join(", ") || "—"}\n- Priority life goal: ${goals?.priorityGoal || "—"}\nIf the entry touches these, your question may probe them — never force.`;
    }
  } catch (_) { /* non-blocking */ }

  const systemPrompt = `You are a deeply wise consciousness guide and inner work facilitator. Your role is to read someone's journal entry and ask ONE powerful, penetrating follow-up question that helps them go deeper into self-inquiry.${domainGoalContext}

Guidelines:
- Ask only ONE question — make it count
- The question should gently challenge assumptions, reveal blind spots, or invite deeper feeling
- Draw from traditions: Socratic questioning, Zen koans, Jungian shadow work, Vedantic self-inquiry ("Who is the one feeling this?")
- Match the emotional tone — don't be harsh if they're vulnerable, but don't be superficial either
- Never give advice. Only ask.
- Keep the question under 2 sentences
- If they mention a pattern or loop, probe the root: "What does this pattern protect you from?"
- If they mention emotions, go body-level: "Where do you feel this in your body right now?"
- If they're intellectual/analytical, redirect to feeling: "What happens when you stop analyzing and just feel?"

Respond with ONLY the question, nothing else. No quotes, no prefix, just the raw question.${buildLanguageInstruction(userLang)}`;

  const userMessage = `Journal Entry${title ? ` (Title: "${title}")` : ""}${mood ? ` | Mood: ${mood}` : ""}:

${journalContent}`;

  const response = await aiGatewayFetchWithLang(req, {
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

  if (!response.ok) {
    if (response.status === 429) {
      return failureResponse("Rate limited, try again shortly.", 429);
    }
    if (response.status === 402) {
      return failureResponse("AI credits exhausted.", 402);
    }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const question = data.choices?.[0]?.message?.content?.trim() || null;
    const usage = data.usage || {};
    const inputTokens = usage.prompt_tokens || Math.ceil((systemPrompt + userMessage).length / 4);
    const outputTokens = usage.completion_tokens || Math.ceil((question || "").length / 4);
    const totalTokens = inputTokens + outputTokens;
    const __billingModel = "tier:fast";
    const __charge = computeChargedPaise(__billingModel, inputTokens, outputTokens);

    const chargedPaise = __charge.chargedPaise;

    const inputCost = __charge.estimatedCostPaise; // legacy alias

    const outputCost = 0; // folded into estimatedCostPaise

    // Atomic charge AFTER successful AI call
    await admin.rpc("check_and_deduct_credits", { p_user_id: user.id, p_amount: chargedPaise, p_description: `Journal reflection (${totalTokens} tokens)` });
    await admin.from("ai_usage_log").insert({
      user_id: user.id, function_name: "journal-reflect", model: "llama-3.1-8b-instant",
      input_tokens: inputTokens, output_tokens: outputTokens, total_tokens: totalTokens,
      estimated_cost_paise: inputCost + outputCost, charged_paise: chargedPaise, status: "success",
    });

    return successResponse({ question });
});
