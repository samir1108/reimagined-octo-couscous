/**
 * InnerWeather — the state of the witness, spoken in one glance.
 *
 * Reads the consciousness engine's response (already fetched on Home):
 *   • chips   — current state · archetype · identity band · V-level
 *   • line 1  — the weakest dimension today (plan.focusDimension)
 *   • line 2  — one honest alert: bypassing risk, an acute loop, or the
 *               most stressed life domain (life_domain_scores)
 *   • footer  — what the last completed sitting left behind (sessions.summary)
 *
 * The card is a mirror, not a dashboard: at most two lines of meaning, then
 * the memory line. Nothing here gamifies or scores out loud.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { getLoopName } from "@/lib/onboarding/getLoopName";

const EASE = [0.16, 1, 0.3, 1] as const;

interface InnerWeatherProps {
  profile: {
    streak_current?: number | null;
    v_level_current?: number | null;
    active_loops?: string[] | null;
    loop_severity?: Record<string, string> | null;
  } | null;
  plan: {
    journeyDay?: number;
    state?: string;
    archetype?: string | null;
    bandName?: string;
    bandIcon?: string;
    focusDimension?: string;
    bypassingRisk?: number;
  } | null;
  /** Summary of the most recent completed session today (already cleaned). */
  lastSummary: string;
}

function titleCase(s: string): string {
  return String(s || "")
    .replace(/[-_]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function useStressedDomain() {
  return useQuery<string | null>({
    queryKey: ["home-stressed-domain"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("life_domain_scores")
        .select("domain, score")
        .eq("user_id", user.id);
      if (!data?.length) return null;
      const weakest = [...data]
        .filter((d) => typeof d.score === "number")
        .sort((a, b) => (a.score ?? 10) - (b.score ?? 10))[0];
      return weakest && (weakest.score ?? 10) < 5 ? String(weakest.domain) : null;
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}

export default function InnerWeather({ profile, plan, lastSummary }: InnerWeatherProps) {
  const { data: stressedDomain } = useStressedDomain();

  // ── Chips — state · archetype · band · V-level ─────────────────────────────
  const chips = [
    plan?.state ? titleCase(plan.state) : "",
    plan?.archetype ? titleCase(plan.archetype) : "",
    plan?.bandName ? `${plan.bandIcon ? `${plan.bandIcon} ` : ""}${plan.bandName}` : "",
    typeof profile?.v_level_current === "number"
      ? `V-Level ${profile.v_level_current.toFixed(1)}`
      : "",
  ].filter(Boolean);

  // ── Line 1 — the weakest dimension ─────────────────────────────────────────
  const focusDimension = plan?.focusDimension ? titleCase(plan.focusDimension) : "";
  const dimensionLine = focusDimension
    ? `The ${focusDimension} dimension needs you most today.`
    : "";

  // ── Line 2 — one honest alert, by priority ─────────────────────────────────
  let alertLine = "";
  if (typeof plan?.bypassingRisk === "number" && plan.bypassingRisk > 0.6) {
    alertLine = "Notice when practice becomes escape — feel first, transcend later.";
  } else {
    const acuteLoop = (profile?.active_loops || []).find(
      (l) => profile?.loop_severity?.[l] === "acute",
    );
    if (acuteLoop) {
      const name = getLoopName(acuteLoop);
      if (name) alertLine = `${name} is acute right now — today's theme is aimed at it.`;
    } else if (stressedDomain) {
      alertLine = `${titleCase(stressedDomain)} is asking for attention.`;
    }
  }

  const hasBody = chips.length > 0 || dimensionLine || alertLine || lastSummary;
  if (!hasBody) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.24 }}
      aria-label="Inner weather"
      className="w-full rounded-2xl border border-border/30 bg-card/40 px-5 py-4"
    >
      {/* Header — eyebrow + journey/streak */}
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[9px] font-display tracking-[0.28em] uppercase text-muted-foreground/55">
          Inner weather
        </p>
        <p className="text-[9px] font-display tracking-[0.16em] uppercase text-muted-foreground/45 tabular-nums">
          {plan?.journeyDay ? `Day ${plan.journeyDay}` : ""}
          {profile?.streak_current ? ` · Streak ${profile.streak_current}` : ""}
        </p>
      </div>

      {/* Chips */}
      {chips.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {chips.map((chip, i) => (
            <span
              key={i}
              className="rounded-full border border-border/30 bg-card/40 px-2.5 py-0.5 text-[9px] font-display tracking-[0.14em] uppercase text-muted-foreground/60"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {/* The two lines */}
      {(dimensionLine || alertLine) && (
        <div className="mt-3 space-y-1.5">
          {dimensionLine && (
            <p className="text-[11.5px] leading-[1.6] text-foreground/65">{dimensionLine}</p>
          )}
          {alertLine && (
            <p className="text-[11.5px] italic leading-[1.6] text-amber-200/55">{alertLine}</p>
          )}
        </div>
      )}

      {/* Memory — what the last sitting left behind */}
      {lastSummary && (
        <p className="mt-3 border-t border-border/30 pt-2.5 text-[10.5px] italic leading-[1.6] text-muted-foreground/50">
          <span className="not-italic text-muted-foreground/40">Last sitting — </span>
          {lastSummary}
        </p>
      )}
    </motion.section>
  );
}
