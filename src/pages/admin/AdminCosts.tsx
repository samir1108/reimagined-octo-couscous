import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { StatCard } from '@/components/admin/StatCard';
import { Skeleton } from "@/design-system";
import { Badge } from "@/design-system";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/design-system";
import {
  IndianRupee, Zap, TrendingUp, TrendingDown, AlertTriangle,
  Users, Cpu, BarChart3, Percent, ShoppingCart,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, AreaChart, Area,
} from 'recharts';

function useCostDashboard(days: number = 30) {
  return useQuery({
    queryKey: ['admin-cost-dashboard', days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_cost_dashboard', { p_days: days });
      if (error) throw error;
      return data as {
        total_ai_calls: number;
        total_tokens: number;
        total_cost_paise: number;
        total_charged_paise: number;
        total_revenue_paise: number;
        total_purchases: number;
        error_count: number;
        margin_pct: number;
        daily_costs: { day: string; calls: number; tokens: number; cost_paise: number; charged_paise: number }[];
        daily_revenue: { day: string; purchases: number; revenue_paise: number; amount_paise: number }[];
        function_costs: { function_name: string; calls: number; tokens: number; cost_paise: number; charged_paise: number; avg_tokens: number }[];
        model_costs: { model: string; calls: number; tokens: number; cost_paise: number }[];
        top_users: { user_id: string; display_name: string; calls: number; tokens: number; cost_paise: number; charged_paise: number; balance_paise: number }[];
      };
    },
    refetchInterval: 60000,
  });
}

function formatPaise(paise: number) {
  return `₹${(paise / 100).toFixed(2)}`;
}

function formatTokens(tokens: number) {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
  return tokens.toString();
}

const tooltipStyle = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 8,
  color: 'hsl(var(--foreground))',
};

