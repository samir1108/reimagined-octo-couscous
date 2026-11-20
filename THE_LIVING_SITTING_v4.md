# THE LIVING SITTING — Session System v4 Blueprint

> Successor to `SESSION_FLOW.md` (v1 chat scripts) and `compose-session-v3` (v3 Sankalpa spine).
> Synthesized from three independent design consultations (backend architecture, scene UX,
> content depth system) plus a full audit of the five existing parallel session systems.

---

## 0. The Problem, Stated Precisely

The v3 backend already treats the user as a story: 16 live signals, a 3-voice council,
14 archetypes, memory embeddings, future-self whispers, living themes, quality feedback.
Then it throws 90% of that away at the output schema. A step is:

```
{ kind, title, prompt (one string, ≤1200 chars), est_minutes, whyForYou, signalRef }
```

composed once, before the session starts, never touched by AI again during the session.
The frontend renders ~3 fields of it. The teacher is absent from 7 of 9 step kinds.
`goToNext(payload)` records everything; nothing ever reads it back. The completion screen
is a metrics receipt where a blessing should be.

**The fix is not more content. It is an architecture where depth is structural:**

- the plan becomes a **contract** (structural slots, no prose),
- prose is generated **just-in-time** in layers, with the conversation as fuel,
- the teacher is **present in every step**,
- the user's own words **refill the well** every turn.

**The bar:** every step feels like a room you enter where the teacher is already there,
knows what you said in the last room, has ten things prepared but shows you one — and
the room has doors you can feel but cannot see.

---

## 1. Three-Layer Architecture

```
THE LENS      (content system)   what there is to say
                                  12-layer step schema, seed libraries, master voice
                                  cards, generative naming grammar

THE DIRECTOR  (backend engine)   when and how to say it
                                  plan-as-slots, just-in-time streaming elaboration,
                                  per-turn retrieval re-seeding, mid-session morphs

THE SCENES    (frontend)         how it is met
                                  three-layer scene UI, teacher dock, pullable threads,
                                  kept lines, ritual exits, Threshold→Descent→Residue
```

The Director fills the Lens's slots into the Scene's layers.

---

## 2. The Step Contract (replaces `prompt: string`)

```ts
interface StepScript {
  stepId: string;
  kind: StepKind;                // the existing 9-way union, unchanged
  persona: string;               // lead master of the session, e.g. "Rumi"
  signalRef: string;             // NEVER optional. Specificity is the soul of the system.

  // ── OPEN: why this, why now (felt in first 5 seconds) ─────────
  essence: string;               // ≤14 words. The step's koan.
  callback?: string;             // quotes last session's final_user_sentence / seed_carried
  invocationFragment?: string;   // piece of the session name

  // ── MEET: the teaching (revealed progressively) ──────────────
  parable?: string;              // 3–6 sentences, one image, spoken through the master's voice card
  masterStory?: string;          // 2 sentences of legend/biography — "the teacher is real"
  instruction: string;           // imperative, countable, ≤30 words. NEVER poetic.

  // ── TURN: toward you (hidden until earned) ───────────────────
  piercingQuestion?: string;    // generated from loop × starved dimension — never generic
  deepeningPrompts: { atTurn: number; gate: "resistance"|"curiosity"|"openness"; prompt: string }[];
  obliqueHint?: string;          // koan fragment the mind chews later
  artifact?: {                  // the timed surprise
    type: "micro-parable" | "mirror-phrase" | "koan" | "body-cue" | "imagery";
    body: string;
    when: string;                // e.g. "turn>=2 && sentiment=='heavy'"
  };

  // ── CLOSE: what you keep ─────────────────────────────────────
  silenceBeatSec: number;
  carrySeed: string;             // ONE line. Stored on the spine, quoted next session.
  moreThread?: string;           // the teased door ("the full reed teaching waits in the Temple")
  offAppExperiment?: string;     // ≤90-second real-world act (extends offAppRituals.ts)

  // ── guardrails for the in-step conversation ──────────────────
  improvDirectives: {
    taboos: string[];           // e.g. ["advice lists", "moralizing", "verdicts"]
    callbackAmmo: string[];     // 6–10 packed signals the teacher MAY reference
  };
  ttlMinutes: number;           // scripts expire; a step is for tonight, not forever
}
```

