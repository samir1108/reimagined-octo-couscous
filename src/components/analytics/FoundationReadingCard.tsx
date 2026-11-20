/**
 * FoundationReadingCard
 * ─────────────────────
 * Reads the foundation-onboarding result the user just produced
 * (stored in localStorage on completion, keyed by userId) and renders
 * a dynamic "your first reading" panel: band label, brain lean,
 * top loops, and suggested paths.
 *
 * If no reading is found (returning user, cleared storage), renders
 * nothing so the rest of the Home tab stays clean.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Compass, Brain, Heart, Flame, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { FoundationAnalysis } from "@/lib/onboarding/foundationAnalyzer";

interface StoredResult {
  answers?: Record<string, string | number>;
  analysis: FoundationAnalysis;
  paths?: { core: string; secondary: string[] };
  at?: number;
}

const BRAIN_META = {
  head:  { label: "Head-led",  Icon: Brain, tone: "text-blue-400" },
  heart: { label: "Heart-led", Icon: Heart, tone: "text-rose-400" },
  gut:   { label: "Gut-led",   Icon: Flame, tone: "text-amber-400" },
} as const;

const LOOP_LABELS: Record<string, string> = {
  phone: "Phone loop", worry: "Worry loop", compare: "Compare loop",
  postpone: "Postpone loop", react: "Reaction loop", numb: "Numbing loop",
  perfect: "Perfection loop", control: "Control loop", people: "People-pleasing loop",
};

const PATH_LABELS: Record<string, string> = {
  kriya: "Kriyā", karma: "Karma", bhakti: "Bhakti",
  jnana: "Jñāna", tantra: "Tantra", dhyana: "Dhyāna",
};

export default function FoundationReadingCard() {
  const [data, setData] = useState<StoredResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        const uid = sess.session?.user?.id;
        if (!uid) return;
        // Try local first (fresh, no round-trip).
        const raw = localStorage.getItem(`foundation_result_${uid}`);
        if (raw && !cancelled) {
          setData(JSON.parse(raw) as StoredResult);
          return;
        }
        // Fallback to server.
        const { data: cp } = await (supabase as any)
          .from("user_consciousness_profile")
          .select("assessment_data")
          .eq("user_id", uid)
          .maybeSingle();
        const assess = cp?.assessment_data;
        if (assess?.analysis && !cancelled) {
          setData({
            analysis: assess.analysis,
            paths: assess.paths,
            answers: assess.answers,
          });
        }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!data?.analysis) return null;
  const a = data.analysis;
  const brain = BRAIN_META[a.brain];
  const BrainIcon = brain.Icon;
  const topLoops = (a.loops ?? []).slice(0, 3);
  const suggested = (data.paths?.secondary ?? a.suggestedSecondary ?? []).slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-2xl p-5 border border-primary/20"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-primary" />
        <p className="text-[11px] uppercase tracking-[0.25em] text-primary/80 font-display">
          Your first reading
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Band */}
        <div className="rounded-xl bg-background/40 border border-border/40 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Starting band</p>
          <p className="font-display text-xl text-foreground leading-tight">
            {a.bandLabel}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Band {Math.max(1, Math.min(11, Math.round(a.band)))}</p>
        </div>

        {/* Brain */}
        <div className="rounded-xl bg-background/40 border border-border/40 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Center</p>
          <div className="flex items-center gap-2">
            <BrainIcon className={`w-4 h-4 ${brain.tone}`} />
            <p className="font-display text-lg text-foreground">{brain.label}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            How you tend to decide
          </p>
        </div>
      </div>

      {/* Loops */}
      {topLoops.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Loops you named
            </p>
          </div>
          {a.loopRoot && (
            <p className="text-[11.5px] text-primary/80 mb-2">
              Root family: <span className="font-display">{a.loopRootLabel}</span>
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {topLoops.map((id) => (
              <span
                key={id}
                className="text-xs px-2.5 py-1 rounded-full bg-foreground/5 border border-border/40 text-foreground/80"
              >
                {LOOP_LABELS[id] ?? id}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggested paths */}
      {suggested.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Compass className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Paths that fit you
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggested.map((id) => (
              <span
                key={id}
                className="text-xs px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary"
              >
                {PATH_LABELS[id] ?? id}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
