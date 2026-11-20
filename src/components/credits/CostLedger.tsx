import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Friendly labels for each AI feature so users see meaningful names
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
  "generate-guru-programs": "Guru programs",
  "generate-journey-nudge": "Journey nudges",
  "mind-map-ai": "Mind-map AI",
  "pre-journey-chat": "Pre-journey chat",
  "decode-dream": "Dream decoder",
  "generate-wisdom": "Daily wisdom",
  "generate-daily-ritual": "Daily ritual",
  "discovery-session": "Discovery session",
  "extract-inside-jokes": "Inside jokes",
  "extract-sacred-moments": "Sacred moments",
  "live-detect": "Live loop detection",
  "next-session-preview": "Next-session preview",
  "verify-breakthrough": "Breakthrough verification",
  "fractal-integration": "Fractal integration",
  "guru-practice-session": "Guru practice",
  "manager-coaching": "Manager coaching",
  "enterprise-insights": "Enterprise insights",
  "admin-copilot": "Admin copilot",
  "admin-ai-insights": "Admin insights",
  "generate-master-next-step": "Master next-step",
  "generate-master-theme-teaching": "Master teaching",
};

function paiseToInr(paise: number) {
  return `₹${(paise / 100).toFixed(2)}`;
}

export default function CostLedger() {
  const { data, isLoading } = useQuery({
    queryKey: ["ai-cost-ledger"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("ai_usage_log")
        .select("function_name, charged_paise, estimated_cost_paise, total_tokens, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading cost breakdown…</div>;
  }
  if (!data || data.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No AI usage in the last 30 days yet. Once you start using guides, journals, or programs,
        you'll see exactly where every credit goes here.
      </div>
    );
  }

  // Aggregate by function
  const byFn = new Map<string, { calls: number; charged: number; rawAi: number; tokens: number }>();
  let totalCharged = 0;
  let totalRaw = 0;
  for (const r of data) {
    const k = r.function_name;
    const cur = byFn.get(k) || { calls: 0, charged: 0, rawAi: 0, tokens: 0 };
    cur.calls += 1;
    cur.charged += r.charged_paise || 0;
    cur.rawAi += r.estimated_cost_paise || 0;
    cur.tokens += r.total_tokens || 0;
    byFn.set(k, cur);
    totalCharged += r.charged_paise || 0;
    totalRaw += r.estimated_cost_paise || 0;
  }
  const rows = Array.from(byFn.entries())
    .map(([fn, v]) => ({ fn, ...v }))
    .sort((a, b) => b.charged - a.charged);

  const infraShare = totalCharged - totalRaw;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-foreground/5 border border-border p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total spent (30d)</div>
          <div className="text-2xl font-semibold text-amber-700 dark:text-amber-200 mt-1">{paiseToInr(totalCharged)}</div>
        </div>
        <div className="rounded-xl bg-foreground/5 border border-border p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">AI cost (75%)</div>
          <div className="text-2xl font-semibold text-foreground mt-1">{paiseToInr(totalRaw)}</div>
        </div>
        <div className="rounded-xl bg-foreground/5 border border-border p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Infra (25%)</div>
          <div className="text-2xl font-semibold text-foreground mt-1">{paiseToInr(Math.max(0, infraShare))}</div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        Every credit you spend covers ~75% AI cost + 25% infrastructure (servers, storage, voice).
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-foreground/5 text-muted-foreground text-[11px] uppercase tracking-wider">
            <tr>
              <th className="text-left px-3 py-2">Feature</th>
              <th className="text-right px-3 py-2">Calls</th>
              <th className="text-right px-3 py-2">Tokens</th>
              <th className="text-right px-3 py-2">Cost</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <motion.tr
                key={r.fn}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="border-t border-border"
              >
                <td className="px-3 py-2 text-foreground">
                  {FEATURE_LABEL[r.fn] || r.fn}
                </td>
                <td className="px-3 py-2 text-right text-foreground/80">{r.calls}</td>
                <td className="px-3 py-2 text-right text-foreground/80">{r.tokens.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-amber-700/90 dark:text-amber-200/90">{paiseToInr(r.charged)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
