import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Loader2, Sparkles, Lightbulb } from "lucide-react";
import { useMachine } from "@xstate/react";
import { Button } from "@/design-system";
import { journalMachine } from "@/machines/journalMachine";
import { useJournalEntries, useCreateJournalEntry } from "@/hooks/useJournalEntries";
import JournalHistory from "@/components/JournalHistory";
import { toast } from "@/hooks/use-toast";
import { conscious } from "@/lib/consciousToast";
import { supabase } from "@/lib/supabase";
import { useCreditGate } from "@/hooks/useCreditGate";
import { useConsciousnessEngine } from "@/hooks/useConsciousnessEngine";
import { useActiveGuruProgram } from "@/hooks/useGuruPrograms";
import { GURUS } from "@/lib/guru-data";
import { MASTER_IMAGES } from "@/assets/masters";
import { JournalThreadPicker } from "@/components/journal/JournalThreadPicker";
import JournalRhythmMap from "@/components/journal/JournalRhythmMap";
import type { JournalThread } from "@/hooks/useJournalThreads";
import { useCompleteGate } from "@/hooks/useSpiritualDNA";
import { isGateId } from "@/lib/consciousness/dailyGates";

const MOODS = ["😌 Peaceful", "😊 Grateful", "🤔 Reflective", "😤 Restless", "😔 Heavy", "✨ Inspired"];
const GO_DEEPER_DELAY_MS = 1000;
const MIN_CHARS_FOR_DEEPER = 10;

// ─── Progress-based prompt generator ───
function getPersonalizedPrompts(profile: any): string[] {
  const prompts: string[] = [];
  const vLevel = profile?.v_level_current ?? 0;
  const bands = profile?.dimension_bands as Record<string, number> | null;
  const loops = profile?.active_loops as Record<string, any> | null;
  const witness = profile?.witness_depth ?? 0;
  const streak = profile?.streak_current ?? 0;
  const journeyDay = profile?.journey_day ?? 1;
  const phase = profile?.journey_phase ?? "foundation";

  if (phase === "foundation" || journeyDay < 7) {
    prompts.push("What is one thing you did today on autopilot? Describe it moment by moment.");
    prompts.push("Close your eyes for 10 seconds. What was the first thought that appeared?");
    prompts.push("What emotion are you feeling right now? Where do you feel it in your body?");
  } else if (phase === "deepening" || journeyDay < 30) {
    prompts.push("What pattern have you noticed repeating this week? How does it start?");
    prompts.push("Write about a moment today where you caught yourself reacting instead of responding.");
    prompts.push("What is one belief about yourself that you're starting to question?");
  } else {
    prompts.push("What is the difference between who you think you are and who you actually are?");
    prompts.push("Describe a moment today when the witness was present. What did it feel like?");
    prompts.push("What loop are you currently dancing with? What is it trying to protect?");
  }

  if (bands) {
    const entries = Object.entries(bands).sort(([,a], [,b]) => (a as number) - (b as number));
    const weakest = entries[0]?.[0];
    if (weakest === "body") prompts.push("Scan your body from head to toe. Where is tension hiding? What does it want to say?");
    if (weakest === "emotion") prompts.push("Name three emotions you've felt today. Did you allow them fully, or did you resist?");
    if (weakest === "thought") prompts.push("What was your most persistent thought today? Observe it — is it fact or story?");
    if (weakest === "awareness") prompts.push("How many moments today were you truly present? What brought you back?");
  }

  if (streak === 0) prompts.push("You're starting fresh today. What brings you to this page right now?");
  if (streak >= 7) prompts.push(`${streak} days of showing up. What has shifted in you since day one?`);
  if (streak >= 30) prompts.push("A month of observation. Write a letter to the version of you from 30 days ago.");

  if (witness < 0.3) prompts.push("Try to write about yourself in third person. What do you notice?");
  if (witness > 0.6) prompts.push("Sit in silence for 30 seconds. Then write from the space between thoughts.");

  if (loops && Object.keys(loops).length > 0) {
    const loopNames = Object.keys(loops).slice(0, 2);
    prompts.push(`Your active pattern: "${loopNames[0]}". When did you last notice it running today?`);
  }

  if (vLevel < 2) prompts.push("What would change if you could watch your mind like a movie for just 5 minutes?");
  if (vLevel >= 3 && vLevel < 5) prompts.push("What are you avoiding looking at? Write without editing.");
  if (vLevel >= 5) prompts.push("What is arising in awareness right now that has no name?");

  return prompts;
}

