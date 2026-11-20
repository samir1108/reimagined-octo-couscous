/**
 * Showroom Programs — Extra 10. Registered into SHOWROOM_PROGRAMS so the
 * full catalog is 15. Same shape as the original five — 7 days, full reading
 * + a micro-practice + a reflection question per day.
 *
 * Kept in a separate file to avoid touching the original 5 programs and to
 * keep diffs small. Add new programs here, then append to the registry below.
 */
import type { ShowroomProgram } from "./showroomPrograms";

// ============================================================================
// 6 — HEART OPEN (Bhakti with Meera)
// ============================================================================
const HEART_OPEN: ShowroomProgram = {
  slug: "heart-open-with-meera",
  title: "Heart Open",
  subtitle: "Seven days with the poet-saint Meera — devotion as a daily, modern practice.",
  guru: "Meera",
  guruRole: "the 16th-century princess who walked out of a palace because her heart already belonged elsewhere",
  theme: "🌹",
  color: "from-rose-500/30 via-pink-500/20 to-amber-500/10",
  category: "love",
  duration: "7 days",
  promise: "By day 7 you'll know how to find — and keep — an open heart in a world built to close it.",
  days: [
    {
      day: 1,
      title: "The Closed Heart",
      oneLine: "Most adults walk around with a fist where their chest used to be.",
      reading: `Notice the area behind your sternum, right now, as you read this. Is it soft? Or is it a small, tight knot? For most adults the honest answer is the knot. Somewhere between the age of nine and the age of twenty-five, the heart learns to brace. It learns that being open got it hurt, mocked, ignored, betrayed — and so it makes a sensible adult decision: stay armored. The trouble is, the armor doesn't only keep pain out. It keeps everything out. Joy, awe, intimacy, the taste of a meal, the face of a child — all of it gets dimmed by the same wall that was meant to keep the ex-lover out.\n\nMeera is the patron saint of the unarmored heart. She was born into a royal family in Rajasthan, was married off at thirteen, and within a few years had quietly stopped being a princess at all. Not in protest — in absorption. Her songs say she had fallen in love with Krishna, but anyone who actually reads them knows she'd fallen in love with the *capacity to love* itself. The object was almost incidental. What she discovered was: a heart that stays open does not break. It gets bigger. A heart that stays closed is the one that breaks, quietly, over decades.\n\nThis week is not about belief. You do not need to believe in Krishna, or God, or anything. You only need to be willing to find out what your chest feels like with the armor off, for a few minutes a day. By Sunday you will have done something most people never do in a lifetime: deliberately practiced an open heart.`,
      practice: {
        name: "The Soft Sternum",
        durationMin: 3,
        instructions: `Sit upright. Place one hand flat on the center of your chest.\n\nBreathe in slowly through the nose. As you exhale, picture the area under your hand softening, like wax warming. Don't force it. Just invite.\n\nDo this for ten breaths.\n\nNotice if anything in the body — a sigh, a tear, a yawn — wants to release. Let it.`,
      },
      reflection: "When in your life did your heart first decide to brace? You don't have to fix it. Just see it.",
    },
    {
      day: 2,
      title: "Bhava — the Mood You Carry",
      oneLine: "Devotion is not a feeling. It is a stance you choose.",
      reading: `In bhakti yoga the central word is *bhava* — usually translated as 'mood' or 'attitude', but really meaning something closer to *the emotional weather you decide to live in*. Meera's bhava was the bhava of a lover — everything in her day was filtered through "I am his, he is mine." A monk might carry the bhava of a servant. A grandparent might carry the bhava of a guardian. The point is not which one. The point is that you get to choose.\n\nMost people don't know this is a choice. They wait until they feel devotional and then act devotional, and so they almost never act devotional, because the feeling rarely shows up uninvited in modern life. The bhakti reversal is: act in the mood first, and the feeling comes second. You decide, when you wake up, that today you will move through your day as if everything in it is a small gift handed to you by something larger. Not because you believe it. Because you want to find out what it feels like.\n\nThis is not denial. You can carry a devotional bhava and still complain about the commute. The bhava is underneath the mood, not on top of it.`,
      practice: {
        name: "Set a Bhava",
        durationMin: 2,
        instructions: `Before you stand up from where you are sitting, pick one bhava for the next two hours. Pick from: lover, servant, guardian, child, witness, friend.\n\nWhichever you pick, finish this sentence in your head: "For the next two hours I will treat the world as if I am its _____."\n\nThen go about your day. At the two-hour mark, notice what shifted.`,
      },
      reflection: "Which bhava felt most foreign to you? That's probably the one you most need to practice.",
    },
    {
      day: 3,
      title: "Singing the Name",
      oneLine: "There is a reason every devotional tradition on Earth involves repetition.",
      reading: `Bhakti is the only one of the four yogas that explicitly weaponizes the human capacity for repetition. Jnana uses inquiry. Karma uses action. Raja uses concentration. Bhakti uses *the name*. The same name. Said again and again until something inside the saying changes.\n\nMeera sang Krishna's name. A Sufi sings Allah. A Christian monk says the Jesus prayer. A grandmother in Tamil Nadu mutters Rama-Rama under her breath as she chops onions. All four are doing the same neurological move: they are using rhythmic vocal repetition to slowly downshift the default-mode network — the part of the brain responsible for self-narration. When the self-narrator quiets, what remains feels enormous, warm, and personal. The traditions call that feeling 'God'. Neuroscience calls it ego dissolution. Either word is fine.\n\nYou do not need a deity. You need *a sound that you are willing to say five hundred times*. It can be a name (Ram, Maa, Sophia), a word (peace, home, yes), or a phrase (so-hum). The repetition is the technology. The object is the trellis.`,
      practice: {
        name: "108",
        durationMin: 7,
        instructions: `Pick a single word or short phrase that you find meaningful. Just one.\n\nSet a timer for 7 minutes. Repeat the word silently, on each out-breath. Count on your fingers if you like — traditional malas have 108 beads for exactly this reason.\n\nWhen the mind drifts, return to the word without scolding. The returning is the practice.\n\nAt the end, sit in silence for one more minute.`,
      },
      reflection: "What word came up that you would actually want to live inside for a few minutes a day?",
    },
    {
      day: 4,
      title: "Tears Are a Sign of Health",
      oneLine: "An open heart leaks. That's how you know it's open.",
      reading: `Modern culture treats crying like a system error. Bhakti treats it like a system feature. Meera's poetry is full of tears — tears of longing, tears of joy, tears at the mere sight of a peacock feather. She wasn't unstable. She was *un-armored*. Her nervous system had its valves wide open, and so what other people felt as a faint background hum, she felt as a full chord.\n\nFor seven days of practice you do not need to *cause* tears. You only need to *not interrupt them* if they arrive. Most adults flinch at the first sign of a tear and immediately go check their phone. That flinch is what builds the armor over decades. The bhakti move is microscopically opposite: when a wave of feeling rises, stay one second longer than you usually do. Just one second. Over a year of doing this, the floor of what you are willing to feel goes down a foot.\n\nThis is not therapy. This is plumbing.`,
      practice: {
        name: "One Extra Second",
        durationMin: 2,
        instructions: `Today, the entire practice is a single rule.\n\nWhen any wave of feeling — sadness, joy, irritation, awe — rises in you today, stay with it for one second longer than you normally would before moving on.\n\nThat's it. Notice what happens by the end of the day.`,
      },
      reflection: "When was the last time you cried, and what did you do in the 60 seconds afterward?",
    },
    {
      day: 5,
      title: "The Beloved Is Everywhere",
      oneLine: "Devotion to one face is practice for devotion to every face.",
      reading: `Beginners in bhakti often misunderstand the form. They think the point is to love a single deity intensely. The mature understanding is the opposite: you concentrate the heart on one form precisely so it learns the *muscle* of love, and that muscle then spreads to everything else. Meera loved Krishna so completely that by the end of her life she could not tell where Krishna ended and the rest of the world began. She would see Krishna in a beggar. In a tree. In the woman who served her food.\n\nThis is what the Sufis call *the unveiling*. The beloved was never one being. The beloved was the experience of seeing through the eyes of love. Once you have that, the object becomes optional.\n\nFor today: pick one person in your life — preferably one you find ordinary or even slightly irritating. Practice seeing them, just for two minutes, the way Meera saw Krishna. Not romantic love. The other kind. The kind that recognizes the other as also alive, also tired, also doing their best.`,
      practice: {
        name: "Meera's Eyes",
        durationMin: 4,
        instructions: `Pick one person you will see in the next 24 hours. Not your favourite person. A neutral or slightly difficult one.\n\nBefore the interaction, take 30 seconds with eyes closed. Picture them. Say silently: "You too. Born. Will die. Trying."\n\nThen go meet them. Hold that silent sentence behind your eyes the whole time.\n\nAfter, sit for one minute and notice what was different.`,
      },
      reflection: "Who in your life would your day soften toward if you practiced this for a week?",
    },
    {
      day: 6,
      title: "Surrender Is Not Defeat",
      oneLine: "The strongest move in bhakti is the one that looks like giving up.",
      reading: `*Sharanagati* is the bhakti word for surrender. In English the word has the smell of defeat — armies surrender, prisoners surrender, the weak surrender. In Sanskrit it means something completely different. *Sharana* is shelter. *Agati* is arrival. To surrender is to arrive at shelter. It is the move of someone who, after long fighting, has discovered they no longer need to win the next thing alone.\n\nMeera's surrender was not to a husband or a king or a tradition. It was to the moment-by-moment unfolding of her life as if it were already being held. Notice that this is not passivity. She still acted. She still walked away from a palace. She still wrote thousands of songs. But she acted from a chest that had stopped negotiating with the universe.\n\nMost adults have a constant inner negotiation running: *if you give me X, I'll give you Y. If this works out, I'll be grateful. If it doesn't, I'll be bitter.* Sharanagati is the moment you close that negotiation. You stop trying to make the universe agree to your terms, not because you've lost, but because you've noticed the terms were exhausting and the universe was never signing them anyway.`,
      practice: {
        name: "The Closing Sentence",
        durationMin: 3,
        instructions: `Sit upright. Hand on heart.\n\nThink of one situation in your life you have been trying to control. Just one.\n\nOut loud or in your head, say slowly, three times: "I am not the manager of this. I will do the next right thing and let the rest unfold."\n\nNotice what changes in the body when you stop being its manager.`,
      },
      reflection: "What in your life would feel lighter today if you stopped trying to make it agree to your terms?",
    },
    {
      day: 7,
      title: "The Daily Heart",
      oneLine: "An open heart is not an event. It is a daily piece of hygiene.",
      reading: `Most people, after a week like this, feel something soften and then assume the softness will stay on its own. It will not. The chest re-armors within 48 hours of being left alone. The traditions knew this. That is why every bhakti school in history involves a daily ritual: a song, a chant, an offering, a moment in front of an image. Not because the deity needs it. Because *the heart needs the appointment*.\n\nFor the rest of your life, if you want to keep the door you opened this week, you will need a thirty-second daily appointment with your own chest. It does not have to be religious. It can be a glass of water held with both hands and a silent thank-you. It can be a single line of a song. It can be the soft sternum from day one. The point is that it happens every day, at roughly the same time, for the rest of your life.\n\nThis is the small, real promise of bhakti. Not enlightenment. Not bliss. A chest that, ten years from now, is still soft instead of brittle. That is the whole prize. It is enough.`,
      practice: {
        name: "The Daily 30 Seconds",
        durationMin: 1,
        instructions: `Pick your daily heart appointment. Write it down — phone, paper, fridge.\n\nIt must be: short, repeatable, attached to something you already do (right after coffee, right before sleep), and involve your chest in some way.\n\nDo it once now. Then schedule the next one for tomorrow.`,
      },
      reflection: "What is the smallest daily appointment with your heart you can actually keep for a year?",
    },
  ],
};

