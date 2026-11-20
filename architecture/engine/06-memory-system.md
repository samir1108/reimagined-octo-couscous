# §6. Memory System: layers, embeddings, retrieval, sacred moments

The memory system has two largely independent stacks that were both actively developed:
an **AI-summarized, importance-scored memory table** (`guru_memory`, driven by
`memory-extract`/`memory-consolidate`) and a **raw vector-embedding store** (
`user_memory_vectors`, driven by `embed-memory`/`recall-memory`/
`synthesize-daily-memory`), plus a curated **sacred-moments** highlight reel
(`extract-sacred-moments`) built on top of journal entries.

### 6.1 Layer 1 — `guru_memory`: AI-distilled, importance-scored, decaying memories

`memory-extract` (`memory-extract/index.ts`) is the entry point: given raw text (a journal
entry or guide-session transcript) of at least 30 characters, it calls `llama-3.1-8b-instant`
with a tool-call contract (`store_memory`, `:61-116`) that forces the AI to distill the text
into: a 2–3 sentence `content` summary, an `importance` score 1–10 (1–3 routine, 4–6
meaningful pattern, 7–8 significant breakthrough, 9–10 life-changing), a `category`
(breakthrough / pattern / trigger / milestone / insight / struggle), 2–5 free-text `tags`,
an `emotional_tone` enum, a `dimension_relevant` (thought/emotion/body/awareness), any
`linked_loops` (the 7 core loop ids: origin/worth/safety/power/connection/identity/
compulsion), and — notably — a **`memory_layer`** classification into 5 depth tiers
(`:103-107`): `surface` (daily/routine), `karmic` (repeating life patterns, recurring
relationship cycles, déjà vu themes), `ancestral` (family-inherited/generational/parental
conditioning), `evolutionary` (breakthrough/before-after identity shifts), `somatic`
(body-stored trauma/tension/breath signatures). Memories scoring `importance <= 2` are
silently dropped (`:167-171`) — the system explicitly does not store routine observations
long-term. Every 5th stored memory triggers a fire-and-forget call to `memory-consolidate`
(`:199-216`).

`memory-consolidate` (`memory-consolidate/index.ts`) first applies a DB-side decay RPC
(`decay_memories`, `:41`) to every active memory, then pulls up to 100 non-consolidated
memories and asks the AI (via a `consolidate_and_detect` tool call, `:79-128`) to do two
things in one pass: (1) identify **merge groups** — sets of memories that say the same
insight in different words, which get collapsed into one record (the survivor keeps the
merged content/importance/category, decay is reset to 1.0, and the absorbed memories are
marked `is_consolidated: true` / `consolidated_into: <survivor id>` rather than deleted,
`:172-199`); (2) detect **cross-session patterns** — themes recurring across 3+ memories —
which get written to (or, if a pattern with the same name already exists, merged into) a
separate `memory_patterns` table carrying `frequency`, `dimension`, `linked_loops`,
`emotional_trend` (improving/stable/worsening/fluctuating), and `significance`
(emerging/established/critical/resolving), with every contributing memory tagged with a
`pattern_cluster` label (`:201-249`).

### 6.2 Layer 2 — `user_memory_vectors`: embedding-based semantic recall

This is the "felt continuity" system: a flat vector store where every meaningful user
utterance (journal, chat, reflection, session note, observation, pulse-check, or daily
synthesis) is embedded via Gemini's `text-embedding-004` model and stored with
`source_type`, optional `source_id`, `tags[]`, and `loop_ids[]`
(`supabase/functions/_shared/long-term-memory.ts:35-63`, mirrored client-side by
`src/lib/memory/longTermMemory.ts:22-37` which fire-and-forgets a POST to `embed-memory`).
`embed-memory` (`embed-memory/index.ts`) is the thin edge-function wrapper: it rejects
content under 8 characters, validates `source_type` against a fixed enum (journal, chat,
reflection, session, observation, pulse, synthesis), embeds via the same Gemini endpoint,
and inserts into `user_memory_vectors` — embedding is best-effort (a null embedding is still
stored if Gemini fails, so the row exists for non-semantic lookups).

