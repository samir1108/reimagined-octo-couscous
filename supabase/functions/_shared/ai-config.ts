// ============================================================
// Shared AI configuration
// Primary:   Groq direct
// Fallback:  Google Gemini direct
// ------------------------------------------------------------
// Tiered model selection — every caller gets the right model
// for the job without each function having to know provider details.
//
//   TIER_NANO  → cheapest/fastest  (classification, tagging, simple extract)
//   TIER_FAST  → fast + cheap      (short generation, lightweight chat)
//   TIER_MAIN  → balanced default  (chat, generation, most edge fns)
//   TIER_DEEP  → strong reasoning  (analysis, multi-step, recommendations)
//   TIER_PRO   → top-tier          (graduation review, deep audits, master review)
//
// Callers pass either:
//   - a tier identifier ("tier:nano" | "tier:fast" | "tier:main" | "tier:deep" | "tier:pro")
//   - a legacy model id (gpt-5, gpt-5-mini, gemini-2.5-pro, llama-3.x ...)
//   - nothing → TIER_MAIN
// ============================================================

import { sanitizeForAI } from "./sanitize-input.ts";

export const GEMINI_GATEWAY_URL =
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
export const GROQ_GATEWAY_URL =
  "https://api.groq.com/openai/v1/chat/completions";

export const AI_GATEWAY_URL = GROQ_GATEWAY_URL;

/** Per-provider ceiling. Must stay well under the edge worker limit. */
const PROVIDER_TIMEOUT_MS = 30_000;

export function getGeminiKey(): string | null {
  return Deno.env.get("GEMINI_API_KEY") || null;
}
export function getGroqKey(): string | null {
  return Deno.env.get("GROQ_API_KEY") || null;
}

export function getAIKey(): string {
  const k = getGroqKey() || getGeminiKey();
  if (!k) throw new Error("No AI provider key configured (GROQ_API_KEY / GEMINI_API_KEY)");
  return k;
}

// ---------- Tier definitions ----------
export type Tier = "nano" | "fast" | "main" | "deep" | "pro";

const GEMINI_BY_TIER: Record<Tier, string> = {
  nano: "gemini-flash-lite-latest",
  fast: "gemini-flash-lite-latest",
  main: "gemini-flash-latest",
  deep: "gemini-2.5-pro",
  pro:  "gemini-2.5-pro",
};

// Groq is the cheap/fast lane. Deep + Pro deliberately route to Gemini
// first (see `preferGemini` in aiGatewayFetch) — Groq stays as the fallback.
const GROQ_BY_TIER: Record<Tier, string> = {
  nano: "openai/gpt-oss-20b",   // cheapest classifier/extractor tier
  fast: "openai/gpt-oss-120b",
  main: "openai/gpt-oss-120b",
  deep: "openai/gpt-oss-120b",  // fallback only; Gemini Pro serves deep first
  pro:  "openai/gpt-oss-120b",  // fallback only; Gemini Pro serves pro first
};

// Map any legacy/explicit model id → tier
const MODEL_TO_TIER: Record<string, Tier> = {
  // OpenAI family
  "openai/gpt-5":            "deep",
  "openai/gpt-5-mini":       "main",
  "openai/gpt-5-nano":       "nano",
  "openai/gpt-5.2":          "pro",
  "openai/gpt-4o":           "main",
  "openai/gpt-4o-mini":      "fast",
  "gpt-4o-mini":             "fast",
  "gpt-5":                   "deep",
  "gpt-5-mini":              "main",
  "gpt-5-nano":              "nano",

  // Gemini family
  "google/gemini-2.5-pro":           "deep",
  "google/gemini-2.5-flash":         "main",
  "google/gemini-2.5-flash-lite":    "fast",
  "google/gemini-3-flash-preview":   "fast",
  "google/gemini-3.1-pro-preview":   "pro",
  "google/gemini-3.1-flash-preview": "fast",
  "gemini-2.5-pro":                  "deep",
  "gemini-flash-latest":             "main",
  "gemini-flash-lite-latest":        "fast",

  // Groq family
  "llama-3.3-70b-versatile":         "main",
  "llama-3.1-8b-instant":            "nano",
  "openai/gpt-oss-20b":              "fast",
  "openai/gpt-oss-120b":             "main",
  "moonshotai/kimi-k2-instruct":     "deep",
  "moonshotai/kimi-k2-instruct-0905": "deep",
};

