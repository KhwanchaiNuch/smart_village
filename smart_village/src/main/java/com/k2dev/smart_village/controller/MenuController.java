package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Menu;
import com.k2dev.smart_village.repository.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/menus")
public class MenuController {

    @Autowired private MenuRepository repo;

    @GetMapping
    public List<Menu> list() { return repo.findAll(); }

    @GetMapping("/active")
    public List<Menu> active() { return repo.findByStatus(true); }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        Menu m = repo.findById(id).orElse(null);
        if (m == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
        return ResponseEntity.ok(m);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody Menu m) {
        try {
            if (m.getName() == null || m.getName().isBlank())
                return ResponseEntity.badRequest().body(Map.of("message", "กรุณาระบุชื่อ Menu"));
            m.setId(null);
            if (m.getStatus() == null) m.setStatus(true);
            return ResponseEntity.ok(repo.save(m));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody Menu m) {
        try {
            if (m.getId() == null) return ResponseEntity.badRequest().body(Map.of("message", "กรุณาระบุ id"));
            if (!repo.existsById(m.getId())) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            if (m.getName() == null || m.getName().isBlank())
                return ResponseEntity.badRequest().body(Map.of("message", "กรุณาระบุชื่อ Menu"));
            return ResponseEntity.ok(repo.save(m));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            if (!repo.existsById(id)) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }
}
