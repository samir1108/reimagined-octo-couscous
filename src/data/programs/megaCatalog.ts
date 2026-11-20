/**
 * Mega Program Catalog — 300+ programs generated from compact specs.
 *
 * Each spec expands into a full 7-day ShowroomProgram with reading, practice
 * and reflection per day. Flagship handcrafted programs live elsewhere; this
 * file gives the catalog scale, topical breadth, and personalization surface.
 */
import type { ShowroomProgram, ShowroomDay } from "../showroomPrograms";

type Audience = NonNullable<ShowroomProgram["audience"]>;
type Category = ShowroomProgram["category"];

interface DaySpec {
  title: string;
  oneLine: string;
  teaching: string; // 2-4 sentences that get expanded to a full reading
  practiceName: string;
  practiceSteps: string; // multi-line, will be shown as-is
  reflection: string;
}

interface ProgramSpec {
  slug: string;
  title: string;
  subtitle: string;
  guru: string;
  guruRole: string;
  theme: string;
  color: string;
  category: Category;
  audience?: Audience;
  promise: string;
  days: DaySpec[]; // exactly 7
}

// ─── Shared color palettes per category ──────────────────────────────────────
const COLOR: Record<Category, string> = {
  decision: "from-amber-500/30 via-orange-500/20 to-rose-500/10",
  willpower: "from-red-500/30 via-orange-500/20 to-amber-500/10",
  love: "from-rose-500/30 via-pink-500/20 to-fuchsia-500/10",
  knowledge: "from-indigo-500/30 via-blue-500/20 to-sky-500/10",
  purpose: "from-emerald-500/30 via-teal-500/20 to-cyan-500/10",
  nervous: "from-teal-500/30 via-cyan-500/20 to-blue-500/10",
  art: "from-violet-500/30 via-purple-500/20 to-fuchsia-500/10",
  "self-inquiry": "from-slate-500/30 via-indigo-500/20 to-violet-500/10",
  attention: "from-sky-500/30 via-blue-500/20 to-indigo-500/10",
  shadow: "from-zinc-700/40 via-slate-700/25 to-neutral-800/10",
};

const THEME_EMOJI: Record<Category, string> = {
  decision: "🪈",
  willpower: "🔥",
  love: "🌸",
  knowledge: "📜",
  purpose: "🌱",
  nervous: "🌊",
  art: "🎨",
  "self-inquiry": "🪞",
  attention: "🎯",
  shadow: "🌑",
};

// ─── Reading expander ────────────────────────────────────────────────────────
function buildReading(programTitle: string, day: DaySpec, dayNumber: number): string {
  const opener = dayNumber === 1
    ? `Welcome to day one of *${programTitle}*. Everything this week is built on a single move — noticing what is already happening inside you before trying to change it.`
    : dayNumber === 7
      ? `This is day seven — the last stretch. By now you have felt the shape of this practice in your own life, not just read about it.`
      : `Day ${dayNumber} of *${programTitle}*. Today we build directly on what yesterday opened.`;

  return `${opener}\n\n${day.teaching}\n\nThe one-line you'll carry today: **${day.oneLine}**\n\nDon't try to make this profound. The whole point of a seven-day arc is that small, honest moves — done in a real body on a real Tuesday — outperform any amount of philosophy. Read the practice once, do it once, and let the rest of the day carry it for you.`;
}

// ─── Public expander ─────────────────────────────────────────────────────────
export function expandSpec(spec: ProgramSpec): ShowroomProgram {
  const days: ShowroomDay[] = spec.days.map((d, i) => ({
    day: i + 1,
    title: d.title,
    oneLine: d.oneLine,
    reading: buildReading(spec.title, d, i + 1),
    practice: {
      name: d.practiceName,
      durationMin: 3 + (i % 5),
      instructions: d.practiceSteps,
    },
    reflection: d.reflection,
  }));

  return {
    slug: spec.slug,
    title: spec.title,
    subtitle: spec.subtitle,
    guru: spec.guru,
    guruRole: spec.guruRole,
    theme: spec.theme || THEME_EMOJI[spec.category],
    color: spec.color || COLOR[spec.category],
    category: spec.category,
    audience: spec.audience,
    duration: "7 days",
    promise: spec.promise,
    days,
  };
}

// ─── Day-arc templates ───────────────────────────────────────────────────────
// Each template returns 7 DaySpec entries themed to a topic keyword.
// The topic string is woven in so each program feels specific.

type DayFactory = (topic: string) => DaySpec[];

const ARC_NERVOUS: DayFactory = (t) => [
  { title: "Notice", oneLine: `${t} lives in your body before it lives in your calendar.`, teaching: `Most people try to solve ${t} with better planning. It doesn't work because ${t} is a nervous-system state, not a scheduling problem. Today we locate where in the body it actually sits.`, practiceName: "Locate the Charge", practiceSteps: `1. Sit. Close your eyes.\n2. Name the situation of ${t} out loud in one sentence.\n3. Scan the body top to bottom. Where does the sensation live? Jaw? Chest? Belly?\n4. Rest attention there for 60 seconds. Don't fix it. Meet it.`, reflection: `Where does ${t} live in your body?` },
  { title: "Breathe", oneLine: `The exhale is the off-switch.`, teaching: `A long exhale down-regulates the vagus nerve faster than any thought can. Under ${t}, breath shortens. We reverse it deliberately.`, practiceName: "4-8 Breath", practiceSteps: `Inhale 4 counts through the nose.\nExhale 8 counts through slightly pursed lips.\nRepeat for 10 rounds.\nUse this in the first 90 seconds of any ${t} spike.`, reflection: `What does your breath do when ${t} arrives?` },
  { title: "Widen", oneLine: `You are not the state. You are what notices the state.`, teaching: `Under ${t}, awareness collapses onto the problem. The move today is to deliberately widen — feel the room, hear the far sound, feel the seat.`, practiceName: "Wide-Angle Attention", practiceSteps: `1. Close eyes. Hear the furthest sound you can.\n2. Feel the weight of your body on the chair.\n3. Feel the air on your skin.\n4. Now, from this wider place, look at ${t} again. It shrinks.`, reflection: `When you widen, does ${t} still feel the same size?` },
  { title: "Name", oneLine: `Naming a feeling drops its charge by half.`, teaching: `Neuroscience calls it affect labeling. Yogic traditions have known it forever. When you name ${t} precisely, the amygdala quiets.`, practiceName: "Precise Naming", practiceSteps: `1. Feel the current wave of ${t}.\n2. Ask: is it fear, grief, anger, shame, or overwhelm?\n3. Get more specific: is it fear of being seen, fear of failing, fear of being alone?\n4. Say the precise name out loud. Notice what changes.`, reflection: `What is the precise name — not the label — of what you've been calling ${t}?` },
  { title: "Discharge", oneLine: `Held energy must move or it becomes a symptom.`, teaching: `Under ${t}, the body prepared to run, fight, or freeze. If nothing happens physically, that energy calcifies. Discharge is not optional.`, practiceName: "Shake It Off", practiceSteps: `1. Stand up.\n2. Shake hands, arms, legs, whole body for 90 seconds. Loose.\n3. Then still. Feel the aliveness under the skin.\n4. Sit and notice how ${t} has changed.`, reflection: `What has your body been holding on your behalf?` },
  { title: "Anchor", oneLine: `You need one 30-second reset you can find in any room.`, teaching: `${t} is going to visit again. The question is whether you have an anchor you can find under pressure. Today we build yours.`, practiceName: "Build Your Anchor", practiceSteps: `1. Pick one physical gesture (hand on chest, thumb & finger together, feet firmly planted).\n2. Sit calmly and combine it with 3 slow breaths.\n3. Repeat 5 times so the pairing sets.\n4. Use it once today in real life.`, reflection: `What is your 30-second anchor going to be?` },
  { title: "Integrate", oneLine: `A practice you'll do at 3pm on a hard day is worth ten you'll never repeat.`, teaching: `Seven days in, the question isn't "was this deep?" but "is this repeatable?" Choose the smallest version that survives your worst day.`, practiceName: "Design Your Minimum", practiceSteps: `1. Of this week's practices, pick one that took under 3 minutes.\n2. Attach it to something you already do daily (morning coffee, closing laptop).\n3. Commit to 30 days of that pairing.\n4. Write it on paper. Put it where you'll see it.`, reflection: `Which one practice will you keep past this week?` },
];

const ARC_DECISION: DayFactory = (t) => [
  { title: "The Decider", oneLine: `A tired self cannot make a life-sized ${t} call.`, teaching: `Most bad ${t} decisions are not from bad thinking. They are from the wrong version of you doing the thinking — hungry, wired, or scared.`, practiceName: "Name The Decider", practiceSteps: `1. Bring your ${t} question to mind.\n2. Rate 1-10: sleep, hunger, emotional charge, time pressure.\n3. If any is under 5, the decision waits.\n4. Ask: what would a rested me see here that I can't?`, reflection: `What version of you has been making your recent ${t} decisions?` },
  { title: "Options", oneLine: `Bad decisions come from a bad list.`, teaching: `Under ${t}, the mind narrows to two options — usually A and NOT-A. There are almost always five. Today we widen the field before we choose.`, practiceName: "Five Doors", practiceSteps: `1. Write your ${t} question at the top of a page.\n2. List 5 possible responses, however unlikely.\n3. Add a 6th: "do nothing for 30 days."\n4. Sit with all six. Notice which two you'd been trapped between.`, reflection: `Which option had you not even considered?` },
  { title: "Pride Test", oneLine: `The right ${t} option is the one you'd be proud of even if it failed.`, teaching: `Outcome-based ${t} decisions are unanswerable — nobody knows the future. Character-based ones you can answer in 30 seconds.`, practiceName: "Pride Test", practiceSteps: `1. Take your top 2 options.\n2. For each: "If this fails completely, I'll still be proud I chose it because ____."\n3. If you can complete the sentence, it survives. If not, it's fear-driven.\n4. Notice which survives.`, reflection: `Which option would you be proud of even if it failed?` },
  { title: "Reversibility", oneLine: `One-way doors deserve more time than two-way doors.`, teaching: `Not all ${t} decisions are the same weight. Reversible ones want speed. Irreversible ones want silence and a slow week.`, practiceName: "Door Type", practiceSteps: `1. Ask: is this ${t} decision reversible in 6 months?\n2. If yes: give yourself 24 hours max and move.\n3. If no: give yourself at least a week, and rehearse both futures.\n4. Match your process to the door.`, reflection: `What kind of door is your ${t} question?` },
  { title: "Shadow Life", oneLine: `Every ${t} choice has a life you don't live. Look at it now, not later.`, teaching: `Regret comes from options never examined. Sketch the honest 5-year version of the road not taken — costs included.`, practiceName: "Shadow-Life Letter", practiceSteps: `1. Pick your leading option.\n2. Write 3 sentences describing your life 5 years from now on the OTHER path.\n3. Include both gains and costs. No romance.\n4. Notice: is the shadow life livable? Often the leading option loses its glow.`, reflection: `Can you live with the costs of the option you're leaning toward?` },
  { title: "Witness", oneLine: `${t} shrinks when watched.`, teaching: `From the witness — the awareness in which thinking happens — the ${t} decision looks smaller and quieter. Not because it's less real. Because you're less fused with it.`, practiceName: "Five Minutes Watching", practiceSteps: `1. Sit upright. Close eyes.\n2. Watch the breath for 5 minutes.\n3. When a ${t} thought arises, notice the one who noticed.\n4. Rest as the noticer, not the thinker.\n5. Ask again: what does the ${t} question look like from here?`, reflection: `From the witness, is the ${t} question the same size?` },
  { title: "Commit", oneLine: `A ${t} decision half-made costs more than any wrong choice.`, teaching: `Un-decided ${t} is a background tax on every hour. Today: decide, and grieve what you didn't pick.`, practiceName: "The Ceremony of Choosing", practiceSteps: `1. Say the choice out loud in one sentence.\n2. Name what you are letting go by choosing.\n3. Grieve it — one honest minute.\n4. Write the first small action you'll take before Friday.`, reflection: `Are you ready to close the ${t} question and pay for what you chose?` },
];

