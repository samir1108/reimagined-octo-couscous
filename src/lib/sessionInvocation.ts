/**
 * SESSION INVOCATION — deterministic naming engine.
 * Every session gets a Name (an invocation) instead of "Session 3".
 * Pure, client-side, no AI: gate + session count + theme + archetype
 * hash-seed into a stable-but-varying poetic title.
 */
import { getGateDef, type GateId } from "@/lib/consciousness/dailyGates";

export interface InvocationInput {
  /** 1-based lifetime session number for this user */
  sessionCount: number;
  /** current hour → gate */
  hour: number;
  themeTitle?: string | null;
  /** archetype from compose-session-v3 _meta, if present */
  archetype?: string | null;
  /** Per-session random salt so the same inputs can still yield a different subtitle */
  sessionSalt?: string | null;
}

export interface SessionInvocation {
  /** "The Third Descent: Where Thoughts Become Weather" */
  invocation: string;
  /** "Evening Threshold · Sitting III" */
  gateLine: string;
  /** "III" */
  sittingRoman: string;
  gate: GateId;
  /** hsl accent from dailyGates, e.g. "45 100% 60%" */
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
  "Settling": ["Where the Dust Settles", "Landing in the Body", "The Weight of Returning"],
  "Confrontation": ["The Cave You've Been Avoiding", "Meet the Monster: It's Made of Light", "The Edge You've Circled"],
  "Reconciliation": ["The Fragment That Wants Home", "Making Peace with the Protector"],
  "Shadow Mirror": ["What the Mirror Refuses to Show", "Seeing the Seer"],
  "Stuck-Loop Break": ["The Pattern That Breaks Today", "Snapping the Chain", "The Forty-Seventh Time: This One Different"],
  "Lineage Initiation": ["The Transmission Enters the Room", "The Lineage Awakens in You"],
  "Re-entry": ["Welcome Home, Wanderer", "No Guilt. Only Return.", "The Path Celebrates Your Return"],
  "Celebration": ["The Bell Rings: You Rose", "Harvesting the Gold"],
  "Dissolution": ["The Construct Softens", "What Remains When Story Falls"],
  "Witness Deepening": ["The Muscle That Sees", "Stretching the Gap", "The Watcher Watches the Watcher"],
  "Inquiry Spiral": ["The Question That Has No Answer", "The Knife Turned Inward", "Who Asks? Who Answers?"],
  "Devotional": ["The Heart Cracks Open", "Green Fire in the Chest", "Offering the Unofferable"],
  "Karmic Action": ["The One Act That Changes Everything", "Insight Becomes Motion", "The Footstep on the Path"],
  "Dark Night Hold": ["Just This. Just Here. Just Held.", "No Progress. Only Presence."],
};

const SESSION_ANGLES = [
  "First Contact",
  "Deepening",
  "Integration",
  "Breakthrough",
  "Return",
  "Exploration",
  "Surrender",
  "Action",
  "Witnessing",
  "Inquiry",
];

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

export function getSessionInvocation(input: InvocationInput): SessionInvocation {
  const gate: GateId =
    input.hour >= 5 && input.hour < 12 ? "morning"
    : input.hour >= 12 && input.hour < 17 ? "midday"
    : input.hour >= 17 && input.hour < 21 ? "evening"
    : "night";
  const gateDef = getGateDef(gate);
  const n = Math.max(1, input.sessionCount);
  const roman = romanNumeral(n);

  if (n === 1) {
    return {
      invocation: "The Arrival: Your Feet Remember the Path",
      gateLine: `${gateDef.label} Threshold · Sitting I`,
      sittingRoman: "I",
      gate,
      gateAccent: gateDef.accentColor,
    };
  }

  const pool =
    (input.archetype && SUBTITLES_BY_ARCHETYPE[input.archetype]) ||
    SUBTITLES_BY_GATE[gate];
  const seed = hashSeed(`${n}:${gate}:${input.themeTitle ?? ""}:${input.sessionSalt ?? ""}`);
  const subtitle = pool[seed % pool.length];

  const ordinal = ORDINALS[n] ?? romanNumeral(n);
  const invocation = `The ${ordinal} ${GATE_NOUN[gate]}: ${subtitle}`;

  return {
    invocation,
    gateLine: `${gateDef.label} Threshold · Sitting ${roman}`,
    sittingRoman: roman,
    gate,
    gateAccent: gateDef.accentColor,
  };
}

export function getSessionAngle(sessionSalt: string | null | undefined): string {
  if (!sessionSalt) return SESSION_ANGLES[0];
  const seed = hashSeed(String(sessionSalt));
  return SESSION_ANGLES[seed % SESSION_ANGLES.length];
}
