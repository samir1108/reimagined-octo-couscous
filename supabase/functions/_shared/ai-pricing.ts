// ============================================================
// AI Pricing — single source of truth for per-call cost math
//
// Economic model (matches purchase-side split in payment-config):
//   User pays ₹100  →  gets ₹75 of AI credits  →  ₹25 = infra/margin
//
// On every AI call we therefore charge the user:
//   chargedPaise = rawAiCostPaise / 0.75   (≈ 1.333× raw cost)
// so that across the lifetime of those credits, 25% stays with infra
// and 75% pays the actual model bill.
//
// Prices below are **paise per 1K tokens** (1 paise = 0.01 INR).
// Conversion assumed: $1 USD ≈ ₹84 ≈ 8400 paise (round up for safety).
// Source: OpenAI public pricing for gpt-5 family (per 1M tokens):
//   gpt-5-nano  : $0.05 in / $0.40 out   →  paise/1K  ~0.42 in / ~3.36 out
//   gpt-5-mini  : $0.25 in / $2.00 out   →  paise/1K  ~2.10 in / ~16.8 out
//   gpt-5       : $1.25 in / $10.00 out  →  paise/1K  ~10.5 in / ~84   out
//   gpt-5.2     : $2.00 in / $15.00 out  →  paise/1K  ~16.8 in / ~126  out
//   gemini-3-flash (ConsciousOS fallback)    →  paise/1K  ~0.84 in / ~6.7 out
// We round UP to keep margin safe.
// ============================================================

import type { Tier } from "./ai-config.ts";

// AI cost share inside each user credit (mirror of payment-config.creditMultiplier).
// 0.75 = 75/25 split: 75% of each user credit pays the real AI bill, 25% is infra/margin.
// MUST equal PAYMENT_CONFIG.creditMultiplier (see payment-config.ts) — enforced by test.
export const AI_COST_SHARE = 0.75;
// Markup applied to raw AI cost before charging the user.
// rawCost / 0.75 ≈ 1.333× — keeps the lifetime economics consistent with the purchase split.
export const INFRA_MARKUP = 1 / AI_COST_SHARE;

interface PricePer1k {
  inputPaise:  number;
  outputPaise: number;
}

// Default tier pricing — anchored to OpenAI / Gemini public rates.
// This is what we charge the USER (their wallet doesn't care which provider served).
const TIER_PRICE: Record<Tier, PricePer1k> = {
  nano: { inputPaise: 1,  outputPaise: 4   },  // gpt-5-nano  (rounded up)
  fast: { inputPaise: 1,  outputPaise: 7   },  // gemini-3-flash
  main: { inputPaise: 3,  outputPaise: 17  },  // gpt-5-mini
  deep: { inputPaise: 11, outputPaise: 84  },  // gpt-5
  pro:  { inputPaise: 17, outputPaise: 126 },  // gpt-5.2
};

// Per-provider true bill (paise / 1K tokens). Used for accurate cost analytics
// (margin tracking, COGS reporting). Charged amount to user is unchanged.
//
// Groq public pricing (Nov 2025):
//   llama-3.1-8b-instant     : $0.05 in / $0.08 out  per 1M  → ~0.42 in / ~0.67 out paise/1K
//   llama-3.3-70b-versatile  : $0.59 in / $0.79 out  per 1M  → ~4.95 in / ~6.64 out paise/1K
// Gemini direct (same as fast tier).
export type ServedProvider = "groq" | "gemini" | "openai" | "unknown";

const PROVIDER_PRICE: Record<ServedProvider, Record<Tier, PricePer1k>> = {
  groq: {
    nano: { inputPaise: 1, outputPaise: 1 },  // llama-3.1-8b-instant
    fast: { inputPaise: 1, outputPaise: 1 },  // llama-3.1-8b-instant
    main: { inputPaise: 5, outputPaise: 7 },  // llama-3.3-70b-versatile
    deep: { inputPaise: 5, outputPaise: 7 },  // llama-3.3-70b-versatile (best Groq has)
    pro:  { inputPaise: 5, outputPaise: 7 },
  },
  openai: TIER_PRICE,
  gemini:  TIER_PRICE,
  unknown: TIER_PRICE,
};

