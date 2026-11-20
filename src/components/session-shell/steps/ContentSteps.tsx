import { useSessionShell } from "@/lib/session-shell/SessionShellContext";
import { StepFrame } from "./StepFrame";
import { JapCounter } from "../widgets";
import { VisualizationCanvas } from "../widgets";
import { AudioPlayer } from "../widgets";
import { ExperimentInterface } from "../widgets";
import { TimerWidget } from "../widgets";
import { Textarea } from "@/design-system";
import { Button } from "@/design-system";
import { useState } from "react";

export function MantraStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;

  return (
    <StepFrame
      kind="mantra"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={<span />}
      hideSkip
    >
      <JapCounter
        targetCount={(config.targetCount as number) ?? 108}
        mantra={(config.mantra as string) ?? "ॐ"}
        showMala={(config.showMala as boolean) ?? true}
        soundEnabled={(config.soundEnabled as boolean) ?? false}
        vibrationEnabled={(config.vibrationEnabled as boolean) ?? false}
        showProgress={(config.showProgress as boolean) ?? true}
        onComplete={(p) => goToNext({ count: p.count, targetCount: p.targetCount })}
      />
    </StepFrame>
  );
}

export function AffirmationStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;
  const affirmations = (config.affirmations as string[]) ?? [currentStep.prompt ?? "I am present."];

  return (
    <StepFrame
      kind="affirmation"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={<span />}
      hideSkip
    >
      <JapCounter
        targetCount={(config.repetitions as number) ?? 3}
        mantra={affirmations[0] ?? "ॐ"}
        showMala={false}
        soundEnabled={(config.speakAloud as boolean) ?? false}
        showProgress={true}
        onComplete={(p) => goToNext({ completed: true, repetitions: p.count })}
      />
    </StepFrame>
  );
}

export function VisualizationStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;

  return (
    <StepFrame
      kind="visualization"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={<span />}
      hideSkip
    >
      <VisualizationCanvas
        durationSeconds={(config.durationSeconds as number) ?? 120}
        script={config.script as { text: string; durationSeconds: number; pauseAfter?: boolean }[]}
        prompt={(config.prompt as string) ?? currentStep.prompt}
        showTimer={(config.showTimer as boolean) ?? true}
        background={(config.background as "black" | "starfield" | "guru-bg" | "gradient") ?? "black"}
        onComplete={(p) => goToNext({ completed: p.completed, durationSec: p.durationSec })}
      />
    </StepFrame>
  );
}

export function AudioStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;
  const src = (config.src as string) ?? "";

  return (
    <StepFrame
      kind="audio"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={<span />}
      hideSkip
    >
      {src ? (
        <AudioPlayer
          src={src}
          title={config.title as string}
          loop={(config.loop as boolean) ?? false}
          playbackRate={(config.playbackRate as number) ?? 1}
          showControls={(config.showControls as boolean) ?? true}
          autoPlay={(config.autoPlay as boolean) ?? false}
          fadeIn={(config.fadeIn as number) ?? 0}
          fadeOut={(config.fadeOut as number) ?? 0}
          onComplete={(p) => goToNext({ listenedSeconds: p.listenedSeconds })}
        />
      ) : (
        <p className="text-center text-muted-foreground">No audio source configured.</p>
      )}
    </StepFrame>
  );
}

export function SoundBathStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;
  const src = (config.src as string) ?? "";

  return (
    <StepFrame
      kind="sound_bath"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={<span />}
      hideSkip
    >
      {src ? (
        <AudioPlayer
          src={src}
          title={(config.title as string) ?? "Sound Bath"}
          loop={(config.loop as boolean) ?? true}
          playbackRate={(config.playbackRate as number) ?? 1}
          showControls={(config.showControls as boolean) ?? true}
          autoPlay={(config.autoPlay as boolean) ?? true}
          onComplete={(p) => goToNext({ listenedSeconds: p.listenedSeconds })}
        />
      ) : (
        <p className="text-center text-muted-foreground">No audio source configured.</p>
      )}
    </StepFrame>
  );
}

