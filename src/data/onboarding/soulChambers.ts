/**
 * The 60-minute "Meet Yourself" onboarding — 7 chambers.
 *
 * Not a signup form. A ritual that produces the seed data every LLM in the
 * app reads on every call: which loops to surface, which guru voice, which
 * yoga path & entry level, which teachings to withhold, what NEVER to say.
 *
 * Every chamber is skippable. Every answer is optional. Progress saves after
 * every question. Revisitable forever.
 */

export type PathSlug = "bhakti" | "jnana" | "karma" | "raja" | "tantra" | "shakti";

export type QuestionKind =
  | "single" | "multi" | "slider" | "text" | "longtext" | "scale5";

export type DerivedLayer =
  | "surface" | "somatic" | "psychological" | "karmic"
  | "doorway" | "shadow" | "prohibitions"
  | "archetype" | "loops" | "band" | "council" | "witness";

export interface QuestionOption {
  value: string;
  label: string;
  hint?: string;
  weights?: Partial<Record<PathSlug, number>>;
}

export interface Question {
  id: string;
  kind: QuestionKind;
  prompt: string;
  subprompt?: string;
  placeholder?: string;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  maxSelect?: number;
  writesTo: DerivedLayer;
  derivedKey?: string;
}

export interface Chamber {
  number: number;                 // 1..12
  slug: string;
  title: string;
  subtitle: string;
  estMinutes: number;
  intro: string;
  outro: string;
  breathCue?: "in" | "out" | "still" | "hold";
  questions: Question[];
}

const CHAMBER_1: Chamber = {
  number: 1, slug: "arrival",
  title: "Arrival",
  subtitle: "Who is here right now?",
  estMinutes: 5,
  intro: "Before we ask anything about you, notice: who walked in here just now? Not your name. Not your job. Just — what state is here?",
  outro: "Good. You've arrived. The rest is easier now.",
  breathCue: "still",
  questions: [
    { id: "arrival_state", kind: "single", writesTo: "somatic",
      prompt: "Right now, in this body — what is here?",
      subprompt: "Not what you want to be. What actually is.",
      options: [
        { value: "wired", label: "Wired — mind racing, body tight" },
        { value: "foggy", label: "Foggy — dull, half-here" },
        { value: "grieving", label: "A quiet weight — some grief nearby" },
        { value: "restless", label: "Restless — can't quite land" },
        { value: "peaceful", label: "Actually pretty peaceful" },
        { value: "numb", label: "Numb — I don't really know" },
      ] },
    { id: "arrival_body_tension", kind: "single", writesTo: "somatic",
      prompt: "Scan the body. Where is the loudest tension?",
      options: [
        { value: "jaw", label: "Jaw / face" },
        { value: "shoulders", label: "Shoulders / neck" },
        { value: "chest", label: "Chest / heart area" },
        { value: "belly", label: "Belly / gut" },
        { value: "hips", label: "Hips / low back" },
        { value: "none", label: "Genuinely nothing loud" },
      ] },
    { id: "arrival_breath", kind: "single", writesTo: "somatic",
      prompt: "Your breath, right now — what is it like?",
      options: [
        { value: "shallow_fast", label: "Shallow and quick" },
        { value: "shallow_slow", label: "Shallow but slow" },
        { value: "deep_easy", label: "Deep and easy" },
        { value: "held", label: "I keep holding it without meaning to" },
        { value: "unnoticed", label: "I hadn't noticed until now" },
      ] },
    { id: "arrival_one_word", kind: "text", writesTo: "somatic",
      prompt: "One word for what is here.",
      placeholder: "Just one honest word…" },
  ],
};