// ============================================================================
// 7 — THE INNER WITNESS (Ramana Maharshi, 7 days of self-inquiry)
// ============================================================================
const INNER_WITNESS: ShowroomProgram = {
  slug: "inner-witness-with-ramana",
  title: "The Inner Witness",
  subtitle: "Seven days inside Ramana Maharshi's single question — Who am I?",
  guru: "Ramana Maharshi",
  guruRole: "the 20th-century sage of Arunachala who taught one question and one question only",
  theme: "🌀",
  color: "from-stone-500/30 via-amber-500/20 to-orange-500/10",
  category: "self-inquiry",
  duration: "7 days",
  promise: "By day 7 you will have a direct, repeatable experience of the awareness that sits behind your thoughts.",
  days: [
    {
      day: 1,
      title: "The One Question",
      oneLine: "There is a watcher behind the watcher. Today you start looking for it.",
      reading: `In 1896 a sixteen-year-old boy in Madurai lay down on the floor of his uncle's house and asked himself a strange question: *if I died right now, what part of me would actually be ending?* He went into the question so completely that within twenty minutes he had answered it — not philosophically, but in lived experience. The body, the breath, the personality, the name 'Venkataraman' — all of these were objects he could see. *Whatever could see them was not them.* That seeing thing was untouched by the death of any of the seen things.\n\nHe got up, walked out of the house, took a train to a mountain called Arunachala, and stayed in its caves for the next 54 years. People came from all over the world. He gave them all the same instruction: *find what you really are by ruling out everything you are not.* He called it atma vichara — self-inquiry — and he insisted it was the shortest path home.\n\nThis week you are going to do, in small daily doses, the same investigation Ramana did in twenty minutes that day. You may not finish it in a week. Most people do not finish it in a lifetime. But the looking itself is what changes you.`,
      practice: {
        name: "First Look",
        durationMin: 5,
        instructions: `Sit upright. Eyes closed.\n\nBring up a thought — any thought. "I am tired." "I am thinking about lunch." Let it sit there.\n\nNow ask, slowly: "Who is aware of this thought?"\n\nDon't answer in words. Look toward whatever is aware. You will not find an object. That is fine.\n\nStay for 90 seconds in the looking. When a new thought arises, ask again.`,
      },
      reflection: "Did the looking find a thing — or did it find a kind of open space?",
    },
    {
      day: 2,
      title: "I Am Not the Body",
      oneLine: "The body is something you have, not something you are.",
      reading: `The first layer Ramana asks you to rule out is the body. This sounds obvious until you try it. Most of your day is run on the silent assumption *I am this body*. Pain in the knee = I am hurting. Hunger in the stomach = I am hungry. Tiredness in the eyes = I am tired. The sentences feel identical to the sensations.\n\nThe inquiry move is to insert a tiny gap. *There is pain in the knee. I am aware of pain in the knee.* Those are two different sentences. The second is more accurate. The pain is in a region of the body; the awareness of the pain is not in the knee — it is everywhere at once, and it is not made of meat.\n\nDo this once for a sensation today and you will feel a small, sane click. The pain has not gone, but the suffering has loosened, because the *identification* has loosened.`,
      practice: {
        name: "Sensation, Not Self",
        durationMin: 3,
        instructions: `Pick any current bodily sensation — sit too long, breath, hunger, tightness.\n\nSay silently: "There is [sensation] in [region]. I am the awareness of it."\n\nRepeat three times slowly.\n\nNotice the small loosening. The sensation may stay. The grip on it changes.`,
      },
      reflection: "Where in your life have you been confusing 'I am hurting' with 'there is pain'?",
    },
    {
      day: 3,
      title: "I Am Not the Mind",
      oneLine: "Thoughts are weather. You are the sky they pass through.",
      reading: `The second and harder layer is the mind. Almost every modern person identifies completely with their thoughts. "I think therefore I am" is the deep assumption. Ramana would say Descartes got it exactly backwards. *You are aware therefore you are. Thoughts come and go inside that awareness; they are not its source.*\n\nProof: right now, before the next thought arrives, there is a brief gap. In that gap you are not gone. In dreamless sleep there are no thoughts, and you are not gone. Something stays. That something is not the mind, because the mind has been demonstrably absent and you are still here to read this sentence.\n\nThe inquiry does not deny thoughts. It denies *that thoughts are you*. They are weather. You are the open sky in which weather happens. You did not make the weather. You are not improved when the weather is good. You are not damaged when the weather is bad. You are the space that has room for any weather.`,
      practice: {
        name: "Sky and Weather",
        durationMin: 5,
        instructions: `Sit. Eyes closed.\n\nFor four minutes, let any thoughts come and go. Do not try to silence them.\n\nWith each thought, silently say: "Weather."\n\nWith each pause between thoughts, silently say: "Sky."\n\nNotice which one you actually are.`,
      },
      reflection: "If thoughts are weather, what kind of sky has your life been holding all this time?",
    },
    {
      day: 4,
      title: "The Source of 'I'",
      oneLine: "Track the word back to the thing.",
      reading: `Ramana's most surgical instruction was: *trace the I-thought to its source*. Every day, thousands of times, the thought "I" arises in your mind. "I am hungry." "I should call mom." "I want this." Each time, the word 'I' refers to *something*. But to what?\n\nThe inquiry is to catch one 'I' thought as it rises and ask, *where did this just come from?* Not in theory. Right now, in lived experience. You will notice the thought 'I' seems to rise from a specific place — usually somewhere in the chest or just behind the eyes. Look at that place. Look at what is doing the looking. Stay there.\n\nWhat you find — if you stay long enough — is not a person, not a self, not a thing at all. It is a kind of pure presence that the thought 'I' was pointing at without ever quite catching. That presence is what Ramana called the Self. Capital S. Not your self. The Self that is the same in every being who has ever lived.`,
      practice: {
        name: "Tracing the I",
        durationMin: 5,
        instructions: `Sit. Eyes closed.\n\nWait for the next 'I' thought to rise. ("I am sitting." "I am thinking." Anything.)\n\nThe moment it rises, ask: "Where did this 'I' just come from?"\n\nLook toward the source. Stay in the looking for as long as you can.\n\nWhen a new thought comes, repeat.`,
      },
      reflection: "When you looked for the 'I', what did you find — and what didn't you find?",
    },
    {
      day: 5,
      title: "The Witness Across the Day",
      oneLine: "Inquiry is not a cushion practice. It is a way of being awake.",
      reading: `The mistake almost every beginner makes is to think self-inquiry is something you do on a meditation cushion for twenty minutes a day. Ramana himself taught the opposite. *Bring the question into the middle of activity.* While brushing teeth, ask once: who is brushing? While angry at a meeting, ask once: who is angry? While scrolling, ask once: who is scrolling?\n\nThe goal is not to find an answer. The goal is to insert a tiny gap of *witnessing* into actions that were running on autopilot. Over months and years, those small gaps train a part of you that is always-already awake, even while everything else is busy.\n\nThis is the practical secret of awakened people. They are not always meditating. They are *always slightly witnessing themselves*. The witness has become the default channel. Everything else plays through it.`,
      practice: {
        name: "Three Pings",
        durationMin: 2,
        instructions: `Pick three moments in your day today: one in the morning, one mid-day, one evening.\n\nAt each moment, pause for ten seconds and silently ask: "Who is doing this?"\n\nDon't answer. Just look. Resume.\n\nAt the end of the day, notice if the three pings changed the texture of the day.`,
      },
      reflection: "Which of the three pings landed deepest — and what does that tell you about when you most need it?",
    },
    {
      day: 6,
      title: "The Heart Center",
      oneLine: "The Self has a felt location. Ramana said it sat to the right of the chest.",
      reading: `Ramana made one strange physiological claim that almost no one else has made: he said the *spiritual heart* — the felt locus of the Self — is not in the center of the chest like the emotional heart, but two finger-widths to the right of the sternum. He called it *hridayam*. He insisted this was experiential, not metaphorical. Modern teachers usually skip this teaching because it is hard to verify. But people who have done the inquiry long enough do report something very specific opening up in that location.\n\nFor today, you don't need to believe it. You only need to try it. Place attention on the area two finger-widths to the right of your sternum and rest there. Many people find an unexpectedly steady, warm sensation that is not the emotional heart. It is not romantic. It is not even particularly feeling-rich. It is just *home*.`,
      practice: {
        name: "Hridayam",
        durationMin: 5,
        instructions: `Sit upright. Place one fingertip two finger-widths to the right of your sternum.\n\nClose your eyes. Move attention to that exact spot.\n\nRest there for 4 minutes. Don't try to feel anything specific. Just hold the location with attention.\n\nWhen the mind wanders, return to the spot.`,
      },
      reflection: "Did the right-side location feel different from your usual heart center — and if so, how?",
    },
    {
      day: 7,
      title: "Living from the Witness",
      oneLine: "The practice ends the moment it becomes you.",
      reading: `If you have done even half of the practices this week, something small has shifted. You have caught yourself, more than once, as the *witness of* a thought or feeling, instead of being *identified with* it. That tiny shift is the entire prize. The traditions call it *viveka* — discrimination. It is the seed of every awakening that has ever happened on this planet.\n\nThe danger now is that you will treat this week as a course you completed and go back to the old default. The instruction for the rest of your life is small: once a day, for the rest of your life, ask the question. Just once. "Who is having this experience?" Twenty seconds. Anywhere. In bed before sleep. In the car at a red light. On a hard day, ten times. On an easy day, once.\n\nDo this for ten years. The witness will stop being a practice and become the floor of who you are. That is what Ramana meant when he said *the Self is already realized — the only practice is to stop pretending it isn't*.`,
      practice: {
        name: "The Lifetime Question",
        durationMin: 1,
        instructions: `For the rest of your life, once a day, anywhere, ask: "Who is having this experience right now?"\n\nLook. Don't answer in words.\n\nStart now. The first one is free.`,
      },
      reflection: "What would change in your life if the witness was always-on instead of occasionally remembered?",
    },
  ],
};

