
package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.CommunityIssue;
import com.k2dev.smart_village.repository.CommunityIssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community-issues")
public class CommunityIssueController {

    @Autowired
    private CommunityIssueRepository repo;

    @GetMapping
    public List<CommunityIssue> list() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public CommunityIssue get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
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

    @PostMapping("/add")
    public CommunityIssue add(@RequestBody CommunityIssue issue) {
        return repo.save(issue);
    }

    @PostMapping("/edit")
    public CommunityIssue edit(@RequestBody CommunityIssue issue) {
        return repo.save(issue);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
