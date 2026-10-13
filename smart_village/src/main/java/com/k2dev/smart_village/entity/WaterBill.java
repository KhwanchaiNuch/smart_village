package com.k2dev.smart_village.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_bill")
@Data
public class WaterBill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bill_id")
    private Long billId;

    @Column(name = "household_id", nullable = false)
    private Integer householdId;

    @Column(name = "village_id")
    private Integer villageId;

    @Column(name = "billing_period", nullable = false)
    private LocalDate billingPeriod;

    @Column(name = "meter_no", length = 50)
    private String meterNo;

    @Column(name = "previous_reading", precision = 12, scale = 2, nullable = false)
    private BigDecimal previousReading = BigDecimal.ZERO;

    @Column(name = "current_reading", precision = 12, scale = 2, nullable = false)
    private BigDecimal currentReading;

    @Column(name = "units_used", precision = 12, scale = 2, nullable = false)
    private BigDecimal unitsUsed;

    @Column(name = "rate_per_unit", precision = 10, scale = 2, nullable = false)
    private BigDecimal ratePerUnit;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "invoice_no", length = 50, unique = true)
    private String invoiceNo;

    @Column(name = "invoice_date")
    private LocalDate invoiceDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(nullable = false, length = 20)
    private String status = "UNPAID";

    private String remark;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }
}
