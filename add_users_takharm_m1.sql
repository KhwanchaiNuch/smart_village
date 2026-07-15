-- ============================================================
--  เพิ่ม app_user สำหรับ ม.1 บ้านท่าข้าม ต.ท่าข้าม อ.ชนแดน จ.เพชรบูรณ์
--  รันแยกหลังจาก demo_takharm_m1_pg.sql แล้ว
-- ============================================================

DO $$
DECLARE
  v_province_id  INT;
  v_amphur_id    INT;
  v_tambon_id    INT;
  v_village_id   INT;
BEGIN

-- ดึง ID ที่มีอยู่แล้ว
SELECT province_id INTO v_province_id FROM province WHERE name_th = 'เพชรบูรณ์' LIMIT 1;
SELECT amphur_id   INTO v_amphur_id   FROM amphur   WHERE name_th = 'ชนแดน'   AND province_id = v_province_id LIMIT 1;
SELECT tambon_id   INTO v_tambon_id   FROM tambon   WHERE name_th = 'ท่าข้าม' AND amphur_id   = v_amphur_id   LIMIT 1;
SELECT village_id  INTO v_village_id  FROM village  WHERE moo = '1'           AND tambon_id   = v_tambon_id   LIMIT 1;

RAISE NOTICE 'province=% amphur=% tambon=% village=%',
  v_province_id, v_amphur_id, v_tambon_id, v_village_id;

-- ============================================================
--  รหัสผ่าน:
--   admin        → admin1234
--   phetchabun   → admin1234
--   chandane     → amphur1234
--   takharm_abt  → tambon1234
--   village_m1   → village1234
-- ============================================================

INSERT INTO app_user
  (username, password_hash, full_name, role_level, scope_id,
   province_id, amphur_id, tambon_id, is_active, created_at)
VALUES
  ('admin',
   '$2b$12$g.ydScir90LjMtDkN6j4F.h7Rn1X8bpaUqJThqkxV4LiCaec9C9j2',
   'ผู้ดูแลระบบ', 'ADMIN', NULL,
   NULL, NULL, NULL, true, NOW()),

  ('phetchabun',
   '$2b$12$g.ydScir90LjMtDkN6j4F.h7Rn1X8bpaUqJThqkxV4LiCaec9C9j2',
   'พัฒนาชุมชนจังหวัดเพชรบูรณ์', 'PROVINCE', v_province_id,
   v_province_id, NULL, NULL, true, NOW()),

  ('chandane',
   '$2b$12$iuO1A5qXSIp7jlfncNlqxuufGdz51wpLwKQCEvyfHbjzZwE80FxtO',
   'พัฒนาชุมชนอำเภอชนแดน', 'AMPHUR', v_amphur_id,
   v_province_id, v_amphur_id, NULL, true, NOW()),

  ('takharm_abt',
   '$2b$12$A0Wfq8WYyzOguJVVPNIN7O8oJ2hybXakyeiGWVKk1AfvWW3gJ6lZe',
   'อบต.ท่าข้าม', 'TAMBON', v_tambon_id,
   v_province_id, v_amphur_id, v_tambon_id, true, NOW()),

  ('village_m1',
   '$2b$12$la.vTDNnugZeshdZVwWCCO2AlZJijDzLntm9k7FMRYFV.he5ivw4K',
   'นายสมศักดิ์ วงษ์คำ (ผู้ใหญ่บ้าน ม.1)', 'VILLAGE', v_village_id,
   v_province_id, v_amphur_id, v_tambon_id, true, NOW())

ON CONFLICT (username) DO NOTHING;

RAISE NOTICE 'เพิ่ม app_user เสร็จแล้ว (village_id=%)', v_village_id;

END $$;
