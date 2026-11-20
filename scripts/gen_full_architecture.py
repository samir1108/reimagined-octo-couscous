#!/usr/bin/env python3
"""
Generates documentation/03-architecture/CONSCIOUSOS_FULL_ARCHITECTURE.md
A single, exhaustive architecture file covering every layer, engine, table,
loop family, band, yoga level, game, and the lifetime feedback loop.
Intended for an investor / "smartest mind in the room" meeting.
"""
from pathlib import Path
import subprocess, textwrap

ROOT = Path(__file__).resolve().parents[1]
FNS_DIR = ROOT / "supabase" / "functions"
OUT = ROOT / "documentation" / "03-architecture" / "CONSCIOUSOS_FULL_ARCHITECTURE.md"

# ---------------------------------------------------------------- discovery
edge_fns = sorted([p.name for p in FNS_DIR.iterdir() if p.is_dir() and not p.name.startswith("_")])

# group engines by purpose (curated)
GROUPS = {
    "L0 — Ingestion (data in)": [
        "ingest-signal", "stt-listen", "wearable-sync", "wearable-oauth-start",
        "wearable-oauth-callback", "calendar-meeting-watcher", "gmail-tone-watcher",
        "outlook-tone-watcher", "slack-tone-watcher", "teams-tone-watcher",
        "github-late-night-watcher", "linear-workload-watcher", "reflect-game",
    ],
    "L1 — Detection (raw → signal)": [
        "live-detect", "detect-bypassing", "detect-anomalies", "detect-contradictions",
        "detect-cross-pollination", "detect-silence", "pattern-window-detector",
        "evaluate-practice-level", "infer-three-brain", "instant-pulse-detector",
    ],
    "L2 — Fusion & Memory": [
        "signal-fusion", "embed-memory", "memory-extract", "memory-consolidate",
        "recall-memory", "synthesize-daily-memory", "aggregate-daily-dimensions",
        "extract-sacred-moments", "compute-constellation", "recalibrate-constellation",
        "compute-companion-state", "compute-kundli", "integrate-human-map",
    ],
    "L3 — Mainspring (single source of truth)": [
        "user-state-snapshot",
    ],
    "L4 — Decision Engines (attention heads)": [
        "consciousness-engine", "compose-session", "compose-session-v3",
        "compose-today-practice", "generate-session-agenda", "generate-program-session",
        "generate-personal-program", "generate-personal-rhythm", "generate-daily-ritual",
        "generate-theme", "evolve-theme", "generate-wisdom", "generate-master-theme-teaching",
        "generate-master-next-step", "generate-journey-nudge", "generate-higher-self-letter",
        "for-you-practices", "get-next-practice", "suggest-next-program", "next-session-preview",
        "adapt-next-block", "session-adapter", "curiosity-engine", "council-consensus",
        "three-lens-analyzer", "companion-engine", "predictive-insights", "predict-churn",
        "recalibration-intelligence", "activate-specialty", "assess-starting-levels",
        "analyze-assessment", "assign-curriculum-arc", "always-open-prompts",
        "pre-event-nudge", "post-event-reflection",
    ],
    "L5 — Conversation & Delivery": [
        "guide-chat", "guide-insight", "temple-chat", "elder-dialogue",
        "discovery-session", "mirror-session", "pre-journey-chat", "journal-reflect",
        "guru-practice-session", "master-journey-review", "graduation-deep-analysis",
        "decode-dream", "tts-speak",
    ],
    "L6 — Feedback Loop (the moat)": [
        "session-complete", "score-session-spine", "verify-breakthrough",
    ],
    "L7 — Org / Enterprise": [
        "enterprise-insights", "enterprise-people-intelligence", "manager-coaching",
        "org-program-designer", "org-weekly-briefing", "seed-demo-org",
    ],
    "L8 — Admin / Ops": [
        "admin-ai-insights", "admin-broadcast", "admin-copilot",
        "complete-task", "translate-ui", "razorpay-order", "razorpay-verify",
    ],
}

CLASSIFIED = {f for grp in GROUPS.values() for f in grp}
UNCLASSIFIED = [f for f in edge_fns if f not in CLASSIFIED]

# ---------------------------------------------------------------- writers
out = []
W = out.append

def H(level, text):
    W("#" * level + " " + text)
    W("")

def P(text):
    W(text); W("")

def HR():
    W("---"); W("")

# ============================================================== HEADER
W("# ConsciousOS — The Full Architecture")
W("")
W("> A closed-loop inference pipeline over a longitudinal human state.")
W("> Not a prompt wrapper. Not a chatbot. An operating system for consciousness.")
W("")
P("**Audience:** The smartest mind in the room. An investor, a researcher, "
  "a competitor's CTO. Someone who will say *'so it's just GPT with a prompt?'* "
  "in the first 30 seconds. This file is the answer.")
P("**Length target:** exhaustive. Every layer, every engine, every table, every "
  "loop family, every yogic band, every game, every feedback edge. If a system "
  "exists in the codebase, it is described here with its inputs, outputs, and "
  "why it cannot be reproduced by prompting an LLM.")
P("**Reading order:** Part I gives the 60-second pitch. Part II gives the "
  "transformer analogy. Part III walks the 9 layers. Part IV documents every "
  "one of the 103 edge functions. Part V documents every domain model "
  "(loops, bands, yoga levels, dimensions, gates, games, lifetime spiral). "
  "Part VI is the 10 falsifiable moat claims. Part VII is the meeting script.")
HR()

