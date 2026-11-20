import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, AlertCircle, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";

/**
 * PREDICTIVE INSIGHTS LAYER (Batch 12)
 * Surfaces signals from `predictive_signals` table (already exists).
 * Shows upcoming risks/opportunities the engine has detected.
 */

interface Signal {
  id: string;
  signal_type: string;
  description: string;
  recommended_action: string;
  severity: string;
  detected_at: string;
}

export default function PredictiveInsightsLayer() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("predictive_signals" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("detected_at", { ascending: false })
        .limit(10);
      setSignals((data as any) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-display font-semibold text-foreground">Predictive Insights</h3>
      </div>
      <p className="text-xs text-muted-foreground font-body">
        Patterns the engine has detected — what's likely coming, and how to ride it.
      </p>

      {loading && <p className="text-xs text-muted-foreground font-body py-6 text-center">Reading the spiral...</p>}

      {!loading && signals.length === 0 && (
        <div className="glass-card rounded-2xl p-6 text-center">
          <Clock className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground font-body">
            Not enough data yet. Predictions emerge after ~7 days of practice.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {signals.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-card rounded-xl p-4 border-l-2 border-primary/40"
          >
            <div className="flex items-start gap-2 mb-1">
              <AlertCircle className={`w-3.5 h-3.5 mt-0.5 ${s.severity === "high" ? "text-destructive" : "text-primary/70"}`} />
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display">{s.signal_type}</p>
            </div>
            <p className="text-sm font-display text-foreground mb-2">{s.description}</p>
            <p className="text-xs text-primary/80 font-body italic">→ {s.recommended_action}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
