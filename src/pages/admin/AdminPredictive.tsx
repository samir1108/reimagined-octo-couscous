import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from "@/design-system";
import { Button } from "@/design-system";
import { Badge } from "@/design-system";
import { AlertTriangle, TrendingDown, Zap, Bell, CheckCircle2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPredictive() {
  const qc = useQueryClient();

  const anomalies = useQuery({
    queryKey: ['anomalies'],
    queryFn: async () => {
      const { data } = await supabase.from('anomalies').select('*').order('detected_at', { ascending: false }).limit(50);
      return data ?? [];
    },
    refetchInterval: 30000,
  });

  const churn = useQuery({
    queryKey: ['churn-predictions'],
    queryFn: async () => {
      const { data } = await supabase.from('churn_predictions').select('*').order('churn_probability', { ascending: false }).limit(20);
      return data ?? [];
    },
  });

  const runDetect = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect?action=anomalies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      if (!resp.ok) throw new Error("Failed to detect anomalies");
      return resp.json();
    },
    onSuccess: (d: any) => { toast.success(`Detected ${d.detected ?? 0} anomaly`); qc.invalidateQueries({ queryKey: ['anomalies'] }); },
  });

  const runChurn = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('predict-churn');
      if (error) throw error;
      return data;
    },
    onSuccess: (d: any) => { toast.success(`Updated ${d.upserted ?? 0} predictions`); qc.invalidateQueries({ queryKey: ['churn-predictions'] }); },
  });

  const ack = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('anomalies').update({ acknowledged: true, acknowledged_by: user!.id, acknowledged_at: new Date().toISOString() }).eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['anomalies'] }),
  });

  const iconFor = (kind: string) => {
    if (kind === 'cost_spike') return <Zap className="h-4 w-4 text-yellow-500" />;
    if (kind === 'signup_drop') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <AlertTriangle className="h-4 w-4 text-orange-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Predictive</h2>
          <p className="text-sm text-muted-foreground">Anomalies & churn risk.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => runDetect.mutate()}><RefreshCw className="h-3 w-3 mr-1" />Scan anomalies</Button>
          <Button size="sm" variant="outline" onClick={() => runChurn.mutate()}><RefreshCw className="h-3 w-3 mr-1" />Update churn</Button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Bell className="h-4 w-4" />Anomalies</h3>
        <div className="space-y-2">
          {anomalies.data?.length === 0 && (
            <Card className="p-6 text-center text-sm text-muted-foreground">All clear. Run a scan to detect issues.</Card>
          )}
          {anomalies.data?.map((a: any) => (
            <Card key={a.id} className={`p-3 flex items-start justify-between gap-3 ${a.acknowledged ? 'opacity-50' : ''}`}>
              <div className="flex items-start gap-3">
                {iconFor(a.kind)}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{a.title}</p>
                    <Badge variant={a.severity === 'critical' ? 'destructive' : 'outline'}>{a.severity}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{new Date(a.detected_at).toLocaleString()}</p>
                  <pre className="text-[10px] text-muted-foreground mt-1">{JSON.stringify(a.detail)}</pre>
                </div>
              </div>
              {!a.acknowledged && (
                <Button size="sm" variant="ghost" onClick={() => ack.mutate(a.id)}><CheckCircle2 className="h-3 w-3 mr-1" />Ack</Button>
              )}
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Top churn risk users</h3>
        <Card>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr><th className="text-left p-3">User</th><th className="text-left p-3">Probability</th><th className="text-left p-3">Predicted churn</th><th className="text-left p-3">Top reason</th></tr>
            </thead>
            <tbody>
              {churn.data?.map((c: any) => (
                <tr key={c.user_id} className="border-t border-border">
                  <td className="p-3 font-mono text-[10px]">{c.user_id.slice(0, 8)}</td>
                  <td className="p-3"><Badge variant={c.churn_probability > 0.7 ? 'destructive' : 'outline'}>{Math.round(c.churn_probability * 100)}%</Badge></td>
                  <td className="p-3 text-xs">{c.predicted_churn_date}</td>
                  <td className="p-3 text-xs text-muted-foreground">{c.top_reason}</td>
                </tr>
              ))}
              {(!churn.data || churn.data.length === 0) && (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground text-xs">No predictions yet. Click "Update churn" above.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
