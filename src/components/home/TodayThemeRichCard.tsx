/**
 * TodayThemeRichCard — Rich "Today's Theme" card shown when user IS in their
 * active rhythm window (Midday / Evening / Night). Mirrors the layout from the
 * implementation plan:
 *
 *   🪷 TODAY'S THEME — Day N
 *   <Guru> says: "<Theme title>"
 *   <Guru voice paragraph>
 *
 *   📚 Teaching (5 min):  <theme.description / teaching>
 *   🧘 Practice (X min, adapted to Y due to <state>):  <practice>
 *   🔄 Off-App Practice:  <off-app reminder>
 *   ✨ Affirmation:        <affirmation>
 *
 *   [Start Session]   [Remind Me Later]
 *
 * Pure-engine driven — uses theme + plan from useThemeOfDay / useConsciousnessEngine
 * and the user's current guru. Falls back gracefully when fields are missing.
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, BookOpen, Wind, RefreshCw } from "lucide-react";
import type { TimeSlot } from "@/lib/timeSlots";
import MasterVoiceOnTheme from "@/components/home/MasterVoiceOnTheme";

interface ThemeLike {
  id?: string;
  title?: string;
  description?: string;
  affirmation?: string;
  focus_areas?: string[] | unknown;
}

interface PlanLike {
  // adaptive practice info from consciousness engine (todayCard)
  state?: string;          // e.g. "low_energy", "calm", "regression"
  bandName?: string;
  focusDimension?: string;
  guruVoice?: string;      // engine-written guru voice line
  practiceTitle?: string;
  practiceLevel?: string;  // e.g. "L2"
  practiceMinutes?: number;
  adjustedMinutes?: number;
  adjustReason?: string | null;   // why minutes were adjusted
  practiceSteps?: string[];
  offAppPractice?: string;
  teachingSource?: string; // e.g. "Gita 2.14"
  teachingText?: string;   // optional verse / longer teaching
  affirmation?: string;    // engine-chosen affirmation (overrides theme)
}

interface TodayThemeRichCardProps {
  slot: TimeSlot;
  journeyDay?: number;
  guruName?: string;
  guruId?: string;
  guruTradition?: string;
  guruQuote?: string;
  userBand?: number;
  activeLoops?: string[];
  theme?: ThemeLike | null;
  plan?: PlanLike | null;
  onStartSession: () => void;
  onRemindLater?: () => void;
}

const SLOT_ICON: Record<TimeSlot, string> = {
  morning: "🌅",
  midday: "☀️",
  evening: "🌆",
  night: "🌙",
};

const SLOT_CTA: Record<TimeSlot, string> = {
  morning: "Start Morning Session",
  midday: "Start Midday Session",
  evening: "Start Evening Session",
  night: "Start Night Session",
};

export default function TodayThemeRichCard({
  slot,
  journeyDay,
  guruName,
  guruId,
  guruTradition,
  guruQuote,
  userBand,
  activeLoops,
  theme,
  plan,
  onStartSession,
  onRemindLater,
}: TodayThemeRichCardProps) {
  const navigate = useNavigate();
  const guru = guruName || "Your Guide";

  // Fallback chain — engine first, theme second, then static safe defaults
  const themeTitle = theme?.title || "Presence in this moment";
  const themeVoice =
    plan?.guruVoice ||
    theme?.description ||
    "Whatever arose for you today, bring it here. Don't push it away. Sit with it. Notice without naming.";

  const teachingSource = plan?.teachingSource || "Today's contemplation";
  const teachingText =
    plan?.teachingText ||
    theme?.description ||
    "What we resist persists. What we feel, moves through. Today, let what is arise — without fixing.";

  const practiceTitle = plan?.practiceTitle || "Sit & Witness";
  const practiceLevel = plan?.practiceLevel ? ` ${plan.practiceLevel}` : "";
  const practiceMinutes = plan?.practiceMinutes ?? 10;
  const adjustedMinutes = plan?.adjustedMinutes;
  const adjustReason = plan?.adjustReason;
  const practiceSteps =
    plan?.practiceSteps && plan.practiceSteps.length > 0
      ? plan.practiceSteps
      : [
          "Pick ONE feeling alive in you right now",
          "Sit with it for the duration — without trying to fix it",
          "Notice: where is it in the body? What does it want?",
        ];

  const offAppPractice =
    plan?.offAppPractice ||
    "Today, when reactivity arises, pause for 3 seconds. Don't react — just feel.";

  const affirmation =
    plan?.affirmation ||
    theme?.affirmation ||
    "I can be with what is, without becoming it.";

  const showAdjustment =
    typeof adjustedMinutes === "number" &&
    adjustedMinutes !== practiceMinutes;

  return (
    <motion.div
      className="relative glass-card rounded-3xl p-6 md:p-7 border border-primary/15 overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Soft glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🪷</span>
            <p className="text-[10px] font-display tracking-[0.22em] uppercase text-primary/80">
              Today's Theme
              {typeof journeyDay === "number" && journeyDay > 0 && (
                <> — Day {journeyDay}</>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-subtle">
            <span className="text-xs">{SLOT_ICON[slot]}</span>
            <span className="text-[10px] font-display tracking-[0.18em] uppercase text-muted-foreground/80 capitalize">
              {slot}
            </span>
          </div>
        </div>

        {/* Guru voice */}
        <div className="space-y-2">
          <p className="text-[11px] font-display tracking-[0.16em] uppercase text-muted-foreground/80">
            {guru} says
          </p>
          <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground tracking-tight leading-tight">
            "{themeTitle}"
          </h2>
          <p className="text-sm md:text-[15px] font-body text-muted-foreground leading-relaxed italic">
            "{themeVoice}"
          </p>
        </div>

        {/* Master's voice on this theme — lazy AI generation, cached per day */}
        {guruId && guruName && (
          <MasterVoiceOnTheme
            themeId={theme?.id}
            themeTitle={themeTitle}
            themeDescription={theme?.description}
            masterId={guruId}
            masterName={guruName}
            masterTradition={guruTradition}
            masterQuote={guruQuote}
            userBand={userBand}
            activeLoops={activeLoops}
          />
        )}

        {/* Teaching */}
        <div className="glass-subtle rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-primary/70" />
            <p className="text-[10px] font-display tracking-[0.18em] uppercase text-primary/80">
              Teaching · 5 min
            </p>
          </div>
          <p className="text-[11px] font-display text-muted-foreground/80">{teachingSource}</p>
          <p className="text-sm font-body text-foreground leading-snug">{teachingText}</p>
        </div>

        {/* Practice */}
        <div className="glass-subtle rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="w-3.5 h-3.5 text-primary/70" />
              <p className="text-[10px] font-display tracking-[0.18em] uppercase text-primary/80">
                Practice
                {showAdjustment ? (
                  <>
                    {" "}· {practiceMinutes} min →{" "}
                    <span className="text-primary">{adjustedMinutes} min</span>
                  </>
                ) : (
                  <> · {practiceMinutes} min</>
                )}
              </p>
            </div>
          </div>
          {showAdjustment && adjustReason && (
            <p className="text-[10px] font-body text-muted-foreground/70 italic">
              adjusted due to {adjustReason}
            </p>
          )}
          <p className="text-sm font-display font-semibold text-foreground">
            {practiceTitle}
            {practiceLevel}
          </p>
          <ul className="space-y-1 pt-0.5">
            {practiceSteps.slice(0, 4).map((s, i) => (
              <li
                key={i}
                className="text-[13px] font-body text-muted-foreground leading-snug pl-3 relative"
              >
                <span className="absolute left-0 top-2 w-1 h-1 rounded-full bg-primary/40" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Off-app practice */}
        <div className="glass-subtle rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-primary/70" />
            <p className="text-[10px] font-display tracking-[0.18em] uppercase text-primary/80">
              Off-app practice
            </p>
          </div>
          <p className="text-sm font-body text-foreground leading-snug">{offAppPractice}</p>
        </div>

        {/* Affirmation */}
        <div className="rounded-2xl px-4 py-3 border border-primary/20 bg-primary/5">
          <div className="flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary mt-1 shrink-0" />
            <div>
              <p className="text-[10px] font-display tracking-[0.18em] uppercase text-primary/80 mb-1">
                Affirmation
              </p>
              <p className="text-sm font-display font-medium text-foreground leading-snug">
                "{affirmation}"
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            onClick={onStartSession}
            className="flex-1 px-5 py-3.5 rounded-2xl bg-primary text-primary-foreground font-display font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            {SLOT_CTA[slot]}
          </button>
          <button
            onClick={onRemindLater ?? (() => navigate("/app/journal?source=remind_later"))}
            className="flex-1 px-5 py-3.5 rounded-2xl glass-subtle text-foreground font-display font-medium text-sm hover:bg-primary/5 active:scale-[0.98] transition-all border border-border/40"
          >
            Remind me later
          </button>
        </div>
      </div>
    </motion.div>
  );
}
