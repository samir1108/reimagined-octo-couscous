export default function FiveBodiesCard() {
  const bodies = ["Physical", "Energy", "Mental", "Wisdom", "Bliss"];
  return (
    <div className="mt-4 rounded-2xl border border-border/30 bg-card/40 p-4">
      <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60 mb-2">5 Bodies (Koshas)</p>
      <div className="flex flex-wrap gap-2">
        {bodies.map(b => (
          <span key={b} className="text-xs px-2 py-1 rounded-full border border-border/40">{b}</span>
        ))}
      </div>
    </div>
  );
}
