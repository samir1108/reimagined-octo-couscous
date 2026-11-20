import { useMemo, useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookMarked,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Circle,
  ListChecks,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Users,
  Clock,
} from "lucide-react";
import { useDayPlan } from "@/hooks/useDayPlan";
import {
  dayItemStartRequest,
  formatBlockTime,
  type ActivityKind,
  type DayItemStartRequest,
  type DayPlanItem,
} from "@/lib/dayPlan";

const BLOCK_ICONS: ComponentType<{ className?: string }>[] = [Sunrise, Sun, Sunset, Moon];

const ITEM_ICONS: Record<ActivityKind, ComponentType<{ className?: string }>> = {
  session: Sparkles,
  practice: Sun,
  journal: BookOpen,
  circle: Users,
  task: ListChecks,
  wisdom: BookMarked,
  custom: Plus,
};

export function ThemeDayRhythm({
  onStartSession,
  className = "",
}: {
  onStartSession?: (request: DayItemStartRequest) => void | Promise<void>;
  className?: string;
}) {
  const navigate = useNavigate();
  const { plan, isLoading, toggleDone } = useDayPlan();
  const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>({});

  const currentBlock = plan.blocks.find((block) => block.isCurrent) ?? null;
  const nextItem = useMemo(() => {
    const inCurrent = currentBlock?.items.find(
      (item) => item.status !== "done" && item.status !== "missed",
    );
    return (
      inCurrent ||
      plan.blocks.flatMap((block) => block.items).find((item) => item.status === "upcoming") ||
      null
    );
  }, [currentBlock, plan.blocks]);

  const runItem = (item: DayPlanItem) => {
    const request = dayItemStartRequest(item);
    if (request && onStartSession) {
      void onStartSession(request);
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
      default:
        toggleDone(item.id);
        break;
    }
  };

  if (isLoading) {
    return (
      <div className={`rounded-2xl border border-border/40 bg-card/40 p-4 ${className}`} aria-busy="true">
        <div className="h-3 w-28 animate-pulse rounded-full bg-muted/25" />
        <div className="mt-3 h-1.5 w-full animate-pulse rounded-full bg-muted/15" />
        <div className="mt-4 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-xl bg-muted/15" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-border/40 bg-card/40 p-4 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-display uppercase tracking-[0.2em] text-primary/85">
          Today's rhythm
        </p>
        <span className="text-[11px] tabular-nums text-muted-foreground/90">
          {plan.totalItems > 0 ? `${plan.completedItems} of ${plan.totalItems} done` : "Open day"}
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/30">
        <div
          className="h-full rounded-full bg-primary/75 transition-[width] duration-500"
          style={{ width: `${Math.max(plan.progress, plan.progress > 0 ? 3 : 0)}%` }}
        />
      </div>

      {nextItem && (
        <button
          type="button"
          onClick={() => runItem(nextItem)}
          className="mt-3 flex w-full items-center gap-2.5 rounded-xl border border-primary/30 bg-[linear-gradient(120deg,hsl(var(--primary)/0.12),hsl(var(--card)/0.4))] px-3 py-2.5 text-left transition-colors hover:border-primary/50"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Clock className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[9px] font-display uppercase tracking-[0.18em] text-primary/80">
              Next
            </span>
            <span className="block truncate text-sm text-foreground/90">{nextItem.title}</span>
          </span>
          {nextItem.minutes ? (
            <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground/85">
              {nextItem.minutes}m
            </span>
          ) : null}
        </button>
      )}

      <div className="mt-3 space-y-1.5">
        {plan.blocks.map((block, blockIndex) => {
          const Icon = BLOCK_ICONS[blockIndex % BLOCK_ICONS.length] || Sun;
          const open = openBlocks[block.id] ?? block.isCurrent;
          const remaining = block.items.filter(
            (item) => item.status !== "done" && item.status !== "missed",
          ).length;
          return (
            <div
              key={block.id}
              className={`overflow-hidden rounded-xl border ${
                block.isCurrent ? "border-primary/35 bg-primary/[0.045]" : "border-border/30 bg-background/25"
              }`}
            >
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenBlocks((prev) => ({ ...prev, [block.id]: !open }))}
                className="flex min-h-11 w-full items-center gap-2.5 px-3 py-2 text-left"
              >
                <Icon className={`h-4 w-4 shrink-0 ${block.isCurrent ? "text-primary" : "text-muted-foreground/80"}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-foreground/90">
                    {block.label}
                    {block.isCurrent ? (
                      <span className="ml-2 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">
                        now
                      </span>
                    ) : null}
                  </span>
                  <span className="block text-[10px] text-muted-foreground/75">
                    {formatBlockTime(block.start)} – {formatBlockTime(block.end)}
                    {block.items.length > 0
                      ? ` · ${block.completedCount}/${block.items.length} done`
                      : " · open"}
                  </span>
                </span>
                {remaining > 0 && !block.isPast ? (
                  <span className="shrink-0 text-[10px] text-muted-foreground/75">{remaining}</span>
                ) : null}
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 text-muted-foreground/70 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>

              {open && (
                <div className="space-y-1 border-t border-border/25 px-2 py-1.5">
                  {block.items.length === 0 && (
                    <p className="px-2 py-1.5 text-[11px] italic text-muted-foreground/75">
                      Nothing fixed here. Let the block stay open.
                    </p>
                  )}
                  {block.items.map((item) => {
                    const ItemIcon = ITEM_ICONS[item.kind] || Circle;
                    const done = item.status === "done";
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => runItem(item)}
                        className={`flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-left transition-colors hover:bg-muted/25 ${
                          done ? "opacity-55" : ""
                        }`}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                          {done ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400/90" />
                          ) : (
                            <ItemIcon className="h-3.5 w-3.5 text-muted-foreground/85" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block truncate text-xs ${done ? "line-through" : "text-foreground/85"}`}>
                            {item.title}
                          </span>
                          {item.subtitle && (
                            <span className="block truncate text-[10px] text-muted-foreground/70">
                              {item.subtitle}
                            </span>
                          )}
                        </span>
                        {item.minutes ? (
                          <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground/75">
                            {item.minutes}m
                          </span>
                        ) : null}
                        {!done && item.status === "now" ? (
                          <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-primary">
                            now
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ThemeDayRhythm;
