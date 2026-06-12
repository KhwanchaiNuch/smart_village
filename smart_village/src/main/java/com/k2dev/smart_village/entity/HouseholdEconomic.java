
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
    @Column(name = "economic_id")
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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getHouseholdId() { return householdId; }
    public void setHouseholdId(Long householdId) { this.householdId = householdId; }

    public BigDecimal getIncomeTotalPerMonth() { return incomeTotalPerMonth; }
    public void setIncomeTotalPerMonth(BigDecimal incomeTotalPerMonth) { this.incomeTotalPerMonth = incomeTotalPerMonth; }

    public BigDecimal getDebtTotal() { return debtTotal; }
    public void setDebtTotal(BigDecimal debtTotal) { this.debtTotal = debtTotal; }

    public String getDebtType() { return debtType; }
    public void setDebtType(String debtType) { this.debtType = debtType; }

    public Boolean getPoorFlag() { return poorFlag; }
    public void setPoorFlag(Boolean poorFlag) { this.poorFlag = poorFlag; }

    public LocalDate getRecordDate() { return recordDate; }
    public void setRecordDate(LocalDate recordDate) { this.recordDate = recordDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
