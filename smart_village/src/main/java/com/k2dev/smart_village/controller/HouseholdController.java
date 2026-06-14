package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.repository.HouseholdRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/households")
@RequiredArgsConstructor
public class HouseholdController {

    @Autowired
    private HouseholdRepository repo;

    @GetMapping
    public List<Household> list() {
        if (ScopeUtil.isAdmin()) return repo.findAll();
        Integer vid = ScopeUtil.getScopeId();
        return vid != null ? repo.findByVillageId(vid) : List.of();
    }

    @GetMapping("/by-village/{villageId}")
    public List<Household> listByVillage(@PathVariable Integer villageId) {
        return repo.findByVillageId(villageId);
    }

    @GetMapping("/{id}")
    public Household get(@PathVariable Integer id) {
        return repo.findById(id).orElseThrow();
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody Household h) {
        try {
            if (!ScopeUtil.isAdmin()) {
                Integer vid = ScopeUtil.getScopeId();
                if (vid == null) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("message", "ไม่พบ scopeId ของ user กรุณา login ใหม่"));
                }
                h.setVillageId(vid);
            }
            if (!ScopeUtil.isAdmin() && h.getVillageId() == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "กรุณาระบุ villageId"));
            }
            return ResponseEntity.ok(repo.save(h));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody Household h) {
        try {
            if (h.getHouseholdId() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "กรุณาระบุ householdId"));
            }
            if (!repo.existsById(h.getHouseholdId())) {
                return ResponseEntity.status(404).body(Map.of("message", "ไม่พบครัวเรือนนี้"));
            }
            if (!ScopeUtil.isAdmin()) {
                Integer vid = ScopeUtil.getScopeId();
                h.setVillageId(vid);
            }
            return ResponseEntity.ok(repo.save(h));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        try {
            if (!repo.existsById(id)) {
                return ResponseEntity.status(404).body(Map.of("message", "ไม่พบครัวเรือนนี้"));
            }
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }
}
