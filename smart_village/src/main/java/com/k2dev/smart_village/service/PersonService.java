package com.k2dev.smart_village.service;

import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.entity.Person;
import com.k2dev.smart_village.repository.HouseholdRepository;
import com.k2dev.smart_village.repository.PersonRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class PersonService {

    @Autowired private PersonRepository repo;
    @Autowired private HouseholdRepository householdRepo;
    @Autowired private GeoScopeService geoScope;

    private boolean householdOwned(Integer householdId) {
        if (householdId == null) return false;
        Household hh = householdRepo.findById(householdId).orElse(null);
        Integer scopeId = ScopeUtil.getScopeId();
        return hh != null && scopeId != null && scopeId.equals(hh.getVillageId());
    }

    public List<Person> list(Integer villageId) {
        if (ScopeUtil.isAdmin()) {
            if (villageId != null) {
                List<Integer> hhIds = householdRepo.findByVillageId(villageId).stream()
                        .map(Household::getHouseholdId).toList();
                return hhIds.isEmpty() ? List.of() : repo.findByHouseholdIdIn(hhIds);
            }
            return repo.findAll();
        }
        List<Integer> vids = geoScope.getVillageIds();
        if (vids == null) return repo.findAll();
        if (vids.isEmpty()) return List.of();
        if (villageId != null && vids.contains(villageId)) vids = List.of(villageId);
        List<Integer> hhIds = householdRepo.findByVillageIdIn(vids).stream()
                .map(Household::getHouseholdId).toList();
        return hhIds.isEmpty() ? List.of() : repo.findByHouseholdIdIn(hhIds);
    }

    public List<Person> listByVillage(Integer villageId) {
        List<Integer> hhIds = householdRepo.findByVillageId(villageId).stream()
                .map(Household::getHouseholdId).toList();
        return repo.findByHouseholdIdIn(hhIds);
    }

    public List<Person> listByHousehold(Integer householdId) {
        return repo.findByHouseholdId(householdId);
    }

    public ResponseEntity<?> get(Integer id) {
        return repo.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    public ResponseEntity<?> add(Person p) {
        try {
            p.setPersonId(null);
            if (ScopeUtil.isVillageLevel() && !householdOwned(p.getHouseholdId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เพิ่มข้อมูลในหมู่บ้านอื่น"));
            return ResponseEntity.ok(repo.save(p));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาดในการบันทึก"));
        }
    }

    public ResponseEntity<?> edit(Person p) {
        try {
            if (p.getPersonId() == null)
                return ResponseEntity.badRequest().body(Map.of("message", "ต้องระบุ personId"));
            if (ScopeUtil.isVillageLevel()) {
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

    public ResponseEntity<?> delete(Integer id) {
        try {
            Person existing = repo.findById(id).orElse(null);
            if (existing == null) return ResponseEntity.notFound().build();
            if (ScopeUtil.isVillageLevel() && !householdOwned(existing.getHouseholdId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์ลบข้อมูลของหมู่บ้านอื่น"));
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "ลบไม่สำเร็จ อาจมีข้อมูลที่เชื่อมกับบุคคลนี้อยู่"));
        }
    }
}
