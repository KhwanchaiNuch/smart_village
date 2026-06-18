package com.k2dev.smart_village.service;

import com.k2dev.smart_village.entity.Menu;
import com.k2dev.smart_village.repository.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class MenuService {

    @Autowired private MenuRepository repo;

    public List<Menu> list() {
        return repo.findAll();
    }

    public List<Menu> listActive() {
        return repo.findByStatus(true);
    }

    public ResponseEntity<?> get(Long id) {
        Menu m = repo.findById(id).orElse(null);
        if (m == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
        return ResponseEntity.ok(m);
    }

    public ResponseEntity<?> add(Menu m) {
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

    public ResponseEntity<?> edit(Menu m) {
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

    public ResponseEntity<?> delete(Long id) {
        try {
            if (!repo.existsById(id)) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }
}
