import { useOutletContext } from "react-router-dom";
import { Crown, TrendingUp, AlertTriangle, Building2, Users } from "lucide-react";
import { type Organization, type OrgMember, useOrgEmployeeProfiles } from "@/hooks/useEnterprise";
import { useConsciousnessHistory } from "@/hooks/useOrgIntelligence";
import { AreaChart, Area, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";

function StatBlock({ label, value, sub, icon: Icon }: { label: string; value: string; sub?: string; icon: any }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-5 border border-border/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-body">{label}</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-foreground font-body mt-1">{sub}</p>}
        </div>
        <Icon className="w-5 h-5 text-primary" />
      </div>
    </motion.div>
  );
}

export default function EnterpriseBoard() {
  const { membership, org } = useOutletContext<{ membership: OrgMember; org: Organization | null }>();
  const orgId = membership?.org_id;
  const { data: profiles = [] } = useOrgEmployeeProfiles(orgId);
  const { data: history = [] } = useConsciousnessHistory(orgId);

  const total = profiles.length;
  const active = profiles.filter((p) => p.consciousness?.total_sessions);
  const engagement = total ? Math.round((active.length / total) * 100) : 0;
  const avgBand = active.length ? active.reduce((s, p) => s + (p.consciousness?.overall_band || 0), 0) / active.length : 0;
  const avgBypassing = active.length ? active.reduce((s, p) => s + (p.consciousness?.bypassing_risk || 0), 0) / active.length : 0;
  const consciousnessIndex = Math.round(engagement * 4 + avgBand * 40 + Math.min(active.reduce((s, p) => s + (p.consciousness?.streak_current || 0), 0) / Math.max(1, active.length), 30) * 8);

  // 8-week burnout forecast (simple regression on band trend)
  const series = [...history].reverse().map((h) => ({ month: format(parseISO(h.snapshot_month), "MMM"), index: Number(h.consciousness_index), forecast: false }));
  const last = series[series.length - 1]?.index ?? consciousnessIndex;
  const trend = series.length > 1 ? (series[series.length - 1].index - series[0].index) / series.length : 0;
  const forecast = Array.from({ length: 2 }, (_, i) => ({
    month: `+${(i + 1) * 4}w`,
    index: Math.max(0, Math.round(last + trend * (i + 1))),
    forecast: true,
  }));
  const fullSeries = [...series, ...forecast];

  const burnoutRisk = Math.round(avgBypassing * 100);
  const retentionRisk = Math.round(Math.max(0, 100 - avgBand * 10));

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center gap-3">
        <Crown className="w-6 h-6 text-primary" />
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-body">Executive · Board-ready</p>
          <h1 className="font-display text-3xl font-bold text-foreground">{org?.name} — Board View</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBlock label="Consciousness Index" value={String(consciousnessIndex)} sub="/ 1000 composite" icon={TrendingUp} />
        <StatBlock label="Engagement" value={`${engagement}%`} sub={`${active.length} active`} icon={Users} />
        <StatBlock label="Burnout Risk" value={`${burnoutRisk}%`} sub="bypassing avg" icon={AlertTriangle} />
        <StatBlock label="Retention Risk" value={`${retentionRisk}%`} sub="composite" icon={Building2} />
      </div>

      <div className="glass-card rounded-2xl p-5 border border-border/20">
        <h3 className="font-display text-sm font-semibold text-foreground mb-3">Index trend + 8-week forecast</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={fullSeries}>
            <defs><linearGradient id="bd" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.5}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            <Area type="monotone" dataKey="index" stroke="hsl(var(--primary))" fill="url(#bd)" />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-muted-foreground font-body mt-2">Forecast based on trend regression. Caveat: directional, not predictive of any individual.</p>
      </div>

      <div className="glass-card rounded-2xl p-5 border border-border/20">
        <h3 className="font-display text-sm font-semibold text-foreground">Cultural Coherence (preview)</h3>
        <p className="text-xs text-muted-foreground font-body mt-1">Alignment between stated values and lived patterns surfaced from anonymous reflections. Available with 90+ days of data and quarterly reflection rounds.</p>
      </div>
    </div>
  );
}
