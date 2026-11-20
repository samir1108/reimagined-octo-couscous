export type OrbPalette = [string, string, string, string];

export const APP_GOLD_ORB_PALETTE: OrbPalette = ["#70400f", "#c98528", "#f4c45c", "#fff0bd"];

export const ORB_PALETTES: Record<string, OrbPalette> = {
  vaikuntha: APP_GOLD_ORB_PALETTE,
  calm: ["#6f63ff", "#45b4ff", "#b05cff", "#ff5ec4"],
  focus: ["#ff9d2e", "#ff5a3c", "#ffd27a", "#fff2cf"],
  heal: ["#22e6a0", "#18b4d0", "#7dff9b", "#e2ff72"],
  awaken: ["#ff3ea5", "#9150ff", "#3dd2ff", "#ffd166"],
  sleep: ["#3426b8", "#7b3fd6", "#2a62ff", "#b894ff"],
  aurora: ["#19e6c2", "#3aa0ff", "#8a63ff", "#ff7ad9"],
};

export const DEFAULT_ORB_PALETTE: OrbPalette = APP_GOLD_ORB_PALETTE;

/**
 * The orb used to reflect only the time of day. Its colour now tracks the
 * consciousness band, so the visual is a readout of progress rather than an
 * ambient timer.
 */
const BAND_PALETTES: OrbPalette[] = [
  ["#3b2f5c", "#6d5a8f", "#a48bb5", "#e6d9ee"],
  ["#4a3a6b", "#7c5f9e", "#b49ac8", "#f0e6f7"],
  ["#3d3f7a", "#5f74b8", "#8fa8dc", "#dfe8fb"],
  ["#2f5f74", "#4c93a8", "#7fd0d0", "#ddf6f4"],
  ["#2f7a5f", "#4cb08a", "#8fe0b8", "#e2fbec"],
  ["#7a6a2f", "#b8a24c", "#e0cf8f", "#fbf6e2"],
  ["#8a4a2f", "#c47a4c", "#e8b08f", "#fdeee2"],
  ["#7a2f5f", "#b84c93", "#e08fc8", "#fbe2f2"],
  ["#5f2f7a", "#934cb8", "#c88fe0", "#f2e2fb"],
  ["#2f3f7a", "#4c63b8", "#8f9fe0", "#e2e8fb"],
  ["#1f1f2f", "#3c3c5c", "#7d7da8", "#e8e8f4"],
];

export type OrbDimension = "thought" | "emotion" | "body" | "awareness";

const DIMENSION_ACCENT: Record<OrbDimension, string> = {
  thought: "#8fa8dc",
  emotion: "#e08fa8",
  body: "#e0b08f",
  awareness: "#b08fe0",
};

export function orbPaletteForBand(
  band: number,
  accent?: OrbDimension | null,
): OrbPalette {
  const safeBand = Number.isFinite(band) ? band : 0;
  const index = Math.max(0, Math.min(BAND_PALETTES.length - 1, Math.floor(safeBand)));
  const base = BAND_PALETTES[index];
  if (!accent) return base;
  return [base[0], base[1], DIMENSION_ACCENT[accent], base[3]];
}

export function orbPaletteForGate(_gate: "morning" | "midday" | "evening" | "night"): OrbPalette {
  return DEFAULT_ORB_PALETTE;
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const h = ((hue % 360) + 360) % 360 / 360;
  const s = Math.max(0, Math.min(100, saturation)) / 100;
  const l = Math.max(0, Math.min(100, lightness)) / 100;
  const a = s * Math.min(l, 1 - l);
  const channel = (n: number) => {
    const k = (n + h * 12) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

/**
 * Turns a single hue into a four-stop orb palette. Meditation and session
 * screens pass the hue of their current line/phase so the shared orb reads as
 * the same light as the field around it, instead of the fixed app gold.
 */
export function orbPaletteFromHue(hue: number): OrbPalette {
  const base = Number.isFinite(hue) ? hue : 38;
  return [
    hslToHex(base + 52, 70, 22),
    hslToHex(base + 28, 82, 44),
    hslToHex(base, 92, 62),
    hslToHex(base, 96, 84),
  ];
}

/** Seconds for one full hue revolution at `colorShift = 1`. */
export const ORB_HUE_CYCLE_SECONDS = 60;
