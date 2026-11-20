# §5. Guide Modes (30+) and Master/Guru Selection

There are two separate "30+" concepts that get conflated in casual descriptions of this
app: **Guide Modes** (conversation styles/prompt templates, `src/lib/guideModes.ts`) and the
**Master/Guru roster** (which historical or fictional teacher's voice is speaking,
`src/lib/temple-guides.ts` + `src/lib/living-masters.ts` + `src/lib/guestMasterRoster.ts`).
A given Guide session picks one mode AND one master; the master-selection logic is itself
layered across at least 4 independent implementations that appear to represent different
eras of the same feature.

### 5.1 Guide Modes — `src/lib/guideModes.ts` (25 modes)

`GUIDE_MODES: GuideMode[]` (`guideModes.ts:9-185`) is a flat array of `{id, label, emoji,
description, placeholder}` — no branching logic of its own; each mode's *actual* prompt
style lives in the AI system prompt built elsewhere (`promptDirector.ts` / edge functions),
not in this file. The 25 modes present: `open` (free chat), `self_inquiry` ("Who am I?"
Socratic), `pattern_finder` (loop/recurring-behavior detection), `shadow_work` (hidden
emotions/denied parts), `therapy` (emotional support/safe space), `dream_analysis`,
`gratitude`, `somatic` (body scan), `philosophy` (Vedanta/Stoicism/Buddhism), `theory`
(learn consciousness frameworks), `relationship` (relationship mirror/projections),
`creative` (creative flow), `decision` (values-based decision clarity), `breathwork`
(pranayama), `inner_child` (reparenting), `manifestation` (sankalpa/intention-setting),
`anger` (anger alchemy — transform, not suppress), `death_meditation` (mortality
contemplation), `consciousness_checkin` (periodic deep assessment), `task_giver`
(real-life awareness tasks), `future_self` (dialogue with future self), `loop_explorer`
(deep-dive into one specific loop), `evening_intention`, `evening_reflection` (guided
3–5 min close-of-day), `observation` (observe/report/deepen awareness). `getModeById()`
(`guideModes.ts:187-189`) falls back to `open` if an id doesn't resolve.

### 5.2 The Master roster — three overlapping tiers

