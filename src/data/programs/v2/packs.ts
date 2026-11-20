/**
 * Tradition Packs — content libraries each program pulls from.
 *
 * Each pack is intentionally small (3–5 teach blocks, 4–6 practices,
 * 4–6 reflects, 4 integrates). The template engine composes a unique
 * session each time using user state + phase. Quality > quantity.
 *
 * To add a new program: write a new pack, add it to the registry below.
 */
import type { TraditionPack } from "./types";

// ─── 1. Witness Foundations (Observation) ────────────────────
export const witnessPack: TraditionPack = {
  lineage: "The Witness — Sakshi Bhav (Vedanta + Mindfulness)",
  promise: "Learn to watch thought without becoming it.",
  vocabulary: ["witness", "noticing", "sakshi", "presence", "observing"],
  teach: [
    {
      phases: ["Foundation"],
      seconds: 90,
      text: "There are two of you in this moment: the one having the experience, and the one *aware* of having it. The Witness is that second one. It has been here your whole life. Today we begin to recognize it.",
    },
    {
      phases: ["Foundation", "Practice"],
      seconds: 90,
      text: "Thoughts are not enemies. They are weather. The Witness is the sky. You don't have to stop the weather — only stop pretending you *are* the weather.",
    },
    {
      phases: ["Practice"],
      seconds: 100,
      text: "Notice that you cannot find the witness by thinking about it. The very effort to find it *is* the witness, looking. This is the strange loop of awareness — and the doorway.",
    },
    {
      phases: ["Integration"],
      seconds: 90,
      text: "The witness is not something you build. It's something you uncover. Each time you catch yourself caught, the catching itself is freedom — for one second.",
    },
    {
      phases: ["Mastery"],
      seconds: 110,
      text: "At first you witness for seconds. Then minutes. Eventually, the witness becomes the background of every moment — quiet, unmoving, here. This is the fruit.",
    },
  ],
  practices: [
    {
      level: 0,
      title: "First Notice",
      durationMinutes: 4,
      type: "observation",
      steps: [
        "Sit comfortably. Eyes can be open or closed.",
        "For 60 seconds, just notice one breath at a time.",
        "Now notice: who is noticing the breath? Don't answer — just feel the noticing.",
        "Rest in that noticing for 2 minutes.",
        "Return slowly.",
      ],
    },
    {
      level: 1,
      title: "Thoughts as Clouds",
      durationMinutes: 6,
      type: "observation",
      steps: [
        "Settle. Eyes closed.",
        "Imagine your mind is the open sky.",
        "Each thought is a cloud passing through.",
        "Don't push them away. Don't grab them. Just watch them drift.",
        "When you notice you've boarded a cloud — gently step off, return to sky.",
      ],
    },
    {
      level: 2,
      title: "Naming the Stream",
      durationMinutes: 8,
      type: "observation",
      steps: [
        "Sit. Settle into the breath.",
        "When a thought arises, silently label it: 'planning', 'remembering', 'judging', 'wanting'.",
        "Then return to breath.",
        "The label is not analysis — it's a tap on the shoulder of the witness.",
        "Continue for 7 minutes.",
      ],
    },
    {
      level: 3,
      title: "The Space Between",
      durationMinutes: 10,
      type: "observation",
      steps: [
        "Settle deeply.",
        "After each thought ends and before the next begins — there is a tiny gap.",
        "Today, hunt for those gaps.",
        "Don't try to widen them. Just notice they exist.",
        "Rest.",
      ],
    },
    {
      level: 4,
      title: "Witnessing the Witness",
      durationMinutes: 12,
      type: "contemplation",
      steps: [
        "Sit in the established witness posture.",
        "Now ask: who is witnessing the witness?",
        "Don't answer with thought. Let the question dissolve back into awareness.",
        "Rest in what remains.",
      ],
    },
    {
      level: 5,
      title: "Open Witness — Eyes Open",
      durationMinutes: 12,
      type: "observation",
      steps: [
        "Sit upright, eyes softly open at a low fixed point.",
        "Allow sights, sounds, sensations to arrive without comment.",
        "You are the unmoved screen. Everything else is the movie.",
        "Maintain — when you forget, simply remember.",
      ],
    },
  ],
  reflects: [
    { phases: ["Foundation"], prompt: "What did you notice that you usually miss?" },
    { phases: ["Foundation", "Practice"], prompt: "What kind of thoughts dominated today's sky?" },
    { phases: ["Practice"], prompt: "When did the witness blur back into the thinker?" },
    { phases: ["Integration"], prompt: "Where today could you have witnessed instead of reacted?" },
    { phases: ["Mastery"], prompt: "What stays the same in you no matter what arises?" },
  ],
  integrates: [
    { phases: ["Foundation"], cue: "Once today, pause and ask: 'who is here?'" },
    { phases: ["Practice"], cue: "When triggered today, name the feeling silently before reacting." },
    { phases: ["Integration"], cue: "Treat one annoying moment as a free witness rep." },
    { phases: ["Mastery"], cue: "Move through one full conversation as the silent witness behind your words." },
  ],
};

