import { useState } from "react";
import { Sparkles, Brain, AlertTriangle, TrendingUp, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { EmployeeProfile } from "@/hooks/useEnterprise";
import { BrandName } from "@/components/BrandName";

interface AIInsights {
  summary: string;
  recommendations: { title: string; description: string; priority: string }[];
  atRisk: { name: string; risk: string; suggestion: string }[];
  teamSummaries: { team: string; insight: string }[];
  burnoutPredictions: { name: string; riskLevel: number; indicators: string }[];
}

export default function AIInsightsPanel({ 
  employeeProfiles, 
  orgName, 
  teamStats 
}: { 
  employeeProfiles: EmployeeProfile[]; 
  orgName?: string; 
  teamStats: any[];
}) {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const analyze = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("enterprise-insights", {
        body: { employeeProfiles, orgName, teamStats },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setInsights(data.insights);
      toast.success("AI analysis complete");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const priorityColors: Record<string, string> = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-orange-400/10 text-orange-400 border-orange-400/20",
    low: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  };

  return (
    <motion.div
      className="glass-card rounded-2xl border border-border/20 overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">AI Insights Engine</h3>
            <p className="text-[10px] text-muted-foreground font-body">Powered by <BrandName /> AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={analyze}
            disabled={loading || employeeProfiles.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-body font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Analyzing..." : insights ? "Refresh" : "Analyze Team"}
          </button>
          {insights && (
            <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {insights && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 space-y-5">
              {/* Summary */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-body font-semibold text-primary uppercase tracking-wider">Org Summary</span>
                </div>
                <p className="text-sm font-body text-foreground leading-relaxed">{insights.summary}</p>
              </div>

              {/* Recommendations */}
              {insights.recommendations.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-chart-2" />
                    <span className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider">Recommendations</span>
                  </div>
                  <div className="space-y-2">
                    {insights.recommendations.map((r, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/10 border border-border/10">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-body font-medium mt-0.5 ${priorityColors[r.priority] || priorityColors.low}`}>
                          {r.priority}
                        </span>
                        <div>
                          <p className="text-sm font-body font-medium text-foreground">{r.title}</p>
                          <p className="text-xs text-muted-foreground font-body mt-0.5">{r.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Burnout Predictions */}
              {insights.burnoutPredictions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider">Burnout Risk</span>
                  </div>
                  <div className="space-y-2">
                    {insights.burnoutPredictions.map((bp, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/10 border border-border/10">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold font-display"
                          style={{
                            background: `conic-gradient(${bp.riskLevel > 60 ? "hsl(var(--destructive))" : bp.riskLevel > 30 ? "hsl(var(--chart-4))" : "hsl(var(--chart-2))"} ${bp.riskLevel}%, hsl(var(--muted)) ${bp.riskLevel}%)`,
                            color: bp.riskLevel > 60 ? "hsl(var(--destructive))" : "hsl(var(--foreground))",
                          }}>
                          {bp.riskLevel}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-body font-medium text-foreground">{bp.name}</p>
                          <p className="text-xs text-muted-foreground font-body">{bp.indicators}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* At Risk */}
              {insights.atRisk.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <span className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider">Needs Attention</span>
                  </div>
                  <div className="space-y-2">
                    {insights.atRisk.map((ar, i) => (
                      <div key={i} className="p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                        <p className="text-sm font-body font-medium text-foreground">{ar.name}</p>
                        <p className="text-xs text-destructive font-body mt-0.5">{ar.risk}</p>
                        <p className="text-xs text-muted-foreground font-body mt-1">💡 {ar.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Summaries */}
              {insights.teamSummaries.length > 0 && (
                <div>
                  <span className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider block mb-3">Team Insights</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {insights.teamSummaries.map((ts, i) => (
                      <div key={i} className="p-3 rounded-xl bg-muted/10 border border-border/10">
                        <p className="text-xs font-body font-semibold text-primary">{ts.team}</p>
                        <p className="text-xs text-muted-foreground font-body mt-0.5">{ts.insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!insights && !loading && (
        <div className="px-5 py-6 text-center">
          <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground font-body">Click "Analyze Team" to generate AI-powered insights about your organization's consciousness journey.</p>
        </div>
      )}
    </motion.div>
  );
}
