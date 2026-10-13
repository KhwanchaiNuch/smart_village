-- ============================================================
-- ให้สิทธิ์เมนู "จัดการค่าน้ำประปา" (/waterbilling) และ "ตั้งค่าอัตราค่าน้ำ" (/waterrate)
-- แก่ role ADMIN และ VILLAGE แบบเต็มสิทธิ์ (view/add/edit/delete)
-- วิธีรัน: เปิด pgAdmin -> Query Tool แล้ว paste ทั้งหมดนี้
-- (ปลอดภัยที่จะรันซ้ำ: ใช้ WHERE NOT EXISTS)
-- ============================================================

INSERT INTO role_menu (role_id, menu_id, can_view, can_add, can_edit, can_delete)
SELECT r.role_id, m.menu_id, true, true, true, true
FROM (VALUES (1), (3)) AS r(role_id)
CROSS JOIN (VALUES (12), (13)) AS m(menu_id)
WHERE NOT EXISTS (
    SELECT 1 FROM role_menu rm
    WHERE rm.role_id = r.role_id AND rm.menu_id = m.menu_id
);

-- ตรวจสอบผลลัพธ์
SELECT * FROM role_menu WHERE menu_id IN (12, 13) ORDER BY role_id, menu_id;
