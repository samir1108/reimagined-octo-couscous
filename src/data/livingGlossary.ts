// Living Glossary — words that got stolen, reclaimed.
// Each entry: the misuse, the original, the prerequisite, the correction.

export interface GlossaryEntry {
  word: string;
  sanskrit?: string;
  misuse: string;        // What it has become in modern usage
  original: string;      // What it actually means in the lineage
  prerequisite: string;  // What must come BEFORE it can even be attempted
  correction: string;    // One-line clean reframe
  category: "practice" | "state" | "concept" | "relationship";
}

export const LIVING_GLOSSARY: GlossaryEntry[] = [
  {
    word: "Meditation",
    sanskrit: "ध्यान — Dhyāna",
    misuse: "A 5-minute relaxation exercise on an app between meetings.",
    original:
      "The seventh limb of Patañjali's eightfold path. An uninterrupted, effortless stream of attention on one object — possible only after ethics (yama), discipline (niyama), steady posture (āsana), breath mastery (prāṇāyāma), withdrawal of the senses (pratyāhāra), and concentration (dhāraṇā) are in place.",
    prerequisite:
      "You must first be able to sit physically still for 20 minutes without fidgeting, breathe consciously, and hold one thought for 12 breath-cycles. Then dhyāna becomes possible.",
    correction:
      "What you are doing on the app is rest. Useful, but not meditation. Meditation is what becomes possible after years of the other six limbs.",
    category: "practice",
  },
  {
    word: "Yoga",
    sanskrit: "योग — Yoga",
    misuse: "A flexibility class in tight pants on a rubber mat.",
    original:
      "Union. The cessation of the fluctuations of the mind (Yoga Sutra 1.2). Eight limbs spanning ethics, body, breath, senses, attention, absorption, and liberation. Postures are one half of one limb.",
    prerequisite:
      "An honest self-look at how you treat others (yama) and yourself (niyama). Without that ground, the postures are gymnastics.",
    correction:
      "What you call yoga is one corner of āsana, the third limb. Yoga is what happens when all eight align.",
    category: "practice",
  },
  {
    word: "Karma",
    sanskrit: "कर्म — Karma",
    misuse: "Cosmic revenge. 'Karma will get them.'",
    original:
      "Action. Every action leaves a subtle impression (saṃskāra) in your nervous system that biases your next response. The 'punishment' is that you become the kind of person who acts that way again.",
    prerequisite:
      "Honest observation of one of your own loops — for a full week, without judgment — before talking about anyone else's.",
    correction:
      "Karma is not revenge. Karma is grooves. You are not paying for past actions; you are walking in the trench your past actions dug.",
    category: "concept",
  },
  {
    word: "Guru",
    sanskrit: "गुरु — Guru",
    misuse: "Influencer in robes. Or any expert in any field ('marketing guru').",
    original:
      "Gu = darkness. Ru = the one who removes it. A guru is a mirror held up so steadily that you finally see yourself clearly. They are not the source of light; they are the absence of distortion.",
    prerequisite:
      "A real question that is destroying you. You don't need a guru to learn a skill. You need one when you cannot live another day with who you currently think you are.",
    correction:
      "Anyone selling enlightenment is selling. The real guru takes nothing from you — not your money, not your devotion, not your obedience — and gives you back to yourself.",
    category: "relationship",
  },
  {
    word: "Chakra",
    sanskrit: "चक्र — Chakra",
    misuse: "Seven coloured discs on a wellness poster, 'unblocked' by a stranger.",
    original:
      "Wheels — energetic intensities along the central channel, mapped most fully in Kashmir Shaivism and Tantra. They correspond to nervous-system plexuses and to specific psychological themes (survival, relating, will, love, voice, sight, knowing).",
    prerequisite:
      "Being able to feel your own body, end to end, with eyes closed, for ten minutes. If you cannot do this, no one else can do anything to your chakras.",
    correction:
      "Chakras are not decorations. They are felt intensities. You earn the right to talk about them by feeling them, not by reading about them.",
    category: "concept",
  },
  {
    word: "Samādhi",
    sanskrit: "समाधि — Samādhi",
    misuse: "A mood. 'I felt so samādhi after that class.'",
    original:
      "The eighth and final limb. Complete absorption — the meditator, the meditation, and the object of meditation collapse into a single field. There are stages: with thought, without thought, with bliss, beyond bliss, and finally the seedless (nirbīja).",
    prerequisite: "Dhyāna sustained for hours, not minutes. Which itself requires the first six limbs.",
    correction:
      "Samādhi is not a vibe. It is the disappearance of the one who would have a vibe. If you can talk about it, it wasn't it.",
    category: "state",
  },
  {
    word: "Mindfulness",
    sanskrit: "स्मृति — Smṛti / सति — Sati",
    misuse: "Eating a raisin slowly. Or being 'present' while still anxious.",
    original:
      "Sati — clear, calm, continuous remembrance of what is actually happening, including the act of remembering itself. One of the seven factors of awakening in Buddhism, not a standalone wellness tool.",
    prerequisite: "Some ground of stillness (samādhi-bala). Without it, 'mindfulness' is just anxious self-observation.",
    correction:
      "Mindfulness without ethics and concentration is surveillance. Real sati frees; performative mindfulness exhausts.",
    category: "practice",
  },
  {
    word: "Surrender",
    sanskrit: "शरणागति — Śaraṇāgati",
    misuse: "Giving up. Becoming passive. Letting a teacher take over.",
    original:
      "An active, conscious recognition that the small self cannot solve the deepest problem, followed by offering of that self into the larger field — God, Self, Reality. It is the most courageous act, not the least.",
    prerequisite: "Having tried, fully, with your own strength. Surrender before trying is laziness, not bhakti.",
    correction:
      "Surrender is not a white flag. It is the laying down of a sword you can no longer carry, in the only direction worth pointing.",
    category: "state",
  },
  {
    word: "Healing",
    sanskrit: "स्वस्थ — Svastha",
    misuse: "Repeatedly retelling your trauma in increasingly aesthetic ways.",
    original:
      "Svastha — established in oneself. Healing means returning to one's own ground, not the disappearance of every wound. The scar remains; the spinning around it stops.",
    prerequisite: "Acknowledgement. The wound has to be touched, not bypassed, before it can settle.",
    correction:
      "You are not your wound. You are the awareness in which the wound is held. Healing is the recognition of that, not the deletion of the wound.",
    category: "state",
  },
  {
    word: "Ego",
    sanskrit: "अहंकार — Ahaṃkāra",
    misuse: "A villain to be killed. 'My ego is so big.'",
    original:
      "Literally 'I-maker' — the function that bundles experience into 'I'. It is not evil; it is necessary for daily life. The problem is mistaking it for who you are, not having it.",
    prerequisite: "Watching it operate for a week, without trying to fix it, just noticing when 'I' appears in your sentences.",
    correction:
      "You do not kill the ego. You see through it. After that it still functions — like the keyboard you are reading on — but you no longer think you are the keyboard.",
    category: "concept",
  },
  {
    word: "Awareness",
    sanskrit: "चित् — Chit",
    misuse: "An object you can have, like a possession ('I have awareness').",
    original:
      "Pure knowing-ness. The light by which any experience is known. It is not a thing inside you. You are it. Everything else is an appearance in it.",
    prerequisite: "Distinguishing, even once, between a thought and the noticing of the thought.",
    correction:
      "You don't have awareness. Awareness has you. And on closer look, awareness is what you are.",
    category: "state",
  },
  {
    word: "Enlightenment",
    sanskrit: "मोक्ष — Mokṣa / बोधि — Bodhi",
    misuse: "A trophy. A permanent state of bliss. A spiritual finish line.",
    original:
      "The end of the search for an end. The recognition that what you were looking for was looking. There is no one left to be enlightened, which is precisely the point.",
    prerequisite: "Genuine exhaustion with every other strategy.",
    correction:
      "Enlightenment is not an experience. It is the seeing through of the one who would have experiences.",
    category: "state",
  },
  {
    word: "Tantra",
    sanskrit: "तन्त्र — Tantra",
    misuse: "Marketed as 'sacred sex weekends.'",
    original:
      "Loom, weave — a vast body of practices that weave the everyday (body, breath, sound, sense, relationship) into liberation. Sexuality is one strand of one school; the bulk is ritual, mantra, visualization, philosophy.",
    prerequisite: "A teacher in a real lineage. Tantra without lineage and ethics becomes harm dressed as freedom.",
    correction:
      "Tantra is the most demanding path — it uses everything, including what other paths renounce — and therefore the most dangerous one to play with.",
    category: "practice",
  },
  {
    word: "Energy",
    sanskrit: "प्राण — Prāṇa",
    misuse: "A vague vibe. 'Their energy was off.'",
    original:
      "Prāṇa — the intelligence that moves breath, blood, digestion, attention. It has five primary directions in the body (prāṇa, apāna, samāna, udāna, vyāna). It is felt, not theorized.",
    prerequisite: "Following one full breath, from nostril to belly to release, without losing it. Repeat for a week.",
    correction:
      "Energy is not a metaphor. It is a measurable somatic reality. Treat it like blood pressure — actual, not aesthetic.",
    category: "concept",
  },
  {
    word: "Sacred",
    sanskrit: "पवित्र — Pavitra",
    misuse: "An Instagram caption.",
    original:
      "That which restores you to the ground. A sacred space, object, or act is one designed (or recognized) to interrupt automaticity and return you to presence.",
    prerequisite: "Reverence. You must be able to bow inside, even when no one is watching.",
    correction:
      "Sacred is not a word you add. It is what is left when you remove everything performative.",
    category: "concept",
  },
];

export const GLOSSARY_CATEGORIES: Record<GlossaryEntry["category"], { label: string; color: string }> = {
  practice: { label: "Practice", color: "text-emerald-300" },
  state: { label: "State", color: "text-sky-300" },
  concept: { label: "Concept", color: "text-amber-300" },
  relationship: { label: "Relationship", color: "text-rose-300" },
};
