/**
 * AdaptiveSlotGrid — Shows today's session slots, dimming/hiding slots the user didn't select.
 * Respects user's time pattern from onboarding.
 */
import { motion } from "framer-motion";
import { Check, Lock, Loader2, ArrowRight, SkipForward } from "lucide-react";
import { TIME_SLOTS, type TimeSlot } from "@/lib/timeSlots";
import type { SlotStatus } from "@/machines/homeMachine";
import type { UserTimeProfile } from "@/hooks/useUserTimeProfile";
import { isSlotRelevant } from "@/hooks/useUserTimeProfile";

interface AdaptiveSlotGridProps {
  profile: UserTimeProfile;
  getSlotStatus: (slot: TimeSlot) => SlotStatus;
  onSlotClick: (slot: TimeSlot) => void;
}

export default function AdaptiveSlotGrid({ profile, getSlotStatus, onSlotClick }: AdaptiveSlotGridProps) {
  const relevantSlots = TIME_SLOTS.filter(s => isSlotRelevant(s.slot, profile));
  const skippedSlots = TIME_SLOTS.filter(s => !isSlotRelevant(s.slot, profile));

  return (
    <motion.div
      className="glass-card rounded-2xl p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold">
          Today's Sessions
        </h3>
        {skippedSlots.length > 0 && (
          <span className="text-[10px] font-display text-muted-foreground/50">
            {relevantSlots.length} of 4 active
          </span>
        )}
      </div>

      {/* Active slots */}
      <div className={`grid gap-2 ${relevantSlots.length <= 2 ? 'grid-cols-2' : relevantSlots.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
        {relevantSlots.map((slot, i) => {
          const status = getSlotStatus(slot.slot);
          const isClickable = status !== "locked" && status !== "completed";

          return (
            <motion.button
              key={slot.slot}
              onClick={() => onSlotClick(slot.slot)}
              disabled={!isClickable}
              className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl shrink-0 transition-all ${
                status === "current"
                  ? "bg-primary/10 border border-primary/20"
                  : status === "completed"
                  ? "bg-primary/5 border border-primary/10"
                  : status === "active"
                  ? "bg-primary/5 border border-primary/15"
                  : status === "locked"
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-muted/20"
              }`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              whileTap={isClickable ? { scale: 0.95 } : undefined}
            >
              <span className="text-lg">{slot.emoji}</span>
              <span className="text-[11px] font-display font-medium text-foreground">{slot.label}</span>
              {status === "completed" ? (
                <Check className="w-3 h-3 text-primary" />
              ) : status === "current" ? (
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
              ) : status === "locked" ? (
                <Lock className="w-3 h-3 text-muted-foreground" />
              ) : status === "active" ? (
                <Loader2 className="w-3 h-3 text-primary animate-spin" />
              ) : (
                <ArrowRight className="w-3 h-3 text-primary/60" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Skipped slots indicator */}
      {skippedSlots.length > 0 && skippedSlots.length < 4 && (
        <div className="flex items-center gap-2 mt-3 px-1">
          <SkipForward className="w-3 h-3 text-muted-foreground/30" />
          <span className="text-[10px] font-display text-muted-foreground/40">
            {skippedSlots.map(s => s.label).join(', ')} — skipped (your choice)
          </span>
        </div>
      )}
    </motion.div>
  );
}
