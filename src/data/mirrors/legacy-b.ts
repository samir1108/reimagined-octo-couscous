/**
 * LEGACY SET B · the eight missing banks between practice and pattern
 *
 * These eight were, until now, only reachable as slugs: present in
 * `DB_RESIDENT_SLUGS`, absent from the authored registry, and therefore
 * invisible to the Library and to the coverage gate.
 *
 *   practice-level-calibration   where a practitioner actually sits on the
 *                                path, from first contact to embodied depth
 *   path-affinity                which of the four classical yogas fits
 *   triguna-analysis             the three guṇas as a daily engine map
 *   pancha-kosha                 the five kośas as an observation scaffold
 *   discipline-style             how sustained effort is actually organised
 *   sankalpa-shakti              the clarity and durability of resolve
 *   klesha-map                   the five kleśas as a loop-dissolution lens
 *   vasana-map                   the habit-structure that runs underneath
 *
 * Surface tier stays external and situational. Core tier names the mechanism
 * and turns the lens back on the one asking.
 */

import { q3, pickOne, likert5, scale, type MirrorBank } from './types';

export const LEGACY_B_BANKS: MirrorBank[] = [
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'practice-level-calibration',
    title: 'Practice level',
    subtitle: 'How far along the path you are',
    module: 'Skills',
    tradition: 'yogic',
    dimensionCategory: 'practice',
    coverEmoji: '📈',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Practice has a shape that is not the same as effort. Someone can be trying hard for a short time and be at the beginning, and someone can be doing very little for a long time and be much further along.\n\nFour positions are described here. They are not grades and they are not permanent: the reading is a description of today, and most people have been in at least two of them already.',
    dimensions: ['beginner', 'developing', 'established', 'deepening'],
    engineHooks: {
      loopsToCheck: ['drift', 'avoidance-map'],
      practiceAffinity: ['observation', 'self-inquiry', 'witnessing'],
      deepensWith: ['discipline-style', 'sankalpa-shakti'],
    },
    questions: [
      q3(
        'practice-duration',
        'time on the mat',
        'How long have you been practising in some form?',
        'What is the actual span of practice in your life, not the span you would like it to be?',
        'The path is measured in accumulated attention, not in declared intention. How much of yours has actually been paid?',
        scale(
          [
            'A few weeks, if that',
            'A few months, with gaps',
            'A year or more, reasonably consistent',
            'Several years, and it has changed me',
          ],
          ['beginner', 'developing', 'established', 'deepening'],
        ),
      ),
      q3(
        'practice-frequency',
        'regularity',
        'How often does practice actually happen?',
        'What is the real frequency, not the planned one?',
        'Consistency is what separates a position from an intention. How much of yours is actually arriving?',
        likert5('developing', [
          'Rarely — it comes and goes',
          'Sometimes, when I feel like it',
          'Most days, but not always',
          'Regularly, and I notice when it stops',
          'It is part of the day, like eating',
        ]),
      ),
      q3(
        'practice-depth',
        'depth',
        'When you practise, how far in do you go?',
        'What is the furthest point you have actually reached, not the furthest you have read about?',
        'Depth is not dramatic. It is usually the moment where something ordinary becomes legible. How often does that happen?',
        scale(
          [
            'I am mostly going through the motions',
            'I settle a little, but it is shallow',
            'I can stay present for most of it',
            'I lose track of time sometimes',
            'There are moments where I am not there at all',
          ],
          ['beginner', 'developing', 'established', 'deepening'],
        ),
      ),
      q3(
        'practice-integration',
        'off the mat',
        'How much of practice shows up outside the session?',
        'What carries over into the rest of the day?',
        'Practice that stays in the room is exercise. Practice that comes out is practice. How much of yours leaves?',
        likert5('established', [
          'Almost none',
          'A little, sometimes',
          'Some of it, most days',
          'Most of it, without trying',
          'It is just how the day is organised',
        ]),
      ),
      q3(
        'practice-resistance',
        'avoidance',
        'What happens when practice gets hard?',
        'How do you handle the part that is not pleasant?',
        'Every practitioner meets the same wall eventually. The wall is not a sign that something is wrong — it is the place where practice actually begins. Where are you with it?',
        pickOne(
          [
            'I stop, and do not go back for a while',
            'I shorten it, and avoid the hard part',
            'I stay, but I am not fully there',
            'I go through it, and something shifts afterwards',
          ],
          ['beginner', 'developing', 'established', 'deepening'],
        ),
      ),
      q3(
        'practice-witness',
        'witnessing',
        'How much of the practice is you watching yourself?',
        'What is the balance between doing and observing?',
        'Witnessing is the hinge on which practice turns. Early practice is mostly doing; later practice is mostly watching. Where is yours?',
        scale(
          [
            'I am doing it, and that is all',
            'I notice I am doing it',
            'I can watch while it is happening',
            'The watching is the larger part',
            'There is no difference between the two',
          ],
          ['beginner', 'developing', 'established', 'deepening'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'beginner',
        label: 'Beginning',
        short: 'The first genuine contact',
        description:
          'Practice has started, and the first thing noticed is how much is happening that was not seen before. This is not a weak position — it is the most honest one, because everything in it is new and unedited.',
        shadow: 'Treating the first discoveries as the whole of what is available.',
        color: 'slate',
        masters: ['observation', 'body'],
        calibration: {
          dimensions: { body: 0.3, thought: 0.25, emotion: 0.15 },
          practiceLevels: { observation: 1, body: 1 },
          tags: ['beginner', 'contact'],
        },
      },
      {
        id: 'developing',
        label: 'Developing',
        short: 'Building the habit of returning',
        description:
          'Practice is happening often enough to be a presence rather than an event. The work here is not depth but consistency — showing up when nothing interesting is happening, which is most of the time.',
        shadow: 'Confusing regularity for understanding.',
        color: 'amber',
        masters: ['raja', 'witnessing'],
        calibration: {
          dimensions: { action: 0.3, thought: 0.2, body: 0.2 },
          practiceLevels: { raja: 1, witnessing: 1 },
          tags: ['developing', 'consistent'],
        },
      },
      {
        id: 'established',
        label: 'Established',
        short: 'It is part of the architecture',
        description:
          'Practice has become a structure rather than an activity. It carries over into the day without being summoned, and the sessions have a depth that is not dependent on feeling inspired.',
        shadow: 'Letting the structure replace the inquiry.',
        color: 'sky',
        masters: ['raja', 'kriya'],
        calibration: {
          dimensions: { spirit: 0.3, body: 0.25, thought: 0.2 },
          practiceLevels: { raja: 1, kriya: 1 },
          tags: ['established', 'structural'],
        },
      },
      {
        id: 'deepening',
        label: 'Deepening',
        short: 'The surface has become transparent',
        description:
          'Practice is no longer something done; it is something lived. The sessions are quiet and uneventful from the outside, and from the inside they are the most direct thing that happens in a day.',
        shadow: 'Treating depth as a permanent state rather than a recurring visit.',
        color: 'violet',
        masters: ['witnessing', 'self-inquiry'],
        calibration: {
          dimensions: { spirit: 0.35, thought: 0.25, emotion: 0.2 },
          practiceLevels: { witnessing: 2, 'self-inquiry': 1 },
          tags: ['deepening', 'embodied'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'path-affinity',
    title: 'Path affinity',
    subtitle: 'Which approach fits you',
    module: 'Skills',
    tradition: 'yogic',
    dimensionCategory: 'path',
    coverEmoji: '🛤️',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Four broad approaches have been carried forward because they work, not because they are the only ones. Bhakti is the path of care; jñāna is the path of understanding; karma is the path of action; rāja is the path of attention.\n\nNobody is only one of these, and nobody is wrong for being more of one than another. The question is which one is already doing the most work in your life, because that is the one most likely to respond to being named.',
    dimensions: ['bhakti', 'jnana', 'karma', 'raja'],
    engineHooks: {
      loopsToCheck: ['drift', 'approval-seeking'],
      practiceAffinity: ['bhakti', 'jnana', 'karma', 'raja'],
      deepensWith: ['inner-compass', 'work-dharma'],
    },
    questions: [
      q3(
        'path-draw',
        'attraction',
        'When you read about practice, what draws you in?',
        'Which of these descriptions makes you lean forward?',
        'The thing that pulls your attention is the thing that is already yours. What is it?',
        pickOne(
          [
            'Stories and figures that move me',
            'Ideas that make something click',
            'Things I can actually do',
            'States of attention I can taste',
          ],
          ['bhakti', 'jnana', 'karma', 'raja'],
        ),
      ),
      q3(
        'path-effort',
        'effort',
        'Which of these feels most like work?',
        'Which one costs you something to engage with?',
        'The path that feels like work is the one that is teaching you. Which one is it?',
        pickOne(
          [
            'Opening myself to something larger',
            'Holding a question without reaching for an answer',
            'Doing something for no reason other than it needs doing',
            'Sitting with attention without pulling it anywhere',
          ],
          ['bhakti', 'jnana', 'karma', 'raja'],
        ),
      ),
      q3(
        'path-sustain',
        'sustaining',
        'What keeps you going when practice gets hard?',
        'When the novelty is gone, what is left?',
        'Sustaining is not enthusiasm. It is the thing that arrives when enthusiasm has left. What is it for you?',
        scale(
          [
            'The feeling that something cares about this',
            'The sense that there is something to understand',
            'The knowledge that showing up is itself the practice',
            'The memory of what it is like when attention lands',
          ],
          ['bhakti', 'jnana', 'karma', 'raja'],
        ),
      ),
      q3(
        'path-language',
        'language',
        'Which language do you naturally reach for?',
        'How do you describe what you are doing when you are actually doing it?',
        'The language you use is the path you are on, whether you have named it or not. Which one is it?',
        pickOne(
          [
            'I surrender, I trust, I let go',
            'I see, I understand, I question',
            'I serve, I act, I offer',
            'I witness, I return, I rest in attention',
          ],
          ['bhakti', 'jnana', 'karma', 'raja'],
        ),
      ),
      q3(
        'path-resonance',
        'resonance',
        'Which of these feels most like coming home?',
        'When practice is working, what does it feel like from the inside?',
        'Coming home is not relief; it is recognition. Which of these do you recognise?',
        scale(
          [
            'A widening, a softening, a warmth',
            'A clarity, a distinction, a seeing-through',
            'A rightness, a fitness, a thing in its place',
            'A silence, a rest, a stopping',
          ],
          ['bhakti', 'jnana', 'karma', 'raja'],
        ),
      ),
      q3(
        'path-natural',
        'natural',
        'What do you do without being asked?',
        'What practice asks nothing of you and still gets done?',
        'The thing you do without being told is the path that is already yours. What is it?',
        pickOne(
          [
            'I reach for connection, or for something to believe in',
            'I want to know, and I keep asking',
            'I do the thing, and I feel better for having done it',
            'I sit, I watch, I come back',
          ],
          ['bhakti', 'jnana', 'karma', 'raja'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'bhakti',
        label: 'Bhakti',
        short: 'The path of care',
        description:
          'Your natural orientation is toward something you can care about, and practice is sustained by the quality of that care. The strength is real: devotion produces a steadiness that no amount of effort can manufacture. The risk is that the object of care becomes more important than the caring.',
        shadow: 'The object of devotion replacing the act of devoting.',
        color: 'rose',
        masters: ['bhakti', 'relationship'],
        calibration: {
          dimensions: { connection: 0.35, emotion: 0.3, spirit: 0.2 },
          practiceLevels: { bhakti: 2, relationship: 1 },
          domainStress: { devotion: 'bhakti' },
          tags: ['devotional', 'heart-centred'],
        },
      },
      {
        id: 'jnana',
        label: 'Jñāna',
        short: 'The path of understanding',
        description:
          'Your natural orientation is toward knowing, and practice is sustained by the pleasure of a thing becoming clear. The strength is discernment: you can tell a real insight from a persuasive story. The risk is that understanding becomes a substitute for doing.',
        shadow: 'Knowing becoming a substitute for living.',
        color: 'sky',
        masters: ['jnana', 'self-inquiry'],
        calibration: {
          dimensions: { thought: 0.4, spirit: 0.25, connection: 0.15 },
          practiceLevels: { jnana: 2, 'self-inquiry': 1 },
          domainStress: { knowing: 'jnana' },
          tags: ['discriminating', 'seeing-through'],
        },
      },
      {
        id: 'karma',
        label: 'Karma',
        short: 'The path of action',
        description:
          'Your natural orientation is toward doing, and practice is sustained by the sense that action itself is the matter. The strength is reliability: you show up, you do the work, you do not wait for inspiration. The risk is that doing replaces being.',
        shadow: 'Activity that has forgotten what it is acting for.',
        color: 'amber',
        masters: ['karma', 'raja'],
        calibration: {
          dimensions: { action: 0.4, body: 0.2, thought: 0.15 },
          practiceLevels: { karma: 2, raja: 1 },
          domainStress: { doing: 'karma' },
          tags: ['active', 'service-oriented'],
        },
      },
      {
        id: 'raja',
        label: 'Rāja',
        short: 'The path of attention',
        description:
          'Your natural orientation is toward the state of attention itself, and practice is sustained by the memory of what it is like when attention lands. The strength is depth: once attention is trained, nothing else needs to change. The risk is that the inward turn becomes a withdrawal.',
        shadow: 'Attention turning into avoidance of what is being looked at.',
        color: 'indigo',
        masters: ['raja', 'witnessing'],
        calibration: {
          dimensions: { spirit: 0.35, thought: 0.25, body: 0.15 },
          practiceLevels: { raja: 2, witnessing: 1 },
          domainStress: { attention: 'raja' },
          tags: ['attentional', 'inward'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'triguna-analysis',
    title: 'Triguna analysis',
    subtitle: 'The three qualities in you',
    module: 'Engines',
    tradition: 'ayurvedic',
    dimensionCategory: 'engines',
    coverEmoji: '⚖️',
    estimatedMinutes: 7,
    version: 1,
    intro:
      'Sāṃkhya reads nature as three qualities always in motion: sattva, the force of clarity and light; rajas, the force of movement and heat; and tamas, the force of stability and weight. No one is any single one of them — what changes is which one is driving, and how much of the others is visible underneath.\n\nThis is a working description, not a diagnosis. What it is useful for is noticing which of your own tendencies is currently running hottest, because a great deal of what people call their personality is one guṇa behaving predictably.',
    dimensions: ['sattva', 'rajas', 'tamas'],
    engineHooks: {
      loopsToCheck: ['over-committed', 'avoidance-map'],
      practiceAffinity: ['body', 'breath', 'raja'],
      deepensWith: ['dosha-constitution', 'nervous-system-tone'],
    },
    questions: [
      q3(
        'guna-clarity',
        'clarity',
        'How would you describe your mind on a normal day?',
        'What is the ordinary texture of your thinking?',
        'Sattva is clarity — light, easy to see through, not clouded by its own movement. How much of yours is like that?',
        scale(
          [
            'Mostly cloudy, and I cannot see through it',
            'Patchy — some things are clear, others are not',
            'Mostly clear, with the odd fog',
            'Clear enough that I can see what is underneath',
            'Bright, and the seeing is effortless',
          ],
          ['tamas', 'rajas', 'sattva'],
        ),
      ),
      q3(
        'guna-activity',
        'activity',
        'How much of your day is driven by movement?',
        'What is the engine underneath your normal pace?',
        'Rajas is movement — heat, speed, the urge to do. How much of your day is running at that speed?',
        scale(
          [
            'Slow, and I resist picking up',
            'Steady, and I move when I need to',
            'Quite active, and I like it',
            'Fast, and I am always doing something',
            'Driven, and I find it hard to stop',
          ],
          ['tamas', 'sattva', 'rajas'],
        ),
      ),
      q3(
        'guna-weight',
        'weight',
        'How do you handle inertia?',
        'What happens when you have to move and do not feel like it?',
        'Tamas is not laziness; it is the weight of something that does not want to move yet. How do you handle yours?',
        scale(
          [
            'I do not move until something forces me',
            'I need a push, and then I go',
            'I move when I decide to, without drama',
            'I find inertia easy to shift',
            'I rarely meet it — something is always in motion',
          ],
          ['tamas', 'sattva', 'rajas'],
        ),
      ),
      q3(
        'guna-dominant',
        'dominant',
        'Which of these three is doing most of the work in you right now?',
        'If you had to name the one that is running your days, what would it be?',
        'The three are always present, but one is usually ahead. Which one is ahead for you at this moment?',
        pickOne(
          [
            'I feel heavy, and it is hard to get going',
            'I am moving, but I do not know where',
            'I am clear, and things fall into place',
          ],
          ['tamas', 'rajas', 'sattva'],
        ),
      ),
      q3(
        'guna-stability',
        'stability',
        'How stable is your inner state from day to day?',
        'What happens to your mood when something small goes wrong?',
        'Stability here is not stillness; it is the distance between your ordinary state and a disturbance. How wide is that distance?',
        likert5('sattva', [
          'I swing a lot, and the days are very different',
          'I am mostly steady, with the odd dip',
          'I recover quickly, and the day returns',
          'I am rarely thrown far',
          'I am mostly the same, whatever happens',
        ]),
      ),
      q3(
        'guna-shift',
        'shift',
        'How easily does your state change?',
        'What does it take to move you out of your ordinary groove?',
        'The guṇas shift with the food, the company, the hour and the season. How much of a shift can you notice in yourself?',
        scale(
          [
            'I do not notice it changing',
            'I notice it after it has happened',
            'I can feel it turning',
            'I can name what moved it',
            'I can move it deliberately',
          ],
          ['tamas', 'rajas', 'sattva'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'sattva',
        label: 'Sattva',
        short: 'Clarity, light, and an easy seeing',
        description:
          'Clarity and lightness dominate: the mind is steady, the seeing is easy, and what is underneath a situation tends to arrive without being forced. This is the quality most practice is built to develop, and it is not an achievement — it is a state that arrives when the other two are not running the show.',
        shadow: 'Clarity used as a way of not being affected.',
        color: 'amber',
        masters: ['jnana', 'self-inquiry'],
        calibration: {
          dimensions: { spirit: 0.35, thought: 0.25, emotion: 0.15 },
          practiceLevels: { jnana: 1, 'self-inquiry': 1 },
          tags: ['clear', 'luminous'],
        },
      },
      {
        id: 'rajas',
        label: 'Rajas',
        short: 'Movement, heat, and a forward lean',
        description:
          'Movement and desire dominate: the mind wants to do, to achieve, to get somewhere. This is the engine of most lives and most careers, and it is not a flaw — it is how things get built. What it costs is the distance between stimulus and response, which gets shorter every time the engine is rewarded for going faster.',
        shadow: 'Movement that has forgotten where it is going.',
        color: 'orange',
        masters: ['karma', 'raja'],
        calibration: {
          dimensions: { action: 0.35, emotion: 0.25, body: 0.15 },
          practiceLevels: { karma: 1, raja: 1 },
          domainStress: { activity: 'karma' },
          tags: ['active', 'driven'],
        },
      },
      {
        id: 'tamas',
        label: 'Tamas',
        short: 'Weight, inertia, and a slow turning',
        description:
          'Stability and weight dominate: the mind resists change, the body resists movement, and the default state is rest. This is not a defect — it is the quality that holds everything else in place, and a life without any of it would have no continuity. What it costs is the distance between deciding and doing, which can become very large.',
        shadow: 'Inertia read as rest, and rest read as enough.',
        color: 'slate',
        masters: ['body', 'raja'],
        calibration: {
          dimensions: { body: 0.35, thought: 0.2, emotion: 0.15 },
          practiceLevels: { body: 1, raja: 1 },
          domainStress: { inertia: 'body' },
          tags: ['heavy', 'slow-moving'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'pancha-kosha',
    title: 'Pañca kośa',
    subtitle: 'The five layers of self',
    module: 'Observation',
    tradition: 'yogic',
    dimensionCategory: 'witness',
    coverEmoji: '🧅',
    estimatedMinutes: 7,
    version: 1,
    intro:
      'The Taittirīya Upaniṣad describes the self as five layers, each one wider than the last: the body, the breath, the mind, the knowing, and the bliss. They are not separate things — they are places where attention lands, and each one has its own texture and its own way of being noticed.\n\nThis asks which layer is most available to you right now, and which one is least. There is no prize at the far end of this one; the top layer is not better than the bottom, it is simply wider.',
    dimensions: ['annamaya', 'pranamaya', 'manomaya', 'vijnanamaya', 'anandamaya'],
    engineHooks: {
      loopsToCheck: ['over-thinking', 'avoidance-map'],
      practiceAffinity: ['body', 'breath', 'witnessing'],
      deepensWith: ['witness-capacity', 'sensory-awareness'],
    },
    questions: [
      q3(
        'kosha-body',
        'body',
        'How present is your body right now?',
        'How much of your attention is in the flesh?',
        'The outermost layer is the body, and it is the first place most people leave when attention gets busy. How much of yours is still here?',
        likert5('annamaya', [
          'I am barely aware of it',
          'I notice it when something draws my attention',
          'I am in it most of the time',
          'I am present in it, and it is not a problem',
          'I am at home here, and it stays that way',
        ]),
      ),
      q3(
        'kosha-breath',
        'breath',
        'How available is your breath?',
        'Can you feel it without changing it?',
        'The breath layer is the hinge between body and mind. It is the one most people can find without effort, and the one they most often manipulate without noticing. How honest is yours?',
        scale(
          [
            'I cannot feel it without thinking about it',
            'I can feel it, and it is shallow',
            'I can feel it, and follow it for a while',
            'It is easy to find and easy to follow',
            'It is always there, and I do not have to look',
          ],
          ['annamaya', 'pranamaya', 'manomaya', 'vijnanamaya', 'anandamaya'],
        ),
      ),
      q3(
        'kosha-mind',
        'mind',
        'How loud is your mind right now?',
        'How much of your attention is taken by thinking?',
        'The mind layer is the one that talks the most, and the one most people identify with. How much of your attention is currently in it?',
        scale(
          [
            'Quiet, and I can hear underneath',
            'Mostly quiet, with the odd noise',
            'Busy, but I can step back from it',
            'Loud, and I am caught in it',
            'I cannot hear anything else',
          ],
          ['pranamaya', 'manomaya', 'vijnanamaya', 'anandamaya'],
        ),
      ),
      q3(
        'kosha-witness',
        'witnessing',
        'How easily can you step back from your own thinking?',
        'What is the distance between you and your thoughts?',
        'The knowing layer is the one that can watch the mind. How wide is the gap between the watcher and the watched?',
        likert5('vijnanamaya', [
          'I cannot find a vantage point',
          'I can sometimes, when I remember',
          'I can usually step back',
          'I can watch without effort',
          'The watching is the larger part',
        ]),
      ),
      q3(
        'kosha-bliss',
        'bliss',
        'How often do you feel part of something larger?',
        'What is the width of your own edges?',
        'The top layer is not a feeling; it is the absence of edges. How often do you meet it?',
        scale(
          [
            'I rarely feel anything beyond myself',
            'Sometimes, without arranging it',
            'Often, and I can find it again',
            'It is ordinary, and I do not have to look',
            'It is always here, underneath the noise',
          ],
          ['manomaya', 'vijnanamaya', 'anandamaya'],
        ),
      ),
      q3(
        'kosha-shelter',
        'shelter',
        'Which layer do you retreat to when things get hard?',
        'Where do you go when you need comfort?',
        'Under pressure, attention runs to the layer that feels safest. Which one is yours?',
        pickOne(
          [
            'I withdraw into my body — sleep, food, comfort',
            'I hold my breath and narrow my focus',
            'I go into my mind — planning, analysing, rehearsing',
            'I step back and watch, and something settles',
            'I let go, and something wider holds me',
          ],
          ['annamaya', 'pranamaya', 'manomaya', 'vijnanamaya', 'anandamaya'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'annamaya',
        label: 'Annamaya',
        short: 'The body is the first word',
        description:
          'The outermost layer, the body, is where attention lives most of the time. This is not a failing — the body is the only honest layer, because it does not pretend to be anything else. What it means is that the mind is running mostly on physical input, and the layers above are not yet being consulted.',
        shadow: 'Treating the body as the whole of what is available.',
        color: 'slate',
        masters: ['body', 'breath'],
        calibration: {
          dimensions: { body: 0.4, emotion: 0.2, thought: 0.1 },
          practiceLevels: { body: 2, breath: 1 },
          domainStress: { physical: 'body' },
          tags: ['body-anchored', 'sensory'],
        },
      },
      {
        id: 'pranamaya',
        label: 'Prāṇamaya',
        short: 'The breath is the bridge',
        description:
          'The breath layer is the hinge between body and mind, and it is the one most people can find without instruction. It is also the one most people manipulate without noticing — they breathe to calm down rather than to find out what is actually there.',
        shadow: 'Using the breath to control rather than to feel.',
        color: 'sky',
        masters: ['breath', 'body'],
        calibration: {
          dimensions: { body: 0.3, emotion: 0.2, spirit: 0.2 },
          practiceLevels: { breath: 2, body: 1 },
          domainStress: { breath: 'breath' },
          tags: ['breath-anchored', 'transitional'],
        },
      },
      {
        id: 'manomaya',
        label: 'Manomaya',
        short: 'The mind is the talker',
        description:
          'The mind layer is where most people live, and it is a noisy place to live. The thinking is continuous, the self-narration never stops, and most decisions are made by the voice that is loudest rather than the one that is wisest.',
        shadow: 'Identifying with the thinking and not knowing it is happening.',
        color: 'orange',
        masters: ['witnessing', 'self-inquiry'],
        calibration: {
          dimensions: { thought: 0.4, emotion: 0.25, body: 0.1 },
          practiceLevels: { witnessing: 1, 'self-inquiry': 1 },
          domainStress: { mind: 'witnessing' },
          tags: ['mind-anchored', 'noisy'],
        },
      },
      {
        id: 'vijnanamaya',
        label: 'Vijñānamaya',
        short: 'The knowing is the watcher',
        description:
          'The knowing layer is the one that can stand back and watch the mind think. It is not the thoughts themselves — it is the part of you that knows there are thoughts, and can choose whether to follow them.',
        shadow: 'The watcher becoming another performer.',
        color: 'indigo',
        masters: ['witnessing', 'jnana'],
        calibration: {
          dimensions: { spirit: 0.3, thought: 0.25, emotion: 0.15 },
          practiceLevels: { witnessing: 2, jnana: 1 },
          domainStress: { knowing: 'jnana' },
          tags: ['witnessing', 'discriminating'],
        },
      },
      {
        id: 'anandamaya',
        label: 'Ānandamaya',
        short: 'The bliss is the absence of edges',
        description:
          'The top layer is not a feeling of happiness; it is the state of having no edges. It arrives when the other four have stopped running their separate shows, and it cannot be pursued — it can only be met when the noise has died down enough.',
        shadow: 'Chasing a feeling that only arrives when it is not being chased.',
        color: 'violet',
        masters: ['witnessing', 'bhakti'],
        calibration: {
          dimensions: { spirit: 0.45, connection: 0.2, emotion: 0.1 },
          practiceLevels: { witnessing: 2, bhakti: 1 },
          domainStress: { bliss: 'bhakti' },
          tags: ['bliss-anchored', 'edgeless'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'discipline-style',
    title: 'Discipline style',
    subtitle: 'How you sustain effort',
    module: 'Skills',
    tradition: 'yogic',
    dimensionCategory: 'practice',
    coverEmoji: '🏋️',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Discipline is not a single thing. Some people hold it in a structure; some find it in the doing itself; some need it to be shared; some need it to be felt in the body before it is real.\n\nThere is no correct style. What matters is whether the style you are using is the one that actually works for you, because using the wrong one produces a lot of effort and very little progress.',
    dimensions: ['structured', 'spontaneous', 'relational', 'somatic'],
    engineHooks: {
      loopsToCheck: ['drift', 'approval-seeking'],
      practiceAffinity: ['raja', 'karma', 'relationship'],
      deepensWith: ['practice-level-calibration', 'sankalpa-shakti'],
    },
    questions: [
      q3(
        'discipline-routine',
        'routine',
        'How do you hold a routine?',
        'What is your relationship to repetition?',
        'A routine is either a support or a trap depending on whether it serves the person or the person serves it. How is yours?',
        pickOne(
          [
            'I need a clear structure, or I drift',
            'I need it to feel fresh, or I get bored',
            'I need someone else in it, or I drop it',
            'I need to feel it in my body, or it is empty',
          ],
          ['structured', 'spontaneous', 'relational', 'somatic'],
        ),
      ),
      q3(
        'discipline-start',
        'starting',
        'What gets you started on something hard?',
        'How do you move from not doing to doing?',
        'Starting is not the same as continuing. What actually moves you from rest to effort?',
        scale(
          [
            'A plan, and a time, and a place',
            'A spark, and the willingness to follow it',
            'Someone else counting on me',
            'A feeling in the body that it is time',
          ],
          ['structured', 'spontaneous', 'relational', 'somatic'],
        ),
      ),
      q3(
        'discipline-sustain',
        'sustaining',
        'What keeps you going when it gets hard?',
        'How do you handle the part that is not pleasant?',
        'Sustaining is not enthusiasm; it is what arrives after enthusiasm has left. What is it?',
        scale(
          [
            'The structure holds, and I stay inside it',
            'The doing itself becomes interesting again',
            'I cannot let the other person down',
            'I can feel the shift, and I stay for it',
          ],
          ['structured', 'spontaneous', 'relational', 'somatic'],
        ),
      ),
      q3(
        'discipline-slips',
        'slips',
        'What happens when you miss a session?',
        'How do you handle the gap?',
        'A missed session is a small thing. How you handle it is a large thing, because it reveals whether the practice is yours or the structure\'s. Which is it?',
        likert5('structured', [
          'I lose the thread and do not go back',
          'I feel bad about it, and return with effort',
          'I pick it up again, and it is fine',
          'I notice the gap, and close it easily',
          'It does not matter — the practice is not the session',
        ]),
      ),
      q3(
        'discipline-feedback',
        'feedback',
        'How do you know practice is working?',
        'What tells you it is time to stay with something?',
        'Feedback is not always obvious. Some people feel it in the body; some feel it in the clarity afterwards; some need someone to tell them. Which one is yours?',
        pickOne(
          [
            'I track it — numbers, streaks, records',
            'I notice when something in me changes',
            'I hear it from someone who knows me',
            'I feel it in the body before I think it',
          ],
          ['structured', 'spontaneous', 'relational', 'somatic'],
        ),
      ),
      q3(
        'discipline-alone',
        'alone',
        'How do you practise when nobody is watching?',
        'What is your practice like when there is no audience?',
        'A practice that depends on being seen is a performance. One that does not is a practice. Which is yours?',
        scale(
          [
            'I need a schedule, or it does not happen',
            'I do it when the mood is right',
            'I do it because someone else is doing it',
            'I do it because the body needs it',
          ],
          ['structured', 'spontaneous', 'relational', 'somatic'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'structured',
        label: 'Structured',
        short: 'The frame does the work',
        description:
          'You hold discipline in a shape — a time, a place, a sequence — and the shape does the holding for you. The strength of this is reliability: practice becomes inevitable rather than optional. The risk is that the frame becomes the point, and the person inside it stops being consulted.',
        shadow: 'The structure replacing the inquiry.',
        color: 'slate',
        masters: ['raja', 'karma'],
        calibration: {
          dimensions: { action: 0.35, thought: 0.2, body: 0.15 },
          practiceLevels: { raja: 1, karma: 1 },
          domainStress: { routine: 'raja' },
          tags: ['structured', 'reliable'],
        },
      },
      {
        id: 'spontaneous',
        label: 'Spontaneous',
        short: 'The doing itself is the guide',
        description:
          'You hold discipline in the act of doing, and the doing has to feel alive or it stops. The strength is freshness: practice never becomes empty because it is always being found again. The risk is that it disappears whenever the mood does.',
        shadow: 'Waiting for the right feeling instead of finding it in the doing.',
        color: 'amber',
        masters: ['kriya', 'bhakti'],
        calibration: {
          dimensions: { spirit: 0.3, emotion: 0.25, action: 0.2 },
          practiceLevels: { kriya: 1, bhakti: 1 },
          domainStress: { spontaneity: 'kriya' },
          tags: ['alive', 'mood-dependent'],
        },
      },
      {
        id: 'relational',
        label: 'Relational',
        short: 'The other person makes it real',
        description:
          'You hold discipline in relationship, and practice is sustained by the presence of someone else who is also doing it. The strength is accountability: the other person keeps you honest without having to say anything. The risk is that the practice is theirs, not yours.',
        shadow: 'Practising for the other person instead of with them.',
        color: 'rose',
        masters: ['relationship', 'bhakti'],
        calibration: {
          dimensions: { connection: 0.35, emotion: 0.25, action: 0.15 },
          practiceLevels: { relationship: 1, bhakti: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['shared', 'other-anchored'],
        },
      },
      {
        id: 'somatic',
        label: 'Somatic',
        short: 'The body has to feel it first',
        description:
          'You hold discipline through the body, and practice is only real once it has been felt. The strength is honesty: you cannot fake your way past a body that knows the difference between going through the motions and being present. The risk is that the body is asked to do the mind\'s work.',
        shadow: 'Waiting for the body to feel ready instead of moving it.',
        color: 'teal',
        masters: ['body', 'breath'],
        calibration: {
          dimensions: { body: 0.4, emotion: 0.2, spirit: 0.15 },
          practiceLevels: { body: 2, breath: 1 },
          domainStress: { sensation: 'body' },
          tags: ['somatic', 'felt'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'sankalpa-shakti',
    title: 'Saṃkalpa śakti',
    subtitle: 'The power of resolve',
    module: 'Levels',
    tradition: 'yogic',
    dimensionCategory: 'action',
    coverEmoji: '🎯',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'A saṃkalpa is not a wish. It is a resolve that has been tested against enough noise to know it is still there when the noise has passed. Most people have had many wishes and very few saṃkalpas, because a resolve has to survive contact with reality — and most wishes do not.\n\nFour positions are described here. The reading is not a verdict on your willpower; it is a description of how clearly the thing you want has been separated from the things you think you want.',
    dimensions: ['diffuse', 'forming', 'clear', 'held'],
    engineHooks: {
      loopsToCheck: ['drift', 'approval-seeking'],
      practiceAffinity: ['raja', 'jnana', 'karma'],
      deepensWith: ['inner-compass', 'work-dharma'],
    },
    questions: [
      q3(
        'sankalpa-clarity',
        'clarity',
        'How clear is the thing you want?',
        'Can you name it without explaining it?',
        'Clarity is not certainty. It is the ability to say what you want in a sentence that does not need a footnote. How clear is yours?',
        scale(
          [
            'I have a general sense, but not a specific one',
            'I know the area, but not the thing itself',
            'I can name it, but I keep changing the wording',
            'I know it, and the wording does not change',
          ],
          ['diffuse', 'forming', 'clear', 'held'],
        ),
      ),
      q3(
        'sankalpa-noise',
        'noise',
        'How much of what you want is actually yours?',
        'How much of it came from somewhere else?',
        'A wish that came from somewhere else will not survive first contact with difficulty. How much of yours would survive?',
        likert5('forming', [
          'Almost none of it is mine',
          'Some of it, in places',
          'Most of it, with a few borrowed parts',
          'Nearly all of it, and I have checked',
          'All of it — I have signed for every part',
        ]),
      ),
      q3(
        'sankalpa-endurance',
        'endurance',
        'How long has the thing you want lasted?',
        'How many times has it survived being looked at?',
        'A resolve that has not been tested is a wish in fancy dress. How many tests has yours passed?',
        scale(
          [
            'It comes and goes with the day',
            'It has lasted a few weeks, at most',
            'It has lasted months, and survived some scrutiny',
            'It has lasted, and I have defended it against noise',
            'It has lasted, and it has become part of how I decide',
          ],
          ['diffuse', 'forming', 'clear', 'held'],
        ),
      ),
      q3(
        'sankalpa-conflict',
        'conflict',
        'What happens when the resolve costs you something?',
        'How do you handle the price of wanting it?',
        'The test of a resolve is not whether it survives agreement; it is whether it survives the moment it asks for something real. How does yours behave then?',
        pickOne(
          [
            'I let it go, and decide it was not that important',
            'I hesitate, and then come back to it',
            'I hold it, but I bargain around the edges',
            'I pay the price, and the resolve gets stronger',
          ],
          ['diffuse', 'forming', 'clear', 'held'],
        ),
      ),
      q3(
        'sankalpa-source',
        'source',
        'Where does the wanting come from?',
        'What part of you is asking for it?',
        'A resolve that comes from the whole of you is different from one that comes from a single part. Which one is yours?',
        scale(
          [
            'I do not know — it just arrives',
            'It comes from a part of me I am still getting to know',
            'It comes from the part of me that has been consistent',
            'It comes from the part of me that knows what matters',
          ],
          ['diffuse', 'forming', 'clear', 'held'],
        ),
      ),
      q3(
        'sankalpa-action',
        'action',
        'How much of your life is organised around this resolve?',
        'What would someone looking at your days see?',
        'A held resolve is not a thought; it is a shape in the days. What shape is yours making?',
        scale(
          [
            'None — it is something I think about sometimes',
            'Some of it — it shows up in small decisions',
            'Most of it — the days bend toward it',
            'All of it — the days are built around it',
          ],
          ['diffuse', 'forming', 'clear', 'held'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'diffuse',
        label: 'Diffuse',
        short: 'There is wanting, and no shape to it',
        description:
          'Wanting is present but has no specific form. This is not a problem — most people start here, and the first move is simply noticing that there is something to be shaped. What makes it hard to work with is that a diffuse want behaves like a mood: it arrives, it fades, and it returns without ever being named.',
        shadow: 'Treating the return of the want as evidence of its importance.',
        color: 'slate',
        masters: ['self-inquiry', 'jnana'],
        calibration: {
          dimensions: { thought: 0.25, emotion: 0.25, spirit: 0.15 },
          practiceLevels: { 'self-inquiry': 1, jnana: 1 },
          tags: ['diffuse', 'unnamed'],
        },
      },
      {
        id: 'forming',
        label: 'Forming',
        short: 'The shape is becoming visible',
        description:
          'The resolve is becoming legible. It has survived a few contacts with reality and is starting to hold its shape. The work here is not more wishing but more checking — each time it is looked at honestly, it becomes clearer.',
        shadow: 'Naming it early and stopping there.',
        color: 'amber',
        masters: ['jnana', 'raja'],
        calibration: {
          dimensions: { thought: 0.3, action: 0.2, spirit: 0.2 },
          practiceLevels: { jnana: 1, raja: 1 },
          domainStress: { formation: 'jnana' },
          tags: ['forming', 'clarifying'],
        },
      },
      {
        id: 'clear',
        label: 'Clear',
        short: 'It can be said plainly',
        description:
          'The resolve is specific enough to be stated, defended, and acted on. It is no longer a mood or a wish — it is a direction. The test of clarity is not whether it feels good; it is whether it survives the first real cost.',
        shadow: 'Clarity becoming rigidity.',
        color: 'sky',
        masters: ['raja', 'jnana'],
        calibration: {
          dimensions: { thought: 0.35, action: 0.25, spirit: 0.15 },
          practiceLevels: { raja: 1, jnana: 1 },
          domainStress: { clarity: 'raja' },
          tags: ['clear', 'directed'],
        },
      },
      {
        id: 'held',
        label: 'Held',
        short: 'It has become part of the architecture',
        description:
          'The resolve is no longer something maintained; it is something lived. It shows up in decisions without being announced, and it survives difficulty without needing to be defended. This is the point at which wanting becomes being.',
        shadow: 'The resolve hardening into an identity that cannot be questioned.',
        color: 'emerald',
        masters: ['karma', 'raja'],
        calibration: {
          dimensions: { action: 0.35, spirit: 0.25, thought: 0.15 },
          practiceLevels: { karma: 1, raja: 1 },
          domainStress: { holding: 'karma' },
          tags: ['held', 'embodied'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'klesha-map',
    title: 'Kleśa map',
    subtitle: 'The five afflictions',
    module: 'Loops',
    tradition: 'vedic',
    dimensionCategory: 'shadow',
    coverEmoji: '🕸️',
    estimatedMinutes: 7,
    version: 1,
    intro:
      'Patañjali lists five afflictions that are not faults but structures: avidyā, the not-knowing at the root; asmita, the I-making that turns everything into a performance; rāga, the pulling toward what is pleasant; dveṣa, the pushing away from what is not; and abhiniveśa, the clinging to life that is really clinging to the known.\n\nThis is an inventory, not a diagnosis. Nothing here assigns blame, and nothing here predicts what happens next. The useful version of this is a list you could actually read aloud.',
    dimensions: ['avidya', 'asmita', 'raga', 'dvesha', 'abhinivesha'],
    engineHooks: {
      loopsToCheck: ['projection', 'self-criticism', 'reactivity'],
      practiceAffinity: ['loop-dissolution', 'witnessing', 'self-inquiry'],
      deepensWith: ['shadow-inventory', 'vasana-map'],
    },
    questions: [
      q3(
        'klesha-not-knowing',
        'not knowing',
        'How much of what you believe have you actually tested?',
        'What is the evidence for the things you hold as certain?',
        'Avidyā is not ignorance; it is certainty that has never been examined. How much of yours has been?',
        scale(
          [
            'Almost none of it — I hold it because it feels true',
            'Some of it, in the areas I have questioned',
            'Most of it, and I have revised a good deal',
            'I question what I believe as a matter of course',
            'I hold very little as certain, and I am comfortable there',
          ],
          ['avidya', 'asmita', 'raga', 'dvesha', 'abhinivesha'],
        ),
      ),
      q3(
        'klesha-identity',
        'identity',
        'How much of what you do is about maintaining an image?',
        'What is the performance for, and who is the audience?',
        'Asmita is the I-making that turns everything into a performance — a decision, a relationship, a practice, even a crisis. How much of your day is running for an audience that may not exist?',
        likert5('asmita', [
          'Almost none — I am not performing',
          'Some of it, in situations that matter',
          'A fair amount, and I notice afterwards',
          'Most of it, and I usually do not notice',
          'All of it — I cannot stop performing even when I want to',
        ]),
      ),
      q3(
        'klesha-clinging',
        'clinging',
        'What do you reach for when you feel empty?',
        'What is the first thing you do when something is missing?',
        'Rāga is the pulling toward what is pleasant, and it is most visible not in enjoyment but in the moment something pleasant is taken away. What do you do then?',
        scale(
          [
            'I reach for comfort — food, screens, company',
            'I reach for something to occupy me',
            'I reach for a practice or a routine',
            'I sit with the emptiness and watch it',
            'I do not reach — I let it arrive and leave',
          ],
          ['avidya', 'asmita', 'raga', 'dvesha', 'abhinivesha'],
        ),
      ),
      q3(
        'klesha-aversion',
        'aversion',
        'What do you push away when it gets uncomfortable?',
        'How do you handle what you do not want?',
        'Dveṣa is not dislike; it is the active pushing away, the refusal to be in the presence of what is unpleasant. What is your standard response?',
        scale(
          [
            'I leave, and I do not go back',
            'I think about it constantly, but I do not face it',
            'I face it when I have to, but I avoid it otherwise',
            'I face it, and I stay until it shifts',
            'I can be with it, and it does not control me',
          ],
          ['avidya', 'asmita', 'raga', 'dvesha', 'abhinivesha'],
        ),
      ),
      q3(
        'klesha-clinging-life',
        'clinging to life',
        'How afraid are you of ending?',
        'What is your relationship to the fact that this ends?',
        'Abhiniveśa is not fear of death; it is the clinging to the known, which is what makes ending feel like a threat. How much of your resistance to change is actually this?',
        likert5('abhinivesha', [
          'I do not think about it',
          'It crosses my mind sometimes, and I push it away',
          'I think about it, and I am uneasy',
          'I have looked at it, and it still costs me',
          'I am familiar with it, and it does not control me',
        ]),
      ),
      q3(
        'klesha-pattern',
        'pattern',
        'Which of these five do you recognise most clearly in yourself?',
        'Which one is doing the most work in your life right now?',
        'The kleśas are not separate; they run together, and the one you notice first is usually the one that is most visible from the outside. Which one is that for you?',
        pickOne(
          [
            'I do not know what is true, and I am sure of it',
            'I am performing, and I cannot stop',
            'I want things, and I suffer when I cannot have them',
            'I push things away, and I am tired of the pushing',
            'I cling to what I know, and I am afraid of what I do not',
          ],
          ['avidya', 'asmita', 'raga', 'dvesha', 'abhinivesha'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'avidya',
        label: 'Avidyā',
        short: 'The not-knowing at the root',
        description:
          'Not-knowing is the root of everything else. It is not a lack of information; it is certainty that has never been tested, a structure of belief that runs life without being noticed. The work here is not to become clever but to become curious about what has never been questioned.',
        shadow: 'Treating not-knowing as knowledge.',
        color: 'slate',
        masters: ['jnana', 'self-inquiry'],
        calibration: {
          dimensions: { thought: 0.4, spirit: 0.2, emotion: 0.15 },
          practiceLevels: { jnana: 2, 'self-inquiry': 1 },
          domainStress: { knowing: 'jnana' },
          tags: ['not-knowing', 'unquestioned'],
        },
      },
      {
        id: 'asmita',
        label: 'Asmitā',
        short: 'The I-making that runs everything',
        description:
          'I-making turns every event into a performance and every relationship into a transaction of regard. It is not vanity; it is the structure of identity, which is built from other people\'s responses. The work is not to destroy the identity but to see it operating.',
        shadow: 'The watcher becoming another performer.',
        color: 'orange',
        masters: ['witnessing', 'loop-dissolution'],
        calibration: {
          dimensions: { connection: 0.3, thought: 0.25, emotion: 0.2 },
          practiceLevels: { witnessing: 2, 'loop-dissolution': 1 },
          domainStress: { identity: 'witnessing' },
          tags: ['identity-making', 'performing'],
        },
      },
      {
        id: 'raga',
        label: 'Rāga',
        short: 'The pulling toward what is pleasant',
        description:
          'Pulling is not desire; it is the structure of wanting, which turns every pleasant thing into a necessity and every absence into a suffering. The work is not to stop wanting but to see the structure of the wanting, because the structure is where the suffering lives.',
        shadow: 'Wanting becoming a way of not being present.',
        color: 'rose',
        masters: ['emotional-healing', 'witnessing'],
        calibration: {
          dimensions: { emotion: 0.4, connection: 0.2, body: 0.15 },
          practiceLevels: { 'emotional-healing': 1, witnessing: 1 },
          domainStress: { wanting: 'emotional-healing' },
          tags: ['wanting', 'clinging'],
        },
      },
      {
        id: 'dvesha',
        label: 'Dveṣa',
        short: 'The pushing away from what is not',
        description:
          'Pushing is the other half of pulling, and it is more expensive because it runs constantly. Every unpleasant thing is refused, every difficult person is avoided, every uncomfortable feeling is pushed down — and the energy of the pushing is larger than the energy of the thing being pushed.',
        shadow: 'Pushing away what is actually needed.',
        color: 'amber',
        masters: ['loop-dissolution', 'witnessing'],
        calibration: {
          dimensions: { emotion: 0.35, action: 0.2, body: 0.15 },
          practiceLevels: { 'loop-dissolution': 2, witnessing: 1 },
          domainStress: { aversion: 'loop-dissolution' },
          tags: ['aversive', 'pushing'],
        },
      },
      {
        id: 'abhinivesha',
        label: 'Abhiniveśa',
        short: 'The clinging to the known',
        description:
          'Clinging is not fear of death; it is fear of the unknown, which is what makes every change feel like a threat. It runs underneath everything else, and it is the hardest to see because it feels like common sense. The work is not to become brave but to see how much of the resistance is actually this.',
        shadow: 'Safety read as wisdom.',
        color: 'teal',
        masters: ['self-inquiry', 'jnana'],
        calibration: {
          dimensions: { spirit: 0.3, thought: 0.25, emotion: 0.2 },
          practiceLevels: { 'self-inquiry': 1, jnana: 1 },
          domainStress: { clinging: 'self-inquiry' },
          tags: ['clinging', 'fear-of-unknown'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'vasana-map',
    title: 'Vāsanā map',
    subtitle: 'The habits that run underneath',
    module: 'Loops',
    tradition: 'vedic',
    dimensionCategory: 'shadow',
    coverEmoji: '🔄',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'A vāsanā is a groove worn by repetition — not a habit in the ordinary sense, but a channel so worn that the mind falls into it without deciding to. Most of what runs a life is vāsanā: the way the day starts, the way a disagreement ends, the way the mind reacts to a particular tone of voice.\n\nThis asks how much of yours is visible to you. There is no prize at the far end of this one; the reading is a description of how much of your own machinery you can see, and that is the only variable that decides what can be changed.',
    dimensions: ['active', 'recurring', 'recognised', 'releasing'],
    engineHooks: {
      loopsToCheck: ['reactivity', 'approval-seeking', 'inherited-pattern'],
      practiceAffinity: ['loop-dissolution', 'witnessing'],
      deepensWith: ['klesha-map', 'shadow-inventory'],
    },
    questions: [
      q3(
        'vasana-visible',
        'visible',
        'How many of your own patterns can you actually name?',
        'How much of your machinery is visible to you?',
        'A pattern you can name is a pattern you can work with. How many of yours can you name?',
        scale(
          [
            'I cannot name any',
            'One, if I think about it',
            'A handful, and I know them roughly',
            'Most of them, and I can describe them',
            'All of them, and I have worked on several',
          ],
          ['active', 'recurring', 'recognised', 'releasing'],
        ),
      ),
      q3(
        'vasana-trigger',
        'trigger',
        'What triggers your most automatic response?',
        'What is the input that gets you before you have decided?',
        'Every vāsanā has a trigger — a tone of voice, a situation, a time of day. How legible is yours to you?',
        scale(
          [
            'I do not notice the trigger until afterwards',
            'I notice something has happened, but not what',
            'I can name the trigger while it is running',
            'I can see it coming, and I can choose',
          ],
          ['active', 'recurring', 'recognised', 'releasing'],
        ),
      ),
      q3(
        'vasana-interrupt',
        'interruption',
        'What can actually interrupt an automatic pattern?',
        'What has ever stopped a sequence that was already running?',
        'Interruption is only possible from somewhere you can see. How many points in your own sequences can you actually reach?',
        scale(
          [
            'Nothing does, and I have stopped expecting it to',
            'Something external sometimes stops it',
            'I can sometimes catch it in time',
            'I can usually find the off switch',
            'I can interrupt it before it starts',
          ],
          ['active', 'recurring', 'recognised', 'releasing'],
        ),
      ),
      q3(
        'vasana-recognition',
        'recognition',
        'How quickly do you recognise a pattern in yourself?',
        'How long is the lag between the event and the knowing?',
        'The lag is the whole of the vāsanā mechanism. How long is yours?',
        likert5('recognised', [
          'I never recognise it until afterwards',
          'Hours, if ever',
          'Usually within the day',
          'Usually while it is happening',
          'Usually before it starts',
        ]),
      ),
      q3(
        'vasana-source',
        'source',
        'Where did the pattern come from?',
        'Can you trace it back to where it was installed?',
        'A vāsanā is installed by repetition, usually early, and the installation is rarely witnessed. How far back can you trace yours?',
        scale(
          [
            'I have no idea where it came from',
            'I suspect it came from somewhere early',
            'I can see it was learned from someone',
            'I can see the exact situation where it was installed',
            'I have traced it, and I understand the mechanism',
          ],
          ['active', 'recurring', 'recognised', 'releasing'],
        ),
      ),
      q3(
        'vasana-cost',
        'cost',
        'How much does the pattern cost you?',
        'What does it take from you every time it runs?',
        'Every groove in the mind has a cost — time, relationship, energy, self-respect. How much is yours paying?',
        scale(
          [
            'I do not think it costs anything',
            'A little, but it is not important',
            'A noticeable amount, and I have felt it',
            'A great deal, and I have counted it',
            'I have counted it, and I have started to change it',
          ],
          ['active', 'recurring', 'recognised', 'releasing'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'active',
        label: 'Active',
        short: 'It runs, and you do not see it',
        description:
          'The pattern is running and you are inside it. This is the most honest position, because it admits that the machinery is operating without consent — which is the condition of every vāsanā before it is seen.',
        shadow: 'Reading the absence of a map as the absence of a pattern.',
        color: 'slate',
        masters: ['witnessing', 'observation'],
        calibration: {
          dimensions: { thought: 0.3, emotion: 0.2, body: 0.15 },
          practiceLevels: { witnessing: 1, observation: 1 },
          domainStress: { unseen: 'witnessing' },
          tags: ['unseen', 'running'],
        },
      },
      {
        id: 'recurring',
        label: 'Recurring',
        short: 'You see it afterwards, and it returns',
        description:
          'The pattern is visible in hindsight but not in time. It returns without being invited, and the recognition usually arrives after the event has finished. This is the position most people are in for most of their adult lives.',
        shadow: 'Analysing the pattern instead of catching it.',
        color: 'orange',
        masters: ['witnessing', 'loop-dissolution'],
        calibration: {
          dimensions: { thought: 0.25, emotion: 0.25, spirit: 0.15 },
          practiceLevels: { witnessing: 1, 'loop-dissolution': 1 },
          domainStress: { recurrence: 'loop-dissolution' },
          tags: ['recurring', 'retrospective'],
        },
      },
      {
        id: 'recognised',
        label: 'Recognised',
        short: 'You can name it while it runs',
        description:
          'The pattern is legible while it is happening, which is the point at which it stops being a mood and becomes material. Recognition does not stop the pattern — it makes it available to work with, which is a different thing entirely.',
        shadow: 'Naming the pattern and mistaking the name for the change.',
        color: 'amber',
        masters: ['loop-dissolution', 'self-inquiry'],
        calibration: {
          dimensions: { thought: 0.3, spirit: 0.2, emotion: 0.15 },
          practiceLevels: { 'loop-dissolution': 2, 'self-inquiry': 1 },
          tags: ['recognised', 'named'],
        },
      },
      {
        id: 'releasing',
        label: 'Releasing',
        short: 'You can choose not to follow it',
        description:
          'The pattern is visible, and something in you can choose not to follow it. This is not the same as the pattern being gone — vāsanās do not disappear, they become less compelling. The release is the moment between the trigger and the response, and it gets wider with practice.',
        shadow: 'Treating an occasional release as the pattern being finished.',
        color: 'emerald',
        masters: ['loop-dissolution', 'witnessing'],
        calibration: {
          dimensions: { spirit: 0.3, action: 0.2, thought: 0.2 },
          practiceLevels: { 'loop-dissolution': 2, witnessing: 1 },
          domainStress: { release: 'loop-dissolution' },
          tags: ['releasing', 'choosing'],
        },
      },
    ],
  },
];
