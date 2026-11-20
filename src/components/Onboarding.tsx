import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useUpdateAssessment } from "@/hooks/useConsciousnessEngine";
import { useAssessStartingLevels } from "@/hooks/usePracticeMatrix";
import elderImg from "@/assets/masters/the-elder.png";
import cosmicNebula from "@/assets/cosmic-nebula.jpg";
import cosmicInitiation from "@/assets/cosmic-initiation.jpg";
import cosmicWelcome from "@/assets/cosmic-welcome.jpg";
import cosmicJourneyMap from "@/assets/cosmic-journey-map.jpg";
import GoalsScreen, { type GoalsScreenValue } from "@/components/onboarding/GoalsScreen";
import DailyRoutineNarrative from "@/components/onboarding/DailyRoutineNarrative";
import LoopSwipeScreen from "@/components/onboarding/LoopSwipeScreen";
import PhilosophyPrologue from "@/components/onboarding/PhilosophyPrologue";
import FoundationOnboarding, { type FoundationResult } from "@/components/onboarding/foundation/FoundationOnboarding";
import WhySatYugScreen from "@/components/onboarding/WhySatYugScreen";
import ConditioningSwipe from "@/components/onboarding/ConditioningSwipe";
import type { ConditioningResult } from "@/lib/onboarding/conditioningQuestions";
import { toPathfinderAnswers } from "@/lib/onboarding/foundationAnalyzer";
import { useUserGoals } from "@/hooks/useUserGoals";

interface OnboardingProps {
  userId: string;
  onComplete: () => void;
}

// ═══════════════════════════════════════════
// PATHFINDER QUESTIONS (Blueprint Section 2)
// ═══════════════════════════════════════════

interface PathfinderOption {
  label: string;
  band: number;
  dimension?: string;
}

interface PathfinderQuestion {
  id: string;
  elderAsk: string;
  subtitle: string;
  options: PathfinderOption[];
  dimension: string;
}

const PATHFINDER_QUESTIONS: PathfinderQuestion[] = [
  {
    id: "reaction",
    elderAsk: "Imagine someone close to you lies to you and gets caught.",
    subtitle: "What is your first reaction?",
    dimension: "thought",
    options: [
      { label: "I will get angry. I will confront them.", band: 0 },
      { label: "I will feel sad, but I will ask why they did it.", band: 1 },
      { label: "I will see what was triggered inside me.", band: 2 },
    ],
  },
  {
    id: "thought",
    elderAsk: "When you are alone and want to calm the mind…",
    subtitle: "What happens?",
    dimension: "thought",
    options: [
      { label: "Thoughts increase even more. Control becomes difficult.", band: 1 },
      { label: "I can watch them, but sometimes I get stuck.", band: 3 },
      { label: "Thoughts come and go. I remain still.", band: 4 },
    ],
  },
  {
    id: "happiness",
    elderAsk: "Where do you find the most happiness in life?",
    subtitle: "Be honest — there is no wrong answer.",
    dimension: "awareness",
    options: [
      { label: "When things go according to my wish.", band: 2 },
      { label: "When I dive into work without worrying about the result.", band: 5 },
      { label: "Just in being. No need to do anything.", band: 7 },
    ],
  },
  {
    id: "relationship",
    elderAsk: "When you love someone, how is that love?",
    subtitle: "How does it manifest?",
    dimension: "emotion",
    options: [
      { label: "I want to keep them happy so they stay close.", band: 1 },
      { label: "I help them grow, even if they go far away.", band: 3 },
      { label: "I see them within myself. We are not separate.", band: 6 },
    ],
  },
  {
    id: "goal",
    elderAsk: "If you could have any one thing in the world today…",
    subtitle: "What would you choose?",
    dimension: "awareness",
    options: [
      { label: "Peace of mind.", band: 1 },
      { label: "Success and Recognition.", band: 2 },
      { label: "Truth and Liberation.", band: 5 },
    ],
  },
];

// ═══════════════════════════════════════════
// DEEPENER QUESTIONS (For Band 3+ users)
// ═══════════════════════════════════════════

const DEEPENER_QUESTIONS: PathfinderQuestion[] = [
  {
    id: "alchemy",
    elderAsk: "Have you ever felt an old pain disappear just by 'watching' it?",
    subtitle: "Without any effort to fix or change it.",
    dimension: "awareness",
    options: [
      { label: "No, I always try to fix or push through pain.", band: 2 },
      { label: "Once or twice — it surprised me.", band: 4 },
      { label: "Yes, it happens naturally now.", band: 6 },
    ],
  },
  {
    id: "unity",
    elderAsk: "When someone treats you badly, and you know the world is your reflection…",
    subtitle: "Do you feel anger or compassion?",
    dimension: "emotion",
    options: [
      { label: "Still anger. I know the theory but can't apply it.", band: 3 },
      { label: "Sometimes compassion, sometimes frustration.", band: 5 },
      { label: "Compassion arises naturally. I see their pain.", band: 7 },
    ],
  },
];

// ═══════════════════════════════════════════
// COMPUTE BANDS FROM PATHFINDER ANSWERS
// ═══════════════════════════════════════════

