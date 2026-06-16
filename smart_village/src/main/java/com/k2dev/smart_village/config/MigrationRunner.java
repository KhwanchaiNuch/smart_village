package com.k2dev.smart_village.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * รัน SQL migration อัตโนมัติทุกครั้งที่ Spring Boot เปิด
 * ทุก statement ใช้ IF NOT EXISTS / DO $$ ... $$ จึงปลอดภัยรันซ้ำ
 */
@Component
public class MigrationRunner implements ApplicationRunner {

    private final JdbcTemplate jdbc;

    public MigrationRunner(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            runMigrations();
            System.out.println("[MigrationRunner] ✅ Migration completed successfully");
        } catch (Exception e) {
            System.err.println("[MigrationRunner] ⚠️ Migration warning: " + e.getMessage());
        }
    }

    private void runMigrations() {
        // ── person: เพิ่มคอลัมน์ที่อาจขาด ────────────────────────────
        String[] personCols = {
            "ALTER TABLE person ADD COLUMN IF NOT EXISTS cid VARCHAR(13)",
            "ALTER TABLE person ADD COLUMN IF NOT EXISTS title VARCHAR(50)",
            "ALTER TABLE person ADD COLUMN IF NOT EXISTS gender VARCHAR(10)",
            "ALTER TABLE person ADD COLUMN IF NOT EXISTS birth_date DATE",
            "ALTER TABLE person ADD COLUMN IF NOT EXISTS age INTEGER",
            "ALTER TABLE person ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50)",
            "ALTER TABLE person ADD COLUMN IF NOT EXISTS education_level VARCHAR(100)",
            "ALTER TABLE person ADD COLUMN IF NOT EXISTS is_registered_in_village BOOLEAN",
            "ALTER TABLE person ADD COLUMN IF NOT EXISTS is_living_in_village BOOLEAN",
            "ALTER TABLE person ADD COLUMN IF NOT EXISTS occupation VARCHAR(100)",
            "ALTER TABLE person ADD COLUMN IF NOT EXISTS secondary_occupation VARCHAR(100)",
            "ALTER TABLE person ADD COLUMN IF NOT EXISTS income_per_month INTEGER",
            "ALTER TABLE person ADD COLUMN IF NOT EXISTS disease_list TEXT",
            "ALTER TABLE person ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN",
            "ALTER TABLE person ADD COLUMN IF NOT EXISTS disability_type VARCHAR(100)",
            "ALTER TABLE person ADD COLUMN IF NOT EXISTS is_elderly BOOLEAN",
            "ALTER TABLE person ADD COLUMN IF NOT EXISTS living_alone BOOLEAN",
            "ALTER TABLE person ADD COLUMN IF NOT EXISTS other_welfare TEXT",
            "ALTER TABLE person ADD COLUMN IF NOT EXISTS status VARCHAR(50)",
            "ALTER TABLE person ADD COLUMN IF NOT EXISTS is_sick BOOLEAN",
            "ALTER TABLE person ADD COLUMN IF NOT EXISTS is_bedridden BOOLEAN",
        };
        for (String sql : personCols) {
            try { jdbc.execute(sql); } catch (Exception ignored) {}
        }

        // welfare_card: ต้องเป็น BOOLEAN — ถ้าเป็น VARCHAR ให้แปลง
        fixWelfareCard();

        // ── household: เพิ่มคอลัมน์ที่อาจขาด ───────────────────────
        String[] hhCols = {
            "ALTER TABLE household ADD COLUMN IF NOT EXISTS house_registration_status BOOLEAN",
            "ALTER TABLE household ADD COLUMN IF NOT EXISTS house_registration_type VARCHAR(100)",
            "ALTER TABLE household ADD COLUMN IF NOT EXISTS electricity_access BOOLEAN",
        };
        for (String sql : hhCols) {
            try { jdbc.execute(sql); } catch (Exception ignored) {}
        }
        fixGpsColumns();

        // ── training_event ────────────────────────────────────────────
        jdbc.execute("""
            CREATE TABLE IF NOT EXISTS training_event (
                id BIGSERIAL PRIMARY KEY,
                training_name VARCHAR(200),
                training_type VARCHAR(100),
                organizer VARCHAR(200),
                start_date DATE,
                end_date DATE,
                location VARCHAR(200),
                description TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            )""");
        try {
            jdbc.execute("ALTER TABLE training_event ADD COLUMN IF NOT EXISTS village_id INTEGER REFERENCES village(village_id)");
        } catch (Exception ignored) {}

        // ── training_participant ──────────────────────────────────────
        jdbc.execute("""
            CREATE TABLE IF NOT EXISTS training_participant (
                id BIGSERIAL PRIMARY KEY,
                training_id BIGINT,
                person_id BIGINT,
                attend_status VARCHAR(50),
                after_status VARCHAR(50),
                after_problem TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            )""");

        // ── community_issue ───────────────────────────────────────────
        jdbc.execute("""
            CREATE TABLE IF NOT EXISTS community_issue (
                id BIGSERIAL PRIMARY KEY,
                household_id BIGINT,
                area VARCHAR(200),
                issue_type VARCHAR(100),
                severity INTEGER,
                status VARCHAR(50) DEFAULT 'ยังไม่แก้',
                owner VARCHAR(150),
                impact_people INTEGER,
                budget_estimate NUMERIC(12,2),
                due_date DATE,
                remark TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )""");

        // ── village_resource: เพิ่ม village_id ───────────────────────
        try {
            jdbc.execute("ALTER TABLE village_resource ADD COLUMN IF NOT EXISTS village_id INTEGER REFERENCES village(village_id)");
        } catch (Exception ignored) {}

        // ── tambon: เพิ่มคอลัมน์ zipcode ─────────────────────────────
        try {
            jdbc.execute("ALTER TABLE tambon ADD COLUMN IF NOT EXISTS zipcode VARCHAR(5)");
        } catch (Exception ignored) {}

        // ── seed ข้อมูลจังหวัด/อำเภอ/ตำบล จากไฟล์สำเร็จรูป (รันครั้งเดียวตอนตารางว่าง) ──
        seedGeo();

        // ── app_user: เพิ่ม geo columns สำหรับ geographic scope ─────────────
        String[] userGeoCols = {
            "ALTER TABLE app_user ADD COLUMN IF NOT EXISTS province_id INTEGER",
            "ALTER TABLE app_user ADD COLUMN IF NOT EXISTS amphur_id INTEGER",
            "ALTER TABLE app_user ADD COLUMN IF NOT EXISTS tambon_id INTEGER",
        };
        for (String sql : userGeoCols) {
            try { jdbc.execute(sql); } catch (Exception ignored) {}
        }

        // ── สร้าง village placeholder สำหรับ scope_id ที่ยังไม่มีใน village ──
        ensureVillagesForUsers();

        // ── seed system roles ให้กำหนดสิทธิ์ในหน้า permission matrix ได้ ──
        seedSystemRoles();
    }

    /** import province/amphur/tambon จาก seed-geo.sql ถ้าตาราง tambon ยังว่าง */
    private void seedGeo() {
        try {
            Integer cnt = jdbc.queryForObject("SELECT COUNT(*) FROM tambon", Integer.class);
            if (cnt != null && cnt >= 7000) {
                return; // import ครบแล้ว ไม่ seed ซ้ำ
            }
            org.springframework.core.io.ClassPathResource res =
                new org.springframework.core.io.ClassPathResource("seed-geo.sql");
            String sql;
            try (java.io.InputStream in = res.getInputStream()) {
                sql = new String(in.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
            }
            // ตัดบรรทัด comment ออกก่อน เพื่อไม่ให้ติดมากับ statement แรก
            sql = sql.replaceAll("(?m)^\\s*--.*$", "");
            for (String stmt : sql.split(";\\s*\\r?\\n")) {
                String s = stmt.trim();
                if (s.isEmpty()) continue;
                jdbc.execute(s);
            }
            // ปรับ sequence ให้เริ่มหลังรหัสราชการ (กันชนเวลาผู้ใช้เพิ่มเอง)
            for (String[] t : new String[][]{
                    {"province", "province_id"}, {"amphur", "amphur_id"}, {"tambon", "tambon_id"}}) {
                try {
                    jdbc.execute("SELECT setval(pg_get_serial_sequence('" + t[0] + "','" + t[1] + "'), " +
                        "GREATEST((SELECT COALESCE(MAX(" + t[1] + "),0) FROM " + t[0] + "), 1))");
                } catch (Exception ignored) {}
            }
            System.out.println("[MigrationRunner] ✅ Seeded geo data (province/amphur/tambon)");
        } catch (Exception e) {
            System.err.println("[MigrationRunner] geo seed skipped: " + e.getMessage());
        }
    }

    /**
     * ตรวจสอบทุก scope_id ใน app_user (role_level='VILLAGE')
     * ถ้า scope_id นั้นยังไม่มีใน village → สร้าง placeholder
     * ป้องกัน FK violation ตอน INSERT household/training_event/village_resource
     */
    private void ensureVillagesForUsers() {
        try {
            java.util.List<Integer> missing = jdbc.queryForList(
                "SELECT DISTINCT u.scope_id FROM app_user u " +
                "WHERE u.scope_id IS NOT NULL " +
                "  AND NOT EXISTS (SELECT 1 FROM village v WHERE v.village_id = u.scope_id)",
                Integer.class
            );
            for (Integer sid : missing) {
                try {
                    // ลอง INSERT ปกติก่อน (รองรับ SERIAL + GENERATED BY DEFAULT)
                    jdbc.update(
                        "INSERT INTO village (village_id, village_name) VALUES (?, ?) ON CONFLICT (village_id) DO NOTHING",
                        sid, "หมู่บ้านหมู่ " + sid
                    );
                    System.out.println("[MigrationRunner] Created placeholder village village_id=" + sid);
                } catch (Exception e2) {
                    System.err.println("[MigrationRunner] plain INSERT failed for village_id=" + sid + ": " + e2.getMessage());
                    try {
                        // fallback: OVERRIDING SYSTEM VALUE สำหรับ GENERATED ALWAYS AS IDENTITY
                        jdbc.update(
                            "INSERT INTO village (village_id, village_name) OVERRIDING SYSTEM VALUE VALUES (?, ?) ON CONFLICT (village_id) DO NOTHING",
                            sid, "หมู่บ้านหมู่ " + sid
                        );
                        System.out.println("[MigrationRunner] Created placeholder village (OVERRIDING) village_id=" + sid);
                    } catch (Exception e3) {
                        System.err.println("[MigrationRunner] village " + sid + " still failed: " + e3.getMessage());
                    }
                }
            }
            // รีเซ็ต sequence ให้ต่อจาก max village_id ปัจจุบัน
            try {
                jdbc.execute(
                    "SELECT setval(pg_get_serial_sequence('village','village_id'), " +
                    "GREATEST((SELECT COALESCE(MAX(village_id),0) FROM village), 1))"
                );
            } catch (Exception ignored) {}
        } catch (Exception e) {
            System.err.println("[MigrationRunner] ensureVillagesForUsers: " + e.getMessage());
        }
    }

    /**
     * Seed ระบบ roles ที่จำเป็น (ADMIN, PROVINCE, AMPHUR, TAMBON, VILLAGE)
     * ให้ ADMIN กำหนดสิทธิ์ผ่านหน้า Permission Matrix ได้
     */
    private void seedSystemRoles() {
        String[] systemRoles = {"ADMIN", "PROVINCE", "AMPHUR", "TAMBON", "VILLAGE"};
        for (String roleName : systemRoles) {
            try {
                Integer cnt = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM \"role\" WHERE name = ?", Integer.class, roleName);
                if (cnt == null || cnt == 0) {
                    jdbc.update("INSERT INTO \"role\" (name, status) VALUES (?, true)", roleName);
                    System.out.println("[MigrationRunner] Created system role: " + roleName);
                }
            } catch (Exception e) {
                System.err.println("[MigrationRunner] seedSystemRoles " + roleName + ": " + e.getMessage());
            }
        }
        System.out.println("[MigrationRunner] ✅ System roles ensured");
    }

    /** welfare_card: ถ้า DB มีเป็น VARCHAR → แปลงเป็น BOOLEAN */
    private void fixWelfareCard() {
        try {
            String dtype = jdbc.queryForObject(
                "SELECT data_type FROM information_schema.columns " +
                "WHERE table_name='person' AND column_name='welfare_card'",
                String.class);
            if (dtype != null && dtype.contains("char")) {
                // แปลง varchar → boolean (ค่าเดิมที่ไม่ใช่ null/empty → true)
                jdbc.execute("ALTER TABLE person ALTER COLUMN welfare_card TYPE BOOLEAN " +
                    "USING CASE WHEN welfare_card IS NOT NULL AND welfare_card <> '' THEN TRUE ELSE FALSE END");
                System.out.println("[MigrationRunner] welfare_card converted VARCHAR→BOOLEAN");
            } else if (dtype == null) {
                // คอลัมน์ยังไม่มี → สร้างเป็น BOOLEAN เลย
                jdbc.execute("ALTER TABLE person ADD COLUMN IF NOT EXISTS welfare_card BOOLEAN");
            }
        } catch (Exception e) {
            System.err.println("[MigrationRunner] welfare_card fix skipped: " + e.getMessage());
        }
    }

    /** gps_lat/gps_lng: ถ้าเป็น VARCHAR → แปลงเป็น NUMERIC */
    private void fixGpsColumns() {
        try {
            String dtype = jdbc.queryForObject(
                "SELECT data_type FROM information_schema.columns " +
                "WHERE table_name='household' AND column_name='gps_lat'",
                String.class);
            if (dtype != null && dtype.contains("char")) {
                jdbc.execute("ALTER TABLE household ALTER COLUMN gps_lat TYPE NUMERIC(10,6) USING NULLIF(gps_lat,'')::NUMERIC");
                jdbc.execute("ALTER TABLE household ALTER COLUMN gps_lng TYPE NUMERIC(10,6) USING NULLIF(gps_lng,'')::NUMERIC");
                System.out.println("[MigrationRunner] gps columns converted VARCHAR→NUMERIC");
            } else if (dtype == null) {
                jdbc.execute("ALTER TABLE household ADD COLUMN IF NOT EXISTS gps_lat NUMERIC(10,6)");
                jdbc.execute("ALTER TABLE household ADD COLUMN IF NOT EXISTS gps_lng NUMERIC(10,6)");
            }
        } catch (Exception e) {
            System.err.println("[MigrationRunner] gps fix skipped: " + e.getMessage());
        }
    }
}