// ============================================================================
// 8 — BURNOUT RESET (Patanjali's Niyamas)
// ============================================================================
const BURNOUT_RESET: ShowroomProgram = {
  slug: "burnout-reset-with-patanjali",
  title: "Burnout Reset",
  subtitle: "Seven days using Patanjali's five niyamas as a modern nervous-system protocol.",
  guru: "Patanjali",
  guruRole: "the second-century compiler of the Yoga Sutras — the most precise mind manual ever written",
  theme: "🌿",
  color: "from-emerald-500/30 via-teal-500/20 to-sky-500/10",
  category: "nervous",
  duration: "7 days",
  promise: "By day 7 you'll have a five-tool protocol to pull yourself out of burnout faster, every time it tries to return.",
  days: [
    {
      day: 1,
      title: "Burnout Is a Nervous System State",
      oneLine: "You are not broken. You are dysregulated. There is a difference.",
      reading: `Burnout is not laziness, not weakness, not a character defect. It is a specific physiological state in which the sympathetic nervous system has been chronically activated for so long that the parasympathetic system has stopped showing up to clean things up. The result is the familiar combination: tired but wired, cynical, low-grade angry, unable to enjoy what used to be enjoyable, sleeping badly. If this is you, please notice you are not lazy. Your engine has been redlining for months and no one has done an oil change.\n\nPatanjali, two thousand years before the word 'burnout' existed, mapped exactly this. His Yoga Sutras describe five *niyamas* — five inner observances — that together act as a complete protocol for restoring the nervous system. Modern neuroscience would recognize each of them. They are: cleanliness (saucha), contentment (santosha), discipline (tapas), self-study (svadhyaya), and surrender (ishvara pranidhana).\n\nThis week you'll do one a day. By Sunday you'll have a personal five-piece toolkit. The toolkit is more durable than any individual practice because it covers every angle from which burnout sneaks back in.`,
      practice: {
        name: "The Honest Read",
        durationMin: 3,
        instructions: `Sit somewhere quiet. Eyes closed.\n\nScan: where in your body is the redline showing up? Jaw? Shoulders? Chest? Stomach? Lower back?\n\nFor each spot, silently name it: "Jaw redline. Shoulder redline."\n\nDo not fix. Just inventory. This is the baseline for the week.`,
      },
      reflection: "If your body were a colleague, what would it tell you about the last six months?",
    },
    {
      day: 2,
      title: "Saucha — Clean the Inputs",
      oneLine: "You cannot meditate your way out of a polluted information diet.",
      reading: `*Saucha* is usually translated as cleanliness. The classical commentaries meant bodily and ritual cleanliness — bathing, clean clothes, a clean meditation space. The modern translation is *input hygiene*. Your nervous system processes everything you take in: news, scrolls, conversations, food, light. Burnout is partly a downstream effect of a chronically dirty input stream. You can do all the breathwork in the world and still be wrecked if your first 30 minutes of every day are spent in algorithmically-optimized rage content.\n\nSaucha for today is small and concrete: identify the single dirtiest input in your day, and clean it for 24 hours. Not forever. Twenty-four hours, as an experiment. Watch what changes.`,
      practice: {
        name: "One Clean Input",
        durationMin: 5,
        instructions: `List the top three regular inputs to your nervous system: social feed, news, a specific person, work Slack, alcohol, a podcast.\n\nPick the one you suspect is dirtiest. Just one.\n\nFor the next 24 hours, do not consume it. Replace the time with silence or a walk.\n\nTomorrow, note what's different.`,
      },
      reflection: "Which input did you choose, and why was that one the obvious dirtiest?",
    },
    {
      day: 3,
      title: "Santosha — Contentment Is a Skill",
      oneLine: "Burnout is partly an addiction to 'more'. Santosha is the antidote.",
      reading: `*Santosha* — usually translated as contentment — is the second niyama and the most misunderstood. Westerners hear "contentment" and think "settling". Patanjali meant something more radical: *the practiced ability to find the present moment sufficient*. Not because nothing could be better, but because nothing needs to be better in order for you to be at rest right now.\n\nA chronic driver of burnout is the always-on background assumption that you are not yet where you should be. Once that assumption is running, no amount of achievement makes it shut up. Santosha is the deliberate practice of, several times a day, declaring the current moment enough. Not the current situation — that may genuinely need to change. The current *moment of being alive*. That is always enough, because it is all you actually have.`,
      practice: {
        name: "Three Enoughs",
        durationMin: 2,
        instructions: `Three times today, at any moment, pause and silently say: "This breath is enough. This body is enough. This moment is enough."\n\nDo not justify or explain. Just say it.\n\nAt night, note what the third 'enough' felt like compared to the first.`,
      },
      reflection: "Where in your life have you been waiting for 'enough' to arrive — when it has been here the whole time?",
    },
    {
      day: 4,
      title: "Tapas — Heat Without Damage",
      oneLine: "Burnout is not from too much tapas. It is from the wrong kind.",
      reading: `*Tapas* literally means heat. It is the willingness to do hard things on purpose — cold water, fasting, sitting through discomfort. The naive read says burnout people need less tapas. The classical read is more interesting: *most burnt-out people are running constant low-grade tapas (work stress) and no chosen tapas, and that is exactly the wrong ratio.*\n\nChosen tapas — a 60-second cold shower, a deliberate skipped meal, sitting through a difficult emotion without distraction — *strengthens* the nervous system. Unchosen, chronic, low-grade stress *weakens* it. The difference is whether you, the conscious self, picked the discomfort and know when it ends.\n\nFor today, do one small piece of chosen tapas. Not a heroic one. A small one. It is the choosing that does the medicine.`,
      practice: {
        name: "60 Seconds of Cold",
        durationMin: 1,
        instructions: `At the end of your next shower, turn the water as cold as it will go.\n\nStay for 30-60 seconds. Breathe slowly through the nose.\n\nDo not perform. Do not post. Just stand under the cold water and watch what your mind does.\n\nStep out. Notice the difference for the next two hours.`,
      },
      reflection: "What is one small, chosen discomfort you could put into your week — to take back the steering wheel from chronic stress?",
    },
    {
      day: 5,
      title: "Svadhyaya — Watch Yourself Like a Field Scientist",
      oneLine: "You cannot fix a system you have not observed.",
      reading: `*Svadhyaya* — self-study — is the fourth niyama. In its classical form it meant reading sacred texts. In its modern form it means *running yourself as an honest experiment*. Burnout thrives in unobserved nervous systems. The moment you start tracking — what time you wake, what you ate, what made the chest tight today, what made it open — burnout begins to lose its hiding place.\n\nThis is not journaling for catharsis. It is field notes from the scientist of your own life. Three lines a day, at the same time, in the same place, for thirty days, will tell you more about your nervous system than five years of vague self-reflection.`,
      practice: {
        name: "Three Lines a Day",
        durationMin: 2,
        instructions: `Tonight, before sleep, write three lines on a single page:\n\n1. The high point of today (one sentence).\n2. The low point (one sentence).\n3. One sensation in the body right now (one sentence).\n\nDo this same three lines every night for the next two weeks. The pattern is the gift.`,
      },
      reflection: "What is one pattern about yourself you already suspect — but haven't yet written down?",
    },
    {
      day: 6,
      title: "Ishvara Pranidhana — Stop Carrying Everything Alone",
      oneLine: "Burnout often hides a refusal to surrender.",
      reading: `The fifth and most subtle niyama is *ishvara pranidhana* — usually translated as 'surrender to God'. For people uncomfortable with that word, the more useful translation is: *the deliberate giving-up of the illusion that you are the sole manager of your life*.\n\nBurnt-out people are almost always carrying a hidden contract that says: if I don't carry this, no one will, and everything will collapse. The contract is usually false. Even when it is partly true, holding it 24/7 is what is burning you out, not the work itself.\n\nIshvara pranidhana is the daily ritual of placing the day's outcome — just the outcome, not the action — into something larger than your own grip. Religious people call that 'God'. Secular people can call it 'the world', 'the future', 'whatever happens'. The word matters less than the act of *unclenching the fist around outcomes*.`,
      practice: {
        name: "The Unclenching",
        durationMin: 3,
        instructions: `Sit upright. Make both hands into a fist on your knees.\n\nThink of the one thing you are most trying to control right now.\n\nOn an out-breath, slowly open both hands, palms up, and silently say: "I will do the next right thing. The rest is not mine to manage."\n\nSit with open palms for one more minute.`,
      },
      reflection: "What is the one outcome you have been trying to manage that was never actually yours to manage?",
    },
    {
      day: 7,
      title: "The Five-Piece Toolkit",
      oneLine: "Now you have a protocol. Carry it for life.",
      reading: `You now own five distinct tools. Saucha — clean an input. Santosha — declare a moment enough. Tapas — choose a small heat on purpose. Svadhyaya — three lines at night. Ishvara pranidhana — unclench the outcome fist. None of these alone will cure burnout. All five together, run daily, will.\n\nThe trick to using them is to know which one matches which symptom. If you are wired and angry, the issue is usually saucha (your inputs are dirty). If you are restless and chasing, the issue is usually santosha (you've forgotten enough). If you are flat and weak, the issue is usually tapas (you need chosen heat). If you can't tell what's wrong, the issue is svadhyaya (you haven't been watching). If you feel responsible for everything, the issue is ishvara pranidhana (the fist is clenched).\n\nWrite the five tools on a card. Carry it in your wallet. The next time burnout knocks, take out the card and ask which one is missing. Apply that one. Most weeks, this will be enough.`,
      practice: {
        name: "The Wallet Card",
        durationMin: 5,
        instructions: `Take a small piece of paper. Write five lines:\n\n• Saucha — clean one input\n• Santosha — this moment is enough\n• Tapas — choose one small heat\n• Svadhyaya — three lines at night\n• Ishvara pranidhana — unclench the fist\n\nFold and put in your wallet. Use it the next time you feel the burnout returning.`,
      },
      reflection: "Which of the five was hardest for you this week — and what does that say about the next six months?",
    },
  ],
};

