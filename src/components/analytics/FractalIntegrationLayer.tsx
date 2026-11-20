import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * FRACTAL INTEGRATION LAYER (Batch 12)
 * Visualizes how a single insight ripples across all 6 dimensions.
 * Shows recent practice → dimension impact patterns.
 */

const DIMENSIONS = ["thought", "emotion", "body", "action", "connection", "spirit"] as const;

export default function FractalIntegrationLayer() {
  const [dims, setDims] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("dimension_map_scores")
        .select("dimension_name,score,signal_count")
        .eq("user_id", user.id);
      setDims(data ?? []);
    })();
  }, []);

  const scores = DIMENSIONS.map((d) => {
    const row = dims.find((x) => x.dimension_name === d);
    return { id: d, score: row?.score ?? 0, signals: row?.signal_count ?? 0 };
  });

  const max = Math.max(...scores.map((s) => s.score), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-display font-semibold text-foreground">Fractal Integration</h3>
      </div>
      <p className="text-xs text-muted-foreground font-body">
        How your practice ripples across dimensions — every insight echoes everywhere.
      </p>

      <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
        {/* Center node */}
        <div className="flex items-center justify-center mb-4">
          <motion.div
            className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-6 h-6 text-primary" />
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {scores.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border/20 bg-muted/20 p-3"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <ArrowRight className="w-3 h-3 text-primary/60" />
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground capitalize">{s.id}</p>
              </div>
              <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary/60 to-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${(s.score / max) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground/60 font-body mt-1">
                {s.signals} signal{s.signals === 1 ? "" : "s"}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
