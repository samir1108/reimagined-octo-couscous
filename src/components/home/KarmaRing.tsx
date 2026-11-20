import { useState } from "react";

export default function KarmaRing({ karma = 43, nextThreshold = 257, level = "Seeker", band = 0 }: { karma?: number; nextThreshold?: number; level?: string; band?: number }) {
  const [showDetail, setShowDetail] = useState(false);
  const progress = Math.min(1, Math.max(0, karma / 300));
  return (
    <div className="mt-3 rounded-2xl border border-border/30 bg-card/40 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative h-14 w-14 shrink-0">
            <svg className="h-14 w-14 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
                strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - progress)} strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-display font-bold">{karma}</span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-display tracking-[0.24em] uppercase text-muted-foreground/60 flex items-center gap-1">
              <span>???</span> Karma
            </p>
            <p className="text-xs text-muted-foreground truncate">{nextThreshold} to next level</p>
            <p className="text-[10px] text-muted-foreground/60">{level} • Band {Number(band).toFixed(1)}</p>
          </div>
        </div>
        <button onClick={() => setShowDetail(!showDetail)} className="shrink-0 text-xs font-display text-primary">
          {showDetail ? 'Close' : 'Details'}
        </button>
      </div>
      {showDetail && (
        <div className="mt-3 p-3 rounded-xl bg-background/50 border border-border/30 space-y-2">
          <p className="text-sm font-display font-medium">Karma Details</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-muted-foreground">Current:</span> <span>{karma}</span></div>
            <div><span className="text-muted-foreground">Next:</span> <span>{karma + nextThreshold}</span></div>
            <div><span className="text-muted-foreground">Level:</span> <span>Sleeper</span></div>
            <div><span className="text-muted-foreground">Band:</span> <span>0.0</span></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Complete missions to earn karma. Next threshold: {nextThreshold} points.</p>
        </div>
      )}
    </div>
  );
}
