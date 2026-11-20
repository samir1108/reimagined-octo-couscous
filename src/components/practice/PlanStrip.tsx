/**
 * PlanStrip — the visible 30-day horizon.
 * One glance answers: where am I, how much today, what is next.
 */

import type { Prescription, ThirtyDayPlan } from "@/lib/prescription";

interface PlanStripProps {
  plan: ThirtyDayPlan;
  prescription?: Prescription;
  path?: string[];
}

const KIND_LABEL: Record<string, string> = {
  session: "practice",
  rest: "rest",
  review: "review",
  transfer: "carry",
};

export default function PlanStrip({ plan, prescription, path }: PlanStripProps) {
  const arc = prescription?.arc;
  const today = plan.days[0];
  const nextDays = plan.days.slice(0, 7);

  return (
    <section className="rounded-2xl border border-border/40 bg-card/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {plan.title}
          </p>
          <p className="mt-1 truncate text-sm font-medium">
            {arc
              ? `Spiral ${arc.sessionNumber}/${arc.totalSessions} · ${arc.spiralLabel} · Arc day ${arc.arcDay}/${arc.arcLengthDays}`
              : "30-day plan"}
          </p>
          {prescription && (
            <p className="mt-1 text-xs text-muted-foreground">
              {prescription.dose.minutes} min · {prescription.dose.intensity} ·{" "}
              {Math.round(prescription.dose.teachRatio * 100)}% teaching
            </p>
          )}
        </div>
        <span className="shrink-0 rounded-full border border-border/50 px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          {plan.gates.length} gates
        </span>
      </div>

      {prescription?.nextPreview && (
        <p className="mt-3 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          {prescription.nextPreview}
        </p>
      )}

      {path && path.length > 1 && (
        <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground/70">
          Path: {path.map((step) => step.replace(/_/g, " ")).join(" → ")}
        </p>
      )}

      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {nextDays.map((day) => (
          <div
            key={day.day}
            className={`min-w-[74px] rounded-xl border px-2 py-2 text-center ${
              day.locked
                ? "border-border/30 bg-muted/20 text-muted-foreground/60"
                : day.day === today.day
                  ? "border-primary/50 bg-primary/10"
                  : "border-border/40 bg-muted/30"
            }`}
            title={day.gateReason ?? day.label}
          >
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Day {day.day}
            </p>
            <p className="mt-0.5 truncate text-[11px] font-medium">{day.locked ? "Locked" : KIND_LABEL[day.kind]}</p>
            <p className="text-[10px] text-muted-foreground">{day.minutes} min</p>
          </div>
        ))}
      </div>

      <p className="mt-2 text-[10px] text-muted-foreground/70">
        Meditation is noticing, not holding. Pain is information, not progress.
      </p>
    </section>
  );
}
