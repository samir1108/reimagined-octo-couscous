import { Activity } from "lucide-react";

export default function MetricsLiveCard() {
  return (
    <div className="mt-4 rounded-2xl border border-border/30 bg-card/40 p-4">
      <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60 mb-3 flex items-center gap-1"><Activity className="w-3 h-3" /> Live Metrics</p>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold">L1</p>
          <p className="text-[10px] text-muted-foreground">Dimension Level</p>
        </div>
        <div>
          <p className="text-2xl font-bold">0.0</p>
          <p className="text-[10px] text-muted-foreground">V-Level</p>
        </div>
        <div>
          <p className="text-2xl font-bold">Sleeper</p>
          <p className="text-[10px] text-muted-foreground">Band / H-Level</p>
        </div>
      </div>
    </div>
  );
}