**Per-kind required layers** (layers are slots; each kind demands a different subset):

| Kind | Required | Character |
|---|---|---|
| breathwork | essence, instruction, one mid-breath whisper at 40%, silenceBeat, carrySeed | cadence, almost wordless |
| witness | essence, obliqueHint, "if the mind does X, that IS the practice" line, silenceBeat, carrySeed | oblique, spacious |
| journal | essence, parable, piercingQuestion, conversational surface, carrySeed, moreThread | the conversation step |
| reflection | callback, piercingQuestion, harvest mirror, carrySeed | callback-heavy |
| wisdom-read | parable, masterStory, lineage quote + plain translation, turn-to-you, moreThread | the richness showcase |
| micro-act | essence, instruction, why-this-act, offAppExperiment, smallness guarantee | concrete, tiny |

---

## 3. The Director — Backend Engine

### 3.1 Core inversion

v3 composes prose once at plan time. v4 splits **composition** (cheap, structural, once)
from **elaboration** (small, fast, continuous). The spine shrinks to step slots — typed
contracts without prose:

```ts
interface StepSlot {
  kind: StepKind;
  focus: string;       // loop id | dimension | chakra | micro-prompt from practice matrix
  level: number;       // user's CURRENT level for that family (never invent ahead)
  est_minutes: number;
  signalRef: string;
  arc: string;         // one phrase: this step's job in the session arc
}
```

All v3 machinery survives: parallel read layer (user context, long-term memory, prev
spine, unconsumed whisper, living theme, last-30 quality history), the 3-voice council,
the synthesizer with the 14-archetype activation rules. The composer call now returns
slots only (~200 output tokens — drops to `tier:fast`).

### 3.2 New edge functions

**`session-director`** (replaces compose-session-v3 as entrypoint)
- Keeps read layer → council (3× tier:fast) → synthesizer → archetype lock.
- Composer emits slots. Writes `session_invocations` + N `session_step_instances
  (status='pending')`. Fire-and-forget prefetch of step 1's script.
- Returns ~1.5–2.5s: `{ invocationId, intent, intro, slots[], step1? }`.
- Accepts `flavor` — slot-shape presets that absorb legacy systems (see §8).

**`step-live`** — the depth engine. One edge, four actions, SSE streaming:
- `action:"enter"` → JIT-generates the step's `StepScript` with conversational context:
  slot + `director_state` + last ~6 runtime events (turns from PREVIOUS steps included —
  continuity across rooms) + `match_user_memories` seeded by `slot.focus` + last user
  turn. Streams `{type:'script'}`. If prefetched (status='ready'): ~50ms.
