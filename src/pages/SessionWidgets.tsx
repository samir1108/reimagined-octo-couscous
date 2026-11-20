import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/design-system";
import { StepWidgetLibrary } from "@/components/session-shell/widgets/StepWidgetLibrary";
import { STEP_WIDGETS } from "@/lib/session-shell/widgets/catalog";

export default function SessionWidgets() {
  const navigate = useNavigate();
  const families = new Set(STEP_WIDGETS.map((widget) => widget.family));

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/app")}
              className="-ml-2 mb-2 rounded-full text-muted-foreground"
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Home
            </Button>
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Session Shell</p>
            <h1 className="mt-1 font-serif text-3xl tracking-tight sm:text-4xl">Practice Widgets</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {STEP_WIDGETS.length} widgets across {families.size} families. Every step can now carry a
              widget id and inherit its engine, duration, copy, and completion payload.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Widgets" value={String(STEP_WIDGETS.length)} />
            <Stat label="Families" value={String(families.size)} />
            <Stat label="Engines" value="19" />
          </div>
        </div>

        <StepWidgetLibrary />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/40 px-4 py-3">
      <p className="text-lg font-medium tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
    </div>
  );
}
