package com.k2dev.smart_village.service;

import com.k2dev.smart_village.entity.AppUser;
import com.k2dev.smart_village.entity.AppUserRequest;
import com.k2dev.smart_village.repository.AppUserRepository;
import com.k2dev.smart_village.repository.VillageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AppUserService {

    private final AppUserRepository repo;
    private final PasswordEncoder encoder;
    private final VillageRepository villageRepo;

    public AppUserService(AppUserRepository repo, PasswordEncoder encoder, VillageRepository villageRepo) {
        this.repo = repo;
        this.encoder = encoder;
        this.villageRepo = villageRepo;
    }

    private void ensureVillageExists(String roleLevel, Integer scopeId) {
        if ("VILLAGE".equals(roleLevel) && scopeId != null) {
            try { villageRepo.ensureVillage(scopeId, "หมู่บ้านหมู่ " + scopeId); } catch (Exception ignored) {}
        }
    }

    public Map<String, Object> toResponse(AppUser u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("userId",     u.getUserId());
        m.put("username",   u.getUsername());
        m.put("fullName",   u.getFullName());
        m.put("roleLevel",  u.getRoleLevel());
        m.put("scopeId",    u.getScopeId());
        m.put("provinceId", u.getProvinceId());
        m.put("amphurId",   u.getAmphurId());
        m.put("tambonId",   u.getTambonId());
        m.put("isActive",   u.getIsActive());
        m.put("createdAt",  u.getCreatedAt());
        return m;
    }

    public List<Map<String, Object>> listAll() {
        return repo.findAll().stream().map(this::toResponse).toList();
    }

    public ResponseEntity<?> getOne(Integer id) {
        return repo.findById(id)
                .<ResponseEntity<?>>map(u -> ResponseEntity.ok(toResponse(u)))
                .orElse(ResponseEntity.status(404).body(Map.of("message", "User not found")));
    }

    public ResponseEntity<?> create(AppUserRequest req) {
        if (req.getUsername() == null || req.getUsername().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "username is required"));
        if (req.getPassword() == null || req.getPassword().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "password is required"));
        if (req.getRoleLevel() == null || !AppUser.VALID_ROLES.contains(req.getRoleLevel()))
            return ResponseEntity.badRequest().body(Map.of("message", "roleLevel must be one of: ADMIN, PROVINCE, AMPHUR, TAMBON, VILLAGE"));
        if (repo.findByUsername(req.getUsername()).isPresent())
            return ResponseEntity.badRequest().body(Map.of("message", "username already exists"));

        AppUser user = new AppUser();
        user.setUsername(req.getUsername().trim());
        user.setPasswordHash(encoder.encode(req.getPassword()));
        user.setFullName(req.getFullName());
        user.setRoleLevel(req.getRoleLevel());
        user.setScopeId(req.getScopeId());
        user.setProvinceId(req.getProvinceId());
        user.setAmphurId(req.getAmphurId());
        user.setTambonId(req.getTambonId());
        user.setIsActive(req.getIsActive() != null ? req.getIsActive() : true);

        AppUser saved = repo.save(user);
        ensureVillageExists(saved.getRoleLevel(), saved.getScopeId());
        return ResponseEntity.ok(toResponse(saved));
    }

    public ResponseEntity<?> update(Integer id, AppUserRequest req) {
        AppUser user = repo.findById(id).orElse(null);
        if (user == null) return ResponseEntity.status(404).body(Map.of("message", "User not found"));

        if (req.getUsername() != null && !req.getUsername().isBlank()) {
            String newUsername = req.getUsername().trim();
            if (!newUsername.equals(user.getUsername()) && repo.findByUsername(newUsername).isPresent())
                return ResponseEntity.badRequest().body(Map.of("message", "username already exists"));
            user.setUsername(newUsername);
        }
        if (req.getPassword() != null && !req.getPassword().isBlank())
            user.setPasswordHash(encoder.encode(req.getPassword()));
        if (req.getFullName() != null)
            user.setFullName(req.getFullName());
        if (req.getRoleLevel() != null) {
            if (!AppUser.VALID_ROLES.contains(req.getRoleLevel()))
                return ResponseEntity.badRequest().body(Map.of("message", "roleLevel must be one of: ADMIN, PROVINCE, AMPHUR, TAMBON, VILLAGE"));
            user.setRoleLevel(req.getRoleLevel());
        }
        if (req.getScopeId() != null) user.setScopeId(req.getScopeId());
        user.setProvinceId(req.getProvinceId());
        user.setAmphurId(req.getAmphurId());
        user.setTambonId(req.getTambonId());
        if (req.getIsActive() != null) user.setIsActive(req.getIsActive());

        AppUser updated = repo.save(user);
        ensureVillageExists(updated.getRoleLevel(), updated.getScopeId());
        return ResponseEntity.ok(toResponse(updated));
    }

    public ResponseEntity<?> delete(Integer id) {
        if (!repo.existsById(id)) return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    public ResponseEntity<?> toggle(Integer id) {
        AppUser user = repo.findById(id).orElse(null);
        if (user == null) return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        return ResponseEntity.ok(toResponse(repo.save(user)));
    }
}
