-- Migration: training_event, training_participant, community_issue
-- Safe to run repeatedly (CREATE TABLE IF NOT EXISTS)
-- Run against smartvillage DB:
--   psql "postgresql://smartvillageadmin:PASSWORD@43.229.149.138:5432/smartvillage" -f schema-training-community.sql

-- ---------- training_event ----------
CREATE TABLE IF NOT EXISTS training_event (
    id               BIGSERIAL PRIMARY KEY,
    training_name    VARCHAR(200) NOT NULL,
    training_type    VARCHAR(100),
    organizer        VARCHAR(200),
    start_date       DATE,
    end_date         DATE,
    location         VARCHAR(200),
    description      TEXT,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);

-- ---------- training_participant ----------
CREATE TABLE IF NOT EXISTS training_participant (
    id              BIGSERIAL PRIMARY KEY,
    training_id     BIGINT REFERENCES training_event(id) ON DELETE CASCADE,
    person_id       BIGINT REFERENCES person(id) ON DELETE CASCADE,
    attend_status   VARCHAR(50),
    after_status    VARCHAR(50),
    after_problem   TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ---------- community_issue ----------
CREATE TABLE IF NOT EXISTS community_issue (
    id               BIGSERIAL PRIMARY KEY,
    household_id     BIGINT REFERENCES household(id) ON DELETE SET NULL,
    area             VARCHAR(200),
    issue_type       VARCHAR(100),
    severity         INTEGER CHECK (severity BETWEEN 1 AND 5),
    status           VARCHAR(50) DEFAULT 'ยังไม่แก้',
    owner            VARCHAR(150),
    impact_people    INTEGER,
    budget_estimate  NUMERIC(12, 2),
    due_date         DATE,
    remark           TEXT,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);
