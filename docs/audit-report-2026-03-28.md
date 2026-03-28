# ACNH Portal — Audit Report

**Date:** 2026-03-28
**Version:** 5.0.0
**Scope:** Security vulnerabilities, runtime bugs, code quality issues
**Method:** Static analysis of all API routes, auth config, and 32 artifact components

---

## Summary

| Severity | Security | Bugs | Total |
|----------|----------|------|-------|
| Critical | 0 | 2 | **2** |
| High | 3 | 4 | **7** |
| Medium | 3 | 4 | **7** |
| Low | 4 | 2 | **6** |
| **Total** | **10** | **12** | **22** |

---

## CRITICAL — Data Loss / Crash

### BUG-01: DIYRecipeTracker wipes learned recipes on every mount
- **File:** `src/artifacts/DIYRecipeTracker.jsx:43-55`
- **Impact:** All saved recipe progress is silently lost on page reload
- **Root cause:** The persist `useEffect` (line 44) fires on mount with the initial empty `Set()` before the load `useEffect` (line 24) resolves, writing `{ learned: [] }` to storage
- **Fix:** Add a `loaded` guard state; skip persist until load completes

### BUG-02: TurnipTracker — useState after conditional return (Rules of Hooks violation)
- **File:** `src/artifacts/TurnipTracker.jsx:389`
- **Impact:** React crash when transitioning from empty to populated price data
- **Root cause:** `useState(null)` for `hoveredPoint` is placed after `if (dataPoints.length === 0) return null;` at line 309. Hook count changes between renders, triggering React invariant error
- **Fix:** Move `useState` to top of `PriceGraph` component, before any early returns

---

## HIGH

### SEC-01: Report flood allows single user to unpublish any profile
- **File:** `app/api/community/report/route.js:57-68`
- **Impact:** One authenticated user can silence any other user by filing 5 reports — no duplicate-report check exists
- **Root cause:** No `(reporter_user_id, reported_user_id)` uniqueness constraint; auto-unpublish triggers at 5 pending reports regardless of source
- **Fix:** Add duplicate report check: `WHERE reporter_user_id = ? AND reported_user_id = ? AND status = 'pending'`

### SEC-02: No HTTP security headers configured
- **File:** `next.config.mjs`
- **Impact:** Missing CSP, X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy
- **Fix:** Add `headers()` export to `next.config.mjs` with all standard security headers

### SEC-03: File upload validates MIME from client-supplied Content-Type only
- **File:** `app/api/community/upload/route.js:46,62`
- **Impact:** Attacker can upload HTML/SVG as "image/jpeg" — no magic byte validation
- **Fix:** Read first 12 bytes of buffer and verify against JPEG/PNG/WebP magic bytes

### BUG-03: DailyRoutine streak never increments past 1
- **File:** `src/artifacts/DailyRoutine.jsx:76-114`
- **Impact:** Streak counter always shows 0 or 1, never tracks consecutive days
- **Root cause:** Save `useEffect` deps are `[tasks, notes, today]` but reads `streak`, `lastCompletedDate`, and `weeklyData` from stale closure (always initial values: 0, null, {})
- **Fix:** Add `streak`, `lastCompletedDate`, `weeklyData` to dependency array; also load `streak` from storage in the new-day branch

### BUG-04: GoldenToolTracker shallow copy mutation
- **File:** `src/artifacts/GoldenToolTracker.jsx:43-47`
- **Impact:** Direct state mutation via `newData[toolKey][field] = value` — can cause missed re-renders in StrictMode
- **Root cause:** `{ ...toolsData }` is a shallow copy; nested objects share the same reference
- **Fix:** Deep copy the nested key: `{ ...toolsData, [toolKey]: { ...toolsData[toolKey], [field]: value } }`

### BUG-05: HHACalculator stale itemCache on rapid adds
- **File:** `src/artifacts/HHACalculator.jsx:251-259`
- **Impact:** Adding two items quickly causes first item's HHA base points to be lost on reload (cache overwritten)
- **Root cause:** `addItem` captures `itemCache` in closure; async fetch + setState means second call uses stale cache
- **Fix:** Build `newCache` before calling `setItemCache` and pass to `saveData`

### BUG-06: CatalogTracker colorFilter declared but never applied
- **File:** `src/artifacts/CatalogTracker.jsx:29,135-138`
- **Impact:** Color filter UI has no effect — filtering logic only checks `searchTerm`
- **Fix:** Add `colorFilter` check to `filteredItems` computation

---

## MEDIUM

### SEC-04: Account deletion leaves orphaned data (GDPR gap)
- **File:** `app/api/user/route.js:34-35`
- **Impact:** `DELETE /api/user` only removes `artifact_data` and `profiles`; leaves `shared_profiles`, `favorites`, `blocked_users`, `reports`, `friend_requests` intact
- **Fix:** Add cascade deletes for all 5 remaining tables scoped to `user_id`

### SEC-05: Unbounded sync payload + client-controlled timestamp
- **File:** `app/api/sync/[artifactKey]/route.js:52-64`
- **Impact:** No size limit on artifact data payload; `updatedAt` accepted from client verbatim
- **Fix:** Cap payload at 512KB; always use server-generated `updated_at`

