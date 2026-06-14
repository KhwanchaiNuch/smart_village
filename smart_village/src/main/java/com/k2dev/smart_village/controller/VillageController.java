package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Village;
import com.k2dev.smart_village.repository.VillageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/villages")
public class VillageController {

    @Autowired
    private VillageRepository repo;

    @GetMapping
    public List<Village> list(@RequestParam(required = false) Integer tambonId) {
        if (tambonId != null) return repo.findByTambonId(tambonId);
        return repo.findAll();
    }

    @GetMapping("/all")
    public List<Village> listAll() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Village get(@PathVariable Integer id) {
        return repo.findById(id).orElseThrow();
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody Village v) {
        try {
            return ResponseEntity.ok(repo.save(v));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody Village v) {
        try {
            if (v.getVillageId() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "กรุณาระบุ villageId"));
            }
            if (!repo.existsById(v.getVillageId())) {
                return ResponseEntity.status(404).body(Map.of("message", "ไม่พบหมู่บ้านนี้"));
            }
            return ResponseEntity.ok(repo.save(v));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        try {
            if (!repo.existsById(id)) {
                return ResponseEntity.status(404).body(Map.of("message", "ไม่พบหมู่บ้านนี้"));
            }
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }
}
