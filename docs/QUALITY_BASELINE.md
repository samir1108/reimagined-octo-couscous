# Quality Baseline

This repo carries a large pre-existing type backlog. Rather than hide it or block
every change on it, typechecking is **ratcheted**: the existing errors are recorded
and any *new* error fails CI.

## Commands

| Command | Purpose |
|---|---|
| `npm run typecheck` | Verify no new type errors beyond the baseline |
| `npm run typecheck:strict` | Show every error (baseline ignored) |
| `npm run typecheck:baseline` | Re-record the baseline after intentional changes |
| `npm run lint` | ESLint; must be 0 errors |
| `npm run lint:strict` | ESLint with warnings as errors (burn-down goal) |
| `npm run check` | typecheck + lint + unit tests |

Baseline file: `config/typecheck-baseline.json`. Errors are keyed by
`file | code | message`, so moving code around does not invalidate it.

## Current baseline

- **388** type errors, concentrated in the consciousness engine modules that are
  being reconciled with the server-side `_shared` implementations:
  - `src/lib/consciousness/orchestrator/ConsciousnessOrchestrator.ts`
  - `src/supabase/_shared/*` (browser copies lag behind `supabase/functions/_shared`)
  - `src/pages/Explore.tsx`, `src/pages/Home.tsx`
- ~21k `@typescript-eslint/no-explicit-any` **warnings**. Warnings never fail CI,
  but `lint:strict` counts them.

## Burn-down order

1. `src/supabase/_shared/*` stubs are 1.5 KB shells of 14–37 KB server modules.
   Decide: delete the browser copies and call the `consciousness-engine` edge
   function, or port the real contracts. Everything else follows from that.
2. `ConsciousnessOrchestrator.ts` (once step 1 is settled).
3. `Home.tsx`, `Explore.tsx`, then component-level `any`s.

## Rules going forward

- New code must not use `any` (`lint:strict` is the target; do not add new ones).
- Never lower the baseline to make a red build green. Fix the error.
- Generated files (`src/integrations/supabase/types.ts`) and Deno functions are
  excluded from the app lint pass by design.
