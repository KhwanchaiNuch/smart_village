package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.CommunityIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommunityIssueRepository extends JpaRepository<CommunityIssue, Long> {
    List<CommunityIssue> findByStatus(String status);
    List<CommunityIssue> findByHouseholdId(Long householdId);
    List<CommunityIssue> findByIssueType(String issueType);
    List<CommunityIssue> findByHouseholdIdIn(List<Long> householdIds);
    List<CommunityIssue> findByVillageId(Integer villageId);
    List<CommunityIssue> findByVillageIdOrHouseholdIdIn(Integer villageId, List<Long> householdIds);

    @Query("SELECT c FROM CommunityIssue c WHERE c.villageId IN :villageIds OR c.householdId IN :householdIds")
    List<CommunityIssue> findByVillageIdInOrHouseholdIdIn(
        @Param("villageIds") List<Integer> villageIds,
        @Param("householdIds") List<Long> householdIds);
}
