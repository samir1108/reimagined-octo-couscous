import { useState, useEffect } from "react";

export default function ChallengeCard() {
  const [done, setDone] = useState(false);
  useEffect(() => { try { setDone(localStorage.getItem("challenge-done") === "1"); } catch {} }, []);
  const toggle = () => { const n = !done; setDone(n); try { localStorage.setItem("challenge-done", n ? "1" : "0"); } catch {} };
  return (
    <div className="mt-4 rounded-2xl border border-border/30 bg-card/40 p-4">
      <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60 mb-2 flex items-center gap-1"><span>🏆</span> Daily Challenge</p>
      <p className="text-sm mb-2">Complete one mindful act before noon.</p>
      <button onClick={toggle} className="text-xs px-3 py-1 rounded-full border border-border/40">
        {done ? "Completed ✓" : "Mark done"}
      </button>
    </div>
  );
}