// ============================================================================
// 9 — LETTING GO (Lao Tzu's Wu Wei)
// ============================================================================
const LETTING_GO: ShowroomProgram = {
  slug: "letting-go-with-lao-tzu",
  title: "Letting Go",
  subtitle: "Seven days inside the Tao Te Ching's most counter-intuitive teaching — wu wei, effortless action.",
  guru: "Lao Tzu",
  guruRole: "the legendary author of the Tao Te Ching — the shortest masterpiece in human history",
  theme: "🌊",
  color: "from-sky-500/30 via-cyan-500/20 to-emerald-500/10",
  category: "attention",
  duration: "7 days",
  promise: "By day 7 you'll know the difference between forcing and flowing — and have a daily test for which one you're doing.",
  days: [
    {
      day: 1,
      title: "The Tao That Can Be Spoken",
      oneLine: "Some things lose accuracy the moment you try to name them.",
      reading: `The Tao Te Ching opens with one of the strangest sentences ever written by a human: *the Tao that can be spoken is not the eternal Tao*. The book is then going to spend 5,000 characters describing the Tao — and the opening sentence is warning you, in advance, that all of it will be a finger pointing at the moon, never the moon itself.\n\nThis sets up the whole spirit of Taoism. The deepest things in life — love, presence, flow, ease — degrade the instant you try to grab them. The harder you try to be happy, the less happy you become. The harder you chase sleep, the more awake you are. The harder you try to be liked, the more performative you become. Wu wei — the central Taoist teaching of this week — is the practice of *not grabbing* what cannot be grabbed without spoiling.\n\nThis is not passivity. It is a more sophisticated form of action that knows when to act and when not to. The grandfather of every modern teaching about 'flow state' is here, in a 2,500-year-old Chinese text.`,
      practice: {
        name: "Name What Won't Be Named",
        durationMin: 3,
        instructions: `Sit. Eyes closed.\n\nPick one thing in your life you have been gripping hard — a goal, a person, an outcome.\n\nFor 90 seconds, instead of trying to think about it, just notice the *gripping itself*. Where in the body does the grip live? Throat? Stomach? Jaw?\n\nDon't release the grip yet. Just see it.`,
      },
      reflection: "Where in your body did the grip live — and what does that tell you about the cost of holding on?",
    },
    {
      day: 2,
      title: "Water Defeats Stone",
      oneLine: "Softness is not weakness. It is the slow form of strength.",
      reading: `The Tao Te Ching's most famous image: *nothing in the world is softer than water. Yet for grinding down what is hard and strong, nothing surpasses it.* Most adults are taught the opposite — that strength looks like hardness, that progress looks like force, that what doesn't push back will be walked over. Lao Tzu observed the opposite. The hard tree breaks in the storm. The grass bends and stays. The river does not argue with the boulder; it goes around, and a thousand years later, the boulder is sand.\n\nThis is not a metaphor for being a doormat. It is a technical instruction about *where to apply force*. Softness is force applied in the dimension of *time and consistency* rather than the dimension of *intensity and confrontation*. The person who walks two miles a day for thirty years beats the person who runs a marathon once and stops.\n\nNotice in your own life where you have been applying intensity that should have been consistency. That is almost always where exhaustion is coming from.`,
      practice: {
        name: "Where Are You the Boulder?",
        durationMin: 4,
        instructions: `Take a piece of paper. Write down one situation in your life where you have been the hard boulder — confronting, forcing, pushing.\n\nUnder it, write one way you could become water on the same situation — going around, going under, going through with consistency instead of force.\n\nNo pressure to act yet. Just see the alternative on paper.`,
      },
      reflection: "What in your life has been hardness, when it could have been water?",
    },
    {
      day: 3,
      title: "Wu Wei — The Action That Is Not Forcing",
      oneLine: "Effort and effectiveness are not the same thing.",
      reading: `*Wu wei* literally means 'non-doing', but a better translation is *effortless action* or *acting without forcing*. It does not mean doing nothing. It means *doing only what the moment is actually asking for, with no additional grip, narrative, or showmanship layered on top*.\n\nA skilled cook chopping vegetables is in wu wei. A river going downhill is in wu wei. A toddler walking is not in wu wei — she's trying. An Olympic gymnast at her peak is in wu wei — she's no longer trying, she's letting the trained body do what it knows.\n\nThe shortcut to wu wei in modern life is to ask, at the start of any task: *what is actually being asked here?* Most modern overwhelm comes from layering imagined requirements on top of real ones. The email actually needs three sentences. You wrote eight. The meeting actually needs you to decide one thing. You stayed for an hour. The conversation actually needs you to listen. You jumped in to fix.\n\nWu wei is the practice of doing the smallest sufficient thing, and then stopping.`,
      practice: {
        name: "Smallest Sufficient Thing",
        durationMin: 3,
        instructions: `Pick one task you have today.\n\nBefore you start, ask: "What is the smallest sufficient version of this?"\n\nDo that version. Resist adding more.\n\nWhen the smallest sufficient version is done, stop. Notice the resistance to stopping.`,
      },
      reflection: "How much of your daily effort is going into things the moment was never actually asking for?",
    },
    {
      day: 4,
      title: "Empty Space Is Where Things Happen",
      oneLine: "The usefulness of a cup is its emptiness, not its walls.",
      reading: `Lao Tzu's most beautiful chapter on emptiness: *thirty spokes share one hub — it is the hole at the center that makes the wheel useful. Clay is shaped into a vessel — it is the emptiness inside that makes it a vessel. Doors and windows are cut into a house — it is the empty space that makes the house livable. Thus what is, gives us value. What is not, gives us use.*\n\nMost modern lives are over-full. Calendars are over-full. Closets are over-full. Brains are over-full. We have confused having more with being better, and the result is a life that has no emptiness anywhere — no hub, no vessel, no door. There is nothing wrong with anything in the life. There is no *space* in the life. And space is where everything important happens.\n\nThe Taoist move is small and surgical: create one piece of deliberate emptiness today. An empty hour. An empty shelf. An empty notebook page. See what arrives in the empty space. The arrival is the proof.`,
      practice: {
        name: "Empty One Thing",
        durationMin: 5,
        instructions: `Pick one of: one hour on your calendar this week, one shelf in your house, one page in a notebook.\n\nMake it empty. Actually empty. Not 'mostly empty'. Empty.\n\nLeave it empty for at least 24 hours. Notice what wants to rush in to fill it. Don't let it.`,
      },
      reflection: "Where in your life is there no emptiness at all — and what might arrive there if you made some?",
    },
    {
      day: 5,
      title: "Knowing When to Stop",
      oneLine: "To know one's enough is to be rich.",
      reading: `Lao Tzu writes: *he who knows he has enough is rich.* This is not a teaching about poverty. It is a teaching about the architecture of desire. Desire is a system that does not have a built-in 'off' switch. If you wait for desire itself to tell you when to stop, it will never tell you. Whatever you have is, by desire's definition, not yet enough.\n\nThe only way out is to put the off switch *outside* of desire — to install, in advance, a definition of enough that you will respect even when you don't feel it. *I will eat until my stomach is 80% full. I will work until 6pm. I will scroll for ten minutes. I will buy this and nothing else from the store.* These are not restrictions. They are *self-given boundaries* that give your life a shape that desire alone never will.\n\nOne self-given boundary, kept for a week, will teach you more about wu wei than reading the entire Tao Te Ching.`,
      practice: {
        name: "One Boundary",
        durationMin: 3,
        instructions: `Pick one specific 'enough' you will define for yourself today.\n\nExamples: I will check email 3 times today and not more. I will eat one serving and not more. I will work until 7pm and not more.\n\nWrite it down where you can see it. Keep it for 24 hours. Notice both the resistance and the relief.`,
      },
      reflection: "What is one boundary that, if you kept it for a year, would change the texture of your life?",
    },
    {
      day: 6,
      title: "The Sage Does Not Compete",
      oneLine: "When you stop competing, no one can compete with you.",
      reading: `Lao Tzu: *the sage does not compete, and therefore no one in the world can compete with her*. The line sounds like a paradox until you sit with it. To compete means to enter a game on shared terms. As long as you are competing — for status, for attention, for the same partner, the same job, the same audience — you are inside someone else's game and you can lose. The moment you step out of the game and run a private game of your own, no one can beat you, because no one is even playing.\n\nThis is the secret of every original artist, every weird and successful business, every person you know who seems to live by their own rules. They are not winning the standard game harder. They are *not playing the standard game*. They have noticed that the standard game has too many players, all chasing the same prize, and that the prize, even if won, would not be the one they wanted.\n\nThe wu wei version is to ask, once a quarter: *what game am I currently playing — and would I still play it if no one was watching?* If the answer is no, you are in someone else's game.`,
      practice: {
        name: "The Private Game",
        durationMin: 5,
        instructions: `Sit with a notebook.\n\nList two or three things you have been competing for in the last year. Status, attention, position, comparison.\n\nFor each, ask: "If no one ever saw my version of this, would I still want it?"\n\nNotice which 'yes' surprised you and which 'no' surprised you. Those are signals about what game is actually yours.`,
      },
      reflection: "Which game are you in right now that, if you simply stopped playing, no one would notice but you would be lighter?",
    },
    {
      day: 7,
      title: "Live the Way Water Lives",
      oneLine: "Soft, low, patient, unargued-with, and somehow the strongest force in the room.",
      reading: `The whole Tao Te Ching could be summed up in one image: *be like water*. Water doesn't argue. It goes where it can. It pools in the lowest place no one wants to be — and that is exactly where life grows. It shapes itself to the cup, the river, the ocean, without losing its essential water-ness. It carves stone over centuries with no apparent effort. It rises as cloud, falls as rain, returns to itself a thousand times.\n\nA life lived like water has a specific texture. There is less drama. There is less forcing. There is more of what looks, from the outside, like luck — but is actually the accumulated effect of years of not arguing with reality. People around you find you easy to be near. Things you didn't push for arrive on their own. The chest is soft.\n\nThis is the prize. Not enlightenment, not bliss — just *a life that has stopped fighting the shape of itself*. That is more than enough for one lifetime. Go be water.`,
      practice: {
        name: "The Water Day",
        durationMin: 5,
        instructions: `Tomorrow, run one experiment. For the entire day, before any reaction, ask once: "What would water do here?"\n\nIt might mean: not arguing. Saying yes. Saying no without explaining. Going around instead of through. Waiting one beat longer.\n\nAt the end of the day, write one paragraph about what was different.`,
      },
      reflection: "If you lived as water for the next ten years, who would you have become by the end?",
    },
  ],
};

