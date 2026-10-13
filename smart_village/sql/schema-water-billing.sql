-- ============================================================
-- SQL Migration: ระบบจัดการค่าน้ำประปารายเดือน + ใบแจ้งหนี้/ใบเสร็จ
-- วิธีรัน: เปิด pgAdmin -> Query Tool แล้ว paste ทั้งหมดนี้
-- (ปลอดภัยที่จะรันซ้ำ: ใช้ IF NOT EXISTS / WHERE NOT EXISTS ทั้งหมด)
-- ============================================================

-- อัตราค่าน้ำ (เก็บประวัติ, village_id = NULL คืออัตรากลาง/ดีฟอลต์)
CREATE TABLE IF NOT EXISTS water_rate_setting (
    rate_id         SERIAL PRIMARY KEY,
    village_id      INTEGER REFERENCES village(village_id),
    rate_per_unit   NUMERIC(10,2) NOT NULL,
    effective_from  DATE NOT NULL,
    remark          TEXT,
    created_at      TIMESTAMP DEFAULT now()
);

-- ใบแจ้งหนี้ค่าน้ำรายเดือนต่อครัวเรือน
CREATE TABLE IF NOT EXISTS water_bill (
    bill_id           SERIAL PRIMARY KEY,
    household_id      INTEGER NOT NULL REFERENCES household(household_id),
    village_id        INTEGER REFERENCES village(village_id),
    billing_period    DATE NOT NULL,           -- เก็บเป็นวันที่ 1 ของเดือน เช่น 2026-08-01
    meter_no          VARCHAR(50),
    previous_reading  NUMERIC(12,2) NOT NULL DEFAULT 0,
    current_reading   NUMERIC(12,2) NOT NULL,
    units_used        NUMERIC(12,2) NOT NULL,
    rate_per_unit     NUMERIC(10,2) NOT NULL,
    amount            NUMERIC(12,2) NOT NULL,
    invoice_no        VARCHAR(50) UNIQUE,
    invoice_date      DATE,
    due_date          DATE,
    status            VARCHAR(20) NOT NULL DEFAULT 'UNPAID',  -- UNPAID / PAID
    remark            TEXT,
    created_by        BIGINT,
    created_at        TIMESTAMP DEFAULT now(),
    UNIQUE (household_id, billing_period)
);

-- การรับชำระ / ใบเสร็จ
CREATE TABLE IF NOT EXISTS water_payment (
    payment_id       SERIAL PRIMARY KEY,
    bill_id          INTEGER NOT NULL REFERENCES water_bill(bill_id),
    receipt_no       VARCHAR(50) UNIQUE,
    paid_amount      NUMERIC(12,2) NOT NULL,
    paid_date        DATE NOT NULL,
    payment_method   VARCHAR(50),   -- CASH / TRANSFER / OTHER
    received_by      BIGINT,
    remark           TEXT,
    created_at       TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_water_bill_household ON water_bill(household_id);
CREATE INDEX IF NOT EXISTS idx_water_bill_village_period ON water_bill(village_id, billing_period);
CREATE INDEX IF NOT EXISTS idx_water_payment_bill ON water_payment(bill_id);

-- เพิ่มเมนู "จัดการค่าน้ำประปา" และ "ตั้งค่าอัตราค่าน้ำ" ให้อัตโนมัติ (ถ้ายังไม่มี)
INSERT INTO menu (name, url, status)
SELECT 'จัดการค่าน้ำประปา', '/waterbilling', true
WHERE NOT EXISTS (SELECT 1 FROM menu WHERE url = '/waterbilling');

INSERT INTO menu (name, url, status)
SELECT 'ตั้งค่าอัตราค่าน้ำ', '/waterrate', true
WHERE NOT EXISTS (SELECT 1 FROM menu WHERE url = '/waterrate');

-- ตรวจสอบผลลัพธ์
SELECT 'water_rate_setting' AS tbl, COUNT(*) FROM water_rate_setting
UNION ALL
SELECT 'water_bill', COUNT(*) FROM water_bill
UNION ALL
SELECT 'water_payment', COUNT(*) FROM water_payment;
