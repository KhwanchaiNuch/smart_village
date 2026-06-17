package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.AppUser;
import com.k2dev.smart_village.entity.Village;
import com.k2dev.smart_village.repository.AmphurRepository;
import com.k2dev.smart_village.repository.AppUserRepository;
import com.k2dev.smart_village.repository.ProvinceRepository;
import com.k2dev.smart_village.repository.TambonRepository;
import com.k2dev.smart_village.repository.VillageRepository;
import com.k2dev.smart_village.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
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

/**
 * โปรไฟล์ของผู้ใช้ที่ login อยู่ (ดู/แก้ของตัวเอง)
 * username, roleLevel, scopeLabel — อ่านอย่างเดียว
 * fullName, password, avatarUrl — แก้ได้
 *
 * GET    /api/profile/me              — ข้อมูลโปรไฟล์ของฉัน (รวม scopeLabel + avatarUrl)
 * PUT    /api/profile/me              — แก้ fullName
 * POST   /api/profile/me/password     — เปลี่ยนรหัสผ่าน (ต้องใส่ old)
 * POST   /api/profile/me/avatar       — อัปโหลดรูป (multipart, max 2MB, image/* เท่านั้น)
 */
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private static final long MAX_AVATAR_BYTES = 2L * 1024 * 1024;
    private static final Set<String> ALLOWED_EXT = Set.of("jpg", "jpeg", "png", "gif", "webp");
    private static final Path AVATAR_DIR = Paths.get("uploads", "avatars");

    private final AppUserRepository userRepo;
    private final PasswordEncoder encoder;
    private final VillageRepository villageRepo;
    private final TambonRepository tambonRepo;
    private final AmphurRepository amphurRepo;
    private final ProvinceRepository provinceRepo;

    public ProfileController(AppUserRepository userRepo,
                             PasswordEncoder encoder,
                             VillageRepository villageRepo,
                             TambonRepository tambonRepo,
                             AmphurRepository amphurRepo,
                             ProvinceRepository provinceRepo) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.villageRepo = villageRepo;
        this.tambonRepo = tambonRepo;
        this.amphurRepo = amphurRepo;
        this.provinceRepo = provinceRepo;
    }

    // ── helper: หา user จาก principal (ใช้ username เพราะ UserPrincipal ไม่มี userId) ──
    private AppUser currentUser(UserPrincipal principal) {
        if (principal == null) return null;
        return userRepo.findByUsername(principal.getUsername()).orElse(null);
    }

    // ── helper: รวมชื่อพื้นที่เป็น string เดียว (จังหวัด → อำเภอ → ตำบล → หมู่บ้าน) ──
    private String buildScopeLabel(AppUser u) {
        if ("ADMIN".equals(u.getRoleLevel())) return "ดูแลข้อมูลทั้งระบบ";

        StringBuilder sb = new StringBuilder();
        if ("VILLAGE".equals(u.getRoleLevel()) && u.getScopeId() != null) {
            Village v = villageRepo.findById(u.getScopeId()).orElse(null);
            if (v != null) {
                sb.append(v.getVillageName());
                if (v.getMoo() != null && !v.getMoo().isBlank()) {
                    sb.append(" (หมู่ ").append(v.getMoo()).append(")");
                }
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

    // ── helper: แปลง entity → response map (ไม่คืน passwordHash) ──
    private Map<String, Object> toResponse(AppUser u) {
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

    // ─── GET /api/profile/me ──────────────────────────────────────────────────

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserPrincipal principal) {
        AppUser u = currentUser(principal);
        if (u == null)
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        return ResponseEntity.ok(toResponse(u));
    }

    // ─── PUT /api/profile/me ──────────────────────────────────────────────────

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@AuthenticationPrincipal UserPrincipal principal,
                                     @RequestBody ProfileUpdateRequest req) {
        AppUser u = currentUser(principal);
        if (u == null)
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

        if (req.getFullName() == null || req.getFullName().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "fullName is required"));

        u.setFullName(req.getFullName().trim());
        return ResponseEntity.ok(toResponse(userRepo.save(u)));
    }

    // ─── POST /api/profile/me/password ────────────────────────────────────────

    @PostMapping("/me/password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserPrincipal principal,
                                            @RequestBody PasswordChangeRequest req) {
        AppUser u = currentUser(principal);
        if (u == null)
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

        if (req.getOldPassword() == null || req.getOldPassword().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "oldPassword is required"));
        if (req.getNewPassword() == null || req.getNewPassword().length() < 6)
            return ResponseEntity.badRequest().body(Map.of("message", "newPassword ต้องยาวอย่างน้อย 6 ตัวอักษร"));

        if (!encoder.matches(req.getOldPassword(), u.getPasswordHash()))
            return ResponseEntity.badRequest().body(Map.of("message", "รหัสผ่านเดิมไม่ถูกต้อง"));

        u.setPasswordHash(encoder.encode(req.getNewPassword()));
        userRepo.save(u);
        return ResponseEntity.ok(Map.of("message", "เปลี่ยนรหัสผ่านสำเร็จ"));
    }

    // ─── POST /api/profile/me/avatar ──────────────────────────────────────────

    @PostMapping("/me/avatar")
    public ResponseEntity<?> uploadAvatar(@AuthenticationPrincipal UserPrincipal principal,
                                          @RequestParam("file") MultipartFile file) {
        AppUser u = currentUser(principal);
        if (u == null)
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

        if (file == null || file.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("message", "กรุณาเลือกไฟล์"));
        if (file.getSize() > MAX_AVATAR_BYTES)
            return ResponseEntity.badRequest().body(Map.of("message", "ไฟล์ต้องไม่เกิน 2MB"));

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/"))
            return ResponseEntity.badRequest().body(Map.of("message", "รองรับเฉพาะไฟล์รูปภาพ"));

        String ext = extractExtension(file.getOriginalFilename(), contentType);
        if (!ALLOWED_EXT.contains(ext))
            return ResponseEntity.badRequest().body(Map.of(
                "message", "นามสกุลที่อนุญาต: " + String.join(", ", ALLOWED_EXT)));

        // ชื่อไฟล์ใหม่: {userId}-{uuid}.{ext} — random ป้องกัน cache + ไม่ชนกัน
        String filename = u.getUserId() + "-" + UUID.randomUUID() + "." + ext;
        try {
            Files.createDirectories(AVATAR_DIR);
            deleteOldAvatar(u.getAvatarUrl());
            Path target = AVATAR_DIR.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("message", "อัปโหลดล้มเหลว: " + e.getMessage()));
        }

        String url = "/uploads/avatars/" + filename;
        u.setAvatarUrl(url);
        userRepo.save(u);
        return ResponseEntity.ok(Map.of("avatarUrl", url, "message", "อัปโหลดสำเร็จ"));
    }

    // ── helper: ลบไฟล์ avatar เก่าจาก url ที่บันทึกไว้ใน DB ──
    private void deleteOldAvatar(String oldUrl) {
        if (oldUrl == null || oldUrl.isBlank()) return;
        // เก็บเฉพาะ basename (กัน path traversal + รองรับกรณีมี query string เก่า)
        String pathPart = oldUrl.contains("?") ? oldUrl.substring(0, oldUrl.indexOf('?')) : oldUrl;
        int slash = pathPart.lastIndexOf('/');
        String basename = slash >= 0 ? pathPart.substring(slash + 1) : pathPart;
        if (basename.isBlank() || basename.contains("..") || basename.contains("/") || basename.contains("\\")) return;
        try { Files.deleteIfExists(AVATAR_DIR.resolve(basename)); } catch (Exception ignored) {}
    }

    // ── helper: หา extension จากชื่อไฟล์ + fallback ด้วย contentType ──
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

    // ── DTO ──────────────────────────────────────────────────────────────────

    public static class ProfileUpdateRequest {
        private String fullName;
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
    }

    public static class PasswordChangeRequest {
        private String oldPassword;
        private String newPassword;
        public String getOldPassword() { return oldPassword; }
        public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
