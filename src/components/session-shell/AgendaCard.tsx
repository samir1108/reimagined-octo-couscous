import { useSessionShell } from "@/lib/session-shell/SessionShellContext";
import { Button } from "@/design-system";
import {
  BookOpen,
  Wind,
  PencilLine,
  HandHeart,
  Sparkles,
  MessageCircle,
  Activity,
  Flame,
  Eye,
  Hash,
  Volume2,
  Repeat,
  Heart,
} from "lucide-react";
import type { StepKind } from "@/lib/session-shell/types";

const ICONS: Record<StepKind, React.ComponentType<{ className?: string }>> = {
  "wisdom-read": BookOpen,
  breathwork: Wind,
  journal: PencilLine,
  "micro-act": HandHeart,
  reflection: Sparkles,
  "guide-chat": MessageCircle,
  practice: Activity,
  "temple-chat": Flame,
  witness: Eye,
  silent_sit: Eye,
  body_scan: Eye,
  gratitude: Heart,
  loving_kindness: Heart,
  forgiveness: Heart,
  movement: Activity,
  walking: Activity,
  yoga_asana: Flame,
  sound_bath: Volume2,
  mantra: Hash,
  visualization: Eye,
  scripture: BookOpen,
  affirmation: Repeat,
  contemplation: Eye,
  noticing: Eye,
  stretching: Activity,
  tai_chi: Activity,
  balance: Activity,
  "free_write": PencilLine,
  plan: PencilLine,
};

export function AgendaCard() {
  const { plan, beginFromAgenda } = useSessionShell();
  const totalMin = plan.steps.reduce((a, s) => a + s.est_minutes, 0);

  return (
    <div className="mx-auto w-full max-w-xl px-6 lg:max-w-2xl xl:max-w-3xl">
      <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md p-6 sm:p-8 shadow-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Today's session
        </p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold leading-tight">
          {plan.intent}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{plan.intro}</p>

        <ol className="mt-6 space-y-3">
          {plan.steps.map((s, i) => {
            const Icon = ICONS[s.kind] || Sparkles;
            return (
              <li
                key={i}
                className="flex items-start gap-3 rounded-2xl border border-border/30 bg-background/40 p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{s.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      ~{s.est_minutes}m
                    </span>
                  </div>
                  {s.optional && (
                    <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground/80">
                      Optional
                    </p>
                  )}
                  {s.whyForYou && (
                    <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground/90 italic">
                      {s.whyForYou}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {plan.steps.length} steps · ~{totalMin} min
          </span>
          <Button onClick={beginFromAgenda} size="lg" className="rounded-full px-6">
            Begin
          </Button>
        </div>
      </div>
    </div>
  );
}