export default function Journal() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlPrompt = searchParams.get("prompt");
  const gateParam = searchParams.get("gate");
  const requestedGate = isGateId(gateParam) ? gateParam : null;
  const urlGuruId = searchParams.get("guruId");
  const { handleInsufficientCredits } = useCreditGate();
  const { data: activeGuruProgram } = useActiveGuruProgram();
  const activeMaster = useMemo(() => {
    const id = urlGuruId || activeGuruProgram?.guru_id;
    if (!id) return null;
    return GURUS.find((g) => g.id === id) || null;
  }, [urlGuruId, activeGuruProgram?.guru_id]);
  const bgImage = activeMaster ? (MASTER_IMAGES[activeMaster.id] || activeMaster.image) : null;
  const { data: entries = [] } = useJournalEntries();
  const createEntry = useCreateJournalEntry();
  const completeGate = useCompleteGate();
  const [state, send] = useMachine(journalMachine);
  const [activeThread, setActiveThread] = useState<JournalThread | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // "Go deeper" button visibility + AI reflection state
  const [showGoDeeper, setShowGoDeeper] = useState(false);
  const [aiQuestion, setAiQuestion] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const goDeeperTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAiTextRef = useRef<string>("");

  // Auto-open with context prompt from navigation (e.g., night suggestions)
  useEffect(() => {
    if (urlPrompt && state.matches("viewing")) {
      send({ type: "OPEN_FORM" });
      setAiQuestion(urlPrompt);
    }
  }, [urlPrompt]);

  // Always keep in composing state
  useEffect(() => {
    if (state.matches("viewing")) {
      send({ type: "OPEN_FORM" });
    }
  }, [state.value]);

  // Auto-focus
  useEffect(() => {
    if (textareaRef.current && state.matches("composing")) {
      textareaRef.current.focus();
    }
  }, [state.value]);

  // Show "Go deeper" button after 1s pause of typing
  useEffect(() => {
    const content = state.context.content;
    if (goDeeperTimerRef.current) clearTimeout(goDeeperTimerRef.current);
    setShowGoDeeper(false);

    if (content.trim().length < MIN_CHARS_FOR_DEEPER) return;

    goDeeperTimerRef.current = setTimeout(() => {
      setShowGoDeeper(true);
    }, GO_DEEPER_DELAY_MS);

    return () => {
      if (goDeeperTimerRef.current) clearTimeout(goDeeperTimerRef.current);
    };
  }, [state.context.content]);

  // Clear AI question when user types new content
  useEffect(() => {
    if (aiQuestion && state.context.content.trim() !== lastAiTextRef.current) {
      setAiQuestion(null);
    }
  }, [state.context.content, aiQuestion]);

  const handleGoDeeper = useCallback(async () => {
    const content = state.context.content.trim();
    if (content.length < MIN_CHARS_FOR_DEEPER) return;
    if (content === lastAiTextRef.current && aiQuestion) return;
    lastAiTextRef.current = content;

    setShowGoDeeper(false);
    setAiLoading(true);
    setAiQuestion(null);
    try {
      const { data, error } = await supabase.functions.invoke("journal-reflect", {
        body: { journalContent: content, mood: state.context.mood || undefined },
      });
      if (error) throw error;
      if (data?.question) {
        setAiQuestion(data.question);
      }
    } catch (e: any) {
      if (e?.message?.includes?.("402") || e?.context?.status === 402) {
        handleInsufficientCredits();
        return;
      }
      console.error("AI reflection error:", e);
    } finally {
      setAiLoading(false);
    }
  }, [state.context.content, state.context.mood, aiQuestion, handleInsufficientCredits]);

  const handleSubmit = () => {
    const content = state.context.content.trim();
    if (!content) return;

    // Clear go deeper timer
    if (goDeeperTimerRef.current) clearTimeout(goDeeperTimerRef.current);

    send({ type: "SUBMIT" });

    createEntry.mutate(
      {
        title: state.context.title || undefined,
        content,
        mood: state.context.mood || undefined,
        threadId: activeThread?.id ?? null,
      },
      {
        onSuccess: () => {
          send({ type: "ENTRY_SAVED" });
          toast({ title: "Entry saved ✍️" });
          if (requestedGate) {
            completeGate.mutate(
              { gate: requestedGate },
              {
                onError: (error) => {
                  console.error("Journal entry saved but daily gate progress could not be updated", error);
                  toast({ title: "Entry saved, but this daily gate could not be marked complete.", variant: "destructive" });
                },
              },
            );
          }
          setAiQuestion(null);
          lastAiTextRef.current = "";
        },
        onError: () => {
          send({ type: "ERROR", message: "Failed to save" });
          conscious("actionMissed", { kind: "error" });
        },
      }
    );
  };

  const handleUseAiQuestion = () => {
    if (aiQuestion) {
      // Append the AI question as a new line in content for the user to respond to
      const separator = state.context.content.trim() ? "\n\n---\n\n" : "";
      send({ type: "SET_CONTENT", text: state.context.content + separator + "↳ " + aiQuestion + "\n\n" });
      setAiQuestion(null);
      lastAiTextRef.current = "";
      textareaRef.current?.focus();
    }
  };

  // Personalized prompts
  const { data: engineData } = useConsciousnessEngine();
  const personalizedPrompts = useMemo(() => getPersonalizedPrompts(engineData?.profile), [engineData?.profile]);
  const [promptIdx, setPromptIdx] = useState(0);

  const handleInsertPrompt = () => {
    const prompt = personalizedPrompts[promptIdx % personalizedPrompts.length];
    const separator = state.context.content.trim() ? "\n\n" : "";
    send({ type: "SET_CONTENT", text: state.context.content + separator + "↳ " + prompt + "\n\n" });
    setPromptIdx((prev) => prev + 1);
    textareaRef.current?.focus();
  };

  return (
    <>
      {bgImage && (
        <>
          <img
            src={bgImage}
            alt=""
            aria-hidden
            className="fixed inset-0 w-full h-full object-cover object-top pointer-events-none -z-10"
          />
          <div
            aria-hidden
            className="fixed inset-0 pointer-events-none -z-10"
            style={{
              background:
                "linear-gradient(180deg, hsl(var(--background) / 0.82) 0%, hsl(var(--background) / 0.55) 35%, hsl(var(--background) / 0.75) 70%, hsl(var(--background) / 0.97) 100%)",
            }}
          />
        </>
      )}
      <div className="relative flex flex-col h-[calc(100vh-3.5rem)] max-w-3xl mx-auto lg:max-w-5xl">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between px-1 py-3 shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="hidden md:block">
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Journal</h1>
          <p className="text-xs text-muted-foreground font-body">What's alive in you right now?</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {/* Personalized Prompt Button */}
          <motion.button
            onClick={handleInsertPrompt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display glass-subtle text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-border/30 hover:border-primary/25"
            whileTap={{ scale: 0.95 }}
            title="Get a personalized prompt"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Prompt
          </motion.button>
          <JournalThreadPicker activeThreadId={activeThread?.id ?? null} onChange={setActiveThread} />
          <JournalHistory entries={entries} />
        </div>
      </motion.div>

      {/* Journey banner */}
      <AnimatePresence>
        {activeThread && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mx-1 mb-2 px-4 py-2.5 rounded-2xl glass-subtle border border-primary/20 flex items-center gap-3"
          >
            <div className="w-1 h-8 rounded-full bg-gradient-sunrise" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-primary/80 font-display">
                Day {activeThread.entry_count + 1} · sitting with
              </p>
              <p className="text-sm font-display text-foreground truncate">{activeThread.title}</p>
              {activeThread.intention && (
                <p className="text-[11px] text-muted-foreground italic truncate mt-0.5">{activeThread.intention}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <JournalRhythmMap entries={entries} />

      {/* Big writing area */}
      <motion.div
        className="flex-1 flex flex-col glass-card rounded-3xl p-6 md:p-8 overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Main textarea */}
        <textarea
          ref={textareaRef}
          value={state.context.content}
          onChange={(e) => send({ type: "SET_CONTENT", text: e.target.value })}
          placeholder="Start writing... let your thoughts flow freely. Your words will be analyzed for patterns, loops, and consciousness signals."
           className="flex-1 w-full bg-transparent text-base font-body text-foreground placeholder:text-muted-foreground/50
                      border-0 outline-none resize-none leading-relaxed"
        />

        {/* Go Deeper button — appears after 1s pause */}
        <AnimatePresence>
          {showGoDeeper && !aiLoading && !aiQuestion && (
            <motion.div
              className="shrink-0 mt-3 flex justify-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                onClick={handleGoDeeper}
                variant="outline"
                size="sm"
                className="rounded-2xl text-xs font-display border-primary/20 text-primary hover:bg-primary/10 h-8 px-4 gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Go deeper
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Reflection — appears after Go Deeper is clicked */}
        <AnimatePresence>
          {(aiQuestion || aiLoading) && (
            <motion.div
              className="shrink-0 mt-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="rounded-2xl p-4 glass-subtle border border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-sunrise opacity-50" />
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {aiLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="font-body text-xs">Sensing deeper layers...</span>
                      </div>
                    ) : aiQuestion ? (
                      <>
                        <p className="text-sm font-body text-foreground/80 leading-relaxed italic">
                          {aiQuestion}
                        </p>
                        <div className="flex gap-2 mt-2.5">
                          <Button
                            onClick={handleUseAiQuestion}
                            size="sm"
                            className="rounded-xl text-[11px] font-display bg-gradient-sunrise text-primary-foreground h-7 px-3"
                          >
                            <PenLine className="w-3 h-3 mr-1" />
                            Respond
                          </Button>
                          <Button
                            onClick={() => setAiQuestion(null)}
                            variant="ghost"
                            size="sm"
                            className="rounded-xl text-[11px] font-display text-muted-foreground h-7 px-2.5"
                          >
                            Dismiss
                          </Button>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom bar: mood + submit */}
        <div className="shrink-0 pt-4 border-t border-border/10 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {MOODS.map((m) => (
              <motion.button
                key={m}
                onClick={() => send({ type: "TOGGLE_MOOD", mood: m })}
                className={`px-3 py-1.5 rounded-full text-[11px] font-body transition-all ${
                  state.context.mood === m
                    ? "bg-primary/15 text-primary border border-primary/25"
                    : "glass-subtle text-muted-foreground/60 hover:text-foreground/80"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {m}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!state.context.content.trim() || state.matches("saving")}
              className="flex-1 rounded-2xl font-display bg-gradient-sunrise text-primary-foreground shadow-lg shadow-primary/20 h-12 text-sm"
            >
              {state.matches("saving") ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <PenLine className="w-4 h-4 mr-2" />
              )}
              Save Entry
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="h-4 shrink-0" />
    </div>
    </>
  );
}
