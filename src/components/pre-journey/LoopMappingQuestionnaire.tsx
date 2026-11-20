/**
 * LoopMappingQuestionnaire
 * Mirror-style questionnaire matching the AssessmentRunner UI.
 * Flow: intro → categories → loops → per-loop details (intensity / triggers / connections) → saving → done.
 * Persists to user_loops + active_loops.
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, Loader2, Check, X } from "lucide-react";
import { Button } from "@/design-system";
import { Card } from "@/design-system";
import { Progress } from "@/design-system";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

import {
  LOOP_CATEGORIES,
  LOOP_TRIGGERS,
  INTENSITY_LABELS,
  loopsByCategory,
  getLoopById,
  type LoopCategoryKey,
} from "@/lib/loopLibraryCatalog";

interface Props {
  onClose: () => void;
  onComplete?: (summary: { savedLoopIds: string[] }) => void;
}

interface LoopDetail {
  intensity: number;
  triggers: string[];
  connections: string[];
}

type Phase = "intro" | "categories" | "loops" | "details" | "submitting" | "done";

export default function LoopMappingQuestionnaire({ onClose, onComplete }: Props) {
  const { toast } = useToast();
  const byCategory = useMemo(() => loopsByCategory, []);

  const [phase, setPhase] = useState<Phase>("intro");
  const [pickedCats, setPickedCats] = useState<Set<LoopCategoryKey>>(new Set());
  const [pickedLoops, setPickedLoops] = useState<Set<string>>(new Set());
  const [details, setDetails] = useState<Record<string, LoopDetail>>({});
  const [detailIdx, setDetailIdx] = useState(0);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const orderedLoops = useMemo(() => Array.from(pickedLoops), [pickedLoops]);
  const currentLoopId = orderedLoops[detailIdx];
  const currentLoop = currentLoopId ? getLoopById(currentLoopId) : undefined;
  const currentDetail = currentLoopId
    ? details[currentLoopId] ?? { intensity: 3, triggers: [], connections: [] }
    : null;

  const setDetail = (id: string, patch: Partial<LoopDetail>) => {
    setDetails((prev) => ({
      ...prev,
      [id]: { intensity: 3, triggers: [], connections: [], ...prev[id], ...patch },
    }));
  };

  const toggleCat = (k: LoopCategoryKey) => {
    setPickedCats((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k); // eslint-disable-line @typescript-eslint/no-unused-expressions
      return next;
    });
  };
  const toggleLoop = (id: string) => {
    setPickedLoops((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id); // eslint-disable-line @typescript-eslint/no-unused-expressions
      return next;
    });
  };

  const goNext = () => {
    if (phase === "categories") {
      if (pickedCats.size === 0) {
        toast({ title: "Pick at least one area", description: "Even one is enough to start." });
        return;
      }
      setPhase("loops");
    } else if (phase === "loops") {
      if (pickedLoops.size === 0) {
        toast({ title: "Pick at least one loop", description: "Choose what feels familiar." });
        return;
      }
      setPhase("details");
      setDetailIdx(0);
    } else if (phase === "details") {
      if (detailIdx < orderedLoops.length - 1) setDetailIdx((i) => i + 1);
      else void persist();
    }
  };

  const goBack = () => {
    if (phase === "categories") setPhase("intro");
    else if (phase === "loops") setPhase("categories");
    else if (phase === "details") {
      if (detailIdx > 0) setDetailIdx((i) => i - 1);
      else setPhase("loops");
    }
  };

  const persist = async () => {
    setPhase("submitting");
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;
      if (!userId) throw new Error("Not signed in");

      const rows = orderedLoops.map((id) => {
        const d = details[id] ?? { intensity: 3, triggers: [], connections: [] };
        const meta = INTENSITY_LABELS[d.intensity - 1] ?? INTENSITY_LABELS[2];
        return {
          user_id: userId,
          loop_id: id,
          status: meta.status,
          severity: meta.severity,
          awareness_score: meta.awareness,
          last_activated_at: new Date().toISOString(),
        };
      });
      const { error: upsertErr } = await (supabase as any)
        .from("user_loops")
        .upsert(rows, { onConflict: "user_id,loop_id" });
      if (upsertErr) throw upsertErr;

      const activeRows = orderedLoops.map((id) => {
        const d = details[id] ?? { intensity: 3, triggers: [], connections: [] };
        return {
          user_id: userId,
          loop_id: id,
          severity: d.intensity / 5,
          is_active: d.intensity >= 2,
          metadata: {
            source: "mirror_loop_mapping",
            triggers: d.triggers,
            connections: d.connections,
            intensity_label: INTENSITY_LABELS[d.intensity - 1]?.label,
          },
        };
      });
      await (supabase as any).from("active_loops").insert(activeRows);

      setSavedIds(orderedLoops);
      setPhase("done");
      onComplete?.({ savedLoopIds: orderedLoops });
    } catch (e: any) {
      console.error("[LoopMapping] save failed", e);
      toast({
        title: "Couldn't save",
        description: e.message ?? "Try again in a moment.",
        variant: "destructive",
      });
      setPhase("details");
    }
  };

  // ─── Progress / counts (mimic AssessmentRunner) ─────────────────
  const totalSteps = 2 + orderedLoops.length; // categories + loops + N details
  const stepIndex =
    phase === "categories" ? 0
    : phase === "loops" ? 1
    : phase === "details" ? 2 + detailIdx
    : 0;
  const progress = phase === "intro" || phase === "submitting" || phase === "done"
    ? 0
    : ((stepIndex + 1) / totalSteps) * 100;

  // ─── Wrapper (matches AssessmentRunner page chrome) ─────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[150] bg-background overflow-y-auto"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 pb-32">
        {/* Top bar — Back + close */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => (phase === "intro" ? onClose() : setPhase("intro"))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 hover:bg-muted/70 text-sm text-foreground/80 hover:text-foreground border border-border/40 transition"
            aria-label="Back"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{phase === "intro" ? "Library" : "Back"}</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-muted/40 hover:bg-muted/70 text-foreground/80 hover:text-foreground border border-border/40 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* INTRO */}
        {phase === "intro" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🧭</div>
              <h1 className="font-display text-3xl font-semibold tracking-tight mb-2">Map your loops</h1>
              <p className="text-muted-foreground text-sm mb-1">
                Show the engine which loops actually run you.
              </p>
              <p className="text-xs text-muted-foreground/70 uppercase tracking-widest mt-2">
                Mirror · 3–5 min · loop intensity & triggers
              </p>
            </div>

            <Card className="p-6 mb-6">
              <p className="text-sm leading-relaxed text-foreground/90">
                You'll pick the areas where something repeats, then choose the specific loops that
                feel familiar. For each one, you'll set how loud it is, when it tends to fire, and
                which other loops it's tangled with. Your map directly shapes how every future
                session reads you.
              </p>
            </Card>

            <Button size="lg" className="w-full" onClick={() => setPhase("categories")}>
              <Sparkles className="w-4 h-4 mr-2" /> Begin
            </Button>
          </motion.div>
        )}

        {/* SUBMITTING */}
        {phase === "submitting" && (
          <div className="pt-20 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-sm text-muted-foreground">Mapping your loops…</p>
          </div>
        )}

        {/* DONE */}
        {phase === "done" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-10">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="font-display text-2xl font-semibold tracking-tight mb-2">Map saved</h2>
            <p className="text-sm text-muted-foreground mb-8">
              {savedIds.length} loops are now part of your Mirror. The engine will adapt every session.
            </p>
            <Button size="lg" className="w-full" onClick={onClose}>
              Close
            </Button>
          </motion.div>
        )}

        {/* QUESTIONNAIRE PHASES */}
        {(phase === "categories" || phase === "loops" || phase === "details") && (
          <>
            {/* Progress (mirrors AssessmentRunner) */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>
                  {phase === "categories" && `Step 1 of ${totalSteps}`}
                  {phase === "loops" && `Step 2 of ${totalSteps}`}
                  {phase === "details" && `Step ${3 + detailIdx} of ${totalSteps}`}
                </span>
                <span className="capitalize">
                  {phase === "categories" && "areas"}
                  {phase === "loops" && "loops"}
                  {phase === "details" && (currentLoop?.name ?? "details")}
                </span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>


            <AnimatePresence mode="wait">
              <motion.div
                key={`${phase}-${detailIdx}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* CATEGORIES */}
                {phase === "categories" && (
                  <Card className="p-5 sm:p-7 mb-4">
                    <h2 className="font-display text-lg sm:text-xl font-medium mb-2 leading-snug">
                      Where does something repeat in you?
                    </h2>
                    <p className="text-sm text-muted-foreground mb-5">
                      Tap any areas that resonate. Pick as many as feel true.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {LOOP_CATEGORIES.map((c) => {
                        const on = pickedCats.has(c.key);
                        return (
                          <button
                            key={c.key}
                            onClick={() => toggleCat(c.key)}
                            className={`text-left rounded-xl p-3 border transition-all ${
                              on
                                ? "border-primary bg-primary/10"
                                : "border-border/40 hover:border-border hover:bg-muted/40"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xl">{c.emoji}</span>
                              {on && <Check className="w-4 h-4 text-primary" />}
                            </div>
                            <div className="mt-1 text-sm font-semibold text-foreground">{c.label}</div>
                            <div className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                              {c.blurb}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                )}

                {/* LOOPS */}
                {phase === "loops" && (
                  <Card className="p-5 sm:p-7 mb-4">
                    <h2 className="font-display text-lg sm:text-xl font-medium mb-2 leading-snug">
                      Pick the loops that feel familiar
                    </h2>
                    <p className="text-sm text-muted-foreground mb-5">
                      First instinct is usually right. You can refine later.
                    </p>
                    <div className="space-y-5">
                      {Array.from(pickedCats).map((catKey) => {
                        const cat = LOOP_CATEGORIES.find((c) => c.key === catKey)!;
                        const items = byCategory[catKey] ?? [];
                        return (
                          <div key={catKey}>
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                              {cat.emoji} {cat.label}
                            </div>
                            <div className="space-y-1.5">
                              {items.map((l) => {
                                const on = pickedLoops.has(l.id);
                                return (
                                  <button
                                    key={l.id}
                                    onClick={() => toggleLoop(l.id)}
                                    className={`w-full text-left rounded-xl px-3 py-2.5 border transition-all flex items-start gap-3 text-sm ${
                                      on
                                        ? "border-primary bg-primary/10 text-foreground"
                                        : "border-border/40 hover:border-border hover:bg-muted/40 text-foreground/90"
                                    }`}
                                  >
                                    <div
                                      className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 ${
                                        on ? "bg-primary text-primary-foreground" : "bg-muted"
                                      }`}
                                    >
                                      {on && <Check className="w-3.5 h-3.5" />}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-medium">{l.name}</div>
                                      <div className="text-[11px] text-muted-foreground leading-snug">
                                        {l.hint}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}

                {/* DETAILS */}
                {phase === "details" && currentLoop && currentDetail && (
                  <Card className="p-5 sm:p-7 mb-4">
                    <div className="mb-5">
                      <div className="text-[11px] uppercase tracking-widest text-muted-foreground/70 mb-1">
                        Loop {detailIdx + 1} of {orderedLoops.length}
                      </div>
                      <h2 className="font-display text-lg sm:text-xl font-medium leading-snug">
                        {currentLoop.name}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">{currentLoop.hint}</p>
                    </div>

                    {/* Intensity */}
                    <div className="mb-6">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        How loud is it?
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[1, 2, 3, 4, 5].map((n) => {
                          const on = currentDetail.intensity === n;
                          return (
                            <button
                              key={n}
                              onClick={() => setDetail(currentLoop.id, { intensity: n })}
                              className={`rounded-xl py-2.5 text-sm font-semibold transition-all border ${
                                on
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border/40 hover:border-border hover:bg-muted/40 text-foreground"
                              }`}
                            >
                              {n}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-2 text-center italic">
                        {INTENSITY_LABELS[currentDetail.intensity - 1]?.label}
                      </p>
                    </div>

                    {/* Triggers */}
                    <div className="mb-6">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        When does it fire?
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(LOOP_TRIGGERS[currentLoop.id] ?? []).map((t) => {
                          const on = currentDetail.triggers.includes(t);
                          return (
                            <button
                              key={t}
                              onClick={() => {
                                const next = on
                                  ? currentDetail.triggers.filter((x) => x !== t)
                                  : [...currentDetail.triggers, t];
                                setDetail(currentLoop.id, { triggers: next });
                              }}
                              className={`rounded-full px-3 py-1.5 text-xs border transition-all ${
                                on
                                  ? "border-primary bg-primary/15 text-primary"
                                  : "border-border/40 hover:border-border hover:bg-muted/40 text-muted-foreground"
                              }`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Connections */}
                    {orderedLoops.length > 1 && (
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Linked to which other loops?
                        </div>
                        <div className="space-y-1.5">
                          {orderedLoops
                            .filter((id) => id !== currentLoop.id)
                            .map((id) => {
                              const l = getLoopById(id);
                              if (!l) return null;
                              const on = currentDetail.connections.includes(id);
                              return (
                                <button
                                  key={id}
                                  onClick={() => {
                                    const next = on
                                      ? currentDetail.connections.filter((x) => x !== id)
                                      : [...currentDetail.connections, id];
                                    setDetail(currentLoop.id, { connections: next });
                                  }}
                                  className={`w-full text-left rounded-xl px-3 py-2 border text-sm transition-all flex items-center gap-2 ${
                                    on
                                      ? "border-primary bg-primary/10 text-foreground"
                                      : "border-border/40 hover:border-border hover:bg-muted/40 text-muted-foreground"
                                  }`}
                                >
                                  <div
                                    className={`w-4 h-4 rounded-md flex items-center justify-center ${
                                      on ? "bg-primary text-primary-foreground" : "bg-muted"
                                    }`}
                                  >
                                    {on && <Check className="w-3 h-3" />}
                                  </div>
                                  <span className="truncate">{l.name}</span>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Footer nav */}
            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" size="sm" onClick={goBack}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              {phase === "details" && detailIdx === orderedLoops.length - 1 ? (
                <Button onClick={() => void persist()}>
                  Save my map <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={goNext}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
