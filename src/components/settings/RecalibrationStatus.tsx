/**
 * RecalibrationStatus — surfaces the intelligent recalibration system.
 * Shows the latest decision (none / minor / major / reassess / dark_night),
 * the reasons the brain saw, and a button to trigger an on-demand check.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, AlertTriangle, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

import { toast } from "sonner";

type Event = {
  id: string;
  decision: "none" | "minor" | "major" | "reassess" | "dark_night";
  drift_score: number;
  reasons: string[];
  applied: boolean;
  created_at: string;
};

const REASON_LABEL: Record<string, string> = {
  dimension_drift: "Dimensions shifted from baseline",
  witness_gap_high: "Witness gap widened",
  spiritual_bypassing: "Spiritual bypassing risk rose",
  regression: "Recent regression detected",
  dark_night: "Dark Night signature",
  long_pause: "Long pause from practice",
  plateau: "Plateau on active practices",
  predictive_risk: "Predictive risk elevated",
  path_effectiveness_drop: "Dominant path losing traction",
};

const DECISION_LABEL: Record<Event["decision"], string> = {
  none: "Stable — no change needed",
  minor: "Gentle recalibration applied",
  major: "Significant recalibration applied",
  reassess: "Path reassessment suggested",
  dark_night: "Dark Night protective hold",
};

export default function RecalibrationStatus() {
  const [userId, setUserId] = useState<string | null>(null);
  const [latest, setLatest] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const load = async (uid: string | null = userId) => {
    if (!uid) return;
    const { data } = await supabase
      .from("recalibration_events")
      .select("id, decision, drift_score, reasons, applied, created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setLatest((data as Event) ?? null);
  };

  useEffect(() => { if (userId) load(userId); }, [userId]);

  const runNow = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("recalibration-intelligence", {
        body: { user_id: userId, force: false },
      });
      if (error) throw error;
      toast.success(DECISION_LABEL[(data as any)?.decision as Event["decision"]] ?? "Checked");
      await load();
    } catch (e) {
      toast.error("Recalibration check failed");
    } finally {
      setLoading(false);
    }
  };

  const isAlert = latest?.decision === "reassess" || latest?.decision === "dark_night";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/30 bg-background/40 backdrop-blur-md p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-display tracking-wider uppercase text-foreground/90">
            Intelligent Recalibration
          </h3>
        </div>
        <button
          onClick={runNow}
          disabled={loading}
          className="text-[11px] inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Check now
        </button>
      </div>

      {!latest ? (
        <p className="text-xs text-muted-foreground">
          The engine watches your dimensions, witness gap, regression, plateau, and path effectiveness — and recalibrates on its own when needed. No checks yet.
        </p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {isAlert ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="text-sm text-foreground/90">
              {DECISION_LABEL[latest.decision]}
            </span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              drift {Math.round(latest.drift_score * 100)}%
            </span>
          </div>
          {latest.reasons.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {latest.reasons.map((r) => (
                <span
                  key={r}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground"
                >
                  {REASON_LABEL[r] ?? r}
                </span>
              ))}
            </div>
          )}
          <div className="text-[10px] text-muted-foreground/70">
            Last check · {new Date(latest.created_at).toLocaleString()}
          </div>
        </div>
      )}
    </motion.div>
  );
}
