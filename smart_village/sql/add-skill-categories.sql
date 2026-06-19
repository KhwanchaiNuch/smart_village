-- Structured Tagging สำหรับ recommendation
-- เก็บเป็น comma-separated ของ issue types ที่ช่วยได้
-- เช่น "สุขภาพ,สังคม/ความปลอดภัย"

ALTER TABLE person_skill
    ADD COLUMN IF NOT EXISTS skill_categories TEXT;

ALTER TABLE village_resource
    ADD COLUMN IF NOT EXISTS resource_categories TEXT;
