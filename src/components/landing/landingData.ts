import templeSunriseAsset from "@/assets/videos/hero-temple-sunrise.mp4.asset.json";
import mandalaWeaveAsset from "@/assets/videos/hero-mandala-weave.mp4.asset.json";
import lotusBloomAsset from "@/assets/videos/hero-lotus-bloom.mp4.asset.json";
import waterReflectionAsset from "@/assets/videos/hero-water-reflection.mp4.asset.json";
import forestAwakeningAsset from "@/assets/videos/hero-forest-awakening.mp4.asset.json";
import neuralLightAsset from "@/assets/videos/hero-neural-light.mp4.asset.json";
import zenAsset from "@/assets/videos/hero-meditate-zen.mp4.asset.json";
import gangesAsset from "@/assets/videos/hero-meditate-ganges.mp4.asset.json";
import himalayaAsset from "@/assets/videos/hero-meditate-himalaya.mp4.asset.json";
import rooftopAsset from "@/assets/videos/hero-meditate-rooftop.mp4.asset.json";
import sageAsset from "@/assets/videos/hero-meditate-sage.mp4.asset.json";
import youngWomanAsset from "@/assets/videos/hero-meditate-woman-young.mp4.asset.json";
import { publicImageUrl } from "@/lib/media/publicAssets";

export interface HeroFilm {
  id: string;
  title: string;
  videoUrl: string;
}

/**
 * The hero is a held breath, not a reel — but the footage has to be the real
 * thing: people meditating, temples at sunrise, water, mandalas. These rotate
 * behind the headline, one clip at a time, and cross-fade into each other.
 */
export const HERO_FILM_SEQUENCE: HeroFilm[] = [
  { id: "temple-sunrise", title: "The Temple at Sunrise", videoUrl: templeSunriseAsset.url },
  { id: "zen", title: "The Zen Circle", videoUrl: zenAsset.url },
  { id: "ganges", title: "The Ganges", videoUrl: gangesAsset.url },
  { id: "mandala", title: "The Mandala", videoUrl: mandalaWeaveAsset.url },
  { id: "himalaya", title: "The Himalaya", videoUrl: himalayaAsset.url },
  { id: "lotus", title: "The Lotus", videoUrl: lotusBloomAsset.url },
  { id: "rooftop", title: "The Rooftop", videoUrl: rooftopAsset.url },
  { id: "water", title: "Still Water", videoUrl: waterReflectionAsset.url },
  { id: "sage", title: "The Sage", videoUrl: sageAsset.url },
  { id: "return", title: "The Return", videoUrl: youngWomanAsset.url },
  { id: "forest", title: "The Forest Wakes", videoUrl: forestAwakeningAsset.url },
  { id: "neural", title: "Neural Light", videoUrl: neuralLightAsset.url },
];

/**
 * Asset map + editorial content for the ConsciousOS landing page.
 *
 * Two asset folders are used deliberately:
 *   1. public/stitch_consciousos_cinematic_experience/<n>.png/screen.png
 *      — the seventeen iOS screens of the app itself.
 *   2. public/stitch_consciousos_cinematic_experience/
 *      stitch_consciousos_cinematic_experience (2)/stitch_consciousos_cinematic_experience/
 *      — the thirteen high-resolution cinematic system panels.
 */

const STITCH_ROOT = "/stitch_consciousos_cinematic_experience";
const HI_ROOT = `${STITCH_ROOT}/stitch_consciousos_cinematic_experience%20(2)/stitch_consciousos_cinematic_experience`;

// The landing panels are ~22 MB of PNG in public/. They are served from the
// Supabase CDN and pulled through the WebP transform, which cuts them to
// roughly a third of their size without changing their displayed size.
export const appScreen = (n: number) => publicImageUrl(`${STITCH_ROOT}/${n}.png/screen.png`);
export const cinematicPanel = (dir: string) => publicImageUrl(`${HI_ROOT}/${dir}/screen.png`);

export const TEMPLE_ORB = publicImageUrl(`${STITCH_ROOT}/image.png`);

