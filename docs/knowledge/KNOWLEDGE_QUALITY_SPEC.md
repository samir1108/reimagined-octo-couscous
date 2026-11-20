# Knowledge Quality Spec — Deep Concepts (Phase 1)

**Status:** active · **Owner:** knowledge · **Applies to:** every record that enters `public/knowledge/batches/`

A concept enters the knowledge base only if it explains. A label is not knowledge.
This spec defines the contract, the gates, and the rubric that later generated
batches are scored against.

---

## 1. The unit

A **deep concept** is one explanatory record. Its type is one of:

| Family | Answers | Node type |
|---|---|---|
| `mechanism` | How does this happen, step by step? | `theory` |
| `blocker` | What prevents progress, and what state is it? | `challenge` |
| `physiology` | What body/brain system is involved? | `body-system` |
| `practice_variant` | Which practice, at what dose, for whom? | `practice` |
| `myth` | What is commonly believed that is false? | `claim` |
| `measurement` | How do we know it changed? | `assessment` |
| `band_map` | What works at which developmental band? | `model` |

Schema lives in `src/types/knowledgeConcept.ts`. Gold set lives in
`src/data/knowledge/deepConcepts.ts`.

---

## 2. Required fields (no exceptions)

| Field | Minimum | Why |
|---|---|---|
| `definition` | 60 chars, one sentence | Must be quotable on a card |
| `mechanism` | **3 ordered steps** | This is the difference between a wiki stub and knowledge |
| `whyItHappens` | 1 paragraph | Root cause, tied to the mechanism |
| `signs` | **3 observable markers** | Recognition beats description |
| `counterExample` | 40 chars | Prevents the most common misreading |
| `practice.dose` | explicit number + unit | "Regularly" is not a dose |
| `practice.instructions` | actionable steps | Reader can start today |
| `measure` | observable change | Otherwise progress is unfalsifiable |
| `citations` | **≥ 1** | Text, research, or tradition — with kind |
| `bandFit` | min ≤ max, 0–10 | Prevents applying band-6 methods at band 2 |
| `confidence` | ≥ 0.6 | Below this, do not ship |
| `reviewStatus` | draft / reviewed / verified | Drives what the app surfaces |

Optional: `caution` (required for any physiology or clinical-adjacent claim),
`aliases`, `relations`.

---

## 3. Hard gates (automated)

Implemented in `src/lib/knowledge/deepConceptGate.ts`. `kg:build` **throws** if any
record fails, so a bad batch cannot be written.

1. **Schema** — all required fields present and above minimum length.
2. **Medical-claim safety** — `BANNED_MEDICAL_TERMS` checked with word boundaries
   (a "retreat" is not a "treat"). Any hit blocks the record.
3. **Identity** — `id` starts with `deep:`, unique across the set.
4. **Resolvability** — `deep:` relation targets exist; other targets are `kb::` ids.
5. **Citation floor** — at least one citation, with a declared kind.

---

## 4. Eval rubric (0–4 per dimension)

Used to score the gold set and every generated batch against it. Weighted total
must be **≥ 3.2 / 4** to ship; any dimension scoring 1 or below blocks the batch.

| Dimension | Weight | 0 | 2 | 4 |
|---|---|---|---|---|
| **Causal accuracy** | 25% | Wrong mechanism | Plausible but vague | Steps are individually defensible and ordered |
| **Recognition value** | 15% | Abstract only | Some signs | Reader recognises themselves in 2+ signs |
| **Actionability** | 15% | No practice | Generic practice | Exact dose + instructions + stopping rule |
| **Falsifiability** | 15% | No measure | Vague measure | Concrete, observable, time-bounded |
| **Boundary clarity** | 10% | No counter-example | Weak contrast | Clearly separates neighbouring concepts |
| **Evidence** | 15% | None | Single generic source | Multiple, specific, correctly attributed |
| **Safety** | 5% | Unsafe claim | Missing caution | Caution present, no medical overreach |

Safety is a **veto**: a 0 on safety fails the batch regardless of total.

---

## 5. Gold set

24 records, hand-authored, covering the seed questions:

- sleeper cannot meditate · sleep debt · DMN overactivity · attention collapse
- gut-brain axis · vagal tone · interoception · freeze response
- effort paradox · "no thoughts" myth · restlessness · expectation mismatch
- phone-pull loop · boredom spike · effort headache
- 4-7-8 · box breathing · body scan · witness gap
- HRV · sleep efficiency · bands 1–3 · bands 4–6 · gut-feeling myth

Every later generated concept is compared to these on the rubric. If a generator
cannot match the gold set, it does not scale.

---

## 6. Review workflow

```
draft  →  reviewed  →  verified
```

- `draft` — authored or generated, gate-passed, **not surfaced** in app search.
- `reviewed` — human read it end-to-end and checked citations.
- `verified` — spot-checked against the rubric and a second reader.

Sampling rule: **1% of every generated batch** is reviewed before promotion, and
any record involved in a user-reported error is re-reviewed within 48 hours.

---

## 7. How it reaches the app

```bash
npm run kg:build                 # includes --source=deep
npx vite-node scripts/kg/build-batches.ts --source=deep --dry
```

Each record becomes:

- one `kb::deep::<slug>` node
- 7–8 passages (definition, mechanism, why, signs, counter-example, practice, measure, caution)
- typed edges from `relations` plus `DERIVED_FROM` edges to citation nodes

The loader merges batches as before; no client-side change is needed.

---

## 8. Phase gates

| Phase | Scope | Exit criterion |
|---|---|---|
| 1 (now) | 24 gold concepts + gate + rubric | Gate green, tests green |
| 2 | 500 concepts, 3 families | Rubric mean ≥ 3.2, 1% audit pass |
| 3 | 5,000 concepts, 7 families | Search hit-rate ≥ 70% on 100 real queries |
| 4 | 100,000 concepts + multilingual | Published eval set + public benchmark |

Scaling without passing the previous gate is out of scope by definition.
