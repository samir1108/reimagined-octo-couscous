import { useAdminAnalytics } from '@/hooks/useAdminData';
import { Skeleton } from "@/design-system";
import { Badge } from "@/design-system";
import { Building2, Users, Target } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminEnterprise() {
  const { data, isLoading } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  const orgs = data?.orgs_summary || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Enterprise Overview</h2>
        <p className="text-sm text-muted-foreground">{orgs.length} organization{orgs.length !== 1 ? 's' : ''} registered</p>
      </div>

      {orgs.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No organizations yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orgs.map((org) => (
            <div key={org.id} className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{org.name}</h3>
                <p className="text-xs text-muted-foreground">/{org.slug} · Created {format(new Date(org.created_at), 'MMM d, yyyy')}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{org.member_count}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span>{org.active_challenges}</span>
                </div>
                <Badge variant="outline">{org.member_count > 0 ? 'Active' : 'Empty'}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
