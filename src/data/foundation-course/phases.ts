import type { CoursePhaseInfo } from './types';

// ─── Phase Definitions ─────────────────────────────────────

export const COURSE_PHASES: CoursePhaseInfo[] = [
  {
    id: 'awakening',
    name: 'The Awakening',
    subtitle: 'Discovering the Observer Within',
    days: [1, 14],
    description: 'You have lived your entire life on autopilot — reacting, believing every thought, identifying with every emotion. These 14 days crack open the door. You will discover that there is something watching all of it. That discovery changes everything.',
    icon: 'Eye',
    gradient: 'from-violet-600 to-indigo-700',
    keyOutcomes: [
      'Understand what observation really means',
      'Experience the "witness gap" for the first time',
      'Learn the difference between thinking and awareness',
      'Establish a daily practice rhythm',
    ],
  },
  {
    id: 'mind',
    name: 'The Mind Lens',
    subtitle: 'Understanding Your Mental Machinery',
    days: [15, 30],
    description: 'The mind is not you — it is a tool that has taken over. In these 16 days, you will learn how the Head Lens works: thought patterns, cognitive biases, the stories you tell yourself, and the prison of identification. You will learn to use the mind instead of being used by it.',
    icon: 'Brain',
    gradient: 'from-cyan-600 to-blue-700',
    keyOutcomes: [
      'Map your dominant thought patterns',
      'Identify cognitive biases in real-time',
      'Understand rumination vs. productive thinking',
      'Experience thought-free gaps naturally',
    ],
  },
  {
    id: 'heart',
    name: 'The Heart Lens',
    subtitle: 'Emotional Intelligence Beyond Concepts',
    days: [31, 45],
    description: 'Emotions are not the enemy — suppression is. These 15 days teach you to feel fully without being hijacked. You will learn where emotions live in the body, how reactions form before you are aware of them, and how to transform emotional energy instead of acting it out or pushing it down.',
    icon: 'Heart',
    gradient: 'from-rose-600 to-pink-700',
    keyOutcomes: [
      'Feel emotions without reactivity',
      'Locate emotions in the body precisely',
      'Understand emotional triggers and their roots',
      'Transform emotional energy consciously',
    ],
  },
  {
    id: 'body',
    name: 'The Gut Lens',
    subtitle: 'The Body Knows What the Mind Hides',
    days: [46, 60],
    description: 'Your body stores every unprocessed experience, every suppressed emotion, every fear you refused to feel. The Gut Lens teaches you to listen to somatic intelligence — the wisdom that bypasses the mind entirely. These 15 days will change your relationship with your physical form forever.',
    icon: 'Activity',
    gradient: 'from-amber-600 to-orange-700',
    keyOutcomes: [
      'Read somatic signals accurately',
      'Release stored tension patterns',
      'Use the body as a truth detector',
      'Integrate body wisdom into daily decisions',
    ],
  },
  {
    id: 'patterns',
    name: 'Loops & Samskaras',
    subtitle: 'Breaking the Chains You Cannot See',
    days: [61, 75],
    description: 'You are not free — you are running programs installed by childhood, culture, trauma, and repetition. These 15 days expose your loops: the unconscious patterns that hijack your behavior, relationships, and happiness. Seeing them clearly is the first step to dissolving them.',
    icon: 'Repeat',
    gradient: 'from-red-600 to-rose-700',
    keyOutcomes: [
      'Identify your top 5 active loops',
      'Understand trigger → reaction → consequence chains',
      'Practice pattern interruption techniques',
      'Begin dissolving one major loop',
    ],
  },
  {
    id: 'inquiry',
    name: 'Self-Inquiry',
    subtitle: 'Who Am I? — The Ultimate Question',
    days: [76, 90],
    description: 'Atma Vichara — self-inquiry — is the most powerful tool ever discovered for human liberation. For 15 days, you will go beyond observation into the territory of "Who is observing?" This is where the mind turns inward and dissolves into its source. Neti Neti — not this, not this — strips away everything false.',
    icon: 'Search',
    gradient: 'from-purple-600 to-violet-800',
    keyOutcomes: [
      'Practice Ramana Maharshi\'s "Who Am I?" method',
      'Experience neti neti (not this, not this)',
      'Recognize the difference between self and Self',
      'Touch the space of pure awareness',
    ],
  },
  {
    id: 'energy',
    name: 'Energy & Chakras',
    subtitle: 'The Subtle Architecture of Consciousness',
    days: [91, 105],
    description: 'Beyond the physical body lies an energy system mapped by yogis thousands of years ago. These 15 days take you through each chakra — not as philosophy but as felt experience. You will learn to sense energy blockages, understand their psychological correlates, and work with prana directly.',
    icon: 'Zap',
    gradient: 'from-emerald-600 to-teal-700',
    keyOutcomes: [
      'Feel each chakra as lived experience',
      'Map psychological patterns to energy centers',
      'Understand prana and its movement',
      'Clear major energy blockages',
    ],
  },
  {
    id: 'integration',
    name: 'The Four Paths',
    subtitle: 'From Practice to Living',
    days: [106, 118],
    description: 'Knowledge without integration is entertainment. These final 13 days weave everything together through the Four Yoga Paths: Jnana (knowledge), Bhakti (devotion), Karma (action), and Raja (meditation). You will discover which path resonates most deeply and how to make consciousness your way of living — not just a practice.',
    icon: 'Compass',
    gradient: 'from-yellow-600 to-amber-700',
    keyOutcomes: [
      'Experience each of the four yoga paths',
      'Identify your dominant path',
      'Create a personal daily practice blueprint',
      'Transition from student to practitioner',
    ],
  },
];

export function getPhaseForDay(day: number): CoursePhaseInfo {
  return COURSE_PHASES.find(p => day >= p.days[0] && day <= p.days[1]) ?? COURSE_PHASES[0];
}

export function getPhaseProgress(day: number): number {
  const phase = getPhaseForDay(day);
  const daysInPhase = phase.days[1] - phase.days[0] + 1;
  const dayInPhase = day - phase.days[0];
  return Math.round((dayInPhase / daysInPhase) * 100);
}

export function getOverallProgress(day: number): number {
  return Math.round(((day - 1) / 117) * 100);
}