# ============================================================== PART I
H(1, "Part I — The 60-Second Pitch")
P("Every consumer AI app today is the same shape:")
W("```")
W("user input  →  prompt template  →  LLM  →  response")
W("```")
P("They differ in prompt cleverness and UI. The model is the product. "
  "Switch the model and the company evaporates.")
P("ConsciousOS is a different shape:")
W("```")
W("12 signal channels                      (multi-modal ingest)")
W("        ↓")
W("650-ID Loop Library + Detectors         (typed pattern grammar)")
W("        ↓")
W("Fusion + Vector Memory + Daily Sleep    (longitudinal compression)")
W("        ↓")
W("user-state-snapshot  ← THE MAINSPRING   (single canonical state)")
W("        ↓")
W("103 specialist engines in parallel      (LLM = subroutine, not product)")
W("        ↓")
W("Day plan / Session / Nudge / Master reply")
W("        ↓")
W("session-complete → score → verify-breakthrough → karma → regression")
W("        ↑__________________________________________________________|")
W("                       writes back into state — closed loop")
W("```")
P("The LLM is **one cell** in row 5. Remove it and replace it with another LLM, "
  "the system still works. The product is the **state**, the **loop library**, "
  "the **fusion**, and the **closed feedback loop**. None of those are prompts.")
HR()

# ============================================================== PART II
H(1, "Part II — The Transformer Analogy (for the AI literate)")
P("If a transformer is your mental model, here is the exact mapping.")

table = [
    ("Transformer concept",        "ConsciousOS concept",                                    "Where it lives"),
    ("Tokens",                     "Raw signals (chat msg, HRV tick, late-night commit, etc.)", "`L0` ingest fns, `bio_signals`, `work_signals`, `device_signals`"),
    ("Token embeddings",           "Loop IDs from the 650-entry Loop Library",                 "`live-detect`, `pattern-window-detector`, `loop_attributions`"),
    ("Positional encoding",        "Daily gate + life-stage + lifetime-phase + kundli context", "`dailyGates.ts`, `lifetimeSpiral.ts`, `user_kundli`"),
    ("Attention layer",            "An edge function reading state + scoring an output",       "Any `L4` engine"),
    ("Multi-head attention",       "103 specialist engines running in parallel",               "All of `supabase/functions/*`"),
    ("Residual stream",            "`user-state-snapshot` — the canonical state every engine reads", "`user-state-snapshot/index.ts`"),
    ("Layer norm",                 "`signal-fusion` normalizing stress/focus/burnout to [0,1]", "`signal-fusion/index.ts`"),
    ("Feed-forward block",         "LLM call inside an engine (Groq llama-3.3-70b)",           "`_shared/ai-gateway.ts`"),
    ("Output head",                "Day plan, session steps, nudge text, master reply",        "`compose-session-v3`, `guide-chat`, `temple-chat`, `nudge_queue`"),
    ("Backprop / training",        "`session-complete` → `score-session-spine` → `verify-breakthrough` → writes to `karma_events`, `regression_events`, `cross_pollination_log`", "`L6`"),
    ("Pre-training corpus",        "650 loops, 118 masters, 100 dimensions, 11 bands, 80+ programs — encoded as typed data, not prose", "`src/data/*`, `src/lib/consciousness/*`"),
    ("Long-context memory",        "pgvector embeddings + daily memory synthesis (sleep-like consolidation)", "`embed-memory`, `synthesize-daily-memory`, `user_memory_vectors`"),
    ("RLHF",                       "Quality score 0-1 per session + breakthrough verification + karma economy", "`score-session-spine`, `verify-breakthrough`, `user_karma`"),
]
W("| " + " | ".join(table[0]) + " |")
W("|" + "|".join(["---"] * len(table[0])) + "|")
for row in table[1:]:
    W("| " + " | ".join(row) + " |")
W("")
P("**Implication.** A prompt-based competitor is the equivalent of a single "
  "untrained transformer block calling a pretrained model. We are the whole "
  "stack: tokens, embeddings, attention, residual stream, output head, and "
  "— most importantly — the **training loop that writes back into the state**.")
HR()

# ============================================================== PART III
H(1, "Part III — The 9 Layers, Walked End-to-End")