const ARC_WILLPOWER: DayFactory = (t) => [
  { title: "The Trigger", oneLine: `${t} always has a trigger. Find it before the fight.`, teaching: `Willpower loses to habit at the moment of trigger, not at the moment of action. Today we find the moment before the moment.`, practiceName: "Trace The Trigger", practiceSteps: `1. Recall the last time ${t} caught you.\n2. Rewind 60 seconds. What was happening?\n3. Feeling? Location? Time? Company?\n4. Name the pattern in one sentence.`, reflection: `What is the moment before your ${t} moment?` },
  { title: "The Cost", oneLine: `You feel the cost of ${t} tomorrow, not today. Move the receipt forward.`, teaching: `The mind discounts future pain. To rewire ${t}, make the future cost feel present.`, practiceName: "Tomorrow Letter", practiceSteps: `1. Write a 3-line letter from tomorrow-morning-you to right-now-you about the choice.\n2. Be specific: "I woke up feeling…"\n3. Read it aloud once.\n4. Keep it visible.`, reflection: `What does tomorrow-you wish today-you had done?` },
  { title: "The Substitute", oneLine: `You can't remove ${t}. You can only replace it.`, teaching: `The nervous system doesn't accept a vacuum. To break ${t}, install a smaller, cleaner ritual in the same slot.`, practiceName: "Design The Swap", practiceSteps: `1. Identify the exact time slot where ${t} lives.\n2. Design a 90-second replacement (breath, walk, tea, call).\n3. Set it in the same slot for 3 days.\n4. Track what happens.`, reflection: `What smaller, cleaner thing can live in ${t}'s slot?` },
  { title: "Environment", oneLine: `Willpower is expensive. Design is cheap.`, teaching: `You will not win the ${t} fight through discipline alone. Change the room, and you change the outcome.`, practiceName: "Change The Room", practiceSteps: `1. List 3 environmental triggers for ${t}.\n2. Change one physical thing today (move the item, add friction).\n3. Add one visible cue for the replacement.\n4. Notice how the fight softens.`, reflection: `Which piece of your environment is voting for ${t} every day?` },
  { title: "The Craving Wave", oneLine: `Cravings peak, then fall. Ride the wave — don't fight it.`, teaching: `Every craving is 90 seconds of intense body-mind. If you can meet it as sensation, not sin, it passes.`, practiceName: "Surf The Urge", practiceSteps: `1. When ${t} urges rise, set a 90-second timer.\n2. Feel the wave in the body without acting.\n3. Breathe long exhales.\n4. When the timer ends, decide fresh.`, reflection: `What happens if you meet the ${t} craving as weather, not command?` },
  { title: "The Team", oneLine: `${t} thrives in isolation.`, teaching: `Every long recovery has one thing in common: it was not solo. Even one honest witness rewires ${t} faster than any app.`, practiceName: "One True Text", practiceSteps: `1. Pick one person you trust.\n2. Send one honest sentence about ${t} today.\n3. Ask them to check in on Sunday.\n4. Reply honestly.`, reflection: `Who could know about your ${t} that currently doesn't?` },
  { title: "The Vow", oneLine: `A small kept vow rewires more than a big broken one.`, teaching: `On day seven you don't need heroism. You need a promise so small it survives your worst day.`, practiceName: "Minimum Vow", practiceSteps: `1. Write a single line: "For the next 30 days, I will…" — keep it 5 minutes or less.\n2. Read it aloud.\n3. Photograph it. Set as phone wallpaper.\n4. Begin today.`, reflection: `What is the smallest vow about ${t} you can actually keep?` },
];

const ARC_LOVE: DayFactory = (t) => [
  { title: "The Ache", oneLine: `${t} is not the problem. Unfelt ${t} is.`, teaching: `The heart doesn't want to be fixed. It wants to be felt. Today we sit with ${t} without running.`, practiceName: "Meet The Ache", practiceSteps: `1. Sit quietly. Hand on chest.\n2. Bring ${t} to mind.\n3. Feel the physical sensation, not the story.\n4. Say inside: "I'm here. You can be here too."`, reflection: `What in ${t} have you refused to feel?` },
  { title: "The Story", oneLine: `Under every hard feeling is a story that could be older than you.`, teaching: `${t} arrives dressed in today, but often it was tailored in childhood. Look for the outfit.`, practiceName: "Find The Origin", practiceSteps: `1. Ask: "When did I first feel exactly this?"\n2. Wait. Don't force it.\n3. When something arises, write one line about it.\n4. Notice the age of ${t}.`, reflection: `How old is the version of you who is feeling ${t} right now?` },
  { title: "Devotion", oneLine: `Love is not a feeling. It's a direction.`, teaching: `Bhakti traditions taught that ${t} matures when you point it at something larger than the person or the outcome. Today we point.`, practiceName: "Offer It Up", practiceSteps: `1. Sit. Hand on heart.\n2. Bring the person or situation of ${t} to mind.\n3. Whisper: "For your wellbeing, not mine."\n4. Repeat 21 times.`, reflection: `Where has your ${t} been pointing — at them, or at you?` },
  { title: "Boundary", oneLine: `The most loving thing is often the hardest sentence.`, teaching: `${t} without limits eats the lover. Today we practice the boundary that keeps the love clean.`, practiceName: "One Clean Sentence", practiceSteps: `1. Identify the ${t} situation where a limit is overdue.\n2. Write the sentence, no adjectives.\n3. Read it aloud to the mirror.\n4. Deliver it before Friday.`, reflection: `What boundary would make ${t} sustainable?` },
  { title: "Forgiveness", oneLine: `Forgiving isn't approving. It's putting down.`, teaching: `${t} carries residue. Today we practice the yogic move of *ksama* — release without excuse.`, practiceName: "Release Ritual", practiceSteps: `1. Sit. Bring the person or self to mind.\n2. Say: "I am not agreeing. I am putting this down."\n3. Physically open your hands.\n4. Breathe out longer than in.`, reflection: `What in ${t} are you ready — not obligated — to put down?` },
  { title: "Gratitude", oneLine: `The counter-loop to ${t}'s ache is not joy. It's gratitude.`, teaching: `Gratitude isn't performance. It's a specific act: naming three things you'd miss.`, practiceName: "Three Absences", practiceSteps: `1. Name three things in your life that, if gone tomorrow, you would grieve.\n2. Name them out loud.\n3. Feel the pull of them, not the concept.\n4. Rest there.`, reflection: `What in your life would you grieve if it disappeared tonight?` },
  { title: "Return", oneLine: `You don't leave ${t}. You return to yourself through it.`, teaching: `Day seven: ${t} is still here. What's changed is who is holding it. That's the whole point.`, practiceName: "Signature Prayer", practiceSteps: `1. Write a 3-line prayer about ${t}.\n2. Read it aloud.\n3. Say it once each morning for 30 days.\n4. Notice what changes in you, not in the situation.`, reflection: `What is the 3-line prayer of ${t} you'll carry?` },
];

const ARC_ATTENTION: DayFactory = (t) => [
  { title: "The Steal", oneLine: `Your attention on ${t} is being stolen in patterns you don't see.`, teaching: `First we map. You cannot recover attention you haven't yet observed leaking.`, practiceName: "Attention Audit", practiceSteps: `1. For one waking hour, log every device pickup.\n2. Beside each, write: cue, duration, aftermath.\n3. Look for the pattern that surprises you.\n4. Name the biggest leak in one word.`, reflection: `Where does your attention on ${t} go when you're not looking?` },
  { title: "One Thing", oneLine: `Multitasking is a fiction the brain is bad at.`, teaching: `${t} improves when you cut attention-splitting for a single working hour.`, practiceName: "One-Tab Hour", practiceSteps: `1. Pick one 60-minute block today.\n2. One tab. One task. Phone in another room.\n3. When distraction rises, note it on paper, return.\n4. End: notice quality difference.`, reflection: `What is possible in an hour you have never actually given ${t}?` },
  { title: "Breath As Anchor", oneLine: `The breath is the shortest way home.`, teaching: `Every meditation tradition returns to breath because attention lives in the body first.`, practiceName: "10 Breaths", practiceSteps: `1. Sit or stand.\n2. Count 10 breaths in and out, only.\n3. Lose count? Restart. No punishment.\n4. Use before every ${t} session for the rest of the week.`, reflection: `How often did you truly restart today, without judgment?` },
  { title: "Boredom", oneLine: `The other side of ${t}'s discipline is boredom you refused to feel.`, teaching: `Distraction is not weakness. It is fleeing boredom. Today we sit with it.`, practiceName: "Sit With Nothing", practiceSteps: `1. Sit for 5 minutes with no input. No music. No phone.\n2. Watch what the mind does at minute 2 and 4.\n3. Do not resolve. Notice.\n4. Return to ${t} refreshed.`, reflection: `What does your mind offer at minute 3 of nothing?` },
  { title: "Fatigue", oneLine: `Attention fails as the body fails.`, teaching: `${t} isn't a moral question after a bad night. It's a physiology question. Sleep is the practice.`, practiceName: "Sleep Contract", practiceSteps: `1. Choose a lights-out time you can hold 5 nights in a row.\n2. 60 minutes before: no work, no fast content.\n3. 30 minutes before: dim lights.\n4. Track it. Sleep is training.`, reflection: `What's your current attention ceiling — and what sleep is it built on?` },
  { title: "Environment", oneLine: `Your desk votes for ${t} or against it.`, teaching: `Small physical changes save more attention than any app.`, practiceName: "Design The Field", practiceSteps: `1. Clear one surface entirely.\n2. Put one object of intent on it (book, note, image).\n3. Remove one visible distraction.\n4. Work from this field tomorrow morning.`, reflection: `What does your workspace say your priority actually is?` },
  { title: "Stop", oneLine: `Attention returns when you stop before you're exhausted.`, teaching: `The last teaching for ${t}: leave 10% in the tank. That reserve is what compounds.`, practiceName: "Stop At 90%", practiceSteps: `1. In your next work block, set a timer for 25 minutes.\n2. Stop when it rings, even if you're mid-sentence.\n3. Walk for 5 minutes.\n4. Return with fuller attention.`, reflection: `Where in life have you been going to zero when 90% would have been enough?` },
];

const ARC_SELF_INQUIRY: DayFactory = (t) => [
  { title: "The Question", oneLine: `${t} begins with a question you actually can't answer yet.`, teaching: `Ramana taught that all inquiry is one question: Who is having this experience? Today we borrow it.`, practiceName: "Who Am I", practiceSteps: `1. Sit upright, eyes closed.\n2. Ask silently: "Who is thinking about ${t}?"\n3. Don't answer. Watch what happens.\n4. Repeat for 5 minutes.`, reflection: `Who is the one who's been carrying ${t}?` },
  { title: "Neti Neti", oneLine: `You are not what you can watch.`, teaching: `The Upanishadic move: not this, not this. Whatever you can observe in ${t}, you are not.`, practiceName: "Not This", practiceSteps: `1. Sit. Watch a thought arise about ${t}.\n2. Say inside: "This thought is happening. I am not this thought."\n3. Repeat for feelings, sensations.\n4. Rest in what is left.`, reflection: `What is left when you subtract every ${t}-thing you are not?` },
  { title: "The Layers", oneLine: `Under ${t} is a role. Under the role is a person. Under the person is silence.`, teaching: `The onion of the self. Today we peel one layer, slowly.`, practiceName: "Layer Descent", practiceSteps: `1. Name one role you play in ${t} (employee, parent, seeker).\n2. Ask: who was I before this role?\n3. Sit with the answer.\n4. Ask again: who is aware of that?`, reflection: `What's under the top layer of ${t}?` },
  { title: "Silence", oneLine: `Silence is not absence. It is the material behind ${t}.`, teaching: `Even a noisy day has silence between thoughts. Today we notice it.`, practiceName: "Gap Attention", practiceSteps: `1. Sit. Watch thoughts about ${t} arise and fall.\n2. Between two thoughts, notice the gap.\n3. Rest in the gap for as long as it holds.\n4. Don't manufacture it. Just meet it.`, reflection: `Did you find any gap at all today?` },
  { title: "The Witness", oneLine: `The one who watches ${t} is not caught by it.`, teaching: `Sakshi bhava — witness-being. Not analytic distance. Presence.`, practiceName: "Witness Rest", practiceSteps: `1. Sit. Notice the noticer.\n2. Rest as awareness itself, not as content.\n3. When you get pulled into ${t}, gently notice, return.\n4. Stay 5 minutes.`, reflection: `From the witness, does ${t} still feel like you?` },
  { title: "The Return", oneLine: `Inquiry ends where daily life begins.`, teaching: `You don't stay in the cave. You come back and act. But you come back changed.`, practiceName: "One Action From Silence", practiceSteps: `1. From witness-rest, ask: what is the next right action on ${t}?\n2. Wait for the answer that arrives without argument.\n3. Do it before dark.\n4. Notice how it felt different.`, reflection: `What did today's action want that yesterday's wouldn't have?` },
  { title: "Stabilize", oneLine: `Realization without habit is a memory.`, teaching: `On day seven, ${t} has a new relationship to you. To keep it, install a daily 10-minute inquiry slot.`, practiceName: "10-Minute Slot", practiceSteps: `1. Pick a time you can hold daily.\n2. Same seat, same length.\n3. Return to "Who is aware?" each session.\n4. 30 days minimum.`, reflection: `Where in your day will the inquiry sit?` },
];

