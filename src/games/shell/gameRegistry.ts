// Conscious Games — registry of all 12 games.
// `unlockLevel` gates by V-Level band. `available=false` = silhouette card (Phase 2+).
export type GameSize = "XS" | "S" | "M";

export interface GameMeta {
  id: string;
  number: number;
  name: string;
  category: string;
  oneLine: string;       // shown on card, no teaching copy
  signal: string;        // what the mechanic actually reads
  size: GameSize;
  unlockLevel: number;   // V-Level band 1..9
  available: boolean;    // false = silhouette
}

export const GAME_REGISTRY: GameMeta[] = [
  { id: "bell-in-the-wind",   number: 1,  name: "Bell in the Wind",     category: "Attention",         oneLine: "A bell in a black void. Don't look away.",                 signal: "tab-blur, cursor leave",      size: "XS", unlockLevel: 1, available: true  },
  { id: "breath-temple",      number: 2,  name: "Breath Temple",        category: "Nervous system",    oneLine: "A lotus that breathes with you.",                          signal: "mic amplitude",               size: "S",  unlockLevel: 2, available: false },
  { id: "thought-watcher",    number: 3,  name: "Thought Watcher",      category: "Observation",       oneLine: "Words drift up. Tap when you see them.",                   signal: "tap timing",                  size: "S",  unlockLevel: 2, available: false },
  { id: "who-is-thinking",    number: 4,  name: "Who Is Thinking?",     category: "Self-inquiry",      oneLine: "One thought. Three questions. No right answer.",           signal: "dwell time",                  size: "S",  unlockLevel: 4, available: false },
  { id: "mirror-realm",       number: 5,  name: "Mirror Realm",         category: "Ego",               oneLine: "Praise. Then insult. Notice the pull.",                    signal: "typing biometrics",           size: "M",  unlockLevel: 5, available: false },
  { id: "silent-mountain",    number: 6,  name: "The Silent Mountain",  category: "Silence",           oneLine: "Do nothing. The mountain reveals.",                        signal: "idle detection",              size: "XS", unlockLevel: 1, available: true  },
  { id: "emotional-resonance",number: 7,  name: "Emotional Resonance",  category: "Compassion",        oneLine: "Listen without interrupting.",                             signal: "mic activity",                size: "M",  unlockLevel: 6, available: false },
  { id: "body-scanner",       number: 8,  name: "Body Scanner",         category: "Inner sensing",     oneLine: "Tap only where you actually feel.",                        signal: "tap entropy",                 size: "S",  unlockLevel: 3, available: false },
  { id: "sound-microscope",   number: 9,  name: "Sound Microscope",     category: "Subtle perception", oneLine: "Notice the tone shift.",                                   signal: "tap-to-event latency",        size: "S",  unlockLevel: 4, available: false },
  { id: "the-pause",          number: 10, name: "The Pause",            category: "Impulse mastery",   oneLine: "A red button. Survive 90s without pressing.",              signal: "button press latency",        size: "XS", unlockLevel: 1, available: true  },
  { id: "real-world-quest",   number: 11, name: "Real-World Quest",     category: "Off-screen",        oneLine: "Sit in a park. Return when done.",                         signal: "timer + reflection",          size: "XS", unlockLevel: 5, available: false },
  { id: "non-dual-door",      number: 12, name: "Non-Dual Door",        category: "Integration",       oneLine: "A door. Look without tapping.",                            signal: "intentional inaction",        size: "XS", unlockLevel: 9, available: false },
  { id: "name-the-emotion",   number: 13, name: "Name the Storm",       category: "Affect labeling",   oneLine: "Name what you feel. The storm shrinks.",                   signal: "selection + dwell",           size: "XS", unlockLevel: 2, available: true  },
  { id: "neti-neti",          number: 14, name: "Neti Neti",            category: "Vedanta",           oneLine: "Not this, not that. What remains?",                        signal: "rejection cadence",           size: "S",  unlockLevel: 5, available: true  },
  { id: "tonglen",            number: 15, name: "Tonglen",              category: "Compassion",        oneLine: "Breathe in pain. Breathe out relief.",                     signal: "breath rhythm",               size: "S",  unlockLevel: 6, available: true  },
];

export function getGame(id: string): GameMeta | undefined {
  return GAME_REGISTRY.find((g) => g.id === id);
}
