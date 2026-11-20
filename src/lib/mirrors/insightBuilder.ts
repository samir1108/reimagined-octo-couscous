/**
 * MIRROR INSIGHT BUILDER
 *
 * Runs the moment a mirror is completed. Produces the reading the user sees
 * and — just as importantly — the calibration the engine consumes.
 *
 * Fully deterministic. No LLM, no network. A reading must be available the
 * instant the answers are saved, and it must be identical for the same
 * answers, or the engine cannot trust it as a signal.
 *
 * ── Voice ───────────────────────────────────────────────────────────────
 * These lines follow the same rules as `consciousness/agents/insightLayer.ts`:
 * describe the reading, never label the person. "The wave and the stone" —
 * not "you are an anxious person". No promises. No diagnosis. The user is
 * never told who they are; they are shown what the answers actually said, and
 * how much weight that deserves.
 *
 * ── The tension ─────────────────────────────────────────────────────────
 * The most useful part of any profile is where two signals disagree — the
 * top sub-score pulling against the second, or a result whose own shadow
 * contradicts its strength. That is the thing a static question set cannot
 * show you, and it is what this builder looks for first.
 */

import type { MirrorCheckpoint } from '@/data/pre-journey/mirrors';
import type { MirrorBank, MirrorResultType, MirrorTier } from '@/data/mirrors/types';
import type { PracticeId } from '@/types/practices';
import type {
  AdaptivePlan,
  AdaptiveScore,
  MirrorBand,
  MirrorHistoryEntry,
} from './adaptiveEngine';

// ─── Shapes ───

export interface MirrorInsightCard {
  title: string;
  body: string;
  type: 'strength' | 'shadow' | 'edge';
}

export interface MirrorInsight {
  mirrorNumber: number;
  slug: string;
  module: string;
  headline: string;
  reading: string;
  cards: MirrorInsightCard[];
  /** The internal disagreement in the scores, or null if there isn't one. */
  tension: string | null;
  nextAction: string;
  practiceAffinity: PracticeId[];
  tags: string[];
  /** Which depth tier this attempt was asked at. */
  tier: MirrorTier;
  confidence: number;
  band: MirrorBand;
  /** Honest statement of how much this reading deserves. */
  confidenceNote: string;
  /** How many questions were skipped as already-covered. */
  skippedForCoverage: number;
}

// ─── Entry point ───

export function buildMirrorInsight(input: {
  checkpoint: MirrorCheckpoint;
  bank: MirrorBank;
  plan: AdaptivePlan;
  score: AdaptiveScore;
  history: MirrorHistoryEntry[];
}): MirrorInsight {
  const { checkpoint, bank, plan, score, history } = input;

  const primary = bank.resultTypes.find((r) => r.id === score.primaryId);
  const secondary = bank.resultTypes.find((r) => r.id === score.secondaryId);
  const fallback = bank.resultTypes[0];

  const reading = primary ?? fallback;
  const tension = findTension(bank, score, primary, secondary);

  return {
    mirrorNumber: checkpoint.number,
    slug: bank.slug,
    module: bank.module,
    headline: buildHeadline(checkpoint, reading, score),
    reading: buildReading(bank, reading, score, plan.tier, history.length),
    cards: buildCards(bank, score, reading, secondary, plan),
    tension,
    nextAction: buildNextAction(reading, tension, bank),
    practiceAffinity: affinityFor(bank, reading, plan),
    tags: reading?.calibration?.tags ?? [],
    tier: plan.tier,
    confidence: plan.confidence,
    band: plan.band,
    confidenceNote: confidenceNote(plan, history.length, score.completion),
    skippedForCoverage: plan.pruned.length,
  };
}

// ─── Headline ───
// A name for the reading, not a name for the person.

function buildHeadline(
  checkpoint: MirrorCheckpoint,
  reading: MirrorResultType | undefined,
  score: AdaptiveScore,
): string {
  const lead = reading?.short ?? checkpoint.title;
  if (score.silentDimensions.length > 0) {
    return `${lead} — and something unsaid`;
  }
  return lead;
}

// ─── Reading ───

function buildReading(
  bank: MirrorBank,
  reading: MirrorResultType | undefined,
  score: AdaptiveScore,
  tier: MirrorTier,
  historyLength: number,
): string {
  const parts: string[] = [];

  if (reading) {
    parts.push(reading.description);
  }

  const lead = score.percentages[score.primaryId] ?? 0;
  const trail = score.percentages[score.secondaryId] ?? 0;

  if (historyLength === 0) {
    parts.push(
      'This is the first reading, so it is a first reading. Sit with it and see whether it holds up on a normal week.',
    );
  } else if (tier === 'core' && lead - trail >= 18) {
    parts.push(
      'The margin between this and the runner-up is wide, which usually means something here has been lived rather than inherited.',
    );
  } else if (lead - trail < 8) {
    parts.push(
      'The top two sit close together, which tends to mean the situation is genuinely mixed rather than that the answer is unclear.',
    );
  }

  if (score.silentDimensions.length > 0) {
    parts.push(
      'Parts of the picture were left untouched in this one. They will come forward when they are ready to be answered.',
    );
  }

  if (tier === 'surface' && historyLength >= 4) {
    parts.push(
      'This was asked at the outer layer. When the next reading of it comes, it will ask for more.',
    );
  }

  void bank;
  return parts.join(' ');
}

// ─── Cards ───

