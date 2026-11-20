/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  PAYMENT CONFIGURATION — HOPE                       ║
 * ║                                                             ║
 * ║  To go PRODUCTION:                                          ║
 * ║  1. Change PAYMENT_MODE to "production"                     ║
 * ║  2. Set RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in secrets    ║
 * ║     to your LIVE Razorpay keys                              ║
 * ║  3. That's it. Everything else auto-adjusts.                ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type PaymentMode = "development" | "production";

// ━━━━━━━━━━━━━━━━ SINGLE TOGGLE ━━━━━━━━━━━━━━━━
// Reads PAYMENT_MODE from env (set in ConsciousOS Cloud secrets to "production"
// when going live with real Razorpay keys). Falls back to "development".
const _envMode = (typeof Deno !== "undefined" ? Deno.env.get("PAYMENT_MODE") : undefined) as PaymentMode | undefined;
export const PAYMENT_MODE: PaymentMode = _envMode === "production" ? "production" : "development";
if (PAYMENT_MODE === "development") {
  console.warn("[payment-config] Running in DEVELOPMENT mode — set PAYMENT_MODE=production secret before launch.");
}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PAYMENT_CONFIG = {
  development: {
    // Dev mode: allows test payments, relaxed validation
    minAmountPaise: 100,          // ₹1 minimum
    maxAmountPaise: 50_000_00,    // ₹50,000 max
    creditMultiplier: 0.75,       // 75% of payment → credits
    allowTestCards: true,
    webhookValidation: false,     // Skip webhook sig validation in dev
    idempotencyWindow: 60 * 5,    // 5 min dedup window
    receiptPrefix: "cos_dev",
    logLevel: "verbose" as const,
    // Dev-only: grant free credits for testing
    freeTrialCredits: 10_000,     // ₹100 free for new users in dev
  },
  production: {
    minAmountPaise: 100,          // ₹1 minimum
    maxAmountPaise: 500_000_00,   // ₹5,00,000 max
    creditMultiplier: 0.75,       // 75% of payment → credits
    allowTestCards: false,
    webhookValidation: true,      // MUST validate webhook sigs in prod
    idempotencyWindow: 60 * 60,   // 1 hour dedup window
    receiptPrefix: "cos_prod",
    logLevel: "error" as const,
    freeTrialCredits: 0,          // No freebies in prod
  },
} as const;

export function getConfig() {
  return PAYMENT_CONFIG[PAYMENT_MODE];
}

export function isDev(): boolean {
  return PAYMENT_MODE === "development";
}

export function isProd(): boolean {
  return PAYMENT_MODE === "production";
}

/**
 * Credit packs — same structure, different behavior in dev vs prod.
 * Frontend reads these; backend validates against them.
 */
export const CREDIT_PACKS = [
  { id: "starter",    label: "Starter",    amountPaise: 9_900,    displayPrice: "₹99",    credits: "₹74",    tag: null },
  { id: "growth",     label: "Growth",     amountPaise: 29_900,   displayPrice: "₹299",   credits: "₹224",   tag: "Popular" },
  { id: "pro",        label: "Pro",        amountPaise: 99_900,   displayPrice: "₹999",   credits: "₹749",   tag: "Best Value" },
  { id: "enterprise", label: "Enterprise", amountPaise: 499_900,  displayPrice: "₹4,999", credits: "₹3,749", tag: null },
] as const;

/**
 * Validate that the requested amount matches a known pack.
 * In dev mode, any amount ≥ min is allowed for testing flexibility.
 * In prod mode, ONLY predefined pack amounts are accepted (prevents manipulation).
 */
export function validateAmount(amountPaise: number): { valid: boolean; error?: string } {
  const config = getConfig();

  if (amountPaise < config.minAmountPaise) {
    return { valid: false, error: `Minimum amount is ₹${config.minAmountPaise / 100}` };
  }
  if (amountPaise > config.maxAmountPaise) {
    return { valid: false, error: `Maximum amount is ₹${config.maxAmountPaise / 100}` };
  }

  if (isProd()) {
    const validPack = CREDIT_PACKS.some(p => p.amountPaise === amountPaise);
    if (!validPack) {
      return { valid: false, error: "Invalid pack amount" };
    }
  }

  return { valid: true };
}

/**
 * Calculate credits from payment amount
 */
export function calculateCredits(amountPaise: number): number {
  return Math.floor(amountPaise * getConfig().creditMultiplier);
}

/**
 * Generate idempotency-safe receipt ID
 */
export function generateReceipt(userId: string): string {
  const config = getConfig();
  const timestamp = Date.now();
  const userFragment = userId.substring(0, 8);
  return `${config.receiptPrefix}_${userFragment}_${timestamp}`;
}

/**
 * Conditional logger — verbose in dev, errors-only in prod
 */
export const paymentLog = {
  info: (...args: unknown[]) => {
    if (getConfig().logLevel === "verbose") {
      console.log("[PAYMENT]", ...args);
    }
  },
  warn: (...args: unknown[]) => {
    console.warn("[PAYMENT]", ...args);
  },
  error: (...args: unknown[]) => {
    console.error("[PAYMENT]", ...args);
  },
};
