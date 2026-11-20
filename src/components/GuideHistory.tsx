import { useEffect, useRef, useState } from "react";
import { getLoopById, searchLoops } from "@/data/loops";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { History, Clock, MessageCircle, AlertTriangle, Brain, Heart, Zap, ChevronRight, ArrowLeft, X, Lightbulb, Shield, Target, Loader2 } from "lucide-react";
import { format, formatDistanceStrict } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/design-system";
import { ScrollArea } from "@/design-system";
import { Badge } from "@/design-system";
import ReactMarkdown from "react-markdown";
import { ensureAnalysisFor } from "@/lib/lazyAnalysis";

interface SessionWithMessages {
  id: string;
  session_date: string;
  time_slot: string;
  type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  ended_at: string | null;
  summary: string | null;
  created_at: string;
}

interface SignalData {
  session_id: string;
  head_signals: Record<string, any>;
  heart_signals: Record<string, any>;
  gut_signals: Record<string, any>;
  loops_detected: any[];
  dimension_updates: Record<string, any>;
  chitta_vritti: string | null;
  witness_signals: Record<string, any>;
}

// Loop insight data — legacy fallback map for common patterns
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
    why: "Unrealistic standards or fear of imperfection surfaced during the conversation.",
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
    whatToDo: "Practice the mantra: 'I can influence, not control.' Identify one thing you can release today. Focus on your response, not the outcome.",
  },
};

function getLoopInsight(loopId: string): { why: string; whatToDo: string } {
  // First try: look up from the actual loops library by ID
  const loopDef = getLoopById(loopId);
  if (loopDef) {
    return {
      why: `${loopDef.description}. Triggers: ${loopDef.triggers.slice(0, 3).join(", ")}. Watch for: ${loopDef.awareness_markers[0] || "recurring patterns"}.`,
      whatToDo: loopDef.dissolution_path,
    };
  }

  // Second try: search the loops library by name
  const searchResults = searchLoops(loopId.replace(/[_-]/g, " "));
  if (searchResults.length > 0) {
    const match = searchResults[0];
    return {
      why: `${match.description}. Triggers: ${match.triggers.slice(0, 3).join(", ")}. Watch for: ${match.awareness_markers[0] || "recurring patterns"}.`,
      whatToDo: match.dissolution_path,
    };
  }

  // Third try: legacy fallback map
  const normalized = loopId.toLowerCase().replace(/[\s-]+/g, "_");
  if (LOOP_INSIGHTS_LEGACY[normalized]) return LOOP_INSIGHTS_LEGACY[normalized];
  for (const key of Object.keys(LOOP_INSIGHTS_LEGACY)) {
    if (normalized.includes(key) || key.includes(normalized)) return LOOP_INSIGHTS_LEGACY[key];
  }

  return {
    why: "This pattern was identified based on recurring themes in your conversation.",
    whatToDo: "Bring gentle awareness to this pattern. Notice when it activates without judgment. Journal about what triggers it.",
  };
}

function usePastSessions() {
  return useQuery({
    queryKey: ["guide-history-sessions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("started_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as SessionWithMessages[];
    },
  });
}

