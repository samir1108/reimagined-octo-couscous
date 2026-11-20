/**
 * LEGACY SET A — the ten checkpoints that predate the authored registry.
 *
 * Mirrors 2, 3, 11–19: the position on the path, the inner compass, the three
 * layers of the nervous system, the doṣa constitution, the mind–body type,
 * witness capacity, presence quality, the relationship with time, the width of
 * the emotional range, and the four bodies.
 *
 * ── What this set has in common ───────────────────────────────────────────
 * Every bank here is a map rather than a score. The questions describe a
 * mechanism and then hand the reader the question; the readings describe a
 * position and what it costs, never the person holding it. These are the
 * mirrors most people take earliest, so the language stays plain and the
 * stakes stay low.
 *
 * Two of these are working models rather than settled findings — the triune
 * brain and the doṣa constitution. Both are used here because they are
 * clinically and practically useful, not because they are true to the letter,
 * and each intro says so in as many words.
 *
 * Surface tier stays situational. Core tier names the mechanism and turns the
 * lens back on the one asking.
 */

import { q3, o, likert5, pickOne, scale, type MirrorBank } from './types';

export const LEGACY_A_BANKS: MirrorBank[] = [
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'spiritual-stage',
    title: 'Where you stand today',
    subtitle: 'Your position on the path',
    module: 'Welcome',
    tradition: 'vedic',
    dimensionCategory: 'stage',
    coverEmoji: '🧭',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'The path is a shape, not a ladder. It is not measured in years or in how much anyone knows about it — it is measured by what is actually possible for you at the moment, and that changes several times in a life.\n\nFive positions are described here. They are not grades and they are not permanent: the reading is a description of today, and most people have been in at least two of them already. Pick the one that is closest, not the one that sounds best.',
    dimensions: ['sleeping', 'questioning', 'observing', 'alchemist', 'navigator'],
    engineHooks: {
      loopsToCheck: ['reactivity', 'approval-seeking'],
      practiceAffinity: ['observation', 'self-inquiry', 'witnessing'],
      deepensWith: ['inner-compass', 'witness-capacity'],
    },
    questions: [
      q3(
        'stage-now',
        'position',
        'If someone asked where you are on this path right now, what would you tell them?',
        'Where does the path feel like you are standing, as opposed to how far along you have got?',
        'The path has a shape and everyone meets it at a different part of it. Which part are you standing on at this moment?',
        pickOne(
          [
            'Whatever happens is happening to me, and I meet it as it arrives',
            'Something is clearly not right, and I keep asking what',
            'I can watch myself going through it while it is going on',
            'What used to hurt is being turned into something I can use',
            'I can choose what happens next, and mostly I do',
          ],
          ['sleeping', 'questioning', 'observing', 'alchemist', 'navigator'],
        ),
      ),
      q3(
        'stage-body',
        'share',
        'How much of what happens in a day is happening to you, rather than something you are taking part in?',
        'How much of your experience is imposed, and how much are you actively in?',
        'The whole distance of this path sits between being acted on and acting. Take a single ordinary day and sort it honestly: where do you land?',
        scale(
          [
            'Almost all of it happens to me',
            'Most of it does',
            'About half of it',
            'I am part of most of it',
            'Nearly everything I meet, I go out and meet',
          ],
          ['sleeping', 'questioning', 'observing', 'alchemist', 'navigator'],
        ),
      ),
      q3(
        'stage-marker',
        'signal',
        'What told you that something in you had changed, even if you could not say what?',
        'What is the evidence that you are not where you were a year ago?',
        'Every position on this path leaves a trace of a different kind. Look back for the last one you noticed in yourself — which trace was it?',
        scale(
          [
            'I noticed I was more affected by things than I used to be',
            'I noticed I had started asking why things were the way they are',
            'I noticed I could watch my own reaction while it was still happening',
            'I noticed something that used to hurt had become usable',
            'I noticed I was choosing again, on purpose, and enjoying it',
          ],
          ['sleeping', 'questioning', 'observing', 'alchemist', 'navigator'],
        ),
      ),
      q3(
        'stage-practice',
        'doubt',
        'How much of your life is spent doubting one thing or another?',
        'How much of the time are you in a state of not being sure?',
        'This stage is defined by a discrepancy that will not close on its own, and it closes when the question is asked properly rather than repeatedly. How much of it is running right now?',
        likert5('questioning', [
          'I am not really in doubt about much',
          'A little, about a few specific things',
          'A fair amount, mostly about my direction',
          'Most days, about most things',
          'It has been years, and nothing still feels settled',
        ]),
      ),
      q3(
        'stage-blocked',
        'edge',
        'What is stopping you moving right now?',
        'What is the thing between you and the next step?',
        'Every position has a gate, and the gate is rarely the obvious obstacle. What is actually in the way of the step you can already see?',
        pickOne(
          [
            'I cannot see clearly enough to take a first step',
            'I can see it and I talk myself out of it',
            'I can see it, but I cannot hold the seeing under pressure',
            'I have started the work and it is taking nearly everything I have',
            'I can see the next step and something in me hesitates anyway',
          ],
          ['sleeping', 'questioning', 'observing', 'alchemist', 'navigator'],
        ),
      ),
      q3(
        'stage-return',
        'return',
        'Would you go back to a year ago, if going back were possible?',
        'Is the person you were a year ago someone you would want to be again?',
        'This path is only real if there is something you would no longer go back to. Set the year behind you and answer for the whole of it, not the parts you miss.',
        scale(
          ['Gladly, and I would not hesitate', 'Part of me would, and the rest would not', 'Not for anything'],
          ['sleeping', 'observing', 'navigator'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'sleeping',
        label: 'Sleeping',
        short: 'Events still arrive as events',
        description:
          'Most of what happens still happens to you rather than being noticed happening. This is a position and not a verdict — the path has to be seen before it can be walked, and seeing it is usually the first genuine event of a life. What moves from here is not effort but attention.',
        shadow: 'Reading the size of the reaction as the whole of what is available.',
        color: 'slate',
        masters: ['observation', 'body'],
        calibration: {
          dimensions: { body: 0.2, emotion: 0.2, thought: 0.15 },
          practiceLevels: { observation: 2, body: 1 },
          domainStress: { stability: 'health' },
          tags: ['unreflective', 'reactive'],
        },
      },
      {
        id: 'questioning',
        label: 'Questioning',
        short: 'Something is not right and it will not stay quiet',
        description:
          'The discrepancy has been noticed and it keeps reopening. Doubt is doing real work here, because the question has nowhere to land until it is asked properly. The risk is a loop rather than a movement, and the cure for a loop is not more analysis but something done consistently.',
        shadow: 'Mistaking the restlessness of the search for the thing being searched for.',
        color: 'amber',
        masters: ['self-inquiry', 'observation'],
        calibration: {
          dimensions: { thought: 0.35, emotion: 0.2, body: 0.1 },
          practiceLevels: { 'self-inquiry': 2, observation: 1 },
          domainStress: { direction: 'self-inquiry' },
          tags: ['questioning', 'dissatisfied'],
        },
      },
      {
        id: 'observing',
        label: 'Observing',
        short: 'The watcher is running during the event',
        description:
          'There is a vantage point from which your own reactions are visible while they are happening. That is the whole mechanism, and it is more fragile than it looks — the common difficulty here is not the seeing but the staying, and sustainability is the real work.',
        shadow: 'Reading the ability to watch as the same as having understood it.',
        color: 'sky',
        masters: ['witnessing', 'observation'],
        calibration: {
          dimensions: { spirit: 0.25, thought: 0.2, body: 0.15 },
          practiceLevels: { witnessing: 2 },
          tags: ['watching', 'sustaining'],
        },
      },
      {
        id: 'alchemist',
        label: 'Alchemist',
        short: 'The pain is being worked on rather than survived',
        description:
          'The material that used to run you is being put through something and coming out different. It is heavy, unglamorous, and the most transformative part of the arc. What gives it away is not intensity but usefulness — the old material now does work in your life.',
        shadow: 'Confusing the intensity of the process with its direction.',
        color: 'violet',
        masters: ['emotional-healing', 'kriya'],
        calibration: {
          dimensions: { emotion: 0.35, spirit: 0.2, body: 0.15 },
          practiceLevels: { 'emotional-healing': 1, kriya: 1 },
          domainStress: { process: 'emotional-healing' },
          tags: ['transforming', 'in-process'],
        },
      },
      {
        id: 'navigator',
        label: 'Navigator',
        short: 'Choice has become available, and is still being learned',
        description:
          'You can see the options and pick one, which sounds simple until you have done it. Freedom of this kind is disorienting rather than pleasant at first: every option taken is also a door closed, and the mind does not always accept the trade. The next difficulty is not more choice but the willingness to be responsible for it.',
        shadow: 'Using the ability to choose to avoid choosing.',
        color: 'emerald',
        masters: ['raja', 'karma'],
        calibration: {
          dimensions: { action: 0.3, spirit: 0.2, thought: 0.15 },
          practiceLevels: { raja: 1, karma: 1 },
          domainStress: { choice: 'work-career' },
          tags: ['choosing', 'responsible'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'inner-compass',
    title: 'Inner compass',
    subtitle: 'Name what actually matters to you',
    module: 'Welcome',
    tradition: 'vedic',
    dimensionCategory: 'values',
    coverEmoji: '🧭',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Most people know their reasons by the shape of their reactions — what they defend, what they are quietly proud of, what they would not give up. Nobody draws the map directly; it is inferred from behaviour, and it is often out of date.\n\nFive things are named here, in the order most people find them: what others think, safety, going further, being free, and being of use. The order is not a ranking of virtue. It is the order in which they usually become loud.',
    dimensions: ['approval', 'security', 'achievement', 'autonomy', 'service'],
    engineHooks: {
      loopsToCheck: ['approval-seeking', 'control-seeking'],
      practiceAffinity: ['self-inquiry', 'jnana', 'karma'],
      deepensWith: ['spiritual-stage', 'work-dharma'],
    },
    questions: [
      q3(
        'compass-driver',
        'motive',
        'When a decision that matters has to be made, what do you actually check first?',
        'Which of these is running the decision, whichever one you say out loud?',
        'Underneath any stated reason there is one that is doing the work. Take the last serious decision you made and look at the first thing you checked, not the last. What was it?',
        pickOne(
          [
            'What the people close to me will make of it',
            'Whether it is safe and whether it will hold',
            'Whether it moves me further forward',
            'Whether it leaves me free to decide again tomorrow',
            'Whether it is useful to anyone besides me',
          ],
          ['approval', 'security', 'achievement', 'autonomy', 'service'],
        ),
      ),
      q3(
        'compass-give-up',
        'attachment',
        'Which of these is hardest for you to give up?',
        'When you have to lose one of these, which one actually hurts?',
        'Give-ups are where values show themselves, because a value you can drop cheaply was never one. Which of the five is doing the most work in your decisions right now?',
        scale(
          [
            'Being liked',
            'Being safe',
            'Getting further than I have',
            'Being free to choose',
            'Being of use to someone',
          ],
          ['approval', 'security', 'achievement', 'autonomy', 'service'],
        ),
      ),
      q3(
        'compass-regard',
        'regard',
        'How much does a decision feel right only once other people have approved of it?',
        'How much of your sense of a good choice depends on the response it gets?',
        'Approval is not vanity; it is a way of finding out whether you are on the right road. The question is how much of the road you are willing to walk before any of that arrives.',
        likert5('approval', [
          'It has to be broadly right first, then I relax',
          'I do reasonably well without it',
          'I notice its absence, and it matters',
          'I think about it constantly',
          'I could hardly act if nobody agreed',
        ]),
      ),
      q3(
        'compass-unseen',
        'unwitnessed',
        'If nobody would ever find out, what would change?',
        'How much of what you do depends on there being a witness?',
        'Some of what you do is for the world and some of it is for the one doing it. Strip the audience out entirely and see which parts survive.',
        pickOne(
          [
            'Almost all of it would stop',
            'I would still take the safe option, but more cheaply',
            'I would still push, because the result is the point to me',
            'I would do far more of the things I actually like',
            'I would probably do more, not less',
          ],
          ['approval', 'security', 'achievement', 'autonomy', 'service'],
        ),
      ),
      q3(
        'compass-surplus',
        'others',
        'When you have more than you need, what happens to the extra?',
        'What does the surplus of your life get spent on?',
        'Enough is easy to keep. The question this asks is how far out of your own hands what you have goes, which is the clearest reading of what you are actually for.',
        scale(
          [
            'It stays with me — I am the one it is for',
            'Most of it stays close',
            'Some of it goes out to other people',
            'A good deal of it goes out to other people',
            'It goes out of my hands without a decision being needed',
          ],
          ['approval', 'security', 'achievement', 'autonomy', 'service'],
        ),
      ),
      q3(
        'compass-free',
        'freedom',
        'Suppose a week arrived where nothing was at stake. What would you do with it?',
        'What does your mind reach for when nothing can be lost?',
        'Given a free week with no consequences, you will find out what you would have chosen anyway. What does the wanting part of you reach for first?',
        scale(
          [
            'I would be as lost as ever, and I would not know what to do',
            'I would finally rest, properly',
            'I would fill it with something that counts',
            'I would do the things I have been putting off for months',
            'I would spend it with people, and not be counting the hours',
          ],
          ['approval', 'security', 'achievement', 'autonomy', 'service'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'approval',
        label: 'Approval-led',
        short: 'The audience is in the room with you',
        description:
          'Your decisions are made with an imagined witness present, and that witness is a demanding one. The strength in it is real: you notice things other people miss, because reading the room has made you fluent in it. The cost is that your own verdict on your own life arrives second, if at all.',
        shadow: 'Treating the absence of disapproval as approval.',
        color: 'rose',
        masters: ['observation', 'self-inquiry'],
        calibration: {
          dimensions: { connection: 0.3, emotion: 0.25, thought: 0.15 },
          practiceLevels: { observation: 1, 'self-inquiry': 1 },
          domainStress: { relation: 'relationship' },
          tags: ['approval-led', 'externally-referenced'],
        },
      },
      {
        id: 'security',
        label: 'Security-led',
        short: 'Safety is the first question, every time',
        description:
          'Stability, predictability and safety are the frame everything else is judged inside. That frame is not timidity — it is an accurate reading of how much can be lost, and it has probably served you well. It becomes worth examining when the cost of holding on starts to exceed the cost of the risk.',
        shadow: 'Calling the refusal to move prudence.',
        color: 'amber',
        masters: ['body', 'raja'],
        calibration: {
          dimensions: { body: 0.25, emotion: 0.2, action: 0.15 },
          practiceLevels: { body: 1, raja: 1 },
          domainStress: { safety: 'health' },
          tags: ['risk-averse', 'protective'],
        },
      },
      {
        id: 'achievement',
        label: 'Achievement-led',
        short: 'Forward motion is the measure',
        description:
          'You orient by distance travelled, and the future is doing most of the work. This is how most careers and most ambitions are actually built, and it is not shallow. What it hides is the question of whether the thing being built is one you would want to live inside.',
        shadow: 'Confusing the measure with the destination.',
        color: 'orange',
        masters: ['karma', 'raja'],
        calibration: {
          dimensions: { action: 0.35, thought: 0.2, connection: 0.15 },
          practiceLevels: { karma: 1, raja: 1 },
          domainStress: { work: 'work-career' },
          tags: ['driven', 'future-referenced'],
        },
      },
      {
        id: 'autonomy',
        label: 'Autonomy-led',
        short: 'Nothing worth having should require permission',
        description:
          'Your organising value is that the decision has to be yours, and a great deal of your energy goes towards keeping it so. This produces real independence and a low tolerance for being steered. The edge of it is that freedom can be defended so carefully that nothing new is ever permitted through it.',
        shadow: 'Choosing autonomy over the relationship it costs.',
        color: 'sky',
        masters: ['jnana', 'raja'],
        calibration: {
          dimensions: { thought: 0.25, action: 0.2, spirit: 0.2 },
          practiceLevels: { jnana: 1, raja: 1 },
          tags: ['self-directed', 'choice-centred'],
        },
      },
      {
        id: 'service',
        label: 'Service-led',
        short: 'The measure sits outside you',
        description:
          'You orient by what is useful to somebody, which puts your decisions in a wider frame than most people work in. It can become its own escape, though — a person who is always serving has a reliable way of not looking at their own condition, and the people being served are often the last to notice.',
        shadow: 'Spending a life on others to avoid being in one.',
        color: 'emerald',
        masters: ['karma', 'bhakti'],
        calibration: {
          dimensions: { connection: 0.35, action: 0.25, spirit: 0.2 },
          practiceLevels: { karma: 1, bhakti: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['service-oriented', 'outward'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'three-brains',
    title: 'Three brains',
    subtitle: 'The layered nervous system',
    module: 'Engines',
    tradition: 'neuroscience',
    dimensionCategory: 'engines',
    coverEmoji: '🧠',
    estimatedMinutes: 7,
    version: 1,
    intro:
      'Paul MacLean proposed in the 1960s that the nervous system is three systems laid down at different times in evolution, each with its own job: an ancient survival layer, a middle layer for attachment and feeling, and the newest, which handles language and abstraction. It is a working model, not a settled finding — the layers overlap heavily and the neat three-part picture has been revised many times.\n\nIt is still the most useful picture available for one particular question: which layer answered first, and what did that cost the other two? This asks that, without asking you to choose a layer or become one.',
    dimensions: ['reactive', 'emotional', 'rational'],
    engineHooks: {
      loopsToCheck: ['reactivity', 'conflict-avoidance'],
      practiceAffinity: ['neuroscience', 'breath', 'observation'],
      deepensWith: ['nervous-system-tone', 'mind-body-type'],
    },
    questions: [
      q3(
        'brain-first',
        'sequence',
        'Something happens. What answers first?',
        'Which layer gets there before the others have finished loading?',
        'Three layers are running at once and the order they answer in is fixed by what you are doing, not by what you would prefer. Take the last thing that startled you. Which layer spoke first, and what did it say?',
        pickOne(
          [
            'My body moved before I knew what had happened',
            'The feeling arrived, and told me what to do about it',
            'I worked out what it meant, and then acted',
          ],
          ['reactive', 'emotional', 'rational'],
        ),
      ),
      q3(
        'brain-speed',
        'reaction',
        'How much time passes between something happening and you responding?',
        'How long is the gap between stimulus and response, honestly?',
        'The gap is not a personality trait; it is the thickness of the layer between stimulus and act, and it can change. How thick is yours at this moment?',
        likert5('reactive', [
          'A long enough gap to notice what I am doing',
          'A second or two',
          'About a second',
          'A fraction of a second',
          'There is no gap at all',
        ]),
      ),
      q3(
        'brain-conflict',
        'disagreement',
        'When what you feel and what you think want different things, which one usually wins?',
        'Which of the two has the casting vote?',
        'This is not a question about which is better. It is a question about which layer has been given authority in your life, and that authority was granted rather than earned. Which one holds it?',
        scale(
          ['The body, and it is not close', 'The feeling, nearly every time', 'It is worked out, and the reasoning usually has the last word'],
          ['reactive', 'emotional', 'rational'],
        ),
      ),
      q3(
        'brain-trust',
        'instinct',
        'How much do you trust the first thing you feel?',
        'How much weight does the first signal carry before you check it?',
        'Instinct is the oldest layer speaking quickly. It is often right and occasionally catastrophic, and the only way to tell the two apart is to have watched it a long time. How do you use it?',
        scale(
          [
            'I act on it straight away and rarely regret it',
            'Usually, without stopping to check it',
            'Sometimes, when I am calm',
            'Rarely — I look for the reasoning first',
            'Almost never; I want the case made before I move',
          ],
          ['reactive', 'emotional', 'rational'],
        ),
      ),
      q3(
        'brain-belt',
        'belly',
        'Someone corrects you. Where does that land?',
        'When you are found to be wrong, what does the body do?',
        'A correction goes to whichever layer was least defended. Where yours goes tells you which one you have been living in.',
        scale(
          ['It lands in the stomach and stays there for days', 'It lands in the chest and I feel it for hours', 'I take it apart and check the reasoning'],
          ['reactive', 'emotional', 'rational'],
        ),
      ),
      q3(
        'brain-override',
        'override',
        'At what point does a decision stop being yours to make?',
        'How much of your deciding has already been decided for you?',
        'A decision that was made in the first half second was not made by you, whatever you went on to do with it. Where in your day does that happen most often?',
        [
          o('Inside the first half second, and I never stood a chance', { reactive: 1 }),
          o('Within a few seconds, once the feeling has formed', { reactive: 0.5, emotional: 0.5 }),
          o('Over a few minutes, while the feeling is still moving', { emotional: 0.75, rational: 0.25 }),
          o('Over hours, once I have looked at it from more than one side', { rational: 1 }),
        ],
      ),
    ],
    resultTypes: [
      {
        id: 'reactive',
        label: 'Reactive-led',
        short: 'The first answer is the answer',
        description:
          'The oldest layer is doing the deciding, and it does so before thought is available to object. This is not a defect and it is not stupidity — it is a system built for emergencies, still doing its job in a life that mostly does not have them. What it costs is the enormous gap between stimulus and response, which is where every other capacity has to be built.',
        shadow: 'Believing you have no say in what happens next.',
        color: 'rose',
        masters: ['body', 'breath'],
        calibration: {
          dimensions: { body: 0.35, emotion: 0.2, thought: 0.1 },
          practiceLevels: { body: 1, breath: 1 },
          domainStress: { activation: 'health' },
          tags: ['reactive', 'fast-first'],
        },
      },
      {
        id: 'emotional',
        label: 'Emotional-led',
        short: 'Feeling decides, thinking follows',
        description:
          'The middle layer holds the casting vote: something is felt, the feeling has a direction, and the reasoning is brought in afterwards to justify it. This gives your life its colour and its relationships much of their depth, and it means a great deal of your thinking is post-hoc. Not wrong — simply late.',
        shadow: 'Arriving at a conclusion and then arguing for it.',
        color: 'violet',
        masters: ['emotional-healing', 'observation'],
        calibration: {
          dimensions: { emotion: 0.4, connection: 0.2, body: 0.15 },
          practiceLevels: { 'emotional-healing': 1, observation: 1 },
          domainStress: { feeling: 'emotional-healing' },
          tags: ['feeling-led', 'relational'],
        },
      },
      {
        id: 'rational',
        label: 'Rational-led',
        short: 'The case is made before the move',
        description:
          'The newest layer is given the decision, which produces clarity, consistency and good judgement under pressure. It also produces a life in which the other two layers are downstream — felt afterwards, and often only when there is time. The interesting work is not more reasoning but letting the older two finish speaking.',
        shadow: 'Arriving at the right answer and not arriving at anything.',
        color: 'sky',
        masters: ['jnana', 'neuroscience'],
        calibration: {
          dimensions: { thought: 0.4, spirit: 0.2, body: 0.1 },
          practiceLevels: { jnana: 1, neuroscience: 1 },
          tags: ['analytical', 'reasoning-first'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'dosha-constitution',
    title: 'Doṣa constitution',
    subtitle: 'Your Ayurvedic balance',
    module: 'Engines',
    tradition: 'ayurvedic',
    dimensionCategory: 'constitution',
    coverEmoji: '🌿',
    estimatedMinutes: 7,
    version: 1,
    intro:
      'Āyurveda reads health as a balance between three forces that are always in motion: vāta, the movement of wind; pitta, the metabolism of heat and light; and kapha, the structure and lubrication of water and earth. Each person is read as a proportion rather than a type, and the proportion shifts with the season, the food and the life being lived.\n\nThis is a working description, not a diagnosis, and it is not a substitute for any medical opinion about the body. What it is genuinely useful for is noticing which of your own tendencies is currently running hottest, because a great deal of what people call their personality is one doṣa behaving predictably.',
    dimensions: ['vata', 'pitta', 'kapha'],
    engineHooks: {
      loopsToCheck: ['over-committed', 'avoidance-map'],
      practiceAffinity: ['body', 'breath', 'raja'],
      deepensWith: ['nervous-system-tone', 'sleep-signature'],
    },
    questions: [
      q3(
        'dosha-tempo',
        'tempo',
        'How does your mind normally move?',
        'Set a description of your mind beside these three and choose the closest.',
        'One of these three fits the way you think, one fits how you handle heat and pressure, and one fits how slowly or heavily you move. Which is which for you?',
        pickOne(
          [
            'Quick, light, several things at once',
            'Sharp, hot, focused to the point of narrowing',
            'Slow, heavy, hard to shift once set',
          ],
          ['vata', 'pitta', 'kapha'],
        ),
      ),
      q3(
        'dosha-frame',
        'frame',
        'How does your body usually feel to live in?',
        'Ignoring any illness, what is the ordinary texture of your body?',
        'The body is where the doṣas are least defended and most obvious. Before you are influenced by which one sounds best, which description of your own frame has always been true?',
        pickOne(
          [
            'Light and dry, and I feel the cold',
            'Warm and sharp, and I run hot',
            'Solid and slow, and it takes a while to warm up',
          ],
          ['vata', 'pitta', 'kapha'],
        ),
      ),
      q3(
        'dosha-appetite',
        'appetite',
        'What is your appetite like on an ordinary day?',
        'How does hunger behave when nothing is wrong?',
        'Hunger is one of the clearest daily readings of which doṣa is dominant. What is the pattern when you are not paying attention to it?',
        scale(
          ['Irregular — some days I forget to eat', 'Sharp — I am hungry and I want it now', 'Steady, and I can skip without noticing'],
          ['vata', 'pitta', 'kapha'],
        ),
      ),
      q3(
        'dosha-sleep',
        'sleep',
        'What is your sleep actually like?',
        'How do you go down, and how do you get up?',
        'Sleep shows the proportion without any effort of interpretation. Read your own nights against these three and see which one you recognise from a distance.',
        scale(
          ['Light, and easily broken', 'Short, and I wake up alert', 'Deep and long, and hard to leave'],
          ['vata', 'pitta', 'kapha'],
        ),
      ),
      q3(
        'dosha-unwell',
        'fever',
        'When you are unwell, what changes in you first?',
        'What is always the first thing to go when you are ill?',
        'Illness disturbs the balance and the disturbance has a signature. Knowing which doṣa goes first is the first half of Āyurveda and, on its own, a useful map of your own fragility.',
        pickOne(
          [
            'I become restless, and I cannot settle anywhere',
            'I become hot, irritable, and unable to sleep',
            'I become heavy, slow, and want to be left alone',
          ],
          ['vata', 'pitta', 'kapha'],
        ),
      ),
      q3(
        'dosha-weather',
        'weather',
        'What is the weather inside you on a normal day?',
        'How constant is your own inner weather?',
        'Every doṣa has a weather, and they are described by constancy and change. The most useful question is not which sounds healthy but which one is actually yours.',
        scale(
          ['Constantly changing; I am never the same twice', 'Mostly changing, but in a consistent direction', 'Warm and steady, with sharp edges now and then', 'Slow and consistent, occasionally heating up', 'Almost unchanging'],
          ['vata', 'vata', 'pitta', 'pitta', 'kapha'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'vata',
        label: 'Vāta-dominant',
        short: 'Movement with very little holding it',
        description:
          'Movement, lightness and change dominate: quick thought, variable appetite, light sleep, a body that feels the cold. The strength is adaptability — this constitution can go anywhere and learn anything. The difficulty is that nothing accumulates, and a life without something heavy in it keeps resetting rather than building.',
        shadow: 'Mistaking restlessness for freedom, and reinvention for progress.',
        color: 'sky',
        masters: ['breath', 'body'],
        calibration: {
          dimensions: { body: 0.25, spirit: 0.2, thought: 0.2 },
          practiceLevels: { breath: 1, body: 1 },
          domainStress: { grounding: 'health' },
          tags: ['mobile', 'lightly-held'],
        },
      },
      {
        id: 'pitta',
        label: 'Pitta-dominant',
        short: 'Heat, focus, and a narrowing edge',
        description:
          'Heat and light dominate: sharp attention, strong appetite, short efficient sleep, a body that runs warm. This is the constitution of people who get things done, and it works until the heat starts costing sleep, digestion and patience. Pitta in excess is not aggression; it is heat with nowhere to go.',
        shadow: 'Confusing the sharpness of the focus with the whole truth.',
        color: 'orange',
        masters: ['body', 'kriya'],
        calibration: {
          dimensions: { emotion: 0.25, body: 0.25, action: 0.2 },
          practiceLevels: { body: 1, kriya: 1 },
          domainStress: { heat: 'health' },
          tags: ['hot', 'focused'],
        },
      },
      {
        id: 'kapha',
        label: 'Kapha-dominant',
        short: 'Structure, with a cost in inertia',
        description:
          'Structure and lubrication dominate: steady appetite, deep sleep, a solid frame, a mind that does not move until it decides to. The strength is that things built in this constitution last. The difficulty is that the same stability that holds also resists change, and the resistance is felt from the inside as reluctance.',
        shadow: 'Reading immobility as rest, and rest as enough.',
        color: 'teal',
        masters: ['raja', 'breath'],
        calibration: {
          dimensions: { body: 0.3, emotion: 0.15, spirit: 0.15 },
          practiceLevels: { raja: 1, breath: 1 },
          tags: ['heavy', 'slow'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'mind-body-type',
    title: 'Mind–body type',
    subtitle: 'How thought and body relate for you',
    module: 'Engines',
    tradition: 'yogic',
    dimensionCategory: 'engines',
    coverEmoji: '🧩',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Traditional practice is built on an assumption the modern world mostly dropped: that the body is not a container for the mind but a second site of knowing. Yogic practice in particular works by joining them — a posture that makes a thought harder to sustain, a breath that makes a feeling visible.\n\nThis asks which of the two you consult first. There is no correct answer and no fixed type; the order shifts with fatigue, fear and pressure, and the interesting material is in where it breaks down rather than where it usually sits.',
    dimensions: ['head-first', 'balanced', 'body-first'],
    engineHooks: {
      loopsToCheck: ['over-thinking', 'avoidance-map'],
      practiceAffinity: ['body', 'observation', 'breath'],
      deepensWith: ['three-brains', 'sensory-awareness'],
    },
    questions: [
      q3(
        'mindbody-decide',
        'decisions',
        'How does a decision actually get made in you?',
        'What is the order of operations when you have to choose?',
        'Almost everyone believes they decide with the head and consult the body afterwards. Look at the last real decision you made and say which of the two was actually consulted.',
        pickOne(
          [
            'I think it through until the reasoning holds',
            'I weigh it up and then simply do it',
            'I wait, and I see what the body says',
          ],
          ['head-first', 'balanced', 'body-first'],
        ),
      ),
      q3(
        'mindbody-speed',
        'speed',
        'How quickly does the head answer, before the body has been asked?',
        'How much of a decision is made before anything has been felt?',
        'The order is set by long habit, not by nature, and the habit was formed early and rarely reviewed. How fast does yours run?',
        likert5('head-first', [
          'The body is nearly always first',
          'The body usually gets there first',
          'It varies, and it depends on the day',
          'The head is usually ahead',
          'The head has always answered first',
        ]),
      ),
      q3(
        'mindbody-truth',
        'certainty',
        'What is your first response to something you are told is true?',
        'How do you test a claim before you accept it?',
        'Each of these tests for truth in a different place, and none of them is the correct one. What does yours reach for first, before the reasoning has started?',
        scale(
          ['I want to feel whether it is true', 'I want to see whether it fits how things are', 'I want to check it against what I already know'],
          ['body-first', 'balanced', 'head-first'],
        ),
      ),
      q3(
        'mindbody-late',
        'hurry',
        'You are running late and slightly lost. What happens next?',
        'Put a small pressure on and watch the order of operations.',
        'Under time pressure the trained order collapses into its actual order. You are late and you do not know the way — what does your system do first?',
        scale(
          ['I stop, breathe, and let the tension go before I move', 'I do both at once — ask someone while I walk', 'I plan the route in my head and talk myself through it'],
          ['body-first', 'balanced', 'head-first'],
        ),
      ),
      q3(
        'mindbody-signal',
        'signal',
        'How does your body tell you that something is wrong?',
        'What is the first sign you get, and how early?',
        'The body speaks earlier than the mind and in a language the mind has to learn. How legible is yours to you?',
        scale(
          ['It changes before I have any idea why', 'It tells me clearly, and I listen', 'I find out later, as a thought I have already finished'],
          ['body-first', 'balanced', 'head-first'],
        ),
      ),
      q3(
        'mindbody-dispute',
        'dispute',
        'When your head and your body disagree, how is it settled?',
        'Which of the two has the last word, and how is that decided?',
        'The two are not arguing about facts; they are arguing about what counts as evidence. Watch the next time it happens and see which one is allowed to settle it.',
        scale(
          ['The body wins, whatever the argument', 'They negotiate, and something in the middle usually appears', 'The head wins, and the body is told afterwards'],
          ['body-first', 'balanced', 'head-first'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'head-first',
        label: 'Head-first',
        short: 'The thinking comes first',
        description:
          'Reasoning leads and the body is a source of information consulted late, if at all. That ordering produces clarity and reliability in most situations that can be thought about, and quietly removes the body from decisions that cannot. The work here is not to stop thinking first — it is to give the body a vote.',
        shadow: 'Believing the body has nothing to add to an argument it was not consulted on.',
        color: 'sky',
        masters: ['jnana', 'observation'],
        calibration: {
          dimensions: { thought: 0.4, body: 0.15, spirit: 0.15 },
          practiceLevels: { jnana: 1, observation: 1 },
          domainStress: { attention: 'observation' },
          tags: ['head-dominant', 'analytical'],
        },
      },
      {
        id: 'balanced',
        label: 'Balanced',
        short: 'Both arrive, roughly together',
        description:
          'Thought and body are consulted in the same breath, which is what most practice is built to develop and what the least practised people manage by accident. The strength is genuine: you can be accurate and still be in contact with what is happening. The risk is integration being taken for granted rather than maintained.',
        shadow: 'Assuming the balance will hold without being fed.',
        color: 'teal',
        masters: ['body', 'raja'],
        calibration: {
          dimensions: { body: 0.25, thought: 0.2, action: 0.2 },
          practiceLevels: { body: 1, raja: 1 },
          tags: ['integrated', 'two-way'],
        },
      },
      {
        id: 'body-first',
        label: 'Body-first',
        short: 'The knowing arrives in the body',
        description:
          'The body answers first and the reasoning arrives afterwards to organise what has already happened. This is a fast and accurate channel when it is trusted, and it is easy to misread as instinct or as a mood. The work is learning the difference between what the body says and what it has learned to say on your behalf.',
        shadow: 'Taking every signal from the body as a message.',
        color: 'violet',
        masters: ['body', 'breath'],
        calibration: {
          dimensions: { body: 0.35, spirit: 0.2, emotion: 0.15 },
          practiceLevels: { body: 2, breath: 1 },
          tags: ['somatic', 'intuitive'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'witness-capacity',
    title: 'Witness capacity',
    subtitle: 'How much you can observe yourself',
    module: 'Observation',
    tradition: 'yogic',
    dimensionCategory: 'witness',
    coverEmoji: '👁️',
    estimatedMinutes: 7,
    version: 1,
    intro:
      'Witnessing is a capacity, not a virtue, and like every capacity it exists on a scale. Some people can watch themselves in real time. Some can only reconstruct it afterwards, and a few have never found the vantage point at all.\n\nAll four positions on that scale are workable, and the one you are in says almost nothing about what is available to you. What it changes is the size of the gap between what happens and what you know about it — and that gap is the only place any of this can be worked on.',
    dimensions: ['absent', 'occasional', 'steady', 'relentless'],
    engineHooks: {
      loopsToCheck: ['reactivity', 'self-talk'],
      practiceAffinity: ['witnessing', 'observation'],
      deepensWith: ['presence-quality', 'mind-wandering'],
    },
    questions: [
      q3(
        'witness-catch',
        'catch',
        'When something happens inside you, when do you notice it?',
        'How close is the noticing to the event?',
        'The distance between the event and the noticing is the whole measure here. Take the last time you were caught off guard and count the distance — how much was there?',
        scale(
          [
            'I do not notice it at the time at all',
            'I notice it once it has finished',
            'I notice it as it is happening',
            'I notice it as it starts, and watch the whole of it',
          ],
          ['absent', 'occasional', 'steady', 'relentless'],
        ),
      ),
      q3(
        'witness-hour',
        'moment',
        'During an ordinary hour, how much of it are you watching?',
        'Take a single unremarkable hour. How much of it were you actually there for?',
        'An hour is a fair sample. Nobody watches all of one, and everybody thinks they do. How much of yours is actually under observation?',
        scale(
          [
            'Almost none of it',
            'A few minutes scattered through it',
            'A fair share of it',
            'Most of it',
            'Nearly all of it, including the boring parts',
          ],
          ['absent', 'absent', 'occasional', 'steady', 'relentless'],
        ),
      ),
      q3(
        'witness-where',
        'position',
        'When you do watch, where is the watcher standing?',
        'What part of you does the observing happen from?',
        'The vantage point is a real location, and most people have never had to find it on purpose. Where does yours sit?',
        pickOne(
          [
            'I cannot find one, and I have stopped looking',
            'In the head, mostly, watching thoughts',
            'In the head and the body both',
            'Wide — it includes what is around me as well as what is in me',
          ],
          ['absent', 'occasional', 'steady', 'relentless'],
        ),
      ),
      q3(
        'witness-after',
        'aftermath',
        'How long after something happens can you still go back and see it?',
        'How far back can you actually re-watch an event?',
        'A memory is not a recording. What you can still see in detail, and with feeling, is the measure of how much was witnessed at the time.',
        scale(
          ['I cannot do it at all', 'For a few minutes afterwards', 'For a day or two', 'Years later, and it is still clear'],
          ['absent', 'occasional', 'steady', 'relentless'],
        ),
      ),
      q3(
        'witness-effort',
        'effort',
        'How much effort does watching yourself actually take?',
        'Is the attention on your own attention a strain or a habit?',
        'Effort here is not a sign of doing it badly. It is a measure of how much of your attention is already committed elsewhere, and that is worth knowing before anything is added to your day.',
        likert5('steady', [
          'It is not something I am able to do',
          'It takes more than I can sustain',
          'It is a real effort most of the time',
          'It needs very little',
          'It costs me almost nothing',
        ]),
      ),
      q3(
        'witness-idle',
        'idle',
        'When you are not doing anything, is the watching still there?',
        'Does the vantage point survive an empty moment?',
        'This is where watching either becomes a real capacity or reveals itself as a performance. When nothing is happening, is the observer still in place?',
        scale(
          [
            'It stops the moment I stop',
            'It comes and goes',
            'It is there much of the time',
            'It is the thing that is still there when everything else stops',
          ],
          ['absent', 'occasional', 'steady', 'relentless'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'absent',
        label: 'Absent',
        short: 'There is no vantage point yet',
        description:
          'The internal life is happening without being watched, which is not unusual and is not permanent. Nothing here needs to be built from nothing — the first move is usually the crudest possible one, a few minutes a day of paying attention to something dull, which is enough for the vantage point to start existing.',
        shadow: 'Concluding from a single ordinary day that the capacity is absent.',
        color: 'slate',
        masters: ['observation', 'body'],
        calibration: {
          dimensions: { thought: 0.2, body: 0.2, emotion: 0.15 },
          practiceLevels: { observation: 2, body: 1 },
          domainStress: { attention: 'observation' },
          tags: ['unwitnessed', 'beginning'],
        },
      },
      {
        id: 'occasional',
        label: 'Occasional',
        short: 'The noticing arrives after the fact',
        description:
          'The watching happens, but retrospectively — the event is available afterwards rather than during. This is a real capacity, not a failed version of a better one, and it is the direct result of too much of your attention being allocated elsewhere. The work is moving the noticing forward rather than making it deeper.',
        shadow: 'Analysing the pattern instead of catching the instance.',
        color: 'amber',
        masters: ['observation', 'witnessing'],
        calibration: {
          dimensions: { thought: 0.25, spirit: 0.2, emotion: 0.15 },
          practiceLevels: { observation: 1, witnessing: 1 },
          tags: ['retrospective', 'catching-up'],
        },
      },
      {
        id: 'steady',
        label: 'Steady',
        short: 'The watching runs while you are in it',
        description:
          'The vantage point holds during the event rather than after it, which means reactions can be watched as they form instead of reconstructed. The difficulty at this level is not the seeing but the staying — capacity that is not deliberately supported tends to narrow, and what was available last year is not automatically available now.',
        shadow: 'Mistaking a capacity that works for one that will keep working.',
        color: 'teal',
        masters: ['witnessing', 'observation'],
        calibration: {
          dimensions: { spirit: 0.3, emotion: 0.2, body: 0.15 },
          practiceLevels: { witnessing: 2 },
          tags: ['sustained-witness', 'present'],
        },
      },
      {
        id: 'relentless',
        label: 'Relentless',
        short: 'Very little goes unwatched',
        description:
          'The watching is continuous and includes the parts most people exclude — the boring, the embarrassing, the sleep. This is a genuine capacity and it carries a specific difficulty, which is that it is easy to start watching everything and including the people you are with. Awareness that stops arriving at other people eventually becomes a way of being absent from them.',
        shadow: 'Using the watching to stay out of the room.',
        color: 'indigo',
        masters: ['witnessing', 'jnana'],
        calibration: {
          dimensions: { spirit: 0.45, thought: 0.2 },
          practiceLevels: { witnessing: 2, jnana: 1 },
          domainStress: { contact: 'relationship' },
          tags: ['continuous-witness', 'deep'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'presence-quality',
    title: 'Presence quality',
    subtitle: 'How much of you is here',
    module: 'Observation',
    tradition: 'vedic',
    dimensionCategory: 'witness',
    coverEmoji: '⏳',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Presence is usually described as a single state, present or absent, and it is easier to use as a way of being dissatisfied with yourself than as a description of anything. Most people are in a third place: enough of them is here to function and not enough to be satisfied.\n\nThe four positions here are about quantity and continuity rather than quality. The one that matters most is not the amount of presence available but how easily the missing part comes back once it has gone.',
    dimensions: ['scattered', 'fragmented', 'mostly-here', 'fully-here'],
    engineHooks: {
      loopsToCheck: ['rumination', 'attention-drift'],
      practiceAffinity: ['observation', 'breath', 'witnessing'],
      deepensWith: ['witness-capacity', 'attention-diet'],
    },
    questions: [
      q3(
        'presence-location',
        'location',
        'While you are doing the thing you are doing, where is most of you?',
        'Take the last hour and find out where your attention actually was.',
        'Presence is not a mood, it is a location, and most of us spend the day somewhere other than where our hands are. Set an hour aside and check honestly where you were.',
        scale(
          [
            'Wherever the loudest thing is',
            'In the task, with a piece of me somewhere else',
            'In the task, properly',
            'In the task and in the body doing it',
          ],
          ['scattered', 'fragmented', 'mostly-here', 'fully-here'],
        ),
      ),
      q3(
        'presence-return',
        'return',
        'Something pulls you away. How long before you are back?',
        'What is the recovery time once attention has gone?',
        'The distance you can close is a better measure than the distance you fall. Everything gets taken eventually; what varies is how quickly you come back to where you were.',
        scale(
          ['I do not come back that day', 'An hour or two, if I notice at all', 'A few minutes', 'Almost at once'],
          ['scattered', 'fragmented', 'mostly-here', 'fully-here'],
        ),
      ),
      q3(
        'presence-others',
        'others',
        'In the middle of a conversation, how much of you is actually there?',
        'During an ordinary exchange, how much of your attention is on the person?',
        'A conversation is the most reliable test of presence, because the other person can tell. How much of yours is genuinely available to them?',
        likert5('fragmented', [
          'All of it, including the parts I would rather keep back',
          'Most of me',
          'About half',
          'A little of it',
          'None of it — I am elsewhere for most of it',
        ]),
      ),
      q3(
        'presence-wait',
        'waiting',
        'You are waiting for something. What happens?',
        'How do you hold a stretch of time where nothing is required of you?',
        'Waiting is the honest test, because there is nothing to be present about. What does the empty stretch turn into?',
        pickOne(
          [
            'It is uncomfortable and I fill it',
            'I check my phone and stay half in the moment',
            'I let the wait be a wait',
            'The wait becomes interesting in itself',
          ],
          ['scattered', 'fragmented', 'mostly-here', 'fully-here'],
        ),
      ),
      q3(
        'presence-night',
        'night',
        'In the moment before sleep, where is most of you?',
        'What is still running as you go under?',
        'The last thing to settle before sleep is the thing your day was actually made of, and it does not always match the day you think you had. What is still in there?',
        scale(
          ['Racing through the day, unfinished',
           'Still in the last conversation',
           'In the body at last, and quiet',
           'Wide open, and not going anywhere'],
          ['scattered', 'fragmented', 'mostly-here', 'fully-here'],
        ),
      ),
      q3(
        'presence-gap',
        'gap',
        'How often do you suddenly realise you were somewhere else?',
        'How often does the gap between where you are and where you are get noticed?',
        'A gap that gets caught is a working system, not a failing one. How often does the catching happen?',
        scale(
          ['Several times an hour', 'A few times a day', 'A few times a week', 'Almost never'],
          ['scattered', 'fragmented', 'mostly-here', 'fully-here'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'scattered',
        label: 'Scattered',
        short: 'Most of you is somewhere else',
        description:
          'Attention is being taken more than given, and the loudest input in the room is the one that gets the hours. This is a description of an overloaded nervous system rather than of a character, and it responds quickly to any change in what comes in. Almost nothing else moves as fast.',
        shadow: 'Reading the overload as evidence that there is not enough of you to go around.',
        color: 'rose',
        masters: ['observation', 'breath'],
        calibration: {
          dimensions: { thought: 0.3, body: 0.15, emotion: 0.15 },
          practiceLevels: { observation: 1, breath: 1 },
          domainStress: { attention: 'observation' },
          tags: ['scattered', 'dispersed'],
        },
      },
      {
        id: 'fragmented',
        label: 'Fragmented',
        short: 'Here and there, in pieces',
        description:
          'A workable amount of you is present and a working amount is not, and the split is invisible from the inside. This is a very common shape and it is mostly a load problem — the fragmentation points at how many things are being held, not at any failure of attention. It resolves when the load does, and it does not resolve by trying harder to concentrate.',
        shadow: 'Treating a load problem as a discipline problem.',
        color: 'amber',
        masters: ['observation', 'witnessing'],
        calibration: {
          dimensions: { thought: 0.25, emotion: 0.2, body: 0.15 },
          practiceLevels: { observation: 1, witnessing: 1 },
          tags: ['partial', 'split'],
        },
      },
      {
        id: 'mostly-here',
        label: 'Mostly here',
        short: 'Present, with a residue elsewhere',
        description:
          'Most of you is in the room and a background part is still running something else — usually the day that has not been dealt with yet. This is the most workable position in the set, and the residue is usually identifiable if you look for it. It shrinks with attention and grows with an unclosed day.',
        shadow: 'Calling the residue part of your personality.',
        color: 'teal',
        masters: ['witnessing', 'breath'],
        calibration: {
          dimensions: { spirit: 0.3, body: 0.2, emotion: 0.15 },
          practiceLevels: { witnessing: 1, breath: 1 },
          tags: ['mostly-present', 'residual'],
        },
      },
      {
        id: 'fully-here',
        label: 'Fully here',
        short: 'The whole of you is in the moment',
        description:
          'The whole of you arrives, including the parts that would rather stay folded away. This is a genuine attainment and it is not comfortable to live in permanently — full presence in one place means the other places go unfilled, and the people who are not in front of you are the ones paying for it.',
        shadow: 'Absence in the room mistaken for depth elsewhere.',
        color: 'indigo',
        masters: ['witnessing', 'raja'],
        calibration: {
          dimensions: { spirit: 0.45, body: 0.15 },
          practiceLevels: { witnessing: 2, raja: 1 },
          domainStress: { contact: 'relationship' },
          tags: ['fully-present', 'whole'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'time-relationship',
    title: 'Time relationship',
    subtitle: 'Your relationship with time',
    module: 'Observation',
    tradition: 'vedic',
    dimensionCategory: 'rhythm',
    coverEmoji: '⏰',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Vedic thought treats time as something a person has a relationship with, not a container they are put inside — which is why the same life can feel generous to one person and brutal to another, on identical schedules.\n\nWhat follows is about felt time rather than clock time, and the two come apart more often than people expect. None of the five positions is a personality defect; they are five different relationships with the same amount of it.',
    dimensions: ['rushed', 'deficient', 'adequate', 'spacious', 'abundant'],
    engineHooks: {
      loopsToCheck: ['over-committed', 'urgency'],
      practiceAffinity: ['observation', 'raja', 'breath'],
      deepensWith: ['daily-rhythm', 'energy-baseline'],
    },
    questions: [
      q3(
        'time-texture',
        'texture',
        'What does time feel like from the inside of an ordinary day?',
        'Not how long the day is — what it is like while you are in it.',
        'The day has a fixed number of hours and no fixed quality. What quality does yours have while you are living it?',
        scale(
          [
            'It is always running out',
            'There is never quite enough',
            'It is about what I need',
            'There is real room in it',
            'There is more of it than I can use',
          ],
          ['rushed', 'deficient', 'adequate', 'spacious', 'abundant'],
        ),
      ),
      q3(
        'time-speed',
        'speed',
        'How often are you behind, late, or running?',
        'How much of the week is spent catching up with the week?',
        'Being permanently behind is a measurement of load and not of pace, though it is usually felt as pace. How much of your time is spent in that state?',
        likert5('rushed', [
          'Almost never',
          'Rarely',
          'Often enough to notice',
          'Most days',
          'Constantly',
        ]),
      ),
      q3(
        'time-deadline',
        'deadline',
        'A deadline is set for something. How does it sit with you?',
        'What happens in you when somebody else sets the clock?',
        'A deadline that belongs to someone else is a different object from one you set, and the body does not treat them the same. Which of these is closest to what happens?',
        scale(
          [
            'I set my own earlier one, and keep to it',
            'I plan it properly and finish with room to spare',
            'I work steadily and finish just in time',
            'Panic, and nothing gets done until the last hour',
          ],
          ['abundant', 'spacious', 'adequate', 'rushed'],
        ),
      ),
      q3(
        'time-past',
        'past',
        'What happens to yesterday?',
        'Is yesterday still available to you, or is it closed?',
        'A past you can re-enter is a resource rather than a loss. It is also, not coincidentally, the same structure as being able to return to a moment you have left behind. How is yours?',
        scale(
          [
            'It is gone, and I was not there for it',
            'It is a real day and I was mostly present for it',
            'It is available — I can go back into it whenever I want',
          ],
          ['rushed', 'adequate', 'abundant'],
        ),
      ),
      q3(
        'time-future',
        'future',
        'When you think about later, what arrives?',
        'What is the shape of the future in your mind?',
        'The future you are carrying is the same future for everyone and is rarely the one that happens. What is actually in yours?',
        pickOne(
          [
            'Anxiety about catching up',
            'A vague sense of not having enough',
            'A plan that would probably work',
            'Room to do one of the things I have wanted to',
            'Nothing in particular; I am not in a hurry',
          ],
          ['rushed', 'deficient', 'adequate', 'spacious', 'abundant'],
        ),
      ),
      q3(
        'time-wait',
        'wait',
        'How well can you wait?',
        'What do you do with a stretch of time that is not required of you?',
        'Waiting is where a relationship with time shows itself most plainly, because nothing can be done to improve it. How do you hold one?',
        scale(
          ['Badly, and I fill every part of it', 'Acceptably', 'Without much difficulty', 'Comfortably, and I notice what is happening while I do'],
          ['rushed', 'deficient', 'adequate', 'spacious'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'rushed',
        label: 'Rushed',
        short: 'Time is always behind you',
        description:
          'The day is always arriving faster than you can meet it, and the pace is felt in the body as much as in the mind. This is a reliable system for a life with a genuine emergency in it and an expensive one for a life that mostly does not. Behind it there is usually an amount to hold that was never actually chosen.',
        shadow: 'Reading the amount to hold as a personal failing.',
        color: 'rose',
        masters: ['breath', 'observation'],
        calibration: {
          dimensions: { body: 0.25, thought: 0.25, emotion: 0.2 },
          practiceLevels: { breath: 1, observation: 1 },
          domainStress: { pace: 'health' },
          tags: ['time-pressured', 'urgent'],
        },
      },
      {
        id: 'deficient',
        label: 'Deficient',
        short: 'There is never enough of it',
        description:
          'Not panic, but a persistent shortfall — always one thing short of what the week requires. The feeling is accurate in the sense that something real is missing; what is missing is usually capacity or margin rather than hours. Adding more hours to that arrangement has a poor record of fixing it.',
        shadow: 'Working longer inside a structure that was already too small.',
        color: 'orange',
        masters: ['raja', 'karma'],
        calibration: {
          dimensions: { action: 0.25, thought: 0.2, body: 0.15 },
          practiceLevels: { raja: 1, karma: 1 },
          domainStress: { load: 'work-career' },
          tags: ['short', 'over-committed'],
        },
      },
      {
        id: 'adequate',
        label: 'Adequate',
        short: 'Enough, and enough is genuinely enough',
        description:
          'The week matches what you have, without much margin either way. This is a stable and under-rated position: it is the one from which decisions are made without panic and from which a practice can actually be sustained. The question worth sitting with is whether adequate is what you are aiming for.',
        shadow: 'Mistaking a workable amount for the whole ambition.',
        color: 'teal',
        masters: ['raja', 'observation'],
        calibration: {
          dimensions: { action: 0.2, body: 0.2, emotion: 0.15 },
          practiceLevels: { raja: 1 },
          tags: ['manageable', 'even'],
        },
      },
      {
        id: 'spacious',
        label: 'Spacious',
        short: 'There is room in the day',
        description:
          'The day has margin in it, and the margin is being used rather than defended. This is largely a matter of load and of what has been agreed to, and it is the position from which the most interesting work gets done. The one thing to watch is whether the space stays yours or gets quietly filled.',
        shadow: 'Losing the margin to the first thing that needs it.',
        color: 'sky',
        masters: ['breath', 'raja'],
        calibration: {
          dimensions: { spirit: 0.25, body: 0.2, action: 0.15 },
          practiceLevels: { breath: 1, raja: 1 },
          tags: ['spacious', 'unhurried'],
        },
      },
      {
        id: 'abundant',
        label: 'Abundant',
        short: 'Time is material you work with',
        description:
          'Time reads as a material rather than a constraint — you set the measure and work inside it, and the past remains available rather than closed. Most people reach this by removing commitments rather than by rearranging them. The particular risk of living in a wide time is that other people’s narrower time starts to feel like an imposition on yours.',
        shadow: 'Experiencing other people’s pace as an interruption to your own.',
        color: 'indigo',
        masters: ['witnessing', 'jnana'],
        calibration: {
          dimensions: { spirit: 0.35, thought: 0.2 },
          practiceLevels: { witnessing: 2, jnana: 1 },
          tags: ['unbounded', 'timeless'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'emotional-range',
    title: 'Emotional range',
    subtitle: 'The full width of what you feel',
    module: 'Observation',
    tradition: 'yogic',
    dimensionCategory: 'emotion',
    coverEmoji: '🎚️',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Yoga spends a great deal of its early work on feeling, almost all of it on the assumption that most people feel less than they think they do. The assumption is often right, and it is not a criticism: a nervous system that has been doing useful work for a long time tends to narrow its range deliberately, because breadth is expensive.\n\nRange is a capacity, not a mood, and the four positions here describe the width of what is available to you rather than how much you feel at any one time. Volume and range are different things, and they are easy to confuse from the inside.',
    dimensions: ['narrow', 'reactive', 'wide', 'vast'],
    engineHooks: {
      loopsToCheck: ['suppression', 'reactivity'],
      practiceAffinity: ['observation', 'emotional-healing', 'body'],
      deepensWith: ['ground-state', 'sensory-awareness'],
    },
    questions: [
      q3(
        'emotion-vocabulary',
        'naming',
        'How many words do you have for how you feel?',
        'How precisely can you name the state you are in?',
        'Naming is not labelling. A person with a wide range and no words for it cannot use any of it, and a person with a narrow range and good words can go a surprisingly far. Which of these is yours?',
        pickOne(
          [
            'Two or three, and they cover nearly everything',
            'Plenty, though most of them are good or bad',
            'A fair number, and I can be precise about them',
            'Enough to describe things I have not felt before',
          ],
          ['narrow', 'reactive', 'wide', 'vast'],
        ),
      ),
      q3(
        'emotion-breadth',
        'breadth',
        'Over a month, how wide is the range of what you feel?',
        'Take the last month. How many genuinely different states did you live in?',
        'Count states rather than events. A month in which you felt sad, anxious, glad, tired and flat is a wider month than one in which you felt good and bad, however much bigger the swings were.',
        scale(
          [
            'Much the same few things',
            'Strong things, but few of them',
            'A good spread, most weeks',
            'Something new almost every week',
          ],
          ['narrow', 'reactive', 'wide', 'vast'],
        ),
      ),
      q3(
        'emotion-volume',
        'volume',
        'How large do your feelings get?',
        'How much does a feeling take up when it arrives?',
        'Volume is not width, and a small range can still be loud. Whatever your breadth here, notice which of the two is doing more of the work in your life.',
        likert5('reactive', [
          'Quiet, even when it matters',
          'Moderate, and no more than the moment needs',
          'As large as the moment calls for',
          'Quickly, and at full volume',
          'Overwhelmingly, and for a long time afterwards',
        ]),
      ),
      q3(
        'emotion-location',
        'location',
        'Where do your feelings show up in the body?',
        'Can you point at where it is, or is it everywhere at once?',
        'The body is where the difference between a narrow range and a wide one becomes visible. What does yours look like from the inside?',
        scale(
          [
            'Somewhere I cannot identify at all',
            'All over at once, and loudly',
            'In one place I know well',
            'In fine detail, all over, and moving',
          ],
          ['narrow', 'reactive', 'wide', 'vast'],
        ),
      ),
      q3(
        'emotion-aftermath',
        'aftermath',
        'After a strong feeling has passed, what is left?',
        'What does the wave leave behind on the beach?',
        'The residue is where the useful part of a feeling is kept, and it is rarely looked at. What is there when the intensity has gone?',
        scale(
          [
            'Nothing — it goes and I do not know where it went',
            'Tiredness, and a long tail',
            'A clear sense of what it was about',
            'Something that has changed in me and stayed changed',
          ],
          ['narrow', 'reactive', 'wide', 'vast'],
        ),
      ),
      q3(
        'emotion-others',
        'others',
        'How much of what you feel do other people get to see?',
        'How much of the interior is available to the people near you?',
        'Feelings that are never shown and feelings that are shown instantly are two different problems, and both are common. Which of these is the shape of yours?',
        scale(
          ['Almost none of it', 'All of it, and immediately', 'A fair amount, when I choose to', 'Whatever is actually there, as it is'],
          ['narrow', 'reactive', 'wide', 'vast'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'narrow',
        label: 'Narrow',
        short: 'The range is small and unusually reliable',
        description:
          'A small number of states, held consistently, with a limited vocabulary for them. This is efficient and it is often the result of a system that narrowed its range on purpose a long time ago. It is worth testing rather than assuming — a narrow range and a suppressed range can look identical from the inside, and they are not the same thing.',
        shadow: 'Reading suppression as simplicity because both feel quiet.',
        color: 'slate',
        masters: ['observation', 'body'],
        calibration: {
          dimensions: { emotion: 0.2, body: 0.2, thought: 0.15 },
          practiceLevels: { observation: 1, body: 1 },
          domainStress: { feeling: 'emotional-healing' },
          tags: ['under-felt', 'narrow'],
        },
      },
      {
        id: 'reactive',
        label: 'Reactive',
        short: 'Big, immediate, and gone by morning',
        description:
          'Strong feelings with few of them: everything arrives at full volume, resolves quickly, and leaves a residue rather than a result. The energy in this is considerable and it is genuinely felt. What is missing is not depth but continuity, and it is usually developed by staying with one feeling past the point where it would normally resolve.',
        shadow: 'Mistaking the size of the feeling for its depth.',
        color: 'rose',
        masters: ['emotional-healing', 'breath'],
        calibration: {
          dimensions: { emotion: 0.4, body: 0.2, thought: 0.1 },
          practiceLevels: { 'emotional-healing': 1, breath: 1 },
          domainStress: { feeling: 'emotional-healing' },
          tags: ['reactive', 'high-volume'],
        },
      },
      {
        id: 'wide',
        label: 'Wide',
        short: 'A full range, and enough language for it',
        description:
          'A wide range with a workable vocabulary: many states, locatable in the body, and mostly comprehensible while they are happening. This is the position most people are working towards and it is genuinely useful. What it can hide is depth — everything is felt, and some of it is felt shallowly, which feels like breadth without it being depth.',
        shadow: 'Collecting states without staying in any of them.',
        color: 'teal',
        masters: ['observation', 'emotional-healing'],
        calibration: {
          dimensions: { emotion: 0.3, body: 0.2, spirit: 0.15 },
          practiceLevels: { observation: 1, 'emotional-healing': 1 },
          tags: ['full-range', 'precise'],
        },
      },
      {
        id: 'vast',
        label: 'Vast',
        short: 'It keeps going past what you expected',
        description:
          'Range and depth together: states arrive that you had no word for, the body registers them finely, and what is left afterwards has altered something. The difficulty is that the world is built for people with a narrower range, and a wide one puts a distance between you and almost everyone you meet. The range is rarely the problem. Living with it is.',
        shadow: 'The distance that a wide range puts between you and everyone else.',
        color: 'violet',
        masters: ['witnessing', 'bhakti'],
        calibration: {
          dimensions: { spirit: 0.35, emotion: 0.3 },
          practiceLevels: { witnessing: 1, bhakti: 1 },
          tags: ['deep-feeling', 'expansive'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'energy-bodies',
    title: 'Energy bodies',
    subtitle: 'The prāṇa bodies',
    module: 'Observation',
    tradition: 'yogic',
    dimensionCategory: 'vitality',
    coverEmoji: '🌬️',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Tantra and the kośa tradition describe the human being as layered: the physical body, the emotional body, the mental body, and the subtlest sheath of all. The layers are not stacked like boxes and the order is not a hierarchy of worth — they are progressively finer, and each one is harder to feel than the one below it.\n\nSo the question this mirror really asks is simple and slightly disorienting: of the four, which can you actually feel? The last is the subtlest, which means the least visible and the hardest to put a name to — and its absence of a name is not evidence that it is not there.',
    dimensions: ['physical', 'emotional', 'mental', 'spiritual'],
    engineHooks: {
      loopsToCheck: ['avoidance-map', 'over-thinking'],
      practiceAffinity: ['body', 'witnessing', 'kriya'],
      deepensWith: ['witness-capacity', 'presence-quality'],
    },
    questions: [
      q3(
        'bodies-feel',
        'access',
        'When you say you can feel something, which of these do you mean?',
        'Which of the four do you have actual access to?',
        'Most people are fluent in the first and think in the third, and have almost no vocabulary for the fourth. Be accurate rather than aspirational here — which one can you actually feel?',
        pickOne(
          [
            'Weight, heat, tension — the physical body',
            'The feeling in the chest, and the want behind it',
            'The working of thought, and the clarity or fog in it',
            'Something with no location and no name',
          ],
          ['physical', 'emotional', 'mental', 'spiritual'],
        ),
      ),
      q3(
        'bodies-depth',
        'subtlety',
        'How far down does your attention reach?',
        'How fine is the layer you can get to?',
        'Depth here is not effort. It is a matter of which layer is thin enough to see through. How far through can you actually get?',
        scale(
          [
            'The body and nothing finer than it',
            'As far as the feeling',
            'As far as the thinking',
            'All the way through to whatever is behind all of it',
          ],
          ['physical', 'emotional', 'mental', 'spiritual'],
        ),
      ),
      q3(
        'bodies-texture',
        'density',
        'Where does your sense of being solid actually sit?',
        'How solid is the experience, layer by layer?',
        'Most people find the solidity is not evenly distributed and are surprised by where it thins. Map your own and see which layer gives first.',
        scale(
          [
            'Solid all the way through',
            'Mostly solid, softer somewhere around the feeling',
            'It thins around the middle of the stack',
            'Thin for most of it, with one dense place left',
            'Nothing feels solid at all',
          ],
          ['physical', 'physical', 'emotional', 'mental', 'spiritual'],
        ),
      ),
      q3(
        'bodies-settles',
        'method',
        'What actually settles you?',
        'Which of these genuinely brings the system down?',
        'Everyone has the method that works, and everyone has the method they think should work. Look at what actually changes the state rather than what sounds right.',
        pickOne(
          [
            'Movement, food, water, sleep',
            'Music, other people, being held',
            'Reading, solving, being alone with a hard problem',
            'Stillness, with nothing added to it',
          ],
          ['physical', 'emotional', 'mental', 'spiritual'],
        ),
      ),
      q3(
        'bodies-night',
        'night',
        'As you go under, what lets go first?',
        'Which layer is the first to stop as you fall asleep?',
        'Sleep strips the layers in order, and the order is worth knowing because it is the reverse of the order they were built up. What goes first for you?',
        scale(
          [
            'The body gives out first',
            'The feelings loosen',
            'The thinking stops being interesting',
            'The last thing to go is the sense of being someone',
          ],
          ['physical', 'emotional', 'mental', 'spiritual'],
        ),
      ),
      q3(
        'bodies-finest',
        'finest',
        'How often do you notice the subtlest of the four?',
        'How often is the finest layer actually available to you?',
        'The subtlest sheath has no shape of its own, so noticing it is a matter of what is left when everything else is quiet. How often is anything left?',
        likert5('spiritual', [
          'Never, and I have no way of telling whether it is there',
          'Rarely',
          'Sometimes, and briefly',
          'Often, in quiet moments',
          'It is the first thing I notice',
        ]),
      ),
    ],
    resultTypes: [
      {
        id: 'physical',
        label: 'Physical body',
        short: 'The layer you actually live in',
        description:
          'Weight, heat, breath, fatigue — the outermost layer is the one with edges, and it is where most of a life is spent. That is not a limitation; the body is the only layer that has to be maintained, and everything built above it is built on it. What is worth knowing is where its limits currently sit, because the layers above are usually built on what it can supply.',
        shadow: 'Taking the outermost layer for the whole of what is there.',
        color: 'slate',
        masters: ['body', 'breath'],
        calibration: {
          dimensions: { body: 0.4, thought: 0.1 },
          practiceLevels: { body: 2, breath: 1 },
          domainStress: { energy: 'health' },
          tags: ['gross-layer', 'grounded'],
        },
      },
      {
        id: 'emotional',
        label: 'Emotional body',
        short: 'The layer you feel most',
        description:
          'Feeling is the layer with the most traffic: it is close to the surface, it is constantly available, and it colours everything above it. Living here gives a life its warmth and its relationships much of their meaning. It also means other people’s states are as legible as your own, which is a gift and an exposure in equal measure.',
        shadow: 'Carrying other people’s states as if they were your own.',
        color: 'rose',
        masters: ['emotional-healing', 'bhakti'],
        calibration: {
          dimensions: { emotion: 0.4, connection: 0.15 },
          practiceLevels: { 'emotional-healing': 1, bhakti: 1 },
          domainStress: { feeling: 'emotional-healing' },
          tags: ['emotional-layer', 'felt'],
        },
      },
      {
        id: 'mental',
        label: 'Mental body',
        short: 'The layer that does the work',
        description:
          'The mind’s own layer: the working of thought, the plans, the arguments, the clarity and the fog. It is the layer most modern life runs on, and it is excellent at everything it was built for. What it is not built for is rest, which is why a mind that lives in this layer can be busy and unoccupied at the same time.',
        shadow: 'Confusing a mind full of activity with a mind at work.',
        color: 'sky',
        masters: ['jnana', 'observation'],
        calibration: {
          dimensions: { thought: 0.4, spirit: 0.15 },
          practiceLevels: { jnana: 1, observation: 1 },
          tags: ['mental-layer', 'refined'],
        },
      },
      {
        id: 'spiritual',
        label: 'Spiritual body',
        short: 'The layer behind the other three',
        description:
          'The subtlest of the four, with no edges, no location, and no name — which is why it is the last to be recognised and the easiest to insist does not exist. It is not rarer than the others, only harder to point at. Working from here is not a better position than the others; it is a thinner one, and thinner is more easily disturbed.',
        shadow: 'Inferring from the absence of a name that the layer is not there.',
        color: 'indigo',
        masters: ['witnessing', 'kriya'],
        calibration: {
          dimensions: { spirit: 0.45, thought: 0.15 },
          practiceLevels: { witnessing: 2, kriya: 1 },
          tags: ['subtle-layer', 'subtlest'],
        },
      },
    ],
  },
];
