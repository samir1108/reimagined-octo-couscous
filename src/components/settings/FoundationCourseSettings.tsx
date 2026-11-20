import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, Eye, Sparkles, ChevronRight, RefreshCw, FileText, Pause, Play } from "lucide-react";
import { Button } from "@/design-system";
import { usePreJourney } from "@/hooks/usePreJourney";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

/**
 * Foundation Course management inside Settings.
 *
 * Three states:
 *  1. Skipped — show a gentle "resume" card so the user can pick up the
 *     course in parallel without it dominating the Home screen.
 *  2. In-progress — show progress (sessions + mirrors) and a Continue button.
 *  3. Graduated — surface the deep analysis report ("who you are") and the
 *     option to request future-self analyses.
 */
export default function FoundationCourseSettings() {
  const navigate = useNavigate();
  const { state, isLoading, unskip, pause, resume } = usePreJourney();

  // Fetch the graduation report only when graduated
  const { data: report } = useQuery({
    queryKey: ["graduation-report"],
    enabled: !!state?.graduated,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("graduation_reports")
        .select("archetype, one_sentence, recommended_lineage, generated_at")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
  });

  if (isLoading || !state) return null;

  const sessionsDone = state.completedIds.length;
  const sessionsTotal = state.totalSessions;
  const mirrorsDone = state.mirrorsCompleted;
  const mirrorsTotal = state.totalMirrors;
  const sessionPct = Math.min(100, Math.round((sessionsDone / sessionsTotal) * 100));
  const mirrorPct = Math.min(100, Math.round((mirrorsDone / mirrorsTotal) * 100));
  const fullyDone = sessionsDone >= sessionsTotal && mirrorsDone >= mirrorsTotal;

  // ── Graduated: deep analysis available ────────────────────────────────────
  if (state.graduated || fullyDone) {
    return (
      <motion.div
        className="glass-card rounded-2xl p-6 border border-primary/20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-violet-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-foreground text-sm">
              Foundation Complete
            </h3>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              Your 60 sessions and 100 mirrors revealed who you are.
            </p>
          </div>
        </div>

        {report?.archetype && (
          <div className="rounded-xl bg-background/40 border border-primary/15 p-3 mb-3">
            <p className="text-[10px] uppercase tracking-widest text-primary/70 mb-1">
              Your archetype
            </p>
            <p className="text-base font-display text-foreground">
              {report.archetype}
            </p>
            {report.one_sentence && (
              <p className="text-xs italic text-muted-foreground mt-1 leading-relaxed">
                "{report.one_sentence}"
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-xs"
            onClick={() => navigate("/app/before")}
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Read full analysis
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-xs"
            onClick={() => navigate("/app/credits")}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            New deep scan
          </Button>
        </div>
      </motion.div>
    );
  }

  // ── Skipped: gentle resume card ───────────────────────────────────────────
  if (state.skipped) {
    return (
      <motion.div
        className="glass-card rounded-2xl p-6 border border-primary/15"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-semibold text-foreground text-sm">
              Foundation Course (skipped)
            </h3>
            <p className="text-xs text-muted-foreground font-body mt-0.5 leading-relaxed">
              You skipped this from Home. You can still continue the 60 sessions
              and 100 mirrors here in parallel — your daily flow stays untouched.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <ProgressTile label="Sessions" done={sessionsDone} total={sessionsTotal} pct={sessionPct} icon={<Sparkles className="w-3.5 h-3.5 text-violet-400" />} accent="violet" />
          <ProgressTile label="Mirrors" done={mirrorsDone} total={mirrorsTotal} pct={mirrorPct} icon={<Eye className="w-3.5 h-3.5 text-amber-400" />} accent="amber" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-xs"
            onClick={() => unskip.mutate()}
            disabled={unskip.isPending}
          >
            Show on Home
          </Button>
          <Button
            size="sm"
            className="rounded-xl text-xs bg-gradient-to-r from-primary/80 to-primary"
            onClick={() => navigate("/app/before")}
          >
            Continue here
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // ── Paused: show Start (resume) ──────────────────────────────────────────
  if (state.paused) {
    return (
      <motion.div
        className="glass-card rounded-2xl p-6 border border-amber-500/20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
            <Pause className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-semibold text-foreground text-sm">
              Foundation Course (paused)
            </h3>
            <p className="text-xs text-muted-foreground font-body mt-0.5 leading-relaxed">
              Your daily flow is back to normal. Tap Start to resume the 60 sessions
              and 100 mirrors — your progress is saved.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <ProgressTile label="Sessions" done={sessionsDone} total={sessionsTotal} pct={sessionPct} icon={<Sparkles className="w-3.5 h-3.5 text-violet-400" />} accent="violet" />
          <ProgressTile label="Mirrors" done={mirrorsDone} total={mirrorsTotal} pct={mirrorPct} icon={<Eye className="w-3.5 h-3.5 text-amber-400" />} accent="amber" />
        </div>

        <Button
          size="sm"
          className="w-full rounded-xl text-xs bg-gradient-to-r from-emerald-500/80 to-emerald-500"
          onClick={() => resume.mutate()}
          disabled={resume.isPending}
        >
          <Play className="w-3.5 h-3.5 mr-1.5" />
          Start
        </Button>
      </motion.div>
    );
  }

  // ── In-progress, not skipped: quick-link summary + Stop ──────────────────
  return (
    <motion.div
      className="glass-card rounded-2xl p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <Compass className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-semibold text-foreground text-sm">
            Foundation Course
          </h3>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            {sessionsDone}/{sessionsTotal} sessions · {mirrorsDone}/{mirrorsTotal} mirrors
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl text-xs shrink-0"
          onClick={() => navigate("/app/before")}
        >
          Open
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <ProgressTile label="Sessions" done={sessionsDone} total={sessionsTotal} pct={sessionPct} icon={<Sparkles className="w-3.5 h-3.5 text-violet-400" />} accent="violet" />
        <ProgressTile label="Mirrors" done={mirrorsDone} total={mirrorsTotal} pct={mirrorPct} icon={<Eye className="w-3.5 h-3.5 text-amber-400" />} accent="amber" />
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full rounded-xl text-xs"
        onClick={() => pause.mutate()}
        disabled={pause.isPending}
      >
        <Pause className="w-3.5 h-3.5 mr-1.5" />
        Stop (resume later)
      </Button>
    </motion.div>
  );
}

function ProgressTile({
  label, done, total, pct, icon, accent,
}: {
  label: string;
  done: number;
  total: number;
  pct: number;
  icon: React.ReactNode;
  accent: "violet" | "amber";
}) {
  const barColor = accent === "violet"
    ? "bg-gradient-to-r from-violet-400 to-indigo-400"
    : "bg-gradient-to-r from-amber-400 to-orange-400";
  const trackColor = accent === "violet" ? "bg-violet-500/10" : "bg-amber-500/10";
  const borderColor = accent === "violet" ? "border-violet-500/20" : "border-amber-500/20";
  const bgColor = accent === "violet" ? "bg-violet-500/5" : "bg-amber-500/5";

  return (
    <div className={`rounded-xl p-3 border ${borderColor} ${bgColor}`}>
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <p className="text-base font-display text-foreground">
        {done}<span className="text-muted-foreground/60 text-xs"> / {total}</span>
      </p>
      <div className={`mt-1.5 h-1 rounded-full ${trackColor} overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7 }}
          className={`h-full ${barColor}`}
        />
      </div>
    </div>
  );
}
