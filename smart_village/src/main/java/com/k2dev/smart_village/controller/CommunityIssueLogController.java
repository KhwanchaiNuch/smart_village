package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.CommunityIssue;
import com.k2dev.smart_village.entity.CommunityIssueLog;
import com.k2dev.smart_village.repository.CommunityIssueLogRepository;
import com.k2dev.smart_village.repository.CommunityIssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community-issue-logs")
public class CommunityIssueLogController {

    @Autowired private CommunityIssueLogRepository repo;
    @Autowired private CommunityIssueRepository issueRepo;

    @GetMapping
    public List<CommunityIssueLog> list(@RequestParam Long issueId) {
        return repo.findByIssueIdOrderByCreatedAtDesc(issueId);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody CommunityIssueLog log) {
        try {
            log.setId(null);

            // ถ้า log มี status ให้อัปเดต status ของ issue หลักด้วย
            if (log.getStatus() != null && !log.getStatus().isBlank()) {
                CommunityIssue issue = issueRepo.findById(log.getIssueId()).orElse(null);
                if (issue != null) {
                    issue.setStatus(log.getStatus());
                    issueRepo.save(issue);
                }
            }

            return ResponseEntity.ok(repo.save(log));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody CommunityIssueLog log) {
        try {
            if (log.getId() == null)
                return ResponseEntity.badRequest().body(Map.of("message", "ต้องระบุ id"));
            CommunityIssueLog existing = repo.findById(log.getId()).orElse(null);
            if (existing == null)
                return ResponseEntity.status(404).body(Map.of("message", "ไม่พบข้อมูล"));

            // อัปเดต status ของ issue หลักถ้ามีการเปลี่ยน
            if (log.getStatus() != null && !log.getStatus().isBlank()) {
                CommunityIssue issue = issueRepo.findById(log.getIssueId()).orElse(null);
                if (issue != null) {
                    issue.setStatus(log.getStatus());
                    issueRepo.save(issue);
                }
            }
            return ResponseEntity.ok(repo.save(log));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
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
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "เกิดข้อผิดพลาด"));
        }
    }
}
