package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Village;
import com.k2dev.smart_village.repository.VillageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/villages")
public class VillageController {

    @Autowired
    private VillageRepository repo;

    @Autowired
    private JdbcTemplate jdbc;

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

    /**
     * GET /api/villages/ensure/{id}
     * ใช้สำหรับ VillageContext auto-init ของ non-ADMIN user
     * ถ้า village ยังไม่มีใน DB → สร้าง placeholder อัตโนมัติ
     * ใช้ JdbcTemplate + fallback OVERRIDING SYSTEM VALUE รองรับทุก column type
     */
    @GetMapping("/ensure/{id}")
    public ResponseEntity<?> ensureAndGet(@PathVariable Integer id) {
        // ลอง fetch ก่อน
        Village existing = repo.findById(id).orElse(null);
        if (existing != null) return ResponseEntity.ok(existing);

        // ยังไม่มี → INSERT placeholder ด้วย JdbcTemplate
        String name = "หมู่บ้านหมู่ " + id;
        boolean created = false;
        try {
            jdbc.update(
                "INSERT INTO village (village_id, village_name) VALUES (?, ?) ON CONFLICT (village_id) DO NOTHING",
                id, name);
            created = true;
        } catch (Exception e1) {
            try {
                // fallback: OVERRIDING SYSTEM VALUE สำหรับ GENERATED ALWAYS AS IDENTITY
                jdbc.update(
                    "INSERT INTO village (village_id, village_name) OVERRIDING SYSTEM VALUE VALUES (?, ?) ON CONFLICT (village_id) DO NOTHING",
                    id, name);
                created = true;
            } catch (Exception e2) {
                System.err.println("[VillageController] Cannot create village " + id + ": " + e2.getMessage());
            }
        }

        if (!created) {
            return ResponseEntity.status(500).body(Map.of("message", "ไม่สามารถสร้างข้อมูลหมู่บ้านได้"));
        }

        return repo.findById(id)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElse(ResponseEntity.status(500).body(Map.of("message", "สร้างหมู่บ้านแล้วแต่ดึงข้อมูลไม่ได้")));
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody Village v) {
        try {
            return ResponseEntity.ok(repo.saveAndFlush(v));
        } catch (Exception e) {
            Throwable root = e;
            while (root.getCause() != null) root = root.getCause();
            return ResponseEntity.status(500)
                .body(Map.of("message", root.getMessage() != null ? root.getMessage() : "เกิดข้อผิดพลาด"));
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
            return ResponseEntity.ok(repo.saveAndFlush(v));
        } catch (Exception e) {
            Throwable root = e;
            while (root.getCause() != null) root = root.getCause();
            return ResponseEntity.status(500)
                .body(Map.of("message", root.getMessage() != null ? root.getMessage() : "เกิดข้อผิดพลาด"));
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