- `action:"turn"` → the in-step conversation loop: tier:fast improv reply (≤80 words,
  persona = lead voice's lineage master), may unlock a deepening prompt or drop the
  artifact. Embeds the turn fire-and-forget. **Server-side prefetch of step N+1 begins
  here, seeded by this turn** — the next room already knows what you just said.
- `action:"exit"` → marks step done/skipped, appends telemetry events, runs the morph
  check, streams `{type:'morph'}` if remaining slots changed.
- `action:"prefetch"` → client-side warm call on step start (redundant safety net).

**`session-invocation-complete`** — folds session-complete + score-session-spine into
one close-out: heuristic quality 40% + LLM resonance 60%, karma, v-level delta, shift
summary, next whisper. Same payload shape both consumers expect today.

### 3.3 Morph check (visible adaptation)

Client emits telemetry (typedMs, backspace rate as sentiment proxy, tap/skip patterns,
idle gaps, time vs estimate). On every `exit`, a tier:fast call outputs:
`keep | reorder | swap_focus | retune_level | insert_breath | end_early` — applied only
to remaining slots. Constraints:
- max 2 morphs per session (anti-whiplash; logged in `director_state.morph_log`),
- distress sentiment forces soft morphs only (Dark Night safety: never escalate
  confrontation),
- `insert_breath` REPLACES a step, never extends — the time budget is sacred.

Adaptation must be visible or it doesn't exist: two skips → interstitial copy
*"The night shortens."*

### 3.4 Sequence

```
enter session:
Client → session-director {intent, budget, energy}
  parallel reads → council(3×fast) → synth(fast) → slots(fast)
  → INSERT invocation + steps(pending) → prefetch step1 (async)
← {invocationId, intro, slots, step1?}

run step N (SSE):
Client → step-live {action:enter, N}
  ← {script}                        (prefetched ~50ms; cold 800–1500ms)
Client → step-live {action:turn, text}   (repeat ≤6/step)
  ← streamed improv + deepening/artifact; async: embed turn, prefetch N+1
Client → step-live {action:exit, telemetry}
  ← {morph?}

close:
Client → session-invocation-complete {finalSentence, completions, duration}
  ← {qualityScore, shiftSummary, vDelta, nextTeaser, karma}
```

---

## 4. Data Model

```sql
create table session_invocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  status text default 'active',            -- active|completed|abandoned
  archetype text, lead_voice text,
  intent text, intro text,
  invocation_name text,                    -- the generated session name (§6)
  ai_mode text check (ai_mode in ('fast','premium')),
  composed_signals jsonb, graph_edges jsonb,
  director_state jsonb not null default '{}',  -- slots, morph_log, spentSignals, budget_used
  quality_score numeric, final_user_sentence text, seed_carried text,
  created_at timestamptz default now(), ended_at timestamptz
);

create table session_step_instances (
  id uuid primary key default gen_random_uuid(),
  invocation_id uuid references session_invocations,
  user_id uuid,
  step_index int, kind text, focus text, level int,
  status text check (status in ('pending','ready','live','done','skipped','morphed')),
  slot jsonb not null,                     -- director contract (no prose)
  script jsonb, script_model text, gen_ms int,
  turn_count int default 0, est_minutes int, time_spent_sec int,
  created_at timestamptz default now(), generated_at timestamptz
);

create table session_step_events (
  id bigint generated always as identity primary key,
  invocation_id uuid, step_id uuid, user_id uuid,
  type text,          -- enter|turn|deepen|artifact|skip|telemetry|morph|exit|kept_line
  payload jsonb,      -- turn: {role,text,typedMs}; telemetry: {taps,idleMs,...}
  embedding vector(768),   -- embed user turns: in-step retrieval + novelty
  created_at timestamptz default now()
);
create index on session_step_events (invocation_id, created_at);

create table session_content_assets (
  id uuid primary key default gen_random_uuid(),
  asset_type text,        -- teaching_seed|voice_card|archetype_card|loop_drama|probe|seed|name_pool
  family text, level int, tags text[],
  body jsonb,             -- template with {{focus}},{{loop}},{{chakra}} slots
  embedding vector(768), use_count int, last_used_at timestamptz
);
```

`session_step_events` is the single source of runtime truth. `sessions` (existing) stays
as the shell's outer id during migration: `session_invocations.session_id` references it
for backward compat.

---

## 5. The Lens — Infinite Feel From ~2,400 Authored Seeds

**The composition law: never author for the product of slots; author per slot, and
compose.** 40 parables × 35 master voices = 1,400 distinct tellings; 1,400 authored
parables would feel like content. Voice transformation (not concatenation) is the
multiplier.

### 5.1 Seed libraries

| Library | Unit | Size |
|---|---|---|
| Teaching seeds (essence + parable pair) | per practice family (11) × level-tier (5) | ~400 |
| Master voice cards (diction rules, signature images, 8 micro-stories, 10 quotes, forbidden words) | per master | 35 × ~19 units |
| Archetype tone cards (opening move, signature tension, resolution gesture) | per archetype | 14 × 3 |
| Loop dramatizations (mask line / cost line / protected line / reversal question) | top 80 loops hand-authored; LLM-generated for the tail | 320 |
| Piercing questions | 16 loop-families × 9 dimension-categories × 5 | ~720 |
| Carry-seed aphorisms | tagged family × band × tone | ~200 |
| Naming grammar pools | §6 | ~180 entries |

**The math:** teaching seed (400) × master voice (35) × archetype card (14) ≈ **196,000
distinct parable-tellings** — before the TURN layers multiply by the user's 5 active
loops, 11 dimension bands, 7 chakras, 4 gates. A user meeting 4 steps/day for a year
consumes ~1,460 step-instantiations out of >10⁶ combinations. Effectively never the same
twice. Freshness is enforced by v3's existing novelty machinery (cosine > 0.85 → one-shot
repair), extended to artifacts and deepening prompts via `user_memory_vectors`
(source_type='session_script').

