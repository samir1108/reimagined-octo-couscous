/**
 * ThemeCard — compact "Today's Thread" title bar that expands into the
 * full designed day on tap: felt-sense opener, why this theme, what will
 * happen, things to notice, evening close, tradition lens, depth progress.
 *
 * Collapsed by default — Home stays minimal: Karma → Theme name → Orb.
 * Lifecycle states get dedicated surfaces:
 *   composing · active (dropdown) · sealed · harvest · rest · cool-down.
 */
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Target, Sparkles, Eye, AlertTriangle, Heart, Brain, Activity, Moon, BookOpen } from "lucide-react";
import { useState } from "react";
import { Heading, Text, Card, Badge, Icon } from "@/components/design-system";

const SECTION_DELAY = 0.08;

export default function ThemeCard({
  theme,
  plan,
  profile,
  gateColor,
  isComposing,
  isSealed,
  isHarvest,
  isRest,
  isCooldown,
}: {
  theme: any;
  plan: any;
  profile: any;
  gateColor: string;
  isComposing: boolean;
  isSealed: boolean;
  isHarvest: boolean;
  isRest: boolean;
  isCooldown: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  // ── Composing: guide is weaving today's thread ──────────────────────────
  if (isComposing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-xl p-4 flex items-center gap-3"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="h-9 w-9 rounded-full border-2 border-primary/30 border-t-primary/80 flex-shrink-0"
        />
        <div>
          <Text variant="body" color="primary" weight="medium">Your guide is composing today…</Text>
          <Text variant="sm" color="muted" className="mt-1">A thread is being woven for you.</Text>
        </div>
      </motion.div>
    );
  }

  if (!theme) return null;

  const t = theme as any;
  const depth = t.current_depth ?? 0;
  const maxDepth = t.max_depth ?? 5;
  const threadInfo = t.sequence_no != null && maxDepth
    ? `Thread ${t.sequence_no} of ${maxDepth}`
    : null;
  const phaseLabel = t.evolution_status
    ? t.evolution_status.charAt(0).toUpperCase() + t.evolution_status.slice(1)
    : null;

  // ── Lifecycle badge helpers — theme name stays visible in every state ────
  const lifecycleBadge = (() => {
    if (isSealed) return { label: "Thread Sealed", mode: "healing" as const, icon: "Sparkles" };
    if (isHarvest) return { label: "Harvest Day", mode: "awakening" as const, icon: "Sparkles" };
    if (isRest) return { label: "Rest Chapter", mode: "sleep" as const, icon: "Moon" };
    if (isCooldown) return { label: "Cool-Down", mode: "shadow" as const, icon: "AlertTriangle" };
    return null;
  })();

  // ── Unified render — theme name always visible, lifecycle shown as badge ──
  const whyText = typeof t.theme_rationale === "string"
    ? t.theme_rationale
    : t.theme_rationale?.whyToday || t.theme_rationale?.summary || t.theme_rationale?.reason || "";

  const whatItems: string[] = [];
  if (Array.isArray(t.daily_intentions)) whatItems.push(...t.daily_intentions);
  if (t.micro_practice?.title) whatItems.push(`${t.micro_practice.title}${t.micro_practice.why ? ` — ${t.micro_practice.why}` : ""}`);
  else if (typeof t.micro_practice === "string" && t.micro_practice) whatItems.push(t.micro_practice);
  if (t.micro_prompt) whatItems.push(t.micro_prompt);
  if (t.recommended_practice?.title) whatItems.push(`Suggested: ${t.recommended_practice.title} (${t.recommended_practice.duration_min} min)`);

  const noticeItems: Array<{ icon: string; text: string }> = [];
  if (t.engagement_question) noticeItems.push({ icon: "Eye", text: t.engagement_question });
  if (t.real_life_trigger) noticeItems.push({ icon: "AlertTriangle", text: t.real_life_trigger });
  if (t.inner_inquiry) noticeItems.push({ icon: "Brain", text: t.inner_inquiry });
  if (t.resistance_warning) noticeItems.push({ icon: "Activity", text: t.resistance_warning });
  if (t.integration) noticeItems.push({ icon: "Heart", text: t.integration });
  if (t.forbidden_thing) noticeItems.push({ icon: "Target", text: t.forbidden_thing });

  const depthPct = maxDepth > 0 ? Math.min(100, (depth / maxDepth) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-gold-500/15 bg-void-100/40 backdrop-blur-xl"
      style={{ borderLeftColor: `hsl(${gateColor})`, borderLeftWidth: "3px" }}
    >
      {/* Tap target — collapsed state shows theme name + lifecycle badge */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full text-left p-4 sm:p-5 flex items-center gap-3 hover:bg-void-100/40 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          {/* Lifecycle badge — replaces the theme name when active */}
          {lifecycleBadge && (
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="mode" mode={lifecycleBadge.mode} dot size="sm" className="gap-1">
                {lifecycleBadge.label}
              </Badge>
            </div>
          )}

          {/* Theme name — always visible */}
          {!lifecycleBadge && (
            <Text variant="micro" color="muted" className="mb-1">
              Today's Thread
              {threadInfo && ` · ${threadInfo}`}
              {phaseLabel && ` · ${phaseLabel}`}
            </Text>
          )}

          <Heading variant="h3" color="primary" weight="semibold" className="truncate">
            {t.title}
          </Heading>

          {/* Small things — one-line teasers always visible at a glance. */}
          {t.felt_sense_opener && (
            <Text variant="sm" color="muted" italic className="mt-1.5 line-clamp-1">
              "{t.felt_sense_opener}"
            </Text>
          )}
          {whatItems[0] && (
            <Text variant="sm" color="secondary" className="mt-1 flex items-start gap-1.5 line-clamp-1">
              <span className="text-primary/60 mt-px">◆</span>
              <span className="truncate">{whatItems[0]}</span>
            </Text>
          )}
          {noticeItems[0] && (
            <Text variant="sm" color="muted" className="mt-1 flex items-start gap-1.5 line-clamp-1">
              <Icon name={noticeItems[0].icon} size="xs" color="primary" className="mt-px flex-shrink-0" />
              <span className="truncate">{noticeItems[0].text}</span>
            </Text>
          )}

          {/* Mini depth line — always visible even when collapsed */}
          <div className="mt-2 flex items-center gap-2">
            <div className="h-[2px] flex-1 rounded-full bg-muted/40 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${depthPct}%` }}
                transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full"
                style={{ background: `hsl(${gateColor})` }}
              />
            </div>
            <Text variant="micro" color="muted" weight="medium" className="uppercase tracking-wider flex-shrink-0">
              {depth}/{maxDepth}
            </Text>
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-void-200/50 flex-shrink-0"
        >
          <Icon name="ChevronDown" size="sm" color="muted" />
        </motion.div>
      </button>

      {/* Dropdown — the full designed day */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="dropdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 space-y-5">
              {/* Felt-sense opener */}
              {t.felt_sense_opener && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: SECTION_DELAY, duration: 0.4 }}
                  className="text-sm text-muted italic leading-relaxed"
                >
                  "{t.felt_sense_opener}"
                </motion.p>
              )}

              {/* Description */}
              {t.description && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: SECTION_DELAY, duration: 0.4 }}
                  className="text-sm text-secondary leading-relaxed"
                >
                  {t.description}
                </motion.p>
              )}

              {/* WHY THIS THEME */}
              {whyText && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: SECTION_DELAY * 2, duration: 0.4 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-[9px] font-display tracking-[0.18em] uppercase text-primary/70">
                    <Icon name="Target" size="xs" color="primary" />
                    <Text variant="micro" color="primary" weight="medium">Why this theme</Text>
                  </div>
                  <Text variant="sm" color="secondary" className="pl-5 border-l border-primary/20 leading-relaxed">
                    {whyText}
                  </Text>
                </motion.div>
              )}

              {/* WHAT WILL HAPPEN */}
              {whatItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: SECTION_DELAY * 3, duration: 0.4 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-[9px] font-display tracking-[0.18em] uppercase text-primary/70">
                    <Icon name="Sparkles" size="xs" color="primary" />
                    <Text variant="micro" color="primary" weight="medium">What will happen</Text>
                  </div>
                  <div className="space-y-1.5 pl-5 border-l border-primary/20">
                    {whatItems.slice(0, 4).map((item, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: SECTION_DELAY * 4 + i * 0.05, duration: 0.35 }}
                        className="text-sm text-secondary leading-relaxed flex items-start gap-2"
                      >
                        <span className="text-primary/60 mt-0.5">◆</span>
                        <span>{item}</span>
                      </motion.p>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* THINGS TO NOTICE TODAY */}
              {noticeItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: SECTION_DELAY * 5, duration: 0.4 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-[9px] font-display tracking-[0.18em] uppercase text-primary/70">
                    <Icon name="Eye" size="xs" color="primary" />
                    <Text variant="micro" color="primary" weight="medium">Things to notice today</Text>
                  </div>
                  <div className="space-y-1.5 pl-5 border-l border-primary/20">
                    {noticeItems.slice(0, 5).map((item, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: SECTION_DELAY * 6 + i * 0.05, duration: 0.35 }}
                        className="text-sm text-secondary leading-relaxed flex items-start gap-2"
                      >
                        <Icon name={item.icon} size="xs" color="primary" className="mt-0.5 flex-shrink-0" />
                        <span>{item.text}</span>
                      </motion.p>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Evening close */}
              {t.evening_close && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: SECTION_DELAY * 7, duration: 0.4 }}
                  className="pt-3 border-t border-gold-500/10"
                >
                  <div className="flex items-center gap-2 text-[9px] font-display tracking-[0.18em] uppercase text-muted-foreground/50 mb-1.5">
                    <Icon name="Moon" size="xs" color="muted" />
                    <Text variant="micro" color="muted" weight="medium">Evening reflection</Text>
                  </div>
                  <Text variant="sm" color="muted" italic className="leading-relaxed">
                    "{t.evening_close}"
                  </Text>
                </motion.div>
              )}

              {/* Tradition lens */}
              {t.tradition_lens && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: SECTION_DELAY * 8, duration: 0.4 }}
                  className="pt-3 border-t border-gold-500/10"
                >
                  <div className="flex items-center gap-2 text-[9px] font-display tracking-[0.18em] uppercase text-muted-foreground/50 mb-1.5">
                    <Icon name="BookOpen" size="xs" color="muted" />
                    <Text variant="micro" color="muted" weight="medium">Tradition lens</Text>
                  </div>
                  <Text variant="sm" color="muted" italic className="leading-relaxed">
                    {t.tradition_lens}
                  </Text>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}