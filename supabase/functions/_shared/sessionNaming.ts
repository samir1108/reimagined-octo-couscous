// ============================================================
// SESSION NAMING (server)
// ------------------------------------------------------------
// Port of src/lib/session/naming.ts so a sitting's invocation is
// produced by the composer, not reconstructed in the client.
// Deterministic: same inputs → same name.
// ============================================================

export type GateId = "morning" | "midday" | "evening" | "night";

export const GATE_DEFS: Record<GateId, { label: string; accentColor: string; theme: string }> = {
  morning: { label: "Morning", accentColor: "45 100% 60%", theme: "Awakening" },
  midday: { label: "Midday", accentColor: "200 80% 65%", theme: "Presence" },
  evening: { label: "Evening", accentColor: "240 60% 50%", theme: "Integration" },
  night: { label: "Night", accentColor: "270 50% 30%", theme: "Sanctuary" },
};

export function gateForHour(hour: number): GateId {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "midday";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export interface InvocationInput {
  sessionCount: number;
  hour: number;
  themeTitle?: string | null;
  archetype?: string | null;
  activeLoopNames?: string[];
  weakestDimension?: string | null;
  daysSinceLastSession?: number;
  sessionSalt?: string | null;
}

export interface SessionInvocation {
  invocation: string;
  gateLine: string;
  sittingRoman: string;
  gate: GateId;
  gateAccent: string;
}

const ORDINALS = [
  "", "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh",
  "Eighth", "Ninth", "Tenth", "Eleventh", "Twelfth", "Thirteenth",
  "Fourteenth", "Fifteenth", "Sixteenth", "Seventeenth", "Eighteenth",
  "Nineteenth", "Twentieth",
];

const GATE_NOUN: Record<GateId, string> = {
  morning: "Rising",
  midday: "Pause",
  evening: "Descent",
  night: "Sanctuary",
};

const SUBTITLES_BY_GATE: Record<GateId, string[]> = {
  morning: [
    "Where the Day Is Born",
    "Your Feet Remember the Path",
    "The Door Opens from Inside",
    "First Light in the Temple",
    "The Thread Between Sleep and Waking",
  ],
  midday: [
    "A Bell in the Marketplace",
    "The Still Point of the Day",
    "One Breath in the Middle of Motion",
    "The Clear-Eyed Hour",
  ],
  evening: [
    "Where Thoughts Become Weather",
    "Harvesting What the Day Revealed",
    "What Remains When the Noise Settles",
    "The Amber Threshold",
    "The Day Lays Itself Down",
  ],
  night: [
    "The Womb of the Dark",
    "The Moon Watches the Watcher",
    "Where Silence Does the Work",
    "The Last Gate Before Sleep",
  ],
};

const SUBTITLES_BY_ARCHETYPE: Record<string, string[]> = {
  Settling: ["Where the Dust Settles", "Landing in the Body", "The Weight of Returning"],
  Confrontation: ["The Cave You've Been Avoiding", "Meet the Monster: It's Made of Light", "The Edge You've Circled"],
  Reconciliation: ["The Fragment That Wants Home", "Making Peace with the Protector"],
  "Shadow Mirror": ["What the Mirror Refuses to Show", "Seeing the Seer"],
  "Stuck-Loop Break": ["The Pattern That Breaks Today", "Snapping the Chain", "The Forty-Seventh Time: This One Different"],
  "Lineage Initiation": ["The Transmission Enters the Room", "The Lineage Awakens in You"],
  "Re-entry": ["Welcome Home, Wanderer", "No Guilt. Only Return.", "The Path Celebrates Your Return"],
  Celebration: ["The Bell Rings: You Rose", "Harvesting the Gold"],
  Dissolution: ["The Construct Softens", "What Remains When Story Falls"],
  "Witness Deepening": ["The Muscle That Sees", "Stretching the Gap", "The Watcher Watches the Watcher"],
  "Inquiry Spiral": ["The Question That Has No Answer", "The Knife Turned Inward", "Who Asks? Who Answers?"],
  Devotional: ["The Heart Cracks Open", "Green Fire in the Chest", "Offering the Unofferable"],
  "Karmic Action": ["The One Act That Changes Everything", "Insight Becomes Motion", "The Footstep on the Path"],
  "Dark Night Hold": ["Just This. Just Here. Just Held.", "No Progress. Only Presence."],
};

const SUBTITLES_BY_DIMENSION: Record<string, string[]> = {
  body: ["The Body Remembers", "Where the Tension Lives", "Somatic Truth"],
  thought: ["The Thought That Isn't Yours", "Who Is Thinking This?", "The Story You Tell"],
  emotion: ["The Feeling Before the Name", "Emotion as Weather", "What the Heart Knows"],
  awareness: ["The Space Between", "Awareness Itself", "The Witness Wakes Up"],
};

const MILESTONE_NAMES: Record<number, string> = {
  1: "The Arrival",
  7: "The First Week",
  30: "The First Month",
  100: "The Century Session",
  365: "The First Year",
};

function hashSeed(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function romanNumeral(n: number): string {
  const table: Array<[number, string]> = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  let x = Math.max(1, Math.floor(n));
  for (const [v, s] of table) {
    while (x >= v) {
      out += s;
      x -= v;
    }
  }
  return out;
}

function pickFromPool(pool: string[], seed: number): string {
  return pool[seed % pool.length];
}

export function getSessionInvocation(input: InvocationInput): SessionInvocation {
  const gate = gateForHour(input.hour);
  const gateDef = GATE_DEFS[gate];
  const n = Math.max(1, Math.round(input.sessionCount || 1));
  const roman = romanNumeral(n);

  if (MILESTONE_NAMES[n]) {
    return {
      invocation: `${MILESTONE_NAMES[n]}: ${pickFromPool(SUBTITLES_BY_GATE[gate], hashSeed(`${n}:${gate}:milestone`))}`,
      gateLine: `${gateDef.label} Threshold · Sitting ${roman}`,
      sittingRoman: roman,
      gate,
      gateAccent: gateDef.accentColor,
    };
  }

  if (n === 1) {
    return {
      invocation: "The Arrival: Your Feet Remember the Path",
      gateLine: `${gateDef.label} Threshold · Sitting I`,
      sittingRoman: "I",
      gate,
      gateAccent: gateDef.accentColor,
    };
  }

  if ((input.daysSinceLastSession ?? 0) >= 7) {
    const subtitle = pickFromPool(
      SUBTITLES_BY_ARCHETYPE["Re-entry"],
      hashSeed(`${n}:${gate}:reentry`),
    );
    return {
      invocation: `The ${ORDINALS[n] ?? roman} ${GATE_NOUN[gate]}: ${subtitle}`,
      gateLine: `${gateDef.label} Threshold · Sitting ${roman}`,
      sittingRoman: roman,
      gate,
      gateAccent: gateDef.accentColor,
    };
  }

  let pool: string[] = [];

  if (input.archetype && SUBTITLES_BY_ARCHETYPE[input.archetype]) {
    pool = pool.concat(SUBTITLES_BY_ARCHETYPE[input.archetype]);
  }
  if (input.weakestDimension && SUBTITLES_BY_DIMENSION[input.weakestDimension]) {
    pool = pool.concat(SUBTITLES_BY_DIMENSION[input.weakestDimension]);
  }
  if (input.activeLoopNames && input.activeLoopNames.length > 0) {
    const loopName = input.activeLoopNames[0];
    pool.push(`Untangling "${loopName}"`);
    pool.push(`What ${loopName} Left Behind`);
    pool.push(`The Space Around ${loopName}`);
  }
  pool = pool.concat(SUBTITLES_BY_GATE[gate]);
  pool = Array.from(new Set(pool));

  const seed = hashSeed(
    `${n}:${gate}:${input.themeTitle ?? ""}:${input.archetype ?? ""}:${input.weakestDimension ?? ""}:${input.sessionSalt ?? ""}`,
  );
  const subtitle = pickFromPool(pool, seed);
  const ordinal = ORDINALS[n] ?? romanNumeral(n);

  return {
    invocation: `The ${ordinal} ${GATE_NOUN[gate]}: ${subtitle}`,
    gateLine: `${gateDef.label} Threshold · Sitting ${roman}`,
    sittingRoman: roman,
    gate,
    gateAccent: gateDef.accentColor,
  };
}
