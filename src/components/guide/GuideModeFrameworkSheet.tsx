import { useMemo } from "react";
import { GUIDE_MODES, getModeById } from "@/lib/guideModes";
import { GUIDE_MODE_FRAMEWORKS } from "@/lib/guideModeFrameworks";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/design-system";
import { ScrollArea } from "@/design-system";
import { Badge } from "@/design-system";

interface Props {
  open: boolean;
  modeId: string;
  onOpenChange: (open: boolean) => void;
}

export function GuideModeFrameworkSheet({ open, modeId, onOpenChange }: Props) {
  const mode = useMemo(() => getModeById(modeId), [modeId]);
  const framework = GUIDE_MODE_FRAMEWORKS[modeId];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] glass-strong border-border/30">
        <SheetHeader className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{mode.emoji}</span>
            <SheetTitle className="font-display text-xl">{mode.label} · Framework</SheetTitle>
          </div>
          <p className="text-sm text-muted-foreground">{mode.description}</p>
        </SheetHeader>

        <ScrollArea className="h-[calc(85vh-6rem)] mt-4 pr-4">
          {!framework ? (
            <p className="text-sm text-muted-foreground">
              Framework not yet defined for this mode.
            </p>
          ) : (
            <div className="space-y-5 pb-8 text-sm leading-relaxed">
              <Row label="Purpose" value={framework.purpose} />
              <Row label="Lineage" value={framework.lineage} />
              <Row label="Session length" value={framework.duration} />

              <Section title="When to use">
                <ul className="list-disc list-inside space-y-1">
                  {framework.whenToUse.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </Section>

              <Section title="Not for">
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {framework.notFor.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </Section>

              <Section title="Arc of the session">
                <ol className="space-y-2">
                  {framework.arc.map((a, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 shrink-0 rounded-full glass-subtle border border-border/40 flex items-center justify-center text-xs font-mono">
                        {i + 1}
                      </span>
                      <div>
                        <div className="font-display">{a.phase}</div>
                        <div className="text-muted-foreground">{a.goal}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </Section>

              <Section title="Techniques">
                <div className="flex flex-wrap gap-1.5">
                  {framework.techniques.map((t) => (
                    <Badge key={t} variant="secondary" className="rounded-full">
                      {t}
                    </Badge>
                  ))}
                </div>
              </Section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Section title="Do">
                  <ul className="list-disc list-inside space-y-1 text-emerald-400/90">
                    {framework.dos.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </Section>
                <Section title="Don't">
                  <ul className="list-disc list-inside space-y-1 text-red-400/80">
                    {framework.donts.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </Section>
              </div>

              <Section title="Sample openers">
                <ul className="space-y-1 italic text-muted-foreground">
                  {framework.openers.map((o, i) => (
                    <li key={i}>“{o}”</li>
                  ))}
                </ul>
              </Section>

              <Section title="Exit when">
                <ul className="list-disc list-inside space-y-1">
                  {framework.exitCriteria.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </Section>

              <Row label="Landed feels like" value={framework.successSignal} />
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
        {label}
      </div>
      <div>{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

// re-export for convenience
export { GUIDE_MODES };
