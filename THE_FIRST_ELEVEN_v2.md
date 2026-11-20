# THE FIRST ELEVEN — v2 Rethink Blueprint

> Successor to the v1 eleven sittings (`src/lib/onboarding/firstElevenSessions.ts`).
> Built on a full read of the shipped product: the onboarding gates, the adaptive
> planner, the mapping analyzer, the games signal pipeline, the loop library, the
> mode registry, and the session engines the app already runs in production.
>
> **What this document is:**
> **Part I** — the yoga app we have actually developed, stated plainly.
> **Part II** — the data: verified numbers, straight from the code.
> **Part III** — the engines that track you, and what each one already knows.
> **Part IV** — the surface inventory: modes, programs, games — the raw material
> the eleven sittings have never touched.
> **Part V** — the rethink: all eleven sittings, rebuilt, one by one.
> **Part VI** — more things we should do with them.

---

## PART I — WHAT WE HAVE DEVELOPED

### 1. The app, plainly

Satyug (product name HOPE, internal name ConsciousOS) is a consciousness-development
platform that behaves like a companion rather than a content library. It is built on
one proprietary spine:

- **11 spiral bands** (0–10, Survival → Source) computed from behavior, not self-report
  (`firstElevenEngine.ts:31–43`).
- **650 named loops** of conditioning, each with triggers, manifestations, awareness
  markers, and a dissolution path (`src/data/loops.ts:88–885`, 28 categories).
- **4 mapped dimensions** — thought, emotion, body, awareness
  (`firstElevenTypes.ts:12`).
- **12 practices** — the practice constellation, each with weight, level, status
  (`src/lib/sutra/practices.ts:5–33`).
- **A composer** that assembles every session live from atoms → ingredients →
  archetypes (`src/lib/composer/`), plus a 9-kind step ontology
  (`src/lib/session/types.ts:14–23`).
- **A memory system** that makes tomorrow's session respond to today.

The app's philosophy is *designed for obsolescence*: it is meant to become unnecessary.
That philosophy is why the eleven sittings matter more than they look — they are the
first and often the only fully-authored stretch a user ever meets. Everything after
them is computed. **The First Eleven is the handshake; the engines are the relationship.**

### 2. Where the eleven sittings sit in the journey

```
Foundation onboarding (6 conditioning questions + foundation quiz)
        │  seeds: ConditioningResult + FoundationAnswers
        ▼
THE FIRST ELEVEN  ── Gate 2 ──  11 sittings · ~6–8 min each · closed spine,
        │                        adaptive questions from a 110-question bank
        │                        The Dock (guide-chat) on every step
        ▼
THE MIRROR         ── Gate 4 ──  the mapping rendered: band, dimensions,
        │                        top-5 loops, archetype, summary lines
        ▼
SPIRAL EXPLAINER   ── Gate 5 ──  the 11 bands, where you sit
        ▼
JOURNEY PICKER     ── Gate 6 ──  8 doors ranked against the mapping
        ▼
the living app: gates (morning/midday/evening/night), sessions, programs, games,
guides, temple, journal, analytics — all engine-driven from here on
```

Routes: `FirstEleven` (`src/pages/FirstEleven.tsx`), `TheMirrorPage`, `SpiralPage`,
`JourneyPickerPage`, `SittingSessionPage`. Launched once after onboarding from
`AppEntry.tsx:270–299`; local-first progress with resume
(`src/hooks/useFirstEleven.ts`), published to the consciousness profile on
completion (`usePublishMirror`).

### 3. The First Eleven today — honest mechanics audit

**What already works (keep):**

| Mechanic | Where | Note |
|---|---|---|
| Closed authored spine per sitting | `firstElevenSessions.ts:15–450` | teaching → open → deepen → silence/breath → body → mirror → choice → act |
| Adaptive question fill | `firstElevenEngine.ts:94–161` | deterministic scoring: weakest dimension +3, active loop +2, in-sitting variety −2, per-user hash tiebreak |
| 110-question bank | `firstElevenQuestions.ts` | choice / scale / text kinds; every option carries band + dimension + loop ids |
| Carry-seed rosary | `firstElevenSessions.ts` + `useFirstEleven` | one line out per sitting, quoted at the next threshold |
| The Dock — chat as a property of every step | `TheDock.tsx` + `useSittingDock.ts` | `guide-chat` edge, seeded with sitting, master, step, and every word typed; kept lines sharpen the mapping |
| Threshold / close / complete phases | `FirstElevenScreen.tsx:144–307` | last carry-seed shown as "Left with last time" |
| Mapping analyzer | `firstElevenEngine.ts:179–244` | weighted band (Light Six 0.6, Foundation 1.0, sittings weighted 1 + n/11) |
| 8 ranked journeys | `journeyDefinitions.ts:27–129` | explainable scoring, every point carries its reason |
| Progress persistence + publish | `useFirstEleven.ts`, `usePublishMirror.ts` | local-first, resumes mid-run |

