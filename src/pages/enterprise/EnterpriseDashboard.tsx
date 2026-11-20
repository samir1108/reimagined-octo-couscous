import { useOutletContext, useNavigate } from "react-router-dom";
import { Building2, Users, Flame, TrendingUp, Brain, Activity, BarChart3, Target, ArrowUpRight, Eye, Crown, Zap, ShieldAlert, AlertTriangle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import {
  useOrgMembers, useOrgTeams, useOrgEmployeeProfiles, useOrgSessionTrends, useOrgTeamStats,
  useOrgActivityFeed, computeOrgHealthScore, computeWellbeingAlerts,
  type Organization, type OrgMember, type EmployeeProfile,
} from "@/hooks/useEnterprise";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays, formatDistanceToNow } from "date-fns";
import AIInsightsPanel from "@/components/enterprise/AIInsightsPanel";
import TeamComparison from "@/components/enterprise/TeamComparison";
import ConsciousnessHeatMap from "@/components/enterprise/ConsciousnessHeatMap";
import MoodTrendsChart from "@/components/enterprise/MoodTrendsChart";
import TeamPulseHeatMap from "@/components/enterprise/TeamPulseHeatMap";
import WeeklyBriefingCard from "@/components/enterprise/WeeklyBriefingCard";

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5 } }),
};

