// Pre-Journey Foundation Course — 76 sessions across 10 modules
// (60 core + 16 classical-wisdom bonus: Patanjali + Vivekananda/4 Yogas)
// User picks pace: 1, 3, or 10 sessions/day → ~76, ~26, or ~8 days total

export type PreJourneyModule = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface PreJourneySession {
  id: string;
  number: number;
  module: PreJourneyModule;
  moduleName: string;
  title: string;
  hook: string;
  teaching: string;
  microPractice?: {
    label: string;
    durationSec: number;
    instruction: string;
  };
  reflectionPrompt: string;
  estMinutes: number;
}

export interface PreJourneyModuleInfo {
  id: PreJourneyModule;
  name: string;
  subtitle: string;
  range: [number, number];
  gradient: string; // tailwind gradient classes
  icon: string; // lucide name
}

export const PRE_JOURNEY_MODULES: PreJourneyModuleInfo[] = [
  { id: 1,  name: 'Welcome to the Mirror',                   subtitle: 'App orientation',                  range: [1, 6],   gradient: 'from-violet-500 to-indigo-600',  icon: 'Sparkles' },
  { id: 2,  name: 'The Engines',                             subtitle: 'How the AI thinks about you',      range: [7, 13],  gradient: 'from-cyan-500 to-blue-600',      icon: 'Cpu' },
  { id: 3,  name: 'Observation',                             subtitle: 'The core literacy',                range: [14, 22], gradient: 'from-emerald-500 to-teal-600',   icon: 'Eye' },
  { id: 4,  name: '12 Practice Skills',                      subtitle: 'Meet your toolkit',                range: [23, 34], gradient: 'from-amber-500 to-orange-600',   icon: 'Layers' },
  { id: 5,  name: 'Patanjali & the Yoga Sutras',             subtitle: 'The classical map (8 limbs)',      range: [35, 42], gradient: 'from-sky-500 to-indigo-700',     icon: 'BookOpen' },
  { id: 6,  name: 'Vivekananda, Krishna & the Lineages',     subtitle: 'The 4 yogas & beyond',             range: [43, 50], gradient: 'from-fuchsia-500 to-rose-600',   icon: 'Flame' },
  { id: 7,  name: 'Where You Stand',                         subtitle: 'Levels & spectrum',                range: [51, 56], gradient: 'from-rose-500 to-pink-600',      icon: 'Gauge' },
  { id: 8,  name: 'Loops & Domains',                         subtitle: 'The patterns you cannot see',      range: [57, 62], gradient: 'from-red-500 to-rose-600',       icon: 'Repeat' },
  { id: 9,  name: 'The Potholes',                            subtitle: 'What to expect & avoid',           range: [63, 70], gradient: 'from-purple-500 to-violet-700',  icon: 'AlertTriangle' },
  { id: 10, name: 'How to Walk This',                        subtitle: 'Integration & launch',             range: [71, 76], gradient: 'from-yellow-500 to-amber-600',   icon: 'Compass' },
];

const s = (
  number: number,
  module: PreJourneyModule,
  title: string,
  hook: string,
  teaching: string,
  reflectionPrompt: string,
  microPractice?: PreJourneySession['microPractice'],
  estMinutes = 6,
): PreJourneySession => ({
  id: `pj-${String(number).padStart(3, '0')}`,
  number,
  module,
  moduleName: PRE_JOURNEY_MODULES.find(m => m.id === module)!.name,
  title,
  hook,
  teaching,
  reflectionPrompt,
  microPractice,
  estMinutes,
});