LAYER_DOCS = [
    ("L0", "Ingestion", """
The system accepts ~12 channels of input. Each is normalized into a typed row
in one of three signal tables (`bio_signals`, `work_signals`, `device_signals`)
or into a domain table (`mood_pulses`, `session_messages`, `journal_entries`,
`practice_voice_recordings`, `dream_entries`).

| Channel | Source | Edge fn | Table |
|---|---|---|---|
| Text chat | Guide/Temple UI | `guide-chat`, `temple-chat` | `session_messages`, `temple_ai_conversations` |
| Voice | Browser mic → Whisper | `stt-listen` | `practice_voice_recordings` |
| Typing biometrics | `useTypingCadence` hook | `ingest-signal` | `device_signals` |
| Phone pickups | `usePhonePickups` (Android usage / iOS Screen Time) | `ingest-signal` | `device_signals` |
| HRV / RHR / Sleep | Wearable OAuth (Oura/Whoop/Fitbit/AppleHealth) | `wearable-sync` | `bio_signals` |
| Calendar / meetings | Google/Outlook calendar | `calendar-meeting-watcher` | `meeting_nudges`, `work_signals` |
| Email tone | Gmail / Outlook | `gmail-tone-watcher`, `outlook-tone-watcher` | `work_signals` |
| Chat tone | Slack / Teams | `slack-tone-watcher`, `teams-tone-watcher` | `work_signals` |
| Code patterns | GitHub late-night, Linear workload | `github-late-night-watcher`, `linear-workload-watcher` | `work_signals` |
| Game telemetry | `ConsciousGameShell` (breath, face-cam, mic, haptics) | `reflect-game` | `consciousness_signals` |
| Mood pulses | One-tap UI | (direct insert) | `mood_pulses` |
| Geo anchors | Browser geolocation | (direct insert) | `geo_anchors`, `geo_practice_anchors` |

Consent is enforced per-channel via `signal_consents` table and the
`SentientWatchersProvider` component — a watcher cannot mount without an
opted-in consent row.
"""),
    ("L1", "Detection — raw → typed pattern", """
This is where ConsciousOS stops looking like a normal app. Every signal that
enters is examined for membership in the **650-ID Loop Library** — a typed
grammar of human psychological patterns (e.g. `VAL001` = value-action conflict,
`RES003` = sympathetic restlessness, `EMO012` = suppression-spike, `BUR001` =
burnout vector, `BIO005` = low-HRV chronic stress, `REC001` = sleep deficit).

Detector functions:

- **`live-detect`** — runs on every chat message and journal entry. Hybrid
  approach: deterministic regex/heuristics first, then LLM fallback for
  ambiguous text. Writes `loop_attributions` rows with confidence scores.
- **`detect-bypassing`** — spiritual bypassing detector. Looks for
  "I'm fine / blessed / grateful" patterns *after* a stress-signal spike.
- **`detect-anomalies`** — z-score against the user's own 30-day baseline.
- **`detect-contradictions`** — compares declared values (from onboarding,
  Sankalpa, journal) against revealed behavior in `consciousness_signals`.
- **`detect-cross-pollination`** — when a Witness practice gain shows up as
  a HRV improvement two days later, this records the causal edge.
- **`detect-silence`** — absence detector. Long silence ≠ peace; sometimes
  it is avoidance. Differentiates by surrounding signals.
- **`pattern-window-detector`** — sliding-window aggregator across N days.
- **`evaluate-practice-level`** — quality score for a single practice rep.
- **`infer-three-brain`** — Head / Heart / Gut dominance inference per turn.
- **`instant-pulse-detector`** — sub-minute acute spike detector, queues
  immediate nudges into `nudge_queue`.

Output of L1 is always a typed row referencing a Loop ID or a Dimension.
**A prompt-based system cannot do this** because it has no library of types
to detect against. It can describe what it sees in prose; it cannot say
"this is `RES003` at confidence 0.82, the user's 4th occurrence this week,
correlating with `WRK001` workload spike."
"""),
    ("L2", "Fusion & Memory — many signals → one state", """
L1 produces a *firehose* of typed events. L2 compresses them.

**Fusion (`signal-fusion`)** runs on a 5-minute pg_cron. Reads the last
30 minutes of `bio_signals`, `work_signals`, `device_signals` per user.
Normalizes everything to [0,1]. Computes three scalars:

- `stress_norm` = f(1−HRV, tone_load, restlessness, jitter, workload)
- `focus_norm`  = f(sleep, 1−restlessness, 1−tone_load, 1−workload)
- `burnout_risk` = f(stress, 1−focus, workload, late_night)

Then maps to a **recommended action** (witness_5min, rest_protocol,
sleep_anchor, boundary_breath, walking_meditation, cooling_breath,
deep_work_block). Writes one row to `fused_signals`.

**Vector memory (`embed-memory`, `recall-memory`)** — important moments
from sessions, journals, breakthroughs are embedded with a sentence-transformer
and stored in `user_memory_vectors` (pgvector). Recall is semantic — at
session-compose time we pull the 5 most relevant past moments.

**Daily memory synthesis (`synthesize-daily-memory`)** — once per day,
sleep-like consolidation: yesterday's signals, sessions, and journal entries
are summarized by an LLM into a single `daily_memory_synthesis` row with
themes, breakthroughs, and a one-line "what today taught you." This is the
analogue of biological memory consolidation during sleep.

**Pattern + dimension aggregation** — `aggregate-daily-dimensions` rolls up
per-dimension signal deltas into `daily_dimension_summary`. `extract-sacred-moments`
finds moments of unusual quality (high HRV + low tone-load + reflective journal)
and writes `sacred_moments`. `compute-constellation` and `recalibrate-constellation`
maintain `user_practice_constellation` — the 43-column matrix of where the user
is on every practice path.

**Companion + identity** — `compute-companion-state`, `compute-kundli`,
`integrate-human-map` enrich the state with relational/astrological/typological
context.
"""),
    ("L3", "Mainspring — `user-state-snapshot`", """
This is the architectural keystone. Without it, the system is 103 functions
duplicating queries. With it, the system has a single canonical "who is this
user right now" object that every engine reads from.

- Lives in `supabase/functions/user-state-snapshot/index.ts`.
- Wraps `_shared/user-context.ts::getUserContext()`.
- Per-user, per-runtime-context 60s in-memory cache, capped at 500 entries.
- Cache key includes `gate`, `energy`, `timeBudgetMin`, `mood` so morning-low-energy
  ≠ evening-high-energy.
- Accepts both JWT (client diagnostics) and service-role (internal engine calls).

A snapshot contains, at minimum:

- Identity: id, profile, kundli, life stage, lifetime phase, relationship depth.
- Spiritual DNA: V-level, dimension bands (12 dims), brain dominance, paths.
- Active state: today's gate, today's theme arc, today's sankalpa, today's
  practice pack, recent regression flag, plateau flag.
- Behavioral: last 7 days quality scores, recent loops, recent dimension deltas,
  fused stress/focus/burnout, recent karma events.
- Memory: top-K semantic memory snippets, daily synthesis, sacred moments,
  inside jokes, future-self letters.

**Why this layer is the moat.** Every decision engine reads this object, not
raw tables. That means the decision functions are *stateless and swappable*.
You can rewrite `compose-session-v3` tomorrow and it still works, because
the contract is "given a snapshot, return a session plan." This is the same
discipline as the residual stream in a transformer.
"""),
    ("L4", "Decision Engines — 103 specialist heads", """
This is the layer competitors call "the AI". For us it is one layer of many,
and the LLM is a subroutine inside it, not the product. Engines fall into
six functional clusters:

**4.1 Session composition** — `compose-session`, `compose-session-v3`,
`compose-today-practice`, `generate-session-agenda`, `generate-program-session`.
Given a snapshot, build a typed `SessionPlan` (intent, intro, steps[]).
Each step has a `whyForYou` sentence referencing the signal that justified it
(the Sankalpa Engine T1 contract). Templates differ in which practice type
they bias toward and how they interpret recent quality.

**4.2 Personalization / next-step** — `get-next-practice`, `for-you-practices`,
`suggest-next-program`, `next-session-preview`, `adapt-next-block`,
`session-adapter`, `generate-personal-program`, `generate-personal-rhythm`,
`generate-daily-ritual`.

**4.3 Theme + wisdom + master** — `generate-theme`, `evolve-theme`,
`generate-wisdom`, `generate-master-theme-teaching`, `generate-master-next-step`,
`generate-journey-nudge`, `generate-higher-self-letter`.

**4.4 Council / deliberation** — `consciousness-engine`, `council-consensus`,
`three-lens-analyzer`, `curiosity-engine`. The Council Consensus pattern is
particularly important: when a decision is high-stakes (e.g. a master reply
to a user in dark-night-of-the-soul), three masters draft replies and a
consensus head picks/synthesizes. This is the Mixture-of-Experts pattern
implemented at the *spiritual* level.

**4.5 Prediction / risk** — `predictive-insights`, `predict-churn`,
`recalibration-intelligence`. Project the user's trajectory N days forward.

**4.6 Assessment + activation** — `analyze-assessment`, `assess-starting-levels`,
`assign-curriculum-arc`, `activate-specialty`, `always-open-prompts`,
`pre-event-nudge`, `post-event-reflection`.
"""),
    ("L5", "Conversation & Delivery", """
The user-facing surface. Every conversation channel is its own engine because
the persona, safety rails, and memory scope differ:

- **`guide-chat`** — the warm "wise sibling" persona, default daily companion.
  Auto-injects kundli context, continuity-engine memory, and three-brain
  inference into the system prompt.
- **`temple-chat`** — guru-shishya persistent dialogue with 1 of 118 masters.
  Persona file per master, voice cloning via ElevenLabs, language mirroring,
  safety layer for fragile states.
- **`elder-dialogue`** — late-life-stage persona, used during graduation phase.
- **`discovery-session`** / **`mirror-session`** — the 4-phase cinematic
  diagnostic from the landing page. Cold-start consciousness assessment.
- **`pre-journey-chat`** — onboarding conversation that produces Spiritual DNA.
- **`journal-reflect`** — manual "go deeper" prompt after a typing pause.
- **`guru-practice-session`** / **`master-journey-review`** — credit-gated
  high-context analyses by a chosen master.
- **`graduation-deep-analysis`** — at end of an arc, produces a 33-column
  `graduation_reports` row.
- **`decode-dream`** — symbolic interpretation of `dream_entries`.
- **`tts-speak`** — ElevenLabs TTS with browser-native fallback (silent in
  meditative contexts so a network failure never breaks the meditation).
"""),
    ("L6", "Feedback Loop — the closed circuit", """
This is the layer that converts ConsciousOS from "an app with AI" into
"a system that learns the specific human." Three functions form the circuit:

1. **`session-complete`** — fires when the user finishes any session.
   Writes `sessions` row, marks `daily_sessions`, decrements credits,
   triggers downstream.
2. **`score-session-spine`** — assigns a 0-1 quality score by looking at:
   step-completion ratio, time-on-step variance, journal depth (LLM scored),
   biometric coherence during the session (HRV trend), self-report rating,
   and whether the practice actually moved the targeted loop/dimension.
   Writes `session_spine`.
3. **`verify-breakthrough`** — if the score and signals exceed thresholds
   AND the user reports an "aha", records a verified breakthrough event,
   awards karma, and *promotes the user's V-level* on the relevant dimension.

Side effects fan out:

- `karma_events` + `user_karma` — gamified progress, not vanity points; karma
  is the substrate for the credit economy and for level-up thresholds.
- `regression_events` — quality drop triggers softening of next session and
  optional dark-night support (`recalibration-intelligence`).
- `cross_pollination_log` — when a practice in one tradition produces gains
  in another dimension (e.g. Vipassana Witness practice improving HRV),
  the causal edge is recorded and *fed into future composition decisions*.
- `daily_engine_plans` — tomorrow's plan is pre-computed from today's outcome.

**This is the loop.** Tomorrow's snapshot is a function of today's score.
Tomorrow's engines therefore make different decisions. The user's experience
on day 30 is unrecognizable from day 1, not because the prompts got better,
but because the *state they operate on* is unrecognizable.
"""),
    ("L7", "Org / Enterprise", """
A standalone surface that does NOT compromise individual privacy. Hard floor:
no manager sees anything unless `n >= 5` aggregation. Implemented via
SECURITY DEFINER functions that refuse to return rows under the threshold.

- `enterprise-insights`, `enterprise-people-intelligence` — aggregated team
  heat maps.
- `manager-coaching` — coaching prompts derived from aggregate trends, not
  individuals.
- `org-program-designer`, `org-weekly-briefing` — org-level program building.
- `seed-demo-org` — demo data for sales.
"""),
    ("L8", "Admin / Ops / Economy", """
- `admin-ai-insights`, `admin-broadcast`, `admin-copilot` — operator surfaces.
- `complete-task` — daily task lifecycle.
- `translate-ui` — runtime i18n.
- `razorpay-order`, `razorpay-verify` — credit purchase, atomic deduction.
- Credits gate every AI feature; `ensureCreditsForSession()` redirects to
  `/app/credits` before a session is composed so no free sessions leak.
"""),
]

