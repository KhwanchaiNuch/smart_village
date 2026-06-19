-- ============================================================
-- Fix: เพิ่มคอลัมน์ที่ขาดหายใน community_issue
-- entity มี villageId และ imageUrl แต่ตาราง DB ยังไม่มี
-- Safe to run repeatedly (IF NOT EXISTS)
-- Run in pgAdmin Query Tool against smartvillage DB
-- ============================================================

ALTER TABLE community_issue ADD COLUMN IF NOT EXISTS village_id  INTEGER;
ALTER TABLE community_issue ADD COLUMN IF NOT EXISTS image_url   TEXT;

-- ตรวจสอบผลลัพธ์
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'community_issue'
ORDER BY ordinal_position;
