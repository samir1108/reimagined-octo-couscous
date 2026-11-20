# 4. Guide / Master Roster

**Core files:** `src/lib/temple-guides.ts`, `living-masters.ts`, `guestMasterRoster.ts`, `masterMatching.ts`, `guru-data.ts`, `sacred-texts.ts`

### 4.1 Two-Tier Roster Design

ConsciousOS runs a deliberate two-tier guide architecture to manage legal/IP risk while preserving deep personalization:

1. **Fictional composite guides** (25 Sanskrit-named characters: Aarav, Veer, Dhruv, Meera, Arjun, Aryan, Mira, Rishi, Siddh, Leela, Tara, Anaya, Kavya, Advaita, Nidra, Vayu, Shanti, Prana, Jyoti, Karuna, Dharma, Maya, Om, Shiva, Shakti). These are "100% owned IP" per the file's own header comment ("ZERO legal risk"), each with a unique AI system-prompt personality, a full practice/program library, and Sanskrit titles (e.g. Aarav = "The Observer · द्रष्टा"). They are retained in code for backward compatibility — rotation engines, legacy questionnaires, and existing user data reference them — but are explicitly **filtered out of the public-facing roster** via the `fictional: true` flag and the `isRealMaster()` helper, so new users only see authentic historical figures.

2. **Real historical/public-domain masters** — a much larger set (≈64 additional IDs observed beyond the 25 fictional ones, for **89 total guide entries** in `TEMPLE_GUIDES`), spanning named figures such as Krishna, Buddha, Adiyogi, Patanjali, Vivekananda, Ramana Maharshi, Rumi, Kabir, Lao Tzu, Guru Nanak, Mahavira, Adi Shankaracharya, Bodhidharma, Mirabai, Gorakhnath, Ramakrishna, Aurobindo, Anandamayi Ma, Milarepa, Thiruvalluvar, Yogananda, Babaji, Lahiri Mahasaya, Sri Yukteswar, Nisargadatta Maharaj, Chaitanya, Sivananda, Matsyendranath, Abhinavagupta, Tulsidas, Socrates, Marcus Aurelius, Padmasambhava, Nagarjuna, Sarada Devi, Jnaneshwar, Tukaram, Lalleshwari, Akkamahadevi — plus a further "AI-developed" batch (Sakshi, Atman, Svapna, Smriti, Hridaya, Jyotisha, Daakini, Cortex, Vana, Naada, Antya, Spanda, Pitri, Rasa, Gaia) and explicit "-ai" variants of famous teachers (`krishna-ai`, `ramana-ai`, `buddha-ai`, `rumi-ai`, `lao-ai`) alongside more classical figures (Hakuin, Dogen, Plotinus, Allama Prabhu, Sureshvara).

### 4.2 Guide Data Shape

