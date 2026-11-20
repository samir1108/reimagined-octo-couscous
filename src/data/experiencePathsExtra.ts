/**
 * Two additional paths beyond the classical four — Tantra & Shakti.
 * Same structure as experiencePaths.ts. All 6 levels unlocked for free reading.
 */
import tantraImg from "@/assets/paths/tantra.jpg";
import shaktiImg from "@/assets/paths/shakti.jpg";
import tantraVid from "@/assets/paths/videos/tantra.mp4.asset.json";
import shaktiVid from "@/assets/paths/videos/shakti.mp4.asset.json";
import type { YogicPath } from "./experiencePaths";

// ─────────────────────────────────────────────────────────────
// PATH 5 — TANTRA (the path of yes)
// ─────────────────────────────────────────────────────────────
const TANTRA: YogicPath = {
  slug: "tantra",
  name: "Tantra",
  sanskrit: "तन्त्र",
  oneLine: "The path that says yes to everything the other paths say no to.",
  longDescription: `Tantra is the most misunderstood word in modern spirituality. It is not about sex. It is about *not rejecting anything*. Where the renunciate paths ask you to push the world away to find God, tantra asks you to find God *inside* the world — inside food, inside breath, inside anger, inside the body you live in.

The Vigyan Bhairav Tantra, a 5,000-year-old text, gives 112 doorways into the absolute. Most of them are absurdly ordinary: while eating, while making love, while looking at the sky, while feeling a strong emotion. The premise is radical — every sensation is already the divine, you have just been taught to look past it.

This path is for anyone who has tried to suppress their humanity in the name of spirituality and felt something die.`,
  guru: "Abhinavagupta",
  guruRole: "the 10th-century Kashmiri master who systematized non-dual tantra",
  heroImage: tantraImg,
  heroVideo: tantraVid.url,
  accent: "rose",
  gradient: "from-rose-600/30 via-red-500/15 to-orange-600/10",
  symbol: "🜂",
  totalDurationMonths: 6,
  levels: [
    {
      level: 1, title: "The Yes Practice", promise: "Stop rejecting your own experience.",
      durationDays: 30, unlocked: true,
      practices: ["3-breath full-body yes", "Sensation tracking", "No-rejection eating"],
      teaching: `Level 1 of tantra is not about energy or chakras. It is about one thing: you have been saying no to your own experience for decades. Tantra begins by reversing that one habit.

Every uncomfortable sensation — boredom, frustration, the tightness in your shoulders, the sourness in your mouth on waking — has been getting a silent *no* from you. You distract from it, fix it, override it. Tantra Level 1 asks: what if you said *yes* instead? Not "I like this." Just: this is here, and I'm not running.

**Daily, this month:**
- Three times a day: pause, find one sensation in the body, breathe three breaths into it without trying to change it.
- One meal a day: eat without phone, without book. Just taste.
- Evening: name one thing you said no to today that you could have said yes to.

By day 30 something strange happens: the things you used to fight stop having power. Not because they disappear, but because the war inside you ends.`,
    },
    {
      level: 2, title: "The 112 Doorways", promise: "Learn 7 of the Vigyan Bhairav meditations.",
      durationDays: 30, unlocked: true,
      practices: ["Gap between breaths", "Sound dissolution", "Touch as portal", "Sky-gazing", "Heart-of-bliss", "Spinal column light", "Witness-the-witness"],
      teaching: `The Vigyan Bhairav Tantra contains 112 brief techniques, each a complete path. Shiva speaks them to Parvati, one after another, like a master jeweler showing the same diamond from 112 angles. This month you learn seven.

The principle: any sensation, fully attended, becomes a doorway. Sound becomes a doorway when you follow it to its dissolution. Breath becomes a doorway in the gap between in and out. Touch becomes a doorway when you stop calling it "my hand on the table" and let it be raw contact. Each technique takes 5 minutes. One per day, rotating.

**Daily, this month:**
- Pick one of the seven techniques (cycle through, one per day).
- Practice 5 minutes morning, 5 minutes evening.
- Journal one line: did a doorway open today? If yes, what did it look like?

You are building a personal library. By day 30 you will know which 2-3 of the 112 are *your* doorways. That knowing is worth more than any teacher's recommendation.`,
    },
    {
      level: 3, title: "Energy in the Body", promise: "Feel prana as a felt presence, not a concept.",
      durationDays: 30, unlocked: true,
      practices: ["Nadi shodhana (alternate nostril)", "Kapalabhati", "Hands-of-heat practice", "Spine wave breathing"],
      teaching: `Prana is not metaphor. It is the felt aliveness in the body before thought arrives to label it. Children know this without instruction. Adults have to relearn it because we live in the head and treat the body as transport.

This month is purely somatic. Four pranayama practices, daily, building the felt sense of energy moving. The point is not to master the techniques. The point is to *notice* the tingling, the warmth, the subtle currents that arise. This noticing is the entire foundation of tantric practice.

**Daily, this month:**
- Morning: 5 min alternate nostril breathing, then 30 seconds of kapalabhati.
- Midday: 2 minutes of palms-together, generate heat between hands, feel the field.
- Evening: 10 spine waves — inhale arching, exhale rounding, feel the breath as wave.

By day 30 the body will no longer feel like a thing you carry around. It will feel like an instrument that is always playing, whether you listen or not.`,
    },
    {
      level: 4, title: "The Tantric Pair", promise: "Bring tantra into one human relationship.",
      durationDays: 30, unlocked: true,
      practices: ["Eye-gazing 3 min", "Synchronized breathing", "Spoken appreciation", "Non-doing presence"],
      teaching: `Tantra is famously misrepresented as sexual technique. The actual teaching: the practice of pure presence with another human, romantic or not, is one of the fastest accelerators on the path. Why? Because the other person reflects every place you are still defended.

This month you pick one person — partner, friend, family member — and run four micro-practices with them. They do not need to know it is "tantra." They just need to be willing to sit with you for 10 minutes a few times a week.

**Daily/weekly, this month:**
- 3x per week, 3 min eye-gazing with your chosen person. No talking.
- Daily, with anyone: one moment of synchronized breathing without announcing it.
- Once a week: speak one specific appreciation out loud, looking at them.
- Once a week: sit with them for 10 min in silence, not on phones.

By day 30 at least one relationship will have deepened in a way you did not engineer. That deepening is tantra working.`,
    },
    {
      level: 5, title: "Shadow as Doorway", promise: "Use rage, grief, lust, fear as fuel — not problems.",
      durationDays: 30, unlocked: true,
      practices: ["Emotion-as-energy meditation", "Wrathful breath", "Grief-holding practice", "Desire without acting"],
      teaching: `Most spiritual paths treat the difficult emotions as obstacles to be transcended. Tantra calls them the densest form of the same energy. Rage is *shakti* — life force — pretending to be a problem because no one taught you to ride it.

This month you stop running from the big emotions. When rage arises, you breathe into it and feel it as heat, not as a story about who wronged you. When grief arises, you hold it like a child. When desire arises, you let it burn without acting on it. The energy that was scaring you becomes the fuel that wakes you up.

**Daily, this month:**
- When any strong emotion arrives: stop, close eyes for 30 seconds, feel where it lives in the body, breathe with it.
- Once a week: 10 min of "wrathful breath" — fast strong exhales channeling whatever is loud in you that day.
- Evening: name one emotion you used to flee, that today you stayed with.

By day 30 you will have stopped being afraid of your own intensity. That alone is rarer than most enlightenments.`,
    },
    {
      level: 6, title: "The Embodied Absolute", promise: "Live as the world without leaving it.",
      durationDays: 30, unlocked: true,
      practices: ["Open awareness in motion", "Sacred mundane logging", "Continuous yes"],
      teaching: `The final level of tantra is not a state. It is the realization that there was never anything to add. The world you have been living in *is* the absolute, dressed as Tuesday. You only had to stop arguing with it.

This month has almost no formal practice. Instead, the practice becomes the entire day. You walk, eat, work, talk, fight, love — and you keep the quiet question alive: *what if this, right now, is what I have been looking for?* The answer is not a thought. It is a softening that happens when the search ends.

**Daily, this month:**
- Wake without phone for 15 minutes. Just be in the body in the bed.
- Once a day: log one "sacred mundane" moment — a sip of tea, a stranger's face, a sound — that briefly felt like enough.
- Evening: a single line. "Today the absolute looked like ___."

By day 30 something has reorganized. You are not enlightened — tantra does not use that word. You are just less at war with being here. That is the destination, and the destination was always under your feet.`,
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// PATH 6 — SHAKTI (the path of divine feminine power)
// ─────────────────────────────────────────────────────────────
const SHAKTI: YogicPath = {
  slug: "shakti",
  name: "Shakti Sadhana",
  sanskrit: "शक्ति साधना",
  oneLine: "The path of awakened power — fierce, embodied, alive.",
  longDescription: `Shakti is the feminine principle of the cosmos, but she is not gentle. She is the force that makes galaxies spin and grass push through concrete. To walk this path is to stop being polite with your own aliveness.

Where Bhakti opens the heart and Jnana sharpens the intellect, Shakti awakens the *body's intelligence* — the wisdom that lives in the hips, the gut, the spine, the womb (literal or symbolic). She is the goddess Kali, Durga, Tara. She is also the unspeakable yes inside every human animal that has been told to be quiet.

This path is for anyone — any gender — whose growth has stalled because they have been too small, too apologetic, too managed. Shakti does not ask you to be nicer. She asks you to be real.`,
  guru: "Anandamayi Ma",
  guruRole: "the 20th-century Bengali saint who lived as undiluted Shakti",
  heroImage: shaktiImg,
  heroVideo: shaktiVid.url,
  accent: "red",
  gradient: "from-red-600/30 via-rose-500/15 to-amber-600/10",
  symbol: "🔱",
  totalDurationMonths: 6,
  levels: [
    {
      level: 1, title: "The Body Returns", promise: "Come back into the body you abandoned.",
      durationDays: 30, unlocked: true,
      practices: ["Daily 5-min shake", "Hip-circling", "Floor sitting", "Barefoot earth contact"],
      teaching: `Most adults live from the neck up. The body has become a vehicle to be optimized — fed, exercised, photographed — but not *inhabited*. Level 1 of Shakti is the simple, almost embarrassing act of returning to live inside the animal you are.

This is not about fitness. It is about feeling the floor under you, the breath in your belly, the slight wobble in your hips when you sit cross-legged. It is about realizing that your body has been waiting for you to come home and has not held a grudge.

**Daily, this month:**
- Morning: 5 minutes of free shaking — knees soft, let the body tremor however it wants. Awkward at first. Then liberating.
- Sit on the floor at least once a day for at least 5 minutes. Couches don't count.
- Walk barefoot on actual earth (grass, dirt, stone) for 5 min at least 3x per week.

By day 30 the question "what does my body want?" will have an actual answer, separate from what your mind has been telling it to want.`,
    },
    {
      level: 2, title: "Voice", promise: "Reclaim sound. End the apology in the throat.",
      durationDays: 30, unlocked: true,
      practices: ["Daily roar practice", "Bija mantra (HRIM, KLIM)", "Speaking without softening"],
      teaching: `Most modern humans have a small, careful voice. The throat is constricted — partly cultural, partly the lifetime of "tone it down." Shakti will not work through a closed throat. So Level 2 opens it, by force if necessary.

This month you will roar. You will chant seed syllables that bypass the meaning-making mind. You will catch yourself pre-softening sentences ("I just thought maybe…") and you will say the sentence without the softener. This is not about being aggressive. It is about your voice being the size of you.

**Daily, this month:**
- Morning: 1 minute of full-voice roaring or AAAAH-ing in a place you won't be heard (car, shower, walk).
- 5 min daily of chanting HRIM (pronounced HREEM) — the bija of Shakti — out loud.
- At least once a day, catch one apology-softener in your speech and remove it.

By day 30 your voice will sound different to you. Other people will notice and not know why.`,
    },
    {
      level: 3, title: "Anger as Power", promise: "Reclaim the no that has been buried.",
      durationDays: 30, unlocked: true,
      practices: ["Daily 'no' practice", "Anger-locating meditation", "Kali contemplation"],
      teaching: `Anger is the most defamed of all emotions. Spiritual traditions tell you to transcend it. Productivity culture tells you it's unprofessional. Most people have buried it so deep they confuse depression for "being calm." Shakti calls bullshit on this.

Anger is the body's *no*. Without it, every yes is fake. This month you will learn to feel anger as a clean, hot force in the body — not as a story about who hurt you, but as the energy of "this is not okay." You will practice saying no in small ways every day until it stops feeling rude.

**Daily, this month:**
- Once a day, say no to something you would normally have said yes to out of habit.
- 5 min daily: sit, locate any held anger in the body (jaw, fists, belly), breathe into it without making it about anyone.
- Once a week: contemplate Kali — the goddess who dances on the corpse of ego, sword in hand, garlanded in skulls. She is not evil. She is the part of love that says enough.

By day 30 your no will have weight. People who relied on your weak yes will be confused. That confusion is the path working.`,
    },
    {
      level: 4, title: "Eros Without Apology", promise: "Reconnect to desire as life force.",
      durationDays: 30, unlocked: true,
      practices: ["Sensory pleasure daily", "Body-as-friend mirror practice", "Desire mapping"],
      teaching: `Eros, in the original Greek sense, is not sex. It is the life force that pulls one thing toward another — appetite, curiosity, art, hunger, beauty. Most adults have anesthetized eros along with everything else, then wonder why they feel half-dead.

This month is the rehabilitation of pleasure. Not consumption-pleasure (numbing, scrolling, drinking). *Sensory* pleasure — the warmth of sun, the taste of a good fig, the smell of rain, your skin under your own hand. You will rediscover that you are an animal who was built to enjoy being here.

**Daily, this month:**
- Three sensory pleasures a day, fully attended for 60 seconds each. Phone away.
- Daily: 1 minute in front of a mirror without judgment. The body is your oldest friend.
- Once a week: write a list of 10 things you actually want. No editing. Some will surprise you.

By day 30 the gray will have lifted in places you did not know were gray. Eros has come back online.`,
    },
    {
      level: 5, title: "Boundaries as Sacred", promise: "Build the energetic walls that let you finally relax.",
      durationDays: 30, unlocked: true,
      practices: ["Energetic edge practice", "Daily 'I am not available for ___'", "Resource audit"],
      teaching: `A castle without walls is not safe. A self without boundaries is not free. Most people who feel constantly drained do not have an energy problem — they have a boundary problem. Energy is leaking out of every undefended edge.

This month you build the edges. Not walls of anger, but clear lines of "this is mine, that is yours." Saying it kindly. Saying it without explanation. Saying it to the people closest to you, who will resist most. Shakti is famous for her boundaries — she destroys what does not belong inside her circle. You will practice the human-sized version.

**Daily, this month:**
- Each morning, name one thing you are not available for today. Out loud.
- Audit your week: which 3 things drained you most? Reduce or remove one.
- Practice the sentence: "That doesn't work for me." No reason given.

By day 30 your energy will have stopped leaking in two or three obvious places. You will not be more powerful — you will just be losing less of the power you already have.`,
    },
    {
      level: 6, title: "Living as Shakti", promise: "Be the force, not the seeker of it.",
      durationDays: 30, unlocked: true,
      practices: ["Daily devotional dance", "Shakti puja (light, flower, sound)", "Public reclamation"],
      teaching: `Level 6 is not the end of the path — it is the moment you stop being separate from the path. You realize: there was never a small you trying to *get* Shakti. You *are* Shakti, pretending to be small to fit into other people's rooms.

This month, you stop pretending. Not dramatically — life does not require theatre. Just precisely. You take up the actual room you take up. You speak in the actual voice that is yours. You move with the actual current that has always been moving you. And you offer this — daily, in small ceremony — back to the same force that gave it.

**Daily, this month:**
- 5 min of free dance to one song you love. No one watching. This is your daily puja.
- Morning: light a small flame, place one flower or one object that means something. One breath of thank-you.
- Once a week: do one thing in public that you would have once shrunk away from. Speak up in a meeting. Wear the color. Tell the truth.

By day 30 there is no more path. There is just you, walking through the world, alive. The goddess was never anywhere else.`,
    },
  ],
};

export const EXPERIENCE_PATHS_EXTRA: YogicPath[] = [TANTRA, SHAKTI];
