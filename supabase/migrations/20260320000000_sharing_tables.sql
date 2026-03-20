-- Friend Code Sharing System tables

-- Shared profiles (published to community directory)
CREATE TABLE IF NOT EXISTS shared_profiles (
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
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  favorited_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, favorited_user_id)
);

-- Blocked users
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  blocked_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id TEXT NOT NULL,
  reported_user_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shared_profiles_published ON shared_profiles(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_shared_profiles_last_active ON shared_profiles(last_active DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_favorited ON favorites(favorited_user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_user ON blocked_users(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status) WHERE status = 'pending';
