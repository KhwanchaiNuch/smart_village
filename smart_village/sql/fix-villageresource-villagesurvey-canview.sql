-- ============================================================
-- Fix: canView=false สำหรับ villageresource และ villagesurvey
-- ทุก role ที่มี record ใน role_menu สำหรับ 2 เมนูนี้
-- รัน Query Tool ใน pgAdmin บน DB smartvillage
-- ============================================================

UPDATE role_menu
SET can_view = true
WHERE menu_id IN (
    SELECT id FROM menu
    WHERE url IN ('/villageresource', '/villagesurvey')
)
AND can_view = false;

-- ตรวจสอบผล
SELECT
    r.name        AS role_name,
    m.url         AS menu_url,
    rm.can_view,
    rm.can_add,
    rm.can_edit,
    rm.can_delete
FROM role_menu rm
JOIN menu m ON m.id = rm.menu_id
JOIN role r ON r.id = rm.role_id
WHERE m.url IN ('/villageresource', '/villagesurvey')
ORDER BY r.name, m.url;
