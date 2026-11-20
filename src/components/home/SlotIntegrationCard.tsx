/**
 * SlotIntegrationCard — One creative, slot-specific integration card that sits
 * under the Today's Theme card. Each slot has its own micro-ritual:
 *
 *  - midday   → Energy Reset (2-min body scan + reset)
 *  - evening  → Gratitude Three (capture three things into journal)
 *  - night    → Sleep Sanctuary (yoga nidra + dream priming)
 *
 * Tapping deeplinks into the appropriate surface so the engine context is preserved.
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sun, Heart, Moon, ArrowRight } from "lucide-react";
import type { TimeSlot } from "@/lib/timeSlots";

interface SlotIntegrationCardProps {
  slot: TimeSlot;
}

const SLOT_CONFIG: Record<
  Exclude<TimeSlot, "morning">,
  {
    icon: React.ElementType;
    label: string;
    title: string;
    body: string;
    cta: string;
    route: string;
  }
> = {
  midday: {
    icon: Sun,
    label: "Energy Reset · 2 min",
    title: "Pause the momentum",
    body: "Body scan + 4 conscious breaths. Notice where the day has landed in you.",
    cta: "Reset now",
    route: "/app/guide?mode=somatic&duration=120&source=midday_integration",
  },
  evening: {
    icon: Heart,
    label: "Gratitude Three",
    title: "Three things from today",
    body: "Small, specific, real. Not what should matter — what actually moved you.",
    cta: "Capture three",
    route: "/app/journal?mode=gratitude&source=evening_integration",
  },
  night: {
    icon: Moon,
    label: "Sleep Sanctuary",
    title: "Set down the day",
    body: "Yoga nidra-style wind-down + dream priming. Let what you carried dissolve.",
    cta: "Begin wind-down",
    route: "/app/guide?mode=yoga_nidra&source=night_integration",
  },
};

export default function SlotIntegrationCard({ slot }: SlotIntegrationCardProps) {
  const navigate = useNavigate();
  if (slot === "morning") return null;
  const cfg = SLOT_CONFIG[slot];
  const Icon = cfg.icon;

  return (
    <motion.button
      onClick={() => navigate(cfg.route)}
      className="w-full text-left glass-card rounded-2xl p-5 border border-border/40 hover:border-primary/30 hover:bg-primary/5 active:scale-[0.99] transition-all"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-[10px] font-display tracking-[0.18em] uppercase text-primary/80">
            {cfg.label}
          </p>
          <p className="text-base font-display font-semibold text-foreground leading-snug">
            {cfg.title}
          </p>
          <p className="text-[13px] font-body text-muted-foreground leading-relaxed">
            {cfg.body}
          </p>
          <div className="flex items-center gap-1.5 pt-1.5 text-primary">
            <span className="text-[11px] font-display tracking-wide">{cfg.cta}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