function buildCards(
  bank: MirrorBank,
  score: AdaptiveScore,
  primary: MirrorResultType | undefined,
  secondary: MirrorResultType | undefined,
  plan: AdaptivePlan,
): MirrorInsightCard[] {
  const cards: MirrorInsightCard[] = [];

  if (primary) {
    cards.push({
      title: 'What is working',
      body: strongestEvidence(bank, score, primary.id),
      type: 'strength',
    });
  }

  if (primary?.shadow) {
    cards.push({ title: 'The other side of it', body: primary.shadow, type: 'shadow' });
  }

  if (secondary && secondary.id !== primary?.id) {
    const pct = score.percentages[secondary.id] ?? 0;
    if (pct >= 20) {
      cards.push({
        title: `Running alongside — ${secondary.label}`,
        body: `${secondary.short}. It is close enough behind to be shaping the result rather than sitting in the background.`,
        type: 'edge',
      });
    }
  }

  if (score.silentDimensions.length > 0) {
    cards.push({
      title: 'Left unanswered',
      body: 'Some parts of this mirror got no signal at all. They are not scored as zero — they are simply not known yet.',
      type: 'edge',
    });
  }

  if (plan.pruned.length > 0) {
    cards.push({
      title: 'Asked less of you this time',
      body: `${plan.pruned.length} question${plan.pruned.length === 1 ? ' was' : 's were'} left out because the answers were already consistent across previous mirrors. That space went to the parts of this mirror you have covered least.`,
      type: 'edge',
    });
  }

  return cards.slice(0, 4);
}

/** Name the question that contributed most to the winning sub-score. */
function strongestEvidence(
  bank: MirrorBank,
  score: AdaptiveScore,
  primaryId: string,
): string {
  const lead = score.percentages[primaryId] ?? 0;
  const secondary = score.secondaryId;
  const trail = score.percentages[secondary] ?? 0;

  const related = bank.resultTypes.find((r) => r.id === primaryId);
  if (related && lead - trail >= 25) {
    return `${related.label} came in at ${lead}%, well clear of ${trail}%. The answers point the same way, not just in total but in where they were strongest.`;
  }
  return `${related?.label ?? primaryId} led at ${lead}%, with ${secondary} close behind at ${trail}%. Both are in the result.`;
}

// ─── Tension ───

function findTension(
  bank: MirrorBank,
  score: AdaptiveScore,
  primary: MirrorResultType | undefined,
  secondary: MirrorResultType | undefined,
): string | null {
  if (!primary || !secondary || primary.id === secondary.id) return null;

  const lead = score.percentages[primary.id] ?? 0;
  const trail = score.percentages[secondary.id] ?? 0;

  if (lead - trail < 8) {
    return `Both ${primary.label} and ${secondary.label} are live at the same time. The interesting question is not which one wins, but what happens in the spaces where they disagree.`;
  }

  if (primary.shadow) {
    return `The strength here has a cost attached to it. ${primary.label} is doing real work — and ${primary.shadow.replace(/^./, (c) => c.toLowerCase())}`;
  }

  if (score.silentDimensions.length > 0) {
    const silent = score.silentDimensions
      .map((d) => bank.resultTypes.find((r) => r.id === d)?.label ?? d)
      .slice(0, 2)
      .join(' and ');
    return `What showed up strongly is ${primary.label}, but ${silent} never registered. That gap is worth more attention than either answer on its own.`;
  }

  return null;
}

// ─── Next action ───

function buildNextAction(
  reading: MirrorResultType | undefined,
  tension: string | null,
  bank: MirrorBank,
): string {
  if (tension && reading?.masters?.length) {
    return `Take one practice from this reading into the next few days and watch what happens to the disagreement. ${capitalise(reading.masters[0])} is the obvious one to start with.`;
  }
  if (reading?.masters?.length) {
    return `Bring ${capitalise(reading.masters[0])} into the next few sessions. The engine has already shifted the balance toward it based on this reading.`;
  }
  const affinity = bank.engineHooks?.practiceAffinity?.[0];
  if (affinity) {
    return `Keep ${affinity} in the rotation for now. Nothing needs to change yet — just let this reading sit for a while before answering it again.`;
  }
  return 'Nothing needs to change yet. Let this reading sit for a couple of weeks before coming back to it.';
}

// ─── Affinity ───

function affinityFor(
  bank: MirrorBank,
  reading: MirrorResultType | undefined,
  plan: AdaptivePlan,
): PracticeId[] {
  const ids = new Set<PracticeId>();
  for (const m of reading?.masters ?? []) ids.add(m);
  for (const p of bank.engineHooks?.practiceAffinity ?? []) ids.add(p as PracticeId);
  void plan;
  return [...ids].slice(0, 4);
}

// ─── Confidence honesty ───

function confidenceNote(plan: AdaptivePlan, historyLength: number, completion: number): string {
  if (completion < 0.85) {
    return 'Some questions were skipped, so this is a partial reading. It will firm up next time.';
  }
  switch (plan.band) {
    case 'read':
      return `Read directly from your answers, asked at ${plan.tier} depth. This one carries real weight.`;
    case 'inferred':
      return historyLength >= 6
        ? 'Drawn mostly from the mirrors before this one rather than from this one alone.'
        : 'Partly read from your answers, partly carried by the mirrors before it.';
    case 'preliminary':
      return historyLength === 0
        ? 'A first reading. Treat it as a starting point, not a verdict.'
        : 'An early reading. It will change as there is more behind it.';
    default:
      return '';
  }
}

// ─── Helpers ───

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