for code, name, body in LAYER_DOCS:
    H(2, f"{code} — {name}")
    for para in textwrap.dedent(body).strip().split("\n\n"):
        P(para)
HR()

# ============================================================== PART IV
H(1, "Part IV — Every Edge Function, Documented")
P(f"The system ships **{len(edge_fns)} edge functions** today. They are grouped "
  "by layer below. Each entry lists: purpose, inputs (what state/tables it "
  "reads), outputs (what it writes), and the LLM dependency (if any).")

# generic per-function template
def fn_block(name):
    path = FNS_DIR / name / "index.ts"
    line_count = 0
    head = ""
    if path.exists():
        try:
            txt = path.read_text(errors="ignore")
            line_count = txt.count("\n") + 1
            # extract leading comment block as best-effort purpose
            lines = txt.splitlines()[:40]
            comment_lines = []
            for ln in lines:
                s = ln.strip()
                if s.startswith("//") or s.startswith("*") or s.startswith("/*"):
                    cleaned = s.lstrip("/").lstrip("*").strip()
                    if cleaned and not cleaned.startswith("="):
                        comment_lines.append(cleaned)
                elif comment_lines:
                    break
            head = " ".join(comment_lines)[:400]
        except Exception:
            pass
    H(4, f"`{name}`")
    if head:
        P(f"_{head}_")
    P(f"- **Source:** `supabase/functions/{name}/index.ts` (~{line_count} lines)")

