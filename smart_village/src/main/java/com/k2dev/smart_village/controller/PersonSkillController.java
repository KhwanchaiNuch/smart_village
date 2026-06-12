package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.PersonSkill;
import com.k2dev.smart_village.repository.PersonSkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/person-skills")
public class PersonSkillController {

    @Autowired
    private PersonSkillRepository repo;

    @GetMapping
    public List<PersonSkill> list() {
        return repo.findAll();
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
