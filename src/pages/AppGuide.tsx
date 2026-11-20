/**
 * App Guide â€” learn the app by talking to the orb.
 *
 * The orb is the shared R3F surface; every action also has a DOM control, so
 * the same screen works with a mouse, a keyboard and a voice. Deepgram carries
 * both directions: speech in through `stt-listen`, speech out through
 * `tts-speak`. Text input is always available as a fallback.
 */
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { HomeOrb } from "@/components/orb";
import { orbPaletteFromHue } from "@/components/orb/palettes";
import { useAppGuide, type GuideTurn } from "@/hooks/useAppGuide";
import { GUIDE_TOPICS, GUIDE_TOUR, getGuideTopic } from "@/lib/app-guide";

const DEFAULT_HUE = 42;

function phaseLabel(phase: ReturnType<typeof useAppGuide>["phase"]): string {
  if (phase === "speaking") return "speaking";
  if (phase === "listening") return "listening";
  if (phase === "waiting") return "your turn";
  return "ready";
}

function TurnRow({ turn }: { turn: GuideTurn }) {
  const isGuide = turn.role === "guide";
  return (
    <li
      className={cn(
        "rounded-2xl border px-3.5 py-2.5 font-body text-[0.82rem] leading-relaxed",
        isGuide
          ? "border-border/35 bg-background/45 text-foreground/85"
          : "ml-6 border-primary/25 bg-primary/10 text-foreground",
      )}
    >
      <span className="mr-2 font-display text-[0.6rem] uppercase tracking-[0.2em] text-primary/60">
        {isGuide ? "Guide" : "You"}
      </span>
      {turn.text}
    </li>
  );
}