for group_name, fns in GROUPS.items():
    H(2, group_name)
    for fn in fns:
        if fn in edge_fns:
            fn_block(fn)

if UNCLASSIFIED:
    H(2, "Other / utility")
    for fn in UNCLASSIFIED:
        fn_block(fn)

HR()

# ============================================================== PART V
H(1, "Part V — The Domain Models (the IP)")
P("This is the part competitors can't speedrun. The engines are *implementations*; "
  "these models are the *substrate*. They took years of synthesis between yogic "
  "tradition and computational psychology.")

# ----------- V.1 Loop Library
H(2, "V.1 — The 650-ID Loop Library")
P("A typed grammar of human psychological/behavioral patterns. Every loop has:")
W("- A 6-character ID (e.g. `VAL001`, `RES003`, `EMO012`).")
W("- A family (Values, Restlessness, Emotion, Burnout, Biology, Recovery, "
  "Work, Identity, Relational, Existential, ...).")
W("- A human-readable name (`getLoopName(id)` everywhere in UI).")
W("- A severity band and a recommended intervention class.")
W("- Detection rules — deterministic where possible, LLM-assisted where not.")
W("")
P("Loop families (illustrative IDs):")
loop_families = [
    ("VAL", "Value-Action Conflicts", "Said-vs-did gaps. `VAL001` = stated value contradicted within 72h."),
    ("RES", "Restlessness / Sympathetic Drive", "`RES003` = sympathetic restlessness, ≥20 phone pickups/h."),
    ("EMO", "Emotion Suppression / Spike", "`EMO012` = suppression then 'I'm fine' bypass."),
    ("BUR", "Burnout Trajectory", "`BUR001` = composite burnout vector >0.75."),
    ("BIO", "Biological Stress", "`BIO005` = chronic low HRV across rolling 7d."),
    ("REC", "Recovery / Sleep", "`REC001` = sleep score <60. `REC002` = late-night work signals."),
    ("WRK", "Work / Overload", "`WRK001` = workload >0.7 sustained."),
    ("IDN", "Identity Confusion", "self-concept vs revealed-behavior contradictions."),
    ("REL", "Relational Patterns", "trigger loops with specific named contacts."),
    ("EXI", "Existential Drift", "purpose gaps, meaning collapse, dark night."),
    ("SPI", "Spiritual Bypass", "premature transcendence patterns."),
    ("ATT", "Attachment / Aversion", "classic yogic kleshas, instrumented."),
]
W("| Family | Domain | Example |")
W("|---|---|---|")
for fam, dom, ex in loop_families:
    W(f"| `{fam}` | {dom} | {ex} |")
W("")
P("Loops are stored in `src/data/handbook/loopFamilies.ts` and attributions "
  "in `loop_attributions`. The CRITICAL rule (project memory): code MUST use "
  "exact IDs and resolve to human-readable names via `getLoopName` — no "
  "placeholder strings, no LLM-invented IDs. This is how we keep the grammar "
  "typed.")