function computeBandsFromPathfinder(answers: Record<string, number>): {
  dimension_bands: Record<string, number>;
  initial_band: number;
  archetype_hint: string;
  insightText: string;
} {
  const reactionBand = answers.reaction ?? 0;
  const thoughtBand = answers.thought ?? 1;
  const happinessBand = answers.happiness ?? 1;
  const relationshipBand = answers.relationship ?? 1;
  const goalBand = answers.goal ?? 1;
  const alchemyBand = answers.alchemy;
  const unityBand = answers.unity;

  // Thought dimension: average of reaction + thought questions
  const thoughtScore = Math.min(7, (reactionBand + thoughtBand) / 2);
  // Emotion dimension: relationship question
  const emotionScore = Math.min(7, relationshipBand * 0.9);
  // Body dimension: slightly below thought (estimated)
  const bodyScore = Math.min(7, Math.max(0, thoughtScore - 0.5));
  // Awareness dimension: average of happiness + goal + deepeners
  let awarenessBase = (happinessBand + goalBand) / 2;
  if (alchemyBand !== undefined) awarenessBase = (awarenessBase + alchemyBand) / 2;
  if (unityBand !== undefined) awarenessBase = (awarenessBase + unityBand) / 2;
  const awarenessScore = Math.min(7, awarenessBase);

  const dimension_bands: Record<string, number> = {
    thought: parseFloat(thoughtScore.toFixed(2)),
    emotion: parseFloat(emotionScore.toFixed(2)),
    body: parseFloat(bodyScore.toFixed(2)),
    awareness: parseFloat(awarenessScore.toFixed(2)),
  };

  // Overall band = geometric mean of all 4
  const values = Object.values(dimension_bands);
  const product = values.reduce((a, b) => a * Math.max(0.1, b), 1);
  const initial_band = parseFloat(Math.min(7, Math.pow(product, 1 / values.length)).toFixed(1));

  // Archetype hint
  let archetype_hint = "seeker";
  if (initial_band < 0.5) archetype_hint = "sleeper";
  else if (initial_band < 1.5) archetype_hint = "questioner";
  else if (initial_band < 2.5) archetype_hint = "observer";
  else if (initial_band < 3.5) archetype_hint = "alchemist";
  else if (initial_band < 4.5) archetype_hint = "navigator";
  else archetype_hint = "practitioner";

  // Generate insight text
  const strongest = Object.entries(dimension_bands).sort((a, b) => b[1] - a[1])[0];
  const weakest = Object.entries(dimension_bands).sort((a, b) => a[1] - b[1])[0];
  const dimensionLabels: Record<string, string> = {
    thought: "Mental Clarity",
    emotion: "Emotional Depth",
    body: "Body Awareness",
    awareness: "Witness Consciousness",
  };

  const insightText = initial_band < 2
    ? `Your mind is currently restless, but your ${dimensionLabels[strongest[0]]} shows promise. Your path begins with Observation.`
    : initial_band < 4
    ? `Your ${dimensionLabels[strongest[0]]} is strong, but ${dimensionLabels[weakest[0]]} needs attention. You are ready to go deeper.`
    : `You carry deep awareness. Your ${dimensionLabels[weakest[0]]} is the gateway to your next breakthrough.`;

  return { dimension_bands, initial_band, archetype_hint, insightText };
}

const BAND_NAMES = [
  "THE SLEEPER", "THE QUESTIONER", "THE OBSERVER", "THE ALCHEMIST",
  "THE NAVIGATOR", "THE ARCHITECT", "THE CHANNEL", "THE SOURCE",
];
const BAND_ICONS = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌌", "🌈", "✦"];

// ═══════════════════════════════════════════
// SCREEN COMPONENTS
// ═══════════════════════════════════════════

