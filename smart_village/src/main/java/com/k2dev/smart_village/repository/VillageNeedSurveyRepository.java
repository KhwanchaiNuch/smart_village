package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.VillageNeedSurvey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface VillageNeedSurveyRepository extends JpaRepository<VillageNeedSurvey, Integer> {
    List<VillageNeedSurvey> findByHouseholdId(Integer householdId);
    List<VillageNeedSurvey> findByPersonId(Integer personId);
    List<VillageNeedSurvey> findByNeedType(String needType);
    List<VillageNeedSurvey> findByHouseholdIdIn(List<Integer> householdIds);
    List<VillageNeedSurvey> findByVillageId(Integer villageId);
    List<VillageNeedSurvey> findByVillageIdOrHouseholdIdIn(Integer villageId, List<Integer> householdIds);

    @Query("SELECT s FROM VillageNeedSurvey s WHERE s.villageId IN :villageIds OR s.householdId IN :householdIds")
    List<VillageNeedSurvey> findByVillageIdInOrHouseholdIdIn(
        @Param("villageIds") List<Integer> villageIds,
        @Param("householdIds") List<Integer> householdIds);
}
