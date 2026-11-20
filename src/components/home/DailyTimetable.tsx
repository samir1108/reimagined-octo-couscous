"use client";

import { useEffect, useState, type ComponentType, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { format } from "date-fns";
import {
  Activity,
  BookMarked,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  ListChecks,
  Loader2,
  Moon,
  Pencil,
  Plus,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDayPlan } from "@/hooks/useDayPlan";
import { CircularProgress } from "@/components/design-system";
import {
  dayItemStartRequest,
  formatBlockTime,
  type ActivityKind,
  type DayItemStartRequest,
  type DayPlanBlock,
  type DayPlanItem,
} from "@/lib/dayPlan";

const BLOCK_ICONS: ComponentType<{ className?: string }>[] = [Sunrise, Sun, Sunset, Moon];

const ITEM_ICONS: Record<ActivityKind, ComponentType<{ className?: string }>> = {
  session: Sparkles,
  practice: Activity,
  journal: BookOpen,
  circle: Users,
  task: ListChecks,
  wisdom: BookMarked,
  custom: Plus,
};

const MANUAL_KINDS: ActivityKind[] = ["journal", "circle", "task", "wisdom", "custom"];

const ITEM_SURFACE: Record<DayPlanItem["status"], string> = {
  done: "border-primary/20 bg-primary/[0.045]",
  now: "border-primary/35 bg-[linear-gradient(120deg,hsl(var(--primary)/0.10),hsl(var(--card)/0.45))] shadow-[0_6px_18px_-12px_hsl(var(--primary)/0.55)]",
  missed: "border-border/20 bg-card/15 opacity-65",
  upcoming: "border-border/25 bg-card/25 hover:border-border/45 hover:bg-card/40",
};

const STATUS_BADGE: Record<DayPlanItem["status"], string> = {
  done: "border-primary/20 bg-primary/[0.06] text-primary/65",
  now: "border-primary/40 bg-primary/15 text-primary",
  missed: "border-border/25 bg-muted/20 text-muted-foreground/55",
  upcoming: "border-transparent bg-transparent text-transparent",
};

const STATUS_LABELS: Record<DayPlanItem["status"], string> = {
  done: "Done",
  now: "Now",
  missed: "Missed",
  upcoming: "",
};

interface DailyTimetableProps {
  /**
   * Opens the session flow for a tapped rhythm item. The item's step is passed
   * along so the sitting starts from the card the user actually tapped.
   */
  onStartSession?: (request: DayItemStartRequest) => void | Promise<void>;
  className?: string;
}

export default function DailyTimetable({ onStartSession, className = "" }: DailyTimetableProps) {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { plan, isLoading, addCustomItem, toggleDone } = useDayPlan();

  const [openBlockId, setOpenBlockId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [addingBlockId, setAddingBlockId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftMinutes, setDraftMinutes] = useState("10");
  const [adding, setAdding] = useState(false);
  const [startingItemId, setStartingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (initialized || !plan.blocks.length) return;
    setOpenBlockId(plan.currentBlockId ?? plan.blocks[0].id);
    setInitialized(true);
  }, [initialized, plan.blocks, plan.currentBlockId]);

  const handleItemAction = (item: DayPlanItem) => {
    // Every sittable rhythm item enters the session flow directly with its own
    // step — no intermediate time/energy ask, no dead-end navigation.
    const request = dayItemStartRequest(item);
    if (request && onStartSession) {
      setStartingItemId(item.id);
      Promise.resolve(onStartSession(request)).finally(() => setStartingItemId(null));
      return;
    }
    switch (item.action?.type) {
      case "practice":
        navigate("/app/practice");
        break;
      case "journal":
        navigate("/app/journal");
        break;
      case "wisdom":
        navigate("/app/knowledge");
        break;
      case "task":
      case "custom":
      case "circle":
        toggleDone(item.id);
        break;
      default:
        break;
    }
  };

  const submitCustom = async (event: FormEvent, block: DayPlanBlock) => {
    event.preventDefault();
    const title = draftTitle.trim();
    if (!title || adding) return;
    setAdding(true);
    try {
      await addCustomItem({
        blockId: block.id,
        title,
        minutes: Number(draftMinutes) || 10,
      });
      setDraftTitle("");
      setDraftMinutes("10");
      setAddingBlockId(null);
      setOpenBlockId(block.id);
    } catch (error) {
      console.warn("Could not add day item", error);
    } finally {
      setAdding(false);
    }
  };

  if (isLoading) {
    return (
      <section
        className={cn("glass-1 premium-panel-hover w-full rounded-2xl p-4 sm:p-5", className)}
        aria-busy="true"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-3 w-28 rounded-full bg-muted/25 animate-pulse" />
            <div className="h-5 w-40 rounded-md bg-muted/25 animate-pulse" />
            <div className="h-3 w-24 rounded-full bg-muted/15 animate-pulse" />
          </div>
          <div className="h-14 w-14 rounded-full bg-muted/20 animate-pulse" />
        </div>
        <div className="mt-5 space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-muted/15 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  const currentBlock = plan.blocks.find((block) => block.isCurrent) ?? null;
  const remainingInBlock = currentBlock
    ? currentBlock.items.filter((item) => item.status !== "done" && item.status !== "missed").length
    : 0;
  const headline =
    plan.totalItems === 0
      ? "A clear day ahead"
      : plan.completedItems === plan.totalItems
        ? "Today is complete"
        : `${plan.completedItems} of ${plan.totalItems} done`;

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className={cn(
        "glass-1 premium-panel-hover relative w-full overflow-hidden rounded-2xl p-4 sm:p-5",
        className,
      )}
      aria-labelledby="daily-timetable-title"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--gold-300)/0.45),transparent)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 h-48 w-48 rounded-full bg-primary/[0.06] blur-3xl"
      />

      <header className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-display uppercase tracking-[0.25em] text-muted-foreground/70">
            {format(new Date(), "EEE d MMM")} · Today
          </p>
          <h2
            id="daily-timetable-title"
            className="mt-1 font-editorial text-[1.15rem] leading-snug text-foreground"
          >
            {headline}
          </h2>
          <p className="mt-1 text-[11px] text-muted-foreground/65 tabular-nums">
            {currentBlock ? (
              <>
                {currentBlock.label} · {formatBlockTime(currentBlock.start)}–
                {formatBlockTime(currentBlock.end)}
                {currentBlock.items.length > 0 ? (
                  <span className="text-muted-foreground/45">
                    {"  ·  "}
                    {remainingInBlock === 0 ? "all clear" : `${remainingInBlock} left`}
                  </span>
                ) : null}
              </>
            ) : plan.totalItems === 0 ? (
              "Add anything you want the day to hold."
            ) : (
              "Nothing needs you in this window."
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <CircularProgress
            value={plan.progress / 100}
            size={54}
            strokeWidth={4}
            showLabel
            label={`${plan.progress}%`}
            className="font-display text-primary"
          />
          <button
            type="button"
            onClick={() => navigate("/app/settings#day-plan")}
            className="rounded-full p-1.5 text-muted-foreground/55 transition-colors hover:bg-muted/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Shape your day plan"
            title="Shape your day"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <div className="relative mt-4 h-[3px] w-full overflow-hidden rounded-full bg-muted/35">
        <motion.div
          className="h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--secondary)),hsl(var(--primary)))] shadow-[0_0_12px_hsl(var(--primary)/0.45)]"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(plan.progress, plan.progress > 0 ? 2 : 0)}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="relative mt-4 flex flex-col">
        {plan.blocks.map((block, index) => {
          const BlockIcon = BLOCK_ICONS[index % BLOCK_ICONS.length] ?? Clock;
          const isOpen = openBlockId === block.id;
          const blockDone = block.items.length > 0 && block.completedCount === block.items.length;

          return (
            <div key={block.id} className="relative pl-6">
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-[2px] top-[15px] h-[9px] w-[9px] rounded-full border transition-colors",
                  block.isCurrent
                    ? "border-primary bg-primary shadow-[0_0_14px_hsl(var(--primary)/0.6)]"
                    : blockDone
                      ? "border-primary/60 bg-primary/45"
                      : "border-border/50 bg-background",
                )}
              />
              {index < plan.blocks.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-[6px] top-[27px] w-px bg-[linear-gradient(hsl(var(--border)/0.45),hsl(var(--border)/0.12))]"
                />
              )}

              <button
                type="button"
                onClick={() => setOpenBlockId(isOpen ? null : block.id)}
                aria-expanded={isOpen}
                aria-current={block.isCurrent ? "time" : undefined}
                className={cn(
                  "w-full rounded-xl px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  block.isCurrent
                    ? "bg-primary/[0.055] ring-1 ring-inset ring-primary/15"
                    : "hover:bg-muted/20",
                )}
              >
                <span className="flex items-center gap-2">
                  <BlockIcon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      block.isCurrent
                        ? "text-primary"
                        : blockDone
                          ? "text-primary/60"
                          : "text-muted-foreground/50",
                    )}
                    aria-hidden="true"
                  />
                  <span
                    className={cn(
                      "truncate font-display text-[12.5px] font-medium",
                      block.isCurrent ? "text-foreground" : "text-foreground/85",
                    )}
                  >
                    {block.label}
                  </span>
                  {block.isCurrent && (
                    <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-px text-[9px] font-semibold uppercase tracking-[0.08em] text-primary">
                      Now
                    </span>
                  )}
                  <span className="ml-auto flex shrink-0 items-center gap-2">
                    {block.items.length > 0 && (
                      <span
                        className={cn(
                          "text-[10px] tabular-nums",
                          blockDone ? "text-primary/65" : "text-muted-foreground/45",
                        )}
                      >
                        {block.completedCount}/{block.items.length}
                      </span>
                    )}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 text-muted-foreground/45 transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </span>
                </span>
                <span className="mt-0.5 flex items-center gap-2 pl-6 text-[10.5px] tabular-nums text-muted-foreground/50">
                  <span>
                    {formatBlockTime(block.start)} – {formatBlockTime(block.end)}
                  </span>
                  {blockDone && <span className="text-primary/60">· complete</span>}
                  {!blockDone && block.isPast && block.items.length > 0 && (
                    <span>· {block.items.length - block.completedCount} unmarked</span>
                  )}
                  {block.items.length === 0 && <span>· open</span>}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <ul className="mt-1.5 space-y-1.5 pb-2">
                      {block.items.map((item) => {
                        const ItemIcon = ITEM_ICONS[item.kind];
                        const canTick = MANUAL_KINDS.includes(item.kind);
                        const starting = startingItemId === item.id;
                        return (
                          <li key={item.id}>
                            <div
                              className={cn(
                                "group relative flex items-center gap-2 rounded-xl border px-2.5 py-2 transition-all",
                                ITEM_SURFACE[item.status],
                              )}
                            >
                              {item.status === "now" && (
                                <span
                                  aria-hidden="true"
                                  className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.6)]"
                                />
                              )}
                              <button
                                type="button"
                                onClick={() => handleItemAction(item)}
                                disabled={starting}
                                aria-busy={starting}
                                className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                              >
                                <ItemIcon
                                  className={cn(
                                    "h-4 w-4 shrink-0",
                                    item.status === "done" ? "text-primary/70" : "text-muted-foreground/55",
                                  )}
                                  aria-hidden="true"
                                />
                                <span className="min-w-0 flex-1">
                                  <span
                                    className={cn(
                                      "block truncate font-display text-[12.5px] leading-snug",
                                      item.status === "done"
                                        ? "text-foreground/55 line-through decoration-primary/30"
                                        : "text-foreground/90",
                                    )}
                                  >
                                    {item.title}
                                  </span>
                                  {item.subtitle && (
                                    <span className="mt-px block truncate text-[10.5px] text-muted-foreground/55">
                                      {starting ? "Opening your sitting…" : item.subtitle}
                                    </span>
                                  )}
                                </span>
                                {starting ? (
                                  <Loader2
                                    className="h-3.5 w-3.5 shrink-0 animate-spin text-primary"
                                    aria-hidden="true"
                                  />
                                ) : item.minutes ? (
                                  <span className="shrink-0 rounded-md bg-muted/30 px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground/65">
                                    {item.minutes}m
                                  </span>
                                ) : null}
                                {item.status !== "upcoming" && (
                                  <span
                                    className={cn(
                                      "shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.08em]",
                                      STATUS_BADGE[item.status],
                                    )}
                                  >
                                    {STATUS_LABELS[item.status]}
                                  </span>
                                )}
                              </button>
                              {canTick && (
                                <button
                                  type="button"
                                  onClick={() => toggleDone(item.id)}
                                  aria-label={item.done ? `Mark ${item.title} not done` : `Mark ${item.title} done`}
                                  aria-pressed={item.done}
                                  className={cn(
                                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                    item.done
                                      ? "border-primary/55 bg-primary/20 text-primary"
                                      : "border-border/45 text-transparent hover:border-primary/45 hover:text-muted-foreground/60",
                                  )}
                                >
                                  <Check className="h-3 w-3" aria-hidden="true" />
                                </button>
                              )}
                            </div>
                          </li>
                        );
                      })}

                      {block.items.length === 0 && addingBlockId !== block.id && (
                        <li className="rounded-xl border border-dashed border-border/25 px-3 py-2.5 text-[11px] text-muted-foreground/45">
                          Nothing here yet — keep it open or add something small.
                        </li>
                      )}
                    </ul>

                    {addingBlockId === block.id ? (
                      <form onSubmit={(event) => void submitCustom(event, block)} className="mt-1 space-y-1.5 pb-1">
                        <div className="flex items-center gap-1.5">
                          <input
                            autoFocus
                            value={draftTitle}
                            onChange={(event) => setDraftTitle(event.target.value)}
                            placeholder="Add anything — walk, call, read…"
                            maxLength={64}
                            className="min-w-0 flex-1 rounded-lg border border-border/35 bg-background/60 px-2.5 py-1.5 text-[11.5px] text-foreground placeholder:text-muted-foreground/45 focus:border-primary/50 focus:outline-none"
                          />
                          <input
                            type="number"
                            min={1}
                            max={240}
                            value={draftMinutes}
                            onChange={(event) => setDraftMinutes(event.target.value)}
                            aria-label="Minutes"
                            className="w-14 rounded-lg border border-border/35 bg-background/60 px-2 py-1.5 text-[11.5px] tabular-nums text-foreground focus:border-primary/50 focus:outline-none"
                          />
                          <button
                            type="submit"
                            disabled={!draftTitle.trim() || adding}
                            className="rounded-lg border border-primary/40 bg-primary/15 px-2.5 py-1.5 text-[10px] font-medium text-primary transition-colors disabled:opacity-30"
                          >
                            {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAddingBlockId(null);
                              setDraftTitle("");
                            }}
                            aria-label="Cancel"
                            className="rounded-lg border border-border/30 p-1.5 text-muted-foreground/60 transition-colors hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAddingBlockId(block.id);
                          setDraftTitle("");
                          setDraftMinutes("10");
                        }}
                        className="mb-1 mt-1 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10.5px] text-muted-foreground/55 transition-colors hover:bg-primary/[0.06] hover:text-primary"
                      >
                        <Plus className="h-3 w-3" aria-hidden="true" />
                        Add anything
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => navigate("/app/settings#day-plan")}
        className="mt-3 w-full rounded-lg py-1 text-left text-[10px] text-muted-foreground/40 transition-colors hover:text-muted-foreground/70"
      >
        Blocks, items and density are yours to shape in Settings → Daily Rhythm.
      </button>
    </motion.section>
  );
}
