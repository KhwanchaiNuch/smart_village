package com.k2dev.smart_village.service;

import com.k2dev.smart_village.entity.Amphur;
import com.k2dev.smart_village.entity.CommunityIssue;
import com.k2dev.smart_village.entity.CommunityIssueLog;
import com.k2dev.smart_village.entity.Tambon;
import com.k2dev.smart_village.entity.Village;
import com.k2dev.smart_village.config.UploadProperties;
import com.k2dev.smart_village.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class CommunityIssueLogService {

    @Autowired private CommunityIssueLogRepository repo;
    @Autowired private UploadProperties uploadProperties;
    @Autowired private CommunityIssueRepository issueRepo;
    @Autowired private VillageRepository villageRepo;
    @Autowired private TambonRepository tambonRepo;
    @Autowired private AmphurRepository amphurRepo;

    private String saveLogFile(MultipartFile file, Integer villageId, Long issueId, Long logId) throws IOException {
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
        Path uploadDir = uploadProperties.resolve(subPath);
        Files.createDirectories(uploadDir);
        String originalName = file.getOriginalFilename();
        String ext = (originalName != null && originalName.contains("."))
                ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase() : "";
        String filename = "log-" + UUID.randomUUID() + ext;
        Files.copy(file.getInputStream(), uploadDir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/" + subPath + "/" + filename;
    }

    public List<CommunityIssueLog> list(Long issueId) {
        return repo.findByIssueIdOrderByCreatedAtDesc(issueId);
    }

    public ResponseEntity<?> add(Long issueId, String title, String detail, String status,
                                  Integer villageId, MultipartFile file) {
        try {
            CommunityIssueLog log = new CommunityIssueLog();
            log.setId(null);
            log.setIssueId(issueId);
            log.setTitle(title);
            log.setDetail(detail != null && !detail.isBlank() ? detail : null);
            log.setStatus(status != null && !status.isBlank() ? status : null);

            if (log.getStatus() != null) {
                CommunityIssue issue = issueRepo.findById(issueId).orElse(null);
                if (issue != null) { issue.setStatus(log.getStatus()); issueRepo.save(issue); }
            }

            CommunityIssueLog saved = repo.save(log);
            if (file != null && !file.isEmpty()) {
                saved.setImageUrl(saveLogFile(file, villageId, issueId, saved.getId()));
                saved = repo.save(saved);
            }
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    public ResponseEntity<?> edit(Long id, Long issueId, String title, String detail, String status,
                                   Integer villageId, MultipartFile file, boolean removeImage) {
        try {
            CommunityIssueLog existing = repo.findById(id).orElse(null);
            if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));

            existing.setTitle(title);
            existing.setDetail(detail != null && !detail.isBlank() ? detail : null);
            existing.setStatus(status != null && !status.isBlank() ? status : null);

            if (existing.getStatus() != null) {
                CommunityIssue issue = issueRepo.findById(issueId).orElse(null);
                if (issue != null) { issue.setStatus(existing.getStatus()); issueRepo.save(issue); }
            }

            // ── 🛠️ แก้ไข: จัดการสั่งทำลายไฟล์บนดิสก์จริงกรณีเปลี่ยนรูปหรือกดลบรูป ──
            if (file != null && !file.isEmpty()) {
                if (existing.getImageUrl() != null) {
                    try {
                        Path oldPath = uploadProperties.fromUrl(existing.getImageUrl());
                        Files.deleteIfExists(oldPath);
                    } catch (Exception ignored) {}
                }
                existing.setImageUrl(saveLogFile(file, villageId, issueId, id));
            } else if (removeImage) {
                if (existing.getImageUrl() != null) {
                    try {
                        Path oldPath = uploadProperties.fromUrl(existing.getImageUrl());
                        Files.deleteIfExists(oldPath);
                    } catch (Exception ignored) {}
                }
                existing.setImageUrl(null);
            }

            return ResponseEntity.ok(repo.save(existing));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    public ResponseEntity<?> delete(Long id) {
        try {
            CommunityIssueLog existing = repo.findById(id).orElse(null);
            if (existing == null) {
                return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            }
            
            // 🛠️ แก้ไข: ตามไปทำลายไฟล์รูปของ Log บนดิสก์ทิ้งด้วยเมื่อกดสั่งลบทั้ง Record
            if (existing.getImageUrl() != null) {
                try {
                    Path imgPath = uploadProperties.fromUrl(existing.getImageUrl());
                    Files.deleteIfExists(imgPath);
                } catch (Exception ignored) {}
            }

            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }
}