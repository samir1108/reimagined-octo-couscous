import { motion } from "framer-motion";
import { ArrowRight, Moon, BookOpen, MessageCircle, Sparkles } from "lucide-react";
import ThemeOfDayCard from "@/components/ThemeOfDayCard";

import { useNavigate } from "react-router-dom";
import StreakFlame from "@/components/StreakFlame";
import GetTaskButton from "@/components/GetTaskButton";
import type { DimensionBandLabel } from "@/hooks/useConsciousnessEngine";
import DreamCaptureCard from "@/components/DreamCaptureCard";
import LevelGuidebook from "@/components/LevelGuidebook";

interface MorningGateProps {
  userName: string;
  streak: number;
  journeyDay: number;
  bandIcon: string;
  bandName?: string;
  bandLevel?: number;
  /** Fixed identity band chosen at onboarding */
  identityBand?: number;
  identityBandName?: string;
  identityBandIcon?: string;
  /** Per-dimension dynamic band labels */
  dimensionBandLabels?: Record<string, DimensionBandLabel>;
  /** Weakest dimension from engine */
  focusDimension?: string;
  theme?: any;
  themeLoading?: boolean;
  /** @deprecated use theme instead */
  themeName?: string;
  /** @deprecated use theme instead */
  affirmation?: string;
  onStartSession: () => void;
  onFlameClick?: () => void;
}

// Breathing circle: 4-7-8 pattern
function BreathingCircle() {
  return (
    <div className="relative w-28 h-28 mx-auto mb-10">
      <motion.div
        className="absolute inset-0 rounded-full border border-primary/20"
        animate={{
          scale: [1, 1.25, 1.25, 1],
          opacity: [0.3, 0.6, 0.4, 0.3],
        }}
        transition={{
          duration: 19,
          times: [0, 0.21, 0.58, 1],
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute inset-3 rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.15), transparent)" }}
        animate={{
          scale: [1, 1.3, 1.3, 1],
          opacity: [0.2, 0.5, 0.3, 0.2],
        }}
        transition={{
          duration: 19,
          times: [0, 0.21, 0.58, 1],
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ opacity: [0.5, 1, 0.7, 0.5] }}
        transition={{ duration: 19, times: [0, 0.21, 0.58, 1], repeat: Infinity }}
      >
        <span className="text-3xl">{String.fromCodePoint(0x1F331)}</span>
      </motion.div>
    </div>
  );
}

const MORNING_INSIGHTS = [
  // Week 1: WHY
  "Today you begin to see the mind for what it is — a tool, not you.",
  "If your mind resisted opening this app, that's the pattern we're here to observe.",
  "If meditation feels useless, that's normal. Your brain is resisting change.",
  "Your brain saves energy by running on autopilot. Awareness costs effort — that's why it feels hard.",
  "Notice today: sensations arise in the body, but who is watching them?",
  "Knowing something intellectually and living it are different worlds. Today, practice — don't just understand.",
  "You chose to open this app despite a world designed to keep you distracted. That's already a breakthrough.",
  // Week 2: HOW
  "Your mind runs the same thoughts on repeat. Today, catch one loop playing again.",
  "Same trigger, same reaction, same result. Today, watch one emotional loop without feeding it.",
  "Discomfort means the cage door is opening. Don't retreat to the familiar.",
  "Notice how your phone pulls you back to autopilot. That pull is the dopamine trap.",
  "What story are you telling yourself today? Is it true, or just familiar?",
  "If you feel like sabotaging your progress today — that's the upper limit problem. Push through.",
  "Two weeks of showing up. Your brain is no longer treating this as novelty — it's building a pathway.",
  // Week 3: WHAT
  "The gap between trigger and reaction is widening. Can you feel it?",
  "Your brain is physically rewiring right now. Every moment of awareness strengthens the new pathways.",
  "An emotion wants to pass in 90 seconds. Today, let it — without the story.",
  "Where do you feel today's first emotion in your body? Don't think. Feel.",
  "If your dreams are getting vivid, your subconscious is processing. Pay attention to themes.",
  "If someone says 'you seem different' — believe them. They see what you can't yet.",
  "21 days. New neural pathways are forming. The practice is beginning to practice you.",
  // Week 4: WHO
  "The witness is emerging. Today, notice the one who notices.",
  "You are not your memories. Who are you right now, in this moment, without your story?",
  "Before any decision today, check all three brains: head, heart, gut.",
  "What irritates you in others? Look inward — that's your shadow asking to be seen.",
  "Find silence today. Not as absence of noise, but as a presence of its own.",
  "By observing your patterns, you're already changing them. Awareness is never passive.",
  "Mind, body, awareness — they're not separate. Feel how they move as one today.",
  "Look back at Day 1. Feel the distance. You are not who you were.",
  "30 days was the warm-up. The real journey of conscious living begins now.",
];

