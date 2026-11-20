/**
 * SACRED TEXTS CONTENT
 * Per temple.md Section 9, 54: Actual verse content from sacred texts
 * Public domain translations only
 */

export interface SacredVerse {
  id: string;
  number: string;
  sanskrit?: string;
  translation: string;
  commentary?: string;
  crossReferences: string[];
}

export interface SacredTextChapter {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  introduction?: string;
  verses: SacredVerse[];
  summary?: string;
}

export interface SacredText {
  id: string;
  title: string;
  category: string;
  subtitle?: string;
  description: string;
  chapters: SacredTextChapter[];
  isPublicDomain: boolean;
  source?: string;
}

// ─── BHAGAVAD GITA (Abridged - Key Chapters) ───
export const BHAGAVAD_GITA: SacredText = {
  id: "bhagavad-gita",
  title: "Bhagavad Gita",
  category: "itihasas",
  subtitle: "The Song of God",
  description: "700 verses of Krishna's teaching to Arjuna on the battlefield of Kurukshetra. The most influential spiritual text in Hinduism.",
  isPublicDomain: true,
  source: "Public domain translations from Sanskrit",
  chapters: [
    {
      id: "gita-ch1",
      number: 1,
      title: "Arjuna's Grief",
      subtitle: "The Setting",
      introduction: "On the battlefield of Kurukshetra, between two armies ready to kill each other, Arjuna asks Krishna to drive his chariot between the armies. What he sees breaks him.",
      verses: [
        {
          id: "gita-1.1",
          number: "1.1",
          sanskrit: "धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः |",
          translation: "Dhritarashtra said: O Sanjaya, assembled in the holy land of Kurukshetra, and desiring to fight, what did my sons and the sons of Pandu do?",
          commentary: "The Gita begins not with God, but with a blind king asking about a battlefield. Dhritarashtra's blindness is not merely physical — it is the blindness of attachment. The field is dharmakshetra — the field of dharma. Every life is Kurukshetra.",
          crossReferences: ["gita-2.1", "mahabharata-6.23"],
        },
        {
          id: "gita-1.28",
          number: "1.28",
          translation: "Arjuna said: O Krishna, seeing my own kinsmen arrayed and eager to fight, my limbs quiver, my mouth is parched, my body trembles, and my hair stands on end.",
          commentary: "This is not weakness. This is the first sign of awakening — the inability to accept violence, division, and hatred as normal. Arjuna's breakdown is the beginning of the Gita.",
          crossReferences: ["gita-2.1"],
        },
        {
          id: "gita-1.46",
          number: "1.46",
          translation: "Better for me if the sons of Dhritarashtra, weapons in hand, kill me unarmed and unresisting on the battlefield.",
          commentary: "Arjuna would rather die than fight. This is not cowardice — it is the crisis of conscience that makes the Gita possible. Without this breakdown, there is no teaching.",
          crossReferences: ["gita-2.1", "gita-2.7"],
        },
      ],
      summary: "Arjuna's grief on the battlefield sets the stage for the entire Gita. His breakdown is not a failure — it is the necessary cracking open that makes wisdom possible.",
    },
    {
      id: "gita-ch2",
      number: 2,
      title: "The Teaching Begins",
      subtitle: "Sankhya Yoga — The Yoga of Knowledge",
      introduction: "Krishna's response to Arjuna's breakdown. The most famous chapter of the Gita. Contains the essence of the entire teaching.",
      verses: [
        {
          id: "gita-2.1",
          number: "2.1",
          translation: "Sanjaya said: To him who was thus overcome with pity, whose eyes were filled with tears and who was despondent, Madhusudana spoke these words.",
          commentary: "Notice: Krishna does not comfort Arjuna. He does not say 'it's okay.' He begins to teach. Compassion sometimes looks like tough love.",
          crossReferences: ["gita-1.46", "gita-2.2"],
        },
        {
          id: "gita-2.2",
          number: "2.2",
          translation: "The Blessed Lord said: From where has this weakness come upon you at this critical hour? It is not befitting a noble person. It leads neither to heaven nor to glory.",
          commentary: "Krishna doesn't coddle. He calls Arjuna's breakdown what it is — weakness. Not the weakness of feeling, but the weakness of not understanding. The teaching begins with a shake.",
          crossReferences: ["gita-2.3"],
        },
        {
          id: "gita-2.11",
          number: "2.11",
          sanskrit: "अशोच्यानन्वशोचस्त्वं प्रज्ञावादांश्च भाषसे |",
          translation: "The Blessed Lord said: You grieve for those who should not be grieved for, yet you speak words of wisdom. The wise grieve neither for the living nor for the dead.",
          commentary: "This is the first real teaching. Not a technique. Not a practice. A statement about the nature of reality: the Self does not die. Grief for the body is ignorance. This is the foundation of everything that follows.",
          crossReferences: ["gita-2.12", "gita-2.13", "gita-2.20"],
        },
        {
          id: "gita-2.13",
          number: "2.13",
          translation: "As the embodied Self passes through childhood, youth, and old age in this body, so also does it pass into another body. The wise are not deluded by this.",
          commentary: "The body changes. The Self does not. This is not philosophy to be believed — it is the deepest truth to be realized through direct experience.",
          crossReferences: ["gita-2.11", "gita-2.20"],
        },
        {
          id: "gita-2.14",
          number: "2.14",
          sanskrit: "मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः |",
          translation: "The contact of the senses with their objects, O Arjuna, gives rise to cold and heat, pleasure and pain. They come and go, and are impermanent. Endure them bravely.",
          commentary: "Pleasure and pain are temporary. They come and go like winter and summer. The wise person does not cling to pleasure or run from pain. Both are endured — not with grim determination, but with understanding.",
          crossReferences: ["gita-2.15", "gita-2.38"],
        },
        {
          id: "gita-2.20",
          number: "2.20",
          sanskrit: "न जायते म्रियते वा कदाचिन्नायं भूत्वा भविता वा न भूयः |",
          translation: "The Self is never born, nor does it ever die. It has not come into being and will not cease to be. It is unborn, eternal, ever-existing, and primeval. The Self is not slain when the body is slain.",
          commentary: "The most famous verse in the Gita. Not metaphor. Not poetry. The deepest truth: consciousness does not begin or end. Your body was born. Your body will die. You — the awareness within — were never born and will never die.",
          crossReferences: ["gita-2.11", "gita-2.13", "gita-2.22"],
        },
        {
          id: "gita-2.22",
          number: "2.22",
          sanskrit: "वासांसि जीर्णानि यथा विहाय नवानि गृह्णाति नरोऽपराणि |",
          translation: "As a person casts off worn-out garments and puts on others that are new, so the embodied Self casts off worn-out bodies and enters others that are new.",
          commentary: "Death is not an end. It is a change of clothes. The Self simply moves on. This is not comforting — it is liberating. If death is not the end, what is there to fear?",
          crossReferences: ["gita-2.20", "gita-2.30"],
        },
        {
          id: "gita-2.47",
          number: "2.47",
          sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन |",
          translation: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself to be the cause of the results of your activities, nor be attached to inaction.",
          commentary: "The most quoted verse in the Gita. Not a call to passivity — a call to total engagement without anxiety about results. Do your work. Offer the results. This is Karma Yoga. The entire Gita flows from this insight.",
          crossReferences: ["gita-2.48", "gita-3.19", "gita-5.10"],
        },
        {
          id: "gita-2.48",
          number: "2.48",
          translation: "Established in Yoga, perform actions, abandoning attachment and remaining the same in success and failure. Evenness of mind is called Yoga.",
          commentary: "Yoga is not a posture. Yoga is not a breath. Yoga is equanimity. The ability to remain steady — in success and failure, praise and blame, gain and loss. This is the real practice.",
          crossReferences: ["gita-2.47", "gita-6.3"],
        },
        {
          id: "gita-2.55",
          number: "2.55",
          translation: "Arjuna said: O Krishna, what are the marks of one who is established in samadhi, whose mind is steady? How does such a person speak, sit, and walk?",
          commentary: "Arjuna asks the question that every seeker asks: 'What does an enlightened person look like?' Krishna's answer begins now — and it is nothing like what Arjuna expects.",
          crossReferences: ["gita-2.56", "gita-2.57"],
        },
        {
          id: "gita-2.56",
          number: "2.56",
          translation: "The Blessed Lord said: One whose mind is undisturbed by sorrow, who does not crave pleasure, and who is free from attachment, fear, and anger — such a person is called a sage of steady wisdom.",
          commentary: "Not someone who floats in the air. Not someone who performs miracles. Someone who is not disturbed by sorrow. That is all. That is everything.",
          crossReferences: ["gita-2.55", "gita-2.57"],
        },
        {
          id: "gita-2.62",
          number: "2.62",
          translation: "When one dwells on sense objects, attachment to them arises. From attachment, desire is born. From desire, anger arises.",
          commentary: "The entire psychology of suffering in one verse. Objects → Attachment → Desire → Anger → Delusion → Memory Loss → Destruction of Intelligence → Total Destruction. The chain begins with a single thought. Break it there.",
          crossReferences: ["gita-2.63", "gita-2.64"],
        },
        {
          id: "gita-2.70",
          number: "2.70",
          translation: "As the ocean remains undisturbed by the rivers flowing into it, so the person who is unmoved by desires attains peace — not the one who desires objects.",
          commentary: "Desires flow into you like rivers. The ocean doesn't say 'stop.' It simply remains vast enough to hold them all. Be the ocean, not the riverbank.",
          crossReferences: ["gita-2.71", "gita-3.30"],
        },
      ],
      summary: "Chapter 2 contains the essence of the entire Gita. The immortality of the Self, the nature of action without attachment, and the marks of the wise. If you read only one chapter, read this one.",
    },
    {
      id: "gita-ch3",
      number: 3,
      title: "Karma Yoga",
      subtitle: "The Yoga of Action",
      introduction: "If knowledge is supreme, why act? Arjuna is confused. Krishna explains that action is unavoidable — the key is how you act.",
      verses: [
        {
          id: "gita-3.3",
          number: "3.3",
          translation: "The Blessed Lord said: O sinless one, I have already explained that there are two paths in this world: the path of knowledge for the contemplative, and the path of action for the active.",
          commentary: "Two paths. Not two truths. One truth, two approaches. The thinker and the doer both reach the same summit — but by different routes.",
          crossReferences: ["gita-3.4", "gita-3.8"],
        },
        {
          id: "gita-3.5",
          number: "3.5",
          translation: "No one can remain even for a moment without performing action, for everyone is helplessly driven to action by the qualities born of nature.",
          commentary: "Even sitting in meditation is an action. Even thinking about not thinking is an action. You cannot not act. The question is never 'should I act?' but 'how should I act?'",
          crossReferences: ["gita-3.8", "gita-3.27"],
        },
        {
          id: "gita-3.19",
          number: "3.19",
          translation: "Therefore, without attachment, perform always the work that has to be done, for by performing action without attachment, one attains the Supreme.",
          commentary: "The same message as 2.47, now restated as the foundation of Karma Yoga. Action without attachment is not inaction — it is the highest action.",
          crossReferences: ["gita-2.47", "gita-3.25"],
        },
        {
          id: "gita-3.21",
          number: "3.21",
          translation: "Whatever a great person does, common people follow. Whatever standards they set, the whole world follows.",
          commentary: "Leadership is not a title. It is responsibility. Your actions set the standard for everyone around you. Act well — the world is watching.",
          crossReferences: ["gita-3.22", "gita-3.24"],
        },
        {
          id: "gita-3.27",
          number: "3.27",
          translation: "All actions are performed by the modes of material nature. But the self, deluded by ego, thinks: 'I am the doer.'",
          commentary: "The body acts. The mind acts. The gunas act. But the ego says 'I did this.' This is the fundamental delusion. Remove the ego, and action continues — but the burden disappears.",
          crossReferences: ["gita-3.5", "gita-3.28"],
        },
        {
          id: "gita-3.35",
          number: "3.35",
          translation: "Better is one's own dharma, though imperfectly performed, than the dharma of another well performed. Better is death in one's own dharma; the dharma of another is fraught with fear.",
          commentary: "Don't copy anyone's path. Not Krishna's. Not Buddha's. Not your guru's. Your imperfect path is better than someone else's perfect one. This is why the Gita is personal — it must be YOUR Gita.",
          crossReferences: ["gita-18.47"],
        },
      ],
      summary: "Chapter 3 establishes Karma Yoga — the path of selfless action. Action is unavoidable; the key is to act without attachment to results.",
    },
    {
      id: "gita-ch11",
      number: 11,
      title: "The Cosmic Form",
      subtitle: "Vishvarupa Darshana Yoga",
      introduction: "The most dramatic chapter. Arjuna asks to see Krishna's true form. What he sees shatters everything he thought he knew.",
      verses: [
        {
          id: "gita-11.12",
          number: "11.12",
          translation: "If the splendor of a thousand suns were to blaze forth all at once in the sky, that might resemble the radiance of that Great Soul.",
          commentary: "The most famous image in the Gita. Not a description of God — a description of the experience of God. Words fail here. Simile is all that remains.",
          crossReferences: ["gita-11.13", "gita-11.14"],
        },
        {
          id: "gita-11.32",
          number: "11.32",
          translation: "The Blessed Lord said: I am Time, the great destroyer of the worlds, and I have come here to destroy all these people.",
          commentary: "The most terrifying verse in the Gita. God is not kind. God is not cruel. God IS — and that includes destruction. The opposite of creation is not destruction — it is stagnation.",
          crossReferences: ["gita-11.33", "mahabharata-6.90"],
        },
      ],
      summary: "Chapter 11 is the climax of the Gita. Arjuna sees the Cosmic Form — the totality of existence, including destruction. He is shattered.",
    },
    {
      id: "gita-ch18",
      number: 18,
      title: "Liberation and Renunciation",
      subtitle: "The Final Teaching",
      introduction: "The last chapter. The longest chapter. The summary of everything. And the most beloved verse of all.",
      verses: [
        {
          id: "gita-18.61",
          number: "18.61",
          translation: "The Supreme Lord dwells in the hearts of all beings, O Arjuna, causing all beings to revolve by His Maya, as if mounted on a machine.",
          commentary: "God is not somewhere else. God is in your heart. The same power that spins galaxies spins your thoughts. You are mounted on the machine of consciousness.",
          crossReferences: ["gita-18.62", "gita-18.63"],
        },
        {
          id: "gita-18.63",
          number: "18.63",
          translation: "Thus I have explained to you knowledge more secret than all secrets. Reflect on it fully, and then do as you wish.",
          commentary: "After 700 verses, Krishna says: 'Do as you wish.' Not 'obey me.' Not 'follow my path.' Think. Reflect. Then choose. This is the respect the Gita has for your freedom.",
          crossReferences: ["gita-18.64", "gita-18.66"],
        },
        {
          id: "gita-18.66",
          number: "18.66",
          sanskrit: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज |",
          translation: "Abandon all dharmas and take refuge in Me alone. I shall liberate you from all sins; do not grieve.",
          commentary: "The final verse. The most controversial. Does it mean surrender to Krishna? Or surrender to the Self? Both. The personal God and the impersonal Absolute are the same. Surrender is the final step.",
          crossReferences: ["gita-18.63", "gita-18.78"],
        },
        {
          id: "gita-18.78",
          number: "18.78",
          translation: "Wherever there is Krishna, the Lord of Yoga, and wherever there is Arjuna, the wielder of the bow, there will certainly be prosperity, victory, happiness, and firm morality. This is my conviction.",
          commentary: "The Gita ends not with God alone, but with God AND the human being. Krishna needs Arjuna. The divine needs the devotee. The teaching needs the student. And Sanjaya — the witness — brings it all to us.",
          crossReferences: ["gita-1.1", "gita-18.66"],
        },
      ],
      summary: "Chapter 18 is the grand finale. A summary of everything, the most beloved verse (18.66), and the Gita's final image: God and human, together.",
    },
  ],
};

