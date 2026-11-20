import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock, Lightbulb, Search, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EASE = [0.16, 1, 0.3, 1] as const;
const JUNK_TEXT = /^(undefined|null|n\/?a|none|nan)$/i;

function cleanText(v: unknown): string {
  if (typeof v !== "string") return "";
  const s = v.trim();
  return s && !JUNK_TEXT.test(s) ? s : "";
}

interface Discovery {
  id: string;
  type: "pattern" | "insight" | "recurring" | "growth";
  title: string;
  description: string;
  source: "journal" | "session" | "engine";
  sourceDate: string;
  count?: number;
}

function useDiscoveries() {
  return useQuery<Discovery[]>({
    queryKey: ["home-discoveries"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [journalsRes, sessionsRes, loopProfileRes, activeLoopsRes] = await Promise.all([
        supabase
          .from("journal_entries")
          .select("id, content, created_at, mood, tags")
          .eq("user_id", user.id)
          .gte("created_at", sevenDaysAgo)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("sessions")
          .select("id, summary, completed_at, time_slot")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .gte("completed_at", sevenDaysAgo)
          .order("completed_at", { ascending: false })
          .limit(10),
        supabase
          .from("user_consciousness_profile")
          .select("active_loops, metadata")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("active_loops")
          .select("loop_id, severity, awareness_score, is_active")
          .eq("user_id", user.id)
          .limit(20),
      ]);

      const journals = journalsRes.data || [];
      const sessions = sessionsRes.data || [];
      const loopProfile = loopProfileRes.data;
      const activeLoops = (activeLoopsRes.data || []).filter((l) => l.is_active !== false);
      const loopData = {
        active_loops: Array.isArray(loopProfile?.active_loops) ? loopProfile.active_loops : activeLoops.map((l) => l.loop_id).filter(Boolean),
        loop_awareness: activeLoops.reduce<Record<string, number>>((acc, l) => {
          if (l.loop_id && typeof l.awareness_score === "number") acc[l.loop_id] = l.awareness_score;
          return acc;
        }, {}),
        loop_severity: activeLoops.reduce<Record<string, string>>((acc, l) => {
          if (l.loop_id && typeof l.severity === "string") acc[l.loop_id] = l.severity;
          return acc;
        }, {}),
      };

      const discoveries: Discovery[] = [];

      // Journal patterns - recurring themes in tags/content
      if (journals?.length) {
        const tagCounts: Record<string, number> = {};
        journals.forEach((j) => {
          (j.tags || []).forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });

        Object.entries(tagCounts)
          .filter(([, count]) => count >= 2)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .forEach(([tag, count]) => {
            discoveries.push({
              id: `journal-${tag}`,
              type: "recurring",
              title: `“${tag}” appeared ${count} times this week`,
              description: "Your journal keeps returning to this theme.",
              source: "journal",
              sourceDate: journals[0]?.created_at || new Date().toISOString(),
              count,
            });
          });
      }

      // Session summaries - insights
      if (sessions?.length) {
        sessions.forEach((s) => {
          const summary = cleanText(s.summary);
          if (summary && summary.length > 30) {
            discoveries.push({
              id: `session-${s.id}`,
              type: "insight",
              title: "Session insight",
              description: summary.slice(0, 140) + (summary.length > 140 ? "…" : ""),
              source: "session",
              sourceDate: s.completed_at || s.time_slot,
            });
          }
        });
      }

      // Loop awareness growth
      if (loopData?.loop_awareness) {
        Object.entries(loopData.loop_awareness)
          .filter(([, v]) => typeof v === "number" && (v as number) > 0.5)
          .sort((a, b) => (b[1] as number) - (a[1] as number))
          .slice(0, 2)
          .forEach(([loopId, awareness]) => {
            discoveries.push({
              id: `loop-${loopId}`,
              type: "growth",
              title: `Awareness of “${loopId}” grew to ${Math.round((awareness as number) * 100)}%`,
              description: "You're catching this pattern earlier.",
              source: "engine",
              sourceDate: new Date().toISOString(),
            });
          });
      }

      // Recurring loops (acute)
      if (loopData?.active_loops && loopData.loop_severity) {
        (loopData.active_loops as string[])
          .filter((l) => loopData.loop_severity[l] === "acute")
          .slice(0, 2)
          .forEach((loopId) => {
            discoveries.push({
              id: `acute-${loopId}`,
              type: "pattern",
              title: `“${loopId}” is acute today`,
              description: "Today's theme targets this pattern directly.",
              source: "engine",
              sourceDate: new Date().toISOString(),
            });
          });
      }

      return discoveries.slice(0, 5);
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}

export default function YourDiscoveries() {
  const navigate = useNavigate();
  const { data: discoveries, isLoading } = useDiscoveries();

  if (isLoading) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
        className="w-full rounded-2xl border border-border/30 bg-card/40 px-5 py-4"
      >
        <p className="text-[9px] font-display tracking-[0.28em] uppercase text-muted-foreground/60 flex items-center gap-1.5">
          <Lightbulb className="h-3 w-3" aria-hidden />
          Your discoveries
        </p>
        <div className="mt-3 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-full rounded-xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      </motion.section>
    );
  }

  if (!discoveries?.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
      aria-label="Your discoveries"
      className="w-full rounded-2xl border border-border/30 bg-card/40 px-5 py-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-display tracking-[0.28em] uppercase text-amber-300/70 flex items-center gap-1.5">
          <Lightbulb className="h-3 w-3" aria-hidden />
          Your discoveries
        </p>
        <button
          type="button"
          onClick={() => navigate("/app/journal")}
          className="text-[9px] font-display tracking-[0.18em] uppercase text-muted-foreground/45 hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          View all
          <ArrowRight className="h-2.5 w-2.5" aria-hidden />
        </button>
      </div>

      <ul className="mt-3 space-y-3" role="list">
        {discoveries.map((d, i) => {
          const Icon = d.type === "pattern" ? Search : d.type === "growth" ? TrendingUp : d.type === "recurring" ? Clock : Lightbulb;
          return (
            <AnimatePresence key={d.id} initial={false}>
              <motion.li
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.15 + i * 0.05 }}
                className="group flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-border/30 hover:border-primary/20 transition-colors"
              >
                <Icon className="mt-0.5 flex-shrink-0 h-4 w-4 text-amber-300/70" aria-hidden />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-foreground/85">{d.title}</p>
                  <p className="mt-0.5 text-[11px] text-foreground/60 line-clamp-2">{d.description}</p>
                  <p className="mt-1.5 text-[9px] font-display tracking-[0.12em] uppercase text-muted-foreground/45 flex items-center gap-1">
                    <span>{d.source}</span>
                    <span>•</span>
                    <span>{new Date(d.sourceDate).toLocaleDateString()}</span>
                  </p>
                </div>
                <ArrowRight className="flex-shrink-0 mt-0.5 h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary/60 transition-colors" aria-hidden />
              </motion.li>
            </AnimatePresence>
          );
        })}
      </ul>

      <p className="mt-4 text-center text-[10px] italic leading-relaxed text-muted-foreground/50">
        Insights compound. The map reveals itself.
      </p>
    </motion.section>
  );
}