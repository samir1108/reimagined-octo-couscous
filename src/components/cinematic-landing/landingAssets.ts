/**
 * landingAssets — every image used by the cinematic landing page.
 *
 * SWAPPING IMAGES
 * ----------------
 * Each entry is a logical slot. To use a different visual, change the `src`
 * of that slot only. Three source styles are supported:
 *
 *   1. Repo asset   — import from "@/assets/..." (bundled + hashed by Vite).
 *   2. Public file  — "/landing/<file>" (anything inside `public/landing/`).
 *   3. CDN / stock  — any absolute https URL (Unsplash, Pexels, Cloudinary,
 *                     your own CDN). Add the image to `public/` only if you
 *      want it self-hosted; remote URLs work as-is.
 *
 * App screenshots currently live in `public/landing/app-screens/` and were
 * produced by `npm run capture`. Re-run that pipeline (or drop new PNGs in
 * that folder) to refresh them without touching code.
 */

import cosmicNebula from "@/assets/cosmic-nebula.jpg";
import cosmicVoid from "@/assets/cosmic-void.jpg";
import cosmicEye from "@/assets/cosmic-eye.jpg";
import cosmicMandala from "@/assets/cosmic-mandala.jpg";
import cosmicInitiation from "@/assets/cosmic-initiation.jpg";
import cosmicJourneyMap from "@/assets/cosmic-journey-map.jpg";
import cosmicMirror from "@/assets/cosmic-mirror.jpg";
import journeyAncientYogi from "@/assets/journey-ancient-yogi.jpg";
import journeyTransformation from "@/assets/journey-transformation.jpg";
import meditationObservation from "@/assets/meditation-observation.jpg";
import elderSitting from "@/assets/elder-sitting.png";
import vivekananda from "@/assets/gurus/vivekananda.jpg";
import vivekanandaBg from "@/assets/gurus/bg-vivekananda.jpg";

export interface LandingImageSlot {
  src: string;
  alt: string;
  /** Optional portrait capture used on narrow screens. */
  mobileSrc?: string;
  /** Optional attribution for stock/CDN imagery. */
  credit?: string;
  /** Position hint for object-cover crops. */
  position?: string;
}

/**
 * A landing video slot.
 *
 * Every clip lives in `public/landing/` so it can be swapped without a code
 * change:
 *
 *   /landing/hero/*.mp4    — horizontal cinematic plates (1920x1088 source)
 *   /landing/reel/*.mp4    — vertical brand film (1088x1920 source)
 *                            also shipped as .webm for smaller payloads
 *
 * `poster` points at a still from the codebase so the scene is legible
 * before the video loads and whenever motion is reduced.
 */
export interface LandingVideoSlot {
  sources: { src: string; type: string }[];
  poster: string;
  alt: string;
  position?: string;
}

const reel = (name: string) => [
  { src: `/landing/reel/${name}.webm`, type: "video/webm" },
  { src: `/landing/reel/${name}.mp4`, type: "video/mp4" },
];

const hero = (name: string) => [{ src: `/landing/hero/${name}.mp4`, type: "video/mp4" }];

export const landingVideos = {
  /* Act I — the human question */
  humanShadow: {
    sources: hero("hero-shadow-self"),
    poster: cosmicVoid,
    alt: "A figure alone in a vast, dark space",
    position: "center",
  } as LandingVideoSlot,
  humanReel: {
    sources: reel("clip-1-cosmic-open"),
    poster: cosmicVoid,
    alt: "A vertical brand film opening on a cosmic horizon",
    position: "center",
  } as LandingVideoSlot,

  /* Act II — meet yourself */
  innerReflection: {
    sources: hero("hero-water-reflection"),
    poster: journeyAncientYogi,
    alt: "A still surface reflecting a single seated figure",
    position: "center",
  } as LandingVideoSlot,
  innerReel: {
    sources: reel("clip-2-cultural-collapse"),
    poster: journeyAncientYogi,
    alt: "A vertical brand film of old structures giving way",
    position: "center",
  } as LandingVideoSlot,

  /* Act III — the product */
  productReveal: {
    sources: reel("clip-4-product-reveal"),
    poster: cosmicNebula,
    alt: "A vertical brand film revealing the product",
    position: "center",
  } as LandingVideoSlot,
  productCosmic: {
    sources: hero("hero-cosmic"),
    poster: cosmicNebula,
    alt: "A slow drift through a nebula field",
    position: "center",
  } as LandingVideoSlot,

  /* Act IV — six dimensions */
  dimensionMap: {
    sources: hero("hero-mandala-weave"),
    poster: journeyTransformation,
    alt: "Light weaving itself into a mandala of connected lines",
    position: "center",
  } as LandingVideoSlot,
  dimensionReel: {
    sources: reel("clip-3-pivot"),
    poster: journeyTransformation,
    alt: "A vertical brand film at the turn of the narrative",
    position: "center",
  } as LandingVideoSlot,

  /* Act V — the engine */
  engineSignal: {
    sources: hero("hero-neural-light"),
    poster: cosmicJourneyMap,
    alt: "Light travelling through a network of connected points",
    position: "center",
  } as LandingVideoSlot,

  /* Act VI — the session */
  sessionSage: {
    sources: hero("hero-meditate-sage"),
    poster: meditationObservation,
    alt: "A teacher seated in practice",
    position: "center",
  } as LandingVideoSlot,
  sessionReel: {
    sources: reel("clip-5-transformation"),
    poster: meditationObservation,
    alt: "A vertical brand film of inner transformation",
    position: "center",
  } as LandingVideoSlot,

  /* Act VII — the daily journey */
  dayDawn: {
    sources: hero("hero-cliff-dawn"),
    poster: cosmicMandala,
    alt: "Dawn breaking over a cliff edge",
    position: "center",
  } as LandingVideoSlot,

  /* Act IX — the inauguration */
  inauguration: {
    sources: hero("hero-temple-sunrise"),
    poster: vivekanandaBg,
    alt: "Golden light entering a monumental hall",
    position: "center",
  } as LandingVideoSlot,

  /* Act X — the journey begins */
  enterSignature: {
    sources: reel("clip-6-brand-signature"),
    poster: cosmicMirror,
    alt: "A vertical brand film closing on the ConsciousOS signature",
    position: "center",
  } as LandingVideoSlot,
} as const;

