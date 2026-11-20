/**
 * handleCreditError
 * ─────────────────
 * Shared, hook-free helper to trigger the "out of credits" UX from
 * anywhere: shows a conscious toast and redirects to /app/credits.
 *
 * Use this from edge-function error handlers, async callbacks, and
 * places where useCreditGate (a React hook) isn't available.
 */
import { conscious } from "@/lib/consciousToast";

/** Heuristics that mark an edge-function response as a credit failure. */
export function isInsufficientCreditsError(input: unknown): boolean {
  if (!input) return false;
  // string
  if (typeof input === "string") {
    return /insufficient[_\s-]?credits|no[_\s-]?credits|402/i.test(input);
  }
  // Error / object with message + code
  if (typeof input === "object") {
    const anyObj = input as Record<string, unknown>;
    const msg = String(anyObj.message ?? anyObj.error ?? "");
    const code = String(anyObj.code ?? anyObj.status ?? "");
    if (/insufficient[_\s-]?credits|no[_\s-]?credits/i.test(msg)) return true;
    if (code === "402" || code === "insufficient_credits") return true;
    // Nested data.error shape from supabase.functions.invoke
    const data = anyObj.data as Record<string, unknown> | undefined;
    if (data && typeof data === "object") {
      const dErr = String(data.error ?? "");
      if (/insufficient[_\s-]?credits/i.test(dErr)) return true;
    }
  }
  return false;
}

/** Fire toast + redirect to credits page. Safe to call from anywhere. */
export function triggerInsufficientCredits(): void {
  try {
    conscious("noCredits", { kind: "info" });
  } catch {
    /* ignore toast errors */
  }
  if (typeof window !== "undefined") {
    // Tiny delay so the toast can render before navigation tears down the view.
    window.setTimeout(() => {
      if (window.location.pathname !== "/app/credits") {
        window.location.assign("/app/credits");
      }
    }, 250);
  }
}

/**
 * One-line guard for edge-function results.
 * Returns true if a credit failure was detected and the redirect was fired —
 * caller should abort its own UX path in that case.
 */
export function handleEdgeCreditError(input: unknown): boolean {
  if (isInsufficientCreditsError(input)) {
    triggerInsufficientCredits();
    return true;
  }
  return false;
}