// ─── 2. Self-Inquiry: Who Am I (Inquiry) ─────────────────────
export const inquiryPack: TraditionPack = {
  lineage: "Atma Vichara — Ramana Maharshi's direct path",
  promise: "Trace every thought back to its source.",
  vocabulary: ["who am I", "I-thought", "source", "Self", "neti neti"],
  teach: [
    { phases: ["Foundation"], seconds: 90, text: "Ramana said the only real question is 'Who am I?'. Not as philosophy. As a tool. Each time you ask sincerely, you redirect attention from the object back to the subject — back to the source of the question itself." },
    { phases: ["Foundation", "Practice"], seconds: 90, text: "Notice that 'I' appears before every other thought. 'I am tired.' 'I am happy.' 'I want.' What is this 'I'? Don't answer — investigate." },
    { phases: ["Practice"], seconds: 100, text: "Neti neti — 'not this, not this'. You are not the body (you can observe it). Not the mind (you can observe it). Not the emotions. Keep eliminating. What remains?" },
    { phases: ["Integration"], seconds: 90, text: "The mind hates this question. It will try to give you clever answers. Reject every answer that comes as a thought. The real answer is not a thought — it's a recognition." },
    { phases: ["Mastery"], seconds: 110, text: "Eventually 'Who am I?' is no longer a question — it becomes a place. A felt-sense of being-ness with no edges. You rest *as* the answer." },
  ],
  practices: [
    { level: 0, title: "First Inquiry", durationMinutes: 5, type: "contemplation", steps: ["Sit. Close eyes.", "Silently ask: 'Who am I?'", "Whatever answer comes — let it pass.", "Ask again, gently.", "Notice the silence between questions. That silence is the clue."] },
    { level: 1, title: "Track the I-Thought", durationMinutes: 7, type: "contemplation", steps: ["Settle.", "Wait for any thought.", "When it arises, ask: 'To whom does this thought come?'", "Answer: 'To me.'", "Then ask: 'Who is this me?'", "Rest in the not-knowing."] },
    { level: 2, title: "Neti Neti — Not This", durationMinutes: 9, type: "contemplation", steps: ["Sit.", "Notice your body. Say silently: 'I am aware of body, so I am not the body.'", "Notice thoughts. 'I am aware of thoughts, so I am not the thoughts.'", "Notice emotions. 'I am aware of emotions, so I am not the emotions.'", "What's left? Rest there."] },
    { level: 3, title: "Source of I", durationMinutes: 10, type: "contemplation", steps: ["Sit.", "Feel the sense of 'I am'. Not the words — the felt sense.", "Trace it inward. Where does the 'I' come from?", "Don't think — feel.", "When attention drifts, return to the I-feeling.", "Rest."] },
    { level: 4, title: "Wordless Inquiry", durationMinutes: 12, type: "contemplation", steps: ["Sit.", "Drop the question 'Who am I?' as words.", "Keep only the *attitude* of inquiry — the inward looking.", "Be the inquiry without inquiring.", "Rest in the silent search."] },
    { level: 5, title: "Resting as Source", durationMinutes: 15, type: "contemplation", steps: ["Sit.", "Don't ask. Don't seek. Simply be the awareness that would have asked.", "If a question arises, let it dissolve in the awareness that notices it.", "Rest as that."] },
  ],
  reflects: [
    { phases: ["Foundation"], prompt: "What's the first answer the mind offered? Was it true — or just familiar?" },
    { phases: ["Practice"], prompt: "Where in the body does the 'I-feeling' seem to live?" },
    { phases: ["Integration"], prompt: "What identity feels heaviest right now? What if it weren't true?" },
    { phases: ["Mastery"], prompt: "Describe what remained when every name fell away — without using thought-words." },
  ],
  integrates: [
    { phases: ["Foundation"], cue: "Once today, when you say 'I', pause for a half-second. Notice." },
    { phases: ["Practice"], cue: "Catch one self-story today. Ask: 'Who is the storyteller?'" },
    { phases: ["Integration"], cue: "Spend 10 seconds as 'no one in particular' before a meeting." },
    { phases: ["Mastery"], cue: "Move through an hour without referring to yourself in thought." },
  ],
};

// ─── 3. Raja Yoga — 8 Limbs (Energetic) ──────────────────────
export const rajaYogaPack: TraditionPack = {
  lineage: "Raja Yoga — Patanjali's Ashtanga (8 limbs)",
  promise: "The royal path: from ethics to absorption, in eight steps.",
  vocabulary: ["yamas", "niyamas", "asana", "pranayama", "pratyahara", "dharana", "dhyana", "samadhi"],
  teach: [
    { phases: ["Foundation"], seconds: 110, text: "Patanjali begins not with meditation, but with conduct. The Yamas (don't harm, don't lie, don't steal, conserve energy, don't grasp) and Niyamas (cleanliness, contentment, discipline, study, surrender) are the soil. Without soil, no tree." },
    { phases: ["Foundation"], seconds: 100, text: "Asana means 'a steady, comfortable seat'. Not Instagram poses. The body must become quiet enough to forget — so the mind can begin its real work." },
    { phases: ["Practice"], seconds: 100, text: "Pranayama is not breath control — it's prana control via breath. The breath is the only autonomic function we can also direct. This makes it the bridge between body and mind." },
    { phases: ["Practice"], seconds: 100, text: "Pratyahara — withdrawal of senses. Like a turtle pulling in its limbs. The senses run outward all day. We turn them around." },
    { phases: ["Integration"], seconds: 110, text: "Dharana (concentration), Dhyana (meditation), Samadhi (absorption) are not separate. They are stages of the same flame — the flame burning steadier and steadier." },
    { phases: ["Mastery"], seconds: 100, text: "Samadhi is not unconsciousness. It's hyper-consciousness without separation between knower and known. You don't *go* there — you *become* there." },
  ],
  practices: [
    { level: 0, title: "Yama Inventory", durationMinutes: 6, type: "contemplation", steps: ["Sit.", "Read each Yama silently: ahimsa, satya, asteya, brahmacharya, aparigraha.", "After each, ask: 'where in my life is this strong? where is it weak?'", "No judgment — just notice.", "Choose one to soften today."] },
    { level: 1, title: "Steady Seat", durationMinutes: 7, type: "body-scan", steps: ["Sit upright. Feet flat or cross-legged.", "Scan from crown to base — soften every place that grips.", "Find the position where you could stay 30 minutes.", "Hold it. Breathe naturally.", "This *is* the asana."] },
    { level: 2, title: "Sama Vritti — Box Breath", durationMinutes: 8, type: "breathwork", steps: ["Inhale 4 counts.", "Hold 4 counts.", "Exhale 4 counts.", "Hold 4 counts.", "Continue for 6 minutes. Steady, even, unforced."] },
    { level: 3, title: "Pratyahara — Sense Withdrawal", durationMinutes: 10, type: "meditation", steps: ["Sit, eyes closed.", "Notice what you hear. Don't engage — just notice.", "Notice what you feel on skin. Don't engage.", "Notice what you smell, taste. Don't engage.", "Now turn all senses inward — toward the breath at the nostrils.", "Rest there."] },
    { level: 4, title: "Dharana — Single Point", durationMinutes: 12, type: "meditation", steps: ["Sit.", "Choose one anchor: breath at the nostril tip, or a candle flame, or the word 'so-hum'.", "Place attention there.", "When it wanders — return.", "When it wanders — return.", "Quality of return is the practice."] },
    { level: 5, title: "Dhyana — Continuous Flow", durationMinutes: 15, type: "meditation", steps: ["Sit.", "Begin with Dharana on one anchor.", "When attention stays without slipping, soften effort.", "The anchor and the attention begin to merge.", "Don't push. Just don't leave.", "Rest in the unbroken stream."] },
  ],
  reflects: [
    { phases: ["Foundation"], prompt: "Which Yama did you most violate against yourself today?" },
    { phases: ["Practice"], prompt: "What did the breath teach you that words couldn't?" },
    { phases: ["Practice"], prompt: "What pulled your attention away most? That's your work." },
    { phases: ["Integration"], prompt: "Where in daily life is your concentration leaking?" },
    { phases: ["Mastery"], prompt: "Was there a moment today the gap between you and the practice closed?" },
  ],
  integrates: [
    { phases: ["Foundation"], cue: "Practice one Yama all day — pick the hardest one." },
    { phases: ["Practice"], cue: "Take three sama-vritti breaths before opening any app." },
    { phases: ["Integration"], cue: "Once today, withdraw all senses for 30 seconds in a noisy place." },
    { phases: ["Mastery"], cue: "Hold one task with unbroken attention for its full duration." },
  ],
};

