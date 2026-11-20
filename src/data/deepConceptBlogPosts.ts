// Generates another 10,000+ concept blog posts across 20 further families.
// Mirrors newConceptBlogPosts.ts.

import { slugify } from "@/lib/seoUtils";
import type { BlogPost } from "./blogPosts";

interface Angle {
  slug: string;
  label: string;
  lens: string;
}

interface Family {
  slug: string;
  label: string;
  description: string;
  subtopics: string[];
}

const ANGLES: Angle[] = [
  { slug: "what-it-is", label: "What it actually is", lens: "A plain-language definition and the mechanism underneath." },
  { slug: "how-it-shows-up", label: "How it shows up", lens: "The everyday signatures and hidden forms." },
  { slug: "why-it-happens", label: "Why it happens", lens: "The nervous-system, developmental, and cultural roots." },
  { slug: "the-practice", label: "The practice", lens: "A small concrete move that begins to shift it." },
  { slug: "the-trap", label: "The trap", lens: "How the ego turns the concept into another achievement." },
  { slug: "the-shadow", label: "The shadow side", lens: "What gets disowned and projected." },
  { slug: "in-relationships", label: "In relationships", lens: "How it plays out between people." },
  { slug: "in-work", label: "In work and money", lens: "How it shapes effort, value, and enoughness." },
  { slug: "in-the-body", label: "In the body", lens: "The somatic signature and regulation path." },
  { slug: "integration", label: "Integration", lens: "Bringing the insight into daily life." },
];

