import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Lock, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/design-system";
import { toast } from "sonner";

export default function WeeklyBriefingCard({
  orgId,
  teamId,
}: {
  orgId: string;
  teamId?: string | null;
}) {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [sufficient, setSufficient] = useState(true);
  const [cohort, setCohort] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Load cached briefing first
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const ws = weekStart.toISOString().slice(0, 10);
      const q = supabase
        .from("org_weekly_briefings" as any)
        .select("*")
        .eq("org_id", orgId)
        .eq("week_start", ws)
        .limit(1);
      const { data } = teamId ? await q.eq("team_id", teamId) : await q.is("team_id", null);
      if (!alive) return;
      const row = (data ?? [])[0] as any;
      if (row) {
        setBriefing(row.briefing_text);
        setCohort(row.cohort_size);
        setSufficient(true);
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [orgId, teamId]);

  const generate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("org-weekly-briefing", {
        body: { org_id: orgId, team_id: teamId ?? null },
      });
      if (error) throw error;
      setBriefing(data.briefing);
      setCohort(data.cohort_size);
      setSufficient(data.sufficient);
      toast.success("Briefing generated");
    } catch (e: any) {
      toast.error(e.message || "Could not generate briefing");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl border border-border/20 p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-display text-base font-semibold">This Week's Team Briefing</h3>
        </div>
        <Button
          size="sm" variant="ghost"
          onClick={generate} disabled={generating}
          className="text-xs gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${generating ? "animate-spin" : ""}`} />
          {briefing ? "Refresh" : "Generate"}
        </Button>
      </div>

      {loading && <div className="h-20 bg-muted/20 rounded animate-pulse" />}

      {!loading && !briefing && (
        <p className="text-sm text-muted-foreground font-body">
          Generate this week's AI briefing on your team's collective inner state.
          All insights are aggregated and anonymous.
        </p>
      )}

      {briefing && !sufficient && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground font-body">
          <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{briefing}</p>
        </div>
      )}

      {briefing && sufficient && (
        <div className="space-y-2">
          <p className="text-sm font-body text-foreground/90 whitespace-pre-line leading-relaxed">
            {briefing}
          </p>
          <p className="text-[10px] text-muted-foreground font-body pt-2 border-t border-border/10">
            Based on {cohort} anonymous voices · regenerated weekly
          </p>
        </div>
      )}
    </motion.div>
  );
}