export default function AdminCosts() {
  const { data, isLoading } = useCostDashboard(30);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (!data) return <p className="text-muted-foreground">Failed to load cost data.</p>;

  const profit = data.total_charged_paise - data.total_cost_paise;
  const isProfitable = profit >= 0;

  // Merge daily cost + revenue for combo chart
  const dailyMap = new Map<string, { day: string; cost: number; charged: number; revenue: number; calls: number }>();
  (data.daily_costs || []).forEach((d) => {
    const key = d.day;
    dailyMap.set(key, {
      day: new Date(d.day).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      cost: d.cost_paise / 100,
      charged: d.charged_paise / 100,
      revenue: 0,
      calls: d.calls,
    });
  });
  (data.daily_revenue || []).forEach((d) => {
    const existing = dailyMap.get(d.day);
    if (existing) {
      existing.revenue = d.revenue_paise / 100;
    } else {
      dailyMap.set(d.day, {
        day: new Date(d.day).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        cost: 0, charged: 0, revenue: d.revenue_paise / 100, calls: 0,
      });
    }
  });
  const dailyCombo = Array.from(dailyMap.values()).sort((a, b) => a.day.localeCompare(b.day));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Cost & Revenue Dashboard</h2>
        <p className="text-sm text-muted-foreground">AI usage costs vs credit revenue — Last 30 days</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="AI Cost" value={formatPaise(data.total_cost_paise)} icon={Cpu} subtitle="estimated" />
        <StatCard title="Charged to Users" value={formatPaise(data.total_charged_paise)} icon={IndianRupee} />
        <StatCard title="Credit Purchases" value={formatPaise(data.total_revenue_paise)} icon={ShoppingCart} subtitle={`${data.total_purchases} txns`} />
        <StatCard
          title="Profit/Loss"
          value={formatPaise(Math.abs(profit))}
          icon={isProfitable ? TrendingUp : TrendingDown}
          subtitle={isProfitable ? '✅ Profit' : '🔴 Loss'}
        />
        <StatCard title="Total AI Calls" value={data.total_ai_calls.toLocaleString()} icon={Zap} />
        <StatCard title="Total Tokens" value={formatTokens(data.total_tokens)} icon={BarChart3} />
        <StatCard title="Margin" value={`${data.margin_pct}%`} icon={Percent} />
        <StatCard title="Errors" value={data.error_count} icon={AlertTriangle} subtitle={data.error_count > 0 ? 'check logs' : 'clean'} />
      </div>

      {/* Daily Cost vs Revenue Chart */}
      {dailyCombo.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Daily: Cost vs Charged vs Revenue (₹)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dailyCombo}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Area type="monotone" dataKey="cost" name="AI Cost" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="charged" name="Charged" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--accent-foreground))" fill="hsl(var(--accent))" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <Tabs defaultValue="functions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="functions">By Function</TabsTrigger>
          <TabsTrigger value="models">By Model</TabsTrigger>
          <TabsTrigger value="users">Top Users</TabsTrigger>
        </TabsList>

        {/* Functions Tab */}
        <TabsContent value="functions">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Cost by Edge Function</h3>
            {data.function_costs?.length ? (
              <div className="space-y-2">
                <div className="grid grid-cols-6 gap-2 text-[10px] text-muted-foreground uppercase tracking-wider pb-2 border-b border-border">
                  <span className="col-span-2">Function</span>
                  <span className="text-right">Calls</span>
                  <span className="text-right">Tokens</span>
                  <span className="text-right">Cost</span>
                  <span className="text-right">Charged</span>
                </div>
                {data.function_costs.map((f) => (
                  <div key={f.function_name} className="grid grid-cols-6 gap-2 text-sm py-1.5 border-b border-border/30">
                    <span className="col-span-2 text-foreground font-mono text-xs truncate">{f.function_name}</span>
                    <span className="text-right text-muted-foreground">{f.calls}</span>
                    <span className="text-right text-muted-foreground">{formatTokens(f.tokens)}</span>
                    <span className="text-right text-foreground">{formatPaise(f.cost_paise)}</span>
                    <span className="text-right text-primary">{formatPaise(f.charged_paise)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No AI usage data yet</p>
            )}
          </div>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Cost by AI Model</h3>
            {data.model_costs?.length ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.model_costs.map((m) => ({ ...m, cost: m.cost_paise / 100 }))}>
                    <XAxis dataKey="model" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="cost" name="Cost ₹" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-1.5">
                  {data.model_costs.map((m) => (
                    <div key={m.model} className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-mono text-xs">{m.model}</span>
                      <div className="flex gap-4">
                        <Badge variant="outline" className="text-[10px]">{m.calls} calls</Badge>
                        <span className="text-muted-foreground">{formatTokens(m.tokens)} tok</span>
                        <span className="font-medium text-foreground">{formatPaise(m.cost_paise)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No model data yet</p>
            )}
          </div>
        </TabsContent>

        {/* Top Users Tab */}
        <TabsContent value="users">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-muted-foreground">Top Spending Users</h3>
            </div>
            {data.top_users?.length ? (
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-2 text-[10px] text-muted-foreground uppercase tracking-wider pb-2 border-b border-border">
                  <span className="col-span-2">User</span>
                  <span className="text-right">Calls</span>
                  <span className="text-right">Tokens</span>
                  <span className="text-right">Cost</span>
                  <span className="text-right">Charged</span>
                  <span className="text-right">Balance</span>
                </div>
                {data.top_users.map((u, i) => (
                  <div key={u.user_id} className="grid grid-cols-7 gap-2 text-sm py-1.5 border-b border-border/30">
                    <span className="col-span-2 text-foreground text-xs truncate">
                      <span className="text-muted-foreground mr-1">{i + 1}.</span>
                      {u.display_name || u.user_id.slice(0, 8)}
                    </span>
                    <span className="text-right text-muted-foreground">{u.calls}</span>
                    <span className="text-right text-muted-foreground">{formatTokens(u.tokens)}</span>
                    <span className="text-right text-foreground">{formatPaise(u.cost_paise)}</span>
                    <span className="text-right text-primary">{formatPaise(u.charged_paise)}</span>
                    <span className="text-right text-muted-foreground">{formatPaise(u.balance_paise)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No user data yet</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
