package com.k2dev.smart_village.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_rate_setting")
@Data
public class WaterRateSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rate_id")
    private Long rateId;

    @Column(name = "village_id")
    private Integer villageId;

    @Column(name = "rate_per_unit", precision = 10, scale = 2, nullable = false)
    private BigDecimal ratePerUnit;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    private String remark;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }
}
