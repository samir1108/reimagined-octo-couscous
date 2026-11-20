/**
 * Wave 15 atoms — Shiva Samhita + Kashmir Shaivism.
 * The third classic Hatha text + the non-dual Shaiva tradition.
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

const practice = (
  id: string,
  label: string,
  intent: string,
  script: string[],
  level = 1,
  intensity: Atom["intensity"] = "balanced",
  gates: Atom["gates"] = ["any"],
): Atom => ({
  id,
  category: "kriya",
  label,
  intent,
  durationSec: { min: 180, typical: 300, max: 600 },
  level,
  modality: "sit",
  intensity,
  gates,
  energy: ["medium", "high"],
  script,
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

const meditation = (
  id: string,
  label: string,
  intent: string,
  script: string[],
  level = 2,
  intensity: Atom["intensity"] = "balanced",
): Atom => ({
  id,
  category: "meditation",
  label,
  intent,
  durationSec: { min: 300, typical: 600, max: 1800 },
  level,
  modality: "sit",
  intensity,
  gates: ["any"],
  energy: ["low", "medium"],
  script,
});

export const WAVE15_ATOMS: Atom[] = [
  // ─── Shiva Samhita wisdom-read atoms ───
  read("wisdom.shiva.1", "Shiva Samhita Chapter 1", "The dialogue of Shiva and Parvati — Hatha Yoga revealed",
    "Shiva teaches Parvati: Hatha Yoga is the stairway to Raja Yoga. The body is the temple, the breath is the bridge, the mind is the key. 84 asanas, mudras, bandhas, pranayamas, and the awakening of kundalini.", ["shiva-samhita", "hatha"]),
  read("wisdom.shiva.2", "Shiva Samhita Chapter 2", "Pranayama — the 10 kumbhakas and the nadis",
    "The 72,000 nadis, the three main ones: Ida (lunar), Pingala (solar), Sushumna (central). The 10 kumbhakas: suryabhedana, ujjayi, sheetali, bhastrika, bhramari, moorchha, khecari, kevala, plavini, sahita. The three bandhas: mula, uddiyana, jalandhara.", ["shiva-samhita", "pranayama", "nadis"]),
  read("wisdom.shiva.3", "Shiva Samhita Chapter 3", "Mudras, bandhas, and the awakening of kundalini",
    "The 10 mudras: mahamudra, mahabandha, mahavedha, khecari, uddiyana, mula, jalandhara, viparita, viparita karani, shakti. The three knots: Brahma, Vishnu, Rudra. When kundalini rises, it pierces the knots and unites with Shiva in sahasrara.", ["shiva-samhita", "mudra", "kundalini"]),
  read("wisdom.shiva.4", "Shiva Samhita Chapter 4", "Samadhi and the signs of perfection",
    "The four types of samadhi: savikalpa, nirvikalpa, sahaja, and the fourth beyond description. The signs: lightness, health, clarity, radiance, sweet voice, bright eyes. The yogi becomes free from disease, old age, and death.", ["shiva-samhita", "samadhi", "perfection"]),
  read("wisdom.shiva.5", "Shiva Samhita Chapter 5", "The nature of the self and liberation",
    "The self is Shiva — pure consciousness, beyond birth and death. The world is the play of Shiva's power. Liberation is recognizing this identity while living (jivanmukti). The yogi who knows this is Shiva himself.", ["shiva-samhita", "liberation", "jivanmukti"]),

  // ─── Kashmir Shaivism / Shiva Sutras ───
  read("wisdom.shivasutra.1", "Shiva Sutra 1.1", "Consciousness is the self",
    "Caitanyam atma — consciousness itself is the self. Not the body, not the mind, not the ego. The self is the light of consciousness that illuminates all experience.", ["shiva-sutras", "kashmir-shaivism", "consciousness"]),
  read("wisdom.shivasutra.2", "Shiva Sutra 1.2", "Knowledge is bondage",
    "Jnanam bandhah — ordinary knowledge (dualistic, objectifying) is bondage. True knowledge is the direct recognition of one's own nature as consciousness. The path is not acquiring knowledge, but unlearning false knowledge.", ["shiva-sutras", "kashmir-shaivism", "recognition"]),
  read("wisdom.shivasutra.3", "Shiva Sutra 1.3", "The universe is the play of consciousness",
    "Yonih sarvam — the womb of all is consciousness. The world is not separate from Shiva; it is Shiva's self-expression (kriya). The universe is the play (lila) of consciousness knowing itself.", ["shiva-sutras", "kashmir-shaivism", "lila"]),
  read("wisdom.shivasutra.4", "Shiva Sutra 3.37", "The heart is the center",
    "Hridayam — the heart is the center of the universe. In the space of the heart, the entire universe is contained. Meditation on the heart-space reveals the non-dual reality.", ["shiva-sutras", "kashmir-shaivism", "heart"]),
  read("wisdom.spanda.1", "Spanda Karika 1.1", "The divine vibration — spanda",
    "Spanda is the subtle creative pulsation of consciousness. It is the vibration that manifests as the universe. Resting in spanda is the essence of Kashmir Shaivism meditation.", ["spanda", "kashmir-shaivism", "vibration"]),

  // ─── Vijnana Bhairava ───
  read("wisdom.vijnanabhairava", "Vijnana Bhairava", "112 ways to recognize the true nature",
    "Bhairava teaches Bhairavi 112 dharanas (methods of concentration) to recognize the true nature. They cover breath, sound, sight, touch, thought, emotion, space, and the transitions between states. Each is a doorway to the same recognition.", ["vijnana-bhairava", "kashmir-shaivism", "112-methods"]),

  // ─── Teaching atoms ───
  teach("teach.shiva.overview", "Shiva Samhita — the third classic Hatha text", "Shiva teaches Parvati the complete Hatha Yoga",
    "The Shiva Samhita is a dialogue between Shiva and Parvati. It covers: asanas, mudras, bandhas, pranayamas, nadis, kundalini, samadhi, and jivanmukti. It emphasizes the non-dual context: Hatha Yoga is not separate from the recognition of Shiva-nature. The body is the temple, the practice is the worship, the goal is recognition.", 1),
  teach("teach.shivasutra.overview", "Shiva Sutras — the direct path of recognition", "Consciousness is the self; recognize it directly",
    "The Shiva Sutras (revealed to Vasugupta) are the foundational text of Kashmir Shaivism. 77 sutras in 3 sections: 1) Shambhavopaya (direct recognition), 2) Shaktopaya (energy/mantra path), 3) Anavopaya (individual effort path). The core: consciousness IS the self. No practice needed — only recognition. But since we don't recognize, practices are given.", 2),
  teach("teach.spanda", "Spanda — the divine pulsation", "Rest in the creative vibration of consciousness",
    "Spanda is the subtle throb of consciousness that creates, sustains, and dissolves the universe. It is felt as the vibration between breaths, the gap between thoughts, the pulsation of the heart. Resting in spanda is the meditation of Kashmir Shaivism — not concentrating on an object, but recognizing the vibration itself as Shiva.", 2),
  teach("teach.vijnanabhairava", "Vijnana Bhairava — 112 doorways", "Every experience is a doorway to recognition",
    "The Vijnana Bhairava gives 112 methods (dharanas) to recognize the true nature. They are not sequential — any one can liberate. Categories: breath-centered, sound-centered, sight-centered, touch-centered, thought-centered, emotion-centered, space-centered, transition-centered. The method is the doorway; the recognition is the room.", 2),
  teach("teach.kashmir.recognition", "Pratyabhijna — the philosophy of recognition", "You are already that which you seek",
    "Pratyabhijna (recognition) is the core philosophy: you are already Shiva, already free. The problem is not bondage but forgetfulness. The path is not becoming but remembering. Practices (upayas) are reminders: Shambhavopaya (instant recognition), Shaktopaya (mantra/energy), Anavopaya (individual effort). The grace (shaktipata) is the catalyst.", 3),
];