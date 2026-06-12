-- Safe to run repeatedly: adds any missing columns to person and household tables.
-- Run against smartvillage DB:
--   psql "postgresql://smartvillageadmin:PASSWORD@localhost:5432/smartvillage" -f schema-person-household.sql

-- ---------- person ----------
ALTER TABLE person ADD COLUMN IF NOT EXISTS cid                       VARCHAR(13);
ALTER TABLE person ADD COLUMN IF NOT EXISTS title                     VARCHAR(50);
ALTER TABLE person ADD COLUMN IF NOT EXISTS gender                    VARCHAR(10);
ALTER TABLE person ADD COLUMN IF NOT EXISTS birth_date                DATE;
ALTER TABLE person ADD COLUMN IF NOT EXISTS age                       INTEGER;
ALTER TABLE person ADD COLUMN IF NOT EXISTS marital_status            VARCHAR(50);
ALTER TABLE person ADD COLUMN IF NOT EXISTS education_level           VARCHAR(100);
ALTER TABLE person ADD COLUMN IF NOT EXISTS is_registered_in_village  BOOLEAN;
ALTER TABLE person ADD COLUMN IF NOT EXISTS is_living_in_village      BOOLEAN;
ALTER TABLE person ADD COLUMN IF NOT EXISTS secondary_occupation      VARCHAR(100);
ALTER TABLE person ADD COLUMN IF NOT EXISTS income_per_month          INTEGER;
ALTER TABLE person ADD COLUMN IF NOT EXISTS disease_list              TEXT;
ALTER TABLE person ADD COLUMN IF NOT EXISTS is_disabled               BOOLEAN;
ALTER TABLE person ADD COLUMN IF NOT EXISTS disability_type           VARCHAR(100);
ALTER TABLE person ADD COLUMN IF NOT EXISTS is_elderly                BOOLEAN;
ALTER TABLE person ADD COLUMN IF NOT EXISTS living_alone              BOOLEAN;
ALTER TABLE person ADD COLUMN IF NOT EXISTS welfare_card              VARCHAR(100);
ALTER TABLE person ADD COLUMN IF NOT EXISTS other_welfare             TEXT;
ALTER TABLE person ADD COLUMN IF NOT EXISTS status                    VARCHAR(50);

-- ---------- household ----------
ALTER TABLE household ADD COLUMN IF NOT EXISTS house_registration_status  BOOLEAN;
ALTER TABLE household ADD COLUMN IF NOT EXISTS house_registration_type    VARCHAR(100);
ALTER TABLE household ADD COLUMN IF NOT EXISTS gps_lat                    VARCHAR(50);
ALTER TABLE household ADD COLUMN IF NOT EXISTS gps_lng                    VARCHAR(50);
ALTER TABLE household ADD COLUMN IF NOT EXISTS electricity_access         BOOLEAN;
