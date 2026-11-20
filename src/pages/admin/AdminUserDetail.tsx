import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminUserDetail, useAdminUserTimeline } from '@/hooks/useAdminData';
import { supabase } from '@/lib/supabase';
import { Skeleton } from "@/design-system";
import { Button } from "@/design-system";
import { Badge } from "@/design-system";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/design-system";
import { ArrowLeft, Brain, BookOpen, Activity, Database, Building2, Sparkles, Loader2, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { toast } from '@/hooks/use-toast';

export default function AdminUserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useAdminUserDetail(userId || '');
  const { data: timeline, isLoading: timelineLoading } = useAdminUserTimeline(userId || '');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const generateInsights = async () => {
    if (!userId) return;
    setAiLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('admin-ai-insights', {
        body: { user_id: userId },
      });
      if (error) throw error;
      setAiAnalysis(result.analysis);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to generate AI insights', variant: 'destructive' });
    } finally {
      setAiLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data?.profile) return <p className="text-muted-foreground">User not found.</p>;

  const { profile, consciousness, loops, samskaras, recent_sessions, recent_journals, memories_count, org_memberships } = data;

  const eventIcons: Record<string, string> = {
    signup: '🎉', session: '💬', journal: '📝', task: '✅',
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')} className="text-muted-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Users
      </Button>

      {/* Profile Header */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="text-lg bg-primary/20 text-primary">
            {(profile.display_name || 'U')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">{profile.display_name || 'Anonymous'}</h2>
          <p className="text-sm text-muted-foreground">Joined {format(new Date(profile.created_at), 'MMM d, yyyy')}</p>
          <div className="flex gap-2 mt-1">
            <Badge variant={profile.onboarded ? 'default' : 'secondary'}>{profile.onboarded ? 'Onboarded' : 'Not Onboarded'}</Badge>
            {consciousness && <Badge variant="outline">Band {consciousness.overall_band?.toFixed(1)}</Badge>}
          </div>
        </div>
        <Button onClick={generateInsights} disabled={aiLoading} size="sm" className="shrink-0">
          {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          AI Analysis
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="ai">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consciousness && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Brain className="h-4 w-4" /> Consciousness Profile
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Phase</span><span className="text-foreground capitalize">{consciousness.journey_phase}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Day</span><span className="text-foreground">{consciousness.journey_day}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">V-Level</span><span className="text-foreground">{consciousness.v_level_current?.toFixed(1)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Streak</span><span className="text-foreground">{consciousness.streak_current} 🔥</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Sessions</span><span className="text-foreground">{consciousness.total_sessions}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Journals</span><span className="text-foreground">{consciousness.total_journal_entries}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Witness Depth</span><span className="text-foreground">{consciousness.witness_depth?.toFixed(2)}</span></div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Activity className="h-4 w-4" /> Active Loops ({loops?.length || 0})
              </div>
              <div className="space-y-2">
                {loops?.length ? loops.map((l: any) => (
                  <div key={l.id} className="flex justify-between items-center text-sm">
                    <span className="text-foreground">{l.loop_id}</span>
                    <Badge variant="outline" className="text-xs">{l.severity}</Badge>
                  </div>
                )) : <p className="text-xs text-muted-foreground">No loops detected</p>}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Database className="h-4 w-4" /> Data Summary
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Memories</span><span className="text-foreground">{memories_count}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Samskaras</span><span className="text-foreground">{samskaras?.length || 0}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Recent Sessions</span><span className="text-foreground">{recent_sessions?.length || 0}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Recent Journals</span><span className="text-foreground">{recent_journals?.length || 0}</span></div>
              </div>
            </div>

            {org_memberships?.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Building2 className="h-4 w-4" /> Organizations
                </div>
                <div className="space-y-2">
                  {org_memberships.map((m: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-foreground">{m.org_name}</span>
                      <Badge variant="outline" className="text-xs">{m.role}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recent_journals?.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-3 md:col-span-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <BookOpen className="h-4 w-4" /> Recent Journals
                </div>
                <div className="space-y-2">
                  {recent_journals.slice(0, 5).map((j: any) => (
                    <div key={j.id} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0">
                      <span className="text-foreground truncate max-w-[200px]">{j.title || 'Untitled'}</span>
                      <div className="flex items-center gap-2">
                        {j.mood && <Badge variant="outline" className="text-xs">{j.mood}</Badge>}
                        <span className="text-xs text-muted-foreground">{format(new Date(j.created_at), 'MMM d')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
              <Clock className="h-4 w-4" /> User Journey Timeline
            </div>
            {timelineLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
              </div>
            ) : !timeline?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">No activity recorded</p>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-1">
                  {timeline.map((event, i) => (
                    <div key={i} className="flex items-start gap-4 pl-2 py-2">
                      <div className="relative z-10 h-5 w-5 text-center text-xs leading-5">
                        {eventIcons[event.event_type] || '📌'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{event.event_name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(event.created_at), 'MMM d, yyyy h:mm a')}
                          {' · '}
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">{event.event_type}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <div className="rounded-xl border border-border bg-card p-5">
            {aiAnalysis ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="h-10 w-10 text-primary/40 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Click "AI Analysis" to generate intelligence report</p>
                <Button onClick={generateInsights} disabled={aiLoading}>
                  {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Generate AI Report
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