**What is missing (the gap this blueprint closes):**

1. **No teacher presence in the sitting itself.** The teaching step is a wall of
   prose with one attributed quote. Nobody is talking to you. The Dock exists but is
   a generic assistant — it is not the sitting's master, and it never speaks first.
2. **No practice layer.** Sitting 3 has a breath pattern and sitting 1 has a silence
   timer, but they are static timers. The app ships **232 conscious games** with
   verified signal capture — none of them is reachable from the eleven sittings.
3. **No mid-sitting adaptation.** The spine is fixed once. If sitting 9 cracks
   someone open at minute two, nothing notices. The session engines already support
   morphs; the eleven do not use them.
4. **No voice.** The masters have ElevenLabs voices and pre-warmed caches
   (`tts-speak`, `ttsPrewarm.ts`) — the teaching steps are silent text.
5. **No vow ledger.** Each sitting ends in a vow ("I'll take one hour back") that
   is never recalled. Sitting 2 never asks whether sitting 1's vow was kept.
6. **No cross-threading.** Loops detected in the games, journal, and guide never
   re-enter the sittings. The 650-loop library is read by the engines; the eleven
   only see the 84-loop curated slice via the question options.
7. **The mapping is a one-shot reveal.** It is computed at the end and rendered
   once. It never updates, never surprises, never says "this sharpened."

---

## PART II — THE DATA

### 4. Verified numbers (read from the code, not the pitch decks)

| Domain | Number | Source |
|---|---|---|
| Sittings in The First Eleven | 11 | `firstElevenSessions.ts:15–450` |
| Question bank | 110 questions | `firstElevenQuestions.ts` |
| Conditioning seed questions | 6 (the "Light Six") | `conditioningQuestions.ts` |
| Fixed spine steps per sitting | 8–9 | `firstElevenSessions.ts` |
| Conscious games in the LAB catalog | 232 (all built, faculty-tagged) | `src/games/shell/labRegistry.ts` |
| Games in the public registry | 15 (8 playable today) | `src/games/shell/gameRegistry.ts:17–33` |
| Game components shipped | 237 | `src/games/games/*.tsx` |
| Game faculties (training tags) | 13 | `labRegistry.ts:5–19` |
| Guide modes | 36 | `src/lib/guideModes.ts` |
| Mode registry entries (session doors) | 50+ across 12 practices | `src/lib/sutra/modeRegistry.ts:58–290` |
| Behavioral loops | 650 (28 categories) | `src/data/loops.ts` |
| Journey doors after the eleven | 8 | `journeyDefinitions.ts:27` |
| Spiral bands | 11 (0–10) | `firstElevenEngine.ts:31–43` |
| Archetype hints | 9 | `firstElevenEngine.ts:253–262` |
| Edge functions | 103 | `supabase/functions/` |
| Database migrations | 171 | `supabase/migrations/` |
| XState machines | 12 | `src/machines/` |
| Static data libraries | 41 files | `src/data/` |
| UI locales | 40+ | `src/locales/` |

### 5. What the mapping produces

`analyzeFirstEleven` returns, at any point mid-run (not just the end):

```ts
{
  band: 5.4,           // weighted 0–10
  bandMicro: "5.4",
  bandLabel: "Meaning",
  dimensions: { thought: 4.2, emotion: 3.8, body: 5.1, awareness: 6.3 },
  loops: [{ id: "AVD001", score: 4.75 }, …top 5],
  archetypeHint: "creator",
  summaryLines: [ "You are sitting at 5.4 — Meaning. Not a ceiling; a coordinate.", … ],
  answeredCount: 47,
  readyForJourneys: false   // true only at 11/11
}
```

