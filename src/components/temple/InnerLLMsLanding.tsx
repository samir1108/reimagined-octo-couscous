/**
 * Inner LLMs Landing Page - Outside Temple (Marketing)
 * Per temple.md Section 11 & Screen 15
 * Explains Gut/Heart/Brain - NOT AI
 */
import { motion } from "framer-motion";
import { ArrowLeft, Brain, Heart, Waves, ChevronRight, Sparkles, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/seo/Seo";

const INNER_LLMS = [
  {
    type: "gut",
    name: "Gut Brain",
    neurons: "500 Million",
    speed: "Fastest (milliseconds)",
    function: "Intuition, survival, boundaries",
    description:
      "Your second brain. The enteric nervous system knows what's right before your head figures it out. Trust the gut feeling — it's biological intelligence.",
    icon: <Waves className="w-8 h-8" />,
    color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/20",
    textColor: "text-emerald-200/70",
  },
  {
    type: "heart",
    name: "Heart Brain",
    neurons: "40,000",
    speed: "Fast (seconds)",
    function: "Emotion, values, connection",
    description:
      "The heart has its own nervous system. It feels right/wrong before the mind knows. It connects to others through coherence. Love is literally electromagnetic.",
    icon: <Heart className="w-8 h-8" />,
    color: "from-rose-500/20 to-pink-500/20",
    borderColor: "border-rose-500/20",
    textColor: "text-rose-200/70",
  },
  {
    type: "head",
    name: "Head Brain",
    neurons: "86 Billion",
    speed: "Slower (minutes to hours)",
    function: "Logic, analysis, planning",
    description:
      "The CEO. Powerful but slow. Makes sense of what gut and heart already know. Essential for execution, terrible for intuition.",
    icon: <Brain className="w-8 h-8" />,
    color: "from-blue-500/20 to-indigo-500/20",
    borderColor: "border-blue-500/20",
    textColor: "text-blue-200/70",
  },
];

const PROGRAM_WEEKS = [
  {
    week: "Week 1",
    title: "Understand Each Brain",
    days: "Gut Days 1-2, Heart 3-4, Head 5-6, Silence 7",
  },
  {
    week: "Week 2",
    title: "Read Signals",
    days: "Gut 8-9, Heart 10-11, Head 12-13, Silence 14",
  },
  {
    week: "Week 3",
    title: "Integration",
    days: "Align 15-16, Conflict 17-18, Real-life 19-20, Final 21",
  },
];

export default function InnerLLMsLanding() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Seo
        title="The Three Inner LLMs — Head, Heart, Gut"
        description="The framework behind ConsciousOS: three biological intelligences — gut (500M neurons), heart (40K), and head — and how to align them."
        canonicalPath="/inner-llms"
      />
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/60" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-white/70 text-sm font-display tracking-wider">Decode Your Inner LLMs</h2>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-none px-4 md:px-8 py-6">
        {/* Hero */}
        <div className="text-center mb-8">
          <motion.div
            className="flex justify-center mb-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-10 h-10 text-amber-300/60" />
          </motion.div>
          <h1 className="text-white/90 text-2xl md:text-3xl font-display tracking-wide mb-3">
            Decode Your Inner LLMs
          </h1>
          <p className="text-white/40 text-sm font-display max-w-md mx-auto leading-relaxed">
            Not AI. <span className="text-amber-300/60">Localized Mind Models</span> — your three biological processors:
            Gut, Heart, and Head.
          </p>
        </div>

        {/* Not AI clarification */}
        <motion.div
          className="mb-8 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-amber-200/60 text-xs font-display leading-relaxed text-center">
            LLM = <strong>Localized Mind Models</strong> (biological processors in your body).
            <br />
            Not Artificial Intelligence. Your own inner wisdom.
          </p>
        </motion.div>

        {/* Three Brains */}
        <div className="space-y-4 mb-8">
          {INNER_LLMS.map((llm, i) => (
            <motion.div
              key={llm.type}
              className={`p-5 rounded-xl bg-gradient-to-r ${llm.color} border ${llm.borderColor}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.15 }}
            >
              <div className="flex items-start gap-4">
                <div className={`${llm.textColor}`}>{llm.icon}</div>
                <div className="flex-1">
                  <h3 className={`text-lg font-display font-semibold ${llm.textColor} mb-1`}>{llm.name}</h3>
                  <div className="flex flex-wrap gap-3 mb-2">
                    <span className="text-white/30 text-[10px] font-display">{llm.neurons} neurons</span>
                    <span className="text-white/30 text-[10px] font-display">{llm.speed}</span>
                  </div>
                  <p className="text-white/50 text-xs font-display">{llm.function}</p>
                  <p className="text-white/35 text-xs font-display leading-relaxed mt-2">{llm.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 21-Day Program */}
        <div className="mb-8">
          <h3 className="text-white/40 text-[10px] font-display tracking-[0.3em] uppercase mb-3 text-center">
            21-Day Program Structure
          </h3>
          <div className="space-y-2">
            {PROGRAM_WEEKS.map((week, i) => (
              <motion.div
                key={i}
                className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-xs font-display font-medium">{week.week}</p>
                    <p className="text-white/40 text-[10px] font-display">{week.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/25 text-[10px] font-display">{week.days}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Daily Structure */}
        <motion.div
          className="mb-8 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <h4 className="text-white/50 text-xs font-display font-medium mb-2">Daily Structure</h4>
          <div className="flex items-center gap-3 text-white/30 text-xs font-display">
            <span>10 min teaching</span>
            <span>+</span>
            <span>10 min practice</span>
            <span>+</span>
            <span>Chat available</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <motion.button
            onClick={() => navigate("/app/temple")}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/25 text-amber-200/80 text-sm font-display tracking-wider hover:from-amber-600/40 hover:to-orange-600/40 transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play className="w-4 h-4" />
            Start Program in Temple
          </motion.button>
          <p className="text-white/20 text-[10px] font-display text-center mt-3 italic">
            "This program exists only within the sacred walls of the Temple."
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