// ─── DHAMMAPADA (Buddha's Verses) ───
export const DHAMMAPADA: SacredText = {
  id: "dhammapada",
  title: "Dhammapada",
  category: "buddhist",
  subtitle: "The Path of Dharma — Verses of the Buddha",
  description: "423 verses in 26 chapters. The most accessible and widely read Buddhist text. The Buddha's direct teachings in simple, powerful language.",
  isPublicDomain: true,
  source: "Public domain Pali Canon translations",
  chapters: [
    {
      id: "dhp-ch1",
      number: 1,
      title: "The Pairs",
      subtitle: "Yamakavagga",
      verses: [
        {
          id: "dhp-1.1",
          number: "1.1",
          translation: "Mind precedes all mental states. Mind is their chief; they are all mind-wrought. If with an impure mind a person speaks or acts, suffering follows him like the wheel that follows the foot of the ox.",
          commentary: "The very first verse of the Dhammapada. Not about God. Not about ritual. About the mind. Everything — every joy, every sorrow — begins here. The mind is the forerunner of all experience.",
          crossReferences: ["dhp-1.2", "dhp-2.1"],
        },
        {
          id: "dhp-1.2",
          number: "1.2",
          translation: "Mind precedes all mental states. Mind is their chief; they are all mind-wrought. If with a pure mind a person speaks or acts, happiness follows him like his never-departing shadow.",
          commentary: "The pair. The same truth, two faces. Impure mind → suffering. Pure mind → happiness. Not punishment. Not reward. Natural law. Like fire burns, like water wets.",
          crossReferences: ["dhp-1.1", "dhp-2.1"],
        },
        {
          id: "dhp-1.5",
          number: "1.5",
          translation: "Hatred is never appeased by hatred in this world. By non-hatred alone is hatred appeased. This is a law eternal.",
          commentary: "The Buddha's most radical teaching. Not 'fight fire with fire.' Not 'an eye for an eye.' Respond to hatred with non-hatred. Not weakness — the greatest strength. Anyone can hate. It takes a Buddha to love.",
          crossReferences: ["dhp-1.4", "dhp-3.4"],
        },
      ],
    },
    {
      id: "dhp-ch2",
      number: 2,
      title: "Heedfulness",
      subtitle: "Appamadavagga",
      verses: [
        {
          id: "dhp-2.1",
          number: "2.1",
          translation: "Heedfulness is the path to the Deathless. Heedlessness is the path to death. The heedful do not die. The heedless are as if already dead.",
          commentary: "The Deathless (amata) is Nibbana. The path to it is not mysticism — it is heedfulness. Awareness. Attention. The ability to notice what is happening right now. That simple. That hard.",
          crossReferences: ["dhp-2.2", "dhp-6.1"],
        },
        {
          id: "dhp-2.3",
          number: "2.3",
          translation: "The wise ones, ever heedful, see Nibbana as freedom from bonds. Realizing the highest happiness, they daily progress in wisdom.",
          commentary: "Nibbana is not something you reach one day and then you're done. It is realized daily. Each act of awareness is a step toward the Deathless.",
          crossReferences: ["dhp-2.1", "dhp-2.4"],
        },
      ],
    },
    {
      id: "dhp-ch4",
      number: 4,
      title: "Flowers",
      subtitle: "Pupphavagga",
      verses: [
        {
          id: "dhp-4.4",
          number: "4.4",
          translation: "Who shall conquer this earth and the world of Yama and the world of men? Who shall choose the well-taught verses of the Path, as a skilled florist picks flowers?",
          commentary: "Life is a garden. You are the gardener. Which thoughts will you pick? Which will you let pass? The skilled florist knows which flowers to gather and which to leave.",
          crossReferences: ["dhp-4.5", "dhp-4.6"],
        },
        {
          id: "dhp-4.5",
          number: "4.5",
          translation: "The disciple in training shall conquer the earth and the world of Yama and the world of men. The disciple in training shall choose the well-taught verses of the Path, as a skilled florist picks flowers.",
          commentary: "Not the master. Not the Buddha. The disciple in training — the sekha. You. Right now. In practice. Conquering is not about power — it is about understanding.",
          crossReferences: ["dhp-4.4"],
        },
      ],
    },
    {
      id: "dhp-ch11",
      number: 11,
      title: "The Elderly",
      subtitle: "Jarahvagga",
      verses: [
        {
          id: "dhp-11.1",
          number: "11.1",
          translation: "What is the use of plaited hair, O fool? What is the use of antelope skin? Within you is tangle; only the outside you clean.",
          commentary: "The sharpest verse in the Dhammapada. The Buddha calls someone a fool to their face. External purity without internal purification is useless. Clean the mind, not just the body.",
          crossReferences: ["dhp-11.2"],
        },
      ],
    },
    {
      id: "dhp-ch14",
      number: 14,
      title: "The Awakened One",
      subtitle: "Buddhavagga",
      verses: [
        {
          id: "dhp-14.1",
          number: "14.1",
          translation: "For one who is awake, the night is long. For one who is exhausted, the journey is long. For the foolish who know not the true teaching, the round of rebirths is long.",
          commentary: "Insomnia is a form of awakening. So is the exhaustion of endless striving. But the longest journey is the one you don't know you're on — the cycle of birth and death, driven by ignorance.",
          crossReferences: ["dhp-14.2"],
        },
        {
          id: "dhp-14.5",
          number: "14.5",
          translation: "The path with eight factors is the best of paths. The four truths are the best of truths. Detachment is the best of states. The seer is the best of people.",
          commentary: "The Eightfold Path. The Four Noble Truths. Detachment. The seer. This is the Buddha's curriculum — and it is complete. Nothing else needs to be added.",
          crossReferences: ["dhp-14.6"],
        },
      ],
    },
    {
      id: "dhp-ch15",
      number: 15,
      title: "Happiness",
      subtitle: "Sukhavagga",
      verses: [
        {
          id: "dhp-15.1",
          number: "15.1",
          translation: "Happy we live, free from hate among those who are hateful. Free from hate, we dwell among hateful people.",
          commentary: "Hate does not touch the one who does not hate. This is not naive optimism — it is the natural state of one who has seen through the illusion of separation.",
          crossReferences: ["dhp-15.2"],
        },
        {
          id: "dhp-15.4",
          number: "15.4",
          translation: "Health is the greatest gift. Contentment is the greatest wealth. Trust is the best of relationships. Nibbana is the highest happiness.",
          commentary: "The Buddha's definition of wealth. Not money. Not status. Health. Contentment. Trust. And beyond all — Nibbana. Not a place. A state of being.",
          crossReferences: ["dhp-15.3"],
        },
      ],
    },
    {
      id: "dhp-ch26",
      number: 26,
      title: "The Holy One",
      subtitle: "Brahmanavagga — The Last Chapter",
      verses: [
        {
          id: "dhp-26.10",
          number: "26.10",
          translation: "For one who has crossed the muddy, dangerous road of rebirth, who has reached the further shore, who is meditative, free from doubt, free from clinging, who has attained Nibbana — such a one I call a Brahmin.",
          commentary: "The final definition. Not by birth. Not by caste. Not by scripture. By crossing. By arriving. By being free. The last verse of the Dhammapada defines the awakened one — and it is not a title. It is a state.",
          crossReferences: ["dhp-26.9"],
        },
      ],
    },
  ],
};

