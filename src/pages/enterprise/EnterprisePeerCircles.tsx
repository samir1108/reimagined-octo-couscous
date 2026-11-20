import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Users, Plus, Send, Sparkles } from "lucide-react";
import { Button } from "@/design-system";
import { Input } from "@/design-system";
import { type Organization, type OrgMember } from "@/hooks/useEnterprise";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const HANDLES = ["Pine", "Quartz", "River", "Ember", "Lotus", "Heron", "Cedar", "Mist", "Coral", "Slate", "Aurora", "Kite"];
function pickHandle() { return `${HANDLES[Math.floor(Math.random()*HANDLES.length)]}-${Math.floor(Math.random()*900+100)}`; }

interface Circle { id: string; org_id: string; name: string; theme: string | null; band_min: number; band_max: number; max_members: number; }
interface CircleMember { id: string; circle_id: string; user_id: string; anonymous_handle: string; }
interface CircleMessage { id: string; circle_id: string; user_id: string; anonymous_handle: string; body: string; created_at: string; }

export default function EnterprisePeerCircles() {
  const { membership, org } = useOutletContext<{ membership: OrgMember; org: Organization | null }>();
  const orgId = membership?.org_id;
  const qc = useQueryClient();
  const [activeCircle, setActiveCircle] = useState<Circle | null>(null);
  const [draft, setDraft] = useState("");
  const [creatingName, setCreatingName] = useState("");

  const { data: circles = [] } = useQuery({
    queryKey: ["peer-circles", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase.from("peer_circles").select("*").eq("org_id", orgId!).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Circle[];
    },
  });

  const { data: myMemberships = [] } = useQuery({
    queryKey: ["my-circles", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from("peer_circle_members").select("*").eq("user_id", user.id);
      if (error) throw error;
      return (data ?? []) as CircleMember[];
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["circle-messages", activeCircle?.id],
    enabled: !!activeCircle,
    queryFn: async () => {
      const { data, error } = await supabase.from("peer_circle_messages").select("*").eq("circle_id", activeCircle!.id).order("created_at", { ascending: true }).limit(100);
      if (error) throw error;
      return (data ?? []) as CircleMessage[];
    },
    refetchInterval: 5000,
  });

  const createCircle = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("peer_circles").insert({ org_id: orgId!, name });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["peer-circles", orgId] }); setCreatingName(""); toast.success("Circle created"); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const join = useMutation({
    mutationFn: async (circleId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in");
      const { error } = await supabase.from("peer_circle_members").insert({ circle_id: circleId, user_id: user.id, anonymous_handle: pickHandle() });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-circles", orgId] }); toast.success("Joined anonymously"); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const send = useMutation({
    mutationFn: async () => {
      if (!activeCircle || !draft.trim()) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in");
      const mem = myMemberships.find((m) => m.circle_id === activeCircle.id);
      if (!mem) throw new Error("Join first");
      const { error } = await supabase.from("peer_circle_messages").insert({ circle_id: activeCircle.id, user_id: user.id, anonymous_handle: mem.anonymous_handle, body: draft.trim() });
      if (error) throw error;
      setDraft("");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["circle-messages", activeCircle?.id] }),
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const isMember = (cid: string) => myMemberships.some((m) => m.circle_id === cid);

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-body">Workplace · Anonymous</p>
        <h1 className="font-display text-3xl font-bold text-foreground mt-1">Peer Circles</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">Small cohorts of colleagues. Identities are never shown — only your handle.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        <div className="space-y-3">
          <div className="glass-card rounded-2xl p-4 border border-border/20">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-body mb-2">New circle</p>
            <div className="flex gap-2">
              <Input value={creatingName} onChange={(e) => setCreatingName(e.target.value)} placeholder="Theme, e.g. Founders" />
              <Button size="icon" onClick={() => creatingName.trim() && createCircle.mutate(creatingName.trim())}><Plus className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="space-y-1.5">
            {circles.map((c) => (
              <motion.button key={c.id}
                onClick={() => setActiveCircle(c)} whileTap={{ scale: 0.98 }}
                className={`w-full text-left p-3 rounded-xl border transition-all ${activeCircle?.id === c.id ? "border-primary/40 bg-primary/10" : "border-border/20 bg-muted/5 hover:bg-muted/10"}`}>
                <p className="text-sm font-display font-semibold text-foreground">{c.name}</p>
                <p className="text-[11px] text-muted-foreground font-body">Bands {c.band_min}–{c.band_max} · max {c.max_members}</p>
                {isMember(c.id) && <p className="text-[10px] text-primary font-body mt-0.5">Member</p>}
              </motion.button>
            ))}
            {circles.length === 0 && <p className="text-xs text-muted-foreground font-body text-center py-6">No circles yet — create one.</p>}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-border/20 min-h-[420px] flex flex-col">
          {!activeCircle ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-body">Pick or create a circle</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 pb-3 border-b border-border/15">
                <Sparkles className="w-4 h-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-semibold text-foreground">{activeCircle.name}</p>
                  <p className="text-[11px] text-muted-foreground font-body">Identity-blind · only handles shown</p>
                </div>
                {!isMember(activeCircle.id) && <Button size="sm" onClick={() => join.mutate(activeCircle.id)}>Join</Button>}
              </div>
              <div className="flex-1 overflow-y-auto py-3 space-y-2">
                {messages.map((m) => (
                  <div key={m.id} className="p-2.5 rounded-lg bg-muted/10">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-display font-semibold text-primary">{m.anonymous_handle}</span>
                      <span className="text-[10px] text-muted-foreground font-body">{formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}</span>
                    </div>
                    <p className="text-sm text-foreground font-body mt-0.5">{m.body}</p>
                  </div>
                ))}
                {messages.length === 0 && <p className="text-xs text-muted-foreground font-body text-center py-6">Be the first to share.</p>}
              </div>
              {isMember(activeCircle.id) && (
                <div className="pt-3 border-t border-border/15 flex gap-2">
                  <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Speak from where you are…" onKeyDown={(e) => { if (e.key === "Enter") send.mutate(); }} />
                  <Button size="icon" onClick={() => send.mutate()} disabled={!draft.trim()}><Send className="w-4 h-4" /></Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
