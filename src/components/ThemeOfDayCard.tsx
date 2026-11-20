import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Eye, BookOpen, Zap, Wind, Coins, Hand, Ban, Moon, Flame, Quote, RotateCw, Play, Clock } from "lucide-react";
import { getCurrentTimeSlot } from "@/lib/timeSlots";

interface ThemeOfDayCardProps {
  theme: {
    title: string;
    description: string;
    affirmation?: string | null;
    focus_areas?: string[] | any;
    theme_rationale?: string;
    learning_focus?: string;
    daily_intentions?: string[];
    action_items?: string[];
    // v4 transformational fields
    felt_sense_opener?: string;
    forbidden_thing?: string;
    evening_close?: string;
    yesterday_bridge?: string;
    spiral_marker?: string;
    tradition_lens?: { sanskrit: string; translation: string; why_today: string } | null;
    chakra_focus?: { sanskrit: string; english: string; opening_practice: string } | null;
  } | null;
  isLoading?: boolean;
  /** Start expanded (e.g. on gate screens) */
  defaultExpanded?: boolean;
  /** Compact variant for gate screens */
  compact?: boolean;
  className?: string;
  /** Journey day number to show progression */
  journeyDay?: number;
  /** Optional active Master id — carried into the session for continuity */
  masterId?: string;
  /** Called when user taps the "Start a practice" CTA at the bottom of the expanded card */
  onStartPractice?: () => void;
}