// ─── 4. Tantra Yoga — Awareness Path (Energetic) ─────────────
export const tantraPack: TraditionPack = {
  lineage: "Tantra — the path of inclusion (Kashmir Shaivism / Vijnana Bhairava)",
  promise: "Use every sensation as a doorway, not a distraction.",
  vocabulary: ["awareness", "sensation", "doorway", "energy", "Shiva-Shakti"],
  teach: [
    { phases: ["Foundation"], seconds: 100, text: "Tantra means 'to weave'. Where Yoga withdraws from the world, Tantra weaves the world into awareness. Nothing is rejected. Everything is fuel." },
    { phases: ["Foundation"], seconds: 90, text: "The Vijnana Bhairava Tantra lists 112 doorways to the absolute — all from ordinary experience: a sneeze, the moment of falling asleep, looking at the sky. The sacred is hidden in the obvious." },
    { phases: ["Practice"], seconds: 100, text: "Tantric awareness is not 'observing from above'. It's *being inside* the sensation completely — so completely that the observer dissolves into the observed." },
    { phases: ["Practice"], seconds: 100, text: "Shiva is awareness. Shakti is energy. They are not two. Every felt sensation is Shakti dancing inside the field of Shiva that you are." },
    { phases: ["Integration"], seconds: 110, text: "The trap of Tantra is mistaking pleasure-seeking for the path. The actual practice is full presence to whatever arises — pleasure, pain, boredom, joy — without preference." },
    { phases: ["Mastery"], seconds: 100, text: "Eventually every doorway opens to the same room. Eating, walking, grieving, laughing — all reveal the same silent presence underneath. This is Tantra's fruit." },
  ],
  practices: [
    { level: 0, title: "First Sensation", durationMinutes: 5, type: "body-scan", steps: ["Sit.", "Find one clear sensation in the body — any sensation.", "Don't analyze it. Don't change it.", "Move *into* it with awareness, like stepping into a small room.", "Stay 3 minutes. Then release."] },
    { level: 1, title: "Three Doorways", durationMinutes: 7, type: "observation", steps: ["Sit.", "Notice three sensations in sequence: one in body, one sound, one breath quality.", "With each, fully enter for 90 seconds.", "Notice: the *quality* of awareness is the same in all three.", "That sameness is the doorway."] },
    { level: 2, title: "Pause at the Edges", durationMinutes: 8, type: "breathwork", steps: ["Settle.", "Watch the breath.", "At the very end of each exhale — pause. Just for the natural moment before inhale.", "In that pause: who is here?", "Then let breath continue. Don't force.", "Repeat."] },
    { level: 3, title: "Sound as Self", durationMinutes: 10, type: "meditation", steps: ["Sit, eyes closed.", "Listen to all sounds without preference.", "Don't name them. Don't choose.", "Notice: hearing happens in awareness — sound is *inside* you.", "Rest as the field in which all sound appears."] },
    { level: 4, title: "Pleasure Without Grasping", durationMinutes: 12, type: "contemplation", steps: ["Sit.", "Recall a small pleasant sensation (warmth, comfort).", "Let it arise in the body now.", "Be fully with it — but don't lean in, don't try to extend.", "Notice: the pleasure is held by something larger than itself.", "Rest as that larger field."] },
    { level: 5, title: "Whatever Arises", durationMinutes: 15, type: "meditation", steps: ["Sit.", "Make no agenda.", "Whatever arises — sensation, thought, sound, mood — meet it fully.", "Don't move toward, don't move away.", "Each arising is Shakti. The unmoved meeting is Shiva.", "Rest as the meeting itself."] },
  ],
  reflects: [
    { phases: ["Foundation"], prompt: "Which sensation surprised you by being a doorway?" },
    { phases: ["Practice"], prompt: "What did you usually push away that today you let in?" },
    { phases: ["Integration"], prompt: "Where in daily life are you splitting awareness from experience?" },
    { phases: ["Mastery"], prompt: "Describe one ordinary moment today that was secretly sacred." },
  ],
  integrates: [
    { phases: ["Foundation"], cue: "Eat one bite today with complete attention to taste." },
    { phases: ["Practice"], cue: "Pause at the end of three exhales today. Notice." },
    { phases: ["Integration"], cue: "Let one uncomfortable feeling fully in today — without fixing." },
    { phases: ["Mastery"], cue: "Find the sacred in one task you usually rush through." },
  ],
};

