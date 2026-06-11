
package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.HouseholdEconomic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HouseholdEconomicRepository extends JpaRepository<HouseholdEconomic, Long> {

    List<HouseholdEconomic> findByHouseholdId(Long householdId);

    List<HouseholdEconomic> findByPoorFlag(Boolean poorFlag);
}
