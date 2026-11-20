/**
 * Cross-Master Dialogue Component
 * Per temple.md Section 36: Special sessions where two masters discuss topics
 * Full moon, festivals, milestones, "108 masters gather"
 */
import { motion } from "framer-motion";
import { ArrowLeft, Moon, Star } from "lucide-react";
import { useState } from "react";

interface DialogueMessage {
  masterId: string;
  masterName: string;
  masterImage: string;
  text: string;
}

interface CrossMasterDialogueProps {
  occasion: string;
  masters: { id: string; name: string; image: string }[];
  dialogue: DialogueMessage[];
  relatedPractice?: { name: string; id: string };
  onClose: () => void;
}

export default function CrossMasterDialogue({
  occasion,
  masters,
  dialogue,
  relatedPractice,
  onClose,
}: CrossMasterDialogueProps) {
  const [revealedCount, setRevealedCount] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const revealNext = () => {
    if (revealedCount < dialogue.length) {
      setRevealedCount((prev) => prev + 1);
    }
  };

  const autoPlay = () => {
    setIsAutoPlaying(true);
    let count = 1;
    const interval = setInterval(() => {
      count++;
      setRevealedCount(count);
      if (count >= dialogue.length) {
        clearInterval(interval);
        setIsAutoPlaying(false);
      }
    }, 2500);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[75] flex flex-col bg-black/95 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-purple-300/50" />
            <h2 className="text-white/70 text-sm font-display tracking-wider">{occasion}</h2>
          </div>
        </div>
        {!isAutoPlaying && revealedCount < dialogue.length && (
          <button
            onClick={autoPlay}
            className="text-white/30 text-[10px] font-display tracking-wider hover:text-white/50 transition-colors"
          >
            Auto-play
          </button>
        )}
      </div>

      {/* Masters header */}
      <div className="relative z-10 px-4 py-4 flex items-center justify-center gap-3">
        {masters.map((master, i) => (
          <div key={master.id} className="flex items-center">
            <img
              src={master.image}
              alt=""
              className="w-10 h-10 rounded-full object-cover object-top ring-1 ring-white/10"
            />
            {i < masters.length - 1 && (
              <span className="text-white/20 text-xs font-display mx-2">&</span>
            )}
          </div>
        ))}
      </div>

      {/* Dialogue */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-none px-4 md:px-16 py-6 max-w-2xl mx-auto space-y-6">
        {dialogue.slice(0, revealedCount).map((msg, i) => (
          <motion.div
            key={i}
            className={`flex items-start gap-3 ${msg.masterId === "narrator" ? "justify-center" : ""}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {msg.masterId !== "narrator" && (
              <img
                src={msg.masterImage}
                alt=""
                className="w-8 h-8 rounded-full object-cover object-top ring-1 ring-white/10 shrink-0 mt-1"
              />
            )}
            <div>
              {msg.masterId !== "narrator" && (
                <p className="text-white/40 text-[10px] font-display tracking-wider mb-1">{msg.masterName}</p>
              )}
              <p
                className={`${
                  msg.masterId === "narrator"
                    ? "text-white/30 text-xs font-display italic text-center"
                    : "text-white/70 text-sm font-display leading-relaxed"
                }`}
              >
                {msg.text}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Reveal more button */}
        {revealedCount < dialogue.length && !isAutoPlaying && (
          <motion.button
            onClick={revealNext}
            className="w-full py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 text-xs font-display tracking-wider hover:bg-white/[0.06] transition-all flex items-center justify-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Star className="w-3 h-3" />
            Continue
          </motion.button>
        )}

        {/* Related practice */}
        {revealedCount >= dialogue.length && relatedPractice && (
          <motion.div
            className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-amber-200/50 text-[10px] font-display tracking-[0.3em] uppercase mb-2">
              Related Practice
            </p>
            <p className="text-white/60 text-sm font-display mb-3">{relatedPractice.name}</p>
            <button className="px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-200/80 text-xs font-display hover:bg-amber-500/25 transition-all">
              Begin Practice
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
