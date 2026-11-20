/**
 * Practice Script Builder
 * ───────────────────────
 * Turns a practice item + theme into a time-anchored sequence of "beats" —
 * the script that unfolds during a guided practice. Each practice family
 * (observation, witness, bhakti, kriya, breath, etc.) gets its own scaffold
 * so the experience feels designed, not generic.
 *
 * Beats are spaced across the full duration so the user always feels
 * something is happening.
 */
import type { TodayPracticeItem } from "@/hooks/useTodayPractice";
import { resolveObservationSeed } from "@/lib/practice/observationPicker";
import {
  currentObservationSessionNumber,
  getObserveLevel,
  recentObservationSeedIds,
} from "@/lib/practice/observationProgress";
import { buildObservationFlow } from "@/lib/practice/observationFlow";

export type PracticeBeat = {
  atSec: number;
  title?: string;
  body: string;
  tone: "anchor" | "instruction" | "reflection";
};

interface BuildContext {
  themeTitle: string;
  themeOpener?: string;
  totalSec: number;
  /** Optional arrival state (scattered | tired | tense | okay | open) — lets scripts soften their first beats. */
  arrivalState?: string | null;
  /** Pin a specific observation seed (obs-l3-07). */
  seedId?: string | null;
  /** Stable session number for deterministic seed selection. */
  sessionNumber?: number;
  /** Observation level (0–7); seeds up to level + 1 stay open. */
  userLevel?: number;
  recentSeedIds?: string[];
}

// Distribute n beats across [startPct, endPct] of totalSec.
function distribute(totalSec: number, count: number, startPct = 0.05, endPct = 0.9): number[] {
  if (count <= 1) return [Math.round(totalSec * startPct)];
  const start = totalSec * startPct;
  const end = totalSec * endPct;
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, i) => Math.round(start + i * step));
}

function getFamily(p: TodayPracticeItem): string {
  const k = (p.practice || p.title || "").toLowerCase();
  if (/observ/.test(k)) return "observation";
  if (/witness|sakshi/.test(k)) return "witness";
  if (/bhakti|gratitude|heart|devotion/.test(k)) return "bhakti";
  if (/breath|pranayama|kriya/.test(k)) return "breath";
  if (/inquiry|self.?inquiry|atma/.test(k)) return "inquiry";
  if (/japa|mantra|chant/.test(k)) return "japa";
  if (/karma|action|service/.test(k)) return "karma";
  return "default";
}

/**
 * Observation is content-seeded, not templated: the shape comes from the
 * seed's form (sweep / ladder / spiral / threshold / vigil / inquiry / gaze /
 * return), and the inside comes from one of the 100 authored sessions.
 * Other practice families keep their own native scripts below.
 */
function buildObservationBeats(
  ctx: BuildContext,
  p: TodayPracticeItem,
): Omit<PracticeBeat, "atSec">[] {
  const seed = resolveObservationSeed({
    seedId: ctx.seedId,
    text: `${p.title ?? ""} ${p.instruction ?? ""}`,
    sessionNumber: ctx.sessionNumber ?? currentObservationSessionNumber(),
    level: ctx.userLevel ?? getObserveLevel(),
    minutes: Math.round(ctx.totalSec / 60),
    arrivalState: ctx.arrivalState,
    recentSeedIds: ctx.recentSeedIds ?? recentObservationSeedIds(),
  });

  return buildObservationFlow(seed, { arrivalState: ctx.arrivalState }).map(
    ({ title, body, tone }) => ({ title, body, tone }),
  );
}

