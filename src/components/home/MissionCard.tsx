import { useState, useEffect } from "react";

export default function MissionCard({ tasks = [
  { id: 1, text: "Morning practice: 10 min observation", done: false },
  { id: 2, text: "Midday reflection: Journal 3 lines", done: false },
  { id: 3, text: "Evening action: One kind act", done: false }
]}) {
  const [done, setDone] = useState(() => tasks.map((t) => !!t.done));
  useEffect(() => {
    setDone(tasks.map((t) => !!t.done));
  }, [tasks]);
  useEffect(() => {
    try { const saved = localStorage.getItem("mission-done"); if (saved) setDone(JSON.parse(saved)); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("mission-done", JSON.stringify(done)); } catch {}
  }, [done]);
  return (
    <div className="mt-4 rounded-2xl border border-border/30 bg-card/40 p-4">
      <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60 mb-3 flex items-center gap-1">
        <span>🎯</span> Today's Mission
      </p>
      <ul className="space-y-2">
        {tasks.map((t, i) => (
          <li key={t.id} className="flex items-center gap-2">
            <input type="checkbox" checked={done[i]} onChange={() => setDone(d => d.map((x, j) => j === i ? !x : x))} />
            <span className={done[i] ? "line-through text-muted-foreground" : ""}>{t.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
