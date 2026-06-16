package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Person;
import com.k2dev.smart_village.entity.PersonSkill;
import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.repository.HouseholdRepository;
import com.k2dev.smart_village.repository.PersonRepository;
import com.k2dev.smart_village.repository.PersonSkillRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import com.k2dev.smart_village.service.GeoScopeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/person-skills")
public class PersonSkillController {

    @Autowired private PersonSkillRepository repo;
    @Autowired private HouseholdRepository householdRepo;
    @Autowired private PersonRepository personRepo;
    @Autowired private GeoScopeService geoScope;

    /** ตรวจสอบว่า person นี้อยู่ในหมู่บ้านของ user */
    private boolean personOwned(Integer personId) {
        if (personId == null) return false;
        Person p = personRepo.findById(personId).orElse(null);
        if (p == null) return false;
        Household hh = householdRepo.findById(p.getHouseholdId()).orElse(null);
        Integer vid = ScopeUtil.getScopeId();
        return hh != null && vid != null && vid.equals(hh.getVillageId());
    }

    @GetMapping
    public List<PersonSkill> list() {
        if (ScopeUtil.isAdmin()) return repo.findAll();
        List<Integer> vids = geoScope.getVillageIds();
        if (vids == null) return repo.findAll();
        if (vids.isEmpty()) return List.of();
        List<Integer> hhIds = householdRepo.findByVillageIdIn(vids).stream()
                .map(Household::getHouseholdId).toList();
        if (hhIds.isEmpty()) return List.of();
        List<Integer> personIds = personRepo.findByHouseholdIdIn(hhIds).stream()
                .map(p -> p.getPersonId()).toList();
        return personIds.isEmpty() ? List.of() : repo.findByPersonIdIn(personIds);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Integer id) {
        PersonSkill s = repo.findById(id).orElse(null);
        if (s == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
        if (!ScopeUtil.isAdmin() && !personOwned(s.getPersonId()))
            return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้"));
        return ResponseEntity.ok(s);
    }

    @GetMapping("/by-person/{personId}")
    public List<PersonSkill> byPerson(@PathVariable Integer personId) {
        return repo.findByPersonId(personId);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody PersonSkill e) {
        try {
            if (!ScopeUtil.isAdmin() && !personOwned(e.getPersonId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เพิ่มข้อมูลในหมู่บ้านอื่น"));
            e.setSkillId(null);
            return ResponseEntity.ok(repo.save(e));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody PersonSkill e) {
        try {
            if (!ScopeUtil.isAdmin()) {
                PersonSkill existing = repo.findById(e.getSkillId()).orElse(null);
                if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
                if (!personOwned(existing.getPersonId()))
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
            PersonSkill existing = repo.findById(id).orElse(null);
            if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            if (!ScopeUtil.isAdmin() && !personOwned(existing.getPersonId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์ลบข้อมูลของหมู่บ้านอื่น"));
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }
}
