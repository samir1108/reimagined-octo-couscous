import { useMemo, useState } from "react";
import { Check, ChevronDown, MoonStar, Sunrise, Sun, Sunset } from "lucide-react";
import type { DailyTheme, DailyTask } from "@/types/database";

type ThemeWithGuidance = Partial<DailyTheme> & {
  theme_rationale?: string | null;
  daily_intentions?: string[] | null;
  action_items?: string[] | null;
  felt_sense_opener?: string | null;
  micro_prompt?: string | null;
  micro_practice?: { title?: string; description?: string } | string | null;
  inner_inquiry?: string | null;
  real_life_trigger?: string | null;
  evening_close?: string | null;
  engagement_question?: string | null;
  guidance?: (DailyTheme["guidance"] & Record<string, unknown>) | null;
};

interface Props {
  theme: ThemeWithGuidance | null | undefined;
  missionTasks?: DailyTask[];
}

interface Prompt {
  title: string;
  text: string;
  why: string;
}

interface DayPart {
  id: string;
  title: string;
  time: string;
  icon: typeof Sunrise;
  prompts: Prompt[];
}

const WHY = {
  direction: "A clear direction makes it easier to return when the day pulls your attention away.",
  observe: "Noticing the first signal gives you a choice before an old habit takes over.",
  practice: "A small, repeatable action turns the idea into something you can feel and do.",
  body: "The body offers a direct anchor when the mind is moving quickly.",
  respond: "A brief pause makes room for a response that matches your intention.",
  reflect: "Looking back helps turn an ordinary moment into something you can learn from.",
  rest: "Closing gently lets the day settle without turning growth into a score.",
} as const;

function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  const text = value.trim();
  return text && !/^(undefined|null|n\/?a|none|nan)$/i.test(text) ? text : "";
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const text = cleanText(value);
    if (text) return text;
  }
  return "";
}

function firstListItem(value: unknown): string {
  if (!Array.isArray(value)) return "";
  for (const item of value) {
    const text = cleanText(item);
    if (text) return text;
  }
  return "";
}

function practiceText(value: unknown): string {
  if (typeof value === "string") return cleanText(value);
  if (value && typeof value === "object") {
    const practice = value as { title?: unknown; description?: unknown };
    return firstText(practice.title, practice.description);
  }
  return "";
}

