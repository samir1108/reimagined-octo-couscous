import type { ComponentType, ReactNode } from "react";
import { Button } from "@/design-system";
import {
  Activity,
  BedDouble,
  Brain,
  CheckCircle2,
  Cloud,
  Flame,
  Footprints,
  Heart,
  Leaf,
  Moon,
  Music,
  Sparkles,
  Target,
  Users,
  Wind,
  Zap,
  type LucideProps,
} from "lucide-react";
import {
  FAMILY_META,
  type StepWidgetDefinition,
  type StepWidgetResult,
  type WidgetEngine,
} from "@/lib/session-shell/widgets/types";
import {
  AudioPlayer,
  BodyMapWidget,
  BreathHoldTimer,
  BreathingOrb,
  EmotionWheel,
  ExperimentInterface,
  InquiryScreen,
  IntentionSetter,
  JapCounter,
  ObservationScreen,
  RatingSlider,
  ReflectionScreen,
  SelectionCards,
  TimerWidget,
  VisualizationCanvas,
} from "./index";
import { WritingWidget } from "./WritingWidget";
import { ChecklistWidget } from "./ChecklistWidget";
import { GuidedPracticeWidget, type GuidedPhase } from "./GuidedPracticeWidget";
import { AmbientToneWidget } from "./AmbientToneWidget";

const FAMILY_ICON: Record<string, ComponentType<LucideProps>> = {
  stillness: Sparkles,
  breath: Wind,
  body: Activity,
  heart: Heart,
  mind: Brain,
  shadow: Cloud,
  devotion: Flame,
  sound: Music,
  movement: Footprints,
  energy: Zap,
  nature: Leaf,
  focus: Target,
  sleep: BedDouble,
  integration: CheckCircle2,
  relational: Users,
  challenge: Flame,
};

type Config = Record<string, unknown>;

function cfg(definition: StepWidgetDefinition, overrides?: Config): Config {
  return { ...definition.config, ...(overrides ?? {}) };
}

function num(config: Config, key: string, fallback: number): number {
  const value = Number(config[key]);
  return Number.isFinite(value) ? value : fallback;
}

function text(config: Config, key: string, fallback = ""): string {
  const value = config[key];
  return typeof value === "string" ? value : fallback;
}

function bool(config: Config, key: string, fallback = false): boolean {
  const value = config[key];
  return typeof value === "boolean" ? value : fallback;
}