// ============================================================================
// 10 — THREE BRAINS (Head, Heart, Gut — with Sri Aurobindo)
// ============================================================================
const THREE_BRAINS_PROGRAM: ShowroomProgram = {
  slug: "three-brains-protocol",
  title: "The Three-Brain Protocol",
  subtitle: "Seven days learning the head, the heart, and the gut as three distinct intelligences — and using all three.",
  guru: "Sri Aurobindo",
  guruRole: "the seer of integral yoga who mapped mind, heart and vital as three cooperating instruments of a single consciousness",
  theme: "🧠",
  color: "from-violet-500/30 via-fuchsia-500/20 to-rose-500/10",
  category: "decision",
  duration: "7 days",
  promise: "By day 7 you will be able to consult three independent intelligences before any important decision — and know which to weight when.",
  days: [
    {
      day: 1,
      title: "You Have Three Brains",
      oneLine: "And one of them is always being ignored.",
      reading: `In 1991, the neuroscientist Michael Gershon published a book called *The Second Brain*, in which he made the boring scientific claim that the gut contains an autonomous nervous system of about 500 million neurons that operates largely independently of the brain in the skull. A few years later, neurocardiologists made a similar claim about the heart: roughly 40,000 sensory neurites that send more signals to the brain than the brain sends back. The Indian and Chinese contemplative traditions had been saying this for three thousand years already. They called them three centers — head, heart, hara. The Sufis called them three minds. The Christians called them three guides.\n\nThe modern person almost always operates from one of these three: the head. The other two are still there, still firing, still sending signals — but the head dominates and overrides them, especially in busy lives. The result is a slow, invisible cost: decisions get smaller, life gets flatter, intuition gets quieter, and at some point in midlife you wake up in a life that the head built, that the heart did not vote for, and that the gut tried to warn you about.\n\nThis week is the antidote. Five minutes a day, for seven days, you are going to deliberately separate the three voices and listen to each.`,
      practice: {
        name: "Three Hands",
        durationMin: 4,
        instructions: `Sit upright.\n\nPlace one hand on your forehead. Ask: "Head, what are you thinking right now?" Wait. Listen for words.\n\nMove that hand to the center of your chest. Ask: "Heart, what are you feeling right now?" Wait. Listen for sensation.\n\nMove that hand to just below the navel. Ask: "Gut, what do you know right now?" Wait. Listen for a yes/no felt sense.\n\nNotice which one answered fastest and which one was hardest to hear.`,
      },
      reflection: "Which of your three brains has been doing most of the talking — and which one has gone quiet?",
    },
    {
      day: 2,
      title: "The Head — The Analyst",
      oneLine: "The head is brilliant at means. It is terrible at ends.",
      reading: `The head — the cognitive brain — is the brain you went to school to develop. It does logic, language, planning, comparison, and abstraction. These are real powers. Most of modern civilization runs on them. The head is essential.\n\nBut the head has two specific blind spots. One: it is bad at *ends*. It can plan a flawless route to the wrong destination. Ask the head 'should I marry this person?' and it will produce a beautiful list of pros and cons that misses the actual answer. Two: the head is *only as good as its inputs*. If the head has been fed a story by fear, by an old wound, by parental voices, by social pressure, the head will compute a perfect answer downstream of those inputs and not notice the contamination.\n\nThe head's right job is to *execute and evaluate*. Once the heart and gut have voted on the destination, the head is the genius project manager that gets you there. Using the head as the *decider* is a misuse of the tool, like using a calculator to write a love letter.`,
      practice: {
        name: "Head as Project Manager",
        durationMin: 3,
        instructions: `Pick one current decision in your life.\n\nFor 90 seconds, write down only the *head answer*: the pros, the cons, the plan, the timeline.\n\nDo not commit yet. You'll consult the other two brains on day 3 and 4.`,
      },
      reflection: "Where in your life has the head been deciding what only the heart or gut should decide?",
    },
    {
      day: 3,
      title: "The Heart — The Valuer",
      oneLine: "The heart doesn't tell you the answer. It tells you which answer would still feel like yours in twenty years.",
      reading: `The heart-brain is the part of you that holds your *values* — the felt, embodied sense of what matters. It does not speak in sentences. It speaks in resonance: a warm pull toward one option, a quiet 'no' toward another, a tightening when an option is misaligned with who you actually are. People who have learned to read this signal become, over time, much harder to push around.\n\nThe heart's voice is faint and easily drowned. It speaks once, softly, and then waits. If you do not listen, it does not yell. It just goes quiet, sometimes for years, and the cost shows up later as a kind of generalized numbness — *I have everything I am supposed to want and I feel nothing*. That feeling is the heart saying: you stopped consulting me. Please come back.\n\nThe practice for hearing the heart is unsexy: sit, place a hand on the sternum, name the decision, and *wait long enough for a felt response*. Most people quit after four seconds. The heart often responds at twelve.`,
      practice: {
        name: "Wait Twelve Seconds",
        durationMin: 4,
        instructions: `Take the same decision from yesterday.\n\nPlace one hand on the center of your chest. Close your eyes.\n\nName the two main options out loud or in your head. After each, wait a full twelve seconds before moving on.\n\nNotice which option produced a warm pull, a tightening, or nothing. The heart's answer is usually the warm pull.`,
      },
      reflection: "What did your heart say — and how long had it been since you last asked it?",
    },
    {
      day: 4,
      title: "The Gut — The Knower",
      oneLine: "The gut already knows. The head is usually trying to talk it out of it.",
      reading: `The gut-brain — what the Japanese call *hara*, what yogis call *manipura* — is the part of you that delivers verdicts before you have evidence. The hair stands up when someone is dangerous. The stomach drops when a deal is bad. The shoulders open when a place is safe. This is not magic. It is the body integrating thousands of subtle signals — micro-expressions, tones of voice, ambient cues — and outputting a single yes/no faster than the head can parse.\n\nThe modern educated person has been trained to distrust this signal. We were told to *think things through* and to *not jump to conclusions*. This is half right and half disastrous. The gut is wrong sometimes — when the inputs are fear, trauma, or prejudice — but it is right far more often than the head gives it credit for. The mature use of the gut is: *take its first verdict seriously and then sanity-check, not the reverse*.\n\nThe practice for the gut is felt-sense, not thought. Bring up an option. Notice if the belly tightens or opens. That is the answer. Then go check.`,
      practice: {
        name: "The Belly Vote",
        durationMin: 3,
        instructions: `Same decision again.\n\nPlace one hand just below the navel. Close eyes.\n\nName option A. Don't think. Just notice: did the belly soften or tighten?\n\nName option B. Same.\n\nThe softer one is the gut's vote. Don't act on it yet. Just note it.`,
      },
      reflection: "Has the gut been telling you the same thing for months that the head has been arguing against?",
    },
    {
      day: 5,
      title: "When Two Out of Three Agree",
      oneLine: "The decision is made the moment any two of the three agree.",
      reading: `Now you have three votes. Some days, all three will agree. Those are easy decisions — go. Most days, the interesting case: *two agree, one objects*. The protocol is simple: act with the two, and listen carefully to the objector to make sure you've understood its concern.\n\nIf the head and heart agree but the gut objects, the gut is usually catching a danger you and your values haven't yet seen. Go slower. Add safety. Don't dismiss the gut.\n\nIf the heart and gut agree but the head objects, the head is usually catching a logistics problem you and your soul haven't yet seen. Solve it. Don't dismiss the head.\n\nIf the head and gut agree but the heart objects, the heart is usually catching a values misalignment you and your logic haven't yet seen. Pause. Don't sign yet.\n\nThe truly difficult case is *one against two against two* — all three disagreeing. That decision is not ready. You need more information, more time, or a wiser counsel. Do not force it.`,
      practice: {
        name: "Count the Votes",
        durationMin: 4,
        instructions: `Take your three answers from the last three days.\n\nWrite them in a row: HEAD says ___. HEART says ___. GUT says ___.\n\nCount the agreement. Apply the rule from today's reading.\n\nWrite one sentence: "I am acting because ___ and ___ agree, and I am taking ___'s objection seriously by ___."`,
      },
      reflection: "What decision in your life has been stuck precisely because one brain was being ignored?",
    },
    {
      day: 6,
      title: "When the Three Disagree for a Long Time",
      oneLine: "Chronic three-brain disagreement is a sign of an old wound, not a current problem.",
      reading: `Sometimes you'll find that on certain topics — money, intimacy, your relationship with a parent, a recurring career question — the three brains have been disagreeing for *years*. This is rarely because the current situation is genuinely ambiguous. It is almost always because *one of the three is being run by an old protocol* — usually from childhood — that is no longer accurate.\n\nA classic pattern: the head was trained, very young, that you must be successful or you will not be loved. So the head votes for every promotion. The heart, which has its own information, votes against because the work hollows you out. The gut votes against because something in the environment is unsafe. Two out of three say no, but the head's vote is *backed by old terror* and so it overrides the others, year after year.\n\nThe inquiry move is to ask the loudest brain *where it learned its current voting pattern*. Often you'll find it learned the pattern at age eight, in a specific room, from a specific parent. Once you've seen the source, the loud brain becomes quieter and the actual three-way vote becomes audible.`,
      practice: {
        name: "Where Did You Learn That?",
        durationMin: 5,
        instructions: `Pick one chronic disagreement among your three brains — something they have been arguing about for years.\n\nIdentify which brain is shouting loudest.\n\nAsk it: "When did you first learn this rule? What were you trying to protect me from back then?"\n\nDon't fix. Just listen. The loudness usually starts to soften the moment you've heard the origin story.`,
      },
      reflection: "Which of your three brains is running an old protocol that may not be true anymore?",
    },
    {
      day: 7,
      title: "Three-Brain Living",
      oneLine: "The point is not to make better decisions. The point is to make decisions with your whole self.",
      reading: `By the end of this week you will have done something most modern people never do in a lifetime: deliberately consulted three intelligences before a decision. Now you carry the protocol forward.\n\nFor the rest of your life, before any decision worth more than five minutes of attention, run the three-hand check. Forty seconds. Hand on head, hand on chest, hand on belly. Ask each. Count the votes. Act with the two that agree, after taking the third seriously.\n\nWhat changes over years of this is not so much the decisions themselves. It is the *texture of being you*. People who decide from one brain feel partial. People who decide from three feel whole. The chest does not have the slow ache of decisions made without it. The gut does not have the slow ache of warnings unheeded. The head does not have the slow ache of being asked to carry a load that was never its job.\n\nThis is the small, real promise. A life decided by all of you, not the loudest part of you.`,
      practice: {
        name: "The Forty-Second Check",
        durationMin: 1,
        instructions: `For the rest of your life, before any decision that matters:\n\n10 seconds, hand on head: what does the head think?\n10 seconds, hand on heart: what does the heart feel?\n10 seconds, hand on belly: what does the gut know?\n10 seconds: count the votes.\n\nForty seconds. The most efficient decision tool you'll ever own.`,
      },
      reflection: "If you ran this check before every important decision for the next ten years, who would you become?",
    },
  ],
};

