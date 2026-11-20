// Generates 10,000+ new-concept blog posts across 20 under-covered families.
// Mirrors loopBlogPosts / breakthroughBlogPosts so /blog and the Journal
// section grow past 10,000 entries without bloating public/blog-posts.json.

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
    slug: "emotions-deep",
    label: "Emotions Deep",
    description: "The fuller emotional spectrum beyond the basics.",
    subtopics: [
      "Jealousy","Envy","Resentment","Guilt","Shame","Boredom","Loneliness","Grief","Awe","Wonder","Disgust","Contempt","Pride","Humiliation","Embarrassment","Nostalgia","Longing","Yearning","Melancholy","Apathy","Indifference","Irritation","Frustration","Rage","Outrage","Spite","Malice","Tenderness","Warmth","Affection","Devotion","Compassion","Empathy","Sympathy","Pity","Gratitude","Appreciation","Joy","Delight","Ecstasy","Bliss","Serenity","Contentment","Peace","Calm","Equanimity","Acceptance","Forgiveness","Mercy","Grace","Hope","Optimism","Pessimism","Despair","Hopelessness","Anxiety","Worry","Dread","Panic","Terror","Fear","Courage","Bravery","Confidence","Insecurity","Doubt","Uncertainty",
    ],
  },
  {
    slug: "life-domains",
    label: "Life Domains",
    description: "Consciousness applied to the major arenas of life.",
    subtopics: [
      "Work as Practice","Career Calling","Money Scripts","Enoughness","Parenting as Mirror","Midlife Initiation","Aging Consciously","Digital Minimalism","Technology and Self","AI and Identity","Climate Grief","Political Polarization","Creative Livelihood","Leadership as Service","Friendship Depth","Community Building","Home as Sanctuary","Food and Awareness","Travel and Perspective","Rest and Recovery","Play and Joy","Learning for Life","Teaching and Mentoring","Legacy and Letting Go","Simplicity and Enough","Urban Awareness","Rural Awareness","Solitude Practice","Partnership as Path","Family Systems","Generational Healing","Cultural Identity","Language and Thought","Media Diet","News and Nervous System","Social Comparison","Status and Ego","Recognition Hunger","Fame and Emptiness","Ordinariness as Freedom",
    ],
  },
  {
    slug: "body-systems",
    label: "Body Systems",
    description: "The body as instrument and teacher.",
    subtopics: [
      "Sleep as Technology","Dreaming and Integration","Posture and Mood","Breath Types Compared","Vagus Nerve Daily","Nervous System Regulation","Movement as Meditation","Nutrition and Mood","Hydration and Energy","Circadian Rhythms","Hormones and Emotion","Menstrual Awareness","Menopause as Portal","Aging Body","Chronic Pain","Fatigue Signals","Vitality Practices","Somatic Tracking","Body Scan Depth","Tension Patterns","Fascia and Emotion","Gut-Brain Axis","Immune and Stress","Inflammation Loops","Exercise and Mind","Yoga Asana Depth","Walking Practice","Dance and Freedom","Restorative Rest","Sleep Hygiene","Naps and Clarity","Caffeine and Awareness","Alcohol and Clarity","Substances and Loops","Screen Eyes","Posture at Desk","Breathing at Work","Body in Grief","Body in Joy","Body in Fear","Interoception Training","Proprioception","Balance Practice","Strength and Humility","Flexibility and Letting Go","Endurance and Patience","Stillness in Body","Movement in Stillness","Touch and Safety","Skin and Boundary",
    ],
  },
  {
    slug: "traditions",
    label: "Traditions",
    description: "Wisdom traditions beyond the core Indian canon.",
    subtopics: [
      "Stoicism Witness","Zen Ordinary Mind","Sufi Longing","Taoist Wu Wei","Christian Contemplation","Islamic Dhikr","Jewish Teshuvah","Indigenous Land Awareness","Buddhist Anatta","Confucian Harmony","Shamanic Journey","Mystical Christianity","Kabbalah Awareness","Advaita Revisited","Tantra Reclaimed","Vedanta Living","Yoga Sutras Daily","Bhagavad Gita Action","Upanishadic Inquiry","Dhammapada Mind","Zen Koan","Sufi Poetry","Tao Te Ching","Stoic Premeditation","Desert Fathers","Hesychasm","Quaker Silence","Benedictine Rhythm","Franciscan Poverty","Tibetan Lojong","Zen Archery","Tea Ceremony","Calligraphy Practice","Mandala Meditation","Mantra Science","Yantra Practice","Puja as Technology","Pilgrimage","Sacred Geography","Temple as Lab","Monastery Rhythm","Householder Path","Renunciate Path","Grihastha Dharma","Sannyasa","Brahmacharya","Vanaprastha","Ashrama System","Dharma in Modern Life",
    ],
  },
  {
    slug: "developmental",
    label: "Developmental",
    description: "Consciousness across the lifespan.",
    subtopics: [
      "Childhood Conditioning","Early Attachment","Adolescent Identity","Young Adult Searching","Saturn Return","Midlife Unraveling","Empty Nest","Aging Consciously","Elderhood","Dying Consciously","Grief Work","Legacy","Reparenting","Inner Child","Teenage Loops","Parenting Teens","Grandparenting","Life Transitions","Career Changes","Relationship Endings","Health Crises","Loss of Identity","Retirement as Portal","Purpose After Work","Becoming Nobody","Reinvention","Second Half of Life","Soul in Midlife","Wisdom of Elders","Ancestral Healing","Family Patterns","Breaking Cycles","Raising Conscious Children","Modeling Awareness","Teaching by Being","Developmental Trauma","Attachment Repair","Self-Parenting","Forgiveness of Parents","Becoming Your Own Authority",
    ],
  },
  {
    slug: "cognitive",
    label: "Cognitive",
    description: "How the mind learns, decides, and creates.",
    subtopics: [
      "Learning How to Learn","Memory and Identity","Decision Fatigue","Creative Blocks","Attention Economics","Confirmation Bias","Availability Heuristic","Anchoring","Loss Aversion","Sunk Cost","Overconfidence","Hindsight Bias","Fundamental Attribution","Halo Effect","Priming","Framing","Default Bias","Status Quo","Bandwagon","Survivorship","Selection Bias","Recency Bias","Negativity Bias","Positivity Bias","Dunning-Kruger","Imposter Syndrome","Perfectionism Cognition","All-or-Nothing","Catastrophizing","Mind Reading","Fortune Telling","Emotional Reasoning","Should Statements","Labeling","Personalization","Blame","Control Fallacy","Fairness Fallacy","Change Triangle","Cognitive Defusion","Thought Suppression","Thought Replacement","Mindfulness of Thought","Metacognition","Executive Function","Working Memory","Long-Term Memory","Forgetting as Feature","Sleep and Memory","Spacing Effect","Interleaving",
    ],
  },
  {
    slug: "social-relational",
    label: "Social & Relational",
    description: "Awareness in the space between people.",
    subtopics: [
      "Boundaries Without Walls","Conflict as Practice","Intimacy and Witness","Belonging vs Fitting In","Repair After Rupture","Attachment Styles","Anxious Attachment","Avoidant Attachment","Secure Attachment","Disorganized Attachment","Communication Patterns","Listening Deeply","Speaking Truth","Honesty and Kindness","Gossip and Energy","Envy in Friendship","Jealousy in Love","Trust Building","Trust Repair","Betrayal Healing","Forgiveness Practice","Apology and Repair","Conflict Styles","Collaboration","Competition","Cooperation","Power Dynamics","Authority and Submission","Peer Relationships","Mentorship","Therapy Relationship","Coach and Client","Teacher and Student","Guru and Seeker","Community Leadership","Inclusion","Exclusion","Othering","Projection in Relationships","Transference","Countertransference","Empathy vs Enmeshment","Codependency","Independence","Interdependence","Solitude in Relationship","Together and Apart","Rituals of Connection","Shared Practice","Growing Apart","Growing Together",
    ],
  },
  {
    slug: "health",
    label: "Health",
    description: "Burnout, addiction, trauma, and healing.",
    subtopics: [
      "Burnout as Emergency","Addiction Loops","Trauma and Body","Somatic Healing","Anxiety Disorders","Depression and Meaning","OCD and Awareness","ADHD and Attention","Bipolar and Rhythm","PTSD and Safety","Grief and Depression","Chronic Illness","Autoimmune and Stress","Pain and Perception","Disability and Identity","Neurodivergence","Autism and Sensory","ADHD Practices","OCD Practices","Anxiety Practices","Depression Practices","Trauma Practices","Addiction Recovery","Relapse and Return","Support Systems","Therapy Modalities","CBT and Witness","ACT and Defusion","IFS and Parts","EMDR and Memory","Somatic Experiencing","Polyvagal Theory","Window of Tolerance","Regulation Practices","Co-regulation","Self-regulation","Healing Communities","Peer Support","Medication and Spirituality","Holistic Health","Preventive Awareness","Early Warning Signs","Burnout Prevention","Compassion Fatigue","Caregiver Burnout","Vicarious Trauma","Healer's Wound","Sustainability of Practice",
    ],
  },
  {
    slug: "nature",
    label: "Nature",
    description: "Awareness through the natural world.",
    subtopics: [
      "Seasons and Psyche","Elements Practice","Walking as Meditation","Animal Awareness","Ecological Grief","Earth and Grounding","Water and Flow","Fire and Transformation","Air and Breath","Space and Emptiness","Forest Bathing","Ocean Awareness","Mountain Practice","Desert Silence","River and Letting Go","Tree and Rootedness","Bird and Attention","Insect and Patience","Weather and Mood","Sunrise Practice","Sunset Practice","Moon and Cycles","Stars and Perspective","Seasonal Rituals","Harvest and Gratitude","Winter and Rest","Spring and Renewal","Summer and Abundance","Autumn and Release","Nature and Nervous System","Biophilia","Eco-Anxiety","Climate Action as Practice","Sustainable Living","Minimal Footprint","Gardening and Mind","Growing Food","Composting and Letting Go","Rewilding Self","Nature Journaling","Tracking Animals","Listening to Land","Sacred Sites","Pilgrimage in Nature","Solitude in Wild","Group in Wild","Risk and Safety","Weathering Storms","Nature as Mirror","Earth as Mother",
    ],
  },
  {
    slug: "art-play",
    label: "Art & Play",
    description: "Creativity, humor, and the inner child.",
    subtopics: [
      "Music and Trance","Writing as Inquiry","Play and Inner Child","Visual Attention","Humor and Ego","Art as Meditation","Dance and Freedom","Singing and Vagus","Poetry and Truth","Storytelling","Myth and Meaning","Imagination Practice","Creativity and Flow","Blocks as Teachers","Making as Meditation","Originality and Ego","Sharing the Work","Criticism and Growth","Perfectionism in Art","Playfulness in Practice","Laughter and Release","Comedy and Insight","Satire and Truth","Joy of Making","Craft and Patience","Improvisation","Beginner's Mind in Art","Mastery and Surrender","Art and Shadow","Art and Healing","Color and Emotion","Sound and State","Rhythm and Breath","Silence in Music","Negative Space","Improvisation in Life","Games as Practice","Play in Adulthood","Childlike Wonder","Curiosity","Exploration","Experimentation","Failure as Teacher","Iteration","Prototyping Life","Creative Constraints","Routine and Creativity","Boredom and Creativity","Solitude and Creativity","Collaboration in Art","Art and Community",
    ],
  },
  {
    slug: "time-routines",
    label: "Time & Routines",
    description: "How we inhabit time.",
    subtopics: [
      "Morning Architecture","Evening Unwinding","Sabbath and Rest","Ritualizing Transitions","Myth of Productivity","Time Scarcity","Time Abundance","Present Time","Future Time","Past Time","Clock Time","Natural Time","Seasonal Time","Lifetime Arc","Daily Rhythm","Weekly Rhythm","Monthly Rhythm","Yearly Rhythm","Ritual of Beginning","Ritual of Ending","Transition Awareness","Waiting as Practice","Patience","Urgency and Ego","Slowness","Speed","Pacing","Rest Cycles","Work Cycles","Sleep Cycles","Meal Rhythms","Movement Rhythms","Reflection Rhythms","Planning","Unplanning","Letting Day Unfold","Routine as Freedom","Routine as Prison","Flexibility","Adaptability","Time for Practice","Time for Nothing","Time for Others","Time for Self","Time and Guilt","Time and Worth","Time and Love","Time and Death","Time and Joy","Time and Presence",
    ],
  },
  {
    slug: "ethics",
    label: "Ethics",
    description: "Right action in daily life.",
    subtopics: [
      "Non-Violence in Speech","Truth and Harm","Compassion Fatigue","Justice and Forgiveness","Right Livelihood","Honesty Practice","Integrity","Authenticity","Sincerity","Hypocrisy","Virtue","Character","Moral Courage","Standing Up","Speaking Out","Silence and Complicity","Bystander","Allyship","Solidarity","Service","Volunteering","Generosity","Charity","Philanthropy","Fairness","Equity","Justice","Mercy","Punishment","Rehabilitation","Restorative Justice","Truth and Reconciliation","Amends","Repair","Accountability","Responsibility","Blame and Shame","Guilt and Growth","Ethical Consumption","Sustainable Choices","Animal Ethics","Environmental Ethics","Digital Ethics","AI Ethics","Privacy","Consent","Boundaries Ethics","Power Ethics","Leadership Ethics","Everyday Ethics",
    ],
  },
  {
    slug: "shadow",
    label: "Shadow",
    description: "What is disowned and projected.",
    subtopics: [
      "Projection 101","Repression Costs","Golden Shadow","Envy as Signal","Anger's Intelligence","Shame Core","Fear of Exposure","Hidden Aggression","Passive Aggression","Sarcasm and Defense","Cynicism","Skepticism as Armor","Superiority","Inferiority","Jealousy Work","Competitiveness","Rivalry","Greed","Lust","Gluttony","Sloth","Wrath","Pride","Envy","Deceit","Manipulation","Control","Possessiveness","Vanity","Arrogance","Entitlement","Victimhood","Martyrdom","Savior","Rescuer","Persecutor","Abandonment","Rejection","Betrayal","Humiliation","Failure","Weakness","Vulnerability","Neediness","Dependency","Independence","Autonomy","Freedom","Rebellion","Conformity",
    ],
  },
  {
    slug: "energy-vitality",
    label: "Energy & Vitality",
    description: "Managing and cultivating life energy.",
    subtopics: [
      "Energy Leaks","Rest vs Collapse","Vitality Practices","Seasonal Energy","Exhausted Seeker","Burnout Recovery","Chronic Fatigue","Energy Boundaries","Energy Vampires","Protecting Energy","Cultivating Energy","Prana Basics","Chi and Flow","Kundalini Safety","Energy Centers","Chakra Basics","Grounding Energy","Raising Energy","Calming Energy","Balancing Energy","Energy and Emotion","Energy and Thought","Energy and Body","Energy and Breath","Energy and Food","Energy and Sleep","Energy and Movement","Energy and Rest","Energy and Work","Energy and Relationship","Energy and Environment","Energy and Place","Energy and People","Energy and Media","Energy and News","Energy and Screens","Energy and Nature","Energy and Music","Energy and Color","Energy and Sound","Energy Hygiene","Energy Clearing","Energy Protection","Energy Sharing","Energy Exchange","Energy Theft","Energy Gifts","Energy and Intuition","Energy and Dreams","Energy and Aging",
    ],
  },
  {
    slug: "technology",
    label: "Technology",
    description: "Awareness in the digital age.",
    subtopics: [
      "Screens and Nervous System","AI and Self","Attention as Currency","Digital Silence","Algorithmic Mirror","Social Media Loops","Doomscrolling","Notification Anxiety","Phantom Vibration","FOMO","JOMO","Digital Detox","Tech Boundaries","Phone as Tool","Phone as Master","Work from Home","Remote Isolation","Zoom Fatigue","Email Anxiety","Slack Overload","Always On","Right to Disconnect","Digital Minimalism","Single-tasking","Deep Work","Shallow Work","Tech and Sleep","Tech and Eyes","Tech and Posture","Tech and Relationships","Tech and Children","Tech and Elders","AI Companions","AI and Loneliness","AI and Creativity","AI and Work","AI and Ethics","Algorithmic Bias","Data Privacy","Surveillance","Attention Economy","Persuasion Design","Dark Patterns","Consent Online","Digital Identity","Online Persona","Anonymity","Trolling","Cyberbullying","Digital Citizenship",
    ],
  },
  {
    slug: "money",
    label: "Money",
    description: "Consciousness and financial life.",
    subtopics: [
      "Scarcity Mindset","Enoughness","Generosity Practice","Money and Shame","Work and Worth","Money Stories","Family Money","Money and Power","Money and Love","Money and Fear","Money and Freedom","Money and Security","Money and Status","Money and Identity","Spending Awareness","Saving Awareness","Giving Awareness","Investing Awareness","Debt and Shame","Wealth and Guilt","Poverty and Dignity","Abundance Mindset","Gratitude for Money","Money Rituals","Financial Boundaries","Money in Relationships","Money and Children","Money and Aging","Money and Health","Money and Time","Money and Energy","Money and Ethics","Conscious Consumption","Minimalism","Simplicity","Voluntary Simplicity","Downshifting","Slow Money","Local Economy","Sharing Economy","Gift Economy","Alternative Currencies","Universal Basic","Financial Independence","Retire Early","Enough Number","Financial Peace","Money Meditation","Money and Spirituality","Sacred Economics","Post-Growth",
    ],
  },
  {
    slug: "death-impermanence",
    label: "Death & Impermanence",
    description: "Mortality, grief, and what remains.",
    subtopics: [
      "Grief as Love","Legacy and Letting Go","Impermanence Daily","Mortality Salience","What Remains","Death Awareness","Fear of Death","Dying Consciously","Hospice Wisdom","Palliative Care","Grief Stages","Complicated Grief","Anticipatory Grief","Disenfranchised Grief","Collective Grief","Ecological Grief","Grief Rituals","Mourning Practices","Anniversary Grief","Grief and Body","Grief and Sleep","Grief and Appetite","Grief and Anger","Grief and Guilt","Grief and Relief","Grief and Joy","Continuing Bonds","Memorialization","Legacy Projects","Life Review","Forgiveness at End","Reconciliation","Saying Goodbye","Last Words","Deathbed Visions","Near-Death Experiences","Afterlife Beliefs","Rebirth","Karma and Death","Samsara","Moksha","Nirvana","Heaven and Hell","Purgatory","Ancestors","Ancestral Veneration","Lineage","Inheritance","What We Leave",
    ],
  },
  {
    slug: "leadership-community",
    label: "Leadership & Community",
    description: "Conscious leadership and collective life.",
    subtopics: [
      "Conscious Leadership","Holding Space","Community Building","Power and Service","Lone Seeker","Leadership Styles","Servant Leadership","Transformational Leadership","Authentic Leadership","Vulnerable Leadership","Leadership and Ego","Leadership and Shadow","Leading Self","Leading Others","Leading Teams","Leading Communities","Leading Movements","Facilitation","Group Dynamics","Circle Practice","Council Practice","Consensus","Conflict in Groups","Group Shadow","Groupthink","Polarization","Inclusion Practice","Diversity","Equity Practice","Belonging Practice","Community Care","Mutual Aid","Collective Healing","Shared Ritual","Shared Practice","Shared Meals","Shared Silence","Shared Grief","Shared Joy","Shared Purpose","Movement Building","Activism as Practice","Burnout in Activism","Sustainable Activism","Rest in Movements","Joy in Movements","Celebration","Rituals of Transition","Welcome and Farewell","Initiation","Rites of Passage",
    ],
  },
  {
    slug: "creativity",
    label: "Creativity",
    description: "Making, flow, and expression.",
    subtopics: [
      "Creative Flow","Blocks as Teachers","Making as Meditation","Originality and Ego","Sharing the Work","Inspiration","Muse","Discipline vs Flow","Routine and Creativity","Boredom and Creativity","Constraints and Creativity","Play and Creativity","Curiosity and Creativity","Failure and Creativity","Iteration","Prototyping","Feedback","Criticism","Perfectionism","Procrastination","Resistance","Starting","Finishing","Editing","Letting Go of Work","Publishing","Performing","Collaborating","Solitude and Creativity","Community and Creativity","Money and Creativity","Recognition and Creativity","Comparison and Creativity","Copying and Learning","Influence","Voice","Style","Medium","Material","Craft","Skill","Talent","Practice","Mastery","Beginner's Mind","Expert's Mind","Teaching Creativity","Creativity and Children","Creativity and Aging","Creativity and Healing","Creativity and Spirituality","Creativity and Joy",
    ],
  },
  {
    slug: "integration",
    label: "Integration",
    description: "Bringing insight into daily life.",
    subtopics: [
      "Insight to Action","Daily Embodiment","Relapse and Return","Long-Haul Practice","Quiet After","Integration Period","Post-Retreat","Post-Breakthrough","Post-Crisis","Post-Loss","Post-Joy","Post-Insight","Implementation","Habits of Integration","Environment for Integration","Relationships for Integration","Work for Integration","Body for Integration","Mind for Integration","Emotion for Integration","Spirit for Integration","Integration and Time","Integration and Patience","Integration and Support","Integration and Solitude","Integration and Community","Integration and Rest","Integration and Movement","Integration and Reflection","Integration and Journaling","Integration and Therapy","Integration and Practice","Integration and Ritual","Integration and Nature","Integration and Art","Integration and Service","Integration and Study","Integration and Teaching","Integration and Sharing","Integration and Silence","Integration and Speech","Integration and Action","Integration and Non-Action","Integration and Surrender","Integration and Effort","Integration and Grace","Integration and Mystery","Integration and Doubt","Integration and Faith","Integration and Love","Integration and Wholeness",
    ],
  },
];

