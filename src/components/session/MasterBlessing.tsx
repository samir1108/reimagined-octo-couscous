// MasterBlessing — cinematic intro card. User must tap "Begin" to enter session.
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface Props {
  masterName: string;
  masterTradition?: string;
  masterImage?: string;
  themeTitle?: string;
  quote?: string;
  durationMs?: number;
  onDone: () => void;
}

/**
 * Cinematic blessing card shown before a session begins.
 * Master portrait fills the background; content sits on a dark gradient overlay.
 */
export default function MasterBlessing({
  masterName,
  masterTradition,
  masterImage,
  themeTitle,
  quote,
  onDone,
}: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-[80] overflow-hidden bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Soft primary glow only */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, hsl(var(--primary) / 0.12) 0%, hsl(var(--background) / 0) 55%)",
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center px-6">
        <motion.div
          className="max-w-md w-full text-center space-y-5"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center mb-3"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden ring-2 ring-primary/40 shadow-xl shadow-primary/20 backdrop-blur-sm">
              <img
                src={masterImage}
                alt={masterName}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </motion.div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-display tracking-[0.25em] uppercase text-primary/80">
              Today, you sit with
            </p>
            <h2 className="text-3xl font-display font-semibold text-foreground drop-shadow-lg">
              {masterName}
            </h2>
            {masterTradition && (
              <p className="text-xs font-body text-muted-foreground italic">{masterTradition}</p>
            )}
          </div>

          {themeTitle && (
            <motion.div
              className="glass-subtle rounded-2xl px-5 py-4 border border-primary/20 backdrop-blur-md bg-background/40"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-2 mb-1.5 text-primary/80">
                <Sparkles className="w-3 h-3" />
                <p className="text-[9px] font-display tracking-[0.2em] uppercase">Today's thread</p>
              </div>
              <p className="text-sm font-display text-foreground">{themeTitle}</p>
            </motion.div>
          )}

          {quote && (
            <motion.p
              className="text-sm font-body italic text-foreground/90 leading-relaxed drop-shadow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              "{quote}"
            </motion.p>
          )}

          <motion.button
            onClick={onDone}
            className="mt-2 px-10 py-3.5 bg-primary text-primary-foreground rounded-full font-display tracking-wide hover:bg-primary/90 transition shadow-2xl shadow-primary/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            Begin Conversation
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
