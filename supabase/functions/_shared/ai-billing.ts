// ============================================================
// Unified AI billing helper
// One call → meter tokens, deduct credits, log usage.
//
// Usage (non-streaming):
//   const resp = await aiGatewayFetch({ model: pickModel("main"), messages });
//   const data = await resp.json();
//   await meterAndCharge({
//     admin, user, functionName: "journal-reflect",
//     model: "tier:main", response: data,
//     fallbackInputText: systemPrompt + userMsg,
//     fallbackOutputText: data?.choices?.[0]?.message?.content,
//   });
//
// Usage (streaming): pass response.body=null and supply fallback text/tokens.
//
// All edge functions that hit the AI gateway should use this so the
// 75% AI / 25% infra split, atomic deduction, and ai_usage_log entry
// are guaranteed consistent.
// ============================================================

import { computeChargedPaise, resolveTierFromModel } from "./ai-pricing.ts";
import type { Tier } from "./ai-config.ts";

interface MeterArgs {
  admin: any;                              // service-role supabase client
  userId: string;
  functionName: string;
  model: string;                           // "tier:main" or any legacy id
  // Either provide a parsed JSON response with usage, OR fallback text/tokens.
  response?: any;                          // OpenAI-shaped JSON (with .usage)
  fallbackInputText?: string;
  fallbackOutputText?: string;
  fallbackInputTokens?: number;
  fallbackOutputTokens?: number;
  metadata?: Record<string, unknown>;
  status?: "success" | "error";
  errorMessage?: string;
  /** Which provider actually served the request (for COGS analytics). */
  provider?: "groq" | "gemini" | "openai" | "unknown";
  /** The exact model id the provider returned. */
  servedModel?: string;
}

export interface MeterResult {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  chargedPaise: number;
  estimatedCostPaise: number;
  actualProviderCostPaise: number;
  provider: string;
  tier: Tier;
}

const tokensFromText = (s?: string) =>
  s ? Math.max(1, Math.ceil(s.length / 4)) : 0;

/**
 * Extract token usage with safe fallbacks, deduct credits atomically,
 * log to ai_usage_log. Never throws — billing failures are logged only.
 */
export async function meterAndCharge(args: MeterArgs): Promise<MeterResult | null> {
  try {
    const usage = args.response?.usage || {};
    const inputTokens =
      usage.prompt_tokens ??
      usage.input_tokens ??
      args.fallbackInputTokens ??
      tokensFromText(args.fallbackInputText);
    const outputTokens =
      usage.completion_tokens ??
      usage.output_tokens ??
      args.fallbackOutputTokens ??
      tokensFromText(args.fallbackOutputText);

    const charge = computeChargedPaise(args.model, inputTokens, outputTokens, {
      provider: args.provider,
    });
    const totalTokens = inputTokens + outputTokens;

    // Atomic credit deduction (idempotent enough for a single call)
    try {
      await args.admin.rpc("check_and_deduct_credits", {
        p_user_id: args.userId,
        p_amount: charge.chargedPaise,
        p_description: `${args.functionName} (${totalTokens} tok, tier:${charge.tier})`,
      });
    } catch (e) {
      console.warn(`[ai-billing] deduct failed for ${args.functionName}:`, (e as Error).message);
    }

    // Append to ai_usage_log
    try {
      await args.admin.from("ai_usage_log").insert({
        user_id: args.userId,
        function_name: args.functionName,
        model: args.model,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: totalTokens,
        estimated_cost_paise: charge.estimatedCostPaise,
        charged_paise: charge.chargedPaise,
        status: args.status ?? "success",
        error_message: args.errorMessage ?? null,
        metadata: {
          tier: charge.tier,
          provider: args.provider ?? "unknown",
          served_model: args.servedModel ?? null,
          actual_provider_cost_paise: charge.actualProviderCostPaise,
          margin_paise: charge.chargedPaise - charge.actualProviderCostPaise,
          ...(args.metadata || {}),
        },
      });
    } catch (e) {
      console.warn(`[ai-billing] log failed for ${args.functionName}:`, (e as Error).message);
    }

    return {
      inputTokens,
      outputTokens,
      totalTokens,
      chargedPaise: charge.chargedPaise,
      estimatedCostPaise: charge.estimatedCostPaise,
      actualProviderCostPaise: charge.actualProviderCostPaise,
      provider: args.provider ?? "unknown",
      tier: charge.tier,
    };
  } catch (e) {
    console.warn("[ai-billing] meterAndCharge fatal:", (e as Error).message);
    return null;
  }
}