This payload is the spine's **real output** — and today it is shown once, at the
end. It is the single most valuable object in the entire onboarding, and the eleven
sittings currently treat it as a receipt.

### 6. What the data does not yet capture

- **Behavioral telemetry** (answer latency, backspace, skip patterns, revisit) —
  the signal the session engines and games already collect, unused here.
- **Voice and breath** — the mic pipeline (`useMicLevel`, `useBreathMic`) and TTS
  exist and are unused in the sittings.
- **Cross-surface consistency** — the same loop detected by the games and the same
  loop detected by the sittings are two different objects in two different stores.
- **The vow ledger** — declared intentions with nothing measuring them.

---

## PART III — THE ENGINES THAT TRACK YOU

These are live, shipping systems. The eleven sittings sit *upstream* of all of them
and speak to none of them. The rethink wires them in.

### 7. The detection stack

| Engine | What it reads | What it writes |
|---|---|---|
| `live-detect` | real-time in-session signals | loop activations, state shifts |
| `signal-fusion` | merges all signal sources into one state assessment | unified state → consciousness engine |
| `pattern-window` | long-horizon recurrence | recurring patterns invisible in real time |
| `instant-pulse` | immediate state detection | now-state for gate entry |
| local loop detector | client-side pattern recognition, no round trip | instant loop flags |
| typing cadence / pause patterns | how you type, not what you type | sentiment and hesitation proxies |
| `useMicLevel` / `useBreathMic` | breath cadence, sigh, ambient | nervous-system inference without wearables |
| `useFaceCam` | gaze stability (opt-in) | attention quality |

Design commitment, already made in the games stack: **no HRV, no chest straps, no
watches.** Mic-derived breath rate gives 80% of the nervous-system inference at zero
hardware friction (`docs/games/CONSCIOUS_GAMES_DESIGN.md:18–32`).

### 8. The consciousness engines

- **Consciousness Engine** — V-Levels, 11 bands, dimension bands, continuous
  calibration. Reads the user context snapshot; writes dimension deltas.
- **Adaptive Journey Engine** — block-based multi-week trajectory; what kinds of
  sessions you need over time, when to deepen, when to introduce.
- **Living Theme Engine** — one daily theme, evolved by outcome; deepen/hold/close.
- **Speed Profile Engine** — fast / steady / deep detection; adaptive difficulty.
- **Daily Gates Engine** — morning / midday / evening / night; 6 time-slot patterns.
- **Regression Engine** — the 6-step dark-night protocol, session credits.
- **Loop Detection Engine** — 650 loops, exact-ID mapping, live detection.
- **Predictive Engine** — burnout risk, dimension trajectories.
- **Three-Brain Engine** — head/heart/gut dominance.
- **Council of Yogis** — multi-master synthesis.

### 9. Memory

Four layers: session (today) → short-term (~7 days) → long-term (months/years) →
pattern memory (loops and their histories). Extraction, embedding, consolidation,
recall — all shipping (`memory-extract`, `memory-consolidate`, `recall-memory`,
`embed-memory`). The rule the v4 session blueprint set and the eleven should adopt:
**quote nothing older than 3 days verbatim; paraphrase feelings, never analytics.**

### 10. The games signal pipeline — the moat

Every game writes to `game_sessions` with a `signals` JSONB blob and post-session
`consciousness_signals`:

```ts
{ attention_quality, nervous_system_state: 'calm'|'activated'|'shutdown'|'coherent',
  reactivity_score, witness_capacity, impulse_control, detected_loops: string[] }
```

232 games pour into one schema. The engines read from it. **This is the cleanest
measurement instrument in the product — and The First Eleven has never held it.**

---

## PART IV — THE SURFACE: MODES, PROGRAMS, GAMES

### 11. Modes

- **36 guide modes** (`guideModes.ts`) — open conversation, self-inquiry, shadow
  work, pattern finder, loop explorer, decision, relationship, future self, inner
  child, anger, gratitude, sankalpa, death meditation, dream analysis, sutra study…
- **50+ session doors** in the mode registry (`modeRegistry.ts`), organized by the
  12 practices, each with default duration, energy fit, and compound support.