const SCRIPTS: Record<string, (ctx: BuildContext, p: TodayPracticeItem) => Omit<PracticeBeat, "atSec">[]> = {
  observation: (ctx, p) => buildObservationBeats(ctx, p),
  witness: () => [
    { title: "Posture", body: "Sit upright. Hands resting. Eyes soft or closed.", tone: "instruction" },
    { title: "Anchor", body: "One slow breath. Notice the body sitting.", tone: "anchor" },
    { title: "Notice", body: "Whatever thought arises — silently note it. 'Thinking.' Then return.", tone: "instruction" },
    { title: "The One Who Watches", body: "Ask: who is noticing this thought? Don't answer. Just feel the question.", tone: "reflection" },
    { title: "Continue", body: "Each thought, gently labeled. Each return, soft.", tone: "instruction" },
    { title: "Stillness", body: "Between two thoughts — that gap. Rest there as long as it stays.", tone: "anchor" },
    { title: "Closing", body: "You are not the thoughts. You are the space they appear in.", tone: "reflection" },
  ],
  bhakti: () => [
    { title: "Heart Center", body: "Place a hand on the chest. Feel the warmth of your own touch.", tone: "instruction" },
    { title: "First Gratitude", body: "Bring to mind one person you are grateful for. See their face. Feel it in the chest.", tone: "instruction" },
    { title: "Hold It", body: "Let the warmth spread. Don't analyze — just feel.", tone: "anchor" },
    { title: "Second Gratitude", body: "Now one thing about your body you are grateful for — even something small.", tone: "instruction" },
    { title: "Third Gratitude", body: "One moment from today, however ordinary, that you are glad happened.", tone: "instruction" },
    { title: "Offering", body: "Silently offer this warmth — to anyone, anywhere.", tone: "reflection" },
    { title: "Rest", body: "Hand still on the chest. Let the heart soften completely.", tone: "anchor" },
  ],
  breath: () => [
    { title: "Position", body: "Sit tall. One hand on the belly, one on the chest.", tone: "instruction" },
    { title: "Inhale 4", body: "Breathe in slowly through the nose for 4 counts. The belly rises first.", tone: "anchor" },
    { title: "Exhale 6", body: "Out through the nose for 6 counts. Longer than the in-breath.", tone: "anchor" },
    { title: "Continue", body: "Keep this rhythm. 4 in, 6 out. The pacer dot will hold you.", tone: "instruction" },
    { title: "Soften", body: "If the count slips, no problem. Just return to the breath.", tone: "reflection" },
    { title: "Deepen", body: "The body knows this rhythm. Trust it.", tone: "anchor" },
    { title: "Closing", body: "Let the breath return to natural. Notice the calm that's already here.", tone: "reflection" },
  ],
  inquiry: () => [
    { title: "Settle", body: "Quiet posture. Two slow breaths.", tone: "instruction" },
    { title: "The Question", body: "Ask, silently: 'Who am I?' Don't search for an answer.", tone: "anchor" },
    { title: "Watch", body: "When a thought rises ('I am _____'), ask: 'To whom does this thought come?'", tone: "instruction" },
    { title: "Trace Back", body: "Every answer points back to the I-thought itself. Trace it to its source.", tone: "instruction" },
    { title: "Rest", body: "Stay in the silent feeling of 'I am' — before any word.", tone: "anchor" },
    { title: "Return", body: "When the mind wanders, gently ask again: 'Who am I?'", tone: "instruction" },
    { title: "Closing", body: "The questioner and the questioned — one and the same.", tone: "reflection" },
  ],
  japa: () => [
    { title: "Choose", body: "Pick a single word or short mantra. 'Om', 'So Hum', or any name that means peace.", tone: "instruction" },
    { title: "Begin", body: "Repeat it silently with each out-breath.", tone: "anchor" },
    { title: "Continue", body: "Don't force speed. Let the mantra settle into the breath itself.", tone: "instruction" },
    { title: "When Mind Wanders", body: "Notice. Return to the mantra. No judgment.", tone: "instruction" },
    { title: "Deepen", body: "The mantra and the breath become one rhythm.", tone: "anchor" },
    { title: "Listen", body: "Now stop saying it. Listen for it. It may continue on its own.", tone: "reflection" },
    { title: "Rest", body: "Sit in the silence the mantra leaves behind.", tone: "anchor" },
  ],
  karma: () => [
    { title: "Set Intention", body: "Bring to mind one small action you'll take today — a message, a chore, a gesture.", tone: "instruction" },
    { title: "Strip the Reward", body: "Imagine doing it without anyone knowing. Without thanks. Without result.", tone: "instruction" },
    { title: "Feel the Shift", body: "Notice what changes in the body when reward is removed.", tone: "anchor" },
    { title: "Offer", body: "Silently dedicate this action — to whatever is greater than you.", tone: "reflection" },
    { title: "Commit", body: "Promise yourself: I will do this today, fully, without claiming it.", tone: "instruction" },
    { title: "Rest", body: "Let the intention settle. Let it become quiet certainty.", tone: "anchor" },
  ],
  default: (ctx, p) => [
    { title: "Begin", body: ctx.themeOpener || `Settle into ${p.title}. Let the body be still.`, tone: "instruction" },
    { title: "Anchor", body: "One slow breath. Notice you are here.", tone: "anchor" },
    { title: "Practice", body: p.why || "Stay with this. Nothing to fix, nothing to chase.", tone: "instruction" },
    { title: "Continue", body: "If the mind drifts, gently return.", tone: "instruction" },
    { title: "Deepen", body: "The practice is doing you now.", tone: "reflection" },
    { title: "Rest", body: "A few breaths. Just be.", tone: "anchor" },
    { title: "Closing", body: "Notice what's different from when you began.", tone: "reflection" },
  ],
};

export function buildPracticeScript(
  practice: TodayPracticeItem,
  ctx: BuildContext,
): PracticeBeat[] {
  const family = getFamily(practice);
  const template = (SCRIPTS[family] || SCRIPTS.default)(ctx, practice);
  const times = distribute(ctx.totalSec, template.length);
  return template.map((t, i) => ({ ...t, atSec: times[i] }));
}
