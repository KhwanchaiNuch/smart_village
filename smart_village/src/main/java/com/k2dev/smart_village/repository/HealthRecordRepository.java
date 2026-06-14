package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.HealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HealthRecordRepository extends JpaRepository<HealthRecord, Long> {
    List<HealthRecord> findByPersonIdIn(List<Long> personIds);
}
