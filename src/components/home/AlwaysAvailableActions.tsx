/**
 * AlwaysAvailableActions — engine-driven "always-open doors" for off-rhythm states.
 *
 * The backend (always-open-prompts edge fn) reads recent mood / loops / regression /
 * journals / energy and returns 3 contextual cards. Each card has a mode (emotional
 * support, observation, self-inquiry, gratitude, integration, rest, reflection) and
 * a route the user can walk through. We render them with a "why this" reason chip so
 * the user sees why the engine is suggesting it.
 */
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { BookOpen, MessageCircle, Eye, Heart, Sparkles, Moon, Sun } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Backend supports 30+ modes — keep this loose so we don't break on new ones.
type Mode = string;

interface Card {
  mode: Mode;
  surface: "journal" | "guide" | "inquiry";
  label: string;
  prompt: string;
  cta: string;
  route: string;
  reason: string;
}

function iconForMode(mode: string, surface: Card["surface"]): React.ReactNode {
  const m = mode.toLowerCase();
  if (m.includes("grief") || m.includes("emotional") || m.includes("loneliness") || m.includes("shame"))
    return <Heart className="w-4 h-4 text-primary/80" />;
  if (m.includes("anxiety") || m.includes("anger") || m.includes("reactivity"))
    return <Heart className="w-4 h-4 text-primary/80" />;
  if (m.includes("observation") || m.includes("loop") || m.includes("trigger") || m.includes("autopilot"))
    return <Eye className="w-4 h-4 text-primary/80" />;
  if (m.includes("inquiry") || m.includes("witness") || m.includes("identity") || m.includes("silence") || m.includes("non_doing"))
    return <Sparkles className="w-4 h-4 text-primary/80" />;
  if (m.includes("gratitude") || m.includes("celebration") || m.includes("morning"))
    return <Sun className="w-4 h-4 text-primary/80" />;
  if (m.includes("rest") || m.includes("late_night") || m.includes("evening") || m.includes("body") || m.includes("breath") || m.includes("energy"))
    return <Moon className="w-4 h-4 text-primary/80" />;
  if (surface === "guide") return <MessageCircle className="w-4 h-4 text-primary/80" />;
  if (surface === "inquiry") return <Eye className="w-4 h-4 text-primary/80" />;
  return <BookOpen className="w-4 h-4 text-primary/80" />;
}

// Static fallback if the engine call fails — we should ALWAYS show something.
const FALLBACK_CARDS: Card[] = [
  {
    mode: "reflection",
    surface: "journal",
    label: "Reflection",
    prompt: "What is alive in you right now — without naming it good or bad?",
    cta: "Write",
    route: "/app/journal?source=always_open",
    reason: "An open moment to check in with yourself",
  },
  {
    mode: "emotional_support",
    surface: "guide",
    label: "Talk to your Guide",
    prompt: "I want to talk about something that's been on my mind.",
    cta: "Open conversation",
    route: "/app/guide?source=always_open",
    reason: "Whenever you'd like to be heard",
  },
  {
    mode: "self_inquiry",
    surface: "inquiry",
    label: "Self-inquiry",
    prompt: "Who is the one experiencing this moment?",
    cta: "Sit with this",
    route: "/app/guide?mode=self_inquiry&source=always_open",
    reason: "A door to deeper seeing",
  },
];

interface ActionCardProps {
  card: Card;
  delay: number;
  onClick: () => void;
}

function ActionCard({ card, delay, onClick }: ActionCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left glass-subtle hover:bg-primary/5 active:scale-[0.98] transition-all rounded-2xl p-4 border border-border/40 hover:border-primary/30"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
          {iconForMode(card.mode, card.surface)}
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-display tracking-[0.18em] uppercase text-primary/70">
              {card.label}
            </p>
            <p className="text-[9px] font-body text-muted-foreground/60 italic truncate">
              {card.reason}
            </p>
          </div>
          <p className="text-sm font-body text-foreground leading-snug">"{card.prompt}"</p>
          <p className="text-[11px] font-display text-muted-foreground/80 pt-1">{card.cta} →</p>
        </div>
      </div>
    </motion.button>
  );
}

interface AlwaysAvailableActionsProps {
  heading?: string;
}

export default function AlwaysAvailableActions({
  heading = "Always open",
}: AlwaysAvailableActionsProps) {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["always-open-prompts", userId],
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 min — same context all session
    queryFn: async (): Promise<{ cards: Card[] }> => {
      const { data, error } = await supabase.functions.invoke("always-open-prompts", {
        body: {},
      });
      if (error || !data?.cards?.length) {
        return { cards: FALLBACK_CARDS };
      }
      return data as { cards: Card[] };
    },
  });

  const cards = data?.cards ?? FALLBACK_CARDS;

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.6 }}
    >
      <p className="text-[10px] font-display tracking-[0.22em] uppercase text-muted-foreground/70 text-center">
        {heading}
      </p>

      <div className="space-y-2.5">
        {(isLoading ? FALLBACK_CARDS : cards).slice(0, 3).map((card, i) => (
          <ActionCard
            key={`${card.mode}-${i}`}
            card={card}
            delay={0.05 + i * 0.07}
            onClick={() => navigate(card.route)}
          />
        ))}
      </div>
    </motion.div>
  );
}
