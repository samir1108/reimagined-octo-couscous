/**
 * RhythmIcon — small button that opens the PersonalRhythmCard in a dialog.
 * Used in the mobile top bar and inside DesktopHomeRails (replaces the
 * static "Reminder" card on the right rail).
 *
 * `variant="icon"` → tiny round icon button (mobile)
 * `variant="card"` → full-width rail card showing the next practice
 */
import { useState } from "react";
import { Bell, Clock, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/design-system";
import PersonalRhythmCard from "@/components/personalization/PersonalRhythmCard";
import { usePersonalRhythm } from "@/hooks/usePersonalRhythm";

interface Props {
  userId: string | undefined;
  variant?: "icon" | "card";
  className?: string;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function RhythmIcon({ userId, variant = "icon", className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const { nextEntry, entries } = usePersonalRhythm(userId);
  const pending = entries.filter((e) => !e.completed_at).length;

  if (!userId) return null;

  return (
    <>
      {variant === "icon" ? (
        <button
          onClick={() => setOpen(true)}
          aria-label="Today's rhythm"
          className={`relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-border/30 bg-background/40 backdrop-blur-md hover:bg-background/60 hover:border-border/60 transition ${className}`}
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          {pending > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-primary text-[9px] font-display text-primary-foreground flex items-center justify-center">
              {pending}
            </span>
          )}
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className={`pointer-events-auto w-full text-left rounded-2xl border border-border/30 bg-background/30 backdrop-blur-md px-4 py-3 hover:border-border/50 hover:bg-background/40 transition-colors ${className}`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-muted-foreground/70" />
            <div className="text-[9px] font-display tracking-[0.25em] uppercase text-muted-foreground/60">
              Rhythm
            </div>
          </div>
          <div className="text-sm font-display font-medium text-foreground/90 leading-tight line-clamp-1">
            {nextEntry ? nextEntry.title : "All set for today"}
          </div>
          {nextEntry && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 mt-1">
              <Clock className="w-2.5 h-2.5" /> {fmt(nextEntry.scheduled_at)}
              {nextEntry.location === "off_app" && (
                <span className="ml-1 px-1 rounded bg-primary/10 text-primary">Off-app</span>
              )}
            </div>
          )}
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[calc(100dvh-2rem)] overflow-hidden p-4 sm:p-6">
          <DialogTitle className="sr-only">Today's rhythm</DialogTitle>
          <PersonalRhythmCard userId={userId} />
        </DialogContent>
      </Dialog>
    </>
  );
}
