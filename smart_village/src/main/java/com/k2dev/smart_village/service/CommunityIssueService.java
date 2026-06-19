package com.k2dev.smart_village.service;

import com.k2dev.smart_village.entity.Amphur;
import com.k2dev.smart_village.dto.IssueRecommendationDTO;
import com.k2dev.smart_village.entity.CommunityIssue;
import com.k2dev.smart_village.entity.Household;
import com.k2dev.smart_village.entity.Person;
import com.k2dev.smart_village.entity.PersonSkill;
import com.k2dev.smart_village.entity.Tambon;
import com.k2dev.smart_village.entity.Village;
import com.k2dev.smart_village.entity.VillageResource;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CommunityIssueService {

    @Autowired private CommunityIssueRepository repo;
    @Autowired private HouseholdRepository householdRepo;
    @Autowired private GeoScopeService geoScope;
    @Autowired private VillageRepository villageRepo;
    @Autowired private TambonRepository tambonRepo;
    @Autowired private AmphurRepository amphurRepo;
    @Autowired private PersonRepository personRepo;
    @Autowired private PersonSkillRepository personSkillRepo;
    @Autowired private VillageResourceRepository villageResourceRepo;

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

    // ── keyword map: issueType → skill/resource keywords ─────────────────────
    private static final Map<String, List<String>> SKILL_KEYWORDS = Map.ofEntries(
        Map.entry("โครงสร้างพื้นฐาน", List.of(
            "ช่าง", "ก่อสร้าง", "ประปา", "ไฟฟ้า", "ซ่อม", "งานไม้", "เชื่อม", "โยธา",
            "ช่างยนต์", "ช่างปูน", "ช่างทาสี", "ช่างฝีมือ", "ช่างกระเบื้อง", "อิเล็กทรอนิกส์",
            "ก่อ", "สร้าง", "ปรับปรุง", "ถนน", "สะพาน", "ขุด", "ท่อ")),
        Map.entry("สิ่งแวดล้อม", List.of(
            "เกษตร", "ปลูก", "ต้นไม้", "ป่า", "สวน", "ทำนา", "เลี้ยงสัตว์", "ชลประทาน",
            "ปศุสัตว์", "ประมง", "ขยะ", "รีไซเคิล", "สิ่งแวดล้อม", "ดิน", "น้ำ",
            "ปลูกป่า", "บำบัด", "เลี้ยง", "พืช", "ผัก", "ไร่", "สวนผลไม้")),
        Map.entry("สุขภาพ", List.of(
            "พยาบาล", "สาธารณสุข", "อสม", "แพทย์", "ดูแล", "เภสัช",
            "ผู้สูงอายุ", "ผู้ป่วย", "ปฐมพยาบาล", "กายภาพ", "จิตวิทยา", "ทำแผล",
            "หมอ", "สุขภาพ", "สุขาภิบาล", "โภชนาการ", "นวด", "แพทย์แผนไทย",
            "ฟื้นฟู", "บำบัด", "ดูแลผู้ป่วย", "ดูแลผู้สูงอายุ", "ติดเตียง", "พิการ")),
        Map.entry("เศรษฐกิจ", List.of(
            "บัญชี", "การเงิน", "ธุรกิจ", "ค้าขาย", "การตลาด", "ออมทรัพย์",
            "กลุ่มอาชีพ", "แปรรูป", "หัตถกรรม", "ทอผ้า", "วิสาหกิจ", "สหกรณ์",
            "ขาย", "ผลิต", "ออนไลน์", "ตลาด", "พาณิชย์", "ลงทุน", "ประกอบอาชีพ")),
        Map.entry("การศึกษา", List.of(
            "ครู", "สอน", "การศึกษา", "อบรม", "วิชาการ", "ฝึกอาชีพ",
            "ติวเตอร์", "คอมพิวเตอร์", "ดนตรี", "กีฬา", "ศิลปะ", "ดูแลเด็ก",
            "ภาษา", "สอนหนังสือ", "วิทยาศาสตร์", "คณิต", "ภาษาอังกฤษ", "เด็ก")),
        Map.entry("สังคม/ความปลอดภัย", List.of(
            "รปภ", "อาสา", "จิตอาสา", "กฎหมาย", "ป้องกัน", "ชุมชน",
            "ตำรวจ", "ทหาร", "ไกล่เกลี่ย", "ผู้นำ", "ปกครอง", "ยาเสพติด",
            "ดูแล", "สังคม", "ประสานงาน", "สวัสดิการ", "เฝ้าระวัง", "อาสาสมัคร")),
        Map.entry("อื่น ๆ", List.of(
            "อาสา", "จิตอาสา", "ช่วยเหลือ", "ประสานงาน", "ดูแล", "ชุมชน"))
    );

    private static final Map<String, List<String>> RESOURCE_KEYWORDS = Map.ofEntries(
        Map.entry("โครงสร้างพื้นฐาน", List.of(
            "เครื่องมือ", "วัสดุ", "รถ", "เครื่องจักร", "ปั๊ม", "ไฟฟ้า", "ท่อ",
            "ปูน", "เหล็ก", "อิฐ", "ทราย", "หิน", "ไม้", "สี", "สายไฟ", "เครน")),
        Map.entry("สิ่งแวดล้อม", List.of(
            "ที่ดิน", "น้ำ", "ปุ๋ย", "เมล็ด", "สวน", "เกษตร", "ป่า",
            "เครื่องสูบน้ำ", "รถไถ", "ถังขยะ", "พันธุ์พืช", "พันธุ์สัตว์", "แปลงผัก")),
        Map.entry("สุขภาพ", List.of(
            "ยา", "อุปกรณ์การแพทย์", "รถพยาบาล", "สาธารณสุข", "สุขภาพ",
            "เปล", "รถเข็น", "ไม้เท้า", "ออกซิเจน", "ชุดปฐมพยาบาล", "เครื่องวัด",
            "ยาสามัญ", "อุปกรณ์ฟื้นฟู", "ที่นอนผู้ป่วย")),
        Map.entry("เศรษฐกิจ", List.of(
            "กองทุน", "เงิน", "ทุน", "สินค้า", "วัตถุดิบ", "อุปกรณ์",
            "เงินกู้", "สหกรณ์", "ตลาด", "โรงเรือน", "เครื่องแปรรูป", "บรรจุภัณฑ์")),
        Map.entry("การศึกษา", List.of(
            "หนังสือ", "อุปกรณ์การเรียน", "ห้องสมุด", "คอมพิวเตอร์", "ศูนย์",
            "โต๊ะ", "เก้าอี้", "กระดาน", "โปรเจคเตอร์", "อินเทอร์เน็ต", "แท็บเล็ต")),
        Map.entry("สังคม/ความปลอดภัย", List.of(
            "กล้อง", "ไฟ", "อุปกรณ์", "รถ", "ศาลา", "ชุมชน",
            "วิทยุสื่อสาร", "ไฟฉาย", "สัญญาณเตือน", "รั้ว", "ประตู", "ไฟส่องสว่าง")),
        Map.entry("อื่น ๆ", List.of(
            "ยานพาหนะ", "รถ", "อุปกรณ์", "ศาลา", "ชุมชน"))
    );

    public ResponseEntity<?> getRecommendations(Long issueId) {
        CommunityIssue issue = repo.findById(issueId).orElse(null);
        if (issue == null) return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));

        Integer villageId = issue.getVillageId();
        if (villageId == null && issue.getHouseholdId() != null) {
            Household hh = householdRepo.findById(issue.getHouseholdId().intValue()).orElse(null);
            if (hh != null) villageId = hh.getVillageId();
        }

        String issueType = issue.getIssueType() != null ? issue.getIssueType().trim() : "";

        // ── กำลังคน: match ผ่าน skillCategories ──────────────────────────────────
        List<IssueRecommendationDTO.MatchedPerson> matchedPeople = new ArrayList<>();
        if (!issueType.isEmpty() && villageId != null) {
            List<Integer> hhIds = householdRepo.findByVillageId(villageId)
                    .stream().map(Household::getHouseholdId).collect(Collectors.toList());

            if (!hhIds.isEmpty()) {
                List<Person> persons = personRepo.findByHouseholdIdIn(hhIds);
                List<Integer> personIds = persons.stream().map(Person::getPersonId).collect(Collectors.toList());
                List<PersonSkill> allSkills = personIds.isEmpty() ? List.of()
                        : personSkillRepo.findByPersonIdIn(personIds);

                Map<Integer, Household> hhById = householdRepo.findByVillageId(villageId)
                        .stream().collect(Collectors.toMap(Household::getHouseholdId, h -> h));
                Map<Integer, Household> personHousehold = new java.util.HashMap<>();
                for (Person p : persons) {
                    if (p.getHouseholdId() != null) {
                        Household hh = hhById.get(p.getHouseholdId());
                        if (hh != null) personHousehold.put(p.getPersonId(), hh);
                    }
                }

                Set<Integer> added = new java.util.HashSet<>();
                for (PersonSkill skill : allSkills) {
                    // match ผ่าน skillCategories (structured tag)
                    String cats = skill.getSkillCategories();
                    if (cats == null || cats.isBlank()) continue;
                    boolean catMatch = java.util.Arrays.stream(cats.split(","))
                            .map(String::trim)
                            .anyMatch(c -> c.equals(issueType));
                    if (!catMatch || !added.add(skill.getPersonId())) continue;

                    Person p = persons.stream()
                            .filter(x -> x.getPersonId().equals(skill.getPersonId()))
                            .findFirst().orElse(null);
                    if (p == null) continue;

                    Household hh = personHousehold.get(p.getPersonId());
                    String fullName = ((p.getFirstName() != null ? p.getFirstName() : "") + " "
                            + (p.getLastName() != null ? p.getLastName() : "")).trim();
                    matchedPeople.add(new IssueRecommendationDTO.MatchedPerson(
                            p.getPersonId(), fullName, p.getAge(), p.getOccupation(),
                            skill.getSkillName(), skill.getSkillLevel(),
                            hh != null ? hh.getHouseholdId() : null,
                            hh != null ? hh.getHouseNo() : null
                    ));
                }
            }
        }

        // ── ทรัพยากร: match ผ่าน resourceCategories ──────────────────────────────
        List<IssueRecommendationDTO.MatchedResource> matchedResources = new ArrayList<>();
        if (!issueType.isEmpty() && villageId != null) {
            List<VillageResource> resources = villageResourceRepo.findByVillageId(villageId);
            for (VillageResource r : resources) {
                String cats = r.getResourceCategories();
                if (cats == null || cats.isBlank()) continue;
                boolean catMatch = java.util.Arrays.stream(cats.split(","))
                        .map(String::trim)
                        .anyMatch(c -> c.equals(issueType));
                if (catMatch) {
                    matchedResources.add(new IssueRecommendationDTO.MatchedResource(
                            r.getResourceId(), r.getResourceName(), r.getResourceType(), r.getDescription()
                    ));
                }
            }
        }

        return ResponseEntity.ok(new IssueRecommendationDTO(matchedPeople, matchedResources));
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
