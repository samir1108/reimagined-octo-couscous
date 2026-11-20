/**
 * Showroom Programs — 7-day free programs, no signup required.
 * Each program: 1 guru, 7 days, full reading + 1 micro-practice per day.
 *
 * These are the "free taste" — a person can complete the whole 7 days
 * without an account. They're written as standalone teaching, not as
 * AI sessions, so they're readable on day 0.
 */

export interface ShowroomDay {
  day: number;
  title: string;
  oneLine: string;          // the day's teaching in a single sentence
  reading: string;          // 600-1000 words of plain-language teaching
  practice: {
    name: string;
    durationMin: number;
    instructions: string;   // step-by-step, plain English
  };
  reflection: string;       // 1-2 questions to sit with
}

export interface ShowroomProgram {
  slug: string;
  title: string;
  subtitle: string;
  guru: string;             // who teaches this
  guruRole: string;         // one-line on who this guru is
  theme: string;            // emoji / visual symbol
  color: string;            // tailwind gradient class
  category: "decision" | "willpower" | "love" | "knowledge" | "purpose" | "nervous" | "art" | "self-inquiry" | "attention" | "shadow";
  duration: "7 days";
  promise: string;          // what you'll have after 7 days
  days: ShowroomDay[];
  /**
   * Optional audience tag for the /experience/programs catalog.
   * When present, the program surfaces in the audience-specific hub
   * (Corporate, Government, Healers, etc.) rather than only the generic Showroom.
   */
  audience?:
    | "corporate"
    | "government"
    | "healers"
    | "ritual"
    | "creators"
    | "parents"
    | "students"
    | "athletes"
    | "founders"
    | "healthcare"
    | "teachers"
    | "grief"
    | "nurses"
    | "lawyers"
    | "monks"
    | "refugees"
    | "recovery"
    | "caregivers"
    | "lgbtq"
    | "prisoners"
    | "journalists"
    | "sexworkers"
    | "widows"
    | "musicians";
}

// ============================================================================
// PROGRAM 1 — DECISION-MAKING WITH KRISHNA
// ============================================================================
const DECISION_MAKING: ShowroomProgram = {
  slug: "decision-making-with-krishna",
  title: "Decision-Making with Krishna",
  subtitle: "Seven days inside the world's oldest decision framework — the Gita, in plain English.",
  guru: "Krishna",
  guruRole: "the charioteer who taught Arjuna how to act when every option felt wrong",
  theme: "🪈",
  color: "from-amber-500/30 via-orange-500/20 to-rose-500/10",
  category: "decision",
  duration: "7 days",
  promise: "By day 7 you will have a personal decision protocol you can run on any choice — career, relationship, money — in under five minutes.",
  days: [
    {
      day: 1,
      title: "The Battlefield",
      oneLine: "Most bad decisions are made by the wrong 'you'.",
      reading: `Five thousand years ago, on the eve of the biggest war in Indian memory, the warrior Arjuna stood between two armies — his cousins on one side, his teachers on the other — and could not lift his bow. He sat down in his chariot and said the most human sentence ever recorded: *I do not know what is right.*

Notice what he did not say. He did not say "I don't know what to do." He knew exactly what to do — fight. He said he did not know what was *right*. The difference between those two sentences is the entire subject of this program.

Most adults, asked to make a hard decision, do one of three things. They flip a mental coin and call it intuition. They make a pros-and-cons list and pretend it isn't biased. Or they freeze, scroll, and let the decision get made for them by the passage of time. Krishna's first move with Arjuna is to tell him that all three of these are the same mistake. They are all the **reactive mind** trying to make a **soul-level decision**.

This week you are going to learn the Gita's actual technique. Not the philosophy — the technique. There are six moves. They take ten years to master and ten minutes to learn. By Sunday you will know all six.

Today's move is the first and the smallest: **notice which 'you' is being asked to decide**.

Right now, before you do anything else, recall the hardest open decision in your life. The one you've been carrying for weeks or months. Hold it in mind for thirty seconds. Then notice — without judgment — which version of you is the one trying to solve it. Is it the tired-at-11-p.m. you? The wants-to-impress-the-parent you? The scared-of-being-wrong you? The version of you that has not eaten in four hours?

These are not the same person. They will not make the same choice. The Gita's first teaching is: *do not let a contracted self make a life-sized decision*. Before you decide anything heavy, you must first widen who is deciding.

Tomorrow we'll cover how. Today, just notice.`,
      practice: {
        name: "Name the Decider",
        durationMin: 3,
        instructions: `Sit comfortably. Close your eyes. Bring to mind one open decision you've been carrying.

For 60 seconds, do not try to solve it. Just notice: which version of you is holding this question?

Then ask, out loud or in your head: "If a calmer me looked at this in six months, what would they see that I cannot see right now?"

Don't answer. Just hold the question. Open your eyes.`,
      },
      reflection: "Which 'you' has been making your recent decisions — and is it the version you'd trust with the rest of your life?",
    },
    {
      day: 2,
      title: "Action Without Attachment",
      oneLine: "You are responsible for the move, not the outcome.",
      reading: `The most quoted sentence in the Gita is also the most misunderstood. *Karmanye vadhikaraste, ma phaleshu kadachana* — you have the right to action, never to the fruits of action.

People hear this and think Krishna is saying: don't care about results. That is exactly wrong. Krishna is saying something much more useful and much more difficult: **care fiercely about the quality of your action, and refuse to let the outcome decide whether the action was right.**

Why does this matter for decisions? Because almost every paralyzing decision in your life is paralyzing for one reason: you are trying to choose the option that *guarantees* a good outcome. But no option does. The universe doesn't make that contract with anyone. So you sit in the chariot, not moving, waiting for a guarantee that will never arrive.

The Gita's move is to flip the question. Instead of *which option gives me the best outcome*, ask *which option, if it failed, would I still be proud I chose?* That is a question you can actually answer. It moves the decision out of fortune-telling and into character.

A simple example. Two job offers. Option A pays more but the work is hollow. Option B pays less but the work is alive. The outcome-based question — "which will make me happier in five years?" — is unanswerable. Neither you nor anyone else knows. The Gita's question — "which one, if it fails, will I still be the kind of person I want to be?" — is answerable in about thirty seconds.

This is action without attachment. It is not detachment. It is the opposite. It is being fully attached to the *quality of the move* and fully unattached to the *verdict of the result*.

Most professional athletes know this. Most artists know this. Most parents, on their best days, know this. The Gita is the manual.`,
      practice: {
        name: "The Pride Test",
        durationMin: 4,
        instructions: `Pick the same decision you held yesterday.

Write down, in one line, the two or three options on the table.

For each option, finish this sentence: "If this choice fails completely, I will still be proud I chose it because ____."

If you can finish the sentence for an option, it's a real candidate. If you cannot, that option is being driven by fear of outcome, not by character.

Notice which options survive the test.`,
      },
      reflection: "Which of your options is one you'd be proud of even if it failed?",
    },
    {
      day: 3,
      title: "The Three Gunas",
      oneLine: "Every decision is made in one of three mental weathers.",
      reading: `The Gita's most original contribution to psychology is the doctrine of the three *gunas* — the three qualities of mind that color every thought you have. They are *sattva* (clarity), *rajas* (agitation), and *tamas* (heaviness). Modern neuroscience would call them roughly: prefrontal-cortex dominance, sympathetic-nervous-system dominance, and exhaustion/freeze.

The point of the doctrine is brutal and useful: **the same decision, made in the same brain, will come out differently in each weather**.

Sattva is the mind that has slept seven hours, eaten well, and is sitting in morning light with no urgent input. A decision made here is calm, sees long, and chooses by character. Rajas is the mind that has had three coffees, two arguments, and an unread message from the boss. A decision made here is fast, sees short, and chooses by ego. Tamas is the mind at 11 p.m. after a hard day. A decision made here is no decision — it is a slump into the path of least resistance, usually justified later as "going with the flow."

The Gita's third move is simple. **Never finalize a heavy decision from rajas or tamas. Wait until sattva returns, then decide.** This is not procrastination. It is craftsmanship. A carpenter does not cut wood when the saw is dull. You do not decide your marriage from the 11 p.m. mind.

The practical version: any decision that will matter in a year, you sleep on. Not as a folk saying — as a rule. The Gita is telling you that the version of you that wakes up tomorrow morning has access to evidence the rajas-you cannot reach. You are giving the better cabinet a chance to convene.

For most of human history this was obvious. The phone made it harder. Today, more decisions are made at 11:47 p.m. by exhausted, sympathetic-dominant brains than at any point in history. Most of them are bad. You do not need a new philosophy to fix this. You need the discipline to defer.`,
      practice: {
        name: "The Three Weathers Check",
        durationMin: 3,
        instructions: `Sit quietly. Take three slow breaths.

Ask the body, not the head: which weather am I in right now?

Sattva — light, alert, slow, curious.
Rajas — tight, urgent, busy, slightly hot.
Tamas — heavy, foggy, want-to-collapse.

Whatever the honest answer is — accept it. Then make one rule: today, no heavy decision will be made in any weather but sattva. The others will be allowed to gather information. Only sattva is allowed to choose.`,
      },
      reflection: "What weather have you been making your decisions in this week?",
    },
    {
      day: 4,
      title: "Svadharma — Your Lane",
      oneLine: "Better your own duty done badly than another's done well.",
      reading: `*Svadharma* is the Gita's word for "your specific, particular, no-one-else's life-shape." It is the recognition that you are not interchangeable with other humans — you have a unique combination of temperament, history, capacity, and obligation, and your job is to find what is *yours to do* and do that, even if you do it imperfectly.

This sounds obvious. It is not. Almost every miserable adult I have met is miserable because they are running someone else's *svadharma* very competently. The successful banker who should have been a teacher. The teacher who should have been a builder. The parent who should not have been a parent yet. The artist who should have been an engineer first and an artist second.

Krishna says: *shreyan svadharmo vigunah, paradharmat svanushthitat* — better your own dharma done badly than another's done well. This is not a license for mediocrity. It is a warning that excellence in the wrong lane is a deeper failure than struggle in the right one.

How do you find your lane? The Gita gives a quiet, practical test. **Watch for the thing you do where time disappears, where you do not need credit, and where the work itself feels like its own reward**. That is the signal. It will rarely be the highest-paying thing. It will rarely be what your parents wanted. It will be specific to you in a way that no career counselor can predict.

For decision-making, this is the fourth move. Before you choose between options, ask: *which option is closer to my svadharma, and which is closer to someone else's?* You will often find that an option that looked attractive is attractive only because it is impressive to a person whose approval you are tired of needing.

The lane is narrower than you want. The lane is also much more peaceful than the highway.`,
      practice: {
        name: "The Time-Disappears Test",
        durationMin: 4,
        instructions: `Sit quietly. Recall, in the last six months, three moments when you completely lost track of time while doing something.

Write them down. Three lines, one each.

Now look at the list and ask: what is the common thread? It is rarely the activity itself — it is usually a quality. Building things. Solving puzzles. Caring for someone. Telling a story. Sitting alone.

That quality is a strong signal of svadharma. Now hold your open decision against it. Which option lets you do more of that quality?`,
      },
      reflection: "What is the quality your life makes time disappear for — and how much of your week is that quality?",
    },
    {
      day: 5,
      title: "The Witness",
      oneLine: "You are not the chooser. You are what is aware of the choosing.",
      reading: `By day five we have to introduce the deepest move in the Gita, the one that most teachers leave out because it is hard to sell on a poster. Here it is.

There is a *you* that has thoughts. There is also a *you* that is aware of the thoughts. These two are not the same. The first one is the chooser, the planner, the worrier, the version of you that is reading this sentence and forming opinions about it. The second one is older, quieter, and is the one who notices that the first one is doing all of this. Indian philosophy calls the second one the *sakshi* — the witness.

For decision-making, the witness matters because every option, every fear, every "what if," is a movement in the first you. The witness watches them pass. The witness does not have opinions about your career. The witness does not care which apartment you choose. The witness is simply the awareness in which all of this is happening.

The fifth Gita move is this: **before you make a heavy decision, find the witness for five minutes**. Not the chooser. The witness. Sit quietly. Watch a thought arise. Notice — without engaging — that *you are the one noticing*. Stay there until it stabilizes.

From that vantage, the decision often becomes lighter. Not because the witness solves it, but because you realize the decision is one of many movements in a much larger field. The catastrophe scenarios shrink. The petty fears lose grip. What is left is usually the answer that was obvious all along, but was being drowned out by the chooser's volume.

This is also the entry to every other contemplative practice — Buddhist *sati*, Christian *recollection*, Sufi *muraqaba*. They are all pointing at the same fact: there is a stable place inside you from which decisions look different. You can visit it. It costs nothing. You have been there before, by accident, in the seconds after a near-miss on the highway, or watching a sleeping child, or at the end of a long walk.

This week, learn to visit it on purpose.`,
      practice: {
        name: "Five Minutes with the Witness",
        durationMin: 5,
        instructions: `Sit upright. Close your eyes.

For five minutes, watch your breath. When a thought comes — and it will — do not push it away and do not follow it. Just notice it.

Now add one move: notice the noticer. Who is the one who saw the thought? That awareness, not the thought, is the witness.

Stay with the noticer for the rest of the five minutes. When you drift, return. The drifting and returning is the practice.`,
      },
      reflection: "From the witness, does your open decision look the same size as it did from the chooser?",
    },
    {
      day: 6,
      title: "The Cost of the Other Road",
      oneLine: "Every choice has a shadow life. Look at it before you choose.",
      reading: `One thing the Gita understands that modern self-help refuses to: every choice has a *shadow life*. The life you did not live. The version of you that took the other job, married the other person, stayed in the other city. The shadow life is not real, but its imagined absence haunts decisions for years.

The sixth move is to make the shadow life concrete *before* you choose, not after.

For each option you are considering, spend five minutes writing the honest, year-five version of the shadow life — the life of the *other* option you didn't take. Not a fantasy. The realistic version. The job that paid more but ate your weekends. The relationship that was easy but never deep. The city you stayed in because the rent was cheap. Write it as if it happened.

Two things happen when you do this. One, you discover that the option you were "supposed to" choose has costs you had been suppressing. The successful path has a price tag you hadn't read. Two, you discover that the option you'd been calling "scary" has, in its shadow life, a reasonable, livable, in-some-ways-better story.

Both options become real. The asymmetry between them shrinks. The decision becomes less about avoiding a phantom catastrophe and more about choosing which set of costs you actually want to pay.

Krishna's deeper point — this is the part nobody quotes — is that all paths cost. There is no costless path. The chariot has to move. The choice is not between cost and no-cost. The choice is between a cost that grows you and a cost that hollows you. Once you see clearly that both options cost, the decision often gets easier. You stop hunting for the free option that does not exist.`,
      practice: {
        name: "The Shadow-Life Letter",
        durationMin: 8,
        instructions: `Take a piece of paper. Pick the two leading options for your decision.

For each option, write a short paragraph — three sentences max — describing your life five years from now if you took that path. Be honest. Include the gains and the costs. Do not romanticize.

Read both back. Ask: which set of costs am I willing to live with? Which set of gains is worth those costs?

The answer that emerges is rarely the one you were performing for others.`,
      },
      reflection: "What does the shadow life of your 'safer' option actually look like at year five?",
    },
    {
      day: 7,
      title: "The Decision Protocol",
      oneLine: "Six moves. Ten minutes. You are ready.",
      reading: `Today we put it together. You now have everything you need. Here is the full Krishna protocol, which you can run on any decision for the rest of your life. Save it. Use it.

**The Krishna Six-Move Decision Protocol**

**1. Name the decider.** Which version of you is being asked to decide? If it is the tired, scared, hungry, or rushed version, stop. Wait.

**2. Apply the pride test.** For each option, finish: *if this choice fails, I will still be proud I chose it because ____.* Options that fail this test are being driven by fear of outcome, not by character. Set them aside.

**3. Check the weather.** Are you in sattva, rajas, or tamas? Only finalize in sattva. If you are not in sattva, gather information now and decide tomorrow morning.

**4. Test svadharma.** Which option is closer to *your* lane — to the thing your life makes time disappear for — and which is closer to someone else's lane?

**5. Visit the witness.** Sit for five minutes. Let the chooser go quiet. From the witness, look at the options again. Notice which one feels lighter, which feels heavier. Heavier is not always wrong, but the witness's data is real data.

**6. Walk the shadow life.** Write the honest year-five version of each option's life. Choose the costs you want to pay. Both options cost. Pick the cost that grows you.

That is the entire protocol. Six moves. Ten minutes for a small decision. Maybe a full week for a life decision. You will find, with practice, that most of your hard decisions only ever needed steps 1, 2, and 3 — they were being made by the wrong you, in the wrong weather, with the wrong question.

Krishna's final teaching to Arjuna, at the end of the eighteen chapters, is one sentence: *yatha icchasi tatha kuru* — now do as you wish. Krishna does not tell him what to do. After all of it, the decision is still Arjuna's. The teaching does not remove the burden of choice. It just makes sure the chooser is the right one.

Welcome to the rest of your life. You now have a tool most adults never get.

— Krishna, via Samir`,
      practice: {
        name: "Run the Protocol",
        durationMin: 12,
        instructions: `Take the decision you've been carrying all week.

Run all six moves on it, in order. Spend roughly two minutes per move.

At the end, do not force a final answer. Just notice: where does the protocol point? What does it surface that you had been avoiding?

Sleep on it tonight. Tomorrow morning, in sattva, decide.`,
      },
      reflection: "If you used this protocol on every heavy decision for the next year, how different would your life look?",
    },
  ],
};

