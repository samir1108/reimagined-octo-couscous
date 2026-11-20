import { useState, useEffect } from "react";

export default function JapTapCard() {
  const [count, setCount] = useState(0);
  useEffect(() => { try { setCount(Number(localStorage.getItem("jap-count") || 0)); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem("jap-count", String(count)); } catch {} }, [count]);
  return (
    <div className="mt-4 rounded-2xl border border-border/30 bg-card/40 p-4">
      <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60 mb-2 flex items-center gap-1"><span>🕉️</span> Jap / Tap</p>
      <div className="flex items-center gap-3">
        <button onClick={() => setCount(c => c + 1)} className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">+1</button>
        <span className="text-lg font-mono">{count} reps</span>
        <button onClick={() => setCount(0)} className="text-xs text-muted-foreground">reset</button>
      </div>
    </div>
  );
}
