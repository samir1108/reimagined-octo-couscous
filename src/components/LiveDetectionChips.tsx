import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Scan, RefreshCw } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/design-system";
import { ScrollArea } from "@/design-system";
import type { DetectionResult, DetectedLoop, DetectedSource } from "@/hooks/useLiveDetection";
import { SOURCE_EMOJI, SOURCE_LABELS } from "@/hooks/useLiveDetection";

interface LiveDetectionChipsProps {
  detection: DetectionResult;
}

export default function LiveDetectionChips({ detection }: LiveDetectionChipsProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: "loop" | "source"; data: DetectedLoop | DetectedSource } | null>(null);

  if (!detection.loops.length && !detection.sources.length) return null;

  return (
    <>
      <motion.div
        className="flex flex-wrap gap-1.5 px-2 py-1"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Loop chips */}
        {detection.loops.map((loop) => (
          <motion.button
            key={loop.id}
            onClick={() => {
              setSelectedItem({ type: "loop", data: loop });
              setDetailOpen(true);
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-display font-medium
                       bg-destructive/10 text-destructive border border-destructive/20
                       hover:bg-destructive/20 transition-all cursor-pointer"
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className="w-2.5 h-2.5" />
            {loop.name}
            <span className="opacity-60">{Math.round(loop.confidence * 100)}%</span>
          </motion.button>
        ))}

        {/* Source chips */}
        {detection.sources.map((source) => (
          <motion.button
            key={source.type}
            onClick={() => {
              setSelectedItem({ type: "source", data: source });
              setDetailOpen(true);
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-display font-medium
                       bg-primary/10 text-primary border border-primary/20
                       hover:bg-primary/20 transition-all cursor-pointer"
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xs">{SOURCE_EMOJI[source.type] || "💬"}</span>
            {SOURCE_LABELS[source.type] || source.type}
            <span className="opacity-60">{Math.round(source.strength * 100)}%</span>
          </motion.button>
        ))}

        {detection.overall_insight && (
          <motion.button
            onClick={() => {
              setSelectedItem(null);
              setDetailOpen(true);
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-display font-medium
                       bg-accent/50 text-accent-foreground border border-accent/30
                       hover:bg-accent/70 transition-all cursor-pointer"
            whileTap={{ scale: 0.95 }}
          >
            <Scan className="w-2.5 h-2.5" />
            Insight
          </motion.button>
        )}
      </motion.div>

      {/* Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
          <SheetHeader>
            <SheetTitle className="font-display text-lg flex items-center gap-2">
              {selectedItem?.type === "loop" ? (
                <>
                  <RefreshCw className="w-4 h-4 text-destructive" />
                  Loop Detected
                </>
              ) : selectedItem?.type === "source" ? (
                <>
                  <span>{SOURCE_EMOJI[(selectedItem.data as DetectedSource).type]}</span>
                  {SOURCE_LABELS[(selectedItem.data as DetectedSource).type]} Speaking
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4 text-primary" />
                  Live Insight
                </>
              )}
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="mt-4 max-h-[50vh]">
            {selectedItem?.type === "loop" && (
              <LoopDetail loop={selectedItem.data as DetectedLoop} />
            )}
            {selectedItem?.type === "source" && (
              <SourceDetail source={selectedItem.data as DetectedSource} />
            )}
            {!selectedItem && detection.overall_insight && (
              <div className="space-y-4">
                <p className="text-sm font-body text-foreground leading-relaxed">{detection.overall_insight}</p>
                
                {detection.loops.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider">Detected Loops</h4>
                    {detection.loops.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => setSelectedItem({ type: "loop", data: l })}
                        className="w-full text-left glass-card rounded-xl p-3 flex items-center justify-between group hover:border-destructive/30 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 text-destructive" />
                          <span className="text-sm font-display font-medium text-foreground">{l.name}</span>
                          <span className="text-[10px] text-muted-foreground">{l.id}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </button>
                    ))}
                  </div>
                )}

                {detection.sources.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider">Speaking Sources</h4>
                    {detection.sources.map((s) => (
                      <button
                        key={s.type}
                        onClick={() => setSelectedItem({ type: "source", data: s })}
                        className="w-full text-left glass-card rounded-xl p-3 flex items-center justify-between group hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <span>{SOURCE_EMOJI[s.type]}</span>
                          <span className="text-sm font-display font-medium text-foreground">{SOURCE_LABELS[s.type]}</span>
                          <span className="text-[10px] text-muted-foreground">{Math.round(s.strength * 100)}%</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}

function LoopDetail({ loop }: { loop: DetectedLoop }) {
  return (
    <div className="space-y-4 pb-4">
      <div className="glass-card rounded-xl p-4 border-destructive/20">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="w-4 h-4 text-destructive" />
          <h3 className="font-display font-semibold text-foreground">{loop.name}</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive">{loop.id}</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-muted mb-3">
          <div
            className="h-full rounded-full bg-destructive/70 transition-all"
            style={{ width: `${loop.confidence * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">Confidence: {Math.round(loop.confidence * 100)}%</p>
      </div>

      <div>
        <h4 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2">Evidence</h4>
        <p className="text-sm font-body text-foreground italic bg-muted/30 rounded-lg px-3 py-2">"{loop.evidence}"</p>
      </div>

      <div>
        <h4 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2">Why This Pattern</h4>
        <p className="text-sm font-body text-foreground leading-relaxed">{loop.why}</p>
      </div>

      <div className="glass-card rounded-xl p-3 border-primary/10">
        <h4 className="text-xs font-display font-semibold text-primary mb-1">💡 What to notice</h4>
        <p className="text-xs font-body text-muted-foreground">
          Simply notice this pattern without trying to change it. Awareness itself begins the dissolution process. 
          Ask yourself: "Can I observe this loop happening without identifying with it?"
        </p>
      </div>
    </div>
  );
}

function SourceDetail({ source }: { source: DetectedSource }) {
  return (
    <div className="space-y-4 pb-4">
      <div className="glass-card rounded-xl p-4 border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{SOURCE_EMOJI[source.type]}</span>
          <h3 className="font-display font-semibold text-foreground">{SOURCE_LABELS[source.type]} Speaking</h3>
        </div>
        <div className="w-full h-1.5 rounded-full bg-muted mb-3">
          <div
            className="h-full rounded-full bg-primary/70 transition-all"
            style={{ width: `${source.strength * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">Strength: {Math.round(source.strength * 100)}%</p>
      </div>

      <div>
        <h4 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2">Evidence</h4>
        <p className="text-sm font-body text-foreground italic bg-muted/30 rounded-lg px-3 py-2">"{source.evidence}"</p>
      </div>

      <div>
        <h4 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2">Insight</h4>
        <p className="text-sm font-body text-foreground leading-relaxed">{source.insight}</p>
      </div>

      <div className="glass-card rounded-xl p-3 border-primary/10">
        <h4 className="text-xs font-display font-semibold text-primary mb-1">💡 Inquiry</h4>
        <p className="text-xs font-body text-muted-foreground">
          {source.type === "mind" && "Is your mind trying to solve something that needs to be felt instead?"}
          {source.type === "heart" && "Can you let this feeling exist without needing to fix or explain it?"}
          {source.type === "gut" && "What is your body's wisdom telling you beneath the impulse?"}
          {source.type === "body" && "Where exactly do you feel this in your body? Breathe into that space."}
          {source.type === "identity" && "Who are you beyond this story you're telling about yourself?"}
          {source.type === "fear" && "If this fear were a young part of you, what would it need to hear?"}
          {source.type === "witness" && "Beautiful — you're already observing. Stay here."}
        </p>
      </div>
    </div>
  );
}