function conceptToMarkdown(family: Family, subtopic: string, angle: Angle): string {
  return `> **${family.label} · ${subtopic}** — ${angle.label}

## What this concept actually is

${subtopic} is a doorway into ${family.label.toLowerCase()}. ${family.description} ${angle.lens}

This essay is not a definition. It is a working map: what the concept is, how it hides in ordinary life, and the small move that begins to change your relationship to it. Read it once for the idea. Return to it when the concept shows up in your own life — that is when it becomes useful.

## How it shows up in daily life

- It rarely announces itself. It wears the costume of normalcy.
- It feels like "just how things are" until you see it from the outside.
- The body knows before the mind does. Track the sensation, not the story.
- It repeats. The repetition is the teacher, not the enemy.
- It softens when witnessed without judgment.

## Why it happens

Nothing here is a personal failing. These patterns are the nervous system doing its best with the information it had at the time. The roots are developmental, cultural, and biological — layered, not single-cause. Seeing the roots does not excuse the pattern; it makes it workable. You cannot argue a nervous system into safety. You can offer it a new experience, repeatedly, until it updates.

## The practice

${angle.lens} Pick one moment today where this concept is active. Slow down two seconds before reacting. Name it silently. Do one small thing the pattern would never do. That is the whole practice. Not a cure. An interruption. Interruptions compound.

## The trap

The ego will try to turn this into another achievement — "I have mastered ${subtopic.toLowerCase()}." That is the same loop wearing a wiser mask. The practice is not to be good at it. The practice is to see it, again and again, without needing to be done with it.

## The shadow side

What we disown does not disappear; it drives from the back seat. The shadow of ${subtopic.toLowerCase()} is not its opposite — it is its unacknowledged twin. Bring it into the room gently. Naming is not fixing; naming is the first honest contact.

## In relationships

Between people, this concept becomes a dance. Each partner carries half the pattern. The work is not to fix the other; it is to own your half with enough honesty that the system can reorganize. Speak one unsaid sentence. Stay present for what comes back.

## In work and money

Effort and value get tangled here. Notice where you over-give, under-charge, or equate productivity with worth. The correction is not a new strategy; it is a new relationship with enoughness. Do the work, then let the work be enough.

## In the body

The somatic signature is the truth-teller. Locate the sensation before the story. Breathe into it without trying to change it. The body updates through experience, not argument. A long exhale, a shake, a slow stretch — these are the languages the nervous system trusts.

## Integration

Bring the insight into one ordinary moment today. Not a special practice session — the kitchen, the commute, the conversation. Integration is not an event; it is the slow migration of awareness from the cushion into the day. Track it weekly. Celebrate small shifts. They compound.

— HOPE New Concept Atlas`;

}

export function newConceptsAsBlogPosts(): BlogPost[] {
  const publishedAt = "2025-01-01T00:00:00.000Z";
  const out: BlogPost[] = [];
  let idx = 0;
  for (const family of FAMILIES) {
    for (const subtopic of family.subtopics) {
      for (const angle of ANGLES) {
        idx += 1;
        const slug = `newconcept-${family.slug}-${slugify(subtopic)}-${angle.slug}-${idx}`;
        out.push({
          slug,
          title: `${subtopic} — ${angle.label} · ${family.label}`,
          keyword: `${subtopic}, ${family.label}, ${angle.label}, consciousness, awareness, practice`,
          pillar: `New Concepts · ${family.label}`,
          metaDescription: `${subtopic} through the lens of ${angle.label.toLowerCase()}: what it is, how it shows up, and the small practice that begins to shift it.`,
          content: conceptToMarkdown(family, subtopic, angle),
          publishedAt,
        } satisfies BlogPost);
      }
    }
  }
  return out;
}

