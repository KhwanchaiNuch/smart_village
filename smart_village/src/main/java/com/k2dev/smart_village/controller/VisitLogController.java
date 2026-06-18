package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.VisitLog;
import com.k2dev.smart_village.service.VisitLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visit-logs")
public class VisitLogController {

    @Autowired private VisitLogService service;

    @GetMapping
    public List<VisitLog> list(@RequestParam(required = false) Integer villageId) {
        return service.list(villageId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return service.get(id);
    }

    @GetMapping("/by-person/{personId}")
    public List<VisitLog> byPerson(@PathVariable Long personId) {
        return service.listByPerson(personId);
    }

    @GetMapping("/by-household/{householdId}")
    public List<VisitLog> byHousehold(@PathVariable Long householdId) {
        return service.listByHousehold(householdId);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody VisitLog v) {
        return service.add(v);
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody VisitLog v) {
        return service.edit(v);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return service.delete(id);
    }
}
