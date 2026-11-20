import { useEffect, useState } from "react";

export interface CircadianPalette {
  deep: string;
  mid: string;
  coreA: string;
  coreB: string;
  rim: string;
}

export interface CircadianPhase {
  name: string;
  note: string;
}

export interface CircadianState {
  palette: CircadianPalette;
  phase: CircadianPhase;
  clock: string;
  /** Position in the local day: 0 is midnight, 0.5 is noon. */
  dayPhase: number;
}

interface Keyframe {
  hour: number;
  name: string;
  note: string;
  palette: CircadianPalette;
}

/**
 * The field changes with the day. Every keyframe is a real hour of the
 * local clock, so the orb a person sees at 06:40 is the dawn orb and the
 * one at 22:10 is the night orb. Colours are interpolated continuously
 * between keyframes, so the transition is never a hard cut.
 */
const KEYFRAMES: Keyframe[] = [
  {
    hour: 0,
    name: "Night",
    note: "The quiet hour. Only the thread remembers.",
    palette: { deep: "#080a1a", mid: "#1b2148", coreA: "#5a67b8", coreB: "#8d94e0", rim: "#a9aef2" },
  },
  {
    hour: 4.5,
    name: "Deep Night",
    note: "Stillness before the turning.",
    palette: { deep: "#070916", mid: "#171c3e", coreA: "#4e5aa8", coreB: "#8289d4", rim: "#a0a6ea" },
  },
  {
    hour: 6.5,
    name: "Dawn",
    note: "First light. The system wakes gently.",
    palette: { deep: "#150c18", mid: "#3a1f33", coreA: "#b06a72", coreB: "#e0937f", rim: "#f3b49a" },
  },
  {
    hour: 8.5,
    name: "Morning",
    note: "Warmth and clear direction.",
    palette: { deep: "#1a1109", mid: "#422c1a", coreA: "#d9984a", coreB: "#f0bc72", rim: "#ffd99c" },
  },
  {
    hour: 12,
    name: "Midday",
    note: "Full light. The clearest hour.",
    palette: { deep: "#151208", mid: "#3a3220", coreA: "#eec070", coreB: "#ffe0a8", rim: "#fff3d4" },
  },
  {
    hour: 15.5,
    name: "Afternoon",
    note: "Heat and long attention.",
    palette: { deep: "#170f08", mid: "#3c2814", coreA: "#dc9a45", coreB: "#f0bc6a", rim: "#ffd89a" },
  },
  {
    hour: 18.5,
    name: "Dusk",
    note: "The ember. Long shadows.",
    palette: { deep: "#140a16", mid: "#361c30", coreA: "#b05f80", coreB: "#d98aa0", rim: "#f0a8b8" },
  },
  {
    hour: 20.5,
    name: "Evening",
    note: "The candle hour. Descend slowly.",
    palette: { deep: "#0b0918", mid: "#1e1a3c", coreA: "#6365b5", coreB: "#8d80d6", rim: "#b0a4ec" },
  },
  {
    hour: 22.5,
    name: "Night",
    note: "Back to the quiet hour.",
    palette: { deep: "#080a1a", mid: "#1b2148", coreA: "#5a67b8", coreB: "#8d94e0", rim: "#a9aef2" },
  },
  {
    hour: 24,
    name: "Night",
    note: "Back to the quiet hour.",
    palette: { deep: "#080a1a", mid: "#1b2148", coreA: "#5a67b8", coreB: "#8d94e0", rim: "#a9aef2" },
  },
];

/** deep, mid, coreA, coreB, rim — three channels each. */
export const PALETTE_SLOTS = 5;

const hexToRgb = (hex: string): [number, number, number] => {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((char) => char + char)
          .join("")
      : value;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
};