function useSessionDetail(sessionId: string | null) {
  const messages = useQuery({
    queryKey: ["history-messages", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const { data, error } = await supabase
        .from("session_messages")
        .select("role, content, created_at")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!sessionId,
  });

  const signals = useQuery({
    queryKey: ["history-signals", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const { data, error } = await supabase
        .from("consciousness_signals")
        .select("head_signals, heart_signals, gut_signals, loops_detected, dimension_updates, chitta_vritti, witness_signals")
        .eq("source_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as SignalData | null;
    },
    enabled: !!sessionId,
  });

  return { messages, signals };
}

const SLOT_EMOJI: Record<string, string> = {
  morning: "🌅",
  midday: "☀️",
  afternoon: "☀️",
  evening: "🌆",
  night: "🌙",
  general: "💬",
};

function SessionListItem({ session, onClick }: { session: SessionWithMessages; onClick: () => void }) {
  const endAt = session.completed_at || session.ended_at;
  const duration = endAt
    ? formatDistanceStrict(new Date(endAt), new Date(session.started_at))
    : "—";

  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left glass-card rounded-2xl p-4 hover:border-primary/20 border border-transparent transition-all group"
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{SLOT_EMOJI[session.time_slot] || "💬"}</span>
          <span className="font-display text-sm font-semibold text-foreground capitalize">
            {session.time_slot} Session
          </span>
          {session.type && session.type !== "general" && (
            <Badge variant="secondary" className="text-[9px] capitalize">{session.type.replace(/_/g, " ")}</Badge>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-body">
        <span>{format(new Date(session.started_at), "MMM d, yyyy · h:mm a")}</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {duration}
        </span>
      </div>
      {session.summary && (
        <p className="text-xs text-muted-foreground/80 font-body mt-2 line-clamp-2">{session.summary}</p>
      )}
    </motion.button>
  );
}

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
            {/* Why */}
            <div className="glass-subtle rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Lightbulb className="w-3 h-3 text-primary/70" />
                <span className="text-[10px] font-display font-semibold text-primary/70 uppercase tracking-wider">Why this was detected</span>
              </div>
              <p className="text-[11px] font-body text-muted-foreground leading-relaxed">{insight.why}</p>
            </div>

            {/* What to do */}
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

function SessionDetailView({
  session,
  onBack,
}: {
  session: SessionWithMessages;
  onBack: () => void;
}) {
  const { messages, signals } = useSessionDetail(session.id);
  const signalData = signals.data;
  const qc = useQueryClient();
  const triggeredRef = useRef(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Lazy analysis: when this session is opened and no consciousness_signals
  // exist yet, run 3-Lens + memory extraction now, then refetch.
  useEffect(() => {
    if (triggeredRef.current) return;
    if (signals.isLoading || messages.isLoading) return;
    if (signalData) return; // already analyzed
    const msgs = messages.data || [];
    if (msgs.length < 2) return;
    triggeredRef.current = true;
    setAnalyzing(true);
    const text = msgs.map((m: any) => `${m.role}: ${m.content}`).join("\n");
    ensureAnalysisFor({
      sourceType: "guide_session",
      sourceId: session.id,
      text,
    })
      .then((ran) => {
        if (ran) {
          qc.invalidateQueries({ queryKey: ["history-signals", session.id] });
          qc.invalidateQueries({ queryKey: ["guide-history-sessions"] });
        }
      })
      .finally(() => setAnalyzing(false));
  }, [session.id, signalData, signals.isLoading, messages.isLoading, messages.data, qc]);

  const loopsDetected = Array.isArray(signalData?.loops_detected) ? signalData.loops_detected : [];
  const dimUpdates = (signalData?.dimension_updates && typeof signalData.dimension_updates === "object")
    ? signalData.dimension_updates as Record<string, number>
    : {};
  const headSignals = (signalData?.head_signals && typeof signalData.head_signals === "object")
    ? signalData.head_signals as Record<string, any>
    : {};
  const heartSignals = (signalData?.heart_signals && typeof signalData.heart_signals === "object")
    ? signalData.heart_signals as Record<string, any>
    : {};
  const gutSignals = (signalData?.gut_signals && typeof signalData.gut_signals === "object")
    ? signalData.gut_signals as Record<string, any>
    : {};
  const witnessSignals = (signalData?.witness_signals && typeof signalData.witness_signals === "object")
    ? signalData.witness_signals as Record<string, any>
    : {};

  const endAt = session.completed_at || session.ended_at;
  const duration = endAt
    ? formatDistanceStrict(new Date(endAt), new Date(session.started_at))
    : "—";

  const hasAnalysis = signalData || loopsDetected.length > 0;

  // Extract loop IDs for display
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
          <h3 className="font-display font-semibold text-foreground text-sm capitalize">
            {SLOT_EMOJI[session.time_slot]} {session.time_slot} Session
          </h3>
          <p className="text-[11px] text-muted-foreground font-body">
            {format(new Date(session.started_at), "MMM d, yyyy · h:mm a")} · {duration}
          </p>
        </div>
        {session.type && session.type !== "general" && (
          <Badge variant="outline" className="text-[10px] capitalize shrink-0">{session.type.replace(/_/g, " ")}</Badge>
        )}
      </div>

      <ScrollArea className="flex-1 py-4">
        <div className="space-y-5">
          {/* Session Summary */}
          {session.summary && (
            <motion.div className="glass-card rounded-2xl p-3.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h4 className="text-xs font-display font-semibold text-foreground mb-2">Session Summary</h4>
              <p className="text-xs font-body text-muted-foreground leading-relaxed">{session.summary}</p>
            </motion.div>
          )}

          {/* Analysis Cards */}
          {hasAnalysis && (
            <div className="space-y-3">
              <h4 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider">Session Analysis</h4>

              {/* Loops Detected — Enhanced with why + what to do */}
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
              {(signalData?.chitta_vritti || Object.keys(witnessSignals).length > 0) && (
                <motion.div className="glass-card rounded-2xl p-3.5 space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                  <span className="text-xs font-display font-semibold text-foreground">Witness & Mind State</span>
                  {signalData?.chitta_vritti && (
                    <div className="flex items-center gap-2 text-[11px] font-body">
                      <span className="text-muted-foreground">Chitta Vritti:</span>
                      <Badge variant="outline" className="text-[10px] capitalize">{signalData.chitta_vritti}</Badge>
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
              <p className="text-xs text-muted-foreground font-body">Analyzing this session…</p>
            </div>
          )}

          {/* No analysis fallback */}
          {!hasAnalysis && !signals.isLoading && !analyzing && (
            <div className="glass-card rounded-2xl p-4 text-center">
              <p className="text-xs text-muted-foreground font-body">No analysis data available for this session</p>
            </div>
          )}

          {/* Conversation */}
          <div className="space-y-2">
            <h4 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MessageCircle className="w-3 h-3" />
              Conversation ({messages.data?.length || 0} messages)
            </h4>
            <div className="space-y-3">
              {messages.data?.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs font-body leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary/15 text-foreground rounded-br-lg"
                        : "glass-subtle rounded-bl-lg"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-xs dark:prose-invert max-w-none prose-p:my-1 prose-headings:text-foreground">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
              {messages.isLoading && (
                <div className="flex justify-center py-8">
                  <motion.div className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default function GuideHistory() {
  const [open, setOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionWithMessages | null>(null);
  const { data: sessions, isLoading } = usePastSessions();

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSelectedSession(null); }}>
      <SheetTrigger asChild>
        <motion.button
          className="w-9 h-9 rounded-xl glass-subtle flex items-center justify-center text-muted-foreground hover:text-foreground transition-all border border-border/30 hover:border-primary/30"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          title="Session History"
        >
          <History className="w-4 h-4" />
        </motion.button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[420px] bg-background/95 backdrop-blur-2xl border-border/20 p-0">
        <div className="flex flex-col h-full p-5">
          {selectedSession ? (
            <SessionDetailView session={selectedSession} onBack={() => setSelectedSession(null)} />
          ) : (
            <>
              <SheetHeader className="pb-4 border-b border-border/20">
                <SheetTitle className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Session History
                </SheetTitle>
              </SheetHeader>

              <ScrollArea className="flex-1 py-4">
                <div className="space-y-2.5">
                  {isLoading && (
                    <div className="flex justify-center py-12">
                      <motion.div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                    </div>
                  )}
                  {!isLoading && sessions?.length === 0 && (
                    <div className="text-center py-12">
                      <MessageCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground font-body">No completed sessions yet</p>
                      <p className="text-xs text-muted-foreground/60 font-body mt-1">Start a guide session to see history here</p>
                    </div>
                  )}
                  {sessions?.map((session) => (
                    <SessionListItem key={session.id} session={session} onClick={() => setSelectedSession(session)} />
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
