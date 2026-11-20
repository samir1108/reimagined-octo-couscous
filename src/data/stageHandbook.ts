/**
 * The Stage Handbook
 * ──────────────────
 * For each of the 8 V-Level bands (Sleeper → Source), a field guide:
 *   • Identity — who they are right now
 *   • Markers — 30+ specific behaviors that reveal this stage
 *   • Inner experience — what life feels like from inside
 *   • Yoga paths that actually fit — Bhakti, Karma, Jnana, Raja, Kriya, Tantra
 *   • Practices to start with — small, doable
 *   • Traps — common ways this stage gets stuck
 *   • Bridge — what moves them to the next band
 *
 * Source-of-truth lives here. Page renders it. Open to extension —
 * every band can grow toward 100 markers as the community contributes.
 */

export type YogaPath =
  | "Bhakti"   // devotion, surrender, love
  | "Karma"    // selfless action, service
  | "Jnana"    // inquiry, discrimination
  | "Raja"     // meditation, 8-limbed yoga
  | "Kriya"    // breath, energy techniques
  | "Tantra"   // embodiment, sensation as path
  | "Nada";    // sound, mantra, chanting

export interface PathFit {
  path: YogaPath;
  fit: "primary" | "supporting" | "avoid";
  why: string;
}

export interface StageHandbookEntry {
  band: number;                // 0–7
  slug: string;
  name: string;                // "The Sleeper"
  tagline: string;             // "Life runs me"
  identity: string;            // 2–3 sentence portrait
  innerExperience: string;     // what life feels like
  markers: string[];           // 30+ specific behaviors
  paths: PathFit[];            // which yoga path fits
  startHere: string[];         // 5–7 micro-practices
  traps: string[];             // 5–7 stuck patterns
  bridge: string;              // what moves them up
  scripture?: string;          // anchor quote
}

