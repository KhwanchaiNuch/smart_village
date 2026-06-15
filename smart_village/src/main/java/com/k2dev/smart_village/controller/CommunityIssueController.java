package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.CommunityIssue;
import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.repository.CommunityIssueRepository;
import com.k2dev.smart_village.repository.HouseholdRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import com.k2dev.smart_village.service.GeoScopeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community-issues")
public class CommunityIssueController {

    @Autowired private CommunityIssueRepository repo;
    @Autowired private HouseholdRepository householdRepo;
    @Autowired private GeoScopeService geoScope;

    private boolean householdOwned(Long householdId) {
        if (householdId == null) return false;
        Household hh = householdRepo.findById(householdId.intValue()).orElse(null);
        Integer vid = ScopeUtil.getScopeId();
        return hh != null && vid != null && vid.equals(hh.getVillageId());
    }

    @GetMapping
    public List<CommunityIssue> list(@RequestParam(required = false) Integer villageId) {
        if (ScopeUtil.isAdmin()) {
            if (villageId != null) {
                List<Long> hhIds = householdRepo.findByVillageId(villageId).stream()
                        .map(h -> h.getHouseholdId().longValue()).toList();
                return hhIds.isEmpty() ? List.of() : repo.findByHouseholdIdIn(hhIds);
            }
            return repo.findAll();
        }
        List<Integer> vids = geoScope.getVillageIds();
        if (vids == null) return repo.findAll();
        if (vids.isEmpty()) return List.of();
        List<Long> hhIds = householdRepo.findByVillageIdIn(vids).stream()
                .map(h -> h.getHouseholdId().longValue()).toList();
        return hhIds.isEmpty() ? List.of() : repo.findByHouseholdIdIn(hhIds);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        CommunityIssue c = repo.findById(id).orElse(null);
        if (c == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
        if (!ScopeUtil.isAdmin() && !householdOwned(c.getHouseholdId()))
            return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้"));
        return ResponseEntity.ok(c);
    }

    @GetMapping("/by-status/{status}")
    public List<CommunityIssue> byStatus(@PathVariable String status) {
        return repo.findByStatus(status);
    }

    @GetMapping("/by-household/{householdId}")
    public List<CommunityIssue> byHousehold(@PathVariable Long householdId) {
        return repo.findByHouseholdId(householdId);
    }

    @GetMapping("/by-type/{issueType}")
    public List<CommunityIssue> byType(@PathVariable String issueType) {
        return repo.findByIssueType(issueType);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody CommunityIssue issue) {
        try {
            if (!ScopeUtil.isAdmin() && !householdOwned(issue.getHouseholdId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เพิ่มข้อมูลในหมู่บ้านอื่น"));
            return ResponseEntity.ok(repo.save(issue));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody CommunityIssue issue) {
        try {
            if (!ScopeUtil.isAdmin()) {
                CommunityIssue existing = repo.findById(issue.getId()).orElse(null);
                if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
                if (!householdOwned(existing.getHouseholdId()))
                    return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์แก้ไขข้อมูลของหมู่บ้านอื่น"));
            }
            return ResponseEntity.ok(repo.save(issue));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            CommunityIssue existing = repo.findById(id).orElse(null);
            if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            if (!ScopeUtil.isAdmin() && !householdOwned(existing.getHouseholdId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์ลบข้อมูลของหมู่บ้านอื่น"));
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }
}
