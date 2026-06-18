package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.CommunityIssueLog;
import com.k2dev.smart_village.service.CommunityIssueLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/community-issue-logs")
public class CommunityIssueLogController {

    @Autowired private CommunityIssueLogService service;

    @GetMapping
    public List<CommunityIssueLog> list(@RequestParam Long issueId) {
        return service.list(issueId);
    }

    @PostMapping(value = "/add", consumes = {"multipart/form-data", "application/x-www-form-urlencoded"})
    public ResponseEntity<?> add(
            @RequestParam Long issueId,
            @RequestParam String title,
            @RequestParam(required = false) String detail,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer villageId,
            @RequestParam(required = false) MultipartFile file,
            HttpServletRequest request) {
        return service.add(issueId, title, detail, status, villageId, file);
    }

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
        return service.edit(id, issueId, title, detail, status, villageId, file, removeImage);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return service.delete(id);
    }
}
