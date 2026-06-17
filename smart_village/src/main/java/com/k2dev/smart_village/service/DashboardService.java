package com.k2dev.smart_village.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private JdbcTemplate jdbc;

    // ─────────────────────────────────────────────────────────────────────────
    // /population  — scalar counts + population by year + age groups
    // ─────────────────────────────────────────────────────────────────────────
    public Map<String, Object> getPopulation(Integer villageId) {
        String sqlCounts = """
                SELECT
                  COUNT(*)                                                     AS total_persons,
                  COUNT(*) FILTER (WHERE p.is_elderly   = true)               AS total_elderly,
                  COUNT(*) FILTER (WHERE p.is_disabled  = true)               AS total_disabled,
                  COUNT(*) FILTER (WHERE p.is_bedridden = true)               AS total_bedridden,
                  COUNT(*) FILTER (WHERE
                    COALESCE(p.age,
                      (EXTRACT(YEAR FROM NOW()) - EXTRACT(YEAR FROM p.birth_date))::int
                    ) BETWEEN 0 AND 3)                                         AS children03
                FROM person p
                JOIN household h ON p.household_id = h.household_id
                WHERE h.village_id = ?
                """;
        Map<String, Object> counts = jdbc.queryForMap(sqlCounts, villageId);

        String sqlPopByYear = """
                WITH years AS (
                  SELECT generate_series(
                    EXTRACT(YEAR FROM NOW())::int - 4,
                    EXTRACT(YEAR FROM NOW())::int
                  ) AS yr
                ),
                pd AS (
                  SELECT
                    p.gender,
                    COALESCE(EXTRACT(YEAR FROM p.created_at)::int,
                             EXTRACT(YEAR FROM NOW())::int) AS reg_year
                  FROM person p
                  JOIN household h ON p.household_id = h.household_id
                  WHERE h.village_id = ?
                )
                SELECT
                  y.yr::text AS year,
                  SUM(CASE WHEN pd.gender = 'ชาย'  AND pd.reg_year <= y.yr THEN 1 ELSE 0 END) AS male,
                  SUM(CASE WHEN pd.gender = 'หญิง' AND pd.reg_year <= y.yr THEN 1 ELSE 0 END) AS female
                FROM years y CROSS JOIN pd
                GROUP BY y.yr ORDER BY y.yr
                """;
        List<Map<String, Object>> popByYear = jdbc.queryForList(sqlPopByYear, villageId);

        String sqlAgeGroups = """
                WITH ages AS (
                  SELECT p.gender,
                    COALESCE(p.age,
                      (EXTRACT(YEAR FROM NOW()) - EXTRACT(YEAR FROM p.birth_date))::int
                    ) AS age
                  FROM person p
                  JOIN household h ON p.household_id = h.household_id
                  WHERE h.village_id = ?
                )
                SELECT
                  CASE
                    WHEN age BETWEEN 0  AND 3  THEN '0-3 ปี'
                    WHEN age BETWEEN 4  AND 12 THEN '4-12 ปี'
                    WHEN age BETWEEN 13 AND 17 THEN '13-17 ปี'
                    WHEN age BETWEEN 18 AND 59 THEN '18-59 ปี'
                    WHEN age >= 60             THEN '60+ ปี'
                  END AS label,
                  COUNT(*) FILTER (WHERE gender = 'ชาย')                                   AS male,
                  COUNT(*) FILTER (WHERE gender = 'หญิง')                                  AS female,
                  COUNT(*) FILTER (WHERE gender NOT IN ('ชาย','หญิง') OR gender IS NULL)   AS other
                FROM ages
                WHERE age IS NOT NULL AND age BETWEEN 0 AND 120
                GROUP BY label ORDER BY MIN(age)
                """;
        List<Map<String, Object>> ageGroups = jdbc.queryForList(sqlAgeGroups, villageId);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalPersons",   counts.get("total_persons"));
        result.put("totalElderly",   counts.get("total_elderly"));
        result.put("totalDisabled",  counts.get("total_disabled"));
        result.put("totalBedridden", counts.get("total_bedridden"));
        result.put("children03",     counts.get("children03"));
        result.put("populationByYear", popByYear);
        result.put("ageGroups",        ageGroups);
        return result;
    }

    public Map<String, Object> emptyPopulation() {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("totalPersons", 0);   r.put("totalElderly", 0);
        r.put("totalDisabled", 0);  r.put("totalBedridden", 0);
        r.put("children03", 0);
        r.put("populationByYear", List.of());
        r.put("ageGroups", List.of());
        return r;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // /village-index  — composite score via PostgreSQL CTE
    // ─────────────────────────────────────────────────────────────────────────
    public Map<String, Object> getVillageIndex(Integer villageId) {
        String sql = """
                WITH hh AS (
                  SELECT household_id, house_condition, internet_access, electricity_access, water_system
                  FROM household WHERE village_id = ?
                ),
                ps AS (
                  SELECT p.age, p.income_per_month, p.occupation,
                         p.is_sick, p.is_bedridden, p.is_disabled, p.is_elderly, p.living_alone
                  FROM person p JOIN hh h ON p.household_id = h.household_id
                ),
                income_s AS (
                  SELECT CASE
                    WHEN COUNT(*) FILTER (WHERE income_per_month IS NOT NULL AND income_per_month > 0) = 0 THEN 50.0
                    ELSE LEAST(100.0, AVG(income_per_month)
                           FILTER (WHERE income_per_month IS NOT NULL AND income_per_month > 0) / 150.0)
                  END AS score FROM ps
                ),
                employ_s AS (
                  SELECT CASE
                    WHEN COUNT(*) FILTER (WHERE age BETWEEN 18 AND 60) = 0 THEN 100.0
                    ELSE COUNT(*) FILTER (WHERE age BETWEEN 18 AND 60
                         AND occupation IS NOT NULL AND TRIM(occupation) NOT IN ('','—','-'))::numeric * 100.0
                         / NULLIF(COUNT(*) FILTER (WHERE age BETWEEN 18 AND 60), 0)
                  END AS score FROM ps
                ),
                house_s AS (
                  SELECT COALESCE(AVG(
                    CASE
                      WHEN house_condition ILIKE '%ดี%' OR house_condition ILIKE '%มั่นคง%' THEN 100.0
                      WHEN house_condition ILIKE '%ปานกลาง%' THEN 60.0
                      WHEN house_condition ILIKE '%ทรุดโทรม%' THEN 20.0
                      ELSE 50.0
                    END
                  ), 50.0) AS score FROM hh
                ),
                elder_s AS (
                  SELECT CASE
                    WHEN COUNT(*) FILTER (WHERE is_elderly = true) = 0 THEN 100.0
                    ELSE 100.0 - (COUNT(*) FILTER (WHERE is_elderly = true AND living_alone = true)::numeric * 100.0
                                  / NULLIF(COUNT(*) FILTER (WHERE is_elderly = true), 0))
                  END AS score FROM ps
                ),
                health_s AS (
                  SELECT CASE
                    WHEN COUNT(*) = 0 THEN 100.0
                    ELSE GREATEST(0.0, 100.0 - (
                      (COUNT(*) FILTER (WHERE is_sick      = true) * 10 +
                       COUNT(*) FILTER (WHERE is_bedridden = true) * 30 +
                       COUNT(*) FILTER (WHERE is_disabled  = true) * 15)::numeric
                      / NULLIF(COUNT(*), 0)
                    ))
                  END AS score FROM ps
                ),
                util_s AS (
                  SELECT (
                    COALESCE(COUNT(*) FILTER (WHERE internet_access    = true)::numeric * 100.0 / NULLIF(COUNT(*), 0), 50.0) +
                    COALESCE(AVG(CASE
                      WHEN water_system ILIKE '%ประปา%' THEN 100.0
                      WHEN water_system ILIKE '%บาดาล%' THEN 70.0
                      WHEN water_system ILIKE '%ฝน%'    THEN 40.0
                      ELSE 50.0
                    END), 50.0) +
                    COALESCE(COUNT(*) FILTER (WHERE electricity_access = true)::numeric * 100.0 / NULLIF(COUNT(*), 0), 50.0)
                  ) / 3.0 AS score FROM hh
                )
                SELECT
                  LEAST(100, GREATEST(0, ROUND(
                    i.score * 0.25 + e.score * 0.15 + h.score * 0.10 +
                    el.score * 0.10 + hl.score * 0.20 + u.score * 0.20
                  )))::int             AS total,
                  ROUND(i.score)::int  AS income_score,
                  ROUND(e.score)::int  AS employment_score,
                  ROUND(h.score)::int  AS housing_score,
                  ROUND(el.score)::int AS elderly_alone_score,
                  ROUND(hl.score)::int AS health_score,
                  ROUND(u.score)::int  AS utilities_score
                FROM income_s i, employ_s e, house_s h, elder_s el, health_s hl, util_s u
                """;
        try {
            Map<String, Object> row = jdbc.queryForMap(sql, villageId);
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("total",            row.get("total"));
            result.put("incomeScore",       row.get("income_score"));
            result.put("employmentScore",   row.get("employment_score"));
            result.put("housingScore",      row.get("housing_score"));
            result.put("elderlyAloneScore", row.get("elderly_alone_score"));
            result.put("healthScore",       row.get("health_score"));
            result.put("utilitiesScore",    row.get("utilities_score"));
            return result;
        } catch (Exception ex) {
            return emptyVillageIndex();
        }
    }

    public Map<String, Object> emptyVillageIndex() {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("total", 0); r.put("incomeScore", 0); r.put("employmentScore", 0);
        r.put("housingScore", 0); r.put("elderlyAloneScore", 0);
        r.put("healthScore", 0); r.put("utilitiesScore", 0);
        return r;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // /actionable  — overdue home visits + stalled community issues
    // ─────────────────────────────────────────────────────────────────────────
    public Map<String, Object> getActionable(Integer villageId) {
        String sqlHH = """
                WITH target_hh AS (
                  SELECT
                    h.household_id, h.house_no, h.moo,
                    BOOL_OR(p.is_bedridden = true)                         AS has_bedridden,
                    BOOL_OR(p.is_elderly = true AND p.living_alone = true) AS has_elderly_alone
                  FROM household h
                  JOIN person p ON p.household_id = h.household_id
                  WHERE h.village_id = ?
                    AND (p.is_bedridden = true OR (p.is_elderly = true AND p.living_alone = true))
                  GROUP BY h.household_id, h.house_no, h.moo
                ),
                last_visit AS (
                  SELECT household_id, MAX(visit_date) AS last_visit_date
                  FROM visit_log GROUP BY household_id
                )
                SELECT
                  t.household_id, t.house_no, t.moo,
                  t.has_bedridden, t.has_elderly_alone, lv.last_visit_date,
                  CASE
                    WHEN lv.last_visit_date IS NULL THEN NULL
                    ELSE (CURRENT_DATE - lv.last_visit_date)
                  END AS days_since_visit
                FROM target_hh t
                LEFT JOIN last_visit lv ON lv.household_id = t.household_id::bigint
                WHERE lv.last_visit_date IS NULL
                   OR lv.last_visit_date < CURRENT_DATE - INTERVAL '30 days'
                ORDER BY days_since_visit DESC NULLS FIRST
                LIMIT 10
                """;
        List<Map<String, Object>> overdueHouseholds = jdbc.queryForList(sqlHH, villageId)
                .stream().map(row -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("householdId",     row.get("household_id"));
                    m.put("houseNo",         row.get("house_no"));
                    m.put("moo",             row.get("moo"));
                    m.put("hasBedridden",    row.get("has_bedridden"));
                    m.put("hasElderlyAlone", row.get("has_elderly_alone"));
                    m.put("lastVisitDate",   row.get("last_visit_date"));
                    m.put("daysSinceVisit",  row.get("days_since_visit"));
                    return m;
                }).collect(Collectors.toList());

        String sqlIssues = """
                WITH last_log AS (
                  SELECT issue_id, MAX(created_at) AS last_log_at
                  FROM community_issue_log GROUP BY issue_id
                )
                SELECT
                  ci.id, ci.issue_type, ci.status, ci.severity, ci.area,
                  ci.created_at, ll.last_log_at,
                  CASE
                    WHEN ll.last_log_at IS NULL THEN (CURRENT_DATE - ci.created_at::date)
                    ELSE (CURRENT_DATE - ll.last_log_at::date)
                  END AS days_stalled
                FROM community_issue ci
                LEFT JOIN last_log ll ON ll.issue_id = ci.id
                WHERE ci.village_id = ?
                  AND LOWER(TRIM(COALESCE(ci.status, '')))
                      NOT IN ('แก้ไขแล้ว','resolved','closed','done','completed')
                  AND (
                    (ll.last_log_at IS NULL AND ci.created_at < NOW() - INTERVAL '30 days')
                    OR (ll.last_log_at IS NOT NULL AND ll.last_log_at < NOW() - INTERVAL '30 days')
                  )
                ORDER BY days_stalled DESC NULLS FIRST
                LIMIT 10
                """;
        List<Map<String, Object>> stalledIssues = jdbc.queryForList(sqlIssues, villageId)
                .stream().map(row -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",          row.get("id"));
                    m.put("issueType",   row.get("issue_type"));
                    m.put("status",      row.get("status"));
                    m.put("severity",    row.get("severity"));
                    m.put("area",        row.get("area"));
                    m.put("daysStalled", row.get("days_stalled"));
                    return m;
                }).collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("overdueHouseholds", overdueHouseholds);
        result.put("stalledIssues",     stalledIssues);
        return result;
    }

    public Map<String, Object> emptyActionable() {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("overdueHouseholds", List.of());
        r.put("stalledIssues",     List.of());
        return r;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // /issues-summary  — issue counts + pending list (NEW)
    // ─────────────────────────────────────────────────────────────────────────
    public Map<String, Object> getIssuesSummary(Integer villageId) {
        String sqlCounts = """
                SELECT
                  COUNT(*) FILTER (WHERE LOWER(REGEXP_REPLACE(COALESCE(status,''), '[\\s_\\-]', '', 'g'))
                    IN ('open','เปิด','pending','new','ยังไม่แก้','ยังไม่ได้แก้'))         AS open_count,
                  COUNT(*) FILTER (WHERE LOWER(REGEXP_REPLACE(COALESCE(status,''), '[\\s_\\-]', '', 'g'))
                    IN ('inprogress','กำลังดำเนินการ','doing','ongoing','กำลังทำ','กำลังดำเนิน')) AS in_progress_count,
                  COUNT(*) FILTER (WHERE LOWER(REGEXP_REPLACE(COALESCE(status,''), '[\\s_\\-]', '', 'g'))
                    IN ('resolved','แก้ไขแล้ว','closed','done','completed','แก้แล้ว','เสร็จแล้ว')) AS resolved_count,
                  COUNT(*)                                                                AS total_count
                FROM community_issue
                WHERE village_id = ?
                """;
        Map<String, Object> counts = jdbc.queryForMap(sqlCounts, villageId);

        long openCount       = toLong(counts.get("open_count"));
        long inProgressCount = toLong(counts.get("in_progress_count"));
        long resolvedCount   = toLong(counts.get("resolved_count"));
        long totalCount      = toLong(counts.get("total_count"));
        long otherCount      = Math.max(0, totalCount - openCount - inProgressCount - resolvedCount);

        String sqlPending = """
                SELECT id, issue_type, status, severity, area, created_at
                FROM community_issue
                WHERE village_id = ?
                  AND LOWER(REGEXP_REPLACE(COALESCE(status,''), '[\\s_\\-]', '', 'g'))
                      NOT IN ('resolved','แก้ไขแล้ว','closed','done','completed','แก้แล้ว','เสร็จแล้ว')
                ORDER BY severity DESC NULLS LAST, created_at ASC
                LIMIT 5
                """;
        List<Map<String, Object>> pendingList = jdbc.queryForList(sqlPending, villageId)
                .stream().map(row -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",        row.get("id"));
                    m.put("issueType", row.get("issue_type"));
                    m.put("status",    row.get("status"));
                    m.put("severity",  row.get("severity"));
                    m.put("area",      row.get("area"));
                    m.put("createdAt", row.get("created_at"));
                    return m;
                }).collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("openCount",       openCount);
        result.put("inProgressCount", inProgressCount);
        result.put("resolvedCount",   resolvedCount);
        result.put("otherCount",      otherCount);
        result.put("totalCount",      totalCount);
        result.put("pendingList",     pendingList);
        return result;
    }

    public Map<String, Object> emptyIssuesSummary() {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("openCount", 0); r.put("inProgressCount", 0);
        r.put("resolvedCount", 0); r.put("otherCount", 0);
        r.put("totalCount", 0); r.put("pendingList", List.of());
        return r;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // /visit-stats  — visits this month + recent list (NEW)
    // ─────────────────────────────────────────────────────────────────────────
    public Map<String, Object> getVisitStats(Integer villageId) {
        String sqlThisMonth = """
                SELECT COUNT(*)::int AS cnt
                FROM visit_log v
                JOIN household h ON h.household_id = v.household_id::int
                WHERE h.village_id = ?
                  AND v.visit_date IS NOT NULL
                  AND DATE_TRUNC('month', v.visit_date) = DATE_TRUNC('month', CURRENT_DATE)
                """;
        Map<String, Object> thisMonth;
        try {
            thisMonth = jdbc.queryForMap(sqlThisMonth, villageId);
        } catch (Exception e) {
            thisMonth = Map.of("cnt", 0);
        }

        String sqlRecent = """
                SELECT v.id, v.visit_reason, v.visitor, v.visit_date
                FROM visit_log v
                JOIN household h ON h.household_id = v.household_id::int
                WHERE h.village_id = ?
                  AND v.visit_date IS NOT NULL
                ORDER BY v.visit_date DESC
                LIMIT 5
                """;
        List<Map<String, Object>> recentVisits;
        try {
            recentVisits = jdbc.queryForList(sqlRecent, villageId)
                    .stream().map(row -> {
                        Map<String, Object> m = new LinkedHashMap<>();
                        m.put("id",          row.get("id"));
                        m.put("visitReason", row.get("visit_reason"));
                        m.put("visitor",     row.get("visitor"));
                        m.put("visitDate",   row.get("visit_date"));
                        return m;
                    }).collect(Collectors.toList());
        } catch (Exception e) {
            recentVisits = List.of();
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("visitsThisMonth", ((Number) thisMonth.get("cnt")).intValue());
        result.put("recentVisits",    recentVisits);
        return result;
    }

    public Map<String, Object> emptyVisitStats() {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("visitsThisMonth", 0);
        r.put("recentVisits", List.of());
        return r;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // /income-summary  — totalPoor + income history by year (NEW)
    // ─────────────────────────────────────────────────────────────────────────
    public Map<String, Object> getIncomeSummary(Integer villageId) {
        String sqlPoor = """
                SELECT COUNT(*)::int AS total_poor
                FROM household_economic he
                JOIN household h ON h.household_id = he.household_id::int
                WHERE h.village_id = ?
                  AND he.income_total_per_month IS NOT NULL
                  AND he.income_total_per_month < 3000
                """;
        Map<String, Object> poor;
        try {
            poor = jdbc.queryForMap(sqlPoor, villageId);
        } catch (Exception e) {
            poor = Map.of("total_poor", 0);
        }

        String sqlIncome = """
                SELECT EXTRACT(YEAR FROM he.record_date)::text AS year,
                  SUM(he.income_total_per_month) AS total
                FROM household_economic he
                JOIN household h ON h.household_id = he.household_id::int
                WHERE h.village_id = ?
                  AND he.record_date IS NOT NULL
                  AND he.income_total_per_month IS NOT NULL
                GROUP BY year ORDER BY year
                """;
        List<Map<String, Object>> incomeHistory;
        try {
            incomeHistory = jdbc.queryForList(sqlIncome, villageId);
        } catch (Exception e) {
            incomeHistory = List.of();
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalPoor",     ((Number) poor.get("total_poor")).intValue());
        result.put("incomeHistory", incomeHistory);
        return result;
    }

    public Map<String, Object> emptyIncomeSummary() {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("totalPoor", 0);
        r.put("incomeHistory", List.of());
        return r;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // helpers
    // ─────────────────────────────────────────────────────────────────────────
    private long toLong(Object v) {
        if (v == null) return 0L;
        return ((Number) v).longValue();
    }
}
