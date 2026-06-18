package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.Person;
import com.k2dev.smart_village.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/persons")
public class PersonController {

    @Autowired private PersonService service;

    @GetMapping
    public List<Person> list(@RequestParam(required = false) Integer villageId) {
        return service.list(villageId);
    }

    @GetMapping("/by-village/{villageId}")
    public List<Person> listByVillage(@PathVariable Integer villageId) {
        return service.listByVillage(villageId);
    }

    @GetMapping("/by-household/{householdId}")
    public List<Person> listByHousehold(@PathVariable Integer householdId) {
        return service.listByHousehold(householdId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Integer id) {
        return service.get(id);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody Person p) {
        return service.add(p);
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody Person p) {
        return service.edit(p);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        return service.delete(id);
    }
}
