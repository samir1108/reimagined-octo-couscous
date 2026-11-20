# V00 — SPEC CONVENTIONS (NORMATIVE)

> Every volume in `docs/prd/` obeys this grammar. If a block does not fit a template, it must be marked
> `EXT` and explain why. Consistency is what lets an AI agent implement 960 capabilities without drift.

---

## 1. ID SCHEME

```
COS-<VOL>-<AREA>-<NNN>
```
- `VOL` — 01..11 (volume number, two digits).
- `AREA` — short uppercase key: `AUTH`, `DB`, `API`, `STU`, `CAP`, `AGT`, `WF`, `UI`, `TST`, `TKT`, `OPS`.
- `NNN` — sequential within area, zero-padded, **never reused**, never renumbered.

Examples
```
COS-02-DB-014    table spec: assets
COS-04-STU-022   studio spec: story.screenplay
COS-05-CAP-317   capability spec: script.write_scene
COS-08-UI-012    route spec: /p/:projectId/screenplay
COS-09-TST-044   test spec: breakdown recall
```

Derived IDs
```
TABLE ID      COS-02-DB-014
ENDPOINT ID   COS-03-API-041
STUDIO ID     COS-04-STU-022      (also studio_key)
CAPABILITY ID COS-05-CAP-317      (also studioKey.capabilityKey)
AGENT ID      COS-06-AGT-012      (also agent_key)
WORKFLOW ID   COS-07-WF-004
ROUTE ID      COS-08-UI-012       (also route path)
TEST ID       COS-09-TST-044      (must cite its requirement ID)
TICKET ID     COS-10-TKT-118      (must cite requirement IDs)
```

Rule: a spec block is addressed by its header ID. Code comments are forbidden, but **commit messages and
test names must carry the ID**, e.g. `test('COS-05-CAP-317 writes scene artifact')`.

---

## 2. VOLUME HEADER (every volume starts with this)

```
# VNN — TITLE

Status: <draft|complete>
Owner chat: N
Depends on: <volume ids>
Proves: <master PRD sections>
Blocks: <volume ids that cannot start until this is complete>
```

---

## 3. TABLE SPEC TEMPLATE

```
### COS-02-DB-014 — assets
Purpose: one sentence.
Used by: studios and capabilities (keys).
Columns:
| # | column | type | null | default | notes |
|---|--------|------|------|---------|-------|
Constraints: pk, fk, unique, checks (list each).
Invariants: statements that must always hold (e.g. `status=approved implies current_version_id not null`).
Indexes: exact DDL one per line.
RLS: read policy, write policy, service-only columns.
Lifecycle: created when; updated when; deleted/archived when; retention.
Volume estimate: expected rows per workspace after 1 year.
Example: single JSON row (compact, one line if possible).
Migration: `00NN_create_<table>.sql`.
```

---

## 4. STUDIO SPEC TEMPLATE

```
### COS-04-STU-022 — Screenplay Studio (story.screenplay)
Family: story | Phase: 1 | Route: /p/:projectId/screenplay | Enabled: true
Purpose: one sentence.
User outcome: what the user can do here that they cannot do elsewhere.
Panels: list of tabs actually shown, in order.
Data read: tables/columns.
Data written: tables/columns (own studio only).
Capabilities: table of key | name | tags | agent | async.
States:
  empty: text + primary action
  loading: skeleton shape
  error: message + recovery
  locked: banner + unlock path
  stale: badge + refresh action
Keyboard: shortcuts (at least 6).
Responsive: 1280 / 768 / 390 behaviour in one line each.
Acceptance: 3–6 testable statements.
Depends on: studio IDs and gates.
Doc file: docs/studios/story.screenplay.md
```

---

## 5. CAPABILITY SPEC TEMPLATE (the highest-volume block)

```
### COS-05-CAP-317 — script.write_scene
Studio: story.screenplay | Tags: [llm] | Agent: screenwriter_agent | Async: false
Intent: one sentence describing the user value.
Inputs:
| name | type | req | constraints |
Outputs:
| name | type | notes |
Algorithm:
  1. step
  2. step
  3. step
Context needs: artifacts/entities that must be loaded, in priority order, with token budget.
Prompt contract: template key + required sections (if LLM).
Validation: post-conditions checked before persisting.
Failure modes: code | when | user-visible message | recovery.
Cost: class (none|low|mid|high) + estimate formula.
Side effects: rows written, events emitted.
Acceptance: 3 testable statements with numbers.
```

