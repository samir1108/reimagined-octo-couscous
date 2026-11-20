import { useEffect, useState } from "react";
import { Check, Clock, Layers, Loader2, Plus, RotateCcw, Sunrise, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDayPlan } from "@/hooks/useDayPlan";
import {
  DAY_KINDS,
  DAY_KIND_LABELS,
  MAX_DAY_BLOCKS,
  nextDayBlockConfig,
  type ActivityKind,
  type DayBlockConfig,
  type DayDensity,
  type DayPlanConfig,
} from "@/lib/dayPlan";

const DENSITY_OPTIONS: Array<{ value: DayDensity; label: string; hint: string }> = [
  { value: "minimal", label: "Minimal", hint: "2 items per block" },
  { value: "standard", label: "Standard", hint: "4 items per block" },
  { value: "full", label: "Full", hint: "6 items per block" },
];

export default function DayPlanSettings() {
  const { config, wakeTime, sleepTime, isSaving, saveConfig, resetConfig } = useDayPlan();
  const [draft, setDraft] = useState<DayPlanConfig | null>(null);

  useEffect(() => {
    setDraft(config);
  }, [config]);

  useEffect(() => {
    if (window.location.hash !== "#day-plan") return;
    const node = document.getElementById("day-plan");
    node?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (!draft) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading your day…
      </div>
    );
  }

  const updateBlock = (id: string, patch: Partial<DayBlockConfig>) => {
    setDraft((previous) =>
      previous
        ? { ...previous, blocks: previous.blocks.map((block) => (block.id === id ? { ...block, ...patch } : block)) }
        : previous,
    );
  };

  const addBlock = () => {
    const next = nextDayBlockConfig(draft.blocks);
    if (!next) {
      toast.error(`You can keep up to ${MAX_DAY_BLOCKS} blocks.`);
      return;
    }
    setDraft({ ...draft, blocks: [...draft.blocks, next] });
  };

  const removeBlock = (id: string) => {
    if (draft.blocks.length <= 1) {
      toast.error("Keep at least one block.");
      return;
    }
    setDraft({
      ...draft,
      blocks: draft.blocks.filter((block) => block.id !== id),
      customItems: draft.customItems.filter((item) => item.blockId !== id),
    });
  };

  const toggleKind = (kind: ActivityKind) => {
    const enabled = draft.enabledKinds.includes(kind);
    setDraft({
      ...draft,
      enabledKinds: enabled ? draft.enabledKinds.filter((value) => value !== kind) : [...draft.enabledKinds, kind],
    });
  };

  const removeCustom = (id: string) => {
    setDraft({ ...draft, customItems: draft.customItems.filter((item) => item.id !== id) });
  };

  const handleSave = async () => {
    const invalid = draft.blocks.find((block) => block.start === block.end);
    if (invalid) {
      toast.error(`"${invalid.label}" needs different start and end times.`);
      return;
    }
    try {
      await saveConfig({ ...draft, updatedAt: new Date().toISOString() });
      toast.success("Your day is saved — Home will follow this rhythm");
    } catch (error) {
      console.warn("Day plan save failed", error);
      toast.error("Couldn't save your day. Try again.");
    }
  };

  const handleReset = async () => {
    try {
      const next = await resetConfig();
      setDraft(next);
      toast.success("Back to the recommended rhythm");
    } catch (error) {
      console.warn("Day plan reset failed", error);
      toast.error("Couldn't reset. Try again.");
    }
  };

  return (
    <div id="day-plan">
      <div className="flex items-center gap-2 mb-1">
        <Sunrise className="h-4 w-4 text-primary" />
        <h3 className="font-display text-base text-foreground">Your Day</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        Shape the timetable Home shows you. Split the day into up to {MAX_DAY_BLOCKS} blocks, choose what
        appears in each, and add anything of your own.
      </p>

      <div className="flex items-center gap-1.5 mb-2">
        <Layers className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Blocks · {draft.blocks.length}/{MAX_DAY_BLOCKS}
        </span>
      </div>

      <div className="space-y-2">
        {draft.blocks.map((block) => (
          <div key={block.id} className="rounded-xl border border-border/30 bg-card/30 p-2.5">
            <div className="flex items-center gap-2">
              <input
                value={block.label}
                onChange={(event) => updateBlock(block.id, { label: event.target.value.slice(0, 32) })}
                aria-label="Block name"
                className="min-w-0 flex-1 rounded-lg border border-border/30 bg-background/50 px-2.5 py-1.5 text-[12px] text-foreground focus:outline-none focus:border-primary/50"
              />
              <button
                type="button"
                onClick={() => removeBlock(block.id)}
                aria-label={`Remove ${block.label}`}
                className="rounded-lg border border-border/30 p-1.5 text-muted-foreground/50 hover:text-destructive hover:border-destructive/40 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <Clock className="h-3 w-3 shrink-0 text-muted-foreground/50" />
              <input
                type="time"
                value={block.start}
                onChange={(event) => updateBlock(block.id, { start: event.target.value })}
                aria-label={`${block.label} start time`}
                className="min-w-0 flex-1 rounded-lg border border-border/30 bg-background/50 px-2 py-1.5 text-[11px] text-foreground focus:outline-none focus:border-primary/50"
              />
              <span className="text-[10px] text-muted-foreground/50">to</span>
              <input
                type="time"
                value={block.end}
                onChange={(event) => updateBlock(block.id, { end: event.target.value })}
                aria-label={`${block.label} end time`}
                className="min-w-0 flex-1 rounded-lg border border-border/30 bg-background/50 px-2 py-1.5 text-[11px] text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addBlock}
        disabled={draft.blocks.length >= MAX_DAY_BLOCKS}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border/40 px-3 py-2 text-[11px] text-muted-foreground hover:text-primary hover:border-primary/40 disabled:opacity-30 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" /> Add block
      </button>

      <div className="mt-5">
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">What appears</span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DAY_KINDS.map((kind) => {
            const active = draft.enabledKinds.includes(kind);
            return (
              <button
                key={kind}
                type="button"
                onClick={() => toggleKind(kind)}
                className={`rounded-full border px-2.5 py-1.5 text-[10px] transition-colors ${
                  active
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border/30 bg-background/40 text-muted-foreground/60 hover:border-border/60"
                }`}
                aria-pressed={active}
              >
                {active ? "✓ " : ""}
                {DAY_KIND_LABELS[kind]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Density</span>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {DENSITY_OPTIONS.map((option) => {
            const active = draft.density === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setDraft({ ...draft, density: option.value })}
                className={`rounded-xl border px-2 py-2 text-center transition-colors ${
                  active
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border/30 bg-background/40 text-muted-foreground/60 hover:border-border/60"
                }`}
                aria-pressed={active}
              >
                <span className="block text-[11px] font-display">{option.label}</span>
                <span className="block text-[9px] opacity-70">{option.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      {draft.customItems.length > 0 && (
        <div className="mt-5">
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Your own items</span>
          <ul className="mt-2 space-y-1.5">
            {draft.customItems.map((item) => {
              const block = draft.blocks.find((candidate) => candidate.id === item.blockId);
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-2 rounded-xl border border-border/30 bg-card/25 px-2.5 py-2"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] text-foreground/85">{item.title}</span>
                    <span className="block text-[9px] text-muted-foreground/50">
                      {block?.label ?? "Removed block"} · {item.minutes}m · {item.repeat}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCustom(item.id)}
                    aria-label={`Remove ${item.title}`}
                    className="rounded-lg border border-border/30 p-1.5 text-muted-foreground/50 hover:text-destructive hover:border-destructive/40 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-display text-sm tracking-wide flex items-center gap-2 disabled:opacity-30 hover:bg-primary/90 transition"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {isSaving ? "Saving…" : "Save my day"}
        </button>
        <button
          type="button"
          onClick={() => void handleReset()}
          disabled={isSaving}
          className="px-4 py-2.5 rounded-full border border-border/40 text-muted-foreground font-display text-xs flex items-center gap-2 hover:text-foreground hover:border-border/70 disabled:opacity-30 transition"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      <p className="mt-2 text-[10px] text-muted-foreground/50">
        Defaults follow your wake ({wakeTime ?? "06:30"}) and sleep ({sleepTime ?? "22:30"}) times from Daily
        Rhythm.
      </p>
    </div>
  );
}
