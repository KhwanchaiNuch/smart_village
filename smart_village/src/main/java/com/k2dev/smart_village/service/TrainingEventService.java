package com.k2dev.smart_village.service;

import com.k2dev.smart_village.entity.TrainingEvent;
import com.k2dev.smart_village.repository.TrainingEventRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class TrainingEventService {

    @Autowired private TrainingEventRepository repo;
    @Autowired private GeoScopeService geoScope;

    private boolean villageOwned(Integer villageId) {
        Integer scopeId = ScopeUtil.getScopeId();
        return scopeId != null && scopeId.equals(villageId);
    }

    public List<TrainingEvent> list(Integer villageId) {
        if (ScopeUtil.isAdmin()) {
            if (villageId != null) return repo.findByVillageId(villageId);
            return repo.findAll();
        }
        List<Integer> vids = geoScope.getVillageIds();
        if (vids == null) return repo.findAll();
        if (vids.isEmpty()) return List.of();
        if (villageId != null && vids.contains(villageId)) vids = List.of(villageId);
        return repo.findByVillageIdIn(vids);
    }

    public ResponseEntity<?> get(Long id) {
        TrainingEvent t = repo.findById(id).orElse(null);
        if (t == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
        if (ScopeUtil.isVillageLevel() && !villageOwned(t.getVillageId()))
            return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้"));
        return ResponseEntity.ok(t);
    }

    public List<TrainingEvent> listByType(String type) {
        return repo.findByTrainingType(type);
    }

    public ResponseEntity<?> add(TrainingEvent t) {
        try {
            if (ScopeUtil.isVillageLevel()) t.setVillageId(ScopeUtil.getScopeId());
            t.setId(null);
            return ResponseEntity.ok(repo.save(t));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    public ResponseEntity<?> edit(TrainingEvent t) {
        try {
            if (ScopeUtil.isVillageLevel()) {
                TrainingEvent existing = repo.findById(t.getId()).orElse(null);
                if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
                if (!villageOwned(existing.getVillageId()))
                    return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์แก้ไขข้อมูลของหมู่บ้านอื่น"));
                t.setVillageId(ScopeUtil.getScopeId());
            }
            return ResponseEntity.ok(repo.save(t));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    public ResponseEntity<?> delete(Long id) {
        try {
            TrainingEvent existing = repo.findById(id).orElse(null);
            if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            if (ScopeUtil.isVillageLevel() && !villageOwned(existing.getVillageId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์ลบข้อมูลของหมู่บ้านอื่น"));
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }
}
