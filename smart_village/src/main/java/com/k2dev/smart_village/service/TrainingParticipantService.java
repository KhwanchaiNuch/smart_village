package com.k2dev.smart_village.service;

import com.k2dev.smart_village.entity.TrainingParticipant;
import com.k2dev.smart_village.repository.TrainingParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrainingParticipantService {

    @Autowired private TrainingParticipantRepository repo;

    public List<TrainingParticipant> list() {
        return repo.findAll();
    }

    public TrainingParticipant get(Long id) {
        return repo.findById(id).orElseThrow();
    }

    public List<TrainingParticipant> listByTraining(Long trainingId) {
        return repo.findByTrainingId(trainingId);
    }

    public List<TrainingParticipant> listByPerson(Long personId) {
        return repo.findByPersonId(personId);
    }

    public TrainingParticipant add(TrainingParticipant p) {
        return repo.save(p);
    }

    public TrainingParticipant edit(TrainingParticipant p) {
        return repo.save(p);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
