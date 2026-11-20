/**
 * SuggestedProgramCard — the "Master-of-Masters" surface on Home.
 *
 * Pulls one engine-routed recommendation: continue, template, composed,
 * or single-session. Always shows ONE clear next action.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, ChevronDown, Play, Loader2, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/design-system";
import { useSuggestedProgram } from "@/hooks/useSuggestedProgram";
import { Placeholder } from "@/design-system";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useRegenerateTheme } from "@/hooks/useThemeOfDay";

const KIND_LABEL: Record<string, string> = {
  continue: "Continuing",
  template: "Suggested arc",
  composed: "Composed for you",
  single:   "Today's practice",
};

const SUGGESTER_CACHE_KEY = "suggested-program-v1";

export function SuggestedProgramCard() {
  const { suggestion, loading, error, regenerate } = useSuggestedProgram();
  const [expanded, setExpanded] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const qc = useQueryClient();
  const [beginLoading, setBeginLoading] = useState(false);
  const SUGGESTER_DISMISS_KEY = "suggested-program-dismissed-v1";
  const [hidden, setHidden] = useState(() => {
    try { return sessionStorage.getItem(SUGGESTER_DISMISS_KEY) === "1"; } catch { return false; }
  });
  const regenerateTheme = useRegenerateTheme();

  if (hidden) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    try { sessionStorage.setItem(SUGGESTER_DISMISS_KEY, "1"); } catch {}
    setHidden(true);
  };

  if (loading && !suggestion) {
    return (
      <div className="rounded-2xl border border-primary/10 bg-card/40 px-4 py-3 backdrop-blur-sm">
        <Placeholder.Circle className="w-10 h-10" />
      </div>
    );
  }

  if (error || !suggestion) {
    return null; // Fail silently — Home has other surfaces.
  }

  // Once the user is already in a program, the suggester collapses away —
  // the active program owns the Home surface (theme, master, rhythm).
  if (suggestion.kind === "continue") return null;

  const handleBegin = async () => {
    if (beginLoading) return;
    setBeginLoading(true);
    try {
      // Already continuing an active program — just refresh Home so it reflects.
      if (suggestion.kind === "continue") {
        await qc.invalidateQueries();
        toast({ title: "Continuing your journey", description: suggestion.title });
        setExpanded(false);
        return;
      }

      // Template / composed / single → enroll in-place so Home upgrades to program mode.
      if (suggestion.program_id) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not signed in");

        // Avoid duplicate active enrollment for same program.
        const { data: existing } = await supabase
          .from("program_enrollments")
          .select("id, status")
          .eq("user_id", user.id)
          .eq("program_id", suggestion.program_id)
          .maybeSingle();

        if (!existing) {
          const { error: insErr } = await supabase
            .from("program_enrollments")
            .insert({
              user_id: user.id,
              program_id: suggestion.program_id,
              current_day: 1,
              status: "active",
            });
          if (insErr) throw insErr;
        } else if (existing.status !== "active") {
          await supabase
            .from("program_enrollments")
            .update({ status: "active" })
            .eq("id", existing.id);
        }

        // Hide the suggester immediately so the active program owns Home.
        setHidden(true);
        try { sessionStorage.removeItem(SUGGESTER_CACHE_KEY); } catch {}
        toast({
          title: "Composing your theme…",
          description: `${suggestion.title} — your master is preparing the first session.`,
        });
        // Regenerate today's theme so title/master/rhythm reflect the new program.
        // The Home placeholder will show "The Master is composing your theme…" while this runs.
        try { await regenerateTheme(); } catch (e) { console.warn('theme regen failed', e); }
        // Refresh all Home surfaces so they pick up the new program context.
        await qc.invalidateQueries();
        toast({ title: "Program started", description: suggestion.title });
        setExpanded(false);
      } else {
        toast({ title: "Couldn't start program", description: "No program reference.", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Couldn't start", description: e?.message ?? "Try again.", variant: "destructive" });
    } finally {
      setBeginLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenLoading(true);
    try {
      await regenerate();
    } finally {
      setRegenLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card/60 to-accent/5 backdrop-blur-sm"
    >
      {/* Collapsed header — tap to expand */}
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex-1 text-left pl-4 pr-2 py-3 flex items-center gap-3 hover:bg-primary/5 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary/70" />
          <h3 className="flex-1 text-sm font-medium leading-snug text-foreground truncate">
            {suggestion.title}
          </h3>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss suggestion"
          className="shrink-0 p-2 mr-1 rounded-full text-muted-foreground/70 hover:text-foreground hover:bg-primary/10 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {/* Meta row */}
              <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-wider text-primary/70">
                <span>{KIND_LABEL[suggestion.kind] ?? "Suggested"}</span>
                {suggestion.days > 1 && (
                  <span className="ml-auto text-muted-foreground">
                    {suggestion.days} sessions
                  </span>
                )}
              </div>

              {/* Why */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {suggestion.why}
              </p>

              {/* Sessions preview */}
              {suggestion.sessions?.length > 0 && (
                <ul className="mb-3 space-y-1.5 border-l-2 border-primary/20 pl-3">
                  {suggestion.sessions.slice(0, 7).map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      <span className="text-foreground/80">Session {s.day}</span>
                      <span className="mx-1.5">·</span>
                      <span>{s.title}</span>
                      <span className="ml-1.5 text-[10px] opacity-70">{s.duration_min}m</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button onClick={handleBegin} size="sm" className="gap-1.5" disabled={beginLoading}>
                  {beginLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                  {suggestion.cta}
                </Button>

                <Button
                  onClick={handleRegenerate}
                  disabled={regenLoading}
                  size="sm"
                  variant="ghost"
                  className="ml-auto gap-1 text-xs text-muted-foreground hover:text-foreground"
                  title="Show a different path"
                >
                  <RefreshCw className={`h-3 w-3 ${regenLoading ? "animate-spin" : ""}`} />
                  Another path
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
