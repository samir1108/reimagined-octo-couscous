/**
 * MODULE 1 · WELCOME & GROUND (mirrors 4–10)
 *
 * The opening sequence. These mirrors establish the raw material of a life —
 * where you are in the arc, how the day actually moves, what you feed the
 * mind, how much silence you can take, what sets you off, and what is left
 * when the weather clears.
 *
 * Surface tier stays entirely situational. Core tier names the mechanism and
 * turns the lens back on the one asking.
 */

import { q3, q, likert5, pickOne, scale, type MirrorBank } from './types';

export const WELCOME_BANKS: MirrorBank[] = [
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'life-season',
    title: 'Life season',
    subtitle: 'Where you are in the arc',
    module: 'Welcome',
    tradition: 'vedic',
    dimensionCategory: 'stage',
    coverEmoji: '🍂',
    estimatedMinutes: 7,
    version: 1,
    intro:
      'Traditions describe life less as a straight road than as a set of seasons, each with its own weather and its own work.\n\nThis is not about predicting how long a season lasts. It is about noticing which one you are standing in, so the practices that fit this season stop feeling like the wrong shape.',
    dimensions: ['threshold', 'emergence', 'consolidation', 'dissolution'],
    engineHooks: {
      practiceAffinity: ['self-inquiry', 'witnessing'],
      deepensWith: ['ground-state', 'inner-compass'],
    },
    questions: [
      q3(
        'season-shape',
        'arc',
        'If your last few years were a season, which description fits best?',
        'Of the four arcs below, which one are you actually living through right now?',
        'Each life is given a beginning, a building, a testing, and a releasing. Which of the four is asking the most of you at this moment?',
        pickOne(
          [
            'Ending something and not yet knowing what comes next',
            'Something new is starting to take shape',
            'Something I built is being asked to hold up under its own weight',
            'I have less and less interest in what I used to chase',
          ],
          ['threshold', 'emergence', 'consolidation', 'dissolution'],
        ),
      ),
      q3(
        'season-effort',
        'arc',
        'How much of your energy goes into getting through the week, versus building something?',
        'Where is your effort actually going — maintenance, or construction?',
        'Energy spent preserving what exists is a different act from energy spent forming what does not yet exist. Which is yours?',
        scale(
          ['Almost all of it goes on keeping things running', 'Most of it goes on keeping things running', 'It splits fairly evenly', 'More goes into building than maintaining', 'Nearly all of it goes into something being built'],
          ['maintenance', 'maintenance', 'balance', 'building', 'building'],
        ),
      ),
      q3(
        'season-obstacle',
        'arc',
        'What slows you down most right now — outside circumstances, or something in you?',
        'When progress stalls, is the cause in the world or in the pattern?',
        'Two things can block a season. The conditions you did not choose, and the shape of your own attention. Which one is louder?',
        pickOne(
          ['The conditions I did not choose', 'The shape of my own attention', 'Both, about equally', 'Neither, honestly — it is moving'],
          ['circumstance', 'pattern', 'both', 'neither'],
        ),
      ),
      q3(
        'season-finished',
        'arc',
        'How much of what you set out to do have you actually finished?',
        'Set down a goal you once meant to reach. How much of it exists now?',
        'Look honestly at what you claimed you were going to do. What percentage of it has actually been done?',
        scale(
          ['I stopped looking at it', 'Very little', 'A third, maybe', 'Most of it', 'I am still carrying it'],
          ['abandoned', 'low', 'partial', 'high', 'complete'],
        ),
      ),
      q3(
        'season-urgency',
        'arc',
        'How urgent does it feel to sort your life out?',
        'How much pressure do you feel to change something soon?',
        'There is a difference between knowing a change is needed and being driven toward it. Where are you?',
        scale(
          ['No urgency at all', 'A little', 'A fair amount', 'A lot', 'It has been urgent for a long time'],
          ['low', 'low', 'medium', 'high', 'high'],
        ),
      ),
      q3(
        'season-belonging',
        'arc',
        'Do you feel like you are where you are supposed to be right now?',
        'If this were the life you were meant to be living, would this be it?',
        'Imagine the life entirely in agreement with who you are. How far from it are you standing?',
        scale(
          ['Very far from it', 'Fairly far', 'Not too far', 'Mostly I do', 'This is exactly it'],
          ['far', 'far', 'near', 'near', 'aligned'],
        ),
      ),
      q3(
        'season-first',
        'arc',
        'What would you say you are here to do?',
        'If you had to name your work in one line, what would it be?',
        'You have been given something particular. If you stripped away what other people expect, what would remain?',
        scale(
          ['I genuinely do not know', 'Something vague', 'Something I have said before', 'Something I can state clearly', 'Something I would die having done'],
          ['unknown', 'vague', 'articulate', 'clear', 'certain'],
        ),
      ),
      q3(
        'season-timed',
        'arc',
        'Does anything in your life have a deadline you are not meeting?',
        'Is there a clock running on any part of this?',
        'Some seasons are given a length. Do you feel a time limit on this one, or not?',
        pickOne(
          ['Yes, and it is close', 'Yes, but there is room', 'No real deadline', 'I am the one rushing it'],
          ['urgent', 'loose', 'open', 'selfimposed'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'threshold',
        label: 'Threshold',
        short: 'Between one life and the next',
        description:
          'Something has ended and the next thing has not arrived. The ground feels uncertain, and part of you is waiting to be told what comes next. This is a demanding season to practise in, because the old methods belonged to the life that just closed.',
        shadow: 'Waiting for permission to begin. Reading other people’s timing as your own.',
        color: 'slate',
        masters: ['self-inquiry', 'witnessing'],
        calibration: {
          dimensions: { thought: 0.25, spirit: 0.2, emotion: 0.15 },
          practiceLevels: { 'self-inquiry': 1, witnessing: 1 },
          domainStress: { direction: 'self-inquiry' },
          tags: ['unsettled', 'in-transition'],
        },
      },
      {
        id: 'emergence',
        label: 'Emergence',
        short: 'Something is starting to take shape',
        description:
          'There is energy available and something in you is reaching. This is the season where practice compounds fastest, because effort lands on ground that is already prepared.',
        shadow: 'Starting more than you finish.',
        color: 'emerald',
        masters: ['raja', 'karma'],
        calibration: {
          dimensions: { action: 0.3, body: 0.2, thought: 0.15 },
          practiceLevels: { raja: 1, karma: 1 },
          domainStress: { work: 'work-career' },
          tags: ['rising', 'building'],
        },
      },
      {
        id: 'consolidation',
        label: 'Consolidation',
        short: 'What you built is being tested',
        description:
          'There is something real in your life now, and it is asking to hold up under its own weight. Attention turns to maintenance, integrity, and the question of whether the structure matches the intention.',
        shadow: 'Confusing the structure with the thing itself.',
        color: 'amber',
        masters: ['karma', 'jnana'],
        calibration: {
          dimensions: { action: 0.35, connection: 0.2, emotion: 0.15 },
          practiceLevels: { karma: 1, jnana: 1 },
          domainStress: { work: 'work-career', relation: 'relationship' },
          tags: ['under-load', 'responsible'],
        },
      },
      {
        id: 'dissolution',
        label: 'Dissolution',
        short: 'Less pull from what you used to want',
        description:
          'The craving that used to organise your days has loosened. This is often mistaken for emptiness. It is more likely that something that ran your life has stopped running it, and you have not decided what to do with the free time.',
        shadow: 'Mistaking peace for meaninglessness.',
        color: 'indigo',
        masters: ['jnana', 'witnessing'],
        calibration: {
          dimensions: { spirit: 0.35, thought: 0.2, action: 0.1 },
          practiceLevels: { jnana: 1, witnessing: 1 },
          tags: ['disenchanted', 'opening'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'daily-rhythm',
    title: 'Daily rhythm',
    subtitle: 'How the day actually moves',
    module: 'Welcome',
    tradition: 'yogic',
    dimensionCategory: 'rhythm',
    coverEmoji: '🕰️',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Almost nobody lives the day they plan. The gap between the intended shape and the actual one is where most of a life is spent.\n\nThis looks at that gap — not to correct it, but to see it. A rhythm you can see is a rhythm you can work with.',
    dimensions: ['dissonance', 'absorption', 'flow', 'recovery'],
    engineHooks: {
      practiceAffinity: ['breath', 'observation'],
      deepensWith: ['energy-baseline', 'attention-diet'],
    },
    questions: [
      q3(
        'rhythm-expected',
        'shape',
        'How different is your actual day from the one you meant to have?',
        'Compare the day you plan with the day you get. How large is the gap?',
        'You carry a picture of the day you intend. You live a different one. How much of your attention goes to closing that gap?',
        scale(
          ['They are nearly the same', 'Close enough', 'The real day is always busier', 'They are almost unrelated', 'I stopped planning days entirely'],
          ['aligned', 'aligned', 'mild', 'diverged', 'unplanned'],
        ),
      ),
      q3(
        'rhythm-anchors',
        'shape',
        'How many fixed points does your day have — meals, times you get up, places you go?',
        'How many anchors hold your day in place?',
        'A day with anchors has a shape. A day without them has weather. How many of yours are real?',
        scale(
          ['None at all', 'One or two, loosely', 'A few, fairly reliable', 'Most of the day is anchored', 'Everything is anchored'],
          ['none', 'few', 'some', 'most', 'all'],
        ),
      ),
      q3(
        'rhythm-switches',
        'shape',
        'How often does something unexpected pull you off what you were doing?',
        'How many interruptions does a normal day hold?',
        'Interruptions are not events. They are a measure of how much of your attention lives outside your own hands. Count them honestly.',
        scale(
          ['Almost never', 'A few a week', 'Several a day', 'Constantly', 'I have stopped being able to focus at all'],
          ['rare', 'low', 'medium', 'high', 'extreme'],
        ),
      ),
      q3(
        'rhythm-best-hour',
        'shape',
        'What time of day are you most yourself?',
        'Which hours belong to you, and which are just happening to you?',
        'The day is not uniformly yours. Some hours run you, and you have not noticed which. Name the one that is most yours.',
        scale(
          ['Early morning', 'Late morning', 'Afternoon', 'Early evening', 'Late night'],
          ['dawn', 'morning', 'afternoon', 'evening', 'night'],
        ),
      ),
      q3(
        'rhythm-worst-hour',
        'shape',
        'Which part of the day do you most often dread or limp through?',
        'Which hours do you get through rather than live?',
        'There is usually a stretch of the day you move through on reserve. Where is it?',
        scale(
          ['Early morning', 'Late morning', 'Afternoon', 'Early evening', 'Late night'],
          ['dawn', 'morning', 'afternoon', 'evening', 'night'],
        ),
      ),
      q3(
        'rhythm-load',
        'shape',
        'Is there anything you carry that you have not agreed to carry?',
        'Is there a responsibility in your day that you never actually chose?',
        'Much of what people call duty was never consciously agreed to. It was absorbed. How much of your day is composed of things you did not choose?',
        scale(
          ['Almost everything', 'Most of it', 'A fair share', 'A little', 'Nearly none of it'],
          ['high', 'high', 'medium', 'low', 'minimal'],
        ),
      ),
      q3(
        'rhythm-rest',
        'shape',
        'How easily do you stop, when stopping is the right thing to do?',
        'Can you take a break you did not schedule?',
        'Rest that has to be earned is a task, not rest. How easily do you stop without justifying it first?',
        scale(
          ['I cannot stop at all', 'Only if I have to', 'With some effort', 'Quite easily', 'I stop whenever I need to'],
          ['none', 'low', 'medium', 'easy', 'natural'],
        ),
      ),
      q3(
        'rhythm-evening',
        'shape',
        'How do you usually end the day — engaged with something, or already gone?',
        'What does the last hour look like?',
        'The end of the day is where the record of the whole day settles. What is written there?',
        scale(
          ['I collapse before I finish', 'I scroll until I stop', 'I am still wired', 'I close it deliberately', 'I finish the day and I am actually there'],
          ['collapsed', 'numb', 'wired', 'closed', 'present'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'dissonance',
        label: 'High dissonance',
        short: 'The day runs you',
        description:
          'There is a large gap between the day you intend and the day you get. The intention is still there, which means something in you is still reaching for a life it has not made room for. This is exhausting because the gap is a constant, small, repeating loss.',
        shadow: 'Mistaking busyness for a schedule.',
        color: 'rose',
        masters: ['observation', 'breath'],
        calibration: {
          dimensions: { thought: 0.3, body: 0.2, spirit: 0.15 },
          practiceLevels: { observation: 1, breath: 1 },
          domainStress: { routine: 'observation' },
          tags: ['scattered', 'over-committed'],
        },
      },
      {
        id: 'absorption',
        label: 'Absorbed',
        short: 'Engaged but not choosing',
        description:
          'The days are full and you are in them, but a lot of what fills them was decided for you. You are rarely idle and rarely choosing. Activity has quietly replaced intention.',
        shadow: 'Confusing being busy with being present.',
        color: 'orange',
        masters: ['observation', 'karma'],
        calibration: {
          dimensions: { action: 0.25, emotion: 0.2, thought: 0.15 },
          practiceLevels: { observation: 1 },
          tags: ['occupied', 'reactive'],
        },
      },
      {
        id: 'flow',
        label: 'Flowing',
        short: 'The day has a shape you trust',
        description:
          'Your days hold a rhythm you mostly chose, and it mostly works. The anchor is real, the interruptions are survivable, and the hours have distinct textures you can read.',
        shadow: 'Rigidity disguised as virtue.',
        color: 'teal',
        masters: ['raja', 'karma'],
        calibration: {
          dimensions: { action: 0.2, body: 0.2, connection: 0.15 },
          practiceLevels: { raja: 1, karma: 1 },
          tags: ['structured', 'stable'],
        },
      },
      {
        id: 'recovery',
        label: 'Rhythmic with recovery',
        short: 'The day holds and lets you rest',
        description:
          'You have built a day that includes its own recovery. Stopping does not require justification, and the day has enough slack to absorb what arrives.',
        shadow: 'A structure that has stopped challenging you.',
        color: 'sky',
        masters: ['breath', 'raja'],
        calibration: {
          dimensions: { body: 0.3, spirit: 0.2, action: 0.15 },
          practiceLevels: { breath: 1, raja: 1 },
          tags: ['sustainable', 'grounded'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'energy-baseline',
    title: 'Energy baseline',
    subtitle: 'Morning self against night self',
    module: 'Welcome',
    tradition: 'yogic',
    dimensionCategory: 'vitality',
    coverEmoji: '🔋',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'A baseline is the floor you return to, not the peak you reach on a good day. The interesting question is not how good your best days are — it is what you drop back to when nothing is going well.\n\nThis looks at that floor, and at the gap between your morning self and your night self.',
    dimensions: ['depletion', 'oscillation', 'capacity', 'reserve'],
    engineHooks: {
      practiceAffinity: ['breath', 'body'],
      deepensWith: ['sleep-signature', 'vitality-index'],
    },
    questions: [
      q3(
        'energy-floor',
        'vitality',
        'When everything is going badly, how much do you have left?',
        'Take your worst ordinary week. What is left at the end of it?',
        'Everyone has a floor. Yours is the level you return to when nothing improves. How low does it go?',
        scale(
          ['Nothing left at all', 'Almost nothing', 'Enough to get by', 'Enough to be present', 'Even then I have room'],
          ['empty', 'empty', 'basic', 'adequate', 'resourced'],
        ),
      ),
      q3(
        'energy-morning',
        'vitality',
        'How do you feel in the first hour after waking?',
        'What is the first hour actually like?',
        'The first hour sets the tone for the whole system. How does yours begin?',
        scale(
          ['I wake up already tired', 'Heavy, slow to start', 'Functional', 'Clear and ready', 'I am most alive at this hour'],
          ['depleted', 'slow', 'neutral', 'good', 'peak'],
        ),
      ),
      q3(
        'energy-night',
        'vitality',
        'And how do you feel in the last hour before sleep?',
        'What is the last hour actually like?',
        'Compare that to your first hour. A large gap between them is a signal, not a failure.',
        scale(
          ['Completely spent', 'Running on empty', 'Wired but running out', 'Tired but settled', 'Still going, easily'],
          ['depleted', 'low', 'wired', 'settled', 'resourced'],
        ),
      ),
      q3(
        'energy-gap',
        'vitality',
        'How different are your morning and evening selves?',
        'How much do you change across the day?',
        'The distance between how you start and how you end is the measure of what the day costs you.',
        scale(
          ['We are two different people', 'Very different', 'Noticeably different', 'A little different', 'Much the same throughout'],
          ['severe', 'high', 'medium', 'low', 'steady'],
        ),
      ),
      q3(
        'energy-cause',
        'vitality',
        'When your energy drops, is it mostly your body, or mostly your mind?',
        'What takes your energy first — the body, or the attention?',
        'Energy does not leave by one route. Find out which one is actually open for you.',
        pickOne(
          ['Sleep — if it is bad, everything is bad', 'What I am doing all day', 'What I am carrying for other people', 'My own thinking, mostly', 'I could not say'],
          ['sleep', 'activity', 'relational', 'mental', 'unknown'],
        ),
      ),
      q3(
        'energy-consistent',
        'vitality',
        'How predictable is your energy from one day to the next?',
        'How steady is it, or does it swing?',
        'Steady and low is a different situation from spiky and high. Which is yours?',
        scale(
          ['Wildly unpredictable', 'Very changeable', 'Somewhat variable', 'Fairly steady', 'The same every day'],
          ['erratic', 'variable', 'medium', 'steady', 'constant'],
        ),
      ),
      q3(
        'energy-peak',
        'vitality',
        'Do you know what actually gives you energy, as opposed to what only excites you?',
        'What restores you, as opposed to what merely stimulates you?',
        'Stimulation and restoration are not the same thing. Many things excite us and leave us emptier. Which does which for you?',
        scale(
          ['I have no idea', 'A few things, loosely', 'A few things, reliably', 'I know most of them', 'I know exactly, and I rely on them'],
          ['unknown', 'vague', 'some', 'clear', 'certain'],
        ),
      ),
      q3(
        'energy-borrowed',
        'vitality',
        'Are you running on your own energy, or on someone else’s?',
        'How much of what sustains you is actually yours?',
        'Momentum, other people’s belief, and crisis all borrow energy from tomorrow. How much of yours is on loan?',
        scale(
          ['Nearly all of it is borrowed', 'A good deal', 'Some', 'Mostly my own', 'Entirely my own'],
          ['borrowed', 'borrowed', 'mixed', 'own', 'own'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'depletion',
        label: 'Depleted baseline',
        short: 'The floor is low',
        description:
          'Your reserve is smaller than your day requires. This is a body-first situation: the mind is asking for more than the system can currently produce, and pushing harder usually deepens the hole.',
        shadow: 'Reading depletion as a character flaw.',
        color: 'rose',
        masters: ['body', 'breath'],
        calibration: {
          dimensions: { body: 0.4, thought: 0.15, spirit: 0.1 },
          practiceLevels: { body: 1, breath: 1 },
          domainStress: { health: 'health' },
          tags: ['depleted', 'needs-rest'],
        },
      },
      {
        id: 'oscillation',
        label: 'Oscillating',
        short: 'High and low, without much middle',
        description:
          'The energy is there but it is unreliable — it spikes and collapses, often against the same triggers. Because the peaks feel genuinely good, the troughs tend to get explained away rather than examined.',
        shadow: 'Chasing the peaks and calling it consistency.',
        color: 'orange',
        masters: ['breath', 'observation'],
        calibration: {
          dimensions: { body: 0.25, emotion: 0.3, thought: 0.15 },
          practiceLevels: { breath: 1, observation: 1 },
          domainStress: { health: 'health' },
          tags: ['unstable', 'wired'],
        },
      },
      {
        id: 'capacity',
        label: 'Steady capacity',
        short: 'Reliable, if not abundant',
        description:
          'You have a workable amount and it comes fairly predictably. The ceiling is not high, but the floor is not low either, and you can mostly do what you have set out to do.',
        shadow: 'Mistaking consistency for a ceiling.',
        color: 'teal',
        masters: ['breath', 'raja'],
        calibration: {
          dimensions: { body: 0.2, action: 0.2, spirit: 0.15 },
          practiceLevels: { breath: 1, raja: 1 },
          tags: ['steady', 'adequate'],
        },
      },
      {
        id: 'reserve',
        label: 'Deep reserve',
        short: 'You have more than you are using',
        description:
          'There is genuine depth available to you, and some of it is going unused. The question at this stage is not how to build more, but what you are saving it for.',
        shadow: 'Reserve hoarded rather than spent.',
        color: 'emerald',
        masters: ['raja', 'karma'],
        calibration: {
          dimensions: { body: 0.25, action: 0.25, spirit: 0.2 },
          practiceLevels: { raja: 1, karma: 1 },
          tags: ['resourced', 'under-used'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'attention-diet',
    title: 'Attention diet',
    subtitle: 'What you consume becomes what you are',
    module: 'Welcome',
    tradition: 'yogic',
    dimensionCategory: 'attention',
    coverEmoji: '📡',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Traditions use the word diet deliberately. Attention behaves like food: it is consumed, it has a residue, and what you take in repeatedly becomes the texture of the mind.\n\nThis is not about guilt. It is about looking at what you actually take in, because most of it was never chosen.',
    dimensions: ['scattered', 'stimulant', 'absorbed', 'sustained'],
    engineHooks: {
      practiceAffinity: ['observation', 'witnessing'],
      deepensWith: ['silence-tolerance', 'mind-wandering'],
    },
    questions: [
      q3(
        'diet-input',
        'input',
        'What takes the largest share of your attention on a normal day?',
        'Which input actually wins the most hours?',
        'Of everything that reaches you, what genuinely receives the majority of your attention?',
        pickOne(
          ['My phone and messages', 'Work and tasks', 'Other people’s problems', 'News and what is happening', 'My own thinking'],
          ['screen', 'work', 'relational', 'news', 'mental'],
        ),
      ),
      q3(
        'diet-chosen',
        'input',
        'How much of what you take in did you actually choose?',
        'Of today’s inputs, how many were yours to pick?',
        'A great deal of what reaches you was never offered for approval. How much of your diet is deliberate?',
        scale(
          ['Almost none of it', 'Very little', 'A bit', 'A fair amount', 'Nearly all of it'],
          ['reactive', 'reactive', 'mixed', 'chosen', 'chosen'],
        ),
      ),
      q3(
        'diet-residue',
        'input',
        'After a few hours of input, do you feel more alive or more flat?',
        'Does what you take in leave you sharper, or duller?',
        'Stimulus and nourishment are not the same. After your usual day, what is the residue?',
        scale(
          ['Completely flat', 'Flatter than I would like', 'About the same', 'Brighter', 'Genuinely energised'],
          ['depleted', 'depleted', 'neutral', 'restored', 'restored'],
        ),
      ),
      q3(
        'diet-length',
        'input',
        'How long is your attention before it needs a new input?',
        'How long can you stay with one thing?',
        'The length of your attention is set by what you have been feeding it. Where has yours got to?',
        scale(
          ['Under a minute', 'A few minutes', 'Twenty minutes or so', 'An hour', 'I can sit with something a long time'],
          ['fragmented', 'short', 'medium', 'long', 'sustained'],
        ),
      ),
      q3(
        'diet-nostalgia',
        'input',
        'How much of what you consume is about feeling a feeling rather than learning a thing?',
        'How much of your intake is comfort rather than substance?',
        'Much consumption is aimed at a mood rather than at knowledge. How much of yours is?',
        scale(
          ['Almost all of it', 'Most of it', 'A fair amount', 'Some', 'Very little'],
          ['comfort', 'comfort', 'mixed', 'substance', 'substance'],
        ),
      ),
      q3(
        'diet-silence',
        'input',
        'How much of your day is spent with no input at all?',
        'When does your mind actually get silence?',
        'There are traditions built entirely around removing input. How much removal does your day currently contain?',
        scale(
          ['None at all', 'Very little', 'A few minutes', 'Maybe an hour', 'Real periods of it'],
          ['none', 'little', 'minimal', 'some', 'regular'],
        ),
      ),
      q3(
        'diet-taste',
        'input',
        'If your attention were a diet, would you call it nourishing or mostly filling?',
        'Does what you take in feed you, or just occupy you?',
        'Filling is not the same as nourishing, and much of what fills us is chosen precisely because it asks nothing.',
        scale(
          ['Mostly filling', 'Mostly filling, with some nourishment', 'About half and half', 'Mostly nourishing', 'Genuinely nourishing'],
          ['filling', 'filling', 'mixed', 'nourishing', 'nourishing'],
        ),
      ),
      q3(
        'diet-keep',
        'input',
        'If you could only keep one kind of input, which would it be?',
        'Which single input is actually doing work for you?',
        'Strip the diet down to one thing. Which of your inputs would still be worth having?',
        scale(
          [
            'Whatever is loudest at the time',
            'Something to fill a gap with',
            'Something I actually take something from',
            'Something I would genuinely miss',
            'The only one I would keep',
          ],
          ['scattered', 'stimulant', 'absorbed', 'sustained'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'scattered',
        label: 'Scattered',
        short: 'Attention is being taken more than given',
        description:
          'Your attention is responsive rather than directed — the environment decides where it goes. This is a trainable condition, not a fixed trait, and it responds quickly to structured input changes.',
        shadow: 'Believing you have no attention to spare.',
        color: 'rose',
        masters: ['observation', 'witnessing'],
        calibration: {
          dimensions: { thought: 0.4, spirit: 0.2, body: 0.1 },
          practiceLevels: { observation: 2, witnessing: 1 },
          domainStress: { attention: 'observation' },
          tags: ['scattered', 'stimulus-driven'],
        },
      },
      {
        id: 'stimulant',
        label: 'Stimulant-fed',
        short: 'Reaching for a jolt more often than rest',
        description:
          'Input is being used to manage how you feel rather than to feed your curiosity. It works, and it costs more than it appears to.',
        shadow: 'Calling the jolt focus.',
        color: 'orange',
        masters: ['breath', 'witnessing'],
        calibration: {
          dimensions: { emotion: 0.3, thought: 0.25, body: 0.15 },
          practiceLevels: { breath: 1, witnessing: 1 },
          domainStress: { attention: 'observation' },
          tags: ['stimulant', 'numb'],
        },
      },
      {
        id: 'absorbed',
        label: 'Absorbed',
        short: 'Taking in a lot, retaining a little',
        description:
          'The volume of input is high and the residue is thin. You finish much of what you start and keep very little of it, which is a retention problem more than a volume problem.',
        shadow: 'Confusing consumption with study.',
        color: 'amber',
        masters: ['observation', 'jnana'],
        calibration: {
          dimensions: { thought: 0.3, spirit: 0.15 },
          practiceLevels: { observation: 1, jnana: 1 },
          tags: ['consumer', 'low-retention'],
        },
      },
      {
        id: 'sustained',
        label: 'Sustained',
        short: 'You feed attention and it feeds you back',
        description:
          'You have a real diet and you choose it. Input is doing work for you rather than against you, and you know the difference between the two.',
        shadow: 'Rigidity, when the diet stops being examined.',
        color: 'emerald',
        masters: ['witnessing', 'jnana'],
        calibration: {
          dimensions: { thought: 0.2, spirit: 0.3, emotion: 0.15 },
          practiceLevels: { witnessing: 2, jnana: 1 },
          tags: ['disciplined', 'focused'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'silence-tolerance',
    title: 'Silence tolerance',
    subtitle: 'How long you can sit alone with yourself',
    module: 'Welcome',
    tradition: 'vedic',
    dimensionCategory: 'witness',
    coverEmoji: '🤫',
    estimatedMinutes: 5,
    version: 1,
    intro:
      'Silence is not the absence of input. It is the absence of a reason to be somewhere else.\n\nMost people believe they cannot tolerate silence. What is usually true is that the mind cannot tolerate being unattended. This measures how long it can be left alone.',
    dimensions: ['restless', 'tolerant', 'settled', 'profound'],
    engineHooks: {
      practiceAffinity: ['witnessing', 'breath'],
      deepensWith: ['inner-silence', 'meditation-depth'],
    },
    questions: [
      q3(
        'silence-unattended',
        'tolerance',
        'When you are alone with nothing to do, how soon do you reach for something?',
        'Left with nothing to occupy you, how long before you fill it?',
        'Your mind objects most strongly to being left with nothing to do. How quickly does it insist?',
        scale(
          ['Almost immediately', 'Within a minute or two', 'After five minutes or so', 'I can sit a while', 'I can sit with it indefinitely'],
          ['restless', 'restless', 'tolerant', 'settled', 'profound'],
        ),
      ),
      q3(
        'silence-pain',
        'tolerance',
        'Is stillness uncomfortable for you, or just uninteresting?',
        'Does quiet hurt, or does it bore you?',
        'These are very different. Pain means something is being encountered. Boredom means nothing is. Which is it?',
        pickOne(
          ['It is genuinely uncomfortable', 'It makes me restless', 'It is just boring', 'It is restful', 'I want more of it'],
          ['pain', 'restless', 'bored', 'restful', 'restful'],
        ),
      ),
      q3(
        'silence-thoughts',
        'tolerance',
        'What happens in your mind when there is nothing else to think about?',
        'Left alone, what does the mind actually do?',
        'When the mind stops being given material, it returns to its own material. What does it return to?',
        scale(
          ['It gets loud and unpleasant', 'It runs through problems', 'It reviews my life', 'It goes fairly quiet', 'It opens up'],
          ['loud', 'problematic', 'reverie', 'quiet', 'open'],
        ),
      ),
      q3(
        'silence-alone',
        'tolerance',
        'How comfortable are you alone with no one to talk to?',
        'How do you feel in a room by yourself, deliberately?',
        'Solitude chosen on purpose is a practice. How do you feel when you choose it?',
        scale(
          ['I avoid it entirely', 'I find it difficult', 'I can manage', 'I enjoy it', 'It is one of my favourite states'],
          ['avoidant', 'difficult', 'manageable', 'enjoyed', 'preferred'],
        ),
      ),
      q3(
        'silence-noticing',
        'tolerance',
        'When you sit still, what do you notice first?',
        'Go still for a moment. What arrives?',
        'Stillness is a mirror. When the noise stops, what reflects back?',
        scale(
          ['My thoughts', 'My body', 'My breathing', 'The room around me', 'Something I cannot put into words'],
          ['thought', 'body', 'breath', 'environment', 'presence'],
        ),
      ),
      q3(
        'silence-practice',
        'tolerance',
        'How much time do you deliberately spend being still?',
        'How much of your week is spent on purpose in quiet?',
        'Deliberate stillness is different from incidental stillness. How much is on purpose?',
        scale(
          ['None', 'Occasionally', 'A few times a month', 'Most days', 'It structures my day'],
          ['none', 'rare', 'some', 'regular', 'daily'],
        ),
      ),
      q3(
        'silence-others',
        'tolerance',
        'How do you feel when someone else needs silence from you?',
        'How do you handle another person’s need for quiet?',
        'Tolerance of silence is partly a tolerance of other people being unfinished. How does that land?',
        scale(
          ['I find it hard', 'I fill it quickly', 'I manage', 'I am comfortable', 'I protect it for them'],
          ['difficult', 'fidgety', 'manageable', 'comfortable', 'protective'],
        ),
      ),
      q3(
        'silence-want',
        'tolerance',
        'If you could have unlimited silence, would you take it?',
        'Given silence whenever you wanted it, what would you do?',
        'Most people discover they do not want what they say they want. What do you actually want?',
        scale(
          ['I would not — it is not for me', 'I would, occasionally', 'I would, regularly', 'I would, most of the time', 'I am already asking for it'],
          ['low', 'low', 'high', 'high', 'already'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'restless',
        label: 'Restless',
        short: 'Unattended, the mind objects',
        description:
          'Silence gets interpreted as something to be escaped. The discomfort is real and it is also the single most useful thing about your practice right now — it shows exactly where the escape reflex lives.',
        shadow: 'Believing you have no inner life to find.',
        color: 'rose',
        masters: ['witnessing', 'breath'],
        calibration: {
          dimensions: { spirit: 0.3, thought: 0.2, emotion: 0.15 },
          practiceLevels: { witnessing: 1, breath: 1 },
          tags: ['restless', 'avoidant'],
        },
      },
      {
        id: 'tolerant',
        label: 'Tolerant',
        short: 'You can sit, with effort',
        description:
          'You can stay with stillness for a while, and the mind makes noise during it. The capacity exists; it is just not yet automatic, and it is being spent on resisting the noise rather than on the silence itself.',
        shadow: 'Mistaking endurance for peace.',
        color: 'amber',
        masters: ['witnessing', 'breath'],
        calibration: {
          dimensions: { spirit: 0.25, thought: 0.2, body: 0.1 },
          practiceLevels: { witnessing: 1, breath: 1 },
          tags: ['tolerating', 'noisy'],
        },
      },
      {
        id: 'settled',
        label: 'Settled',
        short: 'Silence is somewhere you can live',
        description:
          'Stillness is not threatening to you, and you can return to it deliberately. The mind still speaks, but there is a floor beneath it that stays quiet.',
        shadow: 'Comfortable enough to stop looking.',
        color: 'teal',
        masters: ['witnessing', 'raja'],
        calibration: {
          dimensions: { spirit: 0.3, body: 0.15, emotion: 0.15 },
          practiceLevels: { witnessing: 2 },
          tags: ['settled', 'grounded'],
        },
      },
      {
        id: 'profound',
        label: 'Profound',
        short: 'You go there deliberately',
        description:
          'Silence is a place you go on purpose, and you know what is on the other side of the noise. This is a capacity worth being careful with — it can become its own escape when it starts to be preferred to the difficult conversations.',
        shadow: 'Silence used to avoid rather than to see.',
        color: 'indigo',
        masters: ['witnessing', 'jnana'],
        calibration: {
          dimensions: { spirit: 0.45, thought: 0.2 },
          practiceLevels: { witnessing: 2, jnana: 1 },
          domainStress: { contact: 'relationship' },
          tags: ['deep', 'at-home-in-quiet'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'trigger-map',
    title: 'Trigger map',
    subtitle: 'What sets you off, and why',
    module: 'Welcome',
    tradition: 'vedic',
    dimensionCategory: 'shadow',
    coverEmoji: '⚡',
    estimatedMinutes: 7,
    version: 1,
    intro:
      'A trigger is not the event. The event is weather. The trigger is the specific place where you have already decided what will happen — and then it happens.\n\nThis maps the set points. It does not ask you to forgive anything or change anyone.',
    dimensions: ['threat', 'shame', 'rejection', 'control', 'injustice'],
    engineHooks: {
      loopsToCheck: ['reactivity', 'conflict-avoidance', 'approval-seeking'],
      practiceAffinity: ['loop-dissolution', 'witnessing'],
      deepensWith: ['reactivity-score', 'shadow-inventory'],
    },
    questions: [
      q3(
        'trigger-fastest',
        'pattern',
        'What can set you off fastest?',
        'Which of these pulls the fastest reaction out of you?',
        'Everyone has a short path from feeling to reaction. Which of these is yours?',
        pickOne(
          ['Feeling physically unsafe or outnumbered', 'Being seen as foolish or wrong in front of others', 'Being left out, ignored, or not chosen', 'Things not going the way I decided', 'Being treated unfairly, or as less than I am'],
          ['threat', 'shame', 'rejection', 'control', 'injustice'],
        ),
      ),
      q3(
        'trigger-body',
        'pattern',
        'Where in your body do you feel it before you act?',
        'What happens in the body in the second before you react?',
        'The body signals before the mind decides. Where does yours signal, and how?',
        scale(
          ['All over, with no clear location', 'Chest and throat', 'Stomach and gut', 'Face and jaw', 'Hands and arms'],
          ['diffuse', 'throat', 'gut', 'jaw', 'limbs'],
        ),
      ),
      q3(
        'trigger-delay',
        'pattern',
        'How much time passes between feeling it and reacting?',
        'Is there a gap between the feeling and the act?',
        'A gap is the whole of the practice. However small it is, it is the only place change can happen.',
        scale(
          ['None at all — I react instantly', 'Under a second', 'A few seconds', 'A minute or so', 'I can hold it for a long time'],
          ['none', 'minimal', 'small', 'moderate', 'substantial'],
        ),
      ),
      q3(
        'trigger-same',
        'pattern',
        'Is the same thing able to set you off repeatedly?',
        'Does one situation in particular keep finding you?',
        'Repetition is not bad luck. Something about that situation is built to fit a groove already in you. Which one?',
        scale(
          ['The same thing, over and over', 'Similar things, different details', 'Different things, same feeling', 'It is genuinely random', 'Nothing sets me off much'],
          ['fixed', 'pattern', 'theme', 'random', 'steady'],
        ),
      ),
      q3(
        'trigger-size',
        'pattern',
        'How much does it matter to you what people think?',
        'How much of your reaction depends on the audience?',
        'A trigger that only fires in front of others is a different trigger from one that fires alone. Which is this?',
        scale(
          ['Not at all', 'A little', 'Quite a lot', 'A great deal', 'It governs most of my choices'],
          ['low', 'low', 'high', 'high', 'central'],
        ),
      ),
      q3(
        'trigger-after',
        'pattern',
        'How do you feel an hour after one of these?',
        'What is left once the wave has passed?',
        'The reaction is brief. The cost is not. Look at the aftermath rather than the moment.',
        scale(
          ['Shaken for the rest of the day', 'Still irritated', 'About the same as before', 'Slightly better — it cleared something', 'Glad it happened'],
          ['shaken', 'residual', 'neutral', 'relieved', 'relieved'],
        ),
      ),
      q3(
        'trigger-covered',
        'pattern',
        'Do you react more strongly to things you expected?',
        'Does a broken expectation hit harder than the thing itself?',
        'A reaction to what should have happened is a reaction to the story. How much of yours is that?',
        scale(
          ['Almost always', 'Often', 'About half the time', 'Rarely', 'No, I react to what is actually there'],
          ['frequently', 'often', 'mixed', 'rarely', 'present'],
        ),
      ),
      q3(
        'trigger-cost',
        'pattern',
        'How much has this cost you — relationships, chances, or peace?',
        'What has this pattern actually taken from you?',
        'Every trigger has a bill attached, paid quietly. What has yours taken?',
        scale(
          ['Not really anything', 'Small things, repeatedly', 'A few important things', 'Something I still live with', 'More than I can list'],
          ['low', 'moderate', 'high', 'significant', 'severe'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'threat',
        label: 'Threat-reactive',
        short: 'Safety comes first',
        description:
          'Your reactions are organised around safety. This is the oldest system in the body and the hardest to argue with — which is why reasoning rarely moves it. Regulation does.',
        shadow: 'Reading hypervigilance as paranoia.',
        color: 'rose',
        masters: ['body', 'breath'],
        calibration: {
          dimensions: { body: 0.35, emotion: 0.25, spirit: 0.1 },
          practiceLevels: { body: 1, breath: 1 },
          domainStress: { safety: 'health' },
          tags: ['hypervigilant', 'threat-scan'],
        },
      },
      {
        id: 'shame',
        label: 'Shame-reactive',
        short: 'Exposure is the sharp edge',
        description:
          'Being seen as foolish is the thing your system cannot absorb. Much of your social energy goes toward not being seen in that way, which is expensive and largely invisible to you.',
        shadow: 'Believing the shame is about the specific mistake.',
        color: 'orange',
        masters: ['emotional-healing', 'witnessing'],
        calibration: {
          dimensions: { emotion: 0.4, connection: 0.2, thought: 0.15 },
          practiceLevels: { witnessing: 1, bhakti: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['shame-driven', 'image-protective'],
        },
      },
      {
        id: 'rejection',
        label: 'Abandonment-reactive',
        short: 'Not being chosen is the wound',
        description:
          'Your reactions are organised around the possibility of being left out or set down. This produces a lot of energy spent on reading the room for signs.',
        shadow: 'Confusing attention with safety.',
        color: 'violet',
        masters: ['relationship', 'bhakti'],
        calibration: {
          dimensions: { connection: 0.4, emotion: 0.3, spirit: 0.1 },
          practiceLevels: { bhakti: 1, witnessing: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['abandonment-fear', 'reaching'],
        },
      },
      {
        id: 'control',
        label: 'Control-reactive',
        short: 'When it does not go your way',
        description:
          'The trigger is the loss of authorship — things happening without your agreement. This is common in capable people, because competence has trained them to expect that outcomes are governable.',
        shadow: 'Mistaking control for safety.',
        color: 'amber',
        masters: ['raja', 'karma'],
        calibration: {
          dimensions: { action: 0.35, thought: 0.25, emotion: 0.2 },
          practiceLevels: { raja: 1, karma: 1 },
          domainStress: { control: 'work-career' },
          tags: ['control-seeking', 'rigid'],
        },
      },
      {
        id: 'injustice',
        label: 'Injustice-reactive',
        short: 'Being misjudged moves you most',
        description:
          'Your reactions are organised around fairness being violated. This is a principled response, and it is also the one most easily provoked by anything ambiguous.',
        shadow: 'Noticing the injustice but not your part in it.',
        color: 'sky',
        masters: ['jnana', 'karma'],
        calibration: {
          dimensions: { action: 0.3, connection: 0.25, thought: 0.2 },
          practiceLevels: { jnana: 1, karma: 1 },
          tags: ['principled', 'comparative'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'ground-state',
    title: 'Ground state',
    subtitle: 'Your default mood underneath the weather',
    module: 'Welcome',
    tradition: 'yogic',
    dimensionCategory: 'emotion',
    coverEmoji: '🌤️',
    estimatedMinutes: 5,
    version: 1,
    intro:
      'Every day has weather, and every person has a climate. The climate is what is there when nothing is happening — the mood that shows up before the day adds anything to it.\n\nThis looks at the climate, not the weather.',
    dimensions: ['anxious', 'neutral', 'settled', 'content'],
    engineHooks: {
      practiceAffinity: ['body', 'breath'],
      deepensWith: ['emotional-range', 'ground-state'],
    },
    questions: [
      q3(
        'ground-default',
        'climate',
        'If nothing in particular happened today, how would you feel?',
        'Take away the events. What mood is left?',
        'Strip the day of what happened in it. There is a mood you would still be in. What is it?',
        scale(
          ['Worried or on edge', 'A little tense', 'Pretty neutral', 'Calm', 'Genuinely glad to be here'],
          ['anxious', 'anxious', 'neutral', 'settled', 'content'],
        ),
      ),
      q3(
        'ground-wake',
        'climate',
        'How do you feel in the moment before you get out of bed?',
        'That first moment of the day, before anything has happened to you.',
        'Before the day has touched you at all, you are already someone. Who?',
        scale(
          ['Dread', 'Resignation', 'Neutral', 'Anticipation', 'Genuine willingness'],
          ['dread', 'low', 'neutral', 'eager', 'eager'],
        ),
      ),
      q3(
        'ground-when',
        'climate',
        'How often do you actually reach a settled state during a day?',
        'How many times a day do you actually settle?',
        'Most days are a series of reactions. How often does one of them end somewhere calm?',
        scale(
          ['Rarely or never', 'Occasionally', 'A few times', 'Most of the day', 'Almost continuously'],
          ['rare', 'low', 'medium', 'often', 'constant'],
        ),
      ),
      q3(
        'ground-unsettled',
        'climate',
        'When you are not settled, what is usually running?',
        'When the calm goes, what takes over?',
        'The thing that replaces calm is worth knowing. It is usually something that arrived long before you noticed it had.',
        pickOne(
          ['A stream of thoughts', 'Physical tension', 'A low hum of worry', 'Irritability I snap at people over', 'Something I genuinely cannot name'],
          ['thought', 'body', 'worry', 'irritability', 'unnamed'],
        ),
      ),
      q3(
        'ground-ease',
        'climate',
        'How easy is your body to be in, day to day?',
        'How at home is your body in an ordinary day?',
        'There is a baseline level of ease in the body. Where does yours sit?',
        scale(
          ['Rarely comfortable', 'Usually tense', 'About average', 'Mostly at ease', 'Genuinely comfortable most of the time'],
          ['tense', 'tense', 'average', 'ease', 'ease'],
        ),
      ),
      q3(
        'ground-appreciate',
        'climate',
        'How often do you notice something good that is already happening?',
        'How often do you catch something good while it is happening?',
        'A good climate is partly made of noticing. How much of the ordinary day do you actually receive?',
        scale(
          ['Almost never', 'Rarely', 'Sometimes', 'Fairly often', 'Most days, without trying'],
          ['rare', 'low', 'medium', 'often', 'constant'],
        ),
      ),
      q3(
        'ground-depends',
        'climate',
        'How much does how you feel depend on how the last conversation went?',
        'How much does the last exchange still have hold on you?',
        'Some people are genuinely unaffected by the last hour. Some are still holding it. Which describes the way your mood actually works?',
        scale(
          ['Entirely', 'Very much', 'Quite a lot', 'A little', 'Barely at all'],
          ['high', 'high', 'medium', 'low', 'minimal'],
        ),
      ),
      q3(
        'ground-rainy',
        'climate',
        'Imagine a bad day. What is underneath it?',
        'When the worst day arrives, what climate do you drop into?',
        'The bad day is the weather. Underneath it, there is still whatever your climate normally is. What is that?',
        scale(
          ['Despair or panic', 'Heavy discouragement', 'Irritability', 'Quiet disappointment', 'Sadness, but steady underneath'],
          ['panic', 'discouraged', 'irritable', 'disappointed', 'steady'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'anxious',
        label: 'Anxious climate',
        short: 'The baseline is alert',
        description:
          'Your default state has a background charge to it. Because it is constant, it tends to be read as normal, and the absence of anxiety gets mistaken for an achievement rather than a return to baseline.',
        shadow: 'Thinking the current state is fine because it is familiar.',
        color: 'rose',
        masters: ['breath', 'body'],
        calibration: {
          dimensions: { emotion: 0.4, body: 0.3, thought: 0.15 },
          practiceLevels: { breath: 2, body: 1 },
          domainStress: { state: 'emotional-healing' },
          tags: ['anxious', 'high-baseline-alertness'],
        },
      },
      {
        id: 'neutral',
        label: 'Neutral climate',
        short: 'Flat is your normal',
        description:
          'Your baseline is genuinely even, which is a real strength — and it can also mean that feeling is being under-registered. Neutral and numb are easy to confuse from the inside.',
        shadow: 'Calling numbness stability.',
        color: 'slate',
        masters: ['observation', 'witnessing'],
        calibration: {
          dimensions: { emotion: 0.25, thought: 0.2, spirit: 0.15 },
          practiceLevels: { observation: 1, witnessing: 1 },
          tags: ['even', 'under-felt'],
        },
      },
      {
        id: 'settled',
        label: 'Settled climate',
        short: 'Calm is your default',
        description:
          'There is a real floor of steadiness under your days. You can return to it, which means your practice has something solid to build on rather than something to rescue.',
        shadow: 'Settling into the comfortable and staying there.',
        color: 'teal',
        masters: ['breath', 'witnessing'],
        calibration: {
          dimensions: { emotion: 0.25, body: 0.2, spirit: 0.25 },
          practiceLevels: { breath: 1, witnessing: 1 },
          tags: ['settled', 'steady'],
        },
      },
      {
        id: 'content',
        label: 'Content climate',
        short: 'You are mostly here',
        description:
          'Your ordinary state has genuine ease in it. This is worth noticing precisely because it is easy to lose without noticing, and easy to mistake for something you got rather than something you have.',
        shadow: 'Contentment that stops asking questions.',
        color: 'emerald',
        masters: ['witnessing', 'raja'],
        calibration: {
          dimensions: { spirit: 0.35, emotion: 0.25, body: 0.15 },
          practiceLevels: { witnessing: 1, raja: 1 },
          tags: ['content', 'ease'],
        },
      },
    ],
  },
];
