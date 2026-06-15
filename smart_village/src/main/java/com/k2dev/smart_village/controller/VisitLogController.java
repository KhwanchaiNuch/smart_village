package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.entity.VisitLog;
import com.k2dev.smart_village.repository.HouseholdRepository;
import com.k2dev.smart_village.repository.VisitLogRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import com.k2dev.smart_village.service.GeoScopeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/visit-logs")
public class VisitLogController {

    @Autowired private VisitLogRepository repo;
    @Autowired private HouseholdRepository householdRepo;
    @Autowired private GeoScopeService geoScope;

    private boolean householdOwned(Long householdId) {
        if (householdId == null) return false;
        Household hh = householdRepo.findById(householdId.intValue()).orElse(null);
        Integer vid = ScopeUtil.getScopeId();
        return hh != null && vid != null && vid.equals(hh.getVillageId());
    }

    @GetMapping
    public List<VisitLog> list(@RequestParam(required = false) Integer villageId) {
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
        VisitLog v = repo.findById(id).orElse(null);
        if (v == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
        if (!ScopeUtil.isAdmin() && !householdOwned(v.getHouseholdId()))
            return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้"));
        return ResponseEntity.ok(v);
    }

    @GetMapping("/by-person/{personId}")
    public List<VisitLog> byPerson(@PathVariable Long personId) {
        return repo.findByPersonId(personId);
    }

    @GetMapping("/by-household/{householdId}")
    public List<VisitLog> byHousehold(@PathVariable Long householdId) {
        return repo.findByHouseholdId(householdId);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody VisitLog v) {
        try {
            if (!ScopeUtil.isAdmin() && !householdOwned(v.getHouseholdId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เพิ่มข้อมูลในหมู่บ้านอื่น"));
            return ResponseEntity.ok(repo.save(v));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody VisitLog v) {
        try {
            if (!ScopeUtil.isAdmin()) {
                VisitLog existing = repo.findById(v.getId()).orElse(null);
                if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
                if (!householdOwned(existing.getHouseholdId()))
                    return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์แก้ไขข้อมูลของหมู่บ้านอื่น"));
            }
            return ResponseEntity.ok(repo.save(v));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            VisitLog existing = repo.findById(id).orElse(null);
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