// ─── Screen 1: Cinematic Entrance — The Elder Appears
const ElderEntrance = ({ onNext }: { onNext: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onNext, 5000);
    return () => clearTimeout(t);
  }, [onNext]);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
    >
      {/* Golden radial glow */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 2 }}
        style={{
          background: "radial-gradient(ellipse at 50% 55%, rgba(212,165,116,0.15) 0%, rgba(180,130,70,0.05) 30%, transparent 60%)",
        }}
      />

      {/* Floating golden particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 rounded-full"
          style={{
            left: `${15 + Math.random() * 70}%`,
            top: `${20 + Math.random() * 60}%`,
            backgroundColor: `rgba(212, 165, 116, ${0.2 + Math.random() * 0.4})`,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            y: [0, -20 - Math.random() * 30],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: 1.5 + Math.random() * 2,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Elder Image */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 2, ease: "easeOut" }}
      >
        <motion.img
          src={elderImg}
          alt="The Elder"
          className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl"
          style={{ filter: "drop-shadow(0 0 40px rgba(212,165,116,0.3))" }}
          animate={{
            filter: [
              "drop-shadow(0 0 30px rgba(212,165,116,0.2))",
              "drop-shadow(0 0 50px rgba(212,165,116,0.4))",
              "drop-shadow(0 0 30px rgba(212,165,116,0.2))",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.p
          className="mt-8 text-amber-200/60 text-sm md:text-base font-display tracking-[0.3em] uppercase"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 1.5 }}
        >
          You are about to meet yourself
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

// ─── Screen 2: The Elder Speaks — Choice
const ElderSpeaks = ({ onTalk, onSkip }: { onTalk: () => void; onSkip: () => void }) => {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, rgba(212,165,116,0.1) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        <motion.img
          src={elderImg}
          alt="The Elder"
          className="w-32 h-32 md:w-40 md:h-40 object-contain mb-6"
          style={{ filter: "drop-shadow(0 0 30px rgba(212,165,116,0.25))" }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        />

        <motion.p
          className="text-amber-200/30 text-[10px] font-display tracking-[0.4em] uppercase mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          The Elder
        </motion.p>

        <motion.div className="space-y-4 mb-10">
          {[
            { text: "I am the Elder.", delay: 1 },
            { text: "I can take the form of any of the masters.", delay: 2 },
            { text: "But first, I need to know you.", delay: 3 },
            { text: "Shall we talk?", delay: 4 },
          ].map((line, i) => (
            <motion.p
              key={i}
              className={`text-white/${i === 3 ? "70" : "50"} text-sm md:text-base font-display leading-relaxed`}
              style={i === 3 ? { fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.1em" } : {}}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: line.delay, duration: 0.8 }}
            >
              {line.text}
            </motion.p>
          ))}
        </motion.div>

        <motion.div
          className="flex gap-3 w-full max-w-sm"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 5, duration: 0.8 }}
        >
          <motion.button
            onClick={onTalk}
            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/25 text-amber-200/80 text-sm font-display tracking-wider hover:from-amber-600/40 hover:to-orange-600/40 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Yes, Let's Talk
          </motion.button>
          <motion.button
            onClick={onSkip}
            className="flex-1 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/30 text-sm font-display tracking-wider hover:bg-white/[0.08] hover:text-white/50 transition-all"
            whileTap={{ scale: 0.97 }}
          >
            Start Directly
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ─── Screen 3: Name Input (Elder-styled)
const ElderNameInput = ({ onNext }: { onNext: (name: string) => void }) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onNext(name.trim());
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 50% 40%, rgba(212,165,116,0.06) 0%, transparent 50%)",
      }} />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full">
        <motion.img
          src={elderImg}
          alt="The Elder"
          className="w-24 h-24 object-contain mb-6"
          style={{ filter: "drop-shadow(0 0 20px rgba(212,165,116,0.2))" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        />

        <motion.p
          className="text-white/50 text-sm md:text-base font-display mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          To remember you on this journey…
        </motion.p>
        <motion.h2
          className="text-white/80 text-2xl md:text-3xl font-display font-bold mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Give me a name?
        </motion.h2>

        <motion.form
          onSubmit={handleSubmit}
          className="w-full space-y-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoFocus
            className="w-full text-center text-2xl font-display font-light bg-transparent border-b-2 border-amber-500/20 focus:border-amber-400/50 text-white/80 placeholder:text-white/15 py-4 outline-none transition-colors"
          />
          <motion.button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/25 text-amber-200/80 text-base font-display tracking-wider disabled:opacity-20 disabled:cursor-not-allowed hover:from-amber-600/40 hover:to-orange-600/40 transition-all"
            whileHover={{ scale: name.trim() ? 1.02 : 1 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue
          </motion.button>
        </motion.form>
      </div>
    </motion.div>
  );
};

// ─── Screen 4: Pathfinder Assessment (One question at a time)
const PathfinderAssessment = ({
  questions,
  name,
  onComplete,
}: {
  questions: PathfinderQuestion[];
  name: string;
  onComplete: (answers: Record<string, number>) => void;
}) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const question = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

  const handleSelect = (optionIdx: number) => {
    if (transitioning) return;
    setSelectedOption(optionIdx);
    setTransitioning(true);

    const option = question.options[optionIdx];
    const newAnswers = { ...answers, [question.id]: option.band };

    setTimeout(() => {
      setAnswers(newAnswers);
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setSelectedOption(null);
        setTransitioning(false);
      } else {
        onComplete(newAnswers);
      }
    }, 600);
  };

  return (
    <motion.div
      className="fixed inset-0 flex flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 50% 30%, rgba(212,165,116,0.06) 0%, transparent 50%)",
      }} />

      {/* Progress bar */}
      <div className="relative z-10 w-full px-8 pt-6">
        <div className="max-w-md mx-auto">
          <div className="h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500/50 to-orange-400/40 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-white/15 text-[10px] font-display tracking-[0.3em] uppercase mt-2 text-right">
            {currentQ + 1} of {questions.length}
          </p>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Elder mini portrait */}
              <div className="flex items-center gap-3 mb-2">
                <img src={elderImg} alt="" className="w-10 h-10 object-contain opacity-60" />
                <span className="text-amber-200/30 text-[10px] font-display tracking-[0.3em] uppercase">The Elder asks</span>
              </div>

              {/* Question */}
              <div>
                <h3 className="text-white/75 text-lg md:text-xl font-display leading-relaxed mb-2">
                  {question.elderAsk}
                </h3>
                <p className="text-white/30 text-sm font-display italic"
                   style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {question.subtitle}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {question.options.map((option, i) => {
                  const isSelected = selectedOption === i;
                  return (
                    <motion.button
                      key={i}
                      onClick={() => handleSelect(i)}
                      disabled={transitioning}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "border-amber-400/40 bg-amber-500/10"
                          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1]"
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <p className={`text-sm font-display leading-relaxed ${
                        isSelected ? "text-amber-200/80" : "text-white/50"
                      }`}>
                        {option.label}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Screen 5: Insight Card (Mini Reveal)
const InsightReveal = ({
  name,
  insightText,
  bandName,
  dimensionBands,
  onNext,
}: {
  name: string;
  insightText: string;
  bandName: string;
  dimensionBands: Record<string, number>;
  onNext: () => void;
}) => {
  const dimensionLabels: Record<string, { label: string; icon: string }> = {
    thought: { label: "Mind", icon: "🧠" },
    emotion: { label: "Heart", icon: "❤️" },
    body: { label: "Body", icon: "🫁" },
    awareness: { label: "Awareness", icon: "👁️" },
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Golden particle convergence */}
      {Array.from({ length: 25 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-amber-400/40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            left: "50%",
            top: "40%",
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: i * 0.08,
            ease: "easeIn",
          }}
        />
      ))}

      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 50% 40%, rgba(212,165,116,0.12) 0%, transparent 50%)",
      }} />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full">
        <motion.img
          src={elderImg}
          alt=""
          className="w-20 h-20 object-contain mb-4"
          style={{ filter: "drop-shadow(0 0 20px rgba(212,165,116,0.3))" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        />

        <motion.p
          className="text-amber-200/30 text-[10px] font-display tracking-[0.4em] uppercase mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Your Inner Map
        </motion.p>

        {/* Dimension bars */}
        <motion.div
          className="w-full p-5 rounded-2xl border border-amber-500/10 bg-amber-900/[0.06] mb-6 space-y-3"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
        >
          {Object.entries(dimensionBands).map(([key, value], i) => {
            const info = dimensionLabels[key] || { label: key, icon: "⚡" };
            const percentage = Math.min(100, (value / 7) * 100);
            return (
              <motion.div
                key={key}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6 + i * 0.15 }}
              >
                <span className="text-sm w-5">{info.icon}</span>
                <span className="text-white/40 text-xs font-display w-20 text-left">{info.label}</span>
                <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500/60 to-orange-400/40 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 2 + i * 0.15, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <span className="text-amber-200/40 text-[10px] font-display w-8 text-right">
                  {value.toFixed(1)}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Band name */}
        <motion.p
          className="text-amber-200/60 text-xs font-display tracking-[0.2em] uppercase mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8 }}
        >
          Starting Band: {bandName}
        </motion.p>

        {/* Insight text */}
        <motion.p
          className="text-white/50 text-sm font-display leading-relaxed mb-8"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.2, duration: 1 }}
        >
          "{insightText}"
        </motion.p>

        <motion.button
          onClick={onNext}
          className="w-full max-w-xs py-3.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/25 text-amber-200/80 text-sm font-display tracking-wider hover:from-amber-600/40 hover:to-orange-600/40 transition-all"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.8, duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          Continue
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── Screen 6: Initiation — The Sacred Oath (Elder-styled)
const ElderInitiation = ({ name, onNext }: { name: string; onNext: () => void }) => {
  const [accepted, setAccepted] = useState(false);

  const oaths = [
    "I will observe every thought — without judgment.",
    "I will feel every emotion — without running.",
    "I will notice every pattern — without shame.",
    "I will return when I fall off — without guilt.",
  ];

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <img src={cosmicInitiation} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full">
        <motion.img
          src={elderImg}
          alt=""
          className="w-20 h-20 object-contain mb-4"
          style={{ filter: "drop-shadow(0 0 20px rgba(212,165,116,0.2))" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        />

        <motion.p
          className="text-amber-200/30 text-[10px] font-display tracking-[0.4em] uppercase mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          The Initiation
        </motion.p>

        <motion.h2
          className="text-white/80 text-2xl md:text-3xl font-display font-bold mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {name}, take this oath.
        </motion.h2>

        <motion.p
          className="text-white/30 text-sm font-display italic mb-8"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Like the yogis of old, commit to the practice of observation.
        </motion.p>

        <div className="space-y-2.5 text-left w-full mb-8">
          {oaths.map((oath, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 + i * 0.3, duration: 0.5 }}
            >
              <motion.div
                className="w-4 h-4 rounded-full border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5"
                animate={accepted ? { backgroundColor: "rgba(212,165,116,0.4)", borderColor: "rgba(212,165,116,0.6)" } : {}}
                transition={{ delay: i * 0.1 }}
              >
                {accepted && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[8px] text-amber-100">✓</motion.span>
                )}
              </motion.div>
              <p className="text-sm font-display text-white/50 leading-relaxed">{oath}</p>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={() => {
            if (!accepted) {
              setAccepted(true);
              setTimeout(onNext, 1200);
            }
          }}
          className="w-full max-w-xs py-3.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/25 text-amber-200/80 text-sm font-display tracking-wider hover:from-amber-600/40 hover:to-orange-600/40 transition-all"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          🔥 I Take This Oath
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── Screen 7: Path Choice (Foundation vs Adaptive)
const ElderPathChoice = ({ name, onFoundation, onAdaptive }: {
  name: string;
  onFoundation: () => void;
  onAdaptive: () => void;
}) => {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <img src={cosmicJourneyMap} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full">
        <motion.img
          src={elderImg}
          alt=""
          className="w-16 h-16 object-contain mb-4"
          style={{ filter: "drop-shadow(0 0 15px rgba(212,165,116,0.2))" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        />

        <motion.p
          className="text-amber-200/30 text-[10px] font-display tracking-[0.4em] uppercase mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Choose your path
        </motion.p>

        <motion.h2
          className="text-white/80 text-2xl font-display font-bold mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          How do you want to begin, {name}?
        </motion.h2>

        <motion.p
          className="text-white/30 text-sm font-display mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Both paths lead to the same destination.
        </motion.p>

        <div className="w-full space-y-3">
          <motion.button
            onClick={onFoundation}
            className="w-full p-5 rounded-2xl border border-amber-500/15 bg-amber-900/[0.06] text-left hover:bg-amber-900/[0.12] transition-all group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg">🏛️</span>
              <span className="text-amber-200/70 text-sm font-display font-semibold tracking-wide">The Foundation Course</span>
              <span className="ml-auto text-amber-200/30 text-[10px] font-display tracking-wider uppercase">Recommended</span>
            </div>
            <p className="text-white/30 text-xs font-display leading-relaxed pl-8">
              A structured 118-day journey through the fundamentals. Perfect if you're new to consciousness work.
            </p>
          </motion.button>

          <motion.button
            onClick={onAdaptive}
            className="w-full p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-left hover:bg-white/[0.04] transition-all group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg">🌀</span>
              <span className="text-white/60 text-sm font-display font-semibold tracking-wide">Adaptive Journey</span>
            </div>
            <p className="text-white/30 text-xs font-display leading-relaxed pl-8">
              AI-personalized daily sessions that adapt to your consciousness level. For experienced practitioners.
            </p>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Screen 7.5: Daily Rhythm Pattern Picker — "When can you make time?"
// Per blueprint: 5 archetypal patterns (no guilt, engine adapts to chosen rhythm)
export const RHYTHM_PATTERNS = [
  {
    id: "morning_only",
    label: "Morning Only",
    icon: "☀️",
    description: "Wake up, sit, then busy all day.",
    detail: "Best for: working professionals, students.",
    slots: ["morning"],
  },
  {
    id: "morning_evening",
    label: "Morning + Evening",
    icon: "🌅",
    description: "Before work, and after. Two anchors.",
    detail: "Most common rhythm.",
    slots: ["morning", "evening"],
  },
  {
    id: "night_only",
    label: "Night Only",
    icon: "🌙",
    description: "Late nights are when you find stillness.",
    detail: "Best for: night shift, night owls.",
    slots: ["night"],
  },
  {
    id: "all_slots",
    label: "All Four Slots",
    icon: "🪔",
    description: "Morning, midday, evening, night — full immersion.",
    detail: "Best for: dedicated practitioners on retreat.",
    slots: ["morning", "midday", "evening", "night"],
  },
  {
    id: "irregular",
    label: "Whenever I Can",
    icon: "🌀",
    description: "Life is chaotic. No fixed time. Flex mode.",
    detail: "Best for: parents, freelancers, irregular days.",
    slots: [], // flexible — engine serves whatever slot is open
  },
] as const;

export type RhythmPatternId = typeof RHYTHM_PATTERNS[number]["id"];

const ElderTimeSlots = ({ name, onNext }: { name: string; onNext: (slots: string[], patternId: RhythmPatternId) => void }) => {
  const [selectedPattern, setSelectedPattern] = useState<RhythmPatternId | null>(null);

  return (
    <motion.div
      className="fixed inset-0 bg-black overflow-y-auto overscroll-contain"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, rgba(212,165,116,0.08) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 min-h-full flex flex-col items-center text-center px-6 py-10 max-w-md w-full mx-auto">
        <motion.img
          src={elderImg}
          alt=""
          className="w-20 h-20 object-contain mb-4"
          style={{ filter: "drop-shadow(0 0 20px rgba(212,165,116,0.2))" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        />

        <motion.p
          className="text-amber-200/30 text-[10px] font-display tracking-[0.4em] uppercase mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Daily Rhythm
        </motion.p>

        <motion.h2
          className="text-white/80 text-xl md:text-2xl font-display font-bold mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          When can you make time, {name}?
        </motion.h2>

        <motion.p
          className="text-white/30 text-sm font-display italic mb-8"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Pick the rhythm that fits your life. The engine will shape itself around you — no guilt for the rest.
        </motion.p>

        <div className="w-full space-y-3 mb-8">
          {RHYTHM_PATTERNS.map((pattern, i) => {
            const isSelected = selectedPattern === pattern.id;
            return (
              <motion.button
                key={pattern.id}
                onClick={() => setSelectedPattern(pattern.id)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-amber-400/40 bg-amber-500/10"
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1]"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + i * 0.08, duration: 0.4 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-2xl mt-0.5">{pattern.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-display font-semibold mb-1 ${
                    isSelected ? "text-amber-200/90" : "text-white/60"
                  }`}>
                    {pattern.label}
                  </p>
                  <p className="text-white/40 text-xs font-display leading-relaxed mb-1">
                    {pattern.description}
                  </p>
                  <p className="text-white/25 text-[10px] font-display italic">
                    {pattern.detail}
                  </p>
                </div>
                <motion.div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                    isSelected
                      ? "border-amber-400/60 bg-amber-500/30"
                      : "border-white/15"
                  }`}
                  animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-[10px] text-amber-100"
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.div>
              </motion.button>
            );
          })}
        </div>

        <motion.p
          className="text-white/20 text-xs font-display mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          {!selectedPattern
            ? "Choose your rhythm. You can change it later in Settings."
            : "Engine ready. No guilt for hours outside your rhythm. 🪔"}
        </motion.p>

        <motion.button
          onClick={() => {
            if (!selectedPattern) return;
            const pattern = RHYTHM_PATTERNS.find((p) => p.id === selectedPattern)!;
            onNext([...pattern.slots], pattern.id);
          }}
          disabled={!selectedPattern}
          className="w-full max-w-xs py-3.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/25 text-amber-200/80 text-sm font-display tracking-wider disabled:opacity-20 disabled:cursor-not-allowed hover:from-amber-600/40 hover:to-orange-600/40 transition-all"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          whileHover={{ scale: selectedPattern ? 1.02 : 1 }}
          whileTap={{ scale: 0.97 }}
        >
          Continue
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── Screen 8: Final Welcome
const ElderWelcome = ({ name, onNext }: { name: string; onNext: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onNext, 7000);
    return () => clearTimeout(t);
  }, [onNext]);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <img src={cosmicWelcome} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />

      {/* Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-amber-400/30"
          style={{ left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%` }}
          animate={{ opacity: [0, 0.6, 0], y: [0, -25], scale: [0, 1.2, 0] }}
          transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        <motion.img
          src={elderImg}
          alt=""
          className="w-28 h-28 md:w-36 md:h-36 object-contain mb-6"
          style={{ filter: "drop-shadow(0 0 40px rgba(212,165,116,0.3))" }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1.5 }}
        />

        <motion.p
          className="text-amber-200/40 text-[10px] font-display tracking-[0.4em] uppercase mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          Welcome to the journey
        </motion.p>

        <motion.h2
          className="text-white/80 text-3xl md:text-5xl font-display font-bold leading-tight mb-4"
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ delay: 2, duration: 1.5 }}
        >
          {name}, you are <span className="text-amber-300/80">awaited</span>.
        </motion.h2>

        <motion.p
          className="text-white/35 text-sm font-display leading-relaxed mb-8"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5, duration: 1 }}
        >
          The path inward has been waiting for you.<br />
          Every ancient yogi walked this same road.<br />
          Now it's your turn.
        </motion.p>

        <motion.button
          onClick={onNext}
          className="px-10 py-4 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/25 text-amber-200/80 text-base font-display tracking-wider hover:from-amber-600/40 hover:to-orange-600/40 transition-all"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.5, duration: 1 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          ✨ Begin Your Journey
        </motion.button>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════
// MAIN ONBOARDING COMPONENT
// ═══════════════════════════════════════════

type Screen =
  | "why_satyug"
  | "conditioning_swipe"
  | "prologue"
  | "elder_entrance"
  | "elder_speaks"
  | "name"
  | "foundation_v2"
  | "assessment"
  | "deepener"
  | "insight"
  | "goals"
  | "daily_routine"
  | "loop_swipe"
  | "initiation"
  | "path_choice"
  | "time_slots"
  | "welcome";

const FOUNDATION_PROGRAM_ID = "foundation-118";

const Onboarding = ({ userId, onComplete }: OnboardingProps) => {
  const [screen, setScreen] = useState<Screen>("why_satyug");
  const [userName, setUserName] = useState("");
  const [conditioningResult, setConditioningResult] = useState<ConditioningResult | null>(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number>>({});
  const [chosenPath, setChosenPath] = useState<"foundation" | "adaptive" | null>(null);
  // Unified daily flow - no slot patterns
  const [selectedTimeSlots] = useState<string[]>(["morning", "midday", "evening", "night"]);
  const [selectedPatternId] = useState<RhythmPatternId>("all_slots");
  const [calibrationResult, setCalibrationResult] = useState<{
    dimension_bands: Record<string, number>;
    initial_band: number;
    archetype_hint: string;
    insightText: string;
  } | null>(null);
  const updateAssessment = useUpdateAssessment();
  const assessStartingLevels = useAssessStartingLevels();
  const userGoals = useUserGoals();
  const [goalsValue, setGoalsValue] = useState<GoalsScreenValue | null>(null);
  const [dailyRoutineNarrative, setDailyRoutineNarrative] = useState<string>("");
  const [dailyAnchors, setDailyAnchors] = useState<Record<string, string> | null>(null);
  const [loopSwipeResult, setLoopSwipeResult] = useState<{
    activeLoopIds: string[];
    maybeLoopIds: string[];
    freeText: string;
  } | null>(null);
  const [foundationResult, setFoundationResult] = useState<FoundationResult | null>(null);

  // Check if user needs deepener questions (Band 3+ answers)
  const needsDeepener = useCallback((answers: Record<string, number>) => {
    const values = Object.values(answers);
    return values.some((v) => v >= 3);
  }, []);

  // Handle pathfinder completion
  const handlePathfinderComplete = useCallback((answers: Record<string, number>) => {
    setAssessmentAnswers(answers);
    if (needsDeepener(answers)) {
      setScreen("deepener");
    } else {
      const result = computeBandsFromPathfinder(answers);
      setCalibrationResult(result);
      setScreen("insight");
    }
  }, [needsDeepener]);

  // Handle deepener completion
  const handleDeepenerComplete = useCallback((deepenerAnswers: Record<string, number>) => {
    const allAnswers = { ...assessmentAnswers, ...deepenerAnswers };
    const result = computeBandsFromPathfinder(allAnswers);
    setCalibrationResult(result);
    setScreen("insight");
  }, [assessmentAnswers]);

  // Handle "Start Directly" (skip assessment)
  const handleSkipAssessment = useCallback(() => {
    setScreen("name");
  }, []);

  // Handle "Start Directly" → default Band 1
  const handleSkipToDefault = useCallback(() => {
    const defaultResult = computeBandsFromPathfinder({ reaction: 1, thought: 1, happiness: 1, relationship: 1, goal: 1 });
    setCalibrationResult(defaultResult);
    // Skip assessment, go to name then straight to initiation
    setScreen("name");
  }, []);

  // Final save
  const handleFinish = async () => {
    const result = calibrationResult || computeBandsFromPathfinder({ reaction: 0, thought: 1, happiness: 1, relationship: 1, goal: 1 });

    // Update profile
    const { data: updated, error: updateError } = await supabase
      .from("profiles")
      .update({ display_name: userName, onboarded: true })
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();

    if (!updated && !updateError) {
      await supabase.from("profiles").upsert({
        user_id: userId,
        display_name: userName,
        onboarded: true,
      }, { onConflict: "user_id" });
    }

    // Foundation enrollment
    if (chosenPath === "foundation") {
      await supabase.from("program_enrollments").insert({
        user_id: userId,
        program_id: FOUNDATION_PROGRAM_ID,
        current_day: 1,
        status: "active",
      });
    }

    updateAssessment.mutate({
      dimension_bands: result.dimension_bands,
      initial_band: result.initial_band,
      archetype_hint: result.archetype_hint,
      onboarding_completed: true,
      user_name: userName,
      calibration_source: chosenPath === "foundation" ? "onboarding_foundation" : "onboarding_elder_assessment",
      available_time_slots: selectedTimeSlots,
    });

    // Unified daily flow - all slots available, no pattern needed
    {
      await supabase.from("spiritual_dna_assessments").upsert(
        {
          user_id: userId,
          available_time_daily: 60,
          circadian_type: "flexible",
          assessment_conversation: {
            available_slots: ["morning", "midday", "evening", "night"],
            primary_slot: "morning",
            secondary_slot: "evening",
            skipped_slots: [],
            flexible_mode: true,
            rhythm_pattern: "unified",
            weekday_duration: 15,
            weekend_duration: 30,
            daily_routine_narrative: dailyRoutineNarrative || null,
            daily_routine_captured_at: dailyRoutineNarrative ? new Date().toISOString() : null,
            daily_anchors: dailyAnchors || null,
          } as any,
        },
        { onConflict: "user_id" }
      );
    }

    // Assess starting levels for practice matrix (Items 57-61)
    assessStartingLevels.mutate({
      answers: {
        ...assessmentAnswers,
        reaction_test: String(assessmentAnswers.reaction ?? ""),
        nature_of_thought: String(assessmentAnswers.thought ?? ""),
        source_of_happiness: String(assessmentAnswers.happiness ?? ""),
        relationship: String(assessmentAnswers.relationship ?? ""),
        goal: String(assessmentAnswers.goal ?? ""),
      },
      band: result.initial_band,
    });

    // Persist goals (if user picked any)
    if (goalsValue?.priorityGoal) {
      try {
        await userGoals.save.mutateAsync({
          priorityGoal: goalsValue.priorityGoal,
          secondaryGoals: goalsValue.secondaryGoals,
          whyNow: goalsValue.whyNow,
        });
      } catch (e) {
        // non-fatal; engine falls back to defaults
        console.warn("[onboarding] goals save failed", e);
      }
    }

    // Persist swiped loops as active_loops + free-text into spiritual_dna_assessments
    if (loopSwipeResult) {
      try {
        const rows = [
          ...loopSwipeResult.activeLoopIds.map((id) => ({
            user_id: userId,
            loop_id: id,
            is_active: true,
            confidence: 1.0,
            source: "onboarding_swipe",
          })),
          ...loopSwipeResult.maybeLoopIds.map((id) => ({
            user_id: userId,
            loop_id: id,
            is_active: true,
            confidence: 0.5,
            source: "onboarding_swipe_maybe",
          })),
        ];
        if (rows.length) {
          await supabase.from("active_loops").upsert(rows as any, {
            onConflict: "user_id,loop_id",
          });
        }
        if (loopSwipeResult.freeText) {
          await supabase.from("spiritual_dna_assessments").update({
            assessment_conversation: {
              daily_routine_narrative: dailyRoutineNarrative || null,
              daily_routine_captured_at: dailyRoutineNarrative ? new Date().toISOString() : null,
              daily_anchors: dailyAnchors || null,
              loop_freetext: loopSwipeResult.freeText,
              loop_swipe_yes: loopSwipeResult.activeLoopIds,
              loop_swipe_maybe: loopSwipeResult.maybeLoopIds,
            } as any,
          }).eq("user_id", userId);
        }
      } catch (e) {
        console.warn("[onboarding] loop swipe save failed", e);
      }
    }

    // Persist Foundation v2 result (loops + chosen paths)
    if (foundationResult) {
      try {
        const loopRows = foundationResult.analysis.loops.map((id) => ({
          user_id: userId,
          loop_id: id,
          is_active: true,
          confidence: 0.85,
          source: "onboarding_foundation_v2",
        }));
        if (loopRows.length) {
          await supabase.from("active_loops").upsert(loopRows as any, {
            onConflict: "user_id,loop_id",
          });
        }
        await supabase.from("spiritual_dna_assessments").update({
          assessment_conversation: {
            daily_routine_narrative: dailyRoutineNarrative || null,
            daily_anchors: dailyAnchors || null,
            foundation_v2: {
              answers: foundationResult.answers,
              band: foundationResult.analysis.band,
              brain: foundationResult.analysis.brain,
              loops: foundationResult.analysis.loops,
              paths: foundationResult.paths,
              path_affinity: foundationResult.analysis.pathAffinity,
            },
          } as any,
        }).eq("user_id", userId);
      } catch (e) {
        console.warn("[onboarding] foundation_v2 save failed", e);
      }
    }

    // Persist The Light Six answers (seeds the engine's conditioning read;
    // Foundation's band scoring stays authoritative)
    if (conditioningResult) {
      try {
        await supabase.from("spiritual_dna_assessments").update({
          assessment_conversation: {
            daily_routine_narrative: dailyRoutineNarrative || null,
            daily_routine_captured_at: dailyRoutineNarrative ? new Date().toISOString() : null,
            daily_anchors: dailyAnchors || null,
            conditioning_swipe: {
              answers: conditioningResult.answers,
              avg_band: conditioningResult.avgBand,
              headline: conditioningResult.headline,
            },
          },
        }).eq("user_id", userId);
      } catch (e) {
        console.warn("[onboarding] conditioning_swipe save failed", e);
      }
    }

    onComplete();
  };

  // State for tracking which path the user took (talk vs skip)
  const [tookAssessment, setTookAssessment] = useState(false);

  const bandIdx = calibrationResult ? Math.min(7, Math.floor(calibrationResult.initial_band)) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <AnimatePresence mode="wait">
        {screen === "why_satyug" && (
          <WhySatYugScreen key="why_satyug" onComplete={() => setScreen("prologue")} />
        )}

        {screen === "conditioning_swipe" && (
          <ConditioningSwipe
            key="conditioning_swipe"
            onComplete={(result) => {
              setConditioningResult(result);
              setScreen("foundation_v2");
            }}
            onSkip={() => setScreen("foundation_v2")}
          />
        )}

        {screen === "prologue" && (
          <PhilosophyPrologue key="prologue" onComplete={() => setScreen("elder_entrance")} />
        )}

        {screen === "elder_entrance" && (
          <ElderEntrance key="entrance" onNext={() => setScreen("elder_speaks")} />
        )}

        {screen === "elder_speaks" && (
          <ElderSpeaks
            key="speaks"
            onTalk={() => {
              setTookAssessment(true);
              setScreen("name");
            }}
            onSkip={() => {
              setTookAssessment(true);
              setScreen("name");
            }}
          />
        )}

        {screen === "name" && (
          <ElderNameInput
            key="name"
            onNext={(name) => {
              setUserName(name);
              // After name → the Light Six (six light conditioning questions),
              // then the 12-card Foundation assessment.
              setScreen("conditioning_swipe");
            }}
          />
        )}

        {screen === "foundation_v2" && (
          <FoundationOnboarding
            key="foundation_v2"
            userId={userId}
            onComplete={(result) => {
              setFoundationResult(result);
              const pf = toPathfinderAnswers(result.analysis);
              setAssessmentAnswers(pf);
              setCalibrationResult(computeBandsFromPathfinder(pf));
              // Foundation already showed analysis + path picker — finish now.
              handleFinish();
            }}
          />
        )}

        {screen === "assessment" && (
          <PathfinderAssessment
            key="assessment"
            questions={PATHFINDER_QUESTIONS}
            name={userName}
            onComplete={handlePathfinderComplete}
          />
        )}

        {screen === "deepener" && (
          <PathfinderAssessment
            key="deepener"
            questions={DEEPENER_QUESTIONS}
            name={userName}
            onComplete={handleDeepenerComplete}
          />
        )}

        {screen === "insight" && calibrationResult && (
          <InsightReveal
            key="insight"
            name={userName}
            insightText={calibrationResult.insightText}
            bandName={BAND_NAMES[bandIdx]}
            dimensionBands={calibrationResult.dimension_bands}
            onNext={() => setScreen("goals")}
          />
        )}

        {screen === "goals" && (
          <GoalsScreen
            key="goals"
            name={userName}
            initial={goalsValue}
            onComplete={(v) => {
              setGoalsValue(v);
              setScreen("daily_routine");
            }}
            onSkip={() => setScreen("daily_routine")}
            cta="Set my path"
          />
        )}

        {screen === "daily_routine" && (
          <DailyRoutineNarrative
            key="daily_routine"
            name={userName}
            onNext={(narrative, anchors) => {
              setDailyRoutineNarrative(narrative);
              setDailyAnchors(anchors as unknown as Record<string, string>);
              setScreen("loop_swipe");
            }}
            onSkip={() => setScreen("loop_swipe")}
          />
        )}

        {screen === "loop_swipe" && (
          <LoopSwipeScreen
            key="loop_swipe"
            name={userName}
            onComplete={(result) => {
              setLoopSwipeResult(result);
              setScreen("initiation");
            }}
            onSkip={() => setScreen("initiation")}
          />
        )}

        {screen === "initiation" && (
          <ElderInitiation
            key="initiation"
            name={userName || "Seeker"}
            onNext={() => {
              setChosenPath("adaptive");
              if (!calibrationResult) {
                const result = computeBandsFromPathfinder({ reaction: 1, thought: 1, happiness: 2, relationship: 1, goal: 1 });
                setCalibrationResult(result);
              }
              // Skip time_slots screen - go directly to welcome
              setScreen("welcome");
            }}
          />
        )}

        {/* Time slots screen removed - unified daily flow */}

        {screen === "welcome" && (
          <ElderWelcome key="welcome" name={userName || "Seeker"} onNext={handleFinish} />
        )}
      </AnimatePresence>

      {/* Skip on entrance only */}
      {screen === "elder_entrance" && (
        <motion.button
          onClick={() => setScreen("elder_speaks")}
          className="fixed bottom-8 right-8 z-50 text-white/20 text-sm font-display tracking-wider hover:text-white/40 transition-colors cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
        >
          Skip →
        </motion.button>
      )}
    </div>
  );
};

export default Onboarding;
