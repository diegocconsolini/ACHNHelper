-- Stalk Market community price sharing (#104)
-- Stores user-submitted turnip prices that decay automatically — most-recent
-- entry per user wins, anything older than the current Sunday-week window is
-- purged on read.

CREATE TABLE IF NOT EXISTS turnip_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 9 AND price <= 999),
  -- 'buy' = Sunday Daisy Mae buying price; 'sell' = Mon-Sat Nook's Cranny selling price
  kind TEXT NOT NULL CHECK (kind IN ('buy', 'sell')),
  -- Half-day slot: 0=Sun (buy only), 1=Mon AM, 2=Mon PM, ..., 12=Sat PM
  slot INTEGER NOT NULL CHECK (slot >= 0 AND slot <= 12),
  -- Optional dodo for visiting; 5-char alnum
  dodo TEXT,
  -- Player-supplied note (queue rules, etc.)
  note TEXT,
  -- Week start (Sunday 00:00 UTC) the price belongs to
  week_start DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Most recent entry per (user, kind, slot) wins on conflict
  UNIQUE(user_id, kind, slot, week_start)
);

CREATE INDEX IF NOT EXISTS turnip_prices_week_idx ON turnip_prices(week_start, created_at DESC);
CREATE INDEX IF NOT EXISTS turnip_prices_kind_idx ON turnip_prices(kind, price DESC);
