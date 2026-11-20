import { Briefcase, Flame, Palette, Moon, type LucideIcon } from "lucide-react";
import worldCorporate from "@/assets/showroom/world-corporate.jpg";
import worldSeeker from "@/assets/showroom/world-seeker.jpg";
import worldCreator from "@/assets/showroom/world-creator.jpg";
import worldAnxious from "@/assets/showroom/world-anxious.jpg";

export type WorldId = "corporate" | "seeker" | "creator" | "anxious";

export interface Program { title: string; duration: string; promise: string }
export interface MasterRef { name: string; lineage: string; one_line: string }
export interface GameRef { title: string; faculty: string; minutes: number }
export interface MirrorPersona {
  name: string;
  age: number;
  role: string;
  arc: string;
  before: string;
  after: string;
}

export interface World {
  id: WorldId;
  title: string;
  tagline: string;
  manifesto: string;
  description: string;
  image: string;
  video?: string;
  Icon: LucideIcon;
  accent: string; // hsl tokens
  droneRoot: number; // Hz for ambient retune
  motif: "grid" | "mandala" | "ink" | "pulse"; // living portal style
  programs: Program[];
  masters: MasterRef[];
  games: GameRef[];
  signaturePractice: { title: string; type: "breath" | "inquiry" | "witness" };
  mirror: MirrorPersona;
}