const CHAMBER_2: Chamber = {
  number: 2, slug: "the-life",
  title: "The Life You're Actually Living",
  subtitle: "Not the life on your feed. The one at 7am.",
  estMinutes: 10,
  intro: "No judgement here. No fix. Just an honest look at the shape of your day.",
  outro: "This is what the guru sees. Not the mask — the day.",
  questions: [
    { id: "age_band", kind: "single", writesTo: "surface",
      prompt: "Roughly, how old are you?",
      options: [
        { value: "under_20", label: "Under 20" },
        { value: "20s", label: "20s" }, { value: "30s", label: "30s" },
        { value: "40s", label: "40s" }, { value: "50s", label: "50s" },
        { value: "60_plus", label: "60+" },
      ] },
    { id: "life_stage", kind: "single", writesTo: "surface",
      prompt: "Which is closest to your life stage?",
      options: [
        { value: "student", label: "Student" },
        { value: "early_career", label: "Early career" },
        { value: "building", label: "Building — career or business" },
        { value: "parenting_young", label: "Parenting small kids" },
        { value: "parenting_teens", label: "Parenting teens or older" },
        { value: "midlife_reckoning", label: "Midlife reckoning" },
        { value: "post_career", label: "Post-career / elder" },
        { value: "in_between", label: "In-between — transition" },
      ] },
    { id: "sleep_hours", kind: "slider", writesTo: "surface",
      prompt: "Average hours of sleep a night?",
      min: 3, max: 11, minLabel: "3", maxLabel: "11+" },
    { id: "screen_hours", kind: "slider", writesTo: "surface",
      prompt: "Screen time on a typical day (all screens, honestly)?",
      min: 0, max: 16, minLabel: "0h", maxLabel: "16h+" },
    { id: "movement", kind: "single", writesTo: "surface",
      prompt: "How often does your body actually move?",
      options: [
        { value: "daily", label: "Daily — walking, gym, sport, yoga" },
        { value: "few_week", label: "A few times a week" },
        { value: "once_week", label: "About once a week" },
        { value: "rare", label: "Rarely" },
        { value: "never", label: "Basically never" },
      ] },
    { id: "solitude", kind: "single", writesTo: "surface",
      prompt: "Time truly alone with yourself — no phone, no company?",
      options: [
        { value: "daily_hour", label: "An hour+ daily" },
        { value: "some_week", label: "A few pockets a week" },
        { value: "rare", label: "Very rare" },
        { value: "avoid", label: "Honestly, I avoid it" },
      ] },
    { id: "food_relationship", kind: "single", writesTo: "surface",
      prompt: "Your relationship with food, in one line?",
      options: [
        { value: "conscious", label: "Mostly conscious, eat when hungry" },
        { value: "fuel", label: "Fuel — I don't think about it much" },
        { value: "comfort", label: "Often comfort / emotional" },
        { value: "control", label: "Something I try to control" },
        { value: "chaotic", label: "Chaotic — no rhythm" },
      ] },
    { id: "work_state", kind: "single", writesTo: "surface",
      prompt: "Your relationship with work right now?",
      options: [
        { value: "aligned", label: "Aligned — I mostly love it" },
        { value: "grinding", label: "Grinding — necessary, not joyful" },
        { value: "burnout", label: "Edge of burnout" },
        { value: "lost", label: "Lost — I don't know why I do it" },
        { value: "between", label: "Between things right now" },
      ] },
    { id: "one_honest_line", kind: "longtext", writesTo: "surface",
      prompt: "One honest sentence about your day-to-day life right now.",
      placeholder: "The one you wouldn't post…" },
  ],
};

const CHAMBER_3: Chamber = {
  number: 3, slug: "the-wound",
  title: "The Wound",
  subtitle: "What is here to be met, not fixed?",
  estMinutes: 10,
  intro: "Not therapy. Just naming what already runs you. Naming softens it.",
  outro: "You told the truth. That's the whole practice, honestly.",
  questions: [
    { id: "dominant_loop", kind: "single", writesTo: "psychological",
      prompt: "The one thought that runs on repeat inside your head — pick the closest.",
      options: [
        { value: "not_enough", label: "I'm not enough / not doing enough" },
        { value: "unworthy", label: "I'm secretly unworthy of what I have" },
        { value: "left_behind", label: "Everyone is ahead of me" },
        { value: "abandonment", label: "People I love will leave" },
        { value: "control", label: "If I let go, it all falls apart" },
        { value: "invisible", label: "No one really sees me" },
        { value: "trapped", label: "I'm stuck in a life I didn't choose" },
        { value: "self_hate", label: "I don't actually like myself" },
        { value: "quiet", label: "Honestly, my head is fairly quiet" },
      ] },
    { id: "inherited", kind: "text", writesTo: "psychological",
      prompt: "One thing you inherited from your parents that you don't want.",
      placeholder: "A pattern, a fear, a voice…" },
    { id: "stop_doing", kind: "text", writesTo: "karmic",
      prompt: "What are you here to stop doing?",
      placeholder: "One habit or pattern…" },
    { id: "avoidance", kind: "single", writesTo: "psychological",
      prompt: "When something hard shows up, what do you do?",
      options: [
        { value: "distract", label: "Distract — phone, food, scroll" },
        { value: "overwork", label: "Overwork" },
        { value: "isolate", label: "Isolate — disappear" },
        { value: "vent", label: "Vent to someone" },
        { value: "numb", label: "Numb out — alcohol / substances / TV" },
        { value: "sit", label: "Actually sit with it" },
        { value: "spin", label: "Spin in my head about it" },
      ] },
    { id: "last_cry", kind: "single", writesTo: "psychological",
      prompt: "When did you last cry?",
      options: [
        { value: "week", label: "This week" },
        { value: "month", label: "This month" },
        { value: "year", label: "This year" },
        { value: "years", label: "Years ago" },
        { value: "cant_remember", label: "I honestly can't remember" },
      ] },
  ],
};

