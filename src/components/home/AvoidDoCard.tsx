export default function AvoidDoCard() {
  return (
    <div className="mt-4 rounded-2xl border border-border/30 bg-card/40 p-4">
      <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60 mb-2">Do / Avoid</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="font-medium mb-1">Do</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Breathe slowly</li>
            <li>• One kind act</li>
            <li>• Journal 3 lines</li>
          </ul>
        </div>
        <div>
          <p className="font-medium mb-1">Avoid</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Rushed reactions</li>
            <li>• Doom scrolling</li>
            <li>• Skipping rest</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
