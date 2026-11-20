import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { ArrowLeft, Brain, Flame, Target, BookOpen, Eye, Activity, Calendar, Loader2, BarChart3, Heart, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useEmployeeDetail, type OrgMember, type Organization } from "@/hooks/useEnterprise";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format } from "date-fns";

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5 } }),
};

function MetricCard({ icon: Icon, label, value, color, delay }: {
  icon: typeof Brain; label: string; value: string; color: string; delay: number;
}) {
  return (
    <motion.div
      className="glass-card rounded-xl p-4 border border-border/20"
      variants={fadeIn}
      custom={delay}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-display font-bold text-foreground">{value}</p>
    </motion.div>
  );
}

export default function EmployeeDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { membership } = useOutletContext<{ membership: OrgMember; org: Organization | null }>();
  const { data, isLoading } = useEmployeeDetail(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!data || !data.profile) {
    return (
      <div className="text-center py-20">
        <Brain className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground font-body">Employee not found</p>
        <button onClick={() => navigate("/enterprise/employees")} className="mt-4 text-primary text-sm hover:underline">
          ← Back to employees
        </button>
      </div>
    );
  }

  const { profile, consciousness, sessions, journals, loops, reflections } = data;
  const dimensionBands = consciousness?.dimension_bands as Record<string, number> | undefined;
  const yogaPaths = consciousness?.yoga_path_affinity as Record<string, number> | undefined;

  // Session chart data (last 30 sessions)
  const sessionChartData = sessions.slice(0, 30).reverse().map((s: any) => ({
    date: format(new Date(s.session_date), "MMM d"),
    type: s.type,
  }));

  // Group sessions by date for trend
  const sessionsByDate: Record<string, number> = {};
  sessions.forEach((s: any) => {
    const d = s.session_date;
    sessionsByDate[d] = (sessionsByDate[d] || 0) + 1;
  });
  const sessionTrendData = Object.entries(sessionsByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, count]) => ({ date: format(new Date(date), "MMM d"), sessions: count }));

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate("/enterprise/employees")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Employees
      </button>

      {/* Profile Header */}
      <motion.div
        className="glass-card rounded-2xl border border-border/20 p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-2xl">
            {(profile.display_name?.[0] || "?").toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold text-foreground">
              {profile.display_name || "Unknown"}
            </h1>
            <p className="text-sm text-muted-foreground font-body">{profile.bio || "No bio"}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-body font-medium">
                Day {consciousness?.journey_day || 1}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body capitalize">
                {consciousness?.journey_phase || "assessment"}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body capitalize">
                {consciousness?.chitta_vritti || "vikshipta"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <MetricCard icon={Brain} label="Band" value={consciousness?.overall_band?.toFixed(1) || "0"} color="bg-primary/10 text-primary" delay={0} />
        <MetricCard icon={Flame} label="Streak" value={`${consciousness?.streak_current || 0}d`} color="bg-orange-500/10 text-orange-500" delay={1} />
        <MetricCard icon={Target} label="V-Level" value={consciousness?.v_level_current?.toFixed(1) || "0"} color="bg-chart-4/10 text-chart-4" delay={2} />
        <MetricCard icon={Eye} label="Witness" value={consciousness?.witness_depth?.toFixed(2) || "0"} color="bg-chart-2/10 text-chart-2" delay={3} />
        <MetricCard icon={Activity} label="Sessions" value={String(consciousness?.total_sessions || 0)} color="bg-chart-1/10 text-chart-1" delay={4} />
        <MetricCard icon={BookOpen} label="Journals" value={String(consciousness?.total_journal_entries || 0)} color="bg-chart-3/10 text-chart-3" delay={5} />
      </div>

      {/* Dimension Bands & Yoga Paths */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dimension Bands */}
        <motion.div
          className="glass-card rounded-2xl border border-border/20 p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-display text-base font-semibold text-foreground mb-4">Dimension Bands</h3>
          <div className="space-y-3">
            {dimensionBands ? Object.entries(dimensionBands).map(([dim, val]) => (
              <div key={dim}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-body text-muted-foreground capitalize">{dim}</span>
                  <span className="text-xs font-body font-medium text-foreground">{typeof val === 'number' ? val.toFixed(1) : val}</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted/30 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((typeof val === 'number' ? val : 0) * 10, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground font-body text-center py-4">No dimension data</p>
            )}
          </div>
        </motion.div>

        {/* Yoga Path Affinity */}
        <motion.div
          className="glass-card rounded-2xl border border-border/20 p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-display text-base font-semibold text-foreground mb-4">Yoga Path Affinity</h3>
          <div className="space-y-3">
            {yogaPaths ? Object.entries(yogaPaths).map(([path, val]) => {
              const pathNames: Record<string, string> = { raja: "Raja (Mind)", jnana: "Jnana (Knowledge)", karma: "Karma (Action)", bhakti: "Bhakti (Devotion)" };
              return (
                <div key={path}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-body text-muted-foreground">{pathNames[path] || path}</span>
                    <span className="text-xs font-body font-medium text-foreground">{typeof val === 'number' ? (val * 100).toFixed(0) : 0}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted/30 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-chart-4/60 to-chart-4"
                      initial={{ width: 0 }}
                      animate={{ width: `${(typeof val === 'number' ? val : 0) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm text-muted-foreground font-body text-center py-4">No path data</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Session Activity Chart */}
      {sessionTrendData.length > 0 && (
        <motion.div
          className="glass-card rounded-2xl border border-border/20 p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="font-display text-base font-semibold text-foreground mb-4">Session Activity</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={sessionTrendData}>
              <defs>
                <linearGradient id="gradEmpSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={25} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
              />
              <Area type="monotone" dataKey="sessions" stroke="hsl(var(--primary))" fill="url(#gradEmpSessions)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Loops & Advanced Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Loops */}
        <motion.div
          className="glass-card rounded-2xl border border-border/20 p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="font-display text-base font-semibold text-foreground mb-4">Detected Loops</h3>
          {loops.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body text-center py-4">No loops detected yet</p>
          ) : (
            <div className="space-y-2">
              {loops.map((loop: any) => (
                <div key={loop.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/10">
                  <div>
                    <p className="text-sm font-body font-medium text-foreground capitalize">{loop.loop_id.replace(/_/g, " ")}</p>
                    <p className="text-[10px] text-muted-foreground font-body">
                      Awareness: {(loop.awareness_score * 100).toFixed(0)}% • {loop.severity}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-body font-medium ${
                    loop.status === "active" ? "bg-orange-500/10 text-orange-500" :
                    loop.status === "dissolving" ? "bg-chart-2/10 text-chart-2" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {loop.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Advanced Metrics */}
        <motion.div
          className="glass-card rounded-2xl border border-border/20 p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="font-display text-base font-semibold text-foreground mb-4">Advanced Metrics</h3>
          <div className="space-y-2">
            <DetailRow label="Witness Stability" value={consciousness?.witness_stability?.toFixed(2) || "—"} />
            <DetailRow label="Witness Gap" value={consciousness?.witness_gap?.toFixed(2) || "—"} />
            <DetailRow label="Integration Score" value={consciousness?.integration_score?.toFixed(2) || "—"} />
            <DetailRow label="Bypassing Risk" value={consciousness?.bypassing_risk?.toFixed(2) || "—"} />
            <DetailRow label="V-Level Peak" value={consciousness?.v_level_peak?.toFixed(1) || "—"} />
            <DetailRow label="V-Level Baseline" value={consciousness?.v_level_baseline?.toFixed(1) || "—"} />
            <DetailRow label="Longest Streak" value={`${consciousness?.streak_longest || 0} days`} />
            <DetailRow label="Dominant Path" value={consciousness?.dominant_path || "—"} />
          </div>
        </motion.div>
      </div>

      {/* Recent Journal Entries */}
      <motion.div
        className="glass-card rounded-2xl border border-border/20 p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <h3 className="font-display text-base font-semibold text-foreground mb-4">Recent Journal Entries</h3>
        {journals.length === 0 ? (
          <p className="text-sm text-muted-foreground font-body text-center py-4">No journal entries yet</p>
        ) : (
          <div className="space-y-3">
            {journals.slice(0, 8).map((j: any) => (
              <div key={j.id} className="p-3 rounded-xl bg-muted/10 border border-border/10">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-body font-medium text-foreground">{j.title || "Untitled"}</p>
                  <span className="text-[10px] text-muted-foreground font-body">
                    {format(new Date(j.created_at), "MMM d, yyyy")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-body line-clamp-2">
                  {j.content?.slice(0, 150)}{j.content?.length > 150 ? "..." : ""}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {j.mood && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-chart-2/10 text-chart-2 font-body">{j.mood}</span>
                  )}
                  {Array.isArray(j.tags) && j.tags.slice(0, 3).map((tag: string, i: number) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-body">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Session History */}
      <motion.div
        className="glass-card rounded-2xl border border-border/20 overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <div className="px-5 py-4 border-b border-border/10">
          <h3 className="font-display text-base font-semibold text-foreground">Session History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/10">
                {["Date", "Type", "Time Slot", "Status", "Summary"].map((h) => (
                  <th key={h} className="text-left px-5 py-2.5 text-[11px] font-body font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-sm text-muted-foreground font-body">
                    No sessions yet
                  </td>
                </tr>
              ) : sessions.slice(0, 20).map((s: any) => (
                <tr key={s.id} className="border-b border-border/5 hover:bg-muted/10 transition-colors">
                  <td className="px-5 py-2.5 text-sm font-body text-foreground">
                    {format(new Date(s.session_date), "MMM d, yyyy")}
                  </td>
                  <td className="px-5 py-2.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-body capitalize">{s.type}</span>
                  </td>
                  <td className="px-5 py-2.5 text-xs font-body text-muted-foreground capitalize">{s.time_slot}</td>
                  <td className="px-5 py-2.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-body ${
                      s.status === "completed" ? "bg-chart-2/10 text-chart-2" : "bg-muted text-muted-foreground"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-xs font-body text-muted-foreground max-w-xs truncate">
                    {s.summary || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
      <span className="text-xs text-muted-foreground font-body">{label}</span>
      <span className="text-sm font-body font-medium text-foreground capitalize">{value}</span>
    </div>
  );
}
