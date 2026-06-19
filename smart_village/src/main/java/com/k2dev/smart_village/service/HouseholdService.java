package com.k2dev.smart_village.service;

import com.k2dev.smart_village.entity.Amphur;
import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.entity.Person;
import com.k2dev.smart_village.entity.Tambon;
import com.k2dev.smart_village.entity.Village;
import com.k2dev.smart_village.repository.*;
import com.k2dev.smart_village.security.ScopeUtil;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

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
    @Autowired private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void initUploadDir() {
        try {
            Files.createDirectories(Paths.get("./uploads/household").toAbsolutePath());
        } catch (Exception e) {
            System.err.println("[HouseholdService] Could not create uploads dir: " + e.getMessage());
        }
    }

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
            if (h.getHouseImageUrl() == null) {
                h.setHouseImageUrl(existing.getHouseImageUrl());
            }
            return ResponseEntity.ok(repo.save(h));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    public List<Map<String, Object>> mapMarkers(Integer villageId, Integer tambonId,
                                                Integer amphurId, Integer provinceId) {
        List<Integer> vids;
        if (villageId != null) {
            vids = List.of(villageId);
        } else if (tambonId != null) {
            vids = villageRepo.findByTambonId(tambonId).stream().map(Village::getVillageId).toList();
        } else if (amphurId != null) {
            List<Integer> tIds = tambonRepo.findByAmphurId(amphurId).stream().map(Tambon::getTambonId).toList();
            vids = tIds.isEmpty() ? List.of() : villageRepo.findByTambonIdIn(tIds).stream().map(Village::getVillageId).toList();
        } else if (provinceId != null) {
            List<Integer> aIds = amphurRepo.findByProvinceId(provinceId).stream().map(Amphur::getAmphurId).toList();
            List<Integer> tIds = aIds.isEmpty() ? List.of() : tambonRepo.findByAmphurIdIn(aIds).stream().map(Tambon::getTambonId).toList();
            vids = tIds.isEmpty() ? List.of() : villageRepo.findByTambonIdIn(tIds).stream().map(Village::getVillageId).toList();
        } else {
            vids = null;
        }

        List<Household> households = (vids == null) ? repo.findAll()
                : vids.isEmpty() ? List.of() : repo.findByVillageIdIn(vids);

        List<Integer> hhIds = households.stream().map(Household::getHouseholdId).toList();
        List<Person> persons = hhIds.isEmpty() ? List.of() : personRepo.findByHouseholdIdIn(hhIds);

        java.util.Map<Integer, Integer> sickCount = new java.util.HashMap<>();
        java.util.Map<Integer, Integer> bedriddenCount = new java.util.HashMap<>();
        java.util.Map<Integer, Integer> disabledCount = new java.util.HashMap<>();
        java.util.Map<Integer, Integer> elderlyCount = new java.util.HashMap<>();

        for (Person p : persons) {
            Integer hid = p.getHouseholdId();
            if (hid == null) continue;
            if (Boolean.TRUE.equals(p.getIsSick()))       sickCount.merge(hid, 1, Integer::sum);
            if (Boolean.TRUE.equals(p.getIsBedridden()))  bedriddenCount.merge(hid, 1, Integer::sum);
            if (Boolean.TRUE.equals(p.getIsDisabled()))   disabledCount.merge(hid, 1, Integer::sum);
            if (Boolean.TRUE.equals(p.getIsElderly()))    elderlyCount.merge(hid, 1, Integer::sum);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Household h : households) {
            Integer hid = h.getHouseholdId();
            if (h.getGpsLat() == null || h.getGpsLng() == null) continue;
            int bedridden = bedriddenCount.getOrDefault(hid, 0);
            int disabled  = disabledCount.getOrDefault(hid, 0);
            int sick      = sickCount.getOrDefault(hid, 0);
            int elderly   = elderlyCount.getOrDefault(hid, 0);
            int tier = bedridden > 0 ? 4 : disabled > 0 ? 3 : sick > 0 ? 2 : elderly > 0 ? 1 : 0;

            Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("household_id",    hid);
            m.put("house_no",        h.getHouseNo());
            m.put("moo",             h.getMoo());
            m.put("village_id",      h.getVillageId());
            m.put("gps_lat",         h.getGpsLat());
            m.put("gps_lng",         h.getGpsLng());
            m.put("health_tier",     tier);
            m.put("house_image_url", h.getHouseImageUrl());
            result.add(m);
        }
        return result;
    }

    public ResponseEntity<?> removeImage(Integer id) {
        Household h = repo.findById(id).orElse(null);
        if (h == null)
            return ResponseEntity.status(404).body(Map.of("message", "ไม่พบครัวเรือนนี้"));
        if (ScopeUtil.isVillageLevel() && notOwned(h))
            return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์แก้ไขข้อมูลนี้"));
        if (h.getHouseImageUrl() != null) {
            try {
                Path file = Paths.get("." + h.getHouseImageUrl()).toAbsolutePath().normalize();
                Files.deleteIfExists(file);
            } catch (IOException ignored) {}
            h.setHouseImageUrl(null);
            repo.save(h);
        }
        return ResponseEntity.ok(Map.of("message", "ลบรูปสำเร็จ"));
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
