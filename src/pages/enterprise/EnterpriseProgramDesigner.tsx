import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Sparkles, Wand2, Plus, Calendar, Activity } from "lucide-react";
import { Button } from "@/design-system";
import { Input } from "@/design-system";
import { Textarea } from "@/design-system";
import { type Organization, type OrgMember } from "@/hooks/useEnterprise";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface OrgProgram {
  id: string; org_id: string; title: string; description: string | null; theme: string | null;
  duration_days: number; daily_practices: any[]; status: string; starts_on: string | null; ends_on: string | null;
  generated_by_ai: boolean; created_at: string;
}

export default function EnterpriseProgramDesigner() {
  const { membership, org } = useOutletContext<{ membership: OrgMember; org: Organization | null }>();
  const orgId = membership?.org_id;
  const qc = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(21);
  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState<{ title: string; description: string; theme: string; daily_practices: { day: number; title: string; practice: string }[] } | null>(null);

  const { data: programs = [] } = useQuery({
    queryKey: ["org-programs", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase.from("org_programs").select("*").eq("org_id", orgId!).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as OrgProgram[];
    },
  });

  const generate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("org-program-designer", {
        body: { theme: prompt, durationDays: duration, orgName: org?.name },
      });
      if (error) throw error;
      if (data?.program) setDraft(data.program);
      else toast.error("AI returned no program");
    } catch (e: any) {
      toast.error(e?.message ?? "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!draft) return;
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("org_programs").insert({
        org_id: orgId!, title: draft.title, description: draft.description, theme: draft.theme,
        duration_days: duration, daily_practices: draft.daily_practices, generated_by_ai: true,
        status: "draft", created_by: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-programs", orgId] }); setDraft(null); setPrompt(""); toast.success("Program saved as draft"); },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });

  const activate = useMutation({
    mutationFn: async (id: string) => {
      const today = new Date().toISOString().split("T")[0];
      const program = programs.find((p) => p.id === id);
      if (!program) return;
      const ends = new Date(); ends.setDate(ends.getDate() + program.duration_days);
      const { error } = await supabase.from("org_programs").update({
        status: "active", starts_on: today, ends_on: ends.toISOString().split("T")[0],
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-programs", orgId] }); toast.success("Program activated"); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-body">HR · Generative</p>
        <h1 className="font-display text-3xl font-bold text-foreground mt-1">Program Designer</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">Spin up a custom org-wide program for any moment — post-merger, IPO countdown, post-layoff healing, focus week.</p>
      </div>

      <div className="glass-card rounded-2xl p-5 border border-border/20">
        <div className="flex items-center gap-2 mb-3"><Wand2 className="w-4 h-4 text-primary" /><h3 className="font-display text-sm font-semibold text-foreground">Generate with AI</h3></div>
        <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Help our engineering org reset focus after a stressful launch week."
          className="min-h-24" />
        <div className="flex items-center gap-3 mt-3">
          <label className="text-xs text-muted-foreground font-body">Days</label>
          <Input type="number" value={duration} onChange={(e) => setDuration(Math.max(3, Math.min(60, Number(e.target.value))))} className="w-20" />
          <Button onClick={generate} disabled={generating || !prompt.trim()} className="ml-auto">
            <Sparkles className="w-4 h-4 mr-1.5" /> {generating ? "Generating…" : "Generate"}
          </Button>
        </div>

        {draft && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-primary font-body">Draft</p>
              <h4 className="font-display text-lg font-bold text-foreground mt-1">{draft.title}</h4>
              <p className="text-xs text-muted-foreground font-body mt-1">{draft.description}</p>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {draft.daily_practices.map((p) => (
                <div key={p.day} className="text-xs font-body flex gap-2">
                  <span className="text-primary font-semibold w-12 shrink-0">Day {p.day}</span>
                  <span className="text-foreground"><b>{p.title}.</b> {p.practice}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setDraft(null)}>Discard</Button>
              <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}><Plus className="w-4 h-4 mr-1.5" /> Save as draft</Button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-display text-sm font-semibold text-foreground">Programs</h3>
        {programs.length === 0 ? (
          <p className="text-xs text-muted-foreground font-body text-center py-6">No programs yet — generate your first.</p>
        ) : (
          programs.map((p) => (
            <div key={p.id} className="glass-card rounded-2xl p-4 border border-border/20 flex items-center gap-3">
              <Activity className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-semibold text-foreground">{p.title}</p>
                <p className="text-[11px] text-muted-foreground font-body flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> {p.duration_days} days · {p.status}
                  {p.starts_on && ` · starts ${p.starts_on}`}
                </p>
              </div>
              {p.status === "draft" && <Button size="sm" onClick={() => activate.mutate(p.id)}>Activate</Button>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
