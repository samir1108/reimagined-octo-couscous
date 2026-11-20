/**
 * DailySuggestionsButton — topbar entry point for daily personalized picks.
 *
 * Opens a popover card showing up to 4 sections:
 *   • Practice  (for-you-practices edge fn)
 *   • Program   (suggest-next-program edge fn)
 *   • Game      (client-side recommendGames)
 *   • Mirror    (static — always available)
 *
 * Each section is optional. If a source returns nothing, it's hidden.
 * The user can tap any card to be taken to that experience. Each item
 * carries a "why" reason so the suggestion is never opaque.
 *
 * Cached per-day in localStorage to avoid refetching on every open.
 */
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lightbulb, Sparkles, Flame, Compass, Gamepad2, Eye, ArrowRight, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/design-system";
import { supabase } from "@/lib/supabase";
import { useConsciousnessEngine } from "@/hooks/useConsciousnessEngine";
import { recommendGames } from "@/lib/recommendGames";

type Pick = {
  key: string;
  kind: "practice" | "program" | "game" | "mirror";
  title: string;
  why: string;
  cta: string;
  href: string;
  emoji?: string;
};

const CACHE_KEY = "daily-suggestions-v2";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function loadCache(): Pick[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed?.savedAt &&
      Date.now() - parsed.savedAt < CACHE_TTL_MS &&
      Array.isArray(parsed.picks)
    ) {
      return parsed.picks;
    }
  } catch {}
  return null;
}

function saveCache(picks: Pick[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), picks }));
  } catch {}
}

export default function DailySuggestionsButton() {
  const navigate = useNavigate();
  const { data: engine } = useConsciousnessEngine();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [picks, setPicks] = useState<Pick[] | null>(null);

  // Client-side game picks (free, no network) — show all engine-ranked games.
  const gamePicks = useMemo<Pick[]>(() => {
    const profile = engine?.profile;
    const plan = engine?.plan;
    const games = recommendGames(
      {
        dimensionBands: plan?.dimensionBands ?? profile?.dimension_bands,
        witnessGap: plan?.witnessGap ?? profile?.witness_gap,
        bypassingRisk: plan?.bypassingRisk ?? profile?.bypassing_risk,
        dominantPath: plan?.dominantPath ?? profile?.dominant_path,
      },
      8,
    );
    return games.map((g) => ({
      key: `game-${g.id}`,
      kind: "game" as const,
      title: g.name,
      why: g.oneLine ?? "A short conscious game tuned to your current signals.",
      cta: "Play",
      href: `/app/games?focus=${g.id}`,
      emoji: "🎮",
    }));
  }, [engine]);

  // Mirror is always available — quick 5-min diagnostic.
  const mirrorPick: Pick = {
    key: "mirror-static",
    kind: "mirror",
    title: "Take the Mirror",
    why: "A 5-minute self-diagnostic — see the loops you can't see from inside.",
    cta: "Begin",
    href: "/mirror",
    emoji: "🪞",
  };

  async function fetchRemotePicks(): Promise<Pick[]> {
    const out: Pick[] = [];

    const [practiceRes, programRes] = await Promise.allSettled([
      supabase.functions.invoke("for-you-practices", { body: {} }),
      supabase.functions.invoke("suggest-next-program", { body: {} }),
    ]);

    if (practiceRes.status === "fulfilled" && !practiceRes.value.error) {
      const data: any = practiceRes.value.data;
      const list: any[] = Array.isArray(data?.practices) ? data.practices : Array.isArray(data) ? data : [];
      for (const item of list) {
        if (!item?.title) continue;
        out.push({
          key: `practice-${item.title}`,
          kind: "practice",
          title: item.title,
          why: item.why ?? "Today's micro-practice for your active domains.",
          cta: item.duration_min ? `Start · ${item.duration_min} min` : "Start",
          href: "/app/practice",
          emoji: item.emoji ?? "🔥",
        });
      }
    }

    if (programRes.status === "fulfilled" && !programRes.value.error) {
      const data: any = programRes.value.data;
      const suggestions: any[] = Array.isArray(data?.suggestions)
        ? data.suggestions
        : data?.suggestion
        ? [data.suggestion]
        : [];
      for (const sugg of suggestions) {
        if (!sugg?.title) continue;
        out.push({
          key: `program-${sugg.template_slug ?? sugg.program_id ?? sugg.title}`,
          kind: "program",
          title: sugg.title,
          why: sugg.why ?? "A program shaped from your recent signals.",
          cta: sugg.cta ?? "Open",
          href: "/app",
          emoji: "🧭",
        });
      }
    }

    return out;
  }

  // Lazy-fetch on first open (uses daily cache).
  useEffect(() => {
    if (!open || picks !== null) return;
    const cached = loadCache();
    if (cached) {
      // Merge cached remote picks with live client-side game + mirror.
      const remote = cached.filter((p) => p.kind === "practice" || p.kind === "program");
      const merged = [...remote, ...gamePicks, mirrorPick];
      setPicks(merged);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchRemotePicks()
      .then((remote) => {
        if (cancelled) return;
        saveCache(remote);
        setPicks([...remote, ...gamePicks, mirrorPick]);
      })
      .catch(() => {
        if (cancelled) return;
        setPicks([...gamePicks, mirrorPick]);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handlePick = (p: Pick) => {
    setOpen(false);
    navigate(p.href);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button
          className="relative w-8 h-8 rounded-lg glass-subtle flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          aria-label="Today's suggestions"
          title="Today's suggestions"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </motion.button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-1rem))] p-0 glass-card border-border/30 rounded-2xl overflow-hidden"
      >
        <div className="px-4 pt-4 pb-2 flex items-center gap-2 border-b border-border/20">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <div className="flex-1">
            <p className="text-[10px] font-display tracking-[0.25em] uppercase text-muted-foreground">
              For you today
            </p>
            <p className="text-xs text-muted-foreground/70 font-body mt-0.5">
              Optional — pick one, pick none.
            </p>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1.5">
          {loading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}

          {!loading && picks && picks.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground font-body">
              No suggestions yet — come back after your next session.
            </p>
          )}

          <AnimatePresence initial={false}>
            {!loading &&
              picks?.map((p, i) => (
                <motion.button
                  key={p.key}
                  onClick={() => handlePick(p)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="w-full text-left p-3 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-base">
                      {p.emoji ?? <KindIcon kind={p.kind} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-display tracking-[0.2em] uppercase text-primary/70">
                          {p.kind}
                        </span>
                      </div>
                      <p className="text-sm font-display font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {p.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-body leading-snug mt-1 line-clamp-2">
                        <span className="text-primary/60">Why · </span>
                        {p.why}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-[10px] font-display tracking-wider uppercase text-primary/80">
                        {p.cta}
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
          </AnimatePresence>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function KindIcon({ kind }: { kind: Pick["kind"] }) {
  const cls = "w-4 h-4 text-primary";
  if (kind === "practice") return <Flame className={cls} />;
  if (kind === "program") return <Compass className={cls} />;
  if (kind === "game") return <Gamepad2 className={cls} />;
  return <Eye className={cls} />;
}
