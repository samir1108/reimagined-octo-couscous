import { motion } from "framer-motion";
import { FileText, TrendingUp, Users, Flame, Brain } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { type EmployeeProfile } from "@/hooks/useEnterprise";

export default function QuarterlyReport({
  profiles,
  teamStats,
  sessionTrends,
  orgName,
}: {
  profiles: EmployeeProfile[];
  teamStats: any[];
  sessionTrends: any[];
  orgName?: string;
}) {
  const now = new Date();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  const year = now.getFullYear();

  const withData = profiles.filter((p) => p.consciousness);
  const avgBand = withData.length > 0
    ? (withData.reduce((s, p) => s + (p.consciousness?.overall_band || 0), 0) / withData.length)
    : 0;
  const avgStreak = withData.length > 0
    ? (withData.reduce((s, p) => s + (p.consciousness?.streak_current || 0), 0) / withData.length)
    : 0;
  const totalSessions = withData.reduce((s, p) => s + (p.consciousness?.total_sessions || 0), 0);
  const totalJournals = withData.reduce((s, p) => s + (p.consciousness?.total_journal_entries || 0), 0);
  const activePractitioners = withData.filter((p) => p.consciousness?.streak_current > 0).length;
  const engagementRate = profiles.length > 0 ? Math.round((activePractitioners / profiles.length) * 100) : 0;

  // Team comparison chart
  const teamChartData = teamStats.map((ts: any) => ({
    name: ts.team.name.length > 10 ? ts.team.name.slice(0, 10) + "…" : ts.team.name,
    band: ts.avgBand,
    streak: ts.avgStreak,
    members: ts.memberCount,
  }));

  // Dimension averages
  const dimensions = ["awareness", "thought", "emotion", "body"];
  const dimAvgs = dimensions.map((dim) => {
    const avg = withData.length > 0
      ? withData.reduce((s, p) => {
          const bands = p.consciousness?.dimension_bands as Record<string, number> | undefined;
          return s + (bands?.[dim] || 0);
        }, 0) / withData.length
      : 0;
    return { dimension: dim.charAt(0).toUpperCase() + dim.slice(1), value: Number(avg.toFixed(1)) };
  });

  return (
    <motion.div
      className="space-y-6 print:space-y-4"
      id="quarterly-report"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="glass-card rounded-2xl border border-border/20 p-6 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">
              Q{quarter} {year} Consciousness Report
            </h2>
            <p className="text-sm text-muted-foreground font-body">{orgName || "Organization"}</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Brain, label: "Avg Band", value: avgBand.toFixed(1), color: "text-primary" },
          { icon: Flame, label: "Avg Streak", value: `${Math.round(avgStreak)}d`, color: "text-orange-500" },
          { icon: Users, label: "Engagement", value: `${engagementRate}%`, color: "text-chart-2" },
          { icon: TrendingUp, label: "Total Sessions", value: String(totalSessions), color: "text-chart-4" },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-card rounded-2xl border border-border/20 p-4 text-center">
            <kpi.icon className={`w-5 h-5 mx-auto mb-1 ${kpi.color}`} />
            <p className="text-2xl font-display font-bold text-foreground">{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Team Performance */}
      {teamChartData.length > 0 && (
        <div className="glass-card rounded-2xl border border-border/20 p-5">
          <h3 className="font-display text-base font-semibold text-foreground mb-4">Team Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={teamChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={30} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
              <Bar dataKey="band" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Avg Band" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Dimensions */}
      <div className="glass-card rounded-2xl border border-border/20 p-5">
        <h3 className="font-display text-base font-semibold text-foreground mb-4">Org Dimension Averages</h3>
        <div className="space-y-3">
          {dimAvgs.map((d) => (
            <div key={d.dimension}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-body text-muted-foreground">{d.dimension}</span>
                <span className="text-xs font-body font-medium text-foreground">{d.value}</span>
              </div>
              <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary" style={{ width: `${Math.min(d.value * 10, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="glass-card rounded-2xl border border-border/20 p-5">
        <h3 className="font-display text-base font-semibold text-foreground mb-3">Summary</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-xs text-muted-foreground font-body">Total Employees</span>
            <p className="font-display font-bold text-foreground">{profiles.length}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-body">Active Practitioners</span>
            <p className="font-display font-bold text-foreground">{activePractitioners}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-body">Journal Entries</span>
            <p className="font-display font-bold text-foreground">{totalJournals}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-body">Sessions (30d)</span>
            <p className="font-display font-bold text-foreground">{sessionTrends.length}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
