package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.PersonSkill;
import com.k2dev.smart_village.repository.HouseholdRepository;
import com.k2dev.smart_village.repository.PersonRepository;
import com.k2dev.smart_village.repository.PersonSkillRepository;
import com.k2dev.smart_village.security.ScopeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/person-skills")
public class PersonSkillController {

    @Autowired
    private PersonSkillRepository repo;

    @Autowired
    private HouseholdRepository householdRepo;

    @Autowired
    private PersonRepository personRepo;

    @GetMapping
    public List<PersonSkill> list() {
        if (ScopeUtil.isAdmin()) return repo.findAll();
        Integer vid = ScopeUtil.getScopeId();
        if (vid == null) return List.of();
        List<Integer> hhIds = householdRepo.findByVillageId(vid).stream()
                .map(h -> h.getHouseholdId()).toList();
        List<Integer> personIds = personRepo.findByHouseholdIdIn(hhIds).stream()
                .map(p -> p.getPersonId()).toList();
        return repo.findByPersonIdIn(personIds);
    }

    @GetMapping("/{id}")
    public PersonSkill get(@PathVariable Integer id) {
        return repo.findById(id).orElseThrow();
    }

    @GetMapping("/by-person/{personId}")
    public List<PersonSkill> byPerson(@PathVariable Integer personId) {
        return repo.findByPersonId(personId);
    }

    @PostMapping("/add")
    public PersonSkill add(@RequestBody PersonSkill e) {
        e.setSkillId(null);
        return repo.save(e);
    }

    @PostMapping("/edit")
    public PersonSkill edit(@RequestBody PersonSkill e) {
        return repo.save(e);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        repo.deleteById(id);
    }
}
