/**
 * installGlobalCreditGuard
 * ────────────────────────
 * One-time monkey-patch of `supabase.functions.invoke` so that every
 * edge function call in the app automatically detects an
 * `insufficient_credits` / HTTP 402 response and triggers the global
 * toast + redirect to /app/credits.
 *
 * No call site needs to change. Existing manual handlers still work —
 * they just become a no-op because the redirect has already fired.
 *
 * Skips the redirect on the landing page (/, /hope-preview, /auth,
 * /dictionary, /blog) since unauthenticated visitors hitting AI demos
 * (e.g., MirrorSession) should see an inline message instead.
 */
import { supabase } from "@/lib/supabase";
import {
  isInsufficientCreditsError,
  triggerInsufficientCredits,
} from "@/lib/handleCreditError";

let installed = false;

const PUBLIC_PATH_PREFIXES = ["/auth", "/dictionary", "/blog", "/hope-preview"];

function isPublicRoute(): boolean {
  if (typeof window === "undefined") return false;
  const p = window.location.pathname;
  if (p === "/") return true;
  return PUBLIC_PATH_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix + "/"));
}

export function installGlobalCreditGuard(): void {
  if (installed) return;
  installed = true;

  const fns = supabase.functions as unknown as {
    invoke: (...args: unknown[]) => Promise<{ data: unknown; error: unknown }>;
  };
  const original = fns.invoke.bind(supabase.functions);

  fns.invoke = async (...args: unknown[]) => {
    const result = await original(...args);
    try {
      // Don't auto-redirect from unauthenticated landing/dictionary surfaces.
      if (isPublicRoute()) return result;

      const { error, data } = result;
      if (isInsufficientCreditsError(error) || isInsufficientCreditsError(data)) {
        triggerInsufficientCredits();
      }
    } catch {
      /* never let the guard itself break the call */
    }
    return result;
  };
}
