-- ============================================================
-- LevelzCut Employee App — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Prices per employee per service type
CREATE TABLE IF NOT EXISTS employee_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('cabelo', 'combo', 'barba', 'premium')),
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, service_type)
);

-- Daily entries per employee
CREATE TABLE IF NOT EXISTS employee_daily_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  day INTEGER NOT NULL,
  cabelo INTEGER NOT NULL DEFAULT 0,
  combo INTEGER NOT NULL DEFAULT 0,
  barba INTEGER NOT NULL DEFAULT 0,
  premium INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, year, month, day)
);

-- Row Level Security
ALTER TABLE employee_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_daily_entries ENABLE ROW LEVEL SECURITY;

-- Each user can only read/write their own rows
CREATE POLICY "employee_prices_self"
  ON employee_prices FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "employee_daily_entries_self"
  ON employee_daily_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Test users (run AFTER creating tables)
-- Creates user1@levelzcut.internal / pwd123
--         user2@levelzcut.internal / pwd123
-- ============================================================
-- NOTE: Supabase Auth does not allow creating users via SQL.
-- Use the Supabase dashboard → Authentication → Users → Add user
-- or use the Admin API. See README below.
--
-- Dashboard path:
--   Authentication → Users → "Add user" → Invite user (or Create new user)
--   Email:    user1@levelzcut.internal
--   Password: pwd123
--   (repeat for user2)
-- ============================================================
