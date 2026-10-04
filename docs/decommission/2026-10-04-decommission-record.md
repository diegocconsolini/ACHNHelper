# acnh-portal Decommission Record

**Date:** 2026-10-04
**Decided by:** Diego (owner)
**Reason:** Cost reduction. The Supabase organization was consolidated to a single project (audividi) and moved to the Free plan.

## What was removed

| Service | Removed | Verification |
|---|---|---|
| Vercel | Project `acnh-portal` (acnh-portal.vercel.app): deployments, aliases, env vars | URL returns 404 `DEPLOYMENT_NOT_FOUND` |
| Supabase | Project `acnh-portal` (ref `cyxxfikvyawetabqmiot`, us-east-1): database, auth, storage, functions | No longer listed in the organization |
| GitHub | This repo archived (read-only, visibility unchanged) | `isArchived: true` |

## What was kept

- **Code:** this repo (archived), plus a verified git bundle of every branch, the issues as JSON, and the uncommitted local diff, all in an encrypted offline archive kept by the owner.
- **Database export (taken before deletion, row counts verified table by table):** 14 tables, 7 data rows (5 `artifact_data`, 2 `profiles`), 0 auth users, no stored files, no Edge Functions. Export format: one JSON document with every table's rows plus columns, constraints, indexes, RLS flags, policies, functions, triggers, enums, extensions, grants and sequences.
- **Config:** Vercel project settings, env var names and pulled production env values, and local `.env*` files are in the encrypted archive only, never in git.

## Manual follow-ups (owner)

- [ ] If this app used Google/GitHub OAuth or a custom SMTP key (e.g. Resend), delete or revoke that client/key in the provider's console.
- [ ] Revoke any third-party API keys listed in the archived env files that were created only for this project.

## How to restore

1. Unarchive the repo (`gh repo unarchive diegocconsolini/ACHNHelper`) or clone the archived bundle.
2. Create a new Supabase project. Recreate the schema from the repo's migrations, or from the `columns`/`constraints`/`policies`/`functions` sections of the export, then load each table's rows from the export JSON.
3. Recreate the Vercel project, connect the repo, and restore the env vars from the archive with new Supabase URL and keys.