function StatCard({ icon: Icon, label, value, subtitle, color, delay = 0 }: {
  icon: typeof Users; label: string; value: string | number; subtitle?: string; color: string; delay?: number;
}) {
  return (
    <motion.div
      className="glass-card rounded-2xl p-5 border border-border/20"
      variants={fadeIn}
      custom={delay}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground font-body mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}

function OrgHealthScoreCard({ score, engagement, bandGrowth, streakConsistency }: {
  score: number; engagement: number; bandGrowth: number; streakConsistency: number;
}) {
  const getColor = (s: number) => s >= 70 ? "text-green-500" : s >= 40 ? "text-yellow-500" : "text-red-500";
  const getBg = (s: number) => s >= 70 ? "from-green-500/20 to-green-500/5" : s >= 40 ? "from-yellow-500/20 to-yellow-500/5" : "from-red-500/20 to-red-500/5";

  return (
    <motion.div
      className={`glass-card rounded-2xl p-5 border border-border/20 bg-gradient-to-br ${getBg(score)}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wider">Org Health Score</p>
          <p className={`text-4xl font-display font-bold mt-1 ${getColor(score)}`}>{score}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div>
          <p className="text-[10px] text-muted-foreground font-body">Engagement</p>
          <p className="text-sm font-display font-bold text-foreground">{engagement}%</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground font-body">Avg Band</p>
          <p className="text-sm font-display font-bold text-foreground">{bandGrowth}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground font-body">Avg Streak</p>
          <p className="text-sm font-display font-bold text-foreground">{streakConsistency}d</p>
        </div>
      </div>
    </motion.div>
  );
}

function WellbeingAlerts({ alerts, navigate }: { alerts: ReturnType<typeof computeWellbeingAlerts>; navigate: (path: string) => void }) {
  if (alerts.length === 0) return null;

  return (
    <motion.div
      className="glass-card rounded-2xl border border-border/20 p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert className="w-5 h-5 text-red-400" />
        <h3 className="font-display text-base font-semibold text-foreground">Wellbeing Alerts</h3>
        <span className="ml-auto text-[10px] font-body px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">{alerts.length}</span>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {alerts.slice(0, 8).map((alert, i) => (
          <button
            key={`${alert.userId}-${alert.type}-${i}`}
            onClick={() => alert.userId && navigate(`/enterprise/employees/${alert.userId}`)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/20 transition-colors text-left"
          >
            <AlertTriangle className={`w-4 h-4 shrink-0 ${alert.severity === "critical" ? "text-red-400" : "text-yellow-400"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-body font-medium text-foreground truncate">{alert.name}</p>
              <p className="text-[10px] text-muted-foreground font-body">{alert.detail}</p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function ActivityFeed({ activities }: { activities: any[] }) {
  return (
    <motion.div
      className="glass-card rounded-2xl border border-border/20 p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="font-display text-base font-semibold text-foreground">Activity Feed</h3>
      </div>
      {activities.length === 0 ? (
        <p className="text-xs text-muted-foreground font-body text-center py-4">No activity yet. Actions like invites and milestones will appear here.</p>
      ) : (
        <div className="space-y-2 max-h-52 overflow-y-auto">
          {activities.map((a) => (
            <div key={a.id} className="flex items-start gap-2 py-1.5 border-b border-border/5 last:border-0">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-body text-foreground">{a.title}</p>
                {a.description && <p className="text-[10px] text-muted-foreground font-body">{a.description}</p>}
                <p className="text-[10px] text-muted-foreground font-body">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function EngagementChart({ sessions }: { sessions: any[] }) {
  const chartData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const count = sessions.filter((s) => s.session_date === dateStr).length;
    const uniqueUsers = new Set(sessions.filter((s) => s.session_date === dateStr).map((s) => s.user_id)).size;
    return { date: format(date, "MMM d"), sessions: count, users: uniqueUsers };
  });

  return (
    <motion.div
      className="glass-card rounded-2xl border border-border/20 p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">Engagement Trend</h3>
          <p className="text-xs text-muted-foreground font-body">Sessions & active users over 30 days</p>
        </div>
        <Activity className="w-5 h-5 text-primary" />
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="gradSessions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={6} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={30} />
          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
          <Area type="monotone" dataKey="sessions" stroke="hsl(var(--primary))" fill="url(#gradSessions)" strokeWidth={2} name="Sessions" />
          <Area type="monotone" dataKey="users" stroke="hsl(var(--chart-2))" fill="url(#gradUsers)" strokeWidth={2} name="Active Users" />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

function TeamPerformanceChart({ teamStats }: { teamStats: any[] }) {
  const chartData = teamStats.map((ts) => ({
    name: ts.team.name.length > 12 ? ts.team.name.slice(0, 12) + "…" : ts.team.name,
    band: ts.avgBand,
    members: ts.memberCount,
    sessions: ts.totalSessions,
  }));

  if (chartData.length === 0) return null;

  return (
    <motion.div
      className="glass-card rounded-2xl border border-border/20 p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">Team Performance</h3>
          <p className="text-xs text-muted-foreground font-body">Average consciousness band by team</p>
        </div>
        <BarChart3 className="w-5 h-5 text-primary" />
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={30} />
          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
          <Bar dataKey="band" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Avg Band" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

function TopPerformers({ profiles, navigate }: { profiles: EmployeeProfile[]; navigate: (path: string) => void }) {
  const sorted = [...profiles]
    .filter((p) => p.consciousness)
    .sort((a, b) => (b.consciousness?.overall_band || 0) - (a.consciousness?.overall_band || 0))
    .slice(0, 5);

  return (
    <motion.div
      className="glass-card rounded-2xl border border-border/20 p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">Top Performers</h3>
          <p className="text-xs text-muted-foreground font-body">Highest consciousness band</p>
        </div>
        <Crown className="w-5 h-5 text-yellow-500" />
      </div>
      <div className="space-y-3">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground font-body text-center py-4">No data yet</p>
        ) : sorted.map((ep, i) => (
          <button
            key={ep.member.id}
            onClick={() => ep.member.user_id && navigate(`/enterprise/employees/${ep.member.user_id}`)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/20 transition-colors text-left"
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-display ${
              i === 0 ? "bg-yellow-500/20 text-yellow-500" :
              i === 1 ? "bg-muted text-muted-foreground" :
              "bg-muted/50 text-muted-foreground"
            }`}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-body font-medium text-foreground truncate">
                {ep.profile?.display_name || ep.member.email || "Unknown"}
              </p>
              <p className="text-[10px] text-muted-foreground font-body">
                {ep.consciousness?.streak_current || 0}d streak • {ep.consciousness?.total_sessions || 0} sessions
              </p>
            </div>
            <span className="text-sm font-display font-bold text-primary">
              {ep.consciousness?.overall_band?.toFixed(1)}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function DimensionBreakdown({ profiles }: { profiles: EmployeeProfile[] }) {
  const withData = profiles.filter((p) => p.consciousness?.dimension_bands);
  if (withData.length === 0) return null;

  const dimensions = ["awareness", "thought", "emotion", "body"];
  const avgDimensions = dimensions.map((dim) => {
    const avg = withData.reduce((s, p) => {
      const bands = p.consciousness?.dimension_bands as Record<string, number> | undefined;
      return s + (bands?.[dim] || 0);
    }, 0) / withData.length;
    return { dimension: dim.charAt(0).toUpperCase() + dim.slice(1), value: Number(avg.toFixed(1)) };
  });

  return (
    <motion.div
      className="glass-card rounded-2xl border border-border/20 p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">Org Dimension Averages</h3>
          <p className="text-xs text-muted-foreground font-body">Across all employees</p>
        </div>
        <Zap className="w-5 h-5 text-primary" />
      </div>
      <div className="space-y-3">
        {avgDimensions.map((d) => (
          <div key={d.dimension}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-body text-muted-foreground">{d.dimension}</span>
              <span className="text-xs font-body font-medium text-foreground">{d.value}</span>
            </div>
            <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(d.value * 10, 100)}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function EnterpriseDashboard() {
  const navigate = useNavigate();
  const { membership, org } = useOutletContext<{ membership: OrgMember; org: Organization | null }>();

  // Manager scoping: filter by team_id
  const isManager = membership?.role === "manager";

  const { data: members = [] } = useOrgMembers(membership?.org_id);
  const { data: teams = [] } = useOrgTeams(membership?.org_id);
  const { data: allProfiles = [] } = useOrgEmployeeProfiles(membership?.org_id);
  const { data: sessionTrends = [] } = useOrgSessionTrends(membership?.org_id);
  const { data: teamStats = [] } = useOrgTeamStats(membership?.org_id);
  const { data: activities = [] } = useOrgActivityFeed(membership?.org_id);

  // Manager: scope to their team
  const employeeProfiles = isManager
    ? allProfiles.filter((p) => p.member.team_id === membership.team_id)
    : allProfiles;
  const scopedMembers = isManager
    ? members.filter((m) => m.team_id === membership.team_id)
    : members;
  const scopedSessionTrends = isManager
    ? sessionTrends.filter((s: any) => scopedMembers.some((m) => m.user_id === s.user_id))
    : sessionTrends;
  const scopedTeamStats = isManager
    ? teamStats.filter((ts: any) => ts.team.id === membership.team_id)
    : teamStats;

  const activeMembers = scopedMembers.filter((m) => m.status === "active");
  const invitedMembers = scopedMembers.filter((m) => m.status === "invited");

  const avgBand = employeeProfiles.length > 0
    ? (employeeProfiles.reduce((sum, ep) => sum + (ep.consciousness?.overall_band || 0), 0) / employeeProfiles.length).toFixed(1)
    : "—";

  const avgStreak = employeeProfiles.length > 0
    ? Math.round(employeeProfiles.reduce((sum, ep) => sum + (ep.consciousness?.streak_current || 0), 0) / employeeProfiles.length)
    : 0;

  const totalSessions = employeeProfiles.reduce((sum, ep) => sum + (ep.consciousness?.total_sessions || 0), 0);

  const activePractitioners = employeeProfiles.filter(
    (ep) => ep.consciousness && ep.consciousness.streak_current > 0
  ).length;

  // Health Score
  const healthScore = computeOrgHealthScore(employeeProfiles, scopedSessionTrends, activeMembers.length);

  // Wellbeing alerts
  const alerts = computeWellbeingAlerts(employeeProfiles);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <Building2 className="w-7 h-7 text-primary" />
          {isManager ? "Team" : org?.name || "Enterprise"} Dashboard
        </h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          {isManager ? `Your team's overview` : "Organization overview and consciousness analytics"}
        </p>
      </div>

      {/* Health Score + Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="col-span-2 lg:col-span-1">
          <OrgHealthScoreCard score={healthScore.score} engagement={healthScore.engagement} bandGrowth={healthScore.bandGrowth} streakConsistency={healthScore.streakConsistency} />
        </div>
        <StatCard icon={Users} label="Members" value={activeMembers.length} subtitle={`${invitedMembers.length} pending`} color="bg-primary/10 text-primary" delay={0} />
        <StatCard icon={Flame} label="Avg. Streak" value={`${avgStreak}d`} subtitle="days per employee" color="bg-orange-500/10 text-orange-500" delay={1} />
        <StatCard icon={Brain} label="Avg. Band" value={avgBand} subtitle="consciousness level" color="bg-chart-4/10 text-chart-4" delay={2} />
        <StatCard icon={Activity} label="Engagement" value={activeMembers.length > 0 ? `${Math.round((activePractitioners / activeMembers.length) * 100)}%` : "—"} subtitle={`${activePractitioners} active`} color="bg-chart-2/10 text-chart-2" delay={3} />
      </div>

      {/* Alerts + Activity */}
      {(alerts.length > 0 || activities.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <WellbeingAlerts alerts={alerts} navigate={navigate} />
          <ActivityFeed activities={activities} />
        </div>
      )}

      {/* Privacy-safe anonymous pulse layer (n>=5 enforced) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WeeklyBriefingCard orgId={membership.org_id} teamId={isManager ? membership.team_id || null : null} />
        <TeamPulseHeatMap orgId={membership.org_id} teamId={isManager ? membership.team_id || null : null} />
      </div>

      {/* AI Insights Engine */}
      <AIInsightsPanel employeeProfiles={employeeProfiles} orgName={org?.name} teamStats={scopedTeamStats} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EngagementChart sessions={scopedSessionTrends} />
        <TeamPerformanceChart teamStats={scopedTeamStats} />
      </div>

      {/* Team Comparison & Benchmarking */}
      {!isManager && teams.length > 0 && (
        <TeamComparison teamStats={scopedTeamStats} profiles={employeeProfiles} teams={teams} />
      )}

      {/* Consciousness Heat Map */}
      <ConsciousnessHeatMap profiles={employeeProfiles} teams={teams} />

      {/* Mood Trends */}
      <MoodTrendsChart orgId={membership.org_id} teamId={isManager ? membership.team_id || undefined : undefined} />

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TopPerformers profiles={employeeProfiles} navigate={navigate} />
        <DimensionBreakdown profiles={employeeProfiles} />

        {/* Quick Stats */}
        <motion.div
          className="glass-card rounded-2xl border border-border/20 p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="font-display text-base font-semibold text-foreground mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <QuickStat label="Total Sessions" value={String(totalSessions)} icon={Target} />
            <QuickStat label="Teams" value={String(teams.length)} icon={BarChart3} />
            <QuickStat label="Avg. Sessions/Employee" value={activeMembers.length > 0 ? (totalSessions / activeMembers.length).toFixed(0) : "0"} icon={TrendingUp} />
            <QuickStat label="Total Journal Entries" value={String(employeeProfiles.reduce((s, ep) => s + (ep.consciousness?.total_journal_entries || 0), 0))} icon={Eye} />
          </div>
        </motion.div>
      </div>

      {/* Employee Table */}
      <motion.div
        className="glass-card rounded-2xl border border-border/20 overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="px-5 py-4 border-b border-border/10 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-foreground">{isManager ? "Team Members" : "All Employees"}</h2>
          <button
            onClick={() => navigate("/enterprise/employees")}
            className="text-xs text-primary font-body hover:underline flex items-center gap-1"
          >
            View All <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/10">
                {["Employee", "Role", "Team", "Band", "Streak", "Sessions", "Phase"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-body font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employeeProfiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground font-body">
                    No employees with active profiles yet. Invite your team to get started.
                  </td>
                </tr>
              ) : (
                employeeProfiles.slice(0, 10).map((ep) => {
                  const team = teams.find((t) => t.id === ep.member.team_id);
                  return (
                    <tr
                      key={ep.member.id}
                      className="border-b border-border/5 hover:bg-muted/10 transition-colors cursor-pointer"
                      onClick={() => ep.member.user_id && navigate(`/enterprise/employees/${ep.member.user_id}`)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-xs">
                            {(ep.profile?.display_name?.[0] || ep.member.email?.[0] || "?").toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-body font-medium text-foreground">
                              {ep.profile?.display_name || ep.member.email || "Unknown"}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{ep.member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-body font-medium px-2 py-0.5 rounded-full ${
                          ep.member.role === "admin" ? "bg-primary/10 text-primary" :
                          ep.member.role === "manager" ? "bg-chart-4/10 text-chart-4" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {ep.member.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs font-body text-muted-foreground">
                        {team?.name || "—"}
                      </td>
                      <td className="px-5 py-3 text-sm font-display font-bold text-foreground">
                        {ep.consciousness?.overall_band?.toFixed(1) || "—"}
                      </td>
                      <td className="px-5 py-3 text-sm font-body text-foreground">
                        {ep.consciousness?.streak_current || 0}d
                      </td>
                      <td className="px-5 py-3 text-sm font-body text-foreground">
                        {ep.consciousness?.total_sessions || 0}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-body text-muted-foreground capitalize">
                          {ep.consciousness?.journey_phase || "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function QuickStat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Target }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-body">{label}</span>
      </div>
      <span className="text-sm font-display font-bold text-foreground">{value}</span>
    </div>
  );
}