- **Delivery modes** — cinematic full-screen overlay (`CinematicSessionContext`),
  silent stripped shell (`SilentModeShell`), temple mode (`Temple.tsx` + `worldData.ts`
  four worlds), the orb runtime (`OrbSession.tsx`), adaptive vs structured spectrum.

### 12. Programs and journeys

- **8 journey doors** ranked after the eleven, each wired to a real program:
  Decondition the Mind (Krishnamurti), Stop the Reactor (Patanjali), Read the
  Emotional Weather (Meera), Befriend the Shadow (Jung), Who Am I? (Ramana), Work
  Without Wearing Out (Krishna), Meet the Body (Tantra), plus The Open Journey.
- Programs catalog, foundation course, experience paths, showroom programs.
- Each journey declares band window, target dimension, and loop affinity — the
  same axes the sittings are already measuring.

### 13. Games

The LAB catalog (`labRegistry.ts`) tags every game with **tradition → mechanism →
signal → faculty → tier**. Examples relevant to the sittings:

| Sitting | Games that already exist | Faculty |
|---|---|---|
| 1 Stolen Mind | `bell-in-the-wind`, `the-pause`, `distraction-cost`, `hand-doesnt-move` | attention, willpower |
| 2 Comparison | `comparison-scroll`, `comparison-cut`, `envy-mirror` | ego, heart |
| 3 Desire | `craving-wave`, `greed-ledger`, `food-pause` | willpower, body |
| 4 Fear | `fear-ladder`, `cold-water`, `the-sigh` | body, heart |
| 5 Story of Me | `maya-unmask`, `bhava-portrait`, `ego-autopsy` | ego, witness |
| 6 Others | `listening-tree`, `emotional-resonance`, `mirror-realm` | heart, ego |
| 7 Money | `greed-ledger`, `gratitude-storm` | willpower, heart |
| 8 Work/Worth | `finish-line`, `vairagya-test` | willpower, karma |
| 9 Time/Death | `death-practice`, `maranasati`, `bardo-room` | liminal, witness |
| 10 Conditioned Heart | `grief-wave`, `forgiveness-door`, `child-letter` | heart, liminal |
| 11 Who Is Asking | `who-is-thinking`, `mahavakya-sit`, `empty-room` | self_inquiry, stillness |

The mapping is one-to-one and already shipped. The v2 spine simply walks through it.

---

## PART V — THE ELEVEN SITTINGS, RETHOUGHT

### 14. The v2 global spine

Every sitting keeps its authored bones and gains five layers. The spine becomes:

```
THRESHOLD  →  OPENING  →  TEACHING  →  PRACTICE  →  QUESTION SPINE  →  THE TURN  →  SEAL
  (as now)     (master       (voiced,    (game or     (open → deepen    (mirror     (vow +
               speaks first)  line-by-    breath or    → body →         + one       carry-seed
               quotes your    line reveal) silence,    mirror →         deepen)     + more-
               last seed)                  mic-verified choice)                     thread)
```

**The seven upgrades (global):**

1. **The master speaks first.** The opening line of every sitting is delivered in
   the sitting master's voice (ElevenLabs, pre-warmed), and it quotes one thing the
   user actually said — last sitting's carry-seed, last sitting's final answer, or
   the loudest loop so far. Not "tell me about your day." The name of the feeling,
   gifted back as a question.
2. **A practice layer from the 232.** Each sitting gains a game/breath/silence
   practice matched to its faculty, with mic verification where the game supports
   it. Its signals write to the same `consciousness_signals` schema and feed the
   mapping. Sixty seconds of real measurement inside a six-minute sitting.
3. **The conversational grammar in The Dock.** The Dock already exists; it now
   speaks in the bounded ritual from the v4 session blueprint — OPEN the loop,
   WAIT (≤60s, empty UI, the orb stills), MIRROR the exact fragment, DEEPEN once
   (branched on reply type), CLOSE with a seed. One deepen per step, ever. Silence
   is a first-class answer: "You didn't answer. That's an answer too."
4. **Mid-sitting morph, visible.** Telemetry (answer latency, skips, dock sentiment,
   breath coherence) runs a tier:fast check at two points per sitting:
   `keep | insert_breath | shorten | swap_focus`. Max 2 morphs per sitting; distress
   sentiment forces soft morphs only; adaptation is *announced* — two skips draw the
   line *"The night shortens."*
