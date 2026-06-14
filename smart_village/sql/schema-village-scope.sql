-- ============================================================
-- SQL Migration: เพิ่ม village_id ให้ตาราง village_resource
-- และ training_event เพื่อรองรับ scope filtering ตาม role
--
-- วิธีรัน: เปิด pgAdmin → Query Tool แล้ว paste ทั้งหมดนี้
-- ============================================================

-- 1. เพิ่ม village_id ใน village_resource (ถ้ายังไม่มี)
ALTER TABLE village_resource
    ADD COLUMN IF NOT EXISTS village_id INTEGER REFERENCES village(village_id);

-- 2. เพิ่ม village_id ใน training_event (ถ้ายังไม่มี)
ALTER TABLE training_event
    ADD COLUMN IF NOT EXISTS village_id INTEGER REFERENCES village(village_id);

-- ============================================================
-- Optional: อัปเดต records เดิมให้มี village_id
-- แก้ค่า <YOUR_VILLAGE_ID> ให้ตรงกับ village ที่ต้องการ
-- ============================================================
-- UPDATE village_resource SET village_id = <YOUR_VILLAGE_ID> WHERE village_id IS NULL;
-- UPDATE training_event   SET village_id = <YOUR_VILLAGE_ID> WHERE village_id IS NULL;

-- ============================================================
-- ตรวจสอบผลลัพธ์
-- ============================================================
SELECT 'village_resource' AS tbl, COUNT(*) AS total,
       COUNT(village_id) AS with_village_id FROM village_resource
UNION ALL
SELECT 'training_event', COUNT(*), COUNT(village_id) FROM training_event;
