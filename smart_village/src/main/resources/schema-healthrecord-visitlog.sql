-- Idempotent schema fix for the health_record and visit_log features.
-- ddl-auto=none, so columns must match HealthRecord.java / VisitLog.java
-- (Hibernate maps camelCase fields -> snake_case columns).
-- Safe to run repeatedly: creates tables if missing and adds any missing columns.
-- Run against the smartvillage (public) database, e.g.:
--   psql "postgresql://smartvillageadmin@43.229.149.138:5432/smartvillage" -f schema-healthrecord-visitlog.sql

-- ---------- health_record ----------
CREATE TABLE IF NOT EXISTS health_record (
    id BIGSERIAL PRIMARY KEY
);
ALTER TABLE health_record ADD COLUMN IF NOT EXISTS person_id       BIGINT;
ALTER TABLE health_record ADD COLUMN IF NOT EXISTS check_date      DATE;
ALTER TABLE health_record ADD COLUMN IF NOT EXISTS bp              VARCHAR(20);
ALTER TABLE health_record ADD COLUMN IF NOT EXISTS sugar           NUMERIC(6,2);
ALTER TABLE health_record ADD COLUMN IF NOT EXISTS bmi             NUMERIC(5,2);
ALTER TABLE health_record ADD COLUMN IF NOT EXISTS risk_group      TEXT;
ALTER TABLE health_record ADD COLUMN IF NOT EXISTS need_home_visit BOOLEAN;
ALTER TABLE health_record ADD COLUMN IF NOT EXISTS remark          TEXT;

-- ---------- visit_log ----------
CREATE TABLE IF NOT EXISTS visit_log (
    id BIGSERIAL PRIMARY KEY
);
ALTER TABLE visit_log ADD COLUMN IF NOT EXISTS person_id    BIGINT;
ALTER TABLE visit_log ADD COLUMN IF NOT EXISTS household_id BIGINT;   -- the missing column from the 500 error
ALTER TABLE visit_log ADD COLUMN IF NOT EXISTS visit_date   DATE;
ALTER TABLE visit_log ADD COLUMN IF NOT EXISTS visitor      VARCHAR(150);
ALTER TABLE visit_log ADD COLUMN IF NOT EXISTS visit_reason VARCHAR(200);
ALTER TABLE visit_log ADD COLUMN IF NOT EXISTS summary      TEXT;
ALTER TABLE visit_log ADD COLUMN IF NOT EXISTS next_action  TEXT;