# ----------- V.2 Bands
H(2, "V.2 — The 11-Band Spiral Journey")
P("Consciousness is not linear. We model it as 11 bands (0..10), each with "
  "micro-levels, 6 dimensions of progress, and 3 speed profiles. Bands "
  "describe *what the user can perceive and metabolize*, not how 'good' they are.")
bands = [
    (0,  "Survival",          "Crisis stabilization, basic safety. Witness 1-2 min only."),
    (1,  "Routine",           "Anchor habits, sleep, breath baseline."),
    (2,  "Awareness",         "First observation of loops. Naming what was invisible."),
    (3,  "Inquiry",           "Self-inquiry threads, journaling depth."),
    (4,  "Practice",          "Daily formal practice locked. Programs make sense."),
    (5,  "Discrimination",    "Viveka — distinguishing self from thought."),
    (6,  "Integration",       "Cross-pollination across dimensions becomes visible."),
    (7,  "Stability",         "Equanimity under provocation, sustained."),
    (8,  "Transmission",      "User can teach. Inside-jokes with masters mature."),
    (9,  "Embodiment",        "Practice becomes background field, not foreground task."),
    (10, "Service",           "Identity reorients to contribution. Elder mode unlocks."),
]
W("| Band | Name | Capacity |")
W("|---|---|---|")
for n, name, cap in bands:
    W(f"| {n} | {name} | {cap} |")
W("")
P("Bands gate which **practice level** of which **practice** the user is "
  "offered. A Band-2 user offered Band-8 practice will quit. A Band-8 user "
  "offered Band-2 practice will quit. The matching is the engine's job.")
P("Speed profiles: **Fast / Steady / Deep**. Detected from `speed_profile_history` "
  "by quality-score velocity. The same user can be Fast on Pranayama and Deep "
  "on Self-Inquiry — speed is per-practice.")
P("Regression: a sustained quality drop or a life-event spike drops the user "
  "one band on the affected dimension, with restoration credits so it never "
  "feels punitive. See `regression_events` and `recalibration-intelligence`.")

# ----------- V.3 Dimensions
H(2, "V.3 — The 12 Dimensions (and the 100-sub map)")
dims = [
    "Body / Soma", "Breath / Prana", "Mind / Manas", "Emotion / Chitta",
    "Intellect / Buddhi", "Identity / Ahamkara", "Relational / Sangha",
    "Work / Karma", "Ethics / Yama-Niyama", "Energy / Kundalini",
    "Devotion / Bhakti", "Witness / Sakshi",
]
W("The 12 primary dimensions tracked in every snapshot:")
W("")
for d in dims:
    W(f"- **{d}**")
W("")
P("Each primary dimension expands into ~8 sub-dimensions, totaling the "
  "**100-Dimension Human Map** (`src/lib/consciousness/taxonomy/dimensions100.ts`, "
  "table `human_map_dimensions`). The Mirror analytics surface visualizes "
  "movement across all 100, but the engines decide primarily on the 12 to "
  "keep latency low.")

# ----------- V.4 Yoga / Practice levels
H(2, "V.4 — The 3-Layer Practice Matrix (Core / Path / Specialty)")
P("Every practice in the library belongs to exactly one of three layers, "
  "and has 5-7 levels. The composition formula is **30/50/20**: 30% Core, "
  "50% Path, 20% Specialty in any week.")
W("- **Core (30%)** — universal practices that every human benefits from "
  "regardless of path: Witness, Breath, Body scan, Journal, Sleep anchor.")
W("- **Path (50%)** — practices specific to the user's chosen tradition: "
  "Jnana (inquiry), Bhakti (devotion), Karma (action), Raja (8-limb), "
  "Tantra (energetics), Vipassana, Zen, etc.")
W("- **Specialty (20%)** — situational and earned practices: dream yoga, "
  "kriya, mantra, council of yogis, deep-rest protocols.")
W("")
P("Practice levels are quality-gated, not time-gated. You don't level up "
  "because 14 days passed; you level up because your last 3 reps scored "
  "≥0.75 AND a verified breakthrough fired AND the relevant dimension band "
  "moved. See `get-next-practice`, `evaluate-practice-level`, "
  "`user_practice_levels`, `user_practice_constellation`.")
P("**Cross-pollination** is first-class. If Witness gains light up in HRV, "
  "the system can plateau-break Pranayama by deepening Witness instead of "
  "grinding more Pranayama. The mapping is learned per-user and stored in "
  "`cross_pollination_log` → consumed by `compose-session-v3`.")

# ----------- V.5 Daily Gates
H(2, "V.5 — The 4 Daily Gates")
P("The day is structured as 4 gates the user can pass through, mapped to "
  "6 time-slot patterns (Morning Only, All 4, Morning+Evening, Night Only, "
  "Irregular, Weekday/Weekend). The system never guilts a missed gate; it "
  "adapts.")
W("1. **Arrival** — first contact of the day. Sets intention (Sankalpa).")
W("2. **Practice** — the main formal session.")
W("3. **Integration** — micro-practices through the working day.")
W("4. **Closing** — evening reflection / Yoga-Nidra-style closing.")
W("")
P("Each gate has its own UI atmosphere (`SlotAtmosphere`, `SlotHeroCard`, "
  "`SlotSignature`) driven by per-slot design tokens in `src/lib/slotDesign.ts`. "
  "See `dailyGates.ts`, `user_daily_gates`, `daily-flow-4gates` memory.")

