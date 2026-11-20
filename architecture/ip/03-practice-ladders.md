# 3. Practice Ladders IP — Progressive Skill Systems

**Core files:** `src/data/pranayamaLadder.ts`, `netiNetiLadder.ts`, `selfInquiryLadder.ts`, `microPractices.ts`, `src/data/sensorialPractices/*`, `src/data/foundation-course/*`, `src/data/programs/*`, `src/lib/sutra/practices.ts`

### 3.1 The Ladder Pattern

ConsciousOS repeats a consistent **"ladder" content schema** across its major contemplative disciplines: a numbered sequence of levels, each with a `title`/`question`, an optional Sanskrit term, a one-line summary, long-form `teaching` prose (with citations to classical texts like the *Yoga Sūtras*, *Hatha Yoga Pradīpikā*, and the Upanishads), a `microPractice` (a short, concrete exercise), and either a `signOfReadiness` (pranayama) or `commonTrap` (neti-neti, self-inquiry) — a built-in check for whether the user is ready to progress or is making a predictable mistake at that stage.

#### Pranayama Ladder (`pranayamaLadder.ts`) — 7 levels
Progresses from raw awareness to advanced breath retention:
1. **Natural Breath Awareness** (Sahaja śvāsa) — feel the breath before changing it
2. **Three-Part Breath** (Dīrgha prāṇāyāma) — belly → ribs → chest
3. **Equal Breath** (Sama vṛtti) — matched inhale/exhale counts
4. **Alternate Nostril Breath** (Nāḍī śodhana) — hemispheric balancing
5. **Retention** (Kumbhaka) — the held breath, citing the Hatha Yoga Pradīpikā
6. **Mantra-Bound Breath** (and beyond, up to a 7th level culminating toward *kevala kumbhaka* per the file's own description)

Each level's `signOfReadiness` acts as a soft gate (e.g. Level 3 requires "a comfortable 6-count equal breath for 10 rounds without strain" before Level 4 is appropriate).

#### Neti-Neti Ladder (`netiNetiLadder.ts`) — 5 levels
An Upanishadic "via negativa" sequence of negations, each with a `commonTrap` warning against a specific misuse (e.g. Level 1 warns against dissociating from the body rather than staying embodied while discriminating from it):
1. "I am not this body." (Nāhaṁ dehaḥ)
2. "I am not these emotions." (Nāhaṁ bhāvāḥ)
3. "I am not these thoughts." (Nāhaṁ cittam)
4–5. (further negations toward the ground that cannot be negated)

#### Self-Inquiry Ladder (`selfInquiryLadder.ts`) — 5 levels
Ramana Maharshi's ātma-vichāra operationalized as a walkable sequence:
1. "Who am I?" (Kohaṁ?)
2. "To whom does this thought arise?" (Kasya idam?) — turns any live disturbance into an inquiry trigger
3. "What is the source of the 'I'?" (Ahaṁ kuto?)
4. "Who is the one inquiring?"
5. (final level collapsing inquiry into the Self)

Each `commonTrap` correctly anticipates the standard failure mode at that stage (e.g. answering the question with a concept rather than looking; using inquiry to suppress rather than meet an emotion).

### 3.2 Micro-Practices — The 60-Second Layer

`microPractices.ts` defines a separate, much lower-commitment library: short (30–60 second) awareness drops tagged by modality (`breath`, `body`, `mind`, `heart`, `witness`) intended for "queues, lifts, red lights, between meetings." Examples: "Box breath ×4," "Feet on the ground," "Three things, no story," "Soften the jaw." This is the on-ramp layer sitting below the full ladders — near-zero-friction practices meant to fit inside dead time, functioning as both a retention mechanic and a genuine harm-reduction tool for acute-stress moments.

### 3.3 Sensorial Practices — Master-Attributed Micro-Techniques

`src/data/sensorialPractices/` contains ~25 individually-named files, each implementing one specific technique attributed to (or associated with) a historical master or tradition, e.g.:

- `ramana-who-am-i.ts`, `shankara-neti-neti.ts`, `patanjali-pratyahara.ts`, `patanjali-yamas-niyamas.ts`
- `buddha-anapanasati.ts`, `buddha-body-scan.ts`, `thich-nhat-hanh-walking.ts`
- `babaji-kriya-rounds.ts`, `yogananda-hong-sau.ts`, `sadhguru-isha-kriya.ts`, `sadhguru-trataka.ts`
- `osho-dynamic-meditation.ts`, `osho-gibberish-silence.ts`, `rumi-sema-turn.ts`
- `lao-tzu-wu-wei.ts`, `dogen-shikantaza.ts`, `tilopa-mahamudra-rest.ts`
- `krishnamurti-choiceless-awareness.ts`, `krishna-karma-yoga-intent.ts`
- `padmasambhava-tonglen.ts`, `vivekananda-pratyahara.ts`, `witness-sakshi-eye.ts`
- `heart-coherence.ts`, `frankl-meaning-logbook.ts`, `yoga-nidra-body-sweep.ts`

This is effectively a **guided-practice sensorial library** — a shared `types.ts` schema with an `index.ts` aggregator — that likely feeds the "cinematic session" and "temple" experiences (Section 5) with structured, timed sensory scripts unique to each master's voice, letting the same underlying player component render dozens of distinct experiences.

### 3.4 Foundation Course

`src/data/foundation-course/` (`phases.ts`, `days/`, `types.ts`, `index.ts`) structures a beginner-oriented, day-by-day onboarding curriculum organized into phases — the guided, linear counterpart to the more exploratory ladders, aimed at getting brand-new users through the calibration period (Section 1.10) with a fixed daily cadence rather than free-form practice selection.

### 3.5 Programs

`src/data/programs/` organizes longer structured programs by theme (`awareness/`, `emotional/`, `mind/`) plus a `v2/` folder (suggesting an iterated/rewritten generation of program content) with shared `categories.ts` and `types.ts`. These are the multi-day/multi-week guided journeys surfaced on `ProgramsV3.tsx` and cross-referenced from individual guide profiles (`GuideProgram` objects seen in `temple-guides.ts`, e.g. Aarav's "21 Days of Self-Inquiry," "90 Days of Choiceless Awareness").

### 3.6 The Practice Constellation (`src/lib/sutra/practices.ts`)

This is the unifying data model tying every ladder/practice family together into one **12-practice constellation**, used to represent a user's overall practice profile as a weighted vector rather than a single linear track:

`observe, inquiry, bhakti, witness, karma, breath, body, jnana, raja, tantra, neuro, kriya`

Each practice has a `label`, Sanskrit term, description, emoji, and `maxLevel` (5, 6, or 7 depending on practice — `observe` tops out at 7, matching its role as "the witness — always-on spine of every practice"). Every practice carries a `weight` (0.01–1.0) and a `status` derived via `statusFromWeight()`: `primary` (≥0.15), `secondary` (≥0.06), or `dormant` (below that) — critically, **no practice is ever fully zero**, reflecting the design principle that every path remains latently available to a user even if currently unused. This constellation model is what allows "cross-pollination" (mentioned in the micro-level system) to work mechanically: a user primarily in `inquiry` can have `bhakti` quietly promoted from dormant to secondary as their `emotion` dimension lags, directly linking the practice engine to the band/dimension model in Section 1.

`src/lib/sutra/orchestrator.ts` and `modeRegistry.ts` (siblings in the same folder) presumably implement the runtime logic that selects, sequences, and scores sessions against this constellation, and register the different experiential "modes" available for delivering a given practice (chat, timer, cinematic, etc.).

---