function list(config: Config, key: string): string[] {
  const value = config[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export interface StepWidgetProps {
  definition: StepWidgetDefinition;
  /** Step-level copy wins over catalog copy. */
  title?: string;
  prompt?: string;
  whyForYou?: string;
  overrides?: Config;
  done?: boolean;
  onComplete?: (result: StepWidgetResult) => void;
  onSkip?: () => void;
  /** Render engine only — for embedding inside an existing card. */
  bare?: boolean;
}

export function StepWidget({
  definition,
  title,
  prompt,
  whyForYou,
  overrides,
  done,
  onComplete,
  onSkip,
  bare,
}: StepWidgetProps) {
  const config = cfg(definition, overrides);
  const meta = FAMILY_META[definition.family];
  const Icon = FAMILY_ICON[definition.family] ?? Sparkles;
  const duration = Math.max(1, num(config, "durationSeconds", definition.durationSeconds));
  const minutes = Math.max(1, Math.round(duration / 60));

  function finish(data: Record<string, unknown>, summary: string) {
    onComplete?.({
      widgetId: definition.id,
      engine: definition.engine,
      data,
      summary,
    });
  }

  const engine = renderEngine({
    engine: definition.engine,
    config,
    duration,
    definition,
    done,
    finish,
  });

  const body = (
    <>
      <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background/40 px-2.5 py-1">
          <Icon className="h-3 w-3" />
          {meta.label}
        </span>
        <span className="rounded-full border border-border/40 px-2.5 py-1">{minutes} min</span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border/40 px-2.5 py-1" aria-label={`Intensity ${definition.intensity} of 5`}>
          {[1, 2, 3, 4, 5].map((dot) => (
            <span
              key={dot}
              className={`h-1 w-1 rounded-full ${dot <= definition.intensity ? meta.accent : "bg-border"}`}
            />
          ))}
        </span>
        {done && <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-primary">Complete</span>}
      </div>

      {!bare && (
        <>
          <h2 className="mt-4 font-serif text-2xl leading-tight tracking-tight sm:text-3xl">
            {title ?? definition.label}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {prompt ?? definition.description}
          </p>
          {whyForYou && <p className="mt-1 text-xs italic text-foreground/60">— {whyForYou}</p>}
        </>
      )}

      <div className={bare ? "mt-2" : "mt-5 rounded-3xl border border-border/40 bg-card/80 p-5 shadow-[0_14px_50px_-24px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:p-6"}>
        {engine}
      </div>

      {definition.note && (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground/70">Note — {definition.note}</p>
      )}

      {onSkip && !done && (
        <div className="mt-4 flex justify-start">
          <Button variant="ghost" size="sm" onClick={onSkip} className="rounded-full text-muted-foreground">
            Skip this practice
          </Button>
        </div>
      )}
    </>
  );

  if (bare) return body;

  return (
    <div className="relative mx-auto w-full max-w-2xl px-6 pb-10 lg:max-w-3xl xl:max-w-4xl">
      <div className="pointer-events-none absolute inset-x-0 -top-24 -z-10 mx-auto h-72 max-w-2xl lg:max-w-3xl xl:max-w-4xl">
        <div className={`h-full w-full rounded-full bg-gradient-to-br ${meta.tint} blur-3xl opacity-70`} />
      </div>
      <div className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${meta.accent} animate-pulse`} />
        Practice · {meta.label}
      </div>
      {body}
    </div>
  );
}

function renderEngine({
  engine,
  config,
  duration,
  definition,
  done,
  finish,
}: {
  engine: WidgetEngine;
  config: Config;
  duration: number;
  definition: StepWidgetDefinition;
  done?: boolean;
  finish: (data: Record<string, unknown>, summary: string) => void;
}): ReactNode {
  switch (engine) {
    case "timer":
      return (
        <TimerWidget
          durationSeconds={duration}
          mode={(text(config, "mode", "countdown") as "countdown" | "stopwatch" | "interval")}
          intervalSeconds={num(config, "intervalSeconds", 0) || undefined}
          showOrb={bool(config, "showOrb", true)}
          showPhase={bool(config, "showPhase", false)}
          gentleBell={bool(config, "gentleBell", true)}
          onComplete={(payload) => finish(payload, `${definition.label} · ${payload.elapsedSeconds}s`)}
        />
      );

    case "breath":
      return (
        <BreathingOrb
          durationSeconds={duration}
          pattern={(text(config, "pattern", "natural") as "natural" | "box" | "4-7-8" | "coherent")}
          inhaleSeconds={num(config, "inhaleSeconds", 0) || undefined}
          holdSeconds={num(config, "holdSeconds", 0) || undefined}
          exhaleSeconds={num(config, "exhaleSeconds", 0) || undefined}
          pauseSeconds={num(config, "pauseSeconds", 0) || undefined}
          showPhaseText={bool(config, "showPhaseText", true)}
          showOrb={bool(config, "showOrb", true)}
          soundEnabled={bool(config, "soundEnabled", false)}
          onComplete={(payload) => finish(payload, `${definition.label} · ${payload.cycles} cycles`)}
        />
      );

    case "breath_hold":
      return (
        <BreathHoldTimer
          rounds={num(config, "rounds", 4)}
          inhaleSeconds={num(config, "inhaleSeconds", 4)}
          holdSeconds={num(config, "holdSeconds", 4)}
          exhaleSeconds={num(config, "exhaleSeconds", 4)}
          restSeconds={num(config, "restSeconds", 2)}
          onComplete={(payload) => finish(payload, `${definition.label} · ${payload.completedRounds} rounds`)}
        />
      );

    case "observation":
      return (
        <ObservationScreen
          durationSeconds={duration}
          focus={(text(config, "focus", "open") as "thoughts" | "emotions" | "sensations" | "sounds" | "breath" | "open")}
          allowLogging={bool(config, "allowLogging", true)}
          categories={list(config, "categories")}
          showTimer={bool(config, "showTimer", true)}
          showCounter={bool(config, "showCounter", true)}
          onComplete={(payload) => finish(payload, `${definition.label} · ${payload.count} noticed`)}
        />
      );

    case "body_map":
      return (
        <BodyMapWidget
          showLabels={bool(config, "showLabels", true)}
          interactive={bool(config, "interactive", true)}
          onComplete={(payload) => finish(payload, `${definition.label} · ${payload.selectedRegion ?? "whole body"}`)}
        />
      );

    case "inquiry":
      return (
        <InquiryScreen
          question={text(config, "question", definition.description)}
          durationSeconds={duration}
          contemplationSeconds={num(config, "contemplationSeconds", Math.min(duration, 90))}
          allowReflection={bool(config, "allowReflection", true)}
          showTimer={bool(config, "showTimer", true)}
          onComplete={(payload) => finish(payload, `${definition.label} · reflected=${payload.reflected}`)}
        />
      );

    case "selection":
      return (
        <SelectionCards
          options={(config.options as { id: string; label: string; description?: string; icon?: string }[]) ?? [
            { id: "yes", label: "Yes" },
            { id: "no", label: "No" },
          ]}
          allowMultiple={bool(config, "allowMultiple", false)}
          prompt={text(config, "prompt", definition.description)}
          showAsCards={bool(config, "showAsCards", true)}
          onComplete={(payload) => finish(payload, `${definition.label} · ${String(payload.selection)}`)}
        />
      );

    case "rating":
      return (
        <RatingSlider
          min={num(config, "min", 1)}
          max={num(config, "max", 10)}
          step={num(config, "step", 1)}
          labels={(config.labels as Record<number, string>) ?? {}}
          prompt={text(config, "prompt", definition.description)}
          onComplete={(payload) => finish(payload, `${definition.label} · ${payload.value}/10`)}
        />
      );

    case "jap":
      return (
        <JapCounter
          targetCount={num(config, "targetCount", 108)}
          mantra={text(config, "mantra", "Om")}
          showMala={bool(config, "showMala", true)}
          soundEnabled={bool(config, "soundEnabled", false)}
          vibrationEnabled={bool(config, "vibrationEnabled", false)}
          showProgress={bool(config, "showProgress", true)}
          onComplete={(payload) => finish(payload, `${definition.label} · ${payload.count} repetitions`)}
        />
      );

    case "audio": {
      const src = text(config, "src");
      if (src) {
        return (
          <AudioPlayer
            src={src}
            title={text(config, "title", definition.label)}
            loop={bool(config, "loop", false)}
            playbackRate={num(config, "playbackRate", 1)}
            onComplete={(payload) => finish(payload, `${definition.label} · ${payload.listenedSeconds}s`)}
          />
        );
      }
      return (
        <AmbientToneWidget
          tone={(text(config, "tone", "bowl") as "bowl" | "drone" | "binaural" | "noise" | "rain")}
          durationSeconds={duration}
          volume={num(config, "volume", 0.3)}
          onComplete={(payload) => finish(payload, `${definition.label} · ${payload.listenedSeconds}s`)}
        />
      );
    }

    case "visualization":
      return (
        <VisualizationCanvas
          durationSeconds={duration}
          prompt={text(config, "prompt", definition.description)}
          script={(config.script as { text: string; durationSeconds: number; pauseAfter?: boolean }[]) ?? undefined}
          showTimer={bool(config, "showTimer", true)}
          background={(text(config, "background", "black") as "black" | "starfield" | "guru-bg" | "gradient")}
          onComplete={(payload) => finish(payload, `${definition.label} · ${payload.durationSec}s`)}
        />
      );

    case "experiment":
      return (
        <ExperimentInterface
          durationSeconds={duration}
          instruction={text(config, "instruction", definition.description)}
          steps={(config.steps as { instruction: string; durationSeconds: number; prompt?: string; inputType?: "none" | "text" | "selection" | "rating"; inputConfig?: Record<string, unknown> }[]) ?? []}
          showTimer={bool(config, "showTimer", true)}
          onComplete={(payload) => finish(payload, `${definition.label} · ${payload.completedSteps} steps`)}
        />
      );

    case "reflection":
      return (
        <ReflectionScreen
          durationSeconds={duration}
          prompt={text(config, "prompt", definition.description)}
          guidedQuestions={list(config, "guidedQuestions")}
          allowJournaling={bool(config, "allowJournaling", true)}
          showTimer={bool(config, "showTimer", false)}
          integrationPrompt={text(config, "integrationPrompt") || undefined}
          onComplete={(payload) => finish(payload, `${definition.label} · ${payload.responses.length} responses`)}
        />
      );

    case "emotion":
      return (
        <EmotionWheel
          emotions={list(config, "emotions").length ? list(config, "emotions") : undefined}
          allowIntensity={bool(config, "allowIntensity", true)}
          prompt={text(config, "prompt", definition.description)}
          onComplete={(payload) => finish(payload, `${definition.label} · ${payload.emotion} @ ${payload.intensity}`)}
        />
      );

    case "intention":
      return (
        <IntentionSetter
          prompt={text(config, "prompt", definition.description)}
          placeholder={text(config, "placeholder") || undefined}
          maxLength={num(config, "maxLength", 200)}
          onComplete={(payload) => finish(payload, `${definition.label} · ${payload.text.slice(0, 60)}`)}
        />
      );

    case "writing":
      return (
        <WritingWidget
          prompts={list(config, "prompts").length ? list(config, "prompts") : [definition.description]}
          placeholder={text(config, "placeholder", "Write without editing…")}
          minChars={num(config, "minChars", 20)}
          maxChars={num(config, "maxChars", 4000)}
          note={definition.note}
          onComplete={(payload) => finish(payload, `${definition.label} · ${payload.characters} chars`)}
        />
      );

    case "checklist":
      return (
        <ChecklistWidget
          items={list(config, "items")}
          minSelections={num(config, "minSelections", 1)}
          prompt={text(config, "prompt") || undefined}
          onComplete={(payload) => finish(payload, `${definition.label} · ${payload.count} checked`)}
        />
      );

    case "guided":
      return (
        <GuidedPracticeWidget
          phases={(config.phases as GuidedPhase[]) ?? [{ label: definition.label, seconds: duration }]}
          autoStart={bool(config, "autoStart", false)}
          onComplete={(payload) => finish(payload, `${definition.label} · ${payload.durationSec}s`)}
        />
      );

    case "ambient":
      return (
        <AmbientToneWidget
          tone={(text(config, "tone", "bowl") as "bowl" | "drone" | "binaural" | "noise" | "rain")}
          durationSeconds={duration}
          volume={num(config, "volume", 0.3)}
          carrierHz={num(config, "carrierHz", 200)}
          beatHz={num(config, "beatHz", 10)}
          onComplete={(payload) => finish(payload, `${definition.label} · ${payload.listenedSeconds}s`)}
        />
      );

    default:
      return (
        <div className="py-6 text-center text-sm text-muted-foreground">
          This practice is not wired yet.
        </div>
      );
  }
}
