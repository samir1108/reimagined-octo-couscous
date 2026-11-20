/**
 * journeyDefinitions — the journeys offered after The First Eleven (Gate 6).
 * ─────────────────────────────────
 * Seven doors, each wired to a real program the app already ships (the v2
 * catalog), plus one Open Journey for people whose mapping resists a single
 * door. The picker ranks these by fit against the user's mapping.
 */
import type { FirstElevenMapping, SEDimension } from "./firstElevenTypes";

export interface JourneyDef {
  slug: string;
  /** Real program id from the v2 catalog, or null for the Open Journey. */
  programId: string | null;
  title: string;
  /** The one-line invitation. */
  subtitle: string;
  master: string;
  /** Approximate shape — taken from the program's own estimate where present. */
  estSessions: string;
  essence: string;
  /** Fit scoring inputs. */
  targetDimension?: SEDimension;
  bandWindow?: [number, number];
  loopAffinity?: string[];
}

export const JOURNEYS: JourneyDef[] = [
  {
    slug: "decondition-the-mind",
    programId: "v2-witness-foundations",
    title: "Decondition the Mind",
    subtitle: "Stop being managed by your own thoughts",
    master: "Krishnamurti",
    estSessions: "12 sessions",
    essence:
      "The attention work from sitting one, made structural. Learn to watch thought without becoming it — the precondition for everything else.",
    targetDimension: "thought",
    bandWindow: [1, 5],
    loopAffinity: ["CTL003", "MEN001", "MEN003", "BHV007"],
  },
  {
    slug: "stop-the-reactor",
    programId: "v2-pranayama",
    title: "Stop the Reactor",
    subtitle: "Cut the wire between trigger and reflex",
    master: "Patanjali",
    estSessions: "7 sessions",
    essence:
      "For the fear engine of sitting four: breath as the handle on a nervous system that mistakes headlines for tigers.",
    targetDimension: "body",
    bandWindow: [0, 4],
    loopAffinity: ["SRV001", "SRV002", "EMO001", "BOD005"],
  },
  {
    slug: "read-the-weather",
    programId: "v2-emotion-mapping",
    title: "Read the Emotional Weather",
    subtitle: "Feel it before it drives",
    master: "Meera",
    estSessions: "9 sessions",
    essence:
      "The thawing work of sitting ten, given structure: name what is moving, and stop numbing what you never learned to hold.",
    targetDimension: "emotion",
    bandWindow: [1, 6],
    loopAffinity: ["EMO001", "EMO005", "AVD001", "EMO010"],
  },
  {
    slug: "befriend-the-shadow",
    programId: "v2-shadow-intro",
    title: "Befriend the Shadow",
    subtitle: "Meet what you've been hiding — starting with kindness",
    master: "Jung",
    estSessions: "9 sessions",
    essence:
      "The disowned parts run the loudest loops. This is the doorway back through the identity work of sitting five.",
    targetDimension: "emotion",
    bandWindow: [2, 7],
    loopAffinity: ["EGO009", "AVD003", "EMO005", "IDN005"],
  },
  {
    slug: "who-am-i",
    programId: "v2-self-inquiry",
    title: "Who Am I?",
    subtitle: "Trace every thought back to its source",
    master: "Ramana Maharshi",
    estSessions: "10 sessions",
    essence:
      "The question of sitting eleven, walked properly — for those whose reading says the witness is already close.",
    targetDimension: "awareness",
    bandWindow: [5, 10],
    loopAffinity: ["IDN001", "PUR001", "SPR001"],
  },
  {
    slug: "work-without-wearing-out",
    programId: "v2-karma-yoga-work",
    title: "Work Without Wearing Out",
    subtitle: "Do the work without being consumed by it",
    master: "Krishna",
    estSessions: "11 sessions",
    essence:
      "For the ledger of sitting eight: work done from choice, rest taken unearned, worth unmortgaged from output.",
    targetDimension: "thought",
    bandWindow: [2, 7],
    loopAffinity: ["PRD001", "PRD015", "VAL008", "BLF005", "ENR001"],
  },
  {
    slug: "meet-the-body",
    programId: "v2-tantra-awareness",
    title: "Meet the Body",
    subtitle: "Use every sensation as a doorway",
    master: "Tantra",
    estSessions: "12 sessions",
    essence:
      "For those who live above the neck: sensation as the fastest route back from the story to what is actually here.",
    targetDimension: "body",
    bandWindow: [1, 8],
    loopAffinity: ["BOD011", "BOD001", "AVD001", "BOD009"],
  },
  {
    slug: "the-open-journey",
    programId: null,
    title: "The Open Journey",
    subtitle: "No door chosen — the app chooses with you",
    master: "The room itself",
    estSessions: "adaptive",
    essence:
      "For the mapping that refuses a single label, and for the honest answer 'I don't know yet'. Every sitting adapts to the last.",
  },
];