export default function ThemeOfDayCard({
  theme,
  isLoading = false,
  defaultExpanded = false,
  compact = false,
  className = "",
  journeyDay,
  masterId,
  onStartPractice,
}: ThemeOfDayCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const navigate = useNavigate();
  const noCredits = (theme as any)?._noCredits === true;

  if (!theme && !isLoading) return null;

  const t = theme as any;

  return (
    <motion.div
      className={`glass-card rounded-2xl overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04, duration: 0.6 }}
    >
      {/* Header — always visible */}
      <div
        className="p-4 cursor-pointer glass-card-hover"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <div className={`${compact ? "w-7 h-7" : "w-8 h-8"} rounded-lg bg-primary/10 flex items-center justify-center shrink-0`}>
            <Sparkles className={`${compact ? "w-3.5 h-3.5" : "w-4 h-4"} text-primary`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold mb-0.5 flex items-center gap-2 flex-wrap">
              <span>{compact ? "Today's Intention" : "Theme of the Day"}</span>
              {/* Active Arc badge — takes precedence over journey day */}
              {t?.arc?.arc_title ? (
                <span className="px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] tracking-wider font-bold inline-flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5" />
                  Day {t.arc.day} of {t.arc.total} · {t.arc.phase_label}
                  {t.arc.is_harvest && <span className="ml-1">★</span>}
                  {t.arc.is_rest && <span className="ml-1">·rest</span>}
                </span>
              ) : journeyDay === 1 ? (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 text-[9px] tracking-wider font-bold animate-pulse">
                  Calibration Day
                </span>
              ) : journeyDay && journeyDay > 1 ? (
                <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] tracking-wider font-bold">
                  Day {journeyDay}
                </span>
              ) : null}
            </p>
            {isLoading ? (
              <div className="h-5 w-2/3 rounded skeleton-shimmer" />
            ) : theme ? (
              <h2 className={`${compact ? "text-sm" : "text-base"} font-display font-semibold text-foreground tracking-tight truncate`}>
                {theme.title}
              </h2>
            ) : null}
            {/* Arc progress bar */}
            {t?.arc?.arc_title && t.arc.total > 0 && (
              <div className="mt-1.5 h-1 w-full rounded-full bg-primary/10 overflow-hidden">
                <div
                  className="h-full bg-primary/60 transition-all"
                  style={{ width: `${Math.min(100, (t.arc.day / t.arc.total) * 100)}%` }}
                />
              </div>
            )}
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
          </motion.div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && theme && (
          <motion.div
            className="px-4 pb-5 space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-t border-border/10 pt-4">
              <p className="text-muted-foreground font-body leading-relaxed text-sm max-w-lg">{theme.description}</p>
            </div>

            {/* Yesterday → Today bridge */}
            {t.yesterday_bridge && (
              <div className="flex items-start gap-2 px-1">
                <RotateCw className="w-3.5 h-3.5 text-primary/60 mt-0.5 shrink-0" />
                <p className="text-xs font-body italic text-muted-foreground leading-relaxed">{t.yesterday_bridge}</p>
              </div>
            )}

            {/* Felt-sense opener — somatic cue */}
            {t.felt_sense_opener && (
              <div className="glass-subtle rounded-xl p-3.5 border border-primary/15">
                <div className="flex items-center gap-2 mb-2">
                  <Hand className="w-3.5 h-3.5 text-primary/70" />
                  <p className="text-[10px] font-display tracking-[0.15em] uppercase text-primary/70 font-semibold">Before You Read</p>
                </div>
                <p className="text-xs font-body text-foreground/80 leading-relaxed">{t.felt_sense_opener}</p>
              </div>
            )}

            {/* Chakra focus */}
            {t.chakra_focus?.sanskrit && (
              <div className="glass-subtle rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-3.5 h-3.5 text-primary/70" />
                  <p className="text-[10px] font-display tracking-[0.15em] uppercase text-primary/70 font-semibold">
                    Chakra Focus · {t.chakra_focus.sanskrit} ({t.chakra_focus.english})
                  </p>
                </div>
                <p className="text-xs font-body text-muted-foreground leading-relaxed">{t.chakra_focus.opening_practice}</p>
              </div>
            )}

            {/* Forbidden thing — fast from a pattern */}
            {t.forbidden_thing && (
              <div className="glass-subtle rounded-xl p-3.5 border border-destructive/20">
                <div className="flex items-center gap-2 mb-2">
                  <Ban className="w-3.5 h-3.5 text-destructive/70" />
                  <p className="text-[10px] font-display tracking-[0.15em] uppercase text-destructive/80 font-semibold">Today, do NOT</p>
                </div>
                <p className="text-xs font-body text-foreground/80 leading-relaxed">{t.forbidden_thing}</p>
              </div>
            )}

            {/* Tradition lens */}
            {t.tradition_lens?.sanskrit && (
              <div className="glass-subtle rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <Quote className="w-3.5 h-3.5 text-primary/70" />
                  <p className="text-[10px] font-display tracking-[0.15em] uppercase text-primary/70 font-semibold">Today's Lens</p>
                </div>
                <p className="text-sm font-display text-foreground/90 leading-relaxed">{t.tradition_lens.sanskrit}</p>
                <p className="text-xs font-body italic text-muted-foreground mt-1">{t.tradition_lens.translation}</p>
                {t.tradition_lens.why_today && (
                  <p className="text-[11px] font-body text-muted-foreground/80 mt-2 leading-relaxed">{t.tradition_lens.why_today}</p>
                )}
              </div>
            )}

            {/* Spiral marker — depth across time */}
            {t.spiral_marker && (
              <div className="flex items-start gap-2 px-1">
                <Sparkles className="w-3.5 h-3.5 text-primary/60 mt-0.5 shrink-0" />
                <p className="text-xs font-body text-muted-foreground/90 leading-relaxed">{t.spiral_marker}</p>
              </div>
            )}

            {/* No credits banner */}
            {noCredits && (
              <motion.div
                className="glass-subtle rounded-xl p-4 border border-amber-500/20 bg-amber-500/5 cursor-pointer"
                onClick={() => navigate("/app/credits")}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                    <Coins className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-display font-semibold text-foreground">AI-personalized theme unavailable</p>
                    <p className="text-[10px] font-body text-muted-foreground mt-0.5">
                      Add credits to unlock personalized daily themes, tasks & insights →
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Why this theme */}
            {t.theme_rationale && (
              <div className="glass-subtle rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-3.5 h-3.5 text-primary/70" />
                  <p className="text-[10px] font-display tracking-[0.15em] uppercase text-primary/70 font-semibold">Why This Theme</p>
                </div>
                <p className="text-xs font-body text-muted-foreground leading-relaxed">{t.theme_rationale}</p>
              </div>
            )}

            {/* Today's Learning */}
            {t.learning_focus && (
              <div className="glass-subtle rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-primary/70" />
                  <p className="text-[10px] font-display tracking-[0.15em] uppercase text-primary/70 font-semibold">Today's Insight</p>
                </div>
                <p className="text-xs font-body text-muted-foreground leading-relaxed">{t.learning_focus}</p>
              </div>
            )}

            {/* Today's Intentions */}
            {t.daily_intentions?.length > 0 && (
              <div className="glass-subtle rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-3.5 h-3.5 text-primary/70" />
                  <p className="text-[10px] font-display tracking-[0.15em] uppercase text-primary/70 font-semibold">Today's Intentions</p>
                </div>
                <ul className="space-y-1.5">
                  {(t.daily_intentions as string[]).map((intent: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-body text-muted-foreground">
                      <span className="text-primary/50 mt-0.5">→</span>
                      <span>{intent}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Items */}
            {t.action_items?.length > 0 && (
              <div className="glass-subtle rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="w-3.5 h-3.5 text-primary/70" />
                  <p className="text-[10px] font-display tracking-[0.15em] uppercase text-primary/70 font-semibold">What To Do Today</p>
                </div>
                <ul className="space-y-1.5">
                  {(t.action_items as string[]).map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-body text-muted-foreground">
                      <span className="w-4 h-4 rounded-full border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[8px] text-primary/50">{i + 1}</span>
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Focus areas chips */}
            {Array.isArray(theme.focus_areas) && theme.focus_areas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(theme.focus_areas as string[]).map((area: string) => (
                  <span key={area} className="px-3 py-1 rounded-full glass-subtle text-primary text-xs font-display font-medium tracking-wide">
                    {area}
                  </span>
                ))}
              </div>
            )}

            {/* Evening closing loop */}
            {t.evening_close && (
              <div className="glass-subtle rounded-xl p-3.5 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-3.5 h-3.5 text-primary/70" />
                  <p className="text-[10px] font-display tracking-[0.15em] uppercase text-primary/70 font-semibold">Evening Close</p>
                </div>
                <p className="text-xs font-body italic text-muted-foreground leading-relaxed">{t.evening_close}</p>
              </div>
            )}

            {/* Affirmation */}
            {theme.affirmation && (
              <p className="text-sm font-display italic text-muted-foreground leading-relaxed text-center pt-2">"{theme.affirmation}"</p>
            )}

            {/* Start a practice — engine builds the spiral */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onStartPractice) {
                  onStartPractice();
                  return;
                }
                // Fallback: route to Practice page if no handler given
                navigate('/app/practice');
              }}
              className="w-full mt-2 px-5 py-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent hover:border-primary/50 active:scale-[0.98] transition-all flex items-center gap-3"
            >
              <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">
                <Play className="h-5 w-5" />
              </div>
              <div className="text-left flex-1">
                <div className="font-display font-semibold text-foreground text-sm">Start a practice</div>
                <div className="text-xs text-muted-foreground">Pick how much time you have — engine builds the spiral.</div>
              </div>
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
