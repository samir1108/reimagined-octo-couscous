import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from "@/design-system";
import { Input } from "@/design-system";
import { Textarea } from "@/design-system";
import { Badge } from "@/design-system";
import { Card } from "@/design-system";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/design-system";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/design-system";
import { ThumbsUp, ThumbsDown, Save, Plus } from 'lucide-react';
import { toast } from 'sonner';

const FEATURES = ['temple-chat', 'guide-chat', 'elder-dialogue', 'live-detect', 'adapt-next-block', 'translate-ui'];

export default function AdminTraining() {
  const [feature, setFeature] = useState(FEATURES[0]);
  const qc = useQueryClient();

  const examples = useQuery({
    queryKey: ['training-examples', feature],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_examples')
        .select('*')
        .eq('feature', feature)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 30000,
  });

  const versions = useQuery({
    queryKey: ['prompt-versions', feature],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompt_versions')
        .select('*')
        .eq('feature', feature)
        .order('version', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 60000,
  });

  const createVersion = useMutation({
    mutationFn: async ({ prompt, notes }: { prompt: string; notes: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const next = (versions.data?.[0]?.version ?? 0) + 1;
      const { error } = await supabase.from('prompt_versions').insert({
        feature, version: next, system_prompt: prompt, notes, created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Prompt version saved');
      qc.invalidateQueries({ queryKey: ['prompt-versions', feature] });
    },
  });

  const activateVersion = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('prompt_versions').update({ is_active: false }).eq('feature', feature);
      const { error } = await supabase.from('prompt_versions').update({ is_active: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Activated');
      qc.invalidateQueries({ queryKey: ['prompt-versions', feature] });
    },
  });

  const updateExample = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: any }) => {
      const { error } = await supabase.from('training_examples').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['training-examples', feature] }),
  });

  const [newPrompt, setNewPrompt] = useState('');
  const [newNotes, setNewNotes] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI Training Studio</h2>
          <p className="text-sm text-muted-foreground">Tag bad replies, edit prompts, ship better AI.</p>
        </div>
        <Select value={feature} onValueChange={setFeature}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            {FEATURES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="examples">
        <TabsList>
          <TabsTrigger value="examples">Tagged examples ({examples.data?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="prompts">Prompt versions ({versions.data?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="examples" className="space-y-3">
          {examples.data?.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground text-sm">
              No tagged examples yet. Tag bad/good replies from the Sessions page to populate this list.
            </Card>
          )}
          {examples.data?.map((e: any) => (
            <Card key={e.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Badge variant={e.rating === 'bad' ? 'destructive' : e.rating === 'good' ? 'default' : 'outline'}>
                  {e.rating}
                </Badge>
                <span className="text-[10px] text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span>
              </div>
              <div className="text-xs space-y-1">
                <p className="text-muted-foreground uppercase">User</p>
                <p className="text-foreground">{e.user_input}</p>
              </div>
              <div className="text-xs space-y-1">
                <p className="text-muted-foreground uppercase">AI said</p>
                <p className="text-foreground bg-muted/30 p-2 rounded">{e.ai_output}</p>
              </div>
              <div className="text-xs space-y-1">
                <p className="text-muted-foreground uppercase">Ideal (your correction)</p>
                <Textarea
                  defaultValue={e.ideal_output ?? ''}
                  rows={3}
                  onBlur={(ev) => {
                    if (ev.target.value !== (e.ideal_output ?? '')) {
                      updateExample.mutate({ id: e.id, patch: { ideal_output: ev.target.value } });
                    }
                  }}
                />
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="prompts" className="space-y-4">
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> New prompt version</h3>
            <Textarea placeholder="System prompt..." value={newPrompt} onChange={(e) => setNewPrompt(e.target.value)} rows={6} />
            <Input placeholder="Notes (what changed?)" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
            <Button
              size="sm"
              disabled={!newPrompt}
              onClick={() => createVersion.mutate({ prompt: newPrompt, notes: newNotes }, { onSuccess: () => { setNewPrompt(''); setNewNotes(''); } })}
            >
              <Save className="h-3 w-3 mr-1" /> Save version
            </Button>
          </Card>

          {versions.data?.map((v: any) => (
            <Card key={v.id} className={`p-4 space-y-2 ${v.is_active ? 'border-primary' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge>v{v.version}</Badge>
                  {v.is_active && <Badge variant="default">ACTIVE</Badge>}
                  <span className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</span>
                </div>
                {!v.is_active && (
                  <Button size="sm" variant="outline" onClick={() => activateVersion.mutate(v.id)}>Activate</Button>
                )}
              </div>
              {v.notes && <p className="text-xs text-muted-foreground">{v.notes}</p>}
              <pre className="text-xs bg-muted/30 p-2 rounded max-h-40 overflow-auto whitespace-pre-wrap">{v.system_prompt}</pre>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