5. **The vow ledger.** Every sitting's vow is stored and recalled at the next
   sitting's threshold — "Last time you said: I'll take one hour back. Did the hour
   happen?" No guilt either way; the answer itself is a band signal (integrity →
   karma faculty).
6. **Kept lines become the rosary.** Dock kept-lines already sharpen the mapping;
   they now also return at the close of each sitting and at the next threshold,
   alongside the carry-seed. The user's best sentences become the app's memory of them.
7. **The mapping sharpens in public.** After every sitting, one line changes on a
   visible "the map" card — band coordinate, strongest/weakest dimension, loudest
   loop. The mapping stops being a receipt and becomes a living reading.

**Safety rules carried over:** sitting 9 (death) and sitting 10 (numbing) force soft
morphs only, longer silence caps, and the option to stop early with the sitting
credited. Dark-night protocol hooks stay armed.

---

### 15. Sitting 1 — The Stolen Mind

> *Attention is the last private property. Check who holds the deed.* — Krishnamurti

**Keep:** the teaching (it is the best first minute in the product), the open
question pair, the silence, the one-hour vow.

**Change:**
- **Opening (voiced, Krishnamurti):** names the behavior before the theory —
  *"You have unlocked your phone ___ times since you opened this app. I am not
  accusing you. I am the app. We are both in the business."* Uses the real unlock
  estimate from the Light Six conditioning seed.
- **Practice layer:** `bell-in-the-wind` (public, playable — tab-blur and
  cursor-leave signals) followed by `the-pause` (90s impulse survival). Signals:
  tab_blur_events, button press latency → `impulse_control`.
- **Loop watch:** `BHV007` (automatic reach), `AVD001`, `HAB001`, `CTL003`,
  `MEN001` — confirmed or cleared by the games' telemetry, not just the answers.
- **Morph:** if tab-blur events during the practice exceed threshold, the sitting
  shortens by one question and inserts breath — the phone already won this round;
  the sitting says so.
- **Vow:** keep "one hour, phone in another room." The ledger asks about it at
  sitting 2's threshold.
- **More-thread:** *the full attention ladder waits in the Temple — Dharana,
  levels 1–5.*

### 16. Sitting 2 — The Comparison Machine

> *Comparing is renting your worth from people who never agreed to own it.* — Buddha

**Keep:** the courtroom-shaped-like-a-mirror teaching; "mute one account" act.

**Change:**
- **Opening:** quotes the user's own mirror-role sentence from sitting 1 ("the thing
  I reach for when I don't want to be alone with myself is ___") and turns it one
  degree: *"You wrote '___'. Notice the comparison and the reaching are the same
  motion."*
- **Practice layer:** `comparison-scroll` — a controlled feed that measures the
  drop (typing cadence, dwell, scroll velocity) and mirrors it back:
  *"When you passed the fourth post, you slowed 40%."* Then `comparison-cut` as the
  act's in-app rehearsal.
- **Loop watch:** `VAL025`, `SOC005`, `VAL004`, `IDN014`, `VAL001`, `SOC001`.
- **Vow ledger check:** sitting 1's hour. Either answer is fine; both are recorded.
- **Morph:** heavy sentiment → drop the deepen question, extend silence to 75s.
- **More-thread:** *Befriend the Shadow — Jung, 9 sessions — waits at the door
  marked EGO009.*

### 17. Sitting 3 — Desire and the More

> *Wanting is not the enemy. Not noticing you're wanting is.* — Buddha

**Keep:** the salt-water teaching; the 4·4·6 breath.

**Change:**
- **Opening:** *"Yesterday you muted one account. Today we look at what the muting
  was protecting you from wanting."* (Vow ledger, used as fuel — not as audit.)
- **Practice layer:** `craving-wave` — surf the urge in-app with a real timer and
  a mic-verified breath; the wave's peak and decay become the teaching's proof.
  Optional `greed-ledger` for the variant where the user names the unpaid want.
- **Loop watch:** `AVD001`, `HAB001`, `BOD009` (restless boredom).
- **Breath upgrade:** the 4·4·6 pattern becomes a real pacer — rAF-driven orb,
  optional haptics, optional voice — with mic verification (`useBreathMic`) so the
  exhale is measured, not assumed.