// ─── 5. Pranayama Essentials (Energetic) ─────────────────────
export const pranayamaPack: TraditionPack = {
  lineage: "Pranayama — the science of vital breath",
  promise: "Direct your energy by directing your breath.",
  vocabulary: ["prana", "puraka", "rechaka", "kumbhaka", "ujjayi", "nadi"],
  teach: [
    { phases: ["Foundation"], seconds: 100, text: "Prana is not breath. Prana is the life-force the breath carries. By regulating breath, we regulate prana — and through prana, the mind itself." },
    { phases: ["Foundation"], seconds: 90, text: "Three parts to every breath: puraka (in), kumbhaka (hold), rechaka (out). Most people do only two. The hold is where the work happens." },
    { phases: ["Practice"], seconds: 100, text: "The nadis are subtle channels. Nadi shodhana — alternate nostril breathing — balances the two main ones (ida, lunar; pingala, solar). The result: a steady, central mind." },
    { phases: ["Integration"], seconds: 110, text: "Slow breath = slow mind. Studies confirm what yogis knew: breathing at 5–6 cycles per minute synchronizes heart, brain, and breath. This is not metaphor — it's measurable." },
    { phases: ["Mastery"], seconds: 100, text: "Eventually the breath becomes so subtle you forget you're breathing. The practice has done its work — it has handed you back to silence." },
  ],
  practices: [
    { level: 0, title: "Three-Part Breath", durationMinutes: 5, type: "breathwork", steps: ["Sit upright.", "Inhale: belly fills, then ribs, then chest.", "Exhale: chest empties, ribs, then belly.", "10 rounds. Slow, smooth, complete.", "Rest 1 minute."] },
    { level: 1, title: "Equal Breath (Sama Vritti)", durationMinutes: 6, type: "breathwork", steps: ["Inhale 4 counts.", "Exhale 4 counts.", "Continue for 5 minutes.", "If easy, increase to 5 counts each.", "Steady, smooth."] },
    { level: 2, title: "Extended Exhale", durationMinutes: 7, type: "breathwork", steps: ["Inhale 4 counts.", "Exhale 6 counts.", "Continue 5 minutes.", "The longer exhale activates the parasympathetic — the body's rest signal.", "Notice the calm settle in."] },
    { level: 3, title: "Nadi Shodhana — Alternate Nostril", durationMinutes: 8, type: "breathwork", steps: ["Right thumb closes right nostril.", "Inhale through left.", "Close left with ring finger, release thumb.", "Exhale through right. Inhale right.", "Close right, release left. Exhale left.", "That's one round. Do 10."] },
    { level: 4, title: "Ujjayi — Ocean Breath", durationMinutes: 10, type: "breathwork", steps: ["Slightly constrict the back of the throat — like fogging a mirror, but with mouth closed.", "Inhale and exhale through nose with that gentle hiss.", "Sound is soft — only you should hear it.", "Continue 8 minutes.", "Notice the warming, focusing effect."] },
    { level: 5, title: "Square Breath with Hold", durationMinutes: 12, type: "breathwork", steps: ["Inhale 5 counts.", "Hold 5 counts (kumbhaka).", "Exhale 5 counts.", "Hold empty 5 counts.", "Continue 10 minutes.", "If strain, drop to 4. Never force."] },
  ],
  reflects: [
    { phases: ["Foundation"], prompt: "What changed in the mind by the end of today's breath?" },
    { phases: ["Practice"], prompt: "Where did you feel the breath in the body — and where was it hidden?" },
    { phases: ["Integration"], prompt: "When in your day does breath become shallow? Why?" },
    { phases: ["Mastery"], prompt: "What is the breath behind the breath?" },
  ],
  integrates: [
    { phases: ["Foundation"], cue: "Take 3 slow three-part breaths before lunch." },
    { phases: ["Practice"], cue: "Use extended-exhale breathing once when stressed today." },
    { phases: ["Integration"], cue: "Notice your breath quality at three different moments today." },
    { phases: ["Mastery"], cue: "Carry ujjayi breath silently through one short walk." },
  ],
};

// ─── 6. Shadow Work Intro (Emotional) ────────────────────────
export const shadowPack: TraditionPack = {
  lineage: "Shadow Work — Jungian + non-dual integration",
  promise: "Befriend the parts of you that you've been hiding.",
  vocabulary: ["shadow", "projection", "disowned", "integration", "wholeness"],
  teach: [
    { phases: ["Foundation"], seconds: 100, text: "The shadow is everything about yourself you've decided isn't 'you'. Anger if you think you're peaceful. Need if you think you're independent. The shadow runs the show until you turn and look at it." },
    { phases: ["Foundation"], seconds: 90, text: "The clearest mirror to your shadow is what you can't stand in others. The trait that *enrages* you is almost always something you've disowned in yourself." },
    { phases: ["Practice"], seconds: 100, text: "Shadow work is not getting rid of darkness. It's bringing darkness into the light of awareness — where it loses its compulsive power and becomes simply *you*, fully." },
    { phases: ["Integration"], seconds: 110, text: "Don't act out the shadow. Don't suppress it. Witness it. Feel it in the body. Let it speak its message. Then choose — consciously — what to do." },
    { phases: ["Mastery"], seconds: 100, text: "An integrated person is not without shadow — they're without secrets from themselves. They can be all of it, and act from any of it, freely." },
  ],
  practices: [
    { level: 0, title: "What Triggers You", durationMinutes: 6, type: "journaling", steps: ["Sit with your journal.", "Write: 'Three traits I judge harshly in others are…'", "Be specific. Real people, real moments.", "After writing, ask gently: 'where in me does this also live?'", "No need to answer fully. The question itself is the practice."] },
    { level: 1, title: "Disowned Voice", durationMinutes: 8, type: "journaling", steps: ["Choose one trait you'd never claim ('I'm angry / needy / arrogant').", "Write a 5-minute monologue *as* that part of you.", "Let it speak unfiltered.", "When done, thank it for showing up."] },
    { level: 2, title: "Body of the Shadow", durationMinutes: 9, type: "body-scan", steps: ["Sit. Bring to mind a recent trigger.", "Don't think about it — feel where it lives in the body.", "Place a hand there.", "Breathe slowly into that spot for 5 minutes.", "Don't try to release. Just be present with the held tension."] },
    { level: 3, title: "Letter from the Exiled", durationMinutes: 10, type: "journaling", steps: ["Imagine the part of you that you most exiled as a child.", "Let it write you a letter today.", "What did it want? What did it lose?", "Write 8 minutes.", "Read it back slowly."] },
    { level: 4, title: "Dialogue with Shadow", durationMinutes: 12, type: "journaling", steps: ["Two columns. Left: your everyday self speaking. Right: the shadow part speaking.", "Have a real dialogue.", "Don't predetermine the outcome.", "Let both sides be heard.", "End with one small agreement."] },
    { level: 5, title: "Wholeness Sit", durationMinutes: 12, type: "meditation", steps: ["Sit.", "Invite *all* of you into the room — light parts, dark parts, kind, cruel, generous, jealous.", "Feel them as one body.", "Don't pick favorites.", "Rest as the field that holds them all."] },
  ],
  reflects: [
    { phases: ["Foundation"], prompt: "What part of you did you almost not write down?" },
    { phases: ["Practice"], prompt: "What did the disowned voice teach you that your usual voice never could?" },
    { phases: ["Integration"], prompt: "Where today did your shadow run the show before you noticed?" },
    { phases: ["Mastery"], prompt: "Which 'unacceptable' trait might actually be a gift you've been refusing?" },
  ],
  integrates: [
    { phases: ["Foundation"], cue: "Catch one judgment today and ask: 'where does this live in me?'" },
    { phases: ["Practice"], cue: "Allow one 'forbidden' feeling to be fully felt without acting on it." },
    { phases: ["Integration"], cue: "Speak one truth today that your 'good self' would have hidden." },
    { phases: ["Mastery"], cue: "Move through one situation owning all of you — not just the acceptable parts." },
  ],
};

