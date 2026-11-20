import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Send, Check, ArrowRight, Sparkles, Heart, BookOpen, MessageCircle, Pen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { consciousFromError } from "@/lib/consciousToast";
import GetTaskButton from "@/components/GetTaskButton";
import { useAwardKarma } from "@/hooks/useKarma";
import { detectAndAwardBreakthroughs } from "@/lib/breakthroughs/detect";

interface NightSanctuaryProps {
  userName: string;
  morningDone: boolean;
  middayDone: boolean;
  eveningDone: boolean;
  quietDay?: boolean;
  themeName?: string;
  focusDimension?: string;
  engineState?: string;
  /** True when the user's chosen rhythm is "Night Only" — night becomes their MAIN session */
  isNightOnlyUser?: boolean;
  /** Trigger the night-adapted main session (Pattern 4) */
  onStartNightSession?: () => void;
}

function NightGateOrb() {
  return (
    <div className="relative w-36 h-36 mx-auto mb-10">
      
    </div>
  );
}

function PhaseDotsVisualization({ morning, midday, evening }: { morning: boolean; midday: boolean; evening: boolean }) {
  const phases = [
    { label: "Morning", done: morning, emoji: "🌅" },
    { label: "Midday", done: midday, emoji: "☀️" },
    { label: "Evening", done: evening, emoji: "🌆" },
    { label: "Night", done: true, emoji: "🌙" },
  ];

  return (
    <div className="flex items-center gap-3 justify-center mb-8">
      {phases.map((p, i) => (
        <motion.div
          key={p.label}
          className="flex flex-col items-center gap-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.15 }}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              p.done ? "bg-primary/15" : "bg-muted/20"
            }`}
          >
            {p.done ? <Check className="w-3.5 h-3.5 text-primary" /> : <span className="opacity-30">{p.emoji}</span>}
          </div>
          <span className="text-[9px] text-muted-foreground font-body">{p.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Night suggestions: Journal & Guide with context
function getNightSuggestions(themeName?: string, focusDimension?: string, engineState?: string) {
  const suggestions: Array<{
    type: "journal" | "guide";
    title: string;
    subtitle: string;
    emoji: string;
    guideMode?: string;
    journalContext?: string;
  }> = [];

  // Journal suggestions
  suggestions.push({
    type: "journal",
    title: "Evening Reflection",
    subtitle: "Write about what today revealed to you",
    emoji: "📝",
    journalContext: themeName
      ? `Tonight's theme was "${themeName}". Reflect on what today showed you.`
      : "Reflect on what today revealed about your patterns.",
  });

  if (engineState === "dark_night") {
    suggestions.push({
      type: "journal",
      title: "Letter to Yourself",
      subtitle: "Write what you need to hear right now",
      emoji: "💌",
      journalContext: "Write a compassionate letter to yourself. What do you need to hear right now?",
    });
  }

  // Guide suggestions based on dimension/state
  if (focusDimension === "emotion" || engineState === "dark_night") {
    suggestions.push({
      type: "guide",
      title: "Emotional Support",
      subtitle: "Safe space to process tonight's feelings",
      emoji: "🤗",
      guideMode: "therapy",
    });
  } else if (focusDimension === "body") {
    suggestions.push({
      type: "guide",
      title: "Body Scan",
      subtitle: "Release tension before sleep",
      emoji: "🧘",
      guideMode: "somatic",
    });
  } else {
    suggestions.push({
      type: "guide",
      title: "Shadow Work",
      subtitle: "Night is perfect for exploring what's hidden",
      emoji: "🌑",
      guideMode: "shadow_work",
    });
  }

  suggestions.push({
    type: "guide",
    title: "Gratitude & Joy",
    subtitle: "End the day celebrating what was good",
    emoji: "✨",
    guideMode: "gratitude",
  });


  return suggestions;
}

export default function NightSanctuary({ userName, morningDone, middayDone, eveningDone, quietDay, themeName, focusDimension, engineState, isNightOnlyUser, onStartNightSession }: NightSanctuaryProps) {
  const navigate = useNavigate();
  const [gratitudes, setGratitudes] = useState<string[]>(["", "", ""]);
  const [gratitudeSaved, setGratitudeSaved] = useState(false);
  const award = useAwardKarma();

  const saveGratitudes = async () => {
    const filled = gratitudes.filter(g => g.trim());
    if (filled.length === 0) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const content = filled.map((g, i) => `${i + 1}. ${g}`).join("\n");
      await supabase.from("journal_entries").insert({
        user_id: user.id,
        content,
        title: "Evening Gratitude",
        mood: "grateful",
        tags: JSON.stringify(["gratitude", "night"]),
      });
      setGratitudeSaved(true);
      // Award karma — base + small per-item bonus, then scan for breakthroughs
      award.mutate({
        source: "gratitude_logged",
        weight: Math.min(2, 1 + (filled.length - 1) * 0.25),
        metadata: { count: filled.length },
      });
      detectAndAwardBreakthroughs(content, award, "evening_gratitude");
      toast({ title: "Gratitudes received 🙏", description: "Carry them into sleep." });
    } catch (e) {
      consciousFromError(e, "actionMissed");
    }
  };

  const updateGratitude = (index: number, value: string) => {
    setGratitudes(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSuggestionClick = (suggestion: ReturnType<typeof getNightSuggestions>[0]) => {
    if (suggestion.type === "guide" && suggestion.guideMode) {
      navigate(`/app/guide?mode=${suggestion.guideMode}&aiContext=night_reflection`);
    } else if (suggestion.type === "journal" && suggestion.journalContext) {
      navigate(`/app/journal?prompt=${encodeURIComponent(suggestion.journalContext)}`);
    }
  };

  const suggestions = getNightSuggestions(themeName, focusDimension, engineState);

  const nightMessage = engineState === "dark_night"
    ? "You showed up today. That's courage. Rest gently."
    : engineState === "breakthrough"
    ? "Something beautiful is unfolding. Let sleep deepen it."
    : quietDay
    ? "Today was quiet. That's okay. Tomorrow is a new dawn."
    : "Rest. Integrate. Grow.";

  const dreamSeed = focusDimension === "body"
    ? "Tonight, let your body speak to you in dreams."
    : focusDimension === "emotion"
    ? "As you drift off, notice what emotions are gently present..."
    : focusDimension === "thought"
    ? "Let your mind wander freely tonight."
    : focusDimension === "awareness"
    ? "Notice the moment between waking and sleep..."
    : themeName
    ? `Let "${themeName}" dissolve into your dreams.`
    : "Trust the wisdom of sleep.";

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-8">
      <div className="min-h-[30vh] flex flex-col items-center justify-center text-center">
        <NightGateOrb />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2 tracking-tight">
            Good night, <span className="text-gradient-sunrise">{userName}</span>
          </h1>
          <p className="text-sm text-muted-foreground font-body">{nightMessage}</p>
        </motion.div>

        {!quietDay && (
          <div className="mt-6">
            <PhaseDotsVisualization morning={morningDone} midday={middayDone} evening={eveningDone} />
          </div>
        )}
      </div>

      {/* Pattern 4: Night Only — main session entry, gentle mode */}
      {isNightOnlyUser && (
        <motion.div
          className="glass-card rounded-2xl p-6 border-primary/20"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Moon className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold">Tonight's main session</span>
          </div>
          <p className="text-sm font-body text-foreground leading-relaxed mb-2">
            {themeName ? `"${themeName}"` : "Today's session is ready"}
          </p>
          <p className="text-[11px] text-muted-foreground font-body italic mb-4">
            🌙 Gentle mode is on — breath and body, no heavy emotion work tonight.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => (onStartNightSession ? onStartNightSession() : navigate("/app/guide?slot=night&mode=gentle"))}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-sunrise text-primary-foreground font-display font-medium text-xs"
            >
              Sit With Me <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate("/app/guide?slot=night&mode=quick")}
              className="px-4 py-2 rounded-xl glass-subtle text-foreground/70 font-display font-medium text-xs hover:bg-primary/5 transition-all"
            >
              5 min Quick
            </button>
          </div>
        </motion.div>
      )}

      {/* Dream Seed — Ambient whisper */}
      <motion.div
        className="glass-card rounded-2xl p-6 border-primary/10 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary/60" />
            <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold">Dream Seed</span>
          </div>
          <p className="text-sm font-display italic text-foreground leading-relaxed">{dreamSeed}</p>
        </div>
      </motion.div>

      <GetTaskButton delay={0.25} />

      {/* Gratitude Log */}
      <motion.div
        className="glass-card rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold">Three Gratitudes</span>
        </div>
        {gratitudeSaved ? (
          <motion.div
            className="flex items-center justify-center gap-2 py-4 text-primary"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <Check className="w-5 h-5" />
            <span className="font-display text-sm">Saved 🙏</span>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {gratitudes.map((g, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-display w-4 shrink-0">{i + 1}.</span>
                <input
                  value={g}
                  onChange={(e) => updateGratitude(i, e.target.value)}
                  placeholder={i === 0 ? "Something that made you smile..." : i === 1 ? "A person you appreciate..." : "A small blessing..."}
                  className="flex-1 bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none border-b border-border pb-1 focus:border-primary/30 transition-colors"
                />
              </div>
            ))}
            <AnimatePresence>
              {gratitudes.some(g => g.trim()) && (
                <motion.button
                  onClick={saveGratitudes}
                  className="flex items-center gap-1.5 text-xs font-display font-medium text-primary-foreground bg-gradient-sunrise px-5 py-2 rounded-full mx-auto mt-2"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className="w-3 h-3" />
                  Save Gratitudes
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* ═══ Night Suggestions — Journal & Guide ═══ */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="flex items-center gap-2 px-1">
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold">Before You Sleep</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((s, i) => (
            <motion.button
              key={`${s.type}-${s.guideMode || s.title}`}
              onClick={() => handleSuggestionClick(s)}
              className="glass-card rounded-xl p-4 text-left hover:bg-primary/5 transition-all group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-sm">
                  {s.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-display font-semibold text-foreground">{s.title}</span>
                    <span className="text-[9px] font-display text-muted-foreground uppercase">
                      {s.type === "guide" ? "Guide" : "Journal"}
                    </span>
                  </div>
                  <p className="text-[11px] font-body text-muted-foreground leading-snug">{s.subtitle}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors mt-1 shrink-0" />
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Tomorrow Preview */}
      <motion.div
        className="text-center py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
      >
        <p className="text-xs text-muted-foreground font-display italic">
          Tomorrow holds something interesting. Stay curious. ✨
        </p>
      </motion.div>
    </div>
  );
}
