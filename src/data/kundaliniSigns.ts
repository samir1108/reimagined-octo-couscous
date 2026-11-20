/**
 * Kundalini Signs — the behavioral and somatic signature of stirring ki.
 * ─────────────────────────────────────────────────────────────────────
 * When the sleeping serpent stirs, the experience shows up first in the BODY,
 * and the body does not have vocabulary for it. This taxonomy exists so the
 * system can say "this is a known sign — here is how to be with it" instead of
 * leaving a Band-0 sleeper alone with a phenomenon they cannot name.
 *
 * Two rules encoded in this data, drawn from the corpus:
 *
 *   1. Signs are not goals. The corpus (Foundation Course, Day 100) is explicit:
 *      "Kundalini is not something to be raised... True kundalini rises naturally
 *      through purification, not force."
 *   2. Signs mimic loops. Spinal heat reads as anxiety; bliss waves read as
 *      happiness-attachment; unreality reads as dissociation. Every sign carries
 *      `mimicsLoops` so the graph can distinguish an energetic event from a
 *      behavioral loop, and `safety` so the system knows when to slow a person
 *      down instead of cheering them on.
 *
 * Corpus sources: Foundation Course phase-7 energy day 100 ("Kundalini: The
 * Sleeping Serpent"), the kundalini-awakening neuroscience blog posts, and the
 * dukkha-nanas passage in the bands essays.
 */

import type { DimensionId } from '@/types/consciousness';

export type KundaliniSafety = 'normal' | 'check-in' | 'stop-and-support';

export interface KundaliniSign {
  id: string;
  label: string;
  tradition: string;               // how the texts name it
  description: string;             // what it actually feels like
  chakra: string;                  // chakra node id where it is felt
  dimension: DimensionId;
  surfacesInBands: number[];       // bands where this sign typically appears
  mimicsLoops: string[];           // loop ids (src/data/loops.ts) it is mistaken for
  grounding: string;               // the regulate protocol
  safety: KundaliniSafety;
  source: string;
}