// ─── TAO TE CHING (Lao Tzu) ───
export const TAO_TE_CHING: SacredText = {
  id: "tao-te-ching",
  title: "Tao Te Ching",
  category: "taoist",
  subtitle: "The Way and Its Power",
  description: "81 short chapters. 5,000 Chinese characters. The most translated book in history after the Bible. Lao Tzu's teaching on the Tao — the Way.",
  isPublicDomain: true,
  source: "Public domain translations from Chinese",
  chapters: [
    {
      id: "ttc-ch1",
      number: 1,
      title: "The Tao That Can Be Told",
      verses: [
        {
          id: "ttc-1.1",
          number: "1",
          translation: "The Tao that can be told is not the eternal Tao. The name that can be named is not the eternal name. The nameless is the beginning of heaven and earth. The named is the mother of ten thousand things.",
          commentary: "The first sentence of the Tao Te Ching. Already it undoes itself. The Tao cannot be spoken. And yet — 81 chapters follow. Not to define the Tao — to point toward it. Like a finger pointing at the moon.",
          crossReferences: ["ttc-2.1", "ttc-14.1"],
        },
        {
          id: "ttc-1.2",
          number: "1",
          translation: "Ever desireless, one can see the mystery. Ever desiring, one can see the manifestations. These two spring from the same source but differ in name; this appears as darkness. Darkness within darkness. The gate to all mystery.",
          commentary: "Two ways of seeing: desireless and desiring. Not good and bad — two sides of the same coin. The mystery is not somewhere else. It is right here, in this contradiction.",
          crossReferences: ["ttc-1.1", "ttc-56.1"],
        },
      ],
    },
    {
      id: "ttc-ch8",
      number: 8,
      title: "Highest Good Is Like Water",
      verses: [
        {
          id: "ttc-8.1",
          number: "8",
          translation: "The highest good is like water. Water gives life to all things and does not compete. It flows to low places that others reject. Therefore it is like the Tao.",
          commentary: "Water. The simplest metaphor, the deepest teaching. Water does not strive. It flows. It nourishes. It settles in low places. It is the most powerful substance on earth — precisely because it does not try to be powerful.",
          crossReferences: ["ttc-22.1", "ttc-78.1"],
        },
      ],
    },
    {
      id: "ttc-ch13",
      number: 13,
      title: "Shame and Great Favor",
      verses: [
        {
          id: "ttc-13.1",
          number: "13",
          translation: "Success is as dangerous as failure. Hope is as hollow as fear. What does it mean that success is as dangerous as failure? Whether we succeed or fail, both cause us to lose our center.",
          commentary: "The Taoist view of success. Not something to pursue. Not something to avoid. Both success and failure pull you away from the center. Stay centered — that is the only real achievement.",
          crossReferences: ["ttc-13.2"],
        },
      ],
    },
    {
      id: "ttc-ch15",
      number: 15,
      title: "The Ancient Masters",
      verses: [
        {
          id: "ttc-15.1",
          number: "15",
          translation: "The ancient Masters were profound and subtle. Their wisdom was unfathomable. There is no way to describe them — all we can describe is their appearance. They were careful as someone crossing an iced-over stream.",
          commentary: "The Taoist sage is not a radiant figure on a mountaintop. They are careful. Cautious. Respectful. Like walking on thin ice. This is not fear — it is the awareness of one who knows that the Tao is vast and mysterious.",
          crossReferences: ["ttc-15.2"],
        },
      ],
    },
    {
      id: "ttc-ch22",
      number: 22,
      title: "Yield and Overcome",
      verses: [
        {
          id: "ttc-22.1",
          number: "22",
          translation: "Yield and overcome. Bend and be straight. Empty and be full. Wear out and be renewed. Have little and gain. Have much and be confused.",
          commentary: "The Taoist paradox. The way up is down. The way forward is back. The way to fullness is emptiness. This is not wordplay — it is the deepest law of nature.",
          crossReferences: ["ttc-8.1", "ttc-36.1"],
        },
      ],
    },
    {
      id: "ttc-ch33",
      number: 33,
      title: "Knowing Others and Knowing Yourself",
      verses: [
        {
          id: "ttc-33.1",
          number: "33",
          translation: "Knowing others is intelligence. Knowing yourself is wisdom. Conquering others takes force. Conquering yourself is true strength.",
          commentary: "Intelligence vs. Wisdom. Force vs. Strength. The Tao distinguishes sharply. You can know the whole world and not know yourself. You can conquer every enemy and not conquer your own mind.",
          crossReferences: ["ttc-33.2"],
        },
        {
          id: "ttc-33.2",
          number: "33",
          translation: "Contentment is wealth. Boldly pushing forward is resolution. Not losing your place is endurance. Dying but not perishing is longevity.",
          commentary: "Contentment is wealth. Not the absence of poverty — the presence of enough. The richest person is not the one who has the most, but the one who needs the least.",
          crossReferences: ["ttc-46.1"],
        },
      ],
    },
    {
      id: "ttc-ch64",
      number: 64,
      title: "What Is Still Is Easy to Hold",
      verses: [
        {
          id: "ttc-64.1",
          number: "64",
          translation: "What is still is easy to hold. What has not yet appeared is easy to plan. What is brittle is easy to break. What is small is easy to scatter. Deal with things before they happen. Put them in order before they get confused.",
          commentary: "The art of prevention. The sage deals with problems before they arise. Not by controlling — by noticing. The small crack in the dam. The first thought of anger. The slightest imbalance.",
          crossReferences: ["ttc-64.2"],
        },
        {
          id: "ttc-64.2",
          number: "64",
          translation: "A tree as big as a man's embrace grew from a tiny shoot. A tower nine stories high began with a heap of earth. A journey of a thousand miles began with a single step.",
          commentary: "The most famous line in the Tao Te Ching. Every great thing began small. Every transformation began with one step. Not a plan. Not a goal. One step. Right now.",
          crossReferences: ["ttc-64.1"],
        },
      ],
    },
    {
      id: "ttc-ch76",
      number: 76,
      title: "The Hard and the Soft",
      verses: [
        {
          id: "ttc-76.1",
          number: "76",
          translation: "A man is born gentle and weak. At his death he is hard and stiff. Green plants are tender and filled with sap. At their death they are withered and dry. Therefore the stiff and unbending is the disciple of death. The soft and yielding is the disciple of life.",
          commentary: "The body teaches what the mind cannot. The dead body is rigid. The living body is soft. The dead tree snaps. The living tree bends. Choose softness. Choose life.",
          crossReferences: ["ttc-8.1", "ttc-78.1"],
        },
      ],
    },
    {
      id: "ttc-ch81",
      number: 81,
      title: "True Words Are Not Beautiful",
      subtitle: "The Last Chapter",
      verses: [
        {
          id: "ttc-81.1",
          number: "81",
          translation: "True words are not beautiful. Beautiful words are not true. A good person does not argue. One who argues is not good. One who knows is not learned. One who is learned does not know.",
          commentary: "The last words of the Tao Te Ching. Already they undo themselves. If true words are not beautiful, is this translation beautiful? If a good person does not argue, why did Lao Tzu write 81 chapters? The Tao contains its own contradiction.",
          crossReferences: ["ttc-1.1", "ttc-81.2"],
        },
        {
          id: "ttc-81.2",
          number: "81",
          translation: "The sage does not hoard. Having bestowed all he has on others, he has yet more. Having given all he has, he is richer still. The Way of heaven benefits and does not harm. The Way of the sage acts but does not compete.",
          commentary: "The final teaching. Giving everything away — and having more. Not a paradox. A law. The more you give, the more you have. Not materially. Existentially. The sage is the richest person alive — because the sage needs nothing.",
          crossReferences: ["ttc-81.1"],
        },
      ],
    },
  ],
};

