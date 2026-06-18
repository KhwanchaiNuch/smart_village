package com.k2dev.smart_village.service;

import com.k2dev.smart_village.entity.HealthRecord;
import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.entity.Person;
import com.k2dev.smart_village.repository.HealthRecordRepository;
import com.k2dev.smart_village.repository.HouseholdRepository;
import com.k2dev.smart_village.repository.PersonRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class HealthRecordService {

    @Autowired private HealthRecordRepository repo;
    @Autowired private HouseholdRepository householdRepo;
    @Autowired private PersonRepository personRepo;
    @Autowired private GeoScopeService geoScope;

    private boolean personOwned(Long personId) {
        if (personId == null) return false;
        if (ScopeUtil.isAdmin()) return true;
        Person person = personRepo.findById(personId.intValue()).orElse(null);
        if (person == null || person.getHouseholdId() == null) return false;
        Household hh = householdRepo.findById(person.getHouseholdId()).orElse(null);
        if (hh == null || hh.getVillageId() == null) return false;
        List<Integer> allowedVillageIds = geoScope.getVillageIds();
        return allowedVillageIds != null && allowedVillageIds.contains(hh.getVillageId());
    }

    private List<HealthRecord> getRecordsBySingleVillage(Integer villageId) {
        List<Integer> hhIds = householdRepo.findByVillageId(villageId).stream()
                .map(Household::getHouseholdId).toList();
        if (hhIds.isEmpty()) return List.of();
        List<Long> pIds = personRepo.findByHouseholdIdIn(hhIds).stream()
                .map(p -> p.getPersonId().longValue()).toList();
        return pIds.isEmpty() ? List.of() : repo.findByPersonIdIn(pIds);
    }

    private List<HealthRecord> getRecordsByMultipleVillages(List<Integer> vids) {
        List<Integer> hhIds = householdRepo.findByVillageIdIn(vids).stream()
                .map(Household::getHouseholdId).toList();
        if (hhIds.isEmpty()) return List.of();
        List<Long> personIds = personRepo.findByHouseholdIdIn(hhIds).stream()
                .map(p -> p.getPersonId().longValue()).toList();
        return personIds.isEmpty() ? List.of() : repo.findByPersonIdIn(personIds);
    }

    public List<HealthRecord> list(Integer villageId) {
        if (ScopeUtil.isAdmin()) {
            if (villageId != null) return getRecordsBySingleVillage(villageId);
            return repo.findAll();
        }
        List<Integer> vids = geoScope.getVillageIds();
        if (vids == null) return repo.findAll();
        if (vids.isEmpty()) return List.of();
        if (villageId != null) {
            if (vids.contains(villageId)) return getRecordsBySingleVillage(villageId);
            else return List.of();
        }
        return getRecordsByMultipleVillages(vids);
    }

    public ResponseEntity<?> get(Long id) {
        HealthRecord hr = repo.findById(id).orElse(null);
        if (hr == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
        if (!personOwned(hr.getPersonId()))
            return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้"));
        return ResponseEntity.ok(hr);
    }

    public ResponseEntity<?> add(HealthRecord h) {
        try {
            if (!personOwned(h.getPersonId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เพิ่มข้อมูลนอกขอบเขตพื้นที่ที่ดูแล"));
            return ResponseEntity.ok(repo.save(h));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    public ResponseEntity<?> edit(HealthRecord h) {
        try {
            HealthRecord existing = repo.findById(h.getId()).orElse(null);
            if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            if (!personOwned(existing.getPersonId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์แก้ไขข้อมูลนอกขอบเขตพื้นที่ที่ดูแล"));
            if (!personOwned(h.getPersonId()))
                return ResponseEntity.status(403).body(Map.of("message", "ข้อมูลบุคคลใหม่ไม่อยู่ในขอบเขตพื้นที่ที่ดูแล"));
            return ResponseEntity.ok(repo.save(h));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    public ResponseEntity<?> delete(Long id) {
        try {
            HealthRecord existing = repo.findById(id).orElse(null);
            if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            if (!personOwned(existing.getPersonId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์ลบข้อมูลนอกขอบเขตพื้นที่ที่ดูแล"));
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }
}
