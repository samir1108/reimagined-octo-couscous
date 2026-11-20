// 5-level self-inquiry ladder — Ramana Maharshi's ātma-vichāra, made walkable.
export type InquiryLevel = {
  level: number;
  question: string;
  sanskrit?: string;
  oneLine: string;
  teaching: string;
  microPractice: string;
  commonTrap: string;
};

export const SELF_INQUIRY_LADDER: InquiryLevel[] = [
  {
    level: 1,
    question: "Who am I?",
    sanskrit: "Kohaṁ?",
    oneLine: "The first question. Asked sincerely, it dismantles every false answer.",
    teaching:
`This is the original koan of Advaita. Ramana Maharshi was sixteen when it gripped him. He lay down, simulated death, and asked: when the body dies, am *I* dead? The answer that came was not a concept. It was a direct recognition: no — *I* am still here.

When you ask "who am I?" sincerely, every easy answer falls apart. "I am John." But John is a name. "I am a teacher." But that's a role. "I am this body." But the body changes. "I am these thoughts." But thoughts come and go.

The question is not asking for an answer. It is asking you to *look*.`,
    microPractice:
`Sit quietly. Ask once: "Who am I?" Don't answer. Just feel where attention goes. Wait 30 seconds. Ask again. Wait. Three times is enough.`,
    commonTrap: "Trying to answer the question with a concept. The question is a pointer, not a quiz.",
  },
  {
    level: 2,
    question: "To whom does this thought arise?",
    sanskrit: "Kasya idam?",
    oneLine: "When a thought catches you, turn the inquiry on the thought itself.",
    teaching:
`A worry comes. Instead of getting swept into the worry, Ramana said: ask *to whom* this worry arose.

The answer is obvious: "to me." Then ask: who is this 'me'? And now you're back at the first question — but this time triggered by a real, live disturbance instead of a quiet meditation.

This is how self-inquiry becomes practical. Every difficult emotion becomes a doorway. Every loop becomes a bell ringing you home.`,
    microPractice:
`Next time a strong emotion arises, pause. Ask: "to whom does this arise?" Feel the answer "me." Then ask: "who is this me?" Don't think. Just look.`,
    commonTrap: "Using the inquiry to suppress the emotion. Don't. Let the emotion be there. The inquiry is not an escape — it's a turning.",
  },
  {
    level: 3,
    question: "What is the source of the 'I'?",
    sanskrit: "Ahaṁ kuto?",
    oneLine: "Follow the 'I' back to where it arises from.",
    teaching:
`Now the inquiry goes deeper. You've noticed that every thought, every feeling, every reaction has an "I" hidden inside it. "I am angry." "I am tired." "I want this."

Where does this "I" come from? Watch carefully. Before any specific thought arises, there's a faint sense of "I" — and then the thought attaches to it. Ramana said: trace the "I" back to its source.

You'll find the "I"-thought arises from somewhere quiet — what Ramana called the Heart. Not the physical heart. The place in you that was awake before any thought.`,
    microPractice:
`Sit. As thoughts arise, ignore the *content* and feel the "I" inside each one. Then ask: "where does this 'I' come from?" Don't answer. Just trace.`,
    commonTrap: "Looking for a literal location. The 'source' is not a place — it's the awareness in which the 'I'-thought appears.",
  },
  {
    level: 4,
    question: "Who is the one inquiring?",
    sanskrit: "Vichāraka kaḥ?",
    oneLine: "The inquiry turns on itself. Who is asking the question?",
    teaching:
`Sooner or later, the inquiry has to turn on itself. You've been asking "who am I?" — but who is asking?

This is the moment self-inquiry becomes self-defeating in the best possible way. You realise the inquirer cannot be found as an object. Every time you try to look at the looker, what you find is just… looking. Awareness. Presence. Whatever you want to call it.

This is the great recognition. The seeker is the sought. The looking *is* the looked-for.`,
    microPractice:
`Ask: "Who is asking 'who am I?'" Don't answer with thought. Just rest. Whatever you call what's left when no answer comes — *that* is what was always here.`,
    commonTrap: "Trying to catch the inquirer like catching a butterfly. You can't. And that 'can't' is the answer.",
  },
  {
    level: 5,
    question: "Rest as the source.",
    sanskrit: "Hṛdaya-nivāsa",
    oneLine: "No more questions. Just rest as what you've found.",
    teaching:
`Ramana said the inquiry ends when the inquirer dissolves. What remains is what he called *the Heart* — pure awareness, aware of itself, with no object.

There's nothing to do here. No technique. No question. Just the natural recognition that you *are* the awareness in which all of this — the body, the breath, the thoughts, the world — appears.

When you forget, return to question one. When you remember, just rest. Over years, the resting becomes the ground and the forgetting becomes the visitor.`,
    microPractice:
`Sit without a question. Without a technique. Without an answer. Just sit as the awareness that's already aware. 3 minutes. Or 3 hours. Or 30 years.`,
    commonTrap: "Believing you've 'arrived.' There's no arriving — there's only this, again and again, deeper each time.",
  },
];
