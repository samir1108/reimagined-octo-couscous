import { ArrowRight, BookOpen, Clock3, Moon, Sparkles, Sun, Sunrise, Sunset } from "lucide-react";
import { Button, SectionHeading, Surface } from "@/design-system/primitives";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/design-system";
import type { GateId } from "@/lib/consciousness/dailyGates";

interface TimeMomentSheetProps {
  gate: GateId | null;
  anchorTime?: string | null;
  theme?: {
    title?: string;
    description?: string;
    inner_inquiry?: string;
    micro_practice?: { title?: string; description?: string; duration_min?: number } | null;
  } | null;
  onOpenChange: (open: boolean) => void;
  onBeginSession: (gate: GateId) => void;
  onOpenPractice: (gate: GateId) => void;
  onOpenJournal: (prompt: string) => void;
}

const MOMENTS: Record<GateId, {
  label: string;
  focus: string;
  Icon: typeof Sun;
}> = {
  morning: { label: "Morning", focus: "Begin with intention", Icon: Sunrise },
  midday: { label: "Afternoon", focus: "Find a little space in the day", Icon: Sun },
  evening: { label: "Evening", focus: "Gather what the day held", Icon: Sunset },
  night: { label: "Night", focus: "Let the day settle", Icon: Moon },
};

function formatTime(value?: string | null) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [hours, minutes] = value.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, "0")} ${period}`;
}

export default function TimeMomentSheet({
  gate,
  anchorTime,
  theme,
  onOpenChange,
  onBeginSession,
  onOpenPractice,
  onOpenJournal,
}: TimeMomentSheetProps) {
  const moment = gate ? MOMENTS[gate] : null;
  const practiceTitle = theme?.micro_practice?.title || "A short practice";
  const practiceDescription = theme?.micro_practice?.description
    || (theme?.title ? `A small way to explore “${theme.title}” in this moment.` : "Choose a practice that meets you where you are.");
  const journalPrompt = theme?.inner_inquiry || `What are you noticing in this ${moment?.label.toLowerCase() ?? "moment"}?`;

  return (
    <Dialog open={Boolean(gate)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88dvh] overflow-y-auto border-border bg-background p-5 text-foreground shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-7">
        {moment && gate && (
          <>
            <DialogHeader className="pr-8">
              <p className="mb-1 flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.25em] text-primary/80">
                <moment.Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {moment.label}{formatTime(anchorTime) ? ` · around ${formatTime(anchorTime)}` : ""}
              </p>
              <DialogTitle asChild>
                <h2 className="font-editorial text-3xl font-light text-foreground">{moment.focus}</h2>
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-muted-foreground">
                Choose what would feel useful. Your day’s focus is here when you want it.
              </DialogDescription>
            </DialogHeader>

            {theme?.title && (
              <Surface variant="sacred" padding="md" className="mt-1">
                <SectionHeading
                  eyebrow="Today’s thread"
                  title={theme.title}
                  subtitle={theme.description || "A theme to explore at your own pace."}
                  className="mb-0"
                />
              </Surface>
            )}

            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => onOpenPractice(gate)}
                className="group rounded-2xl border border-primary/20 bg-primary/[0.045] p-4 text-left transition hover:border-primary/40 hover:bg-primary/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/[0.08] text-primary">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-editorial text-xl text-foreground">{practiceTitle}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{practiceDescription}</span>
                    {theme?.micro_practice?.duration_min ? (
                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-primary/75">
                        <Clock3 className="h-3 w-3" aria-hidden="true" />
                        {theme.micro_practice.duration_min} minutes
                      </span>
                    ) : null}
                  </span>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary/65 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => onOpenJournal(journalPrompt)}
                className="group flex min-h-20 items-center gap-3 rounded-2xl border border-border/70 bg-card/40 p-4 text-left transition hover:border-border hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">Write a quick journal</span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">{journalPrompt}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/70 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
            </div>

            <Button
              type="button"
              variant="sacred"
              size="lg"
              onClick={() => onBeginSession(gate)}
              className="w-full"
            >
              Begin a guided session
              <ArrowRight aria-hidden="true" />
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
