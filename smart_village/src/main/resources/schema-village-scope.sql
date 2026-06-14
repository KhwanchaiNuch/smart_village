-- เพิ่ม village_id ให้ village_resource และ training_event
ALTER TABLE village_resource ADD COLUMN IF NOT EXISTS village_id INTEGER REFERENCES village(village_id);
ALTER TABLE training_event   ADD COLUMN IF NOT EXISTS village_id INTEGER REFERENCES village(village_id);