export const JOURNEY_BY_SLUG = (slug: string): JourneyDef | undefined =>
  JOURNEYS.find((j) => j.slug === slug);

export interface JourneyFit {
  journey: JourneyDef;
  score: number; // 0–100
  reason: string;
}

/**
 * Rank journeys against the user's mapping. Explainable by construction:
 * every point added carries the reason it will be shown to the user.
 *
 * Weights: spiral position (the strongest predictor of appropriate
 * practice) → the weakest dimension as the door (extra when it is a real
 * hole, not a mild lag) → the strongest dimension (you go deeper where you
 * are already open) → the loops actually running loud.
 */
export function rankJourneys(mapping: FirstElevenMapping): JourneyFit[] {
  const dimensions = mapping.dimensions;
  const entries = (Object.entries(dimensions) as [SEDimension, number][]).sort((a, b) => a[1] - b[1]);
  const weakest = entries[0]?.[0] ?? "awareness";
  const strongest = entries[entries.length - 1]?.[0] ?? "awareness";
  const mean = entries.reduce((s, [, v]) => s + v, 0) / entries.length;
  const weakestGap = mean - (entries[0]?.[1] ?? 0);
  const loopIds = mapping.loops.map((l) => l.id);
  const band = mapping.band;

  const fits: JourneyFit[] = JOURNEYS.map((journey) => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Spiral position — where you sit decides what practice fits.
    if (journey.bandWindow) {
      const [lo, hi] = journey.bandWindow;
      if (band >= lo && band <= hi) {
        score += 40;
        reasons.push("matched to where you sit on the spiral right now");
      } else {
        score += 5;
      }
    } else {
      score += 30; // the open journey has no window to miss
    }

    // 2. The weakest dimension is the door — more so when it is a real hole.
    if (journey.targetDimension) {
      if (journey.targetDimension === weakest) {
        score += weakestGap >= 2 ? 30 : 20;
        reasons.push(`chosen for your weakest dimension — ${weakest}`);
      } else if (journey.targetDimension === strongest) {
        score += 12;
        reasons.push(`meets you at your strongest dimension — ${strongest}`);
      } else {
        score += 4;
      }
    } else {
      score += 20; // the open journey is always a fair offer
    }

    // 3. Loop affinity — the loops actually running loud, up to 36 points.
    if (journey.loopAffinity) {
      const hits = journey.loopAffinity.filter((id) => loopIds.includes(id)).length;
      score += Math.min(36, hits * 12);
      if (hits > 0) {
        reasons.push("it speaks directly to the loop already running loudest in you");
      }
    }

    if (!reasons.length) {
      reasons.push("a solid door for where you are");
    }

    return {
      journey,
      score: Math.min(100, score),
      reason: reasons[0],
    };
  });

  return fits.sort((a, b) => b.score - a.score || a.journey.title.localeCompare(b.journey.title));
}
