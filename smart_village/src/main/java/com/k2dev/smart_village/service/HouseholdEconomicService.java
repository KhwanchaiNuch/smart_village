package com.k2dev.smart_village.service;

import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.entity.HouseholdEconomic;
import com.k2dev.smart_village.repository.HouseholdEconomicRepository;
import com.k2dev.smart_village.repository.HouseholdRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class HouseholdEconomicService {

    @Autowired private HouseholdEconomicRepository repo;
    @Autowired private HouseholdRepository householdRepo;
    @Autowired private GeoScopeService geoScope;

    private boolean householdOwned(Long householdId) {
        if (householdId == null) return false;
        Household hh = householdRepo.findById(householdId.intValue()).orElse(null);
        Integer scopeId = ScopeUtil.getScopeId();
        return hh != null && scopeId != null && scopeId.equals(hh.getVillageId());
    }

    private List<Map<String, Object>> enrich(List<HouseholdEconomic> items) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (HouseholdEconomic e : items) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id",                  e.getId());
            row.put("householdId",         e.getHouseholdId());
            row.put("incomeTotalPerMonth",  e.getIncomeTotalPerMonth());
            row.put("debtTotal",            e.getDebtTotal());
            row.put("debtType",             e.getDebtType());
            row.put("poorFlag",             e.getPoorFlag());
            row.put("recordDate",           e.getRecordDate());
            row.put("createdAt",            e.getCreatedAt());
            if (e.getHouseholdId() != null) {
                Household hh = householdRepo.findById(e.getHouseholdId().intValue()).orElse(null);
                row.put("houseNo", hh != null ? hh.getHouseNo() : null);
                row.put("moo",     hh != null ? hh.getMoo()     : null);
            } else {
                row.put("houseNo", null);
                row.put("moo",     null);
            }
            result.add(row);
        }
        return result;
    }

    public List<Map<String, Object>> list(Integer villageId) {
        List<HouseholdEconomic> raw;
        if (villageId != null) {
            List<Long> hhIds = householdRepo.findByVillageId(villageId).stream()
                    .map(h -> h.getHouseholdId().longValue()).toList();
            raw = hhIds.isEmpty() ? List.of() : repo.findByHouseholdIdIn(hhIds);
        } else if (ScopeUtil.isAdmin()) {
            raw = repo.findAll();
        } else {
            List<Integer> vids = geoScope.getVillageIds();
            if (vids == null) { raw = repo.findAll(); }
            else if (vids.isEmpty()) { raw = List.of(); }
            else {
                List<Long> hhIds = householdRepo.findByVillageIdIn(vids).stream()
                        .map(h -> h.getHouseholdId().longValue()).toList();
                raw = hhIds.isEmpty() ? List.of() : repo.findByHouseholdIdIn(hhIds);
            }
        }
        return enrich(raw);
    }

    public ResponseEntity<?> get(Long id) {
        HouseholdEconomic e = repo.findById(id).orElse(null);
        if (e == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
        if (ScopeUtil.isVillageLevel() && !householdOwned(e.getHouseholdId()))
            return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้"));
        return ResponseEntity.ok(e);
    }

    public List<HouseholdEconomic> listByHousehold(Long householdId) {
        return repo.findByHouseholdId(householdId);
    }

    public List<HouseholdEconomic> listPoor() {
        return repo.findByPoorFlag(true);
    }

    public ResponseEntity<?> add(HouseholdEconomic e) {
        try {
            if (ScopeUtil.isVillageLevel() && !householdOwned(e.getHouseholdId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เพิ่มข้อมูลในหมู่บ้านอื่น"));
            return ResponseEntity.ok(repo.save(e));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    public ResponseEntity<?> edit(HouseholdEconomic e) {
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

    public ResponseEntity<?> delete(Long id) {
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
