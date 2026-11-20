import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Hook to trigger the companion engine on app open.
 * Fires once per session (or per 6 hours, server-side throttled).
 */
export function useCompanionEngine(userId: string | undefined) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (!userId || hasFired.current) return;
    hasFired.current = true;

    // Fire and forget — companion engine runs async.
    // Non-critical: any failure (402 no credits, 429 rate limit, network) is swallowed silently.
    const trigger = async () => {
      try {
        const { error } = await supabase.functions.invoke("companion-engine", {
          body: {},
        });
        if (error) {
          // Expected when AI workspace is out of credits or throttled — do not surface.
          console.debug("[companion-engine] non-fatal:", error.message || error);
        }
      } catch (e) {
        console.debug("[companion-engine] trigger swallowed:", e);
      }
    };

    // Delay slightly so it doesn't compete with critical loads
    const timer = setTimeout(trigger, 5000);
    return () => clearTimeout(timer);
  }, [userId]);
}
