import { useEffect, useRef, useState } from "react";
import { getLoopById, searchLoops } from "@/data/loops";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  History, Brain, Heart, Zap, AlertTriangle, ArrowLeft,
  ChevronRight, Lightbulb, Target, BookOpen, Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/design-system";
import { ScrollArea } from "@/design-system";
import { Badge } from "@/design-system";
import { Button } from "@/design-system";
import type { JournalEntry } from "@/types/database";
import { ensureAnalysisFor } from "@/lib/lazyAnalysis";

interface SignalData {
  source_id: string;
  head_signals: Record<string, any>;
  heart_signals: Record<string, any>;
  gut_signals: Record<string, any>;
  loops_detected: any[];
  dimension_updates: Record<string, any>;
  chitta_vritti: string | null;
  witness_signals: Record<string, any>;
}

function useJournalSignals(entryIds: string[]) {
  return useQuery<SignalData[]>({
    queryKey: ["journal-signals", entryIds],
    enabled: entryIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consciousness_signals")
        .select("*")
        .eq("source_type", "journal")
        .in("source_id", entryIds);
      if (error) throw error;
      return (data || []) as unknown as SignalData[];
    },
  });
}

// --- Loop insight resolver (same as GuideHistory) ---

const LOOP_INSIGHTS_LEGACY: Record<string, { why: string; whatToDo: string }> = {
  rumination: {
    why: "Repetitive thought patterns detected — the mind is replaying scenarios without resolution.",
    whatToDo: "Notice the thought loop without engaging. Try labeling: 'thinking, thinking.' Take 3 deep breaths and redirect attention to body sensations.",
  },
  people_pleasing: {
    why: "Pattern of prioritizing others' approval over authentic self-expression was detected.",
    whatToDo: "Practice saying 'Let me think about it' before agreeing. Journal about one boundary you'd like to set today.",
  },
  perfectionism: {
    why: "Unrealistic standards or fear of imperfection surfaced.",
    whatToDo: "Set a 'good enough' threshold before starting tasks. Notice when the inner critic speaks — thank it and redirect.",
  },
  avoidance: {
    why: "A pattern of avoiding discomfort or difficult emotions was detected.",
    whatToDo: "Sit with the discomfort for just 2 minutes. Name the emotion. Ask: 'What am I protecting myself from?'",
  },
  comparison: {
    why: "Measuring self-worth against others was detected in your expression.",
    whatToDo: "Redirect attention to your own journey. Journal: 'What have I grown in this past month?' Practice gratitude for 3 things you have.",
  },
  catastrophizing: {
    why: "The mind was jumping to worst-case scenarios without evidence.",
    whatToDo: "Ask: 'What's the most likely outcome?' Write down evidence for AND against the feared outcome. Ground in the present moment.",
  },
  emotional_suppression: {
    why: "Signs of pushing down or intellectualizing emotions instead of feeling them.",
    whatToDo: "Place a hand on your heart. Ask: 'What am I feeling right now?' Allow the emotion 90 seconds of full presence.",
  },
  self_sabotage: {
    why: "Behavior patterns that undermine your own progress or success were detected.",
    whatToDo: "Identify the secondary gain — what does sabotage protect you from? Journal about it. Take one small step forward today.",
  },
  control: {
    why: "Excessive need to control outcomes or other people's behavior was detected.",
    whatToDo: "Practice the mantra: 'I can influence, not control.' Identify one thing you can release today.",
  },
};

function getLoopInsight(loopId: string): { why: string; whatToDo: string } {
  const loopDef = getLoopById(loopId);
  if (loopDef) {
    return {
      why: `${loopDef.description}. Triggers: ${loopDef.triggers.slice(0, 3).join(", ")}. Watch for: ${loopDef.awareness_markers[0] || "recurring patterns"}.`,
      whatToDo: loopDef.dissolution_path,
    };
  }

  const searchResults = searchLoops(loopId.replace(/[_-]/g, " "));
  if (searchResults.length > 0) {
    const match = searchResults[0];
    return {
      why: `${match.description}. Triggers: ${match.triggers.slice(0, 3).join(", ")}. Watch for: ${match.awareness_markers[0] || "recurring patterns"}.`,
      whatToDo: match.dissolution_path,
    };
  }

  const normalized = loopId.toLowerCase().replace(/[\s-]+/g, "_");
  if (LOOP_INSIGHTS_LEGACY[normalized]) return LOOP_INSIGHTS_LEGACY[normalized];
  for (const key of Object.keys(LOOP_INSIGHTS_LEGACY)) {
    if (normalized.includes(key) || key.includes(normalized)) return LOOP_INSIGHTS_LEGACY[key];
  }

  return {
    why: "This pattern was identified based on recurring themes in your writing.",
    whatToDo: "Bring gentle awareness to this pattern. Notice when it activates without judgment. Journal about what triggers it.",
  };
}

