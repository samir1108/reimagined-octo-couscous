import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus, Search, Sparkles, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthReady } from "@/hooks/useAuthReady";
import { Button } from "@/design-system";
import { Input } from "@/design-system";
import { Textarea } from "@/design-system";
import { toast } from "@/hooks/use-toast";
import { conscious, consciousFromError } from "@/lib/consciousToast";

type Moment = {
  id: string;
  moment_type: string;
  title: string | null;
  user_words: string | null;
  emotional_tone: string | null;
  importance: number;
  occurred_at: string;
  created_at: string;
  source_type: string | null;
  metadata: any;
};

const TYPE_META: Record<string, { emoji: string; label: string; tint: string }> = {
  breakthrough: { emoji: "✨", label: "Breakthrough", tint: "text-amber-400" },
  realization: { emoji: "💎", label: "Realization", tint: "text-cyan-400" },
  tear: { emoji: "💧", label: "Tear", tint: "text-blue-400" },
  laugh: { emoji: "😄", label: "Laugh", tint: "text-yellow-400" },
  vow: { emoji: "🪔", label: "Vow", tint: "text-orange-400" },
  gratitude: { emoji: "🙏", label: "Gratitude", tint: "text-rose-400" },
  grief: { emoji: "🕊️", label: "Grief", tint: "text-slate-400" },
  first_vulnerability: { emoji: "🌱", label: "First share", tint: "text-emerald-400" },
  milestone: { emoji: "⛰️", label: "Milestone", tint: "text-violet-400" },
  life_event: { emoji: "🌊", label: "Life event", tint: "text-teal-400" },
  other: { emoji: "·", label: "Moment", tint: "text-muted-foreground" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MemoryVault() {
  const navigate = useNavigate();
  const { user } = useAuthReady();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const { data: moments = [], isLoading } = useQuery({
    queryKey: ["sacred-moments", user?.id, q],
    enabled: !!user?.id,
    queryFn: async (): Promise<Moment[]> => {
      let query = supabase
        .from("sacred_moments")
        .select("*")
        .eq("user_id", user!.id)
        .order("occurred_at", { ascending: false })
        .limit(200);
      if (q.trim()) {
        query = query.or(
          `user_words.ilike.%${q.trim()}%,title.ilike.%${q.trim()}%`,
        );
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Moment[];
    },
  });

  async function autoExtract() {
    setExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke("extract-sacred-moments", {
        body: { days: 14 },
      });
      if (error) throw error;
      const n = (data as any)?.extracted ?? 0;
      toast({
        title: n > 0 ? `Found ${n} sacred moment${n > 1 ? "s" : ""}` : "Nothing new to remember",
        description:
          n > 0
            ? "Your vault has been quietly enriched."
            : "Keep journaling — moments emerge when you write.",
      });
      qc.invalidateQueries({ queryKey: ["sacred-moments"] });
    } catch (e: any) {
      consciousFromError(e, "somethingSlipped");
    } finally {
      setExtracting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-border/30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-foreground/5"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-display font-medium">Memory Vault</h1>
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground/60">
              Your sacred moments
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={autoExtract}
            disabled={extracting}
            className="text-xs"
          >
            {extracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
            {extracting ? "Reading…" : "Auto-extract"}
          </Button>
          <Button size="sm" onClick={() => setShowAdd(true)} className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Mujhe wo wala realization yaad nahi…"
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : moments.length === 0 ? (
          <EmptyState onAdd={() => setShowAdd(true)} onExtract={autoExtract} />
        ) : (
          <div className="space-y-3">
            {moments.map((m) => (
              <MomentCard key={m.id} m={m} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAdd && <AddMomentSheet onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </div>
  );
}

function MomentCard({ m }: { m: Moment }) {
  const meta = TYPE_META[m.moment_type] ?? TYPE_META.other;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm px-4 py-3 hover:border-primary/30 transition-colors"
    >
      <div className="flex items-start gap-3">
        <span className="text-lg leading-none mt-0.5">{meta.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[9px] tracking-[0.25em] uppercase ${meta.tint}`}>
              {meta.label}
            </span>
            <span className="text-[10px] text-muted-foreground/60">
              · {formatDate(m.occurred_at)}
            </span>
            {m.metadata?.auto_extracted && (
              <span className="text-[9px] text-muted-foreground/50">· auto</span>
            )}
          </div>
          {m.title && (
            <p className="text-sm font-display text-foreground/90 mb-1">{m.title}</p>
          )}
          {m.user_words && (
            <p className="text-xs text-foreground/70 leading-relaxed italic line-clamp-4">
              "{m.user_words}"
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ onAdd, onExtract }: { onAdd: () => void; onExtract: () => void }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="text-4xl mb-4">🕯️</div>
      <h2 className="text-base font-display mb-2">Your vault is empty</h2>
      <p className="text-xs text-muted-foreground/70 mb-6 max-w-sm mx-auto leading-relaxed">
        Sacred moments are the breakthroughs, tears, and realizations the app will remember
        forever — and bring back to you years from now.
      </p>
      <div className="flex gap-2 justify-center">
        <Button size="sm" onClick={onAdd}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Mark a moment
        </Button>
        <Button size="sm" variant="outline" onClick={onExtract}>
          <Sparkles className="w-3.5 h-3.5 mr-1" /> Read my journal
        </Button>
      </div>
    </div>
  );
}

const ADD_TYPES: { value: keyof typeof TYPE_META; label: string; emoji: string }[] = [
  { value: "breakthrough", label: "Breakthrough", emoji: "✨" },
  { value: "realization", label: "Realization", emoji: "💎" },
  { value: "tear", label: "Tear", emoji: "💧" },
  { value: "laugh", label: "Laugh", emoji: "😄" },
  { value: "vow", label: "Vow", emoji: "🪔" },
  { value: "gratitude", label: "Gratitude", emoji: "🙏" },
  { value: "grief", label: "Grief", emoji: "🕊️" },
  { value: "milestone", label: "Milestone", emoji: "⛰️" },
  { value: "life_event", label: "Life event", emoji: "🌊" },
];

function AddMomentSheet({ onClose }: { onClose: () => void }) {
  const { user } = useAuthReady();
  const qc = useQueryClient();
  const [type, setType] = useState<string>("realization");
  const [title, setTitle] = useState("");
  const [words, setWords] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!user) return;
    if (!words.trim()) {
      conscious("writeMore");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("sacred_moments").insert({
      user_id: user.id,
      moment_type: type,
      title: title.trim() || null,
      user_words: words.trim(),
      source_type: "manual",
      importance: 8,
      occurred_at: new Date().toISOString(),
      metadata: { auto_extracted: false },
    });
    setSaving(false);
    if (error) {
      consciousFromError(error, "actionMissed");
      return;
    }
    qc.invalidateQueries({ queryKey: ["sacred-moments"] });
    toast({ title: "Sealed in your vault", description: "This will return to you when it matters." });
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        exit={{ y: 40 }}
        transition={{ type: "spring", damping: 22 }}
        className="w-full max-w-md bg-card border-t md:border md:rounded-2xl border-border p-5 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-display">Mark a sacred moment</h2>
          <button onClick={onClose} className="p-1 -mr-1 rounded-full hover:bg-foreground/5">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 mb-2">Type</p>
          <div className="flex flex-wrap gap-1.5">
            {ADD_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                  type === t.value
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-border/40 text-muted-foreground hover:border-border"
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 mb-1.5">
            Title <span className="opacity-60 normal-case tracking-normal">(optional)</span>
          </p>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="The day I forgave my father"
            className="text-sm"
          />
        </div>

        <div className="mb-5">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 mb-1.5">
            Your words
          </p>
          <Textarea
            value={words}
            onChange={(e) => setWords(e.target.value)}
            placeholder="What happened. What shifted. Your words exactly."
            rows={5}
            className="text-sm leading-relaxed"
          />
        </div>

        <Button onClick={save} disabled={saving} className="w-full">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Seal this moment"}
        </Button>
      </motion.div>
    </motion.div>
  );
}