// ============================================================================
// PROGRAM 2 — THE ONION: WHO AM I? WITH RAMANA
// ============================================================================
const THE_ONION: ShowroomProgram = {
  slug: "the-onion-who-am-i",
  title: "The Onion: Who Am I?",
  subtitle: "Seven days peeling back the layers you mistook for yourself — with the silent sage of Arunachala.",
  guru: "Ramana Maharshi",
  guruRole: "the sage who, at 16, sat down, asked one question, and never moved again",
  theme: "🧅",
  color: "from-amber-600/30 via-yellow-500/20 to-emerald-500/10",
  category: "self-inquiry",
  duration: "7 days",
  promise: "By day 7 you will have direct experience — not belief — that you are not your thoughts, not your body, not your story. You are what notices all three.",
  days: [
    {
      day: 1,
      title: "The Thought-World",
      oneLine: "You don't live in the world. You live in your thoughts about it.",
      reading: `Here is something nobody told you in school. The world you experience is not the world. The world you experience is **your thoughts about the world**, projected at high speed on the inside of your skull, in a continuous show you have mistaken for reality.

This is not philosophy. It is anatomy. Light hits your eyes and is converted to electrical impulses. Sound hits your ears, same thing. Touch, taste, smell — all electrical signals, none of them "the thing itself." Your brain takes these signals and builds a model. The model is what you experience. You have never, in your life, touched the world directly. You have only ever touched your model of it.

Now add this: the model is mostly made of *thoughts*. The thought *this person is annoying* arrives 200 milliseconds before you have actually finished hearing what they said. The thought *I am tired* arrives before you have actually checked the body. The thought *this will go badly* arrives before the meeting starts. These thoughts then color everything you "see." You are not seeing the world. You are seeing the world through a thick, fast-moving, mostly unconscious layer of commentary.

Ramana's whole teaching begins here. He looked at this thought-world and asked one question: *who is the one having these thoughts?* Not the thoughts themselves — the one who is *aware* of them. The watcher behind the show.

This week, you are going to peel back the layers — like an onion — until you find what is actually there underneath. Today, just notice the show. Not its contents. Its existence. There is a constant inner narration. You did not start it. You cannot fully stop it. It runs whether you want it to or not. Until you see it as a show, you will mistake it for reality.

That is the first layer of the onion. You are not the thoughts. You are what they happen *in*.`,
      practice: {
        name: "See the Show",
        durationMin: 5,
        instructions: `Sit quietly. Close your eyes.

For five minutes, do nothing. Just watch the thoughts come.

Do not try to stop them. Do not engage them. Just notice each one as it arrives, like watching a TV in another room.

Every time you catch yourself inside a thought — drawn in, lost in it — notice that, and step back to watching. The stepping-back *is* the practice.

By the end, you should have a small but clear felt sense: there is a show, and there is a watcher of the show. They are not the same.`,
      },
      reflection: "When you noticed a thought instead of being it — even for a second — what was the noticer?",
    },
    {
      day: 2,
      title: "Layer 1 — The Body",
      oneLine: "You have a body. You are not it.",
      reading: `Most people, asked "who are you?", will eventually point at their body. *This. This is me.* The body has your name on its ID, the body's face is in your photos, the body is what other people interact with. Of course the body is you.

Except — watch carefully — the body is *something you have*, not something you *are*. Right now, you can be aware of your left foot. The foot is being observed. There is the foot, and there is the awareness of the foot. The foot is not aware. *You* are aware *of* the foot. They are not the same.

Run the same test on the whole body. Become aware of your back against the chair. Your hands resting. Your chest rising. The body is the thing being noticed. You are the noticer. The two are clearly distinct in your direct experience — you only forget the distinction because the noticer is so silent and the body so loud.

Now consider: every seven years, most of the cells in your body have been replaced. The body you have now is not, materially, the body you had at twelve. But *you* — the one who remembers being twelve — are the same one. So the "you" cannot be the cells. The cells turned over. The watcher remained.

This is the second layer of the onion. The body is real. The body is not nothing. The body is not "an illusion" in any cheap sense. But the body is **not the deepest answer to the question "who am I?"** It is one layer of the answer. The watcher of the body is closer.

Ramana, when asked, would often touch his chest and say: "I am not this." Then he would touch his head and say, "I am not this either." Then he would go quiet, because the next answer cannot be pointed to. It can only be noticed.

Today, notice the noticer of the body.`,
      practice: {
        name: "The Body Is Observed",
        durationMin: 6,
        instructions: `Lie down or sit comfortably. Close your eyes.

Slowly bring awareness to each part of the body — feet, legs, hips, belly, chest, hands, arms, neck, face. About twenty seconds each.

For each part, do not just feel it. Notice that you are *observing* it. The foot is being observed. The chest is being observed.

At the end, ask: who is the observer? Do not answer with words. Just rest in the noticing.`,
      },
      reflection: "If your body is what you observe, what is the one doing the observing?",
    },
    {
      day: 3,
      title: "Layer 2 — The Breath and the Energy",
      oneLine: "The breath breathes itself. You are not the breather.",
      reading: `Peel one more layer. Below the body is the breath, and below the breath is something the yogis called *prana* — the life energy, the thing that animates the body before the body becomes a corpse.

Try this. Pay attention to your breath right now. Notice that it is happening. You did not consciously decide to inhale. Your nervous system decided. Your job, mostly, is to not interfere. The breath is breathing itself.

This is a small thing and a huge thing. Small because it is obvious — of course breathing is automatic. Huge because the breath is the most intimate, continuous activity of your life, and *you are not the one doing it*. Something else is. You are watching it.

The yogis went further. They said that beneath the breath there is a subtler current — prana — and beneath prana there is awareness itself, and the relationship between them is like wind, smoke, and sky. The wind (breath) moves the smoke (prana) across the sky (awareness). The sky does not move. The sky is what the moving happens in.

For seven days of self-inquiry, this is the third layer of the onion. The breath is real. The energy is real. They are *yours* in the way the body is yours — close, intimate, but not the deepest answer. The breath happens *in* you. It is not you.

There is a beautiful practical implication. When the breath is short, fast, ragged — you can feel it as a movement in awareness rather than as "your" agitation. The breath is doing something. You are watching the breath do something. From the watching, you can soften the breath, and the body softens with it. This is the entire mechanism of every yogic practice. You are not changing the breath; you are widening the space the breath is happening in, and the breath responds.

Today, watch the breath as something separate from you.`,
      practice: {
        name: "Watch the Breath Breathe",
        durationMin: 6,
        instructions: `Sit upright. Close your eyes. Do not control the breath.

For six minutes, watch the breath happen. Notice the slight pause at the top of the inhale. Notice the slight pause at the bottom of the exhale.

Do not breathe deeply on purpose. Do not slow it down. Just watch.

Notice: the breath is doing this on its own. You are not driving it. You are witnessing it.

That witnessing is the third layer in. Stay there.`,
      },
      reflection: "If the breath is happening on its own, who is the one noticing that it is happening?",
    },
    {
      day: 4,
      title: "Layer 3 — The Emotions",
      oneLine: "Emotions move through you. They are not the you they move through.",
      reading: `Emotions feel more "you" than the body does. When you are angry, you are not *observing* anger from a distance — you *are* angry. Anger seems to fill the whole field. There is no observer left.

But watch closely the next time anger comes. There is a sequence. First a sensation — heat in the chest, tightness in the jaw. Then a thought — *this is unfair*. Then an impulse — *say something sharp*. Then, if you do not interrupt the sequence, a behavior — the sharp words come out.

Now notice: you can, with practice, catch the sensation before the thought. You can catch the thought before the impulse. You can catch the impulse before the behavior. Each of those catches is a moment of *observing the emotion instead of being it*. And every contemplative tradition on earth, when you strip away the costumes, is teaching this one skill.

The emotion is *moving through* awareness. It is not awareness. It arises, peaks, and dissolves — usually in 90 seconds if you do not feed it with story, as the neuroscientist Jill Bolte Taylor documented in her own stroke recovery. Most emotional suffering is not the emotion. It is the *story you build on top of the emotion to keep it going*.

This is the fourth layer of the onion. The emotional life is real and important. You are not asked to suppress it, ignore it, or transcend it. You are asked only to notice that emotions are *content* moving through you, and you are *the field they move through*.

When you can hold an emotion as something arising, peaking, and dissolving — without becoming it — you have crossed a threshold most adults never cross. You can be angry without being hijacked by anger. You can be sad without disappearing into sadness. You are still here. The emotion is just weather passing through.`,
      practice: {
        name: "The 90-Second Watch",
        durationMin: 6,
        instructions: `Recall a recent moment that made you angry, hurt, or anxious. Bring it back vividly.

Let the emotion arise in the body. Notice — where does it sit? Chest? Stomach? Throat?

For 90 seconds, do not feed it with story. Do not rehearse the argument. Do not justify yourself.

Just feel the sensation, and watch it. Notice it rise, peak, and start to soften. Notice that *you are still here* the whole time. The emotion is moving. You are not.`,
      },
      reflection: "If emotions move through you, what is the unmoving thing they move through?",
    },
    {
      day: 5,
      title: "Layer 4 — The Thoughts",
      oneLine: "Thoughts arise on their own. You are not the thinker.",
      reading: `This is the strangest layer to peel, because it sounds almost crazy when stated plainly: *you are not the thinker of your thoughts*.

But watch carefully right now. Where does the next thought come from? Try, for ten seconds, to predict what your next thought will be. You cannot. Thoughts arrive unannounced. You did not decide what your last thought would be. You did not choose to suddenly wonder if you closed the front door. The thought came. You noticed it.

If you were the thinker, you would be able to choose what to think. You cannot. You can sometimes choose what to do with a thought after it arrives, but you did not author it. It authored itself, from sources you cannot see, and presented itself to your awareness.

This is the fifth layer of the onion. Thoughts arise. You are not their author. You are the field in which they arise.

Ramana's most famous technique, *atma vichara* — self-inquiry — works on exactly this layer. He said: when a thought arises, instead of following it, ask *to whom does this thought arise?* The answer is "to me." Then ask, *who is this me?* And follow the question inward.

What you find, if you follow it honestly, is not another thought. You find a silence. A presence. A something-that-is-aware that has no content of its own. The watcher of the thoughts is not, itself, a thought. It is whatever the thoughts are appearing inside.

This is closer to what you are. Not the thoughts. The space they appear in.

Be patient with this. It is not an idea to agree with. It is a fact to notice, repeatedly, over years, until the noticing becomes your default ground instead of the thoughts.`,
      practice: {
        name: "Who Is Thinking?",
        durationMin: 7,
        instructions: `Sit quietly. Close your eyes.

When the next thought arises — and it will arrive in seconds — instead of following it, ask: *to whom did this thought come?*

The answer will be: "to me." Then ask: *who is this me?*

Do not answer with words. Just hold the question. Let it pull awareness back, away from the thought, toward the one noticing.

Repeat each time a thought comes. The question is the practice. The silence the question opens is the answer.`,
      },
      reflection: "If you are not the thinker — if thoughts arrive on their own — who is the 'you' they arrive to?",
    },
    {
      day: 6,
      title: "Layer 5 — The Story of Me",
      oneLine: "Your story is a thought-pattern. It is not you.",
      reading: `Underneath the thoughts is the deepest layer most people ever look at: the *story of me*. The narrative — *I am the kind of person who, I always have, I never could, my problem is, my strength is*. The continuous self-biography you have been writing in your head since childhood.

This story feels load-bearing. It feels like *you*. It is the thing that gets defended in arguments, the thing that gets bruised by criticism, the thing that swells with praise. The story is the ego — not in the cheap "arrogance" sense, but in the precise sense the Vedantic tradition gave it: the *ahamkara*, the "I-maker," the constant background process that takes raw experience and stamps "mine" on it.

Watch this carefully. The story is itself made of thoughts. A specific recurring pattern of thoughts. *I am someone who was not loved enough by my father.* *I am someone who succeeds when others doubt me.* *I am someone who always sabotages relationships.* These are not facts. They are thought-patterns. They are stories you have told yourself so many times they have hardened into something that feels like identity.

Now ask: if thoughts are not you (yesterday's layer), and your story is made of thoughts, then... is your story you?

This is the most disorienting question in self-inquiry. Because if the story is not you, then everything you have been defending, optimizing, hating, and improving was — at the deepest level — a fiction you mistook for yourself. The fiction is real in the way a movie is real. It is happening. It has effects. But it is not what you are.

What you are, Ramana said, is what the story is *appearing inside*. The screen on which the movie of "me" is playing. The screen is not made of the movie. The screen is what allows the movie to be seen.

This does not mean the story is bad or should be destroyed. The story is useful. You need it to file taxes, raise children, hold a job. The teaching is not "kill the story." The teaching is: *know the story is a story, and stop letting it run the deepest decisions of your life*. From the screen, the story is just one show, not the whole of reality.

That is the sixth layer of the onion. Almost there.`,
      practice: {
        name: "Question the Story",
        durationMin: 8,
        instructions: `Sit quietly. Write down, in one sentence, the strongest "I am" story you carry. *I am someone who ____.*

Now, for each story you wrote, ask: is this absolutely, demonstrably true? Or is it a pattern of thoughts I have rehearsed for years until it felt true?

Find at least one counterexample for each story. A moment that contradicts the narrative. Even one moment proves the story is not fixed reality — it is interpretation.

Sit with this for two minutes. The story is loosening. The screen is showing through.`,
      },
      reflection: "If the story of you is just a recurring pattern of thoughts, who is the one those thoughts have been about?",
    },
    {
      day: 7,
      title: "The Core — Awareness Itself",
      oneLine: "You are the awareness in which all of this is happening.",
      reading: `Here is the center of the onion.

We peeled the thought-world. We peeled the body. We peeled the breath, the energy, the emotions, the thoughts, the story. Each layer turned out to be *something you are aware of*, not what you are.

What is left, when everything you can observe has been set aside as "not me"?

What is left is **the awareness that was doing the observing**. It has no shape. It has no color. It has no story. It cannot be photographed, located, or weighed. But it is the most certain thing in your existence — more certain than the chair you are sitting on, because you only know about the chair *through* it.

That awareness is what Ramana called the *Self* with a capital S — the only thing in all of human experience that is unchanging, present, and yours from the inside. It is what you mean when you say "I am" before you add anything else to it. "I am tired" — the awareness was there before the tired. "I am happy" — same. "I am Samir" — same. The "I am" is older than every label you have ever attached to it.

You have always been this awareness. You will always be this awareness. The seven layers of the onion — body, breath, energy, emotions, thoughts, story, thought-world — change constantly. The awareness in which they all appear has not changed since you were a child. The same awareness was watching the seven-year-old you eat ice cream. The same awareness will watch your last breath.

That is what you are. Not what you have. Not what you do. Not who you are perceived to be. What you *are*.

This is not a belief you have to adopt. It is a fact you can verify directly, right now, by simply noticing that you are noticing. The noticer is here. The noticer has always been here. The noticer is you.

Welcome home.

— Ramana, via Samir

*The practice does not end after seven days. The practice is the rest of your life. Every time you remember to notice the noticer, you are home again. You will forget, often. You will return. The returning is the path.*`,
      practice: {
        name: "Rest as Awareness",
        durationMin: 10,
        instructions: `Sit upright. Close your eyes.

Notice the body. Set it aside — it is observed, not the observer.
Notice the breath. Set it aside.
Notice emotions arising. Set them aside.
Notice thoughts arising. Set them aside.
Notice the story-of-me arising. Set it aside.

What is left? The noticing itself. The bare awareness.

Rest there. Do not try to do anything. Do not try to *be* it — you already are it. Just rest, as awareness, knowing itself.

If a thought pulls you out, gently return. Each return is the practice.

When you are ready, open your eyes. Carry the noticer into the rest of the day.`,
      },
      reflection: "Now that you've met it directly — even briefly — how could you possibly forget what you are?",
    },
  ],
};