const FAMILIES: Family[] = [
  {
    slug: "consciousness-states",
    label: "Consciousness States",
    description: "The states consciousness can inhabit.",
    subtopics: ["Sleep","Dreaming","Lucid Dreaming","Hypnagogic","Hypnopompic","Trance","Flow","Peak Experience","Mystical Experience","Unity","Emptiness","Void","Presence","Absorption","Samadhi","Jhana","Satori","Kensho","Dark Night","Ego Death","Rebirth","Awakening","Liberation","Enlightenment","Nirvana","Moksha","Kaivalya","Sahaja","Turiya","Witnessing Sleep","Yoga Nidra","Rest","Restoration","Altered States","Breath Induced","Movement Induced","Sound Induced","Silence","Fasting","Sensory Deprivation","Meditation","Contemplation","Prayer","Devotion","Surrender","Grace","Ecstasy","Bliss","Serenity","Clarity"],
  },
  {
    slug: "attention-focus",
    label: "Attention and Focus",
    description: "The mechanics and ethics of attention.",
    subtopics: ["Selective Attention","Sustained Attention","Divided Attention","Open Monitoring","Meta Attention","Distraction","Mind Wandering","Flow State","Hyperfocus","Attention Residue","Context Switching","Deep Work","Shallow Work","Attention Training","Attention Restoration","Nature and Attention","Attention and Sleep","Attention and Emotion","Attention and Memory","Attention and Decision","Attention and Creativity","Attention and Relationships","Attention and Technology","Attention Economy","Attention Ethics","Attention and Aging","Attention and Children","Attention and Learning","Attention and Trauma","Attention and Healing","Attention and Spirituality","Attention and Prayer","Attention and Mantra","Attention and Breath","Attention and Body","Attention and Pain","Attention and Pleasure","Attention and Time","Attention and Space","Attention and Self","Attention and Other","Attention and World","Attention and Beauty","Attention and Truth","Attention and Goodness","Attention and Love","Attention and Wisdom","Attention and Compassion","Attention and Justice","Attention and Freedom"],
  },
  {
    slug: "perception-senses",
    label: "Perception and Senses",
    description: "How experience is constructed through the senses.",
    subtopics: ["Vision","Hearing","Touch","Taste","Smell","Proprioception","Interoception","Exteroception","Synesthesia","Sensory Overload","Sensory Deprivation","Sensory Grounding","Sensory Awareness","Sensory Pleasure","Sensory Pain","Sensory Memory","Sensory Imagination","Sensory Meditation","Sensory Ritual","Sensory Art","Sensory Nature","Sensory Food","Sensory Music","Sensory Color","Sensory Texture","Sensory Temperature","Sensory Space","Sensory Time","Sensory Self","Sensory Other","Sensory World","Sensory Beauty","Sensory Truth","Sensory Goodness","Sensory Love","Sensory Wisdom","Sensory Compassion","Sensory Justice","Sensory Freedom","Sensory Play","Sensory Rest","Sensory Movement","Sensory Stillness","Sensory Breath","Sensory Touch Therapy","Sensory Sound Therapy","Sensory Light Therapy","Sensory Aromatherapy","Sensory Hydrotherapy"],
  },
  {
    slug: "memory-identity",
    label: "Memory and Identity",
    description: "How memory and identity co-create each other.",
    subtopics: ["Autobiographical Memory","Episodic Memory","Semantic Memory","Procedural Memory","Working Memory","Short Term Memory","Long Term Memory","Forgetting","Remembering","Nostalgia","Reminiscence","Life Review","Identity","Self Concept","Narrative Identity","Possible Selves","Future Self","Past Self","Multiple Selves","False Self","True Self","Core Self","Social Identity","Cultural Identity","Gender Identity","Professional Identity","Spiritual Identity","Identity Crisis","Identity Integration","Identity Flexibility","Memory and Emotion","Memory and Body","Memory and Place","Memory and Time","Memory and Relationship","Memory and Trauma","Memory and Healing","Memory and Forgiveness","Memory and Grief","Memory and Joy","Memory and Meaning","Memory and Purpose","Memory and Values","Memory and Beliefs","Memory and Habits","Memory and Skills","Memory and Wisdom","Memory and Aging","Memory and Children","Memory and Elders"],
  },
  {
    slug: "language-communication",
    label: "Language and Communication",
    description: "Words, silence, and the space between.",
    subtopics: ["Words and Reality","Naming","Silence","Listening","Speaking","Writing","Reading","Storytelling","Metaphor","Poetry","Prayer","Mantra","Chant","Song","Conversation","Dialogue","Monologue","Language and Thought","Language and Emotion","Language and Body","Language and Culture","Language and Power","Language and Truth","Language and Deception","Language and Healing","Language and Harm","Language and Love","Language and Conflict","Language and Repair","Language and Boundaries","Language and Intimacy","Language and Community","Language and Self","Language and Other","Language and World","Language and Beauty","Language and Wisdom","Language and Compassion","Language and Justice","Language and Freedom","Language and Play","Language and Ritual","Language and Meditation","Language and Presence","Language and Absence","Language and Memory","Language and Future","Language and Past","Language and Time","Language and Space"],
  },
  {
    slug: "space-place",
    label: "Space and Place",
    description: "How environments shape inner life.",
    subtopics: ["Home","Sanctuary","Temple","Sacred Space","City","Nature","Wilderness","Room","Corner","Altar","Threshold","Doorway","Window","Garden","Kitchen","Bedroom","Bathroom","Workspace","Retreat","Pilgrimage","Journey","Place Attachment","Place Identity","Place Memory","Place Healing","Place and Body","Place and Emotion","Place and Mind","Place and Spirit","Place and Community","Place and Solitude","Place and Belonging","Place and Exclusion","Place and Power","Place and Safety","Place and Danger","Place and Beauty","Place and Truth","Place and Goodness","Place and Love","Place and Wisdom","Place and Compassion","Place and Justice","Place and Freedom","Place and Play","Place and Rest","Place and Work","Place and Ritual","Place and Prayer","Place and Meditation"],
  },
  {
    slug: "learning-education",
    label: "Learning and Education",
    description: "How we learn, teach, and grow.",
    subtopics: ["Curiosity","Wonder","Study","Practice","Repetition","Mastery","Beginners Mind","Teaching","Mentoring","Coaching","Apprenticeship","School","University","Lifelong Learning","Self Education","Reading","Note Taking","Reflection","Application","Integration","Forgetting","Spaced Repetition","Interleaving","Testing","Feedback","Failure","Struggle","Plateau","Breakthrough","Expertise","Tacit Knowledge","Explicit Knowledge","Wisdom","Understanding","Comprehension","Insight","Aha","Confusion","Clarity","Doubt","Certainty","Question","Inquiry","Research","Experimentation","Discovery","Invention","Innovation","Learning Communities","Learning and Aging","Learning and Children"],
  },
  {
    slug: "play-games",
    label: "Play and Games",
    description: "Play as a path to awareness.",
    subtopics: ["Play","Game","Sport","Competition","Cooperation","Rules","Fairness","Winning","Losing","Fun","Joy","Flow","Challenge","Skill","Chance","Strategy","Tactics","Team","Solo","Playfulness","Humor","Laughter","Teasing","Joking","Improvisation","Pretend","Imagination","Creativity","Exploration","Discovery","Risk","Safety","Boundaries","Turn Taking","Sharing","Cheating","Honesty","Games in Therapy","Games in Education","Games in Work","Games in Relationships","Games and Ego","Games and Shadow","Games and Spirituality","Games and Meditation","Games and Mindfulness","Games and Body","Games and Mind","Games and Emotion","Games and Community","Games and Culture","Games and Aging","Games and Children"],
  },
  {
    slug: "spirituality-deep",
    label: "Spirituality Deep",
    description: "The deeper spiritual path.",
    subtopics: ["Prayer","Devotion","Surrender","Grace","Faith","Doubt","Mystery","Sacred","Holy","Divine","God","Goddess","Spirit","Soul","Self","Atman","Brahman","Emptiness","Fullness","Transcendence","Immanence","Unity","Duality","Non Duality","Mysticism","Contemplation","Meditation","Mantra","Japa","Puja","Ritual","Pilgrimage","Satsang","Guru","Disciple","Lineage","Tradition","Innovation","Syncretism","Universalism","Particularism","Inclusivity","Exclusivity","Fundamentalism","Liberalism","Orthodoxy","Heterodoxy","Heresy","Mystic","Saint","Sage","Rishi","Prophet","Avatar","Bodhisattva","Arhat","Jivanmukta","Paramahamsa"],
  },
  {
    slug: "philosophy",
    label: "Philosophy",
    description: "The examined life.",
    subtopics: ["Existence","Being","Non Being","Essence","Appearance","Reality","Illusion","Truth","Knowledge","Belief","Doubt","Certainty","Skepticism","Phenomenology","Existentialism","Pragmatism","Idealism","Materialism","Dualism","Monism","Pluralism","Holism","Reductionism","Systems","Complexity","Emergence","Causality","Determinism","Free Will","Compatibilism","Incompatibilism","Ethics","Aesthetics","Logic","Metaphysics","Epistemology","Ontology","Hermeneutics","Dialectic","Deconstruction","Postmodernism","Stoicism","Epicureanism","Cynicism","Asceticism","Hedonism","Utilitarianism","Deontology","Virtue Ethics","Care Ethics","Existential Ethics"],
  },
  {
    slug: "science-body",
    label: "Science and Body",
    description: "The body through a scientific lens.",
    subtopics: ["Neuroscience","Psychology","Biology","Physiology","Anatomy","Brain","Nervous System","Hormones","Immune","Gut","Microbiome","Sleep Science","Nutrition Science","Exercise Science","Aging Science","Genetics","Epigenetics","Neuroplasticity","Neurogenesis","Synapse","Myelin","Dopamine","Serotonin","Oxytocin","Cortisol","Adrenaline","GABA","Glutamate","Acetylcholine","Endorphins","Endocannabinoids","Vagus","Amygdala","Hippocampus","Prefrontal","Insula","Default Mode","Salience Network","Executive Network","Attention Network","Memory Systems","Emotion Systems","Perception Systems","Motor Systems","Autonomic","Sympathetic","Parasympathetic","Enteric","Somatic","Visceral","Interoception","Proprioception"],
  },
  {
    slug: "culture-society",
    label: "Culture and Society",
    description: "Awareness in the collective.",
    subtopics: ["Media","News","Social Media","Television","Film","Music","Art","Literature","Theater","Dance","Fashion","Design","Architecture","Food Culture","Travel","Tourism","Sport Culture","Religion in Society","Spirituality in Society","Politics","Economics","Education","Healthcare","Law","Justice","Crime","Punishment","Rehabilitation","Community","Neighborhood","City","Rural","Urban","Suburb","Village","Tribe","Nation","Global","Local","Identity Politics","Culture War","Polarization","Dialogue","Reconciliation","Forgiveness","Equity","Inclusion","Diversity","Belonging","Exclusion","Othering","Stereotyping","Prejudice","Discrimination","Racism","Sexism","Ageism","Ableism","Classism","Xenophobia","Homophobia","Transphobia","Tolerance","Acceptance","Celebration","Allyship","Solidarity","Activism","Protest","Reform","Revolution","Evolution","Progress","Tradition","Heritage"],
  },
  {
    slug: "work-vocation",
    label: "Work and Vocation",
    description: "Conscious work and calling.",
    subtopics: ["Calling","Vocation","Profession","Career","Job","Work","Labor","Craft","Service","Contribution","Purpose","Meaning","Value","Worth","Productivity","Efficiency","Effectiveness","Performance","Excellence","Mastery","Skill","Talent","Expertise","Beginner","Apprentice","Journeyman","Master","Teacher","Mentor","Coach","Leader","Follower","Colleague","Team","Organization","Company","Startup","Corporation","Nonprofit","Government","NGO","Cooperative","Collective","Union","Guild","Freelance","Gig","Remote","Hybrid","Office","Workspace","Tools","Technology","Automation","AI","Future of Work","Work Life Balance","Work Life Integration","Burnout","Engagement","Disengagement","Quiet Quitting","Overwork","Underwork","Unemployment","Underemployment","Meaningful Work","Meaningless Work","Essential Work","Care Work","Emotional Labor","Invisible Labor","Domestic Labor","Creative Labor","Intellectual Labor","Manual Labor","Service Labor","Knowledge Work","Information Work","Attention Work"],
  },
  {
    slug: "relationships-deep",
    label: "Relationships Deep",
    description: "Intimacy, conflict, and connection.",
    subtopics: ["Partnership","Marriage","Divorce","Separation","Remarriage","Blended Family","Single","Dating","Courtship","Intimacy","Sexuality","Sensuality","Pleasure","Desire","Attraction","Repulsion","Commitment","Monogamy","Non Monogamy","Polyamory","Open Relationship","Celibacy","Abstinence","Consent","Boundaries","Communication","Conflict","Repair","Trust","Betrayal","Jealousy","Envy","Possessiveness","Freedom","Autonomy","Interdependence","Codependency","Independence","Attachment","Security","Safety","Danger","Vulnerability","Authenticity","Honesty","Deception","Secrets","Privacy","Sharing","Space","Closeness","Distance","Pursuit","Withdrawal","Demand","Criticize","Defend","Stonewall","Contempt","Respect","Admiration","Appreciation","Gratitude","Resentment","Forgiveness","Reconciliation","Healing","Growth","Stagnation","Boredom","Novelty","Routine","Ritual","Tradition","Innovation","Evolution","Dissolution","Ending","Grief","Loss","Memory","Legacy"],
  },
  {
    slug: "mindfulness-meditation",
    label: "Mindfulness and Meditation",
    description: "The practice of awareness itself.",
    subtopics: ["Mindfulness","Meditation","Concentration","Contemplation","Prayer","Mantra","Japa","Visualization","Body Scan","Breath Awareness","Open Monitoring","Focused Attention","Loving Kindness","Compassion","Tonglen","Zen","Vipassana","Samatha","Metta","Walking Meditation","Sitting Meditation","Lying Meditation","Standing Meditation","Movement Meditation","Eating Meditation","Speaking Meditation","Listening Meditation","Working Meditation","Resting Meditation","Sleeping Meditation","Dreaming Meditation","Waking Meditation","Daily Life Meditation","Formal Practice","Informal Practice","Retreat","Intensive","Short Practice","Long Practice","Group Practice","Solo Practice","Guided","Unguided","Silent","Vocal","With Music","Without Music","With Mantra","Without Mantra","With Object","Without Object","With Breath","Without Breath","With Body","Without Body","With Mind","Without Mind","With Heart","Without Heart"],
  },
  {
    slug: "yoga-practices",
    label: "Yoga Practices",
    description: "The yogic path in daily life.",
    subtopics: ["Asana","Pranayama","Dharana","Dhyana","Pratyahara","Yama","Niyama","Bandha","Mudra","Mantra","Kriya","Shatkarma","Nidra","Kundalini","Hatha","Raja","Bhakti","Jnana","Karma","Tantra","Mantra Yoga","Laya Yoga","Kriya Yoga","Ashtanga","Vinyasa","Iyengar","Restorative","Yin","Power Yoga","Gentle Yoga","Chair Yoga","Prenatal Yoga","Kids Yoga","Senior Yoga","Therapeutic Yoga","Yoga Therapy","Yoga Philosophy","Yoga Sutras","Bhagavad Gita","Patanjali","Hatha Pradipika","Gheranda Samhita","Shiva Samhita","Yoga Nidra","Yoga for Sleep","Yoga for Stress","Yoga for Anxiety","Yoga for Depression","Yoga for Pain","Yoga for Aging"],
  },
  {
    slug: "breath-pranayama",
    label: "Breath and Pranayama",
    description: "The breath as bridge.",
    subtopics: ["Breath Awareness","Diaphragmatic Breathing","Box Breathing","Coherent Breathing","Resonant Breathing","4-7-8","Alternate Nostril","Bhramari","Kapalabhati","Bhastrika","Ujjayi","Sitali","Sitkari","Anuloma Viloma","Nadi Shodhana","Surya Bhedana","Chandra Bhedana","Murcha","Plavini","Kevali Kumbhaka","Breath Retention","Breath Suspension","Breath and Emotion","Breath and Thought","Breath and Body","Breath and Mind","Breath and Spirit","Breath and Sleep","Breath and Energy","Breath and Stress","Breath and Anxiety","Breath and Pain","Breath and Trauma","Breath and Healing","Breath and Performance","Breath and Sport","Breath and Voice","Breath and Singing","Breath and Speech","Breath and Silence","Breath and Prayer","Breath and Mantra","Breath and Meditation","Breath and Yoga","Breath and Tantra","Breath and Kundalini","Breath and Chakras","Breath and Nervous System","Breath and Vagus"],
  },
  {
    slug: "somatic-bodywork",
    label: "Somatic Bodywork",
    description: "The body as teacher.",
    subtopics: ["Body Scan","Somatic Tracking","Felt Sense","Interoception","Proprioception","Touch","Massage","Bodywork","Rolfing","Craniosacral","Fascia","Myofascial","Trigger Points","Tension Release","Shaking","Tremoring","Dance","Movement","Stretching","Yoga","Tai Chi","Qigong","Martial Arts","Walking","Running","Swimming","Cycling","Strength","Endurance","Flexibility","Balance","Coordination","Posture","Alignment","Ergonomics","Body Image","Body Acceptance","Body Neutrality","Body Positivity","Body Grief","Body Joy","Body and Trauma","Body and Healing","Body and Memory","Body and Emotion","Body and Mind","Body and Spirit","Body and Breath","Body and Energy","Body and Sleep","Body and Aging"],
  },
  {
    slug: "dreams-sleep",
    label: "Dreams and Sleep",
    description: "Sleep and dreaming as practice.",
    subtopics: ["Sleep Hygiene","Sleep Cycles","REM Sleep","Deep Sleep","Light Sleep","Insomnia","Sleep Apnea","Narcolepsy","Lucid Dreaming","Dream Recall","Dream Journaling","Dream Interpretation","Nightmares","Night Terrors","Sleep Paralysis","Hypnagogic","Hypnopompic","Sleep and Memory","Sleep and Emotion","Sleep and Learning","Sleep and Creativity","Sleep and Healing","Sleep and Aging","Sleep and Children","Sleep and Elders","Sleep and Stress","Sleep and Anxiety","Sleep and Depression","Sleep and Trauma","Sleep and Grief","Sleep Deprivation","Sleep Debt","Naps","Power Naps","Polyphasic Sleep","Circadian Rhythms","Melatonin","Light and Sleep","Darkness and Sleep","Temperature and Sleep","Noise and Sleep","Bedroom Environment","Sleep Rituals","Bedtime Routine","Morning Routine","Sleep and Spirituality","Sleep and Dreams","Sleep and Meditation","Sleep and Yoga Nidra","Sleep and Rest"],
  },
  {
    slug: "devotion-surrender",
    label: "Devotion and Surrender",
    description: "The path of the heart.",
    subtopics: ["Bhakti","Devotion","Surrender","Grace","Faith","Trust","Love","Worship","Puja","Ritual","Mantra","Chant","Kirtan","Bhajan","Prayer","Invocation","Offering","Sacrifice","Dedication","Commitment","Vow","Oath","Promise","Fidelity","Loyalty","Allegiance","Reverence","Awe","Wonder","Gratitude","Thanksgiving","Praise","Glorification","Adoration","Veneration","Respect","Honor","Humility","Modesty","Meekness","Obedience","Submission","Yielding","Letting Go","Releasing","Acceptance","Allowing","Permitting","Tolerating","Enduring","Bearing","Carrying","Holding","Embracing","Welcoming","Receiving","Opening","Softening","Melting","Dissolving","Merging","Union","Communion","Oneness","Non Duality","Bhakti Yoga","Sufism","Christian Mysticism","Jewish Mysticism","Buddhist Devotion","Tibetan Devotion","Hindu Devotion","Sikh Devotion","Jain Devotion","Devotional Music","Devotional Art","Devotional Poetry","Devotional Dance","Devotional Service"],
  },
];