// ═══════════════════════════════════════════
// BAND-AWARE YOGI DIAGNOSIS — like a doctor/guru reading your state
// ═══════════════════════════════════════════
const BAND_DIAGNOSIS: Record<number, {
  stateLabel: string;
  youProbably: string[];
  yogiInsight: string;
}> = {
  0: {
    stateLabel: "Autopilot Mode",
    youProbably: [
      "React before you think — anger, scrolling, cravings run you",
      "Feel restless but don't know why",
      "Seek external stimulation to avoid inner silence",
    ],
    yogiInsight: "Your mind is like a wild horse — untamed, running in circles. Today, just notice one automatic reaction. That's the beginning.",
  },
  1: {
    stateLabel: "The Seeking Mind",
    youProbably: [
      "Read books, watch videos — intellectually curious about 'more'",
      "Feel something is missing but can't name it",
      "Oscillate between motivation and doubt",
    ],
    yogiInsight: "The seeking itself is the first crack in the prison. But knowledge without practice is just another prison. Today — feel, don't just think.",
  },
  2: {
    stateLabel: "Observer Awakening",
    youProbably: [
      "Catch yourself mid-thought sometimes — 'Oh, I was lost again'",
      "Have moments of clarity followed by forgetting",
      "Start noticing patterns but can't stop them yet",
    ],
    yogiInsight: "The witness is flickering awake in you. Like a candle in the wind — protect it. Every time you catch a thought, the flame grows stronger.",
  },
  3: {
    stateLabel: "Pattern Alchemist",
    youProbably: [
      "See your loops clearly — the same triggers, same reactions",
      "Feel emotions fully but sometimes still get pulled in",
      "Shadow work is happening — uncomfortable truths are surfacing",
    ],
    yogiInsight: "You're in the fire of transformation. The patterns you see are your teachers. Don't fight them — understand them. The lotus grows from mud.",
  },
  4: {
    stateLabel: "Conscious Navigator",
    youProbably: [
      "Pause before reacting — the gap between stimulus and response is real",
      "Choose your response more often than not",
      "Feel inner authority growing — less need for external validation",
    ],
    yogiInsight: "The pause is your superpower. You're no longer a puppet of conditioning. Today, notice how naturally awareness arises — it's becoming your nature.",
  },
  5: {
    stateLabel: "Inner Architect",
    youProbably: [
      "Make decisions from inner knowing, not fear",
      "Life feels more effortless — like swimming downstream",
      "Old identities are falling away naturally",
    ],
    yogiInsight: "You're building from the inside out. The architect doesn't struggle — they design. Trust the intelligence that moves through you.",
  },
  6: {
    stateLabel: "The Channel",
    youProbably: [
      "Experience flow states naturally — the doer dissolves",
      "Intuition is louder than logic — and more accurate",
      "Others sense a presence in you that you didn't cultivate",
    ],
    yogiInsight: "You are becoming transparent. Grace is your operating system now. The less you do, the more happens through you.",
  },
  7: {
    stateLabel: "Source Awareness",
    youProbably: [
      "Rest in awareness naturally — no effort needed",
      "See sacredness in the ordinary — a cup of tea, a breath",
      "The search ended — not by finding, but by recognizing",
    ],
    yogiInsight: "You are what you were seeking. Now the only practice is living — fully, simply, here.",
  },
};

