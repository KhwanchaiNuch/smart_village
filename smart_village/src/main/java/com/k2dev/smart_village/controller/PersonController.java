package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Person;
import com.k2dev.smart_village.repository.HouseholdRepository;
import com.k2dev.smart_village.repository.PersonRepository;
import com.k2dev.smart_village.security.ScopeUtil;
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

    @GetMapping
    public List<Person> list() {
        if (ScopeUtil.isAdmin()) return repo.findAll();
        Integer vid = ScopeUtil.getScopeId();
        if (vid == null) return List.of();
        List<Integer> hhIds = householdRepo.findByVillageId(vid).stream()
                .map(h -> h.getHouseholdId()).toList();
        return repo.findByHouseholdIdIn(hhIds);
    }

    @GetMapping("/by-village/{villageId}")
    public List<Person> listByVillage(@PathVariable Integer villageId) {
        List<Integer> hhIds = householdRepo.findByVillageId(villageId).stream()
                .map(h -> h.getHouseholdId()).toList();
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
            return ResponseEntity.ok(repo.save(p));
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาดในการบันทึก";
            return ResponseEntity.status(500).body(Map.of("message", msg));
        }
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody Person p) {
        try {
            if (p.getPersonId() == null)
                return ResponseEntity.badRequest().body(Map.of("message", "ต้องระบุ personId"));
            return ResponseEntity.ok(repo.save(p));
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาดในการแก้ไข";
            return ResponseEntity.status(500).body(Map.of("message", msg));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        try {
            if (!repo.existsById(id))
                return ResponseEntity.notFound().build();
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "ลบไม่สำเร็จ อาจมีข้อมูลที่เชื่อมกับบุคคลนี้อยู่";
            return ResponseEntity.status(500).body(Map.of("message", msg));
        }
    }
}
