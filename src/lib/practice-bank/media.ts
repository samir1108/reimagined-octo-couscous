/**
 * Media layers for an orb practice.
 *
 * The orb is the hero, but a sitting can also have a body underneath it:
 * a muted film loop, a generative sound world, and haptic bells. These are
 * mappings, not components, so the same practice can be rendered in the app,
 * in a full-screen session, or in a future native shell.
 */
import type { WorldId } from "@/lib/bience/model";
import { publicAssetUrl } from "@/lib/media/publicAssets";
import type { OrbPractice } from "./script";

import ambientSky from "@/assets/sensorial/krishnamurti/ambient-sky.mp4.asset.json";
import ambientEmbers from "@/assets/sensorial/osho/ambient-embers.mp4.asset.json";
import ambientFlame from "@/assets/sensorial/ramana/ambient-flame.mp4.asset.json";
import ambientBodhi from "@/assets/sensorial/buddha/ambient-bodhi.mp4.asset.json";
import ambientCosmic from "@/assets/sensorial/sadhguru/ambient-cosmic.mp4.asset.json";
import ambientSpiritualEye from "@/assets/sensorial/yogananda/ambient-spiritual-eye.mp4.asset.json";
import bodyScanLight from "@/assets/practices/body-scan-light.mp4.asset.json";
import coherentBreathOcean from "@/assets/practices/coherent-breath-ocean.mp4.asset.json";
import selfInquirySource from "@/assets/practices/self-inquiry-source.mp4.asset.json";
import witnessLake from "@/assets/practices/witness-lake.mp4.asset.json";
import yogaNidraCosmos from "@/assets/practices/yoga-nidra-cosmos.mp4.asset.json";
import silentMountain from "@/assets/games/videos/silent-mountain.mp4.asset.json";
import heroCliffDawn from "@/assets/videos/hero-cliff-dawn.mp4.asset.json";
import heroMeditateGanges from "@/assets/videos/hero-meditate-ganges.mp4.asset.json";
import heroWaterReflection from "@/assets/videos/hero-water-reflection.mp4.asset.json";
import heroForestAwakening from "@/assets/videos/hero-forest-awakening.mp4.asset.json";

export interface PracticeMediaLayer {
  url: string;
  label: string;
}

const WORLD_FILM: Record<WorldId, PracticeMediaLayer> = {
  "monsoon-terrace": { url: ambientSky.url, label: "Monsoon sky" },
  "first-light": { url: heroCliffDawn.url, label: "Cliff dawn" },
  hearth: { url: ambientEmbers.url, label: "Hearth embers" },
  "nilgiri-night": { url: heroForestAwakening.url, label: "Night forest" },
  "vipassana-hall": { url: silentMountain.url, label: "Silent mountain" },
  "cosmic-void": { url: ambientCosmic.url, label: "Cosmic field" },
  backwaters: { url: coherentBreathOcean.url, label: "Still water" },
  "kashi-dawn": { url: heroMeditateGanges.url, label: "Ganges dawn" },
};

const MODE_FILM: Partial<Record<OrbPractice["spec"]["modeId"], PracticeMediaLayer>> = {
  breath: { url: coherentBreathOcean.url, label: "Ocean breath" },
  body: { url: bodyScanLight.url, label: "Body scan" },
  "open-eyes": { url: heroWaterReflection.url, label: "Water reflection" },
  inquiry: { url: selfInquirySource.url, label: "Source inquiry" },
};

/** Extra material for practices that already have a fitting film. */
const CATEGORY_FILM: Array<{ match: RegExp; layer: PracticeMediaLayer }> = [
  { match: /self_inquiry|witnessing/, layer: { url: selfInquirySource.url, label: "Source inquiry" } },
  { match: /body_sensory/, layer: { url: bodyScanLight.url, label: "Body scan" } },
  { match: /breath/, layer: { url: coherentBreathOcean.url, label: "Ocean breath" } },
  { match: /sleep_unwinding/, layer: { url: yogaNidraCosmos.url, label: "Yoga nidra cosmos" } },
  { match: /mindfulness|attention/, layer: { url: witnessLake.url, label: "Witness lake" } },
  { match: /compassion|devotion/, layer: { url: ambientSpiritualEye.url, label: "Spiritual eye" } },
  { match: /yoga_inspired/, layer: { url: ambientBodhi.url, label: "Bodhi grove" } },
  { match: /values|purpose|behavioral/, layer: { url: ambientFlame.url, label: "Flame" } },
];

const FALLBACK: PracticeMediaLayer = {
  url: publicAssetUrl("/orb.mp4"),
  label: "Orb field",
};

/**
 * Film loop selection: delivery mode wins (a body scan should look like a body
 * scan), then the authored category, then the bience world, then the orb film.
 */
export function videoForPractice(practice: OrbPractice): PracticeMediaLayer {
  const mode = MODE_FILM[practice.spec.modeId];
  if (mode) return mode;

  const category = String(practice.atom.category);
  const matched = CATEGORY_FILM.find((entry) => entry.match.test(category));
  if (matched) return matched.layer;

  return WORLD_FILM[practice.spec.worldId] ?? FALLBACK;
}

/** `SessionFilmBackdrop` accepts an optional poster; these are large posters. */
export function posterForPractice(): string | undefined {
  return undefined;
}
