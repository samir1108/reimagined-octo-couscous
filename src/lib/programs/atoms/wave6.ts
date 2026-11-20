/**
 * Wave 6 atoms — Upanishad deep-dives.
 * 7 principal Upanishads: Isha, Kena, Katha, Mundaka, Mandukya, Chandogya, Brihadaranyaka.
 */
import type { Atom } from "../types";

const read = (
  id: string,
  label: string,
  intent: string,
  body: string,
  tags: string[] = [],
): Atom => ({
  id,
  category: "wisdom-read",
  label,
  intent,
  durationSec: { min: 60, typical: 120, max: 240 },
  level: 0,
  modality: "read",
  intensity: "gentle",
  gates: ["any"],
  energy: ["low", "medium", "high"],
  body,
  tags,
});

const teach = (
  id: string,
  label: string,
  intent: string,
  body: string,
  level = 0,
): Atom => ({
  id,
  category: "teaching",
  label,
  intent,
  durationSec: { min: 90, typical: 150, max: 300 },
  level,
  modality: "read",
  intensity: "balanced",
  gates: ["any"],
  energy: ["low", "medium", "high"],
  body,
});

export const WAVE6_ATOMS: Atom[] = [
  // ─── Isha Upanishad ───
  read("wisdom.isha.1", "Isha Upanishad 1", "The whole is the self",
    "Isa vasyam idam sarvam — all this is the self. Renounce and enjoy. Do not covet. The self is in all, and all is in the self.", ["isha", "upanishad"]),
  read("wisdom.isha.3", "Isha Upanishad 3", "The self is beyond the darkness",
    "Asurya nama — the self is beyond the darkness of the mind. Those who see the self as the self are free.", ["isha", "upanishad"]),
  read("wisdom.isha.15", "Isha Upanishad 15", "The hymn of the self",
    "Hira-maya — the self is golden, radiant, in the heart. Meditate on it as the knower, the seer, the source.", ["isha", "upanishad"]),
  teach("teach.isha", "Isha Upanishad — the self in all", "Renounce and enjoy",
    "The Isha Upanishad opens with 'all this is the self.' The path is not renunciation of the world, but renunciation of the attachment to the world. Enjoy what is yours, but do not covet. The self is the witness of all.", 0),

  // ─── Kena Upanishad ───
  read("wisdom.kena.1", "Kena Upanishad 1", "Who is the knower?",
    "Kena — by whom? The mind cannot know the self. The eye cannot see it. The ear cannot hear it. Only the self knows itself.", ["kena", "upanishad"]),
  read("wisdom.kena.2", "Kena Upanishad 2", "The self taught by silence",
    "The gods asked Brahman: what is your form? Brahman answered through silence. The self is known not by words, but by silence.", ["kena", "upanishad"]),
  read("wisdom.kena.12", "Kena Upanishad 12", "The self is the eye of the eye",
    "The self is not what the eye sees. The self is the eye of the eye, the ear of the ear, the mind of the mind. It is the knower of all knowing.", ["kena", "upanishad"]),
  teach("teach.kena", "Kena Upanishad — by whom?", "The self is not an object",
    "The Kena asks: who is the knower? The mind cannot know the self because the self is the knower of the mind. The self is not an object of knowledge — it is the subject, the awareness behind the knowledge.", 1),

  // ─── Katha Upanishad ───
  read("wisdom.katha.1.2", "Katha Upanishad 1.2", "The chariot",
    "The body is the chariot, the self is the rider, the mind is the reins, the intellect is the charioteer, the senses are the horses. When the mind is mastered, the self rests.", ["katha", "upanishad"]),
  read("wisdom.katha.1.3", "Katha Upanishad 1.3", "The self is beyond the senses",
    "The self is above the senses, above the mind, above the intellect. It is the supreme. Only those who know it are free.", ["katha", "upanishad"]),
  read("wisdom.katha.2.1", "Katha Upanishad 2.1", "The subtle path",
    "The good is one thing, the pleasant another. The wise choose the good, the foolish choose the pleasant. The path to the self is subtle — like a razor's edge.", ["katha", "upanishad"]),
  read("wisdom.katha.2.23", "Katha Upanishad 2.23", "The self cannot be known by words",
    "The self is not born, does not die. It is not the mind, not the senses, not the body. It is the eternal, unchanging witness.", ["katha", "upanishad"]),
  teach("teach.katha", "Katha Upanishad — the deathless self", "The razor's edge",
    "The Katha tells the story of Nachiketa, a boy who confronts death and asks Yama the ultimate question: what happens after death? Yama teaches the path of the self: the subtle path, the razor's edge. The self is beyond the senses, beyond the mind, beyond death itself.", 1),

  // ─── Mundaka Upanishad ───
  read("wisdom.mundaka.1.1", "Mundaka Upanishad 1.1", "The two knowledges",
    "There are two knowledges: the higher and the lower. The lower is the Vedas, the higher is the self. The self is known by the wise.", ["mundaka", "upanishad"]),
  read("wisdom.mundaka.2.2", "Mundaka Upanishad 2.2", "The bow and the arrow",
    "Take the bow of the Upanishad, place the arrow of meditation, aim at the self, and release. The self is the target, the self is the arrow, the self is the bow.", ["mundaka", "upanishad"]),
  read("wisdom.mundaka.3.1", "Mundaka Upanishad 3.1", "The two birds",
    "Two birds, inseparable friends, sit on the same tree. One eats the fruit, the other watches. The one who watches is the self.", ["mundaka", "upanishad"]),
  teach("teach.mundaka", "Mundaka Upanishad — the arrow of meditation", "Aim at the self",
    "The Mundaka teaches the two knowledges: the lower (ritual) and the higher (self-knowledge). The self is the target. Take the bow of the Upanishad, the arrow of meditation, and aim at the self. The self is the arrow, the self is the bow, the self is the target.", 2),

  // ─── Mandukya Upanishad ───
  read("wisdom.mandukya.1", "Mandukya Upanishad 1", "Om — the whole is Om",
    "Om is the whole. The past, the present, the future — all is Om. That which is beyond time is also Om.", ["mandukya", "upanishad"]),
  read("wisdom.mandukya.3", "Mandukya Upanishad 3", "The four states",
    "The self has four states: waking (Vaishvanara), dream (Taijasa), deep sleep (Prajna), and turiya (the fourth). Om is the syllable that contains all four.", ["mandukya", "upanishad"]),
  read("wisdom.mandukya.12", "Mandukya Upanishad 12", "Turiya — the fourth",
    "Turiya is not the waking, not the dream, not the deep sleep. It is the self, the unchanging, the whole. It is Om.", ["mandukya", "upanishad"]),
  teach("teach.mandukya", "Mandukya Upanishad — Om and the four states", "Turiya is the self",
    "The Mandukya is the shortest but deepest Upanishad. It declares: the whole is Om. Om has four parts: A (waking), U (dream), M (deep sleep), and the silence after (turiya). Turiya is the self — the unchanging, the whole, the source of all states.", 1),

  // ─── Chandogya Upanishad ───
  read("wisdom.chandogya.3.14", "Chandogya Upanishad 3.14", "Tat tvam asi",
    "Tat tvam asi — you are that. The self that is in you is the self that is in all. You are not the body, not the mind — you are the self.", ["chandogya", "upanishad"]),
  read("wisdom.chandogya.6.2", "Chandogya Upanishad 6.2", "The self is the essence",
    "The self is the subtle essence of all. All this is the self. You are that self — the whole, the unchanging, the source.", ["chandogya", "upanishad"]),
  read("wisdom.chandogya.7.26", "Chandogya Upanishad 7.26", "The light within",
    "The light that shines in the heart — that is the self. It is the light of all lights. It is the source of all knowing.", ["chandogya", "upanishad"]),
  teach("teach.chandogya", "Chandogya Upanishad — tat tvam asi", "You are that",
    "The Chandogya teaches: tat tvam asi — you are that. The self in you is the self in all. The self is the subtle essence of all existence. When you know the self, you know the whole. You are not the body, not the mind — you are the self, the whole, the unchanging.", 0),

  // ─── Brihadaranyaka Upanishad ───
  read("wisdom.brihad.1.4", "Brihadaranyaka Upanishad 1.4", "The self is the world",
    "The self is the world. The self is the gods. The self is the Vedas. The self is all. When you know the self, you know all.", ["brihadaranyaka", "upanishad"]),
  read("wisdom.brihad.3.4", "Brihadaranyaka Upanishad 3.4", "The self is the eye of the eye",
    "The self is the eye of the eye, the ear of the ear, the mind of the mind. It is the knower of all knowing, the witness of all witnessing.", ["brihadaranyaka", "upanishad"]),
  read("wisdom.brihad.4.4", "Brihadaranyaka Upanishad 4.4", "The self is the immortal",
    "The self is the immortal. It is not born, does not die. It is the unchanging, the whole, the source. When you know the self, you are free.", ["brihadaranyaka", "upanishad"]),
  teach("teach.brihadaranyaka", "Brihadaranyaka Upanishad — the great forest", "The self is all",
    "The Brihadaranyaka, the 'great forest' Upanishad, is the longest and deepest. It teaches: the self is all. The self is the eye of the eye, the ear of the ear. It is the immortal, the unchanging, the source. When you know the self, you know the whole — you are free.", 2),
];