### SEC-06: No session maxAge configured
- **File:** `auth.ts`
- **Impact:** JWT tokens never expire — sessions persist indefinitely unless user signs out or AUTH_SECRET rotates
- **Fix:** Add `session: { maxAge: 30 * 24 * 60 * 60 }` to NextAuth config

### BUG-07: MaterialCalculator duplicate recent searches (stale closure)
- **File:** `src/artifacts/MaterialCalculator.jsx:164-200`
- **Impact:** Rapid repeated searches can produce duplicate entries in recent searches list
- **Root cause:** `useCallback` captures stale `recentSearches`; dedup filter works against old list
- **Fix:** Use functional updater `setRecentSearches(prev => ...)` and remove `recentSearches` from deps

### BUG-08: NookMilesTracker missing "Resort Hotel" category filter
- **File:** `src/artifacts/NookMilesTracker.jsx:156-160`
- **Impact:** 3 achievements (ids 97-99, v3.0 content) unreachable via category filter
- **Fix:** Add `"Resort Hotel"` to `CATEGORIES` array and `CATEGORY_EMOJI`

### BUG-09: SeasonalEventCalendar NPC visit date input is decorative
- **File:** `src/artifacts/SeasonalEventCalendar.jsx:453-458`
- **Impact:** Selected date in NPC tab is ignored; visits always logged with current date
- **Fix:** Wire date input to state and pass selected date to visit logging

### BUG-10: CelesteMeteorTracker stale wishes count on rapid submit
- **File:** `src/artifacts/CelesteMeteorTracker.jsx:149-150`
- **Impact:** Double-clicking wish submit can lose one increment
- **Fix:** Use functional updater `setWishes(prev => prev + count)`

---

## LOW

### SEC-07: Nookipedia proxy forwards arbitrary paths without allowlist
- **File:** `app/api/nookipedia/[...path]/route.js:17-23`
- **Impact:** Anonymous users can proxy any path on api.nookipedia.com using the app's API key
- **Fix:** Add path prefix allowlist (`/nh/`, `/villagers`)

### SEC-08: Favorites endpoint leaks friend_code for banned/unpublished users
- **File:** `app/api/community/favorites/route.js:44-67`
- **Impact:** Banned users' friend codes remain visible to anyone who favorited them
- **Fix:** Filter out `is_published: false` and `is_banned: true` profiles

### SEC-09: Community blocked_users filter uses string interpolation
- **File:** `app/api/community/route.js:84`
- **Impact:** `blockedUserIds.join(',')` interpolated into Supabase `.not()` filter — low risk since IDs come from DB, but unsafe pattern
- **Fix:** Validate IDs as UUIDs before interpolation, or use array parameter form

### SEC-10: Public storage bucket with guessable paths
- **File:** `app/api/community/upload/route.js:18-21,63`
- **Impact:** Uploaded screenshots at `{user_id}/{timestamp}.{ext}` — predictable URLs
- **Fix:** Use UUIDs for filenames or private bucket with signed URLs

### BUG-11: Sidebar displays "30 tools" instead of 32
- **File:** `src/App.jsx:413`
- **Impact:** Incorrect tool count in sidebar footer
- **Fix:** Change to `32 tools`

### BUG-12: PhotoPosterTracker ProgressRing defined inside component body
- **File:** `src/artifacts/PhotoPosterTracker.jsx:145-168`
- **Impact:** Progress ring animations never play — component unmounts/remounts on every state change due to new function reference
- **Fix:** Move `ProgressRing` to module scope

---

## Passed Checks

- [x] No hardcoded secrets or API keys in source
- [x] `.env.local` not tracked by git
- [x] Service role key server-side only (`lib/supabase.js`)
- [x] All admin routes gated by `requireAdmin()` with audit logging
- [x] All authenticated routes check `session?.user?.id`
- [x] Profile updates use field allowlist (no mass assignment)
- [x] Sync route validates artifact key against allowlist
- [x] Community publish validates tags server-side
- [x] Self-report/block/favorite prevention in place
- [x] Bio profanity filtering via `obscenity` library
- [x] Banned users blocked from publishing
- [x] No eval, command injection, or SQL injection vectors
- [x] Google OAuth is sole auth provider — no password attack surface
- [x] IDOR protected — all queries scope to session user ID

---

## Recommended Fix Priority

**Immediate (data loss / crash):**
1. BUG-01 — DIYRecipeTracker data wipe
2. BUG-02 — TurnipTracker hooks violation crash
3. SEC-01 — Report flood abuse vector

**This sprint:**
4. SEC-02 — Security headers
5. SEC-03 — Upload magic byte validation
6. BUG-03 — DailyRoutine streak
7. SEC-04 — GDPR account deletion
8. BUG-04 — GoldenToolTracker mutation
9. BUG-05 — HHACalculator stale cache
10. SEC-06 — Session maxAge

**Next sprint:**
11-22. Remaining medium/low issues