// ============================================================================
// PROGRAM 3 — STOP THE REACTOR WITH PATANJALI
// ============================================================================
const STOP_THE_REACTOR: ShowroomProgram = {
  slug: "stop-the-reactor",
  title: "Stop the Reactor",
  subtitle: "Seven days widening the gap between stimulus and response — the Patanjali way.",
  guru: "Patanjali",
  guruRole: "the compiler of the Yoga Sutras, the most precise nervous-system manual ever written",
  theme: "🔥",
  color: "from-rose-500/30 via-red-500/20 to-amber-500/10",
  category: "nervous",
  duration: "7 days",
  promise: "By day 7 your reaction time on a triggering message will be at least 30 seconds longer than it is today. That is enough to change a marriage.",
  days: [
    {
      day: 1,
      title: "The 120-Millisecond Problem",
      oneLine: "Your nervous system decides before you do. That's the actual issue.",
      reading: `Here is the inconvenient fact almost all "anger management" advice ignores.

When you read a sharp message, the amygdala — a small structure deep in your brain — fires a threat signal in about 120 milliseconds. That is faster than you can blink. Cortisol and adrenaline begin to release. Heart rate climbs. Peripheral vision narrows. The prefrontal cortex — the slow, reflective, nuanced part of the brain — gets less blood than it normally has. By the time you "decide" to type a sharp reply, the decision has already been made downstream. Your cortex is just writing the press release for a war the limbic system declared three seconds ago.

This is why willpower fails here. Willpower lives in the cortex. The reaction starts in the amygdala. By the time willpower arrives at the scene, the crime has been committed and the getaway car is at the airport.

What works is not willpower. What works is **changing the wiring upstream of the response** — making the nervous system itself less reactive, so that when the same trigger arrives next week, the amygdala fires less hard, and you have more milliseconds to choose.

This is what Patanjali's eight limbs of yoga are, mechanically. They are nervous-system training. *Yama* and *niyama* — the ethical limbs — reduce the kind of life situations that keep your sympathetic nervous system on high alert. *Asana* and *pranayama* — posture and breath — directly downregulate the system. *Pratyahara, dharana, dhyana, samadhi* — the inward limbs — train attention so that when a trigger does arrive, you have a stable observer instead of a flooded reactor.

Seven days is not enough to walk all eight limbs. But seven days is enough to install the one mechanical change that begins everything else: a longer exhale than inhale.

Today you start.`,
      practice: {
        name: "4-in, 8-out (×10)",
        durationMin: 3,
        instructions: `Sit upright. Close your eyes.

Breathe in through the nose, slowly, for a count of 4.
Breathe out through the nose, even more slowly, for a count of 8.

Do this for 10 breaths. The exhale is twice the inhale. That is the entire practice.

If 8 is too long today, do 3-in, 6-out. The ratio matters more than the absolute count.

Do this three times today — morning, mid-afternoon, evening. Set a phone reminder.`,
      },
      reflection: "When was the last time you reacted to a message before fully reading it?",
    },
    {
      day: 2,
      title: "The Vagus Nerve",
      oneLine: "There is a physical brake on reactivity, and you can press it.",
      reading: `Stephen Porges has spent forty years studying the vagus nerve — the longest cranial nerve in the body, winding from the brainstem through the throat, heart, lungs, and gut. It is the body's parasympathetic backbone, the system that calms you down when nothing is wrong.

The vagus has two branches. The ventral vagal branch is the "social engagement" state — calm, present, available, able to connect. The dorsal vagal branch is the "shutdown" state — collapse, dissociation, the freeze response. Between them sits the sympathetic state — fight or flight.

A chronically reactive person is stuck oscillating between sympathetic and dorsal vagal. They are either fighting or shutting down. The ventral vagal state — the one where considered response is even possible — has become a stranger.

Here is the good news. The vagus is *trainable*. Specific practices measurably raise vagal tone — the body's capacity to return to ventral vagal after a stressor. The single most effective and accessible practice is **slow exhale breathing**. The exhale activates the parasympathetic system. Heart rate drops on the exhale. Over time, the baseline shifts.

Other trainers: cold water on the face (the dive reflex), humming and chanting (the vagus runs through the vocal cords), and gentle gargling. None of them are mystical. All of them are documented in peer-reviewed research.

Today, add one tool to yesterday's breath practice: humming. After your 10 breaths, hum a low note for the length of three exhales. The vibration directly stimulates the vagus nerve. You will feel a faint softening in the chest and throat. That is the vagal brake engaging.

You are not learning a trick. You are physically training a nerve.`,
      practice: {
        name: "Breath + Hum",
        durationMin: 5,
        instructions: `Sit upright. Close your eyes.

Do 10 breaths of 4-in, 8-out (yesterday's practice).

Then take a normal breath in, and on the exhale, hum a low, comfortable note — like the end of "Om" — until the breath runs out.

Do this three times. Feel the vibration in the chest, throat, and even the face.

Notice afterward: the body is slightly softer. The mind slightly quieter. That is the vagus, working.`,
      },
      reflection: "Have you noticed that your face or chest feels slightly different after the humming?",
    },
    {
      day: 3,
      title: "The Trigger Map",
      oneLine: "You have a small number of triggers. Most reactions are the same five fires.",
      reading: `Today you do reconnaissance. Almost everyone who is reactive has a small, predictable, almost embarrassing list of triggers. Three to seven items. The same buttons get pressed by the same kinds of people in the same kinds of situations, year after year. Until you map them, you will keep being surprised by your own reactions.

A trigger is a stimulus that produces a disproportionate amygdala response in *you specifically*. Other people may step over the same stimulus without noticing. The trigger is not a universal threat; it is a personal one, usually wired in early, often associated with a moment in childhood when you genuinely were not safe.

Common adult triggers include: being interrupted, being dismissed, being criticized in front of others, being made to wait, being told what to do by someone you do not respect, having your competence questioned, having your motives questioned, being ignored. There are many more. Yours will be specific.

The first step in widening the gap is to know exactly where the gap collapses. If you know that "being interrupted in meetings" is one of your top three triggers, you can set up the nervous system in advance — slow exhale before the meeting, mental rehearsal of staying calm if it happens. You are not surprised. The amygdala fires, but the prefrontal cortex was already warmed up. You catch the impulse before the behavior.

Today, write the list. Be honest. The list is private. The more honest you are, the more useful it gets.

Then mark the top three. Those are the ones you will work with for the rest of the week.`,
      practice: {
        name: "Map Your Triggers",
        durationMin: 10,
        instructions: `Take a piece of paper. List every situation in the last six months when you reacted in a way you later regretted.

For each one, ask: what was the actual trigger? (Not "she said X" — the underlying pattern. Being dismissed? Being controlled? Being ignored?)

You will see a small number of patterns repeating. Three to seven.

Circle the top three. Write next to each one: "When this happens next time, before reacting, I will take five slow exhales."

That sentence is your new rule. Pin it somewhere visible.`,
      },
      reflection: "What are the three triggers that have cost you the most peace in the last year?",
    },
    {
      day: 4,
      title: "The Pause",
      oneLine: "All freedom lives in the gap between stimulus and response.",
      reading: `Viktor Frankl, the Holocaust survivor and psychiatrist, wrote one of the most quoted sentences in modern psychology: *Between stimulus and response there is a space. In that space is our power to choose our response. In our response lies our growth and our freedom.*

The whole project of inner work, from Patanjali to today, is widening that space.

In a Band-0 sleeper, the space is essentially zero. The stimulus comes, the response comes, the gap is invisible. In a chronically reactive Band-1 adult, the space is maybe one or two seconds — enough to notice the impulse, not enough to redirect it. In a trained Band-2 practitioner, the space has widened to five or ten seconds — long enough to take a breath, leave the room, or send a different sentence. In a deeply contemplative person, the space can extend to minutes, hours, or even days — the trigger arrives, is noticed, sat with, considered, and only then responded to (if at all).

You are training the gap. That is the whole task of this program.

The mechanical move today is *The Pause* — a deliberate, ritualized two-second delay between trigger and action. Not a long meditation. Just two seconds.

The next time you feel a trigger fire — heat in the chest, sharp impulse to reply — you do one thing first. You take a single, slow, full exhale. That is it. The exhale lasts about three to five seconds. By the end of it, your nervous system has shifted slightly. The reactive impulse has lost a small but real percentage of its force. The cortex has caught up.

You are not asked to become enlightened today. You are asked to install a two-second delay. That is achievable, and that is enough to begin changing the shape of your relationships.`,
      practice: {
        name: "Install The Pause",
        durationMin: 4,
        instructions: `Today, every time you reach for your phone in response to a notification, pause first. One slow exhale. Then look.

This is rehearsal. The reach-for-the-phone reflex is the closest analogue to a trigger response. By inserting a deliberate exhale before each one, you are training the nervous system to expect a gap.

Do it for the entire day. Notice, by evening, how many times you had to remember.

The remembering is the practice. The forgetting is also the practice. Both train the muscle.`,
      },
      reflection: "What changed in the day when you put a single exhale before each notification?",
    },
    {
      day: 5,
      title: "Pratipaksha Bhavana",
      oneLine: "When a destructive thought arises, deliberately introduce its opposite.",
      reading: `Patanjali offers a specific, mechanical technique for thoughts that fuel reactivity. He calls it *pratipaksha bhavana* — literally, "cultivating the opposite." It is in Yoga Sutra 2.33.

Here is how it works. You notice you are about to react to your partner with a sharp comment. The thought running is *they always do this, they never listen, this is unfair*. Pratipaksha bhavana says: in the moment, deliberately introduce the opposite thought. Not as a lie. As a balancing pole.

The opposite thought is not "they are perfect" — that would be a lie, and a lie won't hold. The opposite thought is something like: *they are doing the best they can with the version of themselves available right now*, or *this is the same person I once loved enough to choose*, or *they did three kind things for me yesterday I forgot to register*.

You don't have to believe the opposite thought fully. You just have to introduce it. The act of introducing it forces the brain to do something it wasn't going to do — generate a balancing perspective. Even if the original reactive thought wins, it now has competition. The amygdala's monopoly on the moment is broken.

This is not positive thinking. Positive thinking is sugar. *Pratipaksha bhavana* is **structural balance**. You are not pretending the trigger isn't real. You are refusing to let one narrative monopolize the moment.

Patanjali says: when destructive thoughts arise, cultivate their opposites, because destructive thoughts lead to suffering, and suffering is the actual enemy — not the trigger, not the other person, but the suffering you create by feeding the destructive thought until it runs your behavior.

For the next 48 hours, every time a reactive thought arises, do not push it away. Just add its honest opposite alongside it. Notice what happens.`,
      practice: {
        name: "The Opposite Thought",
        durationMin: 5,
        instructions: `Recall a recent moment when you had a sharply reactive thought about someone — partner, parent, colleague, stranger.

Write the original thought in one sentence.

Now write, beneath it, the honest opposite — not a lie, but a balancing truth you had been ignoring.

Hold both thoughts side by side. Notice that both are true. The reaction softens, not because the trigger went away, but because it no longer owns the whole frame.

Do this in real time today, mentally, every time a sharp thought arises.`,
      },
      reflection: "What honest opposite have you been refusing to hold alongside your sharpest current grievance?",
    },
    {
      day: 6,
      title: "The 24-Hour Rule",
      oneLine: "No important message gets answered the same day it lands.",
      reading: `Now we install a rule that will, by itself, change the texture of your professional life.

The rule is simple: **any message that triggers a sharp emotional response is not answered for at least 24 hours**. Not "I'll cool down for an hour." Twenty-four hours minimum.

Why so long? Because the cortisol cycle from a strong amygdala response takes longer to clear than people think. The biochemistry of "I am angry about that email" is, in your body, still measurably present three to four hours later, even when the conscious mind has moved on. A reply written at hour two is still a reply written by a partially flooded nervous system.

By hour 24, you have slept. Sleep is the brain's deepest reset. The emotional charge attached to the memory of the message has been processed and largely metabolized. You can read the same message in the morning and frequently see something you didn't see the night before — a fair point, a piece of context, a reasonable interpretation you missed.

This rule has costs. Some people will think you are slow. Some will press. Some will escalate. Hold the rule anyway. The reputation you will build, over years, is of someone whose written word is considered, accurate, and rarely regretted. That reputation compounds. It compounds so heavily it eventually becomes one of the most valuable professional assets you own.

The exception: genuinely time-critical operational messages where a delay would harm someone. These are rare. Almost no professional message is truly time-critical in this sense.

The most reactive people I know habitually claim that "this one is different" and "I have to reply tonight." It is almost never true. The cost of waiting a day is almost always lower than the cost of one badly worded reply.

Today, install the rule. The next message that makes your chest tighten — you do not answer it today. Tomorrow morning, you decide what to say.`,
      practice: {
        name: "The 24-Hour Hold",
        durationMin: 2,
        instructions: `For the next week, every message that produces a sharp reaction in you is not answered for at least 24 hours.

When such a message arrives today, do this:
1. Read it once. Notice the reaction in the body.
2. Close the app. Do not draft a reply.
3. Take 10 breaths of 4-in, 8-out.
4. Schedule a tomorrow-morning calendar block titled "respond to ____."
5. Do something else.

Tomorrow morning, in sattva, decide what to say. You will say something different. It will almost always be better.`,
      },
      reflection: "How many of last month's regretted sentences would have died if you had held them 24 hours?",
    },
    {
      day: 7,
      title: "The Reactor Becomes the Engine",
      oneLine: "The fire that burned the house down becomes the fire that drives the practice.",
      reading: `One last thing, on the seventh day, that I want every reactor to hear, because it is true and rarely said.

The reactive person has more energy in their nervous system than the average sleeper. They feel everything more loudly. The same wiring that throws them into a fight at 2 p.m. is the wiring that, properly trained, becomes the most powerful tool a serious practitioner owns. The sages had a word for it: *tapas* — the heat of practice, the fire that burns through karmic residue.

Look at the great teachers. Milarepa committed multiple murders before he sat in a cave for twelve years and became Tibet's most beloved saint. Valmiki was a bandit before he wrote the Ramayana. Augustine was a chronically restless womanizer before he wrote the Confessions. Vivekananda was a fierce, argumentative teenager before he became the voice that introduced Vedanta to the world. The fire was always going to be the engine. The only question was whether it would burn the house down or burn the karma down.

The fire is not the problem. **Untrained**, the fire is the problem. Trained, the fire is the gift.

You have spent seven days beginning the training. You have learned to slow the exhale, tone the vagus, map the triggers, install the pause, cultivate the opposite, hold the message. None of this removes your fire. All of it gives the fire a different exit.

If you keep practicing — and "practice" here means doing the breath and the pause daily, not perfectly, just daily, for the rest of your life — the reactor in you becomes the most useful version of you. The person who feels everything sharply *and* responds slowly is one of the rarest and most valuable humans in any room. They are the leaders, the negotiators, the artists, the parents whose children turn out steady.

That is your inheritance. You were not given the small, polite nervous system. You were given the big, hot one. The yogis say that those born with this wiring are closer to liberation than the comfortable ones, because their suffering is sharper and their motivation is stronger.

Welcome to the path.

— Patanjali, via Samir`,
      practice: {
        name: "The Daily Two",
        durationMin: 5,
        instructions: `From today onward, two practices, every day, for the rest of your life:

Morning: 10 breaths of 4-in, 8-out. Three minutes.
Evening: 10 breaths of 4-in, 8-out, plus 3 hums.

That is it. Five minutes total.

Skip a day, no guilt. Skip a week, return without ceremony. The practice is the return, not the streak.

In six months, your baseline heart rate variability will have measurably risen. In a year, the people closest to you will tell you, without prompting, that you have changed.`,
      },
      reflection: "Now that the fire is being trained instead of suppressed — what could you build with it?",
    },
  ],
};