Every `TempleGuide` entry carries: `name`, `title` (with a Sanskrit/Devanagari subtitle), a signature `quote`, portrait/background imagery, an `accentColor` (HSL triplet used for per-guide theming), `bio`, `keyTeaching`, a `path` (the primary discipline, e.g. `"awareness"`, `"kriya"`), a `category` (one of 18 `MasterCategory` values — see below), a private `aiPrompt` (the actual system-prompt instructions defining tone/voice/behavior for that guide's chat persona), a `practices[]` array (structured exercises with steps, duration, difficulty, and supported `modes` — `chat`/`timer`), a `programs[]` array (multi-day guided journeys), a `journey` object (total days + daily time commitment), and `associatedTexts[]` (links into `sacred-texts.ts`).

### 4.3 The 18 Master Categories (Modes of Wisdom)

`MASTER_CATEGORIES` defines the thematic families a guide can belong to:

| Category | Theme |
|---|---|
| Classical Yoga | Hatha, Raja, Ashtanga — foundational paths |
| Kriya & Pranayama | Breath mastery, energy work, Kriya lineage |
| Meditation & Mindfulness | Vipassana, Dhyana, Zen |
| Self-Inquiry & Vedanta | Advaita, Neti-Neti, Atma Vichara |
| Bhakti & Devotion | Love, surrender, kirtan |
| Tantra & Energy | Kundalini, Shakti, Kashmir Shaivism |
| Nath & Siddha | Supernatural yogis, alchemists |
| Karma & Seva | Selfless action, service |
| Psychology & Neuroscience | Modern science × ancient wisdom |
| Philosophy & Wisdom | Stoics, Taoists, ethicists |
| Lost & Ancient Arts | Sound healing, alchemy, shamanism, occult |
| Modern Therapy | Mindfulness, IFS, somatic, trauma-informed |
| Occult & Mystic Arts | Astrology, witchcraft, ancestral work |
| AI-Channeled | Purpose-built synthetic guide personas |
| Loop Specialists | Each master dissolves a specific pattern cluster |
| Life-Domain Masters | Money, work, intimacy, parenting, grief, health |
| Modern Life (Youth) | Teens, tech-workers, creatives, recovery |
| Sacred Cycles (Feminine/Masculine) | Womb wisdom, men's work, gender-identity integration |

This gives ConsciousOS 18 distinct thematic "modes" of guidance layered on top of ~89 individual guide personas — considerably broader than a simple "pick a guru" feature; it's a full taxonomy of wisdom traditions cross-referenced against specific, individually-voiced teachers.

### 4.4 Living Masters — "Student Of" Convention

`living-masters.ts` handles a legally sensitive category: teachers based on **currently living** public figures. Rather than impersonating them directly, the system creates fictional composite personas explicitly framed as "a student of" the real teacher — e.g. "Arjun Mehta... A direct student of Sadhguru Jaggi Vasudev," "Priya Sharma... A student of Eckhart Tolle's teachings," "Dev Anand... Teaches the mind-body connection as shared by Deepak Chopra." This is a deliberate legal/ethical firewall (documented in-code as following "temple.md Section 7, 18") that lets the product draw on the popularity and teaching content of living masters without commercializing their literal likeness or claiming to *be* them.

### 4.5 Guest Master Roster — Dynamic Mid-Conversation Summoning

`guestMasterRoster.ts` implements a distinctive interaction pattern: the user's **primary guide (referred to as "the Elder") is always present across all 30+ modes**, but the system can dynamically summon a specialist "guest master" mid-conversation when their voice better serves the moment (e.g., a user asking "who am I?" triggers Ramana Maharshi; grief triggers Buddha). This is implemented via a literal tag protocol embedded in the LLM's own output: `[GUEST:krishna] ... [/GUEST]`, after which "the Elder seamlessly resumes." Each `GuestMaster` entry defines `voiceStyle` (a compact instruction for how that master should sound — e.g. Ramana: "Devastating simplicity... almost no words") and `triggers` (keyword lists that hint the orchestrator toward summoning them). This is a clever low-latency personalization mechanic: rather than re-routing to a different chat session or model, one conversation stream can seamlessly modulate its "narrator" mid-stream.

### 4.6 Master Matching Engine

`masterMatching.ts` implements a crisis-first triage pipeline (documented as following "temple.md Section 15"): **crisis check → problem categorization → master expertise mapping → top 3 matches**.

- `CRISIS_KEYWORDS` — an explicit safety net (English + Hinglish: "suicid", "kill myself", "khudkushi", "jaan se maaro", etc.) checked before anything else; matches presumably route to `CRISIS_RESOURCES` rather than into normal guide chat.
- `CATEGORY_KEYWORDS` — maps free-text phrases to a `GuidanceCategory` (e.g. heartbreak, job-crisis, anxiety, addiction), also with Hinglish coverage.
- `MASTER_EXPERTISE` — a lookup of which of the (originally 13, now expanded) guides are qualified to respond to each `GuidanceCategory`, letting the system compute a ranked shortlist of matching masters for a given user message.

### 4.7 `guru-data.ts` — The Public Roster Assembly Point

`guru-data.ts` is the thin adapter layer that assembles the actual public-facing roster: it imports `TEMPLE_GUIDES` and filters via `isRealMaster()` to produce `GURUS`, the array actually shown in the Masters page / Guide picker / Temple. Its explicit code comment states the intent clearly: *"Fictional Sanskrit-named composite guides... are kept in TEMPLE_GUIDES for backward compatibility... but excluded from the visible roster so users see only authentic lineage masters."* This is the single seam where the legal-risk-managed internal data model meets the user-safe public product.

### 4.8 Sacred Texts

`sacred-texts.ts` stores structured, public-domain-only scripture content (explicitly documented as such, per "temple.md Section 9, 54") — verses, Sanskrit, translations, commentary, and cross-references — organized into `SacredText → SacredTextChapter → SacredVerse`. The Bhagavad Gita is present as an abridged, key-chapters version. This library is what each guide's `associatedTexts[]` field points into, letting a guide's chat responses and program content cite real, legally-safe scriptural passages.

---