const ARC_SHADOW: DayFactory = (t) => [
  { title: "The Mask", oneLine: `${t} hides in the parts of you no one is allowed to see.`, teaching: `Shadow work begins with admission: there is a part of me that behaves differently in ${t} than my public self allows.`, practiceName: "The Mask Off", practiceSteps: `1. Take 5 minutes alone.\n2. Say aloud: "In ${t}, part of me feels ____ and I don't say it."\n3. Fill in the blank three times.\n4. Do not fix. Notice.`, reflection: `What have you been performing around ${t}?` },
  { title: "Projection", oneLine: `The trait you hate most in others is often the trait you refuse in yourself.`, teaching: `Jung's insight applied to ${t}: who around you carries the version of you you disowned?`, practiceName: "The Mirror Person", practiceSteps: `1. Name a person who irritates you around ${t}.\n2. Name the specific trait.\n3. Ask honestly: where do I do a subtle version of that?\n4. Sit with the mirror.`, reflection: `Who is the mirror in your ${t} life?` },
  { title: "The Child", oneLine: `Every shadow was a child protecting itself.`, teaching: `Under ${t}'s hardest edges is usually a younger version of you that once needed exactly this defense.`, practiceName: "Meet The Child", practiceSteps: `1. Bring the sharpest edge of ${t} to mind.\n2. Ask: at what age did this first appear?\n3. Speak to that child version silently. "You did well."\n4. Sit with them 3 minutes.`, reflection: `How old is the ${t} in you?` },
  { title: "The Gift", oneLine: `Every shadow carries a gift the light-side self can't reach.`, teaching: `Anger has honesty. Envy has direction. Fear has protection. Today we ask what ${t}'s shadow is trying to give.`, practiceName: "The Shadow Gift", practiceSteps: `1. Name your ${t}'s shadow one word (anger, envy, fear, shame).\n2. Ask: what is it trying to protect or point at?\n3. Write the answer in one line.\n4. Say thank you before you release it.`, reflection: `What gift has ${t}'s shadow been carrying for you?` },
  { title: "The Confession", oneLine: `A shadow spoken to one person loses half its weight.`, teaching: `Not therapy. Not group. Just one person who knows the ${t} version of you.`, practiceName: "One Confession", practiceSteps: `1. Choose one safe person.\n2. Share one sentence about ${t} you've never spoken.\n3. Do not defend it. Just say it.\n4. Notice what shifts.`, reflection: `What ${t}-sentence has been waiting to be said?` },
  { title: "Reintegration", oneLine: `The exiled part comes home not to rule, but to belong.`, teaching: `${t}'s shadow doesn't want to take over. It wants a chair at the table.`, practiceName: "Council Of Selves", practiceSteps: `1. Imagine a table with all your parts around it — the seeker, the achiever, the shadow of ${t}.\n2. Give each a chair.\n3. Ask the shadow: what do you want us to remember?\n4. Thank it.`, reflection: `What would change if ${t}'s shadow had a chair, not a cage?` },
  { title: "Integration Rule", oneLine: `Shadow work isn't a weekend. It's a decade.`, teaching: `Day seven builds a rule so ${t}'s shadow gets checked-in with, not banished.`, practiceName: "Monthly Check", practiceSteps: `1. On the first Sunday of every month, sit for 10 minutes.\n2. Ask: what is ${t}'s shadow doing right now?\n3. Listen. Do not fix.\n4. Write one line and file it.`, reflection: `What is the monthly meeting you owe your own shadow?` },
];

const ARC_PURPOSE: DayFactory = (t) => [
  { title: "The Ache Beneath", oneLine: `${t} shows up as ambition. Under it is a longing.`, teaching: `Career questions look strategic. They rarely are. Under ${t} is usually a longing to matter to a specific someone or something.`, practiceName: "Locate The Longing", practiceSteps: `1. Sit quietly.\n2. Ask: "If ${t} weren't about success, it would be about ____."\n3. Fill in three times.\n4. Notice which one loosens something in the chest.`, reflection: `What is ${t} really longing for?` },
  { title: "Svadharma", oneLine: `Better your own ${t}, done badly, than another's done well.`, teaching: `Krishna to Arjuna. The lane you're actually built for is often narrower than the one that impresses others.`, practiceName: "The Time-Disappears Test", practiceSteps: `1. Recall three moments in the last 6 months when time disappeared.\n2. Write one line each.\n3. Find the common quality across all three.\n4. Ask: how much of your week is that quality?`, reflection: `What quality does your best time in ${t} actually share?` },
  { title: "Approval", oneLine: `Half of ${t} is performing for someone who isn't in the room anymore.`, teaching: `Purpose is often diluted by ghost audiences — the parent, the ex-teacher, the childhood friend.`, practiceName: "Name The Audience", practiceSteps: `1. Ask: who am I secretly hoping notices my ${t}?\n2. Write the three names.\n3. Ask: what would I do differently without them watching?\n4. Do one of those things this week.`, reflection: `Who is the ghost audience for your ${t}?` },
  { title: "Contribution", oneLine: `The clearest ${t} is one where the work helps someone specific.`, teaching: `Vague purpose ("change the world") saps energy. Specific contribution ("this problem, for this person") fuels it.`, practiceName: "The One Person", practiceSteps: `1. Name one specific person your ${t} could help.\n2. Write what they need.\n3. Ask: is my week aligned to that need?\n4. Adjust one thing tomorrow.`, reflection: `Who exactly is on the other end of your ${t}?` },
  { title: "The Cost", oneLine: `Every purpose worth choosing has a price.`, teaching: `${t} isn't found by asking what you want. It's found by asking what you'll gladly pay for.`, practiceName: "Cost Inventory", practiceSteps: `1. List 3 things ${t} will cost you (time, money, ease, applause).\n2. For each: am I willing?\n3. If any is no, purpose is misidentified.\n4. Adjust.`, reflection: `What price is ${t} asking that you haven't yet agreed to?` },
  { title: "Small Move", oneLine: `Purpose is proven with the smallest next move, not the biggest vision.`, teaching: `Dreamers make plans. Practitioners make moves. Today we move.`, practiceName: "The 24-Hour Move", practiceSteps: `1. Pick one action related to ${t} that takes under 30 minutes.\n2. Commit to doing it in 24 hours.\n3. Tell one person.\n4. Do it. Report back.`, reflection: `What did the small move reveal that thinking couldn't?` },
  { title: "The Vow", oneLine: `Purpose becomes real when you can name what you will not do.`, teaching: `Definition by refusal. On day seven, name the ${t} paths you'll say no to for the next 90 days.`, practiceName: "The Refusal", practiceSteps: `1. Write three ${t} paths you could pursue but won't for the next 90 days.\n2. Say each aloud.\n3. Photograph the list.\n4. Reread weekly.`, reflection: `What are you now willing to say no to?` },
];

const ARC_KNOWLEDGE: DayFactory = (t) => [
  { title: "The Frame", oneLine: `${t} sits inside a frame that shapes what you can see.`, teaching: `Before learning, we notice the container. What are the invisible assumptions you bring to ${t}?`, practiceName: "Map The Frame", practiceSteps: `1. Write your top 3 assumptions about ${t}.\n2. For each, ask: what if the opposite were partly true?\n3. Note where you feel resistance.\n4. Sit with the resistance.`, reflection: `What frame have you been reading ${t} through?` },
  { title: "The Source", oneLine: `Most of what you know about ${t} came from someone. Do you trust the chain?`, teaching: `Knowledge inherits authority. Trace one belief in ${t} back to its origin.`, practiceName: "Trace The Chain", practiceSteps: `1. Pick one strong belief about ${t}.\n2. Ask: who first taught me this?\n3. Ask: what did they get right, and what did they inherit uncritically?\n4. Rewrite the belief in your own words.`, reflection: `Whose ${t} beliefs have you been living inside?` },
  { title: "First Principles", oneLine: `${t} strips down to a few base truths. Find yours.`, teaching: `Under every complex domain are 3 principles. Today we hunt them.`, practiceName: "Three Principles", practiceSteps: `1. Write 3 sentences that must be true for ${t} to be understood.\n2. Test each: can you defend it without appealing to authority?\n3. Keep the ones that survive.\n4. Build from there.`, reflection: `What are your three base truths for ${t}?` },
  { title: "The Question", oneLine: `A field advances by better questions, not better answers.`, teaching: `${t} has questions no one is asking. Yours might be one of them.`, practiceName: "The Unasked Question", practiceSteps: `1. List 5 questions people ask about ${t}.\n2. Now write one question no one you know is asking.\n3. Sit with it.\n4. Spend a week looking through that question.`, reflection: `What is your unasked ${t} question?` },
  { title: "Contradictions", oneLine: `The deepest ${t} lives at the seam of two things that shouldn't both be true.`, teaching: `Truth isn't neat. Growth is at the contradiction.`, practiceName: "Find The Seam", practiceSteps: `1. Name two ${t} things you believe that seem to contradict.\n2. Do not resolve them.\n3. Sit at the seam for 10 minutes.\n4. Ask: what is possible only if both are true?`, reflection: `What contradiction inside ${t} won't leave you alone?` },
  { title: "The Teacher", oneLine: `${t} is transmitted, not just learned.`, teaching: `Books give scaffolding. Teachers give correction. Today we ask who your ${t}-teacher actually is.`, practiceName: "Identify The Line", practiceSteps: `1. Name your three most-trusted sources on ${t}.\n2. For each, name what they can and cannot teach.\n3. Identify the gap.\n4. Seek one new source for the gap this month.`, reflection: `Where is the gap in your ${t}-lineage?` },
  { title: "Living It", oneLine: `Knowledge lands in the body, or it never lands at all.`, teaching: `Day seven: pick one insight from ${t} and turn it into a weekly behavior.`, practiceName: "One Weekly Ritual", practiceSteps: `1. From this week, choose your strongest ${t} insight.\n2. Design a weekly 15-minute ritual around it.\n3. Same day, same time.\n4. Track for 4 weeks.`, reflection: `Which one insight will you now live, not just know?` },
];

