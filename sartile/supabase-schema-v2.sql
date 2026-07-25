-- Run this in Supabase SQL Editor (Project → SQL Editor → New query)

-- 1. Add title column to brands
ALTER TABLE brands ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'My Brand';

-- 2. Drop the unique constraint on user_id so one user can have multiple brands
ALTER TABLE brands DROP CONSTRAINT IF EXISTS brands_user_id_key;

-- 3. Add brand_id to messages so each message belongs to a specific brand/chat
ALTER TABLE messages ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE CASCADE;

-- 4. Backfill brand_id for any existing messages (link to the user's existing brand)
UPDATE messages m
SET brand_id = b.id
FROM brands b
WHERE m.user_id = b.user_id
  AND m.brand_id IS NULL;

-- 5. Update RLS policy on messages to allow read/insert by brand ownership
DROP POLICY IF EXISTS "Users can read own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON messages;

CREATE POLICY "Users can read own messages"
  ON messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);
