/**
 * firstElevenSessions — the closed spine of The First Eleven.
 * ─────────────────────────────────
 * Eleven sittings about everything a 2026 user should be told. The spine of
 * each sitting is fixed and authored (closed); the `question` steps are
 * filled adaptively at runtime from the question bank in
 * firstElevenQuestions.ts.
 *
 * Question roles per sitting: open (self-recognition) → deepen (the
 * mechanism) → body (where it lives) → mirror (the question that turns it
 * back) → choice (one small act of freedom).
 */
import type { SESession } from "./firstElevenTypes";

export const FIRST_ELEVEN_SESSIONS: SESession[] = [
  // ── 1. THE STOLEN MIND ─────────────────────────────────────────────
  {
    n: 1,
    id: "stolen_mind",
    title: "The Stolen Mind",
    essence: "Attention is the last private property. Check who holds the deed.",
    purpose:
      "How your attention was taken, what it costs, and the first act of taking it back. Every later sitting depends on this one.",
    master: "Krishnamurti",
    estMinutes: 6,
    carrySeed: "What I give my attention to, I give my life to — whether I chose it or not.",
    steps: [
      {
        kind: "teaching",
        title: "The most valuable thing you own",
        body: "Not your money. Not your time. Your attention — the narrow beam of consciousness that decides what becomes real for you. In 2026, the largest industry on earth does not sell products. It sells access to that beam, by the second. You did not lose your focus. It was bought.",
        master: "Krishnamurti",
        quote: { text: "It is no measure of health to be well adjusted to a profoundly sick society.", source: "attributed" },
      },
      { kind: "question", role: "open" },
      { kind: "question", role: "deepen" },
      {
        kind: "silence",
        seconds: 60,
        prompt: "Sit. Don't move. When the urge to reach for something arises, don't obey it — just watch it rise and fall.",
        speakInto: "What did the urge feel like, in one line?",
      },
      { kind: "question", role: "body" },
      { kind: "question", role: "mirror" },
      { kind: "question", role: "choice" },
      {
        kind: "act",
        title: "One hour, face down",
        body: "Tomorrow, for one full hour of your choosing, the phone goes face down in another room. Not on silent. In another room. Watch what the mind does. That watching is the practice.",
        vowLabel: "I'll take one hour back",
      },
    ],
  },

  // ── 2. THE COMPARISON MACHINE ──────────────────────────────────────
  {
    n: 2,
    id: "comparison_machine",
    title: "The Comparison Machine",
    essence: "Comparing is renting your worth from people who never agreed to own it.",
    purpose:
      "Why the feed feels like a mirror but works like a courtroom — and whose voice the comparator actually is.",
    master: "Buddha",
    estMinutes: 6,
    carrySeed: "The life I scroll past is not my life. The measuring is optional.",
    steps: [
      {
        kind: "teaching",
        title: "A courtroom shaped like a mirror",
        body: "You tell yourself you're just keeping up. But watch the body when a stranger's highlight reel passes your eyes: the small drop, the tightening. That is not information. That is a verdict. The feed is engineered to deliver a thousand verdicts a day, and to make you believe the verdicts are about you.",
        master: "Buddha",
        quote: { text: "Thousands of candles can be lighted from a single candle, and the life of the candle will not be shortened.", source: "attributed" },
      },
      { kind: "question", role: "open" },
      { kind: "question", role: "deepen" },
      {
        kind: "silence",
        seconds: 45,
        prompt: "Bring to mind one person you compared yourself to this week. Hold the image. Don't argue with it. Who taught you to measure?",
        speakInto: "Whose voice was measuring?",
      },
      { kind: "question", role: "body" },
      { kind: "question", role: "mirror" },
      { kind: "question", role: "choice" },
      {
        kind: "act",
        title: "Mute one account",
        body: "Tomorrow, mute — not block — the one account that most reliably leaves you smaller. Muting is not hatred. It is hygiene. Notice what fills the space it leaves.",
        vowLabel: "I'll mute one account",
      },
    ],
  },

  // ── 3. DESIRE AND THE MORE ─────────────────────────────────────────
  {
    n: 3,
    id: "desire_more",
    title: "Desire and the More",
    essence: "Wanting is not the enemy. Not noticing you're wanting is.",
    purpose:
      "The mechanics of desire in an infinite-store civilization: why satisfaction keeps moving, and what actually quiets it.",
    master: "Buddha",
    estMinutes: 6,
    carrySeed: "The more I got was never the more I wanted. The wanting was the point — and the point can be seen.",
    steps: [
      {
        kind: "teaching",
        title: "The thirst that drinks salt water",
        body: "The Buddha's first insight was not that desire is evil. It was subtler: the thirst misidentifies its own cure. It says: one more, and I'll be quiet. And for an hour, it's right. Then the thirst returns, dressed as the next thing. In 2026 the next thing is one tap away, forever. The practice is not to kill desire — it is to catch the exact moment the thirst says 'this time it will last.'",
        master: "Buddha",
        quote: { text: "Health is the greatest gift, contentment the greatest wealth.", source: "Dhammapada 204" },
      },
      { kind: "question", role: "open" },
      { kind: "question", role: "deepen" },
      {
        kind: "breath",
        pattern: "4 · 4 · 6",
        rounds: 6,
        note: "Long exhale, longer than the inhale. Wanting runs on a short exhale. Lengthen it and watch what happens to the thirst.",
      },
      { kind: "question", role: "body" },
      { kind: "question", role: "mirror" },
      { kind: "question", role: "choice" },
      {
        kind: "act",
        title: "The unpurchased pause",
        body: "Tomorrow, when you reach to buy or click something you don't need: stop the hand mid-air for three seconds and ask the wanting what it promised. Then buy or don't buy — your choice, made awake.",
        vowLabel: "I'll pause the reach",
      },
    ],
  },

  // ── 4. THE FEAR ENGINE ─────────────────────────────────────────────
  {
    n: 4,
    id: "fear_engine",
    title: "The Fear Engine",
    essence: "Fear was built to save your life. It was never built to run it.",
    purpose:
      "How fear gets industrialized — news, catastrophes, the body that can't tell a headline from a tiger — and what actually regulates it.",
    master: "Patanjali",
    estMinutes: 7,
    carrySeed: "The fear is real. The emergency is not. The body can learn the difference.",
    steps: [
      {
        kind: "teaching",
        title: "A tiger-detector in a feed civilization",
        body: "Your amygdala is ancient hardware running modern software. It evolved to spot one tiger a season. Now it is shown a thousand tigers before breakfast, in headlines, in group chats, in the 2am doom-scroll. It cannot tell the difference between a threat and a story about a threat. So it does its job — floods you — and you call it anxiety, as if it were your personality. It isn't. It's machinery doing exactly what it was built to do, pointed at the wrong sky.",
        master: "Patanjali",
        quote: { text: "Yoga is the cessation of the movements of the mind.", source: "Yoga Sutras 1.2" },
      },
      { kind: "question", role: "open" },
      { kind: "question", role: "deepen" },
      {
        kind: "silence",
        seconds: 60,
        prompt: "Name the fear you carry most this week. Don't solve it. Just let it be a shape in the body rather than a sentence in the head.",
        speakInto: "Where does this fear live in the body?",
      },
      { kind: "question", role: "body" },
      { kind: "question", role: "mirror" },
      {
        kind: "breath",
        pattern: "4 · 7 · 8",
        rounds: 4,
        note: "Only if the silence stirred something. The long exhale is a signal to the nervous system: the emergency is over.",
      },
      { kind: "question", role: "choice" },
      {
        kind: "act",
        title: "One fear, one fact",
        body: "Tomorrow, take the loudest fear and ask it for evidence: what has actually happened, versus what I am rehearsing. Write both columns. The gap between them is the practice.",
        vowLabel: "I'll ask my fear for evidence",
      },
    ],
  },

  // ── 5. THE STORY OF ME ─────────────────────────────────────────────
  {
    n: 5,
    id: "story_of_me",
    title: "The Story of Me",
    essence: "You are not the story. You are the one the story is being told to.",
    purpose:
      "Identity in 2026: labels, profiles, the curated self — and who remains when the story is set down for a moment.",
    master: "Ramana Maharshi",
    estMinutes: 7,
    carrySeed: "Every 'I am' was learned. Something is here that was never taught.",
    steps: [
      {
        kind: "teaching",
        title: "The biography you carry",
        body: "Ask yourself who you are and the mind instantly hands you a biography: job, history, wounds, roles, the profile you maintain. That biography is real — but it is content, not you. It was assembled over years by what was repeated and what was rewarded. The yogis say: examine every 'I am' and you will find a sentence someone else wrote. Behind the sentences, something is awake right now, reading this. That is where the sitting begins.",
        master: "Ramana Maharshi",
        quote: { text: "Your own Self-realization is the greatest service you can render the world.", source: "attributed" },
      },
      { kind: "question", role: "open" },
      { kind: "question", role: "deepen" },
      {
        kind: "silence",
        seconds: 60,
        prompt: "Drop every label for one minute — not the person, just the words. Anxious. Successful. Failed. Behind. Let them all be false for sixty seconds and see what remains.",
        speakInto: "What remained?",
      },
      { kind: "question", role: "body" },
      { kind: "question", role: "mirror" },
      { kind: "question", role: "choice" },
      {
        kind: "act",
        title: "The unworn label",
        body: "Tomorrow, catch one 'I am' sentence in the act — 'I'm not a morning person', 'I'm the responsible one' — and for one day, don't wear it. Not argue with it. Just don't wear it.",
        vowLabel: "I'll leave one label unworn",
      },
    ],
  },

  // ── 6. THE MIRROR OF OTHERS ────────────────────────────────────────
  {
    n: 6,
    id: "mirror_others",
    title: "The Mirror of Others",
    essence: "Every relationship is a mirror — most of us only see our own face in it.",
    purpose:
      "Approval, attachment, loneliness in a hyper-connected age: what we are actually asking of other people.",
    master: "Rumi",
    estMinutes: 6,
    carrySeed: "What I need from them, I have not yet given myself. That is information, not blame.",
    steps: [
      {
        kind: "teaching",
        title: "What we ask of others",
        body: "Look closely at your closest relationship and you will find a request, usually unspoken: see me, stay, approve, don't leave. The request was formed long before this person — usually in childhood, when love was survival. The tragedy of 2026 is that we have a thousand ways to send the request and no way to slow down and see we're sending it. The mirror asks: what would this relationship feel like if the request were already granted — by me, to me?",
        master: "Rumi",
        quote: { text: "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it.", source: "attributed" },
      },
      { kind: "question", role: "open" },
      { kind: "question", role: "deepen" },
      {
        kind: "silence",
        seconds: 60,
        prompt: "Bring one person to mind. Ask silently: what am I asking of you that I have not given myself? Don't answer with the mind. Wait.",
        speakInto: "What are you asking of them?",
      },
      { kind: "question", role: "body" },
      { kind: "question", role: "mirror" },
      { kind: "question", role: "choice" },
      {
        kind: "act",
        title: "One honest sentence",
        body: "Tomorrow, say one true sentence to someone you trust — one notch more honest than your default. Not a confession. Just one notch. Watch the body before, during, and after.",
        vowLabel: "I'll say one honest sentence",
      },
    ],
  },

  // ── 7. MONEY AND ENOUGH ────────────────────────────────────────────
  {
    n: 7,
    id: "money_enough",
    title: "Money and Enough",
    essence: "Scarcity is a state of the nervous system, not a number in an account.",
    purpose:
      "Money read through the bands: survival fuel, scoreboard, mission resource — and the feeling that no amount ever settles.",
    master: "Krishna",
    estMinutes: 6,
    carrySeed: "Enough is a feeling I can practice, not a figure I can reach.",
    steps: [
      {
        kind: "teaching",
        title: "The same money, different worlds",
        body: "Money means something different at every level of the spiral. From survival, it is oxygen — and the breath is always short. From achievement, it is a scoreboard, and the score never ends. From meaning, it is fuel for the work. The trap: chasing the feeling of enough from the state that manufactures the feeling of not-enough. No deposit fills a Band-0 hole, because the hole is neurological, not mathematical.",
        master: "Krishna",
        quote: { text: "There was never a time when I did not exist, nor you, nor any of these kings.", source: "Bhagavad Gita 2.12" },
      },
      { kind: "question", role: "open" },
      { kind: "question", role: "deepen" },
      {
        kind: "silence",
        seconds: 45,
        prompt: "Say the number that would be 'enough'. Now watch what the mind does with it — does it hold still, or does it quietly move? Just watch the move.",
        speakInto: "Did the number hold still?",
      },
      { kind: "question", role: "body" },
      { kind: "question", role: "mirror" },
      { kind: "question", role: "choice" },
      {
        kind: "act",
        title: "One honest hour",
        body: "Tomorrow, spend thirty minutes looking at your actual numbers — no judgement, no plan, just looking. The fear feeds on the unlooked. This is not budgeting. It is exposure.",
        vowLabel: "I'll look at the numbers",
      },
    ],
  },

  // ── 8. WORK AND WORTH ──────────────────────────────────────────────
  {
    n: 8,
    id: "work_worth",
    title: "Work and Worth",
    essence: "If your output stopped, who would you be? Sit with that question.",
    purpose:
      "Productivity as conditioning: the treadmill, the guilt of rest, and work that doesn't consume the worker.",
    master: "Vivekananda",
    estMinutes: 6,
        carrySeed: "My worth was never my output. The rest was learned. Learning can be unlearned.",
    steps: [
      {
        kind: "teaching",
        title: "The invisible ledger",
        body: "Somewhere, a ledger was installed: rest must be earned, idle time is dangerous, my value is my usefulness. It masquerades as ambition. But watch the difference between work that flows and work that flees — one ends and leaves you full, the other ends and leaves you empty, already reaching for the next task. You are not lazy and you are not a machine. You are someone who mistook a treadmill for a direction.",
        master: "Vivekananda",
        quote: { text: "Arise, awake, and stop not till the goal is reached.", source: "attributed" },
      },
      { kind: "question", role: "open" },
      { kind: "question", role: "deepen" },
      {
        kind: "silence",
        seconds: 60,
        prompt: "Let the mind be completely unproductive for one minute. Nothing to solve, nothing to produce. Watch what rushes in to fill the gap — and whether it feels like rest or like danger.",
        speakInto: "What rushed in?",
      },
      { kind: "question", role: "body" },
      { kind: "question", role: "mirror" },
      { kind: "question", role: "choice" },
      {
        kind: "act",
        title: "One unearned rest",
        body: "Tomorrow, take fifteen minutes of rest you have not earned — no task first, no justification. Watch the guilt arrive. Watch it pass. That watchfulness is the whole practice.",
        vowLabel: "I'll rest unearned",
      },
    ],
  },

  // ── 9. TIME AND DEATH ──────────────────────────────────────────────
  {
    n: 9,
    id: "time_death",
    title: "Time and Death",
    essence: "You will die. That is not morbid — it is the only fact that makes urgency honest.",
    purpose:
      "Mortality as the spine of a human life: the urgency illusion, regret, and what today looks like when death is allowed into the room.",
    master: "Buddha",
    estMinutes: 7,
    carrySeed: "If this were the last year, what I would stop would teach me what to stop now.",
    steps: [
      {
        kind: "teaching",
        title: "The fact everyone arranges to forget",
        body: "Every civilization builds arrangements to keep death out of view — notifications, plans, the future perfect. And in the gap it leaves, urgency fakes its credentials: everything becomes urgent, which means nothing is. The yogis did the opposite. They sat with death daily, not from morbidity but from arithmetic: a finite life cannot spend itself on the infinite scroll. This is the heaviest sitting of the eleven. Go slowly.",
        master: "Buddha",
        quote: { text: "Everything that has a beginning has an ending. Make your peace with that.", source: "Pali Canon, paraphrased" },
      },
      { kind: "question", role: "open" },
      { kind: "question", role: "deepen" },
      {
        kind: "silence",
        seconds: 90,
        prompt: "Let the fact be present: this life ends. Not as a thought about death — as the fact of your own ending, here, now. Stay. Breathe. See what the mind does to escape.",
        speakInto: "What did the mind do to escape?",
      },
      { kind: "question", role: "body" },
      { kind: "question", role: "mirror" },
      { kind: "question", role: "choice" },
      {
        kind: "act",
        title: "The one-year filter",
        body: "Tomorrow, apply one filter to your day: if this were my last year, would I still do this? Not to quit your life — to notice which items fail the filter. The failures are the message.",
        vowLabel: "I'll apply the filter",
      },
    ],
  },

  // ── 10. THE CONDITIONED HEART ──────────────────────────────────────
  {
    n: 10,
    id: "conditioned_heart",
    title: "The Conditioned Heart",
    essence: "Numbness is not peace. It is a feeling that learned it was unsafe.",
    purpose:
      "Emotional conditioning: what got numbed, what it costs, and the first careful acts of feeling again.",
    master: "Meera",
    estMinutes: 7,
    carrySeed: "The feeling I avoid is the feeling that would free me. Slowly, kindly.",
    steps: [
      {
        kind: "teaching",
        title: "The feeling that went underground",
        body: "Nobody numbs on purpose. At some point a feeling arrived — too big, too early, unheld — and the system made a wise decision: not this, not now, not ever again. And it worked. That is the cruelty: the numbing protected you. But protection has a bill. The same mechanism that muted the grief also muted the joy, the desire, the tenderness. The heart was not broken. It was conditioned. And conditioning, seen clearly, can be unlearned.",
        master: "Meera",
        quote: { text: "I have gone mad with longing and nobody understands.", source: "attributed devotional" },
      },
      { kind: "question", role: "open" },
      { kind: "question", role: "deepen" },
      {
        kind: "silence",
        seconds: 75,
        prompt: "Ask within: what did I decide, long ago, was unsafe to feel? Wait for the answer that arrives before the words. Stay with whatever comes — one layer at a time.",
        speakInto: "What was decided unsafe?",
      },
      { kind: "question", role: "body" },
      { kind: "question", role: "mirror" },
      { kind: "question", role: "choice" },
      {
        kind: "act",
        title: "One unfiltered feeling",
        body: "Tomorrow, name one feeling out loud to yourself — precisely, not vaguely: not 'stressed', but 'afraid I'll be found out'. Naming is feeling's first breath. Just name it. No fixing.",
        vowLabel: "I'll name one feeling",
      },
    ],
  },

  // ── 11. WHO IS ASKING? ─────────────────────────────────────────────
  {
    n: 11,
    id: "who_is_asking",
    title: "Who Is Asking?",
    essence: "All ten sittings asked about you. This one asks who 'you' is.",
    purpose:
      "The turn from content to context: self-inquiry, the witness, and what freedom actually means for a 2026 human.",
    master: "Ramana Maharshi",
    estMinutes: 8,
    carrySeed: "The questions were never answered. The questioner was finally looked at.",
    steps: [
      {
        kind: "teaching",
        title: "The last question",
        body: "Ten sittings you examined attention, comparison, desire, fear, identity, others, money, work, time, and the heart. Every one of those is content — things you can observe. This sitting turns the beam around. Who has been observing? Not as philosophy. As a live question, held right now, while you read this. Whatever answer arrives — thoughts, images, history — ask again: to whom does this appear? Keep going until the answer runs out. What doesn't run out is what you are.",
        master: "Ramana Maharshi",
        quote: { text: "The thought 'who am I?' will destroy all other thoughts, and finally destroy itself.", source: "attributed" },
      },
      { kind: "question", role: "open" },
      { kind: "question", role: "deepen" },
      {
        kind: "silence",
        seconds: 90,
        prompt: "Hold the question without words: who is asking? When an answer comes, don't fight it — ask again, of the one it appeared to. Three rounds. Then rest in whatever remains.",
        speakInto: "What remains?",
      },
      { kind: "question", role: "body" },
      { kind: "question", role: "mirror" },
      { kind: "question", role: "choice" },
      {
        kind: "act",
        title: "The return, once a day",
        body: "Tomorrow, once — just once — stop whatever you are doing and ask: who is aware right now? Not as a ritual. As a door. Then go back to your day exactly as it was.",
        vowLabel: "I'll ask once a day",
      },
    ],
  },
];

export const FIRST_ELEVEN_SESSION_BY_N = (n: number): SESession | undefined =>
  FIRST_ELEVEN_SESSIONS.find((s) => s.n === n);

export const FIRST_ELEVEN_SESSION_BY_ID = (id: string): SESession | undefined =>
  FIRST_ELEVEN_SESSIONS.find((s) => s.id === id);

/** 1–11 for a session slug; 0 when unknown. */
export const FIRST_ELEVEN_SESSION_NUMBER = (id: string): number =>
  FIRST_ELEVEN_SESSIONS.find((s) => s.id === id)?.n ?? 0;

export const FIRST_ELEVEN_TOTAL = FIRST_ELEVEN_SESSIONS.length;