// Map any legacy model id → tier so old callers keep working
const MODEL_TIER_MAP: Record<string, Tier> = {
  // OpenAI GPT-5
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
  // OpenAI GPT-5.4 / 5.5 (Premium mode)
  "openai/gpt-5.4-nano":     "nano",
  "openai/gpt-5.4-mini":     "fast",
  "openai/gpt-5.4":          "main",
  "openai/gpt-5.4-pro":      "pro",
  "openai/gpt-5.5":          "deep",
  "openai/gpt-5.5-pro":      "pro",
  // Gemini
  "google/gemini-2.5-pro":           "deep",
  "google/gemini-2.5-flash":         "main",
  "google/gemini-2.5-flash-lite":    "fast",
  "google/gemini-3-flash-preview":   "fast",
  "google/gemini-3.1-pro-preview":   "pro",
  "google/gemini-3.1-flash-preview": "fast",
  "gemini-flash-latest":             "main",
  "gemini-flash-lite-latest":        "fast",
  "gemini-2.5-pro":                  "deep",
  // Legacy Groq strings (still resolved gracefully)
  "llama-3.3-70b-versatile":         "main",
  "llama-3.1-8b-instant":            "fast",
};

// Premium pricing (GPT-5.5 family) — significantly higher than tier defaults.
// Rough public pricing: gpt-5.5 ≈ $5 in / $40 out per 1M  → ~42 in / ~336 out per 1K paise.
const PREMIUM_MODEL_PRICE: Record<string, PricePer1k> = {
  "openai/gpt-5.4-nano": { inputPaise: 2,  outputPaise: 8   },
  "openai/gpt-5.4-mini": { inputPaise: 5,  outputPaise: 25  },
  "openai/gpt-5.4":      { inputPaise: 17, outputPaise: 126 },
  "openai/gpt-5.4-pro":  { inputPaise: 50, outputPaise: 400 },
  "openai/gpt-5.5":      { inputPaise: 42, outputPaise: 336 },
  "openai/gpt-5.5-pro":  { inputPaise: 84, outputPaise: 672 },
};

export function resolveTierFromModel(model?: string | null): Tier {
  if (!model) return "main";
  if (model.startsWith("tier:")) {
    const t = model.slice(5) as Tier;
    return (["nano","fast","main","deep","pro"].includes(t) ? t : "main");
  }
  return MODEL_TIER_MAP[model] ?? "main";
}

export interface ChargeResult {
  /** Paise we deduct from the user's wallet (raw AI cost + 25% infra margin). */
  chargedPaise: number;
  /** Raw AI provider cost in paise (informational, for ai_usage_log). */
  estimatedCostPaise: number;
  /** Tier we billed at. */
  tier: Tier;
  /** Actual paise the served provider billed us (for margin analytics). */
  actualProviderCostPaise: number;
  /** Which provider the cost was computed against. */
  servedProvider: ServedProvider;
}

/**
 * Compute what to charge a user for a single AI call.
 *
 *  rawCost     = (in/1k * inPrice) + (out/1k * outPrice)
 *  chargedPaise = ceil(rawCost / 0.75)        // 25% infra margin
 *  Floor at 50 paise (₹0.50) so trivial calls still cover infra fixed cost.
 */
export function computeChargedPaise(
  model: string | null | undefined,
  inputTokens: number,
  outputTokens: number,
  opts: { minPaise?: number; provider?: ServedProvider } = {},
): ChargeResult {
  const tier  = resolveTierFromModel(model);
  // Premium models get charged from the premium price table; everything else uses tier defaults.
  const price = (model && PREMIUM_MODEL_PRICE[model]) || TIER_PRICE[tier];

  const inputCost  = (Math.max(0, inputTokens)  / 1000) * price.inputPaise;
  const outputCost = (Math.max(0, outputTokens) / 1000) * price.outputPaise;
  const rawCost    = inputCost + outputCost;

  const charged = Math.max(
    opts.minPaise ?? 50,
    Math.ceil(rawCost * INFRA_MARKUP),
  );

  // Compute actual provider COGS using the per-provider table.
  const provider: ServedProvider = opts.provider ?? "unknown";
  const provPrice = PROVIDER_PRICE[provider][tier];
  const provRaw = ((Math.max(0, inputTokens)  / 1000) * provPrice.inputPaise)
                + ((Math.max(0, outputTokens) / 1000) * provPrice.outputPaise);

  return {
    chargedPaise: charged,
    estimatedCostPaise: Math.ceil(rawCost),
    tier,
    actualProviderCostPaise: Math.ceil(provRaw),
    servedProvider: provider,
  };
}
