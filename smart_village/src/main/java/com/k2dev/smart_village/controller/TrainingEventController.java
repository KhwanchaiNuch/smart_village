
package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.TrainingEvent;
import com.k2dev.smart_village.repository.TrainingEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/training-events")
public class TrainingEventController {

    @Autowired
    private TrainingEventRepository repo;

    @GetMapping
    public List<TrainingEvent> list() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public TrainingEvent get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }

    @GetMapping("/by-type/{type}")
    public List<TrainingEvent> byType(@PathVariable String type) {
        return repo.findByTrainingType(type);
    }

    @PostMapping("/add")
    public TrainingEvent add(@RequestBody TrainingEvent t) {
        return repo.save(t);
    }

    @PostMapping("/edit")
    public TrainingEvent edit(@RequestBody TrainingEvent t) {
        return repo.save(t);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
