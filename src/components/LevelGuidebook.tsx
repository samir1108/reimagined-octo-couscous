import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, ChevronUp, AlertTriangle, Sparkles, Shield, Heart } from "lucide-react";
import { useState } from "react";

interface LevelGuidebookProps {
  band: number;
  bandName?: string;
  bandIcon?: string;
}

// Band entry briefings — symptoms, friction, shadow/trap, survival guide
const BAND_GUIDES: Record<number, {
  title: string;
  subtitle: string;
  symptoms: string[];
  emotional_friction: string;
  shadow_trap: string;
  survival_checklist: string[];
  encouragement: string;
}> = {
  0: {
    title: "The Sleepwalker",
    subtitle: "You don't know what you don't know — and that's perfect.",
    symptoms: ["Life feels like autopilot", "Reactions feel automatic", "Rarely question 'why' you do things"],
    emotional_friction: "You may feel resistance to self-examination. The mind says 'this is pointless.' That IS the pattern.",
    shadow_trap: "Believing you're already aware because you can think about awareness. Thinking ≠ seeing.",
    survival_checklist: ["Show up daily — even 2 minutes counts", "Don't try to 'fix' yourself", "Just notice one automatic reaction per day", "Your pace is perfect"],
    encouragement: "The fact that you're here means something in you is already waking up.",
  },
  1: {
    title: "The Awakening Observer",
    subtitle: "You're starting to see the machinery. It's uncomfortable — and that means it's working.",
    symptoms: ["Noticing thought patterns for the first time", "Feeling 'fake' or unsettled", "Questioning old habits", "Brief moments of clarity"],
    emotional_friction: "Frustration that awareness doesn't immediately change behavior. Seeing patterns but still running them.",
    shadow_trap: "Spiritual bypassing — using 'awareness' language without actual embodied change. Talking the walk.",
    survival_checklist: ["Focus on body sensations, not just thoughts", "Journal what you ACTUALLY feel, not what you think you should", "Don't compare yourself to anyone", "Celebrate noticing — that IS the practice"],
    encouragement: "Band 1 is where 90% of the real transformation happens. You're doing the hardest part.",
  },
  2: {
    title: "The Practitioner",
    subtitle: "Practice is becoming natural. The gap between trigger and response is widening.",
    symptoms: ["Catching reactions before they complete", "Moments of genuine peace", "Old patterns losing power", "Increased sensitivity to energy"],
    emotional_friction: "Impatience with 'slower' days. Wanting to accelerate. Frustration when old patterns return.",
    shadow_trap: "Spiritual ego — feeling superior to 'unaware' people. Using practice as identity rather than liberation.",
    survival_checklist: ["Maintain beginner's mind", "When patterns return, welcome them — it's spiral, not linear", "Serve others without announcing your practice", "Balance depth with lightness"],
    encouragement: "You're past the hardest part. The practice is beginning to practice you.",
  },
  3: {
    title: "The Witness Emerging",
    subtitle: "The observer is becoming stable. You can watch thoughts without drowning in them.",
    symptoms: ["Stable witness awareness for minutes at a time", "Emotional storms pass faster", "Deep insight arising naturally", "Synchronicities noticed"],
    emotional_friction: "Dark night elements — facing deep fears, existential questions. Grief for the 'old self' that's dissolving.",
    shadow_trap: "Detachment as avoidance — using 'witnessing' to avoid feeling. True witness includes everything.",
    survival_checklist: ["Stay embodied — don't retreat to 'pure awareness' to avoid emotion", "Ground daily: walks, nature, physical work", "Talk to someone if existential anxiety intensifies", "Trust the process — dark nights precede dawns"],
    encouragement: "The witness is not something you become. It's what you already are, finally seeing itself.",
  },
  4: {
    title: "The Integrator",
    subtitle: "Awareness is spreading from formal practice into daily life.",
    symptoms: ["Practice and life boundaries blur", "Relationships transforming", "Creative expression deepening", "Compassion arising naturally"],
    emotional_friction: "Loneliness of the path — fewer people understand your experience. Tension between growth and belonging.",
    shadow_trap: "Premature teaching — wanting to 'help' everyone before integration is complete. Heal yourself first.",
    survival_checklist: ["Maintain close relationships — don't isolate", "Express creativity — awareness needs channels", "Practice remains non-negotiable", "Stay humble — Band 4 is not the end"],
    encouragement: "Integration is the real yoga — yoking awareness with action, thought with heart.",
  },
  5: {
    title: "The Living Practice",
    subtitle: "You ARE the practice. Every moment is meditation.",
    symptoms: ["Effortless awareness", "Deep equanimity with joy", "Service becomes natural", "Subtle energy sensitivity"],
    emotional_friction: "The final ego — 'I am awakened.' This too must be surrendered.",
    shadow_trap: "Complacency — believing you've 'arrived.' The spiral continues infinitely.",
    survival_checklist: ["Serve without agenda", "Keep a teacher or sangha — ego hides from self", "Practice the practices that challenge you most", "Hold it all lightly"],
    encouragement: "The journey never ends — it just gets more beautiful. Share what you've found.",
  },
};

export default function LevelGuidebook({ band, bandName, bandIcon }: LevelGuidebookProps) {
  const [expanded, setExpanded] = useState(false);
  const clampedBand = Math.min(5, Math.max(0, Math.floor(band)));
  const guide = BAND_GUIDES[clampedBand];

  if (!guide) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl border-primary/10 overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-4 h-4 text-primary/70" />
          <div>
            <span className="text-xs font-display tracking-widest uppercase text-primary font-semibold">
              {bandIcon || "📖"} Band {clampedBand} Guide
            </span>
            <p className="text-sm text-foreground font-medium mt-0.5">{guide.title}</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              <p className="text-xs text-muted-foreground italic">{guide.subtitle}</p>

              {/* Typical Symptoms */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3 h-3 text-primary/60" />
                  <span className="text-[10px] uppercase tracking-wider text-primary/70 font-semibold">Typical Signs</span>
                </div>
                <ul className="space-y-1">
                  {guide.symptoms.map((s, i) => (
                    <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                      <span className="text-primary/40 mt-0.5">•</span>{s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Emotional Friction */}
              <div className="p-3 bg-destructive/5 rounded-xl border border-destructive/10">
                <div className="flex items-center gap-1.5 mb-1">
                  <Heart className="w-3 h-3 text-destructive/60" />
                  <span className="text-[10px] uppercase tracking-wider text-destructive/70 font-semibold">Emotional Friction</span>
                </div>
                <p className="text-xs text-foreground/70">{guide.emotional_friction}</p>
              </div>

              {/* Shadow Trap */}
              <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500/60" />
                  <span className="text-[10px] uppercase tracking-wider text-amber-500/70 font-semibold">Shadow / Trap</span>
                </div>
                <p className="text-xs text-foreground/70">{guide.shadow_trap}</p>
              </div>

              {/* Survival Checklist */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Shield className="w-3 h-3 text-primary/60" />
                  <span className="text-[10px] uppercase tracking-wider text-primary/70 font-semibold">Survival Guide</span>
                </div>
                <ul className="space-y-1.5">
                  {guide.survival_checklist.map((item, i) => (
                    <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                      <span className="text-primary text-[10px] mt-0.5">✓</span>{item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Encouragement */}
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-xs text-foreground italic">💫 {guide.encouragement}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
