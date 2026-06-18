package com.k2dev.smart_village.service;

import com.k2dev.smart_village.entity.Amphur;
import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.entity.Person;
import com.k2dev.smart_village.entity.Tambon;
import com.k2dev.smart_village.entity.Village;
import com.k2dev.smart_village.repository.*;
import com.k2dev.smart_village.security.ScopeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class HouseholdService {

    @Autowired private HouseholdRepository repo;
    @Autowired private GeoScopeService geoScope;
    @Autowired private HouseholdEconomicRepository economicRepo;
    @Autowired private PersonRepository personRepo;
    @Autowired private VisitLogRepository visitLogRepo;
    @Autowired private CommunityIssueRepository communityIssueRepo;
    @Autowired private VillageNeedSurveyRepository needSurveyRepo;
    @Autowired private VillageRepository villageRepo;
    @Autowired private TambonRepository tambonRepo;
    @Autowired private AmphurRepository amphurRepo;

    private boolean notOwned(Household h) {
        Integer vid = ScopeUtil.getScopeId();
        return vid == null || !vid.equals(h.getVillageId());
    }

    public List<Integer> resolveVillageIds(Integer villageId, Integer tambonId,
                                            Integer amphurId, Integer provinceId) {
        if (villageId != null) return List.of(villageId);
        if (tambonId != null)
            return villageRepo.findByTambonId(tambonId).stream().map(Village::getVillageId).toList();
        if (amphurId != null) {
            List<Integer> tIds = tambonRepo.findByAmphurId(amphurId).stream().map(Tambon::getTambonId).toList();
            return tIds.isEmpty() ? List.of() : villageRepo.findByTambonIdIn(tIds).stream().map(Village::getVillageId).toList();
        }
        if (provinceId != null) {
            List<Integer> aIds = amphurRepo.findByProvinceId(provinceId).stream().map(Amphur::getAmphurId).toList();
            if (aIds.isEmpty()) return List.of();
            List<Integer> tIds = tambonRepo.findByAmphurIdIn(aIds).stream().map(Tambon::getTambonId).toList();
            return tIds.isEmpty() ? List.of() : villageRepo.findByTambonIdIn(tIds).stream().map(Village::getVillageId).toList();
        }
        return null;
    }

    public List<Household> list(Integer villageId, Integer tambonId, Integer amphurId, Integer provinceId) {
        if (ScopeUtil.isAdmin()) {
            List<Integer> vids = resolveVillageIds(villageId, tambonId, amphurId, provinceId);
            if (vids == null) return repo.findAll();
            if (vids.isEmpty()) return List.of();
            return repo.findByVillageIdIn(vids);
        }
        List<Integer> scopeVids = geoScope.getVillageIds();
        if (scopeVids == null) return repo.findAll();
        if (scopeVids.isEmpty()) return List.of();
        List<Integer> reqVids = resolveVillageIds(villageId, tambonId, amphurId, provinceId);
        if (reqVids == null) return repo.findByVillageIdIn(scopeVids);
        List<Integer> intersect = reqVids.stream().filter(scopeVids::contains).toList();
        if (intersect.isEmpty()) return List.of();
        return repo.findByVillageIdIn(intersect);
    }

    public List<Household> listByVillage(Integer villageId) {
        return repo.findByVillageId(villageId);
    }

    public ResponseEntity<?> get(Integer id) {
        Household h = repo.findById(id).orElse(null);
        if (h == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบครัวเรือนนี้"));
        if (ScopeUtil.isVillageLevel() && notOwned(h))
            return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้"));
        return ResponseEntity.ok(h);
    }

    public ResponseEntity<?> add(Household h) {
        try {
            if (ScopeUtil.isVillageLevel()) {
                Integer vid = ScopeUtil.getScopeId();
                if (vid == null)
                    return ResponseEntity.badRequest().body(Map.of("message", "ไม่พบ scopeId กรุณา login ใหม่"));
                if (villageRepo.findById(vid).isEmpty())
                    return ResponseEntity.badRequest().body(Map.of("message", "ไม่พบหมู่บ้าน กรุณาให้ admin สร้างหมู่บ้านก่อน"));
                h.setVillageId(vid);
            } else if (!ScopeUtil.isAdmin() && h.getVillageId() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "กรุณาเลือกหมู่บ้าน"));
            } else if (ScopeUtil.isAdmin() && h.getVillageId() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "กรุณาระบุ villageId"));
            }
            h.setHouseholdId(null);
            return ResponseEntity.ok(repo.save(h));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    public ResponseEntity<?> edit(Household h) {
        try {
            if (h.getHouseholdId() == null)
                return ResponseEntity.badRequest().body(Map.of("message", "กรุณาระบุ householdId"));
            Household existing = repo.findById(h.getHouseholdId()).orElse(null);
            if (existing == null)
                return ResponseEntity.status(404).body(Map.of("message", "ไม่พบครัวเรือนนี้"));
            if (ScopeUtil.isVillageLevel()) {
                if (notOwned(existing))
                    return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์แก้ไขข้อมูลของหมู่บ้านอื่น"));
                h.setVillageId(ScopeUtil.getScopeId());
            }
            return ResponseEntity.ok(repo.save(h));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    public ResponseEntity<?> delete(Integer id) {
        try {
            Household existing = repo.findById(id).orElse(null);
            if (existing == null)
                return ResponseEntity.status(404).body(Map.of("message", "ไม่พบครัวเรือนนี้"));
            if (ScopeUtil.isVillageLevel() && notOwned(existing))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์ลบข้อมูลของหมู่บ้านอื่น"));

            Long hhIdLong = id.longValue();
            economicRepo.deleteAll(economicRepo.findByHouseholdId(hhIdLong));
            communityIssueRepo.deleteAll(communityIssueRepo.findByHouseholdId(hhIdLong));
            visitLogRepo.deleteAll(visitLogRepo.findByHouseholdId(hhIdLong));
            needSurveyRepo.deleteAll(needSurveyRepo.findByHouseholdId(id));

            List<Person> persons = personRepo.findByHouseholdId(id);
            personRepo.deleteAll(persons);

            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }
}