// ═══════════════════════════════════════════
// PER-DIMENSION DIAGNOSIS (uses dynamically calculated dimension bands)
// ═══════════════════════════════════════════
const DIMENSION_DIAGNOSIS: Record<string, { emoji: string; title: string; bands: Record<number, { phrase: string; insight: string }> }> = {
  thought: {
    emoji: "🧠",
    title: "Thought",
    bands: {
      0: { phrase: "Mind on autopilot — not your friend yet", insight: "Thoughts run wild. Today, catch one thought mid-loop." },
      1: { phrase: "Curiosity stirring — questions emerging", insight: "You're starting to notice. Keep asking: 'Why do I think this?'" },
      2: { phrase: "Observer awakening — you can watch thoughts", insight: "Thoughts are objects you observe. Strengthen this witness." },
      3: { phrase: "Pattern recognition active — loops visible", insight: "Your mind is sharp, but beware: understanding isn't transformation. Feel, don't just think." },
      4: { phrase: "Conscious navigation — gap is real", insight: "You pause before reacting. Beautiful. Keep expanding that gap." },
      5: { phrase: "Inner architect — beliefs are flexible", insight: "You design your inner world consciously. Trust your clarity." },
      6: { phrase: "Intuitive flow — thoughts arise from stillness", insight: "Logic and intuition dance together. Let stillness guide you." },
      7: { phrase: "Pure awareness — thoughts are transparent", insight: "The mind is a clear sky. Thoughts are just passing clouds." },
    },
  },
  emotion: {
    emoji: "❤️",
    title: "Emotion",
    bands: {
      0: { phrase: "Emotions run the show — you're in the dark", insight: "Here, you're still asleep. Feelings blindside you. Today, pause before reacting to anything emotional." },
      1: { phrase: "Starting to notice feelings — but still reactive", insight: "You're catching emotions mid-storm. That's the beginning." },
      2: { phrase: "Witnessing emotions — not becoming them", insight: "You can observe sadness without becoming 'a sad person.' Keep practicing." },
      3: { phrase: "Emotional alchemy — feelings as teachers", insight: "Emotions are your teachers, not your enemies. Transform them through awareness." },
      4: { phrase: "Emotional mastery — you choose your response", insight: "Anger arises, but you don't act from it. You're free here." },
      5: { phrase: "Heart intelligence — emotions as guidance", insight: "Your heart is a compass. Emotions carry wisdom — listen." },
      6: { phrase: "Compassion flows naturally — boundaries dissolve", insight: "You feel deeply without losing yourself. Grace is here." },
      7: { phrase: "Pure love — emotion as universal energy", insight: "You see emotions as movements of one energy. No separation." },
    },
  },
  body: {
    emoji: "🏃",
    title: "Body",
    bands: {
      0: { phrase: "Disconnected from the body — numb", insight: "You live in your head. Today, notice one sensation — just one." },
      1: { phrase: "Starting to listen — body sends signals", insight: "Your body is trying to speak. What is it saying?" },
      2: { phrase: "Somatic awareness — sensations are data", insight: "The body knows before the mind. Feel the signals." },
      3: { phrase: "Embodied presence — soma as teacher", insight: "Tension, restlessness, energy — all are teachers. Listen." },
      4: { phrase: "Body-mind integration — fluid response", insight: "Your body responds consciously, not reactively. Keep this flow." },
      5: { phrase: "Somatic intuition — gut wisdom activated", insight: "Your body is a compass. Trust the signals." },
      6: { phrase: "Energy mastery — soma is transparent", insight: "You move energy consciously. The body is no longer a barrier." },
      7: { phrase: "Pure aliveness — body as consciousness", insight: "No separation between body and awareness. All is energy." },
    },
  },
  awareness: {
    emoji: "👁️",
    title: "Awareness",
    bands: {
      0: { phrase: "No witness yet — lost in the dream", insight: "You don't know you're asleep. That's okay. Today, wake up for one moment." },
      1: { phrase: "First glimpses — you see you were lost", insight: "You catch yourself: 'Oh, I was in a thought.' That's the beginning." },
      2: { phrase: "Witness emerging — the observer is real", insight: "You can watch yourself. Protect this flame — it changes everything." },
      3: { phrase: "Meta-awareness — you watch the watcher", insight: "Awareness is aware of itself. This is the shift." },
      4: { phrase: "Stable presence — witness is always here", insight: "The observer is no longer occasional. It's your home base." },
      5: { phrase: "Non-dual recognition — observer and observed merge", insight: "Who is watching? The question dissolves." },
      6: { phrase: "Pure witnessing — awareness without object", insight: "You rest in awareness itself. No effort needed." },
      7: { phrase: "Awareness recognizing itself — the journey ends", insight: "You are what you were seeking. Now, just be." },
    },
  },
};