// ============================================================================
// PROGRAM 4 — WATCH YOUR THOUGHTS WITH BUDDHA
// ============================================================================
const WATCH_YOUR_THOUGHTS: ShowroomProgram = {
  slug: "watch-your-thoughts",
  title: "Watch Your Thoughts",
  subtitle: "Seven days of pure sati training — the foundational practice every other practice rests on.",
  guru: "The Buddha",
  guruRole: "the prince who sat under a tree for forty-nine nights and figured out the one thing",
  theme: "🪷",
  color: "from-violet-500/30 via-fuchsia-500/20 to-rose-500/10",
  category: "attention",
  duration: "7 days",
  promise: "By day 7 you will have a stable, daily, ten-minute capacity to watch your mind from a small distance. Every other contemplative practice rests on this one.",
  days: [
    {
      day: 1,
      title: "Sati",
      oneLine: "There is one Pali word that holds the whole practice.",
      reading: `The Buddha taught for forty-five years and never wrote anything down. The teaching survived because his close students memorized his discourses and chanted them every day for centuries. When the chants were finally written, around 100 BCE in Sri Lanka, a small set of Pali words appeared again and again. One of them, more than any other, was *sati*.

*Sati* is usually translated as "mindfulness." This translation is technically defensible and structurally catastrophic. "Mindfulness" in modern English suggests *being mindful of* — paying attention to, being careful with. *Sati* in Pali means something more specific. It means *bare remembering*. The act of remembering, in the present moment, *that you are here*.

Think about it. Most of the day, you are not aware that you are aware. You are inside your thoughts, inside your activities, inside the river of moment-to-moment experience, without ever stepping back and noticing *that you are the one experiencing all this*. *Sati* is the small move of remembering. It takes a fraction of a second. You can do it right now, reading this sentence: *I am here, reading. There is an awareness reading the words.*

That is sati. It is the simplest thing on earth, and it is the gate to the entire path.

The Buddha said sati is the seventh factor of the Noble Eightfold Path because without it, none of the other factors work. You cannot have right action without remembering, in the moment of action, that you are acting. You cannot have right speech without remembering, in the moment of speaking, that you are speaking. The remembering — the bare, non-judgmental noticing — is the field on which everything else happens.

This week, you train sati. Nothing fancy. Just the bare remembering, again and again, until it becomes background instead of effort. By the end of the week you will not be enlightened. You will, however, be substantially more here than you have been in years.`,
      practice: {
        name: "Three Breaths of Sati",
        durationMin: 2,
        instructions: `Sit or stand. Close your eyes.

Take three slow breaths.

For each breath, say silently to yourself: *I am here. I am breathing. There is an awareness, breathing.*

That is the whole practice. Three breaths. Two minutes.

Do this five times today — whenever you remember. The doorway, the stairs, the kitchen, the moment before you open a screen. Each time is one rep.

The remembering is the practice. The forgetting is also the practice. Both train the muscle.`,
      },
      reflection: "How many minutes of today were you actually here, and how many were you somewhere else inside your head?",
    },
    {
      day: 2,
      title: "The Four Foundations",
      oneLine: "There are four places you can rest sati. Start with the breath.",
      reading: `The Buddha's most detailed instruction on sati is the *Satipatthana Sutta* — the Discourse on the Foundations of Mindfulness. It lists four places where awareness can rest: the body, feelings, mind-states, and mental objects. They are called the four *satipatthanas*, the four foundations.

You can become aware of the body — its posture, its breath, its sensations. You can become aware of feelings — the pleasant, unpleasant, or neutral tone of each experience. You can become aware of mind-states — is the mind agitated, calm, contracted, open? You can become aware of mental objects — the thoughts and patterns themselves, watched as objects in awareness rather than identified with.

The Buddha said all four are valid entry points, but he gave one of them more weight than the others: **the breath**. Almost the entire Satipatthana Sutta opens with breath-awareness, because the breath has a unique property — it is the only autonomic process you can also consciously observe and modify. The breath is both involuntary (it happens on its own) and voluntary (you can lengthen, shorten, pause it). It is the bridge between the body and the mind.

For the next six days you will rest sati on the breath. This is the single most universal contemplative practice on earth. Christian monks call it *recollection*. Sufi practitioners call it *muraqaba*. Hindu yogis call it *anapana*. Buddhists call it *anapanasati*. All four traditions are doing the same thing: stationing awareness at the breath, returning when it wanders.

The instruction is unromantic. Sit. Watch the breath. When the mind wanders, return. Watch again. Return again. The wandering and returning is the practice. The mind will wander hundreds of times in ten minutes. Each return is a rep. Each rep strengthens sati.

You are not training the mind to stop wandering. You are training awareness to notice the wandering sooner.`,
      practice: {
        name: "Anapanasati — 5 minutes",
        durationMin: 5,
        instructions: `Sit upright. Close your eyes or soften the gaze.

Find the breath at one of two places: the nostrils (cool on inhale, warm on exhale) or the belly (rising on inhale, falling on exhale). Pick one. Stay there.

Watch the breath. Do not control it. Just watch.

The mind will wander, often within seconds. The moment you notice it has wandered — gently, kindly — return to the breath.

The returning is the practice. The wandering is normal. There is no failure here.

5 minutes. Then open eyes.`,
      },
      reflection: "How many times in five minutes did the mind wander, and how did it feel each time you returned?",
    },
    {
      day: 3,
      title: "Naming the Wanderer",
      oneLine: "When the mind drifts, name where it went.",
      reading: `Today we add one small move that dramatically accelerates the practice: *labeling*.

When the mind wanders during anapanasati, instead of just returning to the breath, first name briefly where the mind went. The names are short — one or two words, said silently: "planning," "remembering," "worrying," "fantasizing," "judging." Then return to the breath.

Why does this work? Because the act of labeling does two things at once. It engages the prefrontal cortex (the noticing apparatus), which weakens the amygdala's grip on the moment — a phenomenon documented by Matthew Lieberman's research showing that "affect labeling" measurably reduces emotional arousal. And it creates a small layer of *observer-distance* between you and the thought. You are no longer inside the planning. You are noticing that planning is happening.

Over time, this is how the witness gets built. Each label is a tiny rep of *I am not this thought. This thought is something occurring in me.* Ten minutes of labeled wandering is more useful than thirty minutes of unlabeled wandering, because the labels train the awareness muscle directly.

The labels should be light. Do not analyze the thought. Do not get curious about why you're planning. Do not feel bad about wandering. Just name and return. Name and return. Name and return.

After a week of labeled practice you will start to notice the labels happening *outside* the practice too. You will be in the middle of a conversation and silently note "judging" or "defending" before the words come out of your mouth. That is sati arriving in daily life. That is the whole point.`,
      practice: {
        name: "Label and Return",
        durationMin: 7,
        instructions: `Sit upright. Close your eyes.

Watch the breath, same as yesterday.

When the mind wanders, before returning, briefly label where it went — one or two words, silently. "Planning." "Remembering." "Worrying." "Itch." "Sound." "Story."

Then return to the breath.

7 minutes.

The label should take one second. Do not get lost in the labeling itself.`,
      },
      reflection: "What were the three most common labels you used today?",
    },
    {
      day: 4,
      title: "The Pleasant, the Unpleasant, the Neutral",
      oneLine: "Every experience has a tone before it has a story.",
      reading: `Today we widen sati to include the second foundation: *vedana*, feeling-tone.

The Buddha noticed that every single experience — every sensation, every sound, every thought — arises with one of three feeling-tones: pleasant, unpleasant, or neutral. This tone arrives *before* the conceptual response. You feel the tone in the first 100 milliseconds. Then the story arrives — *this is good, I want more* or *this is bad, I want it to stop*. The story drives the action. But the tone came first, and the tone is what the story is reacting to.

Here is why this matters. Most of human suffering — the Buddha would say *all* of it — comes from grasping at pleasant tones and pushing away unpleasant tones. The grasping and pushing are what create the loops. *I want this pleasant moment to last.* It cannot. *I want this unpleasant moment to end.* It will, but my pushing keeps me locked inside it. The neutral moments — the vast majority of life — go almost completely unnoticed, because there is nothing to grasp or push against.

The practice today is to notice the *tone* of each experience as it arises, before the story gets in. You sit and watch the breath, but you also notice: this breath is pleasant. This one is unpleasant (tight, restless). This one is neutral.

The same goes for thoughts that come during practice. A thought arrives. Before you label its content, notice its tone. Pleasant — *the meeting went well*. Unpleasant — *I'm behind on the project*. Neutral — *I need to buy milk*.

When you can hold the tone separately from the story, two things happen. One, you stop being run by the tones. Two, you discover something quite stunning — that neutral experiences, when actually noticed, are not boring. They are deeply restful. Most of the noise of daily life is the friction of constantly evaluating each moment as good or bad. When you let the neutral moments be neutral, an enormous amount of mental noise goes silent.`,
      practice: {
        name: "Tone Before Story",
        durationMin: 8,
        instructions: `Sit upright. Close your eyes.

Watch the breath. When a thought, sensation, or sound arises, notice its tone first: pleasant, unpleasant, or neutral.

Silently label it: "pleasant," "unpleasant," "neutral." Then return to the breath.

8 minutes.

Notice how many experiences are actually neutral. Notice the small relief that comes when you let a neutral moment be neutral.`,
      },
      reflection: "How many of today's experiences were genuinely neutral but you treated as needing a response?",
    },
    {
      day: 5,
      title: "The Mind Behind the Mind",
      oneLine: "Notice the state of mind, not just its content.",
      reading: `The third foundation of sati is *cittanupassana* — awareness of mind-states.

The mind, at any given moment, is in a state. Sometimes the mind is agitated, sometimes calm, sometimes contracted, sometimes open, sometimes greedy, sometimes generous, sometimes deluded, sometimes clear. The state is the underlying tone of the mind itself — the weather, not the content.

Most people, asked "how is your mind right now?", will answer with content. *I'm thinking about my meeting.* That is content. The state question is different. *Is the mind, right now, agitated or calm? Contracted or open?* The state can usually be sensed in two or three seconds if you bother to look.

The practice today is to periodically check the state. During anapanasati, after every minute or so, pause and ask: what is the state of mind right now? Then label it. "Agitated." "Calm." "Sleepy." "Restless." "Clear." Return to the breath.

Why? Because the state determines what kind of practice is possible. An agitated mind cannot do subtle work — it can do gross work like long exhale breathing or walking. A sleepy mind cannot do still meditation — it needs eyes open or movement. A clear mind can do whatever you ask of it.

Outside of formal practice, state-awareness is even more useful. You will start to notice that you have been writing emails for two hours in a "contracted" state, and that the emails are slightly off because of it. You will notice that you started the day in a "clear" state and that something — a conversation, a notification, a meal — moved you into "agitated." You will notice the patterns. You will notice what restores clear and what destroys it.

Within a few weeks of this practice, you will begin to design your day differently. You will protect the clear states. You will catch the agitated states early. You will stop trying to do deep work from sleepy. You will become, slowly, your own nervous-system steward.`,
      practice: {
        name: "Watch the Weather",
        durationMin: 8,
        instructions: `Sit upright. Close your eyes.

Watch the breath. Every minute or so, pause and ask: what is the state of the mind right now?

Label it in one word: agitated, calm, sleepy, restless, clear, contracted, open.

Return to the breath.

8 minutes.

Outside of practice today, check the state of your mind before any important conversation or decision. Just notice. The noticing changes everything.`,
      },
      reflection: "What state were you in for most of today, and what activities tend to put you in your most clear state?",
    },
    {
      day: 6,
      title: "Impermanence",
      oneLine: "Watch closely enough, and you'll see everything dissolving.",
      reading: `The fourth foundation of sati is the deepest one. It is *dhammanupassana* — awareness of mental objects, which in the Buddha's framework includes the recognition of *anicca*, impermanence.

The instruction is simple. Sit. Watch the breath. Watch sensations, thoughts, mind-states arising and passing. But today, do not just notice that they are happening. Notice that they are *changing*. Every sensation rises, peaks, and passes. Every thought arises, holds for a few seconds, and is replaced by another. Every mind-state, even the most "permanent"-feeling, is in constant flux.

Nothing in the entire field of your inner experience is stable. The breath is changing. The sensations are changing. The thoughts are changing. The mind-states are changing. Even *you*, the watcher, are noticing different things from different angles in different moments.

The Buddha said this seeing — *vipassana*, insight into impermanence — is what frees the mind. Not because it is sad ("everything passes") but because it is liberating. The thing you were afraid of is passing. The thing you were grasping is passing. The self you were defending is, in some real sense, also passing — moment by moment, replaced by the next iteration.

When you see this directly, even once, your relationship to your inner life shifts. You stop trying to hold onto pleasant states (they will pass anyway). You stop trying to escape unpleasant states (they will pass anyway). You begin to live more in the *passing* itself, the river of experience, which is the only place anyone has ever actually lived.

This is the deepest sati can take you. You can spend the rest of your life refining it. Today, you taste it.`,
      practice: {
        name: "Watch the Passing",
        durationMin: 10,
        instructions: `Sit upright. Close your eyes.

Watch the breath. Watch sensations, thoughts, mind-states arising.

For each one, do not just notice it. Notice that it is *changing*. Is the sensation in your knee the same as it was thirty seconds ago? No. Has the thought you were just thinking already passed? Yes.

Stay with the changing. Let the changing be the object of practice.

10 minutes.

You may have a moment, in the middle, when you suddenly see — viscerally, not intellectually — that the entire inner stream is in motion. That moment is what the Buddha sat under the tree for. It's available to you, sometimes.`,
      },
      reflection: "If everything inside you is changing, what is the unchanging thing watching the change?",
    },
    {
      day: 7,
      title: "Bringing Sati to the Day",
      oneLine: "The cushion is rehearsal. The day is the real practice.",
      reading: `Last day. Here is the most important thing.

Everything you have learned this week — the bare remembering, the breath, the labeling, the feeling-tone, the mind-state, the impermanence — has been rehearsal. The cushion is rehearsal. The real practice is the rest of your life.

Sati is meant to come off the cushion and into the day. It is meant to arrive when your boss says something dismissive in a meeting (you notice the tone, you notice the contraction, you notice the impulse, you return to the breath, you respond differently). It is meant to arrive when your child is crying for the fifth time in an hour (you notice the irritation, you notice the tone, you notice the breath, you stay). It is meant to arrive when you reach for the phone for the hundredth time today (you notice the reach, you pause, you choose).

Off-cushion sati is what every contemplative tradition is actually trying to build. The hours on the cushion are training. The thousands of moments off the cushion are where the training is spent.

Three rules for taking sati into the world:

**One: anchors.** Pick three daily anchors — moments that already happen — and use them as sati reminders. Walking through a doorway. Sitting down at your desk. Picking up the phone. Each one becomes a one-breath sati moment.

**Two: bridges.** Between any two activities, take one slow breath. This is called the "bridge breath." It marks the end of one thing and the start of another, and it gives the nervous system a moment to reset.

**Three: 10 minutes a day.** Some form of formal sit, every day, for the rest of your life. Even five minutes if you cannot do ten. The cushion practice is what keeps the off-cushion practice strong. Without the formal training, the informal training erodes within weeks.

You now have everything you need. You will forget often. You will return. The returning is the path.

— The Buddha, via Samir

*If you sit with sati for ten minutes a day for the next year, you will become a person other people experience as substantially more present, calm, and clear. You will not have to advertise this. They will simply feel it. That is the test.*`,
      practice: {
        name: "The Daily Sit",
        durationMin: 10,
        instructions: `From today onward, one practice, every day:

Sit upright. Close your eyes. Watch the breath. Label the wandering. Return.

10 minutes. Or 5 on hard days. But every day.

Skip a day, no guilt. Return without ceremony. The return is the practice.

Set a calendar reminder for the same time every day. Pick a time that is realistic — most people do better in the morning, before the day has had a chance to flood them.

This is not a 7-day program anymore. This is the rest of your life.`,
      },
      reflection: "If you sit for 10 minutes a day for 365 days — that's 60 hours of trained sati. What might you become?",
    },
  ],
};