function resolveTier(input?: string | null): Tier {
  if (!input) return "main";
  if (input.startsWith("tier:")) {
    const t = input.slice(5) as Tier;
    return (["nano","fast","main","deep","pro"].includes(t) ? t : "main");
  }
  return MODEL_TO_TIER[input] ?? "main";
}

export function mapModel(input?: string | null): string {
  return GROQ_BY_TIER[resolveTier(input)];
}

/** Public helper so callers can request a tier explicitly: `model: pickModel("deep")` */
export function pickModel(tier: Tier): string {
  return `tier:${tier}`;
}

// ============================================================
// Drop-in fetch wrapper — Groq → Gemini
//
// Optional `billing` arg auto-meters non-streaming JSON responses:
//   await aiGatewayFetch(body, {}, { admin, userId, functionName })
// Streaming responses are skipped (caller meters with fallback tokens).
// ============================================================

export type AiMode = "fast" | "premium";

export interface BillingContext {
  admin: any;
  userId: string;
  functionName: string;
  aiMode?: AiMode;
  metadata?: Record<string, unknown>;
}

/**
 * Drop-in wrapper that auto-injects the user's language preference
 * as a high-priority system message before any other messages.
 * Use this from edge functions that have access to the incoming Request.
 */
export async function aiGatewayFetchWithLang(
  req: Request,
  body: Record<string, unknown>,
  extraHeaders: Record<string, string> = {},
  billing?: BillingContext,
): Promise<Response> {
  try {
    const { resolveUserLanguage, buildLanguageInstruction } = await import("./language.ts");
    const explicit = (body as any).userLanguage as string | undefined;
    const lang = await resolveUserLanguage(req, explicit);
    const instruction = buildLanguageInstruction(lang).trim();
    const messages = Array.isArray((body as any).messages) ? [...(body as any).messages] : [];
    if (instruction && messages.length > 0) {
      messages.unshift({ role: "system", content: instruction });
    }
    const newBody: Record<string, unknown> = { ...body, messages };
    delete (newBody as any).userLanguage;
    return aiGatewayFetch(newBody, extraHeaders, billing);
  } catch (e) {
    console.warn("[ai-config] language injection failed:", (e as Error).message);
    return aiGatewayFetch(body, extraHeaders, billing);
  }
}

