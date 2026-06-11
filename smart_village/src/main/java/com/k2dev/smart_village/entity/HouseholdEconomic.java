
package com.k2dev.smart_village.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "household_economic")
@Data
public class HouseholdEconomic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long householdId;

    @Column(precision = 12, scale = 2)
    private BigDecimal incomeTotalPerMonth;

    @Column(precision = 12, scale = 2)
    private BigDecimal debtTotal;

    @Column(length = 50)
    private String debtType;

    private Boolean poorFlag;

    private LocalDate recordDate;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