# ----------- V.6 Games
H(2, "V.6 — The Conscious Games (faculty training)")
P("Games are not gamification. Games are *faculty calibrators* — short, "
  "embodied exercises that measure and train a specific cognitive/somatic "
  "faculty using the device's sensors. Output of every game is a signal "
  "row, not a score.")
W("- **Shell:** `src/games/shell/ConsciousGameShell.tsx`, with hooks "
  "`useBreathMic`, `useFaceCam`, `useMicLevel`, `useHaptics`, `useTranscribe`, "
  "`useGuruVoice`.")
W("- **Permissions:** `PermissionsGate` — no game runs without explicit "
  "per-sensor consent.")
W("- **Telemetry:** `logGameSession` writes a row consumed by `reflect-game`, "
  "which produces a `consciousness_signals` row and may trigger `live-detect`.")
W("- **Faculties covered:** breath coherence, attentional dwell, somatic "
  "interoception, vocal prosody, reaction inhibition, equanimity-under-distraction "
  "(sound-reactive Witness training).")

# ----------- V.7 Lifetime Spiral
H(2, "V.7 — The 10-Phase Lifetime Spiral")
P("A 10,000-day arc. The app is not a 30-day product. The Lifetime Spiral "
  "(`src/lib/consciousness/lifetimeSpiral.ts`, `app_relationship_depth`) "
  "models the *relationship between user and app* across 7 depth phases, "
  "and the user's life-stage adaptation (student → professional → parent → "
  "elder) across 10 spiritual phases. Guru rotation, curiosity engine, "
  "fractal integration, predictive engine, and the 100-dimension map all "
  "draw from this layer to ensure day-1 simplicity and day-3000 depth from "
  "the same codebase.")

# ----------- V.8 Master roster
H(2, "V.8 — The 118 Masters")
P("11 thematic categories. Each master is a typed persona file (voice, "
  "language, lineage, safety rails, signature practices) — not a prompt. "
  "Used by `temple-chat`, `master-journey-review`, `guru-practice-session`, "
  "`council-consensus`, `generate-master-theme-teaching`, "
  "`generate-master-next-step`. Stored in `guru_memory`, `guru_rotations`, "
  "`guru_shishya_relationships`.")

# ----------- V.9 Programs
H(2, "V.9 — The 80+ Structured Programs")
P("Programs are *templated arcs* (`src/data/programs/v2/engine.ts`). Each "
  "template knows: how many phases, which practice type to bias, how to "
  "interpret quality, how to estimate sessions-remaining. The Adaptive Program "
  "Surface (`suggest-next-program`) picks or composes programs from the "
  "matrix of *masters × modes × practices* using `engine_signals` and "
  "`personalized_programs`. The user never browses a library; the right "
  "program meets them.")

# ----------- V.10 Karma + Credits
H(2, "V.10 — Karma + Credits (the economy)")
P("Two ledgers, kept separate by design.")
W("- **Credits** (Razorpay-backed, real money) gate AI compute. Pre-checked "
  "via `ensureCreditsForSession()` before any session is composed; atomic "
  "deduction on completion.")
W("- **Karma** (`karma_events`, `user_karma`) is the internal currency of "
  "verified depth. Karma is earned via `verify-breakthrough`, sustained "
  "quality, integration events, and contribution. Karma unlocks specialty "
  "practices and certain master access; it cannot be bought.")

# ----------- V.11 Privacy
H(2, "V.11 — Privacy Floor")
P("Every public table has RLS. Every aggregation crossing user boundaries "
  "goes through SECURITY DEFINER functions with n≥5 floors. Voice + biometric "
  "raw data are time-decayed; only derived signals persist. Wearable tokens "
  "are encrypted at rest. Enterprise managers see only aggregates, never "
  "individuals.")
HR()

# ============================================================== PART VI
H(1, "Part VI — Ten Falsifiable Moat Claims")
P("Each claim below is testable. A competitor either has it or does not.")
moat = [
    ("State, not prompt",
     "We maintain a single canonical `user-state-snapshot` per (user × runtime). "
     "Every decision engine is stateless against it. No GPT wrapper has this; "
     "they re-derive state on every request from chat history."),
    ("Typed loop grammar",
     "650 typed loop IDs with detectors. A prompt cannot reliably emit "
     "`RES003 @ 0.82` on its 7th occurrence this week. We can."),
    ("Multi-channel fusion",
     "12 ingest channels normalized into one stress/focus/burnout vector "
     "every 5 minutes. A chatbot has one channel: text."),
    ("Daily memory consolidation",
     "Sleep-analog: nightly summarization writes a `daily_memory_synthesis` "
     "row that becomes the next day's context. Chatbots have transcript; we "
     "have *memory*."),
    ("Quality-scored closed loop",
     "Every session is scored 0-1, breakthroughs are verified, and the score "
     "writes back into V-level, regression, cross-pollination. The system "
     "learns the *specific human*, not the population."),
    ("Engine plurality",
     "103 specialist engines, including a Council Consensus (Mixture-of-Experts "
     "for high-stakes replies). A prompt-app has one engine: the prompt."),
    ("Lifetime adaptation",
     "10-phase spiral × 7 relationship-depth phases × life-stage detection. "
     "The app is a different product on day 1 and day 3000."),
    ("Cross-pollination causal map",
     "When practice A in tradition X moves dimension Y, we record the edge "
     "and use it to plateau-break. No one else tracks this."),
    ("Privacy floor as architecture",
     "n≥5 SECURITY DEFINER aggregators are *non-negotiable* for the enterprise "
     "surface. This is a structural feature, not a policy."),
    ("The loop is the moat",
     "Even if every engine were replaced with the same model a competitor "
     "uses, our outputs would still differ — because our outputs are functions "
     "of a state they cannot reconstruct."),
]
for i, (title, body) in enumerate(moat, 1):
    H(3, f"{i}. {title}")
    P(body)
