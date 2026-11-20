import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

/**
 * Redirects every authenticated user to /app/before (the 11-day Pre-Journey
 * foundation) until they have graduated AND seen the cinematic reveal.
 *
 * Renders nothing. Mounted inside AppEntry's `ready` state alongside AppLayout
 * so the gate runs once per app entry without blocking layout if the check
 * fails (graceful — user just stays where they are).
 */
export default function PreJourneyGate({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const checked = useRef(false);

  useEffect(() => {
    if (!userId || checked.current) return;
    checked.current = true;

    // Don't gate users into the 11-day pre-journey until they have
    // completed the cinematic First Session with their assigned guru.
    // That session sets `first_session_done_<userId>` in localStorage.
    let firstSessionDone = false;
    try {
      firstSessionDone =
        localStorage.getItem(`first_session_done_${userId}`) === "1";
    } catch { /* ignore */ }
    if (!firstSessionDone) return;

    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("pre_journey_progress")
          .select("graduated_at, reveal_seen_at")
          .eq("user_id", userId)
          .maybeSingle();

        if (cancelled) return;

        const graduated = !!(data as { graduated_at?: string } | null)?.graduated_at;
        const revealSeen = !!(data as { reveal_seen_at?: string } | null)?.reveal_seen_at;
        const done = graduated && revealSeen;

        // Skip redirect if already inside the pre-journey route, on auth,
        // or in admin/enterprise areas (those are intentional deep-links).
        const path = location.pathname;
        const onPreJourney = path.startsWith("/app/before");
        const onProtectedDeepLink =
          path.startsWith("/admin") || path.startsWith("/enterprise");

        if (!done && !onPreJourney && !onProtectedDeepLink) {
          navigate("/app/before", { replace: true });
        }
      } catch {
        /* non-fatal — let user continue */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, navigate, location.pathname]);

  return null;
}
