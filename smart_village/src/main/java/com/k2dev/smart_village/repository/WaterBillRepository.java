package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.WaterBill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WaterBillRepository extends JpaRepository<WaterBill, Long> {
    List<WaterBill> findByVillageId(Integer villageId);
    List<WaterBill> findByVillageIdIn(List<Integer> villageIds);
    List<WaterBill> findByHouseholdId(Integer householdId);
    List<WaterBill> findByVillageIdAndBillingPeriod(Integer villageId, LocalDate billingPeriod);
    List<WaterBill> findByVillageIdInAndBillingPeriod(List<Integer> villageIds, LocalDate billingPeriod);
    List<WaterBill> findByBillingPeriod(LocalDate billingPeriod);
    Optional<WaterBill> findTopByHouseholdIdOrderByBillingPeriodDesc(Integer householdId);
    boolean existsByHouseholdIdAndBillingPeriod(Integer householdId, LocalDate billingPeriod);
    long countByVillageIdAndBillingPeriod(Integer villageId, LocalDate billingPeriod);
}
