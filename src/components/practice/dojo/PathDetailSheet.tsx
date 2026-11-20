/**
 * PathDetailSheet — When user taps a matrix cell, show the practice's level ladder.
 * Tapping a level row expands an inline "How to develop this" card with practical
 * micro-steps before launching the full session.
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/design-system";
import { Button } from "@/design-system";
import { getPracticeById, getMaxLevel, type PracticeId } from "@/types/practices";
import { Check, Play, Lock, ChevronDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  practiceId: PracticeId | null;
  currentLevel: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPracticeNow: (id: PracticeId) => void;
}

/** Build a 4-step "how to develop" guidance from the level's name + description. */
function buildHowTo(levelName: string, description: string): {
  intro: string;
  steps: string[];
  reflect: string;
} {
  const lower = levelName.toLowerCase();
  // Light keyword routing → flavoured steps
  if (lower.includes("selfless") || lower.includes("karma") || lower.includes("service")) {
    return {
      intro: `Develop ${levelName} by acting today without measuring what you'll get back.`,
      steps: [
        "Pick one small task today and do it as an offering — no audience, no credit.",
        "Notice the urge to be thanked. Let it pass through without grasping.",
        "Repeat with one harder task this week (something inconvenient to you).",
        "End each day naming one act done freely. That's the seed.",
      ],
      reflect: "Where did 'I' want recognition today? That's the exact edge to soften.",
    };
  }
  if (lower.includes("observ") || lower.includes("witness") || lower.includes("watch")) {
    return {
      intro: `Develop ${levelName} by becoming the seer, not the seen.`,
      steps: [
        "Sit for 3 minutes. Pick one sense (sound, breath, touch) and stay with it.",
        "When a thought arises, label it 'thinking' and return — don't argue with it.",
        "Practice for a full minute with eyes open in daily life (queue, walking).",
        "End by asking: who was watching? Don't answer — just feel the question.",
      ],
      reflect: description,
    };
  }
  if (lower.includes("breath") || lower.includes("prana")) {
    return {
      intro: `Develop ${levelName} by letting breath teach you.`,
      steps: [
        "Sit upright. Don't change the breath — just feel it for 10 cycles.",
        "Notice the pause at the top and bottom. That gap is the practice.",
        "Extend exhale by 1 count. Hold the rhythm for 2 minutes.",
        "Return to natural breath. Notice what shifted in body and mind.",
      ],
      reflect: description,
    };
  }
  if (lower.includes("inquiry") || lower.includes("who") || lower.includes("neti")) {
    return {
      intro: `Develop ${levelName} by holding the question, not chasing the answer.`,
      steps: [
        "Sit quietly. Ask the question once, slowly, with full attention.",
        "Don't think — feel for the response in the body, not the head.",
        "When the mind tries to answer, let it pass. Ask again.",
        "End in silence for 30 seconds. The silence is the teacher.",
      ],
      reflect: description,
    };
  }
  if (lower.includes("body") || lower.includes("scan") || lower.includes("somatic")) {
    return {
      intro: `Develop ${levelName} by listening to what the body already knows.`,
      steps: [
        "Lie or sit. Move attention slowly from feet → crown over 5 minutes.",
        "Don't fix anything. Just feel temperature, weight, tingling, space.",
        "Pause at any tight area. Breathe into it without forcing release.",
        "End by feeling the whole body as one field of sensation.",
      ],
      reflect: description,
    };
  }
  if (lower.includes("bhakti") || lower.includes("devot") || lower.includes("surrender") || lower.includes("gratitude")) {
    return {
      intro: `Develop ${levelName} by softening the heart, not training the mind.`,
      steps: [
        "Bring to mind something or someone you love. Let the feeling fill the chest.",
        "Stay with the warmth for 2 minutes — don't analyse it.",
        "Whisper a single word of thanks. Mean it.",
        "Carry that warmth into the next thing you do today.",
      ],
      reflect: description,
    };
  }
  // Generic, still meaningful
  return {
    intro: `Develop ${levelName} through small, repeated practice — not intensity.`,
    steps: [
      `Set 3 minutes today. Just sit with the intention: "${levelName}".`,
      `Hold this in mind: ${description}.`,
      "Notice resistance, boredom, or wandering — that's the practice working.",
      "End by naming one moment you can apply this in the next hour.",
    ],
    reflect: description,
  };
}

