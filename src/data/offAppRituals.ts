/**
 * Off-App Rituals — life-as-practice
 * ──────────────────────────────────
 * Tiny anchors woven into daily life. The app becomes invisible — practice
 * happens 20× a day inside real moments (brushing, eating, talking, walking).
 *
 * Grouped into sections so the Off-App tab can present a full-day map.
 * Reminder opt-ins live in localStorage (see `useOffAppReminders.ts`).
 */

export type OffAppRitualId =
  // Morning bookend
  | "wake_breath"
  | "brushing_witness"
  | "bath_first_time"
  | "first_sip"
  // Meals
  | "breakfast_silence"
  | "lunch_pause"
  | "dinner_gratitude"
  | "snack_check"
  // Work / day
  | "work_start_breath"
  | "every_90_min"
  | "phone_unlock_pause"
  | "meeting_listen"
  // Talking / relating
  | "before_speaking"
  | "deep_listening"
  | "loved_one_arrives"
  | "mid_argument_breath"
  // Transitions
  | "walking_feet"
  | "commute_faces"
  | "evening_arrival"
  // Evening bookend
  | "sunset_witness"
  | "evening_wash"
  | "bedtime_gift"
  | "lights_out_scan"
  // Legacy (keep old ids working)
  | "first_bites";

export type OffAppGroup =
  | "morning"
  | "meals"
  | "work"
  | "relating"
  | "transitions"
  | "evening";

export interface OffAppRitual {
  id: OffAppRitualId;
  emoji: string;
  title: string;
  whenLabel: string;
  defaultTime: string;     // "HH:MM" 24h
  durationSec: number;
  cue: string;
  instruction: string;
  closing: string;
  tag: "morning" | "midday" | "evening" | "night" | "anytime";
  group: OffAppGroup;
  /** Maps to a key in onboarding `daily_anchors` if reminder time should auto-sync. */
  anchor?: "wake_up" | "brush_washroom" | "bath" | "work_start" | "sleep" | "breakfast" | "lunch" | "dinner";
  /** Minutes added to anchor time. Eg. brushing fires +0, first sip +10. */
  anchorOffsetMin?: number;
}

export const OFF_APP_GROUPS: { id: OffAppGroup; label: string; emoji: string }[] = [
  { id: "morning",     label: "Morning bookend",   emoji: "🌅" },
  { id: "meals",       label: "Meals",             emoji: "🍽️" },
  { id: "work",        label: "Work & day",        emoji: "💼" },
  { id: "relating",    label: "Talking & relating", emoji: "🗣️" },
  { id: "transitions", label: "Transitions",       emoji: "🚶" },
  { id: "evening",     label: "Evening bookend",   emoji: "🌙" },
];

