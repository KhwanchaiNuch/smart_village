package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Amphur;
import com.k2dev.smart_village.entity.CommunityIssue;
import com.k2dev.smart_village.entity.CommunityIssueLog;
import com.k2dev.smart_village.entity.Tambon;
import com.k2dev.smart_village.entity.Village;
import com.k2dev.smart_village.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/community-issue-logs")
public class CommunityIssueLogController {

    @Autowired private CommunityIssueLogRepository repo;
    @Autowired private CommunityIssueRepository issueRepo;
    @Autowired private VillageRepository villageRepo;
    @Autowired private TambonRepository tambonRepo;
    @Autowired private AmphurRepository amphurRepo;

    @GetMapping
    public List<CommunityIssueLog> list(@RequestParam Long issueId) {
        return repo.findByIssueIdOrderByCreatedAtDesc(issueId);
    }

    // ─── ADD ────────────────────────────────────────────────────────────────
    @PostMapping(value = "/add", consumes = {"multipart/form-data", "application/x-www-form-urlencoded"})
    public ResponseEntity<?> add(
            @RequestParam Long issueId,
            @RequestParam String title,
            @RequestParam(required = false) String detail,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer villageId,
            @RequestParam(required = false) MultipartFile file,
            HttpServletRequest request) {
        try {
            CommunityIssueLog log = new CommunityIssueLog();
            log.setId(null);
            log.setIssueId(issueId);
            log.setTitle(title);
            log.setDetail(detail != null && !detail.isBlank() ? detail : null);
            log.setStatus(status != null && !status.isBlank() ? status : null);

            // sync status ไปที่ issue หลัก
            if (log.getStatus() != null) {
                CommunityIssue issue = issueRepo.findById(issueId).orElse(null);
                if (issue != null) { issue.setStatus(log.getStatus()); issueRepo.save(issue); }
            }

            // save log ก่อน → ได้ logId
            CommunityIssueLog saved = repo.save(log);

            // บันทึกไฟล์ถ้ามี
            if (file != null && !file.isEmpty()) {
                saved.setImageUrl(saveLogFile(file, villageId, issueId, saved.getId(), request));
                saved = repo.save(saved);
            }

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    // ─── EDIT ────────────────────────────────────────────────────────────────
    @PostMapping(value = "/edit", consumes = {"multipart/form-data", "application/x-www-form-urlencoded"})
    public ResponseEntity<?> edit(
            @RequestParam Long id,
            @RequestParam Long issueId,
            @RequestParam String title,
            @RequestParam(required = false) String detail,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer villageId,
            @RequestParam(required = false) MultipartFile file,
            @RequestParam(required = false, defaultValue = "false") boolean removeImage,
            HttpServletRequest request) {
        try {
            CommunityIssueLog existing = repo.findById(id).orElse(null);
            if (existing == null)
                return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));

            existing.setTitle(title);
            existing.setDetail(detail != null && !detail.isBlank() ? detail : null);
            existing.setStatus(status != null && !status.isBlank() ? status : null);

            // sync status ไปที่ issue หลัก
            if (existing.getStatus() != null) {
                CommunityIssue issue = issueRepo.findById(issueId).orElse(null);
                if (issue != null) { issue.setStatus(existing.getStatus()); issueRepo.save(issue); }
            }

            // จัดการรูป
            if (file != null && !file.isEmpty()) {
                existing.setImageUrl(saveLogFile(file, villageId, issueId, id, request));
            } else if (removeImage) {
                existing.setImageUrl(null);
            }
            // ไม่ส่งอะไร → คง imageUrl เดิม

            return ResponseEntity.ok(repo.save(existing));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            if (!repo.existsById(id))
                return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    // ─── helper: บันทึกไฟล์ log (แผน C: folder เดียวกับ issue + prefix log-) ──
    private String saveLogFile(MultipartFile file, Integer villageId, Long issueId, Long logId,
                               HttpServletRequest request) throws IOException {
        // แผน C: เก็บในโฟลเดอร์เดียวกับ issue ไม่มี /logs subfolder
        // แยกด้วย prefix "log-" ในชื่อไฟล์
        String subPath;
        if (villageId != null) {
            Village v        = villageRepo.findById(villageId).orElse(null);
            Integer tambonId  = v != null ? v.getTambonId() : null;
            Integer amphurId  = null, provinceId = null;
            if (tambonId != null) {
                Tambon t = tambonRepo.findById(tambonId).orElse(null);
                if (t != null) amphurId = t.getAmphurId();
            }
            if (amphurId != null) {
                Amphur a = amphurRepo.findById(amphurId).orElse(null);
                if (a != null) provinceId = a.getProvinceId();
            }
            subPath = String.format("%s/%s/%s/%s/%s",
                    provinceId != null ? provinceId : "0",
                    amphurId   != null ? amphurId   : "0",
                    tambonId   != null ? tambonId   : "0",
                    villageId, issueId);
        } else {
            subPath = "misc/" + issueId;
        }

        Path uploadDir = Paths.get("./uploads/" + subPath).toAbsolutePath().normalize();
        Files.createDirectories(uploadDir);

        String originalName = file.getOriginalFilename();
        String ext = (originalName != null && originalName.contains("."))
                ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase() : "";
        // prefix "log-" เพื่อแยกออกจากรูปภาพของ issue
        String filename = "log-" + UUID.randomUUID() + ext;
        Files.copy(file.getInputStream(), uploadDir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

        String baseUrl = request.getScheme() + "://"
                + request.getServerName() + ":" + request.getServerPort()
                + request.getContextPath();
        return baseUrl + "/uploads/" + subPath + "/" + filename;
    }
}
