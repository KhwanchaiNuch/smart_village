package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Amphur;
import com.k2dev.smart_village.entity.Tambon;
import com.k2dev.smart_village.entity.Village;
import com.k2dev.smart_village.repository.AmphurRepository;
import com.k2dev.smart_village.repository.TambonRepository;
import com.k2dev.smart_village.repository.VillageRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import com.k2dev.smart_village.service.DashboardService;
import com.k2dev.smart_village.service.GeoScopeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired private DashboardService  dashboardService;
    @Autowired private GeoScopeService   geoScopeService;
    @Autowired private VillageRepository villageRepo;
    @Autowired private TambonRepository  tambonRepo;
    @Autowired private AmphurRepository  amphurRepo;

    /**
     * แปลง geo params เป็น List<Integer> villageIds ที่จะใช้ filter
     *
     * ลำดับ priority:
     *   villageId ระบุ  → [villageId]
     *   tambonId ระบุ   → หมู่บ้านในตำบลนั้น
     *   amphurId ระบุ   → หมู่บ้านในอำเภอนั้น (ผ่านตำบล)
     *   provinceId ระบุ → หมู่บ้านในจังหวัดนั้น (ผ่านอำเภอ→ตำบล)
     *   ไม่ระบุ:
     *     ADMIN   → village IDs ทั้งหมด (แสดงภาพรวม)
     *     อื่นๆ   → GeoScopeService คืน ids ตาม JWT scope
     */
    private List<Integer> resolveVillageIds(Integer villageId, Integer tambonId,
                                            Integer amphurId, Integer provinceId) {
        if (villageId != null) return List.of(villageId);

        if (tambonId != null)
            return villageRepo.findByTambonId(tambonId).stream()
                    .map(Village::getVillageId).toList();

        if (amphurId != null) {
            List<Integer> tIds = tambonRepo.findByAmphurId(amphurId).stream()
                    .map(Tambon::getTambonId).toList();
            if (tIds.isEmpty()) return List.of();
            return villageRepo.findByTambonIdIn(tIds).stream()
                    .map(Village::getVillageId).toList();
        }

        if (provinceId != null) {
            List<Integer> aIds = amphurRepo.findByProvinceId(provinceId).stream()
                    .map(Amphur::getAmphurId).toList();
            if (aIds.isEmpty()) return List.of();
            List<Integer> tIds = tambonRepo.findByAmphurIdIn(aIds).stream()
                    .map(Tambon::getTambonId).toList();
            if (tIds.isEmpty()) return List.of();
            return villageRepo.findByTambonIdIn(tIds).stream()
                    .map(Village::getVillageId).toList();
        }

        // ไม่มี param ใดเลย
        if (ScopeUtil.isAdmin())
            // ADMIN: แสดงข้อมูลทั้งหมด
            return villageRepo.findAll().stream().map(Village::getVillageId).toList();

        return geoScopeService.getVillageIds(); // PROVINCE/AMPHUR/TAMBON/VILLAGE
    }

    // ── Endpoints ─────────────────────────────────────────────────────────────

    @GetMapping("/population")
    public ResponseEntity<?> getPopulation(
            @RequestParam(required = false) Integer villageId,
            @RequestParam(required = false) Integer tambonId,
            @RequestParam(required = false) Integer amphurId,
            @RequestParam(required = false) Integer provinceId) {

        // ✅ เปลี่ยนมาใช้สถาปัตยกรรมตัวกรองเดียวกับดัชนีข้ออื่นๆ
        List<Integer> targetVillageIds = resolveVillageIds(villageId, tambonId, amphurId, provinceId);
        
        return ResponseEntity.ok(dashboardService.getPopulation(targetVillageIds));
    }

    @GetMapping("/village-index")
    public ResponseEntity<?> villageIndex(
            @RequestParam(required = false) Integer villageId,
            @RequestParam(required = false) Integer tambonId,
            @RequestParam(required = false) Integer amphurId,
            @RequestParam(required = false) Integer provinceId) {
        return ResponseEntity.ok(dashboardService.getVillageIndex(
                resolveVillageIds(villageId, tambonId, amphurId, provinceId)));
    }

    @GetMapping("/actionable")
    public ResponseEntity<?> actionable(
            @RequestParam(required = false) Integer villageId,
            @RequestParam(required = false) Integer tambonId,
            @RequestParam(required = false) Integer amphurId,
            @RequestParam(required = false) Integer provinceId) {
        return ResponseEntity.ok(dashboardService.getActionable(
                resolveVillageIds(villageId, tambonId, amphurId, provinceId)));
    }

    @GetMapping("/issues-summary")
    public ResponseEntity<?> issuesSummary(
            @RequestParam(required = false) Integer villageId,
            @RequestParam(required = false) Integer tambonId,
            @RequestParam(required = false) Integer amphurId,
            @RequestParam(required = false) Integer provinceId) {
        return ResponseEntity.ok(dashboardService.getIssuesSummary(
                resolveVillageIds(villageId, tambonId, amphurId, provinceId)));
    }

    @GetMapping("/visit-stats")
    public ResponseEntity<?> visitStats(
            @RequestParam(required = false) Integer villageId,
            @RequestParam(required = false) Integer tambonId,
            @RequestParam(required = false) Integer amphurId,
            @RequestParam(required = false) Integer provinceId) {
        return ResponseEntity.ok(dashboardService.getVisitStats(
                resolveVillageIds(villageId, tambonId, amphurId, provinceId)));
    }

    @GetMapping("/income-summary")
    public ResponseEntity<?> incomeSummary(
            @RequestParam(required = false) Integer villageId,
            @RequestParam(required = false) Integer tambonId,
            @RequestParam(required = false) Integer amphurId,
            @RequestParam(required = false) Integer provinceId) {
        return ResponseEntity.ok(dashboardService.getIncomeSummary(
                resolveVillageIds(villageId, tambonId, amphurId, provinceId)));
    }

    @GetMapping("/health-index")
    public ResponseEntity<?> healthIndex(
            @RequestParam(required = false) Integer villageId,
            @RequestParam(required = false) Integer tambonId,
            @RequestParam(required = false) Integer amphurId,
            @RequestParam(required = false) Integer provinceId) {
        return ResponseEntity.ok(dashboardService.getHealthIndex(
                resolveVillageIds(villageId, tambonId, amphurId, provinceId)));
    }

    // legacy — NotificationDropdown ใช้
    @GetMapping("/stats")
    public ResponseEntity<?> stats(
            @RequestParam(required = false) Integer villageId,
            @RequestParam(required = false) Integer tambonId,
            @RequestParam(required = false) Integer amphurId,
            @RequestParam(required = false) Integer provinceId) {
        return ResponseEntity.ok(dashboardService.getPopulation(
                resolveVillageIds(villageId, tambonId, amphurId, provinceId)));
    }
}
