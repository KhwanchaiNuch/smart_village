
package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.TrainingParticipant;
import com.k2dev.smart_village.repository.TrainingParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/training-participants")
public class TrainingParticipantController {

    @Autowired
    private TrainingParticipantRepository repo;

    @GetMapping
    public List<TrainingParticipant> list() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public TrainingParticipant get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }

    @GetMapping("/by-training/{trainingId}")
    public List<TrainingParticipant> byTraining(@PathVariable Long trainingId) {
        return repo.findByTrainingId(trainingId);
    }

    @GetMapping("/by-person/{personId}")
    public List<TrainingParticipant> byPerson(@PathVariable Long personId) {
        return repo.findByPersonId(personId);
    }

    @PostMapping("/add")
    public TrainingParticipant add(@RequestBody TrainingParticipant p) {
        return repo.save(p);
    }

    @PostMapping("/edit")
    public TrainingParticipant edit(@RequestBody TrainingParticipant p) {
        return repo.save(p);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
