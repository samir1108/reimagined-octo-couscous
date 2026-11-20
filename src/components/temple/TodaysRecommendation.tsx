/**
 * Today's Recommendation Card
 * Per temple.md Section 29: AI-Directed Session Engine
 * Shows proactive session recommendation with master message
 */
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, HelpCircle, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { SessionRecommendation } from "@/lib/sessionEngine";

interface TodaysRecommendationProps {
  recommendation: SessionRecommendation;
  onAccept: () => void;
  onDismiss: () => void;
}

export default function TodaysRecommendation({
  recommendation,
  onAccept,
  onDismiss,
}: TodaysRecommendationProps) {
  const [showWhyThis, setShowWhyThis] = useState(false);

  const urgencyColors = {
    gentle: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
    normal: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
    important: "from-red-500/10 to-rose-500/10 border-red-500/20",
  };

  return (
    <>
      <motion.div
        className={`mx-4 md:mx-8 mb-4 p-4 rounded-xl bg-gradient-to-r ${urgencyColors[recommendation.urgency]} border backdrop-blur-sm`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400/60">✨</span>
            <p className="text-white/40 text-[10px] font-display tracking-[0.3em] uppercase">
              Today's Recommendation
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
            aria-label="Dismiss recommendation"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Master + Message */}
        <div className="flex items-start gap-3 mb-3">
          <img
            src={recommendation.masterImage}
            alt=""
            className="w-10 h-10 rounded-xl object-cover object-top ring-1 ring-white/10 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs font-display font-medium">{recommendation.masterName}</p>
            <p className="text-white/40 text-[10px] font-display italic leading-relaxed">
              "{recommendation.reason}"
            </p>
          </div>
        </div>

        {/* Session Details */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm font-display font-medium">{recommendation.sessionTitle}</p>
            <p className="text-white/30 text-[10px] font-display">
              {recommendation.durationMinutes} min · {recommendation.timeOfDay} session
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWhyThis(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/30 text-[10px] font-display hover:bg-white/[0.1] hover:text-white/50 transition-all"
            >
              <HelpCircle className="w-3 h-3" />
              Why This?
            </button>
            <button
              onClick={onAccept}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/25 text-amber-200/80 text-xs font-display tracking-wider hover:from-amber-600/40 hover:to-orange-600/40 transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              Accept
            </button>
          </div>
        </div>
      </motion.div>

      {/* Why This Dialog */}
      <AnimatePresence>
        {showWhyThis && (
          <motion.div
            className="fixed inset-0 z-[75] flex items-end md:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWhyThis(false)} />

            {/* Dialog */}
            <motion.div
              className="relative z-10 w-full max-w-sm bg-black/95 border border-white/[0.08] rounded-t-2xl md:rounded-2xl p-5 max-h-[80vh] overflow-y-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white/70 text-sm font-display font-medium">Why This Session?</h3>
                <button
                  onClick={() => setShowWhyThis(false)}
                  className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reasons */}
              <div className="space-y-2 mb-4">
                {recommendation.whyThis.map((reason, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400/40 shrink-0 mt-0.5" />
                    <p className="text-white/50 text-xs font-display leading-relaxed">{reason}</p>
                  </motion.div>
                ))}
              </div>

              {/* Master quote */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-white/30 text-xs font-display italic">
                  "{recommendation.reason}"
                </p>
                <p className="text-white/20 text-[10px] font-display mt-1 text-right">
                  — {recommendation.masterName}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
