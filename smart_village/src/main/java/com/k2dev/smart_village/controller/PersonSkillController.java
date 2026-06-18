package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.PersonSkill;
import com.k2dev.smart_village.service.PersonSkillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/person-skills")
public class PersonSkillController {

    @Autowired private PersonSkillService service;

    @GetMapping
    public List<PersonSkill> list(@RequestParam(required = false) Integer villageId) {
        return service.list(villageId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Integer id) {
        return service.get(id);
    }

    @GetMapping("/by-person/{personId}")
    public List<PersonSkill> byPerson(@PathVariable Integer personId) {
        return service.listByPerson(personId);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody PersonSkill e) {
        return service.add(e);
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody PersonSkill e) {
        return service.edit(e);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        return service.delete(id);
    }
}
