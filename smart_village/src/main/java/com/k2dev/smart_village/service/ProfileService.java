package com.k2dev.smart_village.service;

import com.k2dev.smart_village.entity.AppUser;
import com.k2dev.smart_village.entity.Village;
import com.k2dev.smart_village.repository.AmphurRepository;
import com.k2dev.smart_village.repository.AppUserRepository;
import com.k2dev.smart_village.repository.ProvinceRepository;
import com.k2dev.smart_village.repository.TambonRepository;
import com.k2dev.smart_village.repository.VillageRepository;
import com.k2dev.smart_village.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class ProfileService {

    private static final long MAX_AVATAR_BYTES = 2L * 1024 * 1024;
    private static final Set<String> ALLOWED_EXT = Set.of("jpg", "jpeg", "png", "gif", "webp");

    @Value("${app.upload.dir:/opt/smart_village/uploads}")
    private String uploadDir;

    private Path avatarDir() {
        return Paths.get(uploadDir, "avatars");
    }

    private final AppUserRepository userRepo;
    private final PasswordEncoder encoder;
    private final VillageRepository villageRepo;
    private final TambonRepository tambonRepo;
    private final AmphurRepository amphurRepo;
    private final ProvinceRepository provinceRepo;

    public ProfileService(AppUserRepository userRepo, PasswordEncoder encoder,
                          VillageRepository villageRepo, TambonRepository tambonRepo,
                          AmphurRepository amphurRepo, ProvinceRepository provinceRepo) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.villageRepo = villageRepo;
        this.tambonRepo = tambonRepo;
        this.amphurRepo = amphurRepo;
        this.provinceRepo = provinceRepo;
    }

    public AppUser currentUser(UserPrincipal principal) {
        if (principal == null) return null;
        return userRepo.findByUsername(principal.getUsername()).orElse(null);
    }

    public String buildScopeLabel(AppUser u) {
        if ("ADMIN".equals(u.getRoleLevel())) return "ดูแลข้อมูลทั้งระบบ";
        StringBuilder sb = new StringBuilder();
        if ("VILLAGE".equals(u.getRoleLevel()) && u.getScopeId() != null) {
            Village v = villageRepo.findById(u.getScopeId()).orElse(null);
            if (v != null) {
                sb.append(v.getVillageName());
                if (v.getMoo() != null && !v.getMoo().isBlank())
                    sb.append(" (หมู่ ").append(v.getMoo()).append(")");
            }
        }
        if (u.getTambonId() != null)
            tambonRepo.findById(u.getTambonId()).ifPresent(t -> sb.append(" ต.").append(t.getNameTh()));
        if (u.getAmphurId() != null)
            amphurRepo.findById(u.getAmphurId()).ifPresent(a -> sb.append(" อ.").append(a.getNameTh()));
        if (u.getProvinceId() != null)
            provinceRepo.findById(u.getProvinceId()).ifPresent(p -> sb.append(" จ.").append(p.getNameTh()));
        String s = sb.toString().trim();
        return s.isEmpty() ? "—" : s;
    }

    public Map<String, Object> toResponse(AppUser u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("userId",     u.getUserId());
        m.put("username",   u.getUsername());
        m.put("fullName",   u.getFullName());
        m.put("roleLevel",  u.getRoleLevel());
        m.put("scopeId",    u.getScopeId());
        m.put("scopeLabel", buildScopeLabel(u));
        m.put("avatarUrl",  u.getAvatarUrl());
        m.put("isActive",   u.getIsActive());
        m.put("createdAt",  u.getCreatedAt());
        return m;
    }

    public ResponseEntity<?> me(UserPrincipal principal) {
        AppUser u = currentUser(principal);
        if (u == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        return ResponseEntity.ok(toResponse(u));
    }

    public ResponseEntity<?> updateMe(UserPrincipal principal, String fullName) {
        AppUser u = currentUser(principal);
        if (u == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        if (fullName == null || fullName.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "fullName is required"));
        u.setFullName(fullName.trim());
        return ResponseEntity.ok(toResponse(userRepo.save(u)));
    }

    public ResponseEntity<?> changePassword(UserPrincipal principal, String oldPassword, String newPassword) {
        AppUser u = currentUser(principal);
        if (u == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        if (oldPassword == null || oldPassword.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "oldPassword is required"));
        if (newPassword == null || newPassword.length() < 6)
            return ResponseEntity.badRequest().body(Map.of("message", "newPassword ต้องยาวอย่างน้อย 6 ตัวอักษร"));
        if (!encoder.matches(oldPassword, u.getPasswordHash()))
            return ResponseEntity.badRequest().body(Map.of("message", "รหัสผ่านเดิมไม่ถูกต้อง"));
        u.setPasswordHash(encoder.encode(newPassword));
        userRepo.save(u);
        return ResponseEntity.ok(Map.of("message", "เปลี่ยนรหัสผ่านสำเร็จ"));
    }

    public ResponseEntity<?> uploadAvatar(UserPrincipal principal, MultipartFile file) {
        AppUser u = currentUser(principal);
        if (u == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        if (file == null || file.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("message", "กรุณาเลือกไฟล์"));
        if (file.getSize() > MAX_AVATAR_BYTES)
            return ResponseEntity.badRequest().body(Map.of("message", "ไฟล์ต้องไม่เกิน 2MB"));
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/"))
            return ResponseEntity.badRequest().body(Map.of("message", "รองรับเฉพาะไฟล์รูปภาพ"));
        String ext = extractExtension(file.getOriginalFilename(), contentType);
        if (!ALLOWED_EXT.contains(ext))
            return ResponseEntity.badRequest().body(Map.of("message", "นามสกุลที่อนุญาต: " + String.join(", ", ALLOWED_EXT)));

        String filename = u.getUserId() + "-" + UUID.randomUUID() + "." + ext;
        Path avatarDir = avatarDir();
        try {
            Files.createDirectories(avatarDir);
            deleteOldAvatar(u.getAvatarUrl());
            Files.copy(file.getInputStream(), avatarDir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("message", "อัปโหลดล้มเหลว: " + e.getMessage()));
        }
        String url = "/uploads/avatars/" + filename;
        u.setAvatarUrl(url);
        userRepo.save(u);
        return ResponseEntity.ok(Map.of("avatarUrl", url, "message", "อัปโหลดสำเร็จ"));
    }

    private void deleteOldAvatar(String oldUrl) {
        if (oldUrl == null || oldUrl.isBlank()) return;
        String pathPart = oldUrl.contains("?") ? oldUrl.substring(0, oldUrl.indexOf('?')) : oldUrl;
        int slash = pathPart.lastIndexOf('/');
        String basename = slash >= 0 ? pathPart.substring(slash + 1) : pathPart;
        if (basename.isBlank() || basename.contains("..") || basename.contains("/") || basename.contains("\\")) return;
        try { Files.deleteIfExists(avatarDir().resolve(basename)); } catch (Exception ignored) {}
    }

    private String extractExtension(String filename, String contentType) {
        if (filename != null && filename.contains(".")) {
            String e = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
            if (ALLOWED_EXT.contains(e)) return e.equals("jpeg") ? "jpg" : e;
        }
        if (contentType != null) {
            String sub = contentType.substring(contentType.indexOf('/') + 1).toLowerCase();
            return sub.equals("jpeg") ? "jpg" : sub;
        }
        return "jpg";
    }
}
