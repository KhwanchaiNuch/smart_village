package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.entity.HouseholdEconomic;
import com.k2dev.smart_village.repository.HouseholdEconomicRepository;
import com.k2dev.smart_village.repository.HouseholdRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import com.k2dev.smart_village.service.GeoScopeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/household-economics")
public class HouseholdEconomicController {

    @Autowired private HouseholdEconomicRepository repo;
    @Autowired private HouseholdRepository householdRepo;
    @Autowired private GeoScopeService geoScope;

    private boolean householdOwned(Long householdId) {
        if (householdId == null) return false;
        Household hh = householdRepo.findById(householdId.intValue()).orElse(null);
        Integer scopeId = ScopeUtil.getScopeId();
        return hh != null && scopeId != null && scopeId.equals(hh.getVillageId());
    }

    @GetMapping
    public List<HouseholdEconomic> list(@RequestParam(required = false) Integer villageId) {
        if (villageId != null) {
            List<Long> hhIds = householdRepo.findByVillageId(villageId).stream()
                    .map(h -> h.getHouseholdId().longValue()).toList();
            return hhIds.isEmpty() ? List.of() : repo.findByHouseholdIdIn(hhIds);
        }
        if (ScopeUtil.isAdmin()) return repo.findAll();
        List<Integer> vids = geoScope.getVillageIds();
        if (vids == null) return repo.findAll();
        if (vids.isEmpty()) return List.of();
        List<Long> hhIds = householdRepo.findByVillageIdIn(vids).stream()
                .map(h -> h.getHouseholdId().longValue()).toList();
        return hhIds.isEmpty() ? List.of() : repo.findByHouseholdIdIn(hhIds);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        HouseholdEconomic e = repo.findById(id).orElse(null);
        if (e == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
        if (ScopeUtil.isVillageLevel() && !householdOwned(e.getHouseholdId()))
            return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้"));
        return ResponseEntity.ok(e);
    }

    @GetMapping("/by-household/{householdId}")
    public List<HouseholdEconomic> byHousehold(@PathVariable Long householdId) {
        return repo.findByHouseholdId(householdId);
    }

    @GetMapping("/poor")
    public List<HouseholdEconomic> poor() {
        return repo.findByPoorFlag(true);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody HouseholdEconomic e) {
        try {
            if (ScopeUtil.isVillageLevel() && !householdOwned(e.getHouseholdId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เพิ่มข้อมูลในหมู่บ้านอื่น"));
            return ResponseEntity.ok(repo.save(e));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody HouseholdEconomic e) {
        try {
            if (ScopeUtil.isVillageLevel()) {
                HouseholdEconomic existing = repo.findById(e.getId()).orElse(null);
                if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
                if (!householdOwned(existing.getHouseholdId()))
                    return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์แก้ไขข้อมูลของหมู่บ้านอื่น"));
            }
            return ResponseEntity.ok(repo.save(e));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            HouseholdEconomic existing = repo.findById(id).orElse(null);
            if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            if (ScopeUtil.isVillageLevel() && !householdOwned(existing.getHouseholdId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์ลบข้อมูลของหมู่บ้านอื่น"));
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }
}