**Retrieval** happens through two paths that share the same underlying Postgres RPCs
(`match_user_memories` for pgvector similarity search, `count_loop_occurrences` for
recurrence counting): the standalone `recall-memory` edge function
(`recall-memory/index.ts`, callable directly by the client per
`src/lib/memory/longTermMemory.ts:71-90`), and the shared
`buildLongTermMemoryBlock()` helper (`long-term-memory.ts:86-178`) that other edge functions
(likely `guide-chat`, `session-adapter`, etc.) call internally to inject memory directly
into an AI system prompt. The latter is the more sophisticated of the two: it (1) embeds
the current query text and runs semantic search excluding memories from the last 24 hours
(`p_min_days_ago: 1`) so recall feels like *memory*, not recency-bias (`:100-110`); (2) for
the user's single most-active loop, calls `count_loop_occurrences` over a 60-day window and,
if the count is ≥3, generates a specific callback line — "This is the Nth time the pattern
`X` has surfaced in the last 60 days (first noticed <date>, on N distinct days)"
(`:112-125`); (3) pulls the 2 most recent `daily_memory_synthesis` rows for
"yesterday-aware" morning continuity (`:127-133`). Crucially, whenever a surfaced memory is
≥7 days old, it logs a row to `ai_callback_log` (`:148-162`) — this is the explicit
enforcement mechanism referenced in the code comments for a product rule that **"1 in 5
sessions must include a felt-continuity callback"** referencing memory older than a week.
The assembled markdown block ends with an explicit instruction to the AI: "At most ONE
callback per reply. Phrase it like a friend who remembers, not a system that logs"
(`:170-172`), with a worked example ("Three weeks ago you wrote about your father — is this
the same ache?").

### 6.3 Daily synthesis — `synthesize-daily-memory`

Once per day per user (invoked either by a nightly cron using the service-role key/
`x-cron-secret`, or on-demand by the user), this function
(`synthesize-daily-memory/index.ts`) gathers everything the user did that calendar day —
journal entries, session summaries, the evening reflection (mood/energy/gratitudes/
highlights/challenges/lessons), and `consciousness_signals` loop touches
(`:84-119`) — flattens it into a compact text blob, and asks Groq's
`llama-3.3-70b-versatile` (temperature 0.6, 220 max tokens) for exactly one **3-sentence,
second-person, "who you became today" reflection**, with an explicit system prompt
forbidding headings, lists, and platitudes, and requiring the reflection to "notice what
shifted... name the emotional texture... end with one quiet observation, not a
prescription" (`:41-68`). It is idempotent (skips if a synthesis for that date already
exists, `:74-81`) and skip-safe if there's no signal at all that day (`:117-119`). The
resulting summary is stored in `daily_memory_synthesis` (with heuristic `key_themes` merged
from loop ids + journal tags, and a `mood_signal`) and is *also* immediately embedded into
`user_memory_vectors` with `source_type: "synthesis"` (`:182-192`) — so tomorrow's session
can recall not just raw utterances but the AI's own end-of-day interpretation of the user.

### 6.4 Sacred Moments — `extract-sacred-moments`

A separate, lighter-weight highlight-reel extractor that runs over the last 1–30 days of
journal entries (default 7, `extract-sacred-moments/index.ts:43`) and asks a fast/cheap
model (`tier:nano`) to identify — not summarize — genuine "sacred moments": breakthroughs,
tears (deep grief/release), laughs (real joy), realizations, vows, gratitude, grief,
first-vulnerability, milestones, or life events (`:93-159`), each returned with a direct
`user_words` quote, an `emotional_tone`, an `importance` (5–10 floor — routine content is
never eligible), and a `confidence` score; only moments with `confidence >= 0.6` are kept
(`:169`), and it explicitly instructs the model to skip generic entries and prefer "quality
over quantity" with a hard cap of 5 moments per run. Deduplication is by `source_id`
(journal entry id) within the lookback window, so re-running the extractor never
double-counts the same entry (`:73-90`). Results are written to a `sacred_moments` table
with `moment_type`, `title`, `user_words`, `context` (the journal's own title, if any),
`occurred_at` (backdated to the source journal's `created_at`, not the extraction time), and
metadata recording the AI's confidence and an `auto_extracted: true` flag — this appears to
power a "Memory Vault" surface distinct from the semantic-recall/callback system in §6.2,
oriented toward a curated, human-browsable timeline of peak/trough moments rather than
AI-driven in-conversation recall.