export const CINEMATIC_DIRS = {
  journey: "consciousos_a_cinematic_journey_within.png",
  master: "high_resolution_cinematic_asset_from_consciousos_section_consciousos_the",
  model: "high_resolution_cinematic_asset_from_consciousos_section_1._the_consciousness",
  dna: "high_resolution_cinematic_asset_from_consciousos_section_2._spiritual_dna_life",
  engine: "high_resolution_cinematic_asset_from_consciousos_section_3._the_consciousness",
  session: "high_resolution_cinematic_asset_from_consciousos_section_6._the_session_system",
  cinematic: "high_resolution_cinematic_asset_from_consciousos_section_8._cinematic",
  themes: "high_resolution_cinematic_asset_from_consciousos_section_10._themes_loop",
  libraries: "high_resolution_cinematic_asset_from_consciousos_section_13._content_libraries",
  experience: "high_resolution_cinematic_asset_from_consciousos_section_cinematic_experience",
  home: "high_resolution_cinematic_asset_from_consciousos_section_home_your_daily",
  games: "high_resolution_cinematic_asset_from_consciousos_section_games_tools_build_your",
  practices: "high_resolution_cinematic_asset_from_consciousos_section_interactive_practices",
} as const;

export interface CinematicPanel {
  src: string;
  index: string;
  title: string;
  caption: string;
  wide?: boolean;
}

export const CINEMATIC_PANELS: CinematicPanel[] = [
  {
    src: cinematicPanel(CINEMATIC_DIRS.journey),
    index: "00",
    title: "A Cinematic Journey Within",
    caption:
      "Fourteen sections, one continuous system. This is the whole map at once: the model, the engines, the session architecture, the memory, the libraries — every layer feeding the next.",
    wide: true,
  },
  {
    src: cinematicPanel(CINEMATIC_DIRS.master),
    index: "—",
    title: "ConsciousOS",
    caption:
      "The machine in a single frame. What you are, how it adapts, what you practice, and what you finally see.",
  },
  {
    src: cinematicPanel(CINEMATIC_DIRS.model),
    index: "01",
    title: "The Consciousness Model",
    caption:
      "Eleven bands from asleep to absolute. Thirty-three micro-levels inside every band. Six dimensions that make a person whole. One number that holds them together — and refuses to flatter you.",
  },
  {
    src: cinematicPanel(CINEMATIC_DIRS.dna),
    index: "02",
    title: "Spiritual DNA & Life Stage",
    caption:
      "A profile computed from assessment and behaviour: band, dominance, archetype, confidence in each trait. Life stage and the six life domains are tracked separately from consciousness itself.",
  },
  {
    src: cinematicPanel(CINEMATIC_DIRS.engine),
    index: "03",
    title: "The Consciousness Engine",
    caption:
      "One server-authoritative engine computes your level, dimension caps, chakras, archetype, state, bypassing risk, integration score, time decay and circadian profile. A client twin gives instant offline approximations. The server is always the truth.",
  },
  {
    src: cinematicPanel(CINEMATIC_DIRS.session),
    index: "06",
    title: "The Session System",
    caption:
      "Four generations of session share one vocabulary: orb heuristics, streaming chat, AI-composed step plans, and fully cinematic guided practice. Text, generative or narrated — depending on the moment.",
  },
  {
    src: cinematicPanel(CINEMATIC_DIRS.cinematic),
    index: "08",
    title: "Cinematic Environments",
    caption:
      "Practices that arrive as places, not screens. The field, the sanctuary, the threshold — each with its own light, its own pace, its own silence.",
  },
  {
    src: cinematicPanel(CINEMATIC_DIRS.practices),
    index: "—",
    title: "Interactive Practices",
    caption:
      "Do, don't just learn. Breath, body, and journal — each practice a real surface a person actually touches.",
  },
  {
    src: cinematicPanel(CINEMATIC_DIRS.home),
    index: "—",
    title: "Home — Your Daily Portal",
    caption:
      "One screen for the whole day: the live field, today's agenda, the hidden edge you are not looking at, and the path ahead.",
  },
  {
    src: cinematicPanel(CINEMATIC_DIRS.games),
    index: "—",
    title: "Games & Tools — Build Your Practice",
    caption:
      "The parts of the system a person builds for themselves: practices, tools, and small instruments of attention.",
  },
  {
    src: cinematicPanel(CINEMATIC_DIRS.themes),
    index: "10",
    title: "Themes & Loop Detector",
    caption:
      "Themes evolve across multi-day arcs with lunar and seasonal colouring. Loops are caught on-device first, escalated to the model only when ambiguous, and mined across work, body and device signals on a schedule.",
  },
  {
    src: cinematicPanel(CINEMATIC_DIRS.libraries),
    index: "13",
    title: "Content Libraries",
    caption:
      "Practices, masters and scripts — the raw material the engine draws from, scored and re-ranked against your live state every single time.",
  },
  {
    src: cinematicPanel(CINEMATIC_DIRS.experience),
    index: "—",
    title: "The Cinematic Experience",
    caption:
      "The whole surface of the product, rendered as one continuous world rather than a folder of screens.",
  },
];