- **More-thread:** *Meet the Body — sensation as the doorway — Tantra, 12 sessions.*

### 18. Sitting 4 — The Fear Engine

> *Fear was built to save your life. It was never built to run it.* — Patanjali

**Keep:** the tiger-detector teaching; the 4·7·8 conditional breath.

**Change:**
- **Opening:** uses the sitting-3 practice signals — if the craving wave's decay
  was fast, name it: *"The wave passed in ninety seconds yesterday. Fear is the same
  weather with a louder forecast."*
- **Practice layer:** `fear-ladder` (graded exposure with latency measurement) or,
  for acute states, `cold-water` (trigeminal-vagal reset, camera + mic verified)
  followed by `the-sigh`. The sitting reads which one fits from the current state.
- **Loop watch:** `SRV001`, `SRV002`, `EMO001`, `BOD005`.
- **Morph:** distressed sentiment → `cold-water` replaces the ladder, the silence
  drops to 45s, and the sitting says *"Tonight we only regulate. The looking can
  wait."* Never escalate confrontation.
- **More-thread:** *Stop the Reactor — Patanjali, 7 sessions — cuts the wire
  between trigger and reflex.*

### 19. Sitting 5 — The Story of Me

> *You are not the story. You are the one the story is being told to.* — Ramana Maharshi

**Keep:** the biography teaching; the unworn-label act.

**Change:**
- **Opening:** quotes the user's own deepest sentence so far — usually the sitting-1
  mirror line or a kept Dock line — and asks whose handwriting it is in.
- **Practice layer:** `maya-unmask` — labels appear one by one; the user keeps or
  releases each. The released set becomes the sitting's artifact, and the kept set
  is the honest counter-evidence. `bhava-portrait` optional for the reflective variant.
- **Loop watch:** `IDN005`, `IDN001`, `EGO009`, `VAL029`.
- **The Turn (new beat):** one Ramana question, held live, before the mirror
  question — *"If that label were false for sixty seconds, what is still here?"* —
  with the conversational grammar allowed exactly one deepen.
- **More-thread:** *Who Am I? — Ramana, 10 sessions — the question of sitting 11,
  walked properly.*

### 20. Sitting 6 — The Mirror of Others

> *Every relationship is a mirror — most of us only see our own face in it.* — Rumi

**Keep:** the unspoken-request teaching; the one-honest-sentence act.

**Change:**
- **Opening:** Rumi, voiced, opens the loop rather than the topic: *"Someone is
  living in your head rent-free, and they have not signed the lease. You do not
  have to name them to me. Name them to yourself."*
- **Practice layer:** `listening-tree` — listen without interrupting, mic activity
  measured, the interruption impulse itself becoming the data. Variant:
  `emotional-resonance` for the user whose band says heart-first.
- **Loop watch:** `REL014`, `EMO010`, `VAL035` (overgiving), `VAL014` (loyalty testing).
- **Morph:** if the body-scale answer is flat/numb (body dimension ≤ 3), swap the
  mirror question for a somatic one — the mirror needs a body to stand in.
- **Vow:** one honest sentence, one notch above default. Ledger asks at sitting 7.
- **More-thread:** *Read the Emotional Weather — Meera, 9 sessions.*

### 21. Sitting 7 — Money and Enough

> *Scarcity is a state of the nervous system, not a number in an account.* — Krishna

**Keep:** the same-money-different-worlds teaching; the honest-hour act.

**Change:**
- **Opening:** band-aware. If the mapping's band is 0–2, the sitting opens with
  safety, not philosophy: *"This sitting is not for people who have enough. It is
  for the body that cannot believe it ever will."* If band ≥ 5, it opens with the
  scoreboard instead. **The teaching text splits by band** — the first fully
  band-branched sitting.
- **Practice layer:** `greed-ledger` — name the want, price it, watch the
  nervous system's response (latency + optional mic). Not budgeting; exposure.
- **Loop watch:** `PRD001`, `PRD015`, `VAL008`, `BLF005`, `ENR001` (scarcity family).
- **Morph:** if the "did the number hold still?" silence is exited early twice, the
  sitting drops the choice question and seals with breath — the mind moved; that
  was the lesson.
- **More-thread:** *Work Without Wearing Out — Krishna, 11 sessions.*

