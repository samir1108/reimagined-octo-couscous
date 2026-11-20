# World-Class Product Roadmap

Status snapshot: 2026-11-14. This document turns the audit into an ordered plan.
Items marked **DONE** were implemented in the same change set.

---

## 1. Where the product stands

| Dimension | Before | After this pass |
|---|---|---|
| Type errors | 435 (unchecked — CI typecheck was a no-op) | 388 known, **ratchet enforced**, no new ones allowed |
| ESLint errors | 607 (mostly from `.kilo/worktrees` being linted) | **0** |
| Tests | 8 files / 800k LOC | unchanged (next priority) |
| Build output | 241 MB | ~38 MB |
| Dead media in deploy | 203 MB of unreferenced mp4 | moved to `media-source/` |
| Error monitoring | none | dependency-free capture + pluggable sink |
| Product analytics | ad-hoc | typed event taxonomy + `track()` |
| Crisis safety | US-only hardcoded hotlines | region-aware (IN/US/GB/CA/AU/EU) + global fallback |
| PWA | manifest unlinked, service worker never registered, install would fail | manifest linked, correct icons, safe SW registered in prod |
| Accessibility | zoom disabled | zoom enabled; audit continues below |
| SEO | canonical pointed at `your-domain.com`, OG image 404 | runtime origin fallback, correct OG image |
| Security headers | CSP blocked Google Fonts, `microphone=()` broke voice | CSP/Permissions-Policy corrected |

---

## 2. Market benchmark

| Competitor | What they win on | What we must match |
|---|---|---|
| Calm / Headspace | First value in <90s, one loop, no account wall | Activation funnel |
| Waking Up | Intellectual rigor, published philosophy | Explainability of the engine |
| Oura / Whoop | One trustworthy daily number | "Why this today" everywhere |
| Duolingo | Habit mechanics (repair, leagues, loss aversion) | Streak integrity + weekly review |
| BetterHelp / Headway | Clinical safety, validated outcomes | Crisis flow + WHO-5/PSS-10 instrumentation |

Our wedge — *an app designed to make you need it less* — is real but currently unmeasurable.
Making it measurable is the single highest-leverage strategic move (P4).

---

## 3. Priority plan

### P0 — Trust floor  (DONE, except Sentry hookup)
- [x] Real typecheck in CI (`scripts/typecheck-ratchet.mjs`); the old `tsc --noEmit` checked nothing.
- [x] ESLint green; `.kilo` worktrees, archives, Deno functions and generated types excluded.
- [x] `lint:strict` / `typecheck:strict` scripts for the burn-down.
- [x] Dependency-free observability (`src/lib/observability`) wired into `main.tsx`, `ErrorBoundary`, auth.
- [x] Region-aware crisis resources in `EmergencySanctuary`.
- [x] Remove deploy dead weight; fix CSP, Permissions-Policy, manifest, SW.
- [x] Fix conditional-hooks crash in `ShowroomDay` (16 hook-order violations).
- [ ] Connect a real sink: Sentry (errors) + PostHog (events) via `configureObservability({ sink })`.
  Needs DSN/API key; no code change beyond the sink adapter.
- [ ] Remaining a11y: orb gesture alternative for keyboard/screen reader, 44px targets, contrast pass.

### P1 — One loop, activation first
- [ ] Collapse 151 routes into 5 destinations: Today, Practice, Guide, Progress, You.
- [ ] 90-second first value: breath → insight → account. Today the chain is
      Why → Light Six → Foundation → First Eleven before any value.
- [ ] Remove the split brain: `/experience/*` (showroom) vs `/app/*`; `Home` vs `Index` vs `HopeLanding`.
- [ ] One primary CTA per screen; Home answers "How am I? What now? What changed?"

### P2 — Retention
- [ ] Today card with 3/10/20-minute options; every session ends with one artifact.
- [ ] Streak with repair, Sunday review, monthly "30 days ago vs now" shareable report.
- [ ] Notification scheduler already has `localDate.ts`; add quiet hours + per-user timezone proof.

### P3 — Monetization & growth
- [ ] Free daily ritual forever; pay for depth. Paywall after the third completed session, not before.
- [ ] Transparent credit costs (`paymentConfig.ts`, Razorpay already wired).
- [ ] Programmatic SEO on the knowledge/essay corpus; referral = "gift a session".

### P4 — Make the engine provable
- [ ] Weekly WHO-5 (or PSS-10) EMA inside the app; store alongside sessions.
- [ ] Session-level mood delta; publish "X% improvement at 30 days" once n is meaningful.
- [ ] "Why this practice today" as a first-class surface everywhere (`ThemeReasoning` is the seed).
- [ ] One academic validation partnership + whitepaper.

---

## 4. KPI dashboard to build next

| Funnel stage | Metric | Target |
|---|---|---|
| Activation | First session completed <24h | >60% |
| Habit | Sessions / week | 3–5 |
| Quality | Session completion | >70% |
| Retention | D1 / D7 / D30 | 60 / 40 / 25% |
| Love | NPS | >50 |
| Trust | Crash-free sessions | >99.5% |
| Unit economics | LLM cost / session | <$0.50 |
| Performance | p75 LCP (mid Android) | <2.5s |

Events are already typed in `src/lib/observability/index.ts`; wire `track()` at the
call sites above as the funnel work proceeds.

---

## 5. What cannot be done from the codebase alone

These need product, legal, or credentials decisions:

1. Sentry/PostHog accounts and keys.
2. Academic validation study and IRB/ethics review.
3. Pricing experiments and payment provider go-live.
4. App Store / Play Store submission assets and review.
5. Clinical review of crisis copy per launch region.