const CHAMBER_4: Chamber = {
  number: 4, slug: "the-longing",
  title: "The Longing",
  subtitle: "If nothing was in the way…",
  estMinutes: 8,
  intro: "This isn't fantasy. It's the compass. What is quietly asking to be lived?",
  outro: "Notice how easily that came, once you gave it permission.",
  questions: [
    { id: "ideal_day", kind: "longtext", writesTo: "karmic",
      prompt: "If nothing was in the way, describe your ordinary Tuesday.",
      placeholder: "Wake up… morning… work… evening… night…" },
    { id: "who_with", kind: "text", writesTo: "karmic",
      prompt: "Who would you spend that day with?",
      placeholder: "Names, or the shape of the person…" },
    { id: "stop_pretending", kind: "text", writesTo: "karmic",
      prompt: "What would you stop pretending?",
      placeholder: "One thing…" },
    { id: "unlived", kind: "text", writesTo: "karmic",
      prompt: "The unlived life inside you, in one line.",
      placeholder: "The one you buried at 22, or 32…" },
  ],
};

const CHAMBER_5: Chamber = {
  number: 5, slug: "the-doorway",
  title: "The Doorway",
  subtitle: "Which form of yoga is your body already leaning toward?",
  estMinutes: 10,
  intro: "Not a personality quiz. A read of what your life is already doing. Six doorways: devotion, self-inquiry, action, meditation, tantra, shakti. One is closer to you.",
  outro: "You have a doorway. We'll show you where it opens.",
  questions: [
    { id: "closest_to_god", kind: "single", writesTo: "doorway",
      prompt: "When you feel closest to something larger than yourself, it happens through…",
      options: [
        { value: "music",   label: "Music, chanting, tears, prayer",       weights: { bhakti: 3, shakti: 1 } },
        { value: "thought", label: "A crystal-clear thought or insight",   weights: { jnana: 3, raja: 1 } },
        { value: "service", label: "Serving someone, hands in the work",   weights: { karma: 3 } },
        { value: "silence", label: "Deep silence and inner stillness",     weights: { raja: 3, jnana: 1 } },
        { value: "body",    label: "Body, breath, sex, dance",             weights: { tantra: 3, shakti: 2 } },
        { value: "power",   label: "A surge of energy or fierce clarity",  weights: { shakti: 3, tantra: 1 } },
      ] },
    { id: "how_learn", kind: "single", writesTo: "doorway",
      prompt: "How do you learn something deep?",
      options: [
        { value: "story", label: "Through stories, poems, songs", weights: { bhakti: 2 } },
        { value: "argue", label: "By arguing with it until it breaks", weights: { jnana: 3 } },
        { value: "do",    label: "By doing it, hands-on", weights: { karma: 3 } },
        { value: "sit",   label: "By sitting with it in silence", weights: { raja: 3 } },
        { value: "feel",  label: "By feeling it in the body first", weights: { tantra: 2, shakti: 1 } },
        { value: "burn",  label: "By burning it in — intensity, no half-measures", weights: { shakti: 3 } },
      ] },
    { id: "trust_more", kind: "single", writesTo: "doorway",
      prompt: "You trust ___ more than ___.",
      options: [
        { value: "heart",  label: "The heart, more than the mind",        weights: { bhakti: 2, tantra: 1 } },
        { value: "mind",   label: "The mind, more than emotion",          weights: { jnana: 3 } },
        { value: "hands",  label: "The hands, more than the ideas",       weights: { karma: 3 } },
        { value: "breath", label: "The breath, more than the story",      weights: { raja: 2, tantra: 1 } },
        { value: "body",   label: "The body, more than the head",         weights: { tantra: 3, shakti: 1 } },
        { value: "instinct", label: "The gut / instinct, more than the plan", weights: { shakti: 3 } },
      ] },
    { id: "what_annoys", kind: "single", writesTo: "doorway",
      prompt: "What annoys you most in spiritual people?",
      subprompt: "Genuinely — this is diagnostic.",
      options: [
        { value: "cold",   label: "When they're cold and 'above' emotion",  weights: { bhakti: 2 } },
        { value: "sloppy", label: "Fuzzy thinking, no rigor",                weights: { jnana: 3 } },
        { value: "lazy",   label: "All meditation, no action in the world",  weights: { karma: 3 } },
        { value: "noisy",  label: "Too much talking, too little sitting",    weights: { raja: 3 } },
        { value: "dry",    label: "Rejecting the body, sex, pleasure",       weights: { tantra: 3 } },
        { value: "polite", label: "Too polite / suppressing their power",    weights: { shakti: 3 } },
      ] },
    { id: "would_do_anywhere", kind: "single", writesTo: "doorway",
      prompt: "If someone gave you 30 free minutes, alone, no obligation — you would probably…",
      options: [
        { value: "chant",   label: "Play music that moves you, sing along",   weights: { bhakti: 3 } },
        { value: "read",    label: "Read something dense that makes you think", weights: { jnana: 3 } },
        { value: "fix",     label: "Fix something, clean something, work",    weights: { karma: 3 } },
        { value: "sit",     label: "Sit quietly / meditate",                  weights: { raja: 3 } },
        { value: "move",    label: "Move the body, walk, stretch, dance",     weights: { tantra: 2, shakti: 1 } },
        { value: "intense", label: "Do something intense — cold, sprint, breathwork", weights: { shakti: 3 } },
      ] },
    { id: "already_doing", kind: "multi", writesTo: "doorway", maxSelect: 3,
      prompt: "Which of these are you already doing, even a little?",
      subprompt: "Pick up to 3.",
      options: [
        { value: "prayer",    label: "Prayer / mantra / kirtan",              weights: { bhakti: 2 } },
        { value: "journal",   label: "Journaling / self-inquiry / philosophy", weights: { jnana: 2 } },
        { value: "seva",      label: "Service / volunteering / caregiving",   weights: { karma: 2 } },
        { value: "meditate",  label: "Meditation, any style",                 weights: { raja: 2 } },
        { value: "breath",    label: "Pranayama / breathwork",                weights: { raja: 1, tantra: 1 } },
        { value: "yoga_body", label: "Physical yoga / asana",                 weights: { raja: 1, tantra: 1 } },
        { value: "cold",      label: "Cold plunge / fasting / intense",       weights: { shakti: 2 } },
        { value: "tantra",    label: "Tantric / somatic / sexual practice",   weights: { tantra: 3 } },
        { value: "none",      label: "Honestly, none of the above yet",       weights: {} },
      ] },
    { id: "prior_depth", kind: "single", writesTo: "doorway",
      prompt: "How deep have you gone on any path before?",
      subprompt: "Honestly.",
      options: [
        { value: "brand_new", label: "Brand new — starting today" },
        { value: "few_apps",  label: "Done a few apps, some retreats" },
        { value: "years",     label: "Years of practice, mixed traditions" },
        { value: "deep",      label: "Deep in one tradition for a long time" },
        { value: "teacher",   label: "I've been a teacher / guide myself" },
      ] },
  ],
};