### 22. Sitting 8 — Work and Worth

> *If your output stopped, who would you be? Sit with that question.* — Vivekananda

**Keep:** the invisible-ledger teaching; the unearned-rest act.

**Change:**
- **Opening:** uses the vow ledger (rest was likely the hardest vow so far) and the
  `finish-line`-style signal if the user has touched the games: *"You have
  finished ___ things in games this week and abandoned ___. Neither number is your
  worth. Watch what the mind does with both."*
- **Practice layer:** `finish-line` — start something, refuse to finish it, sit in
  the discomfort; latency to abandonment is the measurement. Then `vairagya-test`
  for the advanced variant (declared vs. done integrity).
- **Loop watch:** `PRD001`, `VAL008`, `MOT011`, `BHV007`.
- **Morph:** if answers turn fast and frictionless (possible performance mode),
  the sitting inserts a silence and says: *"That was quick. Quick is sometimes the
  honest answer and sometimes the practiced one. Sit once more before you decide
  which."*
- **More-thread:** *the Karma Yoga wing of the Temple — work as practice, not identity.*

### 23. Sitting 9 — Time and Death

> *You will die. That is not morbid — it is the only fact that makes urgency honest.* — Buddha

**Keep:** everything. This is the heaviest sitting and the spine is right.

**Change:**
- **Opening:** a bell, then silence, then one sentence — *"This is the heaviest
  sitting of the eleven. Go slowly. You may stop at any point and the sitting
  counts as complete."* The early-exit credit is stated up front, not hidden.
- **Practice layer:** optional and gentle — `maranasati` (structured mortality
  contemplation) or `death-practice`, both capped, both exitable; default remains
  the authored 90-second silence with the orb stilling.
- **Loop watch:** `SRV001` family, `EMO001`, `AVD001` (urgency as avoidance).
- **Hard safety rules:** soft morphs only; no deepen if sentiment is heavy; the
  dark-night protocol arms (a regression flag writes to the profile and the next
  sitting opens softer); breath regulation offered before the close.
- **More-thread:** *Bardo Room — the liminal faculty — for when the mind wants to
  keep going.*

### 24. Sitting 10 — The Conditioned Heart

> *Numbness is not peace. It is a feeling that learned it was unsafe.* — Meera

**Keep:** the feeling-that-went-underground teaching; the name-one-feeling act.

**Change:**
- **Opening (Meera, voiced):** devotional register, no psychology — *"I have gone
  mad with longing and nobody understands. Tonight we find out what you decided,
  long ago, was unsafe to feel. We do not fix it. We keep it company."*
- **Practice layer:** `grief-wave` (if the sitting-9 flag is set, the grief is
  already close) or `forgiveness-door`; `child-letter` as the optional deep variant
  for users whose mapping shows early-origin loops (`VAL001`, `SOC001`).
- **Loop watch:** `EMO001`, `EMO005`, `EMO010`, `EGO009`, `IDN005`.
- **Morph:** numbed-flat answers (scale pinned to the minimum, latency near zero)
  do **not** get a deepen. They get the body question and a longer silence. Flat
  is armor; the sitting does not knock on armor.
- **Vow:** name one feeling precisely. Ledger asks at sitting 11.
- **More-thread:** *Read the Emotional Weather — Meera — and the Forgiveness
  family in the LAB.*

### 25. Sitting 11 — Who Is Asking?

> *All ten sittings asked about you. This one asks who 'you' is.* — Ramana Maharshi

**Keep:** the turn; the three-round silence; the once-a-day return.

**Change:**
- **Opening:** the only opening that quotes nothing external — a bell, and
  *"Ten sittings, and every question was about content. Tonight the beam turns.
  Who has been asking?"*
- **Practice layer:** `who-is-thinking` (dwell-time measured, three questions, no
  right answer) and then `empty-room` — a black screen until the user says
  "enough" — or, for the traditionalist, `mahavakya-sit`. The games' witness
  capacity and stillness signals become part of the final mapping.
- **The mapping sharpens in public, one last time:** before The Mirror, one screen
  shows what the eleven produced — band coordinate, dimension spread, top loops,
  and the single line that changed most across the run.
- **Carry-seed:** keep *"The questions were never answered. The questioner was
  finally looked at."*