export default function PathDetailSheet({
  practiceId,
  currentLevel,
  open,
  onOpenChange,
  onPracticeNow,
}: Props) {
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);

  if (!practiceId) return null;
  const practice = getPracticeById(practiceId);
  if (!practice) return null;
  const max = getMaxLevel(practiceId);

   return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setExpandedLevel(null); }}>
      <DialogContent
        className="rounded-3xl border border-border/30 bg-background max-h-[85vh] overflow-y-auto max-w-2xl w-[95vw]"
      >
        <DialogHeader className="text-left">
          <div className="flex items-center gap-3">
            <div className="text-4xl leading-none">{practice.icon}</div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="font-display text-2xl tracking-tight">
                {practice.label}
              </DialogTitle>
              <p className="text-xs font-display tracking-[0.18em] uppercase text-primary/70 mt-1">
                {practice.layer} · L{currentLevel} of {max}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Level ladder */}
        <ol className="mt-6 space-y-2">
          {practice.levels.map((lv) => {
            const done = lv.level <= currentLevel;
            const next = lv.level === currentLevel + 1;
            const locked = lv.level > currentLevel + 1;
            const isOpen = expandedLevel === lv.level;
            const howTo = isOpen ? buildHowTo(lv.name, lv.description) : null;

            return (
              <li
                key={lv.level}
                className={[
                  "rounded-2xl border transition-colors overflow-hidden",
                  next
                    ? "border-primary/50 bg-primary/5"
                    : done
                      ? "border-border/20 bg-card/40"
                      : "border-border/15 bg-transparent",
                  isOpen ? "ring-1 ring-primary/30" : "",
                ].join(" ")}
              >
                <button
                  type="button"
                  onClick={() => setExpandedLevel(isOpen ? null : lv.level)}
                  className="w-full text-left p-4 flex items-start gap-3 hover:bg-card/40 transition-colors"
                >
                  <div
                    className={[
                      "mt-0.5 h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-display",
                      done
                        ? "bg-primary text-primary-foreground"
                        : next
                          ? "border-2 border-primary text-primary"
                          : "border border-border/40 text-muted-foreground",
                    ].join(" ")}
                  >
                    {done ? <Check className="w-3 h-3" /> : locked ? <Lock className="w-3 h-3" /> : `L${lv.level}`}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display text-sm text-foreground leading-tight">
                      {lv.name}
                    </h4>
                    <p className="text-xs font-body text-muted-foreground mt-1 leading-relaxed">
                      {lv.description}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 mt-1 text-muted-foreground/60 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && howTo && (
                    <motion.div
                      key="howto"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="border-t border-border/30"
                    >
                      <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 space-y-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                          <p className="text-[10px] font-display tracking-[0.25em] uppercase text-primary">
                            How to develop this
                          </p>
                        </div>
                        <p className="text-xs font-body text-foreground/90 leading-relaxed">
                          {howTo.intro}
                        </p>
                        <ol className="space-y-1.5 list-none">
                          {howTo.steps.map((s, i) => (
                            <li key={i} className="flex gap-2 text-xs text-foreground/80 leading-relaxed">
                              <span className="font-display text-primary/70 shrink-0">{i + 1}.</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ol>
                        <p className="text-[11px] italic text-muted-foreground border-l-2 border-primary/30 pl-2">
                          {howTo.reflect}
                        </p>
                        {!locked && (
                          <Button
                            onClick={(e) => { e.stopPropagation(); onPracticeNow(practiceId); }}
                            size="sm"
                            className="w-full h-9 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground font-display tracking-[0.18em] uppercase text-[10px]"
                          >
                            <Play className="w-3 h-3 mr-1.5" />
                            Begin guided practice
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ol>

        {practice.activationCondition && (
          <p className="mt-4 text-[11px] font-body text-muted-foreground/70 italic">
            Unlock condition: {practice.activationCondition}
          </p>
        )}

        <Button
          onClick={() => onPracticeNow(practiceId)}
          className="mt-6 w-full h-12 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-display tracking-[0.2em] uppercase text-xs"
        >
          <Play className="w-4 h-4 mr-2" />
          Practice now
        </Button>
        </DialogContent>
      </Dialog>
    );
}
