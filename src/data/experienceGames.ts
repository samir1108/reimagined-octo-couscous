/**
 * The Curated 12 — flagship contemplative games for the free Experience.
 * Selected from the 57-game lab as the world-class "must-play" set.
 *
 * Tier 1 = flagship (the $1M candidates). Tier 2 = daily 7. Tier 3 = deep cuts.
 * Each links to /app/games/:id (auth-gated to play; preview-readable here).
 */
import breathTempleAsset from "@/assets/games/breath-temple.jpg.asset.json";
import witnessAsset from "@/assets/games/witness.jpg.asset.json";
import thePauseAsset from "@/assets/games/the-pause.jpg.asset.json";
import theSighImg from "@/assets/games/the-sigh.jpg";
import threeBrainsImg from "@/assets/games/three-brains.jpg";
import whoIsThinkingImg from "@/assets/games/who-is-thinking.jpg";
import karmaCoinImg from "@/assets/games/karma-coin.jpg";
import ninthDharanaImg from "@/assets/games/ninth-dharana.jpg";
import lastBreathImg from "@/assets/games/last-breath.jpg";
import mirrorRealmImg from "@/assets/games/mirror-realm.jpg";
import bodyScannerImg from "@/assets/games/body-scanner.jpg";
import silentMountainImg from "@/assets/games/silent-mountain.jpg";
import nameTheStormImg from "@/assets/games/name-the-storm.jpg";
import netiNetiImg from "@/assets/games/neti-neti.jpg";
import tonglenImg from "@/assets/games/tonglen.jpg";

const breathTempleImg = breathTempleAsset.url;
const witnessImg = witnessAsset.url;
const thePauseImg = thePauseAsset.url;

export type GameTier = "flagship" | "daily" | "deep";

export interface ExperienceGame {
  id: string;
  number: number;
  name: string;
  symbol: string;
  tradition: string;
  trains: string;
  oneLine: string;
  why: string;
  durationLabel: string;
  tier: GameTier;
  accent: string;
  image?: string;       // cinematic hero (flagship only for now)
}