// ─── 7. Emotion Mapping (Emotional) ──────────────────────────
export const emotionPack: TraditionPack = {
  lineage: "Emotion Mapping — felt-sense + naming (somatic + mindfulness)",
  promise: "Read your emotional weather before it reads you.",
  vocabulary: ["felt-sense", "naming", "primary", "secondary", "underneath"],
  teach: [
    { phases: ["Foundation"], seconds: 100, text: "Emotions are not problems. They're signals. The trouble starts when we either suppress them or fuse with them. Mapping is the third option: notice, name, feel, learn." },
    { phases: ["Foundation"], seconds: 90, text: "Most surface emotions hide a deeper one. Anger often hides hurt. Anxiety often hides fear of loss. Boredom often hides grief. Mapping goes layer by layer." },
    { phases: ["Practice"], seconds: 100, text: "Naming a feeling reduces its grip. Brain scans show 'affect labeling' literally cools the amygdala. The label doesn't fix the feeling — it makes it workable." },
    { phases: ["Integration"], seconds: 110, text: "An emotion fully felt, named, and given 90 seconds of attention, will move through the body and resolve. An emotion suppressed will return — louder." },
    { phases: ["Mastery"], seconds: 100, text: "The mature relationship to emotion is neither slave nor master — it's friend. You are the one to whom emotions arrive, and the one who can listen." },
  ],
  practices: [
    { level: 0, title: "What Am I Feeling?", durationMinutes: 4, type: "journaling", steps: ["Pause.", "Scan the body. What sensations are present?", "Name them in 1–3 words: 'tight chest', 'restless legs', 'soft warmth'.", "Don't analyze why. Just see clearly."] },
    { level: 1, title: "Two Layers Down", durationMinutes: 6, type: "contemplation", steps: ["Notice the surface emotion.", "Ask: 'underneath this, what else is here?'", "Wait for an honest answer.", "Then ask once more: 'and underneath that?'", "Sit with the deepest layer for 2 minutes."] },
    { level: 2, title: "90-Second Felt-Sense", durationMinutes: 7, type: "body-scan", steps: ["Bring to mind a recent emotional moment.", "Find where it lives in the body.", "Set a silent 90-second timer.", "Stay fully in the sensation — no story.", "When the wave moves or shifts, notice. Don't push it."] },
    { level: 3, title: "Mapping the Whole Field", durationMinutes: 10, type: "journaling", steps: ["Get paper.", "Write today's date.", "List every emotion present right now (5–10 are normal).", "For each, mark intensity 1–10.", "Circle the one that surprised you most. Sit with it 3 minutes."] },
    { level: 4, title: "Listen to the Message", durationMinutes: 12, type: "journaling", steps: ["Choose one persistent emotion from this week.", "Write to it: 'Dear [emotion], what are you here to tell me?'", "Let it answer in writing — 8 minutes.", "Thank it. Choose one small action it suggests."] },
    { level: 5, title: "Unconditional Welcome", durationMinutes: 12, type: "meditation", steps: ["Sit.", "Invite any emotion to arise.", "Whatever shows up, say silently: 'you are welcome here'.", "Don't fix. Don't push.", "Be the host who turns no guest away.", "Rest as that hospitality."] },
  ],
  reflects: [
    { phases: ["Foundation"], prompt: "Which emotion were you avoiding before this session?" },
    { phases: ["Practice"], prompt: "What was underneath the obvious feeling?" },
    { phases: ["Integration"], prompt: "Where today did you label an emotion in time to choose your response?" },
    { phases: ["Mastery"], prompt: "Which emotion have you stopped fearing? Which one still scares you?" },
  ],
  integrates: [
    { phases: ["Foundation"], cue: "Name one feeling out loud (or in your head) at noon and at 6pm." },
    { phases: ["Practice"], cue: "When triggered today, give it 90 seconds of body attention before reacting." },
    { phases: ["Integration"], cue: "Once today, ask yourself 'what's underneath this?' before moving on." },
    { phases: ["Mastery"], cue: "Welcome one 'unwanted' emotion fully today — like an old friend." },
  ],
};

