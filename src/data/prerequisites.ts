// Prerequisites Map — "You can't skip steps."
// The single sharpest thesis in one structured page.

export interface PrereqStep {
  number: number;
  sanskrit: string;
  name: string;
  oneLine: string;
  why: string;            // Why this comes before the next
  modernGloss: string;    // What it looks like for a modern person
}

export interface PrereqLadder {
  goal: string;            // What people want
  reality: string;         // What it actually requires
  steps: PrereqStep[];
  warning: string;         // What happens if you skip
}

export const ASHTANGA_LADDER: PrereqLadder = {
  goal: "I want to meditate.",
  reality:
    "Meditation (dhyāna) is the seventh of eight limbs in Patañjali's system. The first six are the prerequisites. Skip them and what you call meditation is, at best, rest — at worst, suppression in spiritual costume.",
  warning:
    "Most people start at limb 3 (āsana) or limb 7 (dhyāna) and wonder why nothing deepens. The limbs are not optional stages. They are load-bearing.",
  steps: [
    {
      number: 1,
      sanskrit: "यम — Yama",
      name: "Ethics toward others",
      oneLine: "Non-harming, truthfulness, non-stealing, energy restraint, non-grasping.",
      why: "If your daily life is full of small harms and small lies, the nervous system cannot settle into the stillness any later limb requires. The body knows.",
      modernGloss:
        "You cannot meditate well if you ghost people, half-lie on your CV, scroll-steal hours, scatter sexual attention everywhere, and grasp at every shiny opportunity. The mat will keep handing you the bill.",
    },
    {
      number: 2,
      sanskrit: "नियम — Niyama",
      name: "Ethics toward self",
      oneLine: "Cleanliness, contentment, discipline, self-study, surrender.",
      why: "Without a stable inner relationship to oneself, attention has nowhere to land. Niyama builds the floor.",
      modernGloss:
        "Sleep, real food, a tidy room, an honest journal, the daily admission that you are not running the universe. These are not extras. They are limb two.",
    },
    {
      number: 3,
      sanskrit: "आसन — Āsana",
      name: "A steady, comfortable seat",
      oneLine: "The body becomes still and pleasant for an extended sitting.",
      why: "If the body keeps interrupting attention with pain, numbness, or fidget, no inner work is possible. The body must agree to be ignored.",
      modernGloss:
        "Not advanced postures — a 30-minute, pain-free seat. Most modern bodies cannot do this. That is fine. That is exactly the work of limb three.",
    },
    {
      number: 4,
      sanskrit: "प्राणायाम — Prāṇāyāma",
      name: "Conscious regulation of breath",
      oneLine: "The breath becomes long, smooth, and consciously held.",
      why: "Breath and mind are entangled. A scattered breath is a scattered mind. You cannot quiet the mind with a chaotic breath — and you do not have to.",
      modernGloss:
        "Box-breathing, nāḍī shodhana, ujjāyī — taught carefully. Wim Hof is the doorway, not the destination. Coherent breath at 5–6 cycles a minute is the foundation.",
    },
    {
      number: 5,
      sanskrit: "प्रत्याहार — Pratyāhāra",
      name: "Withdrawal of the senses",
      oneLine: "The senses, voluntarily, stop reaching outward.",
      why: "As long as eye, ear, and skin pull attention out, attention cannot turn in. Pratyāhāra is the gate between outer and inner.",
      modernGloss:
        "Hard mode: no phone, no music, no podcast, no notifications for a full hour. Most people have never spent an hour like this. The hour itself is the practice.",
    },
    {
      number: 6,
      sanskrit: "धारणा — Dhāraṇā",
      name: "One-pointed concentration",
      oneLine: "Attention can be held on one object — for one minute, then ten, then thirty.",
      why: "Dhyāna is dhāraṇā that has become effortless. Without concentration there is no flow, only flicker.",
      modernGloss:
        "Trāṭaka on a flame. Mantra on the breath. The single nose-tip. Choose one object and return to it ten thousand times.",
    },
    {
      number: 7,
      sanskrit: "ध्यान — Dhyāna",
      name: "Meditation — effortless flow of attention",
      oneLine: "Attention flows toward the object the way oil pours — unbroken, no effort needed to return.",
      why: "This is what every meditation app promises in week one. It actually arrives after limb six has been won.",
      modernGloss:
        "You will know dhyāna because there will be no one trying to meditate. The 'distractions' that filled your earlier sittings simply stop appearing.",
    },
    {
      number: 8,
      sanskrit: "समाधि — Samādhi",
      name: "Absorption",
      oneLine: "The watcher, the watching, and the watched dissolve into one field.",
      why: "Not a prerequisite for anything — it is the destination. Or rather, the end of destinations.",
      modernGloss:
        "Cannot be described, cannot be marketed, cannot be sold in eight weeks. The honest news: it is real, it is rare, and the seven limbs are the only road there.",
    },
  ],
};

// The five secondary ladders — same structure for other common goals.
export const SECONDARY_LADDERS: Array<{ goal: string; mustDoFirst: string[] }> = [
  {
    goal: "I want peace.",
    mustDoFirst: [
      "Tell the truth in one relationship where you've been lying.",
      "Get seven hours of sleep for ten consecutive nights.",
      "Spend one hour a day without your phone.",
      "Then — and only then — try to sit with the mind.",
    ],
  },
  {
    goal: "I want enlightenment.",
    mustDoFirst: [
      "Find one loop in your life. Watch it for thirty days without trying to change it.",
      "Read one book end to end (try the Aṣṭāvakra Gītā).",
      "Sit in silence one hour, every day, for a season.",
      "Then notice that the seeker is the only thing in the way.",
    ],
  },
  {
    goal: "I want to heal.",
    mustDoFirst: [
      "Name the thing. Out loud, to one person who will not flinch.",
      "Move your body daily — any way that does not hurt.",
      "Feel the feeling in the body, where it actually lives, not in the story.",
      "Then the healing has somewhere to land.",
    ],
  },
  {
    goal: "I want a guru.",
    mustDoFirst: [
      "Find the question that is actually destroying you.",
      "Live with it for a year, alone.",
      "Read the great ones who already answered it (Ramana, Krishna, Buddha).",
      "If the question survives all that, the right guru will appear. Until then, you have only a fascination.",
    ],
  },
  {
    goal: "I want love.",
    mustDoFirst: [
      "Spend a week with yourself, in silence, without distraction.",
      "Notice every place inside you that you would not want a partner to touch.",
      "Begin to touch those places yourself — with attention, not with fixing.",
      "Then love arrives, because you are no longer running from yourself.",
    ],
  },
];
