import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, PenLine } from "lucide-react";
import { format, subDays } from "date-fns";
import type { JournalEntry } from "@/types/database";

interface Props {
  entries: JournalEntry[];
}

export default function JournalRhythmMap({ entries }: Props) {
  const [open, setOpen] = useState(false);
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, index) => {
      const date = subDays(today, 13 - index);
      const key = format(date, "yyyy-MM-dd");
      const dayEntries = entries.filter((entry) => {
        const createdAt = new Date(entry.created_at);
        return !Number.isNaN(createdAt.getTime()) && format(createdAt, "yyyy-MM-dd") === key;
      });

      return {
        key,
        label: format(date, "EEE"),
        count: dayEntries.length,
      };
    });
  }, [entries]);

  const recentCount = days.reduce((sum, day) => sum + day.count, 0);
  const maxCount = Math.max(...days.map((day) => day.count), 1);
  const moodCounts = useMemo(() => {
    const counts = new Map<string, number>();
    entries.forEach((entry) => {
      const mood = entry.mood?.trim();
      if (mood) counts.set(mood, (counts.get(mood) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [entries]);

  return (
    <section className="shrink-0 rounded-2xl border border-border/30 bg-card/35">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <PenLine className="h-3.5 w-3.5 text-primary/75" aria-hidden />
        <span className="flex-1 text-[11px] font-display text-foreground/80">Your journal rhythm</span>
        <span className="text-[10px] tabular-nums text-muted-foreground">
          {recentCount} {recentCount === 1 ? "entry" : "entries"} · 14 days
        </span>
        {open
          ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />}
      </button>

      {open && (
        <div className="border-t border-border/25 px-3 pb-3 pt-2">
          <svg
            viewBox="0 0 336 104"
            className="h-24 w-full"
            role="img"
            aria-label={`Journal entries over the last 14 days. ${recentCount} entries total.`}
          >
            <line x1="8" y1="78" x2="328" y2="78" stroke="hsl(var(--border))" strokeWidth="1" />
            {days.map((day, index) => {
              const x = 10 + index * 23;
              const height = day.count === 0 ? 2 : Math.max(5, (day.count / maxCount) * 55);
              const y = 77 - height;
              return (
                <g key={day.key}>
                  <rect
                    x={x}
                    y={y}
                    width="13"
                    height={height}
                    rx="3"
                    fill={day.count ? "hsl(var(--primary) / 0.72)" : "hsl(var(--muted-foreground) / 0.18)"}
                  >
                    <title>{`${day.key}: ${day.count} ${day.count === 1 ? "entry" : "entries"}`}</title>
                  </rect>
                  {index % 2 === 0 && (
                    <text
                      x={x + 6.5}
                      y="96"
                      textAnchor="middle"
                      className="fill-muted-foreground"
                      fontSize="7"
                    >
                      {day.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[9px] uppercase tracking-wider text-muted-foreground/70">
              Moods recorded
            </span>
            {moodCounts.length > 0 ? moodCounts.map(([mood, count]) => (
              <span
                key={mood}
                className="rounded-full border border-border/40 bg-background/30 px-2 py-0.5 text-[9px] text-muted-foreground"
              >
                {mood} · {count}
              </span>
            )) : (
              <span className="text-[9px] text-muted-foreground/70">No mood notes yet</span>
            )}
          </div>
          <p className="mt-2 text-[9px] text-muted-foreground/60">
            This map counts your saved entries; it does not infer a clinical or physiological measure.
          </p>
        </div>
      )}
    </section>
  );
}
