// Loops Atlas — long-form, essay-grade pages for the most universal loops.
// References the master loop library (src/data/loops.ts) but adds the depth.

export interface LoopEssay {
  slug: string;
  name: string;
  loopId?: string;        // optional link to canonical loop in loops.ts
  ancientName: string;    // The Sanskrit / Pali / classical name
  category: "self" | "other" | "time" | "mind" | "body";
  oneLine: string;
  trigger: string;        // What fires it
  manifestation: string;  // What it looks like from outside
  neuroscience: string;   // What's actually happening in the nervous system
  ancientDiagnosis: string; // What the lineage already said about it
  dissolution: string;    // Practice + lineage path that breaks it
  signOfHealing: string;  // How you know it's resolving
}

export const LOOP_ESSAYS: LoopEssay[] = [
  {
    slug: "people-pleasing",
    name: "People-Pleasing",
    ancientName: "Lobhā-rāga — clinging to approval",
    category: "other",
    oneLine: "Saying yes when the body is already saying no.",
    trigger:
      "Any moment where being honest risks loss of belonging — at work, with a parent, with a partner, with a stranger. The body senses the threat before the mind names it.",
    manifestation:
      "Overcommitting. Apologizing for taking up space. Laughing at jokes you don't find funny. A subtle, low-grade resentment toward the people you keep agreeing with.",
    neuroscience:
      "The amygdala registers social disapproval as a survival threat — same circuits as physical danger. The vagus nerve flips into a tend-and-befriend state. Dopamine spikes when approval arrives, conditioning the loop further. Over years, the body forgets it has the right to say no.",
    ancientDiagnosis:
      "Patañjali names it in the Yoga Sutras as one form of rāga (attraction-based suffering). The Buddha lists it as the 'worldly wind' of praise. Krishna in the Gītā specifically warns Arjuna against acting for the result, including the result of being liked.",
    dissolution:
      "1) Notice the body-no before the mind-yes — usually a tightening in the throat or chest. 2) Practice 'let me get back to you' as a sentence. 3) Say one honest no per day, however small. 4) Sit with the discomfort that follows — that is the loop dissolving in real time.",
    signOfHealing:
      "You disappoint someone, and the nervous system does not flood. You feel the loss of approval without feeling the loss of self.",
  },
  {
    slug: "doom-scrolling",
    name: "Doom-Scrolling",
    ancientName: "Indriya-vikṣepa — scattered senses",
    category: "mind",
    oneLine: "Reaching for the phone before the mind has finished its own thought.",
    trigger:
      "Any micro-discomfort: boredom, a half-formed feeling, transition between tasks, the awkward two seconds in a queue. The hand moves before awareness arrives.",
    manifestation:
      "Hours lost to feeds you would not have chosen. Anxiety without a clear source. A sleep debt you can no longer trace. The strange feeling of being lonelier after using a social app than before.",
    neuroscience:
      "Variable-ratio reinforcement (slot-machine logic) hijacks the dopaminergic reward system. The default mode network never gets to consolidate — every flick of the thumb interrupts the integration cycle. Sleep latency rises. Working memory drops.",
    ancientDiagnosis:
      "This is exactly pratyāhāra (sense-withdrawal) in reverse — limb five of Patañjali fully inverted. The senses, instead of being voluntarily turned inward, are voluntarily flung outward all day.",
    dissolution:
      "1) One hour of phone-off in the morning, before anything. 2) Grayscale mode permanently. 3) Notice the first reach — and pause for three breaths before deciding. 4) When the urge fires, ask 'what am I trying not to feel?' — and feel it instead.",
    signOfHealing:
      "You pick up the phone, do the one thing, put it down. You can be bored without flinching.",
  },
  {
    slug: "imposter-syndrome",
    name: "Impostor Syndrome",
    ancientName: "Asmitā — false identification",
    category: "self",
    oneLine: "The quiet certainty that you are about to be found out.",
    trigger:
      "Promotion. Public visibility. Praise. Anything that asks the small self to be bigger than the story it tells about itself.",
    manifestation:
      "Overworking to compensate. Discounting wins. Attributing success to luck. A nervous-system spike at every email beginning with 'quick question'.",
    neuroscience:
      "A discrepancy between the self-concept (which is small) and external feedback (which is large) creates cognitive dissonance. The brain defaults to protecting the older, smaller model. Cortisol rises. Performance plateaus to match the self-image — a self-fulfilling cap.",
    ancientDiagnosis:
      "Patañjali calls asmitā the false equating of the seer with the seen. You are not the role you play. The role is a costume the consciousness wears. Impostor syndrome is what happens when consciousness confuses itself with the costume.",
    dissolution:
      "1) List, in writing, three concrete signals from this week that you are competent. Read them out loud. 2) Distinguish 'I am unsure' (true) from 'I am a fraud' (false). 3) Practice ātma-vichāra: the one who feels like an impostor — who is that one? 4) Take the next visible action anyway.",
    signOfHealing:
      "Recognition lands, and you can say thank you without deflecting. Failure happens, and the worth is not on the line.",
  },
  {
    slug: "comparison",
    name: "Comparison Spiral",
    ancientName: "Īrṣyā — the burning glance",
    category: "other",
    oneLine: "Their feed makes your life feel small in under thirty seconds.",
    trigger:
      "A peer's launch, post, milestone, body, partner, holiday. Often a peer you actually like — which makes it worse.",
    manifestation:
      "Inadequacy disguised as motivation. Late-night CV-rewriting. The temptation to subtly diminish the other person in conversation tomorrow.",
    neuroscience:
      "Mirror neurons make you partially live the other person's life as you scroll. Your context (their highlight reel) is missing. You compare your behind-the-scenes to their front stage — guaranteed loss.",
    ancientDiagnosis:
      "The Buddha names this as the wound of māna — the conceit that measures self against other. The Yoga Sutras prescribe mudita — sympathetic joy — as the direct antidote.",
    dissolution:
      "1) Close the app immediately. The loop is in the scroll. 2) Name one of your own wins from this week, out loud. 3) Write a one-line congratulations to the person who triggered it. Send it. 4) The body cannot hold envy and genuine generosity in the same breath.",
    signOfHealing:
      "Someone wins, and your chest opens. You stop comparing because you remember your life is not theirs.",
  },
  {
    slug: "anxious-anticipation",
    name: "Anxious Anticipation",
    ancientName: "Bhaya — fear of the unborn future",
    category: "time",
    oneLine: "Suffering tomorrow's problems today.",
    trigger:
      "Sunday evening. The hour before a meeting. The five minutes before any phone call. The body rehearses disaster the future has not produced.",
    manifestation:
      "Stomach tightness. Sleep disturbance. The mind plays the same imagined conversation seventy times. The actual event, when it comes, is rarely as bad as the rehearsal.",
    neuroscience:
      "The default mode network projects forward, simulating possible futures. Without somatic grounding, these simulations get tagged as memories — and the body floods with cortisol for an event that hasn't happened.",
    ancientDiagnosis:
      "Patañjali's abhiniveśa — the clinging to continuity, the deep fear of disruption. Krishna in Gītā 2.47 prescribes the cure: do the action; release the fruit.",
    dissolution:
      "1) Feet on the floor. Notice five colours, four sounds, three textures. The future cannot enter present sensing. 2) Write the worst-case in one sentence, then ask: could I survive that? Almost always yes. 3) Take one small action toward the feared event right now — the body recognizes movement and lets the cortisol drain.",
    signOfHealing:
      "The Sunday-night spike softens. You meet tomorrow when tomorrow arrives, not the night before.",
  },
  {
    slug: "spiritual-bypass",
    name: "Spiritual Bypass",
    ancientName: "Adhyāsa — false superimposition",
    category: "self",
    oneLine: "Using meditation, mantras, or 'high vibes' to avoid feeling what is actually here.",
    trigger:
      "A difficult emotion — grief, anger, longing, fear — meeting a spiritual concept that says you shouldn't be feeling that.",
    manifestation:
      "'It's all illusion anyway.' 'I'm raising my vibration.' 'Negative emotions are low consciousness.' Years of practice with no real ground. A teacher whose private life would horrify their students.",
    neuroscience:
      "Suppression activates the same circuits as dissociation. The emotion is not transcended; it is buried, and continues to drive behavior unconsciously. The body knows what the mind refuses.",
    ancientDiagnosis:
      "Every authentic lineage warns against this. Ramana: face the wound, do not narrate it. Zen: chop wood, carry water. The Buddha: see the feeling as the feeling, not as the story.",
    dissolution:
      "1) Where in the body is this emotion right now? Locate it. 2) Stay with the sensation for five full breaths, with no spiritual commentary. 3) Only after the body has been honored may any concept enter. 4) Notice that the emotion, once felt, completes itself.",
    signOfHealing:
      "You can be sad and aware. Angry and present. The practice ceases to be a uniform and becomes a way of being honest.",
  },
  {
    slug: "approval-checking",
    name: "Approval-Checking",
    ancientName: "Para-darśana — the borrowed gaze",
    category: "other",
    oneLine: "Posting, then refreshing every five minutes for the verdict.",
    trigger: "Any act of self-expression that has been offered to an audience.",
    manifestation:
      "Compulsive notification-checking. Mood tied to like-count. The slow editing of one's actual self to match what the audience has rewarded.",
    neuroscience:
      "Each notification fires a small dopamine release. Variable timing makes it slot-machine compulsive. Over weeks, the brain re-weights what 'matters' toward what gets approval — a corruption of the value system itself.",
    ancientDiagnosis:
      "The borrowed gaze — seeing oneself through others' eyes — is the original split that yoga is designed to heal. Krishna's instruction: act without attachment to the response.",
    dissolution:
      "1) Post. Then put the phone in another room for two hours. 2) Notice the urge, do not act on it. 3) Ask: would I still have posted this if no one would see it? Begin to make work that survives that question. 4) The freedom is unmistakable when it lands.",
    signOfHealing:
      "You post and forget. The work is the reward. Numbers become weather.",
  },
  {
    slug: "perfectionism",
    name: "Perfectionism",
    ancientName: "Aparigraha-bhanga — the failure to release",
    category: "mind",
    oneLine: "Polishing far past the point where anyone else can see the difference.",
    trigger:
      "Any threshold of completion. Sending the email. Shipping the version. Publishing the post. The standard rises as the moment approaches.",
    manifestation:
      "Projects that never ship. Endless revision. Burnout disguised as care. A subtle moral superiority about the 'high standard' that is in fact paralysis.",
    neuroscience:
      "Perfectionism is anxiety wearing the costume of conscientiousness. The amygdala fires at the prospect of judgment; the prefrontal cortex generates an infinite to-do list to delay exposure. Cortisol stays elevated for weeks at a time.",
    ancientDiagnosis:
      "Aparigraha — non-grasping — is the fifth yama. Perfectionism is grasping at an ideal so tightly that the actual work cannot live. The Yoga Sutras say: drop it.",
    dissolution:
      "1) Set a hard timer. 2) Ship at the bell, regardless. 3) Survive. 4) Notice that the world did not end. Repeat until the body learns.",
    signOfHealing:
      "You ship something imperfect. The sun rises. You ship another. Quality goes up, not down — because feedback can finally reach you.",
  },
  {
    slug: "ruminating-on-the-past",
    name: "Rumination",
    ancientName: "Saṃskāra-vṛtti — the groove turning",
    category: "time",
    oneLine: "Replaying the same scene as if a different ending will appear this time.",
    trigger:
      "Quiet moments. Falling asleep. The shower. Any pause in external stimulus where the mind can revisit unfinished business.",
    manifestation:
      "Sleep loss. The same conversation rehearsed thirty different ways. A subtle, persistent low-grade misery that no one around you can see.",
    neuroscience:
      "The default mode network goes online when external focus drops. Without integration practice, it loops on unresolved emotional material. Each loop strengthens the neural trace — saṃskāra in real time.",
    ancientDiagnosis:
      "Saṃskāras are mental grooves. Each replay deepens the groove. The Yoga Sutras prescribe pratipakṣa bhāvana — deliberately turning the mind toward the opposite — and meditation, which lets the groove fade through non-use.",
    dissolution:
      "1) Notice the loop. 2) Say to the mind: 'thank you, I have heard this.' 3) Move the body — even thirty seconds of stretching. 4) Return attention to one breath. 5) Repeat ten thousand times. The groove fades.",
    signOfHealing:
      "The memory arises and does not stick. You can think of it without being thought by it.",
  },
  {
    slug: "burnout-denial",
    name: "Burnout Denial",
    ancientName: "Tapas-bhrama — austerity become harm",
    category: "body",
    oneLine: "Treating exhaustion as the cost of doing business.",
    trigger:
      "A culture (work, family, internal) that equates worth with output. Tiredness is reframed as weakness.",
    manifestation:
      "Caffeine to start. Alcohol to stop. Weekends spent recovering for Monday. A creeping cynicism that wasn't there a year ago.",
    neuroscience:
      "Chronically elevated cortisol shrinks the hippocampus, dulls the prefrontal cortex, and overactivates the amygdala. Sleep architecture degrades. The very capacities you are pushing for begin to disappear.",
    ancientDiagnosis:
      "Tapas — disciplined effort — is the third niyama. When it loses its ground in santoṣa (contentment), it becomes self-harm. The Buddha called this 'one extreme' — the other being indulgence. Both miss.",
    dissolution:
      "1) Honest 1–10: how depleted are you? Below 4, schedule recovery, not productivity. 2) One full day off, phone off. 3) Eight hours of sleep for one week. 4) Then re-ask what is actually worth the energy.",
    signOfHealing:
      "You stop wearing tiredness as a medal. Energy returns. Discernment returns with it.",
  },
  {
    slug: "loneliness-in-a-crowd",
    name: "Loneliness in a Crowd",
    ancientName: "Saṃyoga-viyoga — joined but not connected",
    category: "other",
    oneLine: "Surrounded by people and unmet.",
    trigger:
      "A party. A team. A family dinner. A relationship where the small talk has eaten the deep talk.",
    manifestation:
      "Performing connection. The drive home feeling emptier than the drive over. Wondering if anyone actually knows you.",
    neuroscience:
      "The brain registers absence of co-regulation even in physical presence. Without eye contact, attuned listening, and nervous-system attunement, oxytocin does not release. Crowds without contact spike cortisol, not bond it.",
    ancientDiagnosis:
      "The Upanishads see this as the misidentification with the social self. The deepest connection is with the Self that all share — which paradoxically is met only in solitude or in true sat-saṅga (the company of the awake).",
    dissolution:
      "1) One real conversation a week — phone away, eyes meeting, the truthful answer to 'how are you'. 2) One day of solitude a week, no input. 3) The contrast clarifies what your nervous system actually needs. 4) Then choose relationships accordingly.",
    signOfHealing:
      "You can be in a crowd and feel met. You can be alone and not feel lonely.",
  },
  {
    slug: "the-better-future-fantasy",
    name: "The Better-Future Fantasy",
    ancientName: "Manoratha — the chariot of imagination",
    category: "time",
    oneLine: "When I have X, then I'll really live.",
    trigger:
      "Any present discomfort. The mind escapes forward into a constructed scene where the discomfort is resolved by an external acquisition.",
    manifestation:
      "Years of when-then. The arrival of the X. The discovery that the discomfort moved with you. A new X is appointed. Repeat.",
    neuroscience:
      "The dopaminergic reward system fires more strongly for anticipation than for arrival. The brain is engineered to want — not to have. Without practice, the cycle never ends.",
    ancientDiagnosis:
      "This is the very engine of saṃsāra — the wheel of becoming. The Buddha's second noble truth: craving is the cause of suffering. Krishna in Gītā 5.22: pleasures born of contact with the senses have a beginning and an end; they are sources of pain, not joy.",
    dissolution:
      "1) Catch the when-then sentence as it forms. 2) Ask: what am I refusing to feel right now that this fantasy is helping me avoid? 3) Feel it. 4) Notice that the fantasy quiets the moment the avoided sensation is honored.",
    signOfHealing:
      "You want things, and you can also be here. The future loses its grip. The present stops being a waiting room.",
  },
];

export const LOOP_ATLAS_CATEGORIES: Record<LoopEssay["category"], { label: string; color: string }> = {
  self: { label: "Self", color: "from-amber-500/40 to-orange-900/40" },
  other: { label: "Other", color: "from-rose-500/40 to-pink-900/40" },
  time: { label: "Time", color: "from-violet-500/40 to-indigo-900/40" },
  mind: { label: "Mind", color: "from-sky-500/40 to-blue-900/40" },
  body: { label: "Body", color: "from-emerald-500/40 to-teal-900/40" },
};
