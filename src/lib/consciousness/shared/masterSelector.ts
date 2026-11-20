/**
 * Master (guru) selection and rotation.
 *
 * This used to be a stub that returned Ramana Maharshi for every session and
 * never rotated, which silently removed the lineage layer from the product.
 * Selection is now a deterministic score over loop family, band, theme
 * keywords and recent use.
 */

export interface RotationContext {
  userId: string;
  currentGuruId: string | null;
  daysSinceLastRotation: number;
  lifetimePhase: number;
  dominantLoop: string | null;
  loopSeverity: number;
  avgQualityLast7Days: number;
  progressStalled: boolean;
  rotationsHistory: Array<{ guruId: string; startedAt: string; reason: string }>;
}

export interface RotationDecision {
  shouldRotate: boolean;
  newGuruId: string;
  reason: string;
  durationDays: number;
  message: string;
}

export interface RotationReason {
  type: string;
  description: string;
}

export interface GuruSelectionInput {
  band: number;
  activeLoops?: string[];
  themeFocusAreas?: string[];
  themeTitle?: string;
  excludeGuruIds?: string[];
}

export interface GuruSelection {
  guruId: string;
  reason: string;
  score: number;
}

interface MasterProfile {
  id: string;
  name: string;
  tradition: string;
  band: [number, number];
  loopFamilies: string[];
  keywords: string[];
  pace: "gentle" | "steady" | "sharp";
}

const MASTERS: MasterProfile[] = [
  {
    id: "tara",
    name: "Tara",
    tradition: "Trauma-informed compassion",
    band: [0, 3],
    loopFamilies: ["VAL", "EMO", "REL", "BLF"],
    keywords: ["fear", "anxiety", "panic", "shame", "unsafe", "grief"],
    pace: "gentle",
  },
  {
    id: "thich_nhat_hanh",
    name: "Thich Nhat Hanh",
    tradition: "Mindful presence",
    band: [0, 4],
    loopFamilies: ["ANX", "MEN", "EMO"],
    keywords: ["overwhelm", "rest", "breath", "peace", "gentle"],
    pace: "gentle",
  },
  {
    id: "lao_tzu",
    name: "Lao Tzu",
    tradition: "Tao Te Ching",
    band: [1, 6],
    loopFamilies: ["CTL", "PRD", "CRE"],
    keywords: ["control", "effort", "flow", "letting go", "patience"],
    pace: "gentle",
  },
  {
    id: "rumi",
    name: "Rumi",
    tradition: "Sufi",
    band: [1, 7],
    loopFamilies: ["VAL", "EMO", "REL", "CMP"],
    keywords: ["anger", "love", "wound", "grief", "longing", "heartbreak"],
    pace: "steady",
  },
  {
    id: "buddha",
    name: "Buddha",
    tradition: "Theravada / mindfulness",
    band: [1, 8],
    loopFamilies: ["NAR", "CMP", "MEN", "COG", "BLF"],
    keywords: ["thought", "clinging", "suffering", "story", "comparison"],
    pace: "steady",
  },
  {
    id: "patanjali",
    name: "Patanjali",
    tradition: "Yoga Sutras",
    band: [1, 7],
    loopFamilies: ["HAB", "COG", "BHV", "LRN"],
    keywords: ["habit", "discipline", "focus", "practice", "attention"],
    pace: "steady",
  },
  {
    id: "krishna",
    name: "Krishna",
    tradition: "Bhagavad Gita",
    band: [2, 8],
    loopFamilies: ["AVD", "MOT", "DEC", "SRV", "PRD", "PUR"],
    keywords: ["work", "duty", "action", "decision", "avoidance", "career"],
    pace: "steady",
  },
  {
    id: "marcus",
    name: "Marcus Aurelius",
    tradition: "Stoicism",
    band: [2, 6],
    loopFamilies: ["DEC", "PRD", "CTL"],
    keywords: ["work", "pressure", "duty", "acceptance"],
    pace: "steady",
  },
  {
    id: "vivekananda",
    name: "Vivekananda",
    tradition: "Practical Vedanta",
    band: [3, 8],
    loopFamilies: ["MOT", "PUR", "SRV", "ENR"],
    keywords: ["purpose", "calling", "strength", "service", "courage"],
    pace: "sharp",
  },
  {
    id: "krishnamurti",
    name: "J. Krishnamurti",
    tradition: "Choiceless awareness",
    band: [3, 9],
    loopFamilies: ["CTL", "BLF", "IDN", "COG"],
    keywords: ["truth", "clarity", "belief", "authority", "freedom"],
    pace: "sharp",
  },
  {
    id: "shiva",
    name: "Adiyogi Shiva",
    tradition: "Source of yoga",
    band: [3, 9],
    loopFamilies: ["BOD", "ENR", "EMO"],
    keywords: ["body", "energy", "breath", "intensity", "dissolution"],
    pace: "sharp",
  },
  {
    id: "anandamayi",
    name: "Anandamayi Ma",
    tradition: "Bhakti",
    band: [4, 9],
    loopFamilies: ["EMO", "REL", "SPR"],
    keywords: ["devotion", "surrender", "grief", "joy", "longing"],
    pace: "gentle",
  },
  {
    id: "ramana",
    name: "Ramana Maharshi",
    tradition: "Advaita Vedanta",
    band: [4, 9],
    loopFamilies: ["ATT", "EGO", "IDN", "SPR"],
    keywords: ["identity", "self", "who am i", "attachment", "ego"],
    pace: "steady",
  },
  {
    id: "nisargadatta",
    name: "Nisargadatta",
    tradition: "Advaita (radical)",
    band: [5, 10],
    loopFamilies: ["IDN", "EGO", "SPR"],
    keywords: ["self", "death", "being", "identity", "awareness"],
    pace: "sharp",
  },
  {
    id: "bodhidharma",
    name: "Bodhidharma",
    tradition: "Chan",
    band: [5, 10],
    loopFamilies: ["COG", "NAR", "MEN"],
    keywords: ["silence", "mind", "direct", "cutting"],
    pace: "sharp",
  },
];

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

