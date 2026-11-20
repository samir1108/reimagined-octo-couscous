# Cloud → Codebase Inventory

Snapshot of **everything** that lives in the hosted backend, and where its
reversible copy now sits in this repo. Taken from a live inspection of the
project's database, storage, functions and config.

| Cloud thing | Amount | Where it lives in the repo |
| --- | --- | --- |
| Database schema (tables, RLS, functions, triggers, enums) | 15 public tables, 9 functions | `supabase/migrations/` — 150 timestamped SQL files |
| Database **rows** | ~2 rows total (1 profile, 1 credits row) — no seed/content data in the DB | nothing to export; app content is static TS under `src/data/` |
| Extensions | `plpgsql`, `pg_stat_statements`, `uuid-ossp`, `pgcrypto`, `supabase_vault` | enabled by the migrations |
| Cron jobs | none (`pg_cron` not installed) | — |
| Edge functions | 111 functions + `_shared/` | `supabase/functions/` |
| Edge function config (`verify_jwt`) | all 111 | `supabase/config.toml` (now declares every function explicitly) |
| Storage buckets | 1 bucket: `media` (currently private) | `supabase/migrations/..._media_storage_policies.sql` |
| Storage objects | 48 files, ~347 MB (videos + images) | manifest: `supabase/manifests/storage-media.json`; binaries pulled with `scripts/download-media.mjs` |
| Media URL pointers | 48 live `*.asset.json` (+426 dead legacy ones) | in-tree, repointable via `scripts/repoint-media.mjs` |
| Secrets | 13 names, values not exportable | names + purpose documented in `.env.example` and `SELF_HOSTING.md` |
| Auth config (providers, site URL, redirects) | email+password, Google | manual steps in `SELF_HOSTING.md` §5 — not exportable as code |

## Why the media binaries aren't committed

347 MB of MP4s in git would blow past publish limits (3 GiB unpacked / 50k
files) and make every clone painful. Instead they are **fully reproducible**:

```bash
# 1. pull the binaries out of the current bucket into the repo tree
SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/download-media.mjs https://<current-ref>.supabase.co

# 2. push them into YOUR project's `media` bucket
SUPABASE_SERVICE_ROLE_KEY=<your-key> node scripts/upload-media.mjs https://<your-ref>.supabase.co

# 3. repoint every *.asset.json at your project
node scripts/repoint-media.mjs https://<your-ref>.supabase.co media
```

The manifest records path, byte size, MIME type and MD5 etag for all 48
objects, so you can verify the copy is exact.

If you *do* want them in git, run step 1 and commit — nothing else changes.

## Full self-host walkthrough

See `SELF_HOSTING.md`.
