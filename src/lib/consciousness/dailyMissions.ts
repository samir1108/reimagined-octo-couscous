import { GateId, getGateDef, GATE_PRACTICE_MAP, LOOP_ANTIDOTES } from "./dailyGates";

export type MissionType =
  | "micro_practice"
  | "inquiry_prompt"
  | "somatic_anchor"
  | "pattern_interrupt"
  | "journal_spark"
  | "micro_karma"
  | "transition_ritual"
  | "silent_pause";

export interface MissionReward {
  karmaPoints: number;
  streakProtection?: boolean;
  whisperUnlock?: boolean;
  loopAntidoteProgress?: string;
}

export interface DailyMission {
  id: string;
  gateId: GateId;
  type: MissionType;
  title: string;
  description: string;
  durationMinutes: number;
  difficulty: "gentle" | "moderate" | "deep";
  reward: MissionReward;
  adaptationReason: string;
  expiresAt: Date;
  baseDuration?: number;
  baseKarma?: number;
}

export interface MissionState {
  mission: DailyMission | null;
  status: "available" | "in_progress" | "completed" | "expired";
  startedAt?: number;
  completedAt?: number;
  reflection?: string;
}

export interface ConsciousnessProfile {
  vLevel?: number;
  weakestDimension?: string;
  activeLoops?: string[];
  bypassingRisk?: number;
  dimensionBands?: Record<string, number>;
  circadianType?: "early-bird" | "normal" | "night-owl";
  speedProfile?: "fast" | "steady" | "deep" | "adaptive";
}

export interface UserTimeProfile {
  circadianType?: "early-bird" | "normal" | "night-owl";
  availableSlots?: GateId[];
  wakeTime?: string;
  sleepTime?: string;
}

const MISSION_TYPE_ICONS: Record<MissionType, string> = {
  micro_practice: "🧘",
  inquiry_prompt: "❓",
  somatic_anchor: "🫁",
  pattern_interrupt: "⚡",
  journal_spark: "📝",
  micro_karma: "🌱",
  transition_ritual: "🔄",
  silent_pause: "🤫",
};

const GATE_MISSION_POOLS: Record<
  GateId,
  Omit<DailyMission, "gateId" | "adaptationReason" | "reward" | "expiresAt">[]
> = {
  morning: [
    {
      type: "micro_practice",
      title: "Three Breaths Before Rising",
      description:
        "Before feet touch floor: inhale 4, hold 2, exhale 6. Feel the body wake.",
      baseDuration: 2,
      baseKarma: 10,
      difficulty: "gentle",
    },
    {
      type: "somatic_anchor",
      title: "Morning Light Exposure",
      description:
        "Step outside or face a window for 2 minutes. Let light hit your eyes, set circadian rhythm.",
      baseDuration: 2,
      baseKarma: 10,
      difficulty: "gentle",
    },
    {
      type: "micro_karma",
      title: "One Conscious Act of Care",
      description:
        "Make tea for someone. Water a plant. Send a genuine check-in message. No expectation.",
      baseDuration: 5,
      baseKarma: 15,
      difficulty: "gentle",
    },
    {
      type: "inquiry_prompt",
      title: "Intention for Presence",
      description:
        '"What quality of attention do I want to bring today?" Hold the question, do not answer.',
      baseDuration: 3,
      baseKarma: 10,
      difficulty: "moderate",
    },
    {
      type: "transition_ritual",
      title: "Conscious Transition: Sleep to Wake",
      description:
        "Sit on edge of bed 60 seconds. Feel contact. Name one sensation. Then rise.",
      baseDuration: 2,
      baseKarma: 10,
      difficulty: "gentle",
    },
  ],
  midday: [
    {
      type: "somatic_anchor",
      title: "60-Second Sensation Anchor",
      description:
        "Between every task: feel feet on floor, hear 3 sounds, take 1 conscious breath.",
      baseDuration: 1,
      baseKarma: 8,
      difficulty: "gentle",
    },
    {
      type: "micro_practice",
      title: "Box Breathing Between Meetings",
      description: "4-4-4-4 breath cycle x 3 rounds. Reset nervous system before next engagement.",
      baseDuration: 2,
      baseKarma: 10,
      difficulty: "moderate",
    },
    {
      type: "pattern_interrupt",
      title: "Single-Task Container",
      description:
        "Next 10 minutes: one task only. Phone away. Tab closed. Complete or release.",
      baseDuration: 10,
      baseKarma: 20,
      difficulty: "moderate",
    },
    {
      type: "transition_ritual",
      title: "Conscious Lunch",
      description:
        "First 3 bites: no screen, no reading. Taste. Texture. Temperature. Gratitude.",
      baseDuration: 5,
      baseKarma: 12,
      difficulty: "gentle",
    },
    {
      type: "inquiry_prompt",
      title: "What is Running Me Right Now?",
      description: "Pause. Ask. Wait for the answer in sensation, not thought.",
      baseDuration: 2,
      baseKarma: 10,
      difficulty: "moderate",
    },
  ],
  evening: [
    {
      type: "journal_spark",
      title: "Evening Metabolization",
      description:
        'One line: "Today I reacted when ____. The sensation was ____. I release it."',
      baseDuration: 5,
      baseKarma: 15,
      difficulty: "moderate",
    },
    {
      type: "inquiry_prompt",
      title: "Trace One Reactive Moment",
      description:
        "Recall one trigger. Find it in the body. Stay with the sensation until it shifts.",
      baseDuration: 8,
      baseKarma: 20,
      difficulty: "deep",
    },
    {
      type: "micro_practice",
      title: "Body Scan for Release",
      description:
        "Head to toe: where does the day live? Breathe into each area. Exhale = release.",
      baseDuration: 10,
      baseKarma: 18,
      difficulty: "moderate",
    },
    {
      type: "transition_ritual",
      title: "Work to Life Transition",
      description:
        "Change clothes. Wash hands/face. Declare: 'Work is complete. I am here now.'",
      baseDuration: 3,
      baseKarma: 12,
      difficulty: "gentle",
    },
    {
      type: "micro_karma",
      title: "Evening Gratitude Message",
      description:
        "Send one genuine appreciation to someone who impacted your day. No reciprocity needed.",
      baseDuration: 3,
      baseKarma: 15,
      difficulty: "gentle",
    },
  ],
  night: [
    {
      type: "silent_pause",
      title: "Long Exhales Only",
      description:
        "Lying down: inhale naturally, exhale as long as comfortable. No count. No technique. Just release.",
      baseDuration: 5,
      baseKarma: 12,
      difficulty: "gentle",
    },
    {
      type: "inquiry_prompt",
      title: "Lay Down Today's Identity",
      description:
        '"Who was I today?" Watch the images arise. "Who am I without that?" Rest in the gap.',
      baseDuration: 5,
      baseKarma: 15,
      difficulty: "deep",
    },
    {
      type: "micro_practice",
      title: "Body Scan for Sleep",
      description:
        "Toes to crown: tense 3 seconds, release completely. Feel the weight of surrender.",
      baseDuration: 8,
      baseKarma: 15,
      difficulty: "gentle",
    },
    {
      type: "journal_spark",
      title: "One Word for the Day",
      description: "If today had a single word, what would it be? Write it. Close journal. Sleep.",
      baseDuration: 2,
      baseKarma: 10,
      difficulty: "gentle",
    },
    {
      type: "transition_ritual",
      title: "Sanctuary Preparation",
      description:
        "Phone to charger (not bedside). Lights dim. Cool room. 'Tomorrow is not yet.'",
      baseDuration: 3,
      baseKarma: 10,
      difficulty: "gentle",
    },
  ],
};

