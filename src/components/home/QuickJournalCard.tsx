import { useState, useEffect } from "react";

export default function QuickJournalCard() {
  const [text, setText] = useState("");
  useEffect(() => { try { setText(localStorage.getItem("journal-quick") || ""); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem("journal-quick", text); } catch {} }, [text]);
  return (
    <div className="mt-4 rounded-2xl border border-border/30 bg-card/40 p-4">
      <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60 mb-2 flex items-center gap-1"><span>📝</span> Quick Journal</p>
      <textarea
        value={text}
        onChange={e => setText(e.target.value.slice(0, 280))}
        placeholder="3 lines about today..."
        rows={3}
        className="w-full bg-transparent text-sm outline-none resize-none"
      />
    </div>
  );
}
