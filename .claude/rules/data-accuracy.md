# Data Accuracy Rules

## ZERO TOLERANCE for Fabricated Data
NEVER fabricate, invent, guess, or hallucinate any game data. Every item name, price, date, recipe, villager, stat, and description MUST come from verified real sources.

## Verification Hierarchy
1. `ACNH-Helper-Suite/data/*.js` — Verified local data files
2. `public/assets-web/manifest.json` — Datamined game file names
3. Nookipedia API (`/api/nookipedia/` proxy) — Community-verified data
4. Game8 / GameWith — Secondary references

## Nookipedia API
- Full reference: `docs/nookipedia-api-reference.md`
- Auth: `X-API-KEY` header + `Accept-Version: 1.7.0`
- Key stored in Keychain, `.env.local`, and Vercel as `NOOKIPEDIA_API_KEY`
- Proxy route: `/api/nookipedia/[...path]` (caches 1 hour, keeps key server-side)

## Before Adding Game Data
1. Check manifest.json for the item name
2. Cross-reference with Nookipedia API
3. If you can't verify it, DON'T include it