export interface AppScreenCard {
  n: number;
  title: string;
  caption: string;
}

export const APP_SCREENS: AppScreenCard[] = [
  { n: 3, title: "The Manifesto", caption: "A quiet installation. What you are about to open, in plain words." },
  { n: 4, title: "Not Another Habit Tracker", caption: "The refusal: no streaks, no scores, no one to beat." },
  { n: 5, title: "What Happens Next", caption: "Eleven sittings to first change, explained before you begin." },
  { n: 6, title: "The Light Six — Reflex", caption: "What returns you to yourself, found by asking rather than guessing." },
  { n: 7, title: "The Light Six — Fuel", caption: "The practice that restores you, chosen by you and remembered." },
  { n: 8, title: "Six Light Answers", caption: "Your answers become the first map of the system." },
  { n: 9, title: "First Meeting", caption: "Seven questions. One honest hour." },
  { n: 10, title: "Pattern Mining", caption: "The engine looks for what you keep repeating." },
  { n: 11, title: "Awakening Journey", caption: "The long arc opens: a spiral, never a ladder." },
  { n: 12, title: "Night Sanctuary", caption: "The live plasma orb — the field, breathing with your day." },
  { n: 14, title: "Practice", caption: "Finding your solid starting point, in one deliberate step." },
  { n: 15, title: "The Golden Field", caption: "The orb at rest. Your agenda waiting behind it." },
  { n: 16, title: "Today's Agenda", caption: "The hidden edge, the path, and what the day asks of you." },
  { n: 17, title: "Night Threshold", caption: "Reading your own thread before the gate opens." },
  { n: 18, title: "Loving Kindness", caption: "Twenty-five minutes at Threshold I." },
  { n: 19, title: "Threshold II", caption: "Sealing the reflection, with the guide alongside." },
  { n: 20, title: "Crossing", caption: "The safety affirmation, before you step through." },
];

export interface LandingStat {
  value: string;
  label: string;
  note: string;
}

export const MODEL_STATS: LandingStat[] = [
  { value: "11", label: "Bands", note: "One continuous number from asleep to absolute. Only the human journey is coached; the rest is recognised, never claimed." },
  { value: "33", label: "Micro-levels", note: "Entering, Deepening, Mastery inside every band. More hand-holding at first; you lead once it is earned." },
  { value: "6", label: "Dimensions", note: "Thought, Emotion, Body, Action, Connection, Spirit — with 96 finer threads giving the picture its texture." },
  { value: "1", label: "V-Level", note: "One number, and it will not flatter you. Imbalance and running loops pull it down on purpose." },
];

export const LAYERS = [
  {
    index: "01",
    title: "The Consciousness Model",
    text: "What you are, described without flattery: bands, micro-levels, dimensions, chakras, archetype, state, and a spiritual DNA assembled from assessment and behaviour.",
  },
  {
    index: "02",
    title: "The Engine Layer",
    text: "How it adapts. One server-authoritative engine reads your live state and recomputes the level, the caps, the risks, and the directives on every single turn.",
  },
  {
    index: "03",
    title: "The Content Layer",
    text: "What you practice. Eighty-nine masters, practices, scripts and tools, scored and re-ranked against you every time — so the same library never feels the same twice.",
  },
  {
    index: "04",
    title: "The Interface Layer",
    text: "What you see. Chat, generative session, cinematic run, orb heuristic — four surfaces, one vocabulary, chosen by the moment rather than by a menu.",
  },
];

export const ABSENCES = [
  {
    title: "No shame",
    text: "Levels can fall without penalty. Prior effort is always credited. Returning takes fewer sittings than climbing did.",
  },
  {
    title: "No comparison",
    text: "You are never behind another person. There is no leaderboard because there is no race to be in.",
  },
  {
    title: "No race",
    text: "Staying at a level is not failure — it is depth being earned. Promotion weighs quality, not attendance.",
  },
];

export const SESSION_FLOW = [
  { title: "Teaching", share: "30%", text: "The guide introduces today's theme — pointed, never a lecture." },
  { title: "Practice", share: "50%", text: "An interactive practice chosen by the engine. Always doing, never passive." },
  { title: "Reflection", share: "20%", text: "Chat, a journal prompt, and a presence self-rating." },
  { title: "Integration", share: "—", text: "An action item, a micro-practice, a preview of what is next. Karma awarded for the loop closing." },
];

