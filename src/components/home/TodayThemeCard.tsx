import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Clock, Moon, Sparkles, Sun, Sunrise, Sunset } from "lucide-react";
import { useDayPlan } from "@/hooks/useDayPlan";

function slotIcon(label?: string) {
  const value = (label || "").toLowerCase();
  if (value.includes("night") || value.includes("sleep")) return Moon;
  if (value.includes("evening") || value.includes("sunset")) return Sunset;
  if (value.includes("morning") || value.includes("dawn")) return Sunrise;
  return Sun;
}

export interface TodayThemeCardProps {
  theme: any | null;
  plan: any | null;
  profile: any | null;
  guru?: { name: string; image?: string } | null;
  journeyDay?: number | null;
  slotLabel?: string | null;
  practiceTitle?: string | null;
  practiceMinutes?: number | null;
  vLevel?: number | null;
  onOpen: () => void;
}

export function TodayThemeCard({
  theme,
  plan,
  profile,
  guru,
  journeyDay,
  slotLabel,
  practiceTitle,
  practiceMinutes,
  vLevel,
  onOpen,
}: TodayThemeCardProps) {
  const reducedMotion = useReducedMotion();
  const { plan: dayPlan } = useDayPlan();

  const title = theme?.title || plan?.todayCard?.title || plan?.state || "Presence";
  const description = theme?.description || plan?.todayCard?.description || "";
  const loops = Array.isArray(profile?.active_loops)
    ? profile.active_loops.filter((l: unknown) => typeof l === "string")
    : [];
  const SlotIcon = slotIcon(slotLabel);
  const currentBlock = dayPlan.blocks.find((block) => block.isCurrent) ?? null;
  const nextItem =
    currentBlock?.items.find((item) => item.status !== "done" && item.status !== "missed") ||
    dayPlan.blocks.flatMap((block) => block.items).find((item) => item.status === "upcoming") ||
    null;
  const rhythmLine = currentBlock
    ? `Now · ${currentBlock.label}`
    : dayPlan.totalItems > 0 && dayPlan.completedItems === dayPlan.totalItems
      ? "Today complete"
      : "A clear day ahead";

  return (
    <motion.button
      initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      onClick={onOpen}
      className="glass-1 premium-panel-hover group relative w-full max-w-sm overflow-hidden rounded-2xl p-4 text-left"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-primary/[0.07] blur-3xl"
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground/80">
            Today's Theme{journeyDay ? ` · Day ${journeyDay}` : ""}
          </p>
          <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/85">
            Briefing <ChevronRight className="h-3 w-3" />
          </span>
        </div>

        <div className="mt-1.5 flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(160deg,hsl(var(--primary)/0.22),hsl(var(--primary)/0.05))] shadow-[0_0_18px_hsl(var(--primary)/0.14)]">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="font-editorial text-[1.15rem] font-medium leading-snug text-foreground">
              {title}
            </h2>
            {description && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground/90">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {slotLabel && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-card/40 px-2 py-0.5 text-[10px] text-foreground/80">
              <SlotIcon className="h-3 w-3 text-primary/80" /> {slotLabel}
            </span>
          )}
          {practiceTitle && (
            <span className="inline-flex max-w-[13rem] items-center gap-1 truncate rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] text-primary/90">
              <Clock className="h-3 w-3" />
              {practiceTitle}
              {practiceMinutes ? ` · ${practiceMinutes}m` : ""}
            </span>
          )}
          {loops.length > 0 && (
            <span className="inline-flex max-w-[10rem] items-center gap-1 truncate rounded-full border border-border/40 bg-card/40 px-2 py-0.5 text-[10px] text-muted-foreground/90">
              {loops.length} active {loops.length === 1 ? "loop" : "loops"}
            </span>
          )}
          {typeof vLevel === "number" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-card/40 px-2 py-0.5 text-[10px] tabular-nums text-muted-foreground/90">
              V-Level {vLevel.toFixed(1)}
            </span>
          )}
          {typeof theme?.current_depth === "number" && theme.current_depth > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-card/40 px-2 py-0.5 text-[10px] tabular-nums text-muted-foreground/90">
              Theme depth {theme.current_depth}
              {typeof theme?.max_depth === "number" ? `/${theme.max_depth}` : ""}
            </span>
          )}
        </div>

        {guru?.name && (
          <div className="mt-2.5 flex items-center gap-2">
            {guru.image ? (
              <img
                src={guru.image}
                alt=""
                className="h-5 w-5 rounded-full border border-primary/25 object-cover"
              />
            ) : null}
            <p className="truncate text-[11px] text-muted-foreground/90">
              Held by <span className="text-foreground/85">{guru.name}</span>
            </p>
          </div>
        )}

        <div className="mt-3 border-t border-border/25 pt-2.5">
          <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground/85">
            <span className="truncate">{rhythmLine}</span>
            <span className="shrink-0 tabular-nums text-foreground/80">
              {dayPlan.totalItems > 0 ? `${dayPlan.completedItems}/${dayPlan.totalItems} done` : "Routine ready"}
            </span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted/35">
            <motion.div
              className="h-full rounded-full bg-primary/75"
              initial={false}
              animate={{ width: `${Math.max(dayPlan.progress, dayPlan.progress > 0 ? 3 : 0)}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          {nextItem && (
            <p className="mt-1.5 truncate text-[10px] text-muted-foreground/75">
              Next · {nextItem.title}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export default TodayThemeCard;
