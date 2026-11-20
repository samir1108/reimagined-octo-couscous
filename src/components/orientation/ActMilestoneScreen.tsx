import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ORIENTATION_ACTS } from "@/data/programs/v2/orientation";

interface Props {
  open: boolean;
  /** The act that was just completed. */
  completedActId: number;
  onClose: () => void;
}

/**
 * Cinematic celebration screen shown after sessions 6, 12, 18, 24, 30.
 */
export default function ActMilestoneScreen({ open, completedActId, onClose }: Props) {
  const act = ORIENTATION_ACTS.find((a) => a.id === completedActId);
  if (!act) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="max-w-md px-8 text-center"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mx-auto mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/40 to-orange-600/40"
            >
              <Sparkles className="h-10 w-10 text-amber-200" />
            </motion.div>
            <div className="mb-2 text-xs uppercase tracking-[0.3em] text-amber-300/60">
              Act {act.id} complete
            </div>
            <h2 className="mb-4 font-display text-3xl text-amber-50">
              {act.milestoneCopy.title}
            </h2>
            <p className="text-base leading-relaxed text-amber-100/70">
              {act.milestoneCopy.body}
            </p>
            <button
              onClick={onClose}
              className="mt-10 rounded-full border border-amber-400/40 px-8 py-2 text-sm text-amber-200 transition hover:bg-amber-400/10"
            >
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