**Non-negotiable: every composed step keeps its `signalRef`.** Depth without specificity
is decoration. The `whyForYou` sentence is what makes a parable land as *mine*.

**Fallback ladder:** LLM fail → pure template fill (deterministic code + embedding
distance, 50ms, zero AI cost). The session never shows a dead room.

### 5.2 The teacher's living voice — conversational grammar

Not a chatbot: a bounded ritual, reusing the `voice_reply` modality. Five beats,
hard-capped per step:

1. **OPEN THE LOOP** — the teacher suspects, then hands it over. Never "tell me about
   your day." Name the loop's *feeling*, gift it as a question:
   *"Something got set down today before it was finished. I don't need to know what.
   What did the not-looking feel like — where did it live in the body?"*
2. **WAIT.** ≤60s. Empty UI. No typing box until the teacher returns. Listening IS the
   feature. The orb dims and stills.
3. **MIRROR** — quote their exact fragment back, turn it one degree:
   *"You said 'it was easier to just not bring it up.' Easier. For whom?"*
4. **DEEPEN — exactly one**, branched on reply type:
   - abstract → *"Where does that sit right now?"*
   - concrete → *"And if you had stayed ten more seconds with it?"*
   - deflection/humor → name it once, gently: *"That's the second joke since you sat
     down. I'm not asking the jokes to leave. I'm asking what they're carrying."*
5. **CLOSE WITH A SEED** — never a verdict, never advice:
   *"Enough. Say nothing more about it. Let the throat keep tonight's unsaid sentence —
   let it keep it kindly."* Then `carrySeed`.