// --- LoopDetailCard (identical to GuideHistory) ---

function LoopDetailCard({ loopId }: { loopId: string }) {
  const [expanded, setExpanded] = useState(false);
  const loopDef = getLoopById(loopId);
  const displayName = loopDef?.name || (typeof loopId === "string" ? loopId.replace(/_/g, " ") : "Loop");
  const insight = getLoopInsight(loopId);

  return (
    <motion.div
      className="glass-card rounded-xl border border-orange-500/10 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3 flex items-center gap-2"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
        <span className="text-xs font-display font-semibold text-foreground capitalize flex-1">{displayName}</span>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground rotate-90" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="px-3 pb-3 space-y-2.5"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="glass-subtle rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Lightbulb className="w-3 h-3 text-primary/70" />
                <span className="text-[10px] font-display font-semibold text-primary/70 uppercase tracking-wider">Why this was detected</span>
              </div>
              <p className="text-[11px] font-body text-muted-foreground leading-relaxed">{insight.why}</p>
            </div>

            <div className="glass-subtle rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Target className="w-3 h-3 text-chart-2" />
                <span className="text-[10px] font-display font-semibold text-chart-2 uppercase tracking-wider">What to do</span>
              </div>
              <p className="text-[11px] font-body text-muted-foreground leading-relaxed">{insight.whatToDo}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- Entry list item ---

function EntryListItem({ entry, hasAnalysis, loopCount, onClick }: {
  entry: JournalEntry;
  hasAnalysis: boolean;
  loopCount: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left glass-card rounded-2xl p-4 hover:border-primary/20 border border-transparent transition-all group"
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-lg">📝</span>
          <span className="font-display text-sm font-semibold text-foreground truncate">
            {entry.title || "Journal Entry"}
          </span>
          {entry.mood && (
            <Badge variant="secondary" className="text-[9px] shrink-0">{entry.mood.split(" ")[0]}</Badge>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </div>
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-body">
        <span>{format(new Date(entry.created_at), "MMM d, yyyy · h:mm a")}</span>
        {loopCount > 0 && (
          <Badge variant="outline" className="text-[9px] border-orange-500/30 text-orange-400/70">
            {loopCount} loop{loopCount > 1 ? "s" : ""}
          </Badge>
        )}
        {hasAnalysis && <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />}
      </div>
      <p className="text-xs text-muted-foreground/80 font-body mt-2 line-clamp-2">{entry.content}</p>
    </motion.button>
  );
}

// --- Entry detail view (matches GuideHistory SessionDetailView) ---

function EntryDetailView({
  entry,
  signal,
  onBack,
}: {
  entry: JournalEntry;
  signal: SignalData | undefined;
  onBack: () => void;
}) {
  const qc = useQueryClient();
  const triggeredRef = useRef(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Lazy analysis: first time this entry is opened without signals, run it now.
  useEffect(() => {
    if (triggeredRef.current) return;
    if (signal) return;
    if (!entry?.content || entry.content.length < 20) return;
    triggeredRef.current = true;
    setAnalyzing(true);
    const text = (entry.title ? entry.title + ": " : "") + entry.content;
    ensureAnalysisFor({
      sourceType: "journal",
      sourceId: entry.id,
      text,
    })
      .then((ran) => {
        if (ran) {
          qc.invalidateQueries({ queryKey: ["journal-signals"] });
        }
      })
      .finally(() => setAnalyzing(false));
  }, [entry, signal, qc]);

  const loopsDetected = signal && Array.isArray(signal.loops_detected) ? signal.loops_detected : [];
  const dimUpdates = (signal?.dimension_updates && typeof signal.dimension_updates === "object")
    ? signal.dimension_updates as Record<string, number>
    : {};
  const headSignals = (signal?.head_signals && typeof signal.head_signals === "object")
    ? signal.head_signals as Record<string, any> : {};
  const heartSignals = (signal?.heart_signals && typeof signal.heart_signals === "object")
    ? signal.heart_signals as Record<string, any> : {};
  const gutSignals = (signal?.gut_signals && typeof signal.gut_signals === "object")
    ? signal.gut_signals as Record<string, any> : {};
  const witnessSignals = (signal?.witness_signals && typeof signal.witness_signals === "object")
    ? signal.witness_signals as Record<string, any> : {};

  const hasAnalysis = !!signal || loopsDetected.length > 0;

  const loopIds = loopsDetected.map((loop: any) => {
    if (typeof loop === "string") return loop;
    if (loop?.loop_id) return loop.loop_id;
    return null;
  }).filter(Boolean) as string[];

  return (
    <div className="flex flex-col h-full">
      {/* Back + title */}
      <div className="flex items-center gap-3 pb-4 border-b border-border/20">
        <motion.button
          onClick={onBack}
          className="w-8 h-8 rounded-xl glass-subtle flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-semibold text-foreground text-sm">
            📝 {entry.title || "Journal Entry"}
          </h3>
          <p className="text-[11px] text-muted-foreground font-body">
            {format(new Date(entry.created_at), "MMM d, yyyy · h:mm a")}
          </p>
        </div>
        {entry.mood && (
          <Badge variant="outline" className="text-[10px] shrink-0">{entry.mood}</Badge>
        )}
      </div>

      <ScrollArea className="flex-1 py-4">
        <div className="space-y-5">
          {/* Journal Content */}
          <motion.div className="glass-card rounded-2xl p-3.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h4 className="text-xs font-display font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-primary" /> Entry
            </h4>
            <p className="text-xs font-body text-muted-foreground leading-relaxed whitespace-pre-wrap">{entry.content}</p>
          </motion.div>

          {/* Analysis Cards */}
          {hasAnalysis && (
            <div className="space-y-3">
              <h4 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider">Consciousness Analysis</h4>

              {/* Loops Detected */}
              {loopIds.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-xs font-display font-semibold text-foreground">
                      Loops Detected ({loopIds.length})
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-body mb-2">
                    Tap each loop to understand why it was detected and what you can do about it.
                  </p>
                  {loopIds.map((loopId, i) => (
                    <LoopDetailCard key={`${loopId}-${i}`} loopId={loopId} />
                  ))}
                </div>
              )}

              {/* 3-Lens Signals */}
              {(Object.keys(headSignals).length > 0 || Object.keys(heartSignals).length > 0 || Object.keys(gutSignals).length > 0) && (
                <motion.div className="glass-card rounded-2xl p-3.5 space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
                  <span className="text-xs font-display font-semibold text-foreground">Three-Lens Signals</span>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(headSignals).length > 0 && (
                      <div className="text-center space-y-1">
                        <Brain className="w-4 h-4 text-blue-400 mx-auto" />
                        <p className="text-[10px] font-body text-muted-foreground">Head</p>
                        {headSignals.clarity != null && (
                          <p className="text-xs font-display font-semibold text-foreground">{Math.round(Number(headSignals.clarity) * 10)}%</p>
                        )}
                      </div>
                    )}
                    {Object.keys(heartSignals).length > 0 && (
                      <div className="text-center space-y-1">
                        <Heart className="w-4 h-4 text-rose-400 mx-auto" />
                        <p className="text-[10px] font-body text-muted-foreground">Heart</p>
                        {heartSignals.openness != null && (
                          <p className="text-xs font-display font-semibold text-foreground">{Math.round(Number(heartSignals.openness) * 10)}%</p>
                        )}
                      </div>
                    )}
                    {Object.keys(gutSignals).length > 0 && (
                      <div className="text-center space-y-1">
                        <Zap className="w-4 h-4 text-amber-400 mx-auto" />
                        <p className="text-[10px] font-body text-muted-foreground">Gut</p>
                        {gutSignals.groundedness != null && (
                          <p className="text-xs font-display font-semibold text-foreground">{Math.round(Number(gutSignals.groundedness) * 10)}%</p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Dimension Updates */}
              {Object.keys(dimUpdates).length > 0 && (
                <motion.div className="glass-card rounded-2xl p-3.5 space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                  <span className="text-xs font-display font-semibold text-foreground">Dimension Shifts</span>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(dimUpdates).map(([dim, val]) => (
                      <div key={dim} className="flex items-center justify-between text-[11px] font-body">
                        <span className="text-muted-foreground capitalize">{dim}</span>
                        <span className={`font-semibold ${Number(val) > 0 ? "text-emerald-400" : Number(val) < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                          {Number(val) > 0 ? "+" : ""}{Number(val).toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Witness + Chitta Vritti */}
              {(signal?.chitta_vritti || Object.keys(witnessSignals).length > 0) && (
                <motion.div className="glass-card rounded-2xl p-3.5 space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                  <span className="text-xs font-display font-semibold text-foreground">Witness & Mind State</span>
                  {signal?.chitta_vritti && (
                    <div className="flex items-center gap-2 text-[11px] font-body">
                      <span className="text-muted-foreground">Chitta Vritti:</span>
                      <Badge variant="outline" className="text-[10px] capitalize">{signal.chitta_vritti}</Badge>
                    </div>
                  )}
                  {witnessSignals.depth != null && (
                    <div className="flex items-center gap-2 text-[11px] font-body">
                      <span className="text-muted-foreground">Witness Depth:</span>
                      <span className="font-semibold text-foreground">{Number(witnessSignals.depth).toFixed(1)}/10</span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}

          {/* Lazy-analysis in flight */}
          {!hasAnalysis && analyzing && (
            <div className="glass-card rounded-2xl p-4 text-center flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground font-body">Analyzing this entry…</p>
            </div>
          )}

          {/* No analysis fallback */}
          {!hasAnalysis && !analyzing && (
            <div className="glass-card rounded-2xl p-4 text-center">
              <p className="text-xs text-muted-foreground font-body">No analysis data available for this entry</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// --- Main Component ---

interface JournalHistoryProps {
  entries: JournalEntry[];
}

export default function JournalHistory({ entries }: JournalHistoryProps) {
  const [open, setOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const entryIds = entries.map((e) => e.id);
  const { data: signals = [] } = useJournalSignals(entryIds);

  const signalMap = new Map<string, SignalData>();
  signals.forEach((s) => { if (s.source_id) signalMap.set(s.source_id, s); });

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSelectedEntry(null); }}>
      <SheetTrigger asChild>
        <motion.button
          className="w-9 h-9 rounded-xl glass-subtle flex items-center justify-center text-muted-foreground hover:text-foreground transition-all border border-border/30 hover:border-primary/30"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          title="Journal History"
        >
          <History className="w-4 h-4" />
        </motion.button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[420px] bg-background/95 backdrop-blur-2xl border-border/20 p-0">
        <div className="flex flex-col h-full p-5">
          {selectedEntry ? (
            <EntryDetailView
              entry={selectedEntry}
              signal={signalMap.get(selectedEntry.id)}
              onBack={() => setSelectedEntry(null)}
            />
          ) : (
            <>
              <SheetHeader className="pb-4 border-b border-border/20">
                <SheetTitle className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Journal History
                </SheetTitle>
              </SheetHeader>

              <ScrollArea className="flex-1 py-4">
                <div className="space-y-2.5">
                  {entries.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground font-body">No journal entries yet</p>
                      <p className="text-xs text-muted-foreground/60 font-body mt-1">Write a journal entry to see history here</p>
                    </div>
                  ) : (
                    entries.map((entry) => {
                      const signal = signalMap.get(entry.id);
                      const hasAnalysis = !!signal;
                      const loopCount = signal ? (Array.isArray(signal.loops_detected) ? signal.loops_detected.length : 0) : 0;
                      return (
                        <EntryListItem
                          key={entry.id}
                          entry={entry}
                          hasAnalysis={hasAnalysis}
                          loopCount={loopCount}
                          onClick={() => setSelectedEntry(entry)}
                        />
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
