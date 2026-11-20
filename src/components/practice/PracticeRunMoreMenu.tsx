/**
 * PracticeRunMoreMenu
 * Pull-up sheet with full mid-session controls:
 * Pause · Skip · Extend +5m · Add note · Stop. Mounted globally in AppLayout.
 */
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/design-system";
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";
import { Pause, ChevronRight, Plus, Pencil, X } from "lucide-react";
import { usePracticeRunController } from "@/contexts/PracticeRunControllerContext";
import { useSessionOrchestrator } from "@/contexts/SessionOrchestratorContext";
import { toast } from "@/hooks/use-toast";

export default function PracticeRunMoreMenu() {
  const ctl = usePracticeRunController();
  const orch = useSessionOrchestrator();
  const [paused, setPaused] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  if (!ctl.active && !ctl.moreOpen) return null;

  const onPause = async () => {
    await ctl.pause();
    setPaused((p) => !p);
    toast({ title: paused ? "Resumed" : "Paused" });
  };

  const onSkip = async () => {
    await ctl.skip();
    orch.completeCurrent();
    ctl.setMoreOpen(false);
  };

  const onExtend = async () => {
    await ctl.extend();
    toast({ title: "Extended +5 min", description: "Stay as long as feels right." });
  };

  const onStop = async () => {
    await ctl.abort();
    orch.stop();
  };

  const onSaveNote = async () => {
    // Note is stored on the final finish() call; here we just stash it and close.
    toast({ title: "Noted", description: "Will be saved when the spiral ends." });
    (window as any).__pendingPracticeNote = note;
    setNoteOpen(false);
    setNote("");
  };

  return (
    <>
      <Sheet open={ctl.moreOpen} onOpenChange={ctl.setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl border-border/40 bg-background/95 backdrop-blur">
          <SheetHeader className="text-left">
            <SheetTitle>Mid-session</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onPause} className="justify-start">
              <Pause className="h-4 w-4 mr-2" /> {paused ? "Resume" : "Pause"}
            </Button>
            <Button variant="outline" onClick={onSkip} className="justify-start">
              <ChevronRight className="h-4 w-4 mr-2" /> Skip step
            </Button>
            <Button variant="outline" onClick={onExtend} className="justify-start">
              <Plus className="h-4 w-4 mr-2" /> Extend +5m
            </Button>
            <Button variant="outline" onClick={() => { ctl.setMoreOpen(false); setNoteOpen(true); }} className="justify-start">
              <Pencil className="h-4 w-4 mr-2" /> Add note
            </Button>
            <Button variant="destructive" onClick={onStop} className="justify-start col-span-2">
              <X className="h-4 w-4 mr-2" /> Stop session
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={noteOpen} onOpenChange={setNoteOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl border-border/40 bg-background/95 backdrop-blur">
          <SheetHeader className="text-left">
            <SheetTitle>One line</SheetTitle>
          </SheetHeader>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's alive right now?"
            className="mt-3 min-h-[80px]"
            autoFocus
          />
          <div className="mt-3 flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setNoteOpen(false)}>Cancel</Button>
            <Button onClick={onSaveNote} disabled={!note.trim()}>Save</Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
