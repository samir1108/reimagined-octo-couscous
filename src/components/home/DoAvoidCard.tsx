export default function DoAvoidCard() {
  const dos = ["Breathe slowly", "One kind act", "Journal 3 lines"];
  const avoids = ["Rushed reactions", "Doom scrolling", "Skipping rest"];
  return (
    <div className="mt-4 rounded-2xl border border-border/30 bg-card/40 p-4">
      <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60 mb-2 flex items-center gap-1"><span>✅</span> Do / Avoid</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-medium mb-2 flex items-center gap-1"><span>✅</span> Do</p>
          <ul className="space-y-1 text-sm text-muted-foreground">{dos.map(d => <li key={d}>• {d}</li>)}</ul>
        </div>
        <div>
          <p className="font-medium mb-2 flex items-center gap-1"><span>❌</span> Avoid</p>
          <ul className="space-y-1 text-sm text-muted-foreground">{avoids.map(a => <li key={a}>• {a}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}
