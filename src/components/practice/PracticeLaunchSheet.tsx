/**
 * PracticeLaunchSheet
 * ───────────────────
 * Bottom sheet that asks "How much time do you have?" then offers:
 *   1. Curated recipes that fit the chosen duration + time slot
 *   2. "Compose your own" power-mode (multi-select practices in order)
 *   3. "Engine pick" — auto-compose from constellation
 *
 * On confirm → captures mood-before → hands the plan to SessionOrchestrator.
 */
import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/design-system";
import { Button } from "@/design-system";
import { Sparkles, Settings2, Clock, Check, X } from "lucide-react";
import { useConstellation } from "@/hooks/useConstellation";
import { useSessionOrchestrator } from "@/contexts/SessionOrchestratorContext";
import { usePracticeRunController } from "@/contexts/PracticeRunControllerContext";
import type { Mood } from "@/hooks/usePracticeRun";
import { PRACTICES, PRACTICE_META, type Practice } from "@/lib/sutra/practices";
import {
  availableDurations,
  composeAuto,
  composeFromPicks,
  composeFromRecipe,
  currentTimeSlot,
} from "@/lib/practice/composer";
import { getRecipesForSlot } from "@/lib/practice/recipes";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const MOODS: Array<{ id: Mood; emoji: string; label: string }> = [
  { id: "tired",     emoji: "😮‍💨", label: "Tired" },
  { id: "stressed",  emoji: "😣",   label: "Stressed" },
  { id: "neutral",   emoji: "😐",   label: "Neutral" },
  { id: "calm",      emoji: "🙂",   label: "Calm" },
  { id: "energised", emoji: "✨",   label: "Open" },
];

function fmtMin(s: number) {
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  if (s < 86400) return `${Math.round(s / 3600)}h`;
  return "24h";
}

type Step = "time" | "choose" | "compose" | "mood";