/**
 * Pre-flight credit check helper.
 * Returns { ok, required, balance } — caller decides whether to 402.
 */
export async function precheckCredits(
  admin: any,
  userId: string,
  model: string,
  expectedInputTokens: number,
  expectedOutputTokens: number,
) {
  const charge = computeChargedPaise(model, expectedInputTokens, expectedOutputTokens);
  try {
    const { data } = await admin.rpc("check_credit_balance", {
      p_user_id: userId,
      p_min_balance: charge.chargedPaise,
    });
    return {
      ok: !!data?.sufficient,
      requiredPaise: charge.chargedPaise,
      balancePaise: data?.balance ?? null,
      tier: charge.tier,
    };
  } catch (e) {
    console.warn("[ai-billing] precheck failed:", (e as Error).message);
    // Fail-open so we don't block users on transient errors
    return { ok: true, requiredPaise: charge.chargedPaise, balancePaise: null, tier: charge.tier };
  }
}

export { resolveTierFromModel };

/**
 * ── Streaming metering ────────────────────────────────────────────────
 * `aiGatewayFetch` cannot meter a streamed response: the usage block arrives
 * after the connection closes and `maybeMeter` deliberately skips streams.
 *
 * Callers that use `stream: true` must therefore meter manually once the SSE
 * body has been written. This helper does exactly that, using fallback
 * estimates so a streamed call is still charged rather than being free.
 *
 * Usage:
 *   const streamed = await aiGatewayFetchWithLang(req, { ..., stream: true }, billing);
 *   if (streamed.ok && streamed.body) {
 *     const [toClient, meter] = streamed.body.tee();
 *     await new Promise(r => meter.readAll().then(r));
 *     await meterStreamingCall({ admin, userId, functionName: "guide-chat",
 *                                model: "tier:fast", inputText, outputText });
 *   }
 */
export interface StreamingMeterArgs {
  admin: any;
  userId: string;
  functionName: string;
  model: string;
  /** Text actually sent as the prompt (used to estimate input tokens). */
  inputText: string;
  /** Text actually generated, or drained from the stream if not collected. */
  outputText?: string;
  /** Override when the caller already knows the served provider. */
  provider?: "groq" | "gemini" | "openai" | "unknown";
  metadata?: Record<string, unknown>;
}

export async function meterStreamingCall(args: StreamingMeterArgs): Promise<MeterResult | null> {
  return meterAndCharge({
    admin: args.admin,
    userId: args.userId,
    functionName: args.functionName,
    model: args.model,
    fallbackInputTokens: tokensFromText(args.inputText),
    fallbackOutputTokens: tokensFromText(args.outputText),
    provider: args.provider ?? "unknown",
    metadata: { ...(args.metadata || {}), streamed: true },
  });
}

/**
 * Tee a streaming Response body so the client keeps receiving SSE while a
 * shadow copy is drained and metered. Returns a body safe to hand to
 * `new Response(...)` — when metering isn't possible the original body is
 * returned untouched.
 */
export function meterDrainedStream(
  body: ReadableStream<Uint8Array>,
  args: Omit<StreamingMeterArgs, "outputText">,
): ReadableStream<Uint8Array> | null {
  try {
    if (typeof (body as ReadableStream & { tee?: () => ReadableStream<Uint8Array>[] }).tee !== "function") {
      return body;
    }
    const [toClient, shadow] = body.tee();
    let drainedText = "";
    const reader = shadow.getReader();
    void (async () => {
      try {
        // deno-lint-ignore no-explicit-any
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) drainedText += new TextDecoder().decode(value);
        }
      } catch { /* client hung up; meter what we drained */ }
      finally {
        // Strip the SSE framing ("data: " prefixes, [DONE]) so the token
        // estimate reflects generated content, not protocol overhead.
        const content = drainedText.replace(/^data:\s*/gm, "").replace(/\[DONE\]/g, "");
        await meterStreamingCall({ ...args, outputText: content });
      }
    })();
    return toClient;
  } catch {
    return body;
  }
}
