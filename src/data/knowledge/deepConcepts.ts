// Gold set — Phase 1 deep concepts.
//
// These are hand-authored, fully specified records that define the quality bar
// for every later generated batch. The set deliberately starts with the
// questions users actually ask: why a sleeper cannot meditate, what the gut
// brain is, why attention collapses, and how to tell whether anything changed.

import type { DeepConcept } from '@/types/knowledgeConcept';

export const DEEP_CONCEPTS: DeepConcept[] = [
  {
    id: 'deep:sleeper-cannot-meditate',
    name: 'Why a Sleeper Cannot Meditate',
    family: 'mechanism',
    domain: 'consciousness',
    definition:
      'A chronically under-rested nervous system cannot hold attention on purpose, so the first meditation attempt reads as failure rather than as a sleep problem wearing a practice costume.',
    mechanism: [
      'Short sleep raises adenosine and homeostatic sleep pressure through the day.',
      'Prefrontal control of attention weakens while limbic reactivity rises.',
      'The first quiet moment lets sleep pressure surface, producing heaviness and thought drift.',
      'The person interprets the drift as "I am bad at meditation" instead of "I am sleep deprived".',
      'Effort increases, arousal rises, and the sitting ends in frustration rather than rest.',
    ],
    whyItHappens:
      'Meditation asks for stable, voluntary attention. That capacity is the first thing sleep loss degrades, so the practice is being attempted with the exact resource it requires.',
    signs: [
      'Falling asleep within the first three minutes of sitting',
      'Heaviness behind the eyes and jaw rather than mental agitation',
      'Strong guilt after each session rather than curiosity',
      'Better focus in the evening than in the morning',
    ],
    counterExample:
      'This is not laziness or a lack of discipline, and it is not "resistance from the ego". A rested beginner typically reports drift they can notice; a sleep-deprived beginner reports a gap in memory of the sit.',
    practice: {
      name: 'Sleep-first protocol',
      dose: '7 nights of 7.5+ hours before any 20-minute sitting; 3-minute breathing space meanwhile',
      instructions:
        'For one week, replace long sits with three one-minute breath observations during the day. Protect sleep as the primary practice. Only then extend the sitting.',
    },
    measure: 'Morning refreshment score (1–5) and whether you remember the middle of the sit.',
    citations: [
      { label: 'Walker, Why We Sleep (2017)', kind: 'text', note: 'Sleep loss and prefrontal attention control' },
      { label: 'Tang, Hölzel & Posner, Nature Reviews Neuroscience (2015)', kind: 'research' },
      { label: 'Yoga Sutra 1.2 — citta-vrtti-nirodha', kind: 'tradition' },
    ],
    relations: [
      { type: 'CAUSES', target: 'deep:sleep-debt-attention' },
      { type: 'REQUIRES', target: 'deep:restlessness-signal' },
      { type: 'CONTRADICTS', target: 'deep:effort-paradox' },
    ],
    bandFit: { min: 0, max: 4, note: 'Most common at bands 0–2 where sleep is the binding constraint.' },
    caution: 'Persistent insomnia or daytime sleepiness needs clinical attention, not a meditation adjustment.',
    confidence: 0.86,
    reviewStatus: 'reviewed',
    aliases: ['cannot meditate', 'sleepy meditation', 'falling asleep while meditating'],
  },
  {
    id: 'deep:sleep-debt-attention',
    name: 'Sleep Debt and the Attention System',
    family: 'physiology',
    domain: 'body',
    definition:
      'Accumulated sleep loss reduces sustained attention and increases reaction variability long before a person feels sleepy, which is why intention alone cannot restore focus.',
    mechanism: [
      'Each short night adds homeostatic sleep pressure that is not fully repaid by one long night.',
      'Adenosine clearance and circadian timing drift apart, flattening the alerting signal.',
      'Vigilance tasks show more lapses and more variable response times.',
      'Self-rating of alertness adapts to the deficit, so the person reports feeling "fine".',
    ],
    whyItHappens:
      'The brain prioritises immediate survival tasks over optional sustained attention. Under debt, anything effortful is defunded first.',
    signs: [
      'Micro-sleeps while reading or listening',
      'Focus that arrives late and leaves early',
      'Caffeine changes the day shape but not the deficit',
      'Weekend recovery sleep longer than two hours',
    ],
    counterExample: 'Sleep debt is not the same as feeling tired; subjective alertness normalises while performance stays impaired.',
    practice: {
      name: 'Two-week repayment',
      dose: 'Nightly 8 hours for 14 days, fixed wake time',
      instructions: 'Anchor wake time, move bedtime earlier by 30 minutes every three nights, and keep a one-line morning alertness rating.',
    },
    measure: 'Reaction-time variability on a 2-minute test, plus morning alertness averaged weekly.',
    citations: [
      { label: 'Van Dongen et al., Sleep (2003)', kind: 'research', note: 'Dose-response of sleep loss on vigilance' },
      { label: 'Walker, Why We Sleep (2017)', kind: 'text' },
    ],
    relations: [
      { type: 'CAUSES', target: 'deep:sleeper-cannot-meditate' },
      { type: 'MEASURED_BY', target: 'deep:sleep-efficiency' },
      { type: 'REQUIRES', target: 'deep:attention-span-collapse' },
    ],
    bandFit: { min: 0, max: 5 },
    confidence: 0.88,
    reviewStatus: 'verified',
    aliases: ['sleep deprivation', 'sleep debt'],
  },
  {
    id: 'deep:dmn-overactivity',
    name: 'Default Mode Network Overactivity',
    family: 'physiology',
    domain: 'neuroscience',
    definition:
      'The default mode network is the brain system that narrates self-referential thought when nothing else demands attention; when it is overactive, rest feels like rumination instead of quiet.',
    mechanism: [
      'Task-positive networks disengage when the environment is quiet.',
      'The default mode network activates and generates autobiographical, future-oriented thought.',
      'The medial prefrontal and posterior cingulate loop reinforces self-referential content.',
      'Attention is captured by the narrative rather than the breath or body.',
      'Repeated capture trains the same loop, making stillness feel unsafe.',
    ],
    whyItHappens:
      'The network is not a fault; it is the brain filling unstructured time with planning and self-model maintenance. Problems appear when it cannot disengage.',
    signs: [
      'Planning conversations that will never happen',
      'Rehearsing past embarrassments during rest',
      'A sense of a narrator commenting on everything',
      'Relief when a task finally distracts you',
    ],
    counterExample:
      'Quieting the default mode network is not the same as suppressing thought. Thought continues; the grip of self-referential commentary loosens.',
    practice: {
      name: 'Sensory anchoring',
      dose: '10 minutes daily, alternate sound and contact points',
      instructions: 'Name three sounds, then three physical contact points, then return to the breath. Repeat the cycle eight times.',
    },
    measure: 'Count of spontaneous self-referential trains noticed per sit, and time to return after noticing.',
    citations: [
      { label: 'Raichle et al., PNAS (2001)', kind: 'research', note: 'Default mode network description' },
      { label: 'Brewer et al., PNAS (2011)', kind: 'research', note: 'DMN activity in experienced meditators' },
      { label: 'Yoga Sutra 1.2', kind: 'tradition' },
    ],
    relations: [
      { type: 'CAUSES', target: 'deep:boredom-spike' },
      { type: 'SUPPORTS', target: 'deep:witness-gap' },
      { type: 'ASSOCIATED_WITH', target: 'deep:no-thoughts-myth' },
    ],
    bandFit: { min: 1, max: 7 },
    confidence: 0.84,
    reviewStatus: 'reviewed',
    aliases: ['DMN', 'default network', 'mind wandering network'],
  },
  {
    id: 'deep:attention-span-collapse',
    name: 'Attention Span Collapse',
    family: 'mechanism',
    domain: 'mind',
    definition:
      'Short continuous attention is a trained state, not a fixed trait: frequent context switching lowers the cost of interruption until sustained focus feels effortful and unnatural.',
    mechanism: [
      'Rapid switching repeatedly rewards novelty-seeking.',
      'The brain learns that any discomfort can be escaped within seconds.',
      'Tolerance for the early discomfort of focus drops.',
      'Sitting still becomes aversive before the practice even begins.',
      'The person concludes they lack the capacity rather than the training.',
    ],
    whyItHappens:
      'Attention follows the cheapest available reward. A device-rich environment keeps the cheapest reward one gesture away.',
    signs: [
      'Checking the phone within the first minute of a sit',
      'Restlessness that peaks before any real mental content appears',
      'Long practice history with no increase in sit length',
      'Preference for 3-minute sessions over 20-minute ones indefinitely',
    ],
    counterExample:
      'This is not attention deficit as a clinical category. It is a reversible training effect that looks identical at the start of retraining.',
    practice: {
      name: 'Progressive sit ladder',
      dose: 'Add 2 minutes every 5 days, starting at 5 minutes',
      instructions: 'Sit with the phone in another room. End on time even if restless. Log the last stable minute.',
    },
    measure: 'Longest distraction-free stretch per sit, tracked weekly.',
    citations: [
      { label: 'Killingsworth & Gilbert, Science (2010)', kind: 'research', note: 'Mind wandering and unhappiness' },
      { label: 'Tang, Hölzel & Posner, Nature Reviews Neuroscience (2015)', kind: 'research' },
    ],
    relations: [
      { type: 'CAUSES', target: 'deep:boredom-spike' },
      { type: 'ASSOCIATED_WITH', target: 'deep:phone-pull-loop' },
      { type: 'REQUIRES', target: 'deep:sleep-debt-attention' },
    ],
    bandFit: { min: 0, max: 4 },
    confidence: 0.8,
    reviewStatus: 'reviewed',
    aliases: ['short attention span', 'can not focus', 'focus collapse'],
  },
  {
    id: 'deep:gut-brain-axis',
    name: 'The Gut-Brain Axis',
    family: 'physiology',
    domain: 'body',
    definition:
      'The gut and brain exchange continuous signals through the vagus nerve, immune messengers and microbial metabolites, so digestive state shapes mood and mood shapes digestion.',
    mechanism: [
      'The enteric nervous system maintains a dense local network in the gut wall.',
      'Vagal afferents carry gut state upward; a smaller vagal efferent path carries brain state downward.',
      'Microbial fermentation products and immune signals modulate that traffic.',
      'Interoceptive maps in the brain update the felt sense of the body.',
      'Altered gut signalling shifts threat appraisal and emotional reactivity.',
    ],
    whyItHappens:
      'The body models the gut as a frontier organ: it must report threats early, and it uses the fastest available channel.',
    signs: [
      'Mood that tracks meals more than events',
      'Anxiety felt as stomach tightness before it is felt as thought',
      'Bloating or appetite change during stressful weeks',
      'Relief after slow exhale but not after distraction',
    ],
    counterExample:
      'The gut is not a second brain that makes decisions on its own. It is a signalling partner; the story built around a signal is still learned.',
    practice: {
      name: 'Post-meal interoceptive check',
      dose: '2 minutes after each main meal, for 10 days',
      instructions: 'Sit, breathe slowly, and rate warmth, tightness and ease in the abdomen from 0 to 5. Note mood on the same scale.',
    },
    measure: 'Correlation between abdominal ease rating and mood rating across ten days.',
    citations: [
      { label: 'Mayer, Gut-Brain Axis (2016)', kind: 'text' },
      { label: 'Cryan et al., Physiological Reviews (2019)', kind: 'research' },
      { label: 'Taittiriya Upanishad — five sheaths', kind: 'tradition' },
    ],
    relations: [
      { type: 'ASSOCIATED_WITH', target: 'deep:interoception' },
      { type: 'ASSOCIATED_WITH', target: 'deep:vagal-tone' },
      { type: 'CONTRADICTS', target: 'deep:gut-feeling-myth' },
    ],
    bandFit: { min: 0, max: 7 },
    caution: 'Persistent digestive symptoms need medical assessment; this is an explanatory model, not a diagnostic one.',
    confidence: 0.82,
    reviewStatus: 'reviewed',
    aliases: ['gut brain', 'second brain', 'enteric nervous system'],
  },
  {
    id: 'deep:vagal-tone',
    name: 'Vagal Tone',
    family: 'physiology',
    domain: 'body',
    definition:
      'Vagal tone is the resting strength of parasympathetic control over the heart, and it sets how quickly the body can return to baseline after arousal.',
    mechanism: [
      'The vagus nerve continuously brakes heart rate at rest.',
      'Slow exhale increases vagal braking; fast inhale releases it.',
      'Higher resting tone produces faster recovery after stress.',
      'Recovery speed feeds back into perceived safety.',
      'Perceived safety lowers the threshold for entering restful states.',
    ],
    whyItHappens:
      'Recovery is cheaper than prevention. The nervous system invests in a brake that can be applied quickly rather than in avoiding all arousal.',
    signs: [
      'Heart rate drops noticeably within one slow exhale',
      'Return to calm within minutes rather than hours',
      'Steady voice and breathing under mild pressure',
      'Sleep onset that does not require exhaustion',
    ],
    counterExample:
      'High vagal tone is not constant calm. It is fast recovery, which looks identical to calm only when nothing is happening.',
    practice: {
      name: 'Extended exhale',
      dose: '5 minutes daily, exhale twice as long as inhale',
      instructions: 'Inhale for 4 counts, exhale for 8, without breath retention. Stop if dizzy.',
    },
    measure: 'Heart-rate recovery time after a 30-second cold splash or a short effort.',
    citations: [
      { label: 'Porges, Polyvagal Theory (2011)', kind: 'text' },
      { label: 'Laborde et al., Frontiers in Psychology (2017)', kind: 'research' },
      { label: 'Hatha Yoga Pradipika — pranayama', kind: 'tradition' },
    ],
    relations: [
      { type: 'SUPPORTS', target: 'deep:breathing-4-7-8' },
      { type: 'MEASURED_BY', target: 'deep:hrv' },
      { type: 'ASSOCIATED_WITH', target: 'deep:gut-brain-axis' },
    ],
    bandFit: { min: 0, max: 8 },
    caution: 'Breath retention is not part of this practice and is not advised for cardiovascular conditions.',
    confidence: 0.8,
    reviewStatus: 'reviewed',
    aliases: ['parasympathetic tone', 'vagus', 'vagal braking'],
  },
  {
    id: 'deep:interoception',
    name: 'Interoception',
    family: 'physiology',
    domain: 'body',
    definition:
      'Interoception is the sense of the body’s internal state, and its accuracy decides whether an emotion is felt as sensation or only as a story.',
    mechanism: [
      'Receptors report heart rate, breath, temperature, gut and muscle state.',
      'Signals travel to insular and cingulate maps.',
      'The brain predicts what those signals mean before they arrive.',
      'Prediction error updates the felt sense of the body.',
      'Repeated attention to sensation improves the resolution of that map.',
    ],
    whyItHappens:
      'The brain models the body to regulate it. A coarse model forces reliance on narrative, and narrative is slower and easier to distort.',
    signs: [
      'Emotions arrive as thoughts with no body location',
      'Difficulty naming where tension sits',
      'Sudden strong reactions with no felt warning',
      'Breath awareness that disappears the moment attention moves',
    ],
    counterExample:
      'Interoception is not hypervigilance. Scanning for threat is a prediction habit; accurate sensing is neutral reporting.',
    practice: {
      name: 'Three-point body check',
      dose: '3 times daily, 60 seconds',
      instructions: 'Locate the strongest sensation, name its quality, and rate intensity 0–5 without changing it.',
    },
    measure: 'Number of distinguishable body locations named per check, over two weeks.',
    citations: [
      { label: 'Craig, Nature Reviews Neuroscience (2009)', kind: 'research' },
      { label: 'Farb et al., Social Cognitive and Affective Neuroscience (2013)', kind: 'research' },
    ],
    relations: [
      { type: 'SUPPORTS', target: 'deep:body-scan-anxiety' },
      { type: 'ASSOCIATED_WITH', target: 'deep:gut-brain-axis' },
      { type: 'REQUIRES', target: 'deep:attention-span-collapse' },
    ],
    bandFit: { min: 0, max: 6 },
    confidence: 0.83,
    reviewStatus: 'reviewed',
    aliases: ['body sense', 'internal sense'],
  },
  {
    id: 'deep:freeze-response',
    name: 'Freeze Response',
    family: 'blocker',
    domain: 'psychology',
    definition:
      'Freeze is a survival state in which both action and speech shut down, so a person can appear calm or stubborn while actually being unable to move or respond.',
    mechanism: [
      'Threat is appraised as inescapable.',
      'Sympathetic activation combines with dorsal vagal shutdown.',
      'Muscle tone drops and vocal output narrows.',
      'Time and memory encoding become patchy.',
      'The person later reports "nothing happened" or "I blanked".',
    ],
    whyItHappens:
      'When fight and flight are both unavailable, immobility is the remaining protective option. It is a state, not a choice.',
    signs: [
      'Going blank in conflict rather than arguing',
      'Cold hands and shallow breath during pressure',
      'Feeling far away while still physically present',
      'Exhaustion after situations that required no action',
    ],
    counterExample:
      'Freeze is not compliance, apathy or passive aggression. Those describe behaviour after the state; freeze describes the state itself.',
    practice: {
      name: 'Orienting and exhale',
      dose: 'On noticing freeze, 2 minutes',
      instructions: 'Slowly turn the head to scan the room, name five objects, then extend the exhale for ten breaths. Move the feet before speaking.',
    },
    measure: 'Time from noticing freeze to producing a full sentence.',
    citations: [
      { label: 'Porges, Polyvagal Theory (2011)', kind: 'text' },
      { label: 'van der Kolk, The Body Keeps the Score (2014)', kind: 'text' },
    ],
    relations: [
      { type: 'CAUSES', target: 'deep:sleeper-cannot-meditate' },
      { type: 'REQUIRES', target: 'deep:vagal-tone' },
      { type: 'ASSOCIATED_WITH', target: 'deep:interoception' },
    ],
    bandFit: { min: 0, max: 6 },
    caution: 'Frequent freeze states with functional impairment deserve trauma-informed professional support.',
    confidence: 0.78,
    reviewStatus: 'reviewed',
    aliases: ['shutdown', 'immobility response', 'going blank'],
  },
  {
    id: 'deep:effort-paradox',
    name: 'The Effort Paradox in Meditation',
    family: 'myth',
    domain: 'transformation',
    definition:
      'Trying harder to stop thinking increases thinking, because effort recruits the same self-monitoring loop that produces the commentary being resisted.',
    mechanism: [
      'The instruction "stop thinking" is stored as a target to monitor.',
      'Monitoring requires self-referential evaluation.',
      'Evaluation generates more thought.',
      'The person concludes they are failing and adds effort.',
      'Arousal rises and the loop tightens.',
    ],
    whyItHappens:
      'Attention can be aimed, but thought cannot be switched off by command. Aiming at suppression recruits the very network that generates the content.',
    signs: [
      'Head tension and jaw clenching during practice',
      'A growing internal scorecard of session quality',
      'More thought during practice than during a walk',
      'Feeling worse after "good" sessions than after distracted ones',
    ],
    counterExample:
      'This is not an argument for passivity. The practice is deliberate attention, not deliberate silence. Aim, do not squeeze.',
    practice: {
      name: 'Noting instead of stopping',
      dose: '10 minutes, every thought labelled once',
      instructions: 'Label each noticed thought "thinking", then return to one sensory anchor. Never argue with the content.',
    },
    measure: 'Jaw and shoulder tension rating before and after the sit.',
    citations: [
      { label: 'Wegner, Psychological Science (1994)', kind: 'research', note: 'Thought suppression rebound' },
      { label: 'Yoga Sutra 1.12 — abhyasa and vairagya', kind: 'tradition' },
    ],
    relations: [
      { type: 'CONTRADICTS', target: 'deep:sleeper-cannot-meditate' },
      { type: 'ASSOCIATED_WITH', target: 'deep:no-thoughts-myth' },
      { type: 'SUPPORTS', target: 'deep:witness-gap' },
    ],
    bandFit: { min: 1, max: 6 },
    confidence: 0.79,
    reviewStatus: 'reviewed',
    aliases: ['trying too hard', 'effort in meditation'],
  },
  {
    id: 'deep:no-thoughts-myth',
    name: 'The "No Thoughts" Myth',
    family: 'myth',
    domain: 'consciousness',
    definition:
      'Meditation is not the absence of thought; it is the presence of noticing, and a session with many noticed thoughts is a successful session.',
    mechanism: [
      'Beginners adopt a goal of emptiness from secondhand descriptions.',
      'Every thought then counts as evidence of failure.',
      'Failure attribution reduces practice frequency.',
      'Less practice means fewer opportunities to notice.',
      'The person concludes meditation does not work for them.',
    ],
    whyItHappens:
      'The mind produces thought the way the heart produces beats. A goal that requires stopping a biological function guarantees perceived failure.',
    signs: [
      'Session judged only by how quiet it was',
      'Guilt after a busy mind',
      'Measuring success by absence rather than by noticing',
      'Quitting after a high-thought week',
    ],
    counterExample:
      'A quiet session is not automatically a good one, and a noisy session is not automatically a bad one. The variable is recognition, not content.',
    practice: {
      name: 'Count the catches',
      dose: 'Every sit for 7 days',
      instructions: 'Keep a tally of moments you noticed you were thinking. Count each tally mark as a repetition completed.',
    },
    measure: 'Catches per sit, trending up over two weeks.',
    citations: [
      { label: 'Yoga Sutra 1.2', kind: 'tradition' },
      { label: 'Kabat-Zinn, Full Catastrophe Living (1990)', kind: 'text' },
    ],
    relations: [
      { type: 'CONTRADICTS', target: 'deep:effort-paradox' },
      { type: 'ASSOCIATED_WITH', target: 'deep:dmn-overactivity' },
      { type: 'SUPPORTS', target: 'deep:witness-gap' },
    ],
    bandFit: { min: 0, max: 5 },
    confidence: 0.85,
    reviewStatus: 'verified',
    aliases: ['empty mind', 'stop thinking', 'no thoughts'],
  },
  {
    id: 'deep:restlessness-signal',
    name: 'Restlessness as a Signal',
    family: 'mechanism',
    domain: 'mind',
    definition:
      'Physical restlessness at the start of practice is usually unprocessed arousal looking for discharge, not proof that the practice is unsuitable.',
    mechanism: [
      'Unspent sympathetic arousal accumulates through the day.',
      'Sitting removes the movement that was masking it.',
      'The nervous system seeks discharge through small movements.',
      'Attention follows the movement and the mind supplies a reason to stop.',
      'Ending the sit discharges the arousal and reinforces the exit.',
    ],
    whyItHappens:
      'Stillness removes a habitual outlet. The arousal was always present; the sitting simply made it audible.',
    signs: [
      'Urges to scratch, shift or check the time',
      'Restlessness that peaks in the first five minutes and then falls',
      'Sudden important tasks remembered only after sitting down',
      'Strong preference for walking practice over seated practice',
    ],
    counterExample:
      'Restlessness is not a sign that you need a different technique. Changing technique at peak restlessness teaches the nervous system that restlessness works.',
    practice: {
      name: 'Ride the first wave',
      dose: 'One 12-minute sit, no movement except breath',
      instructions: 'Sit through the first urge without acting. Note its intensity each minute. Most waves fall by minute six.',
    },
    measure: 'Minute at which restlessness peaks and minute at which it falls.',
    citations: [
      { label: 'Tang, Hölzel & Posner, Nature Reviews Neuroscience (2015)', kind: 'research' },
      { label: 'Yoga Sutra 2.46 — sthira sukham asanam', kind: 'tradition' },
    ],
    relations: [
      { type: 'CAUSES', target: 'deep:attention-span-collapse' },
      { type: 'ASSOCIATED_WITH', target: 'deep:boredom-spike' },
      { type: 'REQUIRES', target: 'deep:sleeper-cannot-meditate' },
    ],
    bandFit: { min: 0, max: 5 },
    confidence: 0.76,
    reviewStatus: 'reviewed',
    aliases: ['can not sit still', 'restless legs in meditation', 'urge to move'],
  },
  {
    id: 'deep:expectation-mismatch',
    name: 'Expectation Mismatch',
    family: 'blocker',
    domain: 'transformation',
    definition:
      'When the imagined experience of practice does not match the actual one, the gap is read as failure, even when the practice is working exactly as designed.',
    mechanism: [
      'Prior content creates a vivid picture of calm, light or insight.',
      'The first sessions deliver ordinary sensation and distraction.',
      'The mismatch is attributed to the method or the person.',
      'Motivation drops before skill has had time to form.',
      'Practice stops in the exact period when consolidation begins.',
    ],
    whyItHappens:
      'Expectations are built from highlight reels. Practice is built from repetitions, most of which are unremarkable.',
    signs: [
      'Comparing your sit to someone else’s description',
      'Waiting for a peak experience as proof',
      'Changing techniques every two weeks',
      'Feeling cheated by an ordinary session',
    ],
    counterExample:
      'Lowering expectations is not lowering standards. The standard is repetition and honest observation, not intensity.',
    practice: {
      name: 'Process contract',
      dose: 'One written line before each sit, for 14 days',
      instructions: 'Write what you will do, not what you will feel. Review the line at the end of the week.',
    },
    measure: 'Percentage of sessions completed versus sessions rated "meaningful".',
    citations: [
      { label: 'Kabat-Zinn, Full Catastrophe Living (1990)', kind: 'text' },
      { label: 'Bhagavad Gita 2.47 — action, not fruits', kind: 'tradition' },
    ],
    relations: [
      { type: 'CAUSES', target: 'deep:no-thoughts-myth' },
      { type: 'ASSOCIATED_WITH', target: 'deep:effort-paradox' },
    ],
    bandFit: { min: 1, max: 5 },
    confidence: 0.74,
    reviewStatus: 'reviewed',
    aliases: ['wrong expectations', 'it is not working'],
  },
  {
    id: 'deep:phone-pull-loop',
    name: 'The Phone-Pull Loop',
    family: 'blocker',
    domain: 'behaviour',
    definition:
      'A reach for the phone during practice is a conditioned escape from a small rise in discomfort, reinforced every time the reach succeeds.',
    mechanism: [
      'Stillness produces a mild discomfort signal.',
      'The phone is associated with immediate relief.',
      'The reach happens before the discomfort is consciously registered.',
      'Relief reinforces the association.',
      'The discomfort threshold lowers with each cycle.',
    ],
    whyItHappens:
      'Intermittent reward trains the reach faster than steady reward trains patience. The device is an unusually efficient teacher.',
    signs: [
      'Phone in hand before deciding to pick it up',
      'Checking time repeatedly during practice',
      'Practice that ends exactly when boredom peaks',
      'Strong sense of justification for the interruption',
    ],
    counterExample:
      'This is not phone addiction as a clinical claim. It is a specific, narrow, trainable escape habit.',
    practice: {
      name: 'Distance protocol',
      dose: 'Every sit for 21 days',
      instructions: 'Phone in another room, face down, on silent. If you stand up, the sit ends but the log entry stays honest.',
    },
    measure: 'Number of sits completed without leaving the seat.',
    citations: [
      { label: 'Skinner, operant conditioning (1938)', kind: 'research' },
      { label: 'Lembke, Dopamine Nation (2021)', kind: 'text' },
    ],
    relations: [
      { type: 'CAUSES', target: 'deep:attention-span-collapse' },
      { type: 'ASSOCIATED_WITH', target: 'deep:boredom-spike' },
    ],
    bandFit: { min: 0, max: 4 },
    confidence: 0.75,
    reviewStatus: 'reviewed',
    aliases: ['phone during meditation', 'checking phone', 'doom scroll escape'],
  },
  {
    id: 'deep:boredom-spike',
    name: 'The Boredom Spike',
    family: 'mechanism',
    domain: 'mind',
    definition:
      'Boredom in practice is a sharp, time-limited rise in aversion that peaks early and fades if not acted on, which is why the first minutes feel harder than the last.',
    mechanism: [
      'Novelty drops when the object of attention stays the same.',
      'Aversion rises as the predicted reward falls.',
      'The mind proposes alternatives with higher predicted reward.',
      'Acting on an alternative ends the spike and teaches avoidance.',
      'Not acting lets the spike decay on its own.',
    ],
    whyItHappens:
      'Prediction systems are tuned to rate of change. A stable object reads as "nothing new", which is misread as "nothing valuable".',
    signs: [
      'Strong urge to check progress at minute three',
      'Mental list-making during practice',
      'Feeling that time has slowed',
      'Sudden craving for music, food or news',
    ],
    counterExample:
      'Boredom is not evidence that the object is unimportant. It is evidence that the prediction system has stopped updating.',
    practice: {
      name: 'Detail widening',
      dose: 'During each spike, 60 seconds',
      instructions: 'Find three new details in the same object: temperature, texture, beginning, ending. Novelty is restored by resolution, not by switching.',
    },
    measure: 'Minute at which the spike peaks and whether the sit continues past it.',
    citations: [
      { label: 'Killingsworth & Gilbert, Science (2010)', kind: 'research' },
      { label: 'Patanjali, Yoga Sutras — ekattva abhyasa', kind: 'tradition' },
    ],
    relations: [
      { type: 'CAUSES', target: 'deep:phone-pull-loop' },
      { type: 'ASSOCIATED_WITH', target: 'deep:attention-span-collapse' },
      { type: 'CONTRADICTS', target: 'deep:restlessness-signal' },
    ],
    bandFit: { min: 0, max: 5 },
    confidence: 0.73,
    reviewStatus: 'draft',
    aliases: ['bored during meditation', 'boredom in practice'],
  },
  {
    id: 'deep:meditation-headache',
    name: 'Effort Headache in Practice',
    family: 'physiology',
    domain: 'body',
    definition:
      'Head and jaw pain during practice usually comes from sustained muscular effort in the face, neck and eyes while trying to concentrate.',
    mechanism: [
      'Concentration is attempted with a held brow and fixed gaze.',
      'Neck and jaw muscles co-contract without awareness.',
      'Sustained contraction reduces local blood flow and produces ache.',
      'The ache is read as a sign of deep practice.',
      'The pattern is repeated and becomes the default posture.',
    ],
    whyItHappens:
      'The body follows the instruction literally: "focus" recruits the muscles that visually aim, even when the eyes are closed.',
    signs: [
      'Ache behind the eyes or at the temples',
      'Jaw soreness after sitting',
      'Relief when the eyes soften or the tongue relaxes',
      'Headache that appears only on practice days',
    ],
    counterExample:
      'This is not spiritual opening, detox or energy movement. It is ordinary muscular load with a story attached.',
    practice: {
      name: 'Soft-face reset',
      dose: 'Every 2 minutes during practice',
      instructions: 'Soften the tongue from the palate, unclench the jaw, widen the peripheral gaze, drop the shoulders. Then return to the object.',
    },
    measure: 'Headache rating before and after practice across a week.',
    citations: [
      { label: 'Kabat-Zinn, Full Catastrophe Living (1990)', kind: 'text' },
      { label: 'Hatha Yoga Pradipika — asana relaxation', kind: 'tradition' },
    ],
    relations: [
      { type: 'CAUSES', target: 'deep:effort-paradox' },
      { type: 'ASSOCIATED_WITH', target: 'deep:interoception' },
    ],
    bandFit: { min: 0, max: 6 },
    caution: 'New or severe headaches, especially with vision change, need medical assessment.',
    confidence: 0.77,
    reviewStatus: 'reviewed',
    aliases: ['meditation headache', 'head pressure', 'jaw tension'],
  },
  {
    id: 'deep:breathing-4-7-8',
    name: '4-7-8 Breathing',
    family: 'practice_variant',
    domain: 'body',
    definition:
      '4-7-8 breathing pairs a short inhale with a long exhale and a brief hold, producing a reliable downshift in arousal within a few cycles.',
    mechanism: [
      'Extended exhale increases vagal braking on the heart.',
      'The hold after exhale briefly reduces CO2 drive and slows the next inhale.',
      'Heart rate falls and attention narrows to the breath.',
      'Arousal drops enough for sleep onset or for settling before practice.',
    ],
    whyItHappens:
      'Breath is the fastest voluntary lever on autonomic state; exhale-dominant patterns favour parasympathetic activity.',
    signs: [
      'Shoulders drop without being told to',
      'Mental pace slows after four cycles',
      'Sleepiness within two minutes when lying down',
      'Reduced urge to move',
    ],
    counterExample:
      'This is not hyperventilation and not deep breathing. Volume stays normal; only the timing changes.',
    practice: {
      name: 'Four-cycle settle',
      dose: '4 cycles, twice daily, or before sleep',
      instructions: 'Inhale 4, hold 7, exhale 8, no pause after exhale. Stop at any dizziness and breathe normally.',
    },
    measure: 'Time to settle (minutes) and resting pulse before and after.',
    citations: [
      { label: 'Zaccaro et al., Frontiers in Human Neuroscience (2018)', kind: 'research' },
      { label: 'Hatha Yoga Pradipika — pranayama ratios', kind: 'tradition' },
    ],
    relations: [
      { type: 'SUPPORTS', target: 'deep:vagal-tone' },
      { type: 'REQUIRES', target: 'deep:sleeper-cannot-meditate' },
      { type: 'MEASURED_BY', target: 'deep:hrv' },
    ],
    bandFit: { min: 0, max: 6 },
    caution: 'Skip breath holds during pregnancy, with uncontrolled blood pressure, or if holds cause dizziness.',
    confidence: 0.8,
    reviewStatus: 'reviewed',
    aliases: ['478 breathing', 'relaxing breath'],
  },
  {
    id: 'deep:box-breathing',
    name: 'Box Breathing',
    family: 'practice_variant',
    domain: 'body',
    definition:
      'Equal-count inhale, hold, exhale and hold create a stable, low-variability breath rhythm that supports sustained attention without drowsiness.',
    mechanism: [
      'Equal segment lengths reduce breath-to-breath variability.',
      'Predictable rhythm lowers vigilance load.',
      'Moderate CO2 retention stabilises attention without sedation.',
      'The counting task occupies working memory lightly.',
      'A stable state supports longer sits.',
    ],
    whyItHappens:
      'Attention is easier to hold on a predictable signal than on an unpredictable one; the rhythm itself becomes the anchor.',
    signs: [
      'Steadier posture after two minutes',
      'Counting that continues without effort',
      'Less drowsiness than with long exhales',
      'Breath that feels mechanical rather than emotional',
    ],
    counterExample:
      'Box breathing is not a relaxation exercise by design. Its main effect is attentional stability; calm is a side effect.',
    practice: {
      name: 'Four-square',
      dose: '3–5 minutes before practice',
      instructions: 'Inhale 4, hold 4, exhale 4, hold 4. Keep the counts equal and the breath quiet.',
    },
    measure: 'Sit length completed and subjective steadiness rating.',
    citations: [
      { label: 'Zaccaro et al., Frontiers in Human Neuroscience (2018)', kind: 'research' },
      { label: 'Raja Yoga — dharana preparation', kind: 'tradition' },
    ],
    relations: [
      { type: 'SUPPORTS', target: 'deep:attention-span-collapse' },
      { type: 'ASSOCIATED_WITH', target: 'deep:breathing-4-7-8' },
    ],
    bandFit: { min: 0, max: 7 },
    confidence: 0.76,
    reviewStatus: 'reviewed',
    aliases: ['square breathing', 'four count breath'],
  },
  {
    id: 'deep:body-scan-anxiety',
    name: 'Body Scan for Anxiety',
    family: 'practice_variant',
    domain: 'body',
    definition:
      'A slow, wide body scan lowers anxiety by widening attention beyond the chest and head, where anxious attention usually concentrates.',
    mechanism: [
      'Anxiety narrows attention to threat-relevant regions.',
      'A sequential scan forces attention into neutral areas.',
      'Interoceptive resolution increases and prediction error falls.',
      'Threat appraisal drops as the body map becomes less alarming.',
      'Widened attention is easier to maintain than suppressed thought.',
    ],
    whyItHappens:
      'Anxiety is partly a spatial habit of attention. Moving attention changes the input that the appraisal system is working from.',
    signs: [
      'Chest tightness easing when attention reaches the legs',
      'Breath slowing without deliberate control',
      'Less mental commentary as the scan proceeds',
      'Sleepiness rather than alertness at the end',
    ],
    counterExample:
      'This is not relaxation training. The scan can surface discomfort; the instruction is to report, not to remove.',
    practice: {
      name: 'Wide scan',
      dose: '12 minutes, once daily',
      instructions: 'Move from feet to head in ten regions, two breaths per region. Name quality and intensity, never analyse the cause.',
    },
    measure: 'Anxiety rating (0–10) before and after, plus number of regions felt clearly.',
    citations: [
      { label: 'Farb et al., SCAN (2013)', kind: 'research' },
      { label: 'Kabat-Zinn, Full Catastrophe Living (1990)', kind: 'text' },
    ],
    relations: [
      { type: 'REQUIRES', target: 'deep:interoception' },
      { type: 'SUPPORTS', target: 'deep:vagal-tone' },
      { type: 'ASSOCIATED_WITH', target: 'deep:freeze-response' },
    ],
    bandFit: { min: 0, max: 6 },
    caution: 'If scanning reliably increases distress, shorten it and work with a trauma-informed guide.',
    confidence: 0.79,
    reviewStatus: 'reviewed',
    aliases: ['body scan', 'somatic scan'],
  },
  {
    id: 'deep:witness-gap',
    name: 'The Witness Gap',
    family: 'practice_variant',
    domain: 'consciousness',
    definition:
      'The witness gap is the interval between a stimulus and a reaction; practice widens it until the reaction becomes optional.',
    mechanism: [
      'A trigger produces an automatic appraisal.',
      'Without training, appraisal and response are fused.',
      'Repeated noticing inserts a pause between them.',
      'The pause allows a second appraisal.',
      'Choice becomes possible inside the pause.',
    ],
    whyItHappens:
      'Awareness does not stop the reaction; it delays it long enough for a different response to be selected.',
    signs: [
      'Hearing yourself before speaking',
      'Noticing anger as heat before it becomes a sentence',
      'A half-second of choice where there used to be none',
      'Regret after reactions becoming less frequent',
    ],
    counterExample:
      'The gap is not detachment or numbness. It is not the absence of emotion; it is the presence of a choice inside emotion.',
    practice: {
      name: 'One-second pause',
      dose: 'Every trigger, for 21 days',
      instructions: 'On noticing a reaction, exhale once before responding. Name the state silently. Then choose.',
    },
    measure: 'Reactions you would have regretted per week.',
    citations: [
      { label: 'Frankl, Man’s Search for Meaning (1946)', kind: 'text' },
      { label: 'Yoga Sutra 1.3 — drashtuh svarupe avasthanam', kind: 'tradition' },
      { label: 'Brewer et al., PNAS (2011)', kind: 'research' },
    ],
    relations: [
      { type: 'SUPPORTS', target: 'deep:no-thoughts-myth' },
      { type: 'REQUIRES', target: 'deep:dmn-overactivity' },
      { type: 'ASSOCIATED_WITH', target: 'deep:bands-1-3' },
    ],
    bandFit: { min: 2, max: 8 },
    confidence: 0.82,
    reviewStatus: 'verified',
    aliases: ['gap between stimulus and response', 'sakshi', 'witnessing'],
  },
  {
    id: 'deep:hrv',
    name: 'Heart Rate Variability',
    family: 'measurement',
    domain: 'body',
    definition:
      'Heart rate variability is the variation in time between heartbeats; higher resting variability generally tracks better autonomic flexibility and faster recovery.',
    mechanism: [
      'Beat-to-beat intervals change with breath and autonomic traffic.',
      'Higher variability at rest reflects stronger vagal modulation.',
      'Acute stress and illness typically lower variability.',
      'Recovery is visible as variability returning to a personal baseline.',
      'Trends matter more than any single reading.',
    ],
    whyItHappens:
      'A flexible heart responds to continuous demand. A rigid rhythm suggests the system is holding one state.',
    signs: [
      'Morning readings that swing with sleep and alcohol',
      'Lower values on high-load days',
      'Recovery visible over 2–3 days after stress',
      'Breath-paced readings higher than spontaneous ones',
    ],
    counterExample:
      'Higher is not always better. Very high values can reflect arrhythmia or measurement artefact; this is why trends and context matter.',
    practice: {
      name: 'Standardised morning reading',
      dose: '60 seconds, same time daily',
      instructions: 'Measure before standing, before caffeine, three days a week minimum. Record sleep hours beside it.',
    },
    measure: 'Seven-day rolling average compared with your own 30-day baseline.',
    citations: [
      { label: 'Task Force of ESC/NASPE, Circulation (1996)', kind: 'research' },
      { label: 'Laborde et al., Frontiers in Psychology (2017)', kind: 'research' },
    ],
    relations: [
      { type: 'MEASURED_BY', target: 'deep:vagal-tone' },
      { type: 'ASSOCIATED_WITH', target: 'deep:sleep-efficiency' },
    ],
    bandFit: { min: 0, max: 10 },
    caution: 'Wearable HRV is not a diagnostic measure. Persistent abnormalities need clinical review.',
    confidence: 0.81,
    reviewStatus: 'reviewed',
    aliases: ['HRV', 'heart rate variability'],
  },
  {
    id: 'deep:sleep-efficiency',
    name: 'Sleep Efficiency',
    family: 'measurement',
    domain: 'body',
    definition:
      'Sleep efficiency is time asleep divided by time in bed; it separates a sleep problem from a schedule problem.',
    mechanism: [
      'Time in bed is recorded from lights out to rising.',
      'Time asleep is recorded from estimates or a tracker.',
      'The ratio exposes wake time spent in bed.',
      'Low ratios usually reflect a stretched window rather than a sleep defect.',
      'Compressing the window often restores the ratio.',
    ],
    whyItHappens:
      'The brain associates the bed with wakefulness when wake time in bed is long. Association, not willpower, governs sleep onset.',
    signs: [
      'More than 30 minutes awake before sleep most nights',
      'Long lie-ins that do not improve freshness',
      'Falling asleep quickly away from your own bed',
      'Weekend sleep far longer than weekday sleep',
    ],
    counterExample:
      'High efficiency with short sleep is not healthy sleep. The ratio must be read with total duration.',
    practice: {
      name: 'Fixed window',
      dose: 'Same 7.5-hour window for 14 nights',
      instructions: 'Set wake time first, then bedtime. Leave the bed after 20 awake minutes and return when sleepy.',
    },
    measure: 'Weekly efficiency percentage alongside average duration.',
    citations: [
      { label: 'Buysse et al., Psychiatry Research (1989)', kind: 'research', note: 'Pittsburgh Sleep Quality Index' },
      { label: 'Spielman et al., behaviour therapy for insomnia (1987)', kind: 'research' },
    ],
    relations: [
      { type: 'MEASURED_BY', target: 'deep:sleep-debt-attention' },
      { type: 'ASSOCIATED_WITH', target: 'deep:hrv' },
    ],
    bandFit: { min: 0, max: 10 },
    confidence: 0.84,
    reviewStatus: 'verified',
    aliases: ['sleep quality ratio', 'time in bed ratio'],
  },
  {
    id: 'deep:bands-1-3',
    name: 'Bands 1–3: The Reactive Range',
    family: 'band_map',
    domain: 'consciousness',
    definition:
      'Bands 1–3 are the reactive range: identity is fused with thought and role, and practice works by interrupting automatic reaction rather than by producing stillness.',
    mechanism: [
      'Identity is built from roles, opinions and comparison.',
      'Threat is experienced as loss of role or approval.',
      'Attention is almost entirely outward-facing.',
      'Stillness is interpreted as boredom or danger.',
      'Short, frequent interruptions of reaction land better than long sits.',
    ],
    whyItHappens:
      'At this band the nervous system is solving for safety and status. Practices that ask for sustained inward attention outrun the available capacity.',
    signs: [
      'Practice feels pointless without a visible benefit',
      'Strong investment in being right',
      'Mood tied to external response',
      'Long sits produce restlessness rather than insight',
    ],
    counterExample:
      'This is not a deficiency. It is a stage with its own valid methods; the error is applying band-6 practices at band 2.',
    practice: {
      name: 'Two-minute reaction log',
      dose: 'Twice daily, 2 minutes',
      instructions: 'Write one reaction, the trigger, and what it protected. No analysis beyond one line each.',
    },
    measure: 'Number of reactions caught before acting, per week.',
    citations: [
      { label: 'Yoga Sutras, klesha sequence', kind: 'tradition' },
      { label: 'Kabat-Zinn, Full Catastrophe Living (1990)', kind: 'text' },
    ],
    relations: [
      { type: 'ASSOCIATED_WITH', target: 'deep:witness-gap' },
      { type: 'PRECEDES', target: 'deep:bands-4-6' },
      { type: 'REQUIRES', target: 'deep:attention-span-collapse' },
    ],
    bandFit: { min: 0, max: 3, note: 'Describes the range itself.' },
    confidence: 0.7,
    reviewStatus: 'reviewed',
    aliases: ['reactive stage', 'early bands'],
  },
  {
    id: 'deep:bands-4-6',
    name: 'Bands 4–6: The Inward Range',
    family: 'band_map',
    domain: 'consciousness',
    definition:
      'Bands 4–6 are the inward range: attention can be sustained, identity loosens from role, and practice shifts from interrupting reactions to investigating the observer.',
    mechanism: [
      'Sustained attention becomes available for the first time.',
      'Identity begins to be questioned rather than defended.',
      'The witness is noticed intermittently.',
      'Stillness becomes tolerable and then interesting.',
      'The main risk shifts from restlessness to spiritual bypassing.',
    ],
    whyItHappens:
      'Capacity has caught up with instruction. The obstacle is no longer restlessness; it is the subtle use of insight to avoid feeling.',
    signs: [
      'Longer sits complete without effort',
      'Genuine curiosity about the observer',
      'Language of detachment appearing in daily life',
      'Discomfort avoided through "witnessing" it',
    ],
    counterExample:
      'Equanimity is not indifference. If the witness stance protects you from grief, it is bypassing, not witnessing.',
    practice: {
      name: 'Inquiry after stillness',
      dose: '10 minutes sitting + 3 written lines',
      instructions: 'Ask "who is aware of this?" after the sit, then write what remains when the question is dropped.',
    },
    measure: 'Ratio of felt emotion to reported emotion in the weekly journal.',
    citations: [
      { label: 'Ramana Maharshi, Who Am I? (1901)', kind: 'tradition' },
      { label: 'Brewer et al., PNAS (2011)', kind: 'research' },
    ],
    relations: [
      { type: 'FOLLOWS', target: 'deep:bands-1-3' },
      { type: 'REQUIRES', target: 'deep:witness-gap' },
      { type: 'CONTRADICTS', target: 'deep:effort-paradox' },
    ],
    bandFit: { min: 4, max: 6, note: 'Describes the range itself.' },
    caution: 'Spiritual bypassing at this range can delay needed psychological work.',
    confidence: 0.68,
    reviewStatus: 'draft',
    aliases: ['inward stage', 'witness stage'],
  },
  {
    id: 'deep:gut-feeling-myth',
    name: 'The "Gut Feeling Is Always Right" Myth',
    family: 'myth',
    domain: 'mind',
    definition:
      'A gut feeling is a fast prediction built from past experience, so it is only as reliable as the experience it was trained on.',
    mechanism: [
      'The body signals a prediction before conscious reasoning completes.',
      'The signal is based on learned associations, not on current evidence.',
      'Confidence in the signal rises with emotional intensity.',
      'Intensity is mistaken for accuracy.',
      'The prediction is read as information rather than as a hypothesis.',
    ],
    whyItHappens:
      'Fast prediction is cheap and usually good enough. It does not carry a label that distinguishes trained intuition from old fear.',
    signs: [
      'Certainty that arrives before any evidence',
      'Gut warnings that repeat across unrelated situations',
      'Strong conviction that resists contrary facts',
      'Physical signal that changes when you slow down',
    ],
    counterExample:
      'This is not an argument for ignoring the body. The signal is data; it is not a verdict.',
    practice: {
      name: 'Prediction check',
      dose: 'One gut call per day, for 14 days',
      instructions: 'Write the prediction and the evidence it rests on, then record the outcome. Review the hit rate weekly.',
    },
    measure: 'Prediction accuracy over 14 days, split by domain.',
    citations: [
      { label: 'Damasio, Descartes’ Error (1994)', kind: 'text' },
      { label: 'Kahneman, Thinking, Fast and Slow (2011)', kind: 'text' },
      { label: 'Mayer, Gut-Brain Axis (2016)', kind: 'text' },
    ],
    relations: [
      { type: 'CONTRADICTS', target: 'deep:gut-brain-axis' },
      { type: 'ASSOCIATED_WITH', target: 'deep:interoception' },
    ],
    bandFit: { min: 0, max: 8 },
    confidence: 0.78,
    reviewStatus: 'reviewed',
    aliases: ['trust your gut', 'intuition myth'],
  },
];
