# Friend Code Sharing — Phase 1: Database + API Foundation

**Issue:** #39 — Friend Code & Dream Address sharing system
**Phase:** 1 of 5
**Date:** 2026-03-20
**Status:** Approved

---

## Scope

Create the database tables, API endpoints, and text moderation middleware for the sharing system. No UI in this phase — just the backend foundation.

## Database Schema

### Migration: `supabase/migrations/20260320000000_sharing_tables.sql`

```sql
-- Shared profiles (published to community directory)
CREATE TABLE shared_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  is_published BOOLEAN DEFAULT false,
  show_friend_code BOOLEAN DEFAULT false,
  consent_given_at TIMESTAMPTZ,
  theme_tags TEXT[] DEFAULT '{}',
  looking_for TEXT[] DEFAULT '{}',
  bio TEXT,
  screenshots TEXT[] DEFAULT '{}',
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites (one-way bookmarking)
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  favorited_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, favorited_user_id)
);

-- Blocked users
CREATE TABLE blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  blocked_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id TEXT NOT NULL,
  reported_user_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_shared_profiles_published ON shared_profiles(is_published) WHERE is_published = true;
CREATE INDEX idx_shared_profiles_last_active ON shared_profiles(last_active DESC);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_favorited ON favorites(favorited_user_id);
CREATE INDEX idx_blocked_user ON blocked_users(user_id);
CREATE INDEX idx_reports_status ON reports(status) WHERE status = 'pending';
```

## API Endpoints

### `app/api/community/route.js` — Browse directory
- `GET /api/community` — Public. Returns published profiles joined with `profiles` table data.
- Query params: `hemisphere`, `fruit`, `flower`, `rating`, `tag`, `lookingFor`, `page`, `limit`
- Excludes blocked users for authenticated requesters
- Returns: array of profile cards (island name, hemisphere, fruit, flower, rating, tags, dream address, screenshot thumbnails, last_active)
- Friend code ONLY included if requester is authenticated AND profile has `show_friend_code: true`

### `app/api/community/publish/route.js` — Publish/update/unpublish
- `POST` — Publish profile to directory. Requires auth + consent.
- `PUT` — Update listing (tags, bio, screenshots). Requires auth.
- `DELETE` — Unpublish (remove from directory). Requires auth.
- Bio text run through `obscenity` profanity filter before saving.

### `app/api/community/favorite/[userId]/route.js` — Favorites
- `POST` — Add to favorites. Requires auth.
- `DELETE` — Remove from favorites. Requires auth.

### `app/api/community/favorites/route.js` — List favorites
- `GET` — Returns user's favorited profiles. Requires auth.

### `app/api/community/block/[userId]/route.js` — Block
- `POST` — Block user. Requires auth.
- `DELETE` — Unblock. Requires auth.

### `app/api/community/report/route.js` — Report
- `POST` — Report a profile. Requires auth. Body: `{ reportedUserId, reason, details }`.
- Reasons: `inappropriate_content`, `spam`, `harassment`, `fake_info`, `other`

## Text Moderation

### Install: `npm install obscenity`

### Middleware: `lib/moderation.js`
```js
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity';

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

export function containsProfanity(text) {
  return matcher.hasMatch(text);
}

export function censorText(text) {
  // Returns text with profanity replaced by asterisks
  const matches = matcher.getAllMatches(text);
  // ... censoring logic
  return censored;
}
```

Applied to: bio text, theme tags (custom text), looking_for tags (custom text).

## Validation Rules

- `bio`: max 200 chars, profanity filtered
- `theme_tags`: max 5 tags, each max 20 chars, from predefined list + custom
- `looking_for`: max 3 tags, from predefined list
- `screenshots`: max 5 URLs, must be Cloudinary URLs (validated in Phase 4)
- `show_friend_code`: boolean, requires `consent_given_at` to be set

## Predefined Tag Lists

```js
const THEME_TAGS = [
  'cottagecore', 'urban', 'japanese', 'natural', 'spooky',
  'fairycore', 'tropical', 'medieval', 'modern', 'rustic',
  'zen', 'carnival', 'space', 'underwater', 'forest'
];

const LOOKING_FOR_TAGS = [
  'friends', 'trading', 'flower-watering', 'island-tours',
  'cataloging', 'fishing-buddies', 'just-visiting'
];
```

## Files to create
- `supabase/migrations/20260320000000_sharing_tables.sql`
- `lib/moderation.js`
- `app/api/community/route.js`
- `app/api/community/publish/route.js`
- `app/api/community/favorite/[userId]/route.js`
- `app/api/community/favorites/route.js`
- `app/api/community/block/[userId]/route.js`
- `app/api/community/report/route.js`

## No UI in this phase
Phase 2 builds the public `/community` page. Phase 3 adds the portal tool.
