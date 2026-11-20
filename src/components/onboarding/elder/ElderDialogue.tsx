/**
 * ElderDialogue — the 15–30 minute onboarding conversation.
 *
 * Single full-screen chat-style UI. Elder speaks (1–3 sentences), user picks
 * 1 of 3–5 MCQ chips. After ~22+ turns across 6 arcs, the model marks `done`
 * and we surface the final structured reading via onComplete().
 *
 * State is persisted to localStorage (`elder_dialogue_<userId>`) so a refresh
 * mid-conversation resumes where the user left off.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import elderSittingImg from "@/assets/elder-sitting.png";
import ElderFinalizing from "./ElderFinalizing";
import MicroPracticeCard from "./MicroPracticeCard";
import ResistanceBanner from "./ResistanceBanner";
import { useUserLanguage } from "@/hooks/useUserLanguage";

const ElderLabel = () => (
  <div className="flex items-center gap-2 mb-1.5">
    <img
      src={elderSittingImg}
      alt="Elder sitting in meditation"
      width={28}
      height={28}
      loading="lazy"
      className="w-7 h-7 rounded-full object-cover object-top bg-primary/10 ring-1 ring-primary/30"
    />
    <p className="text-[10px] uppercase tracking-widest text-primary/70">Elder</p>
  </div>
);

export interface ElderTurn {
  role: "elder" | "user";
  text: string;
  signal?: string;
  arc?: number;
  /** ms between the Elder's turn appearing and the user responding — Silence Metric. */
  latencyMs?: number;
  /** true when user tapped "prefer not to answer" — Refusal Log. */
  refused?: boolean;
}

export interface ElderReading {
  bands: { thought: number; emotion: number; body: number; awareness: number; action: number; connection: number };
  startingBand: number;
  startingPhase: number;
  startingPhaseName: string;
  archetype: string;
  archetypeDescription?: string;
  headHeartGut: { head: number; heart: number; gut: number };
  topLoops: string[];
  pathLevels: { karma: number; bhakti: number; jnana: number; raja: number };
  recommendedPath: "karma" | "bhakti" | "jnana" | "raja";
  recommendedGuru: string;
  recommendedGuruName: string;
  recommendedGuruWhy?: string;
  // Extended reading
  gunas?: { tamas: number; rajas: number; sattva: number };
  energy?: { level: string; quality?: string; primaryCenter: string };
  body?: { awarenessLevel: number; primaryHoldings?: string[]; breathQuality?: string };
  observation?: { witnessLevel: number; metacognition?: string };
  practiceLevels?: {
    observation: number; selfInquiry: number; netiNeti: number;
    mantra: number; breath: number; surrender: number;
    service: number; contemplation: number; presence: number;
  };
  inner?: {
    attentionSpan?: number; emotionalRegulation?: number;
    sleepQuality?: number; valuesClarity?: number; resilience?: number;
  };
  context?: {
    priorExperienceYears?: number;
    traditionsExplored?: string[];
    availableSlotsPerDay?: number;
    supportSystem?: string;
    lifeStage?: string;
  };
  shadowPatterns?: string[];
  lifeDomainHeat?: Record<string, number>;
  whyNow?: string;
  firstPractice?: string;
  /** The 8 personal-master dials extracted from the dialogue. */
  humanMap?: {
    wound?: string;
    mask?: string;
    hunger?: string;
    mirror?: string;
    body?: string;
    dayShape?: string;
    resistance?: string;
    belief?: string;
    confidence?: number;
  };
  /** Anchor Extraction (IP #4) — 5 constants that drive downstream personalization. */
  anchors?: {
    northStar?: string;
    fearUnderFear?: string;
    signatureLoop?: string;
    unlivedLife?: string;
    voiceTheyNeed?: string;
  };
  /** Defense-style fingerprint (IP #2). */
  defenseStyle?: "intellectualizer" | "minimizer" | "performer" | "collapser" | "attacker" | "unknown";
  /** Aggregate silence-metric telemetry — filled client-side, mirrored to reading. */
  latencyStats?: {
    mean: number;
    median: number;
    fastShort: number; // deflection count
    slowShort: number; // live truth count
    fastLong: number;  // rehearsed identity count
    slowLong: number;  // integration count
  };
  refusalCount?: number;
  summary: string;
}

