/**
 * StepGuidance — long-form, step-by-step guidance for a session step.
 *
 * Renders beats as a numbered sequence, plus effort, what-you-may-notice,
 * contingency plans, variations, safety notes, a "done when" definition,
 * pitfalls and a closing carry-into-the-day.
 *
 * Collapsed by default so the cinematic step frame stays clean; the beat
 * count is always visible on the trigger. Has a "Read aloud" affordance so
 * the guidance can be followed with the eyes closed.
 */
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  BookOpen,
  ChevronDown,
  Eye,
  GitBranch,
  Layers,
  Lightbulb,
  ListOrdered,
  ShieldAlert,
  Volume2,
  VolumeX,
} from "lucide-react";
import { StepGuidance as StepGuidanceModel } from "@/lib/session-shell/types";
import { useOptionalSessionShell } from "@/lib/session-shell/SessionShellContext";
import { useStepNarration } from "@/hooks/useStepNarration";

export function StepGuidance({ guidance }: { guidance: StepGuidanceModel }) {
  const shell = useOptionalSessionShell();
  const [speakOn, setSpeakOn] = useState(false);

  const hasBeats = Array.isArray(guidance.beats) && guidance.beats.length > 0;

  // Read-aloud script: narration where authored, else the beat detail.
  const spokenText = useMemo(() => {
    const parts: string[] = [];
    if (guidance.summary) parts.push(guidance.summary);
    for (const b of guidance.beats ?? []) {
      const line = (b.narration ?? b.detail ?? "").trim();
      if (line) parts.push(b.title ? `${b.title}. ${line}` : line);
    }
    if (guidance.doneWhen) parts.push(`Done well when ${guidance.doneWhen}`);
    return parts.join(" ");
  }, [guidance]);

  useStepNarration({
    text: spokenText || null,
    guruId: shell?.plan?._meta?.archetype ?? undefined,
    enabled: speakOn && Boolean(spokenText),
  });

  const hasBody =
    hasBeats ||
    (guidance.cues?.length ?? 0) > 0 ||
    (guidance.pitfalls?.length ?? 0) > 0 ||
    (guidance.whatYouMayNotice?.length ?? 0) > 0 ||
    (guidance.ifThen?.length ?? 0) > 0 ||
    (guidance.variations?.length ?? 0) > 0 ||
    (guidance.safety?.length ?? 0) > 0 ||
    Boolean(guidance.doneWhen) ||
    Boolean(guidance.misconception) ||
    Boolean(guidance.after);

  if (!hasBody) return null;

  return (
    <details className="group mt-6 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-xl">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2.5 text-xs uppercase tracking-[0.24em] text-muted-foreground">
          <ListOrdered className="h-3.5 w-3.5" />
          How to do this step
          {hasBeats && (
            <span className="normal-case tracking-normal text-muted-foreground/60">
              ({guidance.beats.length} {guidance.beats.length === 1 ? "part" : "parts"})
            </span>
          )}
          {guidance.effort ? (
            <span className="flex normal-case items-center gap-[3px]" aria-label={`Effort ${guidance.effort} of 5`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={`h-1 w-1 rounded-full ${n <= guidance.effort! ? "bg-amber-300/80" : "bg-border/60"}`}
                />
              ))}
            </span>
          ) : null}
        </span>
        <span className="flex items-center gap-1">
          <button
            type="button"
            aria-label={speakOn ? "Stop reading aloud" : "Read this step aloud"}
            onClick={(e) => { e.preventDefault(); setSpeakOn((v) => !v); }}
            className="rounded-full border border-border/40 bg-background/40 p-1.5 text-muted-foreground backdrop-blur transition hover:text-foreground"
          >
            {speakOn ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180" />
        </span>
      </summary>

      <div className="border-t border-border/30 px-5 py-5 sm:px-6">
        {guidance.summary && (
          <p className="mb-5 text-sm leading-relaxed text-foreground/80">
            {guidance.summary}
          </p>
        )}

        {hasBeats && (
          <ol className="space-y-5">
            {guidance.beats.map((beat, i) => (
              <li key={i} className="flex gap-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/50 bg-background/60 text-[11px] font-medium tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  {beat.title && (
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-medium text-foreground">{beat.title}</h4>
                      {typeof beat.seconds === "number" && beat.seconds > 0 && (
                        <span className="rounded-full border border-border/40 bg-background/50 px-2 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                          {formatSeconds(beat.seconds)}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {beat.detail}
                  </p>
                  {beat.narration && (
                    <p className="mt-1.5 flex items-start gap-1.5 text-xs italic leading-relaxed text-muted-foreground/60">
                      <Volume2 className="mt-0.5 h-3 w-3 shrink-0" />
                      {beat.narration}
                    </p>
                  )}
                  {beat.source && (
                    <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-amber-300/70">
                      <BookOpen className="mt-0.5 h-3 w-3 shrink-0" />
                      {beat.source}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}

        {guidance.misconception && (
          <Callout tone="amber" icon={<Lightbulb className="h-3 w-3" />} label="The common mistake">
            {guidance.misconception}
          </Callout>
        )}

        {guidance.whatYouMayNotice && guidance.whatYouMayNotice.length > 0 && (
          <Callout tone="slate" icon={<Eye className="h-3 w-3" />} label="What you may notice">
            <ul className="space-y-1.5">
              {guidance.whatYouMayNotice.map((n, i) => (
                <li key={i} className="text-sm leading-relaxed text-foreground/75">· {n}</li>
              ))}
            </ul>
          </Callout>
        )}

        {guidance.ifThen && guidance.ifThen.length > 0 && (
          <Callout tone="sky" icon={<GitBranch className="h-3 w-3" />} label="If this happens">
            <ul className="space-y-2.5">
              {guidance.ifThen.map((it, i) => (
                <li key={i} className="text-sm leading-relaxed">
                  <span className="text-foreground/85">{it.when}</span>
                  <span className="mx-1.5 text-sky-300/60">→</span>
                  <span className="text-muted-foreground">{it.then}</span>
                </li>
              ))}
            </ul>
          </Callout>
        )}

        {guidance.variations && guidance.variations.length > 0 && (
          <Callout tone="violet" icon={<Layers className="h-3 w-3" />} label="Variations">
            <dl className="space-y-2.5">
              {guidance.variations.map((v, i) => (
                <div key={i}>
                  <dt className="text-xs font-medium uppercase tracking-wider text-violet-200/80">{v.label}</dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{v.detail}</dd>
                </div>
              ))}
            </dl>
          </Callout>
        )}

        {guidance.safety && guidance.safety.length > 0 && (
          <Callout tone="rose" icon={<ShieldAlert className="h-3 w-3" />} label="Do not push through">
            <ul className="space-y-1.5">
              {guidance.safety.map((s, i) => (
                <li key={i} className="text-sm leading-relaxed text-foreground/75">· {s}</li>
              ))}
            </ul>
          </Callout>
        )}

        {guidance.cues && guidance.cues.length > 0 && (
          <Callout tone="slate" icon={<Activity className="h-3 w-3" />} label="Remember">
            <ul className="space-y-1.5">
              {guidance.cues.map((cue, i) => (
                <li key={i} className="text-sm leading-relaxed text-foreground/75">· {cue}</li>
              ))}
            </ul>
          </Callout>
        )}

        {guidance.doneWhen && (
          <Callout tone="emerald" label="Done well when">
            {guidance.doneWhen}
          </Callout>
        )}

        {guidance.pitfalls && guidance.pitfalls.length > 0 && (
          <Callout tone="slate" label="Watch out for">
            <ul className="space-y-1.5">
              {guidance.pitfalls.map((p, i) => (
                <li key={i} className="text-sm leading-relaxed text-foreground/75">· {p}</li>
              ))}
            </ul>
          </Callout>
        )}

        {guidance.after && (
          <Callout tone="amber" label="After this step">
            <dl className="space-y-2.5">
              {guidance.after.carryIntoDay && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-amber-200/80">Carry into the day</dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{guidance.after.carryIntoDay}</dd>
                </div>
              )}
              {guidance.after.journalPrompt && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-amber-200/80">Journal prompt</dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{guidance.after.journalPrompt}</dd>
                </div>
              )}
              {guidance.after.restNote && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-amber-200/80">Coming back</dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{guidance.after.restNote}</dd>
                </div>
              )}
            </dl>
          </Callout>
        )}
      </div>
    </details>
  );
}

// ─── Callout ─────────────────────────────────────────────────────────────────

const CALL_TONES: Record<string, string> = {
  slate:   "border-border/30 bg-background/40 text-muted-foreground",
  amber:   "border-amber-500/25 bg-amber-500/5 text-amber-300/80",
  emerald: "border-emerald-500/25 bg-emerald-500/5 text-emerald-300/80",
  rose:    "border-rose-500/25 bg-rose-500/5 text-rose-300/80",
  sky:     "border-sky-500/25 bg-sky-500/5 text-sky-300/80",
  violet:  "border-violet-500/25 bg-violet-500/5 text-violet-300/80",
};

function Callout({
  tone = "slate",
  icon,
  label,
  children,
}: {
  tone?: keyof typeof CALL_TONES;
  icon?: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={`mt-4 rounded-xl border px-4 py-3 ${CALL_TONES[tone]}`}>
      <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.24em]">
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}

function formatSeconds(total: number): string {
  if (total < 60) return `${total}s`;
  const m = Math.floor(total / 60);
  const s = total % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}
