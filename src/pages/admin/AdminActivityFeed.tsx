import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminActivityFeed } from '@/hooks/useAdminData';
import { supabase } from '@/lib/supabase';
import { Skeleton } from "@/design-system";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system";
import { Badge } from "@/design-system";
import { Activity, BookOpen, CheckSquare, UserPlus, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const eventIcons: Record<string, typeof Activity> = {
  session: Zap,
  journal: BookOpen,
  task: CheckSquare,
  auth: UserPlus,
};

const eventColors: Record<string, string> = {
  session: 'text-blue-400',
  journal: 'text-purple-400',
  task: 'text-green-400',
  auth: 'text-primary',
};

export default function AdminActivityFeed() {
  const { data: feed, isLoading } = useAdminActivityFeed();
  const qc = useQueryClient();
  const channelNameRef = useRef(`admin-live-pulse-${Math.random().toString(36).slice(2)}`);

  // Realtime: any new session, journal, task, or signup invalidates the feed instantly.
  useEffect(() => {
    const ch = supabase
      .channel(channelNameRef.current)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sessions' },
        () => qc.invalidateQueries({ queryKey: ['admin-activity-feed'] }))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'journal_entries' },
        () => qc.invalidateQueries({ queryKey: ['admin-activity-feed'] }))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' },
        () => qc.invalidateQueries({ queryKey: ['admin-activity-feed'] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Live Activity Feed</h2>
        <p className="text-sm text-muted-foreground">Real-time user activity across the platform (auto-refreshes every 10s)</p>
      </div>

      {!feed?.length ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No activity recorded yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {feed.map((event) => {
            const Icon = eventIcons[event.event_type] || Activity;
            const color = eventColors[event.event_type] || 'text-muted-foreground';

            return (
              <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                <div className={`h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage src={event.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                    {(event.display_name || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{event.display_name || 'Anonymous'}</span>
                    {' '}
                    <span className="text-muted-foreground">{event.event_name}</span>
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {event.event_type}
                </Badge>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
