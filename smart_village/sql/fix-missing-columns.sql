-- ============================================================
-- Fix: Missing columns in household and community_issue tables
-- Safe to run repeatedly (IF NOT EXISTS / DO blocks)
-- Run in pgAdmin Query Tool against smartvillage DB
-- ============================================================

-- 1. household: add house_image_url (missing column)
ALTER TABLE household ADD COLUMN IF NOT EXISTS house_image_url TEXT;

-- 2. community_issue: add village_id and image_url (missing columns)
ALTER TABLE community_issue ADD COLUMN IF NOT EXISTS village_id INTEGER;
ALTER TABLE community_issue ADD COLUMN IF NOT EXISTS image_url  TEXT;

-- 3. household: fix gps_lat/gps_lng if still VARCHAR
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'household'
          AND column_name = 'gps_lat'
          AND data_type = 'character varying'
    ) THEN
        ALTER TABLE household ALTER COLUMN gps_lat TYPE NUMERIC(10,6) USING gps_lat::NUMERIC;
        ALTER TABLE household ALTER COLUMN gps_lng TYPE NUMERIC(10,6) USING gps_lng::NUMERIC;
    END IF;
END
$$;

-- 4. Verify
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('household','community_issue')
  AND column_name IN ('house_image_url','village_id','image_url','gps_lat','gps_lng')
ORDER BY table_name, column_name;