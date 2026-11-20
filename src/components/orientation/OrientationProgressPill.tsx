import { motion } from "framer-motion";
import { getActForSession } from "@/data/programs/v2/orientation";

interface Props {
  currentIndex: number;
  total: number;
}

/**
 * Tiny header pill showing "Path 14 of 30 · Act 3: Three Intelligences".
 */
export default function OrientationProgressPill({ currentIndex, total }: Props) {
  if (currentIndex > total) return null;
  const act = getActForSession(currentIndex);
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/5 px-3 py-1 text-xs text-amber-200/90"
    >
      <span className="font-medium">Path {currentIndex} of {total}</span>
      <span className="text-amber-200/40">·</span>
      <span className="text-amber-200/70">Act {act.id}: {act.title}</span>
    </motion.div>
  );
}
