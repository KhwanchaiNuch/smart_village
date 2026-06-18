package com.k2dev.smart_village.service;

import com.k2dev.smart_village.entity.Amphur;
import com.k2dev.smart_village.entity.CommunityIssue;
import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.entity.Tambon;
import com.k2dev.smart_village.entity.Village;
import com.k2dev.smart_village.repository.*;
import com.k2dev.smart_village.security.ScopeUtil;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class CommunityIssueService {

    @Autowired private CommunityIssueRepository repo;
    @Autowired private HouseholdRepository householdRepo;
    @Autowired private GeoScopeService geoScope;
    @Autowired private VillageRepository villageRepo;
    @Autowired private TambonRepository tambonRepo;
    @Autowired private AmphurRepository amphurRepo;

    @PostConstruct
    public void initUploadDir() {
        try {
            Files.createDirectories(Paths.get("./uploads").toAbsolutePath());
        } catch (Exception e) {
            System.err.println("[CommunityIssueService] Could not create uploads dir: " + e.getMessage());
        }
    }

    private boolean householdOwned(Long householdId) {
        if (householdId == null) return false;
        Household hh = householdRepo.findById(householdId.intValue()).orElse(null);
        Integer scopeId = ScopeUtil.getScopeId();
        return hh != null && scopeId != null && scopeId.equals(hh.getVillageId());
    }

    public String saveFile(MultipartFile file, Integer villageId, Long issueId) throws IOException {
        String subPath;
        if (villageId != null) {
            Village v          = villageRepo.findById(villageId).orElse(null);
            Integer tambonId   = v != null ? v.getTambonId() : null;
            Integer amphurId   = null, provinceId = null;
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
        String filename = UUID.randomUUID() + ext;
        Files.copy(file.getInputStream(), uploadDir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/" + subPath + "/" + filename;
    }

    public List<CommunityIssue> list(Integer villageId) {
        if (ScopeUtil.isAdmin()) {
            if (villageId != null) {
                List<Long> hhIds = householdRepo.findByVillageId(villageId).stream()
                        .map(h -> h.getHouseholdId().longValue()).toList();
                return repo.findByVillageIdOrHouseholdIdIn(villageId, hhIds);
            }
            return repo.findAll();
        }
        List<Integer> vids = geoScope.getVillageIds();
        if (vids == null) return repo.findAll();
        if (vids.isEmpty()) return List.of();
        if (villageId != null && vids.contains(villageId)) vids = List.of(villageId);
        List<Long> hhIds = householdRepo.findByVillageIdIn(vids).stream()
                .map(h -> h.getHouseholdId().longValue()).toList();
        return repo.findByVillageIdInOrHouseholdIdIn(vids, hhIds);
    }

    public ResponseEntity<?> get(Long id) {
        CommunityIssue c = repo.findById(id).orElse(null);
        if (c == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
        if (ScopeUtil.isVillageLevel()) {
            Integer scopeId = ScopeUtil.getScopeId();
            boolean ownedByVillageId = c.getVillageId() != null && c.getVillageId().equals(scopeId);
            if (!ownedByVillageId && !householdOwned(c.getHouseholdId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้"));
        }
        return ResponseEntity.ok(c);
    }

    public List<CommunityIssue> listByStatus(String status) { return repo.findByStatus(status); }
    public List<CommunityIssue> listByHousehold(Long householdId) { return repo.findByHouseholdId(householdId); }
    public List<CommunityIssue> listByType(String issueType) { return repo.findByIssueType(issueType); }

    public ResponseEntity<?> add(Long householdId, String area, String issueType, Integer severity,
                                  String status, String owner, Integer impactPeople,
                                  BigDecimal budgetEstimate, String dueDate, String remark,
                                  Integer villageId, MultipartFile file) {
        try {
            CommunityIssue issue = new CommunityIssue();
            issue.setHouseholdId(householdId);
            issue.setArea(area);
            issue.setIssueType(issueType);
            issue.setSeverity(severity);
            issue.setStatus(status);
            issue.setOwner(owner != null && !owner.isBlank() ? owner : null);
            issue.setImpactPeople(impactPeople);
            issue.setBudgetEstimate(budgetEstimate);
            if (dueDate != null && !dueDate.isBlank()) issue.setDueDate(LocalDate.parse(dueDate));
            issue.setRemark(remark != null && !remark.isBlank() ? remark : null);

            Integer resolvedVillageId = villageId;
            if (resolvedVillageId == null && householdId != null) {
                Household hh = householdRepo.findById(householdId.intValue()).orElse(null);
                if (hh != null) resolvedVillageId = hh.getVillageId();
            }
            if (resolvedVillageId == null && ScopeUtil.isVillageLevel()) {
                resolvedVillageId = ScopeUtil.getScopeId();
            }
            issue.setVillageId(resolvedVillageId);

            if (ScopeUtil.isVillageLevel() && issue.getHouseholdId() != null && !householdOwned(issue.getHouseholdId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เพิ่มข้อมูลในหมู่บ้านอื่น"));

            CommunityIssue saved = repo.save(issue);
            if (file != null && !file.isEmpty()) {
                saved.setImageUrl(saveFile(file, resolvedVillageId, saved.getId()));
                saved = repo.save(saved);
            }
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    public ResponseEntity<?> edit(Long id, Long householdId, String area, String issueType,
                                   Integer severity, String status, String owner, Integer impactPeople,
                                   BigDecimal budgetEstimate, String dueDate, String remark,
                                   Integer villageId, MultipartFile file, boolean removeImage) {
        try {
            CommunityIssue existing = repo.findById(id).orElse(null);
            if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            
            // ── 🛠️ แก้ไขสิทธิ์: ยืดหยุ่นขอบเขตขึ้นเพื่อไม่บล็อกการเซฟแบบเคลียร์รูปกลางของหมู่บ้าน ──
            if (ScopeUtil.isVillageLevel()) {
                Integer scopeId = ScopeUtil.getScopeId();
                boolean byCurrentVillage = existing.getVillageId() != null && existing.getVillageId().equals(scopeId);
                boolean byNewVillage = villageId != null && villageId.equals(scopeId);
                
                if (!byCurrentVillage && !byNewVillage && !householdOwned(existing.getHouseholdId()) && !householdOwned(householdId)) {
                    return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์แก้ไขข้อมูลของหมู่บ้านอื่น"));
                }
            }

            existing.setHouseholdId(householdId);
            existing.setArea(area);
            existing.setIssueType(issueType);
            existing.setSeverity(severity);
            existing.setStatus(status);
            existing.setOwner(owner != null && !owner.isBlank() ? owner : null);
            existing.setImpactPeople(impactPeople);
            existing.setBudgetEstimate(budgetEstimate);
            existing.setRemark(remark != null && !remark.isBlank() ? remark : null);

            // ── 🛠️ แก้ไขจุดแครช 500: ดักฟอร์แมตวันที่ยาวๆ จากหน้าบ้านอย่างปลอดภัย ──
            if (dueDate != null && !dueDate.isBlank()) {
                try {
                    String cleanDate = dueDate.contains("T") ? dueDate.split("T")[0] : dueDate.trim();
                    if (cleanDate.contains(" ")) {
                        cleanDate = cleanDate.split(" ")[0];
                    }
                    existing.setDueDate(LocalDate.parse(cleanDate));
                } catch (Exception e) {
                    System.err.println("[Warning] วันที่แปลงผิดฟอร์แมต: " + dueDate + " -> ยึดค่าเดิมไว้");
                }
            } else {
                existing.setDueDate(null);
            }

            if (villageId != null) {
                existing.setVillageId(villageId);
            } else if (existing.getVillageId() == null && householdId != null) {
                Household hh = householdRepo.findById(householdId.intValue()).orElse(null);
                if (hh != null) existing.setVillageId(hh.getVillageId());
            }

            // ── 🛠️ สั่งทำลายและเคลียร์รูปภาพประกอบแบบเด็ดขาด ──
            if (file != null && !file.isEmpty()) {
                Integer vid = existing.getVillageId();
                if (existing.getImageUrl() != null) {
                    try {
                        Path oldPath = Paths.get("." + existing.getImageUrl()).toAbsolutePath().normalize();
                        Files.deleteIfExists(oldPath);
                    } catch (Exception ignored) {}
                }
                existing.setImageUrl(saveFile(file, vid, id));
            } else if (removeImage) {
                if (existing.getImageUrl() != null) {
                    try {
                        Path oldPath = Paths.get("." + existing.getImageUrl()).toAbsolutePath().normalize();
                        Files.deleteIfExists(oldPath);
                    } catch (Exception ignored) {}
                }
                existing.setImageUrl(null);
            }

            return ResponseEntity.ok(repo.save(existing));
        } catch (Exception e) {
            e.printStackTrace(); // พ่น StackTrace ดูบรรทัดปัญหาใน Console 後台
            return ResponseEntity.status(500).body(Map.of("message", "เกิดข้อผิดพลาดในระบบหลังบ้าน: " + e.toString()));
        }
    }

    public ResponseEntity<?> delete(Long id) {
        try {
            CommunityIssue existing = repo.findById(id).orElse(null);
            if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            if (ScopeUtil.isVillageLevel()) {
                Integer scopeId = ScopeUtil.getScopeId();
                boolean byVillage = existing.getVillageId() != null && existing.getVillageId().equals(scopeId);
                if (!byVillage && !householdOwned(existing.getHouseholdId()))
                    return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์ลบข้อมูลของหมู่บ้านอื่น"));
            }
            
            if (existing.getImageUrl() != null) {
                try {
                    Path imgPath = Paths.get("." + existing.getImageUrl()).toAbsolutePath().normalize();
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