export const OFF_APP_RITUALS: OffAppRitual[] = [
  // ─── Morning bookend ─────────────────────────────────────────────
  {
    id: "wake_breath",
    emoji: "🌅",
    title: "Three breaths on waking",
    whenLabel: "Before the phone",
    defaultTime: "06:30",
    durationSec: 60,
    cue: "Eyes still closed.",
    instruction: "Three slow breaths. On the third out-breath, name one quiet gift the day might hold.",
    closing: "Now meet the day.",
    tag: "morning",
    group: "morning",
    anchor: "wake_up",
    anchorOffsetMin: 0,
  },
  {
    id: "brushing_witness",
    emoji: "🪥",
    title: "60 strokes = body scan",
    whenLabel: "While brushing teeth",
    defaultTime: "07:00",
    durationSec: 120,
    cue: "Bristles, water, breath.",
    instruction: "Feel the bristles. Count sixty strokes — let counting become the meditation.",
    closing: "A clean mouth, a settled mind.",
    tag: "morning",
    group: "morning",
    anchor: "brush_washroom",
    anchorOffsetMin: 0,
  },
  {
    id: "bath_first_time",
    emoji: "🚿",
    title: "Water as if first time",
    whenLabel: "In the shower",
    defaultTime: "07:30",
    durationSec: 180,
    cue: "Skin meets water.",
    instruction: "Feel the water as if you've never felt it before. No planning the day. Just sensation.",
    closing: "Step out new.",
    tag: "morning",
    group: "morning",
    anchor: "bath",
    anchorOffsetMin: 0,
  },
  {
    id: "first_sip",
    emoji: "☕",
    title: "First sip — taste fully",
    whenLabel: "Morning drink",
    defaultTime: "08:00",
    durationSec: 30,
    cue: "Cup in hand.",
    instruction: "Taste the first sip like a child tasting it new. Warmth, bitterness, breath.",
    closing: "Then drink as you wish.",
    tag: "morning",
    group: "morning",
    anchor: "wake_up",
    anchorOffsetMin: 30,
  },

  // ─── Meals ───────────────────────────────────────────────────────
  {
    id: "breakfast_silence",
    emoji: "🍳",
    title: "First three bites in silence",
    whenLabel: "At breakfast",
    defaultTime: "08:30",
    durationSec: 90,
    cue: "Phone face-down.",
    instruction: "First three bites — no talk, no scroll. Taste only. Then eat normally.",
    closing: "The body knows you arrived.",
    tag: "morning",
    group: "meals",
    anchor: "breakfast",
    anchorOffsetMin: 0,
  },
  {
    id: "lunch_pause",
    emoji: "🥗",
    title: "Halfway pause",
    whenLabel: "Mid-lunch",
    defaultTime: "13:00",
    durationSec: 30,
    cue: "Fork down.",
    instruction: "Halfway through, pause ten seconds. Notice fullness. Then continue if hungry.",
    closing: "Eat to ease, not to empty.",
    tag: "midday",
    group: "meals",
    anchor: "lunch",
    anchorOffsetMin: 10,
  },
  {
    id: "dinner_gratitude",
    emoji: "🍽️",
    title: "One thing before eating",
    whenLabel: "At dinner",
    defaultTime: "20:00",
    durationSec: 30,
    cue: "Phone face-down.",
    instruction: "Before the first bite, name one thing you're grateful for from today — silently or aloud.",
    closing: "Now eat.",
    tag: "evening",
    group: "meals",
    anchor: "dinner",
    anchorOffsetMin: 0,
  },
  {
    id: "snack_check",
    emoji: "🍫",
    title: "Hungry or restless?",
    whenLabel: "Before any snack",
    defaultTime: "16:30",
    durationSec: 15,
    cue: "Hand reaching.",
    instruction: "Pause. One breath. Ask: hungry, or restless? If restless — feel the restlessness for ten seconds first.",
    closing: "Then choose.",
    tag: "anytime",
    group: "meals",
  },
  // Legacy alias — keep working for old reminders
  {
    id: "first_bites",
    emoji: "🍚",
    title: "First three bites in silence",
    whenLabel: "At your next meal",
    defaultTime: "13:00",
    durationSec: 90,
    cue: "Phone down. Eyes soft.",
    instruction: "Take the first three bites with no talk, no scroll. Taste only.",
    closing: "Eat the rest however you wish.",
    tag: "midday",
    group: "meals",
  },

  // ─── Work / day ──────────────────────────────────────────────────
  {
    id: "work_start_breath",
    emoji: "💼",
    title: "60 sec before opening anything",
    whenLabel: "When you sit at the desk",
    defaultTime: "09:30",
    durationSec: 60,
    cue: "Hands on the keyboard.",
    instruction: "Sixty seconds before opening email or chat. Three breaths. Set one intention for the first hour.",
    closing: "Now begin.",
    tag: "morning",
    group: "work",
    anchor: "work_start",
    anchorOffsetMin: 0,
  },
  {
    id: "every_90_min",
    emoji: "🪑",
    title: "Stand · breathe · look out",
    whenLabel: "Every 90 minutes",
    defaultTime: "11:00",
    durationSec: 60,
    cue: "Whatever you're doing, pause.",
    instruction: "Stand up. Three breaths. Look out a window or at the farthest point in the room. Sit back.",
    closing: "Eyes rest, mind softens.",
    tag: "anytime",
    group: "work",
  },
  {
    id: "phone_unlock_pause",
    emoji: "📱",
    title: "One breath before unlocking",
    whenLabel: "Whenever you pick up the phone",
    defaultTime: "12:00",
    durationSec: 10,
    cue: "Phone in hand.",
    instruction: "One breath before unlocking. Ask: why am I opening this? Then unlock — or don't.",
    closing: "Conscious or not, choose.",
    tag: "anytime",
    group: "work",
  },
  {
    id: "meeting_listen",
    emoji: "🧑‍🤝‍🧑",
    title: "Listen to the first speaker",
    whenLabel: "Start of any meeting",
    defaultTime: "10:00",
    durationSec: 120,
    cue: "Call connects.",
    instruction: "Listen fully to the first person. No mental rehearsal of your reply. Just receive.",
    closing: "Now you can speak.",
    tag: "anytime",
    group: "work",
  },

  // ─── Talking / relating ──────────────────────────────────────────
  {
    id: "before_speaking",
    emoji: "🗣️",
    title: "1-sec pause before speaking",
    whenLabel: "Any conversation",
    defaultTime: "14:00",
    durationSec: 5,
    cue: "Mouth about to open.",
    instruction: "One second pause. Ask: is this true, kind, needed? Then speak — or stay quiet.",
    closing: "Words become offerings.",
    tag: "anytime",
    group: "relating",
  },
  {
    id: "deep_listening",
    emoji: "👂",
    title: "No reply-rehearsal",
    whenLabel: "When someone is speaking",
    defaultTime: "15:00",
    durationSec: 60,
    cue: "Mouth closed.",
    instruction: "While they speak — don't plan your reply. Just receive their words. Reply will come.",
    closing: "Listening is a gift.",
    tag: "anytime",
    group: "relating",
  },
  {
    id: "loved_one_arrives",
    emoji: "❤️",
    title: "Stop · look · breathe",
    whenLabel: "When someone you love walks in",
    defaultTime: "19:30",
    durationSec: 10,
    cue: "Door opens, presence enters.",
    instruction: "Stop what you're doing. Look at them. One breath. Then greet.",
    closing: "Welcome — fully.",
    tag: "evening",
    group: "relating",
  },
  {
    id: "mid_argument_breath",
    emoji: "😤",
    title: "Feet on ground · one breath",
    whenLabel: "Mid-argument",
    defaultTime: "18:00",
    durationSec: 15,
    cue: "Heat rises.",
    instruction: "Feel feet on the ground. One full breath. Then the next word — slower, softer.",
    closing: "Heat doesn't have to lead.",
    tag: "anytime",
    group: "relating",
  },

  // ─── Transitions ─────────────────────────────────────────────────
  {
    id: "walking_feet",
    emoji: "🚶",
    title: "Every tenth step",
    whenLabel: "While walking",
    defaultTime: "17:30",
    durationSec: 120,
    cue: "Feet, ground, weight.",
    instruction: "Every tenth step, fully feel the foot meet the ground. Other nine are free. Two minutes.",
    closing: "Walking, you arrived.",
    tag: "anytime",
    group: "transitions",
  },
  {
    id: "commute_faces",
    emoji: "🚇",
    title: "Five faces, no judgment",
    whenLabel: "Commute or transit",
    defaultTime: "09:00",
    durationSec: 180,
    cue: "Among strangers.",
    instruction: "Notice five faces. For each, silently offer: 'May you be at ease.' That's it.",
    closing: "Carry the softness forward.",
    tag: "morning",
    group: "transitions",
  },
  {
    id: "evening_arrival",
    emoji: "🚪",
    title: "Threshold breath",
    whenLabel: "Crossing your door",
    defaultTime: "19:00",
    durationSec: 30,
    cue: "Hand on the door.",
    instruction: "Pause one breath at the threshold. Let the day stay outside. Enter as if returning to yourself.",
    closing: "You are home now.",
    tag: "evening",
    group: "transitions",
  },

  // ─── Evening bookend ─────────────────────────────────────────────
  {
    id: "sunset_witness",
    emoji: "🌆",
    title: "30 sec with the changing light",
    whenLabel: "Around sunset",
    defaultTime: "18:30",
    durationSec: 30,
    cue: "Step outside or to a window.",
    instruction: "Thirty seconds. Notice how the light is shifting. Nothing to do.",
    closing: "Light teaches letting go.",
    tag: "evening",
    group: "evening",
  },
  {
    id: "evening_wash",
    emoji: "🛁",
    title: "Wash off the day",
    whenLabel: "Evening shower or face-wash",
    defaultTime: "21:30",
    durationSec: 90,
    cue: "Water, skin, breath.",
    instruction: "Imagine the day's residue rinsing off — meetings, words, hurry. Just water, skin, now.",
    closing: "Clean. Soft. Here.",
    tag: "night",
    group: "evening",
  },
  {
    id: "bedtime_gift",
    emoji: "🌙",
    title: "One gift before sleep",
    whenLabel: "Lying in bed",
    defaultTime: "22:30",
    durationSec: 60,
    cue: "Pillow, breath, dark.",
    instruction: "Three slow breaths. Name one gift today held — however small. Release the day completely.",
    closing: "Sleep well.",
    tag: "night",
    group: "evening",
    anchor: "sleep",
    anchorOffsetMin: -15,
  },
  {
    id: "lights_out_scan",
    emoji: "🛏️",
    title: "Toes-to-crown scan",
    whenLabel: "Lights out",
    defaultTime: "23:00",
    durationSec: 180,
    cue: "Lying flat.",
    instruction: "Sweep awareness slowly from toes to crown. Soften every place it lands.",
    closing: "Let consciousness fall asleep too.",
    tag: "night",
    group: "evening",
    anchor: "sleep",
    anchorOffsetMin: 0,
  },
];

export function getRitualById(id: string): OffAppRitual | undefined {
  return OFF_APP_RITUALS.find((r) => r.id === id);
}

export function getRitualsByGroup(g: OffAppGroup): OffAppRitual[] {
  return OFF_APP_RITUALS.filter((r) => r.group === g);
}
