/**
 * banker.ts — client-side "never ship a broken sitting" fallback.
 *
 * Instead of the old hardcoded four generic steps, this builds a real sitting
 * from the authored 100-session observation ladder: the seed decides content,
 * the form decides shape, and the contract decides whether it is shippable.
 */
import type { SessionPlan, SessionStep } from "@/lib/session-shell/types";
import { OBS_SEEDS, type ObsSeed } from "@/data/observationSessions";
import { buildObservationFlow } from "@/lib/practice/observationFlow";
import { pickObservationSession } from "@/lib/practice/observationPicker";

interface BankerArgs {
  budgetMin?: number;
  gate?: "morning" | "midday" | "evening" | "night";
  level?: number;
  recentSeedIds?: string[];
  sessionNumber?: number;
  userId?: string | null;
  reason?: string;
}

/**
 * Every banker script is a behavioural contract: setup → concrete action →
 * what not to do → stop condition → what counts as the rep.
 */
function beatScript(intro: string, core: string[], minutes: number): string[] {
  const cleaned = core.map((line) => line.trim()).filter(Boolean);
  const first = cleaned[0] || "Stay with what is actually here.";
  const middle = cleaned.slice(1, 3).join(" ") || "Nothing else needs to happen for this to count.";
  return [
    `Sit or lie down and let the body take its full weight. ${intro}`,
    first,
    middle,
    "Do not improve it, do not evaluate it, and do not narrate what happens.",
    `Stay for about ${minutes} minute${minutes > 1 ? "s" : ""}, then stop on your own signal rather than at a bell. If attention leaves, returning to it is the rep.`,
  ];
}

function seedToPlan(seed: ObsSeed, budgetMin: number): SessionPlan {
  const beats = buildObservationFlow(seed);
  const arrival = beats.filter((b) => /arrive|land|anchor/i.test(b.title));
  const exploration = beats.filter((b) => /explore|gaze|question|return/i.test(b.title));
  const closing = beats.filter((b) => /silence|rest|integrate|journal/i.test(b.title));
  const carry = beats.find((b) => /carry/i.test(b.title));

  const practiceMinutes = Math.max(3, budgetMin - 5);
  const steps: SessionStep[] = [];

  steps.push({
    kind: "breathwork",
    title: "Arrive in the body before anything else is asked.",
    script: beatScript(
      `This is the ${seed.slot} gate for ${seed.lens} observation.`,
      arrival.map((b) => b.body),
      2,
    ),
    est_minutes: 2,
    durationSeconds: 120,
    params: { pattern: seed.slot === "night" ? "4-7-8" : "4-4-6", durationSeconds: 120 },
    whyForYou: `The ${seed.slot} gate opens with the body, not with effort.`,
    signalRef: `gate:${seed.slot}`,
  });

  if (budgetMin >= 5) {
    steps.push({
      kind: "practice",
      title: `Observe: ${seed.exploration[0]?.title ?? "what is here"}.`,
      script: beatScript(
        `This sitting is ${seed.method} on the ${seed.lens} at level ${seed.level}.`,
        exploration.map((b) => b.body),
        practiceMinutes,
      ),
      est_minutes: practiceMinutes,
      durationSeconds: practiceMinutes * 60,
      params: {
        family: "observation",
        level: seed.level,
        exercise: seed.exploration[0]?.body ?? seed.method,
        object: seed.lens,
        durationSeconds: practiceMinutes * 60,
      },
      whyForYou: `${seed.lens} observation is your open level — this seed sits at L${seed.level}.`,
      signalRef: `practice:observation:L${seed.level}`,
    });
  }

  steps.push({
    kind: "reflection",
    title: "Write one line that is still true.",
    script: beatScript(
      `This seed closes with: ${seed.integration}`,
      [seed.journalPrompt, ...closing.map((b) => b.body)],
      2,
    ),
    est_minutes: 2,
    durationSeconds: 120,
    params: { maxChars: 280, summary: seed.integration },
    whyForYou: `The seed's own closure is "${seed.integration}".`,
    signalRef: "closure",
  });

  if (carry && budgetMin >= 7) {
    steps.push({
      kind: "micro-act",
      title: "Carry one act out of this sitting.",
      script: beatScript(
        "Insight that stays on the cushion becomes another memory.",
        [carry.body, "Do it before the next screen, and do not announce it."],
        1,
      ),
      est_minutes: 1,
      durationSeconds: 60,
      params: { act: seed.carryTask, window: "today" },
      whyForYou: "Insight without one act loops; the carry task breaks it.",
      signalRef: "practice:observation:carry",
    });
  }

  return {
    id: `banker-${seed.id}`,
    intent: `${seed.lens} observation · L${seed.level}`,
    intro: `An authored sitting from the observation ladder — ${seed.exploration[0]?.title ?? "one object"}.`,
    steps,
    _meta: {
      composedBy: "observation-banker",
      banker: true,
      archetype: "Observation",
      whyThisSession: `Observation L${seed.level} · ${seed.method} · ${seed.lens}`,
      languageRefinedBy: "none",
    } as SessionPlan["_meta"],
  };
}

export function buildObservationBankerPlan(args: BankerArgs = {}): SessionPlan {
  const budgetMin = Math.max(3, Math.min(30, Number(args.budgetMin) || 8));
  const level = Math.max(1, Math.min(7, Math.round(Number(args.level) || 1)));
  const seed = pickObservationSession({
    userId: args.userId ?? null,
    sessionNumber: args.sessionNumber ?? Math.floor(Date.now() / 86_400_000),
    level,
    slot: args.gate ?? undefined,
    minutes: budgetMin,
    recentSeedIds: args.recentSeedIds ?? [],
  });
  const plan = seedToPlan(seed ?? OBS_SEEDS[0], budgetMin);
  if (args.reason) {
    plan._meta = { ...(plan._meta || {}), fallbackReason: args.reason };
  }
  return plan;
}