export async function aiGatewayFetch(
  body: Record<string, unknown>,
  extraHeaders: Record<string, string> = {},
  billing?: BillingContext,
): Promise<Response> {
  const geminiKey  = getGeminiKey();
  const groqKey    = getGroqKey();
  const inputModel = (body as any).model as string | undefined;
  const requestedTier = resolveTier(inputModel);
  const isStream = (body as any).stream === true;
  const aiMode: AiMode = billing?.aiMode ?? "fast";
  // Premium users get a real upgrade: a default/main-tier request is promoted
  // to the deep (frontier) tier. nano/fast stay cheap for classification work.
  const tier: Tier =
    aiMode === "premium" && requestedTier === "main" ? "deep" : requestedTier;
  // Deep reasoning tiers are served by Gemini first; Groq is the fallback.
  const preferGemini = tier === "deep" || tier === "pro";
  const meterModel = `tier:${tier}`;

  // ─── Sanitize user messages to prevent prompt injection ───
  const messages = Array.isArray((body as any).messages) ? [...(body as any).messages] : [];
  const sanitizedMessages = messages.map((m: any) => ({
    ...m,
    content: m.role === "user" ? sanitizeForAI(m.content ?? "") : m.content,
  }));
  const sanitizedBody = { ...body, messages: sanitizedMessages };

  // ─── Rate limit check (when billing context is available) ───
  if (billing?.admin && billing?.userId) {
    try {
      const { checkRateLimit } = await import("./rate-limit.ts");
      const rateResult = await checkRateLimit(
        billing.admin,
        billing.userId,
        { maxRequests: 30, windowMs: 60 * 1000, scope: "user" },
        billing.functionName,
      );
      if (!rateResult.allowed) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please wait a moment before trying again.",
            retryAfter: Math.ceil((new Date(rateResult.resetAt).getTime() - Date.now()) / 1000),
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": String(Math.ceil((new Date(rateResult.resetAt).getTime() - Date.now()) / 1000)),
            },
          },
        );
      }
    } catch (e) {
      console.warn("[ai-config] rate limit check failed:", e);
    }
  }

  // Auto-meter helper: only for non-streaming JSON responses.
  // Always returns a NEW Response (clone) so caller can read body normally.
  async function maybeMeter(
    resp: Response,
    provider: "groq" | "gemini",
    servedModel: string,
  ): Promise<Response> {
    if (!billing || isStream || !resp.ok) return resp;
    try {
      const clone = resp.clone();
      const json = await clone.json();
      const { meterAndCharge } = await import("./ai-billing.ts");
      const fallbackInputText = JSON.stringify((sanitizedBody as any).messages || "");
      const fallbackOutputText =
        json?.choices?.[0]?.message?.content ??
        json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ?? "";
      await meterAndCharge({
        admin: billing.admin,
        userId: billing.userId,
        functionName: billing.functionName,
        model: meterModel,
        response: json,
        fallbackInputText,
        fallbackOutputText: typeof fallbackOutputText === "string" ? fallbackOutputText : JSON.stringify(fallbackOutputText),
        provider,
        servedModel,
        metadata: { ...(billing.metadata || {}), ai_mode: aiMode },
      });
      return new Response(JSON.stringify(json), {
        status: resp.status,
        headers: resp.headers,
      });
    } catch (e) {
      console.warn(`[ai-config] auto-meter failed for ${billing.functionName}:`, (e as Error).message);
      return resp;
    }
  }

  // ────────────────────────────────────────────────────────────
  // Provider selection:
  //   nano/fast/main → Groq first (cheap & fast), Gemini as fallback
  //   deep/pro       → Gemini first (frontier model), Groq as fallback
  // Every tier now resolves to a genuinely different model.
  // ────────────────────────────────────────────────────────────
  type ProviderName = "groq" | "gemini";
  const providers: Array<{ name: ProviderName; key: string; url: string; model: string }> = [];

  if (preferGemini && geminiKey) {
    providers.push({ name: "gemini", key: geminiKey, url: GEMINI_GATEWAY_URL, model: GEMINI_BY_TIER[tier] });
  }
  if (groqKey) {
    providers.push({ name: "groq", key: groqKey, url: GROQ_GATEWAY_URL, model: GROQ_BY_TIER[tier] });
  }
  if (geminiKey && !preferGemini) {
    providers.push({ name: "gemini", key: geminiKey, url: GEMINI_GATEWAY_URL, model: GEMINI_BY_TIER[tier] });
  }

  let lastResponse: Response | null = null;
  for (const provider of providers) {
    try {
      const remapped = { ...sanitizedBody, model: provider.model };
      const resp = await fetch(provider.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.key}`,
          ...extraHeaders,
        },
        body: JSON.stringify(remapped),
        // A provider that accepts the socket but never answers used to hold the
        // whole edge function open until the worker was killed (HTTP 546).
        signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      });
      if (resp.ok) return await maybeMeter(resp, provider.name, provider.model);
      lastResponse = resp;
      const errText = await resp.clone().text().catch(() => "");
      console.warn(
        `[ai-config] ${provider.name} ${resp.status} (model=${provider.model}): ${errText.slice(0, 400)}`,
      );
    } catch (e) {
      console.warn(`[ai-config] ${provider.name} network error; trying next provider:`, (e as Error).message);
    }
  }

  // Preserve the upstream status (429/402/etc.) so callers can react correctly.
  if (lastResponse) return lastResponse;

  throw new Error(
    "No AI provider available (GROQ_API_KEY / GEMINI_API_KEY both missing or failing)",
  );
}
