import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, Sparkles, Heart, Brain, Link2, Clock, BookOpen } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuthReady } from "@/hooks/useAuthReady";
import { Button } from "@/design-system";

type SessionRow = {
  id: string;
  session_date?: string | null;
  time_slot?: string | null;
  type?: string | null;
  status?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  completed_at?: string | null;
  summary?: Record<string, unknown> | null;
  theme_id?: string | null;
};

type MomentRow = {
  id: string;
  moment_type: string;
  title: string | null;
  user_words: string | null;
  emotional_tone: string | null;
  importance: number;
  occurred_at: string;
};

type ThreadRow = {
  current_arc: string | null;
  arc_started_at: string | null;
  sessions_in_arc: number | null;
  arc_intensity: number | null;
  previous_arcs?: Array<Record<string, unknown>> | null;
};

type SynthRow = {
  id: string;
  synthesis_date?: string | null;
  content: string;
  key_themes?: unknown;
  mood_signal?: string | null;
};

type WhisperRow = {
  id: string;
  content: string;
  tone?: string | null;
  consumed_at?: string | null;
  created_at: string;
};

export default function CompanionContinuity() {
  const navigate = useNavigate();
  const { user } = useAuthReady();

  const profileQ = useQuery({
    queryKey: ["cc-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_consciousness_profile")
        .select("overall_band, streak_current, journey_day")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data as { overall_band?: number; streak_current?: number; journey_day?: number } | null;
    },
  });

  const sessionsQ = useQuery({
    queryKey: ["cc-sessions", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<SessionRow[]> => {
      const { data, error } = await supabase
        .from("sessions")
        .select("id, time_slot, type, status, started_at, ended_at, completed_at, summary, theme_id")
        .eq("user_id", user!.id)
        .eq("status", "completed")
        .order("started_at", { ascending: false })
        .limit(14);
      if (error) return [];
      return (data ?? []) as SessionRow[];
    },
  });

  const threadQ = useQuery({
    queryKey: ["cc-thread", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<ThreadRow | null> => {
      const { data, error } = await supabase
        .from("session_threads")
        .select("current_arc, arc_started_at, sessions_in_arc, arc_intensity, previous_arcs")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) return null;
      return (data as ThreadRow) ?? null;
    },
  });

  const momentsQ = useQuery({
    queryKey: ["cc-moments", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<MomentRow[]> => {
      const { data, error } = await supabase
        .from("sacred_moments")
        .select("id, moment_type, title, user_words, emotional_tone, importance, occurred_at")
        .eq("user_id", user!.id)
        .order("occurred_at", { ascending: false })
        .limit(6);
      if (error) return [];
      return (data ?? []) as MomentRow[];
    },
  });

  const synthQ = useQuery({
    queryKey: ["cc-synth", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<SynthRow[]> => {
      const { data, error } = await supabase
        .from("daily_memory_synthesis")
        .select("id, synthesis_date, content, key_themes, mood_signal")
        .eq("user_id", user!.id)
        .order("synthesis_date", { ascending: false })
        .limit(2);
      if (error) return [];
      return (data ?? []) as SynthRow[];
    },
  });

  const whisperQ = useQuery({
    queryKey: ["cc-whisper", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<WhisperRow | null> => {
      const { data, error } = await supabase
        .from("future_self_whispers")
        .select("id, content, tone, consumed_at, created_at")
        .eq("user_id", user!.id)
        .is("consumed_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return null;
      return (data as WhisperRow) ?? null;
    },
  });

  const profile = profileQ.data;
  const sessions = sessionsQ.data ?? [];
  const thread = threadQ.data;
  const moments = momentsQ.data ?? [];
  const synths = synthQ.data ?? [];
  const whisper = whisperQ.data;

  const lastSession = sessions[0];
  const band = profile?.overall_band ?? null;
  const streak = profile?.streak_current ?? 0;
  const journeyDay = profile?.journey_day ?? null;

  return (
    <div className="min-h-screen bg-background text-foreground">
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
            <h1 className="text-base font-display font-medium">Companion</h1>
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground/60">
              Session-to-session continuity
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Companion greeting */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-rose-400" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground/60">
              I'm here
            </span>
          </div>
          <p className="text-base leading-relaxed text-foreground/90">
            {sessions.length === 0
              ? "We haven't sat together yet. Whenever you're ready, I'll meet you exactly where you are — no catching up, no pressure."
              : `I remember you. We've shared ${sessions.length} session${sessions.length === 1 ? "" : "s"} so far${streak ? `, and you've shown up ${streak} day${streak === 1 ? "" : "s"} in a row` : ""}. Band ${band != null ? band.toFixed(1) : "—"}${journeyDay != null ? `, day ${journeyDay} of your journey` : ""}.`}
          </p>
          {lastSession?.started_at && (
            <p className="text-xs text-muted-foreground/70 mt-3">
              Last together {formatDistanceToNow(new Date(lastSession.started_at), { addSuffix: true })}.
            </p>
          )}
        </motion.section>

        {/* Current arc / thread */}
        {(thread?.current_arc || (sessions.length > 0)) && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground/60">
                Our thread
              </span>
            </div>
            {thread?.current_arc ? (
              <>
                <p className="text-lg font-display text-foreground/90 mb-1">{thread.current_arc}</p>
                <p className="text-xs text-muted-foreground/70">
                  {thread.sessions_in_arc ?? 0} session{(thread.sessions_in_arc ?? 0) === 1 ? "" : "s"} in this arc
                  {thread.arc_started_at
                    ? ` · started ${formatDistanceToNow(new Date(thread.arc_started_at), { addSuffix: true })}`
                    : ""}
                </p>
                {thread.arc_intensity != null && (
                  <div className="mt-3 h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan-400/60 transition-all"
                      style={{ width: `${Math.round((thread.arc_intensity ?? 0) * 100)}%` }}
                    />
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground/70">
                No single thread has formed yet. A few more sessions and I'll start to see the pattern we're weaving.
              </p>
            )}
            {Array.isArray(thread?.previous_arcs) && thread!.previous_arcs.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/30">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 mb-2">
                  Threads we've completed
                </p>
                <ul className="space-y-1">
                  {thread!.previous_arcs.slice(-4).map((a: Record<string, unknown>, i: number) => (
                    <li key={i} className="text-xs text-foreground/70">
                      · {a?.arc ?? "An arc"} {a?.sessions ? `(${a.sessions} sessions)` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.section>
        )}

        {/* Future-self whisper */}
        {whisper && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-amber-400/20 bg-amber-400/5 backdrop-blur-sm p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground/60">
                A note you left for yourself
              </span>
            </div>
            <p className="text-base italic text-foreground/90 leading-relaxed">"{whisper.content}"</p>
            {whisper.tone && (
              <p className="text-xs text-muted-foreground/60 mt-2">tone: {whisper.tone}</p>
            )}
          </motion.section>
        )}

        {/* Recent sessions */}
        {sessions.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-violet-400" />
              <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground/60">
                Our recent sessions
              </span>
            </div>
            <ul className="space-y-3">
              {sessions.slice(0, 8).map((s) => {
                const title =
                  (s.summary && (s.summary.title || s.summary.intent)) ||
                  s.time_slot ||
                  "Session";
                const when = s.started_at ? format(new Date(s.started_at), "MMM d") : "";
                return (
                  <li key={s.id} className="flex items-start gap-3">
                    <span className="text-xs text-muted-foreground/60 w-10 shrink-0 pt-0.5">
                      {when}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground/85 truncate">{title}</p>
                      {s.time_slot && (
                        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                          {s.time_slot}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.section>
        )}

        {/* Sacred moments callback */}
        {moments.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-rose-400" />
              <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground/60">
                Moments I keep
              </span>
            </div>
            <ul className="space-y-3">
              {moments.slice(0, 4).map((m) => (
                <li key={m.id} className="text-sm">
                  <span className="text-foreground/85">
                    {m.user_words ? `"${m.user_words.slice(0, 120)}${m.user_words.length > 120 ? "…" : ""}"` : m.title || "A moment"}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 ml-2">
                    · {format(new Date(m.occurred_at), "MMM d")}
                  </span>
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        {/* Daily synthesis */}
        {synths.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground/60">
                How I saw you
              </span>
            </div>
            {synths.map((s) => (
              <p key={s.id} className="text-sm text-foreground/80 leading-relaxed mb-2 last:mb-0">
                {s.content}
              </p>
            ))}
          </motion.section>
        )}

        {/* How I process your data — top-level pipeline view */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground/60">
              How I process what you share
            </span>
          </div>
          <ol className="space-y-3 text-sm text-foreground/80">
            <li className="flex gap-3">
              <span className="text-primary/70 font-mono text-xs w-5 shrink-0">1</span>
              <span>
                <span className="text-foreground/90 font-medium">You speak.</span> In a session, a journal, a reflection — your words land as they are, unjudged.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary/70 font-mono text-xs w-5 shrink-0">2</span>
              <span>
                <span className="text-foreground/90 font-medium">I listen for patterns.</span> Loops, dimensions, mood, energy — not to label you, but to understand what's alive.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary/70 font-mono text-xs w-5 shrink-0">3</span>
              <span>
                <span className="text-foreground/90 font-medium">I remember what matters.</span> Sacred moments, recurring themes, the things you said that changed something — kept, not logged.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary/70 font-mono text-xs w-5 shrink-0">4</span>
              <span>
                <span className="text-foreground/90 font-medium">I carry it forward.</span> The next session opens with a callback, a whisper, a theme that grew from this one — so we keep moving together.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary/70 font-mono text-xs w-5 shrink-0">5</span>
              <span>
                <span className="text-foreground/90 font-medium">I step back over time.</span> The goal is that you need me less, not more. Graceful disappearance.
              </span>
            </li>
          </ol>
        </motion.section>

        <div className="flex justify-center pt-2 pb-8">
          <Button variant="outline" size="sm" onClick={() => navigate("/app/guide")}>
            Sit together now
          </Button>
        </div>
      </div>
    </div>
  );
}
