/**
 * The HOPE Dictionary
 * ──────────────────────────
 * Open-source vocabulary of the consciousness operating system.
 * Each term: definition + tradition (where it comes from) + science +
 * example. SEO-optimized via JSON-LD DefinedTerm schema.
 */
export interface DictionaryTerm {
  slug: string;
  term: string;
  short: string;
  tradition: string;
  science: string;
  example: string;
  related?: string[];
}

export const DICTIONARY: DictionaryTerm[] = [
  {
    slug: "loop",
    term: "Loop",
    short:
      "A repeating pattern of thought, feeling, and behavior that runs without your conscious permission.",
    tradition:
      "The yogis called it samskara — a groove cut into the mind by repetition. The deeper the groove, the more automatic the response.",
    science:
      "Behavioral neuroscience calls this a habit loop: cue → craving → routine → reward. Runs in roughly 90 milliseconds, faster than deliberate thought.",
    example:
      "Refreshing email when bored. Apologizing before being criticized. Checking your phone the instant a meeting ends.",
    related: ["samskara", "v-level", "sakshi"],
  },
  {
    slug: "v-level",
    term: "V-Level",
    short:
      "A measurable band of consciousness, from 0 (heaviness) to 10 (pure witness). Shapes what you see, feel, and choose.",
    tradition:
      "Vedic traditions mapped consciousness in bands — tamas, rajas, sattva, turiya — each with its own perception of reality.",
    science:
      "Translated into 11 measurable bands using behavioral signals, biometric proxies, and self-report. Each band predicts default response patterns.",
    example:
      "A user at Band 3 reads criticism as attack. The same user at Band 7 reads the same words as data.",
    related: ["loop", "consciousness-score", "sakshi"],
  },
  {
    slug: "three-brains",
    term: "Three Brains",
    short:
      "The head, heart, and gut centers — three intelligences that often disagree.",
    tradition:
      "Tantra mapped them as Manas (head), Hridaya (heart), Manipura (gut). Each was treated as a separate seat of knowing.",
    science:
      "Modern research confirms it: ~86B neurons in the head brain, ~40,000 in the heart, ~500M in the gut. All three send and receive signals.",
    example:
      "Head says take the job. Heart says no. Gut says wait. The wise move is the conversation, not the verdict.",
    related: ["v-level", "loop"],
  },
  {
    slug: "sakshi",
    term: "Sakshi",
    short:
      "The witness state. The part of you that watches your mind as if it belonged to someone else.",
    tradition:
      "Advaita Vedanta's central practice. Sakshi Bhav — the cultivation of pure witness — predates psychology by 3,000 years.",
    science:
      "Sustained witnessing quiets the default mode network and increases activity in the salience network. Measurably reduces rumination.",
    example:
      "Anxiety arises. Instead of becoming anxious, you notice 'anxiety is arising.' The naming alone shifts the state.",
    related: ["three-brains", "v-level"],
  },
  {
    slug: "samskara",
    term: "Samskara",
    short:
      "A latent impression left in the mind by past experience. The seed of every loop.",
    tradition:
      "Sanskrit. Used in Yoga and Buddhist psychology to describe the residue that shapes future perception.",
    science:
      "Maps cleanly onto modern long-term potentiation — the strengthening of synapses through repeated firing. Memory becomes pattern.",
    example:
      "A child criticized for crying grows up to suppress sadness. The samskara fires before the sadness ever reaches consciousness.",
    related: ["loop", "v-level"],
  },
  {
    slug: "consciousness-score",
    term: "Consciousness Score",
    short:
      "A 0–1000 metric estimating the depth and stability of a user's awareness across dimensions.",
    tradition:
      "Inspired by the band-based mapping of consciousness in the Vedic and Sufi traditions.",
    science:
      "Computed from V-Level, dimension balance, loop mastery (catches per fire), and consistency of practice. Updated daily.",
    example:
      "Sarah's CScore moves from 412 to 478 over six weeks of consistent witness practice. The number tracks the lived shift.",
    related: ["v-level", "loop"],
  },
  {
    slug: "lineage",
    term: "Lineage",
    short:
      "The three historical masters whose path most closely matches your current trajectory.",
    tradition:
      "Parampara — the unbroken thread of teacher to student. In every tradition, you were not supposed to walk alone.",
    science:
      "Assigned by clustering your strongest dimension and dominant inner brain against a curated library of master profiles.",
    example:
      "Awareness-dominant, gut-led: Ramana → Nisargadatta → Adyashanti. You stand in a very specific line.",
    related: ["v-level"],
  },
  {
    slug: "loop-reveal",
    term: "Loop Reveal",
    short:
      "The first cinematic moment when a user sees a loop they didn't know they were running.",
    tradition:
      "Echoes the classical satori — a sudden seeing through a long-held delusion. Not transcendent. Diagnostic.",
    science:
      "Pattern naming reduces amygdala activation and increases prefrontal recruitment (Lieberman et al., 2007). Naming weakens the loop.",
    example:
      "VAL001 — Validation Seeking. You just hit it. 73% of knowledge workers run this loop daily. Seeing it is the first crack.",
    related: ["loop", "samskara"],
  },
  {
    slug: "survival-mode",
    term: "Survival Mode",
    short:
      "The default operating system inherited from millions of years of evolution. Built to survive, not to live.",
    tradition:
      "The yogis called it pashu-bhava — the animal nature. Eat, defend, mate, repeat. Useful for the jungle. Tragic for the office.",
    science:
      "The amygdala fires faster than the prefrontal cortex by ~200ms. Same circuitry that ran from tigers now runs from unread Slack messages and unpaid EMIs.",
    example:
      "You wake up, check the phone, rush to the job, chase the monthly salary, sleep, repeat. Biologically identical to a deer grazing between predators.",
    related: ["loop", "v-level", "sakshi"],
  },
  {
    slug: "maun",
    term: "Maun",
    short:
      "Silence — not the absence of sound, but the absence of inner commentary. The original language of the self.",
    tradition:
      "Ramana Maharshi taught primarily in maun. Mahavir held it for 12 years. In every tradition, silence was treated as the highest teaching.",
    science:
      "Two minutes of silence lowers cortisol more than 'relaxing' music. Sustained silence regenerates neurons in the hippocampus (Kirste et al., 2013).",
    example:
      "Sit. Don't fix your posture. Don't follow the breath. Just stop talking to yourself. Notice what remains. That noticing is you.",
    related: ["sakshi", "three-brains", "observation"],
  },
  {
    slug: "body-mind-soul",
    term: "Body · Mind · Soul",
    short:
      "Three nested vehicles you mistake for yourself. You are none of them. You are what watches all three.",
    tradition:
      "Sadhguru: 'I am not my body, I am not even my mind.' Adi Shankara's panchakosha mapped five sheaths, each finer than the last.",
    science:
      "Identity is constructed in the default mode network. Lesion studies and meditation imaging both show: when DMN quiets, the felt 'I' loosens — and awareness remains.",
    example:
      "Cut your hair — you remain. Forget a memory — you remain. Drop a belief — you remain. What never leaves is the only thing worth calling 'you.'",
    related: ["sakshi", "three-brains", "maun"],
  },
  {
    slug: "observation",
    term: "Observation",
    short:
      "The act of watching a thought without becoming it. Each watching weakens the thought's grip — until it dissolves.",
    tradition:
      "Vipassana's core method. Krishnamurti called it 'choiceless awareness.' Zen calls it shikantaza — just sitting, just seeing.",
    science:
      "Labeling an emotion ('this is anger') drops amygdala activation by ~50% and recruits the right ventrolateral prefrontal cortex (Lieberman, 2007). Naming defangs.",
    example:
      "A thought arises: 'I'm not enough.' You don't argue. You don't believe. You just watch it. By the third watching, it has lost half its weight. By the tenth, it forgets to come.",
    related: ["sakshi", "loop", "samskara"],
  },
  {
    slug: "three-llms",
    term: "Three LLMs",
    short:
      "The three internal language models — head, heart, gut — that narrate your life without your permission. You are their user, not their author.",
    tradition:
      "Tantra mapped three sovereign intelligences. Modern framing: each runs its own large language model, trained on your past, predicting your next move.",
    science:
      "The head LLM is trained on cultural conditioning. The heart LLM on attachment patterns. The gut LLM on primal threat memory. All three speak in 'I' — none of them is you.",
    example:
      "Head says 'take the safe job.' Heart says 'follow the passion.' Gut says 'something is off.' You aren't any voice — you are the one who hears all three and chooses.",
    related: ["three-brains", "loop", "sakshi"],
  },
  {
    slug: "evolution-trap",
    term: "Evolution Trap",
    short:
      "The mismatch between a stone-age nervous system and a screen-age life. Hardware from 200,000 BCE running 2026 software.",
    tradition:
      "Krishna in the Gita: 'The senses are turbulent, they violently snatch away the mind.' Written 5,000 years ago — the trap was already visible.",
    science:
      "Dopamine circuits evolved to reward calorie discovery and tribal status. The same circuits now fire for likes, scrolling, and shopping carts. The trap is biochemical, not moral.",
    example:
      "You don't want to scroll. You scroll anyway. Not weakness — wiring. Seeing this is the first step out. The wiring is updatable.",
    related: ["survival-mode", "loop", "samskara"],
  },
];

export function getTermBySlug(slug: string): DictionaryTerm | undefined {
  return DICTIONARY.find((t) => t.slug === slug);
}
