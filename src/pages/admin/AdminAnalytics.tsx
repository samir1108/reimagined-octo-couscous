import { useAdminAnalytics } from '@/hooks/useAdminData';
import { StatCard } from '@/components/admin/StatCard';
import { Skeleton } from "@/design-system";
import { Badge } from "@/design-system";
import { Users, Calendar, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';

export default function AdminAnalytics() {
  const { data, isLoading } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!data) return <p className="text-muted-foreground">Failed to load analytics.</p>;

  const sessionData = (data.session_trends || []).map((d) => ({
    date: new Date(d.session_date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    sessions: d.session_count,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Platform Analytics</h2>
        <p className="text-sm text-muted-foreground">Deep insights into platform health and user engagement</p>
      </div>

      {/* Retention */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Active (7 days)" value={data.retention_7d} icon={TrendingUp} />
        <StatCard title="Active (30 days)" value={data.retention_30d} icon={Users} />
        <StatCard title="Active (90 days)" value={data.retention_90d} icon={Calendar} />
      </div>

      {/* Session Trends */}
      {sessionData.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Session Volume — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={sessionData}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} />
              <Line type="monotone" dataKey="sessions" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Band Distribution */}
        {data.band_distribution?.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Consciousness Band Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.band_distribution}>
                <XAxis dataKey="band_range" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="user_count" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Loops */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Most Common Active Loops</h3>
          {data.top_loops?.length ? (
            <div className="space-y-3">
              {data.top_loops.map((l, i) => (
                <div key={l.loop_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
                    <span className="text-sm text-foreground">{l.loop_id}</span>
                  </div>
                  <Badge variant="outline">{l.user_count} users</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active loops</p>
          )}
        </div>
      </div>
    </div>
  );
}