function conceptToMarkdown(family: Family, subtopic: string, angle: Angle): string {
  return "> " + family.label + " - " + subtopic + " - " + angle.label + "\n\n" +
    "## What this concept actually is\n\n" +
    subtopic + " is a doorway into " + family.label.toLowerCase() + ". " + family.description + " " + angle.lens + "\n\n" +
    "This essay is not a definition. It is a working map: what the concept is, how it hides in ordinary life, and the small move that begins to change your relationship to it. Read it once for the idea. Return to it when the concept shows up in your own life - that is when it becomes useful.\n\n" +
    "## How it shows up in daily life\n\n" +
    "- It rarely announces itself. It wears the costume of normalcy.\n" +
    "- It feels like just how things are until you see it from the outside.\n" +
    "- The body knows before the mind does. Track the sensation, not the story.\n" +
    "- It repeats. The repetition is the teacher, not the enemy.\n" +
    "- It softens when witnessed without judgment.\n\n" +
    "## Why it happens\n\n" +
    "Nothing here is a personal failing. These patterns are the nervous system doing its best with the information it had at the time. The roots are developmental, cultural, and biological - layered, not single-cause. Seeing the roots does not excuse the pattern; it makes it workable. You cannot argue a nervous system into safety. You can offer it a new experience, repeatedly, until it updates.\n\n" +
    "## The practice\n\n" +
    angle.lens + " Pick one moment today where this concept is active. Slow down two seconds before reacting. Name it silently. Do one small thing the pattern would never do. That is the whole practice. Not a cure. An interruption. Interruptions compound.\n\n" +
    "## The trap\n\n" +
    "The ego will try to turn this into another achievement - I have mastered " + subtopic.toLowerCase() + ". That is the same loop wearing a wiser mask. The practice is not to be good at it. The practice is to see it, again and again, without needing to be done with it.\n\n" +
    "## The shadow side\n\n" +
    "What we disown does not disappear; it drives from the back seat. The shadow of " + subtopic.toLowerCase() + " is not its opposite - it is its unacknowledged twin. Bring it into the room gently. Naming is not fixing; naming is the first honest contact.\n\n" +
    "## In relationships\n\n" +
    "Between people, this concept becomes a dance. Each partner carries half the pattern. The work is not to fix the other; it is to own your half with enough honesty that the system can reorganize. Speak one unsaid sentence. Stay present for what comes back.\n\n" +
    "## In work and money\n\n" +
    "Effort and value get tangled here. Notice where you over-give, under-charge, or equate productivity with worth. The correction is not a new strategy; it is a new relationship with enoughness. Do the work, then let the work be enough.\n\n" +
    "## In the body\n\n" +
    "The somatic signature is the truth-teller. Locate the sensation before the story. Breathe into it without trying to change it. The body updates through experience, not argument. A long exhale, a shake, a slow stretch - these are the languages the nervous system trusts.\n\n" +
    "## Integration\n\n" +
    "Bring the insight into one ordinary moment today. Not a special practice session - the kitchen, the commute, the conversation. Integration is not an event; it is the slow migration of awareness from the cushion into the day. Track it weekly. Celebrate small shifts. They compound.\n\n" +
    "-- HOPE Deep Concept Atlas";
}

export function deepConceptsAsBlogPosts(): BlogPost[] {
  const publishedAt = "2025-01-01T00:00:00.000Z";
  const out: BlogPost[] = [];
  let idx = 0;
  for (const family of FAMILIES) {
    for (const subtopic of family.subtopics) {
      for (const angle of ANGLES) {
        idx += 1;
        const slug = "deepconcept-" + family.slug + "-" + slugify(subtopic) + "-" + angle.slug + "-" + idx;
        out.push({
          slug,
          title: subtopic + " - " + angle.label + " - " + family.label,
          keyword: subtopic + ", " + family.label + ", " + angle.label + ", consciousness, awareness, practice",
          pillar: "Deep Concepts - " + family.label,
          metaDescription: subtopic + " through the lens of " + angle.label.toLowerCase() + ": what it is, how it shows up, and the small practice that begins to shift it.",
          content: conceptToMarkdown(family, subtopic, angle),
          publishedAt,
        } satisfies BlogPost);
      }
    }
  }
  return out;
}
