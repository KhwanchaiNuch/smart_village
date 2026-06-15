package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.TrainingEvent;
import com.k2dev.smart_village.repository.TrainingEventRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/training-events")
public class TrainingEventController {

    @Autowired private TrainingEventRepository repo;

    private boolean villageOwned(Integer villageId) {
        Integer vid = ScopeUtil.getScopeId();
        return vid != null && vid.equals(villageId);
    }

    @GetMapping
    public List<TrainingEvent> list() {
        if (ScopeUtil.isAdmin()) return repo.findAll();
        Integer vid = ScopeUtil.getScopeId();
        if (vid == null) return List.of();
        return repo.findByVillageId(vid);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        TrainingEvent t = repo.findById(id).orElse(null);
        if (t == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
        if (!ScopeUtil.isAdmin() && !villageOwned(t.getVillageId()))
            return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้"));
        return ResponseEntity.ok(t);
    }

    @GetMapping("/by-type/{type}")
    public List<TrainingEvent> byType(@PathVariable String type) {
        return repo.findByTrainingType(type);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody TrainingEvent t) {
        try {
            if (!ScopeUtil.isAdmin()) {
                t.setVillageId(ScopeUtil.getScopeId());
            }
            t.setId(null);
            return ResponseEntity.ok(repo.save(t));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody TrainingEvent t) {
        try {
            if (!ScopeUtil.isAdmin()) {
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

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            TrainingEvent existing = repo.findById(id).orElse(null);
            if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            if (!ScopeUtil.isAdmin() && !villageOwned(existing.getVillageId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์ลบข้อมูลของหมู่บ้านอื่น"));
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }
}
