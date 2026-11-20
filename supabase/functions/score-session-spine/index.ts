// ============================================================
// score-session-spine — SANKALPA T5
// ------------------------------------------------------------
// Input:  { spineId, finalUserSentence?, stepCompletions?: Array<{index, completed, timeSpentSec?, rating?}>, durationSec?, mood? }
// Action: LLM scores quality 0..1 from signals + user sentence; writes
//         session_spine.quality_score + final_user_sentence. Feeds the
//         adaptive composer (which reads archetype quality history).
// Output: { ok, qualityScore, breakdown }
// ============================================================
import { createClient } from "npm:@supabase/supabase-js@2";
import { aiGatewayFetch, type AiMode } from "../_shared/ai-config.ts";
import { withMiddleware, successResponse, failureResponse } from "../_shared/middleware.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY     = Deno.env.get("SUPABASE_ANON_KEY")!;

function safeJSON<T = unknown>(s: string | undefined | null): T | null {
  if (!s) return null;
  try { return JSON.parse(s) as T; } catch {
    const m = s.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]) as T; } catch { /**/ } }
    return null;
  }
}

Deno.serve(withMiddleware(async (req, context) => {
  const { user, admin } = context;

  const body = await req.json().catch(() => ({} as any));
  const spineId: string | undefined = body.spineId;
  const finalUserSentence: string | undefined = body.finalUserSentence;
  const stepCompletions: Array<{ index: number; completed?: boolean; timeSpentSec?: number; rating?: number }> = Array.isArray(body.stepCompletions) ? body.stepCompletions : [];
  const durationSec: number | undefined = body.durationSec;
  const mood: string | undefined = body.mood;
  if (!spineId) return failureResponse("spineId required", 400);

  const { data: spine, error: spineErr } = await admin
    .from("session_spine")
    .select("id, user_id, archetype, lead_master, primary_loop_id, primary_dimension, chakra_focus, why_for_you, ai_mode")
    .eq("id", spineId)
    .maybeSingle();
  if (spineErr || !spine) return failureResponse("spine not found", 404);
  if (spine.user_id !== user.id) return failureResponse("Forbidden", 403);

  const aiMode: AiMode = spine.ai_mode === "premium" ? "premium" : "fast";

  // ── Heuristic baseline (always available) ──
  const totalSteps = Array.isArray(spine.why_for_you) ? (spine.why_for_you as any[]).length : 0;
  const completedSteps = stepCompletions.filter((s) => s.completed).length;
  const completionRate = totalSteps ? completedSteps / totalSteps : 0;
  const avgRating = (() => {
    const rated = stepCompletions.filter((s) => typeof s.rating === "number");
    if (!rated.length) return null;
    return rated.reduce((a, s) => a + (s.rating ?? 0), 0) / rated.length;
  })();
  const sentenceWeight = Math.min(1, (finalUserSentence?.trim().length ?? 0) / 80);

  let heuristic = 0.35 * completionRate + 0.25 * sentenceWeight;
  if (avgRating != null) heuristic += 0.25 * Math.max(0, Math.min(1, avgRating / 5));
  heuristic = Math.max(0, Math.min(1, heuristic + 0.15)); // floor bias for any engagement

  // ── LLM resonance scoring ──
  let llmScore: number | null = null;
  let breakdown: Record<string, number> | null = null;
  let summary = "";
  try {
    const sys = [
      "You score how RESONANT a just-completed contemplative session was for this user (0..1).",
      "Consider the user's closing sentence (most weight), step completion, ratings, and mood vs the session's intent.",
      "Return ONLY JSON: {\"score\":number 0..1,\"resonance\":number 0..1,\"depth\":number 0..1,\"honesty\":number 0..1,\"summary\":string ≤24 words}.",
      "Be honest — empty/avoidant closings score low; specific, emotionally honest closings score high.",
    ].join("\n");
    const usr = [
      `ARCHETYPE: ${spine.archetype}  LEAD: ${spine.lead_master}`,
      `LOOP: ${spine.primary_loop_id ?? "—"}  DIM: ${spine.primary_dimension ?? "—"}  CHAKRA: ${spine.chakra_focus ?? "—"}`,
        `STEPS COMPLETED: ${completedSteps}/${totalSteps}`,
        avgRating != null ? `AVG STEP RATING: ${avgRating.toFixed(2)}/5` : "AVG STEP RATING: (none)",
        durationSec ? `DURATION: ${Math.round(durationSec / 60)} min` : "",
        mood ? `POST-SESSION MOOD: ${mood}` : "",
        `USER'S CLOSING SENTENCE: "${(finalUserSentence ?? "(none)").slice(0, 600)}"`,
      ].filter(Boolean).join("\n");

      const r = await aiGatewayFetch(
        {
          model: "tier:fast",
          messages: [{ role: "system", content: sys }, { role: "user", content: usr }],
          response_format: { type: "json_object" },
        },
        {},
        { admin, userId: user.id, functionName: "score-session-spine:rate", aiMode },
      );
      if (r.ok) {
        const j = await r.json();
        const parsed = safeJSON<{ score: number; resonance: number; depth: number; honesty: number; summary: string }>(
          j?.choices?.[0]?.message?.content,
        );
        if (parsed && typeof parsed.score === "number") {
          llmScore = Math.max(0, Math.min(1, parsed.score));
          breakdown = {
            resonance: Math.max(0, Math.min(1, Number(parsed.resonance) || 0)),
            depth:     Math.max(0, Math.min(1, Number(parsed.depth) || 0)),
            honesty:   Math.max(0, Math.min(1, Number(parsed.honesty) || 0)),
          };
          summary = String(parsed.summary || "").slice(0, 200);
        }
      }
    } catch (e) { console.warn("[score-spine] llm failed:", (e as Error).message); }

    const qualityScore = llmScore != null
      ? Number((0.6 * llmScore + 0.4 * heuristic).toFixed(3))
      : Number(heuristic.toFixed(3));

    await admin.from("session_spine").update({
      quality_score: qualityScore,
      final_user_sentence: finalUserSentence ? finalUserSentence.slice(0, 600) : null,
    }).eq("id", spineId);

    return successResponse({
      ok: true,
      qualityScore,
      llmScore,
      heuristic: Number(heuristic.toFixed(3)),
      breakdown,
      summary,
      completedSteps,
      totalSteps,
    });
});