export const PRE_JOURNEY_SESSIONS: PreJourneySession[] = [
  // ─── Module 1: Welcome to the Mirror ───
  s(1, 1, 'Why this app exists',
    'You did not download a wellness app. You downloaded a mirror.',
    `Most apps want you to *use* them more. This one wants you to need it less.\n\nYou have been conditioned for decades — by family, school, culture, trauma, repetition. Every reaction you have, every thought that loops, every emotion that hijacks you — none of it is freely chosen. It is **inherited software running on your nervous system.**\n\nThis app exists to do one thing: help you *see that software clearly enough to stop being it.*\n\nWe call this arc **Conditioning → Consciousness.** It takes years, not weeks. The next 76 short sessions are not the journey — they are the **map** of the journey. Before you walk, you need to know the terrain, the tools, the predictable potholes, and where you actually stand right now.\n\nThat is what this Foundation is for.`,
    'In one sentence: what brought you here, really?',
    { label: 'Sit still', durationSec: 30, instruction: 'Just sit. Do nothing. Notice the urge to do something.' }),

  s(2, 1, 'The 4 spaces',
    'Temple, Guide, Practice, Journal — your four rooms.',
    `The app has four spaces. Each does one thing well.\n\n**🪔 Temple** — your sanctuary. Sit with masters (Krishna, Buddha, Ramana, 30+ more). Unstructured. No agenda. Pure presence.\n\n**🧭 Guide** — your wise sibling. A 24/7 AI that knows your patterns. Not a chatbot. Short, direct, never preachy.\n\n**🌀 Practice** — your gym. Daily structured sessions. 12 skills (Observe, Inquiry, Breath…). This is where transformation compounds.\n\n**📓 Journal** — your laboratory. Write to discover what you actually think. AI loops back patterns you cannot see in your own words.\n\nYou do not need all four every day. They are tools, not chores.`,
    'Which of the four pulls you most right now? Why?'),

  s(3, 1, 'The Mirror — your reflection, not your scoreboard',
    'Analytics here are not for ranking. They are for seeing.',
    `Most apps gamify you with streaks, levels, leaderboards — and you end up performing for the dashboard instead of doing the work.\n\nThis app has analytics. We call it **The Mirror**. But it works differently:\n\n• It tracks 11 dimensions of your inner state — not just "minutes meditated"\n• It shows you the **patterns** you cannot see from inside (recurring loops, emotional cycles, time-of-day collapses)\n• It will sometimes tell you to **slow down** or **rest** — because regression is part of the path\n\nThe Mirror is never used to shame you. It is used to *show you what you would otherwise miss.*`,
    'Have you ever performed for a fitness app and felt empty after? What happened?'),

  s(4, 1, 'How a daily session works',
    'Morning, Midday, Evening, Night — four gates, not four chores.',
    `A full day in this app has four optional gates:\n\n**Morning (Awakening)** — 9-step ritual to set the day's lens (5–15 min)\n**Midday (Practice)** — one focused practice from your matrix (10–20 min)\n**Evening (Reflection)** — Yoga-Nidra-style closing of the day's loops (8–12 min)\n**Night (Surrender)** — short letting-go before sleep (3–5 min)\n\nBut here is the secret: **you never need all four.** The engine adapts. If you only do mornings, it gives you mornings that compound. If you only do evenings, fine. The shape adjusts to your real life.\n\nNo guilt. No "you missed yesterday." Just continuity.`,
    'Which gate fits your real life right now — morning, midday, evening, or night?'),

  s(5, 1, 'Streaks, pause, grace days — the no-guilt design',
    'You will miss days. The app is built for that.',
    `Most spiritual apps break you the first time you skip. We designed the opposite:\n\n• **Grace days** — every streak has a buffer. Miss one, streak survives.\n• **Pause mode** — going through hell? Travel? Burnout? Pause everything. Streak frozen. Journey paused. Resume when ready.\n• **Re-entry ritual** — when you come back after a break, the app does not punish you. It does a small re-entry session to meet you where you are now (which is different from where you left).\n\nDiscipline that requires force is not discipline — it is self-violence. We are training a softer, more durable kind.`,
    'When did self-discipline last become self-punishment for you?'),

  s(6, 1, 'Your first orb tap',
    'Meet the orb. It is how you move through everything.',
    `From now on, most of your interactions happen through a single thing: **the orb.**\n\n• **Tap** the orb → next session starts\n• **Hold** the orb (long-press) → menu opens (skip, switch pace, exit, see what's coming)\n• The orb **breathes** — its rhythm matches your current practice band\n• Its **color** = the current module you are in\n• The **ring around it** = today's progress\n\nWhy an orb? Because buttons are for tasks. Orbs are for presence. Each tap is a small commitment to show up.`,
    'Just look at an orb (we will show you one next). What does it make you feel?',
    { label: 'Watch a still object', durationSec: 30, instruction: 'Pick anything in front of you. Just look. Do not name it.' }),

  // ─── Module 2: The Engines ───
  s(7, 2, 'The Consciousness Engine',
    'The thing that watches you so you can watch yourself.',
    `Behind the app runs a **Consciousness Engine** — the most important system here.\n\nIt tracks:\n• 11 dimensions of your inner state (clarity, presence, reactivity, devotion, energy, etc.)\n• Your active **loops** (recurring patterns)\n• Your practice **levels** across 12 skills\n• Your **band** on the 0–10 consciousness spectrum\n• Time-of-day collapse points\n• Regression signals (when something heavy is rising)\n\nIt is not surveillance. It is **structured noticing** — the kind a wise teacher would do if they sat with you for years. The app does it in seconds, every day.\n\nYou will see its outputs slowly, in The Mirror.`,
    'How do you currently track your inner state — or do you?'),

  s(8, 2, 'The Companion Engine',
    'Your wise sibling, not a chatbot.',
    `The Guide is powered by the **Companion Engine.** Three rules govern how it talks:\n\n1. **Short.** Maximum 2–3 sentences usually. No essays.\n2. **Direct.** No "I sense you might be feeling…" softness. Real talk.\n3. **It remembers.** Your loops, your last session, your goals — it brings them in without you re-explaining.\n\nIt will sometimes ask you uncomfortable questions. That is the job. It will never moralize. That is also the job.\n\nThink of it as the older sibling who has done the work — not the guru on a pedestal.`,
    'Who in your life talks to you that way — and if no one, what is missing?'),

  s(9, 2, 'The Curious Engine',
    'Questions that change the questioner.',
    `Some questions deepen you just by being asked. The **Curious Engine** generates these — based on your data, not generic prompts.\n\nA generic app asks: "How are you feeling today?"\nThe Curious Engine asks: "You said anger three times this week — once at your mother, once at traffic, once at yourself. What is the same in all three?"\n\nReal questions create real openings. You will see Curious Engine prompts in journals, evening sessions, and sometimes in the middle of practice.`,
    'What is one question no one has ever asked you that you wish they would?'),

  s(10, 2, 'The Mirror Engine',
    'Patterns you cannot see from inside.',
    `The **Mirror Engine** sits behind The Mirror tab. It does what no friend, no therapist, no journal can do alone — it sees your **longitudinal pattern.**\n\nExamples it might show you after 30 days:\n• "Every Sunday evening your reactivity spikes — what is happening on Sundays?"\n• "Three loops you flagged are actually one loop wearing different clothes."\n• "Your mornings have collapsed since the 12th — did something change?"\n\nWe show patterns, not verdicts. You decide what they mean.`,
    'What is one pattern in your life you suspect but cannot prove?'),

  s(11, 2, 'The Lineage Engine',
    'Masters chosen for you, when you need them.',
    `30+ masters live in the Temple — Krishna, Buddha, Ramana, Osho, Adi Shankara, Adiyogi, J. Krishnamurti, and many more. You do not pick randomly.\n\nThe **Lineage Engine** watches your state and *suggests the right master at the right time.* Heavy emotion? It might bring you Buddha. Trapped in head? Maybe Ramana. Lost in dryness? Maybe Mirabai or Rumi.\n\nYou can always override and pick anyone. But the suggestions get scarily good over time.`,
    'If you could sit with one wise being for an hour, who comes to mind first?'),

  s(12, 2, 'The Karma Engine — earned vs mechanical',
    'Most apps reward clicks. We reward breakthroughs.',
    `You will see "karma points" sometimes. These are not fake currency.\n\n**Karma is awarded only for two things:**\n1. **Verified breakthroughs** — moments the engine detects real shift (not self-reported)\n2. **Weekly integration** — sitting with what you learned\n\nThere is a **daily cap of 1 event** and a **weekly cap of 3.** You cannot grind karma. You can only earn it through actual movement.\n\nThis keeps the system honest. Most "rewards" in apps are slop. These are rare on purpose.`,
    'What is the difference between a habit you do and a habit that changes you?'),

  s(13, 2, 'Why we will sometimes slow you down',
    'Regression is part of the path.',
    `Spiritual apps sell you forward-only progress. That is a lie. Real growth has **regression** — periods where old patterns surge back, where you feel worse than when you started.\n\nThe app has a **Regression Protocol.** When the engine detects you crashing, it will:\n\n1. Slow your practice intensity\n2. Bring softer masters\n3. Suggest a pause if needed\n4. Skip the "you are doing great!" theatrics\n5. Acknowledge: *something is rising. Let it.*\n\nYou are not broken when you regress. You are processing.`,
    'When did your last "going backwards" period actually turn out to be processing?'),

  // ─── Module 3: Observation ───
  s(14, 3, 'What observation is NOT',
    'It is not thinking about thinking.',
    `Most people, when told to "observe their thoughts," do this:\n\n→ Have a thought\n→ Have *another* thought *about* the first thought\n→ Call this observation\n\nIt is not. That is just more thinking with a label on it.\n\n**Real observation has no commentary.** It is bare seeing — the way you see a cloud without labeling it "cloud." The thought arises, you notice it arose, you do not jump on its back.\n\nThis distinction takes weeks to feel. Start by noticing how often, when you "watch a thought," you are actually *thinking another thought about it.*`,
    'Try it now: notice one thought. Did you also have a thought about that thought?'),

  s(15, 3, 'The witness gap',
    'The 0.5 second between trigger and reaction. That is where freedom lives.',
    `Someone says something. In 0.5 seconds, you react.\n\nBetween those two moments — trigger and reaction — there is a tiny gap. Most people do not know it exists. They live as if the trigger *is* the reaction.\n\nObservation training is the slow, patient work of **finding that gap and widening it.** First it is invisible. Then it is a flash. Then half a second. Then a whole second. Eventually whole minutes where you can be triggered and not react.\n\nThis gap is called the **witness gap.** Everything in this app is, in some way, training it.`,
    'Recall the last time you reacted and regretted it. Was there a gap you missed?',
    { label: 'Notice the gap', durationSec: 60, instruction: 'Sit. Wait for any thought. When it arrives, notice the moment *before* you engage with it.' }),

  s(16, 3, 'Watching a thought without becoming it',
    'You are not your thoughts. Today you will feel that for the first time.',
    `Try this exact thing right now: think the sentence *"I am tired."*\n\nNow notice — *something else heard you think that.* Something else watched the thought arise.\n\n**That something else is what we are training.** It is not another thought. It is the space in which thoughts appear.\n\nMost humans live identified — they *are* the thought. Practitioners live witnessing — they *see* the thought. The difference looks small from outside. From inside, it is the difference between drowning and swimming.`,
    'When you watched that thought just now — where was the watcher located?',
    { label: 'Thought-watching', durationSec: 90, instruction: 'Close your eyes. Wait for thoughts. When one comes, just see it. Do not push, do not chase.' }),

  s(17, 3, 'Watching an emotion without naming it',
    'The moment you name it, you have already left.',
    `Emotions are sensations + meaning. The body sensation comes first — tight chest, hot face, churning gut. Then the mind labels it: "anger," "fear," "shame."\n\nMost emotional work happens at the *label* level. Talk therapy. Affirmations. Reframing.\n\nThis app trains the opposite: **stay with the sensation before the label arrives.** Feel the heat in the face *before* you call it anger. The label is a tiny dose of escape. Bypassing the label keeps you in the raw experience — where actual transformation happens.`,
    'What is one emotion you label fast to avoid feeling?',
    { label: 'Pre-label sensing', durationSec: 60, instruction: 'Recall a recent strong emotion. Find where it lives in your body. Stay there 60 seconds without naming it.' }),

  s(18, 3, 'Watching the body — first scan',
    'The body never lies. The mind almost always does.',
    `Your body is a **truth-detector.** It registers everything: stress before you notice, contraction before you name fear, opening before you feel love.\n\nA basic body scan: top of head → face → throat → chest → belly → arms → legs → feet. Do not change anything. Just notice what is there. Tightness, warmth, numbness, pulsing — all valid data.\n\nMost people live in their head and visit the body only for pain. Practitioners reverse this: **live in the body, visit the head when needed.**`,
    'Where in your body did you feel the most when you scanned?',
    { label: 'Quick body scan', durationSec: 120, instruction: 'Slowly move attention from head to feet. Notice without changing.' }),

  s(19, 3, 'Watching the breath — without controlling',
    'The hardest skill in any spiritual tradition.',
    `Most beginners cannot watch the breath without immediately *controlling* it. The moment attention lands on breath, it deepens, slows, regulates.\n\nThe instruction is: **watch breath as it already is.** Shallow if shallow. Fast if fast. Uneven if uneven. Do not fix it.\n\nThis is harder than it sounds. The act of observing changes what is observed (Heisenberg knew this). With practice, you learn to observe so lightly the breath does not change. That lightness *is* the skill.`,
    'When you watched your breath just now — did you control it without meaning to?',
    { label: 'Breath without changing', durationSec: 90, instruction: 'Watch breath. The instant you notice you are controlling it, soften and let it be whatever it wants.' }),

  s(20, 3, 'Watching watching itself',
    'The recursion that breaks the spell.',
    `Here is where it gets strange.\n\nYou have been watching thoughts, emotions, body, breath. Now ask: **what is doing the watching?**\n\nDo not answer with words. Try to *turn attention back on itself.* Most people cannot. Attention is built to point outward. Pointing it inward feels like trying to bite your own teeth.\n\nWhen, even for a flash, attention *does* turn on itself — something dissolves. There is no "watcher" found. Just watching, watching itself. This is called **Sakshi Bhav** — pure witnessing. We will return to this many times.`,
    'When you tried to find the watcher, what did you find?',
    { label: 'Reverse the gaze', durationSec: 60, instruction: 'Watch a thought. Then ask: who is watching? Do not answer with words.' }),

  s(21, 3, 'Why observation feels boring',
    'The boredom is the doorway. Most people turn back here.',
    `When you start observing, you will get bored fast. Mind races for stimulation. "Is this all? Sitting and watching? I could be doing something."\n\nThis boredom is not a bug. It is the **first real layer of conditioning** — the addiction to mental stimulation. You have been entertained 16 hours a day for years. Of course stillness feels empty.\n\n**The boredom is not the obstacle. The boredom is the practice.** Sit with it. Do not solve it. After enough sitting, boredom dissolves into something that has no name in English — a quiet aliveness.`,
    'How do you usually escape boredom — and what would happen if you did not?'),

  s(22, 3, 'Your Observe Level — where you actually start',
    'Not L0 for everyone. Most people start higher than they think.',
    `The Observe skill has 8 levels (L0 to L7). Most apps assume everyone is a beginner. This one does not.\n\nIf you have ever:\n• Sat for 10+ minutes in silence comfortably\n• Caught yourself reacting and chosen differently\n• Felt the witness gap before\n\n...you are already above L0.\n\nWe will run a tiny **Observe Level mini-assessment** in the next session of the real journey (not now). For now, just trust that the engine starts you where you actually are — not where the average user is.`,
    'On a scale of 0–7, where do you honestly think your observation skill is right now?'),

  // ─── Module 4: 12 Practice Skills ───
  s(23, 4, 'Why 12 skills, not 1',
    'No single path fits all humans. That is why traditions splintered.',
    `Most apps teach one practice (usually a watered-down mindfulness). This app teaches **12 distinct skills** because humans are wired differently.\n\nA heart-dominant person who tries pure observation feels dry. A head-dominant person who tries pure devotion feels fake. The 12 skills cover the full spectrum so the engine can find what *actually moves you.*\n\nThe 12: **Observe, Inquiry, Breath, Witness, Body, Bhakti, Karma, Jnana, Raja, Kriya, Tantra, Neuro.**\n\nYou will not learn all 12 deeply. You will probably go deep on 3–4 that fit you. The rest you will sample.`,
    'Of the 12 names above, which ones do you not know? (We will cover each next.)'),

  s(24, 4, 'Observe (L0–L7)',
    'The master skill. Underneath all the others.',
    `**Observe** is the foundation. Every other skill — devotion, breath, inquiry — works better when observation is strong.\n\n**L0** — Cannot watch a thought without becoming it\n**L1** — Catches reactions *after* they happen\n**L2** — Catches reactions *as* they happen\n**L3** — Catches the trigger *before* the reaction\n**L4** — Stays with raw sensation without labeling\n**L5** — Witnesses watcher and watched as one\n**L6** — Lives mostly from witness in daily life\n**L7** — Witness has dissolved into being\n\nMost serious practitioners hover around L3–L4 for years. That is fine. The depth at each level is more important than climbing.`,
    'Which level above feels closest to your current daily experience?',
    { label: 'Quick observe', durationSec: 60, instruction: 'Watch whatever arises. Note your level as you go.' }),

  s(25, 4, 'Inquiry (L0–L6) — Atma Vichara',
    'Who am I? The most powerful question ever asked.',
    `**Inquiry** = self-investigation. Ramana Maharshi made it famous: ask **"Who am I?"** and refuse every answer until something underneath the answers reveals itself.\n\nNot a thinking exercise. A pointing exercise. Each "I am ___" you generate, you reject — *not that, not that.* This is **Neti Neti.**\n\nWhen done seriously, inquiry strips away every false identification — "I am my body" (no), "I am my mind" (no), "I am my story" (no) — until what remains cannot be negated. That is the Self.\n\nIt sounds abstract. In practice, it is brutally concrete.`,
    'When you ask "Who am I?" right now — what is the first answer? Can you reject it?'),

  s(26, 4, 'Breath (L0–L5) — pranayama as a doorway',
    'Breath is the only autonomic function you can also control. That is no accident.',
    `**Breath** is the bridge between voluntary and involuntary. Conscious and unconscious. Body and mind.\n\nLevels move from simple awareness → controlled patterns (box breath, ujjayi, nadi shodhana) → kumbhaka (retention) → spontaneous breath that breathes you.\n\nWarning: deep pranayama can destabilize people fast. The engine will pace you. Do not chase advanced techniques on YouTube without ground.`,
    'Notice your breath right now. Without changing it — what do you observe?'),

  s(27, 4, 'Witness (L0–L5) — Sakshi Bhav',
    'Pure witnessing. The state, not the technique.',
    `**Witness** is what observation matures into. Observation is *doing* — you are the one watching. Witnessing is *being* — the watching happens, no one is doing it.\n\nThe shift is subtle but everything. In observation, there is "me observing the thought." In witnessing, there is just observing-of-thought, with no separate "me."\n\nThis is the heart of Advaita. Most people taste it for seconds. Practitioners learn to rest in it longer. Sages live there.`,
    'Have you ever, even briefly, felt watching happen with no watcher? Describe it.'),

  s(28, 4, 'Body (L0–L5) — somatic intelligence',
    'The body is older and wiser than the mind. Listen to it.',
    `**Body practice** trains you to read sensation as information. Not "my chest is tight" → "I am anxious" (label). But staying with the tightness as the message itself.\n\nLevels: scan → release stored tension → read subtle signals (gut yes/no) → use body as truth-detector in daily decisions → live primarily *as* body rather than *in* body.\n\nThis is the path that works best for trauma survivors and over-thinkers.`,
    'What does your gut say about a current decision in your life? (Do not analyze — feel.)'),

  s(29, 4, 'Bhakti (L0–L5) — the heart path',
    'Devotion. Surrender. Love as a practice, not a feeling.',
    `**Bhakti** is for hearts. You pick a form — Krishna, Christ, Mother, formless light, your own future self, anything — and you direct love toward it. Daily. Until the love becomes the practitioner.\n\nNot belief. Not religion. **A technology of the heart.** Mirabai, Rumi, Hafiz, Tukaram — all walked this path.\n\nIf inquiry feels dry to you, bhakti might be your way in. If devotion feels embarrassing or fake, inquiry might. The engine will help you find which.`,
    'What or who has your heart loved most fully — and what did that do to you?'),

  s(30, 4, 'Karma (L0–L5) — action without attachment',
    'Do the work. Drop the result.',
    `**Karma yoga** — the path of action. Krishna's teaching to Arjuna. You act fully, you put your whole self into the action, but you **release attachment to the outcome.**\n\nThis is the householder's path. You do not need to renounce the world. You stay in it, do your work, raise your kids, run your business — but inside, you are not bound by results.\n\nLevels move from "I do, I want results" → "I do, I notice my attachment" → "I do, I offer it" → "Action happens through me."`,
    'What is one thing you do daily where you could drop the obsession with outcome?'),

  s(31, 4, 'Jnana (L0–L5) — knowledge as liberation',
    'Discriminating the real from the unreal until only the real remains.',
    `**Jnana** = knowledge, but a specific kind: the knowledge that liberates by *direct seeing*, not concept-stacking.\n\nThe core practice: **viveka** (discrimination). Real vs unreal. Permanent vs temporary. Self vs not-Self. You apply this lens relentlessly until everything false falls away.\n\nThis is the path of philosophers, Vedantins, and very sharp minds. Risk: you can spend years collecting knowledge instead of applying it. Knowing about freedom is not freedom.`,
    'What is one thing you "know" intellectually but have not actually integrated?'),

  s(32, 4, 'Raja (L0–L5) — the royal 8-limb path',
    'Patanjali\'s system. The most complete, most demanding.',
    `**Raja yoga** = "royal path." 8 limbs from Patanjali's Yoga Sutras:\n\n1. Yama (ethics outward)\n2. Niyama (ethics inward)\n3. Asana (posture)\n4. Pranayama (breath)\n5. Pratyahara (sense withdrawal)\n6. Dharana (concentration)\n7. Dhyana (meditation)\n8. Samadhi (absorption)\n\nIt is the most complete map. Also the most demanding. Most modern "yoga" stops at limb 3. Real raja yogis go all 8.\n\nWe will spend the next module living inside this system, limb by limb.`,
    'Of the 8 limbs above, which one do you most resist? That is probably your work.'),

  s(33, 4, 'Kriya (L0–L5) — energetic technique',
    'Specific practices that move prana. Powerful. Be careful.',
    `**Kriya** = action, but specifically *energetic action.* Techniques designed to move kundalini, awaken chakras, alter neurochemistry directly.\n\nLevels: basic kriya (alternate nostril, kapalabhati) → spinal breath → mantra-with-breath → advanced techniques requiring teacher.\n\n**Kriya can destabilize the unprepared.** This is why traditions guarded it. The engine will gate kriya behind sufficient ground in observation and breath. Do not skip ahead.`,
    'Have you ever done a practice that gave you a strong physical/energetic shift? What happened?'),

  s(34, 4, 'Tantra + Neuro',
    'The embodied path + the scientific path. Two of the modern ways in.',
    `**Tantra** = "weaving." Not the Western misunderstanding. Real tantra is **using everything as the path** — body, sex, food, emotion, daily life. Nothing is excluded. The world is not an obstacle to liberation; it is the field of it.\n\n**Neuro** = the modern path. Practices grounded in neuroscience — vagus nerve work, polyvagal theory, default mode network down-regulation, interoception training. For people who need the science to commit.\n\nBoth are valid doorways. Both work.`,
    'Are you more pulled to the embodied (tantra) or the scientific (neuro) framing? Why?'),

  // ─── Module 5: Patanjali & the Yoga Sutras (NEW · 8 limbs) ───
  s(35, 5, 'Who was Patanjali, and why does he still matter?',
    '2000 years ago, one man compressed the entire path into 196 sutras.',
    `**Patanjali** was not a guru in the modern sense. He was an editor — a master cartographer who took the scattered yogic knowledge of his time and **compressed it into 196 short aphorisms** called the **Yoga Sutras.**\n\nNo other text in history has done what these 196 lines do: *map the entire arc of consciousness in surgical detail* — what the mind is, why it suffers, how to still it, what happens when it stills, and what lies beyond.\n\nEvery serious tradition since — Vedanta, Tantra, Buddhism, even modern mindfulness — borrows from this map. You cannot bypass Patanjali. He is the operating system underneath the operating systems.\n\nThe next 7 sessions walk through the **8 limbs** he prescribed. Not academically. Practically. As your own work.`,
    'You are about to study a 2000-year-old map. What part of you resists? What part is curious?'),

  s(36, 5, 'Yama — the 5 outward ethics',
    'Before you sit, fix how you live with others.',
    `Limb 1 = **Yama** — restraints in your relationship with the world. Five of them:\n\n1. **Ahimsa** — non-violence (in thought, speech, action)\n2. **Satya** — truthfulness\n3. **Asteya** — non-stealing (including time, energy, credit)\n4. **Brahmacharya** — right use of energy (sexual, creative, attentional)\n5. **Aparigraha** — non-grasping\n\nPatanjali was clear: *no inner work succeeds while these are broken.* You cannot meditate your way out of lying, stealing, or harming. The mind you sit with is the mind you live with.\n\nThis is why most modern "spirituality" fails. People want the inner peace without the outer integrity.`,
    'Of the 5 yamas above — which one do you most consistently break? Be brutally honest.'),

  s(37, 5, 'Niyama — the 5 inward observances',
    'Now fix how you live with yourself.',
    `Limb 2 = **Niyama** — observances in your relationship with yourself:\n\n1. **Saucha** — purity (body, environment, mind, diet)\n2. **Santosha** — contentment (with what is, right now)\n3. **Tapas** — disciplined heat (showing up when it is hard)\n4. **Svadhyaya** — self-study (reading, journaling, inquiry)\n5. **Ishvara Pranidhana** — surrender to a higher principle\n\nThe yamas clean your *outer* life. The niyamas build your *inner* life. Together they make the soil. Without soil, no seed grows — no matter how much you meditate.\n\n**Most app-users skip these two limbs entirely** and wonder why nothing changes.`,
    'Which niyama would shift the most in your life if you took it seriously for 30 days?'),

  s(38, 5, 'Asana — what posture really means',
    'Not 84 poses. One posture. Steady and comfortable.',
    `Limb 3 = **Asana.** Modern yoga turned this into 1000 instagram poses. Patanjali defined it in **two words: *sthira sukham asanam*** — *"posture should be steady and comfortable."*\n\nThat is it. The whole limb.\n\nWhy? Because every later limb (breath, withdrawal, concentration, meditation, absorption) requires a body that can sit without becoming a distraction. If your back hurts at minute 4, you cannot do Dharana.\n\nFor your practice: find one position you can hold for 30 minutes without fidgeting. Cross-legged on a cushion, on a chair, against a wall — does not matter. Just *one stable seat.* This is your asana.`,
    'What is your stable seat? If you do not have one yet — when will you find it?',
    { label: 'Find your seat', durationSec: 120, instruction: 'Sit. Adjust. Find a position you could hold for 30 min. Do not move for 2 min to test it.' }),

  s(39, 5, 'Pranayama — extending the life force',
    'Breath is not breath. It is the bridge between body and mind.',
    `Limb 4 = **Pranayama** — *prana* (life force) + *ayama* (extension). Not "breathing exercises." **The training of life force itself, using breath as the handle.**\n\nPatanjali names three components of every breath: **inhale, exhale, retention.** Mastery comes from learning to consciously extend each.\n\nThe core insight: **wherever the breath goes, the mind follows.** Slow the breath, slow the mind. Lengthen the exhale, calm the nervous system. Hold the breath, suspend thought.\n\nWe will not teach techniques here (the journey does that). For now, just understand: pranayama is the **first inner limb.** Everything before it is preparation. Everything after it is consequence.`,
    'When did your breath last change your state without you trying? What did it feel like?'),

  s(40, 5, 'Pratyahara — withdrawing the senses',
    'The most underrated limb. The hinge between outer and inner.',
    `Limb 5 = **Pratyahara** — sense-withdrawal. The senses normally drag attention outward (noise, sights, urges). Pratyahara is the act of **gently pulling them back inward** — like a turtle drawing its limbs into its shell.\n\nThis is the **hinge limb.** The first 4 limbs (yama, niyama, asana, pranayama) prepare your outer life. The last 3 (dharana, dhyana, samadhi) are pure inner work. Pratyahara is the door between them.\n\nWithout pratyahara, you cannot meditate — you can only sit while the senses still run you. With it, the mind finally has a chance to face itself.\n\nModern life makes this limb harder than ever. Phones, notifications, ambient sound, food cravings — all of it pulls outward, every minute.`,
    'When was the last time you spent 30 minutes with no sensory input? How did it feel?'),

  s(41, 5, 'Dharana, Dhyana, Samadhi — the inner three',
    'Concentration → meditation → absorption. The actual destination.',
    `The last three limbs are a continuous arc of deepening:\n\n**Limb 6 — Dharana** (concentration): hold attention on **one point** (a mantra, the breath, a flame). Mind wanders 100 times. You bring it back 100 times. This is the work.\n\n**Limb 7 — Dhyana** (meditation): the wandering largely stops. Attention **flows continuously** toward the object, like oil poured from one vessel to another.\n\n**Limb 8 — Samadhi** (absorption): the *separation* between observer and observed dissolves. You and the object become **one phenomenon.** This is not metaphor. It is a literal collapse of the subject-object structure.\n\nSamadhi has many degrees, from the lightest unification to *nirvikalpa samadhi* — total dissolution of all mental form. That is the destination of the entire 8-limb system.`,
    'Where does your practice currently sit on the arc Dharana → Dhyana → Samadhi?'),

  s(42, 5, 'Why all 8 must run together',
    'Not a ladder. A wheel.',
    `Most teachers present the 8 limbs as a **ladder**: master yama, then niyama, then asana, etc. Patanjali never said this.\n\nThe limbs are a **wheel.** All 8 spin together. You work yama and dhyana in the same week. Your samadhi will only ever be as deep as your asteya is honest. Your pranayama will only stabilize when your santosha is real.\n\nThis is the great secret most modern yoga misses: **you cannot bypass any limb.** The wheel only turns when all 8 are alive together.\n\nThis is also why this app is structured the way it is. Daily practice (limbs 3–8) + lived ethics (limbs 1–2) + integration (the wheel) — every gate of the daily flow is one spoke of Patanjali's wheel.`,
    'Which limb are you currently strongest in? Which is your weakest spoke right now?'),

  // ─── Module 6: Vivekananda, Krishna & the Lineages (NEW · 4 yogas) ───
  s(43, 6, 'Vivekananda — the man who carried the lineages west',
    'One monk, one speech, one moment. The world remembered.',
    `**Swami Vivekananda** walked into the Parliament of World Religions in Chicago, 1893. He was 30 years old. He opened with five words — *"Sisters and brothers of America"* — and the hall stood silent, then thunderous.\n\nHe was the first to systematically **map the four great paths of yoga** for a modern audience: Karma, Bhakti, Raja, Jnana. Before him, traditions ran in isolated streams — devotional bhakti in one village, Vedantic jnana in another monastery, Patanjali's raja in a small lineage.\n\nVivekananda saw what no one had: **all four paths are valid, all four lead to the same summit, and most humans are mixtures.** He insisted no one path is supreme — *the path that fits your nature is supreme for you.*\n\nThis is the framework the engine in this app uses to suggest your practices. You are about to meet all four.`,
    'Have you ever been told one path is "the" path? What did that do to you?'),

  s(44, 6, 'Karma Yoga — the path of action',
    'The work itself becomes the practice.',
    `**Karma Yoga** is for the doers — people whose nature is action, service, building. They cannot sit still for hours. They should not try.\n\nVivekananda's insight: **transform the work itself into yoga.** Not by adding meditation to your day, but by changing the *quality* with which you act:\n\n• Do the work fully\n• Do it as **offering** (to the divine, to humanity, to the work itself)\n• **Drop attachment to the result**\n• Use every action as a chance to dissolve the small "I"\n\nDone seriously, an entire life of karma yoga is enough — no other practice required. The cook becomes a yogi. The mother becomes a yogi. The CEO becomes a yogi.\n\nThe trap: most people use "I am doing karma yoga" to avoid sitting still. Real karma yoga requires the inner work happen *inside the action* — not instead of it.`,
    'What work in your life could become karma yoga if you changed only the inner stance?'),

  s(45, 6, 'Bhakti Yoga — the path of devotion',
    'When the heart leads, the mind follows.',
    `**Bhakti Yoga** is for the lovers — people whose nature is to feel deeply, to bond, to surrender. For them, philosophy is dry; technique is cold. **Devotion is alive.**\n\nThe practice: pick a form (Krishna, Christ, the Mother, the formless light, your own future self, the universe — anything that can receive your love), and **direct your love toward it relentlessly.** Daily. With song, with silence, with tears, with offerings, with the mundane act of remembering.\n\nVivekananda was clear: bhakti is **not weakness.** It is one of the most powerful paths because it bypasses the ego's defenses. The mind cannot argue with a melted heart.\n\nMirabai, Rumi, Tukaram, Caitanya, Hafiz — all walked here. None reached lower than the highest.`,
    'What or who is your heart already devoted to — even quietly? That may be your doorway.'),

  s(46, 6, 'Raja Yoga — the royal path (Patanjali revisited)',
    'Vivekananda\'s commentary on the 8 limbs.',
    `**Raja Yoga** is Patanjali's 8-limb system (Module 5) — but Vivekananda gave it a modern voice. He stripped away the cultural baggage and presented it as **the most systematic, most experimental, most "scientific"** of the four paths.\n\nHis framing: *yoga is the science of the inner world*, just as physics is the science of the outer. The yamas and niyamas are the **ethics of the laboratory.** Asana and pranayama are **stabilizing the instrument.** Pratyahara is **closing the lab door.** Dharana, dhyana, samadhi are **the experiments themselves.**\n\nFor people whose nature trusts method, sequence, and replicable result — raja is the path. You will run experiments on your own consciousness for years and watch the results compound.\n\nIt is the slowest path. It is also the most thorough.`,
    'Are you more drawn to method (raja) or to spontaneity (bhakti, karma)? Why?'),

  s(47, 6, 'Jnana Yoga — the razor\'s edge',
    'Neti neti — not this, not this.',
    `**Jnana Yoga** is the path of knowledge — but a very specific kind. Not book-knowledge. **Direct seeing of what you are not, until what you are reveals itself.**\n\nThe core practice is **neti neti** ("not this, not this"). You take every identification — *I am the body, I am the mind, I am my emotions, I am my role, I am my past* — and you negate it: *not that, not that.*\n\nWhat survives every negation is the Self. Vivekananda called this the **razor's edge** because it is sharp, fast, and dangerous. One wrong step and you fall into nihilism ("I am nothing") instead of liberation ("I am That").\n\nFor sharp minds — philosophers, scientists, Vedantins — jnana is the shortest path. For others, it can be a desert. Know yourself before you choose it.`,
    'Try one round now: "I am not my body. I am not my mind. I am not my…" What survives?'),

  s(48, 6, 'Krishna\'s synthesis — the Gita\'s answer',
    'The Bhagavad Gita as the integration of all 4 yogas.',
    `**The Bhagavad Gita** is, in essence, Krishna's answer to one question: *"What should I do?"* Arjuna asks it on a battlefield, paralyzed by doubt.\n\nKrishna does not give him one answer. He gives him **all four.** Across 18 chapters:\n\n• Karma Yoga (chapters 2–6) — *do your duty, drop attachment*\n• Bhakti Yoga (chapters 7–12) — *surrender to the divine, love what is*\n• Jnana Yoga (chapters 13–15) — *know what is real and what is not*\n• Raja Yoga (chapters 6 & 16–18) — *master the mind through method*\n\nKrishna's deepest teaching: **the four paths are not separate.** A complete human walks all four — acting (karma), loving (bhakti), inquiring (jnana), and disciplining the mind (raja) — at once.\n\nThis is what the Gita calls **integral yoga.** And it is also what this app's Practice Matrix is built to give you.`,
    'Which of the 4 yogas is most missing in your current life?'),

  s(49, 6, 'Buddha, Lao Tzu, Ramana — the parallel maps',
    'Same mountain, different sides.',
    `Patanjali and Vivekananda are not the only mapmakers. Other traditions reached the same summit by different routes:\n\n• **Buddha — the 4 Noble Truths and the 8-fold Path.** Suffering exists, suffering has a cause, suffering can end, here is the way. Almost identical structure to Patanjali's 8 limbs.\n\n• **Lao Tzu — Wu Wei** (effortless action). The path of *not doing*. Acting in alignment with the Tao so deeply that action arises by itself. Bhakti without a deity. Karma without a doer.\n\n• **Ramana Maharshi — Self-inquiry.** Just one question, asked relentlessly: *Who am I?* Pure jnana, stripped to its bone. No texts. No ritual. Just the question.\n\nDifferent vocabularies. Same destination. The deeper you go on any one of them, the more you recognize the others — like climbers from four sides meeting at the same peak.`,
    'Which of these four sages — Patanjali, Vivekananda, Buddha, Ramana — calls your nature most?'),

  s(50, 6, 'Your path mix — and why the engine watches it',
    'Most humans are mixtures. The engine finds yours.',
    `The truth Vivekananda taught and the engine in this app uses: **most humans are not single-path.** You might be 40% bhakti, 30% karma, 20% jnana, 10% raja — or any other ratio.\n\nThis ratio is your **path signature.** It changes slightly across decades of life — what worked in your 20s may shift in your 40s. The engine watches:\n\n• Which practices light you up vs feel dry\n• Which loops respond to which approach\n• Which masters draw you in the Temple\n• How you write in your journal (concept-heavy = jnana; emotion-heavy = bhakti; action-focused = karma; structure-focused = raja)\n\nThis is why the journey ahead is **not a fixed curriculum.** It is a path the engine builds *with* you — using Patanjali's 8 limbs as the skeleton and Vivekananda's 4 yogas as the muscle.\n\nNow you have the full classical map. Forward.`,
    'Guess your own ratio: out of 100, how do you split between karma, bhakti, jnana, raja?'),

  // ─── Module 7: Where You Stand (was Module 5, sessions 35–40) ───
  s(51, 7, 'The 11-band consciousness spectrum',
    'A map of human inner development from 0 to 10.',
    `Humans operate on different bands of consciousness. Not better/worse — different stages of *seeing.*\n\n**Band 0–2** — Survival. Reactive. Identified with thought and emotion completely.\n**Band 3–4** — Personal development. Self-aware. Working on patterns.\n**Band 5–6** — The bridge. Witnessing emerging. Practice deepening.\n**Band 7–8** — Stabilized witnessing. Most life lived from awareness.\n**Band 9–10** — Rare. Sage territory. Self has dissolved into being.\n\nMost humans live at Band 2–3. Most "spiritual people" at Band 3–4. Genuine practitioners reach 5–6 in 5–10 years. Beyond that is uncommon and not the goal — *the depth of where you are matters more than the number.*`,
    'Honestly — what band do you think you currently operate from most days?'),

  s(52, 7, 'How a Band 2 person actually behaves',
    'Most of humanity. No judgment. Just description.',
    `A **Band 2** person:\n• Reacts immediately to most triggers — anger, defensiveness, withdrawal\n• Believes their thoughts as facts\n• Identifies entirely with their emotions ("I am angry" not "anger is here")\n• Blames the outside for their inside\n• Rarely sees their own patterns\n• Spiritual concepts feel abstract or threatening\n\nThis is not bad. This is how most adults function. They are not asleep — they are running their software with no awareness it *is* software.\n\n**Most people in your life are here.** Knowing this changes how you relate to them.`,
    'Who in your life clearly operates at Band 2 — and how does knowing this change how you see them?'),

  s(53, 7, 'How a Band 5 person behaves',
    'The bridge. Where serious practitioners live.',
    `A **Band 5** person:\n• Catches most reactions before acting on them\n• Knows thoughts are not facts (and feels it, not just believes it)\n• Has a daily practice that is non-negotiable\n• Sees their own patterns clearly, can name them\n• Takes responsibility for their inside\n• Has had real moments of witness consciousness\n• Still gets hijacked sometimes — knows it when it happens\n\nBand 5 is realistic for most committed practitioners within 2–5 years. It is **enough.** Most of life's suffering loosens here.`,
    'What part of Band 5 description already fits you, and what part does not yet?'),

  s(54, 7, 'How a Band 8 person behaves',
    'Rare. Real. Recognizable when you meet one.',
    `A **Band 8** person:\n• Lives from witness most of the day\n• Reactivity is a curiosity, not a problem\n• Other people's chaos does not enter them\n• Speaks less, listens more, says more in fewer words\n• Has a quiet that is not absence — it is presence\n• Is often misread as cold, simple, or strange\n• Does not perform spirituality — has no need to\n\nYou meet maybe 1–2 Band 8 people in a life. They change you just by being near them.`,
    'Have you ever met someone like this? What did you feel in their presence?'),

  s(55, 7, 'Why bands are not better/worse',
    'They are stages of seeing, not rungs of worth.',
    `A Band 8 person is **not more valuable** than a Band 2 person. A Band 8 saint and a Band 2 child both have full human worth.\n\nBands describe **how clearly you see your own machinery** — nothing about your goodness, kindness, or value.\n\nIn fact: many Band 4–5 people are insufferable because they have just enough awareness to be smug. Many Band 2 people are warmer humans than many "spiritual" Band 5 people.\n\nDo not let band-talk become a new ego trip.`,
    'When have you used spiritual progress to feel superior — even subtly?'),

  s(56, 7, 'Your starting bands',
    'You will assess for real on Day 1 of the journey. Today, just preview.',
    `In the real journey (after this Foundation), Day 1 runs a deep assessment. It detects your **starting bands** across the 11 dimensions — clarity, presence, reactivity, devotion, somatic awareness, etc.\n\nMost people are not uniform. You might be Band 6 in clarity but Band 2 in emotional regulation. The map shows you exactly where the work is.\n\nThis is why the engine never gives generic content — it knows your specific topography.`,
    'On which dimension do you suspect you are highest? On which lowest?'),

  // ─── Module 8: Loops & Domains (was Module 6, sessions 41–46) ───
  s(57, 8, 'What a loop is',
    'Trigger → reaction → reward. The 3-part anatomy.',
    `A **loop** is any pattern that repeats without your conscious choice. It has three parts:\n\n1. **Trigger** — something happens (someone says X, you see Y, you feel Z)\n2. **Reaction** — automatic response (anger, withdrawal, scrolling, eating)\n3. **Reward** — the brain gets *something* from the reaction (relief, distraction, identity confirmation)\n\nWithout the reward, the loop would die. With it, the loop wires deeper every time you run it.\n\nYou cannot break a loop until you can see all three parts of it. Most people see only the reaction and try to fight that. It does not work.`,
    'Pick one loop you know you have. Can you name its trigger, its reaction, and its reward?'),

  s(58, 8, 'The 12 loop domains',
    'Loops cluster in life domains. Yours probably live in 2–3.',
    `Loops are not random — they cluster around **life domains.** The app tracks 12:\n\n**Relationships, Money, Body, Work, Identity, Family, Sexuality, Time, Health, Solitude, Performance, Meaning.**\n\nMost people have heavy loops in 2–3 domains. The rest are relatively clear. Knowing your hot domains tells you where to look first.\n\nExample: someone with money loops + body loops probably has a deeper "scarcity / unworthiness" loop underneath both. The Mirror Engine finds these connections.`,
    'Of the 12 domains above, which 2–3 feel like your "hot zones"?'),

  s(59, 8, 'Samskara — why some loops feel like "just who I am"',
    'The deepest loops do not feel like loops. They feel like identity.',
    `**Samskara** = deep impression. A loop that has run so many times — across years, sometimes lives, in the Indian view — that it has fused with your sense of self.\n\nA samskara does not feel like a pattern. It feels like a personality trait. *"I just don't trust people." "I always procrastinate." "I am bad at relationships."*\n\nThese statements are loops wearing identity-masks. Removing the mask is the first surgery.`,
    'What is one thing you say about yourself ("I always..." or "I never...") that might be a samskara, not a fact?'),

  s(60, 8, 'Catching your first loop in real-time',
    'Recognition mid-loop is the breakthrough moment.',
    `You will not break a loop the first time you catch it. You will not even break it the tenth time. But the *catching itself* is the practice.\n\nSequence:\n1. **Run the loop unconsciously** (months/years)\n2. **Notice it after the fact** ("Damn, I did it again")\n3. **Notice it during** ("I am doing it right now and cannot stop")\n4. **Notice the trigger before reacting** ("Here it comes…")\n5. **Choose differently** (rare, glorious, then repeats)\n\nMost people stay at step 2 for a long time. That is fine. Step 2 is not failure — it is foundation.`,
    'Where in this sequence are you with your most recurring loop?'),

  s(61, 8, 'Why you cannot fix a loop you cannot see',
    'Most "fixing" makes loops stronger.',
    `Trying to fix an unseen loop usually makes it worse. You suppress the reaction → the energy goes underground → it surfaces sideways (passive aggression, illness, sudden eruption).\n\nThe sequence is **see → feel → release → integrate.** Not see → fix.\n\nThis is why "just stop being anxious" never works. Why "manifest abundance" rarely works on someone with deep scarcity samskara. Why willpower fails.\n\n**Visibility comes first. Always.**`,
    'What loop have you tried to fix without first fully seeing — and what happened?'),

  s(62, 8, 'The cross-pollination map',
    'Which skills heal which loops. The engine knows.',
    `Different loops respond to different skills. Rough map:\n\n• **Anger / reactivity loops** → Observe + Breath\n• **Anxiety / overthinking loops** → Body + Witness\n• **Shame / unworthiness loops** → Bhakti + Inquiry\n• **Avoidance / procrastination loops** → Karma yoga + Body\n• **Identity / story loops** → Inquiry + Jnana\n• **Numbness / dissociation loops** → Body + Tantra\n• **Spiritual bypassing loops** → Karma + Body (groundedness)\n\nThe engine matches loops to skills. You do not have to figure this out yourself.`,
    'Which loop-skill pairing above feels most relevant for your current life?'),

  // ─── Module 9: The Potholes (was Module 7, sessions 47–54) ───
  s(63, 9, 'Spiritual bypassing',
    'Using practice to avoid life. The most common pothole.',
    `**Spiritual bypassing** — using spiritual ideas to skip emotional/relational work.\n\n• "I forgive them" (without feeling the anger)\n• "Everything happens for a reason" (without feeling the grief)\n• "Ego is illusion" (without paying your bills)\n• "I am detached" (without facing the fear of attachment)\n\nThe smell test: if a "spiritual" insight makes you avoid a hard human reality, it is bypass. Real awakening goes *through* the human, not around it.\n\nThis app will catch you when you bypass. The Mirror Engine sees it.`,
    'Where in your life are you using a spiritual idea to avoid feeling something?'),

  s(64, 9, 'Ego inflation — "I am awake now"',
    'The most embarrassing pothole. Many fall into it.',
    `After 6–18 months of practice, many people get a taste of real witness consciousness. The ego — clever, ancient, slippery — immediately appropriates this:\n\n*"I am awake. I see what others do not. I have transcended."*\n\nThis is the **second arrow.** The first arrow was the suffering that drove you to practice. The second is the **identity of being someone who has overcome it.**\n\nGenuine practitioners get more humble, not less. If you find yourself feeling subtly superior to "unawakened" people — that is the ego that practice fed instead of dissolved. Notice. Bow. Continue.`,
    'Have you ever caught yourself feeling spiritually superior? When?'),

  s(65, 9, 'Dryness — the plateau',
    'Day 21 to Day 45. Almost everyone hits it.',
    `For the first 2–3 weeks of practice, there is novelty, insight, freshness. Then around Day 21, it goes flat.\n\n**Dryness.** Sessions feel mechanical. Insights stop. You wonder if you are doing it wrong. You are not.\n\nThis is the **plateau between novelty and depth.** The brain has stopped giving you dopamine for new patterns. The deeper rewiring has not yet surfaced. Most people quit here.\n\nThe instruction: **keep showing up dry.** Depth comes through dryness, not around it.`,
    'When you have hit a plateau in any practice before — what made you keep going or stop?'),

  s(66, 9, 'Dark night',
    'When old structures dissolve. It is supposed to feel like dying.',
    `**Dark night of the soul** — periods (weeks to months) where everything that gave you meaning collapses. Old self-image dissolves. Joy gone. Practice feels useless. Sometimes this includes depression, dissociation, existential terror.\n\nThis is not a bug. **It is the system breaking down so something deeper can emerge.**\n\nNot everyone has dark nights. Those who do often emerge profoundly transformed. The engine watches for early signs and will:\n• Slow you down\n• Bring grounding practices (body, breath)\n• Suggest professional support if needed\n• Never push you forward in dark night\n\nYou are not alone in it. The path has held this for thousands of years.`,
    'Have you had a dark night before — even a small one? What helped you through?'),

  s(67, 9, 'Comparison & teacher worship',
    'Two faces of the same trap.',
    `**Comparison** — measuring your inner state against others' (especially polished spiritual influencers). You always lose. They are performing. You are practicing. Different things.\n\n**Teacher worship** — outsourcing your authority to a guru, master, or system. Convenient because it removes the burden of choice. Dangerous because no one outside you can verify your inner experience.\n\nThe app deliberately gives you 30+ masters so no single one becomes an idol. **Use teachers. Do not worship them.**`,
    'Are you currently comparing your practice to anyone? Or worshiping anyone? Notice without judgment.'),

  s(68, 9, 'Intensity addiction',
    'Chasing peak experiences instead of depth.',
    `Some practitioners become addicted to **peak states** — bliss, kundalini surges, ego dissolution, psychedelic insights. They start chasing the high.\n\nThis is just spiritualized hedonism. The peak is not the practice. **The boring middle is the practice.** Sitting on Day 217 when nothing is happening — that is where transformation actually compounds.\n\nIf you find yourself disappointed when sessions are "ordinary," check for intensity addiction.`,
    'Have you ever chased a peak experience instead of doing the daily work? What did it cost you?'),

  s(69, 9, 'Premature renunciation',
    'Quitting your job, leaving your relationship, "going to the mountains" — usually too early.',
    `When practice deepens, many people get an urge to **drop everything and go full-time spiritual.** Quit the job. Leave the partner. Move to an ashram. Move to the mountains.\n\nSometimes this is a real call. Usually it is **escape** wearing a spiritual costume.\n\nThe test: can you maintain your practice in the noise of normal life first? If you cannot do 30 minutes daily in your apartment, you will not do 8 hours daily in a cave. You will just be bored in a cave.\n\nIntegration first. Renunciation, if at all, much later.`,
    'Have you fantasized about dropping everything for a spiritual life? What is the fantasy actually about?'),

  s(70, 9, 'The "I already know this" trap',
    'The most dangerous pothole. Eats experienced practitioners.',
    `As you read these sessions, your mind has probably said *"I know this"* multiple times. Maybe true. Mostly false.\n\n**Knowing about** witness consciousness ≠ **living from** witness consciousness. Knowing about loops ≠ catching one mid-flight. Knowing about samskara ≠ dissolving one.\n\nThe more you read spiritual books, watched videos, did courses — the bigger this trap is for you. Every "I already know this" is a small refusal to check whether you actually do.\n\n**Treat every concept here as if you are meeting it for the first time.** Even if you have met it 100 times. Especially then.`,
    'Where in your life is "I already know this" stopping you from actually doing the work?'),

  // ─── Module 10: How to Walk This (was Module 8, sessions 55–60) ───
  s(71, 10, 'Daily rhythm — what one day actually looks like',
    'A real day, not a fantasy.',
    `A normal practice day:\n\n**Morning (10 min)** — short awakening ritual. Set the day's lens. Pick one focus.\n**During the day** — 1–2 micro-pauses (60 sec each). Just stop. Witness. Continue.\n**Midday (15–20 min)** — one focused practice from your matrix. Body scan, breath, inquiry, whatever the engine suggests.\n**Evening (10 min)** — close the day. Yoga-Nidra-style integration. What rose? What unfinished?\n**Night (3 min)** — surrender before sleep. Let the day go.\n\nTotal: ~40 min/day. **Not all days look like this.** Many days you will only do morning. Or only evening. Both are fine.`,
    'Looking at your real life — which slots realistically fit, and which do not?'),

  s(72, 10, 'Weekly rhythm — integration days, review, rest',
    'Six days work, one day integrate. A spiritual sabbath.',
    `The week has shape too:\n\n**Day 1–6** — daily practice as above\n**Day 7** — integration. No new practice. Review the week (the Mirror does this for you). Sit longer. Walk in nature. Talk to no one if possible.\n\nIntegration is when learning actually consolidates. Skip integration days and you will plateau faster.\n\nThe app will gently remind you when an integration day is due. You can override.`,
    'When do you typically take a real rest day from everything? If never — why?'),

  s(73, 10, 'Working with the Guide',
    'When to use it, when not to.',
    `The Guide is for:\n• Confusion mid-practice\n• A loop you cannot place\n• A concept you want to chew on\n• Closing a heavy emotion that surfaced\n\nThe Guide is **not** for:\n• Daily small talk\n• Replacing actual relationships\n• Avoiding silence with chatter\n\nKeep Guide sessions short. 2–3 exchanges usually. If you find yourself in long Guide conversations daily — that is dependency, not practice.`,
    'When do you reach for an app instead of sitting with discomfort?'),

  s(74, 10, 'Working with the Mirror',
    'How to read your own data without anxiety.',
    `The Mirror gives you data: bands, dimensions, loops, time-of-day patterns, weekly trends.\n\nRules for reading it:\n\n1. **Do not read it daily.** Weekly is enough. Daily creates anxiety.\n2. **Look for trends, not single data points.** One bad day means nothing.\n3. **A drop is not failure.** It is information.\n4. **The story is more important than the score.** The Mirror tells you stories, not grades.\n5. **If the Mirror is making you anxious, stop reading it for a week.** Notice that ironic loop.`,
    'How do you currently relate to data about yourself — with curiosity or anxiety?'),

  s(75, 10, 'The lifetime arc — 10 phases, decades not days',
    'You are entering something measured in decades. Settle in.',
    `The 118-day journey you are about to start is not the end. It is the **first arc** of a lifetime path.\n\nThe full lifetime has **10 phases:**\n1. Foundation (months 1–4)\n2. First depth (months 5–12)\n3. Plateau & dryness (year 2)\n4. Second opening (year 3)\n5. Integration (years 3–5)\n6. Service emergence (years 5–8)\n7. Quiet stabilization (years 8–12)\n8. Witness as default (year 10+)\n9. The unwording (much later)\n10. Whatever is beyond (no map)\n\nYou will not see all 10. Most people walk 1–3. The app is built to walk with you for as long as you walk.`,
    'Are you walking this for a season, or for a life? (No wrong answer — both are real.)'),

  s(76, 10, 'Launch ceremony — you are ready',
    'Tomorrow, the real journey begins.',
    `You have the map.\n\nYou know the four spaces. You met the engines. You understand observation as a skill. You met the 12 practices, the 8 limbs of Patanjali, and the 4 yogas of Vivekananda. You met the 11 bands. You know what loops are and how they cluster. You have been warned about every major pothole. You know the daily and weekly rhythms.\n\n**You are now literate.** Not awake. Not advanced. Literate.\n\nThat is exactly what you need to begin.\n\nTomorrow, Day 1 of the real journey starts. Not 76 sessions. Not 118 days. **A lifetime, paced exactly to your real life.**\n\nThe engine takes over from here. The orb will guide you. The Mirror will show you. The Guide will sit with you.\n\nWelcome to the path. We will walk it together.\n\n🪔`,
    'In one sentence: what do you want this journey to give you that nothing else has?',
    { label: 'Sit in silence', durationSec: 120, instruction: 'Just sit. No instruction. You are ready.' }, 8),
];

export function getPreJourneySession(id: string): PreJourneySession | undefined {
  return PRE_JOURNEY_SESSIONS.find(s => s.id === id);
}

export function getPreJourneySessionByNumber(n: number): PreJourneySession | undefined {
  return PRE_JOURNEY_SESSIONS.find(s => s.number === n);
}

export function getModuleInfo(m: PreJourneyModule): PreJourneyModuleInfo {
  return PRE_JOURNEY_MODULES.find(x => x.id === m)!;
}

export const PRE_JOURNEY_TOTAL = PRE_JOURNEY_SESSIONS.length;
