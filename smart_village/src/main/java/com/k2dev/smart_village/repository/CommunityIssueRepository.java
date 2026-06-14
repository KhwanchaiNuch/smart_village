package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.CommunityIssue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityIssueRepository extends JpaRepository<CommunityIssue, Long> {
    List<CommunityIssue> findByStatus(String status);
    List<CommunityIssue> findByHouseholdId(Long householdId);
    List<CommunityIssue> findByIssueType(String issueType);
    List<CommunityIssue> findByHouseholdIdIn(List<Long> householdIds);
}
