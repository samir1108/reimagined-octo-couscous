/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  FRONTEND PAYMENT CONFIG — HOPE                     ║
 * ║                                                             ║
 * ║  To go PRODUCTION:                                          ║
 * ║  1. Change PAYMENT_MODE to "production"                     ║
 * ║  2. Update Razorpay keys in backend secrets                 ║
 * ║  3. Done.                                                   ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type PaymentMode = "development" | "production";

// ━━━━━━━━━━━━━━━━ SINGLE TOGGLE ━━━━━━━━━━━━━━━━
export const PAYMENT_MODE = "development" as PaymentMode;
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const isDev = () => PAYMENT_MODE === "development";
export const isProd = () => PAYMENT_MODE === "production";

export const CREDIT_PACKS = [
  { id: "starter",    label: "Starter",    amountPaise: 9_900,    displayPrice: "₹99",    credits: "₹74",    tag: null },
  { id: "growth",     label: "Growth",     amountPaise: 29_900,   displayPrice: "₹299",   credits: "₹224",   tag: "Popular" as const },
  { id: "pro",        label: "Pro",        amountPaise: 99_900,   displayPrice: "₹999",   credits: "₹749",   tag: "Best Value" as const },
  { id: "enterprise", label: "Enterprise", amountPaise: 499_900,  displayPrice: "₹4,999", credits: "₹3,749", tag: null },
] as const;

export const PAYMENT_UI = {
  development: {
    badgeText: "🧪 Test Mode",
    badgeVisible: true,
    theme: { color: "#8b5cf6" },
    prefill: {
      // Pre-fill with test data in dev
      name: "Test User",
      email: "test@hope-app.dev",
      contact: "9999999999",
    },
  },
  production: {
    badgeText: "",
    badgeVisible: false,
    theme: { color: "#8b5cf6" },
    prefill: {},
  },
} as const;

export function getPaymentUI() {
  return PAYMENT_UI[PAYMENT_MODE];
}