export function ExperimentStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;

  return (
    <StepFrame
      kind="experiment"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={<span />}
      hideSkip
    >
      <ExperimentInterface
        durationSeconds={(config.durationSeconds as number) ?? 120}
        instruction={(config.instruction as string) ?? currentStep.prompt}
        steps={(config.steps as { instruction: string; durationSeconds: number; prompt?: string; inputType?: "none" | "text" | "selection" | "rating"; inputConfig?: Record<string, unknown> }[]) ?? []}
        showTimer={(config.showTimer as boolean) ?? true}
        onComplete={(p) => goToNext({ completedSteps: p.completedSteps, responses: p.responses })}
      />
    </StepFrame>
  );
}

export function GratitudeStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  const config = (currentStep?.config ?? currentStep?.params ?? {}) as Record<string, unknown>;
  const count = (config.count as number) ?? 3;
  const [items, setItems] = useState<string[]>(Array(count).fill(""));

  if (!currentStep) return null;

  return (
    <StepFrame
      kind="gratitude"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={
        <Button
          onClick={() => goToNext({ count: items.filter((i) => i.trim()).length, items })}
          className="rounded-full px-6"
        >
          Continue
        </Button>
      }
    >
      <div className="space-y-3">
        <p className="text-center text-sm text-muted-foreground">
          {(config.prompt as string) ?? "Name three things you're grateful for"}
        </p>
        {items.map((item, i) => (
          <input
            key={i}
            type="text"
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              setItems(next);
            }}
            placeholder={`Gratitude ${i + 1}...`}
            className="w-full rounded-2xl border border-border/40 bg-background/40 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        ))}
      </div>
    </StepFrame>
  );
}

export function LovingKindnessStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;

  return (
    <StepFrame
      kind="loving_kindness"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={
        <Button
          onClick={() => goToNext({ completed: true, durationSec: (config.durationSeconds as number) ?? 120 })}
          className="rounded-full px-6"
        >
          Continue
        </Button>
      }
    >
      <div className="space-y-4 py-4">
        <p className="text-center text-sm text-muted-foreground">
          Repeat these phrases silently, directing them to yourself and others:
        </p>
        <div className="space-y-2">
          {((config.phrases as string[]) ?? ["May I be happy", "May I be healthy", "May I be safe", "May I live with ease"]).map((phrase: string, i: number) => (
            <p key={i} className="text-center font-serif text-lg text-primary/80">{phrase}</p>
          ))}
        </div>
        <TimerWidget durationSeconds={(config.durationSeconds as number) ?? 120} showOrb={true} showPhase={false} gentleBell={true} onComplete={(p) => goToNext({ completed: true, durationSec: p.elapsedSeconds })} />
      </div>
    </StepFrame>
  );
}

export function ForgivenessStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;

  return (
    <StepFrame
      kind="forgiveness"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={
        <Button
          onClick={() => goToNext({ completed: true, durationSec: (config.durationSeconds as number) ?? 120 })}
          className="rounded-full px-6"
        >
          Continue
        </Button>
      }
    >
      <div className="space-y-4 py-4">
        <p className="text-center text-sm text-muted-foreground">
          {(currentStep.prompt as string) ?? "Allow yourself to forgive and be forgiven."}
        </p>
        <TimerWidget durationSeconds={(config.durationSeconds as number) ?? 120} showOrb={true} showPhase={false} gentleBell={true} onComplete={(p) => goToNext({ completed: true, durationSec: p.elapsedSeconds })} />
      </div>
    </StepFrame>
  );
}

export function PlanStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  const config = (currentStep?.config ?? currentStep?.params ?? {}) as Record<string, unknown>;
  const [accepted, setAccepted] = useState(false);

  if (!currentStep) return null;

  return (
    <StepFrame
      kind="plan"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={
        <Button
          disabled={!accepted}
          onClick={() => goToNext({ accepted: true })}
          className="rounded-full px-6"
        >
          Accept Plan
        </Button>
      }
    >
      <div className="space-y-3">
        {((config.steps as { title: string; description?: string; durationMinutes?: number }[]) ?? []).map((s, i) => (
          <div key={i} className="rounded-2xl border border-border/40 bg-card/40 p-4">
            <p className="font-medium">{s.title}</p>
            {s.description && <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>}
            {s.durationMinutes && (
              <p className="mt-1 text-xs text-muted-foreground/60">{s.durationMinutes} min</p>
            )}
          </div>
        ))}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="rounded"
          />
          I commit to this plan
        </label>
      </div>
    </StepFrame>
  );
}