- **More-thread:** *Who Am I? — Ramana, 10 sessions. The door is open; the walking
  is yours.*

### 26. The doors after the eleven (upgrade, not redesign)

1. **The Mirror (Gate 4)** — now renders the *sharpened* mapping: before/after
   dimension spread across the run, loops confirmed vs. cleared, and the vow ledger
   summary (kept / half-kept / not kept — no shame framing; it is karma data).
2. **Spiral Explainer (Gate 5)** — unchanged in content; it now lands harder
   because the band has been *demonstrated*, not asserted.
3. **Journey Picker (Gate 6)** — unchanged scoring, but one line added per door:
   *"This door was chosen for your weakest dimension — body — and the loop running
   loudest in you."* The explainable ranking already exists; surface the reason
   the user cares about.
4. **The Day-7 Return (new):** seven days after sitting 11, the app offers one
   three-minute sitting — the carry-seed, one kept line, the vow tally, and one
   new question. It is the eleventh turned around: the first time the app asks
   the user what *it* got right.

---

## PART VI — MORE THINGS

### 27. Ideas worth building

1. **The two-minute sitting.** Every sitting gets a compressed variant (breath +
   one question + vow) for the day the user has two minutes. The eleven become a
   daily practice, not a one-time gate — the closed spine makes this trivial to
   author.
2. **Voice-first mode.** Teachings delivered in the master's voice with subtitle;
   answers by speech (Deepgram STT is wired). Sittings 9 and 10 become listenable
   with eyes closed.
3. **Band-branched teachings beyond sitting 7.** The same authored teaching, three
   registers (survival / becoming / witness). One file edit per sitting; the
   composer already thinks in levels.
4. **Loop christening.** When a loop is confirmed across three sittings, the app
   gives it a name from the 650-library and the user meets it as a character with
   a history — never as a diagnosis. Loop-threading as depth, not repetition:
   fire 1 name it, fire 3 what it protects, fire 6 what it costs others, fire 9
   "who would you be without it?"
5. **Kept-lines talisman.** The close of sitting 11 mints a card of the user's best
   kept lines — shareable, printable, the app's only souvenir.
6. **Master-of-the-sitting choice.** After sitting 3, the user may swap any
   sitting's master for another from the roster with the same faculty. The voice
   changes; the spine does not.
7. **The Eleven, walked together (enterprise).** A cohort version where colleagues
   walk the sittings on the same week with private mirrors and a facilitator
   dashboard — the n≥5 aggregator pattern already exists.
8. **Language parity.** The 110-question bank and 11 teachings translate through
   the 40+ locale system; the carry-seeds are short enough to be hand-checked in
   every language. This is the cheapest global unlock in the product.
9. **Signal honesty panel.** One screen, visible to the user: what the app
   measured during the eleven (latency, skips, breath, kept lines) and what it
   inferred. Memory the user can audit is memory that earns trust.
10. **The 12th sitting that does not exist.** Do not author a twelfth. Instead,
    the Day-7 Return (above) and the journey doors are the twelfth. Restraint is
    the brand.

### 28. Build order (by leverage per week)

1. **Week of wiring, almost no backend:** the master speaks first (TTS on the
   opening line, quoting the last carry-seed); the vow ledger at every threshold;
   "the map sharpens" card after each sitting; the two-minute variants. All four
   touch existing components only.
2. **The practice layer:** wire sittings 1, 3, 4, 9 to the games that already
   exist (`bell-in-the-wind`, `craving-wave`, `fear-ladder`, `maranasati`), with
   signals writing to the mapping. One integration, eleven sittings deepen.
3. **The Dock ritual:** OPEN/WAIT/MIRROR/DEEPEN/CLOSE grammar, one deepen per
   step, silence as an answer. Kept lines to the rosary.
4. **Morphs + safety:** telemetry capture, two check points, visible copy, soft-only
   rules for sittings 9–10, dark-night flag.
5. **Band-branched teachings** (sitting 7 first), voice-first mode, language parity.
6. **The Day-7 Return and the talisman card** — the close of the loop.

---

*The eleven sittings are already the best-written thing in the product. The v2
rethink does not rewrite them — it finally introduces them to the app they live in:
the voices, the games, the engines, and the reading that was always their purpose.*
