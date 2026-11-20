/**
 * Observation Sessions — L1–L3 seeds (42 of 100).
 *
 * Each seed is an authored session, not a template. The shared skeleton
 * (arrive → land → anchor → exploration → silence → integrate → carry)
 * lives in the runtime; a seed only supplies what makes this sitting
 * different from the last one.
 *
 * Companion files: observationSessions.part2.ts (L4–L5), part3.ts (L6–L7).
 */
import type { ObsSeed } from "./observationSessions";

type Beat = [title: string, body: string];

const s = (
  id: string,
  level: ObsSeed["level"],
  lens: ObsSeed["lens"],
  method: ObsSeed["method"],
  slot: ObsSeed["slot"],
  minutes: number[],
  visual: ObsSeed["visual"],
  voice: string,
  beats: Beat[],
  integration: string,
  journalPrompt: string,
  carryTask: string,
  source?: string,
): ObsSeed => ({
  id,
  level,
  lens,
  method,
  slot,
  minutes,
  visual,
  voice,
  source,
  exploration: beats.map(([title, body]) => ({ title, body })),
  integration,
  journalPrompt,
  carryTask,
});

export const OBS_SEEDS_L1_L3: ObsSeed[] = [
  // ───────────────────────── L1 · BODY SENSING (14) ─────────────────────────
  s(
    "obs-l1-01", 1, "body", "scan", "any", [3, 5, 10], "orb-still", "buddha",
    [
      ["Weight", "Let the seat carry your whole weight. You do not have to hold yourself up."],
      ["Contact", "Feel exactly where the body touches what holds it — seat, feet, hands."],
      ["One Field", "Now stop dividing. Feel the body as a single weight, breathing."],
    ],
    "The body was already here. Nothing needed to be added.",
    "What did the body feel like before you started naming it?",
    "Twice today, feel your weight on the floor before you speak.",
    "buddha:body-scan",
  ),
  s(
    "obs-l1-02", 1, "sensation", "labeling", "morning", [3, 5, 10], "horizon", "buddha",
    [
      ["Air", "Notice the temperature of the air wherever skin is exposed."],
      ["Difference", "Find one place that is warmer and one that is cooler."],
      ["Both", "Hold both at once. Warm and cool, in the same body."],
    ],
    "Sensation does not need your commentary to be real.",
    "Which place on your body was warmest?",
    "Once today, notice the air on your face before checking your phone.",
  ),
  s(
    "obs-l1-03", 1, "body", "54321", "any", [5, 10, 15], "orb-pulse", "buddha",
    [
      ["Five Points", "Feet, hands, seat, back, jaw. Touch each with attention, one at a time."],
      ["The Quiet Ones", "Which point had gone unnoticed until now?"],
      ["Whole", "Let attention rest on all five at once, like a hand on a wide table."],
    ],
    "Attention is not effort. It is where you are already standing.",
    "Which part of your body was asking to be noticed?",
    "On your next walk, check in with your jaw and shoulders.",
  ),
  s(
    "obs-l1-04", 1, "sensation", "noting", "night", [3, 5, 10], "orb-still", "buddha",
    [
      ["Belly", "Place a hand on the belly. Feel it move on its own."],
      ["Rise and Fall", "Follow three movements without controlling them."],
      ["Let Go", "Remove the hand. The belly still knows how."],
    ],
    "The body breathes whether or not you supervise it.",
    "What changed when you stopped trying to breathe well?",
    "Once tonight, watch three breaths before sleep without changing them.",
    "yoga-nidra:body-sweep",
  ),
  s(
    "obs-l1-05", 1, "sound", "open", "any", [3, 5, 10], "horizon", "krishnamurti",
    [
      ["Near", "Find the closest sound. Do not name it. Just let it be heard."],
      ["Far", "Now the farthest sound you can find."],
      ["Field", "Let near and far exist together, with no preference."],
    ],
    "Sound arrives. You never had to go looking for it.",
    "Which sound did you hear that you had been filtering out?",
    "Once today, listen to one whole sound before naming it.",
    "kabir:surat-shabd",
  ),
  s(
    "obs-l1-06", 1, "body", "scan", "evening", [5, 10, 15], "orb-pulse", "shiva",
    [
      ["Edges", "Feel where the body ends and the air begins."],
      ["Blur", "Notice that the edge is not a line. It is a soft zone."],
      ["No Edge", "For a few breaths, stop locating yourself in a body."],
    ],
    "The boundary you defend is thinner than you think.",
    "Where does your body seem to end right now?",
    "Once today, feel the air at the edge of your hands.",
  ),
  s(
    "obs-l1-07", 1, "body", "rest", "any", [3, 5, 10], "orb-still", "buddha",
    [
      ["Hands", "Rest the hands. Let them be heavy."],
      ["Stillness", "Find the stillness inside the hands, not around them."],
      ["Whole Body", "That same stillness is in the feet, the face, the chest."],
    ],
    "Stillness was never something you had to create.",
    "Where in the body did stillness show up first?",
    "Three times today, stop and feel your hands for five seconds.",
  ),
  s(
    "obs-l1-08", 1, "sensation", "scan", "midday", [3, 5, 10], "horizon", "shiva",
    [
      ["Jaw", "Let the jaw be slightly apart. Feel the space appear."],
      ["Shoulders", "Drop them a centimetre. Notice what was holding them."],
      ["Map", "Scan for any other place still bracing for something."],
    ],
    "Tension is usually a decision you forgot you made.",
    "Which part of the body was bracing, and for what?",
    "Once today, unclench your jaw when you notice it.",
  ),
  s(
    "obs-l1-09", 1, "body", "noting", "any", [3, 5, 10], "orb-still", "buddha",
    [
      ["Head", "Feel the weight of the head resting on the neck."],
      ["Balance", "Notice the small adjustments keeping it upright."],
      ["Let Go", "Let the neck carry it. Stop helping."],
    ],
    "Much of what you call posture is unnecessary effort.",
    "What happened when you stopped holding your head up?",
    "Once today, let your shoulders and neck fully rest for ten seconds.",
  ),
  s(
    "obs-l1-10", 1, "sensation", "labeling", "morning", [3, 5, 10], "horizon", "buddha",
    [
      ["Fabric", "Feel the cloth on your skin — texture, pressure, fold."],
      ["Changes", "Notice the places where the cloth moves with the breath."],
      ["Skin", "Now feel the skin under it, not the cloth."],
    ],
    "The world touches you all day. You rarely touch it back with attention.",
    "What did your clothes feel like before this sitting?",
    "Once today, feel fabric on your skin while you walk.",
  ),
  s(
    "obs-l1-11", 1, "body", "noting", "any", [3, 5, 10], "orb-pulse", "shiva",
    [
      ["Fingertips", "Bring attention to the pads of the fingers."],
      ["Pulse", "Find the smallest pulse or throb there."],
      ["Life", "That rhythm has been running your whole life without applause."],
    ],
    "The body is already alive. You are not keeping it alive.",
    "What did you find in the fingertips?",
    "Once today, press your fingertips together and feel the pulse.",
  ),
  s(
    "obs-l1-12", 1, "body", "scan", "any", [3, 5, 10], "horizon", "buddha",
    [
      ["Feet", "Feel both feet, the floor pressing back."],
      ["Step", "Imagine one slow step. Feel the weight shift before it happens."],
      ["Walking", "For a few breaths, walk nowhere, in your mind, just feeling the feet."],
    ],
    "Presence begins at the soles of the feet.",
    "What did the floor tell you?",
    "Walk ten steps today feeling only your feet.",
    "thich-nhat-hanh:walking",
  ),
  s(
    "obs-l1-13", 1, "body", "open", "night", [5, 10, 15], "orb-still", "krishnamurti",
    [
      ["Field", "Stop scanning parts. Let the whole body be one field of sensation."],
      ["No Labels", "Drop the words body, leg, chest. Just the field."],
      ["Rest", "Rest in the field without needing to know what it is."],
    ],
    "When the labels stop, the body becomes larger, not smaller.",
    "What did the body become when you stopped naming its parts?",
    "Once tonight, lie down and feel the body as one field.",
  ),
  s(
    "obs-l1-14", 1, "breath", "noting", "night", [5, 10, 15], "orb-pulse", "buddha",
    [
      ["Already Breathing", "Notice that the breath is happening without an instruction."],
      ["Who", "See if you can find the one doing it."],
      ["Rest", "Let the question go. Stay with the breathing."],
    ],
    "The body has been practicing all along.",
    "What is it like to let the body breathe you?",
    "Once tonight, fall asleep watching three natural breaths.",
    "buddha:anapanasati",
  ),

  // ───────────────────────── L2 · BREATH WATCHING (14) ──────────────────────
  s(
    "obs-l2-01", 2, "breath", "counting", "morning", [5, 10, 15], "orb-pulse", "buddha",
    [
      ["Count", "Count ten breaths silently on each exhale: one, two, three…"],
      ["Lose It", "If you lose count, start again at one. No penalty."],
      ["Ten", "Complete one full round to ten without losing it."],
    ],
    "The count is not the point. Returning is the point.",
    "How many times did you lose count, and how did you return?",
    "Once today, count ten breaths before opening your laptop.",
    "buddha:anapanasati",
  ),
  s(
    "obs-l2-02", 2, "breath", "noting", "any", [5, 10, 15], "orb-still", "buddha",
    [
      ["Don't Change", "Watch the next breath exactly as it is — short, long, rough, easy."],
      ["Signature", "Find what is unique about this breath compared to the last."],
      ["Allow", "Let the breath decide its own rhythm for the rest of the sitting."],
    ],
    "You do not have to improve the breath to be present.",
    "What was the breath doing that you usually try to fix?",
    "Once today, notice one breath before you speak.",
  ),
  s(
    "obs-l2-03", 2, "breath", "noting", "morning", [5, 10, 15], "horizon", "buddha",
    [
      ["Nostrils", "Feel the air at the nostrils, cool in, warm out."],
      ["Edge", "Find the exact point where the air enters."],
      ["Cave", "Follow the air a little way inside. No further."],
    ],
    "The breath has a doorway. Most people never stand in it.",
    "What was the air like at the nostrils?",
    "Once today, stand in the breath's doorway for three breaths.",
  ),
  s(
    "obs-l2-04", 2, "breath", "labeling", "midday", [5, 10, 15], "orb-pulse", "buddha",
    [
      ["Belly", "Feel the belly move first on the next inhale."],
      ["Chest", "Then notice the chest. Which moved first this time?"],
      ["Compare", "Do not correct it. Just know what actually happened."],
    ],
    "Knowing the breath is enough. Directing it is a different practice.",
    "Did the belly or the chest lead?",
    "Once today, place a hand on the belly when you feel scattered.",
  ),
  s(
    "obs-l2-05", 2, "breath", "rest", "night", [5, 10, 15], "orb-still", "shiva",
    [
      ["Pause", "After the exhale, do not rush the next inhale."],
      ["Gap", "Notice the small pause that is already there."],
      ["Rest", "Let the pause lengthen on its own."],
    ],
    "The gap after the exhale is the same gap between thoughts.",
    "What was in the pause after the exhale?",
    "Once tonight, rest in one long pause before sleeping.",
    "yogananda:hong-sau",
  ),
  s(
    "obs-l2-06", 2, "breath", "counting", "evening", [5, 10, 15], "orb-pulse", "shiva",
    [
      ["Inhale Four", "Breathe in for four silent counts."],
      ["Exhale Six", "Breathe out for six. Let the exhale be longer."],
      ["Rhythm", "Keep 4–6 for eight rounds without forcing."],
    ],
    "A longer exhale tells the body the day is over.",
    "What happened to the body after the longer exhales?",
    "Once tonight, do six long exhales before bed.",
  ),
  s(
    "obs-l2-07", 2, "sound", "open", "any", [5, 10, 15], "horizon", "buddha",
    [
      ["Sound", "Hear the breath itself — the small sound at the nostrils."],
      ["Texture", "Is it smooth, rasping, wet, dry?"],
      ["Merge", "Let the sound and the sensation be one event."],
    ],
    "The breath is already a sound. You did not have to make it.",
    "What did your breath sound like today?",
    "Once today, listen to your breathing for ten seconds.",
  ),
  s(
    "obs-l2-08", 2, "breath", "scan", "night", [5, 10, 15], "orb-still", "buddha",
    [
      ["Back", "Feel the breath in the back of the body, behind the ribcage."],
      ["Wide", "Let the inhale widen the back, not the chest."],
      ["Rest", "Feel the back breathe on its own."],
    ],
    "The back is the forgotten half of the breath.",
    "What changed when the breath moved into the back?",
    "Once tonight, lie on your back and breathe into it.",
  ),
  s(
    "obs-l2-09", 2, "breath", "counting", "any", [10, 15, 20], "orb-pulse", "shiva",
    [
      ["Equal", "Make the in-breath and out-breath the same length."],
      ["Count", "Count silently: in 4, out 4, for six rounds."],
      ["Natural", "Then release the count and let the rhythm settle."],
    ],
    "Balance is not a technique. It is what remains after technique.",
    "Did equal breathing change your mood?",
    "Once today, breathe 4–4 for one minute.",
  ),
  s(
    "obs-l2-10", 2, "breath", "noting", "midday", [5, 10, 15], "horizon", "buddha",
    [
      ["Check", "Is this breath full or half? Do not fix it."],
      ["Why", "Notice what made it half — posture, tension, hurry."],
      ["Full", "Take one deliberately full breath. Feel the difference."],
    ],
    "Most breaths are half breaths. Noticing is the correction.",
    "What was keeping your breath small today?",
    "Once today, take one full breath before answering a message.",
  ),
  s(
    "obs-l2-11", 2, "breath", "rest", "evening", [3, 5, 10], "orb-pulse", "shiva",
    [
      ["Sigh", "Take one audible sigh. Let the shoulders drop."],
      ["Second", "Another sigh, softer. Let the jaw drop too."],
      ["Third", "One last sigh. Notice the body that remains."],
    ],
    "The sigh is the body's own reset. You are allowed to use it.",
    "What did the sigh release that you didn't know you were holding?",
    "Once today, sigh out loud when you notice you are bracing.",
  ),
  s(
    "obs-l2-12", 2, "thought", "labeling", "any", [10, 15, 20], "orb-still", "krishnamurti",
    [
      ["Before", "Find the moment just before a thought begins."],
      ["Watch", "Stay at the breath and see what comes to interrupt."],
      ["Label", "When it comes, say quietly: thinking. Then return."],
    ],
    "You do not need to stop thoughts. You only need to see them arrive.",
    "What thought came most often to interrupt?",
    "Once today, catch one thought before it finishes.",
  ),
  s(
    "obs-l2-13", 2, "breath", "counting", "night", [10, 15, 20], "orb-still", "buddha",
    [
      ["Gap", "Count the pauses between breaths instead of the breaths."],
      ["One", "One pause. Two pauses. Up to five."],
      ["Rest", "Let counting go. Stay in the gap."],
    ],
    "The pause is not empty. It is full of quiet.",
    "What did the gap between breaths feel like?",
    "Once tonight, rest in one long pause before sleep.",
  ),
  s(
    "obs-l2-14", 2, "breath", "rest", "morning", [5, 10, 15], "horizon", "buddha",
    [
      ["Natural", "Stop any counting. Just let the breath be natural."],
      ["Follow", "Follow it without a plan for three minutes."],
      ["Body", "Notice the body breathing by itself, content."],
    ],
    "The breath is not a task. It is a companion.",
    "What did natural breathing feel like without instruction?",
    "Once today, do nothing but breathe for one minute.",
  ),

  // ─────────────────────── L3 · EMOTION WATCHING (14) ───────────────────────
  s(
    "obs-l3-01", 3, "emotion", "labeling", "any", [5, 10, 20], "orb-pulse", "buddha",
    [
      ["Flavor", "Notice the feeling-tone of this moment: pleasant, unpleasant, neutral."],
      ["Label", "Say it quietly. Do not explain it."],
      ["Repeat", "Keep labelling each new tone for a few minutes."],
    ],
    "The flavour comes before the story.",
    "What was the dominant tone of this sitting?",
    "Three times today, label the tone of a moment before reacting.",
  ),
  s(
    "obs-l3-02", 3, "emotion", "noting", "midday", [5, 10, 20], "horizon", "krishnamurti",
    [
      ["Arrive", "Bring to mind one small irritation from today."],
      ["First Move", "Watch the first thing the body does with it."],
      ["Gap", "Before the reaction, find the gap. Stay there."],
    ],
    "Freedom is not the absence of the wave. It is the space before it.",
    "What was the first thing that happened before the reaction?",
    "Once today, pause for one breath before reacting to something small.",
  ),
  s(
    "obs-l3-03", 3, "emotion", "scan", "any", [5, 10, 20], "orb-pulse", "shiva",
    [
      ["Where", "Recall a mild emotion. Where does it live in the body?"],
      ["Shape", "Does it have a shape, colour, temperature?"],
      ["Stay", "Stay with the sensation, not the story."],
    ],
    "An emotion is a body event before it is a narrative.",
    "Where in the body did the emotion live?",
    "Once today, locate an emotion in your body before speaking.",
  ),
  s(
    "obs-l3-04", 3, "emotion", "labeling", "evening", [10, 15, 20], "orb-still", "buddha",
    [
      ["Name", "Name the emotion you are carrying from today. One word."],
      ["Softer", "Find a softer word for it. Let the label loosen."],
      ["Space", "Repeat the softer word until the feeling has room."],
    ],
    "Naming is not suppression. It is giving the feeling a place.",
    "What was the softer name you found?",
    "Once tonight, name one feeling in a single word before bed.",
  ),
  s(
    "obs-l3-05", 3, "emotion", "noting", "any", [10, 15, 20], "horizon", "krishnamurti",
    [
      ["Watch", "Let whatever feeling is here be here."],
      ["Gap", "Find the small gap between the feeling and your reaction to it."],
      ["Rest", "Rest in the gap. Do not fill it."],
    ],
    "The gap is not empty. It is where choice becomes possible.",
    "How wide was the gap today?",
    "Once today, find one gap before you act on a feeling.",
  ),
  s(
    "obs-l3-06", 3, "emotion", "open", "any", [5, 10, 20], "horizon", "krishnamurti",
    [
      ["Weather", "See this emotion as weather, not as you."],
      ["Sky", "You are not the rain. You are the sky it moves through."],
      ["Pass", "Watch it change without pushing it away."],
    ],
    "Weather passes. The sky does not need to be fixed.",
    "What weather was moving through you today?",
    "Once today, call a feeling weather and watch it pass.",
  ),
  s(
    "obs-l3-07", 3, "emotion", "rest", "night", [10, 15, 20], "orb-still", "buddha",
    [
      ["Allow", "Stop trying to feel better for three minutes."],
      ["Stay", "Stay with exactly what is here."],
      ["Kind", "Add one line of kindness to the feeling."],
    ],
    "Healing begins when the feeling is allowed to stay.",
    "What changed when you stopped trying to fix it?",
    "Once tonight, let one uncomfortable feeling be there for ten seconds.",
  ),
  s(
    "obs-l3-08", 3, "emotion", "scan", "midday", [5, 10, 20], "orb-pulse", "shiva",
    [
      ["Heat", "Recall the last time you were angry. Feel the heat now."],
      ["Location", "Where is it — chest, jaw, hands?"],
      ["Drop", "Let the heat be heat, not a story about who was wrong."],
    ],
    "Anger is heat. The story is optional.",
    "What did the heat want you to do?",
    "Once today, feel the heat of an irritation before naming it.",
  ),
  s(
    "obs-l3-09", 3, "emotion", "noting", "evening", [10, 15, 20], "orb-still", "buddha",
    [
      ["Weight", "Bring to mind something you are sad about. Feel the weight."],
      ["Chest", "Let the chest be heavy without collapsing."],
      ["Hold", "Hold the weight gently, like a sleeping child."],
    ],
    "Sadness does not need to be solved to be held.",
    "What did the sadness ask for?",
    "Once tonight, put a hand on your chest when sadness arrives.",
  ),
  s(
    "obs-l3-10", 3, "emotion", "scan", "any", [5, 10, 20], "horizon", "shiva",
    [
      ["Tightness", "Find the place that is bracing — stomach, throat, shoulders."],
      ["Breathe", "Breathe toward it, not away from it."],
      ["Soft", "Ask it to soften by one percent. No more."],
    ],
    "Fear is a body preparing for something that is not here.",
    "What was the body preparing for?",
    "Once today, breathe toward one tight place.",
  ),
  s(
    "obs-l3-11", 3, "emotion", "open", "morning", [5, 10, 20], "orb-pulse", "krishna",
    [
      ["Joy", "Recall one small moment of gladness from this week."],
      ["Spread", "Let it spread through the chest without grabbing it."],
      ["Share", "Silently offer the warmth to someone else."],
    ],
    "Joy grows when it is not held.",
    "Where did the joy spread to?",
    "Once today, share one small gladness.",
  ),
  s(
    "obs-l3-12", 3, "emotion", "labeling", "any", [10, 15, 20], "horizon", "buddha",
    [
      ["Neutral", "Find a moment that is neither pleasant nor unpleasant."],
      ["Notice", "This is the tone most people skip."],
      ["Stay", "Stay in the neutral for one full minute."],
    ],
    "Neutral is not emptiness. It is the tone you keep overlooking.",
    "What did you find in the neutral?",
    "Once today, notice one neutral moment without filling it.",
  ),
  s(
    "obs-l3-13", 3, "emotion", "noting", "evening", [10, 15, 20], "orb-still", "krishnamurti",
    [
      ["Story", "Notice the story that is feeding today's feeling."],
      ["Separate", "Feel the feeling and hear the story as two things."],
      ["Drop", "Let the story drop. Keep the feeling, if it stays."],
    ],
    "The feeling is real. The story is usually rehearsed.",
    "Which story was feeding the feeling?",
    "Once tonight, notice one story before believing it.",
  ),
  s(
    "obs-l3-14", 3, "emotion", "rest", "night", [10, 15, 20], "orb-still", "buddha",
    [
      ["Wave", "Let one feeling rise and crest, without acting."],
      ["Fall", "Watch it fall on its own."],
      ["Rest", "Rest in the flat water after the wave."],
    ],
    "Every wave ends. You do not have to end it.",
    "What was left after the wave passed?",
    "Once tonight, let one feeling finish without interrupting it.",
  ),
];
