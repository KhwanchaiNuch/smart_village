package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Amphur;
import com.k2dev.smart_village.entity.CommunityIssue;
import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.entity.Tambon;
import com.k2dev.smart_village.entity.Village;
import com.k2dev.smart_village.repository.*;
import com.k2dev.smart_village.security.ScopeUtil;
import com.k2dev.smart_village.service.GeoScopeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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

@RestController
@RequestMapping("/api/community-issues")
public class CommunityIssueController {

    @Autowired private CommunityIssueRepository repo;
    @Autowired private HouseholdRepository householdRepo;
    @Autowired private GeoScopeService geoScope;
    @Autowired private VillageRepository villageRepo;
    @Autowired private TambonRepository tambonRepo;
    @Autowired private AmphurRepository amphurRepo;

    private boolean householdOwned(Long householdId) {
        if (householdId == null) return false;
        Household hh = householdRepo.findById(householdId.intValue()).orElse(null);
        Integer scopeId = ScopeUtil.getScopeId();
        return hh != null && scopeId != null && scopeId.equals(hh.getVillageId());
    }

    @GetMapping
    public List<CommunityIssue> list(@RequestParam(required = false) Integer villageId) {
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
        List<Long> hhIds = householdRepo.findByVillageIdIn(vids).stream()
                .map(h -> h.getHouseholdId().longValue()).toList();
        return repo.findByVillageIdInOrHouseholdIdIn(vids, hhIds);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        CommunityIssue c = repo.findById(id).orElse(null);
        if (c == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
        if (ScopeUtil.isVillageLevel()) {
            Integer scopeId = ScopeUtil.getScopeId();
            boolean ownedByVillageId = c.getVillageId() != null && c.getVillageId().equals(scopeId);
            boolean ownedByHousehold = householdOwned(c.getHouseholdId());
            if (!ownedByVillageId && !ownedByHousehold)
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้"));
        }
        return ResponseEntity.ok(c);
    }

    @GetMapping("/by-status/{status}")
    public List<CommunityIssue> byStatus(@PathVariable String status) {
        return repo.findByStatus(status);
    }

    @GetMapping("/by-household/{householdId}")
    public List<CommunityIssue> byHousehold(@PathVariable Long householdId) {
        return repo.findByHouseholdId(householdId);
    }

    @GetMapping("/by-type/{issueType}")
    public List<CommunityIssue> byType(@PathVariable String issueType) {
        return repo.findByIssueType(issueType);
    }

    // ─── ADD — รับ multipart form (fields + optional file) ───────────────────
    @PostMapping(value = "/add", consumes = {"multipart/form-data", "application/x-www-form-urlencoded", "application/json"})
    public ResponseEntity<?> add(
            @RequestParam(required = false) Long householdId,
            @RequestParam String area,
            @RequestParam String issueType,
            @RequestParam Integer severity,
            @RequestParam String status,
            @RequestParam(required = false) String owner,
            @RequestParam(required = false) Integer impactPeople,
            @RequestParam(required = false) BigDecimal budgetEstimate,
            @RequestParam(required = false) String dueDate,
            @RequestParam(required = false) String remark,
            @RequestParam(required = false) Integer villageId,
            @RequestParam(required = false) MultipartFile file,
            HttpServletRequest request) {
        try {
            // สร้าง entity
            CommunityIssue issue = new CommunityIssue();
            issue.setHouseholdId(householdId);
            issue.setArea(area);
            issue.setIssueType(issueType);
            issue.setSeverity(severity);
            issue.setStatus(status);
            issue.setOwner(owner != null && !owner.isBlank() ? owner : null);
            issue.setImpactPeople(impactPeople);
            issue.setBudgetEstimate(budgetEstimate);
            if (dueDate != null && !dueDate.isBlank()) {
                issue.setDueDate(LocalDate.parse(dueDate));
            }
            issue.setRemark(remark != null && !remark.isBlank() ? remark : null);

            // resolve villageId: ใช้ param ที่ส่งมา, ไม่มีให้ derive จาก household, ไม่มีให้ใช้ scope
            Integer resolvedVillageId = villageId;
            if (resolvedVillageId == null && householdId != null) {
                Household hh = householdRepo.findById(householdId.intValue()).orElse(null);
                if (hh != null) resolvedVillageId = hh.getVillageId();
            }
            if (resolvedVillageId == null && ScopeUtil.isVillageLevel()) {
                resolvedVillageId = ScopeUtil.getScopeId();
            }
            issue.setVillageId(resolvedVillageId);

            // scope check
            if (ScopeUtil.isVillageLevel() && issue.getHouseholdId() != null && !householdOwned(issue.getHouseholdId()))
                return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์เพิ่มข้อมูลในหมู่บ้านอื่น"));

            // save ก่อน → ได้ issueId
            CommunityIssue saved = repo.save(issue);

            // บันทึกไฟล์ (ถ้ามี)
            if (file != null && !file.isEmpty()) {
                String imageUrl = saveFile(file, villageId, saved.getId(), request);
                saved.setImageUrl(imageUrl);
                saved = repo.save(saved);
            }

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @PostMapping(value = "/edit", consumes = {"multipart/form-data", "application/x-www-form-urlencoded"})
    public ResponseEntity<?> edit(
            @RequestParam Long id,
            @RequestParam(required = false) Long householdId,
            @RequestParam String area,
            @RequestParam String issueType,
            @RequestParam Integer severity,
            @RequestParam String status,
            @RequestParam(required = false) String owner,
            @RequestParam(required = false) Integer impactPeople,
            @RequestParam(required = false) BigDecimal budgetEstimate,
            @RequestParam(required = false) String dueDate,
            @RequestParam(required = false) String remark,
            @RequestParam(required = false) Integer villageId,
            @RequestParam(required = false) MultipartFile file,
            @RequestParam(required = false, defaultValue = "false") boolean removeImage,
            HttpServletRequest request) {
        try {
            CommunityIssue existing = repo.findById(id).orElse(null);
            if (existing == null)
                return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            if (ScopeUtil.isVillageLevel()) {
                Integer scopeId = ScopeUtil.getScopeId();
                boolean byVillage = existing.getVillageId() != null && existing.getVillageId().equals(scopeId);
                if (!byVillage && !householdOwned(existing.getHouseholdId()))
                    return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์แก้ไขข้อมูลของหมู่บ้านอื่น"));
            }

            // อัปเดต fields
            existing.setHouseholdId(householdId);
            existing.setArea(area);
            existing.setIssueType(issueType);
            existing.setSeverity(severity);
            existing.setStatus(status);
            existing.setOwner(owner != null && !owner.isBlank() ? owner : null);
            existing.setImpactPeople(impactPeople);
            existing.setBudgetEstimate(budgetEstimate);
            existing.setDueDate(dueDate != null && !dueDate.isBlank() ? LocalDate.parse(dueDate) : null);
            existing.setRemark(remark != null && !remark.isBlank() ? remark : null);

            // จัดการรูป
            if (file != null && !file.isEmpty()) {
                Integer vid = villageId;
                if (vid == null && householdId != null) {
                    Household hh = householdRepo.findById(householdId.intValue()).orElse(null);
                    if (hh != null) vid = hh.getVillageId();
                }
                existing.setImageUrl(saveFile(file, vid, id, request));
            } else if (removeImage) {
                existing.setImageUrl(null);
            }
            // ไม่ส่ง file + ไม่ removeImage → คง imageUrl เดิมไว้

            return ResponseEntity.ok(repo.save(existing));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            CommunityIssue existing = repo.findById(id).orElse(null);
            if (existing == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));
            if (ScopeUtil.isVillageLevel()) {
                Integer scopeId = ScopeUtil.getScopeId();
                boolean byVillage = existing.getVillageId() != null && existing.getVillageId().equals(scopeId);
                if (!byVillage && !householdOwned(existing.getHouseholdId()))
                    return ResponseEntity.status(403).body(Map.of("message", "ไม่มีสิทธิ์ลบข้อมูลของหมู่บ้านอื่น"));
            }
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "ลบสำเร็จ"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    // ─── helper: บันทึกไฟล์ลง path แบบ geo hierarchy ─────────────────────────
    private String saveFile(MultipartFile file, Integer villageId, Long issueId,
                            HttpServletRequest ignored) throws IOException {
        // สร้าง sub-path จาก geo chain
        String subPath;
        if (villageId != null) {
            Village v        = villageRepo.findById(villageId).orElse(null);
            Integer tambonId  = v != null ? v.getTambonId() : null;
            Integer amphurId  = null;
            Integer provinceId = null;

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
                    villageId,
                    issueId);
        } else {
            subPath = "misc/" + issueId;
        }

        // สร้าง directories
        Path uploadDir = Paths.get("./uploads/" + subPath).toAbsolutePath().normalize();
        Files.createDirectories(uploadDir);

        // ตั้งชื่อไฟล์ unique
        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
        }
        String filename = UUID.randomUUID() + ext;

        // บันทึกไฟล์
        Files.copy(file.getInputStream(), uploadDir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + subPath + "/" + filename;
    }
}