HR()

# ============================================================== PART VII
H(1, "Part VII — The Meeting Script")
P("Use these lines verbatim if helpful.")
W('> **"We are not a prompt over an LLM. We are a closed-loop inference '
  'pipeline over a longitudinal human state. The LLM is one of our layers."**')
W("")
W('> **"Think of a transformer. We have all of it. Tokens are signals from '
  '12 channels. Embeddings are 650 typed loop IDs. The residual stream is '
  '`user-state-snapshot`. Attention heads are 103 specialist edge functions. '
  'The output head is a session plan, a master reply, a nudge. And the '
  "training loop — the part everyone forgets — is `score-session-spine` "
  'writing back into the state every time the user finishes a session."**')
W("")
W('> **"A competitor can copy our UI in a weekend. They can copy our '
  'prompts in an hour. They cannot copy a 90-day longitudinal state of '
  'a specific human. That state is the product."**')
W("")
W('> **"Show me a GPT wrapper that can tell me: you hit RES003 at 2pm because '
  'your last 4 Slack messages went tone-load 0.78 right after a no-sleep night; '
  'your Witness practice has plateaued at L3 for 9 days; cross-pollination data '
  'says deepening your breath ratio will unblock it; here is a 7-minute session, '
  'here is why each step is there, and here is the score we will measure it '
  'against. That is one snapshot read and four engines deep. That is us."**')

HR()

# ============================================================== APPENDIX
H(1, "Appendix A — Database Tables (high-signal subset)")
P("The full schema has ~150 tables. The ones below are the load-bearing ones "
  "for the pipeline narrative above:")
key_tables = [
    "user-state-snapshot inputs:",
    "  profiles, user_kundli, user_spiritual_dna, user_consciousness_profile,",
    "  user_practice_constellation, user_practice_levels, user_speed_profile,",
    "  user_life_stage, app_relationship_depth, user_karma, user_credits.",
    "",
    "Signal ingest:",
    "  bio_signals, work_signals, device_signals, mood_pulses,",
    "  practice_voice_recordings, dream_entries, consciousness_signals,",
    "  signal_consents, wearable_tokens.",
    "",
    "Detection / fusion / memory:",
    "  loop_attributions, fused_signals, anomalies,",
    "  user_memory_vectors, daily_memory_synthesis, sacred_moments,",
    "  pattern-window outputs in engine_signals, daily_dimension_summary,",
    "  three_brain_inferences, cross_pollination_log.",
    "",
    "Decision / plan:",
    "  daily_engine_plans, daily_themes, theme_arcs, theme_evolution_log,",
    "  daily_sankalpa, today_practice_packs, personalized_programs,",
    "  session_program_enrollments, session_program_progress, nudge_queue,",
    "  curiosity_queue, predictive_signals, churn_predictions.",
    "",
    "Delivery:",
    "  sessions, daily_sessions, session_messages, session_spine,",
    "  session_ingredients, session_adaptations, evening_reflections,",
    "  guide_chat history (consciousness_signals), temple_ai_conversations,",
    "  guru_memory, guru_shishya_relationships, master_theme_teachings.",
    "",
    "Feedback:",
    "  karma_events, user_karma, karma_verification_log,",
    "  regression_events, recalibration_events, graduation_reports,",
    "  practice_effectiveness, journey_harvest.",
    "",
    "Org / privacy:",
    "  organizations, org_members, org_consciousness_snapshots,",
    "  org_weekly_briefings, enterprise_notifications.",
]
W("```")
for line in key_tables:
    W(line)
W("```")
HR()

H(1, "Appendix B — Frontend Architecture (one paragraph)")
P("React 18 + Vite + Tailwind + shadcn. State is split: **XState** for "
  "client-only flows (cinematic session shell, machines in `src/machines/`), "
  "**TanStack Query** for everything server-derived. The `useFusedSignals`, "
  "`useAuthReady`, `useSignalConsents` hooks are the thin client-side view "
  "into the L2/L3 layers. The Temple is borderless and immersive; utility "
  "areas are clean and `max-w-2xl`. Floating 🪔 button is the only exit "
  "from sub-routes. Dark-first 'Satyayuga UX'.")
HR()

H(1, "Appendix C — Why this cannot be built in 6 months by a well-funded clone")
P("Three reasons.")
W("1. **The loop library.** 650 typed IDs, each with a detector. This is "
  "the artifact of years of synthesis between yogic tradition and behavioral "
  "instrumentation. A clone can fake 50 in a weekend; they cannot fake 650.")
W("2. **The closed feedback loop.** Even with infinite engineers, you cannot "
  "fast-forward 90 days of longitudinal state for a real human. The product "
  "literally has to age with the user.")
W("3. **The architectural discipline.** `user-state-snapshot` as residual "
  "stream is a one-line idea that took us 18 months to enforce across 103 "
  "engines. Most teams reach for raw queries. We don't, and we will not.")
W("")
P("— end —")

OUT.write_text("\n".join(out))
print("Wrote", OUT, "lines:", OUT.read_text().count("\n") + 1)
