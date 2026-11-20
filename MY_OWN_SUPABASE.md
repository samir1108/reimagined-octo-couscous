# Move to your own Supabase — checklist

Everything the app needs is in this repo. Nothing ConsciousOS-only is required at
runtime. Follow the steps in order.

---

## 0. What you need

| Thing | Why |
| --- | --- |
| A Supabase project (free tier is fine) | database, auth, storage, edge functions |
| Supabase CLI (`brew install supabase/tap/supabase`) | pushing schema + functions |
| Node 18+ / Bun | building the frontend, running the media scripts |
| API keys: Groq, Deepgram, Razorpay (+ optional Gemini, ElevenLabs) | AI, voice, payments |
| Google OAuth client (id + secret) | Google sign-in |

---

## 1. Media (videos + images)

There are three classes of media. Take all three.

### 1a. Already in the repo — 415 files, ~130 MB
Hero images, experience/showroom stills, master portraits, game covers,
program art, fonts, audio. These are real binaries committed under `src/`,
`public/`, `content/`. Nothing to do — they ship with the repo. A standalone
copy is also packaged as `consciousos-repo-media.zip`.

### 1b. Everything else — now on our own Supabase — 364 files, ~3.1 GB ✅ DONE

Every remaining asset used to point at a third-party Lovable preview host
(`id-preview--*.lovable.app`). All 364 were moved into the public `media`
bucket of this project on 2026-10-20:

```bash
node scripts/migrate-cdn-to-supabase.mjs
```

The script downloads each original, uploads it to `media` at the same repo
path, rewrites the pointer to the public Supabase URL, records
`storage_path` / `migrated_at` / `migrated_from`, and verifies the result.
Four films over the 50 MB object limit were re-encoded with ffmpeg on the way
in (flagged `"transcoded": true`).

- Runtime lookup table: `public/asset-manifest.json` (regenerate with
  `node scripts/generate-asset-manifest.mjs`).
- Bucket inventory: `supabase/manifests/storage-media.json`.
- Host census: `supabase/manifests/media-status.json`.
- Local copy of every original: `media-cache/` (git-ignored).
- Check nothing broke: `node scripts/verify-media-points.mjs`.

### 1c. Dead pointers — 426 files, NOT recoverable
`supabase/manifests/missing-media.json` lists every one: pointer path, the
filename the code expects, size, type, grouped by folder. Biggest groups:

| Group | Count |
| --- | --- |
| `src/games/assets/videos` | 58 |
| `src/assets/programs/videos` | 27 |
| `src/assets/videos` (hero) | 25 |
| `src/assets/narration/*` | 118 |
| `src/assets/films/*` | 63 |
| `content/wave*` clips | 47 |
| rest (practices, paths, showroom, founder, v000, sensorial) | 88 |

Their CDN objects were uploaded by *other* ConsciousOS projects and now return
HTTP 404. To restore one: regenerate or supply the file, drop it at the
`expected_file` path, then run `consciousos-assets create` (or point the
`.asset.json` `url` at your own bucket via `scripts/repoint-media.mjs`).

Every registry that reads these degrades gracefully — `CardMedia` falls back
to the image, `getGameVideo`/`getHeroImage` fall back to covers — so the app
runs with them missing.

Re-check liveness at any time:

```bash
node scripts/check-media.mjs                       # against ConsciousOS CDN
node scripts/check-media.mjs https://<your-ref>.supabase.co   # after migrating
```

Latest run: **0/474 pointers alive on the ConsciousOS CDN** — the 48 from §1b now
live only in the `media` bucket (and in the zip), so they only come back alive
once you upload them (step 3) and run `scripts/repoint-media.mjs`. Report is
saved to `supabase/manifests/media-status.json`.



---

## 2. Create the project + push the schema

```bash
supabase link --project-ref <your-ref>
supabase db push          # 150 migrations: 15 tables, RLS, 9 functions, triggers
```

No data to migrate — the cloud DB holds ~2 rows (one profile, one credits row).
All app content is static TypeScript under `src/data/`.

---

## 3. Storage

1. In your project create a bucket named **`media`** and mark it **public**
   (ConsciousOS's workspace blocks public buckets; your own project does not).
2. Upload the files you unzipped in step 1:

```bash
SUPABASE_SERVICE_ROLE_KEY=<your-key> node scripts/upload-media.mjs https://<your-ref>.supabase.co
```

3. Repoint every pointer file at your project:

```bash
node scripts/repoint-media.mjs https://<your-ref>.supabase.co media
```

---

## 4. Edge functions

```bash
supabase functions deploy --project-ref <your-ref>   # 112 functions
```

Then set the secrets (`supabase secrets set NAME=value`). Full list with
purpose in `SELF_HOSTING.md` §3 and `.env.example`. Minimum to boot:

```
GROQ_API_KEY, DEEPGRAM_API_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, PAYMENT_MODE=test, CRON_SECRET
```

`CONSCIOUSOS_API_KEY` only works inside ConsciousOS — replace those calls with your own
provider key (Groq/Gemini/OpenAI) or keep Groq as the sole model source.

`supabase/functions/media-export` is a **temporary** export helper — delete it
once the media is on your side.

---

## 5. Auth

Authentication → Providers: enable **Email + password** and **Google** (paste
your OAuth client id/secret). Set **Site URL** and **Redirect URLs** to your
deployed domain.

---

## 6. Frontend

`.env` at the repo root:

```
VITE_SUPABASE_URL=https://<your-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your anon/publishable key>
VITE_SUPABASE_PROJECT_ID=<your-ref>
```

```bash
bun install && bun run build
```

Deploy `dist/` anywhere (Vercel, Netlify, Cloudflare Pages, your own nginx).

---

## 7. Verify

- [ ] sign up + log in (email and Google)
- [ ] Home loads, videos play (bucket public + pointers repointed)
- [ ] Guide chat replies (Groq key set)
- [ ] voice input transcribes (Deepgram key set)
- [ ] Razorpay checkout in test mode credits the account

See `CLOUD_INVENTORY.md` for the exact cloud → repo mapping.
