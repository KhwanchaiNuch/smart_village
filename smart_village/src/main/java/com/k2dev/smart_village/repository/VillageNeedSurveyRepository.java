package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.VillageNeedSurvey;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VillageNeedSurveyRepository extends JpaRepository<VillageNeedSurvey, Integer> {
    List<VillageNeedSurvey> findByHouseholdId(Integer householdId);
    List<VillageNeedSurvey> findByPersonId(Integer personId);
    List<VillageNeedSurvey> findByNeedType(String needType);
}
