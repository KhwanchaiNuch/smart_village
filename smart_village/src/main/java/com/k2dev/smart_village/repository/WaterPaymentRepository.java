package com.k2dev.smart_village.repository;

import com.k2dev.smart_village.entity.WaterPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WaterPaymentRepository extends JpaRepository<WaterPayment, Long> {
    List<WaterPayment> findByBillId(Long billId);
    long countByBillIdIn(List<Long> billIds);
}
