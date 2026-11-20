import { Button } from "@/design-system";
import { Textarea } from "@/design-system";
import { useSessionShell } from "@/lib/session-shell/SessionShellContext";
import { useState } from "react";
import { useCreateJournalEntry } from "@/hooks/useJournalEntries";
import { toast } from "sonner";
import { StepFrame } from "./StepFrame";

export function JournalStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const create = useCreateJournalEntry();

  if (!currentStep) return null;

  async function save() {
    if (!text.trim()) {
      toast.error("Write a few words first");
      return;
    }
    setSaving(true);
    try {
      await create.mutateAsync({ content: text.trim() });
      goToNext({ length: text.length });
    } catch (e: any) {
      toast.error(e?.message || "Could not save");
      setSaving(false);
    }
  }

  return (
    <StepFrame
      kind="journal"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={
        <Button onClick={save} disabled={saving} className="rounded-full px-6">
          {saving ? "Saving…" : "Save & continue"}
        </Button>
      }
    >
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write freely… no one is grading this."
        className="min-h-[240px] resize-none rounded-2xl border-border/40 bg-background/40 text-base leading-relaxed focus-visible:ring-1"
      />
      <div className="mt-2 text-right text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60">
        {text.trim().split(/\s+/).filter(Boolean).length} words
      </div>
    </StepFrame>
  );
}
