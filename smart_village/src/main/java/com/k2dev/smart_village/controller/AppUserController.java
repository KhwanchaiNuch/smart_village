package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.AppUser;
import com.k2dev.smart_village.entity.AppUserRequest;
import com.k2dev.smart_village.repository.AppUserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * CRUD สำหรับ app_user
 * ทุก endpoint ต้องการ role ADMIN (ตั้งค่าใน SecurityConfig)
 *
 * GET    /api/admin/users           — list ทั้งหมด
 * GET    /api/admin/users/{id}      — ดู 1 คน
 * POST   /api/admin/users           — สร้าง user ใหม่
 * PUT    /api/admin/users/{id}      — แก้ไข (username, fullName, role, scopeId, isActive, password)
 * DELETE /api/admin/users/{id}      — ลบ
 * PATCH  /api/admin/users/{id}/toggle — toggle isActive
 */
@RestController
@RequestMapping("/api/admin/users")
public class AppUserController {

    private final AppUserRepository repo;
    private final PasswordEncoder encoder;

    public AppUserController(AppUserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    // ─── helper: แปลง entity → response map (ไม่คืน passwordHash) ────────────

    private Map<String, Object> toResponse(AppUser u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("userId",    u.getUserId());
        m.put("username",  u.getUsername());
        m.put("fullName",  u.getFullName());
        m.put("roleLevel", u.getRoleLevel());
        m.put("scopeId",   u.getScopeId());
        m.put("isActive",  u.getIsActive());
        m.put("createdAt", u.getCreatedAt());
        return m;
    }

    // ─── GET /api/admin/users ─────────────────────────────────────────────────

    @GetMapping
    public List<Map<String, Object>> listAll() {
        return repo.findAll().stream().map(this::toResponse).toList();
    }

    // ─── GET /api/admin/users/{id} ────────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Integer id) {
        return repo.findById(id)
                .<ResponseEntity<?>>map(u -> ResponseEntity.ok(toResponse(u)))
                .orElse(ResponseEntity.status(404).body(Map.of("message", "User not found")));
    }

    // ─── POST /api/admin/users ────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<?> create(@RequestBody AppUserRequest req) {

        // validate required fields
        if (req.getUsername() == null || req.getUsername().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "username is required"));
        if (req.getPassword() == null || req.getPassword().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "password is required"));
        if (req.getRoleLevel() == null || !AppUser.VALID_ROLES.contains(req.getRoleLevel()))
            return ResponseEntity.badRequest().body(Map.of(
                "message", "roleLevel must be one of: ADMIN, PROVINCE, AMPHUR, TAMBON, VILLAGE"));

        // check duplicate username
        if (repo.findByUsername(req.getUsername()).isPresent())
            return ResponseEntity.badRequest().body(Map.of("message", "username already exists"));

        AppUser user = new AppUser();
        user.setUsername(req.getUsername().trim());
        user.setPasswordHash(encoder.encode(req.getPassword()));
        user.setFullName(req.getFullName());
        user.setRoleLevel(req.getRoleLevel());
        user.setScopeId(req.getScopeId());
        user.setIsActive(req.getIsActive() != null ? req.getIsActive() : true);

        AppUser saved = repo.save(user);
        return ResponseEntity.ok(toResponse(saved));
    }

    // ─── PUT /api/admin/users/{id} ────────────────────────────────────────────

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id,
                                    @RequestBody AppUserRequest req) {

        AppUser user = repo.findById(id).orElse(null);
        if (user == null)
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));

        // username — เปลี่ยนได้ แต่ต้องไม่ซ้ำ
        if (req.getUsername() != null && !req.getUsername().isBlank()) {
            String newUsername = req.getUsername().trim();
            if (!newUsername.equals(user.getUsername()) &&
                repo.findByUsername(newUsername).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "username already exists"));
            }
            user.setUsername(newUsername);
        }

        // password — update เฉพาะเมื่อส่งมา
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            user.setPasswordHash(encoder.encode(req.getPassword()));
        }

        if (req.getFullName() != null)
            user.setFullName(req.getFullName());

        if (req.getRoleLevel() != null) {
            if (!AppUser.VALID_ROLES.contains(req.getRoleLevel()))
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "roleLevel must be one of: ADMIN, PROVINCE, AMPHUR, TAMBON, VILLAGE"));
            user.setRoleLevel(req.getRoleLevel());
        }

        if (req.getScopeId() != null)
            user.setScopeId(req.getScopeId());

        if (req.getIsActive() != null)
            user.setIsActive(req.getIsActive());

        return ResponseEntity.ok(toResponse(repo.save(user)));
    }

    // ─── DELETE /api/admin/users/{id} ─────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (!repo.existsById(id))
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    // ─── PATCH /api/admin/users/{id}/toggle ──────────────────────────────────
    // สลับ isActive โดยไม่ต้องส่ง body

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<?> toggle(@PathVariable Integer id) {
        AppUser user = repo.findById(id).orElse(null);
        if (user == null)
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));

        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        return ResponseEntity.ok(toResponse(repo.save(user)));
    }
}
