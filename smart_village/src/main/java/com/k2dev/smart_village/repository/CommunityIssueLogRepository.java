package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.CommunityIssueLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityIssueLogRepository extends JpaRepository<CommunityIssueLog, Long> {
    List<CommunityIssueLog> findByIssueIdOrderByCreatedAtDesc(Long issueId);
}
