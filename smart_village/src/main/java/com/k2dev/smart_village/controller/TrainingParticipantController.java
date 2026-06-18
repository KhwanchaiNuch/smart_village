package com.k2dev.smart_village.controller;

import com.k2dev.smart_village.entity.TrainingParticipant;
import com.k2dev.smart_village.service.TrainingParticipantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/training-participants")
public class TrainingParticipantController {

    @Autowired private TrainingParticipantService service;

    @GetMapping
    public List<TrainingParticipant> list() { return service.list(); }

    @GetMapping("/{id}")
    public TrainingParticipant get(@PathVariable Long id) { return service.get(id); }

    @GetMapping("/by-training/{trainingId}")
    public List<TrainingParticipant> byTraining(@PathVariable Long trainingId) { return service.listByTraining(trainingId); }

    @GetMapping("/by-person/{personId}")
    public List<TrainingParticipant> byPerson(@PathVariable Long personId) { return service.listByPerson(personId); }

    @PostMapping("/add")
    public TrainingParticipant add(@RequestBody TrainingParticipant p) { return service.add(p); }

    @PostMapping("/edit")
    public TrainingParticipant edit(@RequestBody TrainingParticipant p) { return service.edit(p); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
