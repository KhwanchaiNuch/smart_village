package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.CommunityIssue;
import com.k2dev.smart_village.service.CommunityIssueService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/community-issues")
public class CommunityIssueController {

    @Autowired private CommunityIssueService service;

    @GetMapping
    public List<CommunityIssue> list(@RequestParam(required = false) Integer villageId) {
        return service.list(villageId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return service.get(id);
    }

    @GetMapping("/by-status/{status}")
    public List<CommunityIssue> byStatus(@PathVariable String status) {
        return service.listByStatus(status);
    }

    @GetMapping("/by-household/{householdId}")
    public List<CommunityIssue> byHousehold(@PathVariable Long householdId) {
        return service.listByHousehold(householdId);
    }

    @GetMapping("/by-type/{issueType}")
    public List<CommunityIssue> byType(@PathVariable String issueType) {
        return service.listByType(issueType);
    }

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
        return service.add(householdId, area, issueType, severity, status, owner, impactPeople,
                budgetEstimate, dueDate, remark, villageId, file);
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
        return service.edit(id, householdId, area, issueType, severity, status, owner, impactPeople,
                budgetEstimate, dueDate, remark, villageId, file, removeImage);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return service.delete(id);
    }
}