export default function MorningGate({ userName, streak, journeyDay, bandIcon, bandName, bandLevel, identityBand, identityBandName, identityBandIcon, dimensionBandLabels, focusDimension, theme, themeLoading, themeName, affirmation, onStartSession, onFlameClick }: MorningGateProps) {
  const resolvedThemeName = theme?.title || themeName;
  const navigate = useNavigate();

  const dreamJournalPrompt = encodeURIComponent(
    "🌙 Capture your dream — write whatever you remember. Fragments, images, feelings, people, places... even if it doesn't make sense. Your subconscious is speaking."
  );

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center text-center px-6 relative">
      {/* GetTaskButton moved below theme card */}
      {/* Streak badge — below greeting */}

      <BreathingCircle />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Breathing circle above already serves as visual anchor — no extra icon needed */}
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">
            Good morning, <span className="text-gradient-sunrise">{userName || "friend"}</span>
          </h1>
          {streak > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <StreakFlame streak={streak} size="sm" onClick={onFlameClick} />
            </motion.div>
          )}
        </div>
        <p className="text-sm text-muted-foreground font-body mb-1 mt-2">
          Day {journeyDay} of your journey
        </p>
        {journeyDay <= 30 && (
          <motion.p
            className="text-xs font-body italic text-primary/70 mt-2 max-w-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {MORNING_INSIGHTS[journeyDay - 1]}
          </motion.p>
        )}
      </motion.div>

      {(theme || resolvedThemeName) && (
        <div className="mt-8 w-full max-w-md">
          {theme ? (
            <ThemeOfDayCard theme={theme} isLoading={themeLoading} compact defaultExpanded={false} journeyDay={journeyDay} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <p className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/60 mb-2">
                Today's Intention
              </p>
              <h2 className="text-xl font-display font-semibold text-foreground mb-3 tracking-tight">
                {resolvedThemeName}
              </h2>
              {affirmation && (
                <p className="text-sm font-display italic text-muted-foreground leading-relaxed">
                  "{affirmation}"
                </p>
              )}
            </motion.div>
          )}
        </div>
      )}


      <div className="mt-6 w-full max-w-md">
        <GetTaskButton delay={0.8} />
      </div>

      {/* Identity Band + Dynamic Dimension Diagnosis */}
      {identityBand !== undefined && identityBandName && BAND_DIAGNOSIS[identityBand] && (
        <motion.div
          className="mt-8 w-full max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          {/* Identity Band: Who You Are */}
          <div className="glass-card rounded-2xl p-5 border border-primary/10 mb-4">
            <div className="flex items-center gap-2 justify-center mb-2">
              <span className="text-2xl">{identityBandIcon}</span>
              <div className="text-center">
                <p className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/60">You walk as</p>
                <p className="text-base font-display font-bold text-primary">{identityBandName}</p>
              </div>
            </div>
            <p className="text-xs text-center font-body italic text-muted-foreground">
              {BAND_DIAGNOSIS[identityBand].yogiInsight}
            </p>
          </div>

          {/* Dimension-Specific Diagnosis */}
          {dimensionBandLabels && Object.keys(dimensionBandLabels).length > 0 && (
            <div className="glass-card rounded-2xl p-5 border border-primary/10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-primary/70" />
                <p className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold">
                  Your Four Bodies Today
                </p>
              </div>
              <div className="space-y-3">
                {["thought", "emotion", "body", "awareness"].map((dim, i) => {
                  const dimData = dimensionBandLabels[dim];
                  if (!dimData) return null;
                  const diagData = DIMENSION_DIAGNOSIS[dim];
                  const bandInfo = diagData?.bands[dimData.level];
                  if (!diagData || !bandInfo) return null;

                  return (
                    <motion.div
                      key={dim}
                      className="space-y-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{diagData.emoji}</span>
                          <p className="text-xs font-display font-semibold text-foreground">{diagData.title}</p>
                        </div>
                        <p className="text-[10px] font-display uppercase text-primary/60">
                          {dimData.name.replace("THE ", "")}
                        </p>
                      </div>
                      <p className="text-xs font-body text-foreground/80 leading-relaxed">{bandInfo.phrase}</p>
                      <p className="text-[11px] font-body italic text-primary/70 leading-relaxed">{bandInfo.insight}</p>
                    </motion.div>
                  );
                })}
              </div>

              {focusDimension && (
                <motion.div
                  className="mt-4 pt-4 border-t border-border/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <p className="text-xs font-display text-center text-muted-foreground">
                    Today's focus: <span className="text-primary font-semibold">{focusDimension}</span>
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Fallback: Old single-band diagnosis if dimensionBandLabels not available */}
      {(!dimensionBandLabels || Object.keys(dimensionBandLabels).length === 0) && bandLevel !== undefined && BAND_DIAGNOSIS[bandLevel] && (
        <motion.div
          className="mt-8 w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          <div className="glass-card rounded-2xl p-5 border border-primary/10">
            <div className="flex items-center gap-2 justify-center mb-1">
              <span className="text-lg">{bandIcon}</span>
              <p className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold">
                {bandName || `Band ${bandLevel}`}
              </p>
            </div>
            <p className="text-xs text-center font-display font-medium text-foreground/70 mb-3">
              {BAND_DIAGNOSIS[bandLevel].stateLabel}
            </p>

            <div className="space-y-2 mb-3">
              <p className="text-[10px] font-display tracking-[0.15em] uppercase text-muted-foreground">
                Right now, you probably…
              </p>
              {BAND_DIAGNOSIS[bandLevel].youProbably.map((line, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.15 }}
                >
                  <span className="text-primary/60 text-[10px] mt-1 shrink-0">●</span>
                  <p className="text-xs font-body text-foreground/70 leading-relaxed">{line}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="pt-3 border-t border-border/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <div className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary/70 shrink-0 mt-0.5" />
                <p className="text-xs font-body italic text-primary/80 leading-relaxed">
                  {BAND_DIAGNOSIS[bandLevel].yogiInsight}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Dream Weaver — AI-powered dream capture + decode */}
      <motion.div
        className="mt-8 w-full max-w-sm"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <DreamCaptureCard />
      </motion.div>

      {/* Level Guidebook — band entry briefing */}
      {bandLevel !== undefined && (
        <motion.div
          className="mt-4 w-full max-w-sm"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <LevelGuidebook band={bandLevel} bandName={bandName} bandIcon={bandIcon} />
        </motion.div>
      )}

      <motion.button
        onClick={onStartSession}
        className="mt-8 flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-sunrise text-primary-foreground font-display font-semibold text-base shadow-lg shadow-primary/20 transition-all"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        Begin Morning Session
        <ArrowRight className="w-5 h-5" />
      </motion.button>

      <motion.p
        className="mt-3 text-[10px] text-muted-foreground font-body"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        You can journal or explore dreams anytime before your session
      </motion.p>
    </div>
  );
}