// ─── 8. Forgiveness (Emotional) ──────────────────────────────
export const forgivenessPack: TraditionPack = {
  lineage: "Forgiveness — releasing the energetic grip of harm",
  promise: "Free yourself from the rope you've been holding.",
  vocabulary: ["forgive", "release", "boundary", "repair", "free"],
  teach: [
    { phases: ["Foundation"], seconds: 100, text: "Forgiveness is not condoning. It's not forgetting. It's the moment you stop carrying the weight of what happened — for *your* sake, not theirs." },
    { phases: ["Foundation"], seconds: 90, text: "Resentment is drinking poison and waiting for the other person to die. The cost of unforgiveness is paid only by you." },
    { phases: ["Practice"], seconds: 100, text: "Forgiveness can coexist with strong boundaries. You can forgive someone *and* never let them near you again. These are separate decisions." },
    { phases: ["Integration"], seconds: 110, text: "The hardest forgiveness is often self-forgiveness. We hold ourselves to impossible standards and then refuse to meet ourselves with the mercy we'd offer a friend." },
    { phases: ["Mastery"], seconds: 100, text: "Eventually forgiveness becomes a stance, not an event. You meet harm without needing to add a layer of bitterness on top. The wound stays clean." },
  ],
  practices: [
    { level: 0, title: "What I'm Still Carrying", durationMinutes: 5, type: "journaling", steps: ["Write: 'I am still carrying the weight of…'", "List 3 things — small or large.", "Don't fix. Just acknowledge.", "Notice which one weighs most."] },
    { level: 1, title: "The Letter You Won't Send", durationMinutes: 8, type: "journaling", steps: ["Choose one person.", "Write everything you've never said.", "Be unfiltered. No one will read this but you.", "When done, you can keep it, burn it, or shred it.", "The act of writing is the practice."] },
    { level: 2, title: "Loving-Kindness for the Difficult", durationMinutes: 9, type: "meditation", steps: ["Sit.", "Begin with yourself: 'May I be well, may I be at ease.'", "Then a loved one. Then a neutral person.", "Then — gently — the one who hurt you. 'May they be well, may they be at ease.'", "If it's too much, return to yourself."] },
    { level: 3, title: "Untying the Rope", durationMinutes: 10, type: "contemplation", steps: ["Sit.", "Imagine a rope between you and the person you resent.", "On *your* end, you've been gripping for years.", "Today, just for 10 minutes, let go.", "Notice: did anything change in your body?", "When you stand up, you can pick up the rope again. Or not."] },
    { level: 4, title: "Self-Forgiveness", durationMinutes: 12, type: "journaling", steps: ["Write: 'The thing I most can't forgive in myself is…'", "Let it be specific.", "Then write: 'If a friend told me this exact story, I would say…'", "Write your friend's response — 8 minutes.", "Read it back as if it were said *to* you."] },
    { level: 5, title: "Forgiveness as Stance", durationMinutes: 12, type: "meditation", steps: ["Sit.", "Bring to mind everyone you have not yet forgiven.", "Place them all in a soft circle around you.", "Don't force forgiveness. Just be present with all of it — the harm, the hurt, the holding.", "Rest in the awareness that holds all of it without breaking."] },
  ],
  reflects: [
    { phases: ["Foundation"], prompt: "What weight did you put down today, even just briefly?" },
    { phases: ["Practice"], prompt: "What was the cost of carrying this all these years?" },
    { phases: ["Integration"], prompt: "Where do you still need a boundary, even if you've forgiven?" },
    { phases: ["Mastery"], prompt: "What in yourself still waits for mercy?" },
  ],
  integrates: [
    { phases: ["Foundation"], cue: "Once today, say silently: 'this is heavy — I can put it down for one minute.'" },
    { phases: ["Practice"], cue: "Send one person silent loving-kindness today — including yourself." },
    { phases: ["Integration"], cue: "Forgive yourself for one mistake today, out loud or in writing." },
    { phases: ["Mastery"], cue: "Move through one small harm today without adding bitterness." },
  ],
};

// ─── 9. Karma Yoga at Work (Integration) ─────────────────────
export const karmaPack: TraditionPack = {
  lineage: "Karma Yoga — Krishna's teaching: action without attachment to fruit",
  promise: "Turn your work itself into the practice.",
  vocabulary: ["action", "fruit", "offering", "duty", "non-doership"],
  teach: [
    { phases: ["Foundation"], seconds: 100, text: "Krishna told Arjuna: 'You have a right to action, never to its fruits. Do not let the fruit be the motive of your action — but never be attached to inaction either.' This is karma yoga in one verse." },
    { phases: ["Foundation"], seconds: 90, text: "The trap is not action. The trap is attachment to outcome. When you grip the fruit, every task becomes anxiety. When you offer the fruit, every task becomes practice." },
    { phases: ["Practice"], seconds: 100, text: "At work, this looks like: do your best, then release. Don't replay the meeting. Don't pre-suffer the review. Act fully — release fully." },
    { phases: ["Integration"], seconds: 110, text: "Karma yoga doesn't mean working harder. It means working with a different *internal posture* — full presence, no clinging. The work gets *better*, not worse." },
    { phases: ["Mastery"], seconds: 100, text: "Eventually you notice: there is no doer. Action happens through you, not by you. This is non-doership — the deepest fruit of karma yoga." },
  ],
  practices: [
    { level: 0, title: "Pre-Task Offering", durationMinutes: 3, type: "contemplation", steps: ["Before your next task — pause.", "Take 3 breaths.", "Silently say: 'I'll do this fully. The fruit isn't mine.'", "Begin."] },
    { level: 1, title: "Single-Task with Witness", durationMinutes: 8, type: "contemplation", steps: ["Choose one work task.", "Close other tabs. Phone face-down.", "Do the task with full attention for 7 minutes.", "Notice each time you pull toward outcome — return to the doing.", "When done, release. No replay."] },
    { level: 2, title: "Outcome Inventory", durationMinutes: 7, type: "journaling", steps: ["Write down 5 outcomes you're currently gripping at work.", "For each, ask: 'how much of this is in my control? how much isn't?'", "Mark the *not in your control* portion with a circle.", "Today, those circled items go in the offering pile.", "Notice the lightness."] },
    { level: 3, title: "Meeting as Practice", durationMinutes: 10, type: "contemplation", steps: ["Before your next meeting — three breaths.", "Set intention: 'I'll be fully present, not strategic.'", "During the meeting, notice each pull toward managing how you appear.", "Return to listening.", "Afterward — release the replay."] },
    { level: 4, title: "Day as Offering", durationMinutes: 10, type: "journaling", steps: ["At day's end, write: 'today I did…'", "List the 3–5 main actions.", "After each, write: 'and I release the fruit of this.'", "Don't lie — if you're still gripping, just notice it.", "Sleep with the day offered."] },
    { level: 5, title: "Non-Doer Sit", durationMinutes: 12, type: "meditation", steps: ["Sit.", "Recall today's actions.", "Notice: who actually did them?", "The thinking, the typing, the speaking — all happened. Was there a *doer* anywhere, or did it all just happen?", "Rest as the field in which doing arises."] },
  ],
  reflects: [
    { phases: ["Foundation"], prompt: "Which task today carried the most outcome-anxiety?" },
    { phases: ["Practice"], prompt: "Where did 'releasing the fruit' actually make the action *better*?" },
    { phases: ["Integration"], prompt: "What outcome are you still gripping that isn't yours to control?" },
    { phases: ["Mastery"], prompt: "When today did action happen *through* you rather than *by* you?" },
  ],
  integrates: [
    { phases: ["Foundation"], cue: "Before one task today, take 3 breaths and offer the fruit." },
    { phases: ["Practice"], cue: "After one meeting today, do not replay. Move on cleanly." },
    { phases: ["Integration"], cue: "Notice once today: who is taking credit?" },
    { phases: ["Mastery"], cue: "Move through one work hour as 'no one in particular doing what's needed'." },
  ],
};

