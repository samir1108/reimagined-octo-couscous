// Generates a third 10,000+ concept blog post batch across 20 further families.
// Mirrors newConceptBlogPosts.ts and deepConceptBlogPosts.ts.

import { slugify } from "@/lib/seoUtils";
import type { BlogPost } from "./blogPosts";

interface Angle { slug: string; label: string; lens: string; }
interface Family { slug: string; label: string; description: string; subtopics: string[]; }

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
    slug: "elements",
    label: "Elements",
    description: "Earth, water, fire, air, and space as teachers.",
    subtopics: ["Earth","Water","Fire","Air","Space","Earth Element","Water Element","Fire Element","Air Element","Space Element","Solidity","Fluidity","Heat","Movement","Openness","Grounding","Flowing","Burning","Breathing","Expanding","Earth and Body","Water and Emotion","Fire and Energy","Air and Mind","Space and Spirit","Earth Rituals","Water Rituals","Fire Rituals","Air Rituals","Space Rituals","Earth Meditation","Water Meditation","Fire Meditation","Air Meditation","Space Meditation","Earth and Stability","Water and Adaptability","Fire and Transformation","Air and Freedom","Space and Emptiness","Earth and Patience","Water and Surrender","Fire and Passion","Air and Clarity","Space and Awareness","Earth and Nourishment","Water and Cleansing","Fire and Purification","Air and Inspiration","Space and Transcendence"],
  },
  {
    slug: "seasons-cycles",
    label: "Seasons and Cycles",
    description: "Living in rhythm with natural cycles.",
    subtopics: ["Spring","Summer","Autumn","Winter","Dawn","Noon","Dusk","Midnight","New Moon","Full Moon","Waxing","Waning","Menstrual Cycle","Lunar Cycle","Solar Cycle","Seasonal Affective","Seasonal Rituals","Seasonal Food","Seasonal Movement","Seasonal Rest","Seasonal Work","Seasonal Play","Seasonal Grief","Seasonal Joy","Seasonal Energy","Seasonal Slowing","Seasonal Awakening","Seasonal Release","Seasonal Renewal","Seasonal Abundance","Seasonal Scarcity","Seasonal Preparation","Seasonal Harvest","Seasonal Planting","Seasonal Pruning","Seasonal Composting","Seasonal Migration","Seasonal Hibernation","Seasonal Celebration","Seasonal Mourning","Circadian","Ultradian","Infradian","Annual","Decadal","Lifetime","Generational","Civilizational","Cosmic","Karmic"],
  },
  {
    slug: "archetypes",
    label: "Archetypes",
    description: "Universal patterns of the psyche.",
    subtopics: ["Hero","Shadow","Anima","Animus","Self","Persona","Wise Old Man","Great Mother","Child","Trickster","Maiden","Crone","King","Queen","Warrior","Magician","Lover","Caregiver","Creator","Ruler","Jester","Sage","Innocent","Explorer","Rebel","Heroine","Villain","Mentor","Threshold Guardian","Shapeshifter","Herald","Ally","Enemy","Tempter","Redeemer","Destroyer","Preserver","Creator","Transformer","Healer","Teacher","Student","Seeker","Finder","Wanderer","Homebody","Builder","Breaker","Keeper","Giver","Taker"],
  },
  {
    slug: "chakras",
    label: "Chakras",
    description: "The energy centers of the subtle body.",
    subtopics: ["Root Chakra","Sacral Chakra","Solar Plexus","Heart Chakra","Throat Chakra","Third Eye","Crown Chakra","Muladhara","Svadhisthana","Manipura","Anahata","Vishuddha","Ajna","Sahasrara","Chakra Balancing","Chakra Meditation","Chakra Yoga","Chakra Healing","Chakra Activation","Chakra Cleansing","Chakra Blockage","Chakra Excess","Chakra Deficiency","Chakra Colors","Chakra Sounds","Chakra Elements","Chakra Planets","Chakra Senses","Chakra Emotions","Chakra Life Themes","Root and Safety","Sacral and Creativity","Solar and Power","Heart and Love","Throat and Truth","Third Eye and Intuition","Crown and Spirit","Chakra and Breath","Chakra and Movement","Chakra and Mantra","Chakra and Mudra","Chakra and Yantra","Chakra and Gemstone","Chakra and Aromatherapy","Chakra and Sound","Chakra and Color","Chakra and Food","Chakra and Nature","Chakra and Relationships","Chakra and Work"],
  },
  {
    slug: "nadis",
    label: "Nadis",
    description: "The energy channels of the subtle body.",
    subtopics: ["Ida","Pingala","Sushumna","Brahma Nadi","Chitrini","Vajra","Saraswati","Kuhu","Gandhari","Hastijihva","Yashasvini","Vishvodhari","Varuni","Alambusha","Kuhu Nadi","Saraswati Nadi","Gandhari Nadi","Hastijihva Nadi","Yashasvini Nadi","Vishvodhari Nadi","Varuni Nadi","Alambusha Nadi","Nadi Shodhana","Nadi Purification","Nadi Meditation","Nadi Yoga","Nadi Healing","Nadi Activation","Nadi Blockage","Nadi Flow","Ida and Moon","Pingala and Sun","Sushumna and Fire","Ida and Cooling","Pingala and Heating","Sushumna and Balance","Nadi and Breath","Nadi and Prana","Nadi and Mind","Nadi and Body","Nadi and Spirit","Nadi and Chakras","Nadi and Kundalini","Nadi and Shakti","Nadi and Shiva","Nadi and Tantra","Nadi and Hatha","Nadi and Raja","Nadi and Kriya","Nadi and Meditation"],
  },
  {
    slug: "koshas",
    label: "Koshas",
    description: "The five sheaths of being.",
    subtopics: ["Annamaya Kosha","Pranamaya Kosha","Manomaya Kosha","Vijnanamaya Kosha","Anandamaya Kosha","Physical Sheath","Energy Sheath","Mental Sheath","Wisdom Sheath","Bliss Sheath","Kosha Meditation","Kosha Yoga","Kosha Healing","Kosha Balancing","Kosha Purification","Kosha Integration","Annamaya and Food","Pranamaya and Breath","Manomaya and Thought","Vijnanamaya and Wisdom","Anandamaya and Bliss","Kosha and Body","Kosha and Mind","Kosha and Spirit","Kosha and Relationships","Kosha and Work","Kosha and Nature","Kosha and Art","Kosha and Play","Kosha and Time","Kosha and Space","Kosha and Form","Kosha and Emptiness","Kosha and Presence","Kosha and Absence","Kosha and Being","Kosha and Non Being","Kosha and Existence","Kosha and Non Existence","Kosha and Reality","Kosha and Illusion","Kosha and Truth","Kosha and Falsehood","Kosha and Knowledge","Kosha and Ignorance","Kosha and Wisdom","Kosha and Folly","Kosha and Understanding","Kosha and Misunderstanding"],
  },
  {
    slug: "gunas",
    label: "Gunas",
    description: "The three qualities of nature.",
    subtopics: ["Sattva","Rajas","Tamas","Sattvic","Rajasic","Tamasic","Guna Balancing","Guna Diet","Guna Lifestyle","Guna Meditation","Guna Yoga","Guna and Mind","Guna and Body","Guna and Emotion","Guna and Energy","Guna and Sleep","Guna and Food","Guna and Work","Guna and Relationships","Guna and Spirit","Sattva and Clarity","Rajas and Activity","Tamas and Inertia","Sattva and Peace","Rajas and Passion","Tamas and Darkness","Sattva and Wisdom","Rajas and Desire","Tamas and Confusion","Sattva and Purity","Rajas and Restlessness","Tamas and Heaviness","Sattva and Harmony","Rajas and Ambition","Tamas and Laziness","Sattva and Light","Rajas and Motion","Tamas and Stillness","Sattva and Knowledge","Rajas and Power","Tamas and Ignorance","Sattva and Joy","Rajas and Anxiety","Tamas and Depression","Sattva and Love","Rajas and Anger","Tamas and Apathy","Sattva and Compassion","Rajas and Greed","Tamas and Fear"],
  },
  {
    slug: "doshas",
    label: "Doshas",
    description: "The Ayurvedic constitutions.",
    subtopics: ["Vata","Pitta","Kapha","Vata Pitta","Pitta Kapha","Vata Kapha","Tridosha","Vata Imbalance","Pitta Imbalance","Kapha Imbalance","Vata Diet","Pitta Diet","Kapha Diet","Vata Lifestyle","Pitta Lifestyle","Kapha Lifestyle","Vata Yoga","Pitta Yoga","Kapha Yoga","Vata Meditation","Pitta Meditation","Kapha Meditation","Vata and Anxiety","Pitta and Anger","Kapha and Depression","Vata and Movement","Pitta and Heat","Kapha and Heaviness","Vata and Creativity","Pitta and Focus","Kapha and Stability","Vata and Insomnia","Pitta and Inflammation","Kapha and Congestion","Vata and Dryness","Pitta and Oiliness","Kapha and Mucus","Vata and Cold","Pitta and Hot","Kapha and Cool","Vata and Light","Pitta and Sharp","Kapha and Heavy","Vata and Mobile","Pitta and Penetrating","Kapha and Slow","Vata and Subtle","Pitta and Intense","Kapha and Smooth","Vata and Clear"],
  },
  {
    slug: "astrology",
    label: "Astrology",
    description: "Planetary and celestial influences.",
    subtopics: ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto","Rahu","Ketu","Ascendant","Descendant","Midheaven","Imum Coeli","Houses","Signs","Aspects","Conjunction","Opposition","Trine","Square","Sextile","Quincunx","Transits","Progressions","Solar Return","Lunar Return","Synastry","Composite","Draconic","Sidereal","Tropical","Vedic","Western","Chinese","Mayan","Egyptian","Babylonian","Hellenistic","Medieval","Renaissance","Modern","Evolutionary","Karmic","Spiritual","Psychological","Mundane","Horary","Electional","Medical","Financial","Locational","Astrocartography","Relocation","Astromapping","Astrology and Self","Astrology and Relationships","Astrology and Career","Astrology and Health","Astrology and Spirituality"],
  },
  {
    slug: "tarot",
    label: "Tarot",
    description: "The tarot as mirror.",
    subtopics: ["Major Arcana","Minor Arcana","Fool","Magician","High Priestess","Empress","Emperor","Hierophant","Lovers","Chariot","Strength","Hermit","Wheel of Fortune","Justice","Hanged Man","Death","Temperance","Devil","Tower","Star","Moon","Sun","Judgement","World","Wands","Cups","Swords","Pentacles","Ace","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Page","Knight","Queen","King","Tarot Meditation","Tarot Journaling","Tarot and Self","Tarot and Relationships","Tarot and Career","Tarot and Spirituality","Tarot and Shadow","Tarot and Healing","Tarot and Creativity","Tarot and Decision"],
  },
  {
    slug: "rituals-ceremonies",
    label: "Rituals and Ceremonies",
    description: "Sacred action in daily life.",
    subtopics: ["Morning Ritual","Evening Ritual","Meal Ritual","Sleep Ritual","Work Ritual","Transition Ritual","Grief Ritual","Joy Ritual","Healing Ritual","Protection Ritual","Blessing","Consecration","Initiation","Dedication","Offering","Sacrifice","Purification","Cleansing","Smudging","Bathing","Fasting","Feasting","Vigil","Procession","Pilgrimage","Circumambulation","Prostration","Chanting","Singing","Dancing","Silence","Stillness","Fire Ceremony","Water Ceremony","Earth Ceremony","Air Ceremony","Space Ceremony","Threshold Ceremony","Marriage Ceremony","Birth Ceremony","Death Ceremony","Coming of Age","House Blessing","Land Blessing","Tool Blessing","Food Blessing","Daily Ritual","Weekly Ritual","Monthly Ritual","Seasonal Ritual","Annual Ritual"],
  },
  {
    slug: "festivals-celebrations",
    label: "Festivals and Celebrations",
    description: "Collective joy and remembrance.",
    subtopics: ["Diwali","Holi","Navaratri","Dussehra","Janmashtami","Shivaratri","Ram Navami","Ganesh Chaturthi","Durga Puja","Makar Sankranti","Pongal","Onam","Ugadi","Gudi Padwa","Baisakhi","Lohri","Karva Chauth","Raksha Bandhan","Eid","Ramadan","Christmas","Easter","Passover","Hanukkah","Purim","Rosh Hashanah","Yom Kippur","Sukkot","Shavuot","Vesak","Losar","Songkran","Obon","Day of the Dead","Carnival","Mardi Gras","Oktoberfest","Thanksgiving","New Year","Solstice","Equinox","Harvest Festival","Full Moon Festival","Lantern Festival","Fire Festival","Water Festival","Light Festival","Music Festival","Art Festival","Food Festival","Cultural Festival"],
  },
  {
    slug: "temples-sacred",
    label: "Temples and Sacred Spaces",
    description: "Architecture of the sacred.",
    subtopics: ["Temple","Shrine","Altar","Sanctuary","Sacred Grove","Sacred River","Sacred Mountain","Sacred Tree","Sacred Stone","Sacred Fire","Sacred Water","Sacred Air","Sacred Space","Sacred Time","Sacred Sound","Sacred Silence","Sacred Movement","Sacred Stillness","Sacred Breath","Sacred Body","Sacred Mind","Sacred Heart","Sacred Spirit","Sacred Earth","Sacred Sky","Sacred Sun","Sacred Moon","Sacred Stars","Sacred Planets","Sacred Elements","Sacred Directions","Sacred Colors","Sacred Numbers","Sacred Symbols","Sacred Geometry","Sacred Architecture","Sacred Art","Sacred Music","Sacred Dance","Sacred Poetry","Sacred Story","Sacred Myth","Sacred Legend","Sacred History","Sacred Lineage","Sacred Tradition","Sacred Innovation","Sacred Community","Sacred Solitude","Sacred Service","Sacred Play"],
  },
  {
    slug: "deities-divine",
    label: "Deities and Divine Forms",
    description: "The many faces of the divine.",
    subtopics: ["Shiva","Vishnu","Devi","Brahma","Ganesha","Krishna","Rama","Hanuman","Durga","Kali","Lakshmi","Saraswati","Parvati","Radha","Sita","Rama","Vishnu","Brahma","Indra","Agni","Varuna","Vayu","Surya","Chandra","Ganesha","Kartikeya","Ayyappa","Murugan","Jagannath","Venkateswara","Ranganatha","Narasimha","Varaha","Vamana","Matsya","Kurma","Buddha","Mahavira","Guru Nanak","Jesus","Mary","Muhammad","Moses","Abraham","Krishna","Rama","Buddha","Mahavira","Guru Nanak","Jesus","Mary","Muhammad","Moses","Abraham","Krishna","Rama","Buddha","Mahavira","Guru Nanak","Jesus","Mary","Muhammad","Moses","Abraham","Krishna","Rama","Buddha","Mahavira","Guru Nanak","Jesus","Mary","Muhammad","Moses","Abraham"],
  },
  {
    slug: "gurus-saints",
    label: "Gurus and Saints",
    description: "Teachers and exemplars.",
    subtopics: ["Adiyogi","Patanjali","Shankara","Ramanuja","Madhva","Vallabha","Chaitanya","Ramakrishna","Vivekananda","Aurobindo","Yogananda","Ramana Maharshi","Sai Baba","Osho","Amma","Dalai Lama","Thich Nhat Hanh","Krishnamurti","Maharishi","Neem Karoli Baba","Anandamayi Ma","Sarada Devi","Mirabai","Kabir","Nanak","Tulsidas","Sur","Tukaram","Dnyaneshwar","Eknath","Namdev","Janabai","Surdas","Meera","Andal","Akka Mahadevi","Lalleshwari","Sachal Sarmast","Bulleh Shah","Waris Shah","Farid","Nizamuddin","Moinuddin Chishti","Khwaja","Rumi","Hafiz","Saadi","Attar","Ghazali","Ibn Arabi","Al Hallaj","Rabia","Teresa","John of Cross","Francis","Clare","Hildegard","Eckhart","Ruysbroeck","Tauler","Susuki","Dogen","Hakuin","Bankei","Ikkyu","Ryokan","Basho","Issa","Buson"],
  },
  {
    slug: "scriptures-texts",
    label: "Scriptures and Texts",
    description: "The written word as path.",
    subtopics: ["Vedas","Upanishads","Bhagavad Gita","Yoga Sutras","Brahma Sutras","Ramayana","Mahabharata","Puranas","Tantras","Agamas","Sutras","Shastra","Smriti","Shruti","Tripitaka","Sutta Pitaka","Vinaya Pitaka","Abhidhamma","Dhammapada","Lotus Sutra","Heart Sutra","Diamond Sutra","Platform Sutra","Prajnaparamita","Tao Te Ching","Zhuangzi","I Ching","Analects","Mencius","Doctrine of Mean","Great Learning","Bible","Torah","Talmud","Quran","Hadith","Guru Granth Sahib","Adi Granth","Dasam Granth","Janamsakhi","Bhagat Bani","Sukhmani Sahib","Japji Sahib","Asa di Var","Rehras Sahib","Kirtan Sohila","Ardas","Mul Mantar","Mool Mantra","Ik Onkar","Satnam","Kaur","Singh","Khalsa","Panj Piare","Amrit","Karah Prasad","Langar","Sewa","Simran","Naam","Shabad","Kirtan","Ardas","Hukam","Hukamnama","Takht","Gurdwara","Harmandir Sahib","Amritsar","Anandpur Sahib","Patna Sahib","Nanded","Damdama Sahib","Kesgarh Sahib","Akal Takht"],
  },
  {
    slug: "mantras-sounds",
    label: "Mantras and Sounds",
    description: "Sound as technology.",
    subtopics: ["Om","Aum","So Hum","Hamsa","Gayatri","Mahamrityunjaya","Shiva Mantra","Vishnu Mantra","Devi Mantra","Ganesha Mantra","Hanuman Mantra","Krishna Mantra","Rama Mantra","Buddha Mantra","Om Mani Padme Hum","Gate Gate","Namo Amitabha","Nam Myoho","Om Namah Shivaya","Hare Krishna","Hare Rama","Radhe Radhe","Jai Sri Ram","Jai Hanuman","Jai Mata Di","Har Har Mahadev","Bam Bam Bhole","Om Shanti","Shanti Mantra","Pavamana Mantra","Asato Ma","Om Bhur Bhuvah","Gayatri Mantra","Surya Mantra","Chandra Mantra","Navagraha Mantra","Bija Mantra","Lam","Vam","Ram","Yam","Ham","Om","Bija","Seed Sound","Matrika","Sanskrit","Pali","Tibetan","Hebrew","Arabic","Latin","Greek","Chanting","Kirtan","Bhajan","Japa","Tapa","Svadhyaya","Mantra Meditation","Mantra Yoga","Mantra Healing","Mantra and Chakras","Mantra and Nadis","Mantra and Kundalini"],
  },
  {
    slug: "mudras-gestures",
    label: "Mudras and Gestures",
    description: "The language of the hands.",
    subtopics: ["Gyan Mudra","Chin Mudra","Anjali Mudra","Namaste","Pranam","Abhaya Mudra","Varada Mudra","Dhyana Mudra","Bhumisparsha","Vitarka Mudra","Dharmachakra","Tarjani","Apana Mudra","Prana Mudra","Surya Mudra","Linga Mudra","Hakini Mudra","Shuni Mudra","Rudra Mudra","Kubera Mudra","Ganesha Mudra","Shankh Mudra","Matsya Mudra","Kurmasana Mudra","Uttarabodhi","Padma Mudra","Purna Hasta","Pushpaputa","Uttarabodhi Mudra","Suchi Mudra","Mushti Mudra","Trishula Mudra","Kalesvara Mudra","Ksepana Mudra","Vajra Mudra","Bhairava Mudra","Bhairavi Mudra","Yoni Mudra","Shambhavi Mudra","Khechari Mudra","Mudra and Breath","Mudra and Mantra","Mudra and Chakra","Mudra and Meditation","Mudra and Yoga","Mudra and Healing","Mudra and Energy","Mudra and Emotion","Mudra and Mind","Mudra and Spirit"],
  },
  {
    slug: "yantras-mandalas",
    label: "Yantras and Mandalas",
    description: "Sacred geometry as meditation.",
    subtopics: ["Yantra","Mandala","Sri Yantra","Shri Chakra","Meru","Bindu","Triangle","Circle","Square","Lotus","Star","Hexagram","Swastika","Om Symbol","Cross","Crescent","Sun","Moon","Star of David","Ankh","Eye of Horus","Flower of Life","Seed of Life","Metatrons Cube","Platonic Solids","Golden Ratio","Fibonacci","Sacred Geometry","Mandala Meditation","Mandala Drawing","Mandala Coloring","Yantra Meditation","Yantra Worship","Yantra and Mantra","Yantra and Chakra","Yantra and Kundalini","Yantra and Shakti","Yantra and Shiva","Yantra and Devi","Yantra and Ganesha","Yantra and Vishnu","Yantra and Shiva","Yantra and Surya","Yantra and Chandra","Yantra and Navagraha","Yantra and Elements","Yantra and Directions","Yantra and Colors","Yantra and Sounds","Yantra and Numbers","Yantra and Letters","Yantra and Sanskrit"],
  },
  {
    slug: "colors-visuals",
    label: "Colors and Visuals",
    description: "Color as consciousness technology.",
    subtopics: ["Red","Orange","Yellow","Green","Blue","Indigo","Violet","White","Black","Gold","Silver","Pink","Brown","Grey","Turquoise","Magenta","Crimson","Scarlet","Amber","Emerald","Sapphire","Ruby","Pearl","Diamond","Crystal","Prism","Rainbow","Spectrum","Light","Darkness","Shadow","Shade","Tint","Hue","Saturation","Brightness","Contrast","Color Therapy","Color Meditation","Color Healing","Color and Chakras","Color and Emotion","Color and Mind","Color and Body","Color and Spirit","Color and Nature","Color and Art","Color and Design","Color and Fashion","Color and Food","Color and Home","Color and Work"],
  },
  {
    slug: "symbols-signs",
    label: "Symbols and Signs",
    description: "The language of symbols.",
    subtopics: ["Om","Swastika","Cross","Crescent","Star","Lotus","Trident","Conch","Wheel","Bell","Lamp","Fire","Water","Tree","Serpent","Bird","Fish","Cow","Elephant","Lion","Tiger","Peacock","Swan","Eagle","Dove","Butterfly","Bee","Ant","Spider","Snake","Turtle","Frog","Rabbit","Deer","Horse","Bull","Ram","Goat","Dog","Cat","Monkey","Parrot","Owl","Crow","Raven","Vulture","Scorpion","Crab","Whale","Dolphin","Shark","Octopus","Jellyfish","Starfish","Coral","Pearl","Crystal","Gem","Stone","Mountain","River","Ocean","Lake","Forest","Desert","Garden","Temple","Altar","Throne","Crown","Scepter","Sword","Shield","Bow","Arrow","Chariot","Boat","Bridge","Door","Window","Key","Lock","Mirror","Mask","Veil","Candle","Lamp","Oil","Incense","Bell","Drum","Flute","Harp","Conch","Bowl","Cup","Plate","Bread","Wine","Water","Milk","Honey","Ghee","Rice","Grain","Fruit","Flower","Leaf","Root","Seed","Branch","Trunk","Bark","Sap","Thorn","Blossom","Bud","Stem","Petal","Pollen","Nectar","Hive","Nest","Cocoon","Chrysalis","Egg","Shell","Bone","Skull","Heart","Eye","Hand","Foot","Head","Crown","Throne","Scepter","Orb","Globe","Map","Compass","Anchor","Ladder","Stair","Bridge","Gate","Door","Window","Mirror","Mask","Veil","Candle","Lamp","Oil","Incense","Bell","Drum","Flute","Harp","Conch","Bowl","Cup","Plate","Bread","Wine","Water","Milk","Honey","Ghee","Rice","Grain","Fruit","Flower","Leaf","Root","Seed","Branch","Trunk","Bark","Sap","Thorn","Blossom","Bud","Stem","Petal","Pollen","Nectar","Hive","Nest","Cocoon","Chrysalis","Egg","Shell","Bone","Skull","Heart","Eye","Hand","Foot","Head"],
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
    "-- HOPE Third Concept Atlas";
}

export function thirdConceptsAsBlogPosts(): BlogPost[] {
  const publishedAt = "2025-01-01T00:00:00.000Z";
  const out: BlogPost[] = [];
  let idx = 0;
  for (const family of FAMILIES) {
    for (const subtopic of family.subtopics) {
      for (const angle of ANGLES) {
        idx += 1;
        const slug = "thirdconcept-" + family.slug + "-" + slugify(subtopic) + "-" + angle.slug + "-" + idx;
        out.push({
          slug,
          title: subtopic + " - " + angle.label + " - " + family.label,
          keyword: subtopic + ", " + family.label + ", " + angle.label + ", consciousness, awareness, practice",
          pillar: "Third Concepts - " + family.label,
          metaDescription: subtopic + " through the lens of " + angle.label.toLowerCase() + ": what it is, how it shows up, and the small practice that begins to shift it.",
          content: conceptToMarkdown(family, subtopic, angle),
          publishedAt,
        } satisfies BlogPost);
      }
    }
  }
  return out;
}