const CHAMBER_6: Chamber = {
  number: 6, slug: "the-shadow",
  title: "The Shadow",
  subtitle: "The energy you keep locked in the basement.",
  estMinutes: 8,
  intro: "Every human has one emotion they welcome and one they exile. The exiled one runs everything from behind the wall.",
  outro: "Nothing to fix. Just visible now.",
  questions: [
    { id: "loudest_emotion", kind: "single", writesTo: "shadow",
      prompt: "Which emotion is the loudest inside you these days?",
      options: [
        { value: "rage",   label: "Rage / anger" },
        { value: "grief",  label: "Grief / sadness" },
        { value: "fear",   label: "Fear / anxiety" },
        { value: "lust",   label: "Lust / desire" },
        { value: "envy",   label: "Envy / comparison" },
        { value: "shame",  label: "Shame" },
        { value: "joy",    label: "Joy — actually joy" },
        { value: "quiet",  label: "Quiet — nothing loud" },
      ] },
    { id: "denied_emotion", kind: "single", writesTo: "shadow",
      prompt: "And which one do you refuse to feel?",
      subprompt: "The one you shove down the fastest.",
      options: [
        { value: "rage",   label: "Rage / anger" },
        { value: "grief",  label: "Grief / sadness" },
        { value: "fear",   label: "Fear / anxiety" },
        { value: "lust",   label: "Lust / desire" },
        { value: "envy",   label: "Envy / comparison" },
        { value: "shame",  label: "Shame" },
        { value: "tenderness", label: "Tenderness / softness" },
        { value: "none",   label: "Honestly, I feel most things" },
      ] },
    { id: "trigger_person", kind: "text", writesTo: "shadow",
      prompt: "One kind of person that instantly triggers you.",
      placeholder: "A type, not a name…" },
    { id: "never_say", kind: "longtext", writesTo: "prohibitions", derivedKey: "never_say",
      prompt: "What must the guru never say to you?",
      subprompt: "Words, tones, framings that shut you down. We honor this — hard.",
      placeholder: "e.g. 'you should…', patronizing, religious language, spiritual-bypass phrases…" },
  ],
};

