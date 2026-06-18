package com.k2dev.smart_village.service;

import com.k2dev.smart_village.entity.Role;
import com.k2dev.smart_village.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class RoleService {

    @Autowired private RoleRepository repo;

    public List<Role> list() {
        return repo.findAll();
    }

    public List<Role> listActive() {
        return repo.findByStatus(true);
    }

    public ResponseEntity<?> get(Long id) {
        Role r = repo.findById(id).orElse(null);
        if (r == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
        return ResponseEntity.ok(r);
    }

    public ResponseEntity<?> add(Role r) {
        try {
            if (r.getName() == null || r.getName().isBlank())
                return ResponseEntity.badRequest().body(Map.of("message", "กรุณาระบุชื่อ Role"));
            r.setId(null);
            if (r.getStatus() == null) r.setStatus(true);
            return ResponseEntity.ok(repo.save(r));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    public ResponseEntity<?> edit(Role r) {
        try {
            if (r.getId() == null) return ResponseEntity.badRequest().body(Map.of("message", "กรุณาระบุ id"));
            if (!repo.existsById(r.getId())) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            if (r.getName() == null || r.getName().isBlank())
                return ResponseEntity.badRequest().body(Map.of("message", "กรุณาระบุชื่อ Role"));
            return ResponseEntity.ok(repo.save(r));
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