// ─── YOGA SUTRAS OF PATANJALI ───
export const YOGA_SUTRAS: SacredText = {
  id: "yoga-sutras",
  title: "Yoga Sutras of Patanjali",
  category: "shastras",
  subtitle: "The 196 Aphorisms on the Practice of Yoga",
  description: "The foundational text of classical yoga. 196 sutras in 4 chapters. The most practical spiritual text ever written.",
  isPublicDomain: true,
  source: "Public domain translations from Sanskrit",
  chapters: [
    {
      id: "ys-ch1",
      number: 1,
      title: "Samadhi Pada",
      subtitle: "On Concentration and Meditation",
      introduction: "What is yoga? What is the mind? How do we still it? Patanjali begins with definitions and the nature of consciousness.",
      verses: [
        {
          id: "ys-1.1",
          number: "1.1",
          sanskrit: "अथ योगानुशासनम्",
          translation: "Now begins the instruction of yoga.",
          commentary: "One word. 'Now.' Not yesterday. Not tomorrow. Now. The entire science of yoga begins with presence. This is not an introduction — it is the first teaching.",
          crossReferences: ["ys-1.2", "ys-1.12"],
        },
        {
          id: "ys-1.2",
          number: "1.2",
          sanskrit: "योगश्चित्तवृत्तिनिरोधः",
          translation: "Yoga is the stilling of the modifications of the mind.",
          commentary: "The most famous definition in yoga. Not postures. Not breathing. Stilling the mind's modifications. Every thought, emotion, memory, fantasy — these are the vrittis. Yoga is their cessation. Not suppression — cessation through awareness.",
          crossReferences: ["ys-1.1", "ys-1.13"],
        },
        {
          id: "ys-1.12",
          number: "1.12",
          sanskrit: "अभ्यासवैराग्याभ्यां तन्निरोधः",
          translation: "The stilling of the mind's modifications is achieved through practice and detachment.",
          commentary: "Two wings of the same bird. Practice (abhyasa) — consistent, sustained effort. Detachment (vairagya) — letting go of the fruits of practice. One without the other is incomplete.",
          crossReferences: ["ys-1.13", "ys-1.14", "ys-1.15"],
        },
        {
          id: "ys-1.13",
          number: "1.13",
          sanskrit: "तत्र स्थितौ यत्नोऽभ्यासः",
          translation: "Practice is the effort to remain in that stillness.",
          commentary: "Not the effort to achieve stillness — the effort to REMAIN in it. The difference is everything. You are already still. Practice is the effort to notice and stay there.",
          crossReferences: ["ys-1.12", "ys-1.14"],
        },
        {
          id: "ys-1.14",
          number: "1.14",
          sanskrit: "स तु दीर्घकालनैरन्तर्यसत्कारासेवितो दृढभूमिः",
          translation: "That practice becomes firmly grounded when done for a long time, without interruption, and with sincere devotion.",
          commentary: "Three conditions: Long time (not a weekend retreat). Without interruption (daily, even when you don't feel like it). With sincere devotion (not as a chore, but as a sacred act).",
          crossReferences: ["ys-1.13", "ys-1.12"],
        },
        {
          id: "ys-1.33",
          number: "1.33",
          sanskrit: "मैत्रीकरुणामुदितोपेक्षाणां सुखदुःखपुण्यापुण्यविषयाणां भावनातश्चित्तप्रसादनम्",
          translation: "The mind is purified by cultivating friendliness toward the happy, compassion toward the suffering, gladness toward the virtuous, and equanimity toward the wicked.",
          commentary: "The most practical verse in the Yoga Sutras. Four attitudes for four types of people. Not abstract philosophy — daily mental hygiene. Your mind is polluted by how you relate to others. Cleanse it with these four.",
          crossReferences: ["ys-1.34", "ys-1.35"],
        },
      ],
      summary: "Chapter 1 defines yoga, establishes the two pillars of practice and detachment, and provides the mental hygiene practices that prepare the mind for deeper meditation.",
    },
    {
      id: "ys-ch2",
      number: 2,
      title: "Sadhana Pada",
      subtitle: "On Practice",
      introduction: "The practical chapter. The Eight Limbs of Yoga are introduced. Kriya Yoga. The causes of suffering.",
      verses: [
        {
          id: "ys-2.1",
          number: "2.1",
          sanskrit: "तपःस्वाध्यायेश्वरप्रणिधानानि क्रियायोगः",
          translation: "Kriya Yoga — the yoga of action — consists of discipline (tapas), self-study (svadhyaya), and surrender to the divine (ishvara pranidhana).",
          commentary: "Before the Eight Limbs, Patanjali gives us three. Discipline — the willingness to be uncomfortable. Self-study — honest self-observation. Surrender — letting go of the need to control. These three are the foundation of everything that follows.",
          crossReferences: ["ys-2.32", "ys-2.11"],
        },
        {
          id: "ys-2.11",
          number: "2.11",
          sanskrit: "ध्यानहेयास्तद्वृत्तयः",
          translation: "The modifications of the mind that cause suffering are to be abandoned through meditation.",
          commentary: "Not through thinking. Not through analysis. Through meditation. The vrittis that cause suffering cannot be argued away — they must be meditated away. This is the entire science of yoga in one verse.",
          crossReferences: ["ys-2.1", "ys-1.2"],
        },
        {
          id: "ys-2.28",
          number: "2.28",
          sanskrit: "योगाङ्गानुष्ठानादशुद्धिक्षये ज्ञानदीप्तिराविवेकख्यातेः",
          translation: "Through the practice of the limbs of yoga, impurities are destroyed and the light of wisdom illuminates discriminative awareness.",
          commentary: "The Eight Limbs are not steps — they are limbs. They grow together. Each one purifies. Each one illuminates. And the light that emerges is not intellectual — it is the light of discrimination: the ability to see the real from the unreal.",
          crossReferences: ["ys-2.29", "ys-2.30"],
        },
        {
          id: "ys-2.29",
          number: "2.29",
          sanskrit: "यमनियमासनप्राणायामप्रत्याहारधारणाध्यानसमाधयोऽष्टावङ्गानि",
          translation: "The eight limbs of yoga are: yama (restraints), niyama (observances), asana (posture), pranayama (breath control), pratyahara (withdrawal of senses), dharana (concentration), dhyana (meditation), and samadhi (absorption).",
          commentary: "The most famous list in yoga. Not eight steps — eight limbs. They grow together. The first two are ethical. The next three are physical. The last three are meditative. Together, they form a complete path from outer behavior to inner liberation.",
          crossReferences: ["ys-2.30", "ys-2.31", "ys-2.32"],
        },
        {
          id: "ys-2.46",
          number: "2.46",
          sanskrit: "स्थिरसुखमासनम्",
          translation: "The posture for meditation should be steady and comfortable.",
          commentary: "Two words: steady and comfortable. Not painful. Not rigid. Steady — like a mountain. Comfortable — like home. If your posture causes pain, it is not yoga. If it causes sleepiness, it is not yoga. Find the middle.",
          crossReferences: ["ys-2.47", "ys-2.48"],
        },
      ],
      summary: "Chapter 2 introduces Kriya Yoga, the causes of suffering, and the Eight Limbs — the most influential framework in yoga history.",
    },
    {
      id: "ys-ch3",
      number: 3,
      title: "Vibhuti Pada",
      subtitle: "On Powers and Accomplishments",
      introduction: "The last three limbs in detail. The siddhis (powers) that arise from deep practice. And the warning not to be seduced by them.",
      verses: [
        {
          id: "ys-3.1",
          number: "3.1",
          sanskrit: "देशबन्धश्चित्तस्य धारणा",
          translation: "Dharana (concentration) is fixing the mind on a single point.",
          commentary: "One point. One object. One thought. Not for a second — for an extended period. When the mind stays fixed like a flame in a windless place, that is dharana. Everything else is distraction.",
          crossReferences: ["ys-3.2", "ys-3.3"],
        },
        {
          id: "ys-3.2",
          number: "3.2",
          sanskrit: "तत्र प्रत्ययैकतानता ध्यानम्",
          translation: "Dhyana (meditation) is the continuous flow of attention toward that object.",
          commentary: "Dharana is drops of water. Dhyana is a stream. When concentration becomes unbroken — not effortful, not intermittent — it flows like oil from one vessel to another. That flow is meditation.",
          crossReferences: ["ys-3.1", "ys-3.3"],
        },
        {
          id: "ys-3.3",
          number: "3.3",
          sanskrit: "तदेवार्थमात्रनिर्भासं स्वरूपशून्यमिव समाधिः",
          translation: "Samadhi (absorption) is when the mind becomes so absorbed in the object that it loses awareness of itself.",
          commentary: "The meditator disappears. Only the object remains. Not 'I am meditating on the flame' — just the flame. Not 'I am aware of the breath' — just the breath. This is samadhi: the end of the subject-object split.",
          crossReferences: ["ys-3.1", "ys-3.2"],
        },
        {
          id: "ys-3.55",
          number: "3.55",
          sanskrit: "सत्त्वपुरुषयोः शुद्धिसाम्ये कैवल्यमिति",
          translation: "When the purity of the mind equals the purity of the Self, liberation (kaivalya) is attained.",
          commentary: "The mind is a mirror. When it is polished clean — no scratches, no dust, no distortion — it reflects the Self perfectly. That reflection IS the Self. The mirror and what it reflects become one. That is liberation.",
          crossReferences: ["ys-3.54", "ys-4.34"],
        },
      ],
      summary: "Chapter 3 describes the inner limbs (concentration, meditation, absorption) and the powers that arise. The warning: don't get attached to powers. Liberation is the only goal.",
    },
    {
      id: "ys-ch4",
      number: 4,
      title: "Kaivalya Pada",
      subtitle: "On Liberation",
      introduction: "The final chapter. What is liberation? Who is liberated? The nature of freedom.",
      verses: [
        {
          id: "ys-4.34",
          number: "4.34",
          sanskrit: "पुरुषार्थशून्यानां गुणानां प्रतिप्रसवः कैवल्यं स्वरूपप्रतिष्ठा वा चितिशक्तिरिति",
          translation: "Liberation is when the qualities of nature return to their source, and consciousness is established in its own true nature.",
          commentary: "The last verse of the Yoga Sutras. The gunas (qualities of nature) return to equilibrium. The mind is still. And consciousness — pure, undifferentiated, infinite consciousness — stands alone. Not lonely. Alone. Complete. Kaivalya. Liberation.",
          crossReferences: ["ys-1.2", "ys-3.55"],
        },
      ],
      summary: "Chapter 4 is the shortest and deepest. Liberation is not an achievement — it is the recognition of what has always been. Consciousness, established in itself. Nothing added. Nothing removed. Just this.",
    },
  ],
};

// ─── Export All Sacred Texts ───
export const ALL_SACRED_TEXTS: SacredText[] = [
  BHAGAVAD_GITA,
  DHAMMAPADA,
  TAO_TE_CHING,
  YOGA_SUTRAS,
];