const clampChannel = (value: number) => Math.min(255, Math.max(0, Math.round(value)));

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((channel) => clampChannel(channel).toString(16).padStart(2, "0")).join("")}`;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const mixHex = (from: string, to: string, t: number) => {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return rgbToHex(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t));
};

const mixPalette = (from: CircadianPalette, to: CircadianPalette, t: number): CircadianPalette => ({
  deep: mixHex(from.deep, to.deep, t),
  mid: mixHex(from.mid, to.mid, t),
  coreA: mixHex(from.coreA, to.coreA, t),
  coreB: mixHex(from.coreB, to.coreB, t),
  rim: mixHex(from.rim, to.rim, t),
});

/** The two keyframes that bracket `hours`, plus the raw position between them. */
const spanAt = (hours: number): [number, number, number] => {
  for (let index = 0; index < KEYFRAMES.length - 1; index += 1) {
    const current = KEYFRAMES[index];
    const next = KEYFRAMES[index + 1];
    if (hours >= current.hour && hours < next.hour) {
      const span = next.hour - current.hour;
      return [index, index + 1, span <= 0 ? 0 : (hours - current.hour) / span];
    }
  }
  return [0, KEYFRAMES.length - 1, 0];
};

/** The palette at a given hour of the local day, interpolated continuously. */
export const getCircadianPalette = (hours: number): CircadianPalette => {
  const [from, to, raw] = spanAt(hours);
  const eased = raw * raw * (3 - 2 * raw);
  return mixPalette(KEYFRAMES[from].palette, KEYFRAMES[to].palette, eased);
};

/** The name and note of the hour `hours` falls in. */
export const getCircadianPhase = (hours: number): CircadianPhase => {
  const [from] = spanAt(hours);
  return { name: KEYFRAMES[from].name, note: KEYFRAMES[from].note };
};

/**
 * `?hour=8` pins the field to a given hour of the day — useful for demos,
 * screenshots, and for looking at every sky the system can hold.
 */
export const readHourOverride = (): number | undefined => {
  if (typeof window === "undefined") return undefined;
  const raw = new URLSearchParams(window.location.search).get("hour");
  if (raw === null) return undefined;
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const getCircadianState = (date: Date, hourOverride?: number): CircadianState => {
  const clockHours = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  const hours =
    typeof hourOverride === "number" && Number.isFinite(hourOverride)
      ? Math.min(24, Math.max(0, hourOverride))
      : clockHours;

  return {
    palette: getCircadianPalette(hours),
    phase: getCircadianPhase(hours),
    dayPhase: hours / 24,
    clock:
      typeof hourOverride === "number" && Number.isFinite(hourOverride)
        ? `${String(Math.floor(hourOverride)).padStart(2, "0")}:00`
        : `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
  };
};

/** Live wall-clock state. Re-reads the local clock on a slow interval. */
export const useCircadian = (intervalMs = 20000): CircadianState => {
  const override = readHourOverride();
  const [state, setState] = useState<CircadianState>(() =>
    getCircadianState(new Date(), override),
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setState(getCircadianState(new Date(), readHourOverride()));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return state;
};

/**
 * The keyframes flattened for the GPU: every colour of every keyframe, three
 * channels each, in the order deep, mid, coreA, coreB, rim.
 */
const KEYFRAME_RGB = (() => {
  const data = new Float32Array(KEYFRAMES.length * PALETTE_SLOTS * 3);
  KEYFRAMES.forEach((keyframe, index) => {
    const colors = [
      keyframe.palette.deep,
      keyframe.palette.mid,
      keyframe.palette.coreA,
      keyframe.palette.coreB,
      keyframe.palette.rim,
    ];
    colors.forEach((hex, slot) => {
      const [r, g, b] = hexToRgb(hex);
      const offset = (index * PALETTE_SLOTS + slot) * 3;
      data[offset] = r / 255;
      data[offset + 1] = g / 255;
      data[offset + 2] = b / 255;
    });
  });
  return data;
})();

/**
 * Writes the palette at `hours` into `out` as fifteen floats — five colours,
 * three channels each — without allocating. The GPU orb samples this every
 * frame so the sky of the hour costs nothing on the CPU.
 */
export const sampleCircadianRgb = (hours: number, out: Float32Array): void => {
  const [from, to, raw] = spanAt(hours);
  const eased = raw * raw * (3 - 2 * raw);
  const a = from * PALETTE_SLOTS * 3;
  const b = to * PALETTE_SLOTS * 3;
  for (let index = 0; index < PALETTE_SLOTS * 3; index += 1) {
    out[index] = lerp(KEYFRAME_RGB[a + index], KEYFRAME_RGB[b + index], eased);
  }
};
