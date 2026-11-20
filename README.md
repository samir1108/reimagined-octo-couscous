# HOPE — A companion for becoming.

HOPE is an AI-guided companion for consciousness development. It helps you see your patterns, choose your practices, and become who you're meant to be — one session at a time.

## Features

- **Dynamic daily themes** that evolve with your journey
- **120+ structured programs** across self-inquiry, pranayama, chakra work, shadow integration, and more
- **AI guide chat** with 60+ master voices adapted to your spiritual depth
- **Consciousness engine** that maps your progress across 100 dimensions
- **Mirror sessions** for self-reflection and loop detection
- **Enterprise wellness** for organizations
- **Multi-modal AI** — voice, text, and generative sessions
- **60+ languages** supported

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui + Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **AI**: Groq, Google Gemini, ElevenLabs, Deepgram
- **Mobile**: Capacitor (iOS + Android)
- **State**: XState + TanStack Query

## Getting Started

```sh
git clone <repo-url>
cd <repo-name>
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase and AI provider keys.

## Build

```sh
npm run build
npm run preview
```

## Test

```sh
npm test
```

## Quality gates

```sh
npm run check            # typecheck (ratcheted) + lint + unit tests
npm run typecheck        # fails only on NEW type errors
npm run lint             # must stay at 0 errors
npm run typecheck:strict # full backlog view
```

The type backlog is tracked in `docs/QUALITY_BASELINE.md`. Product direction
lives in `docs/WORLD_CLASS_ROADMAP.md`.

## License

Proprietary — all rights reserved.
