/**
 * Slot Design System — single source of truth for per-slot UI atmosphere.
 * Backend logic untouched. This file only describes how each rhythm LOOKS & FEELS.
 */
import type { TimeSlot } from "./timeSlots";

export interface SlotDesign {
  slot: TimeSlot;
  /** Short two-word room name */
  room: string;
  /** Poetic full title */
  title: string;
  /** Single-glyph rune (Devanagari / symbol) */
  rune: string;
  /** Lucide icon name as string (resolved by component) */
  icon: "sunrise" | "sun" | "sunset" | "moon";
  /** Sky background CSS variable */
  skyVar: string;
  /** HSL accent token (no hsl() wrapper) - CSS variable */
  accentVar: string;
  /** Accent hue value (0-360) for canvas gradients */
  accentHue: number;
  /** Greeting tone */
  greeting: string;
  /** One-line subtitle / invitation */
  invitation: string;
  /** Primary action label */
  primaryAction: string;
  /** Signature ritual name (slot's killer micro-feature) */
  signatureName: string;
  /** Signature ritual one-liner */
  signatureLine: string;
  /** Breath cycle for ambient pulse (seconds) */
  breathSeconds: number;
  /** AI tone hint */
  aiTone: "energizing" | "efficient" | "warm" | "whisper";
}

export const SLOT_DESIGN: Record<TimeSlot, SlotDesign> = {
  morning: {
    slot: "morning",
    room: "The Awakening",
    title: "Awakening Chamber",
    rune: "ॐ",
    icon: "sunrise",
    skyVar: "var(--slot-morning-sky)",
    accentVar: "var(--slot-morning-accent)",
    accentHue: 45,
    greeting: "The world is new again",
    invitation: "Set the tone before the noise begins.",
    primaryAction: "Begin Awakening",
    signatureName: "Sankalpa",
    signatureLine: "One word to carry through the day.",
    breathSeconds: 4,
    aiTone: "energizing",
  },
  midday: {
    slot: "midday",
    room: "The Pulse",
    title: "Midday Pulse",
    rune: "•",
    icon: "sun",
    skyVar: "var(--slot-midday-sky)",
    accentVar: "var(--slot-midday-accent)",
    accentHue: 200,
    greeting: "Pause. Just for a breath.",
    invitation: "Sixty seconds. That's all this asks.",
    primaryAction: "60-Second Reset",
    signatureName: "The Reset",
    signatureLine: "Hold to receive a one-minute audio reset.",
    breathSeconds: 5,
    aiTone: "efficient",
  },
  evening: {
    slot: "evening",
    room: "The Hall",
    title: "Integration Hall",
    rune: "द",
    icon: "sunset",
    skyVar: "var(--slot-evening-sky)",
    accentVar: "var(--slot-evening-accent)",
    accentHue: 280,
    greeting: "The day is settling",
    invitation: "Decompress, then look back gently.",
    primaryAction: "Begin Integration",
    signatureName: "Three Stones",
    signatureLine: "One heavy, one warm, one light. Drop them in.",
    breathSeconds: 6,
    aiTone: "warm",
  },
  night: {
    slot: "night",
    room: "The Sanctuary",
    title: "Surrender Sanctuary",
    rune: "श",
    icon: "moon",
    skyVar: "var(--slot-night-sky)",
    accentVar: "var(--slot-night-accent)",
    accentHue: 240,
    greeting: "Rest is sacred",
    invitation: "Let the day go. Nothing to achieve here.",
    primaryAction: "Enter Sanctuary",
    signatureName: "Empty Bowl",
    signatureLine: "A black screen. A single breath. As long as you need.",
    breathSeconds: 8,
    aiTone: "whisper",
  },
};

export const getSlotDesign = (slot: TimeSlot): SlotDesign => SLOT_DESIGN[slot];
