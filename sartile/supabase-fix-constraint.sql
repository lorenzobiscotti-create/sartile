-- Run this in Supabase SQL Editor to reliably drop the unique constraint on brands.user_id
-- (works regardless of what the constraint is named)

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT c.conname
    FROM pg_constraint c
    WHERE c.conrelid = 'brands'::regclass
      AND c.contype = 'u'
      AND c.conkey @> ARRAY[(
        SELECT attnum FROM pg_attribute
        WHERE attrelid = 'brands'::regclass AND attname = 'user_id'
      )]::smallint[]
  ) LOOP
    EXECUTE 'ALTER TABLE brands DROP CONSTRAINT ' || quote_ident(r.conname);
    RAISE NOTICE 'Dropped constraint: %', r.conname;
  END LOOP;
END $$;
