package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.security.ScopeUtil;
import com.k2dev.smart_village.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    // ── helper: resolve villageId from param or JWT scope ─────────────────
    private Integer resolveVillageId(Integer villageId) {
        if (villageId != null) return villageId;
        if (ScopeUtil.isAdmin()) return null;        // admin without selection → empty
        return ScopeUtil.getScopeId();
    }

    // ── /api/dashboard/population ──────────────────────────────────────────
    @GetMapping("/population")
    public ResponseEntity<?> population(@RequestParam(required = false) Integer villageId) {
        Integer vid = resolveVillageId(villageId);
        if (vid == null) return ResponseEntity.ok(dashboardService.emptyPopulation());
        return ResponseEntity.ok(dashboardService.getPopulation(vid));
    }

    // ── /api/dashboard/village-index ───────────────────────────────────────
    @GetMapping("/village-index")
    public ResponseEntity<?> villageIndex(@RequestParam(required = false) Integer villageId) {
        Integer vid = resolveVillageId(villageId);
        if (vid == null) return ResponseEntity.ok(dashboardService.emptyVillageIndex());
        return ResponseEntity.ok(dashboardService.getVillageIndex(vid));
    }

    // ── /api/dashboard/actionable ──────────────────────────────────────────
    @GetMapping("/actionable")
    public ResponseEntity<?> actionable(@RequestParam(required = false) Integer villageId) {
        Integer vid = resolveVillageId(villageId);
        if (vid == null) return ResponseEntity.ok(dashboardService.emptyActionable());
        return ResponseEntity.ok(dashboardService.getActionable(vid));
    }

    // ── /api/dashboard/issues-summary (NEW) ────────────────────────────────
    @GetMapping("/issues-summary")
    public ResponseEntity<?> issuesSummary(@RequestParam(required = false) Integer villageId) {
        Integer vid = resolveVillageId(villageId);
        if (vid == null) return ResponseEntity.ok(dashboardService.emptyIssuesSummary());
        return ResponseEntity.ok(dashboardService.getIssuesSummary(vid));
    }

    // ── /api/dashboard/visit-stats (NEW) ───────────────────────────────────
    @GetMapping("/visit-stats")
    public ResponseEntity<?> visitStats(@RequestParam(required = false) Integer villageId) {
        Integer vid = resolveVillageId(villageId);
        if (vid == null) return ResponseEntity.ok(dashboardService.emptyVisitStats());
        return ResponseEntity.ok(dashboardService.getVisitStats(vid));
    }

    // ── /api/dashboard/income-summary (NEW) ────────────────────────────────
    @GetMapping("/income-summary")
    public ResponseEntity<?> incomeSummary(@RequestParam(required = false) Integer villageId) {
        Integer vid = resolveVillageId(villageId);
        if (vid == null) return ResponseEntity.ok(dashboardService.emptyIncomeSummary());
        return ResponseEntity.ok(dashboardService.getIncomeSummary(vid));
    }

    // ── /api/dashboard/stats (legacy — used by NotificationDropdown) ────────
    // Returns children03 from population endpoint for backward compatibility
    @GetMapping("/stats")
    public ResponseEntity<?> stats(@RequestParam(required = false) Integer villageId) {
        Integer vid = resolveVillageId(villageId);
        if (vid == null) return ResponseEntity.ok(dashboardService.emptyPopulation());
        return ResponseEntity.ok(dashboardService.getPopulation(vid));
    }
}
