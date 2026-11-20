# ConsciousOS — Architecture Folder

> Everything a new CEO, CTO, investor, or engineer needs to understand how ConsciousOS
> actually works — from the atomic building blocks up to the full user journey. Written
> from a full read of the codebase (src/, supabase/functions/, supabase/migrations/).

---

## How to read this folder

Three sub-folders, each answering a different question:

| Folder | Question it answers | Audience |
|---|---|---|
| [`ip/`](./ip) | **What is proprietary?** The concepts, models, and content libraries no one else has. | CEO, investors, product |
| [`engine/`](./engine) | **How does the app decide what to do?** Composer, session engine, adaptive journey, loop detector, guides, memory. | CTO, engineers |
| [`platform/`](./platform) | **How is it built?** DB schema, state machines, routes, UI system, network layer, day-in-the-life. | CTO, engineers, ops |

If you only read one file, read [`ip/07-ip-summary.md`](./ip/07-ip-summary.md) — that is
the moat, in one page. If you only read two, add
[`platform/06-user-persona-journey.md`](./platform/06-user-persona-journey.md) to feel the product.

---

## The one-paragraph pitch

ConsciousOS is an "anti-app" — a consciousness operating system that helps you need it *less*
over time, not more. It runs a personalized daily rhythm (morning, midday, evening, night) built
on top of a proprietary framework: **22 vertical Bands** of consciousness × **400+ named Loops** of
conditioning × **30+ Guide modes** (living masters, temple guides, guest roster) × a
**Composer** that assembles each session live from atomic ingredients based on the user's real-time
state (energy, gate, band, active loops, practice levels, time budget). It has a **Live Loop
Detector** that watches signals across the day and a **Memory System** that remembers what
mattered so tomorrow's session responds to today.

---

## System map — one picture

```text
                        ┌──────────────────────────────────┐
                        │            USER                  │
                        │  morning · midday · evening ·    │
                        │            night                 │
                        └───────────────┬──────────────────┘
                                        │ opens app
                                        ▼
                       ┌────────────────────────────────┐
                       │   Home / Guide / Temple UI     │
                       │  (React + Vite + Tailwind)     │
                       │   XState machines drive flow   │
                       └───────────────┬────────────────┘
                                       │ invoke edge fn
                                       ▼
           ┌──────────────────────────────────────────────────────┐
           │  supabase/functions/_shared/user-context.ts          │
           │  getUserContext() — "The Brain"                      │
           │  → identity, band, dimensions, loops, gate, energy,  │
           │    theme, engineSignals, foundation, program, DNA    │
           └───────────────┬───────────────────────┬──────────────┘
                           │                       │
          ┌────────────────▼────────────┐   ┌──────▼──────────────┐
          │   COMPOSER (Layer 1-3)      │   │  ADAPTIVE JOURNEY   │
          │   archetypes · ingredients  │   │  ENGINE             │
          │   compose-session-v3        │   │  V-Level, band,     │
          │   → ComposedSession         │   │  bypassing, warm-up │
          └────────────────┬────────────┘   └──────┬──────────────┘
                           │                       │
                           ▼                       ▼
                  ┌────────────────────────────────────────┐
                  │      SESSION SHELL (client)            │
                  │  practiceMachine + sessionMachine +    │
                  │  cinematic layer + voice orb + TTS/STT │
                  └────────────────┬───────────────────────┘
                                   │ signals during & after
                                   ▼
  ┌────────────────────────┐   ┌──────────────────────┐   ┌────────────────────┐
  │  LOOP DETECTOR         │   │  MEMORY SYSTEM       │   │  GUIDE / MASTER    │
  │  local + live-detect + │   │  extract · embed ·   │   │  ROSTER (30+)      │
  │  pattern-window +      │   │  consolidate ·       │   │  chooseMasterFor…  │
  │  detect-anomalies      │   │  recall · sacred     │   │  temple-guides     │
  └────────────────────────┘   └──────────────────────┘   └────────────────────┘
                           │           │           │
                           └───────────┼───────────┘
                                       ▼
                    Feeds back into next getUserContext()
                    (loop closes; app gets more accurate every day)
```

