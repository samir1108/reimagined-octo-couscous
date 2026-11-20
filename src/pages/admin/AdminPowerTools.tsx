import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from "@/design-system";
import { Button } from "@/design-system";
import { Input } from "@/design-system";
import { Textarea } from "@/design-system";
import { Switch } from "@/design-system";
import { Badge } from "@/design-system";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/design-system";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/design-system";
import { useState } from 'react';
import { toast } from 'sonner';
import { Flag, Megaphone, Gift, Send } from 'lucide-react';

export default function AdminPowerTools() {
  const qc = useQueryClient();

  const flags = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const { data } = await supabase.from('feature_flags').select('*').order('key');
      return data ?? [];
    },
    refetchInterval: 30000,
  });

  const toggleFlag = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      await supabase.from('feature_flags').update({ enabled, updated_at: new Date().toISOString() }).eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feature-flags'] }),
  });

  const [newKey, setNewKey] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const createFlag = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('feature_flags').insert({ key: newKey, description: newDesc, updated_by: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Flag created'); setNewKey(''); setNewDesc(''); qc.invalidateQueries({ queryKey: ['feature-flags'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  // Broadcasts
  const broadcasts = useQuery({
    queryKey: ['broadcasts'],
    queryFn: async () => {
      const { data } = await supabase.from('broadcasts').select('*').order('created_at', { ascending: false }).limit(20);
      return data ?? [];
    },
    refetchInterval: 30000,
  });
  const [bcTitle, setBcTitle] = useState('');
  const [bcBody, setBcBody] = useState('');
  const [bcSegment, setBcSegment] = useState('all');
  const createBc = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.from('broadcasts').insert({ title: bcTitle, body: bcBody, segment: bcSegment, created_by: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { toast.success('Draft saved'); setBcTitle(''); setBcBody(''); qc.invalidateQueries({ queryKey: ['broadcasts'] }); },
  });
  const sendBc = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke('admin-broadcast', { body: { broadcast_id: id } });
      if (error) throw error;
      return data;
    },
    onSuccess: (d: any) => { toast.success(`Sent to ${d.recipients} users`); qc.invalidateQueries({ queryKey: ['broadcasts'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  // Credit grant
  const [grantUser, setGrantUser] = useState('');
  const [grantAmt, setGrantAmt] = useState('100');
  const [grantNote, setGrantNote] = useState('');
  const grant = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('admin_grant_credits' as any, { p_user_id: grantUser, p_paise: parseInt(grantAmt), p_note: grantNote || 'Admin grant' });
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Credits granted'); setGrantUser(''); setGrantAmt('100'); setGrantNote(''); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Power Tools</h2>
        <p className="text-sm text-muted-foreground">Feature flags, broadcasts, credit grants.</p>
      </div>

      <Tabs defaultValue="flags">
        <TabsList>
          <TabsTrigger value="flags"><Flag className="h-3 w-3 mr-1" />Feature flags</TabsTrigger>
          <TabsTrigger value="broadcast"><Megaphone className="h-3 w-3 mr-1" />Broadcasts</TabsTrigger>
          <TabsTrigger value="credits"><Gift className="h-3 w-3 mr-1" />Credit grants</TabsTrigger>
        </TabsList>

        <TabsContent value="flags" className="space-y-4">
          <Card className="p-4 space-y-2">
            <div className="flex gap-2">
              <Input placeholder="flag_key" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
              <Input placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
              <Button onClick={() => createFlag.mutate()} disabled={!newKey}>Add</Button>
            </div>
          </Card>
          {flags.data?.map((f: any) => (
            <Card key={f.id} className="p-3 flex items-center justify-between">
              <div>
                <p className="font-mono text-sm text-foreground">{f.key}</p>
                <p className="text-xs text-muted-foreground">{f.description}</p>
              </div>
              <Switch checked={f.enabled} onCheckedChange={(v) => toggleFlag.mutate({ id: f.id, enabled: v })} />
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="broadcast" className="space-y-4">
          <Card className="p-4 space-y-2">
            <Input placeholder="Title" value={bcTitle} onChange={(e) => setBcTitle(e.target.value)} />
            <Textarea placeholder="Body" rows={3} value={bcBody} onChange={(e) => setBcBody(e.target.value)} />
            <Select value={bcSegment} onValueChange={setBcSegment}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                <SelectItem value="onboarded">Onboarded</SelectItem>
                <SelectItem value="at_risk">At risk / Critical</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createBc.mutate()} disabled={!bcTitle || !bcBody}>Save draft</Button>
          </Card>
          {broadcasts.data?.map((b: any) => (
            <Card key={b.id} className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-foreground">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.body}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{b.segment}</Badge>
                  <Badge variant={b.status === 'sent' ? 'default' : 'secondary'}>{b.status}</Badge>
                  {b.status === 'draft' && (
                    <Button size="sm" onClick={() => sendBc.mutate(b.id)}><Send className="h-3 w-3 mr-1" />Send</Button>
                  )}
                </div>
              </div>
              {b.recipient_count > 0 && <p className="text-[10px] text-muted-foreground">Sent to {b.recipient_count} users</p>}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="credits">
          <Card className="p-4 space-y-3 max-w-md">
            <Input placeholder="User ID (uuid)" value={grantUser} onChange={(e) => setGrantUser(e.target.value)} />
            <Input type="number" placeholder="Amount (paise, 100 = 1 credit)" value={grantAmt} onChange={(e) => setGrantAmt(e.target.value)} />
            <Input placeholder="Note (optional)" value={grantNote} onChange={(e) => setGrantNote(e.target.value)} />
            <Button onClick={() => grant.mutate()} disabled={!grantUser || !grantAmt}><Gift className="h-3 w-3 mr-1" />Grant credits</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
