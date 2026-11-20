/**
 * AwakeningResumeCard — Home card for THE AWAKENING JOURNEY.
 * ─────────────────────────────────
 * Shows while the eleven sessions are unfinished: the next session (in the
 * user's personal order), a thin progress bar, and a tap into /app/awakening.
 * Renders null once all eleven are complete — or as a compact link back to
 * the development map.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AWAKENING_SESSION_BY_ID, AWAKENING_TOTAL, AWAKENING_CANONICAL_ORDER } from "@/lib/onboarding/awakening";

interface Props {
  userId?: string;
}

export default function AwakeningResumeCard({ userId }: Props) {
  const navigate = useNavigate();
  const [state, setState] = useState<{
    loading: boolean;
    completed: number;
    nextId: string;
    nextTitle: string;
    started: boolean;
  } | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    (async () => {
      try {
        const { data } = await supabase
          .from("awakening_progress")
          .select("completed_session_ids, session_order")
          .eq("user_id", userId)
          .maybeSingle();
        if (cancelled) return;

        const completed: string[] = Array.isArray(data?.completed_session_ids) ? data.completed_session_ids : [];
        const order: string[] = Array.isArray(data?.session_order) && data.session_order.length
          ? data.session_order
          : AWAKENING_CANONICAL_ORDER;
        const nextId = order.find((id) => id && !completed.includes(id)) ?? "";
        setState({
          loading: false,
          completed: completed.length,
          nextId,
          nextTitle: AWAKENING_SESSION_BY_ID(nextId)?.title ?? "The awakening journey",
          started: completed.length > 0 || order.length > 0,
        });
      } catch {
        if (cancelled) return;
        // Local draft fallback: assume nothing started remotely.
        setState({ loading: false, completed: 0, nextId: "meet_the_observer", nextTitle: "Meet the One Who Observes", started: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!state || state.loading) return null;
  // Never started (no remote row, no draft signal) → do not surface on Home.
  if (!state.started) return null;

  // All eleven complete → a compact link back to the development map.
  if (state.completed >= AWAKENING_TOTAL || !state.nextId) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        whileTap={{ scale: 0.985 }}
        onClick={() => navigate("/app/awakening")}
        className="w-full max-w-xl mb-5 rounded-2xl border border-primary/25 bg-primary/[0.05] hover:bg-primary/[0.09] transition-colors text-left px-4 py-3.5"
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-display tracking-[0.25em] uppercase text-primary/80 mb-0.5">
              The awakening journey · complete
            </p>
            <p className="font-display text-[15px] text-foreground leading-snug truncate">
              Your development map — revisit it any time
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-primary/70 shrink-0" />
        </div>
      </motion.button>
    );
  }

  const position = Math.min(AWAKENING_TOTAL, state.completed + 1);

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.985 }}
      onClick={() => navigate("/app/awakening")}
      className="w-full max-w-xl mb-5 rounded-2xl border border-primary/25 bg-primary/[0.05] hover:bg-primary/[0.09] transition-colors text-left px-4 py-3.5"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-display tracking-[0.25em] uppercase text-primary/80 mb-0.5">
            The awakening journey · session {position} of {AWAKENING_TOTAL}
          </p>
          <p className="font-display text-[15px] text-foreground leading-snug truncate">
            Next: {state.nextTitle}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            {Array.from({ length: AWAKENING_TOTAL }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i < state.completed ? "bg-primary/70" : "bg-border/30"
                }`}
              />
            ))}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-primary/70 shrink-0" />
      </div>
    </motion.button>
  );
}