---

## Recommended reading order

1. [`ip/07-ip-summary.md`](./ip/07-ip-summary.md) — moat in one page.
2. [`ip/01-bands-vlevel-system.md`](./ip/01-bands-vlevel-system.md) — 22-band vertical model + V-Level math.
3. [`ip/02-loops-ip.md`](./ip/02-loops-ip.md) — the 400+ loop library.
4. [`ip/03-practice-ladders.md`](./ip/03-practice-ladders.md) — progressive skill trees.
5. [`ip/04-guide-master-roster.md`](./ip/04-guide-master-roster.md) — 30+ guides.
6. [`ip/05-modes.md`](./ip/05-modes.md) — silent, cinematic, temple, adaptive vs structured.
7. [`engine/00-shared-user-context.md`](./engine/00-shared-user-context.md) — the Brain snapshot every edge function reads.
8. [`engine/01-composer-framework.md`](./engine/01-composer-framework.md) — how a session is assembled.
9. [`engine/02-session-engine.md`](./engine/02-session-engine.md) — how a session actually runs.
10. [`engine/03-adaptive-journey-engine.md`](./engine/03-adaptive-journey-engine.md) — how the app adapts.
11. [`engine/04-loop-detector.md`](./engine/04-loop-detector.md) — local + server pattern detection.
12. [`engine/05-guide-modes-and-masters.md`](./engine/05-guide-modes-and-masters.md) — which voice speaks and why.
13. [`engine/06-memory-system.md`](./engine/06-memory-system.md) — what the app remembers.
14. [`platform/01-database-schema.md`](./platform/01-database-schema.md) — every table, RLS, grants.
15. [`platform/02-xstate-machines.md`](./platform/02-xstate-machines.md) — client state machines.
16. [`platform/03-routing-and-pages.md`](./platform/03-routing-and-pages.md) — full route map.
17. [`platform/04-ui-ux-design-system.md`](./platform/04-ui-ux-design-system.md) — tokens, temple aesthetic.
18. [`platform/05-network-layer.md`](./platform/05-network-layer.md) — edge fns, streaming, TTS/STT, realtime.
19. [`platform/06-user-persona-journey.md`](./platform/06-user-persona-journey.md) — a day in the life.
20. [`ip/06-feature-inventory.md`](./ip/06-feature-inventory.md) — every user-facing page, briefly.
21. [`platform/07-scale-plan-100m-sessions.md`](./platform/07-scale-plan-100m-sessions.md) — audit of every metrics engine + the plan to hold 100M+ sessions / 1B+ step events.

---

## Tech stack

- **Frontend:** React 18 + Vite 5 + TypeScript + Tailwind v3 + shadcn/ui + XState + TanStack Query
- **State machines:** 10 XState machines (appEntry, dailyCycle, home, insights, journal, notifications, practice, session, settings, voice)
- **Backend:** ConsciousOS Cloud (managed Postgres + Auth + Storage + Edge Functions)
- **AI:** ConsciousOS AI Gateway (chat completions, embeddings, TTS, STT) + 105 edge functions
- **Mobile:** Capacitor wrapper (`capacitor.config.ts`) for iOS/Android
- **Content pipeline:** static libraries in `src/data/` (loops, ladders, masters, texts) hydrated by edge functions with user context

---

## Numbers as of this snapshot

- **105** edge functions
- **134** database migrations
- **10** XState machines
- **50+** top-level pages in `src/pages/`
- **~40** UI locales in `src/locales/`
- **22** consciousness bands (0–21)
- **400+** named loops in the catalog
- **30+** guide/master modes
- **7** canonical hero films (`src/data/heroFilms.ts`)

---

*This folder was compiled by reading the source. Every claim in the sub-files carries a
`file:line` reference so any engineer can verify it in one jump.*
