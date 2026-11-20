/**
 * BirthInsightsChip — Compact one-line chip on Home. Tap to open a full-screen
 * dialog with ACTIONABLE astro/numerology guidance across 3 swipeable tabs:
 *
 *   Today    — what to do now: best window, what to avoid, one micro-practice
 *   Pattern  — who you are: life-path, sun-sign, current dasha chapter
 *   Practice — what to do this week: mantra, breath, time, "Talk with Jyotisha"
 *
 * Respects the user opt-out flag at localStorage key `birth_insights_opt_out`.
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, MessageCircle, Sunrise, Clock, Sun, Compass,
  Wind, Flame, Mountain, Droplet, Star, MoonStar, AlertTriangle,
  X,
} from "lucide-react";
import { Dialog, DialogContent } from "@/design-system";
import { useBirthInsights } from "@/hooks/useBirthInsights";
import {
  profileHeadline, vedicLine,
  lifePathDescription, personalDayPrompt, sunSignEssence,
  RASHI_LABEL, NAKSHATRA_LABEL, DASHA_LABEL, dashaTheme,
  type PersonalProfile,
} from "@/lib/personalization";

export const BIRTH_INSIGHTS_OPT_OUT_KEY = "birth_insights_opt_out";

interface Props {
  userId?: string;
  name?: string;
  className?: string;
}

/* ──────────────────────────────────────────────────────────────
   Actionable guidance helpers — derived from personalDay + dasha
   ────────────────────────────────────────────────────────────── */

function todayActions(p: PersonalProfile) {
  const map: Record<number, { do: string; avoid: string; micro: string }> = {
    1: { do: "Start the one thing you've been postponing — even for 5 minutes.", avoid: "Waiting for the perfect moment.", micro: "Stand, take 3 deep breaths, write down the first step." },
    2: { do: "Reach out to one person who matters. Listen more than you speak.", avoid: "Forcing decisions or confrontation.", micro: "Send one honest message you've been delaying." },
    3: { do: "Create or express — voice note, sketch, journal, a photo.", avoid: "Doom-scrolling other people's expression.", micro: "1 minute: speak today's truth aloud, alone." },
    4: { do: "Tend one foundation — finance, schedule, or your space.", avoid: "Skipping basics for excitement.", micro: "Clear one surface in your room, fully." },
    5: { do: "Take one unfamiliar route — physically or mentally.", avoid: "Over-committing to new things at once.", micro: "Walk 5 minutes in a direction you don't usually take." },
    6: { do: "Care for someone — including yourself — with full presence.", avoid: "People-pleasing at your own expense.", micro: "Cook or prepare one thing slowly, with attention." },
    7: { do: "Withdraw briefly. Sit with the question, not the answer.", avoid: "Crowds, debate, noisy input.", micro: "10 min silence, eyes closed, no phone." },
    8: { do: "Move a real-world piece — money, body, work, status.", avoid: "Avoiding the email or call you fear.", micro: "Do the hardest 5-minute task on your list, first." },
    9: { do: "Release something — a habit, a tab, an old story.", avoid: "Starting new commitments today.", micro: "Delete 10 things from your phone or inbox." },
  };
  return map[p.numerology.personalDay] ?? map[1];
}

function dashaPractice(lord?: string): { mantra: string; why: string } {
  const map: Record<string, { mantra: string; why: string }> = {
    sun:     { mantra: "Om Suryaya Namah · 11x at sunrise",       why: "Sun dasha — restore authority, clarity, and visibility." },
    moon:    { mantra: "Om Chandraya Namah · 11x before sleep",   why: "Moon dasha — soothe the mind, restore feeling." },
    mars:    { mantra: "Om Angarakaya Namah · 11x in the morning",why: "Mars dasha — channel heat into one disciplined action." },
    mercury: { mantra: "Om Budhaya Namah · 11x mid-morning",      why: "Mercury dasha — sharpen speech, learning, exchange." },
    jupiter: { mantra: "Om Gurave Namah · 11x at dawn",           why: "Jupiter dasha — wisdom expanding. Teach or learn." },
    venus:   { mantra: "Om Shukraya Namah · 11x evening",         why: "Venus dasha — beauty, art, relationships call you." },
    saturn:  { mantra: "Om Shanaye Namah · 11x at dusk",          why: "Saturn dasha — slow, steady. Karma being settled." },
    rahu:    { mantra: "Om Rahave Namah · 11x at night",          why: "Rahu dasha — unusual paths open. Stay grounded." },
    ketu:    { mantra: "Om Ketave Namah · 11x in silence",        why: "Ketu dasha — let go. Spiritual depth available." },
  };
  return map[lord ?? ""] ?? { mantra: "Om · 11 slow breaths", why: "Return to the simplest practice today." };
}

