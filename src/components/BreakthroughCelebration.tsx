import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { BREAKTHROUGH_TYPES, type BreakthroughType } from "@/data/breakthroughs";

interface Props {
  breakthroughId: string | null;
  onClose: () => void;
}

const rarityGradients: Record<string, string> = {
  common: "from-muted to-muted/50",
  uncommon: "from-chart-2/20 to-chart-2/5",
  rare: "from-chart-4/20 to-chart-4/5",
  epic: "from-purple-500/20 to-purple-500/5",
  legendary: "from-primary/30 to-primary/5",
};

const rarityBorder: Record<string, string> = {
  common: "border-border/30",
  uncommon: "border-chart-2/30",
  rare: "border-chart-4/30",
  epic: "border-purple-400/30",
  legendary: "border-primary/40",
};

export default function BreakthroughCelebration({ breakthroughId, onClose }: Props) {
  const bt = breakthroughId ? BREAKTHROUGH_TYPES.find(t => t.id === breakthroughId) : null;
  if (!bt) return null;

  return (
    <AnimatePresence>
      {breakthroughId && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Card */}
          <motion.div
            className={`relative w-full max-w-sm rounded-3xl border bg-gradient-to-b ${rarityGradients[bt.rarity]} ${rarityBorder[bt.rarity]} p-8 text-center`}
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Sparkle animation */}
            <motion.div
              className="mb-4"
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              <span className="text-6xl block">{bt.emoji}</span>
            </motion.div>

            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold">
                Breakthrough Unlocked
              </span>
            </div>

            <h2 className="text-2xl font-display font-bold text-foreground mb-2">{bt.name}</h2>
            <p className="text-sm font-body text-muted-foreground leading-relaxed mb-4">
              {bt.description}
            </p>

            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-display font-medium uppercase tracking-wider ${
              bt.rarity === "legendary" ? "bg-primary/20 text-primary" :
              bt.rarity === "epic" ? "bg-purple-400/20 text-purple-400" :
              bt.rarity === "rare" ? "bg-chart-4/20 text-chart-4" :
              bt.rarity === "uncommon" ? "bg-chart-2/20 text-chart-2" :
              "bg-muted text-muted-foreground"
            }`}>
              {bt.rarity}
            </span>

            <motion.button
              onClick={onClose}
              className="mt-6 w-full py-3 rounded-2xl bg-gradient-sunrise text-primary-foreground font-display font-semibold text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue Journey
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
