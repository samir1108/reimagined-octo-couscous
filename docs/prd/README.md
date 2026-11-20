# CreativeOS — PRD 100K BUILD PLAN

**Goal:** 100,000+ lines of build-ready PRD across **10 chats**, written as a numbered volume set that an AI agent can execute block by block.

**Source of truth order:** `docs/prd/*` (this set) > `CREATIVEOS_MASTER_PRD.md` > `CREATIVEOS_PRD.md`.

---

## 1. WHY VOLUMES, NOT ONE FILE

A single 100k-line file cannot be written reliably in one session and cannot be navigated by an agent.
This set splits the same total into volumes with hard line budgets, stable IDs, and a machine-checkable
progress meter (`node scripts/prd-status.mjs`). Every requirement has an addressable ID
(`COS-<volume>-<section>-<item>`), so tickets, tests, and code can cite it.

## 2. VOLUME MAP AND LINE BUDGET

| Vol | File | Contents | Budget | Owner chat |
|---|---|---|---|---|
| V00 | `00-CONVENTIONS.md` | Spec grammar, ID scheme, line rules, templates | 400 | 1 |
| V01 | `V01-FOUNDATION.md` | Vision, market, personas, journeys, IA, design system, platform architecture, NFRs, i18n, analytics, glossary | 2,600 | 1 |
| V02 | `V02-DATA-MODEL.md` | Every table: columns, constraints, indexes, RLS, lifecycle, invariants, examples | 3,600 | 1–2 |
| V03 | `V03-API.md` | Every endpoint, payload, error, idempotency, pagination, rate limits, events | 3,200 | 3 |
| V04 | `V04-STUDIOS.md` | Studio specs: purpose, panels, states, data, capability list, acceptance | 12,000 | 3–5 |
| V05 | `V05-CAPABILITIES.md` | Capability specs: input schema, algorithm, output, failures, cost, tests | 34,000 | 6–8 |
| V06 | `V06-AGENTS.md` | Agent roster, prompts, tools, guardrails, context policy, evaluations | 6,000 | 9 |
| V07 | `V07-WORKFLOWS.md` | Orchestration graphs, gates, retries, compensation, SLAs | 3,000 | 9 |
| V08 | `V08-UI.md` | Route-by-route UI spec: layout, components, states, keyboard, responsive | 5,000 | 9 |
| V09 | `V09-TESTS.md` | Test specs per capability, RLS matrix, performance, accessibility, fixtures | 9,000 | 10 |
| V10 | `V10-TICKETS.md` | Phase epics, tickets, acceptance criteria, sequencing, estimates | 8,000 | 10 |
| V11 | `V11-OPS.md` | Security, moderation, rights, billing, observability, DR, runbooks, risks, metrics | 4,000 | 10 |
| — | `_progress.md` | Generated status + locked decisions | auto | auto |

**Total budget: ~91,000–100,000 lines.** Volumes may exceed budget; they must never fall short at a phase gate.

## 3. CHAT ALLOCATION (10 CHATS)

| Chat | Scope | Target lines | Gate to pass before chat ends |
|---|---|---|---|
| 1 | V00 + V01 complete + V02 §1–§4 (identity, tenancy, universe) | 4,000 | `prd-status` runs; V00/V01 marked complete |
| 2 | V02 complete (production structure, assets, artifacts, workflow, generation, QA, academy) | 4,000 | every table in master §11 has a spec |
| 3 | V03 complete + V04 part 1 (development, story, world) | 3,600 | endpoint count matches master §16 |
| 4 | V04 part 2 (character, direction, cinematography, design, storyboard) | 3,500 | 60 studios specified |
| 5 | V04 part 3 (vfx, animation, generation, sound, voice, music, editing, qc, marketing, doc, interactive, production, academy, platform) | 3,500 | 111 studios specified |
| 6 | V05 part 1 (development, story, world capabilities) | 3,400 | capability count matches registry |
| 7 | V05 part 2 (character, direction, cinematography, design, storyboard) | 3,400 | all capability input schemas present |
| 8 | V05 part 3 (generation → platform capabilities) | 3,400 | 960 capability blocks present |
| 9 | V06 + V07 + V08 | 4,000 | 33 agents, 20 workflows, 30 routes |
| 10 | V09 + V10 + V11 + audit | 4,000 | totals ≥ 100k; cross-reference audit clean |

## 4. CONTINUATION PROTOCOL (for chat 2 onward)

At the start of each chat, the agent must:
1. Run `node scripts/prd-status.mjs` and read `docs/prd/_progress.md`.
2. Read `docs/prd/00-CONVENTIONS.md` and the master PRD sections named for the current chat.
3. Open the target volume and continue from the **last written ID**, never rewriting completed blocks.
4. Update `docs/prd/_progress.md` (status, IDs written, remaining budget).
5. Stop only at a gate defined in §3.

Prompt template for the next chat:

```
Continue the CreativeOS 100K PRD. Chat N of 10.
Run `node scripts/prd-status.mjs`, read docs/prd/00-CONVENTIONS.md.
Execute the scope for Chat N from docs/prd/README.md §3.
Do not rewrite completed blocks. Update _progress.md and stop at the gate.
```

## 5. LOCKED DECISIONS

| # | Decision | Rationale |
|---|---|---|
| D-001 | Postgres/Supabase as canonical store | RLS, realtime, storage, edge functions in one stack |
| D-002 | All creative output is an artifact version (JSON body), never raw text in a table | diffing, provenance, gates |
| D-003 | Providers behind adapters; no provider key in client | portability and security |
| D-004 | Deterministic capabilities never call an LLM | cost and stability |
| D-005 | 13 approval gates; artifacts immutable once locked | professional review workflow |
| D-006 | Studio = registry row + folder + route + doc; no core edits to add one | modular scale to 111 studios |
| D-007 | `[FUTURE]` studios ship disabled with preview badge | honest scope |
| D-008 | Identity locks use descriptor + reference set; threshold 0.85 | measurable continuity |
| D-009 | Every job is idempotent by `sha256(project|capability|canonicalInput)` | safe retries |
| D-010 | Costs held at queue, settled at terminal state | no credit overspend |
| D-011 | Volume IDs are stable; requirements are never renumbered | agent navigation |
| D-012 | UI specs are per-route and per-state; no "figure it out" | reviewer-testable |

## 6. PROGRESS

`node scripts/prd-status.mjs` prints per-volume lines, completion flags, and distance to 100k.
`_progress.md` is the human-readable mirror; it is regenerated by the same script.

## 7. QUALITY BAR FOR EVERY BLOCK

- One requirement per line where possible; no bare adjectives that cannot be tested.
- Every capability block ends with **Inputs / Outputs / Failure modes / Cost class / Acceptance**.
- Every table block ends with **Invariants / Indexes / RLS / Lifecycle**.
- Every UI block ends with **States / Keyboard / Responsive / Empty / Error**.
- Every test block names the requirement ID it proves.
- Numbers are given (thresholds, timeouts, limits), not "reasonable" or "fast".
