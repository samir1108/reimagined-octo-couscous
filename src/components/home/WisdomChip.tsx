/**
 * WisdomChip — Compact one-line chip on Home. Tap to open a full-screen
 * dialog with today's wisdom paragraph + "Study with the Guide" CTA.
 *
 * Wraps the existing WisdomCard so all loading/refresh/Study logic stays in
 * one place.
 */
import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Dialog, DialogContent } from "@/design-system";
import WisdomCard from "@/components/home/WisdomCard";

interface Props {
  journeyDay?: number;
  themeTitle?: string;
  themeDescription?: string;
  vLevel?: number;
  activeLoops?: string[];
  className?: string;
}

export default function WisdomChip({
  journeyDay,
  themeTitle,
  themeDescription,
  vLevel,
  activeLoops,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group w-full max-w-md flex items-center gap-2 px-3.5 py-2 rounded-full border border-amber-400/30 bg-amber-500/5 backdrop-blur-md text-left hover:border-amber-300/50 transition ${className}`}
        aria-label="Open today's wisdom"
      >
        <Sparkles className="h-3.5 w-3.5 text-amber-300/90 shrink-0" />
        <span className="text-[10px] font-display tracking-[0.25em] uppercase text-amber-200/90 shrink-0">
          Wisdom
        </span>
        <span className="text-xs text-foreground/80 truncate flex-1 italic">
          Today's transmission · tap to read
        </span>
        <span className="text-[10px] text-muted-foreground/60 shrink-0 group-hover:text-foreground/70">
          open
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 gap-0 bg-background/95 backdrop-blur-xl border-amber-400/20 overflow-hidden [&>button]:hidden">
          <div className="relative max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-end p-3 bg-background/95 backdrop-blur-xl border-b border-amber-400/10">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <WisdomCard
                journeyDay={journeyDay}
                themeTitle={themeTitle}
                themeDescription={themeDescription}
                vLevel={vLevel}
                activeLoops={activeLoops}
                onClose={() => setOpen(false)}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