// ============================================================================
// PROGRAM 5 — WILLPOWER REFORGED (VIVEKANANDA)
// ============================================================================
const WILLPOWER_REFORGED: ShowroomProgram = {
  slug: "willpower-reforged",
  title: "Willpower Reforged",
  subtitle: "Seven days rebuilding willpower from the ground up — Vivekananda's way.",
  guru: "Vivekananda",
  guruRole: "the monk who told a broken people 'strength is life, weakness is death' — and meant it as a daily practice",
  theme: "🜂",
  color: "from-orange-500/30 via-red-500/20 to-yellow-500/10",
  category: "willpower",
  duration: "7 days",
  promise: "By day 7 you will understand why your willpower has been failing, and you will have a working daily protocol that builds it instead of burning it.",
  days: [
    {
      day: 1,
      title: "Willpower Is Not What You Think",
      oneLine: "Willpower is not character. It is a finite, replenishable physical resource.",
      reading: `The first thing to understand about willpower is that it is not a moral quality. It is a physical resource, located in the prefrontal cortex, that consumes glucose and gets depleted by use.

The psychologist Roy Baumeister called this *ego depletion* — the documented finding that exerting self-control on one task measurably reduces your capacity to exert self-control on the next one, for several hours, until rest and food restore it. (The original effect has been debated and refined since 2010, but the practical truth holds: self-control is a finite daily budget.)

What does this mean? It means that every "I will not look at my phone," every "I will eat the salad," every "I will finish this report instead of scrolling," every "I will not say the sharp thing" — costs from the same budget. By 4 p.m. on a day where you have made twenty small acts of self-control, the budget is largely spent. The 4:30 p.m. version of you is not a weak person. The 4:30 p.m. version of you is operating on an empty tank.

This explains almost every failure of willpower you have ever had. You did not fail because you are undisciplined. You failed because you tried to spend more willpower than was in your account that day, and the system bounced the transaction.

The fix is not "have more willpower." The fix is two-fold. One: **design your day so the most willpower-intensive tasks come first**, when the budget is full. Two: **build daily practices that increase your willpower budget over time**, the way exercise increases muscle mass.

Hanuman, in the Ramayana, did not know his own strength. He had infinite strength, but a curse had made him forget. When his fellow monkeys reminded him, in a moment of need, the strength returned. The story is psychologically precise. Most adults have far more capacity than they use, but a thousand small acts of forgetting have made them believe they are weaker than they are.

This week you remember.`,
      practice: {
        name: "Audit the Budget",
        durationMin: 8,
        instructions: `Take a piece of paper. Write down everything you did yesterday that required self-control.

Include: resisting a snack, holding your tongue, answering a hard email, getting out of bed, finishing a task you didn't want to, not looking at the phone, eating something you didn't want.

You will be surprised how long the list is. Most people use 30-50 acts of self-control before lunch.

Now ask: was there any point in the day where I tried to spend more willpower than I had, and failed? Mark it.

That moment was not a moral failure. It was a budget failure. Plan tomorrow with the budget in mind.`,
      },
      reflection: "What time of day does your willpower budget usually run out?",
    },
    {
      day: 2,
      title: "The Energy Foundation",
      oneLine: "Sleep, food, light, movement. The willpower budget is mostly biological.",
      reading: `Yesterday we said willpower is a finite resource. Today we ask: what determines how big the daily budget is?

The answer is mostly biology. Four levers.

**Sleep.** A single bad night reduces prefrontal cortex function by roughly 20-30%, measurably degrading decision-making and self-control. Two weeks of 6-hour nights produces the same cognitive impairment as 48 hours of total sleep deprivation. Most people running on 6-7 hours think they're fine. They are not fine. They are operating at a willpower budget half the size of their rested self.

**Food.** Willpower runs on glucose. A blood sugar crash at 11 a.m. (because breakfast was a coffee and a pastry) is also a willpower crash. Stable blood sugar from protein-and-fat-anchored meals extends the budget through the afternoon.

**Light.** Bright morning light (10 minutes outside, ideally before 9 a.m.) is one of the most documented and underused interventions for daytime cognitive function. It sets the circadian rhythm correctly, which directly affects evening sleep quality, which directly affects tomorrow's willpower budget.

**Movement.** 20 minutes of moderate movement (a walk counts) measurably increases prefrontal cortex activity for the next 2-3 hours. Most professionals would benefit more from a 20-minute walk than from another coffee.

These four are not glamorous. They are the actual foundation. Trying to build willpower on a base of bad sleep, sugary food, no morning light, and no movement is like trying to build a house on sand. It can work for a few weeks. Then it collapses.

For the next six days, you do not try to dramatically improve all four. You pick the one that is weakest in your life, and you fix it. One thing. The other three you leave alone for now.

Pick. Today.`,
      practice: {
        name: "Pick the Lever",
        durationMin: 5,
        instructions: `Rate yourself, honestly, 1-10 on each:

Sleep (consistent 7-8 hours): __
Food (stable blood sugar, protein at meals): __
Light (10 min outside in the morning): __
Movement (20 min/day): __

Identify your lowest score. That is your lever for the rest of the week.

Write the specific change you will make. Be small and concrete: "I will be in bed with phone off by 10:30 p.m." or "I will walk for 15 minutes before opening email."

Tape the rule somewhere visible. Start tonight.`,
      },
      reflection: "Which of the four foundations have you been neglecting longest?",
    },
    {
      day: 3,
      title: "The Resistance Map",
      oneLine: "Willpower fails predictably. Map the predictable failures.",
      reading: `Most people imagine willpower failures as random — sometimes you have it, sometimes you don't, the world is mysterious. The data says otherwise. The failures are highly predictable. They cluster around specific situations, times, environments, and emotional states. If you map them, most of them stop being mysterious.

The map looks like this. For each willpower failure you can recall in the last month, ask four questions:

**When did it happen?** (Time of day, day of week)
**Where did it happen?** (Physical environment)
**What preceded it?** (What happened in the hour before)
**What did you feel?** (Bored, tired, lonely, anxious, angry)

When you do this for ten failures, the patterns leap out. Most people discover that 70-80% of their failures cluster around 2-4 specific contexts. The 11 p.m. couch with the phone. The afternoon dip after a hard meeting. The Sunday evening "I don't want to start the week" spiral. The post-argument craving for sugar.

Once you see the cluster, you can do something the willpower-as-character theory cannot. You can **redesign the environment** so the cluster becomes harder to enter. Move the phone out of the bedroom. Schedule a hard workout after the hard meeting instead of a snack. Put a Sunday-evening walk on the calendar. Replace the post-argument sugar with a glass of cold water and 10 slow breaths.

This is called *implementation intention* in the research literature (the work of Peter Gollwitzer). It is the single most reliable intervention for behavior change ever documented. The format: *if X happens, then I will do Y*. Pre-decided. Removed from the moment of weakness.

Will power is not "I will try harder next time." Willpower is "I have already decided what I will do when that situation arises, and I will not have to decide again." The decision was made in a high-willpower moment. The execution happens in a low-willpower moment. The pre-commitment is the bridge.

Today, build the map.`,
      practice: {
        name: "Build the Resistance Map",
        durationMin: 10,
        instructions: `Take a piece of paper. List 10 willpower failures from the last month.

For each, fill in: When? Where? What preceded? What felt?

You will see 2-4 patterns repeat.

For your top 2 patterns, write an implementation intention:

*If ____ happens, I will ____.*

Make the "will do" specific, small, and possible. Not "I will be disciplined." Something like "I will stand up and drink a glass of water before opening the app."

Read your two rules every morning for the rest of the week.`,
      },
      reflection: "What's the single situation where your willpower fails most often, and what's the smallest pre-decided rule that would interrupt it?",
    },
    {
      day: 4,
      title: "Tapas — The Heat",
      oneLine: "Willpower is built by chosen, daily, small difficulty.",
      reading: `The yogic tradition has a word for the kind of willpower this program is trying to build. It is *tapas* — literally "heat" — the friction generated by deliberately choosing difficulty when an easier path is available.

The principle is mechanical and old. The capacity for self-control, like the capacity for muscle strength, grows when you load it slightly beyond comfort, daily, over months. It does not grow in big dramatic gestures. It does not grow from January resolutions and gym memberships abandoned by March. It grows from small, daily, slightly uncomfortable choices repeated long enough that they become identity.

The cold shower is the most documented modern example. Most people who finish a 30-day cold shower challenge — even people who never continue the practice — report a lasting increase in their willingness to do hard things. The mechanism is not magical. They have, every morning for thirty mornings, proven to themselves that they can do a small uncomfortable thing on purpose. The proof accumulates. By day 30, the inner narrator that used to say "I can't do hard things" has been overruled by 30 contradicting data points.

You do not need cold showers. The principle is what matters. Pick one small daily friction — something slightly uncomfortable but doable — and do it every day for the rest of the program (and ideally beyond). Examples: a 30-second cold rinse at the end of every shower. 10 push-ups before breakfast. Reading 5 pages of a hard book before opening the phone. Sitting in silence for 5 minutes upon waking.

The friction must be small enough that you can actually do it on a bad day, and large enough that you would prefer not to. That is the sweet spot. Too easy and it does not build the muscle. Too hard and you will quit by day 4.

The yogis said *tapas* is the engine that burns through *samskaras* — the deep grooves of conditioning. Modern neuroscience would say the same thing in different words: daily small friction strengthens the anterior cingulate cortex and the dorsolateral prefrontal cortex, the brain regions that mediate effortful self-control. The wiring upgrades. The capacity expands. The person becomes someone for whom hard things are slightly less hard.

Pick yours today.`,
      practice: {
        name: "Choose Your Tapas",
        durationMin: 5,
        instructions: `Pick one small daily friction. It should be:

- Doable in under 5 minutes
- Uncomfortable but not painful
- Done at the same time every day (so it becomes ritual)

Examples:
- 30-second cold rinse at end of shower
- 10 push-ups before breakfast
- 5 minutes of silence upon waking, before phone
- Read 5 pages of a hard book at lunch
- Stand on one leg for 60 seconds while brushing teeth

Pick one. Write it down. Do it today.

Mark a calendar for every day you complete it. The calendar becomes the evidence.`,
      },
      reflection: "What small daily friction would, if held for a year, make you a different person?",
    },
    {
      day: 5,
      title: "The Dragon at the Door",
      oneLine: "Most willpower is needed at one threshold — the first 60 seconds of starting.",
      reading: `Here is a willpower secret that, once you see it, will change how you design your days.

Almost all the willpower required for any task is concentrated in the first 60-120 seconds. The moment of starting. Once you have started, momentum carries most of the rest. The hard part — the part that consumes most of the daily willpower budget — is the threshold.

This is why "I'll just do five minutes" almost always becomes 30 minutes of productive work. Once you have crossed the threshold, the resistance falls off a cliff. Newton's first law applies to humans. An object at rest stays at rest. An object in motion stays in motion.

The implication is that you should design your day around making thresholds as cheap as possible. Each day, identify the 2-3 thresholds that matter — starting the workout, starting the deep work, starting the difficult conversation — and engineer them.

The techniques are simple:

**Pre-decided start time.** Not "I'll work out today." But "I will start at 6:45 a.m." A decision pre-made does not consume willpower in the moment.

**Lay it out the night before.** Clothes, shoes, water bottle, laptop open to the right document, phone in another room. Each removed obstacle saves a small unit of threshold willpower. Three or four small obstacles, removed in advance, is often the difference between starting and not.

**Two-minute rule.** Commit only to the first two minutes. Put on the running shoes and walk out the door. Write the first paragraph. Send the first sentence of the hard email. Twice out of three times, the two minutes turn into the full task because momentum is now doing the work.

**Public commitment.** Tell one person, the night before, exactly what you will do at exactly what time. Now you have someone to disappoint if you do not start. This is one of the oldest and most reliable behavior change interventions in any tradition.

Hanuman, in the Ramayana, did not deliberate about leaping the ocean. He gathered himself, took a breath, and leaped. The deliberation was the dragon. The leap was easy compared to the deliberation. Most adults spend ninety percent of their inner energy deliberating thresholds they have already decided to cross.

Stop deliberating. Cross.`,
      practice: {
        name: "Engineer One Threshold",
        durationMin: 5,
        instructions: `Pick one thing tomorrow that you've been resisting. Workout, writing, hard conversation, anything.

Tonight, before bed, do all of the following:
1. Decide the exact start time. Write it down.
2. Lay out everything you need.
3. Remove every obstacle you can think of.
4. Tell one person what you will do, by what time.
5. Commit only to two minutes. The rest is optional.

Tomorrow, at the time you decided, start. Do the two minutes. See what happens.`,
      },
      reflection: "What threshold have you been failing to cross because you have been deliberating it instead of engineering it?",
    },
    {
      day: 6,
      title: "Reframing Discomfort",
      oneLine: "Discomfort isn't a signal to stop. It's the price of the thing you said you wanted.",
      reading: `Most people experience discomfort and interpret it as a stop signal. The hunger pangs of the diet, the boredom of the meditation, the awkwardness of the difficult conversation — all read as evidence that something is wrong and you should stop.

This is a misreading. Discomfort, in almost every domain you would consciously choose to grow in, is the literal price of growth. The hunger pangs are the body burning fat. The boredom is the mind not yet trained to be still. The awkwardness is the conversation finally getting honest. Each of these is the thing working, not the thing failing.

The reframe is simple and ancient. *This discomfort is the work, not the obstacle to the work.*

When you can hold this reframe in the moment of discomfort, willpower stops feeling like a battle against yourself and starts feeling like an alignment with the thing you wanted. You are not "resisting" the urge to scroll. You are doing the work of building a mind that does not need to scroll. The discomfort is the rep. The rep is the muscle.

The Stoics used a related framing. They called it *the obstacle is the way*. The thing in front of you that you do not want is, in fact, the path. The reluctance is information about where the growth edge lives.

Hanuman, again, models this perfectly. When told to leap across the ocean to find Sita, he had access to every reason to doubt — the distance was vast, no monkey had done it, failure would mean death. He acknowledged the reasons and leaped anyway. The Ramayana does not say he was unafraid. It says he chose to act in the presence of the fear.

For the rest of the program, the discomfort that arises in your tapas, in your morning practice, in your difficult conversations, is the work. It is not a failure. It is the price you have already agreed to pay. Reframe it in the moment. Pay it. Move forward.

The capacity to do this is the deepest meaning of willpower. It is not the ability to grit through hardness. It is the ability to *recognize* hardness as the path and move *toward* it instead of away.`,
      practice: {
        name: "The Reframe Drill",
        durationMin: 5,
        instructions: `Today, every time you encounter discomfort during something you've chosen — the workout, the meditation, the hard task, the awkward conversation — pause for one second.

Say silently: *this discomfort is the work.*

Then continue.

That is it. Five seconds per discomfort moment. By the end of the day you will have done it many times, and the framing will start to feel natural.

Notice the difference between a day of "fighting" discomfort and a day of *aligning with* discomfort. The same act, two different inner experiences.`,
      },
      reflection: "What discomfort have you been treating as an obstacle when it was actually the work?",
    },
    {
      day: 7,
      title: "The Daily Protocol",
      oneLine: "Six moves, every morning, for the rest of your life.",
      reading: `Today we put it all together. Here is the willpower protocol you have built this week, in six moves. Run it every morning. Adjust over time.

**The Hanuman Daily Willpower Protocol**

**1. The night before.** Set tomorrow's start time and lay out what you need. Tell one person what you will do. Phone out of bedroom.

**2. Wake without phone.** First 30 minutes, no screens. This is the most willpower-protective single rule you can install. The phone in the first 30 minutes spends willpower you have not yet generated.

**3. Light + movement + water.** 10 minutes outside in the morning light. A short walk if possible. A full glass of water. The willpower budget for the day is partly being set here.

**4. Tapas.** Your chosen daily friction. Cold rinse, push-ups, silence, whatever you picked. Two minutes minimum. Today's rep.

**5. The hardest thing first.** Whatever you most want to avoid today, do it in the first work block, before email or meetings. You will have the most willpower of the day at that moment. Do not spend it on Slack.

**6. The evening close.** Before bed, write three lines: what I did well today, what I want to do better tomorrow, what time I will start. Then phone out of room, lights off, no exceptions.

That is the whole protocol. Six moves. Twenty minutes of intentional design around a day that otherwise would be reactive.

The protocol is not optional after seven days. The protocol is what you do for the rest of your life. Skip days. Skip weeks. Return without ceremony.

The promise of the program is real. If you run this protocol — even imperfectly — for the next 90 days, you will have measurably more willpower, measurably more output, and a self-image that has updated from "I cannot do hard things" to "I am someone who does hard things." That self-image is, in the end, what willpower really is. A belief about who you are, hardened into evidence by daily repetition.

Hanuman did not believe he could leap the ocean until he was reminded. You have now been reminded. The strength was always there. The leap is yours.

— Hanuman, via Samir`,
      practice: {
        name: "Run the Protocol",
        durationMin: 20,
        instructions: `Tomorrow morning, run all six moves of the protocol, in order.

The night before tonight: set the start time. Phone out of bedroom. Tell one person.

Tomorrow: wake → no phone for 30 min → light + walk + water → tapas → hardest thing first → evening close.

Mark a calendar for every day you complete it. The calendar is the evidence the protocol works.

Do this for 90 days. See who you become.`,
      },
      reflection: "If you run this for 90 days, what part of your life would have changed by then?",
    },
  ],
};

// ============================================================================
// REGISTRY
// ============================================================================
import { SHOWROOM_PROGRAMS_EXTRA } from "./showroomProgramsExtra";
import { AUDIENCE_PROGRAMS } from "./audiencePrograms";

export const SHOWROOM_PROGRAMS: ShowroomProgram[] = [
  DECISION_MAKING,
  THE_ONION,
  STOP_THE_REACTOR,
  WATCH_YOUR_THOUGHTS,
  WILLPOWER_REFORGED,
  ...SHOWROOM_PROGRAMS_EXTRA,
  ...AUDIENCE_PROGRAMS,
];

export function getShowroomProgram(slug: string): ShowroomProgram | undefined {
  return SHOWROOM_PROGRAMS.find(p => p.slug === slug);
}

export function getShowroomDay(programSlug: string, day: number): { program: ShowroomProgram; day: ShowroomDay } | undefined {
  const program = getShowroomProgram(programSlug);
  if (!program) return undefined;
  const d = program.days.find(x => x.day === day);
  if (!d) return undefined;
  return { program, day: d };
}
