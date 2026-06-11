
package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.TrainingParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrainingParticipantRepository extends JpaRepository<TrainingParticipant, Long> {

    List<TrainingParticipant> findByTrainingId(Long trainingId);

    List<TrainingParticipant> findByPersonId(Long personId);
}
