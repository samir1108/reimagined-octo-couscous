import { useState, useEffect } from "react";

interface Props { dailyTasks?: any[]; observationTasks?: any[]; }

export default function TodayMissionCard({ dailyTasks = [], observationTasks = [] }: Props) {
  const items = [
    ...dailyTasks.slice(0, 2).map((t: any) => t?.title || t?.name || "Daily task"),
    ...observationTasks.slice(0, 1).map((t: any) => t?.title || t?.prompt || "Observation"),
  ].slice(0, 3);
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false));
  useEffect(() => {
    try {
      const raw = localStorage.getItem("today-mission");
      if (raw) setDone(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("today-mission", JSON.stringify(done)); } catch {}
  }, [done]);
  if (!items.length) return null;
  return (
    <div className="mt-4 rounded-2xl border border-border/30 bg-card/40 p-4">
      <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60 mb-2">Today's Mission</p>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!done[i]} onChange={() => setDone(d => d.map((x,j)=> j===i ? !x : x))} />
            <span className={done[i] ? "line-through text-muted-foreground" : ""}>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
