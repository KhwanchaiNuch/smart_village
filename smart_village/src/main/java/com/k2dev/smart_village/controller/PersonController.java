package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.entity.Person;
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
@RequestMapping("/api/persons")
public class PersonController {

    @Autowired private PersonRepository repo;
    @Autowired private HouseholdRepository householdRepo;
    @Autowired private GeoScopeService geoScope;

    // ─── helper: ตรวจว่า household ของ person นี้อยู่ใน village ของ user ────
    private boolean householdOwned(Integer householdId) {
        if (householdId == null) return false;
        Integer vid = ScopeUtil.getScopeId();
        Household hh = householdRepo.findById(householdId).orElse(null);
        return hh != null && vid != null && vid.equals(hh.getVillageId());
    }

    @GetMapping
    public List<Person> list(@RequestParam(required = false) Integer villageId) {
        if (ScopeUtil.isAdmin()) {
            if (villageId != null) {
                List<Integer> hhIds = householdRepo.findByVillageId(villageId).stream()
                        .map(Household::getHouseholdId).toList();
                return hhIds.isEmpty() ? List.of() : repo.findByHouseholdIdIn(hhIds);
            }
            return repo.findAll();
        }
        // hierarchical scope
        List<Integer> vids = geoScope.getVillageIds();
        if (vids == null) return repo.findAll();
        if (vids.isEmpty()) return List.of();
        List<Integer> hhIds = householdRepo.findByVillageIdIn(vids).stream()
                .map(Household::getHouseholdId).toList();
        return hhIds.isEmpty() ? List.of() : repo.findByHouseholdIdIn(hhIds);
    }

    @GetMapping("/by-village/{villageId}")
    public List<Person> listByVillage(@PathVariable Integer villageId) {
        List<Integer> hhIds = householdRepo.findByVillageId(villageId).stream()
                .map(Household::getHouseholdId).toList();
        return repo.findByHouseholdIdIn(hhIds);
    }

    @GetMapping("/by-household/{householdId}")
    public List<Person> listByHousehold(@PathVariable Integer householdId) {
        return repo.findByHouseholdId(householdId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Integer id) {
        return repo.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody Person p) {
        try {
            p.setPersonId(null);
            if (!ScopeUtil.isAdmin() && !householdOwned(p.getHouseholdId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เพิ่มข้อมูลในหมู่บ้านอื่น"));
            return ResponseEntity.ok(repo.save(p));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาดในการบันทึก"));
        }
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody Person p) {
        try {
            if (p.getPersonId() == null)
                return ResponseEntity.badRequest().body(Map.of("message", "ต้องระบุ personId"));
            if (!ScopeUtil.isAdmin()) {
                Person existing = repo.findById(p.getPersonId()).orElse(null);
                if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบบุคคลนี้"));
                if (!householdOwned(existing.getHouseholdId()))
                    return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์แก้ไขข้อมูลของหมู่บ้านอื่น"));
            }
            return ResponseEntity.ok(repo.save(p));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาดในการแก้ไข"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        try {
            Person existing = repo.findById(id).orElse(null);
            if (existing == null) return ResponseEntity.notFound().build();
            if (!ScopeUtil.isAdmin() && !householdOwned(existing.getHouseholdId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์ลบข้อมูลของหมู่บ้านอื่น"));
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "ลบไม่สำเร็จ อาจมีข้อมูลที่เชื่อมกับบุคคลนี้อยู่"));
        }
    }
}
