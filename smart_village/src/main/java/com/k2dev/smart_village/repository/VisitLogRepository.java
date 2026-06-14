package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.VisitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VisitLogRepository extends JpaRepository<VisitLog, Long> {
    List<VisitLog> findByPersonId(Long personId);
    List<VisitLog> findByHouseholdId(Long householdId);
    List<VisitLog> findByHouseholdIdIn(List<Long> householdIds);
}
