/**
 * MODULE 3 · OBSERVATION (mirrors 21–30)
 *
 * The mirrors look the same way twice. Each one asks a question about the
 * ordinary contents of a mind — a thought, a drift, an inner voice, a
 * sensation, a gap — and then asks what it is that is doing the noticing.
 *
 * This is the difference between a mind that is watched and a mind that is
 * only ever inside itself. The readings are not better or worse; they are
 * positions, and the position decides what the next mirror can see.
 *
 * Surface tier stays entirely situational. Core tier names the mechanism and
 * turns the lens back on the one asking.
 */

import { q3, pickOne, o, type MirrorBank } from './types';

export const OBSERVATION_BANKS: MirrorBank[] = [
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'meta-cognition',
    title: 'Meta-cognition',
    subtitle: 'Your ability to think about thinking',
    module: 'Observation',
    tradition: 'vedic',
    dimensionCategory: 'thought',
    coverEmoji: '🪞',
    estimatedMinutes: 7,
    version: 1,
    intro:
      'Most thinking happens without anyone present for it. The thought arrives, runs, and finishes, and the whole event goes unrecorded.\n\nMeta-cognition is the second attention — the one that notices the first. It is not intelligence and it is not insight; it is simply the capacity to see a thought as a thought rather than as what is happening. What this measures is how often that second attention is switched on.',
    dimensions: ['unreflective', 'occasional', 'active', 'constant'],
    engineHooks: {
      practiceAffinity: ['self-inquiry', 'witnessing'],
    },
    questions: [
      q3(
        'meta-thinking',
        'noticing',
        'Do you ever notice that you are thinking, rather than just thinking?',
        'How often does thinking register as an event rather than as the whole of the moment?',
        'A thought can be an event or the whole world, depending on whether anything is there to see it. Which is it here?',
        pickOne(
          [
            'Hardly ever — thinking is just what is happening',
            'Occasionally, and I usually miss it at first',
            'Often enough to catch myself in the act',
            'It is almost continuous background awareness',
          ],
          ['unreflective', 'occasional', 'active', 'constant'],
        ),
      ),
      q3(
        'meta-catch',
        'timing',
        'When you notice you have drifted off, how far in have you already gone?',
        'How much of a thought has run before you notice it?',
        'The distance between the beginning of a thought and its noticing is the whole measure. How far apart are those two points?',
        [
          o('I find out hours later', { unreflective: 1 }),
          o('I find out well into it', { unreflective: 0.75, occasional: 0.25 }),
          o('I catch it fairly early on', { occasional: 1 }),
          o('I catch it as it starts', { occasional: 0.25, active: 0.75 }),
          o('I am there before it begins', { active: 0.5, constant: 0.5 }),
        ],
      ),
      q3(
        'meta-mood',
        'affect',
        'Do you know you are in a particular mood before it starts running?',
        'Is the mood visible before it takes over the hour?',
        'A mood is a fact about you before it becomes a set of thoughts. Which of the two is usually first here?',
        pickOne(
          [
            'I only know once it has passed',
            'Partway through, when it is already well advanced',
            'Usually just as it begins',
            'Almost immediately, before anything happens',
          ],
          ['unreflective', 'occasional', 'active', 'constant'],
        ),
      ),
      q3(
        'meta-belief',
        'revision',
        'Has your mind ever changed about something it was certain of?',
        'How easily does a settled belief actually move?',
        'Certainty is a feeling, not a finding. What happens when a belief of yours is examined directly?',
        pickOne(
          [
            'I have changed my mind over small things only',
            'Rarely, and it felt destabilising rather than clarifying',
            'Yes, on things that mattered to me',
            'I revise beliefs as a matter of course',
          ],
          ['unreflective', 'occasional', 'active', 'constant'],
        ),
      ),
      q3(
        'meta-attention',
        'tracking',
        'How well do you know where your attention is right now?',
        'Could you say where your attention actually is at this moment?',
        'Attention is the only instrument in the mind that can be lost without noticing. How closely is it being tracked?',
        pickOne(
          [
            'I have no idea where it is',
            'Roughly — I know the general area',
            'Fairly precisely, most of the time',
            'I know exactly where it is, second to second',
          ],
          ['unreflective', 'occasional', 'active', 'constant'],
        ),
      ),
      q3(
        'meta-describe',
        'accuracy',
        'If you had to explain how your own mind works, how accurate could you be?',
        'How close is your account of your own thinking to what is actually happening?',
        'You are the only source available on this subject, and you are also the least reliable witness in the room. How good is your account?',
        [
          o('Not at all — I would be guessing', { unreflective: 1 }),
          o('Broadly right, but I would generalise', { unreflective: 0.75, occasional: 0.25 }),
          o('Reasonably accurate', { occasional: 1 }),
          o('Accurate in detail', { occasional: 0.25, active: 0.75 }),
          o('I could describe it closely and get it right', { active: 0.5, constant: 0.5 }),
        ],
      ),
      q3(
        'meta-observer',
        'position',
        'When you notice a thought, is there a sense of someone doing the noticing?',
        'Is there a you on the other side of the noticing?',
        'The one who is asking this question is not the thought. What is the relationship between the two?',
        pickOne(
          [
            'No — the noticing is just another thought',
            'Sometimes, and it is hard to hold on to',
            'Usually, there is someone noticing',
            'Clearly and continuously, whoever is doing it',
          ],
          ['unreflective', 'occasional', 'active', 'constant'],
        ),
      ),
      q3(
        'meta-interrupt',
        'frequency',
        'How often do you notice that you have been somewhere else for the past while?',
        'How much time passes between arriving and noticing you had left?',
        'The gap between the moment attention leaves and the moment that is noticed is the raw material of every practice. How big is it?',
        [
          o('It can be hours', { unreflective: 1 }),
          o('It can be a good while', { unreflective: 0.75, occasional: 0.25 }),
          o('Usually within a few minutes', { occasional: 1 }),
          o('Within a minute or so', { occasional: 0.25, active: 0.75 }),
          o('Before I have gone anywhere', { active: 0.5, constant: 0.5 }),
        ],
      ),
    ],
    resultTypes: [
      {
        id: 'unreflective',
        label: 'Unreflective',
        short: 'The thinking runs, and nothing sees it',
        description:
          'Thoughts arrive, run and finish without an audience. This is not an absence of intelligence — it is simply that the second attention is off when the first one is working, which means there is currently no vantage point from which to watch the pattern.',
        shadow: 'Believing the thoughts are all there is to you.',
        color: 'slate',
        masters: ['observation', 'breath'],
        calibration: {
          dimensions: { thought: 0.4, spirit: 0.15 },
          practiceLevels: { observation: 1, breath: 1 },
          tags: ['unwatched', 'automatic'],
        },
      },
      {
        id: 'occasional',
        label: 'Occasional',
        short: 'The noticing comes and goes',
        description:
          'The second attention switches on at intervals, usually in the middle of something that has already gone wrong. What you notice is accurate once it arrives; the outstanding question is the moment of arrival, which is currently not yours to choose.',
        shadow: 'Noticing only after the fact and calling it attention.',
        color: 'amber',
        masters: ['observation', 'witnessing'],
        calibration: {
          dimensions: { thought: 0.3, body: 0.2, spirit: 0.15 },
          practiceLevels: { observation: 1, witnessing: 1 },
          tags: ['intermittent', 'reactive-noticing'],
        },
      },
      {
        id: 'active',
        label: 'Active',
        short: 'The second attention is usually on',
        description:
          'You can see a thought forming, and you can see a mood arriving before it takes hold. This is a working capacity, and it opens questions that are considerably less comfortable than the ones it usually gets asked.',
        shadow: 'Turning the second attention into a second ego.',
        color: 'teal',
        masters: ['self-inquiry', 'witnessing'],
        calibration: {
          dimensions: { thought: 0.3, spirit: 0.3, emotion: 0.15 },
          practiceLevels: { witnessing: 2, 'self-inquiry': 1 },
          tags: ['watching', 'available'],
        },
      },
      {
        id: 'constant',
        label: 'Constant',
        short: 'Something is there almost throughout',
        description:
          'There is a continuous sense of things being noticed, and the noticing rarely switches off. The available work here is not to increase the seeing but to find out what is left over when the seeing is quiet — because the observer is usually the last thing examined.',
        shadow: 'Mistaking the observer for a self that needs defending.',
        color: 'indigo',
        masters: ['witnessing', 'jnana'],
        calibration: {
          dimensions: { spirit: 0.4, thought: 0.25 },
          practiceLevels: { witnessing: 2, jnana: 1 },
          tags: ['sustained', 'watcher'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'mind-wandering',
    title: 'Mind wandering',
    subtitle: 'How far the mind drifts before you notice',
    module: 'Observation',
    tradition: 'vedic',
    dimensionCategory: 'thought',
    coverEmoji: '🌀',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'The mind leaving is not a failure of discipline. A mind that cannot wander is a mind that has been told what to think, which is a different thing entirely and not obviously better.\n\nWhat matters is what the wandering is made of, whether it is chosen or automatic, and what it costs. All three of those change completely when the drift is looked at rather than fought.',
    dimensions: ['lost', 'drifting', 'ranging', 'deliberate'],
    engineHooks: {
      practiceAffinity: ['observation', 'witnessing'],
      deepensWith: ['fantasy-loops', 'rumination-index'],
    },
    questions: [
      q3(
        'wander-notice',
        'timing',
        'How long does your attention go off somewhere before you notice?',
        'How much of a drift has happened before you become aware of it?',
        'The length of the drift and the speed of the noticing are two different measurements. Where are yours?',
        [
          o('I find out hours later', { lost: 1 }),
          o('It can be a good while', { lost: 0.75, drifting: 0.25 }),
          o('Usually within the hour', { drifting: 1 }),
          o('Within a few minutes', { drifting: 0.25, ranging: 0.75 }),
          o('Almost as soon as it starts', { ranging: 0.5, deliberate: 0.5 }),
        ],
      ),
      q3(
        'wander-content',
        'content',
        'When your mind goes off, where does it usually go?',
        'What is the drift actually made of?',
        'The material a mind drifts towards is the closest thing it has to a confession. What is this one made of?',
        pickOne(
          [
            'Somewhere of its own that I did not choose',
            'Back through things that have already happened',
            'Forward into plans and rehearsals',
            'Deliberately, into an idea I want to follow',
          ],
          ['lost', 'drifting', 'ranging', 'deliberate'],
        ),
      ),
      q3(
        'wander-pleasure',
        'texture',
        'Is the drift pleasant?',
        'How do you feel while the mind is away?',
        'Some drift is a pleasure and some is a burden, and the difference is not in the content but in the relationship to it.',
        pickOne(
          [
            'Unpleasant, and I want out of it',
            'Mostly neutral — it goes on in the background',
            'Pleasant, and part of why I do it',
            'Chosen, and worth the time it takes',
          ],
          ['lost', 'drifting', 'ranging', 'deliberate'],
        ),
      ),
      q3(
        'wander-return',
        'return',
        'Once you notice you have gone, how easily do you come back?',
        'What happens between noticing the drift and being back?',
        'Coming back is a skill with its own texture, and it is the part of this that a practice can actually work on.',
        [
          o('It takes me a long time to be back', { lost: 1 }),
          o('I get back, but I am pulled again soon', { lost: 0.75, drifting: 0.25 }),
          o('It takes a deliberate effort', { drifting: 1 }),
          o('I come back fairly readily', { drifting: 0.25, ranging: 0.75 }),
          o('Immediately, and it holds', { ranging: 0.5, deliberate: 0.5 }),
        ],
      ),
      q3(
        'wander-deliberate',
        'agency',
        'Can you deliberately let your mind wander?',
        'Is the drift something you can start, or only something that happens to you?',
        'There is a difference between a mind that escapes and a mind that goes somewhere on purpose. Which one is this?',
        pickOne(
          [
            'No — it only ever happens to me',
            'I can let it drift, but I stay half alert',
            'I can take it anywhere on purpose',
            'I go there deliberately, and stay as long as I want',
          ],
          ['lost', 'drifting', 'ranging', 'deliberate'],
        ),
      ),
      q3(
        'wander-gaps',
        'gaps',
        'What happens in the gaps between thoughts?',
        'Is there anything at all between one thought and the next?',
        'The gap is not an absence. Whatever is there in it is doing more than the thoughts are.',
        pickOne(
          [
            'I am not there at all',
            'Something small passes through, too quick to name',
            'A clear sense of space, though I am not sure of it',
            'Something is there, and I can be in it',
          ],
          ['lost', 'drifting', 'ranging', 'deliberate'],
        ),
      ),
      q3(
        'wander-frequency',
        'frequency',
        'How often does this happen in a day?',
        'How much of a day is spent away from where you meant to be?',
        'Frequency is not the same as damage, and it is the measure most often used to condemn something that does not deserve it.',
        [
          o('It is most of the day', { lost: 1 }),
          o('Very often, in long stretches', { lost: 0.75, drifting: 0.25 }),
          o('A good few times', { drifting: 1 }),
          o('Occasionally', { drifting: 0.25, ranging: 0.75 }),
          o('Rarely, and usually on purpose', { ranging: 0.5, deliberate: 0.5 }),
        ],
      ),
      q3(
        'wander-cost',
        'consequence',
        'Does the wandering cost you anything?',
        'What comes of it, once the day is over?',
        'The honest accounting is at the end of the day, not in the moment. Look at what is left.',
        pickOne(
          [
            'Whole hours, and usually the day with them',
            'Small tasks that never get finished',
            'Mostly it clears itself and nothing is lost',
            'I treat it as part of the day and plan for it',
          ],
          ['lost', 'drifting', 'ranging', 'deliberate'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'lost',
        label: 'Lost',
        short: 'Away, and not sure how long for',
        description:
          'The mind goes and does not report back, and the return is slow enough that the interval is rarely noticed from inside. Because it is invisible from within, it is usually discovered by other people or by the state of the evening.',
        shadow: 'Reading the disorientation as a bad day rather than a pattern.',
        color: 'rose',
        masters: ['observation', 'witnessing'],
        calibration: {
          dimensions: { thought: 0.4, body: 0.2, action: 0.15 },
          practiceLevels: { observation: 2, witnessing: 1 },
          domainStress: { attention: 'observation' },
          tags: ['lost-time', 'unaware'],
        },
      },
      {
        id: 'drifting',
        label: 'Drifting',
        short: 'Away, and found again reasonably often',
        description:
          'The mind leaves and comes back, and the return is available. What is unresolved is what the drift is for — it is usually the mind going to whichever place it would rather not be.',
        shadow: 'Mistaking a comfortable drift for freedom.',
        color: 'amber',
        masters: ['observation', 'witnessing'],
        calibration: {
          dimensions: { thought: 0.3, emotion: 0.25, body: 0.15 },
          practiceLevels: { observation: 1, witnessing: 1 },
          tags: ['background-drift', 'returning'],
        },
      },
      {
        id: 'ranging',
        label: 'Ranging',
        short: 'It goes out, and it comes back with something',
        description:
          'The mind travels and returns, and the travel produces material — a thought, a plan, a question that was not there before. This is the mind working, at a scale the conscious attention would never have permitted.',
        shadow: 'Letting the range substitute for the decision that was avoided.',
        color: 'teal',
        masters: ['observation', 'jnana'],
        calibration: {
          dimensions: { thought: 0.25, spirit: 0.3, action: 0.2 },
          practiceLevels: { observation: 1, jnana: 1 },
          tags: ['productive-drift', 'wide'],
        },
      },
      {
        id: 'deliberate',
        label: 'Deliberate',
        short: 'The wandering is chosen, and it is on purpose',
        description:
          'The mind can be sent somewhere and taken back, deliberately. What is worth examining now is the difference between a chosen wandering and an escape that has learned to describe itself as chosen.',
        shadow: 'Choosing the escape and naming it freedom.',
        color: 'indigo',
        masters: ['raja', 'witnessing'],
        calibration: {
          dimensions: { spirit: 0.35, thought: 0.3 },
          practiceLevels: { raja: 1, witnessing: 2 },
          tags: ['chosen', 'trained'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'self-talk-tone',
    title: 'Self-talk tone',
    subtitle: 'The pitch of your inner critic',
    module: 'Observation',
    tradition: 'vedic',
    dimensionCategory: 'emotion',
    coverEmoji: '🗣️',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'There is a voice that runs most of the day, and it is rarely the one anyone chose. The question here is not whether it exists — it does, for nearly everyone — but what pitch it runs at, and what happens when it is addressed.\n\nA voice that is harsh has never once improved the thing it criticises. It has only made the same ground harder to work on.',
    dimensions: ['harsh', 'fault-finding', 'neutral', 'encouraging'],
    engineHooks: {
      loopsToCheck: ['self-criticism', 'approval-seeking'],
      practiceAffinity: ['witnessing', 'self-inquiry'],
    },
    questions: [
      q3(
        'voice-content',
        'content',
        'When the inner voice speaks, what is it usually saying?',
        'What is the recurring material of your self-talk?',
        'Whatever the voice returns to, it is returning to because it is a groove. What is the groove worn into?',
        pickOne(
          [
            'What is wrong with me',
            'What I should have done differently',
            'The facts about what is happening',
            'What is going right, and what is possible',
          ],
          ['harsh', 'fault-finding', 'neutral', 'encouraging'],
        ),
      ),
      q3(
        'voice-compare',
        'comparison',
        'Is the inner voice harsher with you than it is with other people?',
        'Compare how you speak to yourself with how you speak to others.',
        'Most people draw a line between the two, and the line is the measure of what the voice is for. Where is yours?',
        [
          o('Far harsher with myself', { harsh: 1 }),
          o('Noticeably harsher', { harsh: 0.75, 'fault-finding': 0.25 }),
          o('About the same either way', { 'fault-finding': 1 }),
          o('Slightly kinder than I am with others', { 'fault-finding': 0.25, neutral: 0.75 }),
          o('I speak to myself as I would to a friend', { neutral: 0.5, encouraging: 0.5 }),
        ],
      ),
      q3(
        'voice-role',
        'posture',
        'Is the inner voice more like a coach or a prosecutor?',
        'What is its standing in relation to you?',
        'The voice presents itself as an ally and arrives with a case already built. Which of the two is it?',
        pickOne(
          [
            'A prosecutor — always building a case against me',
            'A critic — never done finding the flaw',
            'A reporter — stating what is, without comment',
            'A coach — pointing at what is possible',
          ],
          ['harsh', 'fault-finding', 'neutral', 'encouraging'],
        ),
      ),
      q3(
        'voice-volume',
        'pitch',
        'How loud is it?',
        'How much of the day is spent listening to it?',
        'Volume is easier to measure than tone, and it is usually the thing that has quietly shaped the day. What is it here?',
        pickOne(
          [
            'Constant, at full volume',
            'Loud for most of the day',
            'It comes and goes',
            'Present, and mostly worth hearing',
          ],
          ['harsh', 'fault-finding', 'neutral', 'encouraging'],
        ),
      ),
      q3(
        'voice-switch',
        'control',
        'Can you turn it down when you want to?',
        'How much say do you have over the volume?',
        'The voice is unchosen, but it is not necessarily ungoverned. How much governance do you actually have?',
        [
          o('No, I cannot turn it down at all', { harsh: 1 }),
          o('Barely, and not for long', { harsh: 0.75, 'fault-finding': 0.25 }),
          o('With effort', { 'fault-finding': 1 }),
          o('Usually, if I remember to', { 'fault-finding': 0.25, neutral: 0.75 }),
          o('Quickly, and it goes', { neutral: 0.5, encouraging: 0.5 }),
        ],
      ),
      q3(
        'voice-quiet',
        'relief',
        'What has ever quietened it?',
        'Which of these has actually brought the volume down?',
        'Almost everything that soothes a moment leaves the voice exactly where it was. What genuinely lowers it?',
        pickOne(
          [
            'Nothing I have tried',
            'Distraction, and it comes straight back',
            'A quiet walk, or a bath',
            'Someone being gentle with me',
          ],
          ['harsh', 'fault-finding', 'neutral', 'encouraging'],
        ),
      ),
      q3(
        'voice-peak',
        'timing',
        'When is it loudest?',
        'Which situations bring it up the most?',
        'The trigger tells you what the voice is actually for. Which of these switches it on?',
        pickOne(
          [
            'After I have got something wrong',
            'When I am tired or depleted',
            'When I am on my own',
            'When I am being asked to be seen',
          ],
          ['harsh', 'fault-finding', 'neutral', 'encouraging'],
        ),
      ),
      q3(
        'voice-others',
        'direction',
        'Does the inner voice comment on other people as well?',
        'Which way does the voice point when it leaves you alone?',
        'A voice that only ever turns inward is doing one job. Which way does this one turn?',
        pickOne(
          [
            'It is almost entirely about me',
            'Mostly about me, with a running commentary on others',
            'It comments on both, and fairly',
            'It is kinder about other people than they are about themselves',
          ],
          ['harsh', 'fault-finding', 'neutral', 'encouraging'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'harsh',
        label: 'Harsh voice',
        short: 'The pitch never drops',
        description:
          'The inner commentary runs at a volume and a pitch that most people would not put up with from a stranger. It is constant, it is not addressed, and it has been running long enough to be indistinguishable from the truth.',
        shadow: 'Mistaking a voice that never stops for a self that cannot be questioned.',
        color: 'rose',
        masters: ['loop-dissolution', 'witnessing'],
        calibration: {
          dimensions: { emotion: 0.4, thought: 0.25, body: 0.15 },
          practiceLevels: { witnessing: 1, 'loop-dissolution': 1 },
          domainStress: { self: 'emotional-healing' },
          tags: ['self-critical', 'high-volume'],
        },
      },
      {
        id: 'fault-finding',
        label: 'Fault-finding voice',
        short: 'It is always pointing at something',
        description:
          'The voice is not cruel so much as permanently unresolved — it finds the flaw in whatever it is handed and moves on to the next thing. Because it is useful in small ways, it is rarely questioned as a whole.',
        shadow: 'Confusing the accuracy of a criticism with the fairness of the tone.',
        color: 'orange',
        masters: ['witnessing', 'jnana'],
        calibration: {
          dimensions: { thought: 0.3, emotion: 0.3, action: 0.15 },
          practiceLevels: { witnessing: 1, jnana: 1 },
          tags: ['fault-finding', 'never-satisfied'],
        },
      },
      {
        id: 'neutral',
        label: 'Neutral voice',
        short: 'It reports, and stops there',
        description:
          'The inner voice is reasonably even and mostly descriptive. There is little of the criticism and not much encouragement either, which has its own consequence: it is difficult to find out what the voice is for, if it is not defending or encouraging.',
        shadow: 'Flatness that is mistaken for the absence of an inner life.',
        color: 'slate',
        masters: ['observation', 'witnessing'],
        calibration: {
          dimensions: { thought: 0.25, emotion: 0.25, spirit: 0.15 },
          practiceLevels: { observation: 1, witnessing: 1 },
          tags: ['even', 'unresolved'],
        },
      },
      {
        id: 'encouraging',
        label: 'Encouraging voice',
        short: 'It says the thing that is actually useful',
        description:
          'The inner voice is on your side and says so in specifics. Worth watching for one thing: a voice that never says anything difficult becomes a second thing to maintain, and the things it does not say go on being unsaid.',
        shadow: 'Encouragement that has stopped being honest.',
        color: 'emerald',
        masters: ['bhakti', 'witnessing'],
        calibration: {
          dimensions: { emotion: 0.3, connection: 0.2, spirit: 0.25 },
          practiceLevels: { bhakti: 1, witnessing: 1 },
          tags: ['kind', 'useful'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'sensory-awareness',
    title: 'Sensory awareness',
    subtitle: 'How often you notice the body noticing',
    module: 'Observation',
    tradition: 'yogic',
    dimensionCategory: 'body',
    coverEmoji: '👁️',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'The body is reporting continuously and most of the report is never read. Sensation is the first language, and the one that never stopped speaking.\n\nThis looks at the receiving end of that report: how much arrives, how precisely it is described, and whether the body is background or foreground during an ordinary day.',
    dimensions: ['dull', 'occasional', 'attentive', 'continuous'],
    engineHooks: {
      practiceAffinity: ['body', 'observation'],
    },
    questions: [
      q3(
        'sense-breath',
        'breath',
        'How often do you notice your breathing without deciding to?',
        'Does the breath get noticed between one intention and the next?',
        'The breath is the one sensation available in every state, including sleep-adjacent ones. How much of it is being read?',
        [
          o('Only when something has gone wrong with it', { dull: 1 }),
          o('Rarely, and usually late', { dull: 0.75, occasional: 0.25 }),
          o('Sometimes, when I remember', { occasional: 1 }),
          o('Quite often', { occasional: 0.25, attentive: 0.75 }),
          o('Without deciding to, most of the time', { attentive: 0.5, continuous: 0.5 }),
        ],
      ),
      q3(
        'sense-tension',
        'early',
        'Do you feel a tension before it starts to hurt?',
        'How much warning does the body give before something hurts?',
        'The body sends the signal first, every time, and the pain only arrives if nothing read it. Which one are you meeting?',
        pickOne(
          [
            'Only once it actually hurts',
            'Sometimes, if I think to look',
            'Usually, before it hurts',
            'Long before it hurts',
          ],
          ['dull', 'occasional', 'attentive', 'continuous'],
        ),
      ),
      q3(
        'sense-emotion',
        'affect',
        'Where in your body do you feel an emotion as it happens?',
        'Is the feeling placed in the body while it is still going on?',
        'An emotion felt in the body and an emotion told about afterwards are different events. Which one is happening first?',
        pickOne(
          [
            'I feel it, but I could not place it',
            'I place it once it has passed',
            'I place it as it is happening',
            'I feel it move through the body as it happens',
          ],
          ['dull', 'occasional', 'attentive', 'continuous'],
        ),
      ),
      q3(
        'sense-walk-eat',
        'activity',
        'While you are walking or eating, how much of your attention is on what you are doing?',
        'During an ordinary action, how much of you is actually in it?',
        'The body cannot be in two activities at once, and neither can attention. Which of the two goes elsewhere?',
        [
          o('I am already in the next thing', { dull: 1 }),
          o('Mostly in the next thing', { dull: 0.75, occasional: 0.25 }),
          o('Half and half', { occasional: 1 }),
          o('Mostly on what I am doing', { occasional: 0.25, attentive: 0.75 }),
          o('Completely on it, including how it feels', { attentive: 0.5, continuous: 0.5 }),
        ],
      ),
      q3(
        'sense-background',
        'foreground',
        'Is the body background or foreground for most of the day?',
        'Where does the body sit, in the hierarchy of a normal day?',
        'The body is either being lived in or being carried around. Which is it, most of the time?',
        pickOne(
          [
            'Entirely background — I would not know it was there',
            'Background, unless something hurts',
            'Foreground much of the time',
            'Foreground nearly all the time',
          ],
          ['dull', 'occasional', 'attentive', 'continuous'],
        ),
      ),
      q3(
        'sense-describe',
        'precision',
        'If you felt a strange sensation, could you describe exactly what it was?',
        'How precisely can you report a sensation, if you stop to describe one?',
        'The quality of a description is the quality of a noticing. How fine is the grain here?',
        pickOne(
          [
            'No, not at all — I would not know where to start',
            'Roughly, and in general words',
            'Quite precisely, if I take the time',
            'Exactly, in detail, if I look',
          ],
          ['dull', 'occasional', 'attentive', 'continuous'],
        ),
      ),
      q3(
        'sense-memory',
        'record',
        'How much do you remember of how your body felt during a day?',
        'What is left at the end of a day, of the body’s report?',
        'A day of sensations that leaves no record was either uneventful or unread. Which was it?',
        pickOne(
          [
            'Almost nothing',
            'Only when something unusual happened',
            'A fair amount of the day',
            'A detailed account, in order',
          ],
          ['dull', 'occasional', 'attentive', 'continuous'],
        ),
      ),
      q3(
        'sense-interference',
        'cost',
        'Does noticing the body ever get in the way of what you are doing?',
        'Does the awareness interrupt the activity, or accompany it?',
        'Awareness of the body is supposed to be unobtrusive. If it is not, something is standing between the two.',
        pickOne(
          [
            'It does not come up at all',
            'Only when something is wrong',
            'It interrupts me fairly often',
            'It is almost continuously there',
          ],
          ['dull', 'occasional', 'attentive', 'continuous'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'dull',
        label: 'Low registration',
        short: 'The report is there, unread',
        description:
          'The body is signalling and the signal is not being read. This is worth taking seriously as a capacity rather than a symptom, because the sensing equipment is intact — it is the reading of it that has gone quiet.',
        shadow: 'Calling a dull day calm when nothing is actually being felt.',
        color: 'slate',
        masters: ['body', 'observation'],
        calibration: {
          dimensions: { body: 0.35, thought: 0.2, emotion: 0.2 },
          practiceLevels: { body: 1, observation: 1 },
          tags: ['under-felt', 'unread'],
        },
      },
      {
        id: 'occasional',
        label: 'Occasional sensing',
        short: 'It comes and goes, usually with discomfort',
        description:
          'The body is registered in episodes, most often when something hurts. Because the noticing arrives with the discomfort, the association between sensing and suffering gets formed — which is the association worth undoing first.',
        shadow: 'Only noticing the body when the body is making a complaint.',
        color: 'amber',
        masters: ['body', 'breath'],
        calibration: {
          dimensions: { body: 0.3, thought: 0.15, emotion: 0.2 },
          practiceLevels: { body: 1, breath: 1 },
          tags: ['intermittent', 'pain-led'],
        },
      },
      {
        id: 'attentive',
        label: 'Attentive to the body',
        short: 'The sensing is a working habit',
        description:
          'Sensation is read reliably, and descriptions of it are accurate. This is the level at which body practice becomes informative rather than merely calming, because there is finally something specific to work with.',
        shadow: 'Accuracy about sensation mistaken for distance from it.',
        color: 'teal',
        masters: ['body', 'observation'],
        calibration: {
          dimensions: { body: 0.3, spirit: 0.2, thought: 0.2 },
          practiceLevels: { body: 2, observation: 1 },
          tags: ['precise', 'inhabited'],
        },
      },
      {
        id: 'continuous',
        label: 'Continuous sensing',
        short: 'The body is foreground, all day',
        description:
          'The body is being lived in rather than carried around, and the noticing does not switch off. The remaining question is what happens at the edges — whether a constant signal can still be heard when it matters, or has simply become a hum.',
        shadow: 'A constant signal that has stopped being information.',
        color: 'indigo',
        masters: ['body', 'witnessing'],
        calibration: {
          dimensions: { body: 0.3, spirit: 0.35, emotion: 0.15 },
          practiceLevels: { body: 2, witnessing: 1 },
          tags: ['continuous', 'foreground'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'inner-silence',
    title: 'Inner silence',
    subtitle: 'The gap between two thoughts',
    module: 'Observation',
    tradition: 'vedic',
    dimensionCategory: 'witness',
    coverEmoji: '🕳️',
    estimatedMinutes: 7,
    version: 1,
    intro:
      'There is a gap between one thought and the next. It is not a philosophical idea — it is a feature of what thinking actually is, and everyone has already been in one without knowing it.\n\nThe gap is also the only place in the mind where nothing is being produced. This looks at whether that place can be felt, whether it can be returned to, and what closes it when it opens.',
    dimensions: ['absent', 'fleeting', 'encounterable', 'inhabitable'],
    engineHooks: {
      practiceAffinity: ['witnessing', 'raja'],
      deepensWith: ['silence-tolerance', 'non-dual-glimpses'],
    },
    questions: [
      q3(
        'gap-felt',
        'existence',
        'Have you ever actually felt the gap between two thoughts?',
        'Is the space between one thought and the next something you have been in?',
        'Between every two thoughts there is a space, and almost nobody has been in one. Have you?',
        pickOne(
          [
            'I do not believe I have',
            'Once or twice, and I was not sure what it was',
            'Often enough to recognise it when it comes',
            'Regularly, and I know it well',
          ],
          ['absent', 'fleeting', 'encounterable', 'inhabitable'],
        ),
      ),
      q3(
        'gap-length',
        'duration',
        'When it happens, how long does it last?',
        'How much time is there in the gap, when there is time?',
        'The gap has a measurable length, and the length is what tells you whether it is an opening or only a pause.',
        [
          o('A fraction of a second, and gone', { absent: 1 }),
          o('A second or two', { absent: 0.75, fleeting: 0.25 }),
          o('A few seconds, enough to notice', { fleeting: 1 }),
          o('Long enough to be clear about it', { fleeting: 0.25, encounterable: 0.75 }),
          o('It opens out, and it stays open', { encounterable: 0.5, inhabitable: 0.5 }),
        ],
      ),
      q3(
        'gap-quality',
        'texture',
        'What is it like, when it happens?',
        'What is actually in the gap?',
        'The gap is usually described rather than reported. What is there when the description is left out?',
        pickOne(
          [
            'A blank nothing — I was not there for it',
            'A brief emptiness, gone before it registers',
            'A clear, open space',
            'Stillness with a great deal in it',
          ],
          ['absent', 'fleeting', 'encounterable', 'inhabitable'],
        ),
      ),
      q3(
        'gap-heard',
        'contents',
        'Is anything there when the gap opens?',
        'When you have been in it, was there anything at all?',
        'The usual finding is that the gap is not empty. If something has ever been heard in it, what was it?',
        pickOne(
          [
            'Nothing at all — I was not there',
            'Not that I could say afterwards',
            'A presence, or a sense of being',
            'Something that seemed aware of me looking',
          ],
          ['absent', 'fleeting', 'encounterable', 'inhabitable'],
        ),
      ),
      q3(
        'gap-return',
        'access',
        'How hard is it to return to it on purpose?',
        'When you go looking for the gap deliberately, what happens?',
        'Arriving somewhere and being able to return are two different abilities. Which one is available here?',
        [
          o('I cannot find it when I look', { absent: 1 }),
          o('It takes a great deal of trying', { absent: 0.75, fleeting: 0.25 }),
          o('It takes sustained practice', { fleeting: 1 }),
          o('I can get there with a little effort', { fleeting: 0.25, encounterable: 0.75 }),
          o('I can settle into it deliberately', { encounterable: 0.5, inhabitable: 0.5 }),
        ],
      ),
      q3(
        'gap-enter',
        'direction',
        'Is silence something you can enter, or only something that arrives?',
        'Are you going towards it, or does it turn up?',
        'Every account of this eventually separates the two: silence found by waiting, and silence entered by going. Which is this?',
        pickOne(
          [
            'Only ever something that happens to me',
            'It happens, and then it goes',
            'I can go towards it',
            'I go in, and I know the way there',
          ],
          ['absent', 'fleeting', 'encounterable', 'inhabitable'],
        ),
      ),
      q3(
        'gap-closes',
        'interruption',
        'What ends it, once it has opened?',
        'What actually closes the gap?',
        'Most silence is closed by a thought arriving, and the interesting question is whether the thought was the cause or the excuse.',
        pickOne(
          [
            'I never get far enough for it to end',
            'I notice it, and losing it is the noticing',
            'A thought arrives, and closes it',
            'Nothing much closes it, and I can stay',
          ],
          ['absent', 'fleeting', 'encounterable', 'inhabitable'],
        ),
      ),
      q3(
        'gap-daily',
        'presence',
        'How much of your life has any of this in it?',
        'How often does the gap appear in an ordinary week?',
        'This is being measured in a life rather than in a sitting. How much of the life contains it?',
        [
          o('None at all', { absent: 1 }),
          o('Occasionally, by accident', { absent: 0.75, fleeting: 0.25 }),
          o('Now and then, on purpose', { fleeting: 1 }),
          o('Regularly, if briefly', { fleeting: 0.25, encounterable: 0.75 }),
          o('It is a real part of how I move through the day', { encounterable: 0.5, inhabitable: 0.5 }),
        ],
      ),
    ],
    resultTypes: [
      {
        id: 'absent',
        label: 'Gap unavailable',
        short: 'The space has never been felt',
        description:
          'There is no report of the space between thoughts, and no reliable way of getting there on purpose. This is the ordinary starting condition, and it is far more common than people expect. What is not available is also not missing — it has simply never been introduced.',
        shadow: 'Assuming there is nothing there because nothing has been reported.',
        color: 'slate',
        masters: ['witnessing', 'breath'],
        calibration: {
          dimensions: { spirit: 0.35, thought: 0.3 },
          practiceLevels: { witnessing: 1, breath: 1 },
          tags: ['unavailable', 'not-yet-introduced'],
        },
      },
      {
        id: 'fleeting',
        label: 'Fleeting contact',
        short: 'It has been there, and it went quickly',
        description:
          'The gap has been felt, briefly, and usually by not looking for it. It closes as soon as attention arrives, which is not a failure of the attempt but the ordinary condition of the thing itself. The skill here is arriving without arriving.',
        shadow: 'Grieving the gap that closes as you notice it.',
        color: 'amber',
        masters: ['witnessing', 'breath'],
        calibration: {
          dimensions: { spirit: 0.3, thought: 0.25, body: 0.15 },
          practiceLevels: { witnessing: 1, breath: 1 },
          tags: ['brief', 'closes-on-noticing'],
        },
      },
      {
        id: 'encounterable',
        label: 'Encounterable',
        short: 'It can be found, and it is recognisable',
        description:
          'The gap can be reached deliberately, and it is recognisable when it arrives. What usually comes next is a question: if the space is not empty, and the thought is not what closes it, then what exactly is doing the closing?',
        shadow: 'Reaching for it and calling the reaching a failure of practice.',
        color: 'teal',
        masters: ['witnessing', 'jnana'],
        calibration: {
          dimensions: { spirit: 0.35, thought: 0.25 },
          practiceLevels: { witnessing: 2, jnana: 1 },
          tags: ['findable', 'reliable'],
        },
      },
      {
        id: 'inhabitable',
        label: 'Inhabitable',
        short: 'It is a place, and it can be lived in',
        description:
          'The silence is something you go into rather than something that happens to you, and it can be stayed in. Worth watching what else gets decided in there, because a place that resolves everything on its own can start to be preferred to the conversations that do not.',
        shadow: 'Silence preferred to the difficult thing that is waiting.',
        color: 'indigo',
        masters: ['witnessing', 'jnana'],
        calibration: {
          dimensions: { spirit: 0.45, thought: 0.2 },
          practiceLevels: { witnessing: 2, jnana: 2 },
          domainStress: { contact: 'relationship' },
          tags: ['inhabited', 'chosen'],
        },
      },
    ],
  },
];