const CHAMBER_7: Chamber = {
  number: 7, slug: "the-vow",
  title: "The Vow",
  subtitle: "One sentence. 90 days. Your words.",
  estMinutes: 9,
  intro: "Not a goal. A vow. Small enough to keep, true enough to change something. It becomes the system's contract with you.",
  outro: "The vow is set. The app now knows what to protect for you.",
  breathCue: "in",
  questions: [
    { id: "vow_prep_1", kind: "single", writesTo: "karmic",
      prompt: "Your vow should feel more like…",
      options: [
        { value: "quiet", label: "A quiet turn inward" },
        { value: "start", label: "A single practice, started" },
        { value: "stop",  label: "A single thing, stopped" },
        { value: "meet",  label: "Meeting one thing I've avoided" },
        { value: "give",  label: "Giving something to someone" },
      ] },
    { id: "vow_prep_2", kind: "scale5", writesTo: "karmic",
      prompt: "How likely are you to actually keep a small daily practice for 90 days?",
      minLabel: "Not at all", maxLabel: "I know I will" },
    { id: "vow_text", kind: "longtext", writesTo: "karmic", derivedKey: "vow",
      prompt: "Write your vow. One sentence. Your words.",
      subprompt: '"For the next 90 days, I will…"',
      placeholder: "For the next 90 days, I will…" },
    { id: "vow_witness", kind: "text", writesTo: "karmic",
      prompt: "One person (or nothing) that will witness this with you.",
      placeholder: "A name, or leave empty if it's private…" },
  ],
};

// ─────────────────── DEEP CHAMBERS 8–12 ───────────────────
// Optional after the core 7. They calibrate the engines:
// archetype, active loop families, practice band, inner council, witness.

