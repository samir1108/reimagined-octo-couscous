/**
 * CatchUpChip — small dismissible chip shown above current-slot UI when morning
 * was missed. Tapping it routes to a 60-second condensed morning intention.
 */
import { motion } from "framer-motion";
import { Sunrise, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface CatchUpChipProps {
  onCatchUp?: () => void;
}

export default function CatchUpChip({ onCatchUp }: CatchUpChipProps) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between gap-3 glass-subtle border border-primary/20 rounded-2xl px-4 py-2.5"
    >
      <button
        onClick={onCatchUp ?? (() => navigate("/app?catchup=morning"))}
        className="flex items-center gap-2 flex-1 text-left"
      >
        <Sunrise className="w-4 h-4 text-primary shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] font-display tracking-[0.16em] uppercase text-primary/80">
            Catch up morning
          </p>
          <p className="text-[11px] font-body text-muted-foreground truncate">
            One quick intention to anchor your day
          </p>
        </div>
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded-lg hover:bg-primary/5 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </motion.div>
  );
}
