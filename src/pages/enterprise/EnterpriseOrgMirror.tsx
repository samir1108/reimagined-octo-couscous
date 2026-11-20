import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Activity, TrendingUp, AlertTriangle, ShieldCheck, Sparkles } from "lucide-react";
import { useLoopEpidemiology, useDepartmentPulse, useConsciousnessHistory } from "@/hooks/useOrgIntelligence";
import { type Organization, type OrgMember, useOrgEmployeeProfiles } from "@/hooks/useEnterprise";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { format, parseISO } from "date-fns";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass-card rounded-2xl p-5 border border-border/20 ${className}`}>{children}</div>;
}

export default function EnterpriseOrgMirror() {
  const { membership, org } = useOutletContext<{ membership: OrgMember; org: Organization | null }>();
  const orgId = membership?.org_id;

  const { data: epi = [], isLoading: epiLoading } = useLoopEpidemiology(orgId, 30);
  const { data: depts = [], isLoading: deptLoading } = useDepartmentPulse(orgId, 7);
  const { data: history = [] } = useConsciousnessHistory(orgId);
  const { data: profiles = [] } = useOrgEmployeeProfiles(orgId);

  // Live consciousness index (composite)
  const active = profiles.filter((p) => p.consciousness?.total_sessions);
  const engagementPct = profiles.length > 0 ? Math.round((active.length / profiles.length) * 100) : 0;
  const avgBand = active.length > 0 ? active.reduce((s, p) => s + (p.consciousness?.overall_band || 0), 0) / active.length : 0;
  const avgStreak = active.length > 0 ? active.reduce((s, p) => s + (p.consciousness?.streak_current || 0), 0) / active.length : 0;
  const consciousnessIndex = Math.round(engagementPct * 4 + avgBand * 40 + Math.min(avgStreak, 30) * 8);

  // 11-band distribution
  const bandDist = Array.from({ length: 11 }, (_, b) => ({
    band: `B${b}`,
    count: active.filter((p) => Math.round(p.consciousness?.overall_band || 0) === b).length,
  }));

  // History series
  const historySeries = [...history]
    .reverse()
    .map((h) => ({ month: format(parseISO(h.snapshot_month), "MMM"), index: Number(h.consciousness_index) }));

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-body">HR / Wellness</p>
        <h1 className="font-display text-3xl font-bold text-foreground mt-1">Org Mirror</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">{org?.name} — anonymized organizational consciousness, n≥5 enforced.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/15 to-primary/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-body">Consciousness Index</p>
              <p className="text-4xl font-display font-bold text-primary mt-1">{consciousnessIndex}</p>
              <p className="text-xs text-muted-foreground font-body mt-1">/ 1000</p>
            </div>
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
        </Card>
        <Card>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-body">Engagement</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">{engagementPct}%</p>
          <p className="text-xs text-muted-foreground font-body mt-1">{active.length} / {profiles.length} active</p>
        </Card>
        <Card>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-body">Avg Band</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">{avgBand.toFixed(1)}</p>
        </Card>
        <Card>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-body">Avg Streak</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">{avgStreak.toFixed(0)}d</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="font-display text-sm font-semibold text-foreground">Consciousness Index — last 12 months</h3>
          </div>
          {historySeries.length === 0 ? (
            <p className="text-xs text-muted-foreground font-body py-12 text-center">No snapshots yet. Generated monthly.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={historySeries}>
                <defs><linearGradient id="ci" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Area type="monotone" dataKey="index" stroke="hsl(var(--primary))" fill="url(#ci)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="font-display text-sm font-semibold text-foreground">11-Band Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={bandDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
              <XAxis dataKey="band" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm font-semibold text-foreground">Loop Epidemiology — last 30 days</h3>
          <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground font-body">n ≥ 5</span>
        </div>
        {epiLoading ? (
          <p className="text-xs text-muted-foreground font-body py-6 text-center">Analyzing…</p>
        ) : epi.length === 0 ? (
          <p className="text-xs text-muted-foreground font-body py-6 text-center">Insufficient data — no loop has been logged by 5+ employees yet.</p>
        ) : (
          <div className="space-y-2">
            {epi.map((row) => (
              <motion.div key={row.loop_id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/10 border border-border/15">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-display font-semibold text-foreground truncate">{row.loop_name}</p>
                  <p className="text-[11px] text-muted-foreground font-body">{row.user_count} employees · {row.occurrences} occurrences · intensity {Number(row.avg_intensity).toFixed(1)}/5</p>
                </div>
                <div className="w-24 h-2 rounded-full bg-muted/20 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(100, (row.user_count / Math.max(1, profiles.length)) * 100)}%` }} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm font-semibold text-foreground">Department Pulse — last 7 days</h3>
        </div>
        {deptLoading ? (
          <p className="text-xs text-muted-foreground font-body py-6 text-center">Loading…</p>
        ) : depts.length === 0 ? (
          <p className="text-xs text-muted-foreground font-body py-6 text-center">No department pulses yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {depts.map((d) => (
              <div key={d.department} className="p-3 rounded-xl bg-muted/10 border border-border/15">
                <p className="text-xs font-display font-semibold text-foreground">{d.department}</p>
                <p className="text-[11px] text-muted-foreground font-body mt-0.5">{d.user_count} responding</p>
                {d.sufficient ? (
                  <div className="flex items-center gap-3 mt-2">
                    <div><p className="text-[10px] text-muted-foreground font-body">Mood</p><p className="text-sm font-display font-bold">{Number(d.avg_mood).toFixed(1)}</p></div>
                    <div><p className="text-[10px] text-muted-foreground font-body">Energy</p><p className="text-sm font-display font-bold">{Number(d.avg_energy).toFixed(1)}</p></div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground font-body">
                    <AlertTriangle className="w-3 h-3" /> n &lt; 5 — privacy floor
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
