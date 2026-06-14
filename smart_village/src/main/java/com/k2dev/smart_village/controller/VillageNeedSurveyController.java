package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.VillageNeedSurvey;
import com.k2dev.smart_village.repository.HouseholdRepository;
import com.k2dev.smart_village.repository.VillageNeedSurveyRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/village-need-surveys")
public class VillageNeedSurveyController {

    @Autowired
    private VillageNeedSurveyRepository repo;

    @Autowired
    private HouseholdRepository householdRepo;

    @GetMapping
    public List<VillageNeedSurvey> list() {
        if (ScopeUtil.isAdmin()) return repo.findAll();
        Integer vid = ScopeUtil.getScopeId();
        if (vid == null) return List.of();
        List<Integer> hhIds = householdRepo.findByVillageId(vid).stream()
                .map(h -> h.getHouseholdId()).toList();
        return repo.findByHouseholdIdIn(hhIds);
    }

    @GetMapping("/{id}")
    public VillageNeedSurvey get(@PathVariable Integer id) {
        return repo.findById(id).orElseThrow();
    }

    @GetMapping("/by-household/{householdId}")
    public List<VillageNeedSurvey> byHousehold(@PathVariable Integer householdId) {
        return repo.findByHouseholdId(householdId);
    }

    @GetMapping("/by-person/{personId}")
    public List<VillageNeedSurvey> byPerson(@PathVariable Integer personId) {
        return repo.findByPersonId(personId);
    }

    @PostMapping("/add")
    public VillageNeedSurvey add(@RequestBody VillageNeedSurvey e) {
        e.setSurveyId(null);
        return repo.save(e);
    }

    @PostMapping("/edit")
    public VillageNeedSurvey edit(@RequestBody VillageNeedSurvey e) {
        return repo.save(e);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        repo.deleteById(id);
    }
}
