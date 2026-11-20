/**
 * MIND MAP — AI-powered pattern detection from Witness sessions
 * Shows user their mind patterns after 10+ sessions
 */
import { motion } from "framer-motion";
import { Brain, Heart, Wind, TrendingUp, AlertTriangle, Lightbulb, ArrowLeft, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

interface MindMapProps {
  sessions: any[];
  aiInsights?: string;
  onClose: () => void;
}

export default function MindMap({ sessions, aiInsights, onClose }: MindMapProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Analyze patterns from session data
  const analyzePatterns = () => {
    const emotions: Record<string, number> = {};
    const thoughts: Record<string, number> = {};
    const bodySensations: Record<string, number> = {};
    const headNotes: Record<string, number> = {};
    const heartNotes: Record<string, number> = {};
    const gutNotes: Record<string, number> = {};

    sessions.forEach(s => {
      (s.emotionsFelt || "").split(",").forEach(e => {
        const tag = e.trim();
        if (tag) emotions[tag] = (emotions[tag] || 0) + 1;
      });
      (s.thoughtsObserved || "").split(",").forEach(t => {
        const tag = t.trim();
        if (tag) thoughts[tag] = (thoughts[tag] || 0) + 1;
      });
      (s.bodySensations || "").split(",").forEach(b => {
        const tag = b.trim();
        if (tag) bodySensations[tag] = (bodySensations[tag] || 0) + 1;
      });
    });

    const topEmotions = Object.entries(emotions).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topThoughts = Object.entries(thoughts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topBody = Object.entries(bodySensations).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { topEmotions, topThoughts, topBody, totalSessions: sessions.length };
  };

  const patterns = analyzePatterns();

  return (
    <motion.div
      className="fixed inset-0 z-[85] flex flex-col bg-black/95 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300/50" />
          <h2 className="text-white/70 text-sm font-display tracking-wider">Your Mind Map</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-12 h-12 text-amber-300/40" />
            </motion.div>
            <p className="text-white/40 text-sm font-display">Analyzing {sessions.length} sessions...</p>
          </div>
        ) : (
          <div className="space-y-6 max-w-lg mx-auto">
            {/* Summary */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-white/30 text-xs font-display mb-1">
                Based on {sessions.length} Witness sessions
              </p>
              <h3 className="text-white/80 text-lg font-display">
                Patterns in Your Mind
              </h3>
            </motion.div>

            {/* Top Emotions */}
            <motion.div
              className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-4 h-4 text-rose-300/50" />
                <p className="text-white/50 text-xs font-display font-medium">Most Common Emotions</p>
              </div>
              <div className="space-y-2">
                {patterns.topEmotions.map(([emotion, count], i) => (
                  <div key={emotion} className="flex items-center gap-3">
                    <span className="text-white/60 text-xs font-display w-24">{emotion}</span>
                    <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-rose-500/40 to-pink-500/40 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / sessions.length) * 100}%` }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                      />
                    </div>
                    <span className="text-white/30 text-[10px] font-display">{count}/{sessions.length}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Top Thoughts */}
            <motion.div
              className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-blue-300/50" />
                <p className="text-white/50 text-xs font-display font-medium">Most Common Thought Patterns</p>
              </div>
              <div className="space-y-2">
                {patterns.topThoughts.map(([thought, count], i) => (
                  <div key={thought} className="flex items-center gap-3">
                    <span className="text-white/60 text-xs font-display w-32">{thought}</span>
                    <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500/40 to-indigo-500/40 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / sessions.length) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                      />
                    </div>
                    <span className="text-white/30 text-[10px] font-display">{count}/{sessions.length}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Body Sensations */}
            <motion.div
              className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Wind className="w-4 h-4 text-emerald-300/50" />
                <p className="text-white/50 text-xs font-display font-medium">Most Common Body Sensations</p>
              </div>
              <div className="space-y-2">
                {patterns.topBody.map(([sensation, count], i) => (
                  <div key={sensation} className="flex items-center gap-3">
                    <span className="text-white/60 text-xs font-display w-32">{sensation}</span>
                    <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500/40 to-teal-500/40 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / sessions.length) * 100}%` }}
                        transition={{ duration: 1, delay: 0.7 + i * 0.1 }}
                      />
                    </div>
                    <span className="text-white/30 text-[10px] font-display">{count}/{sessions.length}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Insights */}
            {aiInsights && (
              <motion.div
                className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-300/60" />
                  <p className="text-amber-200/60 text-xs font-display font-medium">Insights</p>
                </div>
                <p className="text-white/60 text-xs font-display leading-relaxed whitespace-pre-wrap">
                  {aiInsights}
                </p>
              </motion.div>
            )}

            {/* Warning if negative patterns */}
            {patterns.topEmotions.some(([e, c]) => 
              ["Anxious", "Heavy", "Tense", "Numb", "Angry", "Sad"].includes(e) && c / sessions.length > 0.5
            ) && (
              <motion.div
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-300/60" />
                  <p className="text-red-200/60 text-xs font-display font-medium">Notice</p>
                </div>
                <p className="text-white/50 text-xs font-display leading-relaxed">
                  Heavy emotions are appearing frequently. This is normal — the Witness doesn't judge. 
                  But if this feels overwhelming, consider speaking with Tara (Heart Healer) or Anaya (Breath Guide).
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