// ─── 10. Workplace Loop Dissolution (Integration) ────────────
export const workLoopPack: TraditionPack = {
  lineage: "Workplace Loops — pattern recognition + somatic interrupts",
  promise: "See and interrupt the loops that run your workday.",
  vocabulary: ["loop", "trigger", "interrupt", "pattern", "compulsion"],
  teach: [
    { phases: ["Foundation"], seconds: 100, text: "A loop is a trigger → reaction sequence that has run so many times it feels automatic. Slack ping → check. Email → tense. Boss in hallway → perform. Loops are not you — but they steer most of your day." },
    { phases: ["Foundation"], seconds: 90, text: "You don't dissolve a loop by fighting it. You dissolve it by *seeing* it clearly enough — and giving the body a different response in the same trigger." },
    { phases: ["Practice"], seconds: 100, text: "The 3-second window: between trigger and response there is always a tiny gap. Most people skip it. The work is to find the gap and *use* it." },
    { phases: ["Integration"], seconds: 110, text: "Most workplace loops have nothing to do with the workplace. They were installed in childhood and just found a new costume in your job. Recognizing this softens the shame." },
    { phases: ["Mastery"], seconds: 100, text: "You don't have to delete every loop. You just have to no longer be *operated by* them. Awareness alone is 80% of the freedom." },
  ],
  practices: [
    { level: 0, title: "Spot One Loop", durationMinutes: 5, type: "journaling", steps: ["Pick the most automatic thing you do at work.", "Write: trigger → reaction.", "Example: 'phone buzzes → I check immediately'.", "Don't try to change it yet. Just see it clearly.", "Carry the awareness through the next hour."] },
    { level: 1, title: "Body Map of a Loop", durationMinutes: 7, type: "body-scan", steps: ["Recall a recent work-loop trigger.", "Where in the body does the trigger land?", "(Common spots: chest tighten, jaw clench, shoulders lift, gut drop.)", "Place a hand there.", "Breathe slowly into it for 4 minutes."] },
    { level: 2, title: "The 3-Second Gap", durationMinutes: 6, type: "contemplation", steps: ["Choose one loop you'll work with this week.", "Today, when the trigger fires — pause for 3 seconds before the usual reaction.", "Just 3 seconds. Don't change behavior.", "Notice what happens in the gap.", "Repeat as opportunities arise."] },
    { level: 3, title: "Different Response Drill", durationMinutes: 10, type: "contemplation", steps: ["Sit.", "Bring the trigger vividly to mind.", "Feel the usual pull.", "Now mentally rehearse a different response — slower, calmer, smaller.", "Repeat 5 times.", "The brain doesn't fully distinguish rehearsal from real."] },
    { level: 4, title: "Origin Inquiry", durationMinutes: 10, type: "journaling", steps: ["Pick your dominant work-loop.", "Ask: 'when in my life did this pattern first show up?'", "Write whatever surfaces — 8 minutes.", "Don't try to interpret. The seeing itself softens the loop's grip."] },
    { level: 5, title: "Witnessing the Loop Live", durationMinutes: 10, type: "meditation", steps: ["Sit.", "Recall a loop running in real time today.", "Watch it like a documentary — start, middle, end.", "You are not in the documentary. You are watching it.", "Rest as the watcher."] },
  ],
  reflects: [
    { phases: ["Foundation"], prompt: "Which loop did you spot today that you'd never named before?" },
    { phases: ["Practice"], prompt: "What lives in the 3-second gap when you actually take it?" },
    { phases: ["Integration"], prompt: "Where did the loop come from originally? Whose voice trained it?" },
    { phases: ["Mastery"], prompt: "Which loop has lost its automatic power since you started watching it?" },
  ],
  integrates: [
    { phases: ["Foundation"], cue: "Catch one workplace loop in the act today. Just notice — no need to change." },
    { phases: ["Practice"], cue: "Take a real 3-second pause before checking notifications today." },
    { phases: ["Integration"], cue: "When triggered today, ask: 'is this even mine?'" },
    { phases: ["Mastery"], cue: "Move through one full workday loop with eyes open instead of asleep." },
  ],
};

