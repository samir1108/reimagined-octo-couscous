import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from "@/design-system";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/design-system";
import { Globe, Users2, MessageCircle, Repeat } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';

const POLL = 60000;

export default function AdminBI() {
  // Master popularity (last 7 days aggregated client-side from sessions)
  const masters = useQuery({
    queryKey: ['bi-masters'],
    queryFn: async () => {
      const sevenAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data } = await supabase
        .from('sessions').select('master_id').gte('created_at', sevenAgo).not('master_id', 'is', null);
      const counts: Record<string, number> = {};
      for (const r of data ?? []) {
        const m = (r as any).master_id;
        counts[m] = (counts[m] ?? 0) + 1;
      }
      return Object.entries(counts).map(([master, count]) => ({ master, count })).sort((a, b) => b.count - a.count).slice(0, 15);
    },
    refetchInterval: POLL,
  });

  // Loop epidemiology
  const loops = useQuery({
    queryKey: ['bi-loops'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_loops')
        .select('loop_id, intensity')
        .order('updated_at', { ascending: false })
        .limit(2000);
      const acc: Record<string, { count: number; total_intensity: number }> = {};
      for (const r of data ?? []) {
        const id = (r as any).loop_id;
        if (!acc[id]) acc[id] = { count: 0, total_intensity: 0 };
        acc[id].count += 1;
        acc[id].total_intensity += Number((r as any).intensity ?? 0);
      }
      return Object.entries(acc).map(([id, v]) => ({ id, count: v.count, avg: v.total_intensity / v.count })).sort((a, b) => b.count - a.count).slice(0, 20);
    },
    refetchInterval: POLL,
  });

  // Geography (from geo_anchors table if populated)
  const geo = useQuery({
    queryKey: ['bi-geo'],
    queryFn: async () => {
      const { data } = await supabase.from('geo_anchors' as any).select('grid_key').limit(1000);
      const counts: Record<string, number> = {};
      for (const r of data ?? []) {
        const k = (r as any).grid_key ?? 'unknown';
        counts[k] = (counts[k] ?? 0) + 1;
      }
      return Object.entries(counts).map(([region, count]) => ({ region, count })).sort((a, b) => b.count - a.count).slice(0, 15);
    },
    refetchInterval: POLL,
  });

  // Real signup trend — last 30 days from profiles
  const acquisition = useQuery({
    queryKey: ['bi-acquisition'],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const { data, count } = await supabase
        .from('profiles')
        .select('created_at', { count: 'exact' })
        .gte('created_at', since)
        .order('created_at', { ascending: true });
      const buckets: Record<string, number> = {};
      for (const r of data ?? []) {
        const d = new Date((r as any).created_at).toISOString().slice(0, 10);
        buckets[d] = (buckets[d] ?? 0) + 1;
      }
      const series = Object.entries(buckets)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, signups]) => ({
          day: new Date(day).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
          signups,
        }));
      const { count: totalCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      return { series, last30: count ?? 0, total: totalCount ?? 0 };
    },
    refetchInterval: POLL,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Business Intelligence</h2>
        <p className="text-sm text-muted-foreground">Geography, masters, loops, acquisition.</p>
      </div>

      <Tabs defaultValue="masters">
        <TabsList>
          <TabsTrigger value="masters"><Users2 className="h-3 w-3 mr-1" />Masters</TabsTrigger>
          <TabsTrigger value="loops"><Repeat className="h-3 w-3 mr-1" />Loops</TabsTrigger>
          <TabsTrigger value="geo"><Globe className="h-3 w-3 mr-1" />Geography</TabsTrigger>
          <TabsTrigger value="acquisition"><MessageCircle className="h-3 w-3 mr-1" />Acquisition</TabsTrigger>
        </TabsList>

        <TabsContent value="masters">
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-3">Top masters — last 7 days</h3>
            {masters.data && masters.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={masters.data} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis type="category" dataKey="master" width={140} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-xs text-muted-foreground">No master sessions in window.</p>}
          </Card>
        </TabsContent>

        <TabsContent value="loops">
          <Card>
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr><th className="text-left p-3">Loop</th><th className="text-left p-3">Users</th><th className="text-left p-3">Avg intensity</th></tr>
              </thead>
              <tbody>
                {loops.data?.map((l) => (
                  <tr key={l.id} className="border-t border-border">
                    <td className="p-3 font-mono text-xs">{l.id}</td>
                    <td className="p-3">{l.count}</td>
                    <td className="p-3">{l.avg.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="geo">
          <Card>
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground"><tr><th className="text-left p-3">Region grid</th><th className="text-left p-3">Users</th></tr></thead>
              <tbody>
                {geo.data?.length === 0 && <tr><td colSpan={2} className="p-6 text-center text-xs text-muted-foreground">No geo anchors yet.</td></tr>}
                {geo.data?.map((g) => (
                  <tr key={g.region} className="border-t border-border"><td className="p-3 font-mono text-xs">{g.region}</td><td className="p-3">{g.count}</td></tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="acquisition" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Total users</p>
              <p className="text-3xl font-bold text-foreground">{acquisition.data?.total ?? 0}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Signups · last 30 days</p>
              <p className="text-3xl font-bold text-foreground">{acquisition.data?.last30 ?? 0}</p>
            </Card>
          </div>
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-3">Daily signups — last 30 days</h3>
            {acquisition.data && acquisition.data.series.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={acquisition.data.series}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Area type="monotone" dataKey="signups" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="text-xs text-muted-foreground">No signups in window.</p>}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