interface NextTurn {
  elderText: string;
  choices: { id: string; label: string; signal?: string }[];
  arc: number;
  arcName: string;
  arcProgress: number;
  done: boolean;
  mirrorLine?: string;
}

interface Props {
  userId: string;
  name: string;
  onComplete: (reading: ElderReading, history: ElderTurn[]) => void;
  onPause?: (history: ElderTurn[]) => void;
}

const ARCS = ["Arrival", "The Day", "Mind", "Heart", "Body", "Shadow", "Lineage", "Aspiration"];
const TARGET_MINUTES = 60;
const CHECKPOINTS = [15, 30, 45]; // minute marks that show pause modal

export default function ElderDialogue({ userId, name, onComplete, onPause }: Props) {
  const language = useUserLanguage();
  const storageKey = `elder_dialogue_${userId}`;
  // Hydrate both history AND the active question so the user returns to
  // the EXACT same screen they left (not a regenerated question that
  // feels like "starting over").
  const hydrated = (() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const p = JSON.parse(raw) ?? {};
        return {
          history: Array.isArray(p.history) ? (p.history as ElderTurn[]) : [],
          current: (p.current as NextTurn | null) ?? null,
        };
      }
    } catch { /* ignore */ }
    return { history: [] as ElderTurn[], current: null as NextTurn | null };
  })();
  const [history, setHistory] = useState<ElderTurn[]>(hydrated.history);
  const [current, setCurrent] = useState<NextTurn | null>(hydrated.current);
  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track which call failed so the Retry button retries the right one
  // instead of silently re-opening the dialogue (the previous behavior
  // that made the analysis screen "bounce back" to the conversation).
  const [errorKind, setErrorKind] = useState<"next" | "finalize" | null>(null);
  const fetchedFor = useRef<number>(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Persist history + the active question so closing mid-dialogue
  // resumes on the exact same prompt.
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ history, current }));
    } catch { /* ignore */ }
  }, [storageKey, history, current]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history, current]);

  // Fetch next turn whenever history length changes (and we don't have a current turn).
  useEffect(() => {
    if (current || finalizing) return;
    if (fetchedFor.current === history.length) return;
    fetchedFor.current = history.length;
    void fetchNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.length, current, finalizing]);

  async function invokeWithRetry<T>(action: "next" | "finalize"): Promise<T> {
    const body = action === "next"
      ? { name, history, action, reading: {}, language }
      : { name, history, action, language };
    let lastErr: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { data, error: err } = await supabase.functions.invoke("elder-dialogue", { body });
        if (err) throw err;
        return data as T;
      } catch (e: any) {
        lastErr = e;
        const status = e?.context?.status;
        let detail = "";
        if (e?.context instanceof Response) {
          try {
            const payload = await e.context.clone().json();
            detail = String(payload?.detail || payload?.error || "");
          } catch { /* ignore */ }
        }
        if (status === 429 || detail.toLowerCase().includes("rate limit")) {
          lastErr = new Error("The reading engine is busy for a few seconds. Please try the reading again.");
          await new Promise((r) => setTimeout(r, 2500 + attempt * 2500));
          continue;
        }
        const msg = (e?.message || detail || "").toLowerCase();
        const isNetwork = msg.includes("failed to fetch") || msg.includes("failed to send") || e?.name === "FunctionsFetchError" || e?.name === "TypeError";
        if (!isNetwork) break;
        await new Promise((r) => setTimeout(r, 600 + attempt * 800));
      }
    }
    throw lastErr;
  }

  async function fetchNext() {
    setLoading(true);
    setError(null);
    setErrorKind(null);
    try {
      const turn = await invokeWithRetry<NextTurn>("next");
      // Edge fn marks done at 35+ user turns and hard-caps at 55.
      const userTurnsSoFar = history.filter((h) => h.role === "user").length;
      if (turn?.done && userTurnsSoFar >= 30) {
        await finalize();
      } else {
        setCurrent(turn);
      }
    } catch (e: any) {
      console.error("elder-dialogue/next failed", e);
      setError(e?.message || "The Elder is silent. Try again.");
      setErrorKind("next");
    } finally {
      setLoading(false);
    }
  }

  async function finalize() {
    setFinalizing(true);
    setCurrent(null);
    setError(null);
    setErrorKind(null);
    try {
      const reading = await invokeWithRetry<ElderReading>("finalize");
      try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
      onComplete(reading, history);
    } catch (e: any) {
      console.error("elder-dialogue/finalize failed", e);
      setError(e?.message || "Could not seal the reading. Try once more.");
      setErrorKind("finalize");
      setFinalizing(false);
    }
  }

  const [typed, setTyped] = useState("");
  // Silence Metric (IP #1) — timestamp when the current elder turn was shown.
  const shownAtRef = useRef<number>(Date.now());
  useEffect(() => { if (current) shownAtRef.current = Date.now(); }, [current]);

  function commitUserTurn(userTurn: ElderTurn) {
    if (!current) return;
    const elderTurn: ElderTurn = { role: "elder", text: current.elderText, arc: current.arc };
    const latencyMs = Date.now() - shownAtRef.current;
    setHistory((h) => [...h, elderTurn, { ...userTurn, arc: current.arc, latencyMs }]);
    setCurrent(null);
    setTyped("");
  }
  function pick(choice: { id: string; label: string; signal?: string }) {
    commitUserTurn({ role: "user", text: choice.label, signal: choice.signal });
  }
  function submitTyped() {
    const t = typed.trim();
    if (!t || !current) return;
    commitUserTurn({ role: "user", text: t, signal: "free-text" });
  }
  function refuse() {
    // Refusal Log (IP #1) — track skips as first-class signals.
    commitUserTurn({ role: "user", text: "(prefer not to answer)", signal: "refusal", refused: true });
  }

  const userTurnCount = useMemo(() => history.filter((h) => h.role === "user").length, [history]);
  const arcNum = current?.arc ?? Math.min(8, Math.floor(userTurnCount / 5) + 1);
  // Long dialogue: target ~45 user turns / ~60 min, hard cap 55 (matches edge fn).
  const TARGET_TURNS = 45;
  const canForceFinish = userTurnCount >= 20;

  // Micro-Practice Reveal (IP #5) — inject once on the first Arc-5 (Body) turn.
  const [microPracticeDone, setMicroPracticeDone] = useState<boolean>(() => {
    try { return localStorage.getItem(`${storageKey}_mp`) === "1"; } catch { return false; }
  });
  const showMicroPractice = !microPracticeDone && current?.arc === 5;
  function completeMicroPractice(outcome: "did_it" | "skipped" | "partial", noticed: string) {
    try { localStorage.setItem(`${storageKey}_mp`, "1"); } catch { /* ignore */ }
    setMicroPracticeDone(true);
    // Log outcome as a first-class signal — visible in transcript so backend
    // can score compliance + interoception against self-report elsewhere.
    if (current) {
      const label = outcome === "did_it"
        ? `I did the practice. I noticed: ${noticed}`
        : outcome === "partial"
          ? `I partly did it. I noticed: ${noticed}`
          : "I skipped the practice.";
      commitUserTurn({ role: "user", text: label, signal: `micro-practice:${outcome}` });
    }
  }

  // Elapsed-time tracking — stored in localStorage so pause/resume keeps ticking correctly.
  const [startedAt] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(`${storageKey}_startedAt`);
      if (raw) return Number(raw);
    } catch { /* ignore */ }
    const now = Date.now();
    try { localStorage.setItem(`${storageKey}_startedAt`, String(now)); } catch { /* ignore */ }
    return now;
  });
  const progressPct = Math.min(96, Math.round((userTurnCount / TARGET_TURNS) * 100));
  const showSavedHint = userTurnCount >= 3 && userTurnCount < 20;
  const activeCheckpoint: number | null = null;
  const setActiveCheckpoint = (_: number | null) => {};

  if (finalizing) {
    return <ElderFinalizing name={name} />;
  }

  return (
    <div className="fixed inset-0 z-[110] bg-background flex flex-col overflow-hidden">
      {/* Cosmic stars background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
        {Array.from({ length: 60 }).map((_, i) => {
          const top = (i * 37) % 100;
          const left = (i * 53) % 100;
          const size = (i % 3) + 1;
          const delay = (i % 7) * 0.4;
          const dur = 2 + (i % 5) * 0.6;
          return (
            <span
              key={i}
              className="absolute rounded-full bg-foreground/70"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                width: size,
                height: size,
                opacity: 0.15 + ((i % 5) * 0.12),
                animation: `elderTwinkle ${dur}s ease-in-out ${delay}s infinite`,
              }}
            />
          );
        })}
        <style>{`@keyframes elderTwinkle { 0%,100% { opacity: 0.15; } 50% { opacity: 0.85; } }`}</style>
      </div>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-border/30">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Onboarding · Elder dialogue</p>
              <p className="text-sm font-display text-foreground mt-1">
                Arc {arcNum} / 8 — <span className="text-muted-foreground">{ARCS[arcNum - 1]}</span>
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              {ARCS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i + 1 < arcNum ? "w-3 bg-primary" : i + 1 === arcNum ? "w-5 bg-primary/80" : "w-2 bg-border/50"
                  }`}
                />
              ))}
            </div>
          </div>
          {/* Progress + time-remaining */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-[3px] bg-border/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/80 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
              {progressPct}%
            </p>
        </div>
        <ResistanceBanner turnCount={userTurnCount} />
      </div>

      </div>

      {/* Conversation */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {history.length === 0 && !current && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-muted-foreground text-sm mt-12 px-4"
            >
              <p className="text-base mb-2">The Elder is preparing for you, {name}…</p>
              <p className="text-xs text-muted-foreground/70 max-w-xs mx-auto leading-relaxed">
                This conversation usually takes 15–30 minutes. There's no rush — take your time with each question. Everything is saved automatically.
              </p>
            </motion.div>
          )}
          <AnimatePresence initial={false}>
            {history.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className={t.role === "elder" ? "" : "flex justify-end"}
              >
                {t.role === "elder" ? (
                  <div className="max-w-[88%]">
                    <ElderLabel />
                    <p className="text-foreground/90 leading-relaxed font-display text-base">{t.text}</p>
                  </div>
                ) : (
                  <div className="max-w-[80%] rounded-2xl bg-card/60 border border-border/40 px-4 py-2.5 text-sm text-foreground">
                    {t.text}
                  </div>
                )}
              </motion.div>
            ))}
            {current && (
              <motion.div
                key={`current-${history.length}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {current.mirrorLine && current.mirrorLine.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="mb-4 px-3 py-2 rounded-lg border border-primary/25 bg-primary/[0.04]"
                  >
                    <p className="text-[10px] uppercase tracking-widest text-primary/70 mb-0.5">What I'm hearing</p>
                    <p className="text-sm text-foreground/85 italic leading-snug">{current.mirrorLine}</p>
                  </motion.div>
                )}
                {showMicroPractice && (
                  <MicroPracticeCard onDone={completeMicroPractice} />
                )}
                {!showMicroPractice && <>
                <ElderLabel />
                <p className="text-foreground leading-relaxed font-display text-base mb-4">{current.elderText}</p>
                <div className="flex flex-col gap-2">
                  {current.choices.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => pick(c)}
                      className="text-left px-4 py-3 rounded-xl border border-border/40 bg-card/30 hover:bg-card/70 hover:border-primary/50 transition text-sm text-foreground"
                    >
                      {c.label}
                    </button>
                  ))}
                  <div className="mt-2 flex items-end gap-2">
                    <textarea
                      value={typed}
                      onChange={(e) => setTyped(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault();
                          submitTyped();
                        }
                      }}
                      rows={2}
                      placeholder="…or say it your way"
                      className="flex-1 resize-none px-3 py-2 rounded-xl bg-card/20 border border-border/30 focus:border-primary/50 focus:bg-card/40 outline-none text-sm text-foreground placeholder:text-muted-foreground/60 transition"
                    />
                    <button
                      onClick={submitTyped}
                      disabled={!typed.trim()}
                      className="px-3 py-2 rounded-xl text-xs uppercase tracking-wider border border-primary/40 text-primary hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      Send
                    </button>
                  </div>
                  {/* Refusal Log (IP #1) — first-class skip signal */}
                  <button
                    onClick={refuse}
                    className="mt-1 text-[11px] text-muted-foreground/70 hover:text-muted-foreground underline underline-offset-4 self-start transition"
                  >
                    Prefer not to answer
                  </button>
                </div>
                </>}
              </motion.div>
            )}
          </AnimatePresence>

          {loading && !current && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-muted-foreground text-xs italic px-4"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
              <span className="max-w-xs">the Elder is listening… take your time.</span>
            </motion.div>
          )}



          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive max-w-md mx-auto"
            >
              <p className="font-display mb-1">The Elder paused for a moment.</p>
              <p className="text-xs text-muted-foreground mb-3">{error}</p>
              <button
                onClick={() => {
                  if (errorKind === "finalize") {
                    void finalize();
                  } else {
                    fetchedFor.current = -1;
                    void fetchNext();
                  }
                }}
                className="text-xs underline underline-offset-4 hover:text-destructive/80 transition"
              >
                {errorKind === "finalize" ? "Try the reading again" : "Retry"}
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer — pause + escape hatch */}
      {!finalizing && (history.length > 0 || current) && (
        <div className="border-t border-border/30 px-5 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            <div className="text-[11px] text-muted-foreground/80">
              {showSavedHint && (
                <span className="italic">Saved automatically — close this and come back anytime. Your conversation will be waiting.</span>
              )}
              {canForceFinish && (
                <button
                  onClick={finalize}
                  className="text-xs text-muted-foreground hover:text-primary transition underline"
                >
                  I've shared enough — show me my reading
                </button>
              )}
            </div>
            {onPause && (
              <button
                onClick={() => onPause?.(history)}
                className="text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition px-3 py-1.5 rounded-full border border-border/40"
              >
                Pause · come back later
              </button>
            )}
          </div>
        </div>
      )}

      {/* Checkpoint modal at 15 / 30 / 45 min */}
      {activeCheckpoint && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-background/80 backdrop-blur-sm px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full rounded-2xl border border-border/50 bg-card/95 p-6 text-center shadow-2xl"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary/70 mb-3">
              {activeCheckpoint} minutes in
            </p>
            <h3 className="font-display text-2xl text-foreground mb-2">
              Take a breath.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              You've been going deep. Keep going, or pause here — everything is saved.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setActiveCheckpoint(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm hover:opacity-90 transition"
              >
                Keep going
              </button>
              {onPause && (
                <button
                  onClick={() => { setActiveCheckpoint(null); onPause?.(history); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border/50 text-sm text-foreground hover:bg-card transition"
                >
                  Pause · come back later
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