export const KUNDALINI_SIGNS: KundaliniSign[] = [
  {
    id: 'spinal-heat',
    label: 'Spinal Heat',
    tradition: 'The warmth of tapas — the fire of practice',
    description:
      'Heat that rises along the spine, often from the sacrum, unrelated to room temperature. Can arrive as a wave or as a slow uncoiling.',
    chakra: 'sushumna',
    dimension: 'body',
    surfacesInBands: [3, 4, 5, 6, 7],
    mimicsLoops: ['EMO009'],
    grounding: 'Sit or lie down, unclench the jaw, lengthen the exhale. Do not chase the heat with force — it is a byproduct, not a target.',
    safety: 'normal',
    source: 'Foundation Course Day 100; kundalini-awakening-signs posts.',
  },
  {
    id: 'kriya-movements',
    label: 'Involuntary Movements (Kriyas)',
    tradition: 'Kriyas — spontaneous purifying actions',
    description:
      'The body moves without instruction: rocking, micro-tremors, sudden hand gestures, asanas arising on their own. Not controlled, not willed.',
    chakra: 'sushumna',
    dimension: 'body',
    surfacesInBands: [3, 4, 5, 6, 7],
    mimicsLoops: ['CTL087'],
    grounding: 'Let the movement finish without directing it. If it frightens you, open the eyes, feel the feet, and slow the breath until the body settles.',
    safety: 'check-in',
    source: 'Foundation Course Day 100 (Hatha Yoga Pradipika citation: kriyas as prana enters Sushumna).',
  },
  {
    id: 'root-pressure',
    label: 'Pressure at the Base',
    tradition: 'Shakti coiled at the Muladhara',
    description:
      'Pulsing, buzzing, or a distinct "something is here" at the base of the spine — most noticeable on waking or at the start of a sit.',
    chakra: 'muladhara',
    dimension: 'body',
    surfacesInBands: [2, 3, 4, 5],
    mimicsLoops: ['AVD147'],
    grounding: 'Observation only. Bring attention to the base for a few breaths and let it be whatever it is — warmth, pulsing, or nothing.',
    safety: 'normal',
    source: 'Foundation Course Day 100 practice ("simply be present there. Notice any sensations").',
  },
  {
    id: 'emotional-purging',
    label: 'Emotional Purging',
    tradition: 'The chitta clearing — impurities surfacing',
    description:
      'Weeping, sobbing, or waves of grief that arrive without a matching story. The corpus is blunt: the tears are the release of suppressed signal, not a mood.',
    chakra: 'anahata',
    dimension: 'emotion',
    surfacesInBands: [2, 3, 4, 5, 6],
    mimicsLoops: ['EMO004'],
    grounding: 'Do not explain it away and do not perform it. Stay seated, feel the breath, let it finish. Five minutes of stillness after — no phone.',
    safety: 'normal',
    source: 'Foundation Course Day 100 ("emotional purging"); the weeping-during-meditation essay.',
  },
  {
    id: 'bliss-waves',
    label: 'Bliss Waves',
    tradition: 'Ananda — the bliss sheath tasting itself',
    description:
      'Sudden, unearned waves of joy, love, or fullness, often without cause. Pleasurable — and therefore easy to start chasing.',
    chakra: 'anahata',
    dimension: 'emotion',
    surfacesInBands: [4, 5, 6, 7],
    mimicsLoops: ['ATT200'],
    grounding: 'Let it pass without trying to keep it. The peak is not the practice — the next ordinary session is.',
    safety: 'normal',
    source: 'Foundation Course Day 100 ("bliss states"); pre-journey session on intensity addiction.',
  },
  {
    id: 'paresthesia',
    label: 'Tingling / crawling sensations',
    tradition: 'Prana moving through the nadis',
    description:
      'Pins-and-needles, crawling, or vibrating sensations on the skin or inside the limbs, frequently one-sided at first.',
    chakra: 'pranamaya',
    dimension: 'body',
    surfacesInBands: [3, 4, 5],
    mimicsLoops: ['SRV320'],
    grounding: 'Name the sensation factually ("tingling in the left forearm"), keep the breath slow, and stay in the body rather than the story about it.',
    safety: 'normal',
    source: 'Day 100 scienceNote: paresthesia as a documented overlap between tradition and neurology.',
  },
  {
    id: 'inner-light',
    label: 'Inner Light & Visions',
    tradition: 'The Jyotis — inner radiance',
    description:
      'Colors, geometric patterns, or lights behind closed eyes; sometimes dreamlike imagery during the waking state.',
    chakra: 'ajna',
    dimension: 'spirit',
    surfacesInBands: [4, 5, 6, 7],
    mimicsLoops: ['VAL005'],
    grounding: 'Watch it like weather. Visions are not credentials — report them to no one, chase them not at all.',
    safety: 'normal',
    source: 'Kundalini-awakening-signs posts; Day 100 vision references.',
  },
  {
    id: 'nada-sounds',
    label: 'Inner Sounds (Nada)',
    tradition: 'Nada anusandhana — sound as the path',
    description:
      'Humming, ringing, ocean-like or flute-like sounds with no external source, often loudest in silence.',
    chakra: 'vishuddha',
    dimension: 'spirit',
    surfacesInBands: [4, 5, 6, 7],
    mimicsLoops: [],
    grounding: 'Let the sound be the object of attention. No need to name it or make it mean something.',
    safety: 'normal',
    source: 'Nada path in the stage handbook; inner-sound references across the corpus.',
  },
  {
    id: 'breath-suspension',
    label: 'Breath Suspension',
    tradition: 'Kevala kumbhaka — breathlessness without effort',
    description:
      'The breath becomes very shallow or appears to pause on its own, while awareness stays clear. Not forced, not frightening — but unmistakable.',
    chakra: 'sushumna',
    dimension: 'body',
    surfacesInBands: [4, 5, 6, 7],
    mimicsLoops: ['EMO009'],
    grounding: 'Do not hold the breath deliberately. If alarm arises, take one slow deliberate breath through the nose and open the eyes.',
    safety: 'check-in',
    source: 'Kundalini-awakening-signs posts (autonomic arousal and breath patterns).',
  },
  {
    id: 'time-distortion',
    label: 'Time Distortion',
    tradition: 'Kala beyond the clock',
    description:
      'A twenty-minute sit that felt like two minutes — or two minutes that felt like twenty. The clock stops being the reference.',
    chakra: 'ajna',
    dimension: 'thought',
    surfacesInBands: [3, 4, 5, 6],
    mimicsLoops: ['RUM001'],
    grounding: 'Nothing to do. Note it, return to the breath. Confusion about time is a sign of a shifted state, not a lost mind.',
    safety: 'normal',
    source: 'Altered-states descriptions across the kundalini-awakening posts.',
  },
  {
    id: 'sleep-disruption',
    label: 'Sleep Disruption',
    tradition: 'The night practice — when the body processes at rest',
    description:
      'Waking at odd hours with energy, heat, or a busy system; sleep that becomes lighter as practice deepens.',
    chakra: 'sushumna',
    dimension: 'body',
    surfacesInBands: [2, 3, 4, 5],
    mimicsLoops: ['RUM002'],
    grounding: 'Do not practice harder. Ground in the evening (walk, warm drink, no screens), and shorten the sit if nights become rough.',
    safety: 'normal',
    source: 'Corpus pattern: practice intensity vs. sleep quality warnings.',
  },
  {
    id: 'ego-dissolution',
    label: 'Ego-Boundary Dissolution',
    tradition: 'The lapsing of the separate self',
    description:
      'The boundary between body and room softens; the sense of being a someone inside a body thins out. Peaceful — and existentially disorienting.',
    chakra: 'sahasrara',
    dimension: 'spirit',
    surfacesInBands: [5, 6, 7],
    mimicsLoops: ['SRV320'],
    grounding: 'Come back to contact points: feet on floor, hands on knees, name three objects in the room. Dissolution is safe; losing contact with the body is not.',
    safety: 'check-in',
    source: 'Sahasrara day (Day 99); dukkha-nanas passage in the bands essays.',
  },
  {
    id: 'compassion-surge',
    label: 'Compassion Surge',
    tradition: 'The heart opening without an object',
    description:
      'Unprompted tenderness toward strangers, enemies, oneself. Often arrives right after a purging wave.',
    chakra: 'anahata',
    dimension: 'emotion',
    surfacesInBands: [4, 5, 6, 7],
    mimicsLoops: ['VAL006'],
    grounding: 'Act on it small and real. Do not organize your life around the wave before it has settled.',
    safety: 'normal',
    source: 'Corpus pattern: heart-centered breakthroughs after emotional release.',
  },
  {
    id: 'reality-contact-loss',
    label: 'Reality-Contact Loss',
    tradition: 'Not a sign of progress — a signal to stop',
    description:
      'Unreality that does not resolve: cannot tell inner from outer, cannot orient after the practice ends, persistent visions with no ground. This is the sign the tradition treats as danger, not advancement.',
    chakra: 'muladhara',
    dimension: 'body',
    surfacesInBands: [2, 3, 4, 5, 6, 7],
    mimicsLoops: ['SRV320'],
    grounding: 'STOP the practice. Orient with 5-4-3-2-1 senses, feet on the ground, cold water on the face. If it persists beyond a day, seek medical or clinical support — this is outside the app\'s scope.',
    safety: 'stop-and-support',
    source: 'Day 100 WARNING ("forced awakening without preparation is dangerous"); SRV320 grounding protocol.',
  },
];

export function getKundaliniSignById(id: string): KundaliniSign | undefined {
  return KUNDALINI_SIGNS.find(s => s.id === id);
}

export const SAFETY_TIER_LABEL: Record<KundaliniSafety, string> = {
  'normal': 'Normal — witness it',
  'check-in': 'Check in — ground after the practice',
  'stop-and-support': 'Stop — support outside the app',
};