const CHAMBER_8: Chamber = {
  number: 8, slug: "the-archetype",
  title: "The Archetype",
  subtitle: "Which shape has your soul been wearing?",
  estMinutes: 6,
  intro: "Not a personality test. A read of the mythic shape you keep returning to — and the one you exile. Every guide in the app will speak to both.",
  outro: "Your archetype is set. The one it hides from is now visible too.",
  questions: [
    { id: "arch_self_image", kind: "single", writesTo: "archetype",
      prompt: "When you daydream about the 'best version' of you, they are…",
      options: [
        { value: "seeker",  label: "Free — always learning, always moving" },
        { value: "devotee", label: "In love — dissolved into something larger" },
        { value: "warrior", label: "Unshakeable — cutting through anything" },
        { value: "sage",    label: "Wise — quiet, clear, others come to them" },
        { value: "mystic",  label: "Between worlds — seeing what others can't" },
        { value: "healer",  label: "A quiet presence people heal near" },
        { value: "lover",   label: "Fully alive — sensual, intimate, here" },
        { value: "creator", label: "Making something the world hasn't seen" },
        { value: "ruler",   label: "Holding a house / kingdom / team well" },
        { value: "rebel",   label: "Refusing the false — even alone" },
        { value: "hermit",  label: "Alone in the mountain, undistracted" },
        { value: "servant", label: "Useful — small acts, done well" },
      ] },
    { id: "arch_secret_dread", kind: "single", writesTo: "archetype",
      prompt: "Your secret dread, the identity you refuse to be seen as…",
      options: [
        { value: "seeker",  label: "A restless dilettante who never lands" },
        { value: "devotee", label: "A sentimental fool who lost themselves" },
        { value: "warrior", label: "A brute — all sword, no heart" },
        { value: "sage",    label: "A cold intellectual, dead from the neck down" },
        { value: "mystic",  label: "A flake, ungrounded, unreliable" },
        { value: "healer",  label: "A martyr, resentful, self-erasing" },
        { value: "lover",   label: "A merger, no self, always in the other" },
        { value: "creator", label: "A never-finished perfectionist, worth = output" },
        { value: "ruler",   label: "A control freak, love as governance" },
        { value: "rebel",   label: "A contrarian who cannot receive" },
        { value: "hermit",  label: "A recluse who hides from life" },
        { value: "servant", label: "A nobody, invisible, used up" },
      ] },
    { id: "arch_default_move", kind: "single", writesTo: "archetype",
      prompt: "Under real pressure, without thinking, you…",
      options: [
        { value: "seeker",  label: "Look for a new teacher, book, framework" },
        { value: "devotee", label: "Call the one person / god you trust" },
        { value: "warrior", label: "Cut through — face the thing directly" },
        { value: "sage",    label: "Withdraw and think it clean" },
        { value: "mystic",  label: "Meditate / dream / wait for a sign" },
        { value: "healer",  label: "Take care of someone else first" },
        { value: "lover",   label: "Reach for closeness — a body, a hand" },
        { value: "creator", label: "Make something out of it" },
        { value: "ruler",   label: "Take command — organize, delegate, contain" },
        { value: "rebel",   label: "Refuse. Break the rule. Walk out." },
        { value: "hermit",  label: "Disappear. Silence. Nature." },
        { value: "servant", label: "Get very small and useful" },
      ] },
  ],
};

const CHAMBER_9: Chamber = {
  number: 9, slug: "the-loops",
  title: "The Loops Running You",
  subtitle: "Which families of pattern are active — right now?",
  estMinutes: 7,
  intro: "Six loop-families exist. In you, two or three are running loud. Naming them tells the app what to surface first and what to withhold.",
  outro: "The engines now know which loops to meet you at.",
  questions: [
    { id: "loops_active", kind: "multi", writesTo: "loops", maxSelect: 3,
      prompt: "Which of these is running loud in you right now?",
      subprompt: "Up to 3. Be honest.",
      options: [
        { value: "self-inquiry",  label: "Identity confusion — 'who am I really?' won't leave" },
        { value: "observation",   label: "Emotions swallow me — I *become* the anger, the fear" },
        { value: "willpower",     label: "Broken vows — I keep failing my own discipline" },
        { value: "focus",         label: "Shattered attention — cannot finish a thought" },
        { value: "witchcraft",    label: "Powerless — life happens *to* me, not through me" },
        { value: "psychological", label: "Old grooves — people-pleasing / doom-scroll / control" },
      ] },
    { id: "loops_dominant", kind: "single", writesTo: "loops",
      prompt: "Of those, which one — if it dissolved — would change the most?",
      options: [
        { value: "self-inquiry",  label: "The identity loop" },
        { value: "observation",   label: "The being-swallowed loop" },
        { value: "willpower",     label: "The broken-vow loop" },
        { value: "focus",         label: "The shattered-attention loop" },
        { value: "witchcraft",    label: "The powerless loop" },
        { value: "psychological", label: "The old-groove loop" },
      ] },
    { id: "loops_severity", kind: "scale5", writesTo: "loops",
      prompt: "How much does the dominant loop actually cost you, on a normal week?",
      minLabel: "Barely", maxLabel: "It runs my week" },
    { id: "loops_tried", kind: "text", writesTo: "loops",
      prompt: "One thing you have already tried against this loop.",
      placeholder: "Therapy, a book, a fast, a retreat…" },
  ],
};