// ─── 11. Sleep / Yoga Nidra (Observation) ────────────────────
export const nidraPack: TraditionPack = {
  lineage: "Yoga Nidra — conscious deep rest",
  promise: "Enter the state between waking and sleep, awake.",
  vocabulary: ["nidra", "rotation", "sankalpa", "withdrawal", "rest"],
  teach: [
    { phases: ["Foundation"], seconds: 100, text: "Yoga Nidra means 'yogic sleep'. The body sleeps. The mind sleeps. But awareness stays. 30 minutes can equal hours of regular sleep — and unlike sleep, you bring something back." },
    { phases: ["Foundation"], seconds: 90, text: "The structure is ancient and works on most nervous systems: body rotation → breath awareness → opposites → visualization → return. The body slips below thought." },
    { phases: ["Practice"], seconds: 100, text: "A sankalpa is a short positive intention you plant at the start, like a seed in soft soil. The mind in nidra is highly suggestible — use it kindly." },
    { phases: ["Integration"], seconds: 110, text: "If you fall asleep during nidra, that's fine — but the practice is to *almost* fall asleep, again and again. The edge is the medicine." },
    { phases: ["Mastery"], seconds: 100, text: "Long-term, nidra teaches you that 'rest' is not a state — it's a relationship to whatever is happening. You can carry the nidra-quiet into the rest of the day." },
  ],
  practices: [
    { level: 0, title: "5-Minute Body Scan to Sleep", durationMinutes: 5, type: "body-scan", steps: ["Lie down, eyes closed.", "Awareness moves slowly: right thumb, fingers, palm, wrist, arm.", "Then left arm same way.", "Then face, torso, both legs.", "End at the feet. Rest."] },
    { level: 1, title: "Body Rotation — Full", durationMinutes: 12, type: "body-scan", steps: ["Lie flat (savasana).", "Rotate awareness through every body part — slowly, by name.", "Right side first: thumb, second finger, third, fourth, fifth, palm, back of hand, wrist, elbow, shoulder, armpit, side, hip, thigh, knee, calf, ankle, heel, sole, toes.", "Left side same.", "Front of body. Back. Whole body together.", "Rest 2 minutes."] },
    { level: 2, title: "Nidra with Sankalpa", durationMinutes: 14, type: "meditation", steps: ["Lie down.", "Plant one short positive sankalpa: 'I am at peace with what is.'", "Body rotation (8 minutes).", "Breath awareness — count 27 down to 1 (5 minutes).", "Repeat sankalpa.", "Slowly return."] },
    { level: 3, title: "Opposite Sensations", durationMinutes: 15, type: "meditation", steps: ["Lie down.", "Body rotation (5 minutes).", "Now feel heaviness in the body. Then lightness. Heaviness. Lightness.", "Then heat. Then cool. Heat. Cool.", "Then a sense of stillness — and within it, a tiny vibration.", "Rest."] },
    { level: 4, title: "Visualization Nidra", durationMinutes: 18, type: "meditation", steps: ["Lie down.", "Body rotation (6 minutes).", "Visualize: a quiet beach at dusk, a candle flame, a forest path.", "Don't strain — let images arise softly.", "Notice: who is seeing the images?", "Rest in that seeing."] },
    { level: 5, title: "Nidra into Witness", durationMinutes: 20, type: "meditation", steps: ["Lie down.", "Full body rotation.", "Breath count down from 27.", "Now: don't visualize. Don't even feel.", "Simply rest as awareness aware of itself.", "Stay at the edge of sleep without falling in.", "Return slowly."] },
  ],
  reflects: [
    { phases: ["Foundation"], prompt: "What did you carry into the practice that you no longer carry now?" },
    { phases: ["Practice"], prompt: "Did you fall asleep, almost fall asleep, or stay awake? All are fine — what did you notice at the edge?" },
    { phases: ["Integration"], prompt: "Has your relationship to rest itself changed?" },
    { phases: ["Mastery"], prompt: "Can you find the nidra-quiet now, with eyes open?" },
  ],
  integrates: [
    { phases: ["Foundation"], cue: "Take 3 long exhales before bed tonight." },
    { phases: ["Practice"], cue: "Plant one short sankalpa as you fall asleep tonight." },
    { phases: ["Integration"], cue: "Notice once today the quality of being 'between' — between tasks, between breaths." },
    { phases: ["Mastery"], cue: "Carry one moment of nidra-quiet into a busy moment today." },
  ],
};

// ─── 12. Mantra Basics (Energetic) ───────────────────────────
export const mantraPack: TraditionPack = {
  lineage: "Mantra — sacred sound as anchor and transmission",
  promise: "Use sound to steady the mind and shift the field.",
  vocabulary: ["mantra", "japa", "mala", "vibration", "transmission"],
  teach: [
    { phases: ["Foundation"], seconds: 100, text: "A mantra is not a magic spell. It's a sound the mind can ride on. The repetition gives wandering attention a steady boat — until eventually you ARE the boat, and then there's no boat at all." },
    { phases: ["Foundation"], seconds: 90, text: "Three modes: spoken aloud (vaikhari), whispered (madhyama), silent in the heart (pashyanti). Each goes deeper. Most paths begin out loud and travel inward." },
    { phases: ["Practice"], seconds: 100, text: "A mala is a string of 108 beads — a counter so the mind doesn't have to count. Each bead, one mantra. One mala = one round. The hands keep time so the mind can soften." },
    { phases: ["Integration"], seconds: 110, text: "The deepest teaching: eventually the mantra repeats itself, without you. You don't *do* japa anymore — japa happens. This is ajapa-japa, the unstruck repetition." },
    { phases: ["Mastery"], seconds: 100, text: "Different mantras carry different energies. So-Hum (I am that) is universal. Om Namah Shivaya is devotional. Choose what your heart agrees to. Then stay with it long enough for it to know you back." },
  ],
  practices: [
    { level: 0, title: "Three Aloud", durationMinutes: 4, type: "mantra", steps: ["Sit upright.", "Choose: 'So-Hum' (so on inhale, hum on exhale).", "Say it aloud, gently, 3 minutes.", "Then sit in the silence afterward for 1 minute. The silence is part of the practice."] },
    { level: 1, title: "Whispered Round", durationMinutes: 7, type: "mantra", steps: ["Sit.", "Choose your mantra.", "Whisper it for 5 minutes — soft enough that only you hear.", "Notice how the breath naturally syncs.", "Close in 2 minutes of silence."] },
    { level: 2, title: "Mantra with Breath", durationMinutes: 9, type: "mantra", steps: ["Sit.", "Inhale: silently say 'So'.", "Exhale: silently say 'Hum'.", "Continue for 7 minutes.", "When attention drifts, return.", "Close in 2 minutes of silence."] },
    { level: 3, title: "108 Round (No Mala)", durationMinutes: 11, type: "mantra", steps: ["Sit.", "Mentally count: each mantra is one bead.", "Aim for 108 repetitions.", "If you lose count — guess and continue, no big deal.", "End in silence — 2 minutes."] },
    { level: 4, title: "Drop into the Heart", durationMinutes: 12, type: "mantra", steps: ["Sit.", "Begin mantra silently.", "After 3 minutes, 'place' the mantra in the heart center.", "Let it repeat itself there.", "Watch it — don't push it.", "Close in 3 minutes of silence."] },
    { level: 5, title: "Listening Japa", durationMinutes: 12, type: "mantra", steps: ["Sit.", "Don't say the mantra. Just *listen* for it as if it's already happening.", "When you notice it arising on its own, just keep listening.", "No effort.", "Rest as the listener."] },
  ],
  reflects: [
    { phases: ["Foundation"], prompt: "What changed in the mind by the end of the mantra?" },
    { phases: ["Practice"], prompt: "Did the mantra and the breath ever sync without effort?" },
    { phases: ["Integration"], prompt: "Where in your day could the mantra silently run as background?" },
    { phases: ["Mastery"], prompt: "Did the mantra ever begin repeating itself without you starting it?" },
  ],
  integrates: [
    { phases: ["Foundation"], cue: "Take 3 So-Hum breaths during a transition today." },
    { phases: ["Practice"], cue: "Run the mantra silently while waiting in one line today." },
    { phases: ["Integration"], cue: "Use the mantra as your anchor during one stressful moment." },
    { phases: ["Mastery"], cue: "Walk one short walk silently with the mantra running underneath." },
  ],
};
