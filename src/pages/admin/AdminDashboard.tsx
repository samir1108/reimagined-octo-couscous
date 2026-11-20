import { useAdminStats } from '@/hooks/useAdminData';
import { useAdminFunnel } from '@/hooks/useAdminSessionData';
import { StatCard } from '@/components/admin/StatCard';
import { Skeleton } from "@/design-system";
import { Badge } from "@/design-system";
import { useNavigate } from 'react-router-dom';
import {
  Users, Activity, BookOpen, CheckSquare, Brain, Building2,
  Flame, Target, Database, Zap, TrendingUp, Clock, MessageSquare,
  ArrowRight, Bot, HeartPulse, BarChart3,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function FunnelBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-mono">{value} <span className="text-muted-foreground">({pct}%)</span></span>
      </div>
      <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, to }: { icon: typeof Users; label: string; to: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors text-left w-full group"
    >
      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <span className="text-sm font-medium text-foreground flex-1">{label}</span>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </button>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();
  const { data: funnel, isLoading: funnelLoading } = useAdminFunnel();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return <p className="text-muted-foreground">Failed to load stats.</p>;

  const signupData = (stats.signups_last_30_days || []).map((d) => ({
    date: new Date(d.signup_date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    signups: d.count,
  }));

  return (
    <div className="space-y-8">
      {/* Header with live pulse */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Command Center</h2>
          <p className="text-sm text-muted-foreground">Real-time platform intelligence</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-xs text-muted-foreground">Live</span>
          <Badge variant="outline" className="text-[10px] ml-1">{stats.sessions_today} sessions today</Badge>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Total Users" value={stats.total_users} icon={Users} subtitle={`${stats.onboarded_users} onboarded`} />
        <StatCard title="Sessions Today" value={stats.sessions_today} icon={Activity} />
        <StatCard title="Total Sessions" value={stats.total_sessions.toLocaleString()} icon={Zap} />
        <StatCard title="Journal Entries" value={stats.total_journals.toLocaleString()} icon={BookOpen} />
        <StatCard title="Tasks Done" value={stats.completed_tasks.toLocaleString()} icon={CheckSquare} subtitle={`of ${stats.total_tasks.toLocaleString()}`} />
        <StatCard title="Avg Band" value={stats.avg_consciousness_band} icon={Brain} />
        <StatCard title="Memories" value={stats.total_memories.toLocaleString()} icon={Database} />
        <StatCard title="Organizations" value={stats.total_orgs} icon={Building2} />
        <StatCard title="Challenges" value={stats.active_challenges} icon={Target} />
        <StatCard title="Onboard Rate" value={stats.total_users > 0 ? `${Math.round((stats.onboarded_users / stats.total_users) * 100)}%` : '0%'} icon={Flame} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Funnel */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">User Conversion Funnel</h3>
          </div>
          {funnelLoading || !funnel ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-6 rounded" />)}
            </div>
          ) : (
            <div className="space-y-3">
              <FunnelBar label="Signed Up" value={funnel.total_signups} total={funnel.total_signups} color="bg-primary" />
              <FunnelBar label="Onboarded" value={funnel.onboarded} total={funnel.total_signups} color="bg-primary/90" />
              <FunnelBar label="First Session" value={funnel.had_first_session} total={funnel.total_signups} color="bg-primary/80" />
              <FunnelBar label="3+ Sessions" value={funnel.had_3_sessions} total={funnel.total_signups} color="bg-primary/70" />
              <FunnelBar label="Wrote Journal" value={funnel.had_journal} total={funnel.total_signups} color="bg-primary/60" />
              <FunnelBar label="Completed Task" value={funnel.completed_task} total={funnel.total_signups} color="bg-primary/50" />
              <FunnelBar label="Streak 3+" value={funnel.streak_3plus} total={funnel.total_signups} color="bg-primary/40" />
              <FunnelBar label="Band ≥ 3" value={funnel.band_above_3} total={funnel.total_signups} color="bg-accent" />

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{funnel.avg_session_duration_min}m</p>
                  <p className="text-[10px] text-muted-foreground">Avg Session</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{funnel.sessions_per_user_avg}</p>
                  <p className="text-[10px] text-muted-foreground">Sessions/User</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{funnel.active_7d}</p>
                  <p className="text-[10px] text-muted-foreground">Active 7d</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <QuickAction icon={Users} label="View All Users" to="/admin/users" />
            <QuickAction icon={MessageSquare} label="Session Conversations" to="/admin/sessions" />
            <QuickAction icon={HeartPulse} label="Health & Churn Risk" to="/admin/health" />
            <QuickAction icon={Bot} label="Ask AI Copilot" to="/admin/copilot" />
            <QuickAction icon={BarChart3} label="Deep Analytics" to="/admin/analytics" />
            <QuickAction icon={Activity} label="Live Activity Feed" to="/admin/activity" />
            <QuickAction icon={Database} label="Cost Dashboard" to="/admin/costs" />
          </div>
        </div>
      </div>

      {/* Signups Chart */}
      {signupData.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">New Signups — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={signupData}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="signups" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
