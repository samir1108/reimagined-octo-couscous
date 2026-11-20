import { motion } from "framer-motion";
import { Check, CircleDot, Lock, Sparkles, DoorOpen } from "lucide-react";
import type { ProgressionGate } from "@/lib/dailyProgressionGate";
import { getGateDef } from "@/lib/consciousness/dailyGates";

const EASE = [0.16, 1, 0.3, 1] as const;

function StepRow({ label, status, note }: { label: string; status: "done" | "active" | "open" | "locked"; note?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/25 bg-background/20 px-3 py-2.5">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${
          status === "done" ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300" :
          status === "active" ? "border-primary/40 bg-primary/15 text-primary" :
          status === "locked" ? "border-border/30 bg-muted/20 text-muted-foreground/50" :
          "border-border/30 bg-card/30 text-muted-foreground/70"
        }`}>
          {status === "done" ? <Check className="h-3 w-3" /> : status === "locked" ? <Lock className="h-2.5 w-2.5" /> : <CircleDot className="h-3 w-3" />}
        </span>
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-foreground/85">{label}</p>
          {note ? <p className="text-[10px] text-muted-foreground/65 truncate">{note}</p> : null}
        </div>
      </div>
      <span className="text-[9px] font-display tracking-[0.14em] uppercase text-muted-foreground/55 shrink-0">
        {status === "done" ? "Done" : status === "active" ? "Active" : status === "locked" ? "Later" : "Explore"}
      </span>
    </div>
  );
}

export default function DailyProgressionGateCard({
  gate,
  onEnter,
}: {
  gate: ProgressionGate;
  onEnter: () => void;
}) {
  const gateDef = getGateDef(gate.timeGate);
  const exploration: Array<{ label: string; status: "done" | "active" | "open" | "locked"; note?: string }> = [
    { label: "Morning Practice", status: gate.completion.morningPractice ? "done" : "open", note: "Start the day consciously" },
    { label: "Observation Mission", status: gate.completion.observationMission ? "done" : gate.completion.morningPractice || gate.completion.sitting ? "active" : "open", note: "Observe real-life behaviour" },
    { label: "Wisdom", status: gate.completion.wisdom ? "done" : "open", note: "Understand a concept" },
    { label: "Evening Reflection", status: gate.completion.eveningReflection ? "done" : gate.timeGate === "evening" || gate.timeGate === "night" ? "active" : "open", note: "Integrate discoveries" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: EASE }}
      className="relative overflow-hidden rounded-[28px] border border-primary/25 bg-card/45 shadow-[0_24px_72px_rgba(0,0,0,0.12)]"
      style={{ borderTop: `2px solid hsl(${gateDef.accentColor} / 0.5)` }}
      aria-label="Daily gate"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-8 h-40 w-40 -translate-x-1/2 rounded-full border border-primary/20" />
        <div className="absolute left-1/2 top-3 h-52 w-52 -translate-x-1/2 rounded-full border border-primary/10" />
        <div className="absolute left-1/2 top-16 h-24 w-40 -translate-x-1/2 rounded-t-[999px] border border-primary/25 bg-primary/[0.05]" style={{ boxShadow: "0 0 40px hsl(var(--primary)/0.12)" }} />
      </div>

      <div className="relative px-5 py-6 sm:px-7 sm:py-7">
        <div className="text-center">
          <p className="text-[10px] font-display tracking-[0.28em] uppercase text-primary/75">Your Journey</p>
          <p className="mt-1 text-[11px] font-display tracking-[0.18em] uppercase text-muted-foreground/55">Day {String(gate.day).padStart(2, "0")} · {gate.chapterLabel}</p>
          <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-display tracking-[0.16em] uppercase text-primary/85">
            <Sparkles className="h-3 w-3" />
            {gate.name}
          </div>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-foreground/75">{gate.subtitle}</p>
          <p className="mx-auto mt-1 max-w-2xl text-[15px] leading-7 text-foreground/88">{gate.intention}</p>
          <button
            type="button"
            onClick={onEnter}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_28px_hsl(var(--primary)/0.2)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <DoorOpen className="h-4 w-4" />
            Enter Today’s Gate
          </button>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-border/25 bg-background/15 p-4">
            <p className="text-[9px] font-display tracking-[0.22em] uppercase text-muted-foreground/55">Gate Entry</p>
            <p className="mt-2 text-[12px] leading-6 text-foreground/72"><span className="text-foreground/85">Why this matters:</span> {gate.why}</p>
            <p className="mt-2 text-[12px] leading-6 text-foreground/72"><span className="text-foreground/85">Observe today:</span> {gate.observe}</p>
            <p className="mt-2 text-[12px] leading-6 text-muted-foreground/70">{gate.nextHint}</p>
          </div>
          <div className="rounded-2xl border border-border/25 bg-background/15 p-4">
            <p className="text-[9px] font-display tracking-[0.22em] uppercase text-muted-foreground/55">Today’s Exploration</p>
            <div className="mt-3 space-y-2">
              {exploration.map((item) => <StepRow key={item.label} {...item} />)}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground/70">
          <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1">Karma {gate.karma}</span>
          <span className="rounded-full border border-border/25 bg-card/30 px-3 py-1">Streak {gate.streak} days</span>
          <span className="rounded-full border border-border/25 bg-card/30 px-3 py-1">Discoveries {gate.discoveries}</span>
          <span className="rounded-full border border-border/25 bg-card/30 px-3 py-1">Previous gates stay open</span>
        </div>
      </div>
    </motion.section>
  );
}