function formatLoopName(loop: string): string {
  return loop
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getGateEndTime(gateId: GateId, userTimeProfile?: UserTimeProfile): Date {
  const now = new Date();
  const wakeMinutes = userTimeProfile?.wakeTime
    ? parseTimeToMinutes(userTimeProfile.wakeTime)
    : 5 * 60;
  const sleepMinutes = userTimeProfile?.sleepTime
    ? parseTimeToMinutes(userTimeProfile.sleepTime)
    : 23 * 60;

  if (wakeMinutes === null || sleepMinutes === null) {
    return getDefaultGateEnd(gateId);
  }

  const awakeMinutes = (sleepMinutes - wakeMinutes + 1440) % 1440;
  let gateEndMinutes: number;

  switch (gateId) {
    case "morning":
      gateEndMinutes = wakeMinutes + Math.floor(awakeMinutes * 0.25);
      break;
    case "midday":
      gateEndMinutes = wakeMinutes + Math.floor(awakeMinutes * 0.6);
      break;
    case "evening":
      gateEndMinutes = wakeMinutes + Math.floor(awakeMinutes * 0.85);
      break;
    case "night":
      gateEndMinutes = sleepMinutes;
      break;
  }

  const endDate = new Date();
  endDate.setHours(Math.floor(gateEndMinutes / 60) % 24);
  endDate.setMinutes(gateEndMinutes % 60);
  endDate.setSeconds(0);
  endDate.setMilliseconds(0);

  if (endDate <= now) {
    endDate.setDate(endDate.getDate() + 1);
  }

  return endDate;
}

function getDefaultGateEnd(gateId: GateId): Date {
  const now = new Date();
  const hour = now.getHours();
  let endHour: number;

  switch (gateId) {
    case "morning":
      endHour = 12;
      break;
    case "midday":
      endHour = 17;
      break;
    case "evening":
      endHour = 21;
      break;
    case "night":
      endHour = 5;
      break;
  }

  const endDate = new Date();
  endDate.setHours(endHour, 0, 0, 0);
  if (endDate <= now) {
    endDate.setDate(endDate.getDate() + 1);
  }
  return endDate;
}

function parseTimeToMinutes(time: string): number | null {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function generateDailyMission(
  gateId: GateId,
  profile: ConsciousnessProfile,
  userTimeProfile?: UserTimeProfile
): DailyMission {
  const gate = getGateDef(gateId);
  const activeLoops = profile.activeLoops ?? [];
  const weakestDimension = profile.weakestDimension;
  const vLevel = profile.vLevel ?? 0;
  const bypassingRisk = profile.bypassingRisk ?? 0;
  const circadianType = profile.circadianType ?? "normal";

  const expiresAt = getGateEndTime(gateId, userTimeProfile);
  const dayOfYear = Math.floor(Date.now() / 86400000);

  const createMission = (overrides: Partial<DailyMission>): DailyMission => {
    const base = {
      id: `mission-${gateId}-${dayOfYear}-${Math.random().toString(36).slice(2, 8)}`,
      gateId,
      expiresAt,
      ...overrides,
    };
    return base as DailyMission;
  };

  if (bypassingRisk > 0.7) {
    return createMission({
      type: "somatic_anchor",
      title: "Ground First",
      description:
        "2 minutes: feet on floor, hand on heart, three breaths. No teaching, just sensation.",
      durationMinutes: 2,
      difficulty: "gentle",
      reward: { karmaPoints: 15, streakProtection: true },
      adaptationReason:
        "High bypassing risk detected — grounding stabilizes the field before any practice",
      baseDuration: 2,
      baseKarma: 15,
    });
  }

  const primaryLoop = activeLoops[0];
  if (primaryLoop && LOOP_ANTIDOTES[primaryLoop]?.[gateId]) {
    return createMission({
      type: "pattern_interrupt",
      title: `Interrupt: ${formatLoopName(primaryLoop)}`,
      description: LOOP_ANTIDOTES[primaryLoop][gateId],
      durationMinutes: 5,
      difficulty: "moderate",
      reward: { karmaPoints: 25, loopAntidoteProgress: primaryLoop },
      adaptationReason: `Active ${primaryLoop} loop — this gate's antidote targets it directly`,
      baseDuration: 5,
      baseKarma: 25,
    });
  }

  if (weakestDimension && GATE_PRACTICE_MAP[gateId].dimensionAdjustments[weakestDimension]) {
    const dimAdj = GATE_PRACTICE_MAP[gateId].dimensionAdjustments[weakestDimension];
    const map = GATE_PRACTICE_MAP[gateId];
    const vLevelKey = vLevel >= 5 ? "5+" : vLevel >= 3 ? "3-5" : vLevel >= 1.5 ? "1.5-3" : "0-1.5";
    const vLevelAdj = map.vLevelAdjustments[vLevelKey];
    const duration = Math.min(
      Math.max((vLevelAdj?.durationMod ?? 0) + (gate.maxDurationMinutes - 5), 5),
      gate.maxDurationMinutes
    );

    return createMission({
      type: "micro_practice",
      title: `Strengthen: ${capitalize(weakestDimension)}`,
      description: dimAdj.reason,
      durationMinutes: duration,
      difficulty: vLevel > 3 ? "deep" : "moderate",
      reward: { karmaPoints: 20 },
      adaptationReason: `Weakest dimension is ${weakestDimension} — ${gateId} gate naturally supports this`,
      baseDuration: duration,
      baseKarma: 20,
    });
  }

  const pool = GATE_MISSION_POOLS[gateId];
  const selected = pool[dayOfYear % pool.length];
  const duration = Math.min(selected.baseDuration ?? 5, gate.maxDurationMinutes);

  return createMission({
    ...selected,
    durationMinutes: duration,
    reward: { karmaPoints: selected.baseKarma ?? 10 },
    adaptationReason: `${gate.theme} gate invitation — ${gate.naturalEnergy} energy naturally supports this`,
  });
}

export function generateAllDailyMissions(
  profile: ConsciousnessProfile,
  userTimeProfile?: UserTimeProfile
): DailyMission[] {
  const gates: GateId[] = ["morning", "midday", "evening", "night"];
  return gates.map((gate) => generateDailyMission(gate, profile, userTimeProfile));
}

export function getMissionIcon(type: MissionType): string {
  return MISSION_TYPE_ICONS[type] ?? "🎯";
}

export function getCurrentGateMission(
  missions: DailyMission[],
  currentGate: GateId
): DailyMission | undefined {
  return missions.find((m) => m.gateId === currentGate);
}

export function getMissionStatus(
  mission: DailyMission,
  userMissionState?: MissionState
): "available" | "in_progress" | "completed" | "expired" {
  if (userMissionState?.status) return userMissionState.status;
  if (new Date() > mission.expiresAt) return "expired";
  return "available";
}

export function formatMissionDuration(minutes: number): string {
  if (minutes < 1) return "< 1 min";
  if (minutes === 1) return "1 min";
  return `${minutes} min`;
}

export function getDifficultyColor(difficulty: DailyMission["difficulty"]): string {
  switch (difficulty) {
    case "gentle":
      return "text-green-400";
    case "moderate":
      return "text-amber-400";
    case "deep":
      return "text-rose-400";
  }
}

export function getDifficultyLabel(difficulty: DailyMission["difficulty"]): string {
  switch (difficulty) {
    case "gentle":
      return "Gentle";
    case "moderate":
      return "Moderate";
    case "deep":
      return "Deep";
  }
}