/**
 * SlotHeroCard — world-class slot greeting with breath-paced rune ring
 * and a single primary action. Same shape across slots, different soul.
 */
import { motion } from "framer-motion";
import { Sunrise, Sun, Sunset, Moon, ArrowRight } from "lucide-react";
import { getSlotDesign } from "@/lib/slotDesign";
import type { TimeSlot } from "@/lib/timeSlots";

interface SlotHeroCardProps {
  slot: TimeSlot;
  userName: string;
  streak?: number;
  journeyDay?: number;
  themeTitle?: string;
  onPrimary: () => void;
  /** Optional secondary action (e.g. "5 min Quick") */
  secondaryLabel?: string;
  onSecondary?: () => void;
}

const ICONS = { sunrise: Sunrise, sun: Sun, sunset: Sunset, moon: Moon };

export default function SlotHeroCard({
  slot,
  userName,
  streak,
  journeyDay,
  themeTitle,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: SlotHeroCardProps) {
  const design = getSlotDesign(slot);
  const Icon = ICONS[design.icon];
  const accent = `hsl(${design.accentVar})`;

  return (
    <motion.section
      key={slot}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative rounded-3xl overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, hsl(var(--card) / 0.55), hsl(var(--card) / 0.25))",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: `1px solid hsl(${design.accentVar} / 0.18)`,
        boxShadow: `0 20px 60px -20px hsl(${design.accentVar} / 0.25)`,
      }}
    >
      {/* Top eyebrow row */}
      <div className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
          <span
            className="text-[10px] font-display tracking-[0.28em] uppercase font-semibold"
            style={{ color: accent }}
          >
            {design.room}
          </span>
        </div>
        {journeyDay && (
          <span className="text-[10px] font-display tracking-[0.2em] uppercase text-muted-foreground/60">
            Day {journeyDay}
          </span>
        )}
      </div>

      {/* Rune + breath ring */}
      <div className="relative flex items-center justify-center pt-6 pb-2">
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 140,
            height: 140,
            border: `1px solid hsl(${design.accentVar} / 0.25)`,
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{
            duration: design.breathSeconds * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 100,
            height: 100,
            background: `radial-gradient(circle, hsl(${design.accentVar} / 0.2), transparent 70%)`,
          }}
          animate={{ scale: [1, 1.12, 1] }}
          transition={{
            duration: design.breathSeconds * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <span
          className="relative text-5xl font-display select-none"
          style={{
            color: accent,
            textShadow: `0 0 24px hsl(${design.accentVar} / 0.5)`,
            fontFamily: "'Noto Sans Devanagari', serif",
          }}
        >
          {design.rune}
        </span>
      </div>

      {/* Greeting */}
      <div className="px-6 pt-3 pb-1 text-center">
        <p className="text-[11px] font-display tracking-[0.2em] uppercase text-muted-foreground/70 mb-1.5">
          {design.greeting}, {userName}
        </p>
        <h1 className="text-[26px] md:text-3xl font-display font-light text-foreground leading-tight tracking-tight">
          {themeTitle || design.title}
        </h1>
        <p className="mt-2 text-sm font-body text-muted-foreground/80 max-w-sm mx-auto leading-relaxed">
          {design.invitation}
        </p>
      </div>

      {/* Streak chip */}
      {streak !== undefined && streak > 0 && (
        <div className="flex justify-center pt-3">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-display"
            style={{
              background: `hsl(${design.accentVar} / 0.10)`,
              border: `1px solid hsl(${design.accentVar} / 0.20)`,
              color: accent,
            }}
          >
            🪔 <span>{streak}-day flame</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-5 pt-5 pb-5 flex flex-col gap-2">
        <motion.button
          onClick={onPrimary}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-display font-medium text-[15px] transition-all"
          style={{
            background: `linear-gradient(135deg, hsl(${design.accentVar}), hsl(${design.accentVar} / 0.7))`,
            color: "hsl(var(--primary-foreground))",
            boxShadow: `0 10px 30px -10px hsl(${design.accentVar} / 0.6)`,
          }}
        >
          {design.primaryAction}
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        {secondaryLabel && onSecondary && (
          <button
            onClick={onSecondary}
            className="w-full text-center py-2 text-xs font-display text-muted-foreground hover:text-foreground transition-colors"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </motion.section>
  );
}