Rule: every capability block is **25–45 lines**. 960 capabilities × 32 avg ≈ 30,700 lines. This is the
largest single contributor to the 100k target and must not be abbreviated.

---

## 6. ENDPOINT SPEC TEMPLATE

```
### COS-03-API-041 — POST /api/v1/projects/:id/capabilities/:capabilityKey
Auth: member role >= artist | Rate: 60/min/user | Idempotent: yes (Idempotency-Key)
Request: schema (fields, types, required).
Response 200: envelope + data shape.
Errors: table of code | http | cause | retry?
Side effects: events, jobs, audit rows.
Latency budget: p50 / p95 / hard timeout.
Example: one compact JSON request and response.
```

---

## 7. AGENT SPEC TEMPLATE

```
### COS-06-AGT-012 — screenwriter_agent
Role: one line.
Capability scopes: allowlist patterns.
Tools: registry tool ids with limits.
Context policy: max tokens, required blocks, preferred blocks, exclusion rules.
System prompt: (fenced block, versioned `PROMPT_VERSION=v1`)
Output contract: schema or sections.
Guardrails: list; each must be enforceable in code.
Evaluations: 3 fixtures with pass criteria.
Failure behaviour: retry policy, fallback, user message.
```

---

## 8. UI ROUTE SPEC TEMPLATE

```
### COS-08-UI-012 — /p/:projectId/screenplay
Shell: StudioShell(story.screenplay)
Layout: regions (left rail, header, canvas, right rail) with widths.
Components: inventory with props.
Primary action: one per screen.
States: empty / loading / error / locked / stale / offline.
Keyboard: table of key | action.
Responsive: 1280 / 768 / 390.
Perf budget: TTI, LCP, list virtualization threshold.
Accessibility: landmarks, focus order, labels, contrast notes.
```

---

## 9. TEST SPEC TEMPLATE

```
### COS-09-TST-044 — breakdown recall
Proves: COS-05-CAP-118
Level: unit | integration | contract | e2e | visual | perf | rls | a11y
Fixture: path or generator.
Steps: numbered.
Pass criteria: numeric thresholds.
Runtime budget: seconds.
Flake policy: deterministic required; retries 0.
```

---

## 10. TICKET TEMPLATE

```
### COS-10-TKT-118 — Screenplay editor persistence
Phase: 1 | Epic: story | Size: S|M|L | Depends: TKT ids
Requirements: COS-05-CAP-31x, COS-08-UI-012
Deliverable: files and behaviours.
Acceptance: checklist, each line testable.
Verification command: exact command to run.
```

---

## 11. LINE RULES

1. One idea per line; avoid paragraphs longer than 3 lines.
2. Tables and lists are preferred to prose — they compress and stay parseable.
3. No placeholder text: no "TBD", no "etc.", no "and so on". Enumerate.
4. Every numeric threshold appears exactly once and is referenced, not restated.
5. Use `MUST` / `MUST NOT` / `SHOULD` / `MAY` with their RFC 2119 meaning.
6. Capability and studio keys are lowercase dotted, `snake_case` after the dot.
7. Enum values are snake_case and append-only.
8. Every block ends with its required closing sections (see §3–§10). A block missing them is incomplete.
9. Do not duplicate the master PRD verbatim; volumes expand it with implementable detail.
10. Completed blocks are append-only. Corrections go in `_progress.md` as decision entries, not silent edits.

---

## 12. COMPLETION DEFINITION PER VOLUME

A volume is `complete` when:
- every ID in its declared scope exists exactly once,
- every block has its closing sections,
- cross-references resolve (no dangling IDs),
- `node scripts/prd-status.mjs` reports zero errors for that volume,
- the gate in `README.md` §3 is satisfied.

---

## 13. WRITING ORDER INSIDE A CHAT

1. Print a 5-line plan (scope, blocks, dependencies, risk, gate).
2. Append blocks to the target volume in ID order.
3. Run `node scripts/prd-status.mjs` after each 10 blocks.
4. Update `_progress.md` at the end.
5. Report: IDs written, lines added, gate status, next chat's first ID.

---

## 14. ANTI-PATTERNS (REJECT ON REVIEW)

- A capability with no failure modes.
- A table with no RLS policy.
- A route with no empty state.
- A test with no numeric pass criteria.
- An agent that can call capabilities outside its scope.
- A "misc" section.
- Duplicated requirement stated in two volumes.
- Any requirement that cannot be verified by a test or a recorded manual check.
