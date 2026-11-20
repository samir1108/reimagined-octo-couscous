/**
 * Wave 9 atoms — The 6 Darshanas (orthodox philosophy schools).
 * Samkhya, Yoga, Nyaya, Vaisheshika, Mimamsa, Vedanta.
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
  level = 1,
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

export const WAVE9_ATOMS: Atom[] = [
  // ─── Samkhya ───
  read("wisdom.darshana.samkhya", "Samkhya Karika", "Enumeration — purusha and prakriti",
    "Samkhya means enumeration. It lists 25 tattvas: purusha (consciousness), prakriti (nature), and the 23 evolutes. The goal is kaivalya — isolation of purusha from prakriti through discriminative knowledge.", ["darshana", "samkhya"]),
  teach("teach.darshana.samkhya", "Samkhya — the path of enumeration", "Know the 25 principles, free the purusha",
    "Samkhya is the oldest orthodox system. It teaches duality: purusha (pure consciousness, the seer) and prakriti (nature, the seen). Prakriti evolves into 23 principles: mahat (intellect), ahamkara (ego), 5 tanmatras, 5 sense organs, 5 action organs, 5 elements. Liberation is realizing purusha is distinct from all these.", 1),

  // ─── Yoga Darshana ───
  read("wisdom.darshana.yoga", "Yoga Sutras", "The system of Patanjali — 8 limbs to kaivalya",
    "Yoga Darshana is the practical application of Samkhya philosophy. The 8 limbs (yama, niyama, asana, pranayama, pratyahara, dharana, dhyana, samadhi) lead to the cessation of mental fluctuations and the isolation of purusha.", ["darshana", "yoga"]),
  teach("teach.darshana.yoga", "Yoga Darshana — the eight-limbed path", "Practice stills the mind, knowledge frees the self",
    "While Samkhya is theoretical, Yoga is practical. The 8 limbs are the means to still the mind's fluctuations. When the mind is still, the seer rests in its own nature. Ishvara pranidhana (surrender to the supreme) accelerates the path.", 1),

  // ─── Nyaya ───
  read("wisdom.darshana.nyaya", "Nyaya Sutras", "Logic and epistemology — the path of reason",
    "Nyaya means logic. It defines 4 means of valid knowledge: perception, inference, comparison, testimony. It uses a 5-step syllogism. The goal is liberation through correct knowledge that removes false notions.", ["darshana", "nyaya"]),
  teach("teach.darshana.nyaya", "Nyaya — the path of logic", "Reason correctly, remove false knowledge",
    "Nyaya is the school of logic and debate. It provides the methodological toolkit for all darshanas: how to know what is true. Its 16 categories include pramana (valid knowledge), prameya (objects of knowledge), and nigrahasthana (point of defeat). Correct reasoning removes the ignorance that binds.", 1),

  // ─── Vaisheshika ───
  read("wisdom.darshana.vaisheshika", "Vaisheshika Sutras", "Atomism and categories — the nature of reality",
    "Vaisheshika categorizes reality into 7 padarthas: substance, quality, action, generality, particularity, inherence, non-existence. It posits eternal atoms (paramanu) as the building blocks of the physical world.", ["darshana", "vaisheshika"]),
  teach("teach.darshana.vaisheshika", "Vaisheshika — the atomic theory", "Know the categories, transcend the compound",
    "Vaisheshika teaches that the world is made of eternal atoms combining into compounds. The 7 categories (padarthas) map all existence. Liberation comes from understanding the true nature of reality and detaching from the compounds of experience.", 1),

  // ─── Mimamsa ───
  read("wisdom.darshana.mimamsa", "Mimamsa Sutras", "Vedic exegesis — the path of ritual and duty",
    "Mimamsa means investigation. It focuses on dharma as revealed in the Vedas. It develops sophisticated hermeneutics for interpreting Vedic injunctions. The goal is heaven (svarga) through correct ritual performance, ultimately leading to liberation.", ["darshana", "mimamsa"]),
  teach("teach.darshana.mimamsa", "Mimamsa — the path of duty and interpretation", "Perform your duty, understand the Veda",
    "Mimamsa develops the science of Vedic interpretation. It teaches that dharma is known only through the Vedas, and performing Vedic rituals correctly yields results. Later Mimamsa (Uttara) merges with Vedanta. The discipline of correct action purifies the mind for self-knowledge.", 1),

  // ─── Vedanta ───
  read("wisdom.darshana.vedanta", "Brahma Sutras / Upanishads", "The end of the Vedas — non-dual self",
    "Vedanta is the culmination of the Vedas. The Brahma Sutras systematize the Upanishadic teaching: Brahman is the only reality, the world is appearance (maya), the individual self (jiva) is Brahman. Liberation is knowledge of this identity.", ["darshana", "vedanta"]),
  teach("teach.darshana.vedanta", "Vedanta — the culmination", "Brahman alone is real, the world is appearance, the self is Brahman",
    "Vedanta is the end (anta) of the Vedas. Its core teaching: tat tvam asi — you are that. The three texts (prasthana trayam): Upanishads (revealed), Brahma Sutras (reasoned), Bhagavad Gita (practical). The path: shravana (hearing), manana (reflection), nididhyasana (meditation).", 1),
];