export function FreeWriteStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  const config = (currentStep?.config ?? currentStep?.params ?? {}) as Record<string, unknown>;
  const [text, setText] = useState("");

  if (!currentStep) return null;

  async function save() {
    if (!text.trim()) return;
    goToNext({ length: text.length });
  }

  return (
    <StepFrame
      kind="free_write"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={
        <Button onClick={save} disabled={!text.trim()} className="rounded-full px-6">
          Save & continue
        </Button>
      }
    >
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={(config.placeholder as string) ?? "Write freely..."}
        className="min-h-[200px] resize-none rounded-2xl border-border/40 bg-background/40 text-base leading-relaxed"
      />
      <div className="mt-2 text-right text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60">
        {text.trim().split(/\s+/).filter(Boolean).length} words
      </div>
    </StepFrame>
  );
}

export function MovementStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;
  const steps = (config.steps as { instruction: string; durationSeconds: number }[]) ?? [{ instruction: currentStep.prompt ?? "Move mindfully.", durationSeconds: 60 }];

  return (
    <StepFrame
      kind="movement"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={<span />}
      hideSkip
    >
      <ExperimentInterface
        durationSeconds={(config.durationSeconds as number) ?? 120}
        instruction={config.instruction as string}
        steps={steps.map((s) => ({
          instruction: s.instruction,
          durationSeconds: s.durationSeconds,
          inputType: "none" as const,
        }))}
        showTimer={(config.showTimer as boolean) ?? true}
        onComplete={(p) => goToNext({ completedSteps: p.completedSteps, durationSec: (config.durationSeconds as number) ?? 120 })}
      />
    </StepFrame>
  );
}

export function ScriptureStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;

  return (
    <StepFrame
      kind="scripture"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={
        <Button
          onClick={() => goToNext({ read: true, durationSec: (config.readingTimeSeconds as number) ?? 30 })}
          className="rounded-full px-6"
        >
          Continue
        </Button>
      }
    >
      <div className="space-y-4 py-4">
        {(config.content as string) && (
          <div className="rounded-2xl border border-border/40 bg-card/40 p-6">
            <p className="font-serif text-lg leading-relaxed">{config.content as string}</p>
            {(config.source as string) && (
              <p className="mt-3 text-xs italic text-muted-foreground">— {config.source as string}</p>
            )}
          </div>
        )}
        {(config.reflectionPrompt as string) && (
          <p className="text-center text-sm text-muted-foreground">{config.reflectionPrompt as string}</p>
        )}
      </div>
    </StepFrame>
  );
}

export function WisdomReadStepWrapper() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;

  return (
    <StepFrame
      kind="wisdom-read"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={
        <Button
          onClick={() => goToNext({ read: true, durationSec: (config.readingTimeSeconds as number) ?? 30 })}
          className="rounded-full px-6"
        >
          Continue
        </Button>
      }
    >
      <div className="space-y-4 py-4">
        {(config.content as string) && (
          <div className="rounded-2xl border border-border/40 bg-card/40 p-6">
            <p className="font-serif text-lg leading-relaxed">{config.content as string}</p>
            {(config.source as string) && (
              <p className="mt-3 text-xs italic text-muted-foreground">— {config.source as string}</p>
            )}
          </div>
        )}
        {(config.reflectionPrompt as string) && (
          <p className="text-center text-sm text-muted-foreground">{config.reflectionPrompt as string}</p>
        )}
      </div>
    </StepFrame>
  );
}

// Helper component for timer in loving-kindness and forgiveness
function TimerWidgetPlaceholder({ duration, onComplete }: { duration: number; onComplete: (p: { elapsedSeconds: number }) => void }) {
  return null;
}