const ARC_ART: DayFactory = (t) => [
  { title: "The Blank Page", oneLine: `The block in ${t} is a block on being seen.`, teaching: `Every creative freeze is really a fear-of-witness. Naming it dissolves half.`, practiceName: "Two Ugly Pages", practiceSteps: `1. Set a 10-minute timer.\n2. Make two intentionally bad pages of ${t}.\n3. Do not fix. Do not delete.\n4. Notice: the ceiling was internal.`, reflection: `Who were you afraid to be seen by inside ${t}?` },
  { title: "Ritual", oneLine: `Creativity needs a container, not more inspiration.`, teaching: `The pros in ${t} don't wait for the mood. They show up in the same room, at the same hour, empty.`, practiceName: "Design The Container", practiceSteps: `1. Pick a 45-minute slot 4 days a week.\n2. Same seat, same light, same drink.\n3. Show up empty.\n4. Do not judge output for 30 days.`, reflection: `What is your ${t} container going to look like?` },
  { title: "Constraints", oneLine: `A too-open ${t} paralyzes. Constraint frees.`, teaching: `Add limits to unlock the work.`, practiceName: "Three Limits", practiceSteps: `1. Pick three constraints for tomorrow's ${t} session (word count, palette, time, one instrument).\n2. Write them down.\n3. Work inside them.\n4. Notice the release.`, reflection: `What limits have you been refusing that would set your ${t} free?` },
  { title: "Steal", oneLine: `Originality is a downstream effect of loving what you copy.`, teaching: `${t} matures by conscious imitation, then divergence.`, practiceName: "Deliberate Copy", practiceSteps: `1. Pick one piece of ${t} you love.\n2. Copy it, honestly.\n3. Then change one variable.\n4. Notice what emerges.`, reflection: `What are you imitating unconsciously that you could imitate consciously?` },
  { title: "Ship", oneLine: `${t} that isn't shown, dies.`, teaching: `The final 5% of a creative act is release. Withhold it and everything before is wasted.`, practiceName: "The Small Ship", practiceSteps: `1. Pick one ${t} thing 80% done.\n2. Ship it today. Small audience is fine.\n3. Do not polish more.\n4. Note how the body feels post-release.`, reflection: `What have you been almost-done with for too long in ${t}?` },
  { title: "The Critic", oneLine: `The inner critic is not you. It's an old employee you never fired.`, teaching: `Name the critic. Give it a task. Let it work when useful, not always.`, practiceName: "Name The Critic", practiceSteps: `1. Give your ${t} inner critic a name.\n2. Assign it a role (edit phase only).\n3. Politely bar it from draft phase.\n4. Reinforce daily.`, reflection: `What is your critic's name — and job description — going to be?` },
  { title: "Play", oneLine: `${t} that stops being play stops being ${t}.`, teaching: `Day seven: return to why you started, before the metrics arrived.`, practiceName: "Return To Play", practiceSteps: `1. Recall the earliest joy ${t} gave you.\n2. Do a 20-minute session in that spirit today.\n3. No goal. No audience.\n4. Notice.`, reflection: `Where did the play in your ${t} go — and how do you invite it back?` },
];

const ARCS: Record<Category, DayFactory> = {
  decision: ARC_DECISION,
  willpower: ARC_WILLPOWER,
  love: ARC_LOVE,
  knowledge: ARC_KNOWLEDGE,
  purpose: ARC_PURPOSE,
  nervous: ARC_NERVOUS,
  art: ARC_ART,
  "self-inquiry": ARC_SELF_INQUIRY,
  attention: ARC_ATTENTION,
  shadow: ARC_SHADOW,
};

// ─── Compact program table ───────────────────────────────────────────────────
interface Row {
  slug: string;
  title: string;
  topic: string; // woven into readings
  subtitle: string;
  guru: string;
  guruRole: string;
  category: Category;
  audience?: Audience;
  promise: string;
}

const R = (
  slug: string,
  title: string,
  topic: string,
  subtitle: string,
  guru: string,
  guruRole: string,
  category: Category,
  promise: string,
  audience?: Audience,
): Row => ({ slug, title, topic, subtitle, guru, guruRole, category, audience, promise });

// Reusable guru roles
const GR = {
  krishna: "the charioteer who taught how to act under fire",
  patanjali: "the codifier of yoga's eight-limb path",
  ramana: "the sage of self-inquiry — 'Who am I?'",
  buddha: "the awakened one who mapped the end of suffering",
  laotzu: "the old master of yielding and flow",
  dogen: "the zen master of stillness and everyday practice",
  meera: "the devotee whose only weapon was love",
  chanakya: "the strategist of dharma in power",
  vyasa: "the compiler of India's memory",
  shiva: "the destroyer who dances the world into form",
  saraswati: "the goddess of knowledge and speech",
  kali: "the fierce mother who ends what needs to end",
  hanuman: "the servant whose devotion made him unbreakable",
  arjuna: "the archer who had to fight without hate",
  yajnavalkya: "the Upanishadic sage of neti-neti",
  dattatreya: "the wanderer with twenty-four teachers",
  ashtavakra: "the teacher of instant recognition",
  rumi: "the poet of longing turned worship",
  kabir: "the weaver who saw through every temple wall",
  nanak: "the guru who saw one thread through all",
  therese: "the little saint of small ways",
  jesus: "the teacher of enemies as neighbors",
  yogananda: "the yogi who brought kriya to the modern city",
  tulsidas: "the poet of Ram, the honest man",
  vivekananda: "the monk who taught strength as spirituality",
  aurobindo: "the seer of integral evolution",
  ramakrishna: "the priest for whom every path led to the same door",
  vasistha: "the teacher of Rama in the yoga of awakening",
  nagarjuna: "the philosopher of emptiness",
  padmasambhava: "the tantric who tamed the fierce",
};

