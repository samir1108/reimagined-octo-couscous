/**
 * OffHoursCard — Shown when the current time slot is NOT in the user's selected pattern
 * AND no slot is yet completed today. Example: Morning-Only user opens app at 4 PM.
 *
 * Per blueprint: NO guilt. Engine respects user's pattern.
 */
import { motion } from "framer-motion";
import { Moon, Sunrise, Sun, Sunset } from "lucide-react";
import type { UserTimeProfile } from "@/hooks/useUserTimeProfile";
import { getCurrentTimeSlot, getSlotConfig, type TimeSlot } from "@/lib/timeSlots";
import AlwaysAvailableActions from "./AlwaysAvailableActions";

interface OffHoursCardProps {
  userName: string;
  profile: UserTimeProfile;
  daysSinceLastVisit: number;
}

const ICON_BY_SLOT: Record<TimeSlot, React.ReactNode> = {
  morning: <Sunrise className="w-6 h-6 text-primary/70" />,
  midday: <Sun className="w-6 h-6 text-primary/70" />,
  evening: <Sunset className="w-6 h-6 text-primary/70" />,
  night: <Moon className="w-6 h-6 text-primary/70" />,
};

export default function OffHoursCard({ userName, profile, daysSinceLastVisit }: OffHoursCardProps) {
  const current = getCurrentTimeSlot();
  const primary = profile.primarySlot;
  const primaryCfg = getSlotConfig(primary);

  // Greeting tuned to current time but acknowledging the user's chosen rhythm
  const title =
    current === "night"
      ? `Good night, ${userName}`
      : current === "evening"
      ? `Good evening, ${userName}`
      : current === "midday"
      ? `Good afternoon, ${userName}`
      : `Good morning, ${userName}`;

  const nextLabel =
    primary === "morning"
      ? "See you tomorrow morning. 🙏"
      : primary === "night"
      ? "See you tonight. 🙏"
      : primary === "evening"
      ? "See you this evening. 🙏"
      : "See you later today. 🙏";

  const gapMessage =
    daysSinceLastVisit >= 1 && daysSinceLastVisit < 3
      ? `Last session: ${daysSinceLastVisit} day${daysSinceLastVisit > 1 ? "s" : ""} ago. Welcome back.`
      : null;

  return (
    <motion.div
      className="relative max-w-2xl mx-auto px-4 py-12"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="glass-card rounded-3xl p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            {ICON_BY_SLOT[primary]}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground tracking-tight">
            {title}
          </h1>
          <p className="text-muted-foreground font-body text-sm">
            Your rhythm is <span className="text-foreground font-medium">{primaryCfg.label.toLowerCase()}</span>.
            Right now is rest time.
          </p>
        </div>

        {gapMessage && (
          <div className="glass-subtle rounded-xl px-4 py-3">
            <p className="text-xs text-muted-foreground font-body">{gapMessage}</p>
          </div>
        )}

        <div className="pt-2">
          <p className="text-[11px] font-display tracking-[0.2em] uppercase text-primary/70">
            {nextLabel}
          </p>
        </div>

        <p className="text-[11px] font-body text-muted-foreground/60 italic pt-2">
          No guilt. No pressure. Your engine respects your time. 🪔
        </p>
      </div>

      {/* Always-open doors — even in rest time, the user can sit with something */}
      <div className="mt-6">
        <AlwaysAvailableActions heading="If you'd like to sit with something" />
      </div>
    </motion.div>
  );
}