const CHAMBER_10: Chamber = {
  number: 10, slug: "the-band",
  title: "The Band",
  subtitle: "What tempo can you actually sustain?",
  estMinutes: 5,
  intro: "A vow that fits the body is kept. A vow that fits the fantasy is broken. Set the honest band.",
  outro: "Your practice band is set. The daily plan will fit inside it.",
  questions: [
    { id: "band_minutes", kind: "slider", writesTo: "band",
      prompt: "Realistically, how many minutes a day can you give to practice?",
      subprompt: "Not aspiration. What the current life will actually give.",
      min: 3, max: 90, minLabel: "3 min", maxLabel: "90 min" },
    { id: "band_time_of_day", kind: "single", writesTo: "band",
      prompt: "When in the day is that window most protectable?",
      options: [
        { value: "pre_dawn", label: "Before dawn (before anyone wakes)" },
        { value: "morning",  label: "Morning, before work" },
        { value: "midday",   label: "Midday break" },
        { value: "evening",  label: "Evening, after work" },
        { value: "night",    label: "Late night, in silence" },
        { value: "unstable", label: "Honestly, it moves every day" },
      ] },
    { id: "band_tempo", kind: "single", writesTo: "band",
      prompt: "Which tempo fits the current life?",
      options: [
        { value: "gentle",   label: "Gentle — one small ritual, sustainable forever" },
        { value: "moderate", label: "Moderate — daily practice, moderate intensity" },
        { value: "fierce",   label: "Fierce — I want tapas, I want it to burn" },
        { value: "monastic", label: "Monastic — I want most of the day inside this" },
      ] },
    { id: "band_body_limits", kind: "multi", writesTo: "band", maxSelect: 5,
      prompt: "Any body limits or medical realities the app should honor?",
      subprompt: "Optional. Pick what applies.",
      options: [
        { value: "pregnancy",   label: "Pregnancy / postpartum" },
        { value: "cardiac",     label: "Cardiac / high blood pressure" },
        { value: "seizure",     label: "Seizure history" },
        { value: "trauma",      label: "Active trauma processing" },
        { value: "meds_psych",  label: "On psychiatric medication" },
        { value: "chronic_pain",label: "Chronic pain / injury" },
        { value: "eating",      label: "Eating disorder history" },
        { value: "none",        label: "None to mention" },
      ] },
  ],
};

const CHAMBER_11: Chamber = {
  number: 11, slug: "the-council",
  title: "The Inner Council",
  subtitle: "Which voices should the app speak with?",
  estMinutes: 6,
  intro: "Twelve masters live inside this app. Not every voice is for you. Pick the ones your soul recognizes — the app will lean on those first.",
  outro: "Your council is seated. When you speak to the app, these are the voices that answer.",
  questions: [
    { id: "council_choose", kind: "multi", writesTo: "council", maxSelect: 3,
      prompt: "Which of these voices, hearing their essence, do you want speaking to you?",
      subprompt: "Up to 3. You can change this anytime.",
      options: [
        { value: "adiyogi",      label: "Adiyogi — silent, dense, cuts. No consolation." },
        { value: "krishna",      label: "Krishna — warm friend on the battlefield. Act without clinging." },
        { value: "buddha",       label: "Buddha — clean, measured. Sees the arising, does not add." },
        { value: "ramana",       label: "Ramana — 'Who am I?' Almost silent." },
        { value: "nisargadatta", label: "Nisargadatta — sharp, no patience for pretense." },
        { value: "osho",         label: "Osho — musical, provocative, laughs, turns questions sideways." },
        { value: "ma",           label: "The Mother — wordless-warm, one sentence like a hand on your back." },
        { value: "kabir",        label: "Kabir — blunt, funny, poet of the everyday." },
        { value: "rumi",         label: "Rumi — drunk on the Beloved, longing as fuel." },
        { value: "krishnamurti", label: "Krishnamurti — ruthless clarity, refuses to be your guru." },
        { value: "vasishtha",    label: "Vasishtha — elder, patient, speaks in parables." },
        { value: "kali",         label: "Kali — ferocious tenderness. Names what must die." },
      ] },
    { id: "council_never", kind: "multi", writesTo: "council", maxSelect: 5,
      prompt: "Which voices should the app NEVER use for you?",
      subprompt: "If a voice has ever felt violent or false to you, exclude it here.",
      options: [
        { value: "adiyogi",      label: "Adiyogi" },
        { value: "krishna",      label: "Krishna" },
        { value: "buddha",       label: "Buddha" },
        { value: "ramana",       label: "Ramana" },
        { value: "nisargadatta", label: "Nisargadatta" },
        { value: "osho",         label: "Osho" },
        { value: "ma",           label: "The Mother" },
        { value: "kabir",        label: "Kabir" },
        { value: "rumi",         label: "Rumi" },
        { value: "krishnamurti", label: "Krishnamurti" },
        { value: "vasishtha",    label: "Vasishtha" },
        { value: "kali",         label: "Kali" },
        { value: "none",         label: "None to exclude" },
      ] },
    { id: "council_language", kind: "single", writesTo: "council",
      prompt: "What kind of language lands best?",
      options: [
        { value: "sanskrit",  label: "Sanskrit / traditional terms — I want the lineage" },
        { value: "plain",     label: "Plain modern English — no jargon" },
        { value: "poetic",    label: "Poetic — image, paradox, metaphor" },
        { value: "scientific",label: "Scientific — nervous system, evidence" },
        { value: "mix",       label: "A mix — meet me where the moment is" },
      ] },
  ],
};