function luckyColorFor(lp: number): string {
  const m: Record<number, string> = {
    1: "Gold / Amber",   2: "White / Silver",  3: "Yellow",
    4: "Earth / Olive",  5: "Sky Blue",        6: "Rose / Indigo",
    7: "Deep Violet",    8: "Dark Blue / Black",9: "Crimson",
    11: "Pearl White",   22: "Coral",          33: "Soft Gold",
  };
  return m[lp] ?? "Indigo";
}

/* ──────────────────────────────────────────────────────────────
   Component
   ────────────────────────────────────────────────────────────── */

const TABS = ["today", "pattern", "practice"] as const;
type Tab = typeof TABS[number];

export default function BirthInsightsChip({ userId, name, className = "" }: Props) {
  const { profile, hasChart } = useBirthInsights(userId, { name });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("today");
  const [optedOut, setOptedOut] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(BIRTH_INSIGHTS_OPT_OUT_KEY) === "1";
  });

  useEffect(() => {
    const onStorage = () =>
      setOptedOut(localStorage.getItem(BIRTH_INSIGHTS_OPT_OUT_KEY) === "1");
    window.addEventListener("storage", onStorage);
    window.addEventListener("birth-insights-opt-out-changed", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("birth-insights-opt-out-changed", onStorage);
    };
  }, []);

  const v = profile ? vedicLine(profile) : null;
  const r = profile?.rhythm;
  const actions = useMemo(() => (profile ? todayActions(profile) : null), [profile]);
  const practice = useMemo(
    () => dashaPractice(profile?.vedic?.currentDashaLord),
    [profile?.vedic?.currentDashaLord],
  );

  if (!hasChart || !profile || optedOut) return null;

  const talkToGuide = () => {
    setOpen(false);
    const seed = `Today's astro reading: ${profile.todayInsight}. ${profileHeadline(profile)}${v ? ` · ${v}` : ""}.`;
    const params = new URLSearchParams({
      guruId: "jyotisha",
      mode: "astrology",
      source: "birth_insights",
      seed,
    });
    navigate(`/app/guide?${params.toString()}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => { setTab("today"); setOpen(true); }}
        className={`group w-full max-w-md flex items-center gap-2 px-3.5 py-2 rounded-full border border-border/40 bg-card/40 backdrop-blur-md text-left hover:border-primary/40 transition ${className}`}
        aria-label="Open today's astrological insight"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary/80 shrink-0" />
        <span className="text-[10px] font-display tracking-[0.25em] uppercase text-primary/80 shrink-0">
          Today
        </span>
        <span className="text-xs text-foreground/85 truncate flex-1">
          {profile.todayInsight}
        </span>
        <span className="text-[10px] text-muted-foreground/60 shrink-0 group-hover:text-foreground/70">
          tap
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 gap-0 bg-background/95 backdrop-blur-xl border-primary/20 overflow-hidden [&>button]:hidden">
          <div className="relative flex flex-col max-h-[88vh]">
            {/* Header with close */}
            <div className="px-5 pt-5 pb-3 border-b border-border/20 shrink-0 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-display tracking-[0.3em] text-primary/80 uppercase">
                  <Sparkles className="h-3 w-3" /> For you, today
                </div>
                <p className="mt-2 text-sm text-foreground/90 leading-snug pr-4">
                  {profile.todayInsight}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-0.5 h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-3 pt-3 shrink-0">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`flex-1 text-[10px] font-display tracking-[0.25em] uppercase py-2 rounded-full transition ${
                    tab === t
                      ? "bg-primary/25 text-foreground border border-primary/40"
                      : "text-muted-foreground/70 hover:text-foreground/80 border border-transparent"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
              {/* ─── TODAY — actionable ─── */}
              {tab === "today" && actions && (
                <>
                  <ActionCard
                    icon={<Star className="h-3.5 w-3.5" />}
                    label="Do this"
                    text={actions.do}
                    tone="primary"
                  />
                  <ActionCard
                    icon={<AlertTriangle className="h-3.5 w-3.5" />}
                    label="Avoid"
                    text={actions.avoid}
                    tone="warn"
                  />
                  <ActionCard
                    icon={<Wind className="h-3.5 w-3.5" />}
                    label="2-minute micro-practice"
                    text={actions.micro}
                    tone="muted"
                  />

                  {r && (
                    <div className="rounded-xl border border-border/30 bg-card/30 p-3 space-y-2.5">
                      <div className="text-[10px] font-display tracking-[0.25em] uppercase text-muted-foreground/80">
                        Best windows today
                      </div>
                      <Row
                        icon={<Sunrise className="h-3.5 w-3.5 text-amber-300/80" />}
                        title="Brahma muhurta"
                        sub="Best for practice, journaling, decisions"
                        value={`${r.brahmaMuhurta.start}–${r.brahmaMuhurta.end}`}
                      />
                      <Row
                        icon={<Sun className="h-3.5 w-3.5 text-yellow-300/80" />}
                        title="Abhijit muhurta"
                        sub="Auspicious midday window for anything important"
                        value={`${r.abhijitMuhurta.start}–${r.abhijitMuhurta.end}`}
                      />
                      <Row
                        icon={<AlertTriangle className="h-3.5 w-3.5 text-rose-300/80" />}
                        title="Rahu kalam"
                        sub="Avoid starting new things, signing, launching"
                        value={`${r.rahuKalam.start}–${r.rahuKalam.end}`}
                      />
                    </div>
                  )}

                  <p className="text-[10px] text-muted-foreground/60 italic text-center pt-1">
                    Personal Day {profile.numerology.personalDay} · {personalDayPrompt(profile.numerology.personalDay)}
                  </p>
                </>
              )}

              {/* ─── PATTERN — who you are ─── */}
              {tab === "pattern" && (
                <>
                  <div className="rounded-xl border border-border/30 bg-card/30 p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-display tracking-[0.25em] uppercase text-muted-foreground/80">
                      <Compass className="h-3 w-3" /> Life Path {profile.numerology.lifePath}
                    </div>
                    <p className="text-sm text-foreground/90 leading-snug">
                      {lifePathDescription(profile.numerology.lifePath)}
                    </p>
                  </div>

                  {profile.astrology?.sunSign && (
                    <div className="rounded-xl border border-border/30 bg-card/30 p-3 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-display tracking-[0.25em] uppercase text-muted-foreground/80">
                        {elementIcon(profile.astrology.element)} Sun in {profile.astrology.sunSign}
                      </div>
                      <p className="text-sm text-foreground/90 leading-snug">
                        {sunSignEssence(profile.astrology.sunSign)}
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 capitalize">
                        {profile.astrology.element} · {profile.astrology.modality} · ruled by {profile.astrology.rulingPlanet}
                      </p>
                    </div>
                  )}

                  {profile.vedic && profile.confidence.vedic !== "none" && (
                    <div className="rounded-xl border border-border/30 bg-card/30 p-3 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-display tracking-[0.25em] uppercase text-muted-foreground/80">
                        <MoonStar className="h-3 w-3" /> Vedic chart
                      </div>
                      <p className="text-sm text-foreground/90">
                        {RASHI_LABEL[profile.vedic.rashi]} · {NAKSHATRA_LABEL[profile.vedic.nakshatra]} (pada {profile.vedic.pada})
                      </p>
                      <p className="text-[11px] text-muted-foreground/70">
                        {profile.vedic.paksha === "shukla" ? "Shukla" : "Krishna"} paksha · tithi {profile.vedic.tithi}
                        {profile.confidence.vedic === "low" && " · approximate"}
                      </p>
                    </div>
                  )}

                  {profile.vedic && (
                    <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 space-y-1.5">
                      <div className="text-[10px] font-display tracking-[0.25em] uppercase text-primary/90">
                        Current chapter
                      </div>
                      <p className="text-sm text-foreground/95">
                        {DASHA_LABEL[profile.vedic.currentDashaLord]} mahadasha · {profile.vedic.dashaYearsRemaining} years remain
                      </p>
                      <p className="text-[12px] text-foreground/75 italic leading-snug">
                        {dashaTheme(profile.vedic.currentDashaLord)}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* ─── PRACTICE — what to do this week ─── */}
              {tab === "practice" && (
                <>
                  <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 space-y-1.5">
                    <div className="text-[10px] font-display tracking-[0.25em] uppercase text-primary/90">
                      Your mantra this week
                    </div>
                    <p className="text-base font-display text-foreground">{practice.mantra}</p>
                    <p className="text-[12px] text-muted-foreground/80 italic">{practice.why}</p>
                  </div>

                  {r && (
                    <div className="rounded-xl border border-border/30 bg-card/30 p-3 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-display tracking-[0.25em] uppercase text-muted-foreground/80">
                        <Clock className="h-3 w-3" /> Best time
                      </div>
                      <p className="text-sm text-foreground/90">
                        Sit at {r.brahmaMuhurta.start} for 11 breaths, then chant.
                      </p>
                      <p className="text-[11px] text-muted-foreground/70">
                        Sunrise {r.sunrise} · Sunset {r.sunset}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Tile label="Lucky color" value={luckyColorFor(profile.numerology.lifePath)} />
                    <Tile
                      label="Personal year"
                      value={profile.numerology.personalYear ? `${profile.numerology.personalYear}` : "—"}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={talkToGuide}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-primary/25 hover:bg-primary/35 border border-primary/40 text-xs font-display tracking-wider uppercase text-foreground font-semibold transition active:scale-[0.98]"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Talk with Jyotisha
                  </button>

                  <p className="text-[10px] text-muted-foreground/60 italic text-center">
                    Jyotisha · Vedic Astrology, Numerology & Tarot. The chart inclines, you decide.
                  </p>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
   Small presentational helpers
   ────────────────────────────────────────────────────────────── */

function ActionCard({
  icon, label, text, tone,
}: { icon: React.ReactNode; label: string; text: string; tone: "primary" | "warn" | "muted" }) {
  const styles = {
    primary: "border-primary/30 bg-primary/10",
    warn: "border-rose-400/25 bg-rose-400/5",
    muted: "border-border/30 bg-card/30",
  }[tone];
  const labelColor = {
    primary: "text-primary/90",
    warn: "text-rose-300/90",
    muted: "text-muted-foreground/80",
  }[tone];
  return (
    <div className={`rounded-xl border p-3 space-y-1.5 ${styles}`}>
      <div className={`flex items-center gap-1.5 text-[10px] font-display tracking-[0.25em] uppercase ${labelColor}`}>
        {icon} {label}
      </div>
      <p className="text-sm text-foreground/95 leading-snug">{text}</p>
    </div>
  );
}

function Row({
  icon, title, sub, value,
}: { icon: React.ReactNode; title: string; sub: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-foreground/90">{title}</p>
        <p className="text-[10px] text-muted-foreground/70 leading-snug">{sub}</p>
      </div>
      <p className="text-[11px] font-mono text-foreground/85 tabular-nums shrink-0 pt-0.5">{value}</p>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/30 bg-card/30 p-3">
      <p className="text-[10px] font-display tracking-[0.25em] uppercase text-muted-foreground/70">{label}</p>
      <p className="text-sm text-foreground/90 mt-1">{value}</p>
    </div>
  );
}

function elementIcon(el?: string) {
  switch (el) {
    case "fire":  return <Flame className="h-3 w-3 text-orange-300/90" />;
    case "earth": return <Mountain className="h-3 w-3 text-emerald-300/80" />;
    case "air":   return <Wind className="h-3 w-3 text-sky-300/80" />;
    case "water": return <Droplet className="h-3 w-3 text-blue-300/80" />;
    default:      return <Sparkles className="h-3 w-3" />;
  }
}