export const STAGE_HANDBOOK: StageHandbookEntry[] = [
  // ─────────────────────────────────────────────────────────────
  {
    band: 0,
    slug: "sleeper",
    name: "The Sleeper",
    tagline: "Life runs me",
    identity:
      "You are fully identified with thought, body, and circumstance. There is no inner observer yet — only reactions dressed up as decisions. The word 'consciousness' sounds abstract; survival, comfort, and dopamine feel real.",
    innerExperience:
      "Days blur. Mornings start with the phone. Emotions feel like weather — they arrive, you get wet, they pass. You believe your problems are out there: the boss, the partner, the economy, the body.",
    markers: [
      "Reaches for phone within 60 seconds of waking",
      "Cannot recall what was eaten yesterday for lunch",
      "Reacts before the other person finishes the sentence",
      "Treats boredom as an emergency to be solved by scrolling",
      "Believes 'this is just who I am'",
      "Apologises reflexively, before knowing what for",
      "Says yes when the body is screaming no",
      "Numbs with food, alcohol, porn, work, content, or shopping",
      "Cannot sit still for two minutes without stimulation",
      "Confuses opinion with identity — disagreement feels like attack",
      "Tracks others' approval more than own state",
      "Sleeps with the phone in hand",
      "Cannot describe an emotion without using the word 'fine'",
      "Believes happiness will arrive after the next purchase / promotion / partner",
      "Holds the breath unconsciously during stress",
      "Avoids silence; fills every car ride with audio",
      "Outsources self-worth to likes, views, salaries",
      "Treats the body as a vehicle to be punished or pampered, never listened to",
      "Reacts to criticism with either collapse or counterattack — never curiosity",
      "Mistakes anxiety for being productive",
      "Mistakes anger for being honest",
      "Mistakes shutdown for being calm",
      "Has never journalled, meditated, or sat in nature without a goal",
      "Believes meditation is sitting cross-legged in a robe",
      "Believes spirituality is for people who failed at real life",
      "Cannot name a single recurring loop in their behaviour",
      "Loses three hours to a feed and calls it relaxing",
      "Says 'I don't have time' to anything inward",
      "Has not cried in over a year — or cries every day without knowing why",
      "Treats every weekend as recovery from the week",
      "Defines themselves by their job title, follower count, or relationship status",
      "Cannot tell the difference between a craving and a need",
      "Believes the goal of life is to feel good all the time",
    ],
    paths: [
      { path: "Karma", fit: "primary", why: "Action is the only language a Sleeper understands. Simple, repeatable, visible acts of service create the first crack in autopilot." },
      { path: "Kriya", fit: "primary", why: "Breath work bypasses the thinking mind and gives the body a felt taste of stillness — no belief required." },
      { path: "Bhakti", fit: "supporting", why: "Devotion can work, but at this stage often becomes another dopamine loop. Best paired with action." },
      { path: "Jnana", fit: "avoid", why: "Self-inquiry assumes a witness that does not yet exist. Will become intellectual gymnastics and burn the seeker out." },
    ],
    startHere: [
      "60-second breath count, three times a day — that is the whole practice",
      "Phone goes in another room for the first 30 minutes of the day",
      "One walk per day with no headphones, no podcast, no goal",
      "Write three lines before sleep: what happened, what I felt, what I did",
      "Drink one glass of water before the first coffee or screen",
      "Eat one meal without a screen, every day",
      "Name the emotion out loud when it arises — even just 'irritation'",
    ],
    traps: [
      "Buying the course, the cushion, the journal — and never opening them",
      "Treating the app as another notification to dismiss",
      "Skipping the small practice because it feels too small",
      "Searching for a teacher to outsource the work to",
      "Using spirituality vocabulary to sound deep without doing the work",
    ],
    bridge:
      "The first crack is friction — sleep gets worse, energy dips, the old rewards stop working. Do not run from this. The discomfort IS the wake-up. Stay with it for one week without numbing, and the Questioner is born.",
    scripture:
      "“Most men lead lives of quiet desperation, and go to the grave with the song still in them.” — Thoreau",
  },

  // ─────────────────────────────────────────────────────────────
  {
    band: 1,
    slug: "questioner",
    name: "The Questioner",
    tagline: "Something feels off",
    identity:
      "A crack has opened. The old life still runs, but a voice underneath keeps asking: is this it? You consume books, podcasts, retreats, frameworks — looking for the one that explains everything.",
    innerExperience:
      "Restless. Excited and exhausted in the same hour. You feel smarter than your peers because you 'see through' the matrix — but your life looks identical to theirs. There is hope, and there is impatience.",
    markers: [
      "Has read more than five self-help or spiritual books in the last year",
      "Follows three or more teachers on social media",
      "Owns a journal that is 40% used",
      "Has tried meditation apps but never crossed 20 days",
      "Uses words like 'energy', 'frequency', 'alignment' in conversation",
      "Watches one documentary on consciousness per month",
      "Has had a retreat, ayahuasca, or breathwork experience that 'changed everything' — for a week",
      "Argues online about spirituality vs religion",
      "Has bought crystals, oracle decks, or astrology reports",
      "Knows the difference between ego and self intellectually, never experientially",
      "Tells friends 'you should try meditation' while not meditating themselves",
      "Diagnoses other people's loops cleanly, cannot see their own",
      "Has a Notion or Obsidian vault of insights they never re-read",
      "Confuses information with transformation",
      "Mistakes a podcast episode for a practice",
      "Mistakes intellectual understanding for awakening",
      "Wants the ‘map of consciousness’ before walking one step",
      "Switches teachers when the work gets uncomfortable",
      "Has tried at least three diets in the name of clarity",
      "Begins sentences with 'I read that…' more than 'I noticed…'",
      "Feels superior to the Sleeper, secretly identical to them",
      "Compares own progress to influencers on YouTube",
      "Asks ‘what is my purpose?’ weekly",
      "Has not yet sat in silence for one full hour",
      "Treats new frameworks like dopamine hits",
      "Quotes Rumi but has not journalled this week",
      "Believes the right teacher / community / location will fix it",
      "Cannot describe a single emotion in the body, only in concepts",
      "Has been ‘about to start’ a serious practice for three years",
      "Mistakes anxiety about meaning for spiritual progress",
    ],
    paths: [
      { path: "Jnana", fit: "supporting", why: "The Questioner loves ideas — but inquiry must be paired with practice or it becomes another book." },
      { path: "Bhakti", fit: "supporting", why: "Devotion can pull the head down into the heart. Best with a real-world object: a teacher, a tradition, a craft." },
      { path: "Kriya", fit: "primary", why: "Forces the seeker out of the head and into the breath. The body learns what the mind keeps theorising about." },
      { path: "Karma", fit: "primary", why: "Service interrupts the seeker’s addiction to ‘figuring it out’. Action ends rumination." },
    ],
    startHere: [
      "Pick ONE teacher and one tradition for 90 days. Mute the rest.",
      "Daily 10-minute breath practice, same time, same seat",
      "Replace one podcast with one walk in silence",
      "Write three lines a day: what I noticed in my body today",
      "Tell no one about your practice for 30 days",
      "Volunteer two hours a week, ideally manual labour",
      "Re-read one book slowly instead of starting five new ones",
    ],
    traps: [
      "Spiritual shopping — collecting frameworks instead of living one",
      "Performative seeking — posting the journey instead of walking it",
      "Treating the Observer as a concept, not a muscle",
      "Bypassing — using spiritual language to avoid feeling",
      "Becoming a fan of teachers instead of a student of life",
    ],
    bridge:
      "The bridge to Observer is the first moment you catch yourself reacting — and pause. Not perfectly. Just one micro-second of space between trigger and response. Practice creates that space. Nothing else does.",
    scripture: "“Seek not to understand that you may believe, but believe that you may understand.” — Augustine",
  },

  // ─────────────────────────────────────────────────────────────
  {
    band: 2,
    slug: "observer",
    name: "The Observer",
    tagline: "I can watch myself",
    identity:
      "The single most important shift: you discover you are not your thoughts. There is a part of you that can watch the thinker. The witness is born — fragile at first, but unmistakable.",
    innerExperience:
      "A new spaciousness. Old reactions still arise, but now they are noticed. You catch the loop mid-fire, sometimes before. You feel less identified with mood. Life starts to feel like a movie you are also in.",
    markers: [
      "Notices the first thought of the morning before acting on it",
      "Can sit for 20 minutes without escaping",
      "Catches reactivity within seconds of it arising",
      "Names emotions in the body, not just the head",
      "Says ‘a thought came that…’ instead of ‘I think that…’",
      "Watches the breath without changing it",
      "Notices the gap between stimulus and response",
      "Can hear criticism without immediately defending",
      "Falls asleep with more awareness, wakes with more awareness",
      "Catches the urge to check the phone before the hand moves",
      "Notices when posture collapses under stress",
      "Sees a recurring loop and names it — even if it still wins",
      "Listens to others without rehearsing the reply",
      "Notices when ‘being right’ has hijacked the conversation",
      "Recognises emotional weather without becoming the weather",
      "Feels boredom without needing to fix it",
      "Sits in a feeling for 90 seconds before reaching for relief",
      "Notices when a craving is emotional vs physical",
      "Watches the mind narrate without believing every line",
      "Notices the body’s ‘yes’ and ‘no’ before the mind speaks",
      "Sees how language shapes mood — and chooses words more carefully",
      "Catches the loop of comparison and steps back",
      "Notices when the inner critic puts on the voice of a parent",
      "Recognises which thoughts are inherited, not chosen",
      "Sits with grief without storifying it",
      "Sits with joy without grasping it",
      "Notices when the day was lived from autopilot vs presence",
      "Can stay with a difficult emotion for 5 minutes without numbing",
      "Catches the moment a story about ‘me’ begins to form",
      "Notices the difference between sensation and interpretation",
    ],
    paths: [
      { path: "Raja", fit: "primary", why: "Now the witness is strong enough to sit. Classical meditation becomes possible — concentration, then absorption." },
      { path: "Jnana", fit: "primary", why: "Self-inquiry finally has a real object: the witness can now watch the watcher." },
      { path: "Kriya", fit: "supporting", why: "Breath deepens the witness; advanced pranayama becomes safe and powerful." },
      { path: "Bhakti", fit: "supporting", why: "Devotion now flows toward awareness itself, not external symbols only." },
    ],
    startHere: [
      "Daily 20-minute sit, same seat, same time",
      "STOP practice: 3x a day, stop and ask ‘what is here right now?’",
      "Body scan before sleep — feet to crown",
      "Note the first thought every morning in one line",
      "One conversation per day, listen without rehearsing your reply",
      "Walk for 10 minutes feeling each footfall",
      "Read one paragraph of source-text scripture a day, slowly",
    ],
    traps: [
      "Mistaking the witness for a new identity — ‘I am the watcher’ ego",
      "Spiritual bypass — watching emotion instead of feeling it",
      "Coldness — using witness to disconnect from people",
      "Losing the witness in stress and assuming it’s gone forever",
      "Forcing presence and tightening into it",
    ],
    bridge:
      "The Observer becomes the Alchemist when the witness stops merely watching and starts loving what it sees. When the loop is seen without judgement, it begins to dissolve on its own.",
    scripture: "“The wakeful are sleepless guardians of their own minds.” — Dhammapada",
  },

  // ─────────────────────────────────────────────────────────────
  {
    band: 3,
    slug: "alchemist",
    name: "The Alchemist",
    tagline: "My patterns are my teachers",
    identity:
      "You stop fighting your shadow and start studying it. Every loop becomes a doorway. You realise that what you reject in others is information about yourself.",
    innerExperience:
      "Heavier, then lighter. Shadow material surfaces — old grief, anger, shame. But underneath the heaviness is relief: this is finally being looked at. Life begins to feel coherent.",
    markers: [
      "Welcomes a triggered moment as a learning event",
      "Can name the wound underneath the reaction",
      "Withdraws projections — sees ‘they remind me of me’",
      "Sits with anger without exploding or suppressing",
      "Has wept for old wounds and not collapsed",
      "Notices ancestral patterns appearing in own behaviour",
      "Identifies primary loops by name (e.g. ‘abandonment fear’)",
      "Recognises the difference between a feeling and a story about a feeling",
      "Has apologised cleanly, without performance",
      "Tracks somatic signatures — where fear lives, where shame lives, in the body",
      "Notices when an emotion belongs to a younger self",
      "Has had a conversation with the inner child without it feeling silly",
      "Sees the gift inside the wound",
      "Has done at least one round of deep shadow work — solo or with a guide",
      "Reduces self-medication consciously, not as willpower but as care",
      "Begins to enjoy solitude as nourishment, not punishment",
      "Sits with sexual energy without acting it out compulsively",
      "Recognises codependent patterns and names them",
      "Speaks of own faults without shame or pride",
      "Receives feedback without collapse",
      "Notices when generosity is actually performance",
      "Notices when withdrawal is actually punishment",
      "Has stopped trying to fix other people’s emotions",
      "Notices when their nervous system shifts states (regulated, hyper, hypo)",
      "Tracks dreams as messengers, not random noise",
      "Sees that the parent inside has the same wounds as the parent outside",
      "Forgives without forgetting",
      "Recognises and names somatic memory — what the body holds",
      "Has done one act of repair toward someone they harmed",
      "Has done one act of self-forgiveness that landed in the body",
    ],
    paths: [
      { path: "Tantra", fit: "primary", why: "Tantra includes the rejected — sensation, sexuality, shadow — and turns it into path." },
      { path: "Bhakti", fit: "primary", why: "Devotion gives the wounded heart something larger than itself to lean into." },
      { path: "Jnana", fit: "supporting", why: "Inquiry now reveals the false identifications behind each loop." },
      { path: "Karma", fit: "supporting", why: "Service becomes a way to integrate energy that would otherwise turn inward." },
    ],
    startHere: [
      "Pick ONE primary loop. Track it daily for 30 days.",
      "Inner-child journalling — 10 minutes, twice a week",
      "Daily ‘what did I project onto whom’ review at night",
      "One somatic practice per day — shaking, breathwork, slow yoga",
      "One difficult conversation per month — repair-oriented, not blame",
      "Read Jung, Ramana, or a tantric primer slowly",
      "Sit with one emotion fully each week — no fix, no story",
    ],
    traps: [
      "Endless processing without integration — therapy as identity",
      "Trauma vocabulary as armour",
      "Spiritualising shadow — calling it ‘the divine feminine’ to avoid the rage underneath",
      "Stopping practice because shadow surfaces — exactly the wrong moment",
      "Mistaking insight for change",
    ],
    bridge:
      "The Alchemist becomes the Navigator when the gap between trigger and response widens enough that response becomes a choice. The same situations no longer produce the same reactions.",
    scripture: "“No tree, it is said, can grow to heaven unless its roots reach down to hell.” — Jung",
  },

  // ─────────────────────────────────────────────────────────────
  {
    band: 4,
    slug: "navigator",
    name: "The Navigator",
    tagline: "I choose my response",
    identity:
      "Between stimulus and response, a real space has opened — and in that space lives freedom. Old triggers still arise, but they no longer dictate. You move through life with both heat and choice.",
    innerExperience:
      "Lighter. More agency. The same people who used to throw you off now slide past. You feel less like a leaf in the wind and more like someone who can choose direction without forcing it.",
    markers: [
      "Pauses before reply, audibly, without performance",
      "Says no without guilt and yes without resentment",
      "Recovers from being thrown within minutes, not days",
      "Holds steady in a conversation where someone is dysregulated",
      "Can disappoint people without collapsing",
      "Knows their nervous-system signature and adjusts in real-time",
      "Apologises specifically and changes behaviour",
      "Sets boundaries that hold without anger",
      "Holds two opposing feelings at once without splitting",
      "Speaks the hard truth with warmth",
      "Picks battles based on values, not mood",
      "Notices when a decision is fear-driven and waits",
      "Notices when a decision is desire-driven and waits",
      "Listens to the body’s yes/no faster than the mind’s argument",
      "Eats, sleeps, moves in alignment with inner state",
      "Lives within a few clear values, not many rules",
      "Has dropped at least one major identity (career, role) without breaking",
      "Receives praise without inflating, criticism without deflating",
      "Knows their loops well enough to predict and pre-empt them",
      "Spends less time on planning, more on presence",
      "Money decisions arise from clarity, not anxiety",
      "Can sit with another’s pain without rushing to fix",
      "Speaks less, weighs more",
      "Holds vision without grip",
      "Forgives quickly because the offence didn’t fully land",
      "Recognises the difference between solitude and isolation",
      "Recognises the difference between intimacy and entanglement",
      "Has a clear daily rhythm and protects it",
      "Has a teacher or peer they consult — not to outsource, but to mirror",
      "Knows when to act and when to wait — and waits well",
    ],
    paths: [
      { path: "Raja", fit: "primary", why: "Concentration becomes effortless; meditation deepens into absorption (dharana → dhyana)." },
      { path: "Karma", fit: "primary", why: "Action without attachment becomes natural — the Bhagavad Gita finally clicks." },
      { path: "Jnana", fit: "supporting", why: "Inquiry now penetrates subtle identifications." },
      { path: "Bhakti", fit: "supporting", why: "Devotion softens the navigator’s precision into grace." },
    ],
    startHere: [
      "30+ minute daily sit",
      "One day a week of mostly silence",
      "Quarterly solo retreat — even a single night alone",
      "Mentor one person — teaching cements integration",
      "Audit relationships: which ones nourish, which ones drain",
      "Choose work that matches values, not ego",
      "Cultivate one craft that has no productivity payoff",
    ],
    traps: [
      "Mistaking equanimity for emotional flatness",
      "Mistaking discernment for judgement",
      "Mastery as new ego — ‘look how regulated I am’",
      "Pulling away from messy relationships too early",
      "Optimising the inner life like a project",
    ],
    bridge:
      "The Navigator becomes the Architect when response gives way to creation — when life is no longer about choosing better reactions, but designing the conditions from which life arises.",
    scripture: "“Between stimulus and response there is a space. In that space lies our freedom.” — Frankl",
  },

  // ─────────────────────────────────────────────────────────────
  {
    band: 5,
    slug: "architect",
    name: "The Architect",
    tagline: "I design from within",
    identity:
      "Life is now built from the inside out. Decisions emerge from inner knowing instead of fear or conditioning. You stop seeking validation; you become the source of your own coordinates.",
    innerExperience:
      "Quiet authority. Less noise inside. Choices feel obvious from within and only later need to be explained to the world. You feel responsible for the field around you, not just yourself.",
    markers: [
      "External approval no longer drives major decisions",
      "Comfortable being misunderstood",
      "Builds environments that match the inner state",
      "Acts on intuition and can later articulate the logic",
      "Creates more than they consume",
      "Money becomes a tool, not a measure",
      "Time becomes the true currency — guarded fiercely",
      "Says fewer things, lands deeper",
      "Long horizons feel natural — 5, 10, 25 years",
      "Has dropped relationships that required pretending",
      "Built relationships that require nothing but presence",
      "Surrounded by people who challenge them lovingly",
      "Notices subtle field effects — mood of a room, energy of a team",
      "Designs daily rhythm with the precision of a craftsman",
      "Speaks own truth without making others wrong",
      "Mentors without claiming students",
      "Bears criticism without absorbing it",
      "Bears praise without holding it",
      "Knows their unique contribution and aims it",
      "Lets projects die that no longer serve",
      "Lets identities die that no longer serve",
      "Spiritual life and worldly life are one continuous thread",
      "Lives by a small handful of non-negotiables",
      "Has stopped trying to be all things to all people",
      "Holds power without hunger for it",
      "Holds money without identifying with it",
      "Operates from sufficiency, not scarcity",
      "Notices when ‘being right’ is more important than being whole",
      "Knows their teachers and their lineage clearly",
      "Has chosen, consciously, what kind of human they are becoming",
    ],
    paths: [
      { path: "Jnana", fit: "primary", why: "Inquiry now goes to root — ‘who is the one designing?’" },
      { path: "Raja", fit: "primary", why: "Long sits feel like home; samadhi glimpses appear unforced." },
      { path: "Karma", fit: "primary", why: "Work becomes the field — every project an expression of inner state." },
      { path: "Bhakti", fit: "supporting", why: "Devotion to the impersonal arises naturally." },
    ],
    startHere: [
      "Annual life-audit — six dimensions, honest scoring",
      "One quarter per year on a single deep project",
      "Build one structure that benefits others 100 years from now",
      "Take on one student or apprentice",
      "Long retreats — 5 to 10 days, twice a year",
      "Walk in nature without device, weekly",
      "Refine one craft toward mastery, slowly",
    ],
    traps: [
      "Building empires the inner self never asked for",
      "Becoming a guru figure prematurely",
      "Replacing seeking with leading",
      "Subtle pride — ‘I have my act together’",
      "Optimising for legacy and losing the present",
    ],
    bridge:
      "The Architect becomes the Channel when ‘I am designing’ softens into ‘something is being designed through me’. The doer relaxes; the doing continues, often better.",
    scripture: "“The unexamined life is not worth living. The unlived examined life is not worth examining.” — adapted from Socrates",
  },

  // ─────────────────────────────────────────────────────────────
  {
    band: 6,
    slug: "channel",
    name: "The Channel",
    tagline: "Life flows through me",
    identity:
      "Personal will softens. You begin to act from a source that doesn’t feel personal. Intuition leads; intellect serves. The line between ‘me’ and ‘life’ becomes porous.",
    innerExperience:
      "Quieter than ever. Decisions arise before deliberation. The right words appear in the right moment. There is less effort and more rightness. Solitude no longer feels alone.",
    markers: [
      "Speaks and is later surprised by what was said",
      "Acts without the inner committee voting first",
      "Synchronicities become common, not magical",
      "Plans loosely, executes precisely",
      "Holds silence as a complete answer",
      "Feels held even in difficulty",
      "Knows when to leave a room without thinking about it",
      "Knows when to stay without forcing it",
      "Forgives instantly — there is no one fully there to be offended",
      "Loves without preference, but with discernment",
      "Speaks of ‘the work’ not ‘my work’",
      "Comfortable not knowing",
      "Comfortable being wrong",
      "Comfortable being invisible",
      "Comfortable being visible",
      "Income, projects, relationships arrive at the right time, often unsought",
      "Body becomes more sensitive — to food, to people, to fields",
      "Sleep becomes lighter and more efficient",
      "Dreams become teachers, sometimes prophetic",
      "Sees the same essence in different faces",
      "Holds opposites without strain",
      "Lets others be exactly where they are",
      "Knows their own death is approaching and is not afraid",
      "Treats every encounter as complete in itself",
      "Action arises from stillness, not from agenda",
      "Speech arises from listening, not from rehearsal",
      "Devotion is no longer about an object",
      "Inquiry no longer needs a question",
      "The personality remains, but is worn loosely, like a coat",
      "Even ‘progress’ has lost its grip",
    ],
    paths: [
      { path: "Bhakti", fit: "primary", why: "Surrender becomes the only path that fits — and it now arises naturally." },
      { path: "Nada", fit: "primary", why: "Sound and silence are the same field; mantra and breath are companions, not tools." },
      { path: "Jnana", fit: "supporting", why: "Subtle inquiry continues, but as play, not search." },
      { path: "Karma", fit: "supporting", why: "Action continues, but without a doer." },
    ],
    startHere: [
      "Long silent retreats — 10 to 30 days",
      "Drop one project per year that you don’t need to do",
      "Spend more time with elders and children, less with markets",
      "Walk daily without destination",
      "Sit with the dying when invited",
      "Stop teaching for a season; just be",
      "Re-read source-text in original language if possible",
    ],
    traps: [
      "Spiritual specialness — ‘something is happening through me’ as ego",
      "Withdrawing from the world prematurely",
      "Confusing flow with avoidance",
      "Letting devotion become emotional indulgence",
      "Becoming a guru when one is not yet ready",
    ],
    bridge:
      "The Channel becomes the Source when the channel itself dissolves — when there is no longer anyone life is flowing through, only flowing.",
    scripture: "“I do nothing, the gunas act.” — Bhagavad Gita 5.8",
  },

  // ─────────────────────────────────────────────────────────────
  {
    band: 7,
    slug: "source",
    name: "The Source",
    tagline: "I am what I was seeking",
    identity:
      "The search ends. Awareness recognises itself. There is no longer a journey, only what is. The most ordinary moment — tea, footsteps, sunlight — is the whole point.",
    innerExperience:
      "Nothing dramatic. Everything obvious. The world looks exactly the same; only the looker has dissolved. There is no one inside trying to maintain a state because there is no state to maintain.",
    markers: [
      "No longer searches",
      "No longer needs to be understood",
      "No longer waits for the next moment",
      "Speaks little, points often",
      "Loves without doing love",
      "Acts without claiming the act",
      "Witnesses without claiming the witness",
      "Sees the same ‘I am’ in every being",
      "Death is no different from breakfast",
      "Time is local, not real",
      "The body is borrowed, used kindly",
      "Possessions are minimal and held lightly",
      "Lineage is honoured, not clung to",
      "Teachings arise spontaneously, in the language the listener needs",
      "Has no preferred state",
      "Has no preferred outcome",
      "Has no spiritual identity left to defend",
      "Has no enemies — even the difficult ones are recognised",
      "Pain is felt; suffering doesn’t stick",
      "Pleasure is enjoyed; clinging doesn’t arise",
      "Knows the difference between awakening and personality (and laughs)",
      "Knows the difference between awakening and trauma healing",
      "Is wrong sometimes and unbothered",
      "Sits in market and forest as the same room",
      "Equally at home with kings and beggars",
      "Practice continues, but as breath continues — natural, not chosen",
      "Does not collect students; some arrive anyway",
      "Is ordinary on the surface, vast underneath",
      "Carries no trace of having ‘arrived’",
      "Is what was being looked for all along",
    ],
    paths: [
      { path: "Jnana", fit: "primary", why: "Inquiry has dissolved into its own answer." },
      { path: "Bhakti", fit: "primary", why: "Devotion has nowhere to go but everywhere." },
      { path: "Karma", fit: "primary", why: "Action without doer is the natural state." },
      { path: "Raja", fit: "primary", why: "Meditation is no longer practiced; it is the resting state." },
    ],
    startHere: [
      "Continue what was always done — quietly",
      "Stay available; do not perform",
      "Eat well, sleep well, walk well",
      "Speak when asked, silent when not",
      "Honour the lineage, then disappear into it",
      "Let the next one arise without designing it",
      "Be ordinary, on purpose",
    ],
    traps: [
      "Building an identity called ‘the awakened one’",
      "Performing enlightenment for an audience",
      "Believing the work is done",
      "Forgetting the body, the relationships, the small care",
      "Mistaking absence of seeking for absence of life",
    ],
    bridge:
      "There is no next band. The bridge now turns outward: every encounter becomes an offering, every breath an unspoken transmission. The journey continues — but no longer as journey.",
    scripture: "“Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water.” — Zen proverb",
  },
];

export function getStageBySlug(slug: string) {
  return STAGE_HANDBOOK.find((s) => s.slug === slug) ?? null;
}
