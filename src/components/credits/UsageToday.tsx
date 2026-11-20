import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Activity, Clock } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";

const FEATURE_LABEL: Record<string, string> = {
  "guide-chat": "Guide chat",
  "temple-chat": "Temple master chat",
  "journal-reflect": "Journal reflections",
  "three-lens-analyzer": "Three-lens analyzer",
  "memory-extract": "Memory extraction",
  "memory-consolidate": "Memory consolidation",
  "complete-task": "Task completion",
  "generate-theme": "Daily theme",
  "evolve-theme": "Theme evolution",
  "predictive-insights": "Predictive insights",
  "master-journey-review": "Master journey review",
  "analyze-assessment": "Assessment analysis",
  "companion-engine": "Companion notifications",
  "graduation-deep-analysis": "Graduation review",
  "generate-personal-program": "Personal program",
  "translate-ui": "UI translation",
  "live-detect": "Live loop detection",
  "adapt-next-block": "Adaptive session",
  "elder-dialogue": "Elder onboarding",
  "suggest-next-program": "Program suggestion",
};

const labelOf = (fn: string) =>
  FEATURE_LABEL[fn] ?? fn.replace(/-/g, " ");

const paiseToInr = (p: number) => `₹${(p / 100).toFixed(2)}`;

export default function UsageToday() {
  const { data, isLoading } = useQuery({
    queryKey: ["ai-usage-today"],
    queryFn: async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const { data: rows } = await supabase
        .from("ai_usage_log")
        .select("function_name, charged_paise, total_tokens, created_at, status")
        .gte("created_at", startOfDay.toISOString())
        .order("created_at", { ascending: false })
        .limit(200);
      return rows ?? [];
    },
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-pulse h-40" />
    );
  }

  const rows = data ?? [];
  const totalToday = rows.reduce((s, r: any) => s + (r.charged_paise || 0), 0);
  const totalCalls = rows.length;

  // Top 3 features today
  const byFeature: Record<string, number> = {};
  rows.forEach((r: any) => {
    byFeature[r.function_name] = (byFeature[r.function_name] || 0) + (r.charged_paise || 0);
  });
  const topFeatures = Object.entries(byFeature)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const recent = rows.slice(0, 20);

  return (
    <motion.div
      className="glass-card rounded-2xl p-6 space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">Today's usage</h3>
        </div>
        <div className="text-right">
          <p className="text-lg font-display font-bold text-foreground">{paiseToInr(totalToday)}</p>
          <p className="text-[10px] text-muted-foreground font-body">{totalCalls} call{totalCalls === 1 ? "" : "s"}</p>
        </div>
      </div>

      {topFeatures.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body">Top features today</p>
          {topFeatures.map(([fn, paise]) => (
            <div key={fn} className="flex items-center justify-between text-xs font-body">
              <span className="text-foreground">{labelOf(fn)}</span>
              <span className="text-muted-foreground">{paiseToInr(paise)}</span>
            </div>
          ))}
        </div>
      )}

      {recent.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body flex items-center gap-1">
            <Clock className="w-3 h-3" /> Last {recent.length} calls
          </p>
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
            {recent.map((r: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0 text-xs font-body"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate">{labelOf(r.function_name)}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(r.created_at), "HH:mm")} · {r.total_tokens || 0} tok
                    {r.status === "error" && " · error"}
                  </p>
                </div>
                <span className={`font-display font-semibold ${r.status === "error" ? "text-muted-foreground" : "text-foreground"}`}>
                  {paiseToInr(r.charged_paise || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalCalls === 0 && (
        <p className="text-xs text-muted-foreground font-body text-center py-4">
          No AI usage yet today.
        </p>
      )}
    </motion.div>
  );
}
