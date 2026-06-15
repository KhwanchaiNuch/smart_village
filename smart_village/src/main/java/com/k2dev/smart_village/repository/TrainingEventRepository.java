package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.TrainingEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TrainingEventRepository extends JpaRepository<TrainingEvent, Long> {
    List<TrainingEvent> findByTrainingType(String trainingType);
    List<TrainingEvent> findByVillageId(Integer villageId);
    List<TrainingEvent> findByVillageIdIn(List<Integer> villageIds);
}
