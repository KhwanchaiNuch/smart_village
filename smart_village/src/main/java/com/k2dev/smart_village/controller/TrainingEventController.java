package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.TrainingEvent;
import com.k2dev.smart_village.service.TrainingEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/training-events")
public class TrainingEventController {

    @Autowired private TrainingEventService service;

    @GetMapping
    public List<TrainingEvent> list(@RequestParam(required = false) Integer villageId) {
        return service.list(villageId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return service.get(id);
    }

    @GetMapping("/by-type/{type}")
    public List<TrainingEvent> byType(@PathVariable String type) {
        return service.listByType(type);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody TrainingEvent t) {
        return service.add(t);
    }

    @PostMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody TrainingEvent t) {
        return service.edit(t);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return service.delete(id);
    }
}