Hard rules: one deepen per step, ever; reference only what the user said this session or
what sits in their own spine (`final_user_sentence` is the user's words — fair game);
silence is honored: *"You didn't answer. That's an answer too. We'll let it stand."*

---

## 6. Generative Naming (never-repeat invocations)

Current `sessionInvocation.ts`: 4 gate-nouns × 2–5 subtitle pools → a name repeats
within a week. New grammar, still deterministic:

```
The [Ordinal] [GateNoun]: [ImageA] [VerbLink] [ObjectB]
```

- **GateNoun** (4, keep): Rising / Pause / Descent / Sanctuary
- **ImageA** (60): feeling-images — "The Unsent Letter," "The Reed in the Reed-Flute,"
  "The Smaller Fear," "The Room You Clean Instead"
- **VerbLink** (20): Meets / Outgrows / Stops Running From / Learns to Hold / Refuses to Name
- **ObjectB** (60, archetype-flavored subpools of 20 per archetype)

4 × 60 × 20 × 60 = **288,000 names per gate-noun; >1.1M total**. Persist every served
invocation on the spine and never re-serve a combo to that user — repetition becomes
once-per-lifetime. Filter rule: one image per name; must survive being said aloud.

Samples: *"The Forty-First Descent: The Unsent Letter Learns to Hold."*
*"The Sixth Sanctuary: The Smaller Fear Meets a Bigger Kindness."*

---

## 7. The Scenes — Frontend Runtime

**One rule: visible layer 1, hintable layer 2, conversational layer 3.** Rename
steps → Scenes.

### 7.1 The interaction grammar (learn once, works everywhere)

- **The Dock** — a small breathing orb, bottom-right, in every scene: "Ask." Opens a
  sheet wired to the guide-chat edge, seeded with the current step + everything typed
  this session. This is `GuideChatStep`'s logic generalized into a `useTeacher()` hook —
  chat stops being a step kind and becomes a property of all scenes. Cheapest change,
  biggest felt shift.
- **Pull a thread** — long-press any text (a sutra line, your own journal sentence, the
  teacher's reply) → marginalia drawer: master Commentary, a Contrary council voice
  ("Krishnamurti would push back here…"), or an Echo of the user's own past journal line
  that rhymes. 2–4 threads per scene, NEVER all visible — restraint implies depth.
- **Kept lines** — double-tap a sentence to keep it. Kept lines return at the session's
  close and in the next session's opening. The user's best sentences become the app's
  memory of them.
- **Speak-into** — quiet scenes (witness, breathwork) carry a single-line input. Typing
  pauses nothing; it lands in the step payload and the teacher may echo it next scene.

### 7.2 Scene conversions (from the existing components)

| Today | Becomes |
|---|---|
| `WisdomReadStep` (text block + Next) | **The Sutra Table** — quote reveals line-by-line at breathing cadence; long-press any line → 3-thread drawer; two exits: "Something caught" (thread picker → kept line) and "I sat with it" |
| `WitnessStep` (countdown + tap counter) | **The Watching Field** — dark field of drifting motes; each Noticed tap condenses a mote; long-press names it in 3 words; whispers keyed to tap-rate at ⅓ and ⅔; optional "Sit one more minute" |
| `BreathworkStep` (`Math.floor(elapsed/4)%2` pacer) | **A real pacer** — pattern from `params` (e.g. 4-4-6), rAF-driven orb scale, optional haptics (`navigator.vibrate`) + TTS ("in… hold… let it go"); one-line check-in after the final breath feeds the next scene |
| `JournalStep` (textarea + word count) | **The Ledger** — after ~30 words one sentence is softly underlined and quoted back with one question ("You wrote 'I keep performing calm.' When did you first learn that?"); save becomes "Seal this page" with wax-seal animation |
| `ReflectionStep` | **The Turning** — question blooms, holds 10s of stillness first; three modes: speak, one line, or "I'll hold it silently" (silence is a first-class answer) |
| `MicroActStep` (icon + "I did it") | **The Vow** — user phrases the act in their own words; teacher returns a one-line blessing; the vow is recalled at closing |
| `PracticeStep` | **Voiced guidance** — prompt segmented into 3–5 spoken phases (Web Speech Synthesis) with subtitle display; mid-practice notes become next-scene whispers |
| `GuideChatStep` / `TempleChatStep` | **Dissolve into the Dock**; Temple becomes the **Council Chamber** — `CouncilHeader` portraits (already built, unmounted) + multi-master replies in genuinely different voices |

### 7.3 The session arc: Threshold → Descent → Residue

- **Threshold** (replaces `AgendaCard`): three beats. (1) *The letter* — the future-self
  whisper as a sealed envelope opening. (2) *The shape* — "Tonight's shape: **Shadow
  Mirror** — 'the one who watches the watcher'" (archetype from `_meta`, rendered).
  (3) *The council* — portraits + verdicts. Steps render as a path of stars with no
  titles: titles are spoilers; reveal each scene fresh.
- **Descent** (mid-session): the **Living Thread** — next scene's opening quotes what
  the user gave the last ("You wrote 'tired of performing' — carry it into the breath").
  Minimum version is client-side stitching; full version is the step-live turn loop.
- **Residue** (replaces most of `SessionCompleteScreen`): the user speaks one sentence
  to tomorrow (already feeding `final_user_sentence` → the whisper loop). Kept lines
  render as a talisman card. A bell. Ten seconds of dark. Karma, quality %, v-level,
  step audit collapse behind one "Read the record" link. `SessionWeavingScreen.tsx`
  (exists, never mounted) becomes the transition while completion runs.

### 7.4 What to remove (the cheap-feel list)

- Phase dots (`UniversalSessionShell.tsx:159–175`) → constellation of stars.
- The X/End + `window.confirm` (line 110) → hold-to-bow-out: "Close the sitting. What
  you gave is kept."
- Per-frame Skip buttons → scene-specific exits; skipping acknowledged with one line of
  copy, not a ghost button.
- `StepKindIntro` explainer cards → fold into each scene's opening line.
- Canned MOTIVATIONS, quality chip, contribution bar, step-by-step analysis on the
  completion screen → "The Record."
- Duplicate audio engines (`AmbientLayer` + `useStepAmbient` each spawn an AudioContext
  and fight for the mix) → one shared AudioContext via context.
- `GenericPlaceholderStep` silent auto-advance → validate kinds at compose time; unknown
  kinds never reach the client.
- Toasts mid-practice → inline candle-flicker notices.

---

## 8. Memory Rituals & Anti-Surveillance

- **The carry-seed rosary:** one line out per session (`seed_carried` on the spine),
  quoted in the next session's L2 callback. A rosary, not a database.
- **Opening callbacks draw only from:** last session's seed, the user's own
  `final_user_sentence`, or the living theme ("the third time this theme has come to
  meet you" — reads as destiny, not tracking).
- **Future-self whispers** (table exists): each evening session MAY write one whisper
  addressed to tomorrow's user; delivered at next morning gate, consumed once, max one
  pending. The user's own voice crossing time — the least surveillant memory possible.
- **Anti-surveillance rules:** quote nothing older than 3 days verbatim; paraphrase
  feelings, never analytics ("you sat with the unsaid thing," never "you completed 3
  sessions"); the spine is visible and editable in the Journal — memory the user can
  audit is memory that earns trust.
- **Loop-threading = depth, not repetition:** fire 1 — name the loop; fire 3 — ask what
  it protects; fire 6 — ask what it costs others; fire 9 — "who would you be without
  it?" The loop becomes a character in a long story; its fifth appearance is the most
  interesting, not the most repeated.

---

## 9. Convergence — One Spine at Last

The five parallel systems (`sessionEngine.ts`, `sessionOrchestrator.ts`,
`sessionFlow.ts`, `consciousness/sessionGenerator.ts`, session-shell+v3) and the ~12
legacy session edges converge to one director with many **flavors**:

- **Phase 1:** `session-director` + `step-live` behind flag `livingSessions`
  (pattern: the existing `sankalpaV3` flag). Extend `session-adapter` to map any legacy
  plan → slots, so the existing shell renders v4 output unchanged.
- **Phase 2:** legacy edges (discovery-session, guru-practice-session, mirror-session,
  generate-practice-session, generate-path-level-session, generate-showroom-day-session,
  generate-program-session, next-session-preview) degrade to thin proxies invoking the
  director with a `flavor` (slot-shape presets: archetype bias, allowed kinds, focus
  pools). One composer, one prompt lineage, one billing path.
- **Phase 3:** default v4 on; after 2 weeks of zero traffic, delete
  `generate-session-agenda` + proxy bodies. Retire `sessionOrchestrator`,
  `sessionEngine`, `sessionFlow`, `consciousness/sessionGenerator`. Client API renames
  to `startInvocation / stepLive / completeInvocation`; localStorage cursor moves to
  server `director_state`.
- The 76 pre-journey sessions (`src/data/pre-journey/sessions.ts`) stop being a
  parallel track: their best writing is harvested into the teaching-seed library.

---

## 10. Cost / Latency Budget (per session)

| Call | fast (Groq) | premium | Notes |
|---|---|---|---|
| council + synth | tier:fast ×4 | same | ~1.2k tokens |
| spine slots | tier:fast | tier:main | structural JSON |
| step scripts | tier:fast ×3–7 (~700 tok each) | tier:main | prefetched — hidden latency |
| turns | tier:fast, ≤80 words, cap 6/step | tier:main | billed per turn |
| morphs | tier:fast ×≤2 | tier:fast | |
| complete + score | tier:fast ×1 | tier:fast | merged edge |

fast ≈ 9–15 calls ≈ 15–25k tokens/session; premium ≈ 3–5× where prose quality is felt.
Perceived latency: session enter ≤1.5s cold / ~0 warm; turns stream first token ~300ms
(SSE through the edge).

**Nightly precompute (pg_cron → edge):** daily syntheses + theme evolution + loop
rollups (exist); predictive slot pre-composition at 5am for consistency>0.5 users (gate
predicted from wake_time) with step-1 script pre-generated → zero-second morning start;
weekly content-asset expansion per archetype affinity; embedding backfills.

---

## 11. Build Order (by leverage per week)

1. **Week of wiring (almost no backend):** the Dock + `useTeacher()` hook; Journal's
   quote-back moment; Threshold (whisper envelope + archetype shape + council —
   `CouncilHeader` exists, unmounted); `SessionWeavingScreen` (exists, never mounted)
   as the close transition; kill the cheap-feel list (§7.4).
2. **The depth engine:** slots refactor in the composer; `step-live` (enter/turn/exit);
   the three new tables + events pipeline; morph check; SSE.
3. **The Lens at scale:** author the seed libraries (§5.1) — this is the long
   content-writing project; voice cards, loop dramatizations, naming grammar (§6,
   ~150-line edit to `sessionInvocation.ts`); conversational grammar (§5.2).
4. **Residue + rituals + convergence:** new completion rite, carry-seed loop, kept-lines
   persistence, legacy retirement behind flavors (§9).

"A thousand things in one step" = three mechanics, not volume:
**responsiveness** (the app quotes your own words back within seconds),
**restrained layering** (2–4 threads always hidden, so every surface implies more
beneath it), **ritual exits** (leaving a scene means something, so being in one means
something).

---

## 12. Reference Example — One Fully-Realized Step

Context: evening gate · Confrontation archetype · AVD101 Distraction Loop active (4×
this week) · vLevel 2 · starved dimension: emotion · blocked chakra: throat · lead voice:
heart · master: Rumi · yesterday's spine `final_user_sentence` = *"I just didn't have
the energy to deal with it."*

> **Invocation:** *The Twenty-Third Descent: The Unsent Letter Meets the Throat*
>
> **Essence:** The throat kept a ledger today. Tonight we read one line of it.
>
> **Callback:** Last night you left the cushion with nine words: *"I just didn't have
> the energy to deal with it."* I haven't pressed. But "it" is still sitting where you
> left it — and it waited politely all day.
>
> **Parable:** A reed is cut from the riverbank and hollowed with knife-holes, and
> everyone calls it a flute. But listen: what makes the music is not the reed. It is the
> *breath passing through what has been emptied out*. You have spent today filling —
> feeds, tabs, small tasks, the good kind of busy. Nothing wrong with any of it. But a
> stuffed reed cannot sound. Somewhere around mid-afternoon, something asked to be felt,
> and you gave it a scroll instead. The reed remembers.
>
> **Master's story:** Rumi walked once through the market, a scholar's books under his
> arm — commentaries, arguments, ten years of knowledge. Shams of Tabriz passed, asked
> one question, and the books went into the fountain. Rumi later called that the day he
> was cut from the riverbank. Emptiness was not his loss. It was his beginning.
>
> **Instruction:** Sit. Let the jaw hang slack. Exhale through the mouth, slow, six
> counts — as if the breath is leaving through the throat and taking nothing with it.
> Six rounds. On the seventh, don't exhale. Just notice what pushes to be said.
>
> **Piercing question:** Not "what did you avoid." Deeper: *What would have happened if
> the distraction hadn't worked?* What were the two seconds after the
> reaching-for-the-phone supposed to hold?
>
> **Conversational surface:**
> OPEN: "You don't have to name the thing. Just this: when you reached for the
> busy-ness today — what was the feeling in the half-second before your hand moved?"
> *(wait)*
> MIRROR: "You said 'a sort of hum, like something about to be a problem.' A hum.
> Almost a sound. Where does the hum live — throat? chest? behind the eyes?" *(wait)*
> DEEPEN: "Stay with the hum for one breath. Not solving it. Just letting it finish the
> sentence your day didn't let it finish." *(wait)*
> SEED: "Enough. It doesn't need to be finished tonight. It needed to be *felt* — and
> it was. Let the throat keep the rest, kindly."
>
> **Oblique hint:** What you avoid, you rehearse. What you feel, you finish.
>
> **Silence beat:** 45 seconds. No cue. The orb stills.
>
> **Carry-seed:** *"The distraction was never the enemy. It was the bodyguard of an
> unfinished sentence."*
>
> **More-thread + experiment:** *The full reed-flute teaching waits in the Temple —
> Rumi, "The Song of the Reed," 6 minutes.* And tomorrow, one small act: when the hand
> reaches for the phone, stop it mid-air for three seconds and ask the hum what it
> wanted to say. Then — phone or no phone — your choice.

~4 minutes, ten distinct content objects, two references to the user's own sentences,
two doors left open. **Ten composed things that feel like ten thousand.**
