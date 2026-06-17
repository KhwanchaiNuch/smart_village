package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.entity.VillageNeedSurvey;
import com.k2dev.smart_village.repository.HouseholdRepository;
import com.k2dev.smart_village.repository.VillageNeedSurveyRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import com.k2dev.smart_village.service.GeoScopeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/village-need-surveys")
public class VillageNeedSurveyController {

    @Autowired private VillageNeedSurveyRepository repo;
    @Autowired private HouseholdRepository householdRepo;
    @Autowired private GeoScopeService geoScope;

    private boolean householdOwned(Integer householdId) {
        if (householdId == null) return false;
        Household hh = householdRepo.findById(householdId).orElse(null);
        Integer scopeId = ScopeUtil.getScopeId();
        return hh != null && scopeId != null && scopeId.equals(hh.getVillageId());
    }

    @GetMapping
    public List<VillageNeedSurvey> list(@RequestParam(required = false) Integer villageId) {
        if (villageId != null) {
            List<Integer> hhIds = householdRepo.findByVillageId(villageId).stream()
                    .map(Household::getHouseholdId).toList();
            return hhIds.isEmpty() ? List.of() : repo.findByHouseholdIdIn(hhIds);
        }
        if (ScopeUtil.isAdmin()) return repo.findAll();
        List<Integer> vids = geoScope.getVillageIds();
        if (vids == null) return repo.findAll();
        if (vids.isEmpty()) return List.of();
        List<Integer> hhIds = householdRepo.findByVillageIdIn(vids).stream()
                .map(Household::getHouseholdId).toList();
        return hhIds.isEmpty() ? List.of() : repo.findByHouseholdIdIn(hhIds);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Integer id) {
        VillageNeedSurvey s = repo.findById(id).orElse(null);
        if (s == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
        if (ScopeUtil.isVillageLevel() && !householdOwned(s.getHouseholdId()))
            return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้"));
        return ResponseEntity.ok(s);
    }

    @GetMapping("/by-household/{householdId}")
    public List<VillageNeedSurvey> byHousehold(@PathVariable Integer householdId) {
        return repo.findByHouseholdId(householdId);
    }

    @GetMapping("/by-person/{personId}")
    public List<VillageNeedSurvey> byPerson(@PathVariable Integer personId) {
        return repo.findByPersonId(personId);
    }

    @GetMapping("/by-need-type/{needType}")
    public List<VillageNeedSurvey> byNeedType(@PathVariable String needType) {
        return repo.findByNeedType(needType);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody VillageNeedSurvey e) {
        try {
            if (ScopeUtil.isVillageLevel() && !householdOwned(e.getHouseholdId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เพิ่มข้อมูลในหมู่บ้านอื่น"));
            e.setSurveyId(null);
            return ResponseEntity.ok(repo.save(e));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody VillageNeedSurvey e) {
        try {
            if (ScopeUtil.isVillageLevel()) {
                VillageNeedSurvey existing = repo.findById(e.getSurveyId()).orElse(null);
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
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        try {
            VillageNeedSurvey existing = repo.findById(id).orElse(null);
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