export const EXPERIENCE_GAMES: ExperienceGame[] = [
  // ───── TIER 1 — FLAGSHIPS ─────
  {
    id: "breath-temple", number: 1, name: "Breath Temple", symbol: "🪷",
    tradition: "Pranayama + HeartMath",
    trains: "Nervous system, heart coherence",
    oneLine: "A lotus that breathes with you.",
    why: "5.5 bpm resonance breathing with mic-reactive lotus. The most science-backed nervous-system reset in the world.",
    durationLabel: "5 min", tier: "flagship", accent: "rose",
    image: breathTempleImg,
  },
  {
    id: "thought-watcher", number: 2, name: "The Witness", symbol: "👁",
    tradition: "Vipassanā",
    trains: "Sustained witness consciousness",
    oneLine: "Words drift up. Tap when you see them.",
    why: "Vipassanā noting practice as a game. The foundation of 'I am not my thoughts.' The single most important skill in this app.",
    durationLabel: "3-20 min", tier: "flagship", accent: "amber",
    image: witnessImg,
  },
  {
    id: "the-pause", number: 3, name: "The Pause", symbol: "✋",
    tradition: "Patanjali (yama)",
    trains: "Impulse mastery, willpower",
    oneLine: "Don't press the red button for 90s.",
    why: "Trains the gap between impulse and action. The meta-skill behind every addiction, every reaction, every decision you regret.",
    durationLabel: "90 sec", tier: "flagship", accent: "rose",
    image: thePauseImg,
  },

  // ───── TIER 2 — DAILY ─────
  {
    id: "the-sigh", number: 4, name: "The Sigh", symbol: "🌬",
    tradition: "Stanford / Huberman",
    trains: "Vagal tone, fast reset",
    oneLine: "One deep two-phase exhale.",
    why: "60-second parasympathetic switch. The fastest known nervous-system reset on Earth.",
    durationLabel: "1 min", tier: "daily", accent: "sky",
    image: theSighImg,
  },
  {
    id: "three-brains-speak", number: 5, name: "Three Brains Speak", symbol: "🧠",
    tradition: "HOPE IP",
    trains: "Head / heart / gut alignment",
    oneLine: "Same question. Head. Heart. Gut.",
    why: "Our signature moat. Ask one real question. Three intelligences answer separately. Watch them disagree.",
    durationLabel: "4 min", tier: "daily", accent: "violet",
    image: threeBrainsImg,
  },
  {
    id: "who-is-thinking", number: 6, name: "Who Is Thinking?", symbol: "🌀",
    tradition: "Ramana Maharshi",
    trains: "Atma Vichara (self-inquiry)",
    oneLine: "One thought. Three Ramana questions.",
    why: "The deepest question ever asked, in 3 minutes. The kernel of Jnana Yoga as a daily practice.",
    durationLabel: "3 min", tier: "daily", accent: "stone",
    image: whoIsThinkingImg,
  },
  {
    id: "karma-coin", number: 7, name: "Karma Coin", symbol: "🪙",
    tradition: "Karma Yoga",
    trains: "Intention → action loop",
    oneLine: "Declare one micro-action. Self-report at evening.",
    why: "Closes the intention-execution loop daily. The simplest tool to stop being the kind of person who 'means to' do things.",
    durationLabel: "Morning + evening", tier: "daily", accent: "amber",
    image: karmaCoinImg,
  },
  {
    id: "ninth-dharana", number: 8, name: "9th Dhāraṇā", symbol: "༄",
    tradition: "Vigyan Bhairav Tantra",
    trains: "Subtle attention, kumbhaka",
    oneLine: "Tap the gap at the apex of breath.",
    why: "Direct from a 5,000-year-old tantra. No one else has shipped this. The space between breaths is a doorway.",
    durationLabel: "4 min", tier: "daily", accent: "indigo",
    image: ninthDharanaImg,
  },
  {
    id: "last-breath", number: 9, name: "The Last Breath", symbol: "🕯",
    tradition: "Memento mori",
    trains: "Priorities, liminal awareness",
    oneLine: "If this were your last breath, what would you say?",
    why: "Voice-recorded. 60 seconds. Reorders priorities faster than any productivity book.",
    durationLabel: "90 sec", tier: "daily", accent: "rose",
    image: lastBreathImg,
  },

  // ───── TIER 3 — DEEP ─────
  {
    id: "mirror-realm", number: 10, name: "Mirror Realm", symbol: "🪞",
    tradition: "Shadow work",
    trains: "Ego reactivity",
    oneLine: "Praise. Then insult. Notice the pull.",
    why: "The most uncomfortable 2 minutes you'll spend in this app. Reveals exactly which buttons run your day.",
    durationLabel: "2 min", tier: "deep", accent: "violet",
    image: mirrorRealmImg,
  },
  {
    id: "body-scanner", number: 11, name: "Body Scanner", symbol: "🫀",
    tradition: "Goenka Vipassanā",
    trains: "Interoception, embodiment",
    oneLine: "Tap only where you actually feel.",
    why: "The slow Goenka sweep. Builds the felt body — a predictor of emotional regulation, trauma recovery, and intuition.",
    durationLabel: "10 min", tier: "deep", accent: "emerald",
    image: bodyScannerImg,
  },
  {
    id: "silent-mountain", number: 12, name: "The Silent Mountain", symbol: "🏔",
    tradition: "Zen",
    trains: "Surrender, stillness",
    oneLine: "Do nothing. The mountain reveals.",
    why: "The anti-app. No score, no metric, no goal. Sit. The mountain teaches what doing cannot.",
    durationLabel: "5-30 min", tier: "deep", accent: "slate",
    image: silentMountainImg,
  },
  {
    id: "name-the-emotion", number: 13, name: "Name the Storm", symbol: "🌩",
    tradition: "Affect Labeling (UCLA, Lieberman)",
    trains: "Emotional granularity, amygdala downregulation",
    oneLine: "Find the most accurate word. Watch the storm shrink.",
    why: "fMRI-proven: naming an emotion reduces amygdala activity by up to 50%. Most people use 4 words for 40 emotions — that's where the suffering hides.",
    durationLabel: "3 min", tier: "deep", accent: "violet",
    image: nameTheStormImg,
  },
  {
    id: "neti-neti", number: 14, name: "Neti Neti", symbol: "🚫",
    tradition: "Advaita Vedanta (Shankara)",
    trains: "Disidentification, self-realization",
    oneLine: "Not this. Not this. What remains?",
    why: "Shankara's surgical knife. Strip away every false self until only the witness is left. The most direct path Vedanta ever produced.",
    durationLabel: "6 min", tier: "deep", accent: "stone",
    image: netiNetiImg,
  },
  {
    id: "tonglen", number: 15, name: "Tonglen", symbol: "🫁",
    tradition: "Tibetan Buddhism",
    trains: "Compassion, fear-of-pain inversion",
    oneLine: "Breathe in pain. Breathe out relief.",
    why: "Reverses the lifetime habit of pushing pain away. Suddenly you can be near suffering — your own and others' — without flinching. Quietly the most courageous practice in this app.",
    durationLabel: "7 min", tier: "deep", accent: "rose",
    image: tonglenImg,
  },
];

export function gamesByTier(tier: GameTier) {
  return EXPERIENCE_GAMES.filter(g => g.tier === tier);
}
