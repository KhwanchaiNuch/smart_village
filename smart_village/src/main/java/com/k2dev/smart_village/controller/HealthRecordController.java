package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.HealthRecord;
import com.k2dev.smart_village.entity.Person;
import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.repository.HealthRecordRepository;
import com.k2dev.smart_village.repository.HouseholdRepository;
import com.k2dev.smart_village.repository.PersonRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import com.k2dev.smart_village.service.GeoScopeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/health-records")
public class HealthRecordController {

    @Autowired private HealthRecordRepository repo;
    @Autowired private HouseholdRepository householdRepo;
    @Autowired private PersonRepository personRepo;
    @Autowired private GeoScopeService geoScope;

    // ─── helper: ตรวจว่า person (via personId) อยู่ใน scope ของ user ────────
    private boolean personOwned(Long personId) {
        if (personId == null) return false;
        Person person = personRepo.findById(personId.intValue()).orElse(null);
        if (person == null || person.getHouseholdId() == null) return false;
        Household hh = householdRepo.findById(person.getHouseholdId()).orElse(null);
        Integer scopeId = ScopeUtil.getScopeId();
        return hh != null && scopeId != null && scopeId.equals(hh.getVillageId());
    }

    @GetMapping
    public List<HealthRecord> list(@RequestParam(required = false) Integer villageId) {
        if (ScopeUtil.isAdmin()) {
            if (villageId != null) {
                List<Integer> hhIds = householdRepo.findByVillageId(villageId).stream()
                        .map(Household::getHouseholdId).toList();
                List<Long> pIds = personRepo.findByHouseholdIdIn(hhIds).stream()
                        .map(p -> p.getPersonId().longValue()).toList();
                return pIds.isEmpty() ? List.of() : repo.findByPersonIdIn(pIds);
            }
            return repo.findAll();
        }
        List<Integer> vids = geoScope.getVillageIds();
        if (vids == null) return repo.findAll();
        if (vids.isEmpty()) return List.of();
        List<Integer> hhIds = householdRepo.findByVillageIdIn(vids).stream()
                .map(Household::getHouseholdId).toList();
        if (hhIds.isEmpty()) return List.of();
        List<Long> personIds = personRepo.findByHouseholdIdIn(hhIds).stream()
                .map(p -> p.getPersonId().longValue()).toList();
        return personIds.isEmpty() ? List.of() : repo.findByPersonIdIn(personIds);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        HealthRecord hr = repo.findById(id).orElse(null);
        if (hr == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
        if (ScopeUtil.isVillageLevel() && !personOwned(hr.getPersonId()))
            return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้"));
        return ResponseEntity.ok(hr);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody HealthRecord h) {
        try {
            if (ScopeUtil.isVillageLevel() && !personOwned(h.getPersonId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เพิ่มข้อมูลในหมู่บ้านอื่น"));
            return ResponseEntity.ok(repo.save(h));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody HealthRecord h) {
        try {
            if (ScopeUtil.isVillageLevel()) {
                HealthRecord existing = repo.findById(h.getId()).orElse(null);
                if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
                if (!personOwned(existing.getPersonId()))
                    return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์แก้ไขข้อมูลของหมู่บ้านอื่น"));
            }
            return ResponseEntity.ok(repo.save(h));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            HealthRecord existing = repo.findById(id).orElse(null);
            if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            if (ScopeUtil.isVillageLevel() && !personOwned(existing.getPersonId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์ลบข้อมูลของหมู่บ้านอื่น"));
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }
}
