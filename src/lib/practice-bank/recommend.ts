/**
 * Metrics → orb practice.
 *
 * The practice bank is neutral; this layer decides which corner of it a person
 * should meet now. It consumes the same PracticeMetrics the rest of the app
 * already produces (energy, mood, loops, constellation) and maps them onto
 * bank filters: category, delivery mode, world, voice and depth.
 */
import type { PracticeMetrics } from "@/lib/practice/metricsEngine";
import type { WorldId } from "@/lib/bience/model";
import { pickPractice, type PracticeQuery } from "./bank";
import { nearestDurationSlot, DURATION_SLOTS } from "./durations";
import type { DeliveryModeId, PracticeSpec, VoiceId } from "./model";

type Slot = "morning" | "midday" | "evening" | "night";

const CATEGORY_BY_SLOT: Record<Slot, string[]> = {
  morning: ["attention_concentration", "learning_skill_development", "values_life_direction"],
  midday: ["behavioral_change", "habit_formation", "cognitive_reflection"],
  evening: ["compassion_relationships", "emotional_awareness", "integration_review"],
  night: ["sleep_unwinding", "mindfulness_open_awareness", "breath_practice"],
};

const WORLD_BY_SLOT: Record<Slot, WorldId[]> = {
  morning: ["first-light", "kashi-dawn", "backwaters"],
  midday: ["backwaters", "monsoon-terrace", "hearth"],
  evening: ["hearth", "kashi-dawn", "backwaters"],
  night: ["nilgiri-night", "vipassana-hall", "cosmic-void"],
};

const MODE_BY_MOOD: Record<NonNullable<PracticeMetrics["mood"]>, DeliveryModeId> = {
  tense: "breath",
  neutral: "orb",
  open: "inquiry",
};

const VOICE_BY_MODE: Record<DeliveryModeId, VoiceId> = {
  orb: "guru",
  inquiry: "elder",
  silent: "guru",
  breath: "guru",
  body: "guru_male",
  "open-eyes": "child",
};

const ENERGY_CATEGORY: Record<NonNullable<PracticeMetrics["energy"]>, string[]> = {
  low: ["breath_practice", "mindfulness_open_awareness", "sleep_unwinding"],
  medium: ["attention_concentration", "self_inquiry_witnessing", "integration_review"],
  high: ["yoga_inspired", "body_sensory_awareness", "behavioral_change"],
};

export function currentPracticeSlot(date = new Date()): Slot {
  const hour = date.getHours();
  if (hour < 11) return "morning";
  if (hour < 17) return "midday";
  if (hour < 21) return "evening";
  return "night";
}

export interface OrbRecommendation extends PracticeMetrics {
  level?: number;
  voiceId?: VoiceId;
  modeId?: DeliveryModeId;
  worldId?: WorldId;
}

function pickCategory(metrics: OrbRecommendation, slot: Slot, seed: number): string | undefined {
  const pools = [CATEGORY_BY_SLOT[slot]];
  if (metrics.energy) pools.push(ENERGY_CATEGORY[metrics.energy]);
  if (metrics.activeLoops?.length) {
    pools.push(["self_inquiry_witnessing", "cognitive_reflection", "emotional_awareness"]);
  }
  const pool = pools[Math.min(pools.length - 1, seed % pools.length)] ?? [];
  return pool[seed % Math.max(1, pool.length)];
}

function pickWorld(metrics: OrbRecommendation, slot: Slot, seed: number): WorldId {
  if (metrics.worldId) return metrics.worldId;
  if (metrics.energy === "low") return seed % 2 === 0 ? "vipassana-hall" : "cosmic-void";
  if (metrics.energy === "high") return seed % 2 === 0 ? "kashi-dawn" : "monsoon-terrace";
  const pool = WORLD_BY_SLOT[slot];
  return pool[seed % pool.length];
}

export function recommendOrbPractice(
  metrics: OrbRecommendation = {},
  durationSec = 300,
  seed?: string | number,
): PracticeSpec {
  const slot = metrics.slot ?? currentPracticeSlot();
  const dayKey = new Date().toISOString().slice(0, 10);
  const loopKey = (metrics.activeLoops ?? []).slice(0, 3).join(",");
  const durableSeed = [
    seed ?? "",
    slot,
    dayKey,
    metrics.energy ?? "medium",
    metrics.mood ?? "neutral",
    metrics.level ?? 1,
    loopKey,
    durationSec,
  ].join("|");

  const numericSeed = durableSeed
    .split("")
    .reduce((acc, char) => (Math.imul(acc, 31) + char.charCodeAt(0)) >>> 0, 7);

  const modeId =
    metrics.modeId ??
    (metrics.energy === "low" ? "body" : MODE_BY_MOOD[metrics.mood ?? "neutral"]);
  const worldId = pickWorld(metrics, slot, numericSeed);
  const category = pickCategory(metrics, slot, numericSeed);
  const level = Math.max(1, Math.min(7, metrics.level ?? (metrics.energy === "high" ? 3 : 1)));
  const voiceId = metrics.voiceId ?? VOICE_BY_MODE[modeId];

  const query: PracticeQuery = {
    category,
    durationSec: DURATION_SLOTS[nearestDurationSlot(durationSec)].seconds,
    modeId,
    worldId,
    voiceId,
    level,
  };

  const match = pickPractice(query, durableSeed);
  if (match.atomId) return match;

  return pickPractice({ modeId, worldId, level }, durableSeed);
}