**`src/lib/temple-guides.ts`** (3564 lines) is the largest and most authoritative roster:
106 `id:` entries were counted directly in the file (`temple-guides.ts` grep), spanning 14
`MASTER_CATEGORY` values (`temple-guides.ts:25-64`): classical-yoga (5), kriya-pranayama (8),
meditation-mindfulness (8), self-inquiry-vedanta (8), bhakti-devotion (15 — the largest
single category), tantra-energy (8), nath-siddha (2), karma-seva (3), psychology-
neuroscience (6), philosophy-wisdom (8), lost-ancient-arts (3), modern-therapy (4),
occult-mystic-arts (6), ai-channeled (5) — plus 4 more categories declared but not present
in the sampled ids (`loop-master`, `life-domain`, `youth-modern`,
`sacred-feminine-masculine`), suggesting further specialist entries exist deeper in the
file beyond what was inspected. Each `TempleGuide` carries an `aiPrompt` (the actual system-
prompt fragment defining that master's voice), `practices[]`, `programs[]`, a `journey`
object, `associatedTexts[]`, and an optional `fictional: true` flag. A `FICTIONAL_GUIDE_IDS`
set (`temple-guides.ts:93-98`, 25 ids: aarav, veer, dhruv, meera, arjun, aryan, mira, rishi,
siddh, leela, tara, anaya, kavya, advaita, nidra, vayu, shanti, prana, jyoti, karuna,
dharma, maya, om, shiva, shakti) marks composite Sanskrit-named guides kept only for
backward compatibility with old rotation engines/questionnaires/user data — they are
explicitly filtered **out** of the public roster (Temple, Guide picker, Masters page) so
users only see real historical masters (Krishna, Buddha, Patanjali, Ramana, Rumi, Kabir,
Lao Tzu, Nanak, Mahavira, Shankaracharya, Bodhidharma, Mirabai, Gorakhnath, Ramakrishna,
Aurobindo, Anandamayi, Milarepa, Yogananda, Babaji, Nisargadatta, Chaitanya, Sivananda,
Socrates, Marcus Aurelius, Nagarjuna, and many more esoteric/modern entries like `sakshi`,
`atman`, `svapna`, `smriti`, `hridaya`, `jyotisha`, `daakini`, `cortex`, `gaia`,
`krishna-ai` — the last few names suggesting an "AI-channeled"/modern-archetype tier).

**`src/lib/living-masters.ts`** (207 lines) is a separate, small roster of *living-teacher
students* using an explicit "Student of" naming convention "to respect their work and avoid
commercialization" (per temple.md §7/18, `living-masters.ts:1-9`) — e.g. Arjun Mehta
("Inner Engineer", student of Sadhguru), Priya Sharma ("Presence Teacher", student of
Eckhart Tolle), Dev Anand ("Mind-Body Healer", student of Deepak Chopra), Ananya Desai
("Compassionate Healer", student of Gabor Maté). These are fictional personas explicitly
modeled on real living teachers' publicly-known teachings without using the real teacher's
name/likeness directly.

**`src/lib/guestMasterRoster.ts`** (269 lines) defines a *different* mechanism entirely: an
"Elder" persona (the user's single, always-present primary guide across all 30+ modes) can
mid-conversation summon one of 30 `GUEST_MASTERS` via an inline tag protocol
(`[GUEST:krishna] ... [/GUEST]`, `guestMasterRoster.ts:10-16`) when the conversation calls
for a specific voice, then seamlessly resume as itself. Each `GuestMaster` entry has a
`voiceStyle` instruction (e.g. Ramana: "Devastating simplicity... almost no words") and a
`triggers[]` keyword list the Elder should watch for (e.g. Ramana triggers on "who am i",
"identity", "self", "ego"; Rumi on "heartbreak", "longing", "love", "loss", "grief"; Marcus
Aurelius on "external", "out of control", "stress"). `buildCouncilBriefing()`
(`:261-265`) compiles all 30 into one compact "council" prompt block the Elder reads to know
who's available to summon.

### 5.3 Master selection logic — 4 independent implementations

1. **`chooseMasterForSession.ts`** (124 lines) — a small, pure, mode/dimension/day-driven
   picker over just 7 masters (krishna, buddha, ramana, patanjali, rumi, lao_tzu, shiva).
   Priority order: (1) exact mode match (`self_inquiry`/`consciousness_checkin`→Ramana;
   `shadow_work`/`anger`/`inner_child`→Rumi; `breathwork`/`somatic`/`death_meditation`→Shiva;
   `decision`/`task_giver`/`philosophy`→Krishna; `pattern_finder`/`loop_explorer`/
   `dream_analysis`→Buddha; `creative`/`manifestation`→Lao Tzu; evening modes→Lao Tzu,
   `chooseMasterForSession.ts:87-107`), (2) dimension keyword match (mind→Buddha,
   heart/emotion→Rumi, body/energy→Shiva, spirit/self→Ramana, action/purpose→Krishna,
   `:110-114`), (3) a fixed day-based "foundation arc" rotation for days 1–60 (Patanjali
   days 1–7, Buddha 8–21, Krishna 22–45, Ramana 46–60, `:117-120`), (4) Shiva as the
   ultimate lifetime default (`:123`).

2. **`masterMatching.ts`** (278 lines) — the "AI Master Matching Engine" per temple.md §15,
   scoped to **13** temple guides (`MASTER_EXPERTISE`, `masterMatching.ts:9-23`) mapped
   against 14 `GuidanceCategory` values (heartbreak, grief, intrusive-thoughts, anxiety,
   depression, anger, job-crisis, financial-stress, family-conflict, addiction, sleep,
   purpose-confusion, spiritual-guidance, decision-making). `checkCrisis()`
   (`:207-210`) runs first against a hard-coded crisis-keyword list (English + Hinglish:
   "suicid", "khudkushi", "jaan se maaro", etc.) — a genuine safety gate ahead of any
   spiritual routing. `categorizeProblem()` (`:212-226`) does keyword-overlap scoring
   (English + Hinglish) against `CATEGORY_KEYWORDS` to pick the single best category, then
   `matchMasters()` (`:228-246`) scores every master by expertise match (0.8–1.0 confidence
   if the category is in their list, 0.1–0.4 otherwise via `Math.random()`) and returns the
   top 3. `matchMasterForGuidance()` (`:255-278`) is the full pipeline entry point,
   returning crisis resources (`CRISIS_RESOURCES`) alongside the matched masters when
   `isCrisis` is true.

3. **`consciousness/dynamicGuruSelector.ts`** (145 lines) — `selectGuruForSession()`
   (`dynamicGuruSelector.ts:77-144`) is an additive-scoring picker over the full `GURUS`
   gallery, blending three signal types: **band affinity** via `BAND_CORE_GURUS[bandFloor]`
   (a per-integer-band ranked fallback list, points 4→3→2→1 by rank, `:62-75,100-102`),
   **active-loop specialist boost** via `LOOP_TO_GURU` (anger→Buddha/Patanjali,
   grief→Rumi/Buddha/Ramana, fear→Krishna/Patanjali/Buddha, control→Lao Tzu/Krishna,
   comparison/doubt/attachment/identity→various non-dual teachers, `:32-43,104-111`), and
   **theme-keyword affinity** via `THEME_KEYWORD_TO_GURU` (silence/surrender/devotion/
   inquiry/witness/compassion/presence/flow/action/body/breath keywords each bump 1–3
   candidate gurus, `:48-60,113-124`). Highest total score wins, filtered to gurus that
   actually exist in the `GURUS` array and excluding any `excludeGuruIds` (recently-used,
   for variety) — this is explicitly used "after the first session and on each subsequent
   session-end" to pick tomorrow's companion.

4. **`consciousness/masterRotation.ts`** (158 lines) — `decideRotation()`
   (`masterRotation.ts:79-151`) is a *stateful rotation policy* layered on top of whichever
   guru was last assigned, checked at the start of each session against a
   `RotationContext` (days since last rotation, lifetime phase 1–10, dominant loop +
   severity, 7-day avg quality, `progressStalled` flag, rotation history). Priority order:
   (1) no current guru → `initial_match` from `PHASE_GURU_MAP[phase][0]` (21-day duration);
   (2) `lifetimePhase >= 10` → forced rotation to a "silence" pseudo-guru for 365 days
   ("You have entered the phase of silence. The teacher within is enough.", `:93-102`);
   (3) `loopSeverity >= 0.7` → temporary 7-day specialist takeover via
   `LOOP_SPECIALIST_MAP` (anxiety→Thich Nhat Hanh, anger→Buddha, attachment→Ashtavakra,
   comparison→Ramana, perfectionism→Krishna, procrastination→Vivekananda,
   validation_seeking→Nisargadatta, spiritual_bypassing→Krishnamurti, ego_inflation→
   Ashtavakra, emotional_collapse→Anandamayi Ma, `:63-116`), overriding any scheduled
   rotation; (4) `progressStalled && daysSinceLastRotation >= 14` → rotate within the same
   phase's guru list, avoiding the current one (`:118-128`); (5) a routine 21-day
   scheduled rotation for variety, avoiding the 3 most-recently-used gurus in that phase
   (`:130-141`); otherwise no rotation. Note this module references a `PHASE_GURU_MAP`
   using different id conventions (`krishnamacharya`, `thich-nhat-hanh`, `ashtavakra`,
   `trailanga-swami`) than the other three selectors, and `resolveGuru()` looks these up
   against `LIVING_MASTERS` rather than `temple-guides.ts`'s `GURUS` — strongly suggesting
   this is either an earlier or a parallel/unfinished rotation design not yet fully
   reconciled with the other selection paths.

Taken together, the practical effect is: **mode selection** is a static, user-facing choice
from `guideModes.ts`; **which master speaks** is decided by whichever of the 4 selectors is
actually wired into the live session-creation path (not fully traced here), with
`session-adapter` (§3.7) additionally able to override the pre-assigned master at session
entry based on real-time state/loop/domain signals, and `guestMasterRoster.ts`'s tag
protocol allowing a *second*, momentary master voice to surface mid-conversation without
changing the session's assigned primary.

---