export default function AppGuide() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isIntro = searchParams.get("intro") === "1";
  const guide = useAppGuide({ autoGreet: !isIntro });
  const [input, setInput] = useState("");
  const historyEndRef = useRef<HTMLDivElement | null>(null);
  const introStartedRef = useRef(false);

  useEffect(() => {
    if (!isIntro || introStartedRef.current) return;
    introStartedRef.current = true;
    const timer = window.setTimeout(() => {
      void guide.startIntro();
    }, 300);
    return () => window.clearTimeout(timer);
    // The intro runs once per mount; startIntro identity is not a trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIntro]);

  const hue = guide.currentTopic?.accentHue ?? DEFAULT_HUE;
  const palette = useMemo(() => orbPaletteFromHue(hue), [hue]);

  const mood = guide.phase === "listening" ? "fire" : guide.phase === "speaking" ? "focus" : "calm";

  const displayLine =
    guide.line ||
    (guide.phase === "listening"
      ? "Listening. Ask about sessions, loops, levels, domains or yoga."
      : "Tap the orb to start the tour, or hold it to ask a question.");

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [guide.history.length, guide.line]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    void guide.handleUtterance(text);
  };

  const tourLabel =
    guide.tourIndex >= 0
      ? `Stop ${guide.tourIndex + 1} of ${GUIDE_TOUR.length}`
      : `${GUIDE_TOUR.length} stops`;

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(circle at 50% 16%, hsl(${hue} 82% 55% / 0.16), transparent 55%), radial-gradient(circle at 50% 100%, hsl(${hue} 70% 45% / 0.08), transparent 45%)`,
        }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 pb-2 pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border/40 bg-background/60 text-muted-foreground backdrop-blur transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </button>

        <div className="min-w-0 text-center">
          <p className="font-display text-[0.7rem] uppercase tracking-[0.24em] text-primary/70">
            App guide
          </p>
          <p className="truncate font-body text-[0.7rem] text-muted-foreground">
            Orb voice Â· {isIntro ? "first look" : tourLabel}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={guide.toggleTts}
            aria-pressed={guide.ttsEnabled}
            aria-label={guide.ttsEnabled ? "Mute the guide" : "Unmute the guide"}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
              guide.ttsEnabled
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/40 bg-background/60 text-muted-foreground",
            )}
          >
            {guide.ttsEnabled ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}
          </button>
          <button
            type="button"
            onClick={guide.toggleMic}
            disabled={!guide.micAvailable}
            aria-pressed={guide.micEnabled}
            aria-label={
              guide.micAvailable
                ? guide.micEnabled
                  ? "Disable the microphone"
                  : "Enable the microphone"
                : "Microphone is not available in this browser"
            }
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-40",
              guide.micEnabled
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/40 bg-background/60 text-muted-foreground",
            )}
          >
            {guide.micEnabled ? <Mic className="h-4 w-4" aria-hidden /> : <MicOff className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-2 sm:px-6">
        <section className="relative">
          <div className="relative mx-auto w-[min(70vw,17rem)]">
            <HomeOrb
              size={272}
              interactive
              mood={mood}
              gate="morning"
              className="w-full"
              onActivate={() => {
                if (guide.phase === "speaking" || guide.phase === "listening") {
                  void guide.next();
                } else if (guide.tourIndex < 0) {
                  void guide.startTour();
                } else {
                  void guide.next();
                }
              }}
              onHold={() => void guide.listen()}
              onTriple={guide.stop}
            />
            <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-1">
              <span className="rounded-full bg-background/70 px-3 py-1 font-display text-[0.58rem] uppercase tracking-[0.22em] text-primary/80 backdrop-blur">
                {phaseLabel(guide.phase)}
              </span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
              {guide.currentTopic ? guide.currentTopic.title : "Ask about this app"}
            </h1>
            <p className="mt-1 font-body text-[0.8rem] text-muted-foreground">
              {guide.currentTopic ? guide.currentTopic.summary : "Sessions, loops, levels, domains, yoga â€” spoken, not skimmed."}
            </p>
          </div>

          <div
            aria-live="polite"
            className="mt-4 min-h-[4.5rem] rounded-3xl border border-border/40 bg-background/55 px-5 py-4 text-center backdrop-blur-xl"
          >
            <p className="font-body text-[0.95rem] leading-relaxed text-foreground/90">{displayLine}</p>
            {guide.micHint ? (
              <p className="mt-2 font-body text-[0.72rem] text-muted-foreground">{guide.micHint}</p>
            ) : null}
          </div>
        </section>

        <section className="flex flex-wrap items-center justify-center gap-2">
          {isIntro ? (
            <button
              type="button"
              onClick={() => navigate("/app")}
              className="inline-flex items-center gap-2 rounded-full border border-border/40 px-4 py-3 font-body text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              Skip to app
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void guide.startTour()}
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/12 px-5 py-3 font-display text-sm text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            {guide.tourIndex < 0 ? "Start tour" : "Restart tour"}
          </button>
          <button
            type="button"
            onClick={() => void guide.listen()}
            disabled={!guide.micEnabled}
            className="inline-flex items-center gap-2 rounded-full border border-border/40 px-4 py-3 font-body text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-40"
          >
            <Mic className="h-3.5 w-3.5" aria-hidden />
            {guide.phase === "listening" ? "Listeningâ€¦" : "Ask by voice"}
          </button>
          <button
            type="button"
            onClick={() => void guide.repeat()}
            className="inline-flex items-center gap-2 rounded-full border border-border/40 px-4 py-3 font-body text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Repeat
          </button>
          <button
            type="button"
            onClick={() => void guide.next()}
            className="inline-flex items-center gap-2 rounded-full border border-border/40 px-4 py-3 font-body text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            Next
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={guide.stop}
            className="inline-flex items-center gap-2 rounded-full border border-border/40 px-4 py-3 font-body text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Square className="h-3.5 w-3.5" aria-hidden />
            Stop
          </button>
        </section>

        <section className="rounded-3xl border border-border/40 bg-background/45 p-4 backdrop-blur-xl sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="font-body text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              Conversation
            </span>
            {guide.history.length ? (
              <span className="font-body text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground/70">
                {guide.history.length} turns
              </span>
            ) : null}
          </div>

          {guide.history.length ? (
            <ul className="max-h-[16rem] space-y-2 overflow-y-auto pr-1">
              {guide.history.map((turn) => (
                <TurnRow key={turn.id} turn={turn} />
              ))}
              <div ref={historyEndRef} />
            </ul>
          ) : (
            <p className="font-body text-[0.8rem] text-muted-foreground">
              Nothing yet. Start the tour, or ask something like "loops kya hai".
            </p>
          )}

          <form onSubmit={submit} className="mt-3 flex items-center gap-2 border-t border-border/30 pt-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type a questionâ€¦"
              aria-label="Ask the guide a question"
              className="min-w-0 flex-1 rounded-xl border border-border/40 bg-background/70 px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send question"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/35 bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:opacity-40"
            >
              <Send className="h-4 w-4" aria-hidden />
            </button>
          </form>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="font-body text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              Every concept
            </span>
            <button
              type="button"
              onClick={() => navigate("/app/guide")}
              className="inline-flex items-center gap-1 font-body text-[0.72rem] text-primary/80 hover:text-primary"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              Open Guide chat
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {GUIDE_TOPICS.map((topic) => {
              const active = guide.currentTopicId === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => void guide.explain(topic.id)}
                  className={cn(
                    "group flex flex-col items-start gap-1 rounded-2xl border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    active
                      ? "border-primary/45 bg-primary/10"
                      : "border-border/40 bg-background/40 hover:border-primary/25",
                  )}
                >
                  <span className="flex w-full items-center justify-between gap-2">
                    <span className="font-display text-[0.8rem] text-foreground">{topic.title}</span>
                    <ChevronRight
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5",
                        active ? "text-primary" : "text-muted-foreground/60",
                      )}
                      aria-hidden
                    />
                  </span>
                  <span className="font-body text-[0.66rem] uppercase tracking-[0.14em] text-primary/55">
                    {topic.eyebrow}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {guide.currentTopic?.detail ? (
          <motion.section
            key={guide.currentTopic.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-border/40 bg-background/45 p-4 backdrop-blur-xl sm:p-5"
          >
            <p className="font-body text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              On screen
            </p>
            <h2 className="mt-1 font-display text-base text-foreground">{guide.currentTopic.title}</h2>
            <div className="mt-2 space-y-2 font-body text-[0.85rem] leading-relaxed text-foreground/85">
              {guide.currentTopic.detail.split("\n\n").map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>

            {guide.currentTopic.followUps.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {guide.currentTopic.followUps
                  .map((id) => getGuideTopic(id))
                  .filter((topic): topic is NonNullable<typeof topic> => Boolean(topic))
                  .map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => void guide.explain(topic.id)}
                      className="rounded-full border border-border/40 px-3 py-1.5 font-body text-[0.7rem] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {topic.title}
                    </button>
                  ))}
              </div>
            ) : null}

            {guide.currentTopic.action ? (
              <button
                type="button"
                onClick={() => navigate(guide.currentTopic!.action!.to)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-3.5 py-2 font-body text-[0.72rem] text-primary transition-colors hover:bg-primary/20"
              >
                {guide.currentTopic.action.label}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            ) : null}
          </motion.section>
        ) : null}
      </main>
    </div>
  );
}

