/**
 * Wave 13 atoms — Gunas + Kleshas.
 * The 3 gunas (sattva, rajas, tamas) and 5 kleshas (avidya, asmita, raga, dvesha, abhinivesha).
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
  category: "observation",
  label,
  intent,
  durationSec: { min: 180, typical: 300, max: 600 },
  level,
  modality: "sit",
  intensity,
  gates,
  energy: ["low", "medium", "high"],
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

export const WAVE13_ATOMS: Atom[] = [
  // ─── Gunas (3) wisdom-read atoms ───
  read("wisdom.guna.sattva", "Sattva Guna", "Purity, clarity, harmony, light",
    "Sattva is the guna of purity, clarity, and harmony. It is the principle of illumination. When sattva predominates, the mind is clear, the body is light, and wisdom arises naturally. It binds through attachment to happiness and knowledge.", ["guna", "sattva", "clarity"]),
  read("wisdom.guna.rajas", "Rajas Guna", "Activity, passion, restlessness, desire",
    "Rajas is the guna of activity, passion, and motion. It is the principle of dynamism. When rajas predominates, the mind is restless, driven by desire, and caught in constant doing. It binds through attachment to action and its fruits.", ["guna", "rajas", "activity"]),
  read("wisdom.guna.tamas", "Tamas Guna", "Inertia, darkness, heaviness, ignorance",
    "Tamas is the guna of inertia, darkness, and heaviness. It is the principle of resistance. When tamas predominates, the mind is dull, the body is heavy, and ignorance prevails. It binds through delusion, negligence, and sleep.", ["guna", "tamas", "inertia"]),

  // ─── Kleshas (5) wisdom-read atoms ───
  read("wisdom.klesha.avidya", "Avidya", "Ignorance — the root klesha, mistaking the unreal for real",
    "Avidya is the fundamental ignorance that mistakes the non-self for the self, the impermanent for the permanent, the impure for the pure, and suffering for happiness. It is the root from which all other kleshas grow.", ["klesha", "avidya", "ignorance"]),
  read("wisdom.klesha.asmita", "Asmita", "Egoism — identifying the seer with the seen",
    "Asmita is the false identification of the pure seer (purusha) with the instruments of seeing (body, mind, senses). It creates the sense of 'I am the body, I am the mind, I am the doer.'", ["klesha", "asmita", "ego"]),
  read("wisdom.klesha.raga", "Raga", "Attachment — the pull toward pleasure",
    "Raga is the magnetic pull toward anything that has previously given pleasure. It creates a compulsive reaching toward objects, experiences, and states. It binds through the memory of pleasure.", ["klesha", "raga", "attachment"]),
  read("wisdom.klesha.dvesha", "Dvesha", "Aversion — the push away from pain",
    "Dvesha is the violent push away from anything that has previously caused pain. It creates a compulsive avoidance of objects, experiences, and states. It binds through the memory of suffering.", ["klesha", "dvesha", "aversion"]),
  read("wisdom.klesha.abhinivesha", "Abhinivesha", "Fear of death — clinging to life",
    "Abhinivesha is the instinctive, deep-seated clinging to bodily life. Even the wise are subject to it. It is the fear that 'I will cease to be.' It is the strongest klesha, operating even in the learned.", ["klesha", "abhinivesha", "fear-of-death"]),

  // ─── Teaching atoms ───
  teach("teach.guna.overview", "The three gunas — the fabric of nature", "Sattva, rajas, tamas — the three threads of prakriti",
    "The gunas are the three fundamental qualities of nature (prakriti). They are always present in varying proportions. Sattva = clarity, light, harmony. Rajas = activity, passion, motion. Tamas = inertia, darkness, heaviness. The gunas bind the self to the world. Transcending the gunas (gunatita) is the goal of yoga. Cultivate sattva to transcend rajas and tamas, then transcend even sattva.", 1),
  teach("teach.guna.cultivate", "Cultivating the gunas", "Move from tamas → rajas → sattva → transcendence",
    "Tamas is overcome by rajas (action). Rajas is refined into sattva (clarity, moderation, study). Sattva is transcended by gunatita (going beyond the gunas). Diet: sattvic foods (fresh, light, pure) increase sattva. Rajasic foods (spicy, stimulating) increase rajas. Tamasic foods (stale, heavy, intoxicating) increase tamas. Practice: asana, pranayama, and meditation shift the gunas toward sattva.", 1),
  teach("teach.klesha.overview", "The five kleshas — the afflictions that bind", "Avidya is the root; the other four grow from it",
    "The kleshas are the five afflictions that cause suffering: 1) Avidya (ignorance) — the root. 2) Asmita (egoism) — 'I am this body/mind.' 3) Raga (attachment) — 'I want this.' 4) Dvesha (aversion) — 'I reject this.' 5) Abhinivesha (fear of death) — 'I will cease.' They are not separate; they are a chain. Avidya births asmita; asmita creates raga and dvesha; raga/dvesha strengthen abhinivesha. Dissolve avidya, and the chain dissolves.", 1),
  teach("teach.klesha.dissolve", "Dissolving the kleshas", "From gross to subtle, through discrimination and practice",
    "The kleshas exist in four states: dormant (prasupta), attenuated (tanu), alternating (vicchinna), active (udara). Yoga attenuates them: yama/niyama weaken the gross manifestations; asana/pranayama calm rajas/tamas; pratyahara/dharana reduce raga/dvesha; dhyana/samadhi dissolve avidya/asmita. The root avidya is dissolved only by discriminative knowledge (viveka khyati) in samadhi.", 2),
];