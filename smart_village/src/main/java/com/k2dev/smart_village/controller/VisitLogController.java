package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.VisitLog;
import com.k2dev.smart_village.repository.HouseholdRepository;
import com.k2dev.smart_village.repository.VisitLogRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visit-logs")
public class VisitLogController {

    @Autowired
    private VisitLogRepository repo;

    @Autowired
    private HouseholdRepository householdRepo;

    @GetMapping
    public List<VisitLog> list() {
        if (ScopeUtil.isAdmin()) return repo.findAll();
        Integer vid = ScopeUtil.getScopeId();
        if (vid == null) return List.of();
        List<Long> hhIds = householdRepo.findByVillageId(vid).stream()
                .map(h -> h.getHouseholdId().longValue()).toList();
        return repo.findByHouseholdIdIn(hhIds);
    }

    @GetMapping("/{id}")
    public VisitLog get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }

    @GetMapping("/by-person/{personId}")
    public List<VisitLog> byPerson(@PathVariable Long personId) {
        return repo.findByPersonId(personId);
    }

    @GetMapping("/by-household/{householdId}")
    public List<VisitLog> byHousehold(@PathVariable Long householdId) {
        return repo.findByHouseholdId(householdId);
    }

    @PostMapping("/add")
    public VisitLog add(@RequestBody VisitLog v) {
        return repo.save(v);
    }

    @PostMapping("/edit")
    public VisitLog edit(@RequestBody VisitLog v) {
        return repo.save(v);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
