-- ============================================================
-- Consolidated migration — safe to run repeatedly (IF NOT EXISTS)
-- Run this in pgAdmin Query Tool against the smartvillage DB
-- ============================================================

-- ── person: columns added after initial schema ──────────────
ALTER TABLE person ADD COLUMN IF NOT EXISTS cid                       VARCHAR(13);
ALTER TABLE person ADD COLUMN IF NOT EXISTS title                     VARCHAR(50);
ALTER TABLE person ADD COLUMN IF NOT EXISTS gender                    VARCHAR(10);
ALTER TABLE person ADD COLUMN IF NOT EXISTS birth_date                DATE;
ALTER TABLE person ADD COLUMN IF NOT EXISTS age                       INTEGER;
ALTER TABLE person ADD COLUMN IF NOT EXISTS marital_status            VARCHAR(50);
ALTER TABLE person ADD COLUMN IF NOT EXISTS education_level           VARCHAR(100);
ALTER TABLE person ADD COLUMN IF NOT EXISTS is_registered_in_village  BOOLEAN;
ALTER TABLE person ADD COLUMN IF NOT EXISTS is_living_in_village      BOOLEAN;
ALTER TABLE person ADD COLUMN IF NOT EXISTS occupation               VARCHAR(100);
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
ALTER TABLE person ADD COLUMN IF NOT EXISTS is_sick                   BOOLEAN;
ALTER TABLE person ADD COLUMN IF NOT EXISTS is_bedridden              BOOLEAN;

-- ── household: columns added after initial schema ───────────
ALTER TABLE household ADD COLUMN IF NOT EXISTS house_registration_status  BOOLEAN;
ALTER TABLE household ADD COLUMN IF NOT EXISTS house_registration_type    VARCHAR(100);
ALTER TABLE household ADD COLUMN IF NOT EXISTS gps_lat                    NUMERIC(10,6);
ALTER TABLE household ADD COLUMN IF NOT EXISTS gps_lng                    NUMERIC(10,6);
ALTER TABLE household ADD COLUMN IF NOT EXISTS electricity_access         BOOLEAN;

-- Fix gps columns if they were created as VARCHAR (cast to numeric)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'household'
          AND column_name = 'gps_lat'
          AND data_type = 'character varying'
    ) THEN
        ALTER TABLE household ALTER COLUMN gps_lat TYPE NUMERIC(10,6) USING gps_lat::NUMERIC;
        ALTER TABLE household ALTER COLUMN gps_lng TYPE NUMERIC(10,6) USING gps_lng::NUMERIC;
    END IF;
END $$;

-- ── training_event + training_participant (if not yet created) ──
CREATE TABLE IF NOT EXISTS training_event (
    id            BIGSERIAL PRIMARY KEY,
    training_name VARCHAR(200),
    training_type VARCHAR(100),
    organizer     VARCHAR(200),
    start_date    DATE,
    end_date      DATE,
    location      VARCHAR(200),
    description   TEXT,
    created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_participant (
    id            BIGSERIAL PRIMARY KEY,
    training_id   BIGINT,
    person_id     BIGINT,
    attend_status VARCHAR(50),
    after_status  VARCHAR(50),
    after_problem TEXT,
    created_at    TIMESTAMP DEFAULT NOW()
);

-- ── community_issue (if not yet created) ────────────────────
CREATE TABLE IF NOT EXISTS community_issue (
    id               BIGSERIAL PRIMARY KEY,
    household_id     BIGINT,
    area             VARCHAR(200),
    issue_type       VARCHAR(100),
    severity         INTEGER,
    status           VARCHAR(50) DEFAULT 'ยังไม่แก้',
    owner            VARCHAR(150),
    impact_people    INTEGER,
    budget_estimate  NUMERIC(12, 2),
    due_date         DATE,
    remark           TEXT,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);

-- ── village_resource: add village_id ────────────────────────
ALTER TABLE village_resource ADD COLUMN IF NOT EXISTS village_id INTEGER REFERENCES village(village_id);

-- ── training_event: add village_id ──────────────────────────
ALTER TABLE training_event ADD COLUMN IF NOT EXISTS village_id INTEGER REFERENCES village(village_id);

-- ── health_record: columns added after initial schema ───────
ALTER TABLE health_record ADD COLUMN IF NOT EXISTS person_id         INTEGER;
ALTER TABLE health_record ADD COLUMN IF NOT EXISTS check_date        DATE;
ALTER TABLE health_record ADD COLUMN IF NOT EXISTS weight            NUMERIC(5,2);
ALTER TABLE health_record ADD COLUMN IF NOT EXISTS height            NUMERIC(5,2);
ALTER TABLE health_record ADD COLUMN IF NOT EXISTS blood_pressure    VARCHAR(20);
ALTER TABLE health_record ADD COLUMN IF NOT EXISTS blood_sugar       NUMERIC(6,2);
ALTER TABLE health_record ADD COLUMN IF NOT EXISTS cholesterol       NUMERIC(6,2);
ALTER TABLE health_record ADD COLUMN IF NOT EXISTS diagnosis         TEXT;
ALTER TABLE health_record ADD COLUMN IF NOT EXISTS note              TEXT;
ALTER TABLE health_record ADD COLUMN IF NOT EXISTS created_at        TIMESTAMP DEFAULT NOW();

-- ── visit_log: columns added after initial schema ───────────
ALTER TABLE visit_log ADD COLUMN IF NOT EXISTS person_id      INTEGER;
ALTER TABLE visit_log ADD COLUMN IF NOT EXISTS household_id   INTEGER;
ALTER TABLE visit_log ADD COLUMN IF NOT EXISTS visit_date     DATE;
ALTER TABLE visit_log ADD COLUMN IF NOT EXISTS visit_purpose  VARCHAR(200);
ALTER TABLE visit_log ADD COLUMN IF NOT EXISTS result         TEXT;
ALTER TABLE visit_log ADD COLUMN IF NOT EXISTS visitor_name   VARCHAR(150);
ALTER TABLE visit_log ADD COLUMN IF NOT EXISTS next_visit     DATE;
ALTER TABLE visit_log ADD COLUMN IF NOT EXISTS note           TEXT;
ALTER TABLE visit_log ADD COLUMN IF NOT EXISTS created_at     TIMESTAMP DEFAULT NOW();

SELECT 'Migration completed successfully' AS result;

-- ── Fix person columns that might be BOOLEAN instead of VARCHAR ───────
-- welfare_card ควรเป็น VARCHAR แต่ DB เดิมอาจสร้างเป็น BOOLEAN
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'person' AND column_name = 'welfare_card'
          AND data_type = 'boolean'
    ) THEN
        ALTER TABLE person ALTER COLUMN welfare_card TYPE VARCHAR(100)
            USING CASE WHEN welfare_card IS TRUE THEN 'มีบัตรสวัสดิการ' ELSE NULL END;
    END IF;
END $$;

-- other_welfare ควรเป็น TEXT
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'person' AND column_name = 'other_welfare'
          AND data_type = 'boolean'
    ) THEN
        ALTER TABLE person ALTER COLUMN other_welfare TYPE TEXT
            USING CASE WHEN other_welfare IS TRUE THEN 'มีสวัสดิการอื่น' ELSE NULL END;
    END IF;
END $$;

-- disease_list ควรเป็น TEXT
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'person' AND column_name = 'disease_list'
          AND data_type = 'boolean'
    ) THEN
        ALTER TABLE person ALTER COLUMN disease_list TYPE TEXT
            USING NULL;
    END IF;
END $$;

SELECT 'Type fixes applied' AS result;