/** "ATT001" -> "ATT". Unrecognised ids fall back to their first letters. */
export function loopFamilyOf(loopId: string): string {
  const m = String(loopId).toUpperCase().match(/^([A-Z]{2,4})/);
  return m ? m[1] : "";
}

function bandFit(profile: MasterProfile, band: number): number {
  const [lo, hi] = profile.band;
  if (band >= lo && band <= hi) return 3;
  const distance = band < lo ? lo - band : band - hi;
  return Math.max(-3, -0.75 * distance);
}

function keywordHits(profile: MasterProfile, haystack: string): number {
  if (!haystack) return 0;
  let hits = 0;
  for (const k of profile.keywords) {
    if (haystack.includes(k)) hits++;
  }
  return hits;
}

export function selectMasterForSession(input: GuruSelectionInput): GuruSelection {
  const band = Number.isFinite(input.band) ? input.band : 0;
  const excluded = new Set(input.excludeGuruIds ?? []);
  const families = new Set((input.activeLoops ?? []).map(loopFamilyOf).filter(Boolean));
  const haystack = [input.themeTitle ?? "", ...(input.themeFocusAreas ?? [])]
    .join(" ")
    .toLowerCase();

  let best: { profile: MasterProfile; score: number; why: string } | null = null;

  for (const profile of MASTERS) {
    if (excluded.has(profile.id)) continue;

    let score = bandFit(profile, band);
    const reasons: string[] = [];
    if (score > 0) reasons.push(`fits band ${band}`);

    const loopHits = profile.loopFamilies.filter((f) => families.has(f));
    if (loopHits.length > 0) {
      const points = Math.min(8, loopHits.length * 4);
      score += points;
      reasons.push(`dissolves ${loopHits.join("/")}`);
    }

    const hits = keywordHits(profile, haystack);
    if (hits > 0) {
      score += Math.min(4, hits * 2);
      reasons.push(`theme: ${profile.keywords.filter((k) => haystack.includes(k)).join(", ")}`);
    }

    // Deterministic tie-break so the same state always yields the same master.
    score += hashString(`master:${profile.id}`) * 0.01;

    if (!best || score > best.score) {
      best = { profile, score, why: reasons.join(" · ") || "steady default" };
    }
  }

  if (!best) {
    return { guruId: "ramana", reason: "all candidates excluded", score: 0 };
  }

  return {
    guruId: best.profile.id,
    reason: best.why,
    score: Math.round(best.score * 100) / 100,
  };
}

const MIN_ROTATION_DAYS = 21;
const MAX_ROTATION_DAYS = 45;

export function selectMasterForRotation(ctx: RotationContext): RotationDecision {
  const current = ctx.currentGuruId ?? null;
  const days = ctx.daysSinceLastRotation;
  const lowQuality = ctx.avgQualityLast7Days < 0.4;
  const heavyLoop = ctx.loopSeverity >= 7;
  const stalled = ctx.progressStalled;

  let shouldRotate = false;
  let reason = "still in season";

  if (days >= MAX_ROTATION_DAYS) {
    shouldRotate = true;
    reason = "season complete";
  } else if (days >= MIN_ROTATION_DAYS && (stalled || lowQuality || heavyLoop)) {
    shouldRotate = true;
    reason = stalled ? "progress stalled" : lowQuality ? "quality dropped" : "loop too heavy";
  }

  if (!shouldRotate) {
    return {
      shouldRotate: false,
      newGuruId: current ?? "ramana",
      reason: "no_rotation_needed",
      durationDays: Math.max(0, MAX_ROTATION_DAYS - days),
      message: "",
    };
  }

  const recent = new Set([
    current ?? "",
    ...ctx.rotationsHistory.slice(0, 2).map((r) => r.guruId),
  ]);
  const preferredPace = stalled || heavyLoop ? "sharp" : lowQuality ? "gentle" : null;

  const candidates = MASTERS.filter((m) => !recent.has(m.id));
  const pool = candidates.length > 0 ? candidates : MASTERS.filter((m) => m.id !== current);

  let next = pool[0];
  let nextScore = -Infinity;
  for (const m of pool) {
    let score = bandFit(m, ctx.lifetimePhase);
    if (preferredPace && m.pace === preferredPace) score += 1.5;
    if (ctx.dominantLoop) {
      const fam = loopFamilyOf(ctx.dominantLoop);
      if (m.loopFamilies.includes(fam)) score += 3;
    }
    score += hashString(`rotate:${ctx.userId}:${days}:${m.id}`) * 0.01;
    if (score > nextScore) {
      nextScore = score;
      next = m;
    }
  }

  const message =
    reason === "season complete"
      ? `A new season begins. ${next.name} will walk the next stretch with you.`
      : `${next.name} enters: ${reason}, and this voice meets it.`;

  return {
    shouldRotate: true,
    newGuruId: next.id,
    reason,
    durationDays: MAX_ROTATION_DAYS,
    message,
  };
}

export function masterProfile(id: string): { id: string; name: string; tradition: string } | null {
  const m = MASTERS.find((x) => x.id === id);
  return m ? { id: m.id, name: m.name, tradition: m.tradition } : null;
}