const CHAMBER_12: Chamber = {
  number: 12, slug: "the-witness",
  title: "The Witness",
  subtitle: "Baseline for the one who watches.",
  estMinutes: 6,
  intro: "The app tracks the witness — the still thing behind your thoughts. Before it can track, it needs a baseline. Three short calibrations.",
  outro: "Baseline captured. Every session from here will measure against this.",
  breathCue: "still",
  questions: [
    { id: "witness_gap_breath", kind: "scale5", writesTo: "witness",
      prompt: "Right now, without doing anything special — can you notice the tiny gap between the in-breath and the out-breath?",
      minLabel: "No gap at all", maxLabel: "Clearly, obviously" },
    { id: "witness_thought_as_thought", kind: "scale5", writesTo: "witness",
      prompt: "When a thought arises, can you catch it *as* a thought — not as reality?",
      minLabel: "Almost never", maxLabel: "Almost always" },
    { id: "witness_sit_with_emotion", kind: "scale5", writesTo: "witness",
      prompt: "How long can you sit with a strong emotion without doing anything about it?",
      minLabel: "Seconds", maxLabel: "As long as it lasts" },
    { id: "witness_i_am", kind: "single", writesTo: "witness",
      prompt: "'I am' — sit with just that, no addition. What comes?",
      options: [
        { value: "nothing",   label: "Nothing arises. Just a quiet." },
        { value: "presence",  label: "A sense of presence, hard to name." },
        { value: "resistance",label: "Resistance — the mind wants to add words." },
        { value: "fear",      label: "A subtle fear or restlessness." },
        { value: "warmth",    label: "Warmth in the chest / belly." },
        { value: "blank",     label: "Blank. I don't feel anything with it." },
      ] },
    { id: "witness_first_taste", kind: "longtext", writesTo: "witness",
      prompt: "Your first taste of stepping-out-of-yourself — describe it in one line.",
      subprompt: "Meditation, grief, sex, a walk, psychedelics, dying, birth — whatever it was.",
      placeholder: "Once, when…" },
  ],
};

export const SOUL_CHAMBERS: Chamber[] = [
  CHAMBER_1, CHAMBER_2, CHAMBER_3, CHAMBER_4, CHAMBER_5, CHAMBER_6, CHAMBER_7,
  CHAMBER_8, CHAMBER_9, CHAMBER_10, CHAMBER_11, CHAMBER_12,
];

export const CORE_CHAMBER_COUNT = 7;
export const TOTAL_CHAMBER_COUNT = SOUL_CHAMBERS.length; // 12

export function getChamber(n: number): Chamber | undefined {
  return SOUL_CHAMBERS.find(c => c.number === n);
}

export const TOTAL_MINUTES = SOUL_CHAMBERS.reduce((s, c) => s + c.estMinutes, 0);
