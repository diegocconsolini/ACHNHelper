-- Trading board (#110) — community item/villager trade listings.

CREATE TABLE IF NOT EXISTS trade_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  -- 'item' | 'villager' | 'diy' | 'material'
  category TEXT NOT NULL CHECK (category IN ('item', 'villager', 'diy', 'material')),
  -- 'offering' (have-want trade) | 'looking_for' (want-have trade)
  intent TEXT NOT NULL CHECK (intent IN ('offering', 'looking_for')),
  title TEXT NOT NULL CHECK (length(title) <= 80),
  description TEXT CHECK (length(description) <= 500),
  -- What they want in return (for offering) or what they're offering (for looking_for)
  trade_for TEXT CHECK (length(trade_for) <= 200),
  -- 'open' | 'pending' | 'completed' | 'cancelled'
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- FK lets the API route join with profiles!inner for island_name etc.
  CONSTRAINT trade_listings_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES profiles(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS trade_listings_status_idx ON trade_listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS trade_listings_user_idx ON trade_listings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS trade_listings_category_idx ON trade_listings(category, intent, status);