export const WORLDS: World[] = [
  {
    id: "corporate",
    title: "For Leaders",
    tagline: "Lead from clarity, not from cortisol.",
    manifesto:
      "You carry the weight of payroll, decisions and other people's nervous systems. This wing exists so you can do that without disappearing into it.",
    description:
      "An entire wing built for founders, executives, and teams who carry weight. Heat-maps of team energy, manager coaching, and 1:1 inner-work programs you can fit between meetings.",
    image: worldCorporate,
    Icon: Briefcase,
    accent: "32 95% 60%",
    droneRoot: 98, // G2 — grounded
    motif: "grid",
    programs: [
      { title: "The Calm Founder",    duration: "30 days",  promise: "End the day with a quieter chest." },
      { title: "Manager's Mirror",    duration: "14 days",  promise: "Have the conversation you keep avoiding." },
      { title: "Burn-Proof CEO",      duration: "60 days",  promise: "Build a nervous system that can hold scale." },
      { title: "Team Reset",          duration: "8 weeks",  promise: "Re-set trust, focus and pace — together." },
    ],
    masters: [
      { name: "Krishna",       lineage: "Bhagavad Gita",  one_line: "Act without being owned by the outcome." },
      { name: "Chanakya",      lineage: "Arthashastra",   one_line: "A king who cannot rule himself rules nothing." },
      { name: "Lao Tzu",       lineage: "Tao Te Ching",   one_line: "Lead by becoming low like water." },
      { name: "Marcus Aurelius", lineage: "Meditations",  one_line: "You have power over your mind — not events." },
      { name: "Patanjali",     lineage: "Yoga Sutras",    one_line: "Steadiness of mind is the whole leadership." },
    ],
    games: [
      { title: "Cortisol Breath",   faculty: "Nervous system", minutes: 3 },
      { title: "Decision Mirror",   faculty: "Clarity",        minutes: 5 },
      { title: "Meeting Reset",     faculty: "State change",   minutes: 2 },
    ],
    signaturePractice: { title: "60-second pre-meeting reset", type: "breath" },
    mirror: {
      name: "Priya", age: 34, role: "Series-B Founder",
      arc: "From 'I can't take another standup' to leading without flinching.",
      before: "Slept with the laptop. Skipped meals. Bit her team's head off twice a week.",
      after:  "Two minutes before every meeting, she lands in her body. The team noticed first.",
    },
  },
  {
    id: "seeker",
    title: "For Seekers",
    tagline: "118 masters. One temple. Your time.",
    manifesto:
      "If something inside you has been asking 'what am I really?' for years — this is the room where that question gets honored, not optimized.",
    description:
      "A living temple of meditation masters, philosophers and mystics — from Adi Shankara to Krishnamurti — that you can sit with, ask, and walk with through a 500-day spiral.",
    image: worldSeeker,
    Icon: Flame,
    accent: "38 95% 62%",
    droneRoot: 110, // A2 — open
    motif: "mandala",
    programs: [
      { title: "Atma Vichara",         duration: "21 days",  promise: "Ramana's 'Who am I?' — daily, for real." },
      { title: "Witness Training",     duration: "40 days",  promise: "Train the observer behind the thoughts." },
      { title: "Vedanta Foundations",  duration: "90 days",  promise: "Map the territory before you walk it." },
      { title: "The Spiral",           duration: "500 days", promise: "An entire consciousness journey." },
    ],
    masters: [
      { name: "Ramana Maharshi",  lineage: "Advaita",     one_line: "Find the one who asks the question." },
      { name: "Adi Shankara",     lineage: "Vedanta",     one_line: "Brahman is real. The world is appearance." },
      { name: "Nisargadatta",     lineage: "Navnath",     one_line: "Before the mind, you are." },
      { name: "Krishnamurti",     lineage: "No tradition", one_line: "Truth is a pathless land." },
      { name: "Osho",             lineage: "Tantric",     one_line: "Witness, and the witnessed begins to dissolve." },
    ],
    games: [
      { title: "The Bell",         faculty: "Attention",  minutes: 4 },
      { title: "Sound Witness",    faculty: "Perception", minutes: 6 },
      { title: "Mantra Loop",      faculty: "Repetition", minutes: 5 },
    ],
    signaturePractice: { title: "One round of 'Who am I?'", type: "inquiry" },
    mirror: {
      name: "Arjun", age: 41, role: "Software architect, lifelong seeker",
      arc: "From reading a thousand books to sitting with one question.",
      before: "12 years of half-finished retreats and Sanskrit terms he couldn't use.",
      after:  "One master. One question. One spiral he actually walks every day.",
    },
  },
  {
    id: "creator",
    title: "For Creators",
    tagline: "Flow is a skill. We train it.",
    manifesto:
      "The block isn't a character flaw. It's a nervous-system state. We teach you to enter the other one — on purpose.",
    description:
      "Games, deep-work rituals, and creative-block protocols built with athletes, writers and musicians. Not gamification — actual neuroscience-backed practice.",
    image: worldCreator,
    Icon: Palette,
    accent: "320 80% 70%",
    droneRoot: 130.81, // C3 — bright
    motif: "ink",
    programs: [
      { title: "Flow Cycles",        duration: "21 days", promise: "Enter the state on command — most days." },
      { title: "Block Breaker",      duration: "14 days", promise: "Find the question hiding under the block." },
      { title: "Creative Inquiry",   duration: "40 days", promise: "A studio companion for the work that scares you." },
    ],
    masters: [
      { name: "Rumi",         lineage: "Sufi",      one_line: "Sell your cleverness and buy bewilderment." },
      { name: "Kabir",        lineage: "Bhakti",    one_line: "Wherever you are is the entry point." },
      { name: "Tagore",       lineage: "Bengali Renaissance", one_line: "Reach for the truth and the song will come." },
      { name: "Hafiz",        lineage: "Persian Sufi", one_line: "The words you speak become the house you live in." },
    ],
    games: [
      { title: "Color Witness",    faculty: "Perception", minutes: 4 },
      { title: "Sound Garden",     faculty: "Listening",  minutes: 6 },
      { title: "Brush of Attention", faculty: "Focus",    minutes: 5 },
    ],
    signaturePractice: { title: "Three-breath flow entry", type: "breath" },
    mirror: {
      name: "Maya", age: 27, role: "Independent illustrator",
      arc: "From 'I haven't drawn in a month' to a daily 90-minute studio block.",
      before: "Doom-scrolled mornings. Felt guilty by noon. Drew at midnight or not at all.",
      after:  "Light, breath, three notes — then 90 minutes. Five days a week.",
    },
  },
  {
    id: "anxious",
    title: "For the Burnt-Out",
    tagline: "A safer place to begin.",
    manifesto:
      "If you got here exhausted — please put nothing else on yourself today. This room is built so you can do less, not more.",
    description:
      "Slow, kind, evidence-based — designed with trauma-informed therapists for people who are not ok right now. Pause Mode is on by default.",
    image: worldAnxious,
    Icon: Moon,
    accent: "210 70% 70%",
    droneRoot: 87.31, // F2 — low and soft
    motif: "pulse",
    programs: [
      { title: "Soft Landing",            duration: "7 days",  promise: "Just arrive. That's the whole assignment." },
      { title: "Nervous System Reset",    duration: "21 days", promise: "Drop out of fight/flight, gently." },
      { title: "Naming the Loops",        duration: "14 days", promise: "Half the freedom is in the naming." },
    ],
    masters: [
      { name: "Buddha",            lineage: "Theravada",   one_line: "There is suffering. There is a way out." },
      { name: "Thich Nhat Hanh",   lineage: "Zen",         one_line: "Breathing in, I know I am breathing in." },
      { name: "Pema Chödrön",      lineage: "Tibetan Buddhist", one_line: "Start where you are." },
      { name: "Mooji",             lineage: "Advaita",     one_line: "You are not what is happening to you." },
    ],
    games: [
      { title: "Heart Coherence",  faculty: "HRV",        minutes: 4 },
      { title: "Box Breath",       faculty: "Calm",       minutes: 3 },
      { title: "Body Scan",        faculty: "Somatic",    minutes: 7 },
    ],
    signaturePractice: { title: "One slow exhale, longer than the inhale", type: "breath" },
    mirror: {
      name: "Rohan", age: 31, role: "Designer, recently signed off",
      arc: "From silently breaking to gently rebuilding — without performing wellness.",
      before: "Couldn't open Slack without a chest pinch. Pretended he was 'fine'.",
      after:  "Four minutes of breath. A named loop. A tiny win. Then sleep.",
    },
  },
];

export const WORLDS_BY_ID: Record<WorldId, World> = WORLDS.reduce((acc, w) => {
  acc[w.id] = w;
  return acc;
}, {} as Record<WorldId, World>);