export default function PracticeLaunchSheet({ open, onOpenChange }: Props) {
  const { constellation } = useConstellation();
  const orchestrator = useSessionOrchestrator();
  const runController = usePracticeRunController();

  const slot = currentTimeSlot();
  const durations = useMemo(() => availableDurations(constellation), [constellation]);
  const [step, setStep] = useState<Step>("time");
  const [duration, setDuration] = useState<number | null>(null);
  const [picks, setPicks] = useState<Practice[]>([]);
  const [pendingPlan, setPendingPlan] = useState<ReturnType<typeof composeAuto> | null>(null);
  const [pendingRecipeId, setPendingRecipeId] = useState<string | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep("time");
      setDuration(null);
      setPicks([]);
      setPendingPlan(null);
      setPendingRecipeId(null);
      setMood(null);
    }
  }, [open]);

  const recipes = useMemo(() => (duration ? getRecipesForSlot(slot, duration) : []), [slot, duration]);

  const handleTimePick = (sec: number) => {
    setDuration(sec);
    setStep("choose");
  };

  const handleEnginePick = () => {
    if (!duration) return;
    setPendingPlan(composeAuto(constellation, duration));
    setPendingRecipeId(null);
    setStep("mood");
  };

  const handleRecipePick = (recipeId: string) => {
    if (!duration) return;
    setPendingPlan(composeFromRecipe(recipeId, duration, constellation?.levels));
    setPendingRecipeId(recipeId);
    setStep("mood");
  };

  const togglePick = (p: Practice) => {
    setPicks((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const handleComposeConfirm = () => {
    if (!duration || picks.length === 0) return;
    setPendingPlan(composeFromPicks(picks, duration, constellation));
    setPendingRecipeId(null);
    setStep("mood");
  };

  const handleStart = async () => {
    if (!pendingPlan || !duration) return;
    const primaryPractice = pendingPlan.blocks[0]?.practice ?? "observe";
    await runController.beginRun({
      recipeId: pendingRecipeId,
      primaryPractice,
      blocks: pendingPlan.blocks,
      plannedDurationSec: duration,
      moodBefore: mood,
      timeSlot: slot,
    });
    onOpenChange(false);
    orchestrator.start(pendingPlan, null);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl border-border/40 bg-background/95 backdrop-blur">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            {step === "time" && "How much time do you have?"}
            {step === "choose" && "Choose your spiral"}
            {step === "compose" && "Compose your own"}
            {step === "mood" && "How are you arriving?"}
          </SheetTitle>
          <SheetDescription className="text-xs">
            {step === "time" && "Pick a duration. Anything from 1 minute to a full day."}
            {step === "choose" && `${fmtMin(duration ?? 0)} · ${slot}`}
            {step === "compose" && "Tap practices in the order you want them."}
            {step === "mood" && "One tap. Optional."}
          </SheetDescription>
        </SheetHeader>

        {/* STEP 1 — Time chips */}
        {step === "time" && (
          <div className="mt-4 flex flex-wrap gap-2">
            {durations.map((d) => (
              <button
                key={d}
                onClick={() => handleTimePick(d)}
                className="rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm font-medium hover:bg-primary/10 hover:border-primary/40 transition"
              >
                {fmtMin(d)}
              </button>
            ))}
          </div>
        )}

        {/* STEP 2 — Choose recipe / engine / compose */}
        {step === "choose" && duration && (
          <div className="mt-4 space-y-3">
            <button
              onClick={handleEnginePick}
              className="w-full rounded-xl border border-primary/30 bg-primary/5 p-3 text-left hover:bg-primary/10 transition"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" /> Engine pick
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Auto-compose from your constellation.</div>
            </button>

            {recipes.map((r) => (
              <button
                key={r.id}
                onClick={() => handleRecipePick(r.id)}
                className="w-full rounded-xl border border-border/60 bg-card/60 p-3 text-left hover:border-primary/40 transition"
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>{r.emoji}</span> {r.label}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{r.description}</div>
              </button>
            ))}

            <button
              onClick={() => setStep("compose")}
              className="w-full rounded-xl border border-dashed border-border/60 p-3 text-left text-xs text-muted-foreground hover:border-primary/40 transition flex items-center gap-2"
            >
              <Settings2 className="h-4 w-4" /> Compose your own (advanced)
            </button>
          </div>
        )}

        {/* STEP 3 — Compose your own */}
        {step === "compose" && duration && (
          <div className="mt-4">
            <div className="grid grid-cols-3 gap-2">
              {PRACTICES.map((p) => {
                const idx = picks.indexOf(p);
                const active = idx !== -1;
                return (
                  <button
                    key={p}
                    onClick={() => togglePick(p)}
                    className={cn(
                      "relative rounded-lg border p-2 text-xs flex flex-col items-center gap-1 transition",
                      active
                        ? "border-primary/60 bg-primary/10"
                        : "border-border/60 bg-card/60 hover:border-primary/30",
                    )}
                  >
                    <span className="text-lg">{PRACTICE_META[p].emoji}</span>
                    <span className="text-[10px] text-muted-foreground">{PRACTICE_META[p].label}</span>
                    {active && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                        {idx + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep("choose")}>Back</Button>
              <Button size="sm" className="flex-1" disabled={picks.length === 0} onClick={handleComposeConfirm}>
                <Check className="h-4 w-4 mr-1" /> Confirm sequence ({picks.length})
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4 — Mood before */}
        {step === "mood" && (
          <div className="mt-4">
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={cn(
                    "rounded-lg border p-2 text-xs flex flex-col items-center gap-1 transition",
                    mood === m.id
                      ? "border-primary/60 bg-primary/10"
                      : "border-border/60 bg-card/60 hover:border-primary/30",
                  )}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleStart}>
                Skip & start
              </Button>
              <Button size="sm" className="flex-1" onClick={handleStart}>
                <Sparkles className="h-4 w-4 mr-1" /> Begin
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
