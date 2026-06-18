package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.HealthRecord;
import com.k2dev.smart_village.service.HealthRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health-records")
public class HealthRecordController {

    @Autowired private HealthRecordService service;

    @GetMapping
    public List<HealthRecord> list(@RequestParam(required = false) Integer villageId) {
        return service.list(villageId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody HealthRecord h) {
        return service.add(h);
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody HealthRecord h) {
        return service.edit(h);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return service.delete(id);
    }
}