export default function TodaysGuidance({ theme, missionTasks = [] }: Props) {
  const [openPart, setOpenPart] = useState("morning");
  const guidance = theme?.guidance ?? {};
  const mission = missionTasks.find((task) => task.status === "pending") ?? missionTasks[0];

  const dayParts = useMemo<DayPart[]>(() => {
    const morning: Prompt[] = [];
    const midday: Prompt[] = [];
    const evening: Prompt[] = [];
    const night: Prompt[] = [];

    const add = (target: Prompt[], title: string, text: unknown, why: string) => {
      const clean = cleanText(text);
      if (clean) target.push({ title, text: clean, why });
    };

    add(
      morning,
      "Set your direction",
      firstText(guidance.today_intention, firstListItem(theme?.daily_intentions), theme?.affirmation),
      WHY.direction,
    );
    add(
      morning,
      "Notice before the story",
      firstText(guidance.observe_today, theme?.micro_prompt),
      WHY.observe,
    );
    add(
      morning,
      "One real-world action",
      firstText(mission?.title, guidance.act_with_intention, firstListItem(theme?.action_items)),
      WHY.practice,
    );

    add(
      midday,
      "Check in with your body",
      firstText(guidance.body_check, theme?.felt_sense_opener),
      WHY.body,
    );
    add(
      midday,
      "Pause and reset",
      firstText(guidance.pause_reset, guidance.one_small_win),
      WHY.respond,
    );
    add(
      midday,
      "Try this in one interaction",
      firstText(guidance.how_to_respond, theme?.real_life_trigger, guidance.connection_practice),
      WHY.respond,
    );

    add(
      evening,
      "Ask yourself",
      firstText(guidance.self_inquiry, theme?.inner_inquiry, guidance.mind_check),
      WHY.observe,
    );
    add(
      evening,
      "Capture one moment",
      firstText(guidance.capture_moment, guidance.discovery_to_look_for),
      WHY.reflect,
    );
    add(
      evening,
      "Review what shifted",
      firstText(guidance.evening_reflection, theme?.evening_close),
      WHY.reflect,
    );

    add(
      night,
      "Carry one question",
      firstText(guidance.question_to_carry, guidance.decision_to_examine, theme?.engagement_question),
      WHY.reflect,
    );
    add(
      night,
      "End with appreciation",
      firstText(guidance.end_with_gratitude, guidance.today_reminder),
      WHY.rest,
    );
    add(
      night,
      "Let the day settle",
      firstText(guidance.replace_with, guidance.be_mindful_of, theme?.theme_rationale),
      WHY.rest,
    );

    return [
      { id: "morning", title: "Morning", time: "Begin gently", icon: Sunrise, prompts: morning },
      { id: "midday", title: "Through the day", time: "Return when you can", icon: Sun, prompts: midday },
      { id: "evening", title: "Evening", time: "Make meaning", icon: Sunset, prompts: evening },
      { id: "night", title: "Night", time: "Close without pressure", icon: MoonStar, prompts: night },
    ].filter((part) => part.prompts.length > 0);
  }, [guidance, mission?.title, theme]);

  const promptCount = dayParts.reduce((count, part) => count + part.prompts.length, 0);
  if (!promptCount) return null;

  const whyToday = firstText(
    guidance.approach_today,
    theme?.theme_rationale,
    theme?.description,
  );

  return (
    <section
      aria-label="Your daily mission"
      className="overflow-hidden rounded-[1.75rem] border border-primary/15 bg-gradient-to-br from-primary/[0.08] via-card/65 to-card/30"
    >
      <div className="p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-display font-semibold uppercase tracking-[0.24em] text-primary/80">
              Your day, from waking to rest
            </p>
            <h2 className="mt-1 text-xl font-display font-medium text-foreground sm:text-2xl">
              A mission to live, not a list to finish
            </h2>
          </div>
          <span className="rounded-full border border-border/40 bg-background/40 px-3 py-1 text-[10px] text-muted-foreground">
            {promptCount} moments to choose from
          </span>
        </div>

        {whyToday && (
          <div className="mt-4 rounded-2xl border border-primary/15 bg-background/35 px-4 py-3">
            <p className="text-[9px] font-display uppercase tracking-[0.2em] text-primary/70">
              Why this is today’s work
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/80">{whyToday}</p>
          </div>
        )}

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground/70">
          Choose what fits your real day. These are invitations, not obligations.
        </p>

        <div className="mt-5 space-y-2">
          {dayParts.map((part) => {
            const Icon = part.icon;
            const isOpen = openPart === part.id;
            return (
              <div key={part.id} className="overflow-hidden rounded-2xl border border-border/30 bg-background/30">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenPart(isOpen ? "" : part.id)}
                  className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground/90">{part.title}</span>
                      <span className="block text-[11px] text-muted-foreground/65">{part.time}</span>
                    </span>
                    <span className="rounded-full bg-muted/30 px-2 py-0.5 text-[10px] tabular-nums text-muted-foreground/70">
                      {part.prompts.length}
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>

                {isOpen && (
                  <ol className="space-y-0 border-t border-border/20 px-4 pb-2">
                    {part.prompts.map((prompt, index) => (
                      <li key={`${part.id}-${prompt.title}`} className="flex gap-3 border-b border-border/15 py-4 last:border-0">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/20 text-[10px] tabular-nums text-primary/75">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-display font-medium uppercase tracking-[0.15em] text-primary/75">
                            {prompt.title}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-foreground/85">{prompt.text}</p>
                          <p className="mt-2 flex gap-1.5 text-[11px] leading-relaxed text-muted-foreground/60">
                            <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary/50" aria-hidden />
                            <span>Why: {prompt.why}</span>
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
