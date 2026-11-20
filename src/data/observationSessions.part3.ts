/**
 * Observation Sessions — L6–L7 seeds (30 of 100).
 * L6 · Watcher Watching. L7 · Choiceless Awareness.
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

export const OBS_SEEDS_L6_L7: ObsSeed[] = [
  // ───────────────────────── L6 · WATCHER WATCHING (14) ─────────────────────
  s(
    "obs-l6-01", 6, "watcher", "neti-neti", "any", [15, 20, 30], "orb-still", "ramana",
    [
      ["Turn", "For fifteen levels of practice you watched objects. Now turn around."],
      ["Ask", "Ask gently: who is watching?"],
      ["No Answer", "Do not answer with a thought. Feel where attention turns."],
    ],
    "The watcher cannot be found as an object — and that is the answer.",
    "What happened when you looked for the watcher?",
    "Once today, ask who is aware and stay quiet for ten seconds.",
    "witness:sakshi-eye",
  ),
  s(
    "obs-l6-02", 6, "watcher", "rest", "morning", [15, 20, 30], "horizon", "krishnamurti",
    [
      ["Prior", "Notice that awareness is here before the next thought."],
      ["Earlier", "Look for the moment awareness started. You will not find it."],
      ["Rest", "Rest in the awareness that has no beginning today."],
    ],
    "Awareness is not produced by you. It is what you already are.",
    "What was present before the first thought of the day?",
    "Once today, notice awareness before a thought finishes.",
  ),
  s(
    "obs-l6-03", 6, "watcher", "open", "any", [15, 20, 30], "orb-pulse", "ramana",
    [
      ["Look", "Look for the one who is looking."],
      ["Empty", "Notice the looking has no looker behind it."],
      ["Stay", "Stay in the looking itself, without a position."],
    ],
    "Seeing does not require a seer standing apart.",
    "What did you find when you looked for the looker?",
    "Once today, look without checking who is looking.",
    "ramana:who-am-i",
  ),
  s(
    "obs-l6-04", 6, "watcher", "neti-neti", "any", [15, 20, 30], "orb-still", "ramana",
    [
      ["Not Body", "Say: I am not the body. Feel if that is true."],
      ["Not Mind", "Say: I am not the mind. Feel if that is true."],
      ["Remain", "Whatever remains, stay with it without naming it."],
    ],
    "What remains after every not-this is what you are.",
    "What remained after the not-this?",
    "Once today, say not this to one thing you believe you are.",
  ),
  s(
    "obs-l6-05", 6, "watcher", "rest", "night", [15, 20, 30], "orb-still", "krishnamurti",
    [
      ["Background", "Notice the background of awareness behind all experience."],
      ["Contents", "Let thoughts and sounds be the foreground."],
      ["Rest", "Rest as the background, not the contents."],
    ],
    "You have been the background all along.",
    "What was the background like?",
    "Once tonight, rest as background for one minute.",
  ),
  s(
    "obs-l6-06", 6, "watcher", "open", "midday", [15, 20, 30], "horizon", "krishnamurti",
    [
      ["Gap", "Find the space between two experiences."],
      ["Wide", "Let the space be wider than the experiences."],
      ["Space", "Stay as the space, not as what fills it."],
    ],
    "The space does not need to be filled.",
    "How wide did the space become?",
    "Once today, notice the space between two things.",
  ),
  s(
    "obs-l6-07", 6, "watcher", "rest", "morning", [15, 20, 30], "orb-pulse", "ramana",
    [
      ["I Am", "Rest with the feeling I am, before adding anything to it."],
      ["No Word", "Let the words I am dissolve into the feeling."],
      ["Stay", "Stay in the wordless I am."],
    ],
    "I am is prior to every description of who you are.",
    "What was I am like without a description?",
    "Once today, feel I am before saying anything else.",
  ),
  s(
    "obs-l6-08", 6, "watcher", "neti-neti", "any", [20, 30, 45], "orb-still", "ramana",
    [
      ["Watcher", "Notice the watcher of your thoughts."],
      ["Watching", "Now notice what is watching the watcher."],
      ["Rest", "Rest in that which cannot be watched."],
    ],
    "The last watcher dissolves into awareness itself.",
    "What happened when you looked behind the watcher?",
    "Once today, look behind one watcher.",
  ),
  s(
    "obs-l6-09", 6, "watcher", "rest", "any", [15, 20, 30], "horizon", "krishnamurti",
    [
      ["Effort", "Notice the effort of watching. Let it drop."],
      ["No Task", "There is nothing to watch now. Only aware presence."],
      ["Rest", "Rest without a task. Nothing to watch, nothing to hold."],
    ],
    "Watching is a doing. Awareness is not.",
    "What remained when the effort dropped?",
    "Once today, stop watching and just be aware.",
  ),
  s(
    "obs-l6-10", 6, "watcher", "open", "night", [15, 20, 30], "orb-still", "buddha",
    [
      ["Silence", "Listen to the silence behind the sounds."],
      ["Ask", "Who is aware of this silence?"],
      ["Stay", "Stay with the one who hears silence."],
    ],
    "Silence is not the absence of sound. It is what hears it.",
    "What did the silence feel like?",
    "Once tonight, listen to the silence between sounds.",
  ),
  s(
    "obs-l6-11", 6, "watcher", "neti-neti", "any", [15, 20, 30], "orb-pulse", "ramana",
    [
      ["Seer", "Notice the seer inside seeing."],
      ["Seen", "Notice the seen has no separate existence."],
      ["One", "Let seer and seen collapse into one seeing."],
    ],
    "The observer is the observed — and then even that falls away.",
    "Did seer and seen stay separate?",
    "Once today, notice one moment of pure seeing.",
  ),
  s(
    "obs-l6-12", 6, "watcher", "open", "any", [15, 20, 30], "horizon", "krishnamurti",
    [
      ["Light", "Imagine the light that makes all experience visible."],
      ["Source", "Do not look for the lamp. Just notice the light."],
      ["Rest", "Rest as the light, not as the objects."],
    ],
    "You are the light by which the world is known.",
    "What did it feel like to rest as light?",
    "Once today, notice the light of awareness in one thing.",
  ),
  s(
    "obs-l6-13", 6, "watcher", "rest", "evening", [15, 20, 30], "orb-still", "ramana",
    [
      ["Arrive", "Arrive at the simplest fact: you are aware."],
      ["Nothing Else", "Add nothing. No story, no goal, no history."],
      ["Rest", "Rest as the fact of awareness."],
    ],
    "Awareness does not need your biography to be here.",
    "What was awareness like without a story?",
    "Once today, rest in bare awareness for ten seconds.",
  ),
  s(
    "obs-l6-14", 6, "watcher", "neti-neti", "night", [20, 30, 45], "orb-still", "ramana",
    [
      ["Body", "Say: not the body. Let the body be there anyway."],
      ["Mind", "Say: not the mind. Let thoughts pass."],
      ["Remain", "Remain as what cannot be denied or removed."],
    ],
    "What cannot be removed is what you are.",
    "What remained when body and mind were set aside?",
    "Once tonight, rest as the undeniable one.",
    "nisargadatta:i-am-that",
  ),

  // ─────────────────────── L7 · CHOICELESS AWARENESS (16) ───────────────────
  s(
    "obs-l7-01", 7, "watcher", "open", "any", [20, 30, 45], "horizon", "krishnamurti",
    [
      ["Open", "Let attention be completely open — no object chosen."],
      ["Allow", "Everything is allowed to come and go."],
      ["Rest", "Rest in the openness without steering it."],
    ],
    "Choiceless awareness is not a technique. It is what remains when technique ends.",
    "What came into the open attention?",
    "Once today, let attention be open for one minute.",
    "krishnamurti:choiceless-awareness",
  ),
  s(
    "obs-l7-02", 7, "watcher", "choiceless", "morning", [20, 30, 45], "orb-still", "krishnamurti",
    [
      ["No Method", "Drop every method you have learned."],
      ["Nothing", "There is nothing to do now."],
      ["See", "See what is already happening without you."],
    ],
    "When the method ends, the meditation begins.",
    "What was happening without your effort?",
    "Once today, do nothing for one minute.",
  ),
  s(
    "obs-l7-03", 7, "watcher", "choiceless", "any", [20, 30, 45], "horizon", "krishnamurti",
    [
      ["Allowed", "Let even the resistance be allowed."],
      ["No Preference", "No preference for stillness over noise."],
      ["Rest", "Rest in the no-preference."],
    ],
    "Preference is the last thing to let go of.",
    "What preference was still running?",
    "Once today, notice one preference without following it.",
  ),
  s(
    "obs-l7-04", 7, "sound", "choiceless", "any", [20, 30, 45], "horizon", "krishnamurti",
    [
      ["Listen", "Listen without a listener."],
      ["No Distance", "Let the sound be as close as hearing itself."],
      ["One", "Sound, hearing, and space — one event."],
    ],
    "There is no distance between you and what is heard.",
    "Was there any distance left?",
    "Once today, listen without a listener.",
    "kabir:surat-shabd",
  ),
  s(
    "obs-l7-05", 7, "watcher", "open", "any", [20, 30, 45], "orb-pulse", "krishnamurti",
    [
      ["Choose", "Notice the moment attention chooses something."],
      ["Stop", "Now stop choosing. Let attention be given."],
      ["Rest", "Rest in attention that is not yours to direct."],
    ],
    "Attention is not a muscle. It is a field.",
    "What did it feel like to stop choosing?",
    "Once today, let attention be given once.",
  ),
  s(
    "obs-l7-06", 7, "watcher", "choiceless", "night", [20, 30, 45], "orb-still", "krishnamurti",
    [
      ["Collapse", "Let the watcher and watched collapse."],
      ["No One", "Notice there is no one left to collapse."],
      ["Rest", "Rest in the collapse of watcher and watched."],
    ],
    "The observer is the observed. That is the end of the ladder.",
    "What was left after the collapse?",
    "Once tonight, let one moment have no watcher.",
  ),
  s(
    "obs-l7-07", 7, "watcher", "rest", "any", [20, 30, 45], "horizon", "krishnamurti",
    [
      ["Natural", "This is the natural state. It was never lost."],
      ["Nothing", "Nothing to attain, nothing to keep."],
      ["Rest", "Rest in the natural state, which was never lost."],
    ],
    "You were never outside the natural state.",
    "What did natural feel like?",
    "Once today, remember you have not left the natural state.",
  ),
  s(
    "obs-l7-08", 7, "watcher", "choiceless", "any", [20, 30, 45], "candle", "krishnamurti",
    [
      ["Sit", "Just sit. No object, no breath counting, no labelling."],
      ["Nothing", "Do not add anything to sitting."],
      ["Sit", "Continue sitting as the whole of the practice."],
    ],
    "Shikantaza: just sitting. Nothing added.",
    "What was sitting like without a task?",
    "Once today, sit for one minute doing nothing at all.",
    "dogen:shikantaza",
  ),
  s(
    "obs-l7-09", 7, "watcher", "open", "any", [20, 30, 45], "orb-still", "ramana",
    [
      ["Aware", "Notice awareness aware of itself."],
      ["No Object", "There is no object now — only awareness."],
      ["Rest", "Rest in awareness without an object."],
    ],
    "Awareness does not need an object to exist.",
    "What was it like without an object?",
    "Once today, notice awareness without an object.",
  ),
  s(
    "obs-l7-10", 7, "watcher", "choiceless", "any", [20, 30, 45], "horizon", "krishnamurti",
    [
      ["Attain", "Notice the desire to attain something from this sitting."],
      ["See", "See that desire as the last distance."],
      ["Drop", "Drop it. Nothing is missing."],
    ],
    "The desire to arrive is the last thing keeping you from here.",
    "What were you hoping to attain?",
    "Once today, drop one desire to arrive.",
  ),
  s(
    "obs-l7-11", 7, "sensation", "open", "morning", [20, 30, 45], "horizon", "buddha",
    [
      ["Ordinary", "Look at something ordinary — a cup, a wall, a hand."],
      ["Fresh", "See it as if for the first time, with no name."],
      ["Whole", "Let the ordinary be completely enough."],
    ],
    "The ordinary is only ordinary because you have stopped looking.",
    "What did the ordinary object become?",
    "Once today, look at one ordinary thing without naming it.",
  ),
  s(
    "obs-l7-12", 7, "watcher", "rest", "any", [20, 30, 45], "orb-pulse", "krishnamurti",
    [
      ["Here", "Nothing is missing from this moment."],
      ["Already", "This was here before you started and will be here after."],
      ["Rest", "Rest in the already-here."],
    ],
    "What you are looking for is what is looking.",
    "What was already here?",
    "Once today, notice one already-here moment.",
  ),
  s(
    "obs-l7-13", 7, "watcher", "open", "night", [20, 30, 45], "orb-still", "krishnamurti",
    [
      ["Space", "Feel the space in the room and the space in the mind as one space."],
      ["Contents", "Let the contents be small and the space large."],
      ["Rest", "Rest as the space that holds all of it."],
    ],
    "Space is not empty. It holds everything without effort.",
    "Was space inside or outside?",
    "Once tonight, rest as space for one minute.",
  ),
  s(
    "obs-l7-14", 7, "watcher", "choiceless", "any", [20, 30, 45], "horizon", "krishnamurti",
    [
      ["Effort", "Notice the last effort — the effort to not make effort."],
      ["See", "See it and let it go too."],
      ["Fall", "Let everything fall. Nothing needs holding."],
    ],
    "Even the effort to be effortless is an effort.",
    "What remained when the last effort fell?",
    "Once today, let one thing fall without catching it.",
  ),
  s(
    "obs-l7-15", 7, "watcher", "rest", "evening", [20, 30, 45], "orb-still", "krishnamurti",
    [
      ["What Is", "Rest in what is, exactly as it is."],
      ["No Fix", "Nothing needs fixing right now."],
      ["Complete", "Let this moment be complete."],
    ],
    "Nothing is missing from this moment except your agreement.",
    "What was already complete?",
    "Once tonight, agree with one moment as it is.",
  ),
  s(
    "obs-l7-16", 7, "watcher", "choiceless", "any", [30, 45, 60], "horizon", "krishnamurti",
    [
      ["Whole", "Let the whole field of experience be here — body, sound, thought, space."],
      ["No Center", "Notice there is no centre holding it together."],
      ["Field", "Rest as the whole field, with nothing outside it."],
    ],
    "The last level is not an achievement. It is the discovery that this was here all along.",
    "What did the whole field feel like?",
    "Once today, rest as the whole field for ten seconds.",
    "krishnamurti:choiceless-awareness",
  ),
];