export const GATES = [
  { title: "Morning", text: "Intention. The day is named before it is spent." },
  { title: "Midday", text: "Awareness in action. The practice happens inside the ordinary." },
  { title: "Evening", text: "Integration. What was learned is carried back into the record." },
  { title: "Night", text: "Rest. The thread is read, and the field is allowed to settle." },
];

export const ENGINEERING = [
  { label: "102", text: "Edge functions" },
  { label: "173", text: "Database migrations" },
  { label: "4", text: "Daily gates" },
  { label: "RLS", text: "Row-level security" },
  { label: "pgvector", text: "Semantic memory" },
  { label: "Realtime", text: "Live field channels" },
];

export interface JourneyStep {
  title: string;
  detail: string;
}

export const TWENTY_STEPS: JourneyStep[] = [
  { title: "Understand the four layers that hold your inner life.", detail: "Model, engines, content, interface. Nothing in the product exists without a reason in this stack." },
  { title: "See the eleven bands you move through.", detail: "One continuous scale, from the Sleeper fused with thought to transpersonal states." },
  { title: "Feel the thirty-three micro-levels inside each band.", detail: "Entering, Deepening, Mastery — the system matches its grip to your actual depth." },
  { title: "Meet the six dimensions that make you whole.", detail: "Thought, Emotion, Body, Action, Connection, Spirit." },
  { title: "Hold your growth in one V-Level number.", detail: "A single number that refuses to let a neglected dimension hide behind a brilliant mind." },
  { title: "Learn why progress here is earned, not jumped.", detail: "Thirty days of calibration, a day-ramp per dimension, and a gentle ease-back after time away." },
  { title: "Discover your own speed profile and its protection.", detail: "Fast Tracker, Steady Walker, Deep Digger — classified by how you actually practise." },
  { title: "Understand how level-ups respect quality.", detail: "Recent quality, consistency and work at the level — not attendance." },
  { title: "See how bypassing is caught in the math.", detail: "When skill outruns lived state, grounding is assigned automatically. The rule lives in the score, not in the copy." },
  { title: "Release guilt, comparison and the race.", detail: "The spiral is literal: returning to the same place means you are deeper, not stuck." },
  { title: "Trust the hidden stages guiding the AI.", detail: "Eight internal stages from Unaware to Turiya decide how much the guide speaks, and in what vocabulary." },
  { title: "Read your chakras, archetype and current state.", detail: "Normal, breakthrough, plateau, bypassing, dark night — every state shapes the recommendation." },
  { title: "Meet your spiritual DNA, kundli and life stage.", detail: "A computed profile that colours the content you receive, with six life domains tracked separately." },
  { title: "Let the consciousness engine be the source of truth.", detail: "The client gives instant approximations. The server decides." },
  { title: "Let the practice engine choose your next step.", detail: "Weighted rules: weakest dimension, active loops, life-domain stress, plateau recovery, cross-pollination." },
  { title: "Feel the adaptive engine meet you each turn.", detail: "Energy, emotion, clarity and resistance are read on every message. Crisis is checked first." },
  { title: "Move through four generations of session.", detail: "Orb heuristics, streaming chat, AI-composed steps and cinematic practice share one vocabulary." },
  { title: "Receive a session composed just for this moment.", detail: "Gate, energy, gap days and band choose the shape. Inner voices speak one sentence each; a synthesizer picks the lead." },
  { title: "Be remembered across days and breakthroughs.", detail: "Five memory tiers, embeddings, daily synthesis into three sentences, and sacred moments kept as a highlight reel." },
  { title: "Close the loop: themes, loops and nudges shape tomorrow.", detail: "Dosed, never dumped. Everything you do today becomes tomorrow's picture of you." },
];

export const ETHICS = [
  {
    title: "Your attention is not inventory",
    text: "Nothing here is sold, brokered or advertised against you. There is no attention economy inside a system that is meant to reduce the noise.",
  },
  {
    title: "No streak, no scoreboard, no other person",
    text: "The system compares you against your own history and nothing else. There is no other user's number anywhere in the product.",
  },
  {
    title: "The engine is allowed to disagree with you",
    text: "Bypassing, imbalance and a running loop are all recorded. The product will slow you down if that is the honest answer.",
  },
  {
    title: "Consent before signals",
    text: "Device, work and body signals are opt-in, scoped, and revocable. Nothing is mined that you did not hand over on purpose.",
  },
];