// 300+ ROWS
const ROWS: Row[] = [
  // ─── Anxiety / Nervous System (25) ────────────────────────────────────────
  R("calm-the-panic","Calm the Panic","panic","Seven days to meet panic in the body before it runs the day.","Patanjali",GR.patanjali,"nervous","A repeatable 90-second reset for the first minute of a panic wave."),
  R("stop-the-racing-mind","Stop the Racing Mind","racing thought","Untangle the 2 a.m. brain.","Ramana",GR.ramana,"nervous","One nightly protocol to slow racing thoughts within 5 minutes."),
  R("sunday-scaries","Sunday Scaries","the Sunday dread","The week doesn't have to start already lost.","Krishna",GR.krishna,"nervous","A Sunday ritual that separates rest from performance dread."),
  R("public-speaking-nerves","Public Speaking Nerves","stage fear","Speak from breath, not adrenaline.","Saraswati",GR.saraswati,"nervous","A pre-talk regulation sequence you can run in a bathroom."),
  R("interview-calm","Interview Calm","interview pressure","Walk in as a person, not a performance.","Chanakya",GR.chanakya,"nervous","A 10-minute pre-interview reset ritual."),
  R("morning-anxiety","Morning Anxiety","dawn dread","The 6 a.m. dread has a shape. Learn it.","Patanjali",GR.patanjali,"nervous","A morning protocol that starts the day in parasympathetic."),
  R("chronic-worry","Chronic Worry","worry loops","Worry is a habit of attention, not a fact.","Yajnavalkya",GR.yajnavalkya,"nervous","A witness practice that dissolves 70% of daily worry."),
  R("phone-anxiety","Phone Anxiety","screen dread","The notification dread has a body signal. Read it.","Buddha",GR.buddha,"nervous","A phone-relationship reset in 7 days."),
  R("health-anxiety","Health Anxiety","body-fear","When every symptom feels final.","Yogananda",GR.yogananda,"nervous","A daily body-check that isn't a spiral."),
  R("social-anxiety","Social Anxiety","being-seen fear","The room is not a jury.","Meera",GR.meera,"nervous","A pre-social 3-minute grounding you can do in the elevator."),
  R("driving-anxiety","Driving Anxiety","driving fear","The car is not the danger. The body's memory is.","Hanuman",GR.hanuman,"nervous","A pre-drive regulation and in-drive anchor."),
  R("flight-fear","Flight Fear","flying fear","The plane is fine. Your nervous system disagrees.","Dogen",GR.dogen,"nervous","A takeoff-and-turbulence protocol."),
  R("hospital-visits","Hospital Anxiety","hospital dread","The white coats trigger something older.","Jesus",GR.jesus,"nervous","A pre-appointment regulation sequence."),
  R("financial-anxiety","Financial Anxiety","money fear","The number in the account is not your worth.","Chanakya",GR.chanakya,"nervous","A weekly money-check that doesn't spiral."),
  R("election-doomscroll","Political Anxiety","political dread","The news cycle is a nervous-system attack.","Buddha",GR.buddha,"nervous","A media diet that keeps you informed and regulated."),
  R("commute-decompress","Commute Decompression","commute stress","The commute is either transition or contamination.","Krishna",GR.krishna,"nervous","A daily commute-into-home ritual."),
  R("email-inbox-panic","Email Inbox Panic","inbox dread","The inbox is not an emergency, though it feels like one.","Patanjali",GR.patanjali,"nervous","A morning inbox protocol that reduces cortisol."),
  R("family-visit-nerves","Family Visit Nerves","family regression","You regress to age 12 the moment you cross the threshold.","Vyasa",GR.vyasa,"nervous","A pre-visit and mid-visit reset."),
  R("mid-meeting-freeze","Mid-Meeting Freeze","freeze response","The meeting freeze is not weakness. It's physiology.","Arjuna",GR.arjuna,"nervous","A silent under-the-table reset."),
  R("noise-sensitivity","Noise Sensitivity","overstimulation","The world is too loud. Your body knows.","Ramana",GR.ramana,"nervous","A daily sensory-repair protocol."),
  R("chronic-clenching","Chronic Clenching","jaw and shoulder tension","Your body has been braced for months.","Padmasambhava",GR.padmasambhava,"nervous","A daily 10-minute release sequence."),
  R("insomnia-4am","4 a.m. Wake-Up","insomnia","You wake at 4. This has a name and an answer.","Dogen",GR.dogen,"nervous","A wake-in-the-night protocol that returns you to sleep."),
  R("nightmare-recovery","Nightmare Recovery","night terror","Dreams don't need to hijack the whole day.","Padmasambhava",GR.padmasambhava,"nervous","A morning-after-nightmare reset."),
  R("hypervigilance","Hypervigilance","always-scanning","You've been watching for danger since you were a child.","Kali",GR.kali,"nervous","A safety-anchor practice that lets the scanner rest."),
  R("post-argument-shake","Post-Argument Recovery","argument residue","The fight ended 3 hours ago. Your body doesn't know.","Meera",GR.meera,"nervous","A discharge ritual that ends the fight in the body too."),

  // ─── Focus / Attention (25) ───────────────────────────────────────────────
  R("deep-work-hour","Deep Work Hour","deep work","One protected hour changes a career.","Dogen",GR.dogen,"attention","A 60-minute deep-work session you can run daily."),
  R("phone-fasting","Phone Fasting","phone addiction","The device is not the enemy. The compulsion is.","Buddha",GR.buddha,"attention","A 7-day graduated phone fast."),
  R("study-focus-exams","Study Focus for Exams","exam prep","Studying is a physiology, not a personality.","Saraswati",GR.saraswati,"attention","A daily study block that beats 3 unfocused hours."),
  R("reading-recovery","Reading Recovery","reading attention","The mind that could once read for hours can again.","Vyasa",GR.vyasa,"attention","A 30-day reading-repair protocol."),
  R("adhd-morning","ADHD Morning","adhd start","The first hour decides the day.","Krishna",GR.krishna,"attention","A structured morning that survives an ADHD brain."),
  R("meeting-attention","Meeting Attention","meeting drift","Presence is the only real listening.","Arjuna",GR.arjuna,"attention","A pre-meeting anchor and mid-meeting return."),
  R("writing-focus","Writing Focus","writing attention","The blank page waits patiently.","Saraswati",GR.saraswati,"attention","A daily writing hour you can defend."),
  R("code-flow","Code Flow","coding attention","Flow is entered, not summoned.","Chanakya",GR.chanakya,"attention","A pre-code ritual that shortens ramp-up time."),
  R("study-athlete","Student-Athlete Focus","dual-role attention","Two lives, one nervous system.","Hanuman",GR.hanuman,"attention","A schedule that respects both without collapse.", "students"),
  R("boredom-tolerance","Boredom Tolerance","boredom","The other side of focus is willingness to feel bored.","Buddha",GR.buddha,"attention","A boredom-training arc that transforms restlessness."),
  R("digital-minimalism","Digital Minimalism","digital clutter","Fewer inputs, deeper output.","Laotzu",GR.laotzu,"attention","A 7-day digital declutter."),
  R("email-batching","Email Batching","email dispersion","Email is not conversation. Stop treating it as such.","Chanakya",GR.chanakya,"attention","A batching protocol that recovers 2 hours daily."),
  R("morning-priorities","Morning Priorities","priority chaos","Your day was decided by 9 a.m.","Krishna",GR.krishna,"attention","A 10-minute priority ritual before the world starts asking."),
  R("evening-review","Evening Review","day-end drift","The unreviewed day teaches nothing.","Dogen",GR.dogen,"attention","A 5-minute review that compounds across a year."),
  R("notification-audit","Notification Audit","notification noise","You have never truly chosen these interruptions.","Patanjali",GR.patanjali,"attention","A phone-configured protocol that cuts noise 80%."),
  R("open-loops","Close Open Loops","open loops","Open loops eat more energy than closed problems.","Chanakya",GR.chanakya,"attention","A weekly loop-closing ritual."),
  R("study-marathon","Study Marathon Prep","exam week","One week left. Now what.","Saraswati",GR.saraswati,"attention","A week-of-exam protocol.", "students"),
  R("post-lunch-slump","Post-Lunch Slump","2 p.m. slump","The 2 p.m. slump is real. So is the reset.","Dogen",GR.dogen,"attention","A 5-minute physical protocol that recovers the afternoon."),
  R("commute-reading","Commute Reading","commute time","20 minutes twice a day is 4 books a year.","Vyasa",GR.vyasa,"attention","A commute reading ritual you'll keep."),
  R("music-for-work","Music For Deep Work","sound environment","Music can serve focus or steal it.","Saraswati",GR.saraswati,"attention","A sound-design guide for different work states."),
  R("no-phone-mornings","No-Phone Mornings","screen-first mornings","The first hour is yours or it's already gone.","Buddha",GR.buddha,"attention","A no-phone-until-9 protocol."),
  R("attention-restoration","Attention Restoration","depleted attention","Attention refills only in specific conditions.","Ramana",GR.ramana,"attention","A daily restoration practice."),
  R("single-tab-hour","Single-Tab Hour","tab explosion","57 tabs is not a workflow. It's a symptom.","Chanakya",GR.chanakya,"attention","A single-tab discipline for one daily hour."),
  R("procrastination-crack","Cracking Procrastination","procrastination","Procrastination is fear wearing a productivity mask.","Krishna",GR.krishna,"attention","A trigger-to-action protocol."),
  R("study-group-focus","Study Group Focus","group work","Group study can lift or drown attention.","Saraswati",GR.saraswati,"attention","A structure for study groups that actually work.", "students"),

  // ─── Grief / Loss (15) ────────────────────────────────────────────────────
  R("first-week-grief","First Week of Grief","fresh grief","No answers. Only company.","Meera",GR.meera,"love","A companion for the first 7 days after loss.", "grief"),
  R("grief-anniversary","Grief Anniversary","grief anniversary","The date remembers even when you try to forget.","Rumi",GR.rumi,"love","A ritual for the anniversary.", "grief"),
  R("miscarriage","After Miscarriage","miscarriage","A grief the world doesn't know how to hold.","Meera",GR.meera,"love","A 7-day quiet companion.", "grief"),
  R("pet-loss","Losing a Pet","pet grief","The love was real. So is the loss.","Therese",GR.therese,"love","A ritual for the empty leash.", "grief"),
  R("parent-loss","Losing a Parent","parent grief","You are no one's child in the same way anymore.","Vyasa",GR.vyasa,"love","A structured 7 days for the first weeks.", "grief"),
  R("sibling-loss","Losing a Sibling","sibling grief","The one who knew you first is gone.","Arjuna",GR.arjuna,"love","A 7-day companion for a rarely-named grief.", "grief"),
  R("child-loss","Losing a Child","child grief","No practice will fix this. Some will help you breathe.","Kali",GR.kali,"love","Not a cure. A hand.", "grief"),
  R("divorce-first-month","Divorce, First Month","divorce","The house is still full of them.","Meera",GR.meera,"love","A structured month-one companion."),
  R("breakup-recovery","Breakup Recovery","breakup","The love was real even if it ended.","Rumi",GR.rumi,"love","A 7-day nervous-system and heart reset."),
  R("friendship-loss","Losing a Friendship","friendship end","No funeral, but real grief.","Meera",GR.meera,"love","A ritual for an ungrieved goodbye."),
  R("estranged-parent","The Estranged Parent","estrangement","The relationship you don't have is also a relationship.","Vyasa",GR.vyasa,"love","A weekly practice for chronic parent-grief."),
  R("empty-nest","Empty Nest","empty nest","The role you built your life around has left.","Meera",GR.meera,"love","A 7-day identity-recovery arc.", "parents"),
  R("retirement-grief","Retirement Grief","retirement","The job was more than a job. So is its absence.","Chanakya",GR.chanakya,"purpose","A structure for the first weeks of retirement."),
  R("illness-diagnosis","After a Hard Diagnosis","diagnosis","The word changed everything and nothing.","Yogananda",GR.yogananda,"self-inquiry","A 7-day companion for the first month."),
  R("grieving-your-younger-self","Grieving Your Younger Self","younger self","The person you were is also gone.","Ramana",GR.ramana,"shadow","A ritual to say goodbye to who you were at 20."),

  // ─── Relationships (25) ───────────────────────────────────────────────────
  R("first-year-marriage","First Year of Marriage","first-year","The hardest year of any good marriage.","Rumi",GR.rumi,"love","A 7-day set of protocols for month one and beyond."),
  R("dating-again","Dating Again After 30","late dating","The market is different. So is what you want.","Meera",GR.meera,"love","A 7-day reset before the next relationship."),
  R("conflict-repair","Conflict Repair","fight repair","The fight is not the problem. The unrepaired fight is.","Krishna",GR.krishna,"love","A 4-step repair protocol."),
  R("boundaries-with-family","Boundaries with Family","family boundaries","No is a full sentence — even at Sunday dinner.","Vyasa",GR.vyasa,"love","One sentence you'll actually deliver by day 7."),
  R("in-laws","Living with In-Laws","in-laws","Two families, one house, one nervous system.","Ramakrishna",GR.ramakrishna,"nervous","A weekly reset for multi-generation homes."),
  R("codependency","Codependency","codependence","You cannot heal them. You can heal your habit of trying.","Kali",GR.kali,"shadow","A 7-day arc for stepping out of the fixer role."),
  R("marriage-drift","Marriage Drift","marital drift","The distance grew slowly. So must the return.","Meera",GR.meera,"love","A daily 15-minute couples ritual."),
  R("jealousy","Jealousy","jealousy","The heat is pointing at something you have not yet honored.","Krishna",GR.krishna,"shadow","A 7-day arc that transforms jealousy into direction."),
  R("resentment","Resentment","resentment","The dose you carry is poisoning only you.","Buddha",GR.buddha,"shadow","A daily release protocol."),
  R("apology","How to Apologize","apology","A real apology has 5 parts. Most have only one.","Jesus",GR.jesus,"love","A structured apology you can deliver by day 7."),
  R("hard-conversations","The Hard Conversation","hard conversation","The one you keep postponing. This week, deliver it.","Krishna",GR.krishna,"love","A 7-day preparation for one hard conversation."),
  R("teenager-parent","Parenting a Teenager","parenting a teen","The child is grieving who they were. So are you.","Vyasa",GR.vyasa,"love","A 7-day communication rebuild.", "parents"),
  R("aging-parent","Aging Parent","aging parent","The role reverses. Slowly, then all at once.","Yogananda",GR.yogananda,"love","A weekly protocol for the caregiver child.", "caregivers"),
  R("adult-siblings","Adult Sibling Dynamics","sibling dynamics","You are still eight years old in that kitchen.","Vyasa",GR.vyasa,"love","A 7-day arc for reshaping adult sibling patterns."),
  R("difficult-boss","The Difficult Boss","boss dynamic","Their nervous system is not your problem, but you have to work with it.","Chanakya",GR.chanakya,"love","A survival and dignity protocol."),
  R("workplace-friendship","Workplace Friendships","work friends","The line between colleague and friend is a boundary you draw.","Meera",GR.meera,"love","A 7-day audit of your work relationships."),
  R("new-baby-couple","New Baby, Couple","new baby couple","The relationship survives only if the ritual survives.","Meera",GR.meera,"love","Daily 10-minute couple micro-rituals.", "parents"),
  R("infidelity-recovery","After Infidelity","infidelity","No promises. Only practice.","Kali",GR.kali,"love","A 7-day companion — for the hurt partner or the one who broke it."),
  R("loneliness","Loneliness","loneliness","Loneliness is not solitude. And it can be met.","Rumi",GR.rumi,"love","A daily practice to shift from ache to solitude."),
  R("saying-no","The Art of No","saying no","The people-pleaser was once a survival strategy.","Kali",GR.kali,"willpower","Seven no's rehearsed and delivered by Sunday."),
  R("difficult-family-dinner","Family Dinner Survival","family dinner","One night a year that undoes you.","Vyasa",GR.vyasa,"nervous","A three-part protocol for the meal and after."),
  R("mother-daughter","Mother-Daughter","mother-daughter","The oldest room in any woman's psyche.","Meera",GR.meera,"love","A 7-day arc for the deepest bond and wound."),
  R("father-son","Father-Son","father-son","The silent contract every father-son duo signs.","Arjuna",GR.arjuna,"love","A structured 7 days to break the silence."),
  R("friend-breakup","Friend Breakup","friendship end","No template exists for this ending.","Meera",GR.meera,"love","A private ritual for a lost friend."),
  R("chosen-family","Chosen Family","chosen family","The people you picked count as blood.","Rumi",GR.rumi,"love","A weekly ritual to strengthen chosen bonds."),

  // ─── Work / Career / Money (25) ───────────────────────────────────────────
  R("first-90-days-job","First 90 Days at a New Job","new job","The onboarding no one gives you.","Chanakya",GR.chanakya,"purpose","A structured first-quarter protocol.", "corporate"),
  R("promotion-transition","Promotion Transition","new title","The role changed. So must your identity.","Krishna",GR.krishna,"purpose","A 7-day transition ritual.", "corporate"),
  R("layoff-recovery","After a Layoff","layoff","The identity earthquake, and the map out.","Vyasa",GR.vyasa,"purpose","A 7-day emotional and practical recovery."),
  R("burnout-recovery","Burnout Recovery","burnout","Rest is not a weekend. It is a practice.","Patanjali",GR.patanjali,"nervous","A 7-day protocol for early-stage burnout.", "corporate"),
  R("micromanagement","Under a Micromanager","micromanagement","Their anxiety is not your calendar.","Chanakya",GR.chanakya,"nervous","A 7-day arc for maintaining dignity under micromanagement.", "corporate"),
  R("remote-work-loneliness","Remote Work Loneliness","remote work","The apartment is not an office.","Laotzu",GR.laotzu,"nervous","A remote-worker daily protocol.", "corporate"),
  R("meeting-overload","Meeting Overload","meeting overload","The calendar is not the work.","Chanakya",GR.chanakya,"purpose","A weekly calendar audit and firewall.", "corporate"),
  R("side-project","The Side Project","side project","One evening a day, for 30 days, changes lives.","Saraswati",GR.saraswati,"purpose","A structured week-one for a real side project."),
  R("negotiation-nerves","Negotiation Nerves","negotiation","The number on the offer is not the whole game.","Chanakya",GR.chanakya,"nervous","A pre-negotiation protocol."),
  R("first-management","First-Time Manager","new manager","The IC skills that got you here won't get you there.","Krishna",GR.krishna,"purpose","A 7-day manager foundation.", "corporate"),
  R("firing-someone","Firing Someone","letting go","The hardest conversation. Done cleanly.","Krishna",GR.krishna,"decision","A structured protocol for a hard conversation.", "corporate"),
  R("performance-review","Performance Review","performance review","The story of your year has two versions.","Chanakya",GR.chanakya,"purpose","A pre-review and delivery protocol.", "corporate"),
  R("saving-money-loop","Money Anxiety","money anxiety","The number is not your worth.","Chanakya",GR.chanakya,"nervous","A weekly money-relationship ritual."),
  R("debt-relationship","Debt & Shame","debt","Debt is math with shame stapled to it.","Kali",GR.kali,"shadow","A 7-day shame-and-plan protocol."),
  R("wealth-guilt","Wealth Guilt","wealth guilt","You earned it. And you're allowed to have it.","Chanakya",GR.chanakya,"shadow","A 7-day arc for the well-off ashamed."),
  R("career-change","Career Change","career change","Not a pivot. A metamorphosis.","Krishna",GR.krishna,"purpose","A 7-day map of the transition."),
  R("business-launch","Launching a Business","launch","Week one is nervous-system training, not marketing.","Chanakya",GR.chanakya,"purpose","A launch-week protocol.", "founders"),
  R("cofounder-conflict","Cofounder Conflict","cofounder","The marriage no one calls a marriage.","Krishna",GR.krishna,"love","A structured 7-day conflict-repair.", "founders"),
  R("scaling-fear","Fear of Scaling","scaling","The company grew. You didn't yet.","Arjuna",GR.arjuna,"purpose","A 7-day expansion ritual.", "founders"),
  R("solopreneur-loneliness","Solopreneur Loneliness","solo","The office of one is quiet in a specific way.","Laotzu",GR.laotzu,"nervous","A daily solo-work ritual.", "founders"),
  R("investor-meetings","Investor Meetings","fundraising","Fundraising is a psychology, not a spreadsheet.","Chanakya",GR.chanakya,"nervous","A pre-pitch and post-pitch protocol.", "founders"),
  R("post-exit","After the Exit","post-exit","The bank account changed. So did who you thought you were.","Vyasa",GR.vyasa,"purpose","A 7-day identity-rebuild.", "founders"),
  R("freelance-feast-famine","Freelance Feast & Famine","freelance","The rhythm is real. So is the practice.","Chanakya",GR.chanakya,"nervous","A weekly freelance protocol."),
  R("hiring-fear","Hiring Your First","first hire","The moment you stop being alone in the company.","Chanakya",GR.chanakya,"decision","A structured hiring protocol.", "founders"),
  R("board-meeting-nerves","Board Meeting Nerves","board","The room is not a jury even if it feels like one.","Krishna",GR.krishna,"nervous","A pre-board 20-minute protocol.", "founders"),

  // ─── Health / Body (25) ───────────────────────────────────────────────────
  R("body-image","Body Image","body image","The mirror is not the enemy. The story is.","Meera",GR.meera,"shadow","A daily body-image protocol."),
  R("food-shame","Food & Shame","food shame","Eating is not moral. Yours has been told it is.","Kali",GR.kali,"shadow","A 7-day shame-neutral eating arc."),
  R("emotional-eating","Emotional Eating","emotional eating","Food is the language of what you can't yet say.","Meera",GR.meera,"willpower","A 7-day pause-before-fridge arc."),
  R("chronic-pain","Living with Chronic Pain","chronic pain","Pain is not the enemy. Resistance is.","Yogananda",GR.yogananda,"nervous","A daily pain-companion protocol.", "healthcare"),
  R("chronic-illness","Chronic Illness","chronic illness","The body is not broken. It is doing its best.","Yogananda",GR.yogananda,"self-inquiry","A 7-day dignity-and-practice arc.", "healthcare"),
  R("sleep-hygiene","Sleep Hygiene","sleep","Sleep is not a nice-to-have. It is the foundation.","Dogen",GR.dogen,"nervous","A 7-day sleep-rebuild."),
  R("fitness-restart","Fitness Restart","exercise restart","Not fitness. Reunion with the body.","Hanuman",GR.hanuman,"willpower","A 7-day sustainable movement start.", "athletes"),
  R("running-mind","Running & the Mind","running","The run is not the workout. It's the meditation.","Hanuman",GR.hanuman,"attention","A 7-day running-as-practice arc.", "athletes"),
  R("yoga-restart","Yoga Restart","yoga return","Return to the mat as return to yourself.","Patanjali",GR.patanjali,"willpower","A 7-day gentle mat return."),
  R("hydration","Hydration","water","Half your problems are dehydration.","Yogananda",GR.yogananda,"nervous","A daily hydration protocol."),
  R("posture-repair","Posture Repair","posture","Screen life has bent the spine. Straighten slowly.","Padmasambhava",GR.padmasambhava,"nervous","A daily 10-minute posture ritual."),
  R("morning-movement","Morning Movement","morning body","The first movement decides the day.","Hanuman",GR.hanuman,"willpower","A 7-minute morning sequence."),
  R("evening-cooldown","Evening Cool-Down","evening body","The day exits the body in specific places.","Dogen",GR.dogen,"nervous","A pre-sleep body ritual."),
  R("menstrual-cycle","Cycle Awareness","menstrual cycle","The body has four seasons a month.","Kali",GR.kali,"self-inquiry","A 28-day tracking protocol."),
  R("perimenopause","Perimenopause","perimenopause","The second puberty no one prepared you for.","Meera",GR.meera,"nervous","A daily practice for the transition."),
  R("men-40-plus","Men After 40","midlife men","The body is signaling. Listen before it shouts.","Vyasa",GR.vyasa,"nervous","A weekly protocol for men 40+."),
  R("caffeine-taper","Caffeine Taper","caffeine","The mug you can't imagine giving up is running you.","Buddha",GR.buddha,"willpower","A 7-day gentle taper."),
  R("sugar-taper","Sugar Taper","sugar","Not a sin. Just an escape hatch.","Buddha",GR.buddha,"willpower","A 7-day sugar-relationship reset."),
  R("alcohol-30-days","30-Day Dry","alcohol","One month tells the body what it's been carrying.","Buddha",GR.buddha,"willpower","A 7-day launch of a 30-day dry.", "recovery"),
  R("porn-detox","30-Day Porn Detox","porn","The rewire is real. The first week is the hardest.","Kali",GR.kali,"willpower","A 7-day launch of a 30-day detox.", "recovery"),
  R("gambling-stop","Gambling Stop","gambling","The dopamine machine has an off switch.","Kali",GR.kali,"willpower","A 7-day beginning of stopping.", "recovery"),
  R("smoking-stop","Quit Smoking","smoking","Not willpower. Reprogramming.","Kali",GR.kali,"willpower","A 7-day quit-arc.", "recovery"),
  R("post-illness","Post-Illness Recovery","post illness","The body needs weeks after the fever leaves.","Yogananda",GR.yogananda,"nervous","A weekly protocol for the recovery month."),
  R("weight-loss-shame","Weight Loss Without Shame","weight","The number is not the point. The relationship is.","Meera",GR.meera,"shadow","A 7-day arc for shame-free change."),
  R("digestive-issues","Digestive Anxiety","digestion","The gut is a second brain. Listen.","Yogananda",GR.yogananda,"nervous","A 7-day gut-nervous-system arc."),

  // ─── Meditation / Spirituality (25) ───────────────────────────────────────
  R("first-meditation","First Meditation","meditation basics","No app, no cushion — just start.","Buddha",GR.buddha,"attention","Ten minutes of daily sitting, learned in 7 days."),
  R("meditation-restart","Meditation Restart","meditation return","The cushion doesn't hold grudges.","Dogen",GR.dogen,"attention","A 7-day gentle return to the seat."),
  R("mantra-japa","Mantra Japa","mantra","Sound has structure. So does the mind that speaks it.","Nanak",GR.nanak,"attention","A daily 108-count practice."),
  R("shavasana","Shavasana","final rest","The hardest posture is stillness.","Patanjali",GR.patanjali,"nervous","A 7-day shavasana deep-rest arc."),
  R("pranayama-basics","Pranayama Basics","breath practice","Breath is the switch you always have.","Patanjali",GR.patanjali,"nervous","Three techniques in seven days."),
  R("kriya-morning","Morning Kriya","kriya","One 15-minute daily kriya changes a decade.","Yogananda",GR.yogananda,"willpower","A morning kriya you can hold for 30 days."),
  R("witness-practice","Witness Practice","witness","The one who watches never needs a break.","Ramana",GR.ramana,"self-inquiry","A daily witness-anchor arc."),
  R("neti-neti","Neti Neti","not this","You are not what you can watch.","Yajnavalkya",GR.yajnavalkya,"self-inquiry","A 7-day peeling of the layers."),
  R("who-am-i","Who Am I","who am i","Ramana's one question, done properly.","Ramana",GR.ramana,"self-inquiry","A 7-day inquiry arc."),
  R("chanting-kirtan","Chanting & Kirtan","chanting","The voice as prayer. Not performance.","Meera",GR.meera,"love","A daily chanting practice.", "ritual"),
  R("gratitude-practice","Gratitude Practice","gratitude","Not toxic positivity. Structured attention.","Therese",GR.therese,"love","A 7-day gratitude arc."),
  R("metta-loving-kindness","Metta Practice","loving kindness","Loving the difficult ones first.","Buddha",GR.buddha,"love","A 7-day metta arc."),
  R("silent-morning","Silent Mornings","silence","The first hour without input.","Dogen",GR.dogen,"attention","A 7-day silent morning arc."),
  R("temple-visit","Temple Visit Reset","temple","Old spaces know how to hold new pain.","Ramakrishna",GR.ramakrishna,"love","A weekly temple ritual.", "ritual"),
  R("altar-home","Home Altar","altar","A small square of intentional space.","Kabir",GR.kabir,"love","A 7-day altar build.", "ritual"),
  R("fasting-basics","Fasting Basics","fasting","The oldest reset in the human toolkit.","Mahavira","the teacher of ahimsa and tapas","willpower","A gentle 7-day intro fast.", "ritual"),
  R("full-moon-ritual","Full Moon Ritual","full moon","The old timings still work.","Kali",GR.kali,"purpose","A monthly full-moon practice.", "ritual"),
  R("new-moon-ritual","New Moon Ritual","new moon","New beginnings have a rhythm.","Kali",GR.kali,"purpose","A monthly new-moon practice.", "ritual"),
  R("ancestors-practice","Honoring Ancestors","ancestors","The people who made you are still with you.","Vyasa",GR.vyasa,"love","A weekly ancestor practice.", "ritual"),
  R("pilgrimage-ready","Pilgrimage Preparation","pilgrimage","The trip starts before the plane.","Nanak",GR.nanak,"purpose","A 7-day pre-pilgrimage arc."),
  R("guru-relationship","Working with a Guru","guru","The teacher is not a person. It is a function.","Ramakrishna",GR.ramakrishna,"knowledge","A 7-day arc on discernment and devotion."),
  R("spiritual-ego","Spiritual Ego","spiritual pride","The subtlest trap. The one that quotes verses.","Ashtavakra",GR.ashtavakra,"shadow","A 7-day arc on catching the trap."),
  R("dark-night","Dark Night of the Soul","dark night","The stage no one prepared you for.","Rumi",GR.rumi,"self-inquiry","A companion for a hard passage."),
  R("bhakti-daily","Daily Bhakti","daily devotion","Devotion as commute, cooking, laundry.","Meera",GR.meera,"love","A 7-day domestic bhakti arc."),
  R("jnana-daily","Daily Jnana","daily inquiry","Knowledge as habit, not book.","Vasistha",GR.vasistha,"self-inquiry","A 7-day arc of inquiry-in-life."),

  // ─── Purpose / Identity (25) ──────────────────────────────────────────────
  R("midlife-reset","Midlife Reset","midlife","Not crisis. Rebalance.","Vyasa",GR.vyasa,"purpose","A 7-day midlife orientation."),
  R("quarter-life","Quarter-Life Reset","quarter-life","The 25-year-old crisis has become normal. Answer it well.","Krishna",GR.krishna,"purpose","A 7-day arc for the mid-20s."),
  R("gap-year","The Gap Year Decision","gap year","One year off costs less than ten wrong.","Vasistha",GR.vasistha,"decision","A 7-day framework for the pause."),
  R("finding-your-lane","Finding Your Lane","svadharma","The narrower lane is the more peaceful road.","Krishna",GR.krishna,"purpose","A 7-day discovery arc."),
  R("values-audit","Values Audit","values","Your calendar is your values, whatever your mouth says.","Chanakya",GR.chanakya,"purpose","A weekly values-calendar audit."),
  R("legacy-question","The Legacy Question","legacy","What do you want to have made?","Vyasa",GR.vyasa,"purpose","A 7-day arc for the second half."),
  R("mortality-meditation","Mortality Meditation","death","The one meditation that clarifies everything else.","Yudhishthira","the elder brother who answered the yaksha","self-inquiry","A daily brief death-meditation."),
  R("life-review","Life Review","life review","A structured look back that changes forward.","Vyasa",GR.vyasa,"self-inquiry","A 7-day life-review arc."),
  R("moving-cities","Moving Cities","relocation","A city is a nervous system. Choose carefully.","Laotzu",GR.laotzu,"decision","A 7-day framework for the move decision."),
  R("returning-home","Returning Home","return","You are not the same person the town remembers.","Vyasa",GR.vyasa,"self-inquiry","A 7-day arc for going back."),
  R("first-generation","First-Generation Weight","first gen","You are carrying more than you signed up for.","Vyasa",GR.vyasa,"purpose","A weekly first-gen practice."),
  R("children-of-immigrants","Children of Immigrants","immigrant child","Two languages, two ceilings, one heart.","Nanak",GR.nanak,"self-inquiry","A 7-day identity arc."),
  R("class-passing","Class Passing","class movement","You moved classes. Your body hasn't caught up.","Ashtavakra",GR.ashtavakra,"shadow","A weekly practice for class movers."),
  R("late-bloomer","Late Bloomer","late bloomer","The comparison clock is not your clock.","Laotzu",GR.laotzu,"purpose","A 7-day arc against the timeline."),
  R("prodigy-burnout","Prodigy Burnout","prodigy","The gift that became a cage.","Krishna",GR.krishna,"shadow","A 7-day recovery from early-genius pressure."),
  R("caretaker-identity","The Family Caretaker","caretaker","The role that swallowed the person.","Meera",GR.meera,"shadow","A 7-day arc for the family caretaker.", "caregivers"),
  R("golden-child","Golden Child Recovery","golden child","The praise was conditional. So was you.","Kali",GR.kali,"shadow","A 7-day recovery arc."),
  R("black-sheep","Black Sheep","black sheep","Being different was not a defect.","Krishna",GR.krishna,"purpose","A 7-day arc for the outlier."),
  R("religion-return","Returning to Religion","religion return","The tradition can hold a new version of you.","Ramakrishna",GR.ramakrishna,"knowledge","A 7-day return-arc for the questioning adult."),
  R("religion-leaving","Leaving a Religion","religion leaving","Grief and freedom in the same breath.","Kabir",GR.kabir,"self-inquiry","A 7-day arc for the departure."),
  R("finding-teachers","Finding Teachers","teachers","A teacher is not a person. It is a function.","Dattatreya",GR.dattatreya,"knowledge","A 7-day arc on discernment."),
  R("mentorship-give","Becoming a Mentor","mentoring","The gift that gives to both.","Vyasa",GR.vyasa,"purpose","A 7-day arc on mentoring well."),
  R("volunteering","Serving Well","volunteering","Service is a discipline, not a mood.","Vivekananda",GR.vivekananda,"purpose","A 7-day service arc."),
  R("civic-life","Civic Life","citizenship","The polis is your practice too.","Chanakya",GR.chanakya,"purpose","A 7-day civic arc.", "government"),
  R("artist-day-job","Artist with a Day Job","artist day-job","The job funds the art. The art dignifies the job.","Saraswati",GR.saraswati,"art","A 7-day dual-life protocol.", "creators"),

  // ─── Habits / Willpower (20) ──────────────────────────────────────────────
  R("build-one-habit","Build One Habit","habit","Not ten. One. Well.","Buddha",GR.buddha,"willpower","A 7-day launch of one habit."),
  R("break-one-habit","Break One Habit","habit break","Not ten. One. Deeply.","Kali",GR.kali,"willpower","A 7-day break-arc for a single habit."),
  R("morning-routine","Morning Routine","morning routine","The first hour compounds.","Krishna",GR.krishna,"willpower","A 30-minute morning you can hold."),
  R("evening-routine","Evening Routine","evening routine","The last hour decides tomorrow.","Dogen",GR.dogen,"willpower","A 20-minute evening you can hold."),
  R("weekly-review","Weekly Review","weekly review","The unreviewed week teaches nothing.","Chanakya",GR.chanakya,"attention","A 20-minute Sunday review."),
  R("monthly-fast","Monthly Ekadashi","monthly fast","One day a month resets more than diet.","Mahavira","the teacher of ahimsa and tapas","willpower","A 7-day arc launching a monthly practice.", "ritual"),
  R("ice-baths","Cold Exposure","cold","Not a trend. A nervous-system tool.","Hanuman",GR.hanuman,"willpower","A 7-day cold-exposure introduction."),
  R("walking-practice","Walking Practice","walking","The oldest human medicine.","Buddha",GR.buddha,"attention","A daily walking arc."),
  R("digital-sabbath","Digital Sabbath","digital sabbath","One day a week off-screen.","Nanak",GR.nanak,"willpower","A 7-day launch of a weekly sabbath."),
  R("saying-yes","Deliberate Yes","deliberate yes","Yes has to cost something to mean something.","Krishna",GR.krishna,"decision","A weekly yes-audit."),
  R("no-complaining","No Complaining","complaint fast","A 7-day complaint fast reveals the mind.","Buddha",GR.buddha,"attention","A 7-day arc without complaint."),
  R("kindness-practice","Random Kindness","kindness","One small kindness a day. Deliberately.","Jesus",GR.jesus,"love","A 7-day daily kindness protocol."),
  R("service-daily","Daily Karma Yoga","service","One act of service a day. Anonymous.","Vivekananda",GR.vivekananda,"purpose","A 7-day service protocol."),
  R("financial-fasting","Financial Fasting","spend fast","Seven days without discretionary spend.","Chanakya",GR.chanakya,"willpower","A 7-day no-spend arc."),
  R("clutter-clear","Clutter Clear","clutter","The stuff is voting for or against your peace.","Laotzu",GR.laotzu,"attention","A room-a-day clearing arc."),
  R("inbox-zero","Inbox Zero","inbox","Zero is a temporary state. But it exists.","Chanakya",GR.chanakya,"attention","A 7-day inbox reset."),
  R("morning-cold-water","Morning Cold Water","cold splash","One splash. Fifty seconds. Life changes.","Hanuman",GR.hanuman,"willpower","A daily cold-splash launch."),
  R("stretch-daily","Daily Stretch","stretch","Five minutes a day for a body that lasts.","Patanjali",GR.patanjali,"willpower","A 7-minute daily stretch."),
  R("sleep-at-10","Bed by 10","early bed","The 10 pm bedtime that reshapes the day.","Yogananda",GR.yogananda,"willpower","A 7-day 10 pm arc."),
  R("no-phone-bed","No Phone in Bed","phone bed","The bed is not a scrolling station.","Buddha",GR.buddha,"willpower","A 7-day no-phone-in-bed arc."),

  // ─── Shadow / Inner Work (20) ─────────────────────────────────────────────
  R("anger-work","Anger Work","anger","Anger has data. Read before you send.","Kali",GR.kali,"shadow","A 7-day anger-integration arc."),
  R("envy-work","Envy Work","envy","Envy is a compass. Read it, don't judge it.","Rumi",GR.rumi,"shadow","A 7-day envy-integration arc."),
  R("shame-work","Shame Work","shame","Shame lives in silence. It dies in one honest sentence.","Kali",GR.kali,"shadow","A 7-day shame-neutralization arc."),
  R("guilt-work","Guilt Work","guilt","Guilt has two forms. Only one is useful.","Jesus",GR.jesus,"shadow","A 7-day guilt-clarification arc."),
  R("fear-of-success","Fear of Success","success fear","The thing you say you want, you also flee.","Krishna",GR.krishna,"shadow","A 7-day success-tolerance arc."),
  R("fear-of-failure","Fear of Failure","failure fear","The most common paralysis.","Arjuna",GR.arjuna,"shadow","A 7-day failure-tolerance arc."),
  R("perfectionism","Perfectionism","perfectionism","Perfect is the enemy of done and of you.","Krishna",GR.krishna,"shadow","A 7-day done-over-perfect arc."),
  R("imposter-syndrome","Imposter Syndrome","imposter","The room does not know what you know about yourself.","Chanakya",GR.chanakya,"shadow","A 7-day imposter-integration arc."),
  R("comparison","Comparison","comparison","The lens that ruins the room.","Ashtavakra",GR.ashtavakra,"shadow","A 7-day comparison-fast arc."),
  R("self-sabotage","Self-Sabotage","sabotage","The part that undoes the win means well.","Kali",GR.kali,"shadow","A 7-day sabotage-integration arc."),
  R("victim-loop","The Victim Loop","victim loop","Sometimes true. Always expensive if permanent.","Krishna",GR.krishna,"shadow","A 7-day arc to step out."),
  R("savior-complex","Savior Complex","savior","The one who saves needs to be needed.","Jesus",GR.jesus,"shadow","A 7-day savior-integration arc."),
  R("fixing-others","Compulsive Fixing","fixing others","Fixing is fear in a helper's costume.","Ramakrishna",GR.ramakrishna,"shadow","A 7-day hands-off arc."),
  R("hyper-independence","Hyper-Independence","hyper independence","Doing everything alone is also a wound.","Meera",GR.meera,"shadow","A 7-day arc of receiving."),
  R("dependency","Emotional Dependency","dependency","The other person is not your regulation system.","Kali",GR.kali,"shadow","A 7-day self-regulation arc."),
  R("controlling","Control Compulsion","control","The grip is fear wearing responsibility.","Laotzu",GR.laotzu,"shadow","A 7-day loosening arc."),
  R("avoidance","Chronic Avoidance","avoidance","What you avoid runs you.","Arjuna",GR.arjuna,"shadow","A 7-day approach arc."),
  R("people-pleasing","People-Pleasing","people pleasing","The child who learned safety through smallness.","Kali",GR.kali,"shadow","A 7-day arc of the real yes."),
  R("intellectualizing","Intellectualizing","intellectualizing","The mind is a great avoidance tool.","Ashtavakra",GR.ashtavakra,"shadow","A 7-day feel-more-think-less arc."),
  R("spiritual-bypass","Spiritual Bypass","bypass","Using practice to skip the pain.","Ashtavakra",GR.ashtavakra,"shadow","A 7-day arc to catch the bypass."),

  // ─── Art / Creativity (15) ────────────────────────────────────────────────
  R("writers-block","Writer's Block","writer's block","The block is fear of being seen.","Saraswati",GR.saraswati,"art","A 7-day writer's block reset.", "creators"),
  R("designer-block","Designer's Block","design block","The blank canvas is a mirror.","Saraswati",GR.saraswati,"art","A 7-day design-flow arc.", "creators"),
  R("musician-block","Musician's Block","music block","The instrument is patient.","Saraswati",GR.saraswati,"art","A 7-day music-return arc.", "musicians"),
  R("stage-fright","Stage Fright","stage fright","The stage is not a judge.","Meera",GR.meera,"nervous","A pre-stage protocol.", "musicians"),
  R("post-show-comedown","Post-Show Comedown","comedown","The high after a show has a specific crash.","Rumi",GR.rumi,"nervous","A post-show recovery arc.", "musicians"),
  R("first-book","Writing Your First Book","first book","The book you can't stop thinking about.","Vyasa",GR.vyasa,"art","A 7-day first-week arc.", "creators"),
  R("photography-eye","The Photographer's Eye","photography","Seeing is a practice, not a talent.","Dogen",GR.dogen,"attention","A 7-day photography-as-meditation arc.", "creators"),
  R("painting-daily","Daily Painting","painting","The one-painting-a-day protocol.","Saraswati",GR.saraswati,"art","A 7-day painting arc.", "creators"),
  R("dance-practice","Dance Practice","dance","The body knows what the mind can't say.","Shiva",GR.shiva,"art","A 7-day daily movement arc.", "creators"),
  R("poetry-daily","Daily Poetry","poetry","One poem a day for a week.","Rumi",GR.rumi,"art","A 7-day poetry arc.", "creators"),
  R("filmmaking","Filmmaking Daily","filmmaking","The camera is patient.","Vyasa",GR.vyasa,"art","A 7-day film-daily arc.", "creators"),
  R("standup-comedy","Standup Preparation","standup","Comedy is public grief with timing.","Kabir",GR.kabir,"art","A 7-day pre-set arc.", "creators"),
  R("acting-preparation","Actor's Preparation","acting","The role starts in the body.","Shiva",GR.shiva,"art","A 7-day pre-role arc.", "creators"),
  R("teaching-as-art","Teaching as Art","teaching","The classroom is a stage.","Vyasa",GR.vyasa,"art","A 7-day teacher's presence arc.", "teachers"),
  R("crafting-daily","Daily Craft","craft","The hands remember what the head forgets.","Kabir",GR.kabir,"art","A 7-day hands-on arc.", "creators"),

  // ─── Knowledge / Learning (15) ────────────────────────────────────────────
  R("reading-serious","Reading Seriously","serious reading","One serious book beats ten skimmed.","Vyasa",GR.vyasa,"knowledge","A 7-day reading protocol."),
  R("language-learn","Language Learning","new language","A language is a new self.","Saraswati",GR.saraswati,"knowledge","A daily 20-minute language protocol."),
  R("thesis-writing","Thesis Writing","thesis","One page a day for a year.","Vyasa",GR.vyasa,"knowledge","A daily thesis protocol.", "students"),
  R("phd-survival","PhD Survival","phd","The marathon no one prepared you for.","Vyasa",GR.vyasa,"purpose","A weekly PhD protocol.", "students"),
  R("interview-prep-tech","Technical Interview Prep","tech interview","The blank whiteboard is a nervous system test.","Chanakya",GR.chanakya,"knowledge","A 7-day prep arc.", "students"),
  R("gita-in-7","Bhagavad Gita in 7 Days","Gita","One chapter a day, plainly.","Krishna",GR.krishna,"knowledge","A 7-day Gita read-along."),
  R("upanishads-primer","Upanishads Primer","Upanishads","The oldest inquiries. Made readable.","Yajnavalkya",GR.yajnavalkya,"knowledge","A 7-day Upanishad reader."),
  R("dhammapada","Dhammapada in 7","Dhammapada","One handful a day.","Buddha",GR.buddha,"knowledge","A 7-day daily reading arc."),
  R("tao-te-ching","Tao Te Ching in 7","Tao","One old chapter a day.","Laotzu",GR.laotzu,"knowledge","A 7-day daily contemplation."),
  R("yoga-sutras","Yoga Sutras Primer","yoga sutras","The eight limbs, in plain speech.","Patanjali",GR.patanjali,"knowledge","A 7-day sutras arc."),
  R("ramayana-primer","Ramayana Primer","Ramayana","One arc a day.","Tulsidas",GR.tulsidas,"knowledge","A 7-day Ramayana overview."),
  R("mahabharata-primer","Mahabharata Primer","Mahabharata","The whole family in seven days.","Vyasa",GR.vyasa,"knowledge","A 7-day epic overview."),
  R("stoicism-7","Stoicism in 7","stoicism","Marcus, Epictetus, Seneca. Enough for a life.","Chanakya",GR.chanakya,"knowledge","A 7-day daily stoic reading."),
  R("zen-koans","Zen Koans","koans","One koan a day. Sit with it.","Dogen",GR.dogen,"self-inquiry","A 7-day koan arc."),
  R("kabir-dohas","Kabir Dohas","dohas","One doha a day. Chew slowly.","Kabir",GR.kabir,"knowledge","A 7-day daily doha arc."),

  // ─── Specialized audience programs (15) ───────────────────────────────────
  R("resident-doctor","Resident Doctor Survival","hospital residency","36-hour shifts have a physiology.","Yogananda",GR.yogananda,"nervous","A weekly resident's protocol.", "healthcare"),
  R("er-nurse","ER Nurse Nights","er nights","The nightshift compounds. So must the reset.","Yogananda",GR.yogananda,"nervous","A weekly ER-nurse arc.", "nurses"),
  R("beat-cop","Beat Cop Regulation","police shift","The uniform is not a nervous system.","Chanakya",GR.chanakya,"nervous","A weekly officer's protocol.", "government"),
  R("public-defender","Public Defender","public defense","Advocating in an unfair system, sustainably.","Chanakya",GR.chanakya,"nervous","A weekly PD protocol.", "lawyers"),
  R("court-judge","Judge on the Bench","judicial","Weighing lives without carrying them all home.","Yajnavalkya",GR.yajnavalkya,"nervous","A weekly bench protocol.", "lawyers"),
  R("prison-guard","Prison Guard","prison work","The wall has two sides. Both need practice.","Padmasambhava",GR.padmasambhava,"shadow","A weekly protocol.", "government"),
  R("social-worker","Social Worker Overload","social work","Compassion fatigue is a wound, not a weakness.","Meera",GR.meera,"nervous","A weekly social-work reset.", "healers"),
  R("therapist-hygiene","Therapist Self-Care","therapist care","You cannot pour clean water from a full sponge.","Meera",GR.meera,"nervous","A weekly clinician protocol.", "healers"),
  R("chaplain-practice","Chaplain's Practice","chaplaincy","Sitting with everyone else's ending.","Jesus",GR.jesus,"love","A weekly chaplaincy arc.", "healers"),
  R("veteran-transition","Veteran Transition","veteran","The uniform is off. The nervous system isn't.","Arjuna",GR.arjuna,"nervous","A 7-day transition arc.", "government"),
  R("startup-employee-1","Startup Employee #1","startup early","Being the first non-founder is its own role.","Chanakya",GR.chanakya,"purpose","A weekly early-employee protocol.", "corporate"),
  R("night-shift-worker","Night Shift Worker","night shift","Circadian and cortisol, managed.","Yogananda",GR.yogananda,"nervous","A weekly night-shift arc.", "nurses"),
  R("stay-at-home","Stay-at-Home Parent","stay at home","The invisible full-time job.","Meera",GR.meera,"purpose","A weekly stay-at-home protocol.", "parents"),
  R("single-parent","Single Parent","single parent","One adult, two lives, one nervous system.","Meera",GR.meera,"nervous","A weekly single-parent protocol.", "parents"),
  R("adoption-transition","Adoption Transition","adoption","Two histories, one home.","Meera",GR.meera,"love","A weekly adoption protocol.", "parents"),

  // ─── Extras to push past 300 ──────────────────────────────────────────────
  R("morning-pages","Morning Pages","morning pages","Three pages, longhand, no editing.","Saraswati",GR.saraswati,"art","A 7-day morning pages arc."),
  R("micro-solitude","Micro-Solitude","micro solitude","10 minutes alone, on purpose, every day.","Laotzu",GR.laotzu,"nervous","A 7-day micro-solitude arc."),
  R("no-news-week","No-News Week","news fast","Seven days without news changes the mind.","Buddha",GR.buddha,"attention","A 7-day news fast."),
  R("boundaries-work","Work Boundaries","work boundaries","The laptop closes when you close it.","Chanakya",GR.chanakya,"willpower","A 7-day work-boundary arc.", "corporate"),
  R("boundaries-tech","Boundaries with Tech","tech boundaries","The device is a tool, not a room-mate.","Buddha",GR.buddha,"willpower","A 7-day tech-boundary arc."),
  R("morning-prayer","Morning Prayer","morning prayer","Not to a distant god. To the day itself.","Nanak",GR.nanak,"love","A 7-day morning-prayer arc.", "ritual"),
  R("evening-prayer","Evening Prayer","evening prayer","A closing sentence for each day.","Therese",GR.therese,"love","A 7-day evening-prayer arc.", "ritual"),
  R("nature-return","Nature Return","nature","Twenty minutes outside is medicine.","Buddha",GR.buddha,"nervous","A 7-day outside arc."),
  R("music-as-medicine","Music as Medicine","music","The right song lowers cortisol faster than words.","Saraswati",GR.saraswati,"nervous","A 7-day sound-diet arc."),
  R("silence-hour","One Silent Hour","silence","One hour a day, no input.","Dogen",GR.dogen,"attention","A 7-day silent-hour arc."),
  R("saying-thanks","Saying Thanks","thanks","Three specific thank-yous a day.","Therese",GR.therese,"love","A 7-day gratitude-delivery arc."),
  R("letter-to-self","Letter to Self","letter to self","A weekly letter to the you of 90 days from now.","Ramana",GR.ramana,"self-inquiry","A 7-day letter arc."),
  R("dream-journal","Dream Journal","dream journal","The dreams have been talking. Start reading.","Padmasambhava",GR.padmasambhava,"self-inquiry","A 7-day dream-journal arc."),
  R("gita-arjuna-loops","Arjuna's Loops","warrior's loops","Arjuna's paralysis is a modern condition.","Krishna",GR.krishna,"decision","A 7-day arc through Arjuna's collapse."),
  R("karna-loops","Karna's Loops","the worthy outcast","The worthy outcast lives inside many of us.","Vyasa",GR.vyasa,"shadow","A 7-day Karna-mirror arc."),
  R("draupadi-loops","Draupadi's Loops","the woman who was wagered","The woman who was wagered and returned.","Kali",GR.kali,"shadow","A 7-day Draupadi-mirror arc."),
  R("hanuman-service","Hanuman's Service","service as devotion","Service becomes devotion becomes freedom.","Hanuman",GR.hanuman,"love","A 7-day Hanuman arc."),
  R("lakshmi-abundance","Lakshmi and Abundance","abundance","Money is a form of shakti. Handle with respect.","Chanakya",GR.chanakya,"purpose","A 7-day money-relationship arc."),
  R("saraswati-study","Saraswati and Study","study as prayer","Study is a form of devotion.","Saraswati",GR.saraswati,"knowledge","A 7-day study-as-devotion arc.", "students"),
  R("shiva-solitude","Shiva and Solitude","solitude as practice","Solitude is not loneliness. It is training.","Shiva",GR.shiva,"self-inquiry","A 7-day solitude arc."),
  R("ganesha-obstacles","Ganesha and Obstacles","obstacles","Every obstacle is a form.","Ganesha","the remover of obstacles who is himself the obstacle","decision","A 7-day obstacle-inquiry arc."),
  R("naked-truth","The Naked Truth","radical honesty","One radically honest sentence a day.","Kabir",GR.kabir,"self-inquiry","A 7-day radical-honesty arc."),
  R("witness-the-day","Witness the Day","daily witness","End each day noticing the noticer.","Ramana",GR.ramana,"self-inquiry","A 7-day daily-witness arc."),
];

// ─── Build the actual programs ───────────────────────────────────────────────
export const MEGA_CATALOG_PROGRAMS: ShowroomProgram[] = ROWS.map((r) => {
  const arc = ARCS[r.category];
  const days = arc(r.topic);
  return expandSpec({
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle,
    guru: r.guru,
    guruRole: r.guruRole,
    theme: THEME_EMOJI[r.category],
    color: COLOR[r.category],
    category: r.category,
    audience: r.audience,
    promise: r.promise,
    days,
  });
});

export const MEGA_CATALOG_COUNT = MEGA_CATALOG_PROGRAMS.length;
