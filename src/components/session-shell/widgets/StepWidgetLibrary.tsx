import { useMemo, useState } from "react";
import { Button, Input } from "@/design-system";
import { Search, Sparkles, X } from "lucide-react";
import {
  FAMILY_META,
  type StepWidgetDefinition,
  type WidgetFamily,
} from "@/lib/session-shell/widgets/types";
import { STEP_WIDGETS, searchStepWidgets } from "@/lib/session-shell/widgets/catalog";
import { StepWidget } from "./StepWidget";
import { toast } from "sonner";

interface StepWidgetLibraryProps {
  onLaunch?: (definition: StepWidgetDefinition) => void;
  className?: string;
}

const FAMILIES = Array.from(new Set(STEP_WIDGETS.map((widget) => widget.family))) as WidgetFamily[];

export function StepWidgetLibrary({ onLaunch, className }: StepWidgetLibraryProps) {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<WidgetFamily | "all">("all");
  const [maxMinutes, setMaxMinutes] = useState<number | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(STEP_WIDGETS[0]?.id ?? null);

  const results = useMemo(() => {
    const base = query.trim() ? searchStepWidgets(query) : STEP_WIDGETS;
    return base.filter((widget) => {
      if (family !== "all" && widget.family !== family) return false;
      if (maxMinutes !== "all" && widget.durationSeconds > maxMinutes * 60) return false;
      return true;
    });
  }, [query, family, maxMinutes]);

  const selected =
    results.find((widget) => widget.id === selectedId) ??
    STEP_WIDGETS.find((widget) => widget.id === selectedId) ??
    results[0] ??
    STEP_WIDGETS[0];

  return (
    <div className={`flex flex-col gap-4 ${className ?? ""}`}>
      <div className="flex flex-col gap-3 rounded-3xl border border-border/40 bg-card/40 p-4 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Step Widget Library</p>
            <h2 className="mt-1 font-serif text-xl">{STEP_WIDGETS.length} practices, one contract</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {results.length} shown
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by mood, engine, or name…"
            aria-label="Search step widgets"
            className="h-10 rounded-full border-border/40 bg-background/40 pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={family === "all"} onClick={() => setFamily("all")}>All</FilterChip>
          {FAMILIES.map((key) => (
            <FilterChip key={key} active={family === key} onClick={() => setFamily(key)}>
              {FAMILY_META[key].label}
            </FilterChip>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={maxMinutes === "all"} onClick={() => setMaxMinutes("all")}>Any length</FilterChip>
          {[2, 5, 10, 20].map((minutes) => (
            <FilterChip key={minutes} active={maxMinutes === minutes} onClick={() => setMaxMinutes(minutes)}>
              ≤ {minutes} min
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <div className="max-h-[70vh] overflow-y-auto rounded-3xl border border-border/40 bg-card/30 p-2">
          <div className="grid gap-2 sm:grid-cols-2">
            {results.map((widget) => {
              const meta = FAMILY_META[widget.family];
              const active = widget.id === selected?.id;
              return (
                <button
                  key={widget.id}
                  type="button"
                  onClick={() => setSelectedId(widget.id)}
                  aria-pressed={active}
                  className={`flex flex-col gap-1 rounded-2xl border px-3 py-2.5 text-left transition ${
                    active
                      ? "border-primary/40 bg-primary/10"
                      : "border-transparent bg-background/20 hover:border-border/40 hover:bg-background/40"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.accent}`} />
                    <span className="truncate text-sm font-medium">{widget.label}</span>
                    <span className="ml-auto shrink-0 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {Math.max(1, Math.round(widget.durationSeconds / 60))}m
                    </span>
                  </span>
                  <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{widget.description}</span>
                </button>
              );
            })}
            {results.length === 0 && (
              <p className="col-span-full px-4 py-10 text-center text-sm text-muted-foreground">
                No practice matches that search.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border/40 bg-card/30">
          {selected ? (
            <div className="max-h-[70vh] overflow-y-auto p-5">
              <StepWidget
                definition={selected}
                onComplete={(result) => {
                  toast.success(`${selected.label} complete`, {
                    description: result.summary,
                  });
                }}
                onSkip={() => setSelectedId(results[0]?.id ?? null)}
              />
              {onLaunch && (
                <div className="mt-2 flex justify-end">
                  <Button className="rounded-full px-5" onClick={() => onLaunch(selected)}>
                    Use in a step
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="p-8 text-center text-sm text-muted-foreground">Select a practice to preview it.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
        active
          ? "border-primary/40 bg-primary/15 text-foreground"
          : "border-border/40 bg-background/30 text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