export const landingImages = {
  /* ── Act I: the human question ─────────────────────────────────────── */
  humanVoid: {
    src: cosmicVoid,
    alt: "A lone figure implied inside a vast, dark void",
    position: "center",
  } as LandingImageSlot,

  /* ── Act II: meet yourself ──────────────────────────────────────────── */
  innerSeated: {
    src: elderSitting,
    alt: "A seated figure in still meditation",
    position: "center 30%",
  } as LandingImageSlot,
  innerLayers: {
    src: journeyAncientYogi,
    alt: "A figure of light seated in a vast, dark space",
    position: "center",
  } as LandingImageSlot,

  /* ── Act III: the product ───────────────────────────────────────────── */
  productNebula: {
    src: cosmicNebula,
    alt: "A nebula field standing in for the living pattern map",
    position: "center",
  } as LandingImageSlot,
  /** Faithful recreation of Home is rendered in DOM; this slot is optional. */
  homeScreenshot: {
    src: "/landing/app-screens/home.png",
    alt: "ConsciousOS Home screen",
    position: "top center",
  } as LandingImageSlot,

  /* ── Act IV: six dimensions ─────────────────────────────────────────── */
  dimensionFigure: {
    src: journeyTransformation,
    alt: "A human form opening into layers of light",
    position: "center",
  } as LandingImageSlot,

  /* ── Act V: the engine ──────────────────────────────────────────────── */
  engineMap: {
    src: cosmicJourneyMap,
    alt: "A constellation of connected points forming a living map",
    position: "center",
  } as LandingImageSlot,

  /* ── Act VI: the session ────────────────────────────────────────────── */
  sessionObservation: {
    src: meditationObservation,
    alt: "Observation of the observing mind",
    position: "center",
  } as LandingImageSlot,
  sessionOrb: {
    src: cosmicEye,
    alt: "An eye of light witnessing the inner field",
    position: "center",
  } as LandingImageSlot,

  /* ── Act VII: the daily journey ─────────────────────────────────────── */
  dayNight: {
    src: cosmicMandala,
    alt: "A mandala turning through the hours of a day",
    position: "center",
  } as LandingImageSlot,

  /* ── Act VIII: the real app ─────────────────────────────────────────── */
  appExperience: {
    src: "/landing/app-screens/experience.png",
    mobileSrc: "/app-captures/01-experience-mobile.png",
    alt: "ConsciousOS Experience screen",
  } as LandingImageSlot,
  appLoopsAtlas: {
    src: "/landing/app-screens/loops-atlas.png",
    mobileSrc: "/app-captures/02-loops-atlas-mobile.png",
    alt: "ConsciousOS Loops Atlas",
  } as LandingImageSlot,
  appLoops: {
    src: "/landing/app-screens/loops.png",
    mobileSrc: "/app-captures/03-loops-mobile.png",
    alt: "ConsciousOS Loops screen",
  } as LandingImageSlot,
  appKnowledge: {
    src: "/landing/app-screens/knowledge.png",
    mobileSrc: "/app-captures/04-knowledge-mobile.png",
    alt: "ConsciousOS Knowledge library",
  } as LandingImageSlot,
  appHandbook: {
    src: "/landing/app-screens/handbook.png",
    mobileSrc: "/app-captures/05-handbook-mobile.png",
    alt: "ConsciousOS Handbook",
  } as LandingImageSlot,
  appIntro: {
    src: "/landing/app-screens/app-intro.png",
    mobileSrc: "/app-captures/06-app-intro-mobile.png",
    alt: "ConsciousOS app introduction",
  } as LandingImageSlot,
  appHomeSlot: {
    src: "/landing/app-screens/home.png",
    alt: "ConsciousOS Home screen — add a capture at this path",
  } as LandingImageSlot,
  appOrbSlot: {
    src: "/landing/app-screens/orb-session.png",
    alt: "ConsciousOS orb session — add a capture at this path",
  } as LandingImageSlot,
  appMapSlot: {
    src: "/landing/app-screens/consciousness-map.png",
    alt: "ConsciousOS consciousness map — add a capture at this path",
  } as LandingImageSlot,
  appJourneySlot: {
    src: "/landing/app-screens/journey.png",
    alt: "ConsciousOS journey — add a capture at this path",
  } as LandingImageSlot,
  appProfileSlot: {
    src: "/landing/app-screens/profile.png",
    alt: "ConsciousOS profile — add a capture at this path",
  } as LandingImageSlot,

  /* ── Act IX: the inauguration ───────────────────────────────────────── */
  inauguration: {
    src: cosmicInitiation,
    alt: "Golden light entering a monumental hall",
    position: "center",
  } as LandingImageSlot,
  sage: {
    src: vivekananda,
    alt: "Artistic depiction in the visual language of a classical sage",
    position: "center 20%",
  } as LandingImageSlot,
  sageHall: {
    src: vivekanandaBg,
    alt: "A monumental hall lit by golden light",
    position: "center",
  } as LandingImageSlot,
  mirror: {
    src: cosmicMirror,
    alt: "A mirror-like field of light",
    position: "center",
  } as LandingImageSlot,
} as const;

export type LandingImages = typeof landingImages;