// ============================================================================
// 11 — STILLNESS (Zen / Shikantaza — the art of just sitting)
// ============================================================================
const STILLNESS_ZEN: ShowroomProgram = {
  slug: "stillness-with-dogen",
  title: "Stillness",
  subtitle: "Seven days inside the Zen master Dōgen's only instruction — just sit.",
  guru: "Dōgen",
  guruRole: "the 13th-century Japanese master who taught that sitting itself was already enlightenment",
  theme: "🧘",
  color: "from-slate-500/30 via-stone-500/20 to-zinc-500/10",
  category: "attention",
  duration: "7 days",
  promise: "By day 7 you will know how to sit for 20 minutes without trying to get anywhere — and feel why that changes everything.",
  days: [
    {
      day: 1,
      title: "Just Sit",
      oneLine: "The hardest practice in the world is to do nothing on purpose.",
      reading: `In 13th-century Japan, a young monk named Dōgen returned from China with a teaching so simple it almost sounded like nothing. He said: *shikantaza* — just sit. No mantra. No visualization. No counting the breath. No goal. No technique. Sit upright. Be present. Do not chase the next thought; do not push it away. That's it.\n\nFor a thousand years before Dōgen, Buddhist practice had been increasingly elaborate — visualizations, deities, mantras, mudras. Dōgen burned all of it. He said: every technique is sneakily about *getting somewhere*, and the moment you are trying to get somewhere, you are not here. Enlightenment is not a destination at the end of a technique. It is the quality of being fully present in *this exact moment of sitting*.\n\nThis week you are going to practice shikantaza. It is the most boring practice in this app. It is also, by some accounts, the deepest.`,
      practice: {
        name: "Just Sit (5 min)",
        durationMin: 5,
        instructions: `Sit upright on a chair or cushion. Spine tall but not stiff. Eyes half-open, gaze about three feet in front of you on the floor.\n\nDo nothing else.\n\nDo not count the breath. Do not say a mantra. Do not visualize.\n\nWhen a thought comes, let it come. When it goes, let it go.\n\nSit for 5 minutes. The bell of your own breath ends it.`,
      },
      reflection: "What was the hardest part — the boredom, the urge to do something, or the silence?",
    },
    {
      day: 2,
      title: "The Goal Is the Problem",
      oneLine: "Every meditation goal turns meditation into a chore.",
      reading: `The moment you sit down to meditate *for stress relief*, you have already failed. You have inserted a goal. The mind, knowing there is a goal, immediately starts measuring: am I less stressed yet? am I doing it right? this isn't working — and the measurement itself is the new stress.\n\nDōgen's whole teaching is built on noticing this trap. He calls shikantaza *practice-realization* — the practice is the realization, not the route to it. You don't sit *in order to* become enlightened. You sit *because sitting is already what enlightened beings do*. Same activity. The difference is the absence of the carrot.\n\nThis is subtle and almost impossible to do perfectly. Even now, reading this, your mind is probably reframing 'no goal' as a new goal — *I'll be the kind of meditator who has no goal*. The mind is sneaky. The instruction is simply to notice the goal-making and gently let it go, again and again, for the rest of your life.`,
      practice: {
        name: "Sit Without Reason",
        durationMin: 7,
        instructions: `Sit for 7 minutes today. Same posture as yesterday.\n\nBefore you start, silently say once: "I am sitting for no reason."\n\nIf the mind starts performing — 'am I doing well? is this working?' — silently say again: "No reason."\n\nThat's the whole practice.`,
      },
      reflection: "What did your mind try to turn the no-goal into a goal of?",
    },
    {
      day: 3,
      title: "Posture First",
      oneLine: "The mind follows the spine.",
      reading: `Dōgen and every Zen master after him spent more time on *posture* than on any psychological teaching. This is not arbitrary. The Zen claim — backed by modern body-mind research — is that the state of the mind is mostly downstream of the state of the body. A collapsed spine produces a collapsed mood. A tall, supported, open spine produces a clear, supported, open mind. You cannot meditate your way out of a slouched body for very long.\n\nThe specific instructions are precise:\n\n• Sit on the front edge of a cushion or chair.\n• Pelvis tipped slightly forward so the lower back has a natural arch, not a slump.\n• Spine tall, as if a string is gently lifting the crown of the head.\n• Shoulders relaxed and slightly back.\n• Chin very slightly tucked.\n• Eyes half-open, soft gaze downward at about 45°.\n• Hands in cosmic mudra (right hand under left, thumbs lightly touching) or simply resting on the thighs.\n\nIf you take only one thing from this week, let it be the posture. Sit like this for two minutes a day for the rest of your life and your nervous system will be different in ten years.`,
      practice: {
        name: "The Zen Posture",
        durationMin: 5,
        instructions: `Set up the posture above, slowly, one element at a time.\n\nOnce in position, sit for 5 minutes without changing anything.\n\nNotice the difference between this posture and your default sitting posture. The difference is the medicine.`,
      },
      reflection: "How long has it been since you sat in a way that was actually supporting you?",
    },
    {
      day: 4,
      title: "Thoughts Are Not the Enemy",
      oneLine: "Trying to stop thinking is itself a thought.",
      reading: `Beginners almost universally assume that 'good meditation' means 'no thoughts'. This is wrong, and a lifetime of trying to achieve it is a lifetime of pointless frustration. Thoughts arise. The brain is a thought-arising organ the way the heart is a blood-pumping organ. You wouldn't sit down to meditate and try to stop your heart.\n\nDōgen's instruction is exact: *think non-thinking*. Which means: do not engage with thoughts (that's thinking), and do not push thoughts away (that's also a form of thinking). Just be the open space in which thoughts arise and pass, the way clouds arise and pass in the sky. The sky does not chase clouds. The sky does not refuse clouds. The sky just is sky, and the clouds do what clouds do.\n\nIf you can hold this attitude for even ten seconds, you have understood the entire shikantaza tradition.`,
      practice: {
        name: "Sky Mind (10 min)",
        durationMin: 10,
        instructions: `Sit in the posture from day 3.\n\nFor ten minutes, watch thoughts arise and pass without engaging or pushing.\n\nThe instant you notice you're thinking — that noticing is the practice. You are back. Do not scold yourself.\n\nEnd by sitting in silence for 30 seconds with no instruction at all.`,
      },
      reflection: "What was the relationship between you and your thoughts before this week — and what shifted?",
    },
    {
      day: 5,
      title: "The Pain in the Knee",
      oneLine: "Discomfort is a teacher you would never have hired voluntarily.",
      reading: `Around minute six of any serious sit, the body will start to protest. The knee will ache. The back will twinge. The nose will itch. The mind will offer dozens of urgent reasons to adjust, scratch, or quit. This is the most useful part of the practice.\n\nThe instruction is: *don't move for the small things*. If something is actually injurious, of course adjust. But for the ordinary itches and aches, sit through them. Watch what happens. Almost always, the sensation peaks, plateaus, and dissolves on its own — and you have learned, at a cellular level, that *not all uncomfortable signals require action*.\n\nThis is one of the great life skills hidden inside meditation. Most modern suffering comes from immediately scratching every itch — physical, emotional, digital. The person who has sat through a thousand itches on the cushion has a nervous system that can sit through ten thousand itches in life without flinching.`,
      practice: {
        name: "Don't Scratch",
        durationMin: 10,
        instructions: `Sit for 10 minutes.\n\nFor minor itches, aches, or urges, do not move. Note them. Watch them. Let them peak.\n\nNotice that almost every one of them passes without you needing to act.\n\nWhen the sit ends, notice how the body actually feels.`,
      },
      reflection: "Which itches in your daily life have you been scratching that, if you had let them peak and pass, would have taught you something?",
    },
    {
      day: 6,
      title: "Sitting Off the Cushion",
      oneLine: "The point of meditation is not the meditation. It is the day.",
      reading: `If shikantaza only happens on the cushion, it is a hobby. The Zen claim is that everything is the cushion. Washing dishes is shikantaza if you wash dishes the way you sit. Walking to the car is shikantaza if you walk the way you sit. Listening to your partner is shikantaza if you listen the way you sit.\n\nThe transferable element is *presence without agenda*. On the cushion you are present without trying to get somewhere. The same posture can be brought into a phone call, a meal, a walk. You can be doing the activity *and not be trying to be elsewhere* at the same time. This is the entire content of what Zen calls *enlightened action*.\n\nThe person on day one of practice can already feel the difference between drinking a cup of tea in shikantaza versus drinking it while scrolling. The difference is the whole prize.`,
      practice: {
        name: "Shikantaza Tea",
        durationMin: 5,
        instructions: `Make a cup of tea, coffee, or water.\n\nDrink it for five minutes. Phone away. Conversation off. Just drink.\n\nNotice each sip. The temperature. The smell. The pause.\n\nWhen the mind wants to do something else, return to the cup.`,
      },
      reflection: "What part of your day right now would be transformed if you brought just-sitting attention to it?",
    },
    {
      day: 7,
      title: "Sitting for the Rest of Your Life",
      oneLine: "Twenty minutes a day. For thirty years. That is the whole instruction.",
      reading: `The classical Zen prescription is simple and brutal: sit for twenty minutes a day, every day, for the rest of your life. No special days. No retreat replaces it. No app replaces it. Twenty minutes, every morning, alone with yourself, doing nothing.\n\nIf you do this — even imperfectly — for thirty years, you become someone the world does not know how to make. You become quiet inside. You become unshockable. The chest is open. The mind is steady. The face softens. You stop arguing with reality and reality stops resisting you. The traditions called this *the natural state*. There is nothing exotic about it. It is what a human being is when no one has been jerking the system around all day.\n\nMost people will not do this. The 1% who do are the people other people quietly notice. Be one of them. Start tomorrow. Twenty minutes. Same time. Same spot. For the rest of your life.`,
      practice: {
        name: "The 20-Minute Appointment",
        durationMin: 20,
        instructions: `Pick the time of day you will sit for the rest of your life. The same time each day, ideally before anything else.\n\nPick the spot. The same chair, cushion, or corner.\n\nDo it now for 20 minutes. The longest sit of the week.\n\nTomorrow, do it again. The day after, again. For the rest of your life.`,
      },
      reflection: "If you actually sat for 20 minutes a day for the next 30 years, who would you become — and is that the person you want to be?",
    },
  ],
};

// ============================================================================
// REGISTRY
// ============================================================================
export const SHOWROOM_PROGRAMS_EXTRA: ShowroomProgram[] = [
  HEART_OPEN,
  INNER_WITNESS,
  BURNOUT_RESET,
  LETTING_GO,
  THREE_BRAINS_PROGRAM,
  STILLNESS_ZEN,
];
