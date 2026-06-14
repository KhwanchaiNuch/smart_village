package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.HealthRecord;
import com.k2dev.smart_village.repository.HealthRecordRepository;
import com.k2dev.smart_village.repository.HouseholdRepository;
import com.k2dev.smart_village.repository.PersonRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health-records")
@RequiredArgsConstructor
public class HealthRecordController {

    @Autowired
    private HealthRecordRepository repo;

    @Autowired
    private HouseholdRepository householdRepo;

    @Autowired
    private PersonRepository personRepo;

    @GetMapping
    public List<HealthRecord> list() {
        if (ScopeUtil.isAdmin()) return repo.findAll();
        Integer vid = ScopeUtil.getScopeId();
        if (vid == null) return List.of();
        List<Integer> hhIds = householdRepo.findByVillageId(vid).stream()
                .map(h -> h.getHouseholdId()).toList();
        List<Long> personIds = personRepo.findByHouseholdIdIn(hhIds).stream()
                .map(p -> p.getPersonId().longValue()).toList();
        return repo.findByPersonIdIn(personIds);
    }

    @GetMapping("/{id}")
    public HealthRecord get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }

    @PostMapping("/add")
    public HealthRecord add(@RequestBody HealthRecord h) {
        return repo.save(h);
    }

    @PostMapping("/edit")
    public HealthRecord edit(@RequestBody HealthRecord h) {
        return repo.save(h);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
