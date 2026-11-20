# Self-Hosting on Your Own Supabase

Everything the app needs — schema, edge functions, and media — now lives in this
repository or in your own Supabase project. No ConsciousOS-only resources are
required at runtime.

---

## 1. Database schema

All schema lives in `supabase/migrations/` (150 timestamped SQL files, schema
only — no user rows).

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

This creates every table, enum, RLS policy, function, and trigger.

---

## 2. Media (videos & images)

Media is stored in a Supabase Storage bucket named **`media`**, with file paths
mirroring the repo layout (e.g. `src/assets/wwb/bands.mp4`).

Each media file is referenced through a small JSON pointer next to where the
binary would live, e.g. `src/assets/wwb/bands.mp4.asset.json`:

```json
{
  "storage_path": "src/assets/wwb/bands.mp4",
  "bucket": "media",
  "url": "https://<project>.supabase.co/storage/v1/object/public/media/src/assets/wwb/bands.mp4"
}
```

Application code imports the pointer and reads `.url`, so switching projects is
a one-command operation.

### Moving media to your own project

The whole media library can be migrated with one command. It downloads every
original from wherever it currently lives, uploads it to the `media` bucket at
the same path, rewrites the pointer, and verifies the public URL:

```bash
node scripts/migrate-cdn-to-supabase.mjs
```

Useful flags:

| Flag | What it does |
| --- | --- |
| `--dry-run` | List what would move, touch nothing |
| `--filter "src/assets/videos/"` | Only migrate one folder |
| `--limit 10` | Migrate the first N files (for a smoke test) |
| `--reupload` | Revisit already-migrated files to refresh their cache headers |

Downloads are cached under `media-cache/` (git-ignored), so an interrupted run
resumes for free. The script is idempotent: anything already pointing at the
target base URL is skipped.

After migrating, regenerate the runtime lookup table:

```bash
node scripts/generate-asset-manifest.mjs
```

To check what is still on a third-party CDN:

```bash
node scripts/audit-cdn-scope.mjs
```

### Object size limit

The bucket's per-object limit is fixed by the project plan (50 MB here). The
migration script re-encodes anything larger with ffmpeg — H.264/AAC, `+faststart`
— so the file that ships is smaller and still plays everywhere. The pointer is
flagged with `"transcoded": true` when this happens.

### Cache headers

Supabase's public object endpoint answers with `cache-control: no-cache` and a
strong `ETag`, so browsers revalidate instead of blindly re-downloading. That
is a property of the platform, not of the upload call.

### Storage RLS

The migration `..._media_storage_policies.sql` adds:

- public read for `bucket_id = 'media'`
- insert / update / delete restricted to authenticated users

> **Note:** this workspace currently blocks *public* buckets, so `media` was
> created private. Public read only works once the bucket itself is public —
> enable it in **Settings → Privacy & Security**, or on your own Supabase
> project simply mark the bucket public at creation.

### Legacy pointers

426 `*.asset.json` files under `content/`, `src/assets/paths/`, `src/assets/v000/`,
`src/games/assets/`, `src/assets/programs/`, and `src/assets/handbooks/` were
copied in from *other* ConsciousOS projects and their CDN objects are **already
unreachable (HTTP 404)**. They carry no `storage_path` and are skipped by the
repoint script. Either delete them or re-generate the media.

---

## 3. Edge functions

111 functions live in `supabase/functions/`. Shared code is in
`supabase/functions/_shared/`.

```bash
supabase functions deploy --project-ref <your-project-ref>
```

### Required secrets

Set with `supabase secrets set NAME=value`.

**Injected automatically by Supabase** (do not set manually):
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

**AI providers** — at least one required:

| Secret | Used for |
| --- | --- |
| `CONSCIOUSOS_API_KEY` | ConsciousOS AI Gateway (replace with your own provider if self-hosting) |
| `GROQ_API_KEY` | Fast chat completions |
| `GEMINI_API_KEY` | Embeddings + long-term memory |

**Voice / speech:**

| Secret | Used for |
| --- | --- |
| `DEEPGRAM_API_KEY` | Speech-to-text |
| `ELEVENLABS_API_KEY`, `ELEVENLABS_API_KEY_1`, `ELEVENLABS_CUSTOM_KEY` | Text-to-speech voices |

**Payments:**

| Secret | Used for |
| --- | --- |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Checkout + verification |
| `PAYMENT_MODE` | `test` or `live` |

**Scheduled jobs:**

| Secret | Used for |
| --- | --- |
| `CRON_SECRET` | Shared token guarding cron-invoked functions (`detect-silence`, `detect-contradictions`, `generate-higher-self-letter`) |

**Optional integrations** (features degrade gracefully if absent):
`GITHUB_TOKEN`, `GOOGLE_CALENDAR_API_KEY`, `GOOGLE_MAIL_API_KEY`,
`MICROSOFT_OUTLOOK_API_KEY`, `MICROSOFT_TEAMS_API_KEY`, `SLACK_API_KEY`,
`LINEAR_API_KEY`

**Migration-only** (safe to delete after media is moved):
`ASSET_MIGRATION_TOKEN` — guards `supabase/functions/migrate-cdn-assets`.

---

## 4. Frontend environment

`.env` at the project root:

```
VITE_SUPABASE_URL=https://<your-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your anon/publishable key>
VITE_SUPABASE_PROJECT_ID=<your-ref>
```

Then:

```bash
bun install
bun run build
```

---

## 5. Auth

Enable in **Authentication → Providers**:

- Email + password
- Google (add your OAuth client ID/secret and redirect URL)

Set **Site URL** and **Redirect URLs** to your deployed domain.
