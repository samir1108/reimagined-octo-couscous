import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiGatewayFetchWithLang, getAIKey } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";
import { LOOP_REFERENCE } from "../_shared/loop-library.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { withMiddleware, successResponse } from "../_shared/middleware.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(withMiddleware(async (req, context) => {
  const { user, admin } = context;

  const { messages } = await req.json();
  if (!messages || messages.length < 2) {
    return successResponse({ loops: [], sources: [] });
  }

  const systemPrompt = `You are a consciousness analyst with access to a comprehensive loop library. Analyze the USER messages in this conversation to detect:

1. **Active Loops** â€” Recurring behavioral/thought patterns. You MUST use exact loop IDs from the library below. Match patterns to the most specific loop available.

${LOOP_REFERENCE}

2. **Speaking Source** â€” What part of the user is speaking? Identify the PRIMARY source and any secondary:
   - "mind" â€” Analytical, logical, problem-solving. Rationalization or intellectualization.
   - "heart" â€” Emotional, feeling-based. Vulnerability, love, grief, longing.
   - "gut" â€” Instinctual, survival-based. Fight/flight/freeze. Raw impulse.
   - "body" â€” Somatic, physical sensation-based. Tension, fatigue, restlessness.
   - "identity" â€” Speaking from a fixed self-concept. "I amâ€¦" statements. Ego-based.
   - "fear" â€” Fear-driven. Anxiety, worry about future, avoiding pain.
   - "witness" â€” Observing without attachment. Meta-awareness. Present-moment clarity.

Respond with ONLY valid JSON (no markdown):
{
  "loops": [
    { "id": "VAL001", "name": "People-Pleasing", "confidence": 0.85, "evidence": "short quote from user", "why": "1-2 sentence explanation of WHY this pattern is active right now" }
  ],
  "sources": [
    { "type": "mind", "strength": 0.7, "evidence": "short quote", "insight": "1-2 sentence insight about what this source is trying to do" }
  ],
  "overall_insight": "A brief 1-2 sentence meta-observation about the user's current inner state"
}

Rules:
- Only detect patterns with confidence >= 0.6
- Max 3 loops, max 3 sources
- Be specific with evidence â€” quote actual user words
- If no clear patterns, return empty arrays
- Sources should be sorted by strength descending
- CRITICAL: Only use loop IDs that exist in the library above. Do NOT invent new IDs.`;

    const __billing = await getBillingFromReq(req, "live-detect");

    const response = await aiGatewayFetchWithLang(req, {
        model: "tier:fast",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: any) => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.3,
      }, {}, __billing ?? undefined);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI error:", response.status, await response.text());
      return new Response(JSON.stringify({ loops: [], sources: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "{}";

    // Parse JSON from response (strip markdown fences if present)
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      parsed = { loops: [], sources: [] };
    }

    // ----------------------------------------------------------------
    // PHASE 4: Absorb detected loops + sources into engine_signals so
    // suggest-next-program (Master-of-Masters router) can react. Best-effort.
    // ALSO: persist into loop_attributions (analytics) + emit loop_detected
    // bus signal + queue a notification â€” with 6h dedupe per loop.
    // ----------------------------------------------------------------
    try {
      const signalRows: any[] = [];
      const detectedLoops = Array.isArray(parsed?.loops) ? parsed.loops : [];

      const since6h = new Date(Date.now() - 6 * 60 * 60_000).toISOString();
      const { data: recentAttrs } = await admin
        .from("loop_attributions")
        .select("loop_id")
        .eq("user_id", user.id)
        .gte("created_at", since6h);
      const recentLoopIds = new Set((recentAttrs ?? []).map((r: any) => r.loop_id));

      const attrRows: any[] = [];
      const notifRows: any[] = [];

      for (const l of detectedLoops.slice(0, 3)) {
        if (!l?.id || typeof l.confidence !== "number" || l.confidence < 0.6) continue;

        signalRows.push({
          user_id: user.id,
          signal_type: "active_loop",
          loop_id: String(l.id),
          urgency: Math.min(0.99, Math.max(0.5, Number(l.confidence))),
          source: "guide-chat",
          context: { evidence: l.evidence ?? null, why: l.why ?? null },
        });
        // NEW: fires ConsciousnessBusListener toast + haptic on the client
        signalRows.push({
          user_id: user.id,
          signal_type: "loop_detected",
          loop_id: String(l.id),
          urgency: Math.min(0.99, Math.max(0.6, Number(l.confidence))),
          source: "guide-live-detect",
          context: { name: l.name ?? null, evidence: l.evidence ?? null, why: l.why ?? null },
        });

        if (recentLoopIds.has(String(l.id))) continue; // dedupe persistence + notif

        attrRows.push({
          user_id: user.id,
          loop_id: String(l.id),
          loop_name: l.name ?? null,
          window_label: "3h",
          confidence: Math.min(1, Math.max(0, Number(l.confidence))),
          sources: ["guide-live-detect"],
          contributing_signals: [{ kind: "live_detection", evidence: l.evidence ?? null }],
          rationale: typeof l.why === "string" && l.why
            ? l.why
            : (l.evidence ?? "Detected during a Guide conversation."),
        });

        if (Number(l.confidence) >= 0.7) {
          notifRows.push({
            user_id: user.id,
            type: "insight",
            title: `A loop surfaced: ${l.name ?? l.id}`,
            body: typeof l.why === "string" && l.why
              ? l.why
              : `Noticed just now â€” ${l.evidence ?? "open Analytics to see why."}`,
            metadata: {
              loop_id: String(l.id),
              loop_name: l.name ?? null,
              confidence: Number(l.confidence),
              source: "guide-live-detect",
              evidence: l.evidence ?? null,
            },
          });
        }
      }

      const sources = Array.isArray(parsed?.sources) ? parsed.sources : [];
      const top = sources[0];
      if (top?.type && Number(top.strength ?? 0) >= 0.7) {
        const map: Record<string, { signal_type: string; practice_id?: string }> = {
          fear:     { signal_type: "needs_practice", practice_id: "breath" },
          heart:    { signal_type: "needs_practice", practice_id: "emotional-healing" },
          mind:     { signal_type: "needs_inquiry",  practice_id: "self-inquiry" },
          gut:      { signal_type: "needs_practice", practice_id: "body" },
          identity: { signal_type: "needs_inquiry",  practice_id: "jnana" },
          witness:  { signal_type: "breakthrough",   practice_id: "witness" },
        };
        const m = map[top.type];
        if (m) {
          signalRows.push({
            user_id: user.id,
            signal_type: m.signal_type,
            practice_id: m.practice_id ?? null,
            urgency: Math.min(0.95, Number(top.strength)),
            source: "guide-chat",
            context: { source_type: top.type, evidence: top.evidence ?? null, insight: top.insight ?? null },
          });
        }
      }

      if (signalRows.length) await admin.from("engine_signals").insert(signalRows);
      if (attrRows.length) await admin.from("loop_attributions").insert(attrRows);
      if (notifRows.length) await admin.from("notifications").insert(notifRows);
    } catch (sigErr) {
      console.warn("[live-detect] signal absorption failed:", (sigErr as Error).message);
    }

    // Deduct credits (lightweight analysis = 10 paise)
    await admin.rpc("check_and_deduct_credits", {
      p_user_id: user.id,
      p_amount: 10,
      p_description: "Live detection analysis",
    });

    // Log usage
    await admin.from("ai_usage_log").insert({
      user_id: user.id,
      function_name: "live-detect",
      model: "tier:fast",
      input_tokens: aiResult.usage?.prompt_tokens || 0,
      output_tokens: aiResult.usage?.completion_tokens || 0,
      total_tokens: aiResult.usage?.total_tokens || 0,
      estimated_cost_paise: 10,
      charged_paise: 10,
      status: "success",
    });

    return successResponse(parsed);
}));
