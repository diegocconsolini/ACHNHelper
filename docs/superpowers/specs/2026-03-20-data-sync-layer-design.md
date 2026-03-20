# Data Sync Layer — Design Spec

**Issue:** #33 — Data sync layer (localStorage ↔ cloud)
**Date:** 2026-03-20
**Status:** Approved

---

## Architecture

SyncManager React component wraps the app inside SessionProvider. Detects login via useSession(), downloads cloud data on login, intercepts window.storage.set() to queue background syncs.

```
SessionProvider
  └── SyncManager          ← detects auth, manages sync
        └── App            ← existing portal (unchanged)
```

## Decisions

- **Auth detection:** SyncManager uses useSession() (inside SessionProvider)
- **Conflict resolution:** Cloud wins — download overwrites localStorage
- **Sync direction:** Bidirectional (download on login, upload on save)
- **Debounce:** Max 1 sync per key per 5 seconds
- **Artifacts unchanged:** Keep using window.storage as-is

## SyncManager behavior

### Guest (not logged in)
- Does nothing. window.storage = localStorage only.

### Logged-in user

**On login (session becomes 'authenticated'):**
1. Check localStorage for `sync-initialized-{userId}` flag
2. If NOT initialized: fetch all 23 keys from `/api/sync/:key`, write to localStorage
3. Set `sync-initialized-{userId}` flag
4. Monkey-patch `window.storage.set()` to also queue cloud sync

**On every window.storage.set() call (while logged in):**
1. Original localStorage write happens immediately (existing behavior)
2. Queue the key for cloud sync (debounced 5 seconds)
3. When debounce fires: `PUT /api/sync/:key` with `{ data: value, updatedAt: now }`

**On logout:**
- Remove monkey-patch, restore original window.storage.set()
- Keep localStorage data (user can still use as guest)

## Files

- Create: `src/SyncManager.jsx` — sync logic
- Modify: `app/app/page.jsx` — wrap App in SyncManager
- Modify: `src/App.jsx` — show sync status indicator

## Sync status

Exposed via `window.__syncStatus` (simple global):
- `'idle'` — not syncing
- `'syncing'` — upload in progress
- `'synced'` — last sync successful
- `'error'` — last sync failed
- `null` — not logged in (guest)

App.jsx reads this to show indicator below user avatar.
