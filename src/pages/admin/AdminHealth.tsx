import { useAdminHealthOverview, useComputeHealthScores } from '@/hooks/useAdminData';
import { StatCard } from '@/components/admin/StatCard';
import { Skeleton } from "@/design-system";
import { Badge } from "@/design-system";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system";
import { Button } from "@/design-system";
import { useNavigate } from 'react-router-dom';
import {
  Heart, AlertTriangle, ShieldAlert, ShieldCheck, Activity, RefreshCw, TrendingDown,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const riskColors: Record<string, string> = {
  healthy: 'text-green-400 bg-green-400/10',
  warning: 'text-yellow-400 bg-yellow-400/10',
  at_risk: 'text-orange-400 bg-orange-400/10',
  critical: 'text-red-400 bg-red-400/10',
};

const riskIcons: Record<string, typeof Heart> = {
  healthy: ShieldCheck,
  warning: AlertTriangle,
  at_risk: ShieldAlert,
  critical: TrendingDown,
};

export default function AdminHealth() {
  const { data, isLoading } = useAdminHealthOverview();
  const computeMutation = useComputeHealthScores();
  const navigate = useNavigate();

  const handleCompute = async () => {
    try {
      const count = await computeMutation.mutateAsync();
      toast({ title: 'Health scores computed', description: `Updated ${count} users` });
    } catch {
      toast({ title: 'Error', description: 'Failed to compute', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!data) return <p className="text-muted-foreground">No health data. Compute scores first.</p>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">User Health Scores</h2>
          <p className="text-sm text-muted-foreground">Engagement, churn risk, and health scoring for all users</p>
        </div>
        <Button onClick={handleCompute} disabled={computeMutation.isPending} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${computeMutation.isPending ? 'animate-spin' : ''}`} />
          {computeMutation.isPending ? 'Computing...' : 'Recompute Scores'}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Healthy" value={data.healthy} icon={ShieldCheck} subtitle={`of ${data.total_scored} users`} trend="up" />
        <StatCard title="Warning" value={data.warning} icon={AlertTriangle} />
        <StatCard title="At Risk" value={data.at_risk} icon={ShieldAlert} trend="down" />
        <StatCard title="Critical" value={data.critical} icon={TrendingDown} trend="down" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard title="Avg Engagement" value={`${data.avg_engagement}/100`} icon={Activity} />
        <StatCard title="Avg Churn Risk" value={`${data.avg_churn_risk}%`} icon={AlertTriangle} />
      </div>

      {/* At-risk users list */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Users Needing Attention</h3>
        {data.at_risk_users?.length ? (
          <div className="space-y-2">
            {data.at_risk_users.map((u) => {
              const Icon = riskIcons[u.risk_level] || AlertTriangle;
              const colorClass = riskColors[u.risk_level] || '';

              return (
                <div
                  key={u.user_id}
                  onClick={() => navigate(`/admin/users/${u.user_id}`)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/20 cursor-pointer transition-colors"
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={u.avatar_url || undefined} />
                    <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                      {(u.display_name || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{u.display_name || 'Anonymous'}</p>
                    <div className="flex gap-2 items-center">
                      {u.risk_factors?.map((f: any, i: number) => (
                        <span key={i} className="text-[10px] text-muted-foreground">
                          {f.factor === 'inactive' ? `${f.days}d inactive` : `eng: ${f.score}`}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="outline" className={`text-[10px] ${colorClass}`}>
                      {u.risk_level.replace('_', ' ')}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {u.last_active_at ? formatDistanceToNow(new Date(u.last_active_at), { addSuffix: true }) : 'Never active'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No at-risk users 🎉</p>
        )}
      </div>
    </div>
  );
}
