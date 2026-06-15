package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.repository.HouseholdRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/households")
public class HouseholdController {

    @Autowired private HouseholdRepository repo;

    // ─── helper: ตรวจสอบว่า household นี้อยู่ใน village ของ user ─────────────
    private boolean notOwned(Household h) {
        Integer vid = ScopeUtil.getScopeId();
        return vid == null || !vid.equals(h.getVillageId());
    }

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
    public ResponseEntity<?> get(@PathVariable Integer id) {
        Household h = repo.findById(id).orElse(null);
        if (h == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบครัวเรือนนี้"));
        if (!ScopeUtil.isAdmin() && notOwned(h))
            return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้"));
        return ResponseEntity.ok(h);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody Household h) {
        try {
            if (!ScopeUtil.isAdmin()) {
                Integer vid = ScopeUtil.getScopeId();
                if (vid == null)
                    return ResponseEntity.badRequest().body(Map.of("message", "ไม่พบ scopeId กรุณา login ใหม่"));
                h.setVillageId(vid);
            } else if (h.getVillageId() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "กรุณาระบุ villageId"));
            }
            h.setHouseholdId(null);
            return ResponseEntity.ok(repo.save(h));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody Household h) {
        try {
            if (h.getHouseholdId() == null)
                return ResponseEntity.badRequest().body(Map.of("message", "กรุณาระบุ householdId"));
            Household existing = repo.findById(h.getHouseholdId()).orElse(null);
            if (existing == null)
                return ResponseEntity.status(404).body(Map.of("message", "ไม่พบครัวเรือนนี้"));
            if (!ScopeUtil.isAdmin()) {
                if (notOwned(existing))
                    return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์แก้ไขข้อมูลของหมู่บ้านอื่น"));
                h.setVillageId(ScopeUtil.getScopeId());
            }
            return ResponseEntity.ok(repo.save(h));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        try {
            Household existing = repo.findById(id).orElse(null);
            if (existing == null)
                return ResponseEntity.status(404).body(Map.of("message", "ไม่พบครัวเรือนนี้"));
            if (!ScopeUtil.isAdmin() && notOwned(existing))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์ลบข้อมูลของหมู่บ้านอื่น"));
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